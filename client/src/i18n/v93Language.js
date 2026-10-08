// V93 (ADD-ONLY): language audit — V91/V92/V93 ka bacha hua text.
// Har row: source text (jaisa code me likha hai), English, Hindi, Hinglish.
// Pehle ye text English/Hindi mode me bhi Hinglish hi dikhte the.
const rows = [
  // --- Driver: payment nahi mila / independent release (V91)
  ["Payment nahi mila • Next ride lein", "Payment not received • Take next ride", "भुगतान नहीं मिला • अगली यात्रा लें", "Payment nahi mila • Next ride lo"],
  ["10 minute baad system aapko automatic free kar deta hai.", "After 10 minutes the system frees you automatically.", "10 मिनट बाद सिस्टम आपको अपने-आप खाली कर देता है।", "10 minute baad system aapko apne-aap free kar deta hai."],
  ["Closing...", "Closing...", "बंद हो रहा है...", "Close ho raha hai..."],
  ["Closing…", "Closing…", "बंद हो रहा है…", "Close ho raha hai…"],
  ["Ride close ho gayi. Aap next ride ke liye free hain.", "Ride closed. You are free for the next ride.", "यात्रा बंद हो गई। आप अगली यात्रा के लिए खाली हैं।", "Ride close ho gayi. Aap next ride ke liye free ho."],
  ["Ride close ho gayi. Aap next ride ke liye free hain ✅ (customer payment pending)", "Ride closed. You are free for the next ride ✅ (customer payment pending)", "यात्रा बंद हो गई। आप अगली यात्रा के लिए खाली हैं ✅ (ग्राहक का भुगतान बाकी)", "Ride close ho gayi. Aap next ride ke liye free ho ✅ (customer payment pending)"],
  ["Payment already complete hai. Aap next ride ke liye free hain ✅", "Payment is already complete. You are free for the next ride ✅", "भुगतान पहले ही पूरा है। आप अगली यात्रा के लिए खाली हैं ✅", "Payment pehle hi complete hai. Aap next ride ke liye free ho ✅"],
  ["Ride close nahi ho saki.", "The ride could not be closed.", "यात्रा बंद नहीं हो सकी।", "Ride close nahi ho saki."],
  ["Ride close nahi ho saki", "The ride could not be closed", "यात्रा बंद नहीं हो सकी", "Ride close nahi ho saki"],
  ["Ride close nahi hui", "The ride could not be closed", "यात्रा बंद नहीं हुई", "Ride close nahi hui"],
  ["Payment nahi mila? Ride close karke aap turant next booking le sakte hain. Customer ka payment pending rahega aur baad me online pay karne par aapke wallet me aa jayega.", "Payment not received? Close the ride to take the next booking right away. The customer's payment stays pending and reaches your wallet if they pay online later.", "भुगतान नहीं मिला? यात्रा बंद करके तुरंत अगली बुकिंग लें। ग्राहक का भुगतान बाकी रहेगा और बाद में ऑनलाइन भुगतान होने पर आपके वॉलेट में आ जाएगा।", "Payment nahi mila? Ride close karke turant next booking lo. Customer ka payment pending rahega aur baad mein online pay karne par wallet mein aa jayega."],
  ["Payment nahi mila? Ride close karke aap turant next booking le sakte hain. Customer ka payment pending rahega.", "Payment not received? Close the ride to take the next booking right away. The customer's payment stays pending.", "भुगतान नहीं मिला? यात्रा बंद करके तुरंत अगली बुकिंग लें। ग्राहक का भुगतान बाकी रहेगा।", "Payment nahi mila? Ride close karke turant next booking lo. Customer ka payment pending rahega."],

  // --- Customer: pay later (V91)
  ["Baad me pay karunga", "I'll pay later", "बाद में भुगतान करूँगा", "Baad mein pay karunga"],
  ["Payment due hai. Aap nayi ride book kar sakte hain — ye payment kabhi bhi yahin se kar dein.", "Payment is due. You can book a new ride; pay this anytime from here.", "भुगतान बाकी है। आप नई यात्रा बुक कर सकते हैं; यह भुगतान कभी भी यहीं से कर दें।", "Payment due hai. Nayi ride book kar sakte ho; ye payment kabhi bhi yahin se kar do."],

  // --- Official profile (V91)
  ["PERSONAL DETAILS", "PERSONAL DETAILS", "निजी जानकारी", "PERSONAL DETAILS"],
  ["Gender", "Gender", "लिंग", "Gender"],
  ["Date of birth", "Date of birth", "जन्म तिथि", "Date of birth"],
  ["Not added", "Not added", "नहीं जोड़ा गया", "Add nahi kiya"],
  ["Add", "Add", "जोड़ें", "Add karo"],
  ["Edit", "Edit", "बदलें", "Edit"],
  ["🔒 Locked", "🔒 Locked", "🔒 लॉक", "🔒 Locked"],
  ["Select gender", "Select gender", "लिंग चुनें", "Gender chuno"],
  ["Male", "Male", "पुरुष", "Male"],
  ["Female", "Female", "महिला", "Female"],
  ["Other", "Other", "अन्य", "Other"],
  ["Save ke baad date of birth lock ho jayegi.", "Your date of birth will be locked after saving.", "सेव करने के बाद जन्म तिथि लॉक हो जाएगी।", "Save ke baad date of birth lock ho jayegi."],
  ["Date of birth lock hai. Badalne ke liye Help & Support se contact karein.", "Date of birth is locked. Contact Help & Support to change it.", "जन्म तिथि लॉक है। बदलने के लिए सहायता से संपर्क करें।", "Date of birth lock hai. Badalne ke liye Help & Support se contact karo."],
  ["Date chunein", "Choose a date", "तारीख चुनें", "Date chuno"],
  ["Ek option chunein", "Choose an option", "एक विकल्प चुनें", "Ek option chuno"],
  ["Future date nahi ho sakti", "The date cannot be in the future", "भविष्य की तारीख नहीं हो सकती", "Future date nahi ho sakti"],
  ["Saving...", "Saving...", "सेव हो रहा है...", "Save ho raha hai..."],
  ["Save nahi ho saka", "Could not save", "सेव नहीं हो सका", "Save nahi ho saka"],

  // --- Support (V92) — decorated/remaining
  ["⚑ Driver ki complaint", "⚑ Report driver", "⚑ चालक की शिकायत करें", "⚑ Driver ki complaint"],
  ["Confirm karne ke liye", "To confirm, type", "पुष्टि के लिए लिखें", "Confirm karne ke liye"],
  ["likhein", "", "", "likho"],

  // --- Admin Control Center (V92) — remaining
  ["All Customers", "All Customers", "सभी ग्राहक", "Saare customers"],
  ["All Drivers", "All Drivers", "सभी चालक", "Saare drivers"],
  ["Loading…", "Loading…", "लोड हो रहा है…", "Load ho raha hai…"],
  ["Warnings", "Warnings", "चेतावनियाँ", "Warnings"],
  ["↻ Refresh", "↻ Refresh", "↻ रीफ़्रेश", "↻ Refresh"],
  ["Profile ›", "Profile ›", "प्रोफ़ाइल ›", "Profile ›"],
  ["✓ Resolved", "✓ Resolved", "✓ हल हो गई", "✓ Resolved"],
  ["User", "User", "उपयोगकर्ता", "User"],
  ["Type", "Type", "प्रकार", "Type"],
  ["Action", "Action", "कार्रवाई", "Action"],
  ["Complete", "Complete", "पूरी", "Complete"],
  ["✓ driver ne padh liya", "✓ Read by driver", "✓ चालक ने पढ़ लिया", "✓ driver ne padh liya"],
  ["abhi padha nahi", "not read yet", "अभी पढ़ी नहीं", "abhi padha nahi"],
  ["Unblock karo", "Unblock", "अनब्लॉक करें", "Unblock karo"],
  ["User profile", "User profile", "उपयोगकर्ता प्रोफ़ाइल", "User profile"],
  ["Complaints:", "Complaints:", "शिकायतें:", "Complaints:"],
  ["customer ki complaint driver ki profile ke saath — wahin se warning, resolve ya dismiss.", "customer complaints shown with the driver's profile; warn, resolve or dismiss from there.", "ग्राहक की शिकायत चालक की प्रोफ़ाइल के साथ; वहीं से चेतावनी, हल या खारिज करें।", "customer ki complaint driver ki profile ke saath — wahin se warning, resolve ya dismiss."],
  ["Drivers / Customers:", "Drivers / Customers:", "चालक / ग्राहक:", "Drivers / Customers:"],
  ["poori list, search, filter, Excel/CSV download. Kisi par click karo — profile, rides, complaints, warnings.", "full list with search, filters and Excel/CSV download. Click anyone to see profile, rides, complaints and warnings.", "पूरी सूची, खोज, फ़िल्टर और Excel/CSV डाउनलोड। किसी पर क्लिक करें — प्रोफ़ाइल, यात्राएँ, शिकायतें, चेतावनियाँ।", "poori list, search, filter, Excel/CSV download. Kisi par click karo — profile, rides, complaints, warnings."],
  ["Block / Unblock:", "Block / Unblock:", "ब्लॉक / अनब्लॉक:", "Block / Unblock:"],
  ["customer aur driver dono (pehle customer block save hi nahi hota tha — ab fix).", "for both customers and drivers (customer block was not saving before; now fixed).", "ग्राहक और चालक दोनों (पहले ग्राहक ब्लॉक सेव नहीं होता था — अब ठीक)।", "customer aur driver dono (pehle customer block save nahi hota tha — ab fix)."],
  ["Delete requests:", "Deletion requests:", "खाता हटाने के अनुरोध:", "Delete requests:"],
  ["app/website se ya “login bhool gaye” form se aayi requests — verify karke delete.", "requests from the app, website or the “forgot login” form; verify, then delete.", "ऐप/वेबसाइट या “लॉगिन भूल गए” फ़ॉर्म से आए अनुरोध — सत्यापन करके हटाएँ।", "app/website ya “login bhool gaye” form se aayi requests — verify karke delete."],

  // --- Commission (admin)
  ["Commission", "Commission", "कमीशन", "Commission"],
  ["Commission ON/OFF", "Commission ON/OFF", "कमीशन चालू/बंद", "Commission ON/OFF"],
  ["ON · Admin rate active", "ON · Admin rate active", "चालू · एडमिन दर लागू", "ON · Admin rate active"],
  ["OFF · 0% offer", "OFF · 0% offer", "बंद · 0% ऑफ़र", "OFF · 0% offer"],
  ["OFF · 0% commission", "OFF · 0% commission", "बंद · 0% कमीशन", "OFF · 0% commission"],
  ["Nayi rides par set kiya rate lagega.", "New rides use the set rate.", "नई यात्राओं पर तय दर लगेगी।", "Nayi rides par set kiya rate lagega."],
  ["Nayi rides par 0% commission.", "New rides have 0% commission.", "नई यात्राओं पर 0% कमीशन।", "Nayi rides par 0% commission."],
  ["6 mahine ke offer mein commission default OFF hai. Aap Admin panel se kabhi bhi ON/OFF kar sakte hain; automatic ON nahi hoga.", "Commission is OFF by default during the six-month offer. You can switch it ON or OFF any time from the admin panel; it never turns ON automatically.", "छह महीने के ऑफ़र में कमीशन डिफ़ॉल्ट रूप से बंद है। आप एडमिन पैनल से कभी भी चालू/बंद कर सकते हैं; यह अपने-आप चालू नहीं होगा।", "6 mahine ke offer mein commission default OFF hai. Admin panel se kabhi bhi ON/OFF kar sakte ho; apne-aap ON nahi hoga."],
  ["Purani rides ka locked commission nahi badlega.", "Commission already locked on earlier rides will not change.", "पुरानी यात्राओं का तय कमीशन नहीं बदलेगा।", "Purani rides ka locked commission nahi badlega."],
  ["New rate set karein", "Set new rate", "नई दर तय करें", "Naya rate set karo"],
  ["Calculation", "Calculation", "गणना", "Calculation"],
  ["Final fare ka percent (%)", "Percent of final fare (%)", "अंतिम किराये का प्रतिशत (%)", "Final fare ka percent (%)"],
  ["Distance par rupees per km (₹/km)", "Rupees per km of distance (₹/km)", "दूरी पर प्रति किमी रुपये (₹/km)", "Distance par rupees per km (₹/km)"],
  ["Distance limit (km)", "Distance limit (km)", "दूरी सीमा (km)", "Distance limit (km)"],
  ["Jis distance bracket mein ride aati hai, wahi rate poore final fare ya poori distance par lagega.", "The rate of the distance bracket a ride falls in applies to the whole final fare or whole distance.", "यात्रा जिस दूरी सीमा में आती है, उसी की दर पूरे किराये या पूरी दूरी पर लगेगी।", "Ride jis distance bracket mein aati hai, wahi rate poore fare ya poori distance par lagega."],
  ["Preview", "Preview", "पूर्वावलोकन", "Preview"],
  ["Final fare (₹)", "Final fare (₹)", "अंतिम किराया (₹)", "Final fare (₹)"],
  ["Distance (km)", "Distance (km)", "दूरी (km)", "Distance (km)"],
  ["Abhi commission OFF hai. ON karenge to set kiya rate nayi rides par lagega.", "Commission is OFF now. When switched ON, the set rate applies to new rides.", "अभी कमीशन बंद है। चालू करने पर तय दर नई यात्राओं पर लगेगी।", "Abhi commission OFF hai. ON karoge to set rate nayi rides par lagega."],
  ["Save rates", "Save rates", "दरें सेव करें", "Rates save karo"],
  ["Change history", "Change history", "बदलाव इतिहास", "Change history"],
  ["Abhi koi badlav record nahi hua.", "No changes recorded yet.", "अभी कोई बदलाव दर्ज नहीं हुआ।", "Abhi koi badlav record nahi hua."],
  ["Commission activate ho gaya. Nayi rides par lagega.", "Commission activated. It applies to new rides.", "कमीशन चालू हो गया। नई यात्राओं पर लगेगा।", "Commission activate ho gaya. Nayi rides par lagega."],
  ["Policy save hui; commission OFF hai.", "Policy saved; commission is OFF.", "नीति सेव हुई; कमीशन बंद है।", "Policy save hui; commission OFF hai."],
  ["Commission settings load nahi hui. Refresh kariye.", "Commission settings did not load. Please refresh.", "कमीशन सेटिंग लोड नहीं हुई। रीफ़्रेश करें।", "Commission settings load nahi hui. Refresh karo."],
  ["Save nahi hua. Dobara koshish kariye.", "Not saved. Please try again.", "सेव नहीं हुआ। फिर कोशिश करें।", "Save nahi hua. Dobara try karo."],
  ["Admin rate", "Admin rate", "एडमिन दर", "Admin rate"],
  ["Fare minus commission", "Fare minus commission", "किराया घटा कमीशन", "Fare minus commission"],
  ["poora fare driver earnings", "the full fare as driver earnings", "पूरा किराया चालक की कमाई", "poora fare driver earnings"],
  ["6 mahine ke offer mein 0% HimRideG commission", "0% HimRideG commission during the six-month offer", "छह महीने के ऑफ़र में 0% HimRideG कमीशन", "6 mahine ke offer mein 0% HimRideG commission"],
  // --- V96: website se APK download
  ["HimRideG Customer App", "HimRideG Customer App", "HimRideG ग्राहक ऐप", "HimRideG Customer App"],
  ["HimRideG Driver App", "HimRideG Driver App", "HimRideG ड्राइवर ऐप", "HimRideG Driver App"],
  ["Android APK · Book rides", "Android APK · Book rides", "Android APK · राइड बुक करें", "Android APK · Ride book karo"],
  ["Android APK · For drivers", "Android APK · For drivers", "Android APK · ड्राइवरों के लिए", "Android APK · Drivers ke liye"],
  // --- V94: Platform Fee (pehle "Commission") — 3 km range
  ["Platform Fee", "Platform Fee", "प्लेटफ़ॉर्म शुल्क", "Platform Fee"],
  ["PLATFORM FEE · OFF", "PLATFORM FEE · OFF", "प्लेटफ़ॉर्म शुल्क · बंद", "PLATFORM FEE · OFF"],
  ["PLATFORM FEE · ON", "PLATFORM FEE · ON", "प्लेटफ़ॉर्म शुल्क · चालू", "PLATFORM FEE · ON"],
  ["Drivers keep 100% of the fare", "Drivers keep 100% of the fare", "चालक पूरा 100% किराया रखते हैं", "Drivers poora 100% fare rakhte hain"],
  ["Set fee & turn ON", "Set fee & turn ON", "शुल्क तय करें और चालू करें", "Fee set karke ON karo"],
  ["Applies to new rides only", "Applies to new rides only", "सिर्फ़ नई यात्राओं पर लागू", "Sirf nayi rides par lagega"],
  ["Turn OFF (0%)", "Turn OFF (0%)", "बंद करें (0%)", "OFF karo (0%)"],
  ["% of fare", "% of fare", "किराये का %", "Fare ka %"],
  ["₹ per km", "₹ per km", "₹ प्रति किमी", "₹ per km"],
  ["Range 1", "Range 1", "सीमा 1", "Range 1"],
  ["Range 2", "Range 2", "सीमा 2", "Range 2"],
  ["Range 3", "Range 3", "सीमा 3", "Range 3"],
  ["km", "km", "किमी", "km"],
  ["Range 2 must end after Range 1", "Range 2 must end after Range 1", "सीमा 2, सीमा 1 के बाद खत्म होनी चाहिए", "Range 2, Range 1 ke baad khatam honi chahiye"],
  ["EXAMPLE", "EXAMPLE", "उदाहरण", "EXAMPLE"],
  ["Fare ₹", "Fare ₹", "किराया ₹", "Fare ₹"],
  ["Distance km", "Distance km", "दूरी किमी", "Distance km"],
  ["Driver gets", "Driver gets", "चालक को मिलेगा", "Driver ko milega"],
  ["Free period until (shown to admin; fee never turns ON by itself)", "Free period until (shown to admin; fee never turns ON by itself)", "मुफ़्त अवधि कब तक (सिर्फ़ जानकारी; शुल्क अपने-आप चालू नहीं होगा)", "Free period kab tak (sirf jaankari; fee apne-aap ON nahi hogi)"],
  ["Save, keep OFF", "Save, keep OFF", "सेव करें, बंद रखें", "Save karo, OFF rakho"],
  ["Save & turn ON", "Save & turn ON", "सेव करें और चालू करें", "Save karke ON karo"],
  ["Platform fee is ON for new rides.", "Platform fee is ON for new rides.", "नई यात्राओं के लिए प्लेटफ़ॉर्म शुल्क चालू है।", "Nayi rides ke liye platform fee ON hai."],
  ["Platform fee is OFF. New rides: 0%.", "Platform fee is OFF. New rides: 0%.", "प्लेटफ़ॉर्म शुल्क बंद है। नई यात्राएँ: 0%।", "Platform fee OFF hai. Nayi rides: 0%."],
  ["Platform fee settings did not load. Please refresh.", "Platform fee settings did not load. Please refresh.", "प्लेटफ़ॉर्म शुल्क सेटिंग लोड नहीं हुई। रीफ़्रेश करें।", "Platform fee settings load nahi hui. Refresh karo."],
  ["Not saved. Please try again.", "Not saved. Please try again.", "सेव नहीं हुआ। फिर कोशिश करें।", "Save nahi hua. Dobara try karo."],
  ["No changes recorded yet.", "No changes recorded yet.", "अभी कोई बदलाव दर्ज नहीं हुआ।", "Abhi koi badlav record nahi hua."],
  ["Cancel", "Cancel", "रद्द करें", "Cancel"],
  ["Save", "Save", "सेव करें", "Save"],
  ["Free until", "Free until", "मुफ़्त अवधि", "Free period"],
  ["HimRideG Platform Fee", "HimRideG Platform Fee", "HimRideG प्लेटफ़ॉर्म शुल्क", "HimRideG Platform Fee"],
  ["Fare minus platform fee", "Fare minus platform fee", "किराया घटा प्लेटफ़ॉर्म शुल्क", "Fare minus platform fee"]
];

