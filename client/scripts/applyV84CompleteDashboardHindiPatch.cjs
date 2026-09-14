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
| Text translation only. No Customer/Driver/Admin JSX layout, CSS, map,
| ride, payment, wallet, platform-fee or socket behavior is changed here.
|--------------------------------------------------------------------------
*/

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

  const translations = [
    ["HIMACHAL KI APNI RIDE", "हिमाचल की अपनी यात्रा"],
    ["HimRideG Driver", "HimRideG चालक"],
    ["HimRideG Customer", "HimRideG ग्राहक"],
    ["HimRideG Admin", "HimRideG प्रशासन"],
    ["Admin Panel", "प्रशासन पैनल"],
    ["Admin Portal", "प्रशासन पोर्टल"],
    ["Overview", "सारांश"],
    ["Requests", "अनुरोध"],
    ["Request", "अनुरोध"],
    ["New Requests", "नए अनुरोध"],
    ["Driver Rides", "चालक यात्राएँ"],
    ["Scheduled", "निर्धारित"],
    ["Active", "सक्रिय"],
    ["Waiting Payment", "भुगतान की प्रतीक्षा"],
    ["Completed", "पूर्ण"],
    ["Cancelled", "रद्द"],
    ["Accepted", "स्वीकृत"],
    ["Started", "शुरू"],
    ["My QR", "मेरा क्यूआर"],
    ["My Profile", "मेरी प्रोफ़ाइल"],
    ["Driver Profile", "चालक प्रोफ़ाइल"],
    ["Customer Profile", "ग्राहक प्रोफ़ाइल"],
    ["Personal Details", "व्यक्तिगत विवरण"],
    ["Payment Settings", "भुगतान सेटिंग"],
    ["Save Changes", "बदलाव सहेजें"],
    ["Back to Dashboard", "डैशबोर्ड पर वापस जाएँ"],
    ["Online • Available", "ऑनलाइन • उपलब्ध"],
    ["Online • Busy", "ऑनलाइन • व्यस्त"],
    ["Ride notifications", "यात्रा सूचनाएँ"],
    ["Toggle online status", "ऑनलाइन स्थिति बदलें"],
    ["Is section me koi ride nahi hai", "इस भाग में कोई यात्रा नहीं है"],
    ["No ride requests", "कोई यात्रा अनुरोध नहीं है"],
    ["No new requests", "कोई नया अनुरोध नहीं है"],
    ["No active ride", "कोई सक्रिय यात्रा नहीं है"],
    ["No completed rides", "कोई पूर्ण यात्रा नहीं है"],
    ["No scheduled rides", "कोई निर्धारित यात्रा नहीं है"],
    ["No payment pending rides", "भुगतान लंबित कोई यात्रा नहीं है"],
    ["Current Ride", "वर्तमान यात्रा"],
    ["Incoming Requests", "आने वाले अनुरोध"],
    ["Request Details", "अनुरोध विवरण"],
    ["Customer Name", "ग्राहक का नाम"],
    ["Requested Vehicle", "माँगा गया वाहन"],
    ["Requested Vehicle Type", "माँगा गया वाहन प्रकार"],
    ["Vehicle", "वाहन"],
    ["Location", "स्थान"],
    ["My Location", "मेरी जगह"],
    ["Open Map", "नक्शा खोलें"],
    ["View Route", "मार्ग देखें"],
    ["Start Navigation", "नेविगेशन शुरू करें"],
    ["Customer Contact", "ग्राहक संपर्क"],
    ["Driver Contact", "चालक संपर्क"],
    ["Phone", "फ़ोन"],
    ["Call", "कॉल करें"],
    ["Message", "संदेश"],
    ["Open", "खोलें"],
    ["View", "देखें"],
    ["Book New Ride", "नई यात्रा बुक करें"],
    ["BOOK A RIDE", "यात्रा बुक करें"],
    ["Travel With Us", "हमारे साथ यात्रा करें"],
    ["Recent Activity", "हाल की गतिविधि"],
    ["My Account", "मेरा खाता"],
    ["Account Details", "खाता विवरण"],
    ["Passenger", "यात्री"],
    ["Passengers", "यात्री"],
    ["Schedule", "समय निर्धारित करें"],
    ["Schedule Ride", "यात्रा निर्धारित करें"],
    ["Scheduled Ride", "निर्धारित यात्रा"],
    ["Payment Option", "भुगतान विकल्प"],
    ["Driver Details", "चालक विवरण"],
    ["Ride Details", "यात्रा विवरण"],
    ["Booking Details", "बुकिंग विवरण"],
    ["Booking ID", "बुकिंग आईडी"],
    ["Ride ID", "यात्रा आईडी"],
    ["Created At", "बनाने का समय"],
    ["Travel Date", "यात्रा तारीख"],
    ["Pickup Time", "पिकअप समय"],
    ["Drop Time", "गंतव्य समय"],
    ["Search Driver", "चालक खोजें"],
    ["Searching for driver", "चालक खोजा जा रहा है"],
    ["Waiting for driver", "चालक की प्रतीक्षा है"],
    ["Driver is arriving", "चालक पिकअप की ओर आ रहा है"],
    ["Driver has arrived", "चालक पहुँच गया है"],
    ["Driver Applications", "चालक आवेदन"],
    ["Waiting Approval", "स्वीकृति की प्रतीक्षा"],
    ["Driver Documents", "चालक दस्तावेज़"],
    ["Document Verification", "दस्तावेज़ सत्यापन"],
    ["Approve Application", "आवेदन स्वीकृत करें"],
    ["Reject Application", "आवेदन अस्वीकार करें"],
    ["Send Warning", "चेतावनी भेजें"],
    ["Warnings", "चेतावनियाँ"],
    ["Blocked Drivers", "अवरुद्ध चालक"],
    ["Waiting Drivers", "प्रतीक्षारत चालक"],
    ["All Drivers", "सभी चालक"],
    ["All Customers", "सभी ग्राहक"],
    ["Bookings", "बुकिंग"],
    ["Withdrawals", "निकासी"],
    ["Withdrawal Requests", "निकासी अनुरोध"],
    ["Pending Withdrawals", "लंबित निकासी"],
    ["Paid Withdrawals", "भुगतान की गई निकासी"],
    ["Rejected Withdrawals", "अस्वीकृत निकासी"],
    ["Mark Paid", "भुगतान पूर्ण चिह्नित करें"],
    ["Admin Note", "प्रशासनिक टिप्पणी"],
    ["Payout Reference", "भुगतान संदर्भ"],
    ["Refresh Data", "जानकारी रीफ़्रेश करें"],
    ["Driver Test Mode", "चालक परीक्षण मोड"],
    ["Test Drivers", "परीक्षण चालक"],
    ["All Bookings", "सभी बुकिंग"],
    ["Pending Bookings", "लंबित बुकिंग"],
    ["Accepted Bookings", "स्वीकृत बुकिंग"],
    ["Started Bookings", "शुरू हुई बुकिंग"],
    ["Completed Bookings", "पूर्ण बुकिंग"],
    ["Cancelled Bookings", "रद्द बुकिंग"],
    ["Search by name, phone or vehicle", "नाम, फ़ोन या वाहन से खोजें"],
    ["No drivers found", "कोई चालक नहीं मिला"],
    ["No customers found", "कोई ग्राहक नहीं मिला"],
    ["No bookings found", "कोई बुकिंग नहीं मिली"],
    ["No withdrawal requests", "कोई निकासी अनुरोध नहीं है"]
  ];

  const additions =
    '  // V84_COMPLETE_DASHBOARD_TRANSLATIONS\n' +
    translations
      .map(([en, hi]) =>
        `  { en: ${JSON.stringify(en)}, hi: ${JSON.stringify(hi)} },`
      )
      .join("\n") +
    "\n";

  source = source.replace(anchor, anchor + additions);
}

