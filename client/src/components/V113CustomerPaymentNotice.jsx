import { useEffect, useState } from "react";
import api from "../api";
import socket from "../socket";

/*
|--------------------------------------------------------------------------
| V113 ADD-ONLY: customer ko "Driver ne payment confirm ki" notice
|--------------------------------------------------------------------------
| Driver Online / Offline payment confirm karta hai -> customer ko card
| dikhta hai. Agar customer ne payment nahi di to "Payment nahi di" se
| report karta hai -> admin panel me complaint (payment_issue).
| Card 24 ghante tak yaad rehta hai (refresh ke baad bhi).
|--------------------------------------------------------------------------
*/

const STORE_KEY = "hrgV113PaymentNotices";
const KEEP_MS = 24 * 60 * 60 * 1000;

function readStore() {
  try {
    const list = JSON.parse(window.localStorage.getItem(STORE_KEY) || "[]");
    return (Array.isArray(list) ? list : []).filter(
      (item) => item && item.bookingId && Date.now() - Number(item.at || 0) < KEEP_MS
    );
  } catch {
    return [];
  }
}

function writeStore(list) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(-10)));
  } catch {
    /* ignore */
  }
}

export default function V113CustomerPaymentNotice() {
  const [notices, setNotices] = useState(() => readStore());
  const [busy, setBusy] = useState("");
  const [result, setResult] = useState({});

  useEffect(() => {
    const onConfirmed = (payload = {}) => {
      const bookingId = String(payload?.bookingId || "");
      if (!bookingId) return;
      setNotices((current) => {
        const next = [
          ...current.filter((item) => item.bookingId !== bookingId),
          {
            bookingId,
            mode: payload?.mode || "",
            modeText: payload?.modeText || "",
            fare: Number(payload?.fare || 0),
            preConfirmed: payload?.__pre === true,
            message: payload?.message || "",
            at: Date.now()
          }
        ];
        writeStore(next);
        return next;
      });
    };

    const onPre = (payload = {}) => onConfirmed({ ...payload, __pre: true });

    socket.on("payment:driver-confirmed", onConfirmed);
    socket.on("payment:driver-preconfirmed", onPre);
    return () => {
      socket.off("payment:driver-confirmed", onConfirmed);
      socket.off("payment:driver-preconfirmed", onPre);
    };
  }, []);

  const dismiss = (bookingId) => {
    setNotices((current) => {
      const next = current.filter((item) => item.bookingId !== bookingId);
      writeStore(next);
      return next;
    });
  };

  const report = async (bookingId) => {
    const note = window.prompt(
      "Kya hua? (optional) — jaise: maine abhi payment nahi di",
      ""
    );
    if (note === null) return;
    setBusy(bookingId);
    try {
      const { data } = await api.post("/payments/customer-report-not-paid", {
        bookingId,
        note
      });
      setResult((current) => ({
        ...current,
        [bookingId]: data?.message || "Report bhej di gayi."
      }));
      window.setTimeout(() => dismiss(bookingId), 6000);
    } catch (error) {
      setResult((current) => ({
        ...current,
        [bookingId]:
          error?.response?.data?.message || error?.message || "Report nahi bhej saki"
      }));
    } finally {
      setBusy("");
    }
  };

  if (!notices.length) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 16,
        zIndex: 5000,
        display: "grid",
        gap: 8,
        maxWidth: 460,
        margin: "0 auto"
      }}
    >
      {notices.map((item) => (
        <div
          key={item.bookingId}
          style={{
            background: "#111",
            color: "#fff",
            borderRadius: 14,
            padding: "12px 14px",
            boxShadow: "0 10px 30px rgba(0,0,0,.35)",
            border: "1px solid rgba(245,197,24,.6)"
          }}
        >
          <strong style={{ color: "#f5c518", display: "block", fontSize: 14 }}>
            💳 Driver ne payment confirm ki
            {item.fare ? ` • ₹${item.fare.toFixed(0)}` : ""}
          </strong>
          <small style={{ display: "block", marginTop: 4, fontSize: 12, lineHeight: 1.4 }}>
            {item.modeText || (item.mode === "online" ? "Online" : "Offline (Cash)")} payment milna
            confirm hua{item.preConfirmed ? " — ride complete hote hi booking close ho jayegi" : ""}.
            Agar aapne payment nahi di hai to report karein.
          </small>
          {result[item.bookingId] ? (
            <small style={{ display: "block", marginTop: 6, fontWeight: 800 }}>
              {result[item.bookingId]}
            </small>
          ) : null}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              type="button"
              disabled={busy === item.bookingId}
              onClick={() => report(item.bookingId)}
              style={{
                flex: 1,
                minHeight: 38,
                border: 0,
                borderRadius: 10,
                background: "#ef4444",
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              {busy === item.bookingId ? "Bhej rahe hain..." : "⚠️ Payment nahi di"}
            </button>
            <button
              type="button"
              onClick={() => dismiss(item.bookingId)}
              style={{
                flex: 1,
                minHeight: 38,
                border: 0,
                borderRadius: 10,
                background: "#f5c518",
                color: "#111",
                fontWeight: 800,
                cursor: "pointer"
              }}
            >
              ✅ Sahi hai
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