// Text with a changing value: {0}
const patterns = [
  ["Kul {0} customers", "Total {0} customers", "कुल {0} ग्राहक", "Kul {0} customers"],
  ["Kul {0} drivers", "Total {0} drivers", "कुल {0} चालक", "Kul {0} drivers"],
  ["{0} complaints", "{0} complaints", "{0} शिकायतें", "{0} complaints"],
  ["Page {0} / {1}", "Page {0} / {1}", "पेज {0} / {1}", "Page {0} / {1}"],
  ["Warning: {0}", "Warning: {0}", "चेतावनी: {0}", "Warning: {0}"],
  ["{0} ki complaint", "Report {0}", "{0} की शिकायत", "{0} ki complaint"],
  ["Limit tak rate {0}", "Rate up to limit {0}", "सीमा तक दर {0}", "Limit tak rate {0}"],
  ["Limit se upar rate {0}", "Rate above limit {0}", "सीमा से ऊपर दर {0}", "Limit se upar rate {0}"],
  // V94
  ["Free until {0}", "Free until {0}", "{0} तक मुफ़्त", "{0} tak free"],
  ["{0} days left", "{0} days left", "{0} दिन बाकी", "{0} din baaki"],
  ["{0} to", "{0} to", "{0} से", "{0} se"],
  ["Above {0} km", "Above {0} km", "{0} किमी से ऊपर", "{0} km se upar"]
];

