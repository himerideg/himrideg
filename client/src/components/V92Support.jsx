import { useEffect, useState } from "react";
import api from "../api";
import "./v92-support.css";

/*
|--------------------------------------------------------------------------
| HimRideG V92 — Support widgets (ADD-ONLY NEW FILE)
|--------------------------------------------------------------------------
| <ReportDriverButton ride={ride} />  — customer: driver ki complaint
| <AccountDeletionSection />          — logged in user: account delete request
| <PublicAccountDeletionLink role />  — login page: "Login/email bhool gaye?
|                                       Account delete karwana hai"
|--------------------------------------------------------------------------
*/

const CATEGORIES = [
  ["rude_behaviour", "Bura vyavhaar / badtameezi"],
  ["rash_driving", "Tez ya khatarnak driving"],
  ["overcharging", "Tay kiraye se zyada paisa maanga"],
  ["late_or_no_show", "Late aaya / nahi aaya"],
  ["route_issue", "Galat ya lamba route"],
  ["vehicle_condition", "Gaadi gandi / kharab"],
  ["safety", "Safety ka khatra"],
  ["payment_issue", "Payment ki problem"],
  ["other", "Kuch aur"]
];

const REPORTABLE = ["driver_arrived", "started", "completed", "cancelled"];

function idOf(value) {
  return String(value?._id || value?.id || value || "");
}

