import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import "./driver-warnings.css";

function DriverWarnings({ onProfileUpdate }) {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyWarningId, setBusyWarningId] = useState("");
  const [replyWarningId, setReplyWarningId] = useState("");
  const [replyText, setReplyText] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const messageTimerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    loadWarnings();

    return () => {
      mountedRef.current = false;

      if (messageTimerRef.current) {
        window.clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  function clearMessages() {
    setSuccessMessage("");
    setErrorMessage("");
  }

  function showSuccess(text) {
    setErrorMessage("");
    setSuccessMessage(text);

    if (messageTimerRef.current) {
      window.clearTimeout(messageTimerRef.current);
    }

    messageTimerRef.current = window.setTimeout(() => {
      if (mountedRef.current) {
        setSuccessMessage("");
      }
    }, 3500);
  }

  function showError(text) {
    setSuccessMessage("");
    setErrorMessage(text);
  }

  async function loadWarnings(showRefreshLoader = false) {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const { data } = await api.get("/driver/warnings");

      if (!mountedRef.current) {
        return;
      }

      setWarnings(
        Array.isArray(data?.warnings)
          ? data.warnings
          : []
      );
    } catch (requestError) {
      if (!mountedRef.current) {
        return;
      }

      showError(
        requestError.response?.data?.message ||
          "Warnings load nahi ho paayi."
      );
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }

  async function updateParentProfile() {
    if (typeof onProfileUpdate !== "function") {
      return;
    }

    try {
      await onProfileUpdate();
    } catch (error) {
      console.error("Profile refresh error:", error);
    }
  }

  async function acknowledgeWarning(warningId) {
    if (!warningId || busyWarningId) {
      return;
    }

    try {
      setBusyWarningId(warningId);
      clearMessages();

      const { data } = await api.patch(
        `/driver/warnings/${warningId}/acknowledge`
      );

      showSuccess(
        data?.message ||
          "Warning acknowledge ho gayi."
      );

      await loadWarnings(true);
      await updateParentProfile();
    } catch (requestError) {
      showError(
        requestError.response?.data?.message ||
          "Warning acknowledge nahi hui."
      );
    } finally {
      if (mountedRef.current) {
        setBusyWarningId("");
      }
    }
  }

  async function sendReply(warningId) {
    if (!warningId || busyWarningId) {
      return;
    }

    const cleanReply = replyText.trim();

    if (!cleanReply) {
      showError("Admin ke liye reply likho.");
      return;
    }

    if (cleanReply.length > 500) {
      showError(
        "Reply 500 characters se chhota hona chahiye."
      );
      return;
    }

    try {
      setBusyWarningId(warningId);
      clearMessages();

      const { data } = await api.patch(
        `/driver/warnings/${warningId}/reply`,
        {
          reply: cleanReply
        }
      );

      showSuccess(
        data?.message ||
          "Reply admin ko bhej diya gaya."
      );

      setReplyWarningId("");
      setReplyText("");

      await loadWarnings(true);
      await updateParentProfile();
    } catch (requestError) {
      showError(
        requestError.response?.data?.message ||
          "Reply send nahi hua."
      );
    } finally {
      if (mountedRef.current) {
        setBusyWarningId("");
      }
    }
  }

  function openReplyBox(warning) {
    clearMessages();

    setReplyWarningId(warning._id);
    setReplyText(warning.driverReply || "");
  }

  function closeReplyBox() {
    setReplyWarningId("");
    setReplyText("");
    setErrorMessage("");
  }

  function formatDate(date) {
    if (!date) {
      return "Date available nahi hai";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function getWarningLevel(warning) {
    const level = String(
      warning?.level || "low"
    ).toLowerCase();

    if (
      !["low", "medium", "high"].includes(level)
    ) {
      return "low";
    }

    return level;
  }

  function getLevelLabel(level) {
    if (level === "high") {
      return "High";
    }

    if (level === "medium") {
      return "Medium";
    }

    return "Low";
  }

  const pendingWarnings = warnings.filter(
    (warning) => !warning.acknowledged
  );

  if (loading) {
    return (
      <section className="driverWarningsPanel">
        <p className="driverWarningsLoading">
          Warnings load ho rahi hain...
        </p>
      </section>
    );
  }

  if (warnings.length === 0) {
    return (
      <section className="driverWarningsPanel clear">
        <div className="driverWarningsClearIcon">
          ✓
        </div>

        <div>
          <span>ACCOUNT STATUS</span>
          <h2>Koi warning nahi hai</h2>

          <p>
            HimRideG ke rules aur Terms & Conditions
            follow karte raho.
          </p>
        </div>

        <button
          type="button"
          className="driverWarningsRefreshButton"
          disabled={refreshing}
          onClick={() => loadWarnings(true)}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </section>
    );
  }

  return (
    <section className="driverWarningsSection">
      {successMessage && (
        <div
          className="driverWarningsSuccess"
          role="status"
        >
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          className="driverWarningsError"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <div className="driverWarningsHeader">
        <div>
          <span>ADMIN WARNINGS</span>
          <h2>Warnings & Messages</h2>

          <p>
            Admin ke messages dhyan se padhein,
            acknowledge karein aur zaroorat par reply dein.
          </p>
        </div>

        <div className="driverWarningsHeaderActions">
          <div className="driverWarningsCount">
            <small>Pending</small>
            <strong>{pendingWarnings.length}</strong>
          </div>

          <button
            type="button"
            className="driverWarningsRefreshButton"
            disabled={refreshing || Boolean(busyWarningId)}
            onClick={() => loadWarnings(true)}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="driverWarningsList">
        {warnings.map((warning) => {
          const level = getWarningLevel(warning);

          const isBusy =
            busyWarningId === warning._id;

          const isReplyOpen =
            replyWarningId === warning._id;

          return (
            <article
              key={warning._id}
              className={`driverWarningCard ${level} ${
                warning.acknowledged
                  ? "acknowledged"
                  : "pending"
              }`}
            >
              <div className="driverWarningCardTop">
                <div className="driverWarningLevel">
                  <span>{getLevelLabel(level)}</span>

                  <strong>
                    {warning.acknowledged
                      ? "Acknowledged"
                      : "Action Required"}
                  </strong>
                </div>

                <time>
                  {formatDate(warning.createdAt)}
                </time>
              </div>

              <div className="driverWarningMessage">
                <h3>⚠ Admin Warning</h3>
                <p>
                  {warning.message ||
                    "Warning message available nahi hai."}
                </p>
              </div>

              {warning.reason && (
                <div className="driverWarningReason">
                  <small>Reason</small>
                  <p>{warning.reason}</p>
                </div>
              )}

              {warning.acknowledgedAt && (
                <div className="driverWarningAcknowledged">
                  Acknowledged on{" "}
                  {formatDate(warning.acknowledgedAt)}
                </div>
              )}

              {warning.driverReply && (
                <div className="driverWarningExistingReply">
                  <small>Your reply</small>
                  <p>{warning.driverReply}</p>

                  {warning.repliedAt && (
                    <span>
                      Sent on{" "}
                      {formatDate(warning.repliedAt)}
                    </span>
                  )}
                </div>
              )}

              {isReplyOpen && (
                <div className="driverWarningReplyBox">
                  <label
                    htmlFor={`warning-reply-${warning._id}`}
                  >
                    Reply to Admin
                  </label>

                  <textarea
                    id={`warning-reply-${warning._id}`}
                    value={replyText}
                    maxLength={500}
                    disabled={isBusy}
                    placeholder="Admin ko apna jawab likho..."
                    onChange={(event) => {
                      setReplyText(event.target.value);
                      setErrorMessage("");
                    }}
                  />

                  <div className="driverWarningReplyCounter">
                    {replyText.length}/500
                  </div>

                  <div className="driverWarningReplyActions">
                    <button
                      type="button"
                      className="cancel"
                      disabled={isBusy}
                      onClick={closeReplyBox}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="send"
                      disabled={
                        isBusy || !replyText.trim()
                      }
                      onClick={() =>
                        sendReply(warning._id)
                      }
                    >
                      {isBusy
                        ? "Sending..."
                        : "Send Reply"}
                    </button>
                  </div>
                </div>
              )}

              <div className="driverWarningActions">
                {!warning.acknowledged && (
                  <button
                    type="button"
                    className="understand"
                    disabled={isBusy}
                    onClick={() =>
                      acknowledgeWarning(warning._id)
                    }
                  >
                    {isBusy
                      ? "Please wait..."
                      : "I Understand"}
                  </button>
                )}

                {!isReplyOpen && (
                  <button
                    type="button"
                    className="reply"
                    disabled={isBusy}
                    onClick={() =>
                      openReplyBox(warning)
                    }
                  >
                    {warning.driverReply
                      ? "Edit Reply"
                      : "Reply to Admin"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default DriverWarnings;