const rowMap = new Map(rows.map((row) => [row[0].replace(/\s+/g, " ").trim().toLowerCase(), row]));

export const V93_ENTRIES = rows
  .filter(([, en, hi]) => en && hi)
  .map(([source, en, hi]) => ({ en, hi, aliases: [source] }));

export const V93_HINGLISH = new Map(
  rows.filter(([, en]) => en).map(([, en, , hinglish]) => [en.toLowerCase(), hinglish])
);

export const V93_PATTERNS = patterns.map(([source, en, hi, hinglish]) => ({ source, en, hi, hinglish }));

// Browser popups (confirm / prompt / alert) DOM translator tak nahi pahunchte.
// Ye helper current website language (<html lang>) ke hisaab se text deta hai.
export function currentWebLanguage() {
  if (typeof document === "undefined") return "en";
  const lang = String(document.documentElement.getAttribute("lang") || "en").toLowerCase();
  if (lang === "hi-latn") return "hinglish";
  if (lang === "hi") return "hi";
  return "en";
}

export function tr(source, values = {}) {
  const row = rowMap.get(String(source || "").replace(/\s+/g, " ").trim().toLowerCase());
  const language = currentWebLanguage();
  let text = row
    ? (language === "hi" ? row[2] : language === "hinglish" ? row[3] : row[1]) || source
    : source;
  Object.keys(values).forEach((key) => {
    text = text.split(`{${key}}`).join(String(values[key]));
  });
  return text;
}

