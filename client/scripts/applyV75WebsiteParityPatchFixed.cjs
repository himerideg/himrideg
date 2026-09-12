const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(relative) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file)) {
    console.error("HimRideG V75 target missing:", relative);
    process.exit(1);
  }
  return { file, source: fs.readFileSync(file, "utf8") };
}

function write(file, source) {
  fs.writeFileSync(file, source, "utf8");
}

function replaceOnce(source, oldText, newText, label) {
  if (!source.includes(oldText)) {
    console.error(`HimRideG V75 anchor missing: ${label}`);
    process.exit(1);
  }
  return source.replace(oldText, newText);
}

/*
|=============================================================================
| V75 WEBSITE + MOBILE BROWSER PARITY — FIXED BUILD PATCH
|=============================================================================
| FULL CODE RULE: V72/V74 + existing ride/fare/OTP/map/payment code preserved.
| Runs after V72 + V74 and adds only requested V75 behavior.
|=============================================================================
*/

{
  const target = read("src/pages/DriverDashboard.jsx");
  let source = target.source;
  const marker = "V75_WEBSITE_PARITY_WIRED";

  if (!source.includes(marker)) {
    source = replaceOnce(
      source,
      'import DriverPayoutSettingsPanel from "../components/DriverPayoutSettingsPanel";\nimport ResponseTimeoutBadge from "../components/ResponseTimeoutBadge";',
      'import DriverPayoutSettingsPanel from "../components/DriverPayoutSettingsPanel";\nimport DriverHistoryHub from "../components/DriverHistoryHub";\nimport DriverEarningsPlatformPanel from "../components/DriverEarningsPlatformPanel";\nimport DriverPlatformFeePrompt from "../components/DriverPlatformFeePrompt";\nimport useDriverPlatformFee from "../hooks/useDriverPlatformFee";\nimport ResponseTimeoutBadge from "../components/ResponseTimeoutBadge";',
      "Driver V75 imports"
    );

    const stateAnchor = '  const [\n    historyFilter,\n    setHistoryFilter\n  ] = useState("all");\n';
    source = replaceOnce(
      source,
      stateAnchor,
      stateAnchor +
        '\n  /* V75_WEBSITE_PARITY_WIRED */\n' +
        '  const [v75EarningsOpen, setV75EarningsOpen] = useState(false);\n' +
        '  const [v75FeePromptOpen, setV75FeePromptOpen] = useState(false);\n' +
        '  const v75PlatformFee = useDriverPlatformFee();\n\n' +
        '  const openV75RideRequest = useCallback((rideId) => {\n' +
        '    if (Number(v75PlatformFee.due || 0) > 0) {\n' +
        '      setV75FeePromptOpen(true);\n' +
        '    }\n\n' +
        '    if (!v75PlatformFee.blocked) {\n' +
        '      setSelectedRideId(rideId);\n' +
        '    }\n' +
        '  }, [v75PlatformFee.due, v75PlatformFee.blocked]);\n',
      "Driver V75 state"
    );

    source = replaceOnce(
      source,
      '  const acceptRide =\n    async (ride) => {\n      if (!approved) {',
      '  const acceptRide =\n    async (ride) => {\n      const v75FreshPlatformFee =\n        (await v75PlatformFee.refreshPlatformFee().catch(() => null)) ||\n        v75PlatformFee;\n\n      if (v75FreshPlatformFee.blocked) {\n        setV75FeePromptOpen(true);\n        return;\n      }\n\n      if (!approved) {',
      "Driver accept platform fee gate"
    );

    source = replaceOnce(
      source,
      'onClick={() => setSelectedRideId(rideId)}',
      'onClick={() => openV75RideRequest(rideId)}',
      "Driver compact request tap gate"
    );

    source = replaceOnce(
      source,
      '                      setSelectedRideId(\n                        rideId\n                      );\n\n                      setActiveTab(\n                        "dashboard"\n                      );',
      '                      openV75RideRequest(rideId);\n\n                      if (v75PlatformFee.blocked) {\n                        return;\n                      }\n\n                      setActiveTab(\n                        "dashboard"\n                      );',
      "Driver rides-page request tap gate"
    );

    source = replaceOnce(
      source,
      '{getCustomerPhone(selectedRide) !== "Not available" && <a href={`tel:${getCustomerPhone(selectedRide)}`}>☎</a>}',
      '{getCustomerPhone(selectedRide) !== "Not available" && ["driver_arriving","driver_arrived","started","payment_pending"].includes(String(selectedRide.status || "").toLowerCase())\n                        ? <a href={`tel:${getCustomerPhone(selectedRide)}`}>☎</a>\n                        : <span className="v75ContactLocked">🔒 Contact</span>}',
      "Driver contact unlock gate"
    );

    source = replaceOnce(
      source,
      '        {activeTab === "dashboard" ? (',
      '        {activeTab === "history" ? (\n          <DriverHistoryHub\n            bookings={displayBookings}\n            walletData={walletData}\n            onBack={() => setActiveTab("dashboard")}\n          />\n        ) : activeTab === "dashboard" ? (',
      "Driver V75 history hub render"
    );

    source = source.split("setEarningsOpen(true)").join("setV75EarningsOpen(true)");

    source = replaceOnce(
      source,
      '      {payoutSettingsOpen && (',
      '      {v75EarningsOpen && (\n        <DriverEarningsPlatformPanel\n          walletData={walletData}\n          loading={walletLoading}\n          onReload={loadWallet}\n          onClose={() => setV75EarningsOpen(false)}\n          onOpenPaymentSettings={() => {\n            setV75EarningsOpen(false);\n            setPayoutSettingsOpen(true);\n          }}\n        />\n      )}\n\n      <DriverPlatformFeePrompt\n        visible={v75FeePromptOpen}\n        status={v75PlatformFee}\n        onClose={() => setV75FeePromptOpen(false)}\n        onPaid={async () => {\n          await v75PlatformFee.refreshPlatformFee();\n          await loadWallet?.();\n          setV75FeePromptOpen(false);\n        }}\n      />\n\n      {payoutSettingsOpen && (',
      "Driver V75 overlays"
    );

    write(target.file, source);
    console.log("HimRideG V75 wired: src/pages/DriverDashboard.jsx");
  } else {
    console.log("HimRideG V75 already wired: src/pages/DriverDashboard.jsx");
  }
}

