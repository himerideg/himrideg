require("dotenv").config();

const yes = (value) =>
  ["1", "true", "yes", "on"].includes(
    String(value || "").trim().toLowerCase()
  );

const text = (value) => String(value || "").trim();

const checks = [];
const add = (name, ok, level, help) => {
  checks.push({ name, ok: Boolean(ok), level, help });
};

const razorpayKey = text(process.env.RAZORPAY_KEY_ID);
const razorpayXKey = text(process.env.RAZORPAYX_KEY_ID) || razorpayKey;
const clientUrls = text(process.env.CLIENT_URL)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

add("MongoDB URI", process.env.MONGODB_URI, "required", "MONGODB_URI set karo");
add("JWT access secret", process.env.JWT_ACCESS_SECRET, "required", "JWT_ACCESS_SECRET set karo");
add("JWT refresh secret", process.env.JWT_REFRESH_SECRET, "required", "JWT_REFRESH_SECRET set karo");
add("Google Client ID", process.env.GOOGLE_CLIENT_ID, "required", "GOOGLE_CLIENT_ID set karo");
add("Production client origin", clientUrls.some((url) => /https:\/\/(?:www\.)?himrideg\.com$/i.test(url)), "required", "CLIENT_URL me himrideg.com/www.himrideg.com rakho");
add("Real money mode", yes(process.env.REAL_MONEY_MODE), "required", "REAL_MONEY_MODE=true karo");
add("Razorpay live key", razorpayKey.startsWith("rzp_live_"), "required", "RAZORPAY_KEY_ID me live key use karo");
add("Razorpay key secret", process.env.RAZORPAY_KEY_SECRET, "required", "RAZORPAY_KEY_SECRET set karo");
add("Payment webhook secret", process.env.RAZORPAY_WEBHOOK_SECRET, "required", "RAZORPAY_WEBHOOK_SECRET set karo");
add("RazorpayX payouts enabled", yes(process.env.RAZORPAYX_PAYOUTS_ENABLED), "required", "RAZORPAYX_PAYOUTS_ENABLED=true karo");
add("RazorpayX live key/fallback", razorpayXKey.startsWith("rzp_live_"), "required", "RAZORPAYX_KEY_ID live rakho ya live merchant key fallback use karo");
add("RazorpayX key secret/fallback", process.env.RAZORPAYX_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET, "required", "RAZORPAYX_KEY_SECRET ya merchant secret available hona chahiye");
add("RazorpayX account number", process.env.RAZORPAYX_ACCOUNT_NUMBER, "required", "RAZORPAYX_ACCOUNT_NUMBER set karo");
add("Payout webhook secret", process.env.RAZORPAYX_WEBHOOK_SECRET, "required", "RAZORPAYX_WEBHOOK_SECRET set karo");
add("Geoapify key", process.env.GEOAPIFY_API_KEY, "recommended", "Production map search ke liye GEOAPIFY_API_KEY set karo");

console.log("\nHimRideG LIVE PREFLIGHT");
console.log("=======================");

for (const item of checks) {
  const icon = item.ok ? "PASS" : item.level === "required" ? "FAIL" : "WARN";
  console.log(`${icon.padEnd(4)}  ${item.name}`);
  if (!item.ok) console.log(`      ${item.help}`);
}

console.log("\nExternal checks (secrets nahi):");
console.log("- Razorpay/RazorpayX account/KYC/payout access active ho.");
console.log("- Payout API ke liye hosting outbound IP allowlisting configured ho.");
console.log("- Payment + payout webhook URLs Razorpay dashboard me configured hon.");
console.log("- Pehla live test minimum practical amount se apne controlled customer/driver accounts par karo.");

const failed = checks.filter((item) => item.level === "required" && !item.ok);
if (failed.length) {
  console.error(`\nPREFLIGHT FAILED: ${failed.length} required check(s) pending.`);
  process.exitCode = 1;
} else {
  console.log("\nPREFLIGHT PASS: code-side required environment flags present hain.");
  console.log("Note: external Razorpay account activation/balance/IP allowlist network call ke bina verify nahi kiye ja sakte.");
}
