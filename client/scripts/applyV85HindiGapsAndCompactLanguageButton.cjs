const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const providerPath = path.join(root, "src/i18n/AppLanguageProvider.jsx");
const cssPath = path.join(root, "src/i18n/app-language.css");

function mustRead(file, label) {
  if (!fs.existsSync(file)) {
    console.error(`HimRideG V85 target missing: ${label}`);
    process.exit(1);
  }
  return fs.readFileSync(file, "utf8");
}

function mustReplace(source, oldText, newText, label) {
  if (!source.includes(oldText)) {
    console.error(`HimRideG V85 anchor missing: ${label}`);
    process.exit(1);
  }
  return source.replace(oldText, newText);
}

/*
|--------------------------------------------------------------------------
| V85 — Remaining visible Hindi gaps + compact language control
|--------------------------------------------------------------------------
| TEXT/CSS ONLY. No Customer/Driver/Admin layout structure, ride flow,
| map, sockets, payment, wallet, platform fee, test mode or API logic changes.
|--------------------------------------------------------------------------
*/

let provider = mustRead(providerPath, "src/i18n/AppLanguageProvider.jsx");
const providerOriginal = provider;

if (!provider.includes("V85_SCREENSHOT_AND_DASHBOARD_GAPS")) {
  const lastBaseEntry = '  { en: "Online Payment", hi: "ऑनलाइन भुगतान" }\n];';

  const extraTranslations = [
    ["Online raho, ride accept karo aur apna final fare khud decide karo.", "ऑनलाइन रहें, यात्रा स्वीकार करें और अपना अंतिम किराया स्वयं तय करें।"],
    ["Approved Driver", "स्वीकृत चालक"],
    ["Driver Summary", "चालक सारांश"],
    ["LIVE ROUTE", "लाइव मार्ग"],
    ["Live Route", "लाइव मार्ग"],
    ["Route Map", "मार्ग नक्शा"],
    ["TODAY'S SUMMARY", "आज का सारांश"],
    ["Today's Summary", "आज का सारांश"],
    ["Waiting for New Ride", "नई यात्रा की प्रतीक्षा"],
    ["Waiting for Ride", "यात्रा की प्रतीक्षा"],
    ["Online raho. Nayi customer booking aur koi assigned Active Ride isi panel me dikhai degi.", "ऑनलाइन रहें। नई ग्राहक बुकिंग और कोई निर्धारित सक्रिय यात्रा इसी पैनल में दिखाई देगी।"],
    ["New Ride", "नई यात्रा"],
    ["New Booking", "नई बुकिंग"],
    ["Assigned Ride", "निर्धारित यात्रा"],
    ["Driver Status", "चालक स्थिति"],
    ["Available Driver", "उपलब्ध चालक"],
    ["Approved", "स्वीकृत"],
    ["Route", "मार्ग"],
    ["Summary", "सारांश"],
    ["Total Trips", "कुल यात्राएँ"],
    ["Payment Waiting", "भुगतान की प्रतीक्षा"],
    ["No Ride", "कोई यात्रा नहीं"],
    ["COMING SOON", "जल्द आ रहा है"],
    ["Online — UPI", "ऑनलाइन — यूपीआई"],
    ["RIDE PAYMENT", "यात्रा भुगतान"],
    ["Pay completed ride", "पूरी हुई यात्रा का भुगतान करें"],
    ["View completed rides →", "पूरी हुई यात्राएँ देखें →"],
    ["Locked Fare", "तय किराया"],
    ["Payment Center", "भुगतान केंद्र"],
    ["Payment Methods", "भुगतान के तरीके"],
    ["Current Ride", "वर्तमान यात्रा"],
    ["Your Driver", "आपका चालक"],
    ["Driver is on the way", "चालक रास्ते में है"],
    ["Where do you want to go?", "आप कहाँ जाना चाहते हैं?"],
    ["Book your ride", "अपनी यात्रा बुक करें"],
    ["Mobile par UPI app open hogi. Desktop par UPI QR scan karke payment ki ja sakti hai. Amount customer type nahi karega — locked fare automatically payment order me jayega.", "मोबाइल पर यूपीआई ऐप खुलेगी। डेस्कटॉप पर यूपीआई क्यूआर स्कैन करके भुगतान किया जा सकता है। राशि ग्राहक को दर्ज नहीं करनी होगी — तय किराया अपने-आप भुगतान में जाएगा।"],
    ["Ride complete hone ke baad customer Cash select kar sakta hai. Driver ko locked fare cash dene ke baad assigned driver payment receive confirm karega.", "यात्रा पूरी होने के बाद ग्राहक नकद भुगतान चुन सकता है। चालक को तय किराया नकद देने के बाद वही चालक भुगतान प्राप्त होने की पुष्टि करेगा।"],
    ["Payment button driver ke ride complete karne ke baad hi enable hoga. Final locked fare ke bina payment start nahi hogi.", "भुगतान बटन चालक द्वारा यात्रा पूरी करने के बाद ही सक्रिय होगा। अंतिम तय किराए के बिना भुगतान शुरू नहीं होगा।"],
    ["ADMIN CONTROL", "प्रशासन नियंत्रण"],
    ["Dashboard Overview", "डैशबोर्ड सारांश"],
    ["Manage Drivers", "चालक प्रबंधित करें"],
    ["Manage Customers", "ग्राहक प्रबंधित करें"],
    ["Manage Rides", "यात्राएँ प्रबंधित करें"],
    ["System Status", "सिस्टम स्थिति"],
    ["Quick Actions", "त्वरित कार्रवाई"],
    ["No records found", "कोई रिकॉर्ड नहीं मिला"]
  ];

  const lines = extraTranslations
    .map(([en, hi]) => `  { en: ${JSON.stringify(en)}, hi: ${JSON.stringify(hi)} },`)
    .join("\n");

  const replacement =
    '  { en: "Online Payment", hi: "ऑनलाइन भुगतान" },\n' +
    '  // V85_SCREENSHOT_AND_DASHBOARD_GAPS\n' +
    lines +
    '\n];';

  provider = mustReplace(
    provider,
    lastBaseEntry,
    replacement,
    "translation dictionary end"
  );
}

