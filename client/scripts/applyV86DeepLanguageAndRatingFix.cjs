const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const providerPath = path.join(root, "src/i18n/AppLanguageProvider.jsx");

if (!fs.existsSync(providerPath)) {
  console.error("HimRideG V86 target missing: src/i18n/AppLanguageProvider.jsx");
  process.exit(1);
}

let source = fs.readFileSync(providerPath, "utf8");

/*
|--------------------------------------------------------------------------
| V86 — Deep bilingual audit + dynamic text/rating repair
|--------------------------------------------------------------------------
| TEXT TRANSLATION ONLY. Dashboard layout/CSS/maps/cards/buttons/ride flow,
| payment flow, wallet, sockets, 5% platform-fee logic and backend APIs are
| untouched. This also fixes stale React text-node tracking which could make
| every rating star keep showing the first label ("Bahut bura").
|--------------------------------------------------------------------------
*/

if (!source.includes("V86_DEEP_LANGUAGE_ENTRIES")) {
  const entries = [
    // Driver earnings / fee overlay
    ["Driver Earnings", "ड्राइवर कमाई", []],
    ["Earnings & Platform Fee", "कमाई और प्लेटफॉर्म फीस", ["कमाई और प्लेटफॉर्म फीस"]],
    ["Outstanding Platform Fee", "बकाया प्लेटफॉर्म फीस", ["बकाया प्लेटफॉर्म फीस"]],
    ["Test Mode On", "टेस्ट मोड चालू", ["टेस्ट मोड चालू"]],
    ["New Rides Blocked", "नई Ride बंद", ["नई Ride बंद"]],
    ["Rides Available", "Ride चालू", ["Ride चालू"]],
    ["Fee Clear ✓", "फीस साफ ✓", ["फीस साफ ✓"]],
    ["This is a test account. Platform fee blocking will not apply to new Rides. Turn off Test Mode from Admin after testing is complete.", "यह परीक्षण खाता है। नई Ride लेने पर प्लेटफॉर्म फीस का लॉक लागू नहीं होगा। टेस्ट पूरा होने पर Admin से टेस्ट मोड बंद करें।", []],
    ["Pay your outstanding platform fee before accepting a new Ride. New Rides cannot be accepted when the outstanding fee is ₹100 or more.", "नई Ride लेने के लिए पहले अपनी बकाया प्लेटफॉर्म फीस जमा करें। बकाया फीस ₹100 या उससे ज्यादा होने पर नई Ride स्वीकार नहीं होगी।", []],
    ["Your outstanding platform fee is below ₹100, so you can continue taking new Rides. Pay the platform fee on time to avoid interruption.", "बकाया प्लेटफॉर्म फीस ₹100 से कम है, इसलिए आप नई Ride लेते रह सकते हैं। बिना रुकावट Ride लेने के लिए समय पर प्लेटफॉर्म फीस जमा करें।", []],
    ["Your platform fee is fully clear. You can take new Rides.", "आपकी प्लेटफॉर्म फीस पूरी तरह साफ है। आप नई Ride ले सकते हैं।", []],
    ["This is a test account. Platform fee blocking is currently disabled.", "यह परीक्षण खाता है। प्लेटफॉर्म फीस लॉक अभी लागू नहीं होगा।", []],
    ["Platform Fee Paid", "जमा प्लेटफॉर्म फीस", ["जमा प्लेटफॉर्म फीस"]],
    ["Primary Receiving Account", "पैसे प्राप्त करने का मुख्य खाता", ["पैसे प्राप्त करने का मुख्य खाता"]],
    ["Primary Bank Account", "मुख्य बैंक खाता", ["मुख्य बैंक खाता"]],
    ["Primary UPI", "मुख्य UPI", ["मुख्य UPI"]],
    ["No account selected", "कोई खाता चुना नहीं", ["कोई खाता चुना नहीं"]],
    ["Add an account from the App/Website UPI & Bank Settings", "App/Website की UPI और बैंक सेटिंग्स से खाता जोड़ें", ["App/Website के UPI और बैंक सेटिंग्स से खाता जोड़ें"]],
    ["Manage", "मैनेज करें", ["मैनेज करें", "Manage"]],
    ["Add", "जोड़ें", ["जोड़ें"]],
    ["UPI & Bank Settings", "UPI और बैंक सेटिंग्स", ["UPI और बैंक सेटिंग्स"]],
    ["Customer Direct UPI/Cash fare goes to the Driver and HimRideG tracks only a 5% platform fee. After RazorpayX is enabled, automatic payouts will go to the selected primary account.", "Customer का Direct UPI/Cash किराया Driver को मिलेगा और HimRideG केवल 5% प्लेटफॉर्म फीस ट्रैक करेगा। RazorpayX चालू होने के बाद अपने आप भुगतान इसी चुने हुए मुख्य खाते पर जाएगा।", ["Customer का Direct UPI/Cash किराया Driver को मिलेगा और HimRideG केवल 5% प्लेटफॉर्म फीस ट्रैक करेगा। RazorpayX चालू होने के बाद अपने आप भुगतान इसी चुने हुए मुख्य खाते पर जाएगा।", "Customer का Direct UPI/Cash किराया Driver को मिलेगा और HimRideG केवल 10% प्लेटफॉर्म फीस ट्रैक करेगा। RazorpayX चालू होने के बाद अपने आप भुगतान इसी चुने हुए मुख्य खाते पर जाएगा।"]],
    ["Updating…", "अपडेट हो रहा है…", ["अपडेट हो रहा है…"]],

    // Payout settings panel
    ["DRIVER ACCOUNT", "चालक खाता", []],
    ["RECEIVING MONEY", "राशि प्राप्ति", []],
    ["Primary Payout Account", "मुख्य भुगतान खाता", []],
    ["After an online Ride payment is verified, the HimRideG platform fee is deducted. When RazorpayX live access is available, the payout will be processed to the selected Primary account.", "ऑनलाइन Ride भुगतान सत्यापित होने के बाद HimRideG प्लेटफॉर्म फीस काटी जाती है। RazorpayX लाइव उपलब्ध होने पर भुगतान चुने हुए मुख्य खाते में भेजा जाएगा।", ["Online ride payment verify hone ke baad HimRideG platform fee deduct hoti hai. RazorpayX live access available ho to payout selected Primary account par process hoga."]],
    ["No primary account", "कोई मुख्य खाता नहीं", []],
    ["UPI Account", "UPI खाता", []],
    ["Add UPI or bank account below", "नीचे UPI या बैंक खाता जोड़ें", []],
    ["PRIMARY", "मुख्य", []],
    ["Add payment method", "भुगतान तरीका जोड़ें", []],
    ["Add UPI ID", "UPI ID जोड़ें", []],
    ["Open your UPI app, copy your UPI ID, then paste it here. HimRideG never reads a UPI ID silently from another app.", "अपना UPI ऐप खोलें, UPI ID कॉपी करें और यहाँ पेस्ट करें। HimRideG किसी दूसरे ऐप से UPI ID बिना अनुमति नहीं पढ़ता।", ["Apni UPI app kholo, UPI ID copy karo, phir yahan paste karo. HimRideG doosri app se UPI ID silently read nahi karta."]],
    ["Save UPI", "UPI सहेजें", []],
    ["Saving...", "सहेजा जा रहा है...", []],
    ["Account Holder Name", "खाताधारक का नाम", []],
    ["Bank Name", "बैंक का नाम", []],
    ["Account Number", "खाता संख्या", []],
    ["Confirm Account Number", "खाता संख्या की पुष्टि करें", []],
    ["Name as per bank", "बैंक रिकॉर्ड के अनुसार नाम", []],
    ["Bank name", "बैंक का नाम", []],
    ["Account number", "खाता संख्या", []],
    ["Re-enter account number", "खाता संख्या दोबारा दर्ज करें", []],
    ["Save Bank Account", "बैंक खाता सहेजें", []],
    ["Payment Accounts", "भुगतान खाते", []],
    ["Loading saved accounts…", "सहेजे गए खाते लोड हो रहे हैं…", []],
    ["Bank Account", "बैंक खाता", []],
    ["Account", "खाता", []],
    ["Make Primary Receiving Account", "मुख्य राशि प्राप्ति खाता बनाएँ", []],
    ["Future automatic payouts will go to this Primary account.", "भविष्य के स्वचालित भुगतान इसी मुख्य खाते में जाएंगे।", ["Future automatic payouts is Primary account par jayenge."]],
    ["Delete / Remove", "हटाएँ", []],
    ["No UPI or bank account is saved yet.", "अभी कोई UPI या बैंक खाता सहेजा नहीं गया है।", ["Abhi koi UPI ya bank account saved nahi hai."]],
    ["Bank/UPI details will be used for payouts. HimRideG never asks for your UPI PIN, OTP or bank password.", "Bank/UPI विवरण भुगतान के लिए उपयोग होंगे। HimRideG कभी UPI PIN, OTP या बैंक पासवर्ड नहीं मांगता।", ["Bank/UPI details payout ke liye use hongi. UPI PIN, OTP ya bank password HimRideG kabhi nahi maangta."]],
    ["UPI app did not open. Paste the UPI ID manually.", "UPI ऐप नहीं खुला। UPI ID को स्वयं पेस्ट करें।", ["UPI app open nahi hui. UPI ID manually paste karein."]],
    ["Enter a valid UPI ID, for example name@upi.", "मान्य UPI ID दर्ज करें, जैसे name@upi।", ["Valid UPI ID enter karein, jaise name@upi."]],
    ["UPI receiving method saved.", "UPI प्राप्ति तरीका सहेजा गया।", ["UPI receiving method save ho gaya."]],
    ["UPI could not be saved.", "UPI सहेजा नहीं जा सका।", ["UPI save nahi hui."]],
    ["Account holder name is required.", "खाताधारक का नाम आवश्यक है।", ["Account holder name required hai."]],
    ["Bank name is required.", "बैंक का नाम आवश्यक है।", ["Bank name required hai."]],
    ["Enter a valid account number and IFSC.", "मान्य खाता संख्या और IFSC दर्ज करें।", ["Valid account number aur IFSC enter karein."]],
    ["Account number and confirmation do not match.", "खाता संख्या और पुष्टि मेल नहीं खाते।", ["Account number aur confirm account number match nahi karte."]],
    ["Bank account saved.", "बैंक खाता सहेजा गया।", ["Bank account save ho gaya."]],
    ["Bank account could not be saved.", "बैंक खाता सहेजा नहीं जा सका।", ["Bank account save nahi hua."]],
    ["Primary receiving account updated.", "मुख्य राशि प्राप्ति खाता अपडेट हुआ।", ["Primary receiving account update ho gaya."]],
    ["Primary account could not be changed.", "मुख्य खाता बदला नहीं जा सका।", ["Primary account change nahi hua."]],
    ["Remove this payout method?", "क्या यह भुगतान तरीका हटाना है?", ["Is payout method ko remove karna hai?"]],
    ["Payment method removed.", "भुगतान तरीका हटा दिया गया।", ["Payment method remove ho gaya."]],
    ["Payment method could not be removed.", "भुगतान तरीका हटाया नहीं जा सका।", ["Payment method remove nahi hua."]],

    // Driver history
    ["DRIVER HISTORY", "चालक इतिहास", []],
    ["Fare, Platform Fee, Payment and Driver Net", "किराया, प्लेटफॉर्म फीस, भुगतान और चालक की शुद्ध कमाई", ["Fare, Platform Fee, Payment aur Driver Net"]],
    ["Net", "शुद्ध", []],
    ["Fee Due", "बकाया फीस", []],
    ["Completed, Cancelled and Previous Rides", "पूर्ण, रद्द और पिछली Rides", ["Completed, Cancelled aur Previous Rides"]],
    ["Total", "कुल", []],
    ["Today", "आज", []],
    ["This Month", "इस महीने", []],
    ["Total Fare", "कुल किराया", []],
    ["Driver Net", "चालक की शुद्ध कमाई", []],
    ["Received ✓", "प्राप्त ✓", []],
    ["Payment Method", "भुगतान तरीका", []],
    ["Driver UPI", "चालक UPI", []],
    ["HimRideG Online", "HimRideG ऑनलाइन", []],
    ["Paid ✓", "भुगतान हुआ ✓", []],
    ["Date & Time", "तारीख और समय", []],
    ["Distance", "दूरी", []],
    ["Payment / Status", "भुगतान / स्थिति", []],
    ["No earning record for this filter.", "इस फ़िल्टर में अभी कमाई का कोई रिकॉर्ड नहीं है।", ["Is filter me abhi earning record nahi hai."]],
    ["No Ride for this filter.", "इस फ़िल्टर में कोई Ride नहीं है।", ["Is filter me koi ride nahi hai."]],

    // Direct-driver UPI / payment confirmation
    ["Driver UPI is not available", "चालक UPI उपलब्ध नहीं है", ["Driver UPI available nahi hai"]],
    ["Driver UPI could not be loaded", "चालक UPI लोड नहीं हो सका", ["Driver UPI load nahi hua"]],
    ["UPI app did not open. Copy the UPI ID and make the payment manually.", "UPI ऐप नहीं खुला। UPI ID कॉपी करके स्वयं भुगतान करें।", ["UPI app open nahi hui. UPI ID copy karke manually payment karein."]],
    ["Payment confirmation could not be sent to the Driver", "भुगतान पुष्टि चालक को नहीं भेजी जा सकी", ["Payment confirmation driver ko nahi bheji ja saki"]],
    ["Payment confirmation could not be sent", "भुगतान पुष्टि नहीं भेजी जा सकी", ["Payment confirmation nahi bheji ja saki"]],
    ["Loading Driver UPI…", "चालक UPI लोड हो रहा है…", ["Driver UPI loading…"]],
    ["Pay Driver Direct UPI", "चालक को सीधे UPI से भुगतान करें", []],
    ["Until RazorpayX approval, you can pay the fare directly to the Driver's saved UPI.", "RazorpayX स्वीकृति तक किराया चालक के सहेजे हुए UPI पर सीधे भुगतान किया जा सकता है।", ["RazorpayX approval tak fare seedha driver ke saved UPI par pay kar sakte hain."]],
    ["DIRECT DRIVER UPI", "सीधा चालक UPI", []],
    ["Copied ✓", "कॉपी हुआ ✓", []],
    ["Copy UPI", "UPI कॉपी करें", []],
    ["Informing the Driver…", "चालक को बताया जा रहा है…", ["Driver ko bata rahe hain…"]],
    ["Press “I Paid” only after the payment is successful in your UPI app. Payment becomes final only after the Driver checks the amount in their account and confirms it.", "UPI ऐप में भुगतान सफल होने के बाद ही “मैंने भुगतान किया” दबाएँ। भुगतान तभी अंतिम होगा जब चालक अपने खाते में राशि जाँचकर पुष्टि करेगा।", ["Sirf UPI app me payment successful hone ke baad “I Paid” dabayein. Payment tabhi final hogi jab driver apne account me amount check karke confirm karega."]],

    // Driver payment modal
    ["Confirming…", "पुष्टि हो रही है…", []],
    ["Confirm payment only after physically receiving the cash. Customer response is not required.", "नकद वास्तव में मिलने के बाद ही पुष्टि करें। ग्राहक की प्रतिक्रिया आवश्यक नहीं है।", ["Cash physically milne ke baad hi confirm karein. Customer response required nahi hai."]],
    ["Cash selected by customer", "ग्राहक ने नकद चुना", []],
    ["Waiting for customer", "ग्राहक की प्रतीक्षा", []],
    ["Payment complete", "भुगतान पूर्ण", []],
    ["Close payment status", "भुगतान स्थिति बंद करें", []],

    // Fare negotiation — customer visible
    ["Fare accepted. GO TO PICKUP is now enabled for the Driver.", "किराया स्वीकार हो गया। चालक के लिए GO TO PICKUP अब सक्रिय है।", ["Fare accept ho gaya. Driver ka GO TO PICKUP ab enabled hai."]],
    ["Final Fare Sync Recovery", "अंतिम किराया सिंक सुधार", []],
    ["The Driver's final fare amount did not sync. The Driver must resend the FINAL fare. ₹0 will never be shown for Accept/Reject.", "चालक का अंतिम किराया सिंक नहीं हुआ। चालक को FINAL किराया दोबारा भेजना होगा। Accept/Reject के लिए ₹0 कभी नहीं दिखाया जाएगा।", ["Driver final fare amount sync nahi hua. Driver ko FINAL fare resend karna hoga. ₹0 ko Accept/Reject ke liye kabhi show nahi kiya jayega."]],
    ["Driver FINAL Fare", "चालक का FINAL किराया", []],
    ["This is the Driver's final offer. You can now only Accept or Reject it. Accepting locks the fare and enables GO TO PICKUP for the Driver.", "यह चालक का अंतिम प्रस्ताव है। अब केवल Accept या Reject किया जा सकता है। Accept करने पर किराया तय होगा और चालक के लिए GO TO PICKUP सक्रिय होगा।", ["Ye driver ka final offer hai. Ab sirf Accept ya Reject kar sakte hain. Accept par fare lock hoga aur driver ka GO TO PICKUP enable hoga."]],
    ["One-Time Counter Sent", "एक बार का काउंटर भेजा गया", []],
    ["Waiting for the Driver's FINAL fare... Counter Offer is no longer available.", "चालक के FINAL किराए की प्रतीक्षा है... अब Counter Offer दोबारा उपलब्ध नहीं होगा।", ["Waiting for driver FINAL fare... Counter Offer ab dobara available nahi hoga."]],
    ["Driver Fare", "चालक किराया", []],
    ["If you like the fare, Accept it. You can Reject it or send one Counter Offer.", "किराया ठीक लगे तो Accept करें। आप Reject कर सकते हैं या एक बार Counter Offer भेज सकते हैं।", ["Fare pasand hai to Accept karein. Reject kar sakte hain, ya ek baar Counter Offer bhej sakte hain."]],
    ["Counter Offer", "काउंटर प्रस्ताव", []],
    ["One-time counter fare (₹)", "एक बार का काउंटर किराया (₹)", []],
    ["A Counter can be sent only once. After the Counter, the Driver will send one FINAL fare.", "काउंटर केवल एक बार भेजा जा सकता है। इसके बाद चालक एक FINAL किराया भेजेगा।", ["Counter sirf ek baar bhej sakte hain. Counter ke baad driver ek FINAL fare bhejega."]],
    ["Fare Rejected", "किराया अस्वीकार किया गया", []],
    ["Searching for a new nearby Driver.", "नया नज़दीकी चालक खोजा जा रहा है।", ["Naya nearby driver search ho raha hai."]],
    ["Waiting for Driver Fare", "चालक के किराए की प्रतीक्षा", []],
    ["Accept / Reject / Counter will appear here as soon as the Driver sends the initial fare.", "चालक प्रारंभिक किराया भेजते ही Accept / Reject / Counter यहाँ दिखाई देगा।", ["Driver initial fare bhejte hi Accept / Reject / Counter yahin dikhega."]],

    // Rating modal — aliases include the old Hinglish labels
    ["Very poor", "बहुत खराब", ["Bahut bura"]],
    ["Poor", "खराब", ["Theek nahi tha"]],
    ["Okay", "ठीक", ["Theek tha"]],
    ["Good", "अच्छा", ["Achha tha"]],
    ["Excellent", "बहुत अच्छा", ["Bahut achha!"]],
    ["Ride Complete!", "Ride पूरी हुई!", []],
    ["Total Fare", "कुल किराया", []],
    ["Write a comment (optional)...", "टिप्पणी लिखें (वैकल्पिक)...", ["Koi comment likhein (optional)..."]],
    ["Please give a star rating", "कृपया स्टार रेटिंग दें", ["Kripya star rating zaroor dein"]],
    ["Rating could not be submitted", "रेटिंग जमा नहीं हो सकी", ["Rating submit nahi ho saki"]],
    ["Submitting Rating...", "रेटिंग जमा हो रही है...", ["Submit ho raha hai..."]],
    ["Submit Rating", "रेटिंग जमा करें", ["Rating Submit Karein"]],
    ["Do it later", "बाद में करें", ["Baad mein karein"]]
  ];

  const aliasIndex = source.indexOf("const aliasMap = (() => {");
  const arrayEnd = source.lastIndexOf("];", aliasIndex);
  if (aliasIndex < 0 || arrayEnd < 0) {
    console.error("HimRideG V86 translation dictionary boundary missing");
    process.exit(1);
  }

  const lines = entries.map(([en, hi, aliases]) => {
    const aliasPart = aliases && aliases.length ? `, aliases: ${JSON.stringify(aliases)}` : "";
    return `  { en: ${JSON.stringify(en)}, hi: ${JSON.stringify(hi)}${aliasPart} },`;
  }).join("\n");

  source = source.slice(0, arrayEnd) +
    `  // V86_DEEP_LANGUAGE_ENTRIES\n${lines}\n` +
    source.slice(arrayEnd);
}

