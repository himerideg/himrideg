import { useState } from "react";
import api from "../api";

/*
|--------------------------------------------------------------------------
| V113 ADD-ONLY: Driver "Confirm Payment" (Online / Offline)
|--------------------------------------------------------------------------
| Ride ke dauran ya complete hone ke baad driver confirm karta hai ki payment
| mil gayi (Online ya Offline / cash). Customer ki taraf se payment confirm
| na bhi ho, booking release ho jaati hai.
| - Ride chal rahi ho: confirmation save, ride complete hote hi release.
| - Ride complete: turant Paid + driver free.
| Customer ko notification jaata hai aur wo "Payment nahi di" report kar
| sakta hai (admin panel).
|--------------------------------------------------------------------------
*/

const BOX = {
  marginTop: 10,
  padding: "10px 12px",
  borderRadius: 12,
  background: "rgba(245,197,24,.10)",
  border: "1px solid rgba(245,197,24,.45)",
  display: "grid",
  gap: 8
};

const ROW = { display: "flex", gap: 8, flexWrap: "wrap" };

const BTN = {
  flex: "1 1 140px",
  minHeight: 40,
  border: 0,
  borderRadius: 10,
  fontWeight: 800,
  fontSize: 13,
  cursor: "pointer"
};

function idOf(ride) {
  return String(ride?._id || ride?.id || ride?.bookingId || "");
}

export default function V113DriverPaymentConfirm({ ride, onDone, compact = false }) {
  const bookingId = idOf(ride);
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [savedMode, setSavedMode] = useState(
    String(ride?.driverPaymentPreConfirmMode || ride?.driverPaymentConfirmMode || "")
  );

  if (!bookingId) return null;
  if (String(ride?.paymentStatus || "").toLowerCase() === "paid") return null;

  const fare = Number(
    ride?.finalFare || ride?.fare?.finalFare || ride?.driverOfferedFare || 0
  );

  const confirm = async (mode) => {
    const label = mode === "online" ? "Online" : "Offline (Cash)";
    const ok = window.confirm(
      `Kya aapko${fare ? ` ₹${fare.toFixed(0)}` : ""} ${label} payment mil gayi hai? Confirm karte hi booking release ho jayegi.`
    );
    if (!ok) return;
    setBusy(mode);
    setNote("");
    try {
      const { data } = await api.post("/payments/driver-confirm-payment", {
        bookingId,
        mode
      });
      setSavedMode(mode);
      setNote(data?.message || "Payment confirm ho gayi ✅");
      if (typeof onDone === "function") await onDone(data);
    } catch (error) {
      setNote(
        error?.response?.data?.message ||
          error?.message ||
          "Payment confirm nahi ho saki"
      );
    } finally {
      setBusy("");
    }
  };

  const status = String(ride?.status || "").toLowerCase();
  const rideRunning = status !== "completed";

  return (
    <div className="hrgV113PayConfirm" style={BOX}>
      <strong style={{ fontSize: 13 }}>
        💳 Confirm Payment{fare ? ` • ₹${fare.toFixed(0)}` : ""}
      </strong>
      {!compact && (
        <small style={{ opacity: 0.85, fontSize: 11, lineHeight: 1.35 }}>
          Payment mil gayi to yahan confirm karein — customer confirm na kare tab bhi booking
          release ho jayegi.
          {rideRunning ? " Ride complete karte hi release hoga." : ""}
        </small>
      )}
      {savedMode ? (
        <small style={{ fontWeight: 800, color: "#16a34a" }}>
          ✅ {savedMode === "online" ? "Online" : "Offline (Cash)"} payment confirm
          {rideRunning ? " — ride complete hote hi booking release" : ""}
        </small>
      ) : null}
      <div style={ROW}>
        <button
          type="button"
          style={{ ...BTN, background: "#f5c518", color: "#111" }}
          disabled={Boolean(busy)}
          onClick={() => confirm("offline")}
        >
          {busy === "offline" ? "Confirming..." : "💵 Offline / Cash mila"}
        </button>
        <button
          type="button"
          style={{ ...BTN, background: "#111", color: "#fff" }}
          disabled={Boolean(busy)}
          onClick={() => confirm("online")}
        >
          {busy === "online" ? "Confirming..." : "📲 Online mila"}
        </button>
      </div>
      {note ? <small style={{ fontSize: 11, fontWeight: 700 }}>{note}</small> : null}
    </div>
  );
}