function errorText(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="v92Shade" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="v92Modal" role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" className="v92Close" onClick={onClose} aria-label="Close">×</button>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Report */
export function ReportDriverButton({ ride, compact = false }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("rude_behaviour");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const status = String(ride?.status || "").toLowerCase();
  if (!ride?.driver || !REPORTABLE.includes(status)) return null;

  const driverName = ride?.driver?.name || "Driver";

  const submit = async () => {
    if (message.trim().length < 5) {
      setError("Kya hua, thoda detail me likhein (kam se kam 5 akshar)");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/support/complaints", {
        bookingId: idOf(ride),
        category,
        message: message.trim(),
        source: "website"
      });
      setDone(data?.message || "Complaint bhej di gayi.");
    } catch (requestError) {
      setError(errorText(requestError, "Complaint nahi gayi"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={compact ? "v92ReportLink" : "v92ReportBtn"}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        ⚑ Driver ki complaint
      </button>

      {open ? (
        <Modal title={`${driverName} ki complaint`} onClose={() => setOpen(false)}>
          {done ? (
            <>
              <p className="v92Success">✓ {done}</p>
              <button type="button" className="v92Primary" onClick={() => setOpen(false)}>Theek hai</button>
            </>
          ) : (
            <>
              <p className="v92Help">Aapki complaint seedha HimRideG admin ke paas jaati hai. Driver ko aapka naam ya number nahi dikhaya jata.</p>
              <label className="v92Field">
                Kya hua?
                <select value={category} onChange={(event) => setCategory(event.target.value)}>
                  {CATEGORIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="v92Field">
                Detail me likhein
                <textarea
                  rows={5}
                  maxLength={2000}
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    setError("");
                  }}
                  placeholder="Jaise: Driver ne raste me ₹200 extra maange aur mana karne par gussa kiya."
                />
              </label>
              {error ? <p className="v92Error">{error}</p> : null}
              <div className="v92Row">
                <button type="button" className="v92Ghost" onClick={() => setOpen(false)}>Cancel</button>
                <button type="button" className="v92Primary" onClick={submit} disabled={busy}>{busy ? "Bhej rahe…" : "Complaint bhejo"}</button>
              </div>
            </>
          )}
        </Modal>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------- In-app deletion */
export function AccountDeletionSection() {
  const [request, setRequest] = useState(null);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/support/account-deletion");
      setRequest(data?.data?.request || null);
    } catch {
      /* optional */
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pending = request?.status === "pending";

  const submit = async () => {
    if (confirmText.trim().toUpperCase() !== "DELETE") {
      setError('Confirm karne ke liye DELETE likhein');
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/support/account-deletion", { reason });
      setMessage(data?.message || "Request bhej di gayi.");
      setRequest(data?.data?.request || null);
    } catch (requestError) {
      setError(errorText(requestError, "Request nahi gayi"));
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setBusy(true);
    try {
      await api.post("/support/account-deletion/cancel", {});
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="v92DeleteBox">
      <strong>Account delete</strong>
      {pending ? (
        <>
          <p>Aapki delete request admin ke paas hai (7 din ke andar process hogi).</p>
          <button type="button" className="v92Ghost" onClick={cancel} disabled={busy}>Request cancel karo</button>
        </>
      ) : (
        <>
          <p>Account aur personal details hamesha ke liye hatwane ke liye request bhejein.</p>
          <button type="button" className="v92DangerLink" onClick={() => setOpen(true)}>Mera account delete karo</button>
        </>
      )}

      {open ? (
        <Modal title="Account delete request" onClose={() => setOpen(false)}>
          {message ? (
            <>
              <p className="v92Success">✓ {message}</p>
              <button type="button" className="v92Primary" onClick={() => setOpen(false)}>Theek hai</button>
            </>
          ) : (
            <>
              <ul className="v92List">
                <li>Naam, mobile number, email aur photo hata diye jayenge.</li>
                <li>Ride aur payment ka record kanoon/tax ke liye rakha jata hai (bina aapke naam ke).</li>
                <li>Koi ride chal rahi ho, payment baaki ho ya driver wallet me paisa ho to pehle wo clear hoga.</li>
                <li>Delete ke baad isi number se naya account bana sakte hain.</li>
              </ul>
              <label className="v92Field">
                Kyun delete karna hai? (optional)
                <textarea rows={3} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} />
              </label>
              <label className="v92Field">
                Confirm karne ke liye <b>DELETE</b> likhein
                <input value={confirmText} onChange={(event) => { setConfirmText(event.target.value); setError(""); }} />
              </label>
              {error ? <p className="v92Error">{error}</p> : null}
              <div className="v92Row">
                <button type="button" className="v92Ghost" onClick={() => setOpen(false)}>Cancel</button>
                <button type="button" className="v92Danger" onClick={submit} disabled={busy}>{busy ? "Bhej rahe…" : "Delete request bhejo"}</button>
              </div>
            </>
          )}
        </Modal>
      ) : null}
    </div>
  );
}

/* -------------------------------------------- Public (login ke bina) */
export function PublicAccountDeletionLink({ role = "customer", label }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", reason: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setError("");
  };

  const submit = async () => {
    const phone = form.phone.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Account wala 10 digit mobile number likhein");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/support/account-deletion/public", { ...form, phone, role });
      setMessage(data?.message || "Request mil gayi.");
    } catch (requestError) {
      setError(errorText(requestError, "Request nahi gayi"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" className="v92PublicLink" onClick={() => setOpen(true)}>
        {label || "Login / email bhool gaye? Account delete karwana hai"}
      </button>
      {open ? (
        <Modal title="Account delete request (bina login)" onClose={() => setOpen(false)}>
          {message ? (
            <>
              <p className="v92Success">✓ {message}</p>
              <button type="button" className="v92Primary" onClick={() => setOpen(false)}>Theek hai</button>
            </>
          ) : (
            <>
              <p className="v92Help">Agar aap login nahi kar pa rahe (email/number bhool gaye), to yahan request bhejein. HimRideG team isi number par call/SMS karke verify karegi, phir account delete hoga.</p>
              <label className="v92Field">Account wala mobile number *<input inputMode="numeric" maxLength={14} value={form.phone} onChange={update("phone")} placeholder="98XXXXXXXX" /></label>
              <label className="v92Field">Naam<input maxLength={120} value={form.name} onChange={update("name")} /></label>
              <label className="v92Field">Email (yaad ho to)<input type="email" maxLength={150} value={form.email} onChange={update("email")} /></label>
              <label className="v92Field">Reason<textarea rows={3} maxLength={1000} value={form.reason} onChange={update("reason")} /></label>
              {error ? <p className="v92Error">{error}</p> : null}
              <div className="v92Row">
                <button type="button" className="v92Ghost" onClick={() => setOpen(false)}>Cancel</button>
                <button type="button" className="v92Danger" onClick={submit} disabled={busy}>{busy ? "Bhej rahe…" : "Request bhejo"}</button>
              </div>
            </>
          )}
        </Modal>
      ) : null}
    </>
  );
}

export default ReportDriverButton;
