const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const target = path.join(root, "src/i18n/AppLanguageProvider.jsx");

if (!fs.existsSync(target)) {
  console.error("HimRideG V84 target missing: src/i18n/AppLanguageProvider.jsx");
  process.exit(1);
}

let source = fs.readFileSync(target, "utf8");
const original = source;

/*
|--------------------------------------------------------------------------
| V84 — Complete dashboard Hindi coverage, LAYOUT SAFE
|--------------------------------------------------------------------------
| This patch changes text translation only. It does NOT change Customer,
| Driver or Admin dashboard JSX structure, CSS, dimensions, cards, maps,
| buttons, ride flow, payment flow, wallet, platform fee or socket logic.
|--------------------------------------------------------------------------
*/

// Defensive fix in case an earlier build did not apply V83 for authenticated
// dashboards which also render on pathname "/".
source = source.replace(
  '  return path === "/" || publicPaths.has(path);',
  '  return publicPaths.has(path);'
);

if (!source.includes("V84_COMPLETE_DASHBOARD_TRANSLATIONS")) {
  const anchor = '  { en: "Admin Dashboard", hi: "प्रशासक डैशबोर्ड" },\n';

  if (!source.includes(anchor)) {
    console.error("HimRideG V84 dictionary anchor missing");
    process.exit(1);
  }

  const additions = `  // V84_COMPLETE_DASHBOARD_TRANSLATIONS\n  { en: "HIMACHAL KI APNI RIDE", hi: "हिमाचल की अपनी यात्रा" },\n  { en: "HimRideG Driver", hi: "HimRideG चालक" },\n  { en: "HimRideG Customer", hi: "HimRideG ग्राहक" },\n  { en: "HimRideG Admin", hi: "HimRideG प्रशासन" },\n  { en: "Admin Panel", hi: "प्रशासन पैनल" },\n  { en: "Admin Portal", hi: "प्रशासन पोर्टल" },\n  { en: "Overview", hi: "सारांश" },\n  { en: "Requests", hi: "अनुरोध" },\n  { en: "Request", hi: "अनुरोध" },\n  { en: "New Requests", hi: "नए अनुरोध" },\n  { en: "Driver Rides", hi: "चालक यात्राएँ" },\n  { en: "Scheduled", hi: "निर्धारित" },\n  { en: "Active", hi: "सक्रिय" },\n  { en: "Waiting Payment", hi: "भुगतान की प्रतीक्षा" },\n  { en: "Completed", hi: "पूर्ण" },\n  { en: "Cancelled", hi: "रद्द" },\n  { en: "Accepted", hi: "स्वीकृत" },\n  { en: "Started", hi: "शुरू" },\n  { en: "My QR", hi: "मेरा क्यूआर" },\n  { en: "My Profile", hi: "मेरी प्रोफ़ाइल" },\n  { en: "Driver Profile", hi: "चालक प्रोफ़ाइल" },\n  { en: "Customer Profile", hi: "ग्राहक प्रोफ़ाइल" },\n  { en: "Personal Details", hi: "व्यक्तिगत विवरण" },\n  { en: "Payment Settings", hi: "भुगतान सेटिंग" },\n  { en: "Save Changes", hi: "बदलाव सहेजें" },\n  { en: "Back to Dashboard", hi: "डैशबोर्ड पर वापस जाएँ" },\n  { en: "Online • Available", hi: "ऑनलाइन • उपलब्ध" },\n  { en: "Online • Busy", hi: "ऑनलाइन • व्यस्त" },\n  { en: "Ride notifications", hi: "यात्रा सूचनाएँ" },\n  { en: "Toggle online status", hi: "ऑनलाइन स्थिति बदलें" },\n  { en: "Is section me koi ride nahi hai", hi: "इस भाग में कोई यात्रा नहीं है" },\n  { en: "No ride requests", hi: "कोई यात्रा अनुरोध नहीं है" },\n  { en: "No new requests", hi: "कोई नया अनुरोध नहीं है" },\n  { en: "No active ride", hi: "कोई सक्रिय यात्रा नहीं है" },\n  { en: "No completed rides", hi: "कोई पूर्ण यात्रा नहीं है" },\n  { en: "No scheduled rides", hi: "कोई निर्धारित यात्रा नहीं है" },\n  { en: "No payment pending rides", hi: "भुगतान लंबित कोई यात्रा नहीं है" },\n  { en: "Current Ride", hi: "वर्तमान यात्रा" },\n  { en: "Incoming Requests", hi: "आने वाले अनुरोध" },\n  { en: "Request Details", hi: "अनुरोध विवरण" },\n  { en: "Customer Name", hi: "ग्राहक का नाम" },\n  { en: "Requested Vehicle", hi: "माँगा गया वाहन" },\n  { en: "Requested Vehicle Type", hi: "माँगा गया वाहन प्रकार" },\n  { en: "Vehicle", hi: "वाहन" },\n  { en: "Location", hi: "स्थान" },\n  { en: "My Location", hi: "मेरी जगह" },\n  { en: "Open Map", hi: "नक्शा खोलें" },\n  { en: "View Route", hi: "मार्ग देखें" },\n  { en: "Start Navigation", hi: "नेविगेशन शुरू करें" },\n  { en: "Customer Contact", hi: "ग्राहक संपर्क" },\n  { en: "Driver Contact", hi: "चालक संपर्क" },\n  { en: "Phone", hi: "फ़ोन" },\n  { en: "Call", hi: "कॉल करें" },\n  { en: "Message", hi: "संदेश" },\n  { en: "Open", hi: "खोलें" },\n  { en: "View", hi: "देखें" },\n  { en: "Book New Ride", hi: "नई यात्रा बुक करें" },\n  { en: "BOOK A RIDE", hi: "यात्रा बुक करें" },\n  { en: "Travel With Us", hi: "हमारे साथ यात्रा करें" },\n  { en: "Recent Activity", hi: "हाल की गतिविधि" },\n  { en: "My Account", hi: "मेरा खाता" },\n  { en: "Account Details", hi: "खाता विवरण" },\n  { en: "Passenger", hi: "यात्री" },\n  { en: "Passengers", hi: "यात्री" },\n  { en: "Schedule", hi: "समय निर्धारित करें" },\n  { en: "Schedule Ride", hi: "यात्रा निर्धारित करें" },\n  { en: "Scheduled Ride", hi: "निर्धारित यात्रा" },\n  { en: "Payment Option", hi: "भुगतान विकल्प" },\n  { en: "Driver Details", hi: "चालक विवरण" },\n  { en: "Ride Details", hi: "यात्रा विवरण" },\n  { en: "Booking Details", hi: "बुकिंग विवरण" },\n  { en: "Booking ID", hi: "बुकिंग आईडी" },\n  { en: "Ride ID", hi: "यात्रा आईडी" },\n  { en: "Created At", hi: "बनाने का समय" },\n  { en: "Travel Date", hi: "यात्रा तारीख" },\n  { en: "Pickup Time", hi: "पिकअप समय" },\n  { en: "Drop Time", hi: "गंतव्य समय" },\n  { en: "Search Driver", hi: "चालक खोजें" },\n  { en: "Searching for driver", hi: "चालक खोजा जा रहा है" },\n  { en: "Waiting for driver", hi: "चालक की प्रतीक्षा है" },\n  { en: "Driver is arriving", hi: "चालक पिकअप की ओर आ रहा है" },\n  { en: "Driver has arrived", hi: "चालक पहुँच गया है" },\n  { en: "Driver Applications", hi: "चालक आवेदन" },\n  { en: "Waiting Approval", hi: "स्वीकृति की प्रतीक्षा" },\n  { en: "Driver Documents", hi: "चालक दस्तावेज़" },\n  { en: "Document Verification", hi: "दस्तावेज़ सत्यापन" },\n  { en: "Approve Application", hi: "आवेदन स्वीकृत करें" },\n  { en: "Reject Application", hi: "आवेदन अस्वीकार करें" },\n  { en: "Send Warning", hi: "चेतावनी भेजें" },\n  { en: "Warnings", hi: "चेतावनियाँ" },\n  { en: "Blocked Drivers", hi: "अवरुद्ध चालक" },\n  { en: "Waiting Drivers", hi: "प्रतीक्षारत चालक" },\n  { en: "All Drivers", hi: "सभी चालक" },\n  { en: "All Customers", hi: "सभी ग्राहक" },\n  { en: "Bookings", hi: "बुकिंग" },\n  { en: "Withdrawals", hi: "निकासी" },\n  { en: "Withdrawal Requests", hi: "निकासी अनुरोध" },\n  { en: "Pending Withdrawals", hi: "लंबित निकासी" },\n  { en: "Paid Withdrawals", hi: "भुगतान की गई निकासी" },\n  { en: "Rejected Withdrawals", hi: "अस्वीकृत निकासी" },\n  { en: "Mark Paid", hi: "भुगतान पूर्ण चिह्नित करें" },\n  { en: "Admin Note", hi: "प्रशासनिक टिप्पणी" },\n  { en: "Payout Reference", hi: "भुगतान संदर्भ" },\n  { en: "Refresh Data", hi: "जानकारी रीफ़्रेश करें" },\n  { en: "Driver Test Mode", hi: "चालक परीक्षण मोड" },\n  { en: "Test Drivers", hi: "परीक्षण चालक" },\n  { en: "All Bookings", hi: "सभी बुकिंग" },\n  { en: "Pending Bookings", hi: "लंबित बुकिंग" },\n  { en: "Accepted Bookings", hi: "स्वीकृत बुकिंग" },\n  { en: "Started Bookings", hi: "शुरू हुई बुकिंग" },\n  { en: "Completed Bookings", hi: "पूर्ण बुकिंग" },\n  { en: "Cancelled Bookings", hi: "रद्द बुकिंग" },\n  { en: "Search by name, phone or vehicle", hi: "नाम, फ़ोन या वाहन से खोजें" },\n  { en: "No drivers found", hi: "कोई चालक नहीं मिला" },\n  { en: "No customers found", hi: "कोई ग्राहक नहीं मिला" },\n  { en: "No bookings found", hi: "कोई बुकिंग नहीं मिली" },\n  { en: "No withdrawal requests", hi: "कोई निकासी अनुरोध नहीं है" },\n`;

  source = source.replace(anchor, anchor + additions);
}

