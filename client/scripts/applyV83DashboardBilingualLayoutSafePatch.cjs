const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) {
    console.error(`HimRideG V83 target missing: ${relativePath}`);
    process.exit(1);
  }
  return { file, source: fs.readFileSync(file, "utf8") };
}

function write(file, source, label) {
  fs.writeFileSync(file, source, "utf8");
  console.log(`HimRideG V83 applied: ${label}`);
}

function replaceRequired(source, oldText, newText, label) {
  if (!source.includes(oldText)) {
    console.error(`HimRideG V83 anchor missing: ${label}`);
    process.exit(1);
  }
  return source.replace(oldText, newText);
}

/*
|--------------------------------------------------------------------------
| Dashboard bilingual hotfix — LAYOUT SAFE
|--------------------------------------------------------------------------
| V82 correctly wrapped the whole web app, but authenticated Customer,
| Driver and Admin dashboards are intentionally kept on pathname "/" by
| App.jsx. V82 also treated "/" as a dedicated Home language screen, which
| hid the global language switch while a dashboard was open.
|
| This patch ONLY fixes language behaviour and adds static UI translations.
| It does not touch dashboard JSX structure, CSS, maps, ride/payment logic,
| wallet logic, platform-fee logic, sockets, dimensions or layout.
|--------------------------------------------------------------------------
*/
{
  const { file, source: original } = read("src/i18n/AppLanguageProvider.jsx");
  let source = original;

  source = source.replace(
    '  return path === "/" || publicPaths.has(path);',
    '  return publicPaths.has(path);'
  );

  if (!source.includes("V83_LAYOUT_SAFE_DASHBOARD_TRANSLATIONS")) {
    const anchor = '  { en: "Admin Dashboard", hi: "प्रशासक डैशबोर्ड" },\n';
    const additions = `  // V83_LAYOUT_SAFE_DASHBOARD_TRANSLATIONS\n  { en: "Searching driver", hi: "चालक खोजा जा रहा है" },\n  { en: "Searching Driver", hi: "चालक खोजा जा रहा है" },\n  { en: "Driver assigned", hi: "चालक तय हो गया" },\n  { en: "Driver Assigned", hi: "चालक तय हो गया" },\n  { en: "Driver arriving", hi: "चालक पिकअप की ओर आ रहा है" },\n  { en: "Driver arrived", hi: "चालक पहुँच गया" },\n  { en: "Ride started", hi: "यात्रा शुरू हो गई" },\n  { en: "Payment pending", hi: "भुगतान लंबित" },\n  { en: "Driver ne fare offer kiya", hi: "चालक ने किराया प्रस्ताव भेजा" },\n  { en: "Fare Lock ho gaya ✅", hi: "किराया तय हो गया ✅" },\n  { en: "Fare Locked", hi: "किराया तय हो गया" },\n  { en: "Fare Negotiation", hi: "किराया बातचीत" },\n  { en: "Fare Offer Sent", hi: "किराया प्रस्ताव भेजा गया" },\n  { en: "Accepted — Fare bhejo", hi: "स्वीकार किया — किराया भेजें" },\n  { en: "Going to Pickup", hi: "पिकअप की ओर जा रहे हैं" },\n  { en: "Waiting for Payment", hi: "भुगतान की प्रतीक्षा" },\n  { en: "Expired", hi: "समय समाप्त" },\n  { en: "Final Fare Sync Recovery", hi: "अंतिम किराया समन्वय सुधार" },\n  { en: "Driver FINAL Fare", hi: "चालक का अंतिम किराया" },\n  { en: "One-Time Counter Sent", hi: "एक बार का प्रतिप्रस्ताव भेजा गया" },\n  { en: "Driver Fare", hi: "चालक का किराया" },\n  { en: "Counter Offer", hi: "किराया प्रतिप्रस्ताव" },\n  { en: "One-time counter fare (₹)", hi: "एक बार का प्रतिप्रस्ताव किराया (₹)" },\n  { en: "Fare accept ho gaya. Driver ka GO TO PICKUP ab enabled hai.", hi: "किराया स्वीकार हो गया। चालक अब पिकअप के लिए रवाना हो सकता है।" },\n  { en: "Driver final fare amount sync nahi hua. Driver ko FINAL fare resend karna hoga. ₹0 ko Accept/Reject ke liye kabhi show nahi kiya jayega.", hi: "चालक का अंतिम किराया समन्वित नहीं हुआ। चालक को अंतिम किराया दोबारा भेजना होगा। ₹0 को स्वीकार या अस्वीकार करने के लिए नहीं दिखाया जाएगा।" },\n  { en: "Ye driver ka final offer hai. Ab sirf Accept ya Reject kar sakte hain. Accept par fare lock hoga aur driver ka GO TO PICKUP enable hoga.", hi: "यह चालक का अंतिम किराया प्रस्ताव है। अब केवल स्वीकार या अस्वीकार किया जा सकता है। स्वीकार करने पर किराया तय होगा और चालक पिकअप के लिए जा सकेगा।" },\n  { en: "Waiting for driver FINAL fare... Counter Offer ab dobara available nahi hoga.", hi: "चालक के अंतिम किराए की प्रतीक्षा है। अब दोबारा प्रतिप्रस्ताव नहीं भेजा जा सकता।" },\n  { en: "Fare pasand hai to Accept karein. Reject kar sakte hain, ya ek baar Counter Offer bhej sakte hain.", hi: "किराया सही लगे तो स्वीकार करें। आप अस्वीकार कर सकते हैं या एक बार किराया प्रतिप्रस्ताव भेज सकते हैं।" },\n  { en: "Not selected", hi: "चयन नहीं किया गया" },\n  { en: "Pickup location", hi: "पिकअप स्थान" },\n  { en: "Drop location", hi: "गंतव्य स्थान" },\n  { en: "Destination", hi: "गंतव्य" },\n  { en: "Current Location", hi: "वर्तमान स्थान" },\n  { en: "Use My Location", hi: "मेरी वर्तमान जगह उपयोग करें" },\n  { en: "Navigate", hi: "रास्ता खोलें" },\n  { en: "Call Customer", hi: "ग्राहक को कॉल करें" },\n  { en: "Call Driver", hi: "चालक को कॉल करें" },\n  { en: "View Details", hi: "विवरण देखें" },\n  { en: "Details", hi: "विवरण" },\n  { en: "Status", hi: "स्थिति" },\n  { en: "Date", hi: "तारीख" },\n  { en: "Fare", hi: "किराया" },\n  { en: "Distance", hi: "दूरी" },\n  { en: "From", hi: "कहाँ से" },\n  { en: "To", hi: "कहाँ तक" },\n  { en: "Today", hi: "आज" },\n  { en: "This Week", hi: "इस सप्ताह" },\n  { en: "This Month", hi: "इस महीने" },\n  { en: "Notifications", hi: "सूचनाएँ" },\n  { en: "No rides found", hi: "कोई यात्रा नहीं मिली" },\n  { en: "No data found", hi: "कोई जानकारी नहीं मिली" },\n  { en: "Retry", hi: "दोबारा प्रयास करें" },\n  { en: "Total Drivers", hi: "कुल चालक" },\n  { en: "Total Customers", hi: "कुल ग्राहक" },\n  { en: "Total Rides", hi: "कुल यात्राएँ" },\n  { en: "Pending Approvals", hi: "लंबित स्वीकृतियाँ" },\n  { en: "Driver Management", hi: "चालक प्रबंधन" },\n  { en: "Customer Management", hi: "ग्राहक प्रबंधन" },\n  { en: "Booking Management", hi: "बुकिंग प्रबंधन" },\n  { en: "All Bookings", hi: "सभी बुकिंग" },\n  { en: "Pending Bookings", hi: "लंबित बुकिंग" },\n  { en: "Blocked Drivers", hi: "अवरुद्ध चालक" },\n  { en: "Warnings", hi: "चेतावनियाँ" },\n  { en: "Warning", hi: "चेतावनी" },\n  { en: "Block Driver", hi: "चालक को अवरुद्ध करें" },\n  { en: "Unblock Driver", hi: "चालक से अवरोध हटाएँ" },\n  { en: "Withdrawals", hi: "निकासी अनुरोध" },\n  { en: "Withdrawal Requests", hi: "निकासी अनुरोध" },\n  { en: "Mark Paid", hi: "भुगतान पूर्ण चिह्नित करें" },\n  { en: "Verify", hi: "सत्यापित करें" },\n  { en: "Verified", hi: "सत्यापित" },\n  { en: "Rejected", hi: "अस्वीकृत" },\n  { en: "Waiting", hi: "प्रतीक्षा में" },\n  { en: "Blocked", hi: "अवरुद्ध" },\n  { en: "All", hi: "सभी" },\n  { en: "Refresh Data", hi: "जानकारी रीफ़्रेश करें" },\n  { en: "Data refreshed", hi: "जानकारी रीफ़्रेश हो गई" },\n  { en: "Legal Name", hi: "कानूनी नाम" },\n  { en: "Vehicle Details", hi: "वाहन विवरण" },\n  { en: "Registration Number", hi: "पंजीकरण नंबर" },\n  { en: "Document verified!", hi: "दस्तावेज़ सत्यापित हो गया!" },\n  { en: "Document rejected!", hi: "दस्तावेज़ अस्वीकार हो गया!" },\n  { en: "Driver successfully approved", hi: "चालक सफलतापूर्वक स्वीकृत हुआ" },\n  { en: "Driver application rejected", hi: "चालक का आवेदन अस्वीकार हुआ" },\n  { en: "Driver blocked", hi: "चालक अवरुद्ध किया गया" },\n  { en: "Driver unblocked", hi: "चालक से अवरोध हटा दिया गया" },\n`;

    source = replaceRequired(
      source,
      anchor,
      anchor + additions,
      "dashboard translation dictionary"
    );
  }

  if (source !== original) {
    write(file, source, "dashboard Hindi/English translation coverage and visible switch");
  } else {
    console.log("HimRideG V83 dashboard bilingual provider already applied");
  }
}

console.log("HimRideG V83 complete: dashboards bilingual, layout untouched");