// Dynamic amount/name strings which cannot be represented as exact dictionary entries.
if (!source.includes("V86_DYNAMIC_LANGUAGE_PATTERNS")) {
  const anchor = "  const patterns = [\n";
  if (!source.includes(anchor)) {
    console.error("HimRideG V86 patterns anchor missing");
    process.exit(1);
  }

  const patterns = `  const patterns = [\n    // V86_DYNAMIC_LANGUAGE_PATTERNS\n    {\n      re: /^Aapki ride successfully complete ho gayi\\. (.+) ko rate karein\\.$/i,\n      en: (m) => \`Your Ride was completed successfully. Rate \\${m[1]}.\`,\n      hi: (m) => \`आपकी Ride सफलतापूर्वक पूरी हुई। \\${m[1]} को रेट करें।\`\n    },\n    {\n      re: /^Cash Received\\s*(₹[\\d,.]+)$/i,\n      en: (m) => \`Cash Received \\${m[1]}\`,\n      hi: (m) => \`नकद प्राप्त \\${m[1]}\`\n    },\n    {\n      re: /^Open UPI App · Pay\\s*(₹[\\d,.]+)$/i,\n      en: (m) => \`Open UPI App · Pay \\${m[1]}\`,\n      hi: (m) => \`UPI ऐप खोलें · \\${m[1]} भुगतान करें\`\n    },\n    {\n      re: /^I Paid\\s*(₹[\\d,.]+)\\s*· Driver Verify Kare$/i,\n      en: (m) => \`I Paid \\${m[1]} · Driver Verify\`,\n      hi: (m) => \`मैंने \\${m[1]} भुगतान किया · चालक सत्यापित करे\`\n    },\n    {\n      re: /^प्लेटफॉर्म फीस ₹([\\d,.]+) जमा करें$/i,\n      en: (m) => \`Pay Platform Fee ₹\\${m[1]}\`,\n      hi: (m) => \`प्लेटफॉर्म फीस ₹\\${m[1]} जमा करें\`\n    },\n    {\n      re: /^(\\d+) star$/i,\n      en: (m) => \`\\${m[1]} star\`,\n      hi: (m) => \`\\${m[1]} स्टार\`\n    },\n`;

  source = source.replace(anchor, patterns);
}

