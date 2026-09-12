const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function patch(relativePath, transforms) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) {
    console.error(`[V78 5%] Missing ${relativePath}`);
    process.exit(1);
  }

  let source = fs.readFileSync(file, "utf8");
  let changed = false;

  for (const { from, to, label, optional = false, all = false } of transforms) {
    if (source.includes(to) && !source.includes(from)) continue;
    if (!source.includes(from)) {
      if (optional) continue;
      console.error(`[V78 5%] Anchor missing ${relativePath}: ${label}`);
      process.exit(1);
    }
    source = all ? source.split(from).join(to) : source.replace(from, to);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, source, "utf8");
    console.log(`[V78 5%] Updated ${relativePath}`);
  } else {
    console.log(`[V78 5%] Already correct ${relativePath}`);
  }
}

patch("src/hooks/useDriverPlatformFee.js", [
  {
    label: "default commission percent",
    from: "    totalCommissionPaid: 0,\n    testMode: false",
    to: "    totalCommissionPaid: 0,\n    commissionPercent: 5,\n    driverSharePercent: 95,\n    testMode: false"
  },
  {
    label: "hydrated commission percent",
    from: "        totalCommissionPaid: Math.max(0, Number(data?.totalCommissionPaid || 0)),\n        testMode,",
    to: "        totalCommissionPaid: Math.max(0, Number(data?.totalCommissionPaid || 0)),\n        commissionPercent: Math.max(0, Number(data?.commissionPercent ?? 5)),\n        driverSharePercent: Math.max(0, Number(data?.driverSharePercent ?? 95)),\n        testMode,"
  }
]);

patch("src/components/DriverEarningsPlatformPanel.jsx", [
  {
    label: "driver direct payment commission description",
    from: "Customer का Direct UPI/Cash किराया Driver को मिलेगा और HimRideG केवल 10% प्लेटफॉर्म फीस ट्रैक करेगा। RazorpayX चालू होने के बाद अपने आप भुगतान इसी चुने हुए मुख्य खाते पर जाएगा। {loading ? \"अपडेट हो रहा है…\" : \"\"}",
    to: "Customer का Direct UPI/Cash किराया Driver को मिलेगा और HimRideG केवल {money(fee.commissionPercent || 5)}% प्लेटफॉर्म फीस ट्रैक करेगा। Driver का हिस्सा {money(fee.driverSharePercent || 95)}% रहेगा। RazorpayX चालू होने के बाद अपने आप भुगतान इसी चुने हुए मुख्य खाते पर जाएगा। {loading ? \"अपडेट हो रहा है…\" : \"\"}"
  }
]);

patch("src/components/DriverHistoryHub.jsx", [
  {
    label: "history commission helper",
    from: "const feeOf = (ride) => Number(ride?.platformCommissionAmount ?? (fareOf(ride) * 0.1)) || 0;",
    to: "const commissionPercentOf = (ride) => Number(ride?.platformCommissionPercent ?? ride?.fare?.commissionPercent ?? 5) || 5;\nconst feeOf = (ride) => Number(ride?.platformCommissionAmount ?? (fareOf(ride) * commissionPercentOf(ride) / 100)) || 0;"
  },
  {
    label: "history platform fee label",
    from: "<div><small>Platform Fee (10%)</small><strong>₹{money(feeOf(ride))}</strong></div>",
    to: "<div><small>Platform Fee ({money(commissionPercentOf(ride))}%)</small><strong>₹{money(feeOf(ride))}</strong></div>"
  }
]);

patch("src/components/DriverPlatformFeePrompt.jsx", [
  {
    label: "platform fee kicker rate",
    from: "<div className=\"v75Kicker\">HIMRIDEG प्लेटफॉर्म फीस</div>",
    to: "<div className=\"v75Kicker\">HIMRIDEG प्लेटफॉर्म फीस • {money(status?.commissionPercent || 5)}%</div>"
  }
]);

console.log("HimRideG V78 website/mobile-browser 5% Platform Fee parity applied");
