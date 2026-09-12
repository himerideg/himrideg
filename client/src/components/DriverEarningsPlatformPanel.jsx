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
          <div><small>ड्राइवर कमाई</small><h2>कमाई और प्लेटफॉर्म फीस</h2></div>
          <button type="button" className="v75PanelClose" onClick={onClose}>×</button>
        </header>

        <div className={`v75FeeHero ${fee.blocked ? "blocked" : ""}`}>
          <div className="v75FeeHeroTop">
            <div><div className="v75Kicker">प्लेटफॉर्म फीस बकाया</div><strong>₹{money(due)}</strong></div>
            <span className="v75RulePill">{fee.blocked ? "राइड स्वीकार बंद" : due > 0 ? "राइड जारी" : "फीस क्लियर ✓"}</span>
          </div>
          <p className="v75FeeHindiMessage">
            {fee.blocked
              ? "नई राइड रिक्वेस्ट आपको दिखाई देंगी, लेकिन नई राइड स्वीकार करने के लिए बकाया प्लेटफॉर्म फीस ₹100 से कम करनी होगी।"
              : due > 0
                ? "जब तक बकाया प्लेटफॉर्म फीस ₹100 से कम है, आप नई राइड स्वीकार करते रहेंगे। बिना रुकावट राइड लेने के लिए समय पर HimRideG प्लेटफॉर्म फीस जमा करें।"
                : "आपकी प्लेटफॉर्म फीस पूरी तरह साफ है। नई राइड स्वीकार करने पर कोई रोक नहीं है।"}
          </p>
          {due > 0 ? <button type="button" className="v75PrimaryButton" onClick={() => setFeePromptOpen(true)}>प्लेटफॉर्म फीस ₹{money(due)} जमा करें</button> : null}
        </div>

        <div className="v75CleanStats">
          <div className="v75CleanStat"><small>कुल कमाई</small><strong>₹{money(totalEarned)}</strong></div>
          <div className="v75CleanStat"><small>जमा प्लेटफॉर्म फीस</small><strong style={{color:"#22c55e"}}>₹{money(paid)}</strong></div>
        </div>

        <div className="v75PayoutAccount">
          <div>
            <small>पैसे प्राप्त करने का मुख्य खाता</small>
            <strong>{primary ? (primary.type === "bank" ? primary.bankName || "मुख्य बैंक खाता" : "मुख्य UPI") : "कोई खाता चुना नहीं"}</strong>
            <span>{primary ? (primary.type === "bank" ? `${primary.maskedAccount || "खाता"} • ${primary.ifsc || "IFSC"}` : primary.maskedUpi || primary.upiId || "सेव UPI") : "App/Website के UPI और बैंक सेटिंग्स से खाता जोड़ें"}</span>
          </div>
          <button type="button" className="v75ManageLink" onClick={onOpenPaymentSettings}>{primary ? "मैनेज करें" : "जोड़ें"}</button>
        </div>

        <button type="button" className="v75SecondaryButton" onClick={onOpenPaymentSettings}>UPI और बैंक सेटिंग्स</button>

        <div className="v75Future">
          Customer का Direct UPI/Cash किराया Driver को मिलेगा और HimRideG केवल 10% प्लेटफॉर्म फीस ट्रैक करेगा। RazorpayX चालू होने के बाद Automatic Payout इसी चुने हुए मुख्य खाते पर जाएगा। {loading ? "अपडेट हो रहा है…" : ""}
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