/*
|--------------------------------------------------------------------------
| V86 rating/dynamic React text fix
|--------------------------------------------------------------------------
| Previous implementation remembered the first text ever seen in a DOM text
| node. React reuses that node when rating changes 1→2→3→4→5, so translation
| kept reading the original first-star string. Track lastApplied separately:
| when current text differs from what translator last wrote, it is a genuine
| React/UI update and becomes the new source text.
|--------------------------------------------------------------------------
*/
if (!source.includes("V86_REACT_DYNAMIC_TEXT_SOURCE")) {
  const oldTextFn = `function translateTextNode(node, language, originals) {\n  if (!node || shouldSkip(node)) return;\n  const current = String(node.nodeValue || \"\");\n  if (!current.trim()) return;\n\n  if (!originals.has(node)) originals.set(node, current);\n  const source = originals.get(node);\n  const leading = source.match(/^\\s*/)?.[0] || \"\";\n  const trailing = source.match(/\\s*$/)?.[0] || \"\";\n  const core = source.trim();\n  const translated = dynamicTranslation(core, language);\n  const next = \`\\${leading}\\${translated}\\${trailing}\`;\n\n  if (node.nodeValue !== next) node.nodeValue = next;\n}`;

  const newTextFn = `function translateTextNode(node, language, originals) {\n  // V86_REACT_DYNAMIC_TEXT_SOURCE\n  if (!node || shouldSkip(node)) return;\n  const current = String(node.nodeValue || \"\");\n  if (!current.trim()) return;\n\n  let record = originals.get(node);\n  if (!record || typeof record === \"string\") {\n    record = { source: typeof record === \"string\" ? record : current, lastApplied: null };\n    originals.set(node, record);\n  }\n\n  // React changed this same text node after our last translation (rating, fare,\n  // status, amount, etc.). Treat the new value as the authoritative source.\n  if (record.lastApplied !== null && current !== record.lastApplied) {\n    record.source = current;\n  }\n\n  const rawSource = String(record.source || current);\n  const leading = rawSource.match(/^\\s*/)?.[0] || \"\";\n  const trailing = rawSource.match(/\\s*$/)?.[0] || \"\";\n  const core = rawSource.trim();\n  const translated = dynamicTranslation(core, language);\n  const next = \`\\${leading}\\${translated}\\${trailing}\`;\n  record.lastApplied = next;\n\n  if (node.nodeValue !== next) node.nodeValue = next;\n}`;

  if (!source.includes(oldTextFn)) {
    console.error("HimRideG V86 translateTextNode anchor missing");
    process.exit(1);
  }
  source = source.replace(oldTextFn, newTextFn);
}

