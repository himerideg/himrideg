import React, { useMemo, useState } from "react";
import "../driver-v75-parity.css";

const idOf = (value) => String(value?._id || value?.id || value || "");
const fareOf = (ride) => Number(ride?.finalFare ?? ride?.fare?.finalFare ?? 0) || 0;
const feeOf = (ride) => Number(ride?.platformCommissionAmount ?? (fareOf(ride) * 0.1)) || 0;
const netOf = (ride) => Number(ride?.driverPayableAmount ?? Math.max(0, fareOf(ride) - feeOf(ride))) || 0;
const customerOf = (ride) => String(ride?.customer?.name || ride?.customerName || "HimRideG Customer");
const pickupOf = (ride) => String(ride?.pickup?.address || ride?.pickupAddress || (typeof ride?.pickup === "string" ? ride.pickup : "") || "Pickup");
const dropOf = (ride) => String(ride?.dropoff?.address || ride?.drop?.address || ride?.dropAddress || (typeof ride?.dropoff === "string" ? ride.dropoff : "") || "Drop");
const distanceOf = (ride) => Number(ride?.distanceKm ?? ride?.distance ?? 0) || 0;
const paidOf = (ride) => ["paid", "completed"].includes(String(ride?.paymentStatus || ride?.payment?.status || "").toLowerCase());
const dateOf = (ride) => new Date(ride?.completedAt || ride?.cancelledAt || ride?.updatedAt || ride?.createdAt || Date.now());
const money = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(value) || 0);
const dateTime = (ride) => dateOf(ride).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
const paymentMethod = (ride) => {
  const gateway = String(ride?.payment?.gateway || "").toLowerCase();
  const txn = String(ride?.payment?.transactionId || "");
  const method = String(ride?.paymentMethod || ride?.payment?.method || "cash").toLowerCase();
  if (gateway === "driver_upi" || txn.startsWith("DIRECT_UPI")) return "Driver UPI";
  if (method === "online") return "HimRideG Online";
  if (method === "wallet") return "Wallet";
  return "Cash";
};

