import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api";
import "./admin-control-center.css";
// V93: popup text language ke hisaab se
import { dialogText } from "../i18n/v93Language";

/*
|--------------------------------------------------------------------------
| HimRideG V92 — Admin Control Center (ADD-ONLY NEW FILE)
|--------------------------------------------------------------------------
| section:
|   "control"    — overview counts + quick links
|   "complaints" — customer complaints, har complaint ke saath driver profile
|   "customers"  — poori customer list (search, filter, CSV)
|   "allDrivers" — poori driver list (search, filter, CSV)
|   "deletion"   — account delete requests (in-app + login bhool gaye)
| Kisi bhi user par click → profile drawer (complaints, warnings, rides,
| warning bhejo, block/unblock, account delete).
|--------------------------------------------------------------------------
*/

const CATEGORY_LABELS = {
  rude_behaviour: "Bura vyavhaar",
  rash_driving: "Tez / khatarnak driving",
  overcharging: "Zyada paisa maanga",
  vehicle_condition: "Gaadi ki halat kharab",
  route_issue: "Galat route",
  late_or_no_show: "Late / nahi aaya",
  safety: "Safety issue",
  payment_issue: "Payment issue",
  other: "Other"
};

const STATUS_LABELS = {
  open: "Open",
  reviewing: "Reviewing",
  warned: "Warning sent",
  resolved: "Resolved",
  dismissed: "Dismissed"
};

