import React, { useEffect, useState } from "react";
import api from "../api";
// V93: popup text language ke hisaab se
import { dialogText } from "../i18n/v93Language";

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
  // V93: change history
  const [history, setHistory] = useState([]);
  const loadHistory = async () => {
    try {
      const { data } = await api.get("/admin/commission/history");
      setHistory(data?.data?.history || []);
    } catch {
      /* optional */
    }
  };

  const load = async () => {
    const { data } = await api.get("/admin/commission");
    setSettings(data.data);
    setDraft(data.data);
  };

  useEffect(() => {
    load().catch(() => setError("Commission settings load nahi hui. Refresh kariye."));
    loadHistory();
  }, []);

  const end = new Date(settings.promoEndAt || "2027-04-07T00:00:00+05:30");
  const promo = Date.now() < end.getTime();
  const rate = Number(km) > Number(draft.shortTripMaxKm)
    ? Number(draft.longRate)
    : Number(draft.shortRate);
  const previewFee = !draft.enabled
    ? 0
    : Math.min(Number(fare) || 0, draft.mode === "per_km"
      ? (Number(km) || 0) * rate
      : (Number(fare) || 0) * rate / 100);

  const save = async (enabled) => {
    // V93: galti se ON na ho — pehle saaf summary dikhakar confirm
    if (enabled && !settings.active) {
      const unit = draft.mode === "per_km" ? "₹/km" : "%";
      const ok = window.confirm(
        dialogText("commissionOn", draft.shortTripMaxKm, draft.shortRate, draft.longRate, unit) +
        (promo ? dialogText("commissionPromo") : "")
      );
      if (!ok) return;
    }
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
      loadHistory();
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
      <p><strong>Current: {settings.active ? "ON · Admin rate active" : promo ? "OFF · 0% offer" : "OFF · 0% commission"}</strong></p>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "18px 0" }}>
        <span id="commission-switch-label" style={{ fontWeight: 700 }}>Commission ON/OFF</span>
        <button
          type="button"
          role="switch"
          aria-labelledby="commission-switch-label"
          aria-checked={Boolean(settings.active)}
          disabled={busy}
          onClick={() => save(!settings.active)}
          style={{
            minWidth: 94, padding: "10px 20px", borderRadius: 24,
            border: "1px solid " + (settings.active ? "#39c981" : "#888"),
            background: settings.active ? "#146b45" : "#333940",
            color: "#fff", fontWeight: 800, cursor: busy ? "wait" : "pointer"
          }}
        >
          {settings.active ? "ON" : "OFF"}
        </button>
        <span>{settings.active ? "Nayi rides par set kiya rate lagega." : "Nayi rides par 0% commission."}</span>
      </div>
      <p>6 mahine ke offer mein commission default OFF hai. Aap Admin panel se kabhi bhi ON/OFF kar sakte hain; automatic ON nahi hoga.</p>
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
      {promo && !settings.active && <p>Abhi commission OFF hai. ON karenge to set kiya rate nayi rides par lagega.</p>}
      {error && <p role="alert" style={{ color: "#ff8989" }}>{error}</p>}
      {message && <p role="status" style={{ color: "#95ecb4" }}>{message}</p>}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="button" disabled={busy} onClick={() => save(settings.active)}>Save rates</button>
      </div>
      {/* V93: kisne kab kya badla */}
      <h3 style={{ marginTop: 22 }}>Change history</h3>
      {history.length ? (
        <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
          {history.map((row) => {
            const fmt = (v) => `${v?.enabled ? "ON" : "OFF"} · ${v?.mode === "per_km" ? "₹/km" : "%"} · ${v?.shortTripMaxKm}km tak ${v?.shortRate}, upar ${v?.longRate}`;
            return (
              <div key={row._id} style={{ padding: "8px 10px", border: "1px solid #3a3f46", borderRadius: 10 }}>
                <strong>{new Date(row.createdAt).toLocaleString("en-IN")}</strong> — {row.changedByName || "Admin"}
                <div style={{ color: "#c9ced6" }}>Pehle: {fmt(row.before)}</div>
                <div>Ab: {fmt(row.after)}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <p style={{ color: "#c9ced6" }}>Abhi koi badlav record nahi hua.</p>
      )}
    </section>
  );
}
