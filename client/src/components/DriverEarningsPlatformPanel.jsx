import React, { useEffect, useMemo, useState } from "react";
import DriverPlatformFeePrompt from "./DriverPlatformFeePrompt";
import useDriverPlatformFee from "../hooks/useDriverPlatformFee";
import "../driver-v75-parity.css";

const money = (value) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(value) || 0);

export default function DriverEarningsPlatformPanel({
  walletData,
  loading,
  onReload,
  onClose,
  onOpenPaymentSettings
}) {
  const fee = useDriverPlatformFee();
  const [feePromptOpen, setFeePromptOpen] = useState(false);

  useEffect(() => {
    onReload?.();
    fee.refreshPlatformFee().catch(() => {});
  }, []); // intentional one-time overlay hydration

  const wallet = walletData?.wallet || walletData || {};
  const methods = Array.isArray(walletData?.payoutMethods) ? walletData.payoutMethods : [];
  const primary = useMemo(() => methods.find((item) => item?.isPrimary) || methods[0] || null, [methods]);
  const due = Math.max(Number(fee?.due || 0), Number(wallet?.commissionDue || 0), Number(wallet?.cashCommissionDue || 0), 0);
  const paid = Math.max(Number(fee?.totalCommissionPaid || 0), Number(wallet?.totalCommissionPaid || 0), 0);
  const totalEarned = Math.max(0, Number(wallet?.totalEarned || 0));

  return (
    <div className="v75EarningsPanel" role="dialog" aria-modal="true" aria-label="Driver earnings and platform fee">
      <section className="v75EarningsCard">
        <header className="v75PanelHead">
          <div><small>DRIVER EARNINGS</small><h2>Earnings & Platform Fee</h2></div>
          <button type="button" className="v75PanelClose" onClick={onClose}>×</button>
        </header>

        <div className={`v75FeeHero ${fee.blocked ? "blocked" : ""}`}>
          <div className="v75FeeHeroTop">
            <div><div className="v75Kicker">PLATFORM FEE DUE</div><strong>₹{money(due)}</strong></div>
            <span className="v75RulePill">{fee.blocked ? "RIDE ACCEPT LOCK" : due > 0 ? "RIDES ACTIVE" : "CLEAR ✓"}</span>
          </div>
          <p style={{color:"#9eabb9",fontSize:12,lineHeight:1.6}}>
            {fee.blocked
              ? "Ride requests dikhenगी, lekin नई ride Accept करने के लिए fee ₹100 से नीचे करनी होगी।"
              : due > 0
                ? "₹100 से कम due रहने तक rides Accept होती रहेंगी. समय पर HimRideG platform fee जमा करें।"
                : "Platform fee clear hai. Rides accept करने पर कोई fee lock नहीं है।"}
          </p>
          {due > 0 ? <button type="button" className="v75PrimaryButton" onClick={() => setFeePromptOpen(true)}>Pay Platform Fee ₹{money(due)}</button> : null}
        </div>

        <div className="v75CleanStats">
          <div className="v75CleanStat"><small>Total Earnings</small><strong>₹{money(totalEarned)}</strong></div>
          <div className="v75CleanStat"><small>Platform Fee Paid</small><strong style={{color:"#22c55e"}}>₹{money(paid)}</strong></div>
        </div>

        <div className="v75PayoutAccount">
          <div>
            <small>RECEIVING MONEY / PRIMARY ACCOUNT</small>
            <strong>{primary ? (primary.type === "bank" ? primary.bankName || "Primary Bank" : "Primary UPI") : "Not selected"}</strong>
            <span>{primary ? (primary.type === "bank" ? `${primary.maskedAccount || "Account"} • ${primary.ifsc || "IFSC"}` : primary.maskedUpi || primary.upiId || "Saved UPI") : "App/website ke UPI & Payment Settings se add karein"}</span>
          </div>
          <button type="button" className="v75ManageLink" onClick={onOpenPaymentSettings}>{primary ? "Manage" : "Add"}</button>
        </div>

        <button type="button" className="v75SecondaryButton" onClick={onOpenPaymentSettings}>UPI & Payment Settings</button>

        <div className="v75Future">
          Customer ka direct UPI/Cash fare driver ko milega; HimRideG sirf 10% platform fee track karega. RazorpayX approve hone ke baad automatic payout isi saved Primary account ke saath enable hoga. {loading ? "Refreshing…" : ""}
        </div>
      </section>

      <DriverPlatformFeePrompt
        visible={feePromptOpen}
        status={{ ...fee, due }}
        onClose={() => setFeePromptOpen(false)}
        onPaid={async () => {
          await fee.refreshPlatformFee();
          await onReload?.();
          setFeePromptOpen(false);
        }}
      />
    </div>
  );
}