function money(value) {
  return `₹${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;
}

function when(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function errorText(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function payload(response) {
  return response?.data?.data || response?.data || {};
}

function initials(name) {
  return String(name || "?").trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}

function StatusPill({ status }) {
  return <span className={`accPill accPill--${status || "active"}`}>{status || "active"}</span>;
}

/* ------------------------------------------------------------- Overview */
function Overview({ summary, onGo }) {
  if (!summary) return <p className="accMuted">Loading…</p>;
  const cards = [
    { label: "Customers", value: summary.customers.total, sub: `+${summary.customers.newToday} aaj • ${summary.customers.blocked} blocked`, go: "customers" },
    { label: "Drivers", value: summary.drivers.total, sub: `${summary.drivers.online} online • ${summary.drivers.pending} pending approval`, go: "allDrivers" },
    { label: "Open complaints", value: summary.complaints.open, sub: `${summary.complaints.highPriority} high priority`, go: "complaints", alert: summary.complaints.open > 0 },
    { label: "Delete requests", value: summary.deletionRequests.pending, sub: "pending", go: "deletion", alert: summary.deletionRequests.pending > 0 },
    { label: "Rides aaj", value: summary.rides.today, sub: `${summary.rides.completedToday} complete • ${summary.rides.cancelledToday} cancel` },
    { label: "Live rides abhi", value: summary.rides.activeNow, sub: "chal rahi hain" },
    { label: "Paid fares aaj", value: money(summary.money.paidFaresToday), sub: "customers ne pay kiya" },
    { label: "Platform fee aaj", value: money(summary.money.platformCommissionToday), sub: "HimRideG commission" }
  ];

  return (
    <div className="accGrid">
      {cards.map((card) => (
        <button
          type="button"
          key={card.label}
          className={`accStat${card.alert ? " accStat--alert" : ""}${card.go ? "" : " accStat--static"}`}
          onClick={card.go ? () => onGo(card.go) : undefined}
        >
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <small>{card.sub}</small>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ User list */
function UserList({ role, onOpen }) {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/admin/control/users", { params: { role, search: query, status, page, limit: 50 } });
      setData(payload(response));
    } catch (requestError) {
      setError(errorText(requestError, "List load nahi hui"));
    } finally {
      setLoading(false);
    }
  }, [role, query, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setQuery(search.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const response = await api.get("/admin/control/users/export", { params: { role, search: query, status }, responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `himrideg-${role}s-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(errorText(requestError, "Export nahi hua"));
    } finally {
      setExporting(false);
    }
  };

  const filters = role === "driver"
    ? [["all", "Sab"], ["active", "Active"], ["online", "Online"], ["approved", "Approved"], ["pending", "Pending approval"], ["blocked", "Blocked"], ["deleted", "Deleted"]]
    : [["all", "Sab"], ["active", "Active"], ["blocked", "Blocked"], ["deleted", "Deleted"]];

  const users = data?.users || [];

  return (
    <section className="accPanel">
      <div className="accToolbar">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={role === "driver" ? "Naam, phone, email ya gaadi number" : "Naam, phone ya email"}
        />
        <div className="accChips">
          {filters.map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={status === value ? "active" : ""}
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="accSecondary" onClick={exportCsv} disabled={exporting}>
          {exporting ? "Exporting…" : "⬇ Excel / CSV"}
        </button>
      </div>

      <p className="accMuted">
        {loading ? "Loading…" : `Kul ${data?.total ?? 0} ${role === "driver" ? "drivers" : "customers"}`}
      </p>
      {error ? <p className="accError">{error}</p> : null}

      <div className="accTableWrap">
        <table className="accTable">
          <thead>
            {role === "driver" ? (
              <tr>
                <th>Driver</th><th>Status</th><th>Gaadi</th><th>Rating</th><th>Rides</th><th>Complaints</th><th>Warnings</th><th>Wallet / Due</th><th>Joined</th>
              </tr>
            ) : (
              <tr>
                <th>Customer</th><th>Status</th><th>Rides</th><th>Complaints ki</th><th>Joined</th><th>Last active</th>
              </tr>
            )}
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} onClick={() => onOpen(user._id)} className="accRowClickable">
                <td>
                  <div className="accWho">
                    <span className="accAvatar">{initials(user.name)}</span>
                    <span>
                      <strong>{user.name || "—"}</strong>
                      <small>{user.phone}{user.email ? ` • ${user.email}` : ""}</small>
                    </span>
                  </div>
                </td>
                <td>
                  <StatusPill status={user.status} />
                  {role === "driver" && user.isOnline ? <span className="accPill accPill--online">online</span> : null}
                  {role === "driver" && user.approvalStatus && user.approvalStatus !== "approved" ? <small className="accMuted"> {user.approvalStatus}</small> : null}
                </td>
                {role === "driver" ? (
                  <>
                    <td>{user.vehicle || "—"}</td>
                    <td>{user.rating ? `★ ${user.rating}` : "—"}</td>
                    <td>{user.completedRides}/{user.rides}</td>
                    <td className={user.openComplaints ? "accDanger" : ""}>{user.complaints}{user.openComplaints ? ` (${user.openComplaints} open)` : ""}</td>
                    <td>{user.warnings}</td>
                    <td>{money(user.walletBalance)} / {money(user.commissionDue)}</td>
                    <td>{when(user.createdAt)}</td>
                  </>
                ) : (
                  <>
                    <td>{user.completedRides}/{user.rides}</td>
                    <td>{user.complaints}</td>
                    <td>{when(user.createdAt)}</td>
                    <td>{when(user.lastActiveAt)}</td>
                  </>
                )}
              </tr>
            ))}
            {!loading && !users.length ? (
              <tr><td colSpan={9} className="accEmpty">Koi record nahi mila</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {data?.pages > 1 ? (
        <div className="accPager">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Pichhla</button>
          <span>Page {page} / {data.pages}</span>
          <button type="button" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Agla ›</button>
        </div>
      ) : null}
    </section>
  );
}