if (!source.includes("V84_DECORATED_TEXT_TRANSLATION")) {
  const anchor = `  const exact = aliasMap.get(normalize(value));\n  if (exact) return language === "hi" ? exact.hi : exact.en;\n\n`;

  if (!source.includes(anchor)) {
    console.error("HimRideG V84 dynamic translation anchor missing");
    process.exit(1);
  }

  const replacement = `  const exact = aliasMap.get(normalize(value));\n  if (exact) return language === "hi" ? exact.hi : exact.en;\n\n  // V84_DECORATED_TEXT_TRANSLATION\n  // Preserve arrows / emoji around a normal UI label, e.g. \"← Dashboard\"\n  // or \"💰 Wallet\", while translating only the label itself.\n  const decorated = value.match(/^([^A-Za-z0-9\\u0900-\\u097F₹]*)(.*?)([^A-Za-z0-9\\u0900-\\u097F%₹)]*)$/u);\n  if (decorated) {\n    const decoratedEntry = aliasMap.get(normalize(decorated[2]));\n    if (decoratedEntry) {\n      const translatedCore = language === "hi" ? decoratedEntry.hi : decoratedEntry.en;\n      return \\`\\${decorated[1]}\\${translatedCore}\\${decorated[3]}\\`;\n    }\n  }\n\n`;

  source = source.replace(anchor, replacement);
}

