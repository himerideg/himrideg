import React, { useEffect, useMemo, useRef, useState } from "react";

/*
|--------------------------------------------------------------------------
| HimRideG V62 — Shared 10 Minute Response Timer
|--------------------------------------------------------------------------
| acceptedAt / fareOfferedAt backend timestamps se countdown derive hota hai.
| Isliye desktop, mobile browser, refresh aur reconnect sab me same remaining
| time dikhai deta hai. Client timer sirf UI hai; cancellation backend karta hai.
|--------------------------------------------------------------------------
*/

const TIMEOUT_MS = 10 * 60 * 1000;

function getStage(ride) {
  const status = String(ride?.status || "").toLowerCase();
  const fareStatus = String(ride?.fareStatus || "not_offered").toLowerCase();

  if (["accepted", "driver_assigned"].includes(status) && fareStatus === "not_offered") {
    return { waitingFor: "driver", anchor: ride?.acceptedAt };
  }

  if (status === "fare_offered" && fareStatus === "driver_offered") {
    return { waitingFor: "customer", anchor: ride?.fareOfferedAt };
  }

  if (status === "negotiating" && fareStatus === "customer_countered") {
    return { waitingFor: "driver", anchor: ride?.fareOfferedAt };
  }

  if (status === "negotiating" && fareStatus === "driver_final") {
    return { waitingFor: "customer", anchor: ride?.fareOfferedAt };
  }

  return null;
}

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function ResponseTimeoutBadge({ ride, role = "customer", onExpired }) {
  const stage = useMemo(
    () => getStage(ride),
    [ride?.status, ride?.fareStatus, ride?.acceptedAt, ride?.fareOfferedAt]
  );

  const deadline = useMemo(() => {
    if (!stage?.anchor) return 0;
    const anchorMs = new Date(stage.anchor).getTime();
    return Number.isFinite(anchorMs) ? anchorMs + TIMEOUT_MS : 0;
  }, [stage?.anchor]);

  const [now, setNow] = useState(() => Date.now());
  const expiredNotifiedRef = useRef(false);

  useEffect(() => {
    expiredNotifiedRef.current = false;
    setNow(Date.now());

    if (!deadline) return undefined;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [deadline]);

  if (!stage || !deadline) return null;

  const remaining = deadline - now;
  const isExpired = remaining <= 0;

  if (isExpired && !expiredNotifiedRef.current) {
    expiredNotifiedRef.current = true;
    window.setTimeout(() => onExpired?.(), 0);
  }

  const ownTurn = stage.waitingFor === String(role || "").toLowerCase();
  const waitingText = ownTurn
    ? "Your response"
    : `Waiting for ${stage.waitingFor}`;

  return (
    <div
      className="hrgResponseTimeoutBadge"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        flexWrap: "wrap",
        width: "100%",
        marginTop: 10,
        padding: "9px 11px",
        borderRadius: 10,
        border: "1px solid rgba(245,197,24,.38)",
        background: "rgba(245,197,24,.10)",
        color: "inherit",
        boxSizing: "border-box"
      }}
      aria-live="polite"
    >
      <strong style={{ fontSize: 13 }}>
        {isExpired ? "Auto cancelling…" : waitingText}
      </strong>
      <span style={{ fontWeight: 900, fontVariantNumeric: "tabular-nums" }}>
        {isExpired ? "00:00" : formatRemaining(remaining)}
      </span>
    </div>
  );
}
