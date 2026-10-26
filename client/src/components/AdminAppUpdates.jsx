import React, { useEffect, useState } from "react";
import api from "../api";
const draft = role => ({ appRole: role, version: "", message: "A new HimRideG version is ready.", enabled: false,
  downloadUrl: `https://www.himrideg.com/downloads/HimRideG-${role === "driver" ? "Driver" : "Customer"}.apk` });
export default function AdminAppUpdates() {
  const [rows, setRows] = useState([draft("customer"), draft("driver")]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async () => {
    const result = await api.get("/admin/app-releases");
    const saved = result.data?.data?.releases || [];
    setRows(["customer", "driver"].map(role => saved.find(row => row.appRole === role) || draft(role)));
  };
  useEffect(() => { load().catch(() => setMessage("App update settings could not load.")); }, []);
  const change = (role, field, value) => setRows(current => current.map(row => row.appRole === role ? { ...row, [field]: value } : row));
  const run = async (row, notify = false) => {
    if (notify && !window.confirm(`Send an update notification to registered ${row.appRole} devices? This does not install the APK.`)) return;
    if (!notify && row.enabled && !window.confirm("Have you uploaded and tested the matching signed APK? Enable this release only after that APK is available.")) return;
    setBusy(true); setMessage("");
    try {
      if (notify) {
        const result = await api.post(`/admin/app-releases/${row.appRole}/notify`, { confirm: true });
        const data = result.data?.data || {};
        setMessage(`${data.acceptedByExpo || 0} accepted by push provider, ${data.rejectedByExpo || 0} rejected. Phone delivery is not confirmed.`);
      } else {
        await api.put(`/admin/app-releases/${row.appRole}`, { version: row.version, message: row.message, enabled: row.enabled, downloadUrl: row.downloadUrl });
        setMessage("Release saved. No notification sent.");
      }
      await load();
    } catch (error) { setMessage(error.response?.data?.message || "App update action failed."); }
    finally { setBusy(false); }
  };
  return <section>
    <h2>App Updates</h2>
    <p>Upload the signed APK first, save its version here, then enable it. Older apps with update support show Update Now / Later once every 24 hours.</p>
    <p>Existing apps without this feature need a one-time APK installation. Saving does not send notifications.</p>
    {rows.map(row => <article key={row.appRole} style={{ border: "1px solid #888", borderRadius: 12, padding: 18, margin: "18px 0" }}>
      <h3>{row.appRole === "driver" ? "Driver app" : "Customer app"}</h3>
      <label>New version <input value={row.version} placeholder="4.0.62" disabled={busy} onChange={e => change(row.appRole, "version", e.target.value)} /></label>
      <p><label>Message <input value={row.message} disabled={busy} onChange={e => change(row.appRole, "message", e.target.value)} /></label></p>
      <p>APK: {row.downloadUrl}</p>
      <p><label><input type="checkbox" checked={row.enabled} disabled={busy} onChange={e => change(row.appRole, "enabled", e.target.checked)} /> Release enabled</label></p>
      <button disabled={busy} onClick={() => run(row)}>Save release</button>{" "}
      <button disabled={busy || !row.enabled || !row._id} onClick={() => run(row, true)}>Send update notification</button>
      {row.lastNotifiedAt ? <p>Last sent: {new Date(row.lastNotifiedAt).toLocaleString()}</p> : null}
    </article>)}
    <p role="status">{message}</p>
  </section>;
}
