import React, { useEffect, useState } from "react";
import api from "../api";

const initial = {
  enabled: false,
  mode: "percent",
  shortTripMaxKm: 15,
  shortRate: 0,
  longRate: 0
};

const money = (n) => "₹" + Number(n || 0).toFixed(2);

export default function AdminCommissionPanel() {
  const [settings, setSettings] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fare, setFare] = useState(500);
  const [km, setKm] = useState(10);

  const load = async () => {
    const { data } = await api.get("/admin/commission");
    setSettings(data.data);
    setDraft(data.data);
  };

  useEffect(() => {
    load().catch(() => setError("Commission settings load nahi hui. Refresh kariye."));
  }, []);

  const end = new Date(settings.promoEndAt || "2027-04-07T00:00:00+05:30");
  const promo = Date.now() < end.getTime();
  const rate = Number(km) > Number(draft.shortTripMaxKm)
    ? Number(draft.longRate)
    : Number(draft.shortRate);
  const previewFee = promo || !draft.enabled
    ? 0
    : Math.min(Number(fare) || 0, draft.mode === "per_km"
      ? (Number(km) || 0) * rate
      : (Number(fare) || 0) * rate / 100);

  const save = async (enabled) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.put("/admin/commission", {
        enabled,
        mode: draft.mode,
        shortTripMaxKm: Number(draft.shortTripMaxKm),
        shortRate: Number(draft.shortRate),
        longRate: Number(draft.longRate)
      });
      setSettings(data.data);
      setDraft(data.data);
      setMessage(enabled ? "Commission activate ho gaya. Nayi rides par lagega." : "Policy save hui; commission OFF hai.");
    } catch (err) {
      setError(err.response?.data?.message || "Save nahi hua. Dobara koshish kariye.");
    } finally {
      setBusy(false);
    }
  };

  const field = (label, key, max) => (
    <label style={{ display: "grid", gap: 6, minWidth: 160 }}>
      <span>{label}</span>
      <input type="number" min="0" max={max} step="0.01"
        value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} />
    </label>
  );

  return (
    <section style={{ maxWidth: 860, background: "#171a20", color: "#f7f3e9", border: "1px solid #555", borderRadius: 16, padding: 24 }}>
      <h2>Commission</h2>
      <p><strong>Current: {promo ? "6-month offer · 0%" : settings.active ? "Active" : "0% · activation pending"}</strong></p>
      <p>7 October 2026 se 7 April 2027 tak nayi rides par 0% commission. Uske baad bhi aap Activate dabayenge tabhi charge shuru hoga.</p>
      <p>Purani rides ka locked commission nahi badlega.</p>
      <hr />
      <h3>New rate set karein</h3>
      <label>Calculation&nbsp;
        <select value={draft.mode} onChange={(e) => setDraft({ ...draft, mode: e.target.value })}>
          <option value="percent">Final fare ka percent (%)</option>
          <option value="per_km">Distance par rupees per km (₹/km)</option>
        </select>
      </label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 18 }}>
        {field("Distance limit (km)", "shortTripMaxKm", 10000)}
        {field("Limit tak rate " + (draft.mode === "percent" ? "(%)" : "(₹/km)"), "shortRate", draft.mode === "percent" ? 100 : 10000)}
        {field("Limit se upar rate " + (draft.mode === "percent" ? "(%)" : "(₹/km)"), "longRate", draft.mode === "percent" ? 100 : 10000)}
      </div>
      <p style={{ marginTop: 12 }}>Jis distance bracket mein ride aati hai, wahi rate poore final fare ya poori distance par lagega.</p>
      <h3>Preview</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
        <label>Final fare (₹) <input type="number" min="0" value={fare} onChange={(e) => setFare(e.target.value)} /></label>
        <label>Distance (km) <input type="number" min="0" value={km} onChange={(e) => setKm(e.target.value)} /></label>
      </div>
      <p>Customer: {money(fare)} · HimRideG: {money(previewFee)} · Driver: {money((Number(fare) || 0) - previewFee)}</p>
      {promo && <p>Offer ke dauran preview mein effective commission hamesha ₹0 hoga.</p>}
      {error && <p role="alert" style={{ color: "#ff8989" }}>{error}</p>}
      {message && <p role="status" style={{ color: "#95ecb4" }}>{message}</p>}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="button" disabled={busy} onClick={() => save(false)}>Save with commission OFF</button>
        {!promo && <button type="button" disabled={busy} onClick={() => save(true)}>Activate commission</button>}
        {settings.active && <button type="button" disabled={busy} onClick={() => save(false)}>Turn commission OFF</button>}
      </div>
    </section>
  );
}