/* ----------------------------------------------------------- Complaints */
function Complaints({ onOpen, onChanged }) {
  const [status, setStatus] = useState("active");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [warnFor, setWarnFor] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/admin/control/complaints", { params: { status, limit: 100 } });
      setData(payload(response));
    } catch (requestError) {
      setError(errorText(requestError, "Complaints load nahi hui"));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const setComplaintStatus = async (complaint, nextStatus) => {
    const note = nextStatus === "dismissed" ? window.prompt(dialogText("dismissReason"), "") : "";
    if (note === null) return;
    try {
      await api.patch(`/admin/control/complaints/${complaint._id}`, { status: nextStatus, ...(note ? { adminNote: note } : {}) });
      await load();
      onChanged?.();
    } catch (requestError) {
      window.alert(errorText(requestError, "Update nahi hua"));
    }
  };

  const complaints = data?.complaints || [];

  return (
    <section className="accPanel">
      <div className="accToolbar">
        <div className="accChips">
          {[["active", "Open + Reviewing"], ["warned", "Warning sent"], ["resolved", "Resolved"], ["dismissed", "Dismissed"], ["all", "Sab"]].map(([value, label]) => (
            <button type="button" key={value} className={status === value ? "active" : ""} onClick={() => setStatus(value)}>{label}</button>
          ))}
        </div>
        <button type="button" className="accSecondary" onClick={load}>↻ Refresh</button>
      </div>
      <p className="accMuted">{loading ? "Loading…" : `${data?.total ?? 0} complaints`}</p>
      {error ? <p className="accError">{error}</p> : null}

      <div className="accCards">
        {complaints.map((complaint) => {
          const driver = complaint.driver || {};
          const vehicle = driver.driverProfile?.vehicle || {};
          return (
            <article key={complaint._id} className={`accComplaint accComplaint--${complaint.severity}`}>
              <header>
                <div>
                  <span className={`accPill accPill--${complaint.status}`}>{STATUS_LABELS[complaint.status] || complaint.status}</span>
                  <span className={`accPill accPill--sev-${complaint.severity}`}>{complaint.severity} priority</span>
                  <strong>{CATEGORY_LABELS[complaint.category] || complaint.category}</strong>
                </div>
                <small>{when(complaint.createdAt)}{complaint.bookingNumber ? ` • Ride ${complaint.bookingNumber}` : ""}</small>
              </header>

              <p className="accComplaintText">“{complaint.message}”</p>

              <div className="accComplaintPeople">
                <button type="button" className="accPersonCard" onClick={() => onOpen(idOf(driver))}>
                  <span className="accAvatar accAvatar--driver">{initials(driver.name)}</span>
                  <span>
                    <small>DRIVER (jiski complaint hai)</small>
                    <strong>{driver.name || "—"}</strong>
                    <em>{driver.phone}{vehicle.registrationNumber ? ` • ${vehicle.registrationNumber}` : ""}</em>
                    <em>
                      Kul complaints: <b className={complaint.driverComplaintCount > 1 ? "accDanger" : ""}>{complaint.driverComplaintCount}</b>
                      {" • "}Warnings: <b>{complaint.driverWarningCount}</b>
                      {driver.driverProfile?.rating ? ` • ★ ${driver.driverProfile.rating}` : ""}
                    </em>
                  </span>
                  <span className="accChevron">Profile ›</span>
                </button>

                <div className="accPersonCard accPersonCard--static">
                  <span className="accAvatar">{initials(complaint.customer?.name)}</span>
                  <span>
                    <small>CUSTOMER (complaint ki)</small>
                    <strong>{complaint.customer?.name || "—"}</strong>
                    <em>{complaint.customer?.phone}</em>
                  </span>
                </div>
              </div>

              {complaint.adminNote ? <p className="accNote">Admin note: {complaint.adminNote}</p> : null}

              <div className="accActions">
                <button type="button" className="accWarnBtn" onClick={() => setWarnFor(complaint)}>⚠ Driver ko warning bhejo</button>
                {complaint.status === "open" ? (
                  <button type="button" className="accSecondary" onClick={() => setComplaintStatus(complaint, "reviewing")}>Reviewing</button>
                ) : null}
                {!["resolved", "dismissed"].includes(complaint.status) ? (
                  <>
                    <button type="button" className="accSecondary" onClick={() => setComplaintStatus(complaint, "resolved")}>✓ Resolved</button>
                    <button type="button" className="accGhost" onClick={() => setComplaintStatus(complaint, "dismissed")}>Dismiss</button>
                  </>
                ) : null}
              </div>
            </article>
          );
        })}
        {!loading && !complaints.length ? <p className="accEmpty">Koi complaint nahi ✓</p> : null}
      </div>

      {warnFor ? (
        <WarnDialog
          title={`Warning: ${warnFor.driver?.name || "Driver"}`}
          defaultMessage={`Customer ne aapki ride${warnFor.bookingNumber ? ` (${warnFor.bookingNumber})` : ""} me "${CATEGORY_LABELS[warnFor.category] || warnFor.category}" ki complaint ki hai. Kripya HimRideG ke niyam follow karein, nahi to account block ho sakta hai.`}
          onClose={() => setWarnFor(null)}
          onSend={async ({ message, level }) => {
            await api.post(`/admin/control/complaints/${warnFor._id}/warn`, { message, level });
            setWarnFor(null);
            await load();
            onChanged?.();
          }}
        />
      ) : null}
    </section>
  );
}