// Popup sentences (source Hinglish → en / hi / hinglish)
const DIALOGS = {
  dobConfirm: [
    "{0}\n\nAfter saving, your date of birth will be locked. To change it later you will need to contact Help & Support. Confirm?",
    "{0}\n\nसेव करने के बाद जन्म तिथि लॉक हो जाएगी। बाद में बदलने के लिए सहायता से संपर्क करना होगा। पुष्टि करें?",
    "{0}\n\nSave hone ke baad date of birth lock ho jayegi. Badalne ke liye Help & Support se contact karna hoga. Confirm?"
  ],
  dismissReason: ["Reason for dismissing (optional):", "खारिज करने का कारण (वैकल्पिक):", "Dismiss karne ka reason (optional):"],
  deleteAccountConfirm: [
    "Delete the account of {0}?{1}\n\nName, phone, email and photo will be removed. This cannot be undone.",
    "{0} का खाता हटाएँ?{1}\n\nनाम, फ़ोन, ईमेल और फ़ोटो हट जाएँगे। यह वापस नहीं होगा।",
    "{0} ka account delete karein?{1}\n\nNaam, phone, email, photo hat jayenge. Ye wapas nahi hoga."
  ],
  publicVerify: [
    "\n\nThis request came WITHOUT LOGIN. Call that number first and confirm it is the real owner.",
    "\n\nयह अनुरोध बिना लॉगिन के आया है। पहले उस नंबर पर कॉल करके पुष्टि करें कि असली मालिक है।",
    "\n\nYe request LOGIN KE BINA aayi hai. Pehle us number par call karke confirm kar lein ki asli owner hai."
  ],
  forceReason: ["Write the reason for force delete:", "जबरन हटाने का कारण लिखें:", "Force delete ka reason likhein:"],
  blockedDelete: [
    "Deletion should wait:\n• {0}\n\nForce delete anyway?",
    "अभी हटाना रुकना चाहिए:\n• {0}\n\nफिर भी जबरन हटाएँ?",
    "Delete abhi rukna chahiye:\n• {0}\n\nPhir bhi FORCE delete karna hai?"
  ],
  rejectReason: ["Reason for rejecting (shown to the user):", "अस्वीकार करने का कारण (उपयोगकर्ता को दिखेगा):", "Reject karne ka reason (user ko dikhega):"],
  rejectDefault: ["Verification could not be completed", "सत्यापन नहीं हो पाया", "Verification nahi ho payi"],
  blockReason: ["Reason for blocking:", "ब्लॉक करने का कारण:", "Block karne ka reason:"],
  adminDeleteReason: [
    "Reason for DELETING the account of {0} (cannot be undone):",
    "{0} का खाता हटाने का कारण (यह वापस नहीं होगा):",
    "{0} ka account DELETE karne ka reason (ye wapas nahi hoga):"
  ],
  blockers: [
    "Blocked:\n• {0}\n\nForce delete anyway?",
    "रुकावट:\n• {0}\n\nफिर भी जबरन हटाएँ?",
    "Rukawat:\n• {0}\n\nPhir bhi FORCE delete?"
  ],
  commissionOn: [
    "Switch commission ON?\n\nUp to {0} km: {1} {3}\nAbove {0} km: {2} {3}\n\nThis applies only to NEW rides whose fare gets locked.",
    "कमीशन चालू करें?\n\n{0} km तक: {1} {3}\n{0} km से ऊपर: {2} {3}\n\nयह केवल नई यात्राओं पर लगेगा जिनका किराया अब तय होगा।",
    "Commission ON karna hai?\n\n{0} km tak: {1} {3}\n{0} km se upar: {2} {3}\n\nYe sirf NAYI fare-lock hone wali rides par lagega."
  ],
  commissionPromo: [
    "\n\nNote: drivers were told about the 0% offer until 7 April 2027.",
    "\n\nध्यान दें: चालकों को 7 अप्रैल 2027 तक 0% ऑफ़र बताया गया है।",
    "\n\nDhyan dein: drivers ko 7 April 2027 tak 0% offer bataya gaya hai."
  ],
  // V94: Platform fee — 3 ranges
  feeOn3: [
    "Turn platform fee ON?\n\n0–{0} km: {2} {5}\n{0}–{1} km: {3} {5}\nAbove {1} km: {4} {5}\n\nApplies only to NEW rides whose fare gets locked.",
    "प्लेटफ़ॉर्म शुल्क चालू करें?\n\n0–{0} किमी: {2} {5}\n{0}–{1} किमी: {3} {5}\n{1} किमी से ऊपर: {4} {5}\n\nयह केवल नई यात्राओं पर लगेगा।",
    "Platform fee ON karna hai?\n\n0–{0} km: {2} {5}\n{0}–{1} km: {3} {5}\n{1} km se upar: {4} {5}\n\nSirf NAYI rides par lagegi."
  ],
  closeUnpaid: [
    "Payment not received? Close the ride to take the next booking right away. The customer's payment stays pending and reaches your wallet if they pay online later.",
    "भुगतान नहीं मिला? यात्रा बंद करके तुरंत अगली बुकिंग लें। ग्राहक का भुगतान बाकी रहेगा और बाद में ऑनलाइन भुगतान होने पर आपके वॉलेट में आ जाएगा।",
    "Payment nahi mila? Ride close karke turant next booking lo. Customer ka payment pending rahega aur baad mein online pay karne par wallet mein aa jayega."
  ]
};

export function dialogText(key, ...values) {
  const set = DIALOGS[key];
  if (!set) return "";
  const language = currentWebLanguage();
  let text = language === "hi" ? set[1] : language === "hinglish" ? set[2] : set[0];
  values.forEach((value, index) => {
    text = text.split(`{${index}}`).join(String(value ?? ""));
  });
  return text;
}
