import React from "react";
import api from "../api";

function DriverPayoutSettingsPanel({ walletData, loading, onReload, onClose }) {
  const methods = Array.isArray(walletData?.payoutMethods) ? walletData.payoutMethods : [];
  const primary = methods.find((item) => item?.isPrimary) || null;
  const [mode, setMode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState("");
  const [message, setMessage] = React.useState({ text: "", type: "" });
  const [upiId, setUpiId] = React.useState("");
  const [accountHolderName, setAccountHolderName] = React.useState("");
  const [bankName, setBankName] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = React.useState("");
  const [ifsc, setIfsc] = React.useState("");

  const resetForm = () => {
    setMode("");
    setUpiId("");
    setAccountHolderName("");
    setBankName("");
    setAccountNumber("");
    setConfirmAccountNumber("");
    setIfsc("");
  };

  const openUpiApp = (scheme) => {
    try {
      window.location.href = scheme;
    } catch (_) {
      setMessage({ text: "UPI app open nahi hui. UPI ID manually paste karein.", type: "error" });
    }
  };

  const saveUpi = async () => {
    const clean = String(upiId || "").trim().toLowerCase();
    if (!/^[A-Za-z0-9._-]{2,256}@[A-Za-z]{2,64}$/.test(clean)) {
      setMessage({ text: "Valid UPI ID enter karein, jaise name@upi.", type: "error" });
      return;
    }
    setBusy(true);
    setMessage({ text: "", type: "" });
    try {
      const { data } = await api.post("/driver/wallet/payout-methods", { type: "upi", upiId: clean });
      setMessage({ text: data?.message || "UPI receiving method save ho gaya.", type: "success" });
      resetForm();
      await onReload?.();
    } catch (error) {
      setMessage({ text: error?.response?.data?.message || "UPI save nahi hui.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const saveBank = async () => {
    const cleanAccount = String(accountNumber || "").replace(/\s+/g, "");
    const cleanConfirm = String(confirmAccountNumber || "").replace(/\s+/g, "");
    const cleanIfsc = String(ifsc || "").trim().toUpperCase();
    if (!String(accountHolderName || "").trim()) {
      setMessage({ text: "Account holder name required hai.", type: "error" });
      return;
    }
    if (!String(bankName || "").trim()) {
      setMessage({ text: "Bank name required hai.", type: "error" });
      return;
    }
    if (!/^\d{6,20}$/.test(cleanAccount) || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
      setMessage({ text: "Valid account number aur IFSC enter karein.", type: "error" });
      return;
    }
    if (cleanAccount !== cleanConfirm) {
      setMessage({ text: "Account number aur confirm account number match nahi karte.", type: "error" });
      return;
    }
    setBusy(true);
    setMessage({ text: "", type: "" });
    try {
      const { data } = await api.post("/driver/wallet/payout-methods", {
        type: "bank",
        accountHolderName: String(accountHolderName).trim(),
        bankName: String(bankName).trim(),
        accountNumber: cleanAccount,
        ifsc: cleanIfsc
      });
      setMessage({ text: data?.message || "Bank account save ho gaya.", type: "success" });
      resetForm();
      await onReload?.();
    } catch (error) {
      setMessage({ text: error?.response?.data?.message || "Bank account save nahi hua.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const setPrimary = async (method) => {
    const id = method?.id || method?._id;
    if (!id) return;
    setBusy(true);
    setMessage({ text: "", type: "" });
    try {
      const { data } = await api.patch(`/driver/wallet/payout-methods/${id}/primary`, {});
      setMessage({ text: data?.message || "Primary receiving account update ho gaya.", type: "success" });
      setSelectedId("");
      await onReload?.();
    } catch (error) {
      setMessage({ text: error?.response?.data?.message || "Primary account change nahi hua.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const removeMethod = async (method) => {
    const id = method?.id || method?._id;
    if (!id || !window.confirm("Is payout method ko remove karna hai?")) return;
    setBusy(true);
    setMessage({ text: "", type: "" });
    try {
      const { data } = await api.delete(`/driver/wallet/payout-methods/${id}`);
      setMessage({ text: data?.message || "Payment method remove ho gaya.", type: "success" });
      setSelectedId("");
      await onReload?.();
    } catch (error) {
      setMessage({ text: error?.response?.data?.message || "Payment method remove nahi hua.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="driverPayoutSettingsPanel" role="dialog" aria-modal="true" aria-label="UPI and Payment Settings">
      <header className="driverPayoutSettingsHeader">
        <div>
          <small>DRIVER ACCOUNT</small>
          <h2>UPI & Payment Settings</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close payment settings">×</button>
      </header>

      <div className="driverPayoutSettingsScroll">
        <article className="driverPrimaryReceivingCard">
          <small>RECEIVING MONEY</small>
          <h3>Primary Payout Account</h3>
          <p>
            Online ride payment verify hone ke baad HimRideG platform fee deduct hoti hai. RazorpayX live access available ho to payout selected Primary account par process hoga.
          </p>
          <div className="driverPrimaryReceivingBox">
            <span>{primary?.type === "bank" ? "▣" : "₹"}</span>
            <div>
              <strong>{primary ? (primary.type === "bank" ? primary.bankName || "Bank Account" : "UPI Account") : "No primary account"}</strong>
              <small>{primary ? (primary.type === "bank" ? `${primary.maskedAccount || "Account"} • ${primary.ifsc || "IFSC"}` : primary.upiId) : "Add UPI or bank account below"}</small>
            </div>
            {primary ? <b>PRIMARY</b> : null}
          </div>
        </article>

        <h3 className="driverPayoutSectionTitle">Add payment method</h3>
        <div className="driverPayoutAddRow">
          <button type="button" onClick={() => setMode(mode === "bank" ? "" : "bank")}>＋ <span>Add Bank Account</span></button>
          <button type="button" onClick={() => setMode(mode === "upi" ? "" : "upi")}>＋ <span>Add UPI</span></button>
        </div>

        {mode === "upi" && (
          <div className="driverPayoutFormCard">
            <h3>Add UPI ID</h3>
            <p>Apni UPI app kholo, UPI ID copy karo, phir yahan paste karo. HimRideG doosri app se UPI ID silently read nahi karta.</p>
            <div className="driverUpiAppChips">
              <button type="button" onClick={() => openUpiApp("tez://")}>Google Pay</button>
              <button type="button" onClick={() => openUpiApp("phonepe://")}>PhonePe</button>
              <button type="button" onClick={() => openUpiApp("paytmmp://")}>Paytm</button>
              <button type="button" onClick={() => openUpiApp("bhim://")}>BHIM</button>
            </div>
            <label>UPI ID<input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@upi" autoCapitalize="none" /></label>
            <button type="button" className="driverPayoutPrimaryAction" disabled={busy} onClick={saveUpi}>{busy ? "Saving..." : "Save UPI"}</button>
          </div>
        )}

        {mode === "bank" && (
          <div className="driverPayoutFormCard">
            <h3>Add Bank Account</h3>
            <label>Account Holder Name<input value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} placeholder="Name as per bank" /></label>
            <label>Bank Name<input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank name" /></label>
            <label>Account Number<input inputMode="numeric" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))} placeholder="Account number" /></label>
            <label>Confirm Account Number<input inputMode="numeric" value={confirmAccountNumber} onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ""))} placeholder="Re-enter account number" /></label>
            <label>IFSC<input value={ifsc} maxLength={11} onChange={(e) => setIfsc(e.target.value.toUpperCase())} placeholder="ABCD0123456" /></label>
            <button type="button" className="driverPayoutPrimaryAction" disabled={busy} onClick={saveBank}>{busy ? "Saving..." : "Save Bank Account"}</button>
          </div>
        )}

        {message.text ? <p className={`driverPayoutMessage ${message.type}`}>{message.text}</p> : null}

        <h3 className="driverPayoutSectionTitle">Payment Accounts</h3>
        <div className="driverPayoutMethodsList">
          {loading ? <p>Loading saved accounts…</p> : methods.length ? methods.map((method, index) => {
            const id = method?.id || method?._id || `${method?.type}-${index}`;
            const expanded = selectedId === id;
            return (
              <article key={id}>
                <button type="button" className="driverPayoutMethodRow" onClick={() => setSelectedId(expanded ? "" : id)}>
                  <span className="driverPayoutMethodIcon">{method?.type === "bank" ? "▣" : "₹"}</span>
                  <div>
                    <strong>{method?.type === "bank" ? method?.bankName || "Bank Account" : "UPI"}</strong>
                    <small>{method?.type === "bank" ? `${method?.maskedAccount || "Account"} • ${method?.ifsc || "IFSC"}` : method?.upiId}</small>
                  </div>
                  {method?.isPrimary ? <b>PRIMARY</b> : null}
                  <em>Manage</em>
                </button>
                {expanded ? (
                  <div className="driverPayoutManagePanel">
                    {!method?.isPrimary ? (
                      <button type="button" disabled={busy} onClick={() => setPrimary(method)}>Make Primary Receiving Account</button>
                    ) : (
                      <p>Future automatic payouts is Primary account par jayenge.</p>
                    )}
                    <button type="button" className="danger" disabled={busy} onClick={() => removeMethod(method)}>Delete / Remove</button>
                  </div>
                ) : null}
              </article>
            );
          }) : <p>Abhi koi UPI ya bank account saved nahi hai.</p>}
        </div>

        <p className="driverPayoutSafetyNote">Bank/UPI details payout ke liye use hongi. UPI PIN, OTP ya bank password HimRideG kabhi nahi maangta.</p>
      </div>
    </section>
  );
}

export default DriverPayoutSettingsPanel;
