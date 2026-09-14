import React, { useEffect, useMemo, useState } from "react";
import DriverPlatformFeePrompt from "./DriverPlatformFeePrompt";
import useDriverPlatformFee from "../hooks/useDriverPlatformFee";
import "../driver-v75-parity.css";
import "../driver-platform-fee-readable.css";

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
          <div><small>Driver Earnings</small><h2>Earnings &amp; Platform Fee</h2></div>
          <button type="button" className="v75PanelClose" onClick={onClose}>×</button>
        </header>

        <div className={`v75FeeHero ${fee.blocked ? "blocked" : ""} ${fee.testMode ? "testMode" : ""}`}>
          <div className="v75FeeHeroTop">
            <div><div className="v75Kicker">Outstanding Platform Fee</div><strong>₹{money(due)}</strong></div>
            <span className="v75RulePill">
              {fee.testMode
                ? "Test Mode On"
                : fee.blocked
                  ? "New Rides Blocked"
                  : due > 0
                    ? "Rides Active"
                    : "Fee Clear ✓"}
            </span>
          </div>

          <p className="v75FeeHindiMessage">
            {fee.testMode
              ? "Test mode is active. Platform fee blocking will not apply when accepting new rides. Once testing is complete, ask the admin to disable Test Mode."
              : fee.blocked
                ? "Pay your outstanding platform fee before accepting a new ride. New rides are blocked when the outstanding fee reaches ₹100 or more."
                : due > 0
                  ? "Your outstanding platform fee is below ₹100, so you can continue accepting new rides. Pay it on time to avoid interruptions."
                  : "Your platform fee is fully cleared. You can accept new rides."}
          </p>

          {due > 0 && !fee.testMode ? (
            <button type="button" className="v75PrimaryButton v75PrimaryButtonLarge" onClick={() => setFeePromptOpen(true)}>
              Pay Platform Fee ₹{money(due)}
            </button>
          ) : null}

          {fee.testMode ? (
            <div className="v76TestModeNotice">
              This is a test account. Platform fee blocking is currently disabled.
            </div>
          ) : null}
        </div>

        <div className="v75CleanStats">
          <div className="v75CleanStat"><small>Total Earned</small><strong>₹{money(totalEarned)}</strong></div>
          <div className="v75CleanStat"><small>Platform Fee Paid</small><strong style={{color:"#22c55e"}}>₹{money(paid)}</strong></div>
        </div>

        <div className="v75PayoutAccount">
          <div>
            <small>Primary Receiving Account</small>
            <strong>{primary ? (primary.type === "bank" ? primary.bankName || "Primary Bank Account" : "Primary UPI") : "No account selected"}</strong>
            <span>{primary ? (primary.type === "bank" ? `${primary.maskedAccount || "Account"} • ${primary.ifsc || "IFSC"}` : primary.maskedUpi || primary.upiId || "Saved UPI") : "Add an account from the App/Website UPI & Bank Settings"}</span>
          </div>
          <button type="button" className="v75ManageLink" onClick={onOpenPaymentSettings}>{primary ? "Manage" : "Add"}</button>
        </div>

        <button type="button" className="v75SecondaryButton" onClick={onOpenPaymentSettings}>UPI & Bank Settings</button>

        <div className="v75Future">
          The driver receives the customer's fare directly through UPI or cash, while HimRideG tracks only the 10% platform fee. Once RazorpayX is enabled, automatic payouts will be sent to this selected primary account. {loading ? "Updating…" : ""}
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