if (!source.includes("V86_REACT_DYNAMIC_ATTRIBUTE_SOURCE")) {
  const oldAttrFn = `function translateElementAttributes(element, language, attributeOriginals) {\n  if (!element || shouldSkip(element)) return;\n  for (const attr of ATTRIBUTES) {\n    if (!element.hasAttribute?.(attr)) continue;\n    let store = attributeOriginals.get(element);\n    if (!store) {\n      store = {};\n      attributeOriginals.set(element, store);\n    }\n    if (!(attr in store)) store[attr] = element.getAttribute(attr) || \"\";\n    const source = store[attr];\n    const translated = dynamicTranslation(source, language);\n    if (element.getAttribute(attr) !== translated) {\n      element.setAttribute(attr, translated);\n    }\n  }\n}`;

  const newAttrFn = `function translateElementAttributes(element, language, attributeOriginals) {\n  // V86_REACT_DYNAMIC_ATTRIBUTE_SOURCE\n  if (!element || shouldSkip(element)) return;\n  for (const attr of ATTRIBUTES) {\n    if (!element.hasAttribute?.(attr)) continue;\n    let store = attributeOriginals.get(element);\n    if (!store) {\n      store = {};\n      attributeOriginals.set(element, store);\n    }\n\n    const current = element.getAttribute(attr) || \"\";\n    let record = store[attr];\n    if (!record || typeof record === \"string\") {\n      record = { source: typeof record === \"string\" ? record : current, lastApplied: null };\n      store[attr] = record;\n    }\n    if (record.lastApplied !== null && current !== record.lastApplied) {\n      record.source = current;\n    }\n\n    const translated = dynamicTranslation(record.source, language);\n    record.lastApplied = translated;\n    if (current !== translated) element.setAttribute(attr, translated);\n  }\n}`;

  if (!source.includes(oldAttrFn)) {
    console.error("HimRideG V86 translateElementAttributes anchor missing");
    process.exit(1);
  }
  source = source.replace(oldAttrFn, newAttrFn);
}

fs.writeFileSync(providerPath, source, "utf8");
console.log("HimRideG V86 applied: deep English/Hindi coverage + dynamic rating/text fix; layout untouched");