if (!source.includes("V84_AMOUNT_ACTION_PATTERNS")) {
  const anchor = `  const patterns = [\n`;
  if (!source.includes(anchor)) {
    console.error("HimRideG V84 patterns anchor missing");
    process.exit(1);
  }

  const additions = `  // V84_AMOUNT_ACTION_PATTERNS\n    {\n      re: /^(?:✅\\s*)?Accept\\s*₹\\s*([\\d,.]+)$/i,\n      en: (m) => \\`Accept ₹\\${m[1]}\\`,\n      hi: (m) => \\`स्वीकार करें ₹\\${m[1]}\\`\n    },\n    {\n      re: /^(?:❌\\s*)?Reject$/i,\n      en: () => \"Reject\",\n      hi: () => \"अस्वीकार करें\"\n    },\n    {\n      re: /^Final Fare\\s*₹\\s*([\\d,.]+)$/i,\n      en: (m) => \\`Final Fare ₹\\${m[1]}\\`,\n      hi: (m) => \\`अंतिम किराया ₹\\${m[1]}\\`\n    },\n    {\n      re: /^Fare\\s*₹\\s*([\\d,.]+)$/i,\n      en: (m) => \\`Fare ₹\\${m[1]}\\`,\n      hi: (m) => \\`किराया ₹\\${m[1]}\\`\n    },\n`;

  source = source.replace(anchor, anchor + additions);
}

if (source === original) {
  console.log("HimRideG V84 already applied");
} else {
  fs.writeFileSync(target, source, "utf8");
  console.log("HimRideG V84 applied: complete Customer/Driver/Admin Hindi coverage, layout untouched");
}