if (!source.includes("V84_DECORATED_TEXT_TRANSLATION")) {
  const anchor =
    '  const exact = aliasMap.get(normalize(value));\n' +
    '  if (exact) return language === "hi" ? exact.hi : exact.en;\n\n';

  if (!source.includes(anchor)) {
    console.error("HimRideG V84 dynamic translation anchor missing");
    process.exit(1);
  }

  const replacement = [
    '  const exact = aliasMap.get(normalize(value));',
    '  if (exact) return language === "hi" ? exact.hi : exact.en;',
    '',
    '  // V84_DECORATED_TEXT_TRANSLATION',
    '  // Preserve arrows / emoji around a normal UI label without changing layout.',
    '  const decorated = value.match(/^([^A-Za-z0-9\\u0900-\\u097F₹]*)(.*?)([^A-Za-z0-9\\u0900-\\u097F%₹)]*)$/u);',
    '  if (decorated) {',
    '    const decoratedEntry = aliasMap.get(normalize(decorated[2]));',
    '    if (decoratedEntry) {',
    '      const translatedCore = language === "hi" ? decoratedEntry.hi : decoratedEntry.en;',
    '      return decorated[1] + translatedCore + decorated[3];',
    '    }',
    '  }',
    ''
  ].join("\n") + "\n";

  source = source.replace(anchor, replacement);
}

if (!source.includes("V84_AMOUNT_ACTION_PATTERNS")) {
  const anchor = '  const patterns = [\n';
  if (!source.includes(anchor)) {
    console.error("HimRideG V84 patterns anchor missing");
    process.exit(1);
  }

  const additions = [
    '  // V84_AMOUNT_ACTION_PATTERNS',
    '    {',
    '      re: /^(?:✅\\s*)?Accept\\s*₹\\s*([\\d,.]+)$/i,',
    '      en: (m) => "Accept ₹" + m[1],',
    '      hi: (m) => "स्वीकार करें ₹" + m[1]',
    '    },',
    '    {',
    '      re: /^(?:❌\\s*)?Reject$/i,',
    '      en: () => "Reject",',
    '      hi: () => "अस्वीकार करें"',
    '    },',
    '    {',
    '      re: /^Final Fare\\s*₹\\s*([\\d,.]+)$/i,',
    '      en: (m) => "Final Fare ₹" + m[1],',
    '      hi: (m) => "अंतिम किराया ₹" + m[1]',
    '    },',
    '    {',
    '      re: /^Fare\\s*₹\\s*([\\d,.]+)$/i,',
    '      en: (m) => "Fare ₹" + m[1],',
    '      hi: (m) => "किराया ₹" + m[1]',
    '    },'
  ].join("\n") + "\n";

  source = source.replace(anchor, anchor + additions);
}

if (source === original) {
  console.log("HimRideG V84 already applied");
} else {
  fs.writeFileSync(target, source, "utf8");
  console.log("HimRideG V84 applied: complete Customer/Driver/Admin Hindi coverage, layout untouched");
}