{
  const target = read("src/pages/CustomerDashboard.jsx");
  let source = target.source;
  const marker = "V75_CUSTOMER_CONTACT_GATE";

  if (!source.includes(marker)) {
    source = replaceOnce(
      source,
      'function initials(name = "Customer") {',
      '/* V75_CUSTOMER_CONTACT_GATE */\nconst canUseV75RideContact = (ride) =>\n  ["driver_arriving", "driver_arrived", "arrived", "started", "payment_pending"].includes(\n    String(ride?.status || "").trim().toLowerCase()\n  );\n\nfunction initials(name = "Customer") {',
      "Customer contact helper"
    );

    source = source.split('disabled={!driverPhone}').join('disabled={!driverPhone || !canUseV75RideContact(activeRide)}');
    source = source.replace(
      'if (driverPhone) window.location.href = `tel:${driverPhone}`;',
      'if (driverPhone && canUseV75RideContact(activeRide)) window.location.href = `tel:${driverPhone}`;'
    );
    source = source.replace(
      'if (!driverPhone) return;',
      'if (!driverPhone || !canUseV75RideContact(activeRide)) return;'
    );

    write(target.file, source);
    console.log("HimRideG V75 wired: src/pages/CustomerDashboard.jsx");
  } else {
    console.log("HimRideG V75 already wired: src/pages/CustomerDashboard.jsx");
  }
}