if (!provider.includes("V85_NAMASTE_DYNAMIC")) {
  const patternAnchor = "  const patterns = [\n";
  const patternAddition =
    "  const patterns = [\n" +
    "    // V85_NAMASTE_DYNAMIC\n" +
    "    {\n" +
    "      re: /^Namaste,?\\s+(.+)$/i,\n" +
    "      en: (m) => `Namaste, ${m[1]}`,\n" +
    "      hi: (m) => `नमस्ते, ${m[1]}`\n" +
    "    },\n";

  provider = mustReplace(
    provider,
    patternAnchor,
    patternAddition,
    "dynamic translation patterns"
  );
}

if (provider !== providerOriginal) {
  fs.writeFileSync(providerPath, provider, "utf8");
  console.log("HimRideG V85 applied: remaining Customer/Driver/Admin Hindi text gaps");
} else {
  console.log("HimRideG V85 provider already applied");
}

let css = mustRead(cssPath, "src/i18n/app-language.css");

if (!css.includes("V85_COMPACT_LANGUAGE_BUTTON")) {
  css += `\n\n/* V85_COMPACT_LANGUAGE_BUTTON\n   Keep the language control available without covering dashboard profile/actions.\n   It stays a small globe button and expands only on hover/focus. */\n.appLanguageToggle {\n  right: 4px;\n  width: 42px;\n  min-width: 42px;\n  max-width: 42px;\n  padding-left: 0;\n  padding-right: 0;\n  gap: 0;\n  overflow: hidden;\n}\n\n.appLanguageToggle strong {\n  width: 0;\n  max-width: 0;\n  opacity: 0;\n  overflow: hidden;\n}\n\n.appLanguageToggle:hover,\n.appLanguageToggle:focus-visible {\n  width: auto;\n  min-width: 42px;\n  max-width: 118px;\n  padding-left: 10px;\n  padding-right: 10px;\n  gap: 7px;\n  transform: none;\n}\n\n.appLanguageToggle:hover strong,\n.appLanguageToggle:focus-visible strong {\n  width: auto;\n  max-width: 74px;\n  opacity: 1;\n}\n\n@media (max-width: 700px) {\n  .appLanguageToggle {\n    right: 3px;\n    width: 36px;\n    min-width: 36px;\n    max-width: 36px;\n    padding-left: 0;\n    padding-right: 0;\n  }\n\n  .appLanguageToggle:hover,\n  .appLanguageToggle:focus-visible {\n    width: auto;\n    min-width: 36px;\n    max-width: 108px;\n    padding-left: 8px;\n    padding-right: 8px;\n  }\n}\n`;

  fs.writeFileSync(cssPath, css, "utf8");
  console.log("HimRideG V85 applied: compact non-covering language button");
} else {
  console.log("HimRideG V85 compact language button already applied");
}

console.log("HimRideG V85 complete: Hindi coverage improved, layout structure untouched");