export default function DriverHistoryHub({ bookings = [], walletData = null, onBack }) {
  const [section, setSection] = useState("home");
  const [rideFilter, setRideFilter] = useState("all");
  const [earningFilter, setEarningFilter] = useState("all");
  const [openId, setOpenId] = useState("");

  const history = useMemo(() =>
    (Array.isArray(bookings) ? bookings : [])
      .filter((ride) => ["completed", "cancelled", "expired"].includes(String(ride?.status || "").toLowerCase()))
      .sort((a, b) => dateOf(b) - dateOf(a)), [bookings]);

  const completed = useMemo(() => history.filter((ride) => String(ride?.status || "").toLowerCase() === "completed"), [history]);

  const earningRows = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const month = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return completed.filter((ride) => {
      if (earningFilter === "today") return dateOf(ride).getTime() >= today;
      if (earningFilter === "month") return dateOf(ride).getTime() >= month;
      return true;
    });
  }, [completed, earningFilter]);

  const rideRows = useMemo(() => history.filter((ride) => {
    const status = String(ride?.status || "").toLowerCase();
    if (rideFilter === "completed") return status === "completed";
    if (rideFilter === "cancelled") return ["cancelled", "expired"].includes(status);
    return true;
  }), [history, rideFilter]);

  const totals = useMemo(() => earningRows.reduce((acc, ride) => ({
    fare: acc.fare + fareOf(ride),
    fee: acc.fee + feeOf(ride),
    net: acc.net + netOf(ride)
  }), { fare: 0, fee: 0, net: 0 }), [earningRows]);

  const wallet = walletData?.wallet || walletData || {};
  const due = Math.max(Number(wallet?.commissionDue || 0), Number(wallet?.cashCommissionDue || 0), 0);

  const header = (
    <header className="v75HistoryHead">
      <div><small>DRIVER HISTORY</small><h2>{section === "earnings" ? "Earning History" : section === "rides" ? "Ride History" : "History"}</h2></div>
      <button type="button" className="v75Back" onClick={section === "home" ? onBack : () => { setSection("home"); setOpenId(""); }}>← {section === "home" ? "Dashboard" : "History"}</button>
    </header>
  );

  if (section === "home") {
    return (
      <section className="v75HistoryPage">
        {header}
        <div className="v75HistoryCards">
          <button type="button" className="v75HistoryChoice" onClick={() => setSection("earnings")}>
            <span className="v75HistoryIcon">₹</span>
            <h3>Earning History</h3>
            <p>Fare, Platform Fee, Payment aur Driver Net</p>
            <div className="v75MiniMetrics"><span>₹{money(completed.reduce((sum, ride) => sum + netOf(ride), 0))} Net</span><span>₹{money(due)} Fee Due</span></div>
          </button>
          <button type="button" className="v75HistoryChoice" onClick={() => setSection("rides")}>
            <span className="v75HistoryIcon">🚕</span>
            <h3>Ride History</h3>
            <p>Completed, Cancelled aur Previous Rides</p>
            <div className="v75MiniMetrics"><span>{history.length} Total</span><span>{completed.length} Completed</span></div>
          </button>
        </div>
      </section>
    );
  }

  if (section === "earnings") {
    return (
      <section className="v75HistoryPage">
        {header}
        <div className="v75Filters">{[["all","All"],["today","Today"],["month","This Month"]].map(([value,label]) => <button type="button" key={value} className={earningFilter === value ? "active" : ""} onClick={() => setEarningFilter(value)}>{label}</button>)}</div>
        <div className="v75Totals"><div className="v75Total"><small>Total Fare</small><strong>₹{money(totals.fare)}</strong></div><div className="v75Total"><small>Platform Fee</small><strong style={{color:"#f5c518"}}>₹{money(totals.fee)}</strong></div><div className="v75Total"><small>Driver Net</small><strong style={{color:"#22c55e"}}>₹{money(totals.net)}</strong></div></div>
        <div className="v75List">
          {earningRows.length ? earningRows.map((ride) => {
            const rideId = idOf(ride); const open = openId === rideId; const paid = paidOf(ride);
            return <article className="v75Record" key={rideId}><button type="button" className="v75RecordMain" onClick={() => setOpenId(open ? "" : rideId)}><div><span className="v75RecordName">{customerOf(ride)}</span><span className="v75Route">{pickupOf(ride)} → {dropOf(ride)} · {dateTime(ride)}</span></div><strong className="v75RecordAmount">₹{money(netOf(ride))}</strong><span className={`v75Status ${paid ? "" : "due"}`}>{paid ? "Received ✓" : "Payment Pending"}</span></button>{open ? <div className="v75RecordDetail"><div><small>Fare</small><strong>₹{money(fareOf(ride))}</strong></div><div><small>Platform Fee (10%)</small><strong>₹{money(feeOf(ride))}</strong></div><div><small>Driver Net</small><strong>₹{money(netOf(ride))}</strong></div><div><small>Payment Method</small><strong>{paymentMethod(ride)}</strong></div><div><small>Payment</small><strong>{paid ? "Paid ✓" : "Pending"}</strong></div><div><small>Ride ID</small><strong>{ride?.bookingNumber || rideId.slice(-8)}</strong></div></div> : null}</article>;
          }) : <div className="v75Future">Is filter me abhi earning record nahi hai.</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="v75HistoryPage">
      {header}
      <div className="v75Filters">{[["all","All"],["completed","Completed"],["cancelled","Cancelled"]].map(([value,label]) => <button type="button" key={value} className={rideFilter === value ? "active" : ""} onClick={() => setRideFilter(value)}>{label}</button>)}</div>
      <div className="v75List">
        {rideRows.length ? rideRows.map((ride) => {
          const rideId = idOf(ride); const open = openId === rideId; const status = String(ride?.status || "").toLowerCase();
          return <article className="v75Record" key={rideId}><button type="button" className="v75RecordMain" onClick={() => setOpenId(open ? "" : rideId)}><div><span className="v75RecordName">{customerOf(ride)}</span><span className="v75Route">{pickupOf(ride)} → {dropOf(ride)} · {dateTime(ride)}</span></div><strong className="v75RecordAmount">₹{money(fareOf(ride))}</strong><span className={`v75Status ${status === "completed" ? "" : "due"}`}>{status === "completed" ? "Completed ✓" : "Cancelled"}</span></button>{open ? <div className="v75RecordDetail"><div><small>Customer</small><strong>{customerOf(ride)}</strong></div><div><small>Route</small><strong>{pickupOf(ride)} → {dropOf(ride)}</strong></div><div><small>Date & Time</small><strong>{dateTime(ride)}</strong></div><div><small>Distance</small><strong>{distanceOf(ride).toFixed(1)} km</strong></div><div><small>Final Fare</small><strong>₹{money(fareOf(ride))}</strong></div><div><small>Payment / Status</small><strong>{paidOf(ride) ? "Paid ✓" : "Pending"} · {status === "completed" ? "Completed ✓" : "Cancelled"}</strong></div></div> : null}</article>;
        }) : <div className="v75Future">Is filter me koi ride nahi hai.</div>}
      </div>
    </section>
  );
}