function idOf(value) {
  return String(value?._id || value?.id || value || "");
}

/* --------------------------------------------------------- Warn dialog */
function WarnDialog({ title, defaultMessage = "", onClose, onSend }) {
  const [message, setMessage] = useState(defaultMessage);
  const [level, setLevel] = useState("medium");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    if (message.trim().length < 3) {
      setError("Warning message likhein");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSend({ message: message.trim(), level });
    } catch (requestError) {
      setError(errorText(requestError, "Warning nahi gayi"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="accModalShade" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="accModal" role="dialog" aria-modal="true" aria-label={title}>
        <h3>{title}</h3>
        <label>
          Level
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="low">Low — soochna</option>
            <option value="medium">Medium — chetavni</option>
            <option value="high">High — sakht chetavni</option>
            <option value="final">Final — agli baar block</option>
          </select>
        </label>
        <label>
          Message (driver ko dikhega)
          <textarea rows={5} value={message} onChange={(event) => { setMessage(event.target.value); setError(""); }} maxLength={1000} />
        </label>
        {error ? <p className="accError">{error}</p> : null}
        <div className="accActions">
          <button type="button" className="accGhost" onClick={onClose}>Cancel</button>
          <button type="button" className="accWarnBtn" onClick={send} disabled={busy}>{busy ? "Bhej rahe…" : "Warning bhejo"}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------- Deletion requests */
function DeletionRequests({ onOpen, onChanged }) {
  const [status, setStatus] = useState("pending");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/admin/control/deletion-requests", { params: { status } });
      setRequests(payload(response).requests || []);
    } catch (requestError) {
      setError(errorText(requestError, "Requests load nahi hui"));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (request, force = false) => {
    const verify = request.source === "public"
      ? dialogText("publicVerify")
      : "";
    if (!force && !window.confirm(dialogText("deleteAccountConfirm", request.name || request.phone, verify))) return;
    const adminNote = force ? window.prompt(dialogText("forceReason"), "") : "";
    if (force && !adminNote) return;
    setBusyId(request._id);
    try {
      await api.patch(`/admin/control/deletion-requests/${request._id}/approve`, { force, adminNote: adminNote || "" });
      await load();
      onChanged?.();
    } catch (requestError) {
      const blockers = requestError?.response?.data?.data?.blockers;
      if (blockers?.length && !force) {
        if (window.confirm(dialogText("blockedDelete", blockers.join("\n• ")))) {
          setBusyId("");
          await approve(request, true);
          return;
        }
      } else {
        window.alert(errorText(requestError, "Delete nahi hua"));
      }
    } finally {
      setBusyId("");
    }
  };

  const reject = async (request) => {
    const adminNote = window.prompt(dialogText("rejectReason"), dialogText("rejectDefault"));
    if (adminNote === null) return;
    setBusyId(request._id);
    try {
      await api.patch(`/admin/control/deletion-requests/${request._id}/reject`, { adminNote });
      await load();
      onChanged?.();
    } catch (requestError) {
      window.alert(errorText(requestError, "Reject nahi hua"));
    } finally {
      setBusyId("");
    }
  };

  return (
    <section className="accPanel">
      <div className="accToolbar">
        <div className="accChips">
          {[["pending", "Pending"], ["approved", "Deleted"], ["rejected", "Rejected"], ["cancelled", "User ne cancel ki"]].map(([value, label]) => (
            <button type="button" key={value} className={status === value ? "active" : ""} onClick={() => setStatus(value)}>{label}</button>
          ))}
        </div>
        <button type="button" className="accSecondary" onClick={load}>↻ Refresh</button>
      </div>
      <p className="accHint">
        Login ke bina aayi request (“Login bhool gaye”) me pehle us mobile number par call karke confirm karein. Delete hone par naam, phone, email, photo hat jaate hain; ride aur payment records hisaab ke liye rehte hain.
      </p>
      {error ? <p className="accError">{error}</p> : null}
      <div className="accTableWrap">
        <table className="accTable">
          <thead>
            <tr><th>User</th><th>Type</th><th>Kahan se</th><th>Reason</th><th>Date</th><th>Dhyan dein</th><th>Action</th></tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id}>
                <td>
                  <div className="accWho">
                    <span className="accAvatar">{initials(request.name || request.user?.name)}</span>
                    <span>
                      <strong>{request.name || request.user?.name || "—"}</strong>
                      <small>{request.phone}{request.email ? ` • ${request.email}` : ""}</small>
                      {request.user?._id ? (
                        <button type="button" className="accLink" onClick={() => onOpen(request.user._id)}>Profile dekho</button>
                      ) : (
                        <small className={request.accountFound ? "" : "accDanger"}>{request.accountFound ? "" : "Is number par account nahi mila"}</small>
                      )}
                    </span>
                  </div>
                </td>
                <td>{request.role}</td>
                <td>{request.source === "public" ? <span className="accPill accPill--reviewing">Login ke bina</span> : <span className="accPill accPill--active">App / website se</span>}</td>
                <td className="accWrap">{request.reason || "—"}</td>
                <td>{when(request.createdAt)}</td>
                <td className="accWrap">
                  {(request.liveBlockers || request.blockers || []).length
                    ? (request.liveBlockers || request.blockers).map((item) => <div key={item} className="accDanger">• {item}</div>)
                    : request.status === "pending" ? <span className="accOk">Koi rukawat nahi</span> : request.adminNote || "—"}
                </td>
                <td>
                  {request.status === "pending" ? (
                    <div className="accActions accActions--tight">
                      <button type="button" className="accDangerBtn" disabled={busyId === request._id} onClick={() => approve(request)}>Delete karo</button>
                      <button type="button" className="accGhost" disabled={busyId === request._id} onClick={() => reject(request)}>Reject</button>
                    </div>
                  ) : (
                    <span>{request.status}{request.processedAt ? ` • ${when(request.processedAt)}` : ""}</span>
                  )}
                </td>
              </tr>
            ))}
            {!loading && !requests.length ? <tr><td colSpan={7} className="accEmpty">Koi request nahi</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- User drawer */
function UserDrawer({ userId, onClose, onChanged }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [warnOpen, setWarnOpen] = useState(false);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await api.get(`/admin/control/users/${userId}/overview`);
      setData(payload(response));
    } catch (requestError) {
      setError(errorText(requestError, "Profile load nahi hui"));
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const user = data?.user;
  const isDriver = user?.role === "driver";
  const vehicle = user?.driverProfile?.vehicle || {};

  const blockToggle = async () => {
    if (!user) return;
    const blocked = user.status === "blocked";
    const reason = blocked ? "" : window.prompt(dialogText("blockReason"), "");
    if (!blocked && !reason) return;
    setBusy("block");
    try {
      await api.patch(`/admin/control/users/${user._id}/${blocked ? "unblock" : "block"}`, { reason });
      await load();
      onChanged?.();
    } catch (requestError) {
      window.alert(errorText(requestError, "Update nahi hua"));
    } finally {
      setBusy("");
    }
  };

  const deleteAccount = async (force = false) => {
    if (!user) return;
    const reason = window.prompt(dialogText("adminDeleteReason", user.name), "");
    if (!reason) return;
    setBusy("delete");
    try {
      await api.post(`/admin/control/users/${user._id}/delete`, { reason, force });
      await load();
      onChanged?.();
    } catch (requestError) {
      const blockers = requestError?.response?.data?.data?.blockers;
      if (blockers?.length && !force && window.confirm(dialogText("blockers", blockers.join("\n• ")))) {
        setBusy("");
        await deleteAccount(true);
        return;
      }
      if (!blockers?.length) window.alert(errorText(requestError, "Delete nahi hua"));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="accDrawerShade" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="accDrawer" role="dialog" aria-modal="true" aria-label="User profile">
        <button type="button" className="accDrawerClose" onClick={onClose} aria-label="Close">×</button>
        {error ? <p className="accError">{error}</p> : null}
        {!user && !error ? <p className="accMuted">Loading…</p> : null}

        {user ? (
          <>
            <div className="accProfileHead">
              {user.profileImage ? <img src={user.profileImage} alt="" /> : <span className="accAvatar accAvatar--lg">{initials(user.name)}</span>}
              <div>
                <h3>{user.name}</h3>
                <p>{user.phone}{user.email ? ` • ${user.email}` : ""}</p>
                <p>
                  <StatusPill status={user.status} /> <span className="accPill">{user.role}</span>
                  {isDriver && user.isOnline ? <span className="accPill accPill--online">online</span> : null}
                </p>
                {user.blockedReason || user.blockReason ? <p className="accDanger">Block reason: {user.blockedReason || user.blockReason}</p> : null}
              </div>
            </div>

            {isDriver ? (
              <p className="accMuted">
                {[vehicle.brand, vehicle.model, vehicle.color].filter(Boolean).join(" ")} {vehicle.registrationNumber ? `• ${vehicle.registrationNumber}` : ""}
                {" • "}Approval: {user.driverProfile?.approvalStatus || "—"}
              </p>
            ) : null}

            <div className="accMiniStats">
              <div><strong>{data.stats.totalRides}</strong><span>Kul rides</span></div>
              <div><strong>{data.stats.completed}</strong><span>Complete</span></div>
              <div><strong>{data.stats.cancelled}</strong><span>Cancel</span></div>
              {isDriver ? <div><strong>{data.stats.rating ? `★ ${data.stats.rating}` : "—"}</strong><span>{data.stats.ratingCount} ratings</span></div> : null}
              <div className={data.stats.openComplaints ? "accStatBad" : ""}><strong>{data.stats.complaints}</strong><span>{isDriver ? "Complaints" : "Complaints ki"}</span></div>
              {isDriver ? <div><strong>{data.stats.warnings}</strong><span>Warnings</span></div> : null}
              {isDriver ? <div><strong>{money(user.wallet?.balance)}</strong><span>Wallet</span></div> : null}
              {isDriver ? <div><strong>{money(user.wallet?.commissionDue)}</strong><span>Fee due</span></div> : null}
            </div>

            {user.status !== "deleted" ? (
              <div className="accActions">
                {isDriver ? <button type="button" className="accWarnBtn" onClick={() => setWarnOpen(true)}>⚠ Warning bhejo</button> : null}
                <button type="button" className="accSecondary" onClick={blockToggle} disabled={busy === "block"}>
                  {user.status === "blocked" ? "Unblock karo" : "⊘ Block karo"}
                </button>
                <button type="button" className="accDangerBtn" onClick={() => deleteAccount(false)} disabled={busy === "delete"}>Account delete</button>
              </div>
            ) : (
              <p className="accNote">Ye account {when(user.deletedAt)} ko delete ho chuka hai.</p>
            )}

            <h4>{isDriver ? "Is driver ki complaints" : "Is customer ki complaints"} ({data.complaints.length})</h4>
            {data.complaints.length ? data.complaints.map((complaint) => (
              <div key={complaint._id} className="accTimelineItem">
                <div>
                  <span className={`accPill accPill--${complaint.status}`}>{STATUS_LABELS[complaint.status] || complaint.status}</span>
                  <strong>{CATEGORY_LABELS[complaint.category] || complaint.category}</strong>
                  <small>{when(complaint.createdAt)}{complaint.bookingNumber ? ` • ${complaint.bookingNumber}` : ""}</small>
                </div>
                <p>“{complaint.message}”</p>
                <small className="accMuted">
                  {isDriver ? `Customer: ${complaint.customer?.name || "—"} ${complaint.customer?.phone || ""}` : `Driver: ${complaint.driver?.name || "—"} ${complaint.driver?.phone || ""}`}
                </small>
              </div>
            )) : <p className="accMuted">Koi complaint nahi.</p>}

            {isDriver ? (
              <>
                <h4>Warnings ({data.warnings.length})</h4>
                {data.warnings.length ? data.warnings.map((warning) => (
                  <div key={warning._id} className="accTimelineItem">
                    <div>
                      <span className={`accPill accPill--sev-${warning.level === "final" ? "high" : warning.level}`}>{warning.level}</span>
                      <small>{when(warning.createdAt)}</small>
                      {warning.acknowledged ? <span className="accOk"> ✓ driver ne padh liya</span> : <span className="accMuted"> abhi padha nahi</span>}
                    </div>
                    <p>{warning.message}</p>
                    {warning.reason ? <small className="accMuted">{warning.reason}</small> : null}
                    {warning.driverReply ? <p className="accNote">Driver ka jawab: {warning.driverReply}</p> : null}
                  </div>
                )) : <p className="accMuted">Koi warning nahi.</p>}
              </>
            ) : null}

            <h4>Recent rides</h4>
            {data.recentRides.length ? (
              <div className="accTableWrap">
                <table className="accTable accTable--compact">
                  <thead><tr><th>Ride</th><th>Status</th><th>Fare</th><th>{isDriver ? "Customer" : "Driver"}</th><th>Date</th></tr></thead>
                  <tbody>
                    {data.recentRides.map((ride) => {
                      const other = isDriver ? ride.customer : ride.driver;
                      return (
                        <tr key={ride._id}>
                          <td>{ride.bookingNumber || String(ride._id).slice(-6)}</td>
                          <td>{ride.status}{ride.status === "completed" ? ` • ${ride.paymentStatus}` : ""}</td>
                          <td>{ride.finalFare ? money(ride.finalFare) : "—"}</td>
                          <td>{other?.name || "—"}</td>
                          <td>{when(ride.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : <p className="accMuted">Koi ride nahi.</p>}
          </>
        ) : null}

        {warnOpen && user ? (
          <WarnDialog
            title={`Warning: ${user.name}`}
            onClose={() => setWarnOpen(false)}
            onSend={async ({ message, level }) => {
              await api.post(`/admin/control/users/${user._id}/warn`, { message, level });
              setWarnOpen(false);
              await load();
              onChanged?.();
            }}
          />
        ) : null}
      </aside>
    </div>
  );
}

/* ----------------------------------------------------------------- Root */
export default function AdminControlCenter({ section = "control", onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [openUserId, setOpenUserId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadSummary = useCallback(async () => {
    try {
      const response = await api.get("/admin/control/summary");
      setSummary(payload(response));
    } catch {
      /* summary optional */
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary, refreshKey]);

  const changed = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  const content = useMemo(() => {
    switch (section) {
      case "complaints":
        return <Complaints key={`c${refreshKey}`} onOpen={setOpenUserId} onChanged={changed} />;
      case "customers":
        return <UserList key="customers" role="customer" onOpen={setOpenUserId} />;
      case "allDrivers":
        return <UserList key="drivers" role="driver" onOpen={setOpenUserId} />;
      case "deletion":
        return <DeletionRequests onOpen={setOpenUserId} onChanged={changed} />;
      default:
        return (
          <>
            <Overview summary={summary} onGo={(target) => onNavigate?.(target)} />
            <section className="accPanel">
              <h3>Admin aur kya kar sakta hai</h3>
              <ul className="accTips">
                <li><b>Complaints:</b> customer ki complaint driver ki profile ke saath — wahin se warning, resolve ya dismiss.</li>
                <li><b>Drivers / Customers:</b> poori list, search, filter, Excel/CSV download. Kisi par click karo — profile, rides, complaints, warnings.</li>
                <li><b>Block / Unblock:</b> customer aur driver dono (pehle customer block save hi nahi hota tha — ab fix).</li>
                <li><b>Delete requests:</b> app/website se ya “login bhool gaye” form se aayi requests — verify karke delete.</li>
              </ul>
            </section>
          </>
        );
    }
  }, [section, summary, refreshKey, changed, onNavigate]);

  return (
    <div className="adminControlCenter">
      {content}
      {openUserId ? (
        <UserDrawer
          userId={openUserId}
          onClose={() => setOpenUserId("")}
          onChanged={changed}
        />
      ) : null}
    </div>
  );
}