{
  const target = read("src/components/paymentmodal.jsx");
  let source = target.source;
  const marker = "V75_DIRECT_DRIVER_UPI_WEB";

  if (!source.includes(marker)) {
    source = replaceOnce(
      source,
      'import api from "../api";\nimport { playHimRideGEventSound } from "../utils/himridegSounds";',
      'import api from "../api";\nimport DirectDriverUpiPayment from "./DirectDriverUpiPayment";\nimport { playHimRideGEventSound } from "../utils/himridegSounds";',
      "Payment direct UPI import"
    );

    source = replaceOnce(
      source,
      '  const cashSelected = cashSelectedOf(ride);\n  const remaining = remainingDueOf(ride);',
      '  const cashSelected = cashSelectedOf(ride);\n  /* V75_DIRECT_DRIVER_UPI_WEB */\n  const directDriverUpiPending = Boolean(\n    String(ride?.payment?.gateway || "").toLowerCase() === "driver_upi" ||\n    String(ride?.payment?.transactionId || "").startsWith("DIRECT_UPI")\n  );\n  const remaining = remainingDueOf(ride);',
      "Payment direct UPI state"
    );

    source = replaceOnce(
      source,
      '          ) : cashSelected ? (\n            <div className="v60CashSelectedFlow">',
      '          ) : directDriverUpiPending ? (\n            <div className="v60CashSelectedFlow">\n              <div className="v60PaymentState waiting">\n                UPI payment sent · Driver verification pending\n              </div>\n              <small className="v60PaymentIndependentNote">\n                Driver apne UPI/bank account me amount check karke Payment Received confirm karega. Uske baad hi ride payment final hogi.\n              </small>\n            </div>\n          ) : cashSelected ? (\n            <div className="v60CashSelectedFlow">',
      "Payment direct UPI waiting state"
    );

    source = replaceOnce(
      source,
      '              <button\n                type="button"\n                className="v60PaymentAction secondary"\n                disabled={Boolean(busy) || remaining <= 0}\n                onClick={selectCash}\n              >',
      '              <DirectDriverUpiPayment\n                booking={ride}\n                onClaim={(patch) => {\n                  const merged = mergeBooking(patch);\n                  onSuccess?.({\n                    booking: merged,\n                    paymentContext: "post_ride",\n                    method: "driver-upi-claimed",\n                    requiresDriverConfirmation: true\n                  });\n                }}\n              />\n\n              <button\n                type="button"\n                className="v60PaymentAction secondary"\n                disabled={Boolean(busy) || remaining <= 0}\n                onClick={selectCash}\n              >',
      "Payment direct UPI action"
    );

    write(target.file, source);
    console.log("HimRideG V75 wired: src/components/paymentmodal.jsx");
  } else {
    console.log("HimRideG V75 already wired: src/components/paymentmodal.jsx");
  }
}

{
  const target = read("src/components/DriverPaymentModal.jsx");
  let source = target.source;
  const marker = "V75_DRIVER_DIRECT_UPI_CONFIRM";

  if (!source.includes(marker)) {
    source = replaceOnce(
      source,
      '  const cashSelected = cashSelectedOf(ride);\n  const advanceStatus = String(ride?.advanceStatus || "none").toLowerCase();',
      '  const cashSelected = cashSelectedOf(ride);\n  /* V75_DRIVER_DIRECT_UPI_CONFIRM */\n  const directDriverUpi = Boolean(\n    String(ride?.payment?.gateway || "").toLowerCase() === "driver_upi" ||\n    String(ride?.payment?.transactionId || "").startsWith("DIRECT_UPI")\n  );\n  const advanceStatus = String(ride?.advanceStatus || "none").toLowerCase();',
      "Driver direct UPI state"
    );

    source = replaceOnce(
      source,
      '      const { data } = await api.post("/payments/cash-confirm", { bookingId });',
      '      const { data } = directDriverUpi\n        ? await api.post(`/payments/${bookingId}/direct-driver/confirm`, {})\n        : await api.post("/payments/cash-confirm", { bookingId });',
      "Driver direct UPI confirm endpoint"
    );

    source = source
      .split('{busy === "cash" ? "Confirming…" : `Cash Received ${money(due)}`}')
      .join('{busy === "cash" ? "Confirming…" : directDriverUpi ? `UPI Payment Received ${money(due)}` : `Cash Received ${money(due)}`}');

    source = source.replace(
      '            Cash physically milne ke baad hi confirm karein. Customer response required nahi hai.',
      '            {directDriverUpi\n              ? "Apne UPI/bank account me amount aane ke baad hi confirm karein. Customer ka I Paid tap akela payment final nahi karta."\n              : "Cash physically milne ke baad hi confirm karein. Customer response required nahi hai."}'
    );

    write(target.file, source);
    console.log("HimRideG V75 wired: src/components/DriverPaymentModal.jsx");
  } else {
    console.log("HimRideG V75 already wired: src/components/DriverPaymentModal.jsx");
  }
}

{
  const target = read("src/DriverRideMap.jsx");
  let source = target.source;
  const marker = "V75_ALWAYS_INCLUDE_DESTINATION_IN_BOUNDS";

  if (!source.includes(marker)) {
    source = replaceOnce(
      source,
      '    const points =\n      routePoints.length > 1\n        ? routePoints\n        : [\n            pickupPosition,\n            dropPosition,\n            driverPosition,\n          ].filter(Boolean);',
      '    /* V75_ALWAYS_INCLUDE_DESTINATION_IN_BOUNDS */\n    const points = [\n      ...routePoints,\n      pickupPosition,\n      dropPosition,\n      driverPosition,\n    ].filter(Boolean);',
      "Driver map destination bounds"
    );

    write(target.file, source);
    console.log("HimRideG V75 wired: src/DriverRideMap.jsx");
  } else {
    console.log("HimRideG V75 already wired: src/DriverRideMap.jsx");
  }
}

console.log("HimRideG V75 website/mobile-browser parity patch complete");
