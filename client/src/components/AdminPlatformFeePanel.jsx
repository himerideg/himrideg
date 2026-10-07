import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import { dialogText } from "../i18n/v93Language";
import "./admin-platform-fee.css";

/*
|--------------------------------------------------------------------------
| HimRideG V94 — Platform Fee (ADD-ONLY NEW FILE)
|--------------------------------------------------------------------------
| "Commission" ka naam ab "Platform Fee". Purana AdminCommissionPanel file
| safe rakha hai; AdminDashboard ab ye naya panel dikhata hai.
| OFF: sirf free period (kab tak, kitne din baaki).
| ON / edit: 3 km range — teeno ki km seema aur fee admin khud chunta hai.
| Text English me likha hai; Hindi / Hinglish v93Language.js se aata hai.
|--------------------------------------------------------------------------
*/

const DAY = 24 * 60 * 60 * 1000;

function toInputDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function showDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

function money(value) {
  return "₹" + Math.round(Number(value || 0)).toLocaleString("en-IN");
}

const DEFAULT_DRAFT = {
  mode: "percent",
  shortTripMaxKm: 10,
  midTripMaxKm: 25,
  shortRate: 8,
  midRate: 6,
  longRate: 5,
  offUntil: "2027-04-07"
};

export default function AdminPlatformFeePanel() {
  const [settings, setSettings] = useState(null);
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fare, setFare] = useState(500);
  const [km, setKm] = useState(12);
  const [history, setHistory] = useState([]);

  const fromSettings = (data) => ({
    mode: data?.mode === "per_km" ? "per_km" : "percent",
    shortTripMaxKm: Number(data?.shortTripMaxKm ?? 10),
    midTripMaxKm: data?.midTripMaxKm == null ? Math.max(Number(data?.shortTripMaxKm ?? 10) + 15, 25) : Number(data.midTripMaxKm),
    shortRate: Number(data?.shortRate ?? 0),
    midRate: Number(data?.midRate ?? data?.longRate ?? 0),
    longRate: Number(data?.longRate ?? 0),
    offUntil: toInputDate(data?.promoEndAt) || DEFAULT_DRAFT.offUntil
  });

  const load = async () => {
    try {
      const { data } = await api.get("/admin/commission");
      setSettings(data.data);
      const next = fromSettings(data.data);
      // pehli baar sab 0 ho to example rates dikhao (save tabhi hoga jab admin dabaye)
      if (!data.data?.active && !next.shortRate && !next.midRate && !next.longRate) {
        setDraft({ ...DEFAULT_DRAFT, offUntil: next.offUntil });
      } else {
        setDraft(next);
      }
    } catch {
      setError("Platform fee settings did not load. Please refresh.");
    }
    try {
      const { data } = await api.get("/admin/commission/history");
      setHistory(data?.data?.history || []);
    } catch {
      /* optional */
    }
  };

  useEffect(() => {
    load();
  }, []);

  const active = Boolean(settings?.active);
  const unit = draft.mode === "per_km" ? "₹/km" : "%";
  const daysLeft = Math.max(0, Math.ceil((new Date(draft.offUntil + "T00:00:00+05:30").getTime() - Date.now()) / DAY));

  const rangeError = !(Number(draft.shortTripMaxKm) > 0) || !(Number(draft.midTripMaxKm) > Number(draft.shortTripMaxKm))
    ? "Range 2 must end after Range 1"
    : "";

  const previewFee = useMemo(() => {
    const d = Number(km) || 0;
    const f = Number(fare) || 0;
    const rate = d <= Number(draft.shortTripMaxKm)
      ? Number(draft.shortRate)
      : d <= Number(draft.midTripMaxKm)
        ? Number(draft.midRate)
        : Number(draft.longRate);
    const fee = draft.mode === "per_km" ? d * rate : f * rate / 100;
    return Math.min(f, Math.max(0, fee));
  }, [km, fare, draft]);

  const set = (key) => (event) => setDraft({ ...draft, [key]: event.target.value });

  const save = async (enabled) => {
    if (rangeError) {
      setError(rangeError);
      return;
    }
    if (enabled && !active) {
      const ok = window.confirm(
        dialogText(
          "feeOn3",
          draft.shortTripMaxKm,
          draft.midTripMaxKm,
          draft.shortRate,
          draft.midRate,
          draft.longRate,
          unit
        )
      );
      if (!ok) return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { data } = await api.put("/admin/commission", {
        enabled,
        mode: draft.mode,
        shortTripMaxKm: Number(draft.shortTripMaxKm),
        midTripMaxKm: Number(draft.midTripMaxKm),
        shortRate: Number(draft.shortRate),
        midRate: Number(draft.midRate),
        longRate: Number(draft.longRate),
        offUntil: draft.offUntil ? draft.offUntil + "T00:00:00+05:30" : null
      });
      setSettings(data.data);
      setDraft(fromSettings(data.data));
      setEditing(false);
      setNotice(enabled ? "Platform fee is ON for new rides." : "Platform fee is OFF. New rides: 0%.");
      load();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Not saved. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!settings && !error) {
    return <section className="pfPanel"><p className="pfMuted">Loading…</p></section>;
  }

  const ranges = [
    { label: "Range 1", from: 0, toKey: "shortTripMaxKm", rateKey: "shortRate" },
    { label: "Range 2", from: draft.shortTripMaxKm, toKey: "midTripMaxKm", rateKey: "midRate" },
    { label: "Range 3", from: draft.midTripMaxKm, toKey: null, rateKey: "longRate" }
  ];

  return (
    <section className="pfPanel">
      <header className="pfHead">
        <h2>Platform Fee</h2>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          className={`pfSwitch${active ? " on" : ""}`}
          disabled={busy}
          onClick={() => (active ? save(false) : setEditing(true))}
        >
          <i />
          <span>{active ? "ON" : "OFF"}</span>
        </button>
      </header>

      {/* -------- OFF: sirf free period -------- */}
      {!active && !editing ? (
        <div className="pfOff">
          <p className="pfKicker">PLATFORM FEE · OFF</p>
          <p className="pfBig">Drivers keep 100% of the fare</p>
          <p className="pfPeriod"><span>Free until</span> <b>{showDate(draft.offUntil + "T00:00:00+05:30")}</b></p>
          <p className="pfMuted">{`${daysLeft} days left`}</p>
          <button type="button" className="pfPrimary" onClick={() => setEditing(true)}>
            Set fee &amp; turn ON
          </button>
        </div>
      ) : null}

      {/* -------- ON: summary -------- */}
      {active && !editing ? (
        <div className="pfOn">
          <p className="pfKicker">PLATFORM FEE · ON</p>
          {ranges.map((range) => (
            <div className="pfRow" key={range.label}>
              <span>
                {range.toKey
                  ? `${range.from}–${settings?.[range.toKey] ?? draft[range.toKey]} km`
                  : `${range.from}+ km`}
              </span>
              <b>{draft[range.rateKey]} {unit}</b>
            </div>
          ))}
          <p className="pfMuted">Applies to new rides only</p>
          <div className="pfActions">
            <button type="button" className="pfPrimary" onClick={() => setEditing(true)}>Edit</button>
            <button type="button" className="pfDanger" disabled={busy} onClick={() => save(false)}>Turn OFF (0%)</button>
          </div>
        </div>
      ) : null}

      {/* -------- Edit: 3 ranges -------- */}
      {editing ? (
        <div className="pfEdit">
          <div className="pfSeg" role="radiogroup" aria-label="Charge as">
            <button type="button" className={draft.mode === "percent" ? "on" : ""} onClick={() => setDraft({ ...draft, mode: "percent" })}>% of fare</button>
            <button type="button" className={draft.mode === "per_km" ? "on" : ""} onClick={() => setDraft({ ...draft, mode: "per_km" })}>₹ per km</button>
          </div>

          {ranges.map((range) => (
            <div className="pfRange" key={range.label}>
              <div className="pfRangeKm">
                <b>{range.label}</b>
                {range.toKey ? (
                  <label>
                    <span>{`${range.from} to`}</span>
                    <input type="number" min="1" step="1" value={draft[range.toKey]} onChange={set(range.toKey)} aria-label={`${range.label} km`} />
                    <span>km</span>
                  </label>
                ) : (
                  <label><span>{`Above ${range.from} km`}</span></label>
                )}
              </div>
              <label className="pfRate">
                <input type="number" min="0" step="0.5" value={draft[range.rateKey]} onChange={set(range.rateKey)} aria-label={`${range.label} ${unit}`} />
                <span>{unit}</span>
              </label>
            </div>
          ))}

          {rangeError ? <p className="pfError">{rangeError}</p> : null}

          <div className="pfExample">
            <p className="pfKicker">EXAMPLE</p>
            <div className="pfExampleInputs">
              <label><span>Fare ₹</span><input type="number" min="0" value={fare} onChange={(event) => setFare(event.target.value)} /></label>
              <label><span>Distance km</span><input type="number" min="0" value={km} onChange={(event) => setKm(event.target.value)} /></label>
            </div>
            <div className="pfRow"><span>HimRideG</span><b className="pfGold">{money(previewFee)}</b></div>
            <div className="pfRow"><span>Driver gets</span><b className="pfGreen">{money((Number(fare) || 0) - previewFee)}</b></div>
          </div>

          <label className="pfDate">
            <span>Free period until (shown to admin; fee never turns ON by itself)</span>
            <input type="date" value={draft.offUntil} onChange={set("offUntil")} />
          </label>

          <div className="pfActions">
            <button type="button" className="pfGhost" onClick={() => { setEditing(false); setError(""); }}>Cancel</button>
            {active ? (
              <button type="button" className="pfPrimary" disabled={busy || Boolean(rangeError)} onClick={() => save(true)}>Save</button>
            ) : (
              <>
                <button type="button" className="pfGhost" disabled={busy || Boolean(rangeError)} onClick={() => save(false)}>Save, keep OFF</button>
                <button type="button" className="pfPrimary" disabled={busy || Boolean(rangeError)} onClick={() => save(true)}>Save &amp; turn ON</button>
              </>
            )}
          </div>
        </div>
      ) : null}

      {error ? <p className="pfError" role="alert">{error}</p> : null}
      {notice ? <p className="pfNotice" role="status">{notice}</p> : null}

      <details className="pfHistory">
        <summary>Change history</summary>
        {history.length ? history.map((row) => {
          const fmt = (v) => {
            const u = v?.mode === "per_km" ? "₹/km" : "%";
            const parts = [`0–${v?.shortTripMaxKm} km: ${v?.shortRate}${u}`];
            if (v?.midTripMaxKm != null) parts.push(`–${v.midTripMaxKm} km: ${v?.midRate}${u}`);
            parts.push(`above: ${v?.longRate}${u}`);
            return `${v?.enabled ? "ON" : "OFF"} · ${parts.join(" · ")}`;
          };
          return (
            <div key={row._id} className="pfHistoryRow">
              <b>{new Date(row.createdAt).toLocaleString("en-IN")}</b> · {row.changedByName || "Admin"}
              <div className="pfMuted">{fmt(row.before)}</div>
              <div>→ {fmt(row.after)}</div>
            </div>
          );
        }) : <p className="pfMuted">No changes recorded yet.</p>}
      </details>
    </section>
  );
}
