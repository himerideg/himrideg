// V116 (ADD-ONLY): full language audit — every visible website text in
// professional English, and the same text in Hindi.
// Har row: source text (jaisa code / server me likha hai), English, Hindi, Hinglish.
const rows = [
 [
  "Drop ki taraf",
  "Heading to drop",
  "ड्रॉप की ओर",
  "Drop ki taraf"
 ],
 [
  "A new HimRideG version is ready.",
  "A new HimRideG version is ready.",
  "HimRideG का नया संस्करण तैयार है।",
  "A new HimRideG version is ready."
 ],
 [
  "App update settings could not load.",
  "App update settings could not be loaded.",
  "ऐप अपडेट सेटिंग लोड नहीं हो सकीं।",
  "App update settings could not be loaded."
 ],
 [
  "Have you uploaded and tested the matching signed APK? Enable this release only after that APK is available.",
  "Have you uploaded and tested the matching signed APK? Enable this release only after that APK is available.",
  "क्या आपने सही साइन किया हुआ APK अपलोड करके जाँच लिया है? APK उपलब्ध होने के बाद ही यह रिलीज़ चालू करें।",
  "Have you uploaded and tested the matching signed APK? Enable this release only after that APK is available."
 ],
 [
  "Release saved. No notification sent.",
  "Release saved. No notification sent.",
  "रिलीज़ सहेजी गई। कोई सूचना नहीं भेजी गई।",
  "Release saved. No notification sent."
 ],
 [
  "App update action failed.",
  "App update action failed.",
  "ऐप अपडेट की कार्रवाई विफल रही।",
  "App update action failed."
 ],
 [
  "App Updates",
  "App Updates",
  "ऐप अपडेट",
  "App Updates"
 ],
 [
  "Upload the signed APK first, save its version here, then enable it. Older apps with update support show Update Now / Later once every 24 hours.",
  "Upload the signed APK first, save its version here, then enable it. Older apps with update support show Update Now / Later once every 24 hours.",
  "पहले साइन किया हुआ APK अपलोड करें, उसका संस्करण यहाँ सहेजें, फिर उसे चालू करें। अपडेट सुविधा वाले पुराने ऐप हर 24 घंटे में एक बार “अभी अपडेट करें / बाद में” दिखाते हैं।",
  "Upload the signed APK first, save its version here, then enable it. Older apps with update support show Update Now / Later once every 24 hours."
 ],
 [
  "Existing apps without this feature need a one-time APK installation. Saving does not send notifications.",
  "Existing apps without this feature need a one-time APK installation. Saving does not send notifications.",
  "जिन ऐप में यह सुविधा नहीं है, उनमें एक बार APK इंस्टॉल करना होगा। सहेजने से सूचना नहीं जाती।",
  "Existing apps without this feature need a one-time APK installation. Saving does not send notifications."
 ],
 [
  "New version",
  "New version",
  "नया संस्करण",
  "New version"
 ],
 [
  "Release enabled",
  "Release enabled",
  "रिलीज़ चालू है",
  "Release enabled"
 ],
 [
  "Save release",
  "Save release",
  "रिलीज़ सहेजें",
  "Save release"
 ],
 [
  "Send update notification",
  "Send update notification",
  "अपडेट सूचना भेजें",
  "Send update notification"
 ],
 [
  "Last sent:",
  "Last sent:",
  "अंतिम बार भेजा गया:",
  "Last sent:"
 ],
 [
  "Current:",
  "Current:",
  "वर्तमान:",
  "Current:"
 ],
 [
  "OFF",
  "OFF",
  "बंद",
  "OFF"
 ],
 [
  "Limit tak rate",
  "Rate up to the limit",
  "सीमा तक दर",
  "Limit tak rate"
 ],
 [
  "Limit se upar rate",
  "Rate above the limit",
  "सीमा से ऊपर दर",
  "Limit se upar rate"
 ],
 [
  "Pehle:",
  "Previously:",
  "पहले:",
  "Pehle:"
 ],
 [
  "List load nahi hui",
  "The list could not be loaded",
  "सूची लोड नहीं हो सकी",
  "List load nahi hui"
 ],
 [
  "Export nahi hua",
  "Export failed",
  "एक्सपोर्ट नहीं हो सका",
  "Export nahi hua"
 ],
 [
  "Pending approval",
  "Pending approval",
  "स्वीकृति बाकी",
  "Pending approval"
 ],
 [
  "Deleted",
  "Deleted",
  "हटाया गया",
  "Deleted"
 ],
 [
  "Exporting…",
  "Exporting…",
  "एक्सपोर्ट हो रहा है…",
  "Exporting…"
 ],
 [
  "⬇ Excel / CSV",
  "⬇ Excel / CSV",
  "⬇ Excel / CSV डाउनलोड",
  "⬇ Excel / CSV"
 ],
 [
  "Page",
  "Page",
  "पेज",
  "Page"
 ],
 [
  "Update nahi hua",
  "Update failed",
  "अपडेट नहीं हो सका",
  "Update nahi hua"
 ],
 [
  "Warning nahi gayi",
  "Warning could not be sent",
  "चेतावनी नहीं भेजी जा सकी",
  "Warning nahi gayi"
 ],
 [
  "Requests load nahi hui",
  "Requests could not be loaded",
  "अनुरोध लोड नहीं हो सके",
  "Requests load nahi hui"
 ],
 [
  "Delete nahi hua",
  "Delete failed",
  "हटाया नहीं जा सका",
  "Delete nahi hua"
 ],
 [
  "Reject nahi hua",
  "Reject failed",
  "अस्वीकार नहीं हो सका",
  "Reject nahi hua"
 ],
 [
  "Profile load nahi hui",
  "Profile could not be loaded",
  "प्रोफ़ाइल लोड नहीं हो सकी",
  "Profile load nahi hui"
 ],
 [
  "Block reason:",
  "Block reason:",
  "ब्लॉक करने का कारण:",
  "Block reason:"
 ],
 [
  "Approval:",
  "Approval:",
  "स्वीकृति:",
  "Approval:"
 ],
 [
  "⊘ Block karo",
  "⊘ Block",
  "⊘ ब्लॉक करें",
  "⊘ Block karo"
 ],
 [
  "Ye account",
  "This account",
  "यह खाता",
  "This account"
 ],
 [
  "ko delete ho chuka hai.",
  "has been deleted.",
  "हटा दिया गया है।",
  "ko delete ho chuka hai."
 ],
 [
  "Driver ka jawab:",
  "Driver's reply:",
  "चालक का जवाब:",
  "Driver ka jawab:"
 ],
 [
  "Charge as",
  "Charge as",
  "शुल्क का प्रकार",
  "Charge as"
 ],
 [
  "Sedan 4+1 (Dzire, Etios, Amaze…)",
  "Sedan 4+1 (Dzire, Etios, Amaze…)",
  "सेडान 4+1 (Dzire, Etios, Amaze…)",
  "Sedan 4+1 (Dzire, Etios, Amaze…)"
 ],
 [
  "SUV 6+1 (Innova, Ertiga, Scorpio…)",
  "SUV 6+1 (Innova, Ertiga, Scorpio…)",
  "एसयूवी 6+1 (Innova, Ertiga, Scorpio…)",
  "SUV 6+1 (Innova, Ertiga, Scorpio…)"
 ],
 [
  "Traveller (Tempo Traveller)",
  "Traveller (Tempo Traveller)",
  "ट्रैवलर (टेम्पो ट्रैवलर)",
  "Traveller (Tempo Traveller)"
 ],
 [
  "Getting your current location…",
  "Getting your current location…",
  "आपकी वर्तमान लोकेशन ली जा रही है…",
  "Getting your current location…"
 ],
 [
  "Pickup set to your current location",
  "Pickup set to your current location",
  "पिकअप आपकी वर्तमान लोकेशन पर तय किया गया",
  "Pickup set to your current location"
 ],
 [
  "10 digit number",
  "10-digit number",
  "10 अंकों का नंबर",
  "10-digit number"
 ],
 [
  "OTP sirf driver se face-to-face milne ke baad share karein. Payment ya OTP kisi unknown caller ko phone par mat batayein.",
  "Share the OTP only after meeting the driver in person. Never share payment details or the OTP with an unknown caller.",
  "OTP केवल चालक से आमने-सामने मिलने के बाद ही बताएँ। भुगतान की जानकारी या OTP किसी अनजान कॉल करने वाले को फ़ोन पर न बताएँ।",
  "OTP sirf driver se face-to-face milne ke baad share karein. Payment ya OTP kisi unknown caller ko phone par mat batayein."
 ],
 [
  "New rides have 0% platform commission during the six-month offer. Existing dues from earlier rides, if any, remain in the account. Once RazorpayX is enabled, automatic payouts will be sent to this selected primary account.",
  "New rides have 0% platform commission during the six-month offer. Existing dues from earlier rides, if any, remain in the account. Once RazorpayX is enabled, automatic payouts will be sent to this selected primary account.",
  "छह महीने के ऑफ़र के दौरान नई यात्राओं पर 0% प्लेटफ़ॉर्म कमीशन है। पिछली यात्राओं का बकाया, यदि कोई हो, खाते में बना रहेगा। RazorpayX चालू होने पर स्वचालित भुगतान इसी चुने हुए मुख्य खाते में भेजा जाएगा।",
  "New rides have 0% platform commission during the six-month offer. Existing dues from earlier rides, if any, remain in the account. Once RazorpayX is enabled, automatic payouts will be sent to this selected primary account."
 ],
 [
  "Aapki location",
  "Your location",
  "आपकी लोकेशन",
  "Your location"
 ],
 [
  "payment not received at drop",
  "payment not received at drop",
  "ड्रॉप पर भुगतान नहीं मिला",
  "payment not received at drop"
 ],
 [
  "Customer ko sirf Pay Online / Pay Later options milenge.",
  "The customer will only see the Pay Online / Pay Later options.",
  "ग्राहक को केवल ऑनलाइन भुगतान / बाद में भुगतान के विकल्प मिलेंगे।",
  "Customer ko sirf Pay Online / Pay Later options milenge."
 ],
 [
  "Razorpay payment server par verify ho chuki hai. Payment Received confirm karte hi ride Completed hogi aur driver/customer dono release honge.",
  "The Razorpay payment has been verified by the server. Confirm Payment Received to complete the ride and release both the driver and the customer.",
  "Razorpay भुगतान सर्वर पर सत्यापित हो चुका है। “भुगतान प्राप्त हुआ” की पुष्टि करते ही यात्रा पूरी होगी और चालक व ग्राहक दोनों मुक्त हो जाएँगे।",
  "Razorpay payment server par verify ho chuki hai. Payment Received confirm karte hi ride Completed hogi aur driver/customer dono release honge."
 ],
 [
  "Set pickup here",
  "Set pickup here",
  "पिकअप यहाँ तय करें",
  "Set pickup here"
 ],
 [
  "Finding address…",
  "Finding address…",
  "पता खोजा जा रहा है…",
  "Finding address…"
 ],
 [
  "Move the map to set pickup",
  "Move the map to set pickup",
  "पिकअप तय करने के लिए मैप खिसकाएँ",
  "Move the map to set pickup"
 ],
 [
  "Address not available",
  "Address not available",
  "पता उपलब्ध नहीं है",
  "Address not available"
 ],
 [
  "Allow location access",
  "Allow location access",
  "लोकेशन की अनुमति दें",
  "Allow location access"
 ],
 [
  "NO CARS",
  "NO CARS",
  "कोई गाड़ी नहीं",
  "NO CARS"
 ],
 [
  "MIN",
  "MIN",
  "मिनट",
  "MIN"
 ],
 [
  "Pin location",
  "Pin location",
  "पिन की गई लोकेशन",
  "Pin location"
 ],
 [
  "Your location",
  "Your location",
  "आपकी लोकेशन",
  "Your location"
 ],
 [
  "Kya hua? (optional) — jaise: maine abhi payment nahi di",
  "What happened? (optional) — e.g. I have not paid yet",
  "क्या हुआ? (वैकल्पिक) — जैसे: मैंने अभी भुगतान नहीं किया है",
  "Kya hua? (optional) — jaise: maine abhi payment nahi di"
 ],
 [
  "Report bhej di gayi.",
  "Report sent.",
  "रिपोर्ट भेज दी गई।",
  "Report bhej di gayi."
 ],
 [
  "Report nahi bhej saki",
  "The report could not be sent",
  "रिपोर्ट नहीं भेजी जा सकी",
  "Report nahi bhej saki"
 ],
 [
  "💳 Driver ne payment confirm ki",
  "💳 Driver confirmed the payment",
  "💳 चालक ने भुगतान की पुष्टि की",
  "💳 Driver ne payment confirm ki"
 ],
 [
  "Offline (Cash)",
  "Offline (Cash)",
  "ऑफ़लाइन (नकद)",
  "Offline (Cash)"
 ],
 [
  "payment milna confirm hua",
  "payment received",
  "भुगतान मिलने की पुष्टि हुई",
  "payment received"
 ],
 [
  "— ride complete hote hi booking close ho jayegi",
  "— the booking will close when the ride is completed",
  "— यात्रा पूरी होते ही बुकिंग बंद हो जाएगी",
  "— ride complete hote hi booking close ho jayegi"
 ],
 [
  ". Agar aapne payment nahi di hai to report karein.",
  ". If you have not paid, please report it.",
  "। यदि आपने भुगतान नहीं किया है, तो कृपया रिपोर्ट करें।",
  ". Agar aapne payment nahi di hai to report karein."
 ],
 [
  "⚠️ Payment nahi di",
  "⚠️ I haven't paid",
  "⚠️ मैंने भुगतान नहीं किया",
  "⚠️ Payment nahi di"
 ],
 [
  "✅ Sahi hai",
  "✅ Correct",
  "✅ सही है",
  "✅ Sahi hai"
 ],
 [
  "Payment confirm ho gayi ✅",
  "Payment confirmed ✅",
  "भुगतान की पुष्टि हो गई ✅",
  "Payment confirm ho gayi ✅"
 ],
 [
  "Payment confirm nahi ho saki",
  "The payment could not be confirmed",
  "भुगतान की पुष्टि नहीं हो सकी",
  "Payment confirm nahi ho saki"
 ],
 [
  "💳 Confirm Payment",
  "💳 Confirm Payment",
  "💳 भुगतान की पुष्टि करें",
  "💳 Confirm Payment"
 ],
 [
  "Payment mil gayi to yahan confirm karein — customer confirm na kare tab bhi booking release ho jayegi.",
  "Confirm here once you receive payment — the booking is released even if the customer does not confirm.",
  "भुगतान मिलने पर यहाँ पुष्टि करें — ग्राहक पुष्टि न करे तब भी बुकिंग मुक्त हो जाएगी।",
  "Payment mil gayi to yahan confirm karein — customer confirm na kare tab bhi booking release ho jayegi."
 ],
 [
  "Ride complete karte hi release hoga.",
  "It will be released when you complete the ride.",
  "यात्रा पूरी करते ही मुक्त हो जाएगा।",
  "It will be released when you complete the ride."
 ],
 [
  "payment confirm",
  "payment confirmed",
  "भुगतान की पुष्टि",
  "payment confirmed"
 ],
 [
  "— ride complete hote hi booking release",
  "— the booking is released when the ride is completed",
  "— यात्रा पूरी होते ही बुकिंग मुक्त",
  "— the booking is released when the ride is completed"
 ],
 [
  "💵 Offline / Cash mila",
  "💵 Received offline / cash",
  "💵 ऑफ़लाइन / नकद मिला",
  "💵 Offline / Cash mila"
 ],
 [
  "📲 Online mila",
  "📲 Received online",
  "📲 ऑनलाइन मिला",
  "📲 Online mila"
 ],
 [
  "Satellite",
  "Satellite",
  "सैटेलाइट",
  "Satellite"
 ],
 [
  "Road",
  "Road",
  "सड़क",
  "Road"
 ],
 [
  "Terrain",
  "Terrain",
  "भू-भाग",
  "Terrain"
 ],
 [
  "🗺️ Poora route",
  "🗺️ Full route",
  "🗺️ पूरा रास्ता",
  "🗺️ Full route"
 ],
 [
  "🧭 Navigation",
  "🧭 Navigation",
  "🧭 नेविगेशन",
  "🧭 Navigation"
 ],
 [
  "Current location nahi mil saki",
  "Your current location could not be found",
  "आपकी वर्तमान लोकेशन नहीं मिल सकी",
  "Current location nahi mil saki"
 ],
 [
  "Browser geolocation support nahi karta",
  "This browser does not support location",
  "यह ब्राउज़र लोकेशन सपोर्ट नहीं करता",
  "Browser geolocation support nahi karta"
 ],
 [
  "Test Mode update nahi hua",
  "Test Mode could not be updated",
  "परीक्षण मोड अपडेट नहीं हो सका",
  "Test Mode update nahi hua"
 ],
 [
  "ki sirf TEST platform fee ₹0 karni hai? Ride history aur earnings preserve rahengi.",
  ": reset only the TEST platform fee to ₹0? Ride history and earnings will be kept.",
  "का केवल परीक्षण प्लेटफ़ॉर्म शुल्क ₹0 करना है? यात्रा इतिहास और कमाई सुरक्षित रहेंगी।",
  "ki sirf TEST platform fee ₹0 karni hai? Ride history aur earnings preserve rahengi."
 ],
 [
  "Test platform fee reset ho gayi",
  "Test platform fee has been reset",
  "परीक्षण प्लेटफ़ॉर्म शुल्क रीसेट हो गया",
  "Test platform fee reset ho gayi"
 ],
 [
  "Test platform fee reset nahi hui",
  "Test platform fee could not be reset",
  "परीक्षण प्लेटफ़ॉर्म शुल्क रीसेट नहीं हो सका",
  "Test platform fee reset nahi hui"
 ],
 [
  "ki Test Ride, Earning, Payment aur Platform Fee history permanently साफ करनी है. Confirm karne ke liye DELETE likho:",
  ": permanently clear the test ride, earning, payment and platform fee history? Type DELETE to confirm:",
  "का परीक्षण यात्रा, कमाई, भुगतान और प्लेटफ़ॉर्म शुल्क इतिहास स्थायी रूप से साफ़ करना है? पुष्टि के लिए DELETE लिखें:",
  "ki Test Ride, Earning, Payment aur Platform Fee history permanently साफ करनी है. Confirm karne ke liye DELETE likho:"
 ],
 [
  "History reset cancel kar di gayi",
  "History reset cancelled",
  "इतिहास रीसेट रद्द कर दिया गया",
  "History reset cancel kar di gayi"
 ],
 [
  "Final confirmation: past Ride History, Earning/Payment records aur wallet totals delete/reset honge. Saved UPI/Bank/Profile safe rahenge.",
  "Final confirmation: past ride history, earning/payment records and wallet totals will be deleted/reset. Saved UPI/bank/profile details stay safe.",
  "अंतिम पुष्टि: पिछला यात्रा इतिहास, कमाई/भुगतान रिकॉर्ड और वॉलेट योग हटाए/रीसेट होंगे। सहेजे गए UPI/बैंक/प्रोफ़ाइल विवरण सुरक्षित रहेंगे।",
  "Final confirmation: past ride history, earning/payment records and wallet totals will be deleted/reset. Saved UPI/bank/profile details stay safe."
 ],
 [
  "Test driver history reset ho gayi",
  "Test driver history has been reset",
  "परीक्षण चालक का इतिहास रीसेट हो गया",
  "Test driver history reset ho gayi"
 ],
 [
  "Test driver history reset nahi hui",
  "Test driver history could not be reset",
  "परीक्षण चालक का इतिहास रीसेट नहीं हो सका",
  "Test driver history reset nahi hui"
 ],
 [
  "Withdrawal list load nahi hui",
  "The withdrawal list could not be loaded",
  "निकासी सूची लोड नहीं हो सकी",
  "Withdrawal list load nahi hui"
 ],
 [
  "Reject reason / admin note:",
  "Reject reason / admin note:",
  "अस्वीकार करने का कारण / प्रशासक नोट:",
  "Reject reason / admin note:"
 ],
 [
  "Bank/UPI transfer reference / UTR enter karo:",
  "Enter the bank/UPI transfer reference / UTR:",
  "बैंक/UPI ट्रांसफ़र संदर्भ / UTR दर्ज करें:",
  "Bank/UPI transfer reference / UTR enter karo:"
 ],
 [
  "Paid mark karne ke liye payout reference required hai",
  "A payout reference is required to mark this as paid",
  "भुगतान किया हुआ चिह्नित करने के लिए भुगतान संदर्भ आवश्यक है",
  "Paid mark karne ke liye payout reference required hai"
 ],
 [
  "Withdrawal update nahi hui",
  "The withdrawal could not be updated",
  "निकासी अपडेट नहीं हो सकी",
  "Withdrawal update nahi hui"
 ],
 [
  "Reject karne ka reason likho:",
  "Enter the reason for rejection:",
  "अस्वीकार करने का कारण लिखें:",
  "Reject karne ka reason likho:"
 ],
 [
  "Reject reason zaroori hai",
  "A rejection reason is required",
  "अस्वीकार करने का कारण आवश्यक है",
  "Reject reason zaroori hai"
 ],
 [
  "Document action failed",
  "Document action failed",
  "दस्तावेज़ की कार्रवाई विफल रही",
  "Document action failed"
 ],
 [
  "Razorpay Route Linked Account ID (acc_...) enter karo:",
  "Enter the Razorpay Route linked account ID (acc_...):",
  "Razorpay Route लिंक्ड खाता ID (acc_...) दर्ज करें:",
  "Razorpay Route Linked Account ID (acc_...) enter karo:"
 ],
 [
  "Route account save ho gaya",
  "Route account saved",
  "Route खाता सहेजा गया",
  "Route account save ho gaya"
 ],
 [
  "Route account save nahi hua",
  "The Route account could not be saved",
  "Route खाता सहेजा नहीं जा सका",
  "Route account save nahi hua"
 ],
 [
  "Document load nahi ho saka:",
  "The document could not be loaded:",
  "दस्तावेज़ लोड नहीं हो सका:",
  "Document load nahi ho saka:"
 ],
 [
  "Data refresh nahi ho saka",
  "Data could not be refreshed",
  "डेटा रीफ़्रेश नहीं हो सका",
  "Data refresh nahi ho saka"
 ],
 [
  "Driver action failed",
  "Driver action failed",
  "चालक से जुड़ी कार्रवाई विफल रही",
  "Driver action failed"
 ],
 [
  "⚠️ Approve Nahi Ho Saka:",
  "⚠️ Could not approve:",
  "⚠️ स्वीकृत नहीं हो सका:",
  "⚠️ Approve Nahi Ho Saka:"
 ],
 [
  "Naam khali nahi ho sakta",
  "The name cannot be empty",
  "नाम खाली नहीं हो सकता",
  "Naam khali nahi ho sakta"
 ],
 [
  "Naam update ho gaya!",
  "Name updated!",
  "नाम अपडेट हो गया!",
  "Naam update ho gaya!"
 ],
 [
  "Naam update nahi hua",
  "The name could not be updated",
  "नाम अपडेट नहीं हो सका",
  "Naam update nahi hua"
 ],
 [
  "Reject reason required hai",
  "A rejection reason is required",
  "अस्वीकार करने का कारण आवश्यक है",
  "Reject reason required hai"
 ],
 [
  "Warning ka reason likho (optional):",
  "Enter the warning reason (optional):",
  "चेतावनी का कारण लिखें (वैकल्पिक):",
  "Warning ka reason likho (optional):"
 ],
 [
  "Block reason required hai",
  "A block reason is required",
  "ब्लॉक करने का कारण आवश्यक है",
  "Block reason required hai"
 ],
 [
  "Unblock note likho (optional):",
  "Enter an unblock note (optional):",
  "अनब्लॉक नोट लिखें (वैकल्पिक):",
  "Unblock note likho (optional):"
 ],
 [
  "Request reject karne ka reason likho:",
  "Enter the reason for rejecting the request:",
  "अनुरोध अस्वीकार करने का कारण लिखें:",
  "Request reject karne ka reason likho:"
 ],
 [
  "Unblock request rejected",
  "Unblock request rejected",
  "अनब्लॉक अनुरोध अस्वीकार किया गया",
  "Unblock request rejected"
 ],
 [
  "⚠ Docs Rejected",
  "⚠ Documents rejected",
  "⚠ दस्तावेज़ अस्वीकृत",
  "⚠ Documents rejected"
 ],
 [
  "⚠ Docs Pending",
  "⚠ Documents pending",
  "⚠ दस्तावेज़ बाकी",
  "⚠ Documents pending"
 ],
 [
  "PAN Card",
  "PAN Card",
  "पैन कार्ड",
  "PAN Card"
 ],
 [
  "Insurance",
  "Insurance",
  "बीमा",
  "Insurance"
 ],
 [
  "Permit",
  "Permit",
  "परमिट",
  "Permit"
 ],
 [
  "Profile Photo",
  "Profile Photo",
  "प्रोफ़ाइल फ़ोटो",
  "Profile Photo"
 ],
 [
  "Other Document",
  "Other Document",
  "अन्य दस्तावेज़",
  "Other Document"
 ],
 [
  "License No.",
  "Licence No.",
  "लाइसेंस नंबर",
  "Licence No."
 ],
 [
  "Reg. Number",
  "Reg. Number",
  "पंजीकरण नंबर",
  "Reg. Number"
 ],
 [
  "Terms Accepted",
  "Terms Accepted",
  "नियम स्वीकार किए",
  "Terms Accepted"
 ],
 [
  "✅ Yes",
  "✅ Yes",
  "✅ हाँ",
  "✅ Yes"
 ],
 [
  "Approval Status",
  "Approval Status",
  "स्वीकृति की स्थिति",
  "Approval Status"
 ],
 [
  "🔒 Verified & Locked",
  "🔒 Verified & Locked",
  "🔒 सत्यापित और लॉक",
  "🔒 Verified & Locked"
 ],
 [
  "⚠ Not Verified",
  "⚠ Not Verified",
  "⚠ सत्यापित नहीं",
  "⚠ Not Verified"
 ],
 [
  "Aadhaar card wala naam",
  "Name as on Aadhaar card",
  "आधार कार्ड वाला नाम",
  "Aadhaar card wala naam"
 ],
 [
  "✅ Save & Lock Name",
  "✅ Save & Lock Name",
  "✅ नाम सहेजें और लॉक करें",
  "✅ Save & Lock Name"
 ],
 [
  "Driver ne naam nahi bhara",
  "The driver has not entered a name",
  "चालक ने नाम नहीं भरा है",
  "Driver ne naam nahi bhara"
 ],
 [
  "Verified — ab change nahi hoga",
  "Verified — it can no longer be changed",
  "सत्यापित — अब बदला नहीं जा सकता",
  "Verified — ab change nahi hoga"
 ],
 [
  "Aadhaar se naam check karo → verify karke lock karo",
  "Check the name against Aadhaar → verify and lock it",
  "आधार से नाम जाँचें → सत्यापित करके लॉक करें",
  "Aadhaar se naam check karo → verify karke lock karo"
 ],
 [
  "✅ Name Correct",
  "✅ Name Correct",
  "✅ नाम सही है",
  "✅ Name Correct"
 ],
 [
  "⚠️ Koi document upload nahi kiya gaya hai.",
  "⚠️ No documents have been uploaded.",
  "⚠️ कोई दस्तावेज़ अपलोड नहीं किया गया है।",
  "⚠️ Koi document upload nahi kiya gaya hai."
 ],
 [
  "👁 View Document",
  "👁 View Document",
  "👁 दस्तावेज़ देखें",
  "👁 View Document"
 ],
 [
  "Razorpay Route — Driver Bank Settlement",
  "Razorpay Route — Driver Bank Settlement",
  "Razorpay Route — चालक बैंक निपटान",
  "Razorpay Route — Driver Bank Settlement"
 ],
 [
  "Linked Account:",
  "Linked Account:",
  "लिंक्ड खाता:",
  "Linked Account:"
 ],
 [
  "Not configured",
  "Not configured",
  "सेट नहीं है",
  "Not configured"
 ],
 [
  "Update Route Account",
  "Update Route Account",
  "Route खाता अपडेट करें",
  "Update Route Account"
 ],
 [
  "Set Route Account ID",
  "Set Route Account ID",
  "Route खाता ID सेट करें",
  "Set Route Account ID"
 ],
 [
  "Document Preview",
  "Document Preview",
  "दस्तावेज़ पूर्वावलोकन",
  "Document Preview"
 ],
 [
  "Super Admin",
  "Super Admin",
  "मुख्य प्रशासक",
  "Super Admin"
 ],
 [
  "HIMRIDEG MANAGEMENT",
  "HIMRIDEG MANAGEMENT",
  "HimRideG प्रबंधन",
  "HIMRIDEG MANAGEMENT"
 ],
 [
  "Wallet Withdrawals",
  "Wallet Withdrawals",
  "वॉलेट निकासी",
  "Wallet Withdrawals"
 ],
 [
  "Administrator",
  "Administrator",
  "प्रशासक",
  "Administrator"
 ],
 [
  "PLATFORM OVERVIEW",
  "PLATFORM OVERVIEW",
  "प्लेटफ़ॉर्म अवलोकन",
  "PLATFORM OVERVIEW"
 ],
 [
  "Drivers, bookings aur platform activity ko ek hi jagah se manage karo.",
  "Manage drivers, bookings and platform activity in one place.",
  "चालक, बुकिंग और प्लेटफ़ॉर्म गतिविधि को एक ही जगह से प्रबंधित करें।",
  "Drivers, bookings aur platform activity ko ek hi jagah se manage karo."
 ],
 [
  "System online",
  "System online",
  "सिस्टम ऑनलाइन है",
  "System online"
 ],
 [
  "Total Bookings",
  "Total Bookings",
  "कुल बुकिंग",
  "Total Bookings"
 ],
 [
  "Pending Rides",
  "Pending Rides",
  "लंबित यात्राएँ",
  "Pending Rides"
 ],
 [
  "Active Rides",
  "Active Rides",
  "सक्रिय यात्राएँ",
  "Active Rides"
 ],
 [
  "View all",
  "View all",
  "सभी देखें",
  "View all"
 ],
 [
  "No waiting drivers.",
  "No drivers waiting.",
  "कोई चालक प्रतीक्षा में नहीं है।",
  "No drivers waiting."
 ],
 [
  "Latest Bookings",
  "Latest Bookings",
  "नवीनतम बुकिंग",
  "Latest Bookings"
 ],
 [
  "Approve, reject aur bank/UPI transfer complete hone ke baad Paid mark karo.",
  "Approve or reject requests, and mark them Paid after the bank/UPI transfer is complete.",
  "अनुरोध स्वीकृत या अस्वीकार करें, और बैंक/UPI ट्रांसफ़र पूरा होने के बाद “भुगतान किया” चिह्नित करें।",
  "Approve, reject aur bank/UPI transfer complete hone ke baad Paid mark karo."
 ],
 [
  "Ref:",
  "Ref:",
  "संदर्भ:",
  "Ref:"
 ],
 [
  "Mark Transferred",
  "Mark Transferred",
  "ट्रांसफ़र किया चिह्नित करें",
  "Mark Transferred"
 ],
 [
  "Withdrawal requests load ho rahi hain...",
  "Loading withdrawal requests...",
  "निकासी अनुरोध लोड हो रहे हैं...",
  "Withdrawal requests load ho rahi hain..."
 ],
 [
  "Is filter me koi withdrawal request nahi hai.",
  "No withdrawal requests match this filter.",
  "इस फ़िल्टर में कोई निकासी अनुरोध नहीं है।",
  "Is filter me koi withdrawal request nahi hai."
 ],
 [
  "DRIVER CONTROL",
  "DRIVER CONTROL",
  "चालक नियंत्रण",
  "DRIVER CONTROL"
 ],
 [
  "Approve, warn, block aur unblock drivers.",
  "Approve, warn, block and unblock drivers.",
  "चालकों को स्वीकृत करें, चेतावनी दें, ब्लॉक और अनब्लॉक करें।",
  "Approve, warn, block and unblock drivers."
 ],
 [
  "Search name, phone, vehicle...",
  "Search name, phone, vehicle...",
  "नाम, फ़ोन, वाहन खोजें...",
  "Search name, phone, vehicle..."
 ],
 [
  "With warnings",
  "With warnings",
  "चेतावनी वाले",
  "With warnings"
 ],
 [
  "ADMIN ONLY",
  "ADMIN ONLY",
  "केवल प्रशासक",
  "ADMIN ONLY"
 ],
 [
  "Number",
  "Number",
  "नंबर",
  "Number"
 ],
 [
  "Block reason",
  "Block reason",
  "ब्लॉक करने का कारण",
  "Block reason"
 ],
 [
  "Reason not available",
  "Reason not available",
  "कारण उपलब्ध नहीं है",
  "Reason not available"
 ],
 [
  "⚠ Documents Verified Nahi Hain",
  "⚠ Documents not verified",
  "⚠ दस्तावेज़ सत्यापित नहीं हैं",
  "⚠ Documents Verified Nahi Hain"
 ],
 [
  "Pending review:",
  "Pending review:",
  "समीक्षा बाकी:",
  "Pending review:"
 ],
 [
  "document(s)",
  "document(s)",
  "दस्तावेज़",
  "document(s)"
 ],
 [
  "Latest warning",
  "Latest warning",
  "नवीनतम चेतावनी",
  "Latest warning"
 ],
 [
  "Not acknowledged",
  "Not acknowledged",
  "अभी नहीं पढ़ी गई",
  "Not acknowledged"
 ],
 [
  "Unblock request",
  "Unblock request",
  "अनब्लॉक अनुरोध",
  "Unblock request"
 ],
 [
  "Driver requested unblock",
  "The driver has requested to be unblocked",
  "चालक ने अनब्लॉक करने का अनुरोध किया है",
  "The driver has requested to be unblocked"
 ],
 [
  "Approving...",
  "Approving...",
  "स्वीकृत किया जा रहा है...",
  "Approving..."
 ],
 [
  "Documents verify nahi hain — approval revoke kiya gaya.",
  "Documents are not verified — approval has been revoked.",
  "दस्तावेज़ सत्यापित नहीं हैं — स्वीकृति वापस ले ली गई है।",
  "Documents verify nahi hain — approval revoke kiya gaya."
 ],
 [
  "Approval revoke ho gaya",
  "Approval revoked",
  "स्वीकृति वापस ले ली गई",
  "Approval revoke ho gaya"
 ],
 [
  "⚠ Revoke Approval",
  "⚠ Revoke Approval",
  "⚠ स्वीकृति वापस लें",
  "⚠ Revoke Approval"
 ],
 [
  "Block",
  "Block",
  "ब्लॉक करें",
  "Block"
 ],
 [
  "Reject Request",
  "Reject Request",
  "अनुरोध अस्वीकार करें",
  "Reject Request"
 ],
 [
  "No drivers waiting for approval",
  "No drivers waiting for approval",
  "कोई चालक स्वीकृति की प्रतीक्षा में नहीं है",
  "No drivers waiting for approval"
 ],
 [
  "No matching drivers",
  "No matching drivers",
  "कोई मिलता-जुलता चालक नहीं",
  "No matching drivers"
 ],
 [
  "Sabhi drivers approve ho chuke hain.",
  "All drivers have been approved.",
  "सभी चालक स्वीकृत हो चुके हैं।",
  "Sabhi drivers approve ho chuke hain."
 ],
 [
  "Search ya filter change karke dobara dekho.",
  "Change the search or filter and try again.",
  "खोज या फ़िल्टर बदलकर दोबारा देखें।",
  "Change the search or filter and try again."
 ],
 [
  "Booking status aur assigned users dekho.",
  "View booking status and assigned users.",
  "बुकिंग की स्थिति और जुड़े उपयोगकर्ता देखें।",
  "View booking status and assigned users."
 ],
 [
  "Date unavailable",
  "Date unavailable",
  "तारीख उपलब्ध नहीं",
  "Date unavailable"
 ],
 [
  "Not assigned",
  "Not assigned",
  "अभी तय नहीं",
  "Not assigned"
 ],
 [
  "Full Details",
  "Full Details",
  "पूरी जानकारी",
  "Full Details"
 ],
 [
  "Customer Details",
  "Customer Details",
  "ग्राहक की जानकारी",
  "Customer Details"
 ],
 [
  "Alternative Phone:",
  "Alternative Phone:",
  "वैकल्पिक फ़ोन:",
  "Alternative Phone:"
 ],
 [
  "Yes",
  "Yes",
  "हाँ",
  "Yes"
 ],
 [
  "Vehicle No.:",
  "Vehicle No.:",
  "वाहन नंबर:",
  "Vehicle No.:"
 ],
 [
  "Fare: ₹",
  "Fare: ₹",
  "किराया: ₹",
  "Fare: ₹"
 ],
 [
  "No note",
  "No note",
  "कोई नोट नहीं",
  "No note"
 ],
 [
  "Is filter me koi booking available nahi hai.",
  "No bookings match this filter.",
  "इस फ़िल्टर में कोई बुकिंग नहीं है।",
  "Is filter me koi booking available nahi hai."
 ],
 [
  "Valid admin email enter karo.",
  "Enter a valid admin email.",
  "मान्य प्रशासक ईमेल दर्ज करें।",
  "Valid admin email enter karo."
 ],
 [
  "Admin password kam se kam 6 characters ka hona chahiye.",
  "The admin password must be at least 6 characters.",
  "प्रशासक पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
  "Admin password kam se kam 6 characters ka hona chahiye."
 ],
 [
  "Admin login response incomplete hai.",
  "The admin login response is incomplete.",
  "प्रशासक लॉगिन का जवाब अधूरा है।",
  "Admin login response incomplete hai."
 ],
 [
  "Admin login nahi ho paya.",
  "Admin login failed.",
  "प्रशासक लॉगिन नहीं हो सका।",
  "Admin login nahi ho paya."
 ],
 [
  "← Back to www.himrideg.com",
  "← Back to www.himrideg.com",
  "← www.himrideg.com पर वापस",
  "← Back to www.himrideg.com"
 ],
 [
  "Driver initial fare bhejte hi Accept / Reject / Counter yahin dikhega.",
  "As soon as the driver sends a fare, Accept / Reject / Counter will appear here.",
  "चालक के किराया भेजते ही स्वीकार / अस्वीकार / काउंटर के विकल्प यहीं दिखेंगे।",
  "As soon as the driver sends a fare, Accept / Reject / Counter will appear here."
 ],
 [
  "Number: driver pickup ke liye chalega tab dikhega",
  "Number: shown when the driver starts for pickup",
  "नंबर: चालक के पिकअप के लिए निकलने पर दिखेगा",
  "Number: driver pickup ke liye chalega tab dikhega"
 ],
 [
  "Maine HimRideG ke",
  "I have read and accept HimRideG's",
  "मैंने HimRideG के",
  "I have read and accept HimRideG's"
 ],
 [
  "padhkar accept kiye hain.",
  ".",
  "पढ़कर स्वीकार किए हैं।",
  "padhkar accept kiye hain."
 ],
 [
  "Minimum auto payout",
  "Minimum auto payout",
  "न्यूनतम स्वचालित भुगतान",
  "Minimum auto payout"
 ],
 [
  "lagegi aur",
  "applies and",
  "लागू होगी और",
  "applies and"
 ],
 [
  "mein credit hoga. Offer ke baad admin se activate hui policy lagegi. Withdrawal live RazorpayX payout se saved UPI ya bank account par jayega.",
  "will be credited. After the offer, the policy activated by the admin applies. Withdrawals are paid out by RazorpayX to the saved UPI or bank account.",
  "में जमा होगा। ऑफ़र के बाद प्रशासक द्वारा चालू की गई नीति लागू होगी। निकासी RazorpayX से सहेजे गए UPI या बैंक खाते में भेजी जाएगी।",
  "mein credit hoga. Offer ke baad admin se activate hui policy lagegi. Withdrawal live RazorpayX payout se saved UPI ya bank account par jayega."
 ],
 [
  "4+1 Seater — Hatchback",
  "4+1 Seater — Hatchback",
  "4+1 सीटर — हैचबैक",
  "4+1 Seater — Hatchback"
 ],
 [
  "4+1 Seater — Sedan",
  "4+1 Seater — Sedan",
  "4+1 सीटर — सेडान",
  "4+1 Seater — Sedan"
 ],
 [
  "6+1 Seater — SUV",
  "6+1 Seater — SUV",
  "6+1 सीटर — एसयूवी",
  "6+1 Seater — SUV"
 ],
 [
  "Rides lene ke liye pehle apne documents aur gaadi ki jaankari verify karwani hogi.",
  "To take rides, first get your documents and vehicle details verified.",
  "यात्राएँ लेने के लिए पहले अपने दस्तावेज़ और गाड़ी की जानकारी सत्यापित करवाएँ।",
  "Rides lene ke liye pehle apne documents aur gaadi ki jaankari verify karwani hogi."
 ],
 [
  "Admin ne verify kar diya — naam lock hai",
  "Verified by admin — the name is locked",
  "प्रशासक ने सत्यापित कर दिया — नाम लॉक है",
  "Admin ne verify kar diya — naam lock hai"
 ],
 [
  "Naam save hai — admin verify karega",
  "Name saved — the admin will verify it",
  "नाम सहेजा गया — प्रशासक सत्यापित करेगा",
  "Naam save hai — admin verify karega"
 ],
 [
  "HimRideG par sirf yellow plate (commercial) gaadi allowed hai. RC par vehicle class Motor Cab / Maxi Cab / LMV-Taxi honi chahiye.",
  "HimRideG accepts only yellow-plate (commercial) vehicles. The RC must show the vehicle class as Motor Cab / Maxi Cab / LMV-Taxi.",
  "HimRideG पर केवल पीली नंबर प्लेट (व्यावसायिक) वाली गाड़ी मान्य है। RC पर वाहन श्रेणी Motor Cab / Maxi Cab / LMV-Taxi होनी चाहिए।",
  "HimRideG par sirf yellow plate (commercial) gaadi allowed hai. RC par vehicle class Motor Cab / Maxi Cab / LMV-Taxi honi chahiye."
 ],
 [
  "Class",
  "Class",
  "श्रेणी",
  "Class"
 ],
 [
  "Fuel",
  "Fuel",
  "ईंधन",
  "Fuel"
 ],
 [
  "Seats",
  "Seats",
  "सीटें",
  "Seats"
 ],
 [
  "Gaadi (Car Model)",
  "Vehicle (Car Model)",
  "गाड़ी (कार मॉडल)",
  "Vehicle (Car Model)"
 ],
 [
  "— Gaadi chuniye —",
  "— Choose vehicle —",
  "— गाड़ी चुनें —",
  "— Gaadi chuniye —"
 ],
 [
  "List me nahi hai?",
  "Not in the list?",
  "सूची में नहीं है?",
  "List me nahi hai?"
 ],
 [
  "Custom — 4+1 Hatchback",
  "Custom — 4+1 Hatchback",
  "अन्य — 4+1 हैचबैक",
  "Custom — 4+1 Hatchback"
 ],
 [
  "Custom — 4+1 Sedan",
  "Custom — 4+1 Sedan",
  "अन्य — 4+1 सेडान",
  "Custom — 4+1 Sedan"
 ],
 [
  "Custom — 6+1 SUV",
  "Custom — 6+1 SUV",
  "अन्य — 6+1 एसयूवी",
  "Custom — 6+1 SUV"
 ],
 [
  "Custom — Traveller",
  "Custom — Traveller",
  "अन्य — ट्रैवलर",
  "Custom — Traveller"
 ],
 [
  "Neeche \"Model\" me apni gaadi ka naam khud likhein.",
  "Type your vehicle's name in \"Model\" below.",
  "नीचे “Model” में अपनी गाड़ी का नाम स्वयं लिखें।",
  "Neeche \"Model\" me apni gaadi ka naam khud likhein."
 ],
 [
  "10 digit mobile number",
  "10-digit mobile number",
  "10 अंकों का मोबाइल नंबर",
  "10-digit mobile number"
 ],
 [
  "Back to HimRideG Driver App",
  "Back to HimRideG Driver App",
  "HimRideG ड्राइवर ऐप पर वापस जाएँ",
  "Back to HimRideG Driver App"
 ],
 [
  "Documents upload karke app par wapas jayein",
  "Upload your documents, then return to the app",
  "दस्तावेज़ अपलोड करके ऐप पर वापस जाएँ",
  "Upload your documents, then return to the app"
 ],
 [
  "Back to Driver App",
  "Back to Driver App",
  "ड्राइवर ऐप पर वापस जाएँ",
  "Back to Driver App"
 ],
 [
  "Aapke documents khul rahe hain…",
  "Opening your documents…",
  "आपके दस्तावेज़ खुल रहे हैं…",
  "Aapke documents khul rahe hain…"
 ],
 [
  "Link expire ho gaya. App me dobara 'Upload Documents on Website' dabayein.",
  "This link has expired. Tap 'Upload Documents on Website' in the app again.",
  "यह लिंक समाप्त हो गया है। ऐप में दोबारा 'Upload Documents on Website' दबाएँ।",
  "Link expire ho gaya. App me dobara 'Upload Documents on Website' dabayein."
 ],
 [
  "Website login nahi ho saka. App se dobara try karein.",
  "Website login failed. Please try again from the app.",
  "वेबसाइट लॉगिन नहीं हो सका। ऐप से दोबारा कोशिश करें।",
  "Website login nahi ho saka. App se dobara try karein."
 ],
 [
  "✅ Document upload ho gaya. Baaki upload karein, phir 'Submit' ya 'Back to Driver App' dabayein.",
  "✅ Document uploaded. Upload the rest, then tap 'Submit' or 'Back to Driver App'.",
  "✅ दस्तावेज़ अपलोड हो गया। बाकी अपलोड करें, फिर 'Submit' या 'Back to Driver App' दबाएँ।",
  "✅ Document upload ho gaya. Baaki upload karein, phir 'Submit' ya 'Back to Driver App' dabayein."
 ],
 [
  "✅ Approval ke liye submit ho gaya. App khul raha hai…",
  "✅ Submitted for approval. Opening the app…",
  "✅ स्वीकृति के लिए जमा हो गया। ऐप खुल रहा है…",
  "✅ Approval ke liye submit ho gaya. App khul raha hai…"
 ],
 [
  "Follow car",
  "Follow car",
  "गाड़ी के साथ चलें",
  "Follow car"
 ],
 [
  "HimRideG Car",
  "HimRideG Car",
  "HimRideG गाड़ी",
  "HimRideG Car"
 ],
 [
  "Sirf admin booking details dekh sakta hai.",
  "Only an admin can view booking details.",
  "केवल प्रशासक बुकिंग विवरण देख सकता है।",
  "Sirf admin booking details dekh sakta hai."
 ],
 [
  "Valid booking ID required hai.",
  "A valid booking ID is required.",
  "मान्य बुकिंग ID आवश्यक है।",
  "Valid booking ID required hai."
 ],
 [
  "Booking nahi mili.",
  "Booking not found.",
  "बुकिंग नहीं मिली।",
  "Booking nahi mili."
 ],
 [
  "Booking details load nahi hui.",
  "Booking details could not be loaded.",
  "बुकिंग विवरण लोड नहीं हो सका।",
  "Booking details load nahi hui."
 ],
 [
  "Commission settings load nahi hui",
  "Commission settings could not be loaded",
  "कमीशन सेटिंग लोड नहीं हो सकीं",
  "Commission settings load nahi hui"
 ],
 [
  "Range 2 ki km seema Range 1 se zyada honi chahiye",
  "The Range 2 distance limit must be greater than Range 1",
  "रेंज 2 की किमी सीमा रेंज 1 से अधिक होनी चाहिए",
  "Range 2 ki km seema Range 1 se zyada honi chahiye"
 ],
 [
  "Free period ki date sahi nahi hai",
  "The free period date is not valid",
  "मुफ़्त अवधि की तारीख सही नहीं है",
  "Free period ki date sahi nahi hai"
 ],
 [
  "Commission settings save nahi hui",
  "Commission settings could not be saved",
  "कमीशन सेटिंग सहेजी नहीं जा सकीं",
  "Commission settings save nahi hui"
 ],
 [
  "History load nahi hui",
  "History could not be loaded",
  "इतिहास लोड नहीं हो सका",
  "History load nahi hui"
 ],
 [
  "Sirf admin ye dekh sakta hai.",
  "Only an admin can view this.",
  "इसे केवल प्रशासक देख सकता है।",
  "Sirf admin ye dekh sakta hai."
 ],
 [
  "User nahi mila",
  "User not found",
  "उपयोगकर्ता नहीं मिला",
  "User nahi mila"
 ],
 [
  "Deleted account ko block/unblock nahi kar sakte",
  "A deleted account cannot be blocked or unblocked",
  "हटाए गए खाते को ब्लॉक/अनब्लॉक नहीं किया जा सकता",
  "Deleted account ko block/unblock nahi kar sakte"
 ],
 [
  "Account block ho gaya.",
  "Account blocked.",
  "खाता ब्लॉक कर दिया गया।",
  "Account block ho gaya."
 ],
 [
  "Account unblock ho gaya.",
  "Account unblocked.",
  "खाता अनब्लॉक कर दिया गया।",
  "Account unblock ho gaya."
 ],
 [
  "Complaint nahi mili",
  "Complaint not found",
  "शिकायत नहीं मिली",
  "Complaint nahi mili"
 ],
 [
  "Aapki complaint par action le liya gaya hai. Dhanyavaad.",
  "Action has been taken on your complaint. Thank you.",
  "आपकी शिकायत पर कार्रवाई की गई है। धन्यवाद।",
  "Aapki complaint par action le liya gaya hai. Dhanyavaad."
 ],
 [
  "Aapki complaint review ho gayi hai.",
  "Your complaint has been reviewed.",
  "आपकी शिकायत की समीक्षा हो गई है।",
  "Aapki complaint review ho gayi hai."
 ],
 [
  "Complaint update ho gayi.",
  "Complaint updated.",
  "शिकायत अपडेट हो गई।",
  "Complaint update ho gayi."
 ],
 [
  "Aapki complaint par driver ko warning di gayi hai. Dhanyavaad.",
  "The driver has been warned about your complaint. Thank you.",
  "आपकी शिकायत पर चालक को चेतावनी दी गई है। धन्यवाद।",
  "Aapki complaint par driver ko warning di gayi hai. Dhanyavaad."
 ],
 [
  "Driver ko warning bhej di gayi aur complaint update ho gayi.",
  "Warning sent to the driver and the complaint updated.",
  "चालक को चेतावनी भेज दी गई और शिकायत अपडेट हो गई।",
  "Driver ko warning bhej di gayi aur complaint update ho gayi."
 ],
 [
  "Request nahi mili",
  "Request not found",
  "अनुरोध नहीं मिला",
  "Request nahi mili"
 ],
 [
  "Is number par koi account nahi mila",
  "No account found for this number",
  "इस नंबर पर कोई खाता नहीं मिला",
  "Is number par koi account nahi mila"
 ],
 [
  "Is number par koi account nahi mila — request close kar di.",
  "No account found for this number — the request has been closed.",
  "इस नंबर पर कोई खाता नहीं मिला — अनुरोध बंद कर दिया गया।",
  "Is number par koi account nahi mila — request close kar di."
 ],
 [
  "Account abhi delete nahi ho sakta:",
  "The account cannot be deleted yet:",
  "खाता अभी हटाया नहीं जा सकता:",
  "Account abhi delete nahi ho sakta:"
 ],
 [
  "Pending request nahi mili",
  "No pending request found",
  "कोई लंबित अनुरोध नहीं मिला",
  "Pending request nahi mili"
 ],
 [
  "Aapki request abhi process nahi ho saki. Support se contact karein.",
  "Your request could not be processed. Please contact support.",
  "आपका अनुरोध अभी पूरा नहीं हो सका। कृपया सहायता से संपर्क करें।",
  "Aapki request abhi process nahi ho saki. Support se contact karein."
 ],
 [
  "Request reject ho gayi.",
  "Request rejected.",
  "अनुरोध अस्वीकार कर दिया गया।",
  "Request reject ho gayi."
 ],
 [
  "Account pehle hi delete hai",
  "The account is already deleted",
  "खाता पहले ही हटा दिया गया है",
  "Account pehle hi delete hai"
 ],
 [
  "Delete karne ka reason likhein",
  "Enter a reason for deletion",
  "हटाने का कारण लिखें",
  "Delete karne ka reason likhein"
 ],
 [
  "Account delete ho gaya.",
  "Account deleted.",
  "खाता हटा दिया गया।",
  "Account delete ho gaya."
 ],
 [
  "Admin email aur password required hain.",
  "Admin email and password are required.",
  "प्रशासक ईमेल और पासवर्ड आवश्यक हैं।",
  "Admin email aur password required hain."
 ],
 [
  "Admin email ya password galat hai.",
  "The admin email or password is incorrect.",
  "प्रशासक ईमेल या पासवर्ड गलत है।",
  "Admin email ya password galat hai."
 ],
 [
  "Sirf admin is route ko access kar sakta hai.",
  "Only an admin can access this.",
  "इसे केवल प्रशासक खोल सकता है।",
  "Sirf admin is route ko access kar sakta hai."
 ],
 [
  "Admin account nahi mila.",
  "Admin account not found.",
  "प्रशासक खाता नहीं मिला।",
  "Admin account nahi mila."
 ],
 [
  "Admin profile fetch nahi ho payi.",
  "The admin profile could not be loaded.",
  "प्रशासक प्रोफ़ाइल लोड नहीं हो सकी।",
  "Admin profile fetch nahi ho payi."
 ],
 [
  "Sirf admin dashboard access kar sakta hai.",
  "Only an admin can open the dashboard.",
  "डैशबोर्ड केवल प्रशासक खोल सकता है।",
  "Sirf admin dashboard access kar sakta hai."
 ],
 [
  "Admin dashboard data load nahi hua.",
  "Admin dashboard data could not be loaded.",
  "प्रशासक डैशबोर्ड डेटा लोड नहीं हो सका।",
  "Admin dashboard data load nahi hua."
 ],
 [
  "Sirf admin drivers dekh sakta hai.",
  "Only an admin can view drivers.",
  "चालकों को केवल प्रशासक देख सकता है।",
  "Sirf admin drivers dekh sakta hai."
 ],
 [
  "Drivers load nahi hue.",
  "Drivers could not be loaded.",
  "चालक लोड नहीं हो सके।",
  "Drivers load nahi hue."
 ],
 [
  "Sirf admin driver update kar sakta hai.",
  "Only an admin can update a driver.",
  "चालक को केवल प्रशासक अपडेट कर सकता है।",
  "Sirf admin driver update kar sakta hai."
 ],
 [
  "Valid driver ID required hai.",
  "A valid driver ID is required.",
  "मान्य चालक ID आवश्यक है।",
  "Valid driver ID required hai."
 ],
 [
  "Driver account nahi mila.",
  "Driver account not found.",
  "चालक खाता नहीं मिला।",
  "Driver account nahi mila."
 ],
 [
  "Driver update ho gaya.",
  "Driver updated.",
  "चालक अपडेट हो गया।",
  "Driver update ho gaya."
 ],
 [
  "Driver successfully approve ho gaya.",
  "Driver approved successfully.",
  "चालक सफलतापूर्वक स्वीकृत हो गया।",
  "Driver successfully approve ho gaya."
 ],
 [
  "Driver application reject ho gayi.",
  "Driver application rejected.",
  "चालक का आवेदन अस्वीकार कर दिया गया।",
  "Driver application reject ho gayi."
 ],
 [
  "Warning message required hai.",
  "A warning message is required.",
  "चेतावनी संदेश आवश्यक है।",
  "Warning message required hai."
 ],
 [
  "Warning driver ko bhej di gayi.",
  "Warning sent to the driver.",
  "चालक को चेतावनी भेज दी गई।",
  "Warning driver ko bhej di gayi."
 ],
 [
  "Driver block karne ka reason required hai.",
  "A reason is required to block the driver.",
  "चालक को ब्लॉक करने का कारण आवश्यक है।",
  "Driver block karne ka reason required hai."
 ],
 [
  "Driver successfully block ho gaya.",
  "Driver blocked successfully.",
  "चालक सफलतापूर्वक ब्लॉक हो गया।",
  "Driver successfully block ho gaya."
 ],
 [
  "Driver successfully unblock ho gaya.",
  "Driver unblocked successfully.",
  "चालक सफलतापूर्वक अनब्लॉक हो गया।",
  "Driver successfully unblock ho gaya."
 ],
 [
  "Driver blocked nahi hai.",
  "The driver is not blocked.",
  "चालक ब्लॉक नहीं है।",
  "Driver blocked nahi hai."
 ],
 [
  "Driver unblock request reject ho gayi.",
  "Driver unblock request rejected.",
  "चालक का अनब्लॉक अनुरोध अस्वीकार कर दिया गया।",
  "Driver unblock request reject ho gayi."
 ],
 [
  "Driver suspend ho gaya.",
  "Driver suspended.",
  "चालक निलंबित कर दिया गया।",
  "Driver suspend ho gaya."
 ],
 [
  "Driver update nahi hua.",
  "The driver could not be updated.",
  "चालक अपडेट नहीं हो सका।",
  "Driver update nahi hua."
 ],
 [
  "Sirf admin customers dekh sakta hai.",
  "Only an admin can view customers.",
  "ग्राहकों को केवल प्रशासक देख सकता है।",
  "Sirf admin customers dekh sakta hai."
 ],
 [
  "Customers load nahi ho sake.",
  "Customers could not be loaded.",
  "ग्राहक लोड नहीं हो सके।",
  "Customers load nahi ho sake."
 ],
 [
  "Sirf admin yeh action kar sakta hai.",
  "Only an admin can perform this action.",
  "यह कार्रवाई केवल प्रशासक कर सकता है।",
  "Sirf admin yeh action kar sakta hai."
 ],
 [
  "Customer nahi mila.",
  "Customer not found.",
  "ग्राहक नहीं मिला।",
  "Customer nahi mila."
 ],
 [
  "Block karne ka reason zaroori hai.",
  "A reason is required to block.",
  "ब्लॉक करने का कारण आवश्यक है।",
  "Block karne ka reason zaroori hai."
 ],
 [
  "Customer block ho gaya.",
  "Customer blocked.",
  "ग्राहक ब्लॉक कर दिया गया।",
  "Customer block ho gaya."
 ],
 [
  "Customer unblock ho gaya.",
  "Customer unblocked.",
  "ग्राहक अनब्लॉक कर दिया गया।",
  "Customer unblock ho gaya."
 ],
 [
  "Invalid action. Sirf block ya unblock allowed hai.",
  "Invalid action. Only block or unblock is allowed.",
  "अमान्य कार्रवाई। केवल ब्लॉक या अनब्लॉक की अनुमति है।",
  "Invalid action. Sirf block ya unblock allowed hai."
 ],
 [
  "Customer update nahi ho saka.",
  "The customer could not be updated.",
  "ग्राहक अपडेट नहीं हो सका।",
  "Customer update nahi ho saka."
 ],
 [
  "Sirf admin documents dekh sakta hai.",
  "Only an admin can view documents.",
  "दस्तावेज़ केवल प्रशासक देख सकता है।",
  "Sirf admin documents dekh sakta hai."
 ],
 [
  "Document nahi mila.",
  "Document not found.",
  "दस्तावेज़ नहीं मिला।",
  "Document nahi mila."
 ],
 [
  "Document file disk/shared storage par nahi mili.",
  "The document file was not found in storage.",
  "दस्तावेज़ फ़ाइल स्टोरेज में नहीं मिली।",
  "Document file disk/shared storage par nahi mili."
 ],
 [
  "Document serve nahi ho saka.",
  "The document could not be opened.",
  "दस्तावेज़ खोला नहीं जा सका।",
  "Document serve nahi ho saka."
 ],
 [
  "Sirf admin document verify kar sakta hai.",
  "Only an admin can verify documents.",
  "दस्तावेज़ केवल प्रशासक सत्यापित कर सकता है।",
  "Sirf admin document verify kar sakta hai."
 ],
 [
  "Action 'verify' ya 'reject' hona chahiye.",
  "The action must be 'verify' or 'reject'.",
  "कार्रवाई 'verify' या 'reject' होनी चाहिए।",
  "The action must be 'verify' or 'reject'."
 ],
 [
  "Document clear nahi hai. Dobara upload karo.",
  "The document is not clear. Please upload it again.",
  "दस्तावेज़ साफ़ नहीं है। कृपया दोबारा अपलोड करें।",
  "Document clear nahi hai. Dobara upload karo."
 ],
 [
  "Document verified ho gaya.",
  "Document verified.",
  "दस्तावेज़ सत्यापित हो गया।",
  "Document verified ho gaya."
 ],
 [
  "Document reject ho gaya.",
  "Document rejected.",
  "दस्तावेज़ अस्वीकार कर दिया गया।",
  "Document reject ho gaya."
 ],
 [
  "Document update nahi ho saka.",
  "The document could not be updated.",
  "दस्तावेज़ अपडेट नहीं हो सका।",
  "Document update nahi ho saka."
 ],
 [
  "Sirf admin naam update kar sakta hai.",
  "Only an admin can update the name.",
  "नाम केवल प्रशासक अपडेट कर सकता है।",
  "Sirf admin naam update kar sakta hai."
 ],
 [
  "Naam khali nahi ho sakta.",
  "The name cannot be empty.",
  "नाम खाली नहीं हो सकता।",
  "Naam khali nahi ho sakta."
 ],
 [
  "Naam already verified & locked hai.",
  "The name is already verified and locked.",
  "नाम पहले से सत्यापित और लॉक है।",
  "Naam already verified & locked hai."
 ],
 [
  "Naam verify karke lock kar diya gaya.",
  "The name has been verified and locked.",
  "नाम सत्यापित करके लॉक कर दिया गया।",
  "Naam verify karke lock kar diya gaya."
 ],
 [
  "Naam update ho gaya.",
  "Name updated.",
  "नाम अपडेट हो गया।",
  "Naam update ho gaya."
 ],
 [
  "Naam update nahi ho saka.",
  "The name could not be updated.",
  "नाम अपडेट नहीं हो सका।",
  "Naam update nahi ho saka."
 ],
 [
  "Sirf admin Route account configure kar sakta hai.",
  "Only an admin can configure the Route account.",
  "Route खाता केवल प्रशासक सेट कर सकता है।",
  "Sirf admin Route account configure kar sakta hai."
 ],
 [
  "Razorpay Linked Account ID acc_ se start honi chahiye.",
  "The Razorpay linked account ID must start with acc_.",
  "Razorpay लिंक्ड खाता ID acc_ से शुरू होनी चाहिए।",
  "Razorpay Linked Account ID acc_ se start honi chahiye."
 ],
 [
  "Driver Razorpay Route account map ho gaya.",
  "Driver's Razorpay Route account linked.",
  "चालक का Razorpay Route खाता जोड़ दिया गया।",
  "Driver Razorpay Route account map ho gaya."
 ],
 [
  "Driver Razorpay Route account mapping clear ho gayi.",
  "Driver's Razorpay Route account link removed.",
  "चालक का Razorpay Route खाता लिंक हटा दिया गया।",
  "Driver Razorpay Route account mapping clear ho gayi."
 ],
 [
  "Razorpay Route account save nahi hua.",
  "The Razorpay Route account could not be saved.",
  "Razorpay Route खाता सहेजा नहीं जा सका।",
  "Razorpay Route account save nahi hua."
 ],
 [
  "Sirf admin test mode manage kar sakta hai",
  "Only an admin can manage test mode",
  "परीक्षण मोड केवल प्रशासक संभाल सकता है",
  "Sirf admin test mode manage kar sakta hai"
 ],
 [
  "Test mode list load nahi hui",
  "The test mode list could not be loaded",
  "परीक्षण मोड सूची लोड नहीं हो सकी",
  "Test mode list load nahi hui"
 ],
 [
  "Driver account nahi mila",
  "Driver account not found",
  "चालक खाता नहीं मिला",
  "Driver account nahi mila"
 ],
 [
  "Driver Test Mode update nahi hua",
  "Driver Test Mode could not be updated",
  "चालक का परीक्षण मोड अपडेट नहीं हो सका",
  "Driver Test Mode update nahi hua"
 ],
 [
  "Sirf admin test fee reset kar sakta hai",
  "Only an admin can reset the test fee",
  "परीक्षण शुल्क केवल प्रशासक रीसेट कर सकता है",
  "Sirf admin test fee reset kar sakta hai"
 ],
 [
  "Platform fee reset se pehle is driver ka Test Mode ON karo",
  "Turn on Test Mode for this driver before resetting the platform fee",
  "प्लेटफ़ॉर्म शुल्क रीसेट करने से पहले इस चालक का परीक्षण मोड चालू करें",
  "Platform fee reset se pehle is driver ka Test Mode ON karo"
 ],
 [
  "Sirf admin test driver history reset kar sakta hai",
  "Only an admin can reset test driver history",
  "परीक्षण चालक का इतिहास केवल प्रशासक रीसेट कर सकता है",
  "Sirf admin test driver history reset kar sakta hai"
 ],
 [
  "History reset ke liye confirmation required hai",
  "Confirmation is required to reset history",
  "इतिहास रीसेट करने के लिए पुष्टि आवश्यक है",
  "History reset ke liye confirmation required hai"
 ],
 [
  "History reset se pehle is driver ka Test Mode ON karo",
  "Turn on Test Mode for this driver before resetting history",
  "इतिहास रीसेट करने से पहले इस चालक का परीक्षण मोड चालू करें",
  "History reset se pehle is driver ka Test Mode ON karo"
 ],
 [
  "Driver ki active Ride chal rahi hai. Pehle Ride complete/cancel karo, phir Test History reset karo.",
  "The driver has an active ride. Complete or cancel it first, then reset the test history.",
  "चालक की एक यात्रा चल रही है। पहले यात्रा पूरी/रद्द करें, फिर परीक्षण इतिहास रीसेट करें।",
  "Driver ki active Ride chal rahi hai. Pehle Ride complete/cancel karo, phir Test History reset karo."
 ],
 [
  "Admin access required hai",
  "Admin access is required",
  "प्रशासक पहुँच आवश्यक है",
  "Admin access required hai"
 ],
 [
  "Withdrawal request nahi mili",
  "Withdrawal request not found",
  "निकासी अनुरोध नहीं मिला",
  "Withdrawal request nahi mili"
 ],
 [
  "Sirf pending request approve ho sakti hai",
  "Only a pending request can be approved",
  "केवल लंबित अनुरोध स्वीकृत किया जा सकता है",
  "Sirf pending request approve ho sakti hai"
 ],
 [
  "Ye request reject nahi ho sakti",
  "This request cannot be rejected",
  "यह अनुरोध अस्वीकार नहीं किया जा सकता",
  "Ye request reject nahi ho sakti"
 ],
 [
  "Withdrawal pehle approve karo",
  "Approve the withdrawal first",
  "पहले निकासी स्वीकृत करें",
  "Withdrawal pehle approve karo"
 ],
 [
  "Driver pending wallet amount mismatch hai",
  "The driver's pending wallet amount does not match",
  "चालक की लंबित वॉलेट राशि मेल नहीं खाती",
  "Driver pending wallet amount mismatch hai"
 ],
 [
  "OTP SMS deliver nahi ho saki. Thodi der baad dobara try karein.",
  "The OTP SMS could not be delivered. Please try again shortly.",
  "OTP SMS नहीं पहुँच सका। कृपया थोड़ी देर बाद दोबारा कोशिश करें।",
  "OTP SMS deliver nahi ho saki. Thodi der baad dobara try karein."
 ],
 [
  "Refresh token nahi mila. Dobara login karo.",
  "Session expired. Please log in again.",
  "सत्र समाप्त हो गया। कृपया दोबारा लॉगिन करें।",
  "Refresh token nahi mila. Dobara login karo."
 ],
 [
  "Refresh token invalid ya expire ho gaya. Dobara login karo.",
  "Your session has expired. Please log in again.",
  "आपका सत्र समाप्त हो गया है। कृपया दोबारा लॉगिन करें।",
  "Refresh token invalid ya expire ho gaya. Dobara login karo."
 ],
 [
  "Session role mismatch. Is tab me dobara sahi account se login karo.",
  "This session belongs to a different account type. Please log in again with the correct account.",
  "यह सत्र किसी दूसरे प्रकार के खाते का है। कृपया सही खाते से दोबारा लॉगिन करें।",
  "Session role mismatch. Is tab me dobara sahi account se login karo."
 ],
 [
  "User nahi mila.",
  "User not found.",
  "उपयोगकर्ता नहीं मिला।",
  "User nahi mila."
 ],
 [
  "Account active nahi hai. Admin se sampark karo.",
  "This account is not active. Please contact the admin.",
  "यह खाता सक्रिय नहीं है। कृपया प्रशासक से संपर्क करें।",
  "Account active nahi hai. Admin se sampark karo."
 ],
 [
  "Session nahi mili. Dobara login karo.",
  "Session not found. Please log in again.",
  "सत्र नहीं मिला। कृपया दोबारा लॉगिन करें।",
  "Session nahi mili. Dobara login karo."
 ],
 [
  "Session refresh ho gayi",
  "Session refreshed",
  "सत्र रीफ़्रेश हो गया",
  "Session refresh ho gayi"
 ],
 [
  "Alternative phone primary phone se alag hona chahiye",
  "The alternative phone must be different from the primary phone",
  "वैकल्पिक फ़ोन मुख्य फ़ोन से अलग होना चाहिए",
  "Alternative phone primary phone se alag hona chahiye"
 ],
 [
  "Profile successfully update ho gayi",
  "Profile updated successfully",
  "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई",
  "Profile successfully update ho gayi"
 ],
 [
  "Theme dark ya light hona chahiye",
  "Theme must be dark or light",
  "थीम dark या light होनी चाहिए",
  "Theme must be dark or light"
 ],
 [
  "Preferred UPI app any ya paytm hona chahiye",
  "Preferred UPI app must be 'any' or 'paytm'",
  "पसंदीदा UPI ऐप 'any' या 'paytm' होना चाहिए",
  "Preferred UPI app must be 'any' or 'paytm'"
 ],
 [
  "Driver ko direct payment ride complete hone ke baad hi available hai",
  "Direct payment to the driver is available only after the ride is completed",
  "चालक को सीधा भुगतान यात्रा पूरी होने के बाद ही उपलब्ध है",
  "Driver ko direct payment ride complete hone ke baad hi available hai"
 ],
 [
  "Final locked fare valid nahi hai",
  "The final locked fare is not valid",
  "अंतिम तय किराया मान्य नहीं है",
  "Final locked fare valid nahi hai"
 ],
 [
  "Aap is ride ka driver payment access nahi kar sakte",
  "You cannot access the driver payment for this ride",
  "आप इस यात्रा का चालक भुगतान नहीं खोल सकते",
  "Aap is ride ka driver payment access nahi kar sakte"
 ],
 [
  "Ye ride aapko assigned nahi hai",
  "This ride is not assigned to you",
  "यह यात्रा आपको नहीं सौंपी गई है",
  "Ye ride aapko assigned nahi hai"
 ],
 [
  "Assigned driver nahi mila",
  "Assigned driver not found",
  "सौंपा गया चालक नहीं मिला",
  "Assigned driver nahi mila"
 ],
 [
  "Driver ne abhi direct receiving UPI add nahi ki hai. Cash ya HimRideG online payment use karein.",
  "The driver has not added a UPI ID for direct payments yet. Please pay by cash or HimRideG online payment.",
  "चालक ने अभी सीधे भुगतान के लिए UPI नहीं जोड़ा है। कृपया नकद या HimRideG ऑनलाइन भुगतान का उपयोग करें।",
  "Driver ne abhi direct receiving UPI add nahi ki hai. Cash ya HimRideG online payment use karein."
 ],
 [
  "Driver UPI payment details load nahi hui",
  "The driver's UPI payment details could not be loaded",
  "चालक के UPI भुगतान विवरण लोड नहीं हो सके",
  "Driver UPI payment details load nahi hui"
 ],
 [
  "Pehle driver UPI payment details open karein",
  "Open the driver's UPI payment details first",
  "पहले चालक के UPI भुगतान विवरण खोलें",
  "Pehle driver UPI payment details open karein"
 ],
 [
  "Driver ko payment confirmation bhej di gayi. Driver amount receive check karke confirm karega.",
  "Payment confirmation sent to the driver. The driver will confirm after checking the amount.",
  "चालक को भुगतान की पुष्टि भेज दी गई। चालक राशि जाँचकर पुष्टि करेगा।",
  "Driver ko payment confirmation bhej di gayi. Driver amount receive check karke confirm karega."
 ],
 [
  "Direct driver payment confirmation nahi bheji ja saki",
  "The direct payment confirmation could not be sent",
  "सीधे भुगतान की पुष्टि नहीं भेजी जा सकी",
  "Direct driver payment confirmation nahi bheji ja saki"
 ],
 [
  "Customer ka direct UPI payment confirmation abhi pending hai",
  "The customer's direct UPI payment confirmation is still pending",
  "ग्राहक की सीधी UPI भुगतान पुष्टि अभी बाकी है",
  "Customer ka direct UPI payment confirmation abhi pending hai"
 ],
 [
  "Ride complete hone ke baad hi payment receive confirm karein",
  "Confirm payment received only after the ride is completed",
  "यात्रा पूरी होने के बाद ही भुगतान प्राप्ति की पुष्टि करें",
  "Ride complete hone ke baad hi payment receive confirm karein"
 ],
 [
  "UPI payment received confirm ho gayi. HimRideG platform fee earning history me record ho gayi hai.",
  "UPI payment receipt confirmed. The HimRideG platform fee has been recorded in your earning history.",
  "UPI भुगतान मिलने की पुष्टि हो गई। HimRideG प्लेटफ़ॉर्म शुल्क आपके कमाई इतिहास में दर्ज हो गया है।",
  "UPI payment received confirm ho gayi. HimRideG platform fee earning history me record ho gayi hai."
 ],
 [
  "Driver payment confirmation complete nahi hui",
  "The driver payment confirmation could not be completed",
  "चालक भुगतान की पुष्टि पूरी नहीं हो सकी",
  "Driver payment confirmation complete nahi hui"
 ],
 [
  "Direct payment history load nahi hui",
  "Direct payment history could not be loaded",
  "सीधे भुगतान का इतिहास लोड नहीं हो सका",
  "Direct payment history load nahi hui"
 ],
 [
  "Driver OTP SMS deliver nahi ho saki. Thodi der baad dobara try karein.",
  "The OTP SMS could not be delivered. Please try again shortly.",
  "OTP SMS नहीं पहुँच सका। कृपया थोड़ी देर बाद दोबारा कोशिश करें।",
  "Driver OTP SMS deliver nahi ho saki. Thodi der baad dobara try karein."
 ],
 [
  "Valid alternative mobile number enter karo",
  "Enter a valid alternative mobile number",
  "मान्य वैकल्पिक मोबाइल नंबर दर्ज करें",
  "Valid alternative mobile number enter karo"
 ],
 [
  "Valid email address enter karo",
  "Enter a valid email address",
  "मान्य ईमेल पता दर्ज करें",
  "Valid email address enter karo"
 ],
 [
  "Driver available hai",
  "Driver is available",
  "चालक उपलब्ध है",
  "Driver available hai"
 ],
 [
  "Driver busy hai",
  "Driver is busy",
  "चालक व्यस्त है",
  "Driver busy hai"
 ],
 [
  "Warning ID required hai",
  "Warning ID is required",
  "चेतावनी ID आवश्यक है",
  "Warning ID required hai"
 ],
 [
  "Warning nahi mili",
  "Warning not found",
  "चेतावनी नहीं मिली",
  "Warning nahi mili"
 ],
 [
  "Warning acknowledge ho gayi.",
  "Warning acknowledged.",
  "चेतावनी पढ़ ली गई।",
  "Warning acknowledge ho gayi."
 ],
 [
  "Reply required hai",
  "A reply is required",
  "जवाब आवश्यक है",
  "Reply required hai"
 ],
 [
  "Reply admin ko bhej diya gaya.",
  "Reply sent to the admin.",
  "जवाब प्रशासक को भेज दिया गया।",
  "Reply admin ko bhej diya gaya."
 ],
 [
  "Driver nahi mila.",
  "Driver not found.",
  "चालक नहीं मिला।",
  "Driver nahi mila."
 ],
 [
  "Minimum withdrawal ₹100 hai.",
  "The minimum withdrawal is ₹100.",
  "न्यूनतम निकासी ₹100 है।",
  "Minimum withdrawal ₹100 hai."
 ],
 [
  "UPI ID ya Bank Account number zaroori hai.",
  "A UPI ID or bank account number is required.",
  "UPI ID या बैंक खाता नंबर आवश्यक है।",
  "UPI ID ya Bank Account number zaroori hai."
 ],
 [
  "Valid vehicle number enter karo (example: HP01AB1234)",
  "Enter a valid vehicle number (example: HP01AB1234)",
  "मान्य वाहन नंबर दर्ज करें (उदाहरण: HP01AB1234)",
  "Valid vehicle number enter karo (example: HP01AB1234)"
 ],
 [
  "Vehicle details save ho gayi",
  "Vehicle details saved",
  "वाहन विवरण सहेज दिए गए",
  "Vehicle details save ho gayi"
 ],
 [
  "Aapka account already approved hai.",
  "Your account is already approved.",
  "आपका खाता पहले से स्वीकृत है।",
  "Aapka account already approved hai."
 ],
 [
  "Approval request already pending hai. Admin review kar raha hai.",
  "An approval request is already pending. The admin is reviewing it.",
  "स्वीकृति अनुरोध पहले से लंबित है। प्रशासक इसकी समीक्षा कर रहा है।",
  "Approval request already pending hai. Admin review kar raha hai."
 ],
 [
  "Approval request admin ko bhej di gayi. 24-48 ghante mein review hoga.",
  "Approval request sent to the admin. It will be reviewed within 24–48 hours.",
  "स्वीकृति अनुरोध प्रशासक को भेज दिया गया। 24–48 घंटे में समीक्षा होगी।",
  "Approval request admin ko bhej di gayi. 24-48 ghante mein review hoga."
 ],
 [
  "Gender male, female ya other hona chahiye",
  "Gender must be male, female or other",
  "लिंग पुरुष, महिला या अन्य होना चाहिए",
  "Gender must be male, female or other"
 ],
 [
  "Date of birth ek baar save hone ke baad lock ho jati hai. Badalne ke liye Help & Support se contact karein.",
  "Date of birth is locked once saved. Contact Help & Support to change it.",
  "जन्म तिथि एक बार सहेजने के बाद लॉक हो जाती है। बदलने के लिए सहायता से संपर्क करें।",
  "Date of birth ek baar save hone ke baad lock ho jati hai. Badalne ke liye Help & Support se contact karein."
 ],
 [
  "Profile update ho gayi",
  "Profile updated",
  "प्रोफ़ाइल अपडेट हो गई",
  "Profile update ho gayi"
 ],
 [
  "Driver account active nahi hai",
  "The driver account is not active",
  "चालक खाता सक्रिय नहीं है",
  "Driver account active nahi hai"
 ],
 [
  "Approved driver account required hai",
  "An approved driver account is required",
  "स्वीकृत चालक खाता आवश्यक है",
  "Approved driver account required hai"
 ],
 [
  "Ride accept karne ke liye driver online aur available hona chahiye",
  "You must be online and available to accept a ride",
  "यात्रा स्वीकार करने के लिए आपका ऑनलाइन और उपलब्ध होना आवश्यक है",
  "Ride accept karne ke liye driver online aur available hona chahiye"
 ],
 [
  "Ride request ab available nahi hai",
  "This ride request is no longer available",
  "यह यात्रा अनुरोध अब उपलब्ध नहीं है",
  "Ride request ab available nahi hai"
 ],
 [
  "Current ride active. Ride complete hone ke baad Accept / Reject available hoga.",
  "You have an active ride. Accept / Reject will be available after it is completed.",
  "आपकी एक यात्रा चल रही है। उसके पूरा होने के बाद स्वीकार / अस्वीकार उपलब्ध होगा।",
  "You have an active ride. Accept / Reject will be available after it is completed."
 ],
 [
  "Driver abhi new ride accept nahi kar sakta",
  "You cannot accept a new ride right now",
  "आप अभी नई यात्रा स्वीकार नहीं कर सकते",
  "Driver abhi new ride accept nahi kar sakta"
 ],
 [
  "Ride release ho gayi. Driver ab next ride le sakta hai.",
  "Ride released. You can now take the next ride.",
  "यात्रा मुक्त हो गई। अब आप अगली यात्रा ले सकते हैं।",
  "Ride release ho gayi. Driver ab next ride le sakta hai."
 ],
 [
  "Sirf driver test mode status dekh sakta hai",
  "Only a driver can view the test mode status",
  "परीक्षण मोड की स्थिति केवल चालक देख सकता है",
  "Sirf driver test mode status dekh sakta hai"
 ],
 [
  "Test mode status load nahi hua",
  "Test mode status could not be loaded",
  "परीक्षण मोड की स्थिति लोड नहीं हो सकी",
  "Test mode status load nahi hua"
 ],
 [
  "Customer ne fare reject kiya. Ride current driver se release ho rahi hai.",
  "The customer rejected the fare. The ride is being released from the current driver.",
  "ग्राहक ने किराया अस्वीकार किया। यात्रा मौजूदा चालक से मुक्त की जा रही है।",
  "Customer ne fare reject kiya. Ride current driver se release ho rahi hai."
 ],
 [
  "Booking ID valid nahi hai",
  "The booking ID is not valid",
  "बुकिंग ID मान्य नहीं है",
  "Booking ID valid nahi hai"
 ],
 [
  "Aap is ride ka fare nahi dekh sakte",
  "You cannot view the fare for this ride",
  "आप इस यात्रा का किराया नहीं देख सकते",
  "Aap is ride ka fare nahi dekh sakte"
 ],
 [
  "Fare details nahi mil sakin",
  "Fare details could not be found",
  "किराये का विवरण नहीं मिल सका",
  "Fare details nahi mil sakin"
 ],
 [
  "Valid fare enter karo",
  "Enter a valid fare",
  "मान्य किराया दर्ज करें",
  "Valid fare enter karo"
 ],
 [
  "Sirf driver fare bhej sakta hai",
  "Only the driver can send a fare",
  "किराया केवल चालक भेज सकता है",
  "Sirf driver fare bhej sakta hai"
 ],
 [
  "Is ride par driver assign nahi hai",
  "No driver is assigned to this ride",
  "इस यात्रा पर कोई चालक तय नहीं है",
  "Is ride par driver assign nahi hai"
 ],
 [
  "Aap is ride ke assigned driver nahi hain",
  "You are not the assigned driver for this ride",
  "आप इस यात्रा के तय चालक नहीं हैं",
  "Aap is ride ke assigned driver nahi hain"
 ],
 [
  "Finished ride par fare offer nahi bhej sakte",
  "A fare cannot be sent for a finished ride",
  "पूरी हो चुकी यात्रा पर किराया नहीं भेजा जा सकता",
  "Finished ride par fare offer nahi bhej sakte"
 ],
 [
  "Fare pehle hi final ho chuka hai",
  "The fare is already final",
  "किराया पहले ही तय हो चुका है",
  "Fare pehle hi final ho chuka hai"
 ],
 [
  "Initial driver fare pehle hi bheja ja chuka hai. Ab customer ke Accept / Reject / one-time Counter ka wait karo.",
  "Your initial fare has already been sent. Please wait for the customer to accept, reject or send a one-time counter.",
  "आपका पहला किराया पहले ही भेजा जा चुका है। कृपया ग्राहक के स्वीकार / अस्वीकार / एक बार के काउंटर की प्रतीक्षा करें।",
  "Initial driver fare pehle hi bheja ja chuka hai. Ab customer ke Accept / Reject / one-time Counter ka wait karo."
 ],
 [
  "Initial fare sirf ride accept hone ke turant baad bhej sakte ho",
  "The initial fare can be sent only right after accepting the ride",
  "पहला किराया केवल यात्रा स्वीकार करने के तुरंत बाद भेजा जा सकता है",
  "Initial fare sirf ride accept hone ke turant baad bhej sakte ho"
 ],
 [
  "Driver fare offer nahi bhej saka",
  "The fare offer could not be sent",
  "किराया प्रस्ताव नहीं भेजा जा सका",
  "Driver fare offer nahi bhej saka"
 ],
 [
  "Valid counter fare enter karo",
  "Enter a valid counter fare",
  "मान्य काउंटर किराया दर्ज करें",
  "Valid counter fare enter karo"
 ],
 [
  "Sirf customer counter offer bhej sakta hai",
  "Only the customer can send a counter offer",
  "काउंटर प्रस्ताव केवल ग्राहक भेज सकता है",
  "Sirf customer counter offer bhej sakta hai"
 ],
 [
  "Aap is booking ke customer nahi hain",
  "You are not the customer for this booking",
  "आप इस बुकिंग के ग्राहक नहीं हैं",
  "Aap is booking ke customer nahi hain"
 ],
 [
  "Finished ride par counter offer nahi bhej sakte",
  "A counter offer cannot be sent for a finished ride",
  "पूरी हो चुकी यात्रा पर काउंटर प्रस्ताव नहीं भेजा जा सकता",
  "Finished ride par counter offer nahi bhej sakte"
 ],
 [
  "Driver ke initial fare ke baad hi one-time counter bhej sakte hain",
  "A one-time counter can be sent only after the driver's initial fare",
  "एक बार का काउंटर केवल चालक के पहले किराये के बाद भेजा जा सकता है",
  "Driver ke initial fare ke baad hi one-time counter bhej sakte hain"
 ],
 [
  "Customer ka one-time counter already use ho chuka hai",
  "The one-time counter offer has already been used",
  "एक बार का काउंटर पहले ही उपयोग हो चुका है",
  "Customer ka one-time counter already use ho chuka hai"
 ],
 [
  "Counter offer nahi bheja ja saka",
  "The counter offer could not be sent",
  "काउंटर प्रस्ताव नहीं भेजा जा सका",
  "Counter offer nahi bheja ja saka"
 ],
 [
  "Finished ride ka fare accept nahi kar sakte",
  "The fare for a finished ride cannot be accepted",
  "पूरी हो चुकी यात्रा का किराया स्वीकार नहीं किया जा सकता",
  "Finished ride ka fare accept nahi kar sakte"
 ],
 [
  "Fare pehle hi accept ho chuka hai",
  "The fare has already been accepted",
  "किराया पहले ही स्वीकार हो चुका है",
  "Fare pehle hi accept ho chuka hai"
 ],
 [
  "Driver sirf customer ke active counter offer ko Accept kar sakta hai. Warna FINAL fare bhejein.",
  "You can only accept the customer's active counter offer. Otherwise, send your FINAL fare.",
  "आप केवल ग्राहक का सक्रिय काउंटर प्रस्ताव स्वीकार कर सकते हैं। अन्यथा अपना अंतिम किराया भेजें।",
  "Driver sirf customer ke active counter offer ko Accept kar sakta hai. Warna FINAL fare bhejein."
 ],
 [
  "Customer sirf active driver fare ko accept kar sakta hai.",
  "You can only accept the driver's active fare.",
  "आप केवल चालक का सक्रिय किराया स्वीकार कर सकते हैं।",
  "Customer sirf active driver fare ko accept kar sakta hai."
 ],
 [
  "Accept karne ke liye driver ka active offer nahi hai",
  "There is no active driver offer to accept",
  "स्वीकार करने के लिए चालक का कोई सक्रिय प्रस्ताव नहीं है",
  "Accept karne ke liye driver ka active offer nahi hai"
 ],
 [
  "Accept karne ke liye customer ka active counter offer nahi hai",
  "There is no active customer counter offer to accept",
  "स्वीकार करने के लिए ग्राहक का कोई सक्रिय काउंटर प्रस्ताव नहीं है",
  "Accept karne ke liye customer ka active counter offer nahi hai"
 ],
 [
  "Sirf customer ya driver fare accept kar sakta hai",
  "Only the customer or driver can accept the fare",
  "किराया केवल ग्राहक या चालक स्वीकार कर सकता है",
  "Sirf customer ya driver fare accept kar sakta hai"
 ],
 [
  "Fare accept nahi ho saka",
  "The fare could not be accepted",
  "किराया स्वीकार नहीं हो सका",
  "Fare accept nahi ho saka"
 ],
 [
  "Valid final fare enter karo",
  "Enter a valid final fare",
  "मान्य अंतिम किराया दर्ज करें",
  "Valid final fare enter karo"
 ],
 [
  "Sirf driver final fare bhej sakta hai",
  "Only the driver can send the final fare",
  "अंतिम किराया केवल चालक भेज सकता है",
  "Sirf driver final fare bhej sakta hai"
 ],
 [
  "Finished ride par final fare nahi bhej sakte",
  "A final fare cannot be sent for a finished ride",
  "पूरी हो चुकी यात्रा पर अंतिम किराया नहीं भेजा जा सकता",
  "Finished ride par final fare nahi bhej sakte"
 ],
 [
  "Fare already locked hai",
  "The fare is already locked",
  "किराया पहले से तय है",
  "Fare already locked hai"
 ],
 [
  "Customer counter fare ke baad hi driver final fare bhejega",
  "The final fare can be sent only after the customer's counter offer",
  "अंतिम किराया केवल ग्राहक के काउंटर के बाद भेजा जा सकता है",
  "The final fare can be sent only after the customer's counter offer"
 ],
 [
  "Final fare send nahi hua",
  "The final fare could not be sent",
  "अंतिम किराया नहीं भेजा जा सका",
  "Final fare send nahi hua"
 ],
 [
  "Sirf customer final fare accept kar sakta hai",
  "Only the customer can accept the final fare",
  "अंतिम किराया केवल ग्राहक स्वीकार कर सकता है",
  "Sirf customer final fare accept kar sakta hai"
 ],
 [
  "Customer ke liye active driver fare available nahi hai",
  "There is no active driver fare available",
  "कोई सक्रिय चालक किराया उपलब्ध नहीं है",
  "Customer ke liye active driver fare available nahi hai"
 ],
 [
  "Final fare accept nahi hua",
  "The final fare could not be accepted",
  "अंतिम किराया स्वीकार नहीं हो सका",
  "Final fare accept nahi hua"
 ],
 [
  "Sirf booking customer final fare reject kar sakta hai",
  "Only the booking customer can reject the final fare",
  "अंतिम किराया केवल बुकिंग वाला ग्राहक अस्वीकार कर सकता है",
  "Sirf booking customer final fare reject kar sakta hai"
 ],
 [
  "Reject karne ke liye active driver fare pending nahi hai",
  "There is no pending driver fare to reject",
  "अस्वीकार करने के लिए कोई लंबित चालक किराया नहीं है",
  "Reject karne ke liye active driver fare pending nahi hai"
 ],
 [
  "Final fare reject hua. Naya driver search ho raha hai.",
  "Final fare rejected. Searching for a new driver.",
  "अंतिम किराया अस्वीकार हुआ। नया चालक खोजा जा रहा है।",
  "Final fare reject hua. Naya driver search ho raha hai."
 ],
 [
  "Final fare reject nahi hua",
  "The final fare could not be rejected",
  "अंतिम किराया अस्वीकार नहीं हो सका",
  "Final fare reject nahi hua"
 ],
 [
  "Finished ride ka fare reject nahi kar sakte",
  "The fare for a finished ride cannot be rejected",
  "पूरी हो चुकी यात्रा का किराया अस्वीकार नहीं किया जा सकता",
  "Finished ride ka fare reject nahi kar sakte"
 ],
 [
  "Accepted fare reject nahi kiya ja sakta",
  "An accepted fare cannot be rejected",
  "स्वीकार किया गया किराया अस्वीकार नहीं किया जा सकता",
  "Accepted fare reject nahi kiya ja sakta"
 ],
 [
  "Driver customer counter reject nahi karega. Driver ko FINAL fare bhejna hai.",
  "Instead of rejecting the counter offer, send your FINAL fare.",
  "काउंटर अस्वीकार करने की जगह अपना अंतिम किराया भेजें।",
  "Driver customer counter reject nahi karega. Driver ko FINAL fare bhejna hai."
 ],
 [
  "Reject option sirf active driver fare par customer ke liye available hai.",
  "Reject is available only to the customer on an active driver fare.",
  "अस्वीकार का विकल्प केवल ग्राहक के लिए सक्रिय चालक किराये पर उपलब्ध है।",
  "Reject option sirf active driver fare par customer ke liye available hai."
 ],
 [
  "Driver ka active offer nahi hai",
  "There is no active driver offer",
  "चालक का कोई सक्रिय प्रस्ताव नहीं है",
  "Driver ka active offer nahi hai"
 ],
 [
  "Customer ka active counter offer nahi hai",
  "There is no active customer counter offer",
  "ग्राहक का कोई सक्रिय काउंटर प्रस्ताव नहीं है",
  "Customer ka active counter offer nahi hai"
 ],
 [
  "Sirf customer ya driver fare reject kar sakta hai",
  "Only the customer or driver can reject the fare",
  "किराया केवल ग्राहक या चालक अस्वीकार कर सकता है",
  "Sirf customer ya driver fare reject kar sakta hai"
 ],
 [
  "Fare offer reject ho gaya",
  "Fare offer rejected",
  "किराया प्रस्ताव अस्वीकार हो गया",
  "Fare offer reject ho gaya"
 ],
 [
  "Fare reject nahi ho saka",
  "The fare could not be rejected",
  "किराया अस्वीकार नहीं हो सका",
  "Fare reject nahi ho saka"
 ],
 [
  "Valid Google account email enter karo",
  "Enter a valid Google account email",
  "मान्य Google खाता ईमेल दर्ज करें",
  "Valid Google account email enter karo"
 ],
 [
  "Google login sirf Customer ya Driver ke liye available hai",
  "Google login is available only for customers and drivers",
  "Google लॉगिन केवल ग्राहक और चालक के लिए उपलब्ध है",
  "Google login sirf Customer ya Driver ke liye available hai"
 ],
 [
  "Valid mobile number required hai",
  "A valid mobile number is required",
  "मान्य मोबाइल नंबर आवश्यक है",
  "Valid mobile number required hai"
 ],
 [
  "Valid 10 digit Indian mobile number enter karo",
  "Enter a valid 10-digit Indian mobile number",
  "मान्य 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें",
  "Valid 10 digit Indian mobile number enter karo"
 ],
 [
  "Full name required hai",
  "Full name is required",
  "पूरा नाम आवश्यक है",
  "Full name required hai"
 ],
 [
  "Full name 100 characters se zyada nahi ho sakta",
  "Full name cannot be longer than 100 characters",
  "पूरा नाम 100 अक्षरों से अधिक नहीं हो सकता",
  "Full name 100 characters se zyada nahi ho sakta"
 ],
 [
  "Google sign-in verify nahi ho paya. Dobara Google account select karo.",
  "Google sign-in could not be verified. Please choose your Google account again.",
  "Google साइन-इन सत्यापित नहीं हो सका। कृपया Google खाता दोबारा चुनें।",
  "Google sign-in verify nahi ho paya. Dobara Google account select karo."
 ],
 [
  "Is HimRideG account ke saath doosra Google account linked hai",
  "A different Google account is linked to this HimRideG account",
  "इस HimRideG खाते से कोई दूसरा Google खाता जुड़ा है",
  "Is HimRideG account ke saath doosra Google account linked hai"
 ],
 [
  "Entered mobile number is Google-linked HimRideG account se match nahi karta",
  "The mobile number does not match the HimRideG account linked to this Google account",
  "दर्ज मोबाइल नंबर इस Google से जुड़े HimRideG खाते से मेल नहीं खाता",
  "Entered mobile number is Google-linked HimRideG account se match nahi karta"
 ],
 [
  "Ye mobile number pehle se doosre HimRideG account me registered hai",
  "This mobile number is already registered with another HimRideG account",
  "यह मोबाइल नंबर पहले से किसी दूसरे HimRideG खाते में पंजीकृत है",
  "Ye mobile number pehle se doosre HimRideG account me registered hai"
 ],
 [
  "Ye mobile number pehle se HimRideG account me registered hai. Us account ke linked Google account se login karo.",
  "This mobile number is already registered with HimRideG. Log in with the Google account linked to it.",
  "यह मोबाइल नंबर पहले से HimRideG में पंजीकृत है। उससे जुड़े Google खाते से लॉगिन करें।",
  "Ye mobile number pehle se HimRideG account me registered hai. Us account ke linked Google account se login karo."
 ],
 [
  "Google login successful. Basic info complete karo.",
  "Google login successful. Please complete your basic info.",
  "Google लॉगिन सफल। कृपया अपनी बुनियादी जानकारी पूरी करें।",
  "Google login successful. Basic info complete karo."
 ],
 [
  "Basic Info route sirf Google login account ke liye hai",
  "Basic info is only for accounts that signed in with Google",
  "बुनियादी जानकारी केवल Google से लॉगिन किए खातों के लिए है",
  "Basic Info route sirf Google login account ke liye hai"
 ],
 [
  "Google Basic Info sirf Customer ya Driver ke liye available hai",
  "Google basic info is available only for customers and drivers",
  "Google बुनियादी जानकारी केवल ग्राहक और चालक के लिए उपलब्ध है",
  "Google Basic Info sirf Customer ya Driver ke liye available hai"
 ],
 [
  "Basic info saved. Ab driver verification complete karo.",
  "Basic info saved. Now complete driver verification.",
  "बुनियादी जानकारी सहेजी गई। अब चालक सत्यापन पूरा करें।",
  "Basic info saved. Ab driver verification complete karo."
 ],
 [
  "Sirf booking customer online payment start kar sakta hai",
  "Only the booking customer can start an online payment",
  "ऑनलाइन भुगतान केवल बुकिंग वाला ग्राहक शुरू कर सकता है",
  "Sirf booking customer online payment start kar sakta hai"
 ],
 [
  "Cancelled/expired ride ka payment nahi ho sakta",
  "A cancelled or expired ride cannot be paid",
  "रद्द या समाप्त यात्रा का भुगतान नहीं हो सकता",
  "Cancelled/expired ride ka payment nahi ho sakta"
 ],
 [
  "Final locked fare ke bina payment start nahi ho sakti",
  "Payment cannot start without a final locked fare",
  "अंतिम तय किराये के बिना भुगतान शुरू नहीं हो सकता",
  "Final locked fare ke bina payment start nahi ho sakti"
 ],
 [
  "Payment driver ke ride complete karne ke baad hi start hogi",
  "Payment starts only after the driver completes the ride",
  "भुगतान चालक के यात्रा पूरी करने के बाद ही शुरू होगा",
  "Payment starts only after the driver completes the ride"
 ],
 [
  "Online payment ride complete hone ke baad Pay Now hogi",
  "Online payment (Pay Now) is available after the ride is completed",
  "ऑनलाइन भुगतान (अभी भुगतान करें) यात्रा पूरी होने के बाद उपलब्ध होगा",
  "Online payment (Pay Now) is available after the ride is completed"
 ],
 [
  "Pehle payment option choose karo",
  "Choose a payment option first",
  "पहले भुगतान का विकल्प चुनें",
  "Pehle payment option choose karo"
 ],
 [
  "Booking ID required hai",
  "A booking ID is required",
  "बुकिंग ID आवश्यक है",
  "Booking ID required hai"
 ],
 [
  "Booking nahi mili",
  "Booking not found",
  "बुकिंग नहीं मिली",
  "Booking nahi mili"
 ],
 [
  "Payment pehle hi complete hai",
  "The payment is already complete",
  "भुगतान पहले ही पूरा है",
  "Payment pehle hi complete hai"
 ],
 [
  "Razorpay payment order ready hai",
  "Razorpay payment order is ready",
  "Razorpay भुगतान ऑर्डर तैयार है",
  "Razorpay payment order ready hai"
 ],
 [
  "Payment order create nahi ho saka",
  "The payment order could not be created",
  "भुगतान ऑर्डर नहीं बन सका",
  "Payment order create nahi ho saka"
 ],
 [
  "Payment verification details incomplete hain",
  "Payment verification details are incomplete",
  "भुगतान सत्यापन विवरण अधूरे हैं",
  "Payment verification details incomplete hain"
 ],
 [
  "Payment pehle hi verify hai",
  "The payment is already verified",
  "भुगतान पहले ही सत्यापित है",
  "Payment pehle hi verify hai"
 ],
 [
  "Razorpay Order ID match nahi hui",
  "The Razorpay order ID does not match",
  "Razorpay ऑर्डर ID मेल नहीं खाती",
  "Razorpay Order ID match nahi hui"
 ],
 [
  "Payment signature invalid hai",
  "The payment signature is invalid",
  "भुगतान हस्ताक्षर अमान्य है",
  "Payment signature invalid hai"
 ],
 [
  "Payment successfully verify ho gayi",
  "Payment verified successfully",
  "भुगतान सफलतापूर्वक सत्यापित हो गया",
  "Payment successfully verify ho gayi"
 ],
 [
  "Payment verify nahi ho saka",
  "The payment could not be verified",
  "भुगतान सत्यापित नहीं हो सका",
  "Payment verify nahi ho saka"
 ],
 [
  "Payment option Online, Advance ya Scheduled hona chahiye",
  "The payment option must be Online, Advance or Scheduled",
  "भुगतान विकल्प ऑनलाइन, अग्रिम या निर्धारित होना चाहिए",
  "The payment option must be Online, Advance or Scheduled"
 ],
 [
  "Final fare lock hone ke baad hi payment option choose hoga",
  "A payment option can be chosen only after the fare is locked",
  "किराया तय होने के बाद ही भुगतान विकल्प चुना जा सकता है",
  "A payment option can be chosen only after the fare is locked"
 ],
 [
  "Is ride par payment option change nahi ho sakta",
  "The payment option for this ride cannot be changed",
  "इस यात्रा का भुगतान विकल्प बदला नहीं जा सकता",
  "Is ride par payment option change nahi ho sakta"
 ],
 [
  "Payment option ride complete hone ke baad hi choose ho sakta hai",
  "A payment option can be chosen only after the ride is completed",
  "भुगतान विकल्प यात्रा पूरी होने के बाद ही चुना जा सकता है",
  "Payment option ride complete hone ke baad hi choose ho sakta hai"
 ],
 [
  "Payment already complete hai",
  "The payment is already complete",
  "भुगतान पहले ही पूरा है",
  "Payment already complete hai"
 ],
 [
  "Ride process start hone ke baad Advance Payment select nahi ho sakti",
  "Advance payment cannot be selected after the ride has started",
  "यात्रा शुरू होने के बाद अग्रिम भुगतान नहीं चुना जा सकता",
  "Ride process start hone ke baad Advance Payment select nahi ho sakti"
 ],
 [
  "Scheduled Payment selected — Pay Now option available hai",
  "Scheduled payment selected — Pay Now is available",
  "निर्धारित भुगतान चुना गया — अभी भुगतान करें उपलब्ध है",
  "Scheduled Payment selected — Pay Now option available hai"
 ],
 [
  "Online Payment selected — ride complete hone ke baad payment hogi",
  "Online payment selected — you will pay after the ride is completed",
  "ऑनलाइन भुगतान चुना गया — भुगतान यात्रा पूरी होने के बाद होगा",
  "Online payment selected — you will pay after the ride is completed"
 ],
 [
  "Payment option select nahi ho saka",
  "The payment option could not be selected",
  "भुगतान विकल्प नहीं चुना जा सका",
  "Payment option select nahi ho saka"
 ],
 [
  "Payment method Online ya Cash hona chahiye",
  "The payment method must be Online or Cash",
  "भुगतान का तरीका ऑनलाइन या नकद होना चाहिए",
  "The payment method must be Online or Cash"
 ],
 [
  "Is ride ka payment already complete hai",
  "Payment for this ride is already complete",
  "इस यात्रा का भुगतान पहले ही पूरा है",
  "Is ride ka payment already complete hai"
 ],
 [
  "Online/Cash final method ride complete hone ke baad choose hoga",
  "Online or cash can be chosen after the ride is completed",
  "ऑनलाइन या नकद का चुनाव यात्रा पूरी होने के बाद होगा",
  "Online or cash can be chosen after the ride is completed"
 ],
 [
  "Final fare lock nahi hai",
  "The final fare is not locked",
  "अंतिम किराया तय नहीं है",
  "Final fare lock nahi hai"
 ],
 [
  "Payment method select nahi ho saka",
  "The payment method could not be selected",
  "भुगतान का तरीका नहीं चुना जा सका",
  "Payment method select nahi ho saka"
 ],
 [
  "Sirf assigned driver ya admin cash payment confirm kar sakta hai",
  "Only the assigned driver or an admin can confirm a cash payment",
  "नकद भुगतान की पुष्टि केवल तय चालक या प्रशासक कर सकता है",
  "Sirf assigned driver ya admin cash payment confirm kar sakta hai"
 ],
 [
  "Cash payment ride complete hone ke baad confirm hogi",
  "A cash payment can be confirmed after the ride is completed",
  "नकद भुगतान की पुष्टि यात्रा पूरी होने के बाद होगी",
  "A cash payment can be confirmed after the ride is completed"
 ],
 [
  "Ride ka online payment already paid hai",
  "This ride has already been paid online",
  "इस यात्रा का ऑनलाइन भुगतान पहले ही हो चुका है",
  "Ride ka online payment already paid hai"
 ],
 [
  "Cash payment already confirmed hai",
  "The cash payment is already confirmed",
  "नकद भुगतान की पुष्टि पहले ही हो चुकी है",
  "Cash payment already confirmed hai"
 ],
 [
  "Cash received confirm ho gaya",
  "Cash receipt confirmed",
  "नकद मिलने की पुष्टि हो गई",
  "Cash received confirm ho gaya"
 ],
 [
  "Cash payment confirm nahi ho saka",
  "The cash payment could not be confirmed",
  "नकद भुगतान की पुष्टि नहीं हो सकी",
  "Cash payment confirm nahi ho saka"
 ],
 [
  "Payment status nahi mil saka",
  "The payment status could not be found",
  "भुगतान की स्थिति नहीं मिल सकी",
  "Payment status nahi mil saka"
 ],
 [
  "Is booking ka payment abhi paid nahi hai",
  "This booking has not been paid yet",
  "इस बुकिंग का भुगतान अभी नहीं हुआ है",
  "Is booking ka payment abhi paid nahi hai"
 ],
 [
  "Receipt nahi mil saka",
  "The receipt could not be found",
  "रसीद नहीं मिल सकी",
  "Receipt nahi mil saka"
 ],
 [
  "Sirf admin settlement retry kar sakta hai",
  "Only an admin can retry a settlement",
  "निपटान दोबारा केवल प्रशासक कर सकता है",
  "Sirf admin settlement retry kar sakta hai"
 ],
 [
  "Sirf paid online booking ka settlement retry ho sakta hai",
  "Settlement can be retried only for a paid online booking",
  "निपटान केवल भुगतान हो चुकी ऑनलाइन बुकिंग के लिए दोबारा किया जा सकता है",
  "Sirf paid online booking ka settlement retry ho sakta hai"
 ],
 [
  "Driver wallet settlement ride complete hone ke baad retry hoga",
  "The driver wallet settlement can be retried after the ride is completed",
  "चालक वॉलेट निपटान यात्रा पूरी होने के बाद दोबारा होगा",
  "The driver wallet settlement can be retried after the ride is completed"
 ],
 [
  "Settlement retry nahi hua",
  "The settlement retry failed",
  "निपटान दोबारा नहीं हो सका",
  "Settlement retry nahi hua"
 ],
 [
  "Sirf driver wallet access kar sakta hai",
  "Only a driver can access the wallet",
  "वॉलेट केवल चालक खोल सकता है",
  "Sirf driver wallet access kar sakta hai"
 ],
 [
  "Driver nahi mila",
  "Driver not found",
  "चालक नहीं मिला",
  "Driver nahi mila"
 ],
 [
  "Wallet load nahi hua",
  "The wallet could not be loaded",
  "वॉलेट लोड नहीं हो सका",
  "Wallet load nahi hua"
 ],
 [
  "Wallet top-up ₹100 se ₹50,000 ke beech hona chahiye",
  "Wallet top-up must be between ₹100 and ₹50,000",
  "वॉलेट टॉप-अप ₹100 से ₹50,000 के बीच होना चाहिए",
  "Wallet top-up ₹100 se ₹50,000 ke beech hona chahiye"
 ],
 [
  "Top-up order create nahi hua",
  "The top-up order could not be created",
  "टॉप-अप ऑर्डर नहीं बन सका",
  "Top-up order create nahi hua"
 ],
 [
  "Top-up verification details invalid hain",
  "Top-up verification details are invalid",
  "टॉप-अप सत्यापन विवरण अमान्य हैं",
  "Top-up verification details invalid hain"
 ],
 [
  "Top-up payment signature invalid hai",
  "The top-up payment signature is invalid",
  "टॉप-अप भुगतान हस्ताक्षर अमान्य है",
  "Top-up payment signature invalid hai"
 ],
 [
  "Top-up already credited hai",
  "The top-up has already been credited",
  "टॉप-अप पहले ही जमा हो चुका है",
  "Top-up already credited hai"
 ],
 [
  "Top-up verify nahi hua",
  "The top-up could not be verified",
  "टॉप-अप सत्यापित नहीं हो सका",
  "Top-up verify nahi hua"
 ],
 [
  "Minimum withdrawal ₹100 hai",
  "The minimum withdrawal is ₹100",
  "न्यूनतम निकासी ₹100 है",
  "Minimum withdrawal ₹100 hai"
 ],
 [
  "Valid payout method select karo",
  "Select a valid payout method",
  "मान्य भुगतान प्राप्ति तरीका चुनें",
  "Valid payout method select karo"
 ],
 [
  "Wallet balance kam hai",
  "Insufficient wallet balance",
  "वॉलेट में पर्याप्त राशि नहीं है",
  "Wallet balance kam hai"
 ],
 [
  "Bank account details complete nahi hain",
  "Bank account details are incomplete",
  "बैंक खाते का विवरण अधूरा है",
  "Bank account details complete nahi hain"
 ],
 [
  "UPI ID configured nahi hai",
  "No UPI ID is set up",
  "कोई UPI ID सेट नहीं है",
  "UPI ID configured nahi hai"
 ],
 [
  "Withdrawal request admin ko bhej di gayi",
  "Withdrawal request sent to the admin",
  "निकासी अनुरोध प्रशासक को भेज दिया गया",
  "Withdrawal request admin ko bhej di gayi"
 ],
 [
  "Withdrawal request nahi bani",
  "The withdrawal request could not be created",
  "निकासी अनुरोध नहीं बन सका",
  "Withdrawal request nahi bani"
 ],
 [
  "Withdrawals load nahi hui",
  "Withdrawals could not be loaded",
  "निकासी लोड नहीं हो सकी",
  "Withdrawals load nahi hui"
 ],
 [
  "Valid latitude/longitude required hai",
  "A valid location is required",
  "मान्य लोकेशन आवश्यक है",
  "Valid latitude/longitude required hai"
 ],
 [
  "Route ke liye valid pickup/drop coordinates required hain",
  "Valid pickup and drop locations are required for the route",
  "रास्ते के लिए मान्य पिकअप और ड्रॉप लोकेशन आवश्यक हैं",
  "Route ke liye valid pickup/drop coordinates required hain"
 ],
 [
  "Road route available nahi hai",
  "No road route is available",
  "कोई सड़क मार्ग उपलब्ध नहीं है",
  "Road route available nahi hai"
 ],
 [
  "Valid Expo push token required hai",
  "A valid push token is required",
  "मान्य पुश टोकन आवश्यक है",
  "Valid Expo push token required hai"
 ],
 [
  "Push token register nahi hua",
  "Notifications could not be registered",
  "सूचनाएँ पंजीकृत नहीं हो सकीं",
  "Push token register nahi hua"
 ],
 [
  "Push token unregister nahi hua",
  "Notifications could not be turned off",
  "सूचनाएँ बंद नहीं हो सकीं",
  "Push token unregister nahi hua"
 ],
 [
  "Agar ye phone tray me aayi hai to push registration working hai.",
  "If this appears in your notification tray, notifications are working.",
  "यदि यह सूचना आपके फ़ोन में दिखी है, तो सूचनाएँ ठीक से काम कर रही हैं।",
  "Agar ye phone tray me aayi hai to push registration working hai."
 ],
 [
  "Registered push device nahi mila",
  "No registered device found for notifications",
  "सूचनाओं के लिए कोई पंजीकृत डिवाइस नहीं मिला",
  "Registered push device nahi mila"
 ],
 [
  "Test push send nahi hui",
  "The test notification could not be sent",
  "परीक्षण सूचना नहीं भेजी जा सकी",
  "Test push send nahi hui"
 ],
 [
  "Aap is booking ka payment nahi kar sakte",
  "You cannot pay for this booking",
  "आप इस बुकिंग का भुगतान नहीं कर सकते",
  "Aap is booking ka payment nahi kar sakte"
 ],
 [
  "Is ride stage/payment plan par online payment allowed nahi hai",
  "Online payment is not allowed at this stage of the ride",
  "यात्रा के इस चरण पर ऑनलाइन भुगतान की अनुमति नहीं है",
  "Is ride stage/payment plan par online payment allowed nahi hai"
 ],
 [
  "Razorpay Payment ID missing hai",
  "The Razorpay payment ID is missing",
  "Razorpay भुगतान ID नहीं मिली",
  "Razorpay Payment ID missing hai"
 ],
 [
  "Razorpay payment amount/currency booking fare se match nahi karti",
  "The payment amount does not match the booking fare",
  "भुगतान राशि बुकिंग किराये से मेल नहीं खाती",
  "Razorpay payment amount/currency booking fare se match nahi karti"
 ],
 [
  "Booking kisi doosri payment se already paid hai",
  "This booking has already been paid by another payment",
  "इस बुकिंग का भुगतान किसी दूसरे भुगतान से हो चुका है",
  "Booking kisi doosri payment se already paid hai"
 ],
 [
  "Final fare lock/payment plan ke hisaab se Pay Now abhi available nahi hai",
  "Pay Now is not available yet for this ride",
  "इस यात्रा के लिए अभी भुगतान करें उपलब्ध नहीं है",
  "Final fare lock/payment plan ke hisaab se Pay Now abhi available nahi hai"
 ],
 [
  "Is booking ka payment pehle hi ho chuka hai",
  "This booking has already been paid",
  "इस बुकिंग का भुगतान पहले ही हो चुका है",
  "Is booking ka payment pehle hi ho chuka hai"
 ],
 [
  "Final fare valid nahi hai — driver/customer fare lock check karo",
  "The final fare is not valid — please check the locked fare",
  "अंतिम किराया मान्य नहीं है — कृपया तय किराया जाँचें",
  "Final fare valid nahi hai — driver/customer fare lock check karo"
 ],
 [
  "Razorpay payment ready hai",
  "Razorpay payment is ready",
  "Razorpay भुगतान तैयार है",
  "Razorpay payment ready hai"
 ],
 [
  "Is ride stage/payment plan par payment verify nahi ho sakta",
  "Payment cannot be verified at this stage of the ride",
  "यात्रा के इस चरण पर भुगतान सत्यापित नहीं हो सकता",
  "Is ride stage/payment plan par payment verify nahi ho sakta"
 ],
 [
  "Payment signature invalid hai — payment verify nahi hui",
  "The payment signature is invalid — payment not verified",
  "भुगतान हस्ताक्षर अमान्य है — भुगतान सत्यापित नहीं हुआ",
  "Payment signature invalid hai — payment verify nahi hui"
 ],
 [
  "Fetched payment ki Order ID mismatch hai",
  "The payment order ID does not match",
  "भुगतान की ऑर्डर ID मेल नहीं खाती",
  "Fetched payment ki Order ID mismatch hai"
 ],
 [
  "Fetched payment amount booking fare se match nahi karti",
  "The payment amount does not match the booking fare",
  "भुगतान राशि बुकिंग किराये से मेल नहीं खाती",
  "Fetched payment amount booking fare se match nahi karti"
 ],
 [
  "Customer ki online payment successfully receive ho gayi.",
  "The customer's online payment has been received.",
  "ग्राहक का ऑनलाइन भुगतान सफलतापूर्वक मिल गया।",
  "Customer ki online payment successfully receive ho gayi."
 ],
 [
  "Payment captured aur successfully verify ho gayi! 🎉",
  "Payment received and verified successfully! 🎉",
  "भुगतान मिल गया और सफलतापूर्वक सत्यापित हो गया! 🎉",
  "Payment captured aur successfully verify ho gayi! 🎉"
 ],
 [
  "Payment failure record ho gaya",
  "Payment failure recorded",
  "भुगतान विफलता दर्ज कर ली गई",
  "Payment failure record ho gaya"
 ],
 [
  "Payment failure record nahi ho saka",
  "The payment failure could not be recorded",
  "भुगतान विफलता दर्ज नहीं हो सकी",
  "Payment failure record nahi ho saka"
 ],
 [
  "Cash payment ride complete hone ke baad select karo",
  "Choose cash payment after the ride is completed",
  "नकद भुगतान यात्रा पूरी होने के बाद चुनें",
  "Cash payment ride complete hone ke baad select karo"
 ],
 [
  "Customer ne cash payment select ki hai. Cash receive karke confirm karein.",
  "The customer chose to pay in cash. Confirm after receiving the cash.",
  "ग्राहक ने नकद भुगतान चुना है। नकद मिलने के बाद पुष्टि करें।",
  "Customer ne cash payment select ki hai. Cash receive karke confirm karein."
 ],
 [
  "Cash payment select nahi ho saka",
  "Cash payment could not be selected",
  "नकद भुगतान नहीं चुना जा सका",
  "Cash payment select nahi ho saka"
 ],
 [
  "Cash payment ko sirf assigned driver Cash Received confirm karke Paid kar sakta hai",
  "Only the assigned driver can mark a cash payment as paid by confirming Cash Received",
  "नकद भुगतान को केवल तय चालक “नकद प्राप्त हुआ” की पुष्टि करके भुगतान किया हुआ चिह्नित कर सकता है",
  "Cash payment ko sirf assigned driver Cash Received confirm karke Paid kar sakta hai"
 ],
 [
  "Ride complete hone ke baad cash confirm karo",
  "Confirm cash after the ride is completed",
  "यात्रा पूरी होने के बाद नकद की पुष्टि करें",
  "Ride complete hone ke baad cash confirm karo"
 ],
 [
  "Payment already complete hai — driver release ho chuka hai",
  "Payment is already complete — the driver has been released",
  "भुगतान पहले ही पूरा है — चालक मुक्त हो चुका है",
  "Payment already complete hai — driver release ho chuka hai"
 ],
 [
  "Final fare valid nahi hai",
  "The final fare is not valid",
  "अंतिम किराया मान्य नहीं है",
  "Final fare valid nahi hai"
 ],
 [
  "Cash payment successfully confirm ho gayi. Ab aap next ride le sakte hain.",
  "Cash payment confirmed. You can now take the next ride.",
  "नकद भुगतान की पुष्टि हो गई। अब आप अगली यात्रा ले सकते हैं।",
  "Cash payment successfully confirm ho gayi. Ab aap next ride le sakte hain."
 ],
 [
  "Cash payment confirm ho gaya! Driver release ho gaya. ✅",
  "Cash payment confirmed! The driver has been released. ✅",
  "नकद भुगतान की पुष्टि हो गई! चालक मुक्त हो गया। ✅",
  "Cash payment confirm ho gaya! Driver release ho gaya. ✅"
 ],
 [
  "Advance payment abhi disabled hai. Ride complete hone ke baad Pay Online ya Cash Payment use karein.",
  "Advance payment is currently disabled. After the ride, use Pay Online or Cash Payment.",
  "अग्रिम भुगतान अभी बंद है। यात्रा के बाद ऑनलाइन भुगतान या नकद भुगतान का उपयोग करें।",
  "Advance payment abhi disabled hai. Ride complete hone ke baad Pay Online ya Cash Payment use karein."
 ],
 [
  "Sirf assigned driver ya admin online receipt status confirm kar sakta hai",
  "Only the assigned driver or an admin can confirm online payment receipt",
  "ऑनलाइन भुगतान प्राप्ति की पुष्टि केवल तय चालक या प्रशासक कर सकता है",
  "Sirf assigned driver ya admin online receipt status confirm kar sakta hai"
 ],
 [
  "Online payment abhi server par verified paid nahi hai",
  "The online payment is not yet verified as paid",
  "ऑनलाइन भुगतान अभी भुगतान के रूप में सत्यापित नहीं है",
  "Online payment abhi server par verified paid nahi hai"
 ],
 [
  "Online payment already verified hai",
  "The online payment is already verified",
  "ऑनलाइन भुगतान पहले ही सत्यापित है",
  "Online payment already verified hai"
 ],
 [
  "Online payment receipt confirm nahi ho saka",
  "The online payment receipt could not be confirmed",
  "ऑनलाइन भुगतान प्राप्ति की पुष्टि नहीं हो सकी",
  "Online payment receipt confirm nahi ho saka"
 ],
 [
  "Is booking ka payment abhi tak complete nahi hua",
  "Payment for this booking is not complete yet",
  "इस बुकिंग का भुगतान अभी पूरा नहीं हुआ है",
  "Is booking ka payment abhi tak complete nahi hua"
 ],
 [
  "Payment receipt nahi mil saki",
  "The payment receipt could not be found",
  "भुगतान रसीद नहीं मिल सकी",
  "Payment receipt nahi mil saki"
 ],
 [
  "Ride close sirf driver ya admin kar sakta hai",
  "Only the driver or an admin can close the ride",
  "यात्रा केवल चालक या प्रशासक बंद कर सकता है",
  "Ride close sirf driver ya admin kar sakta hai"
 ],
 [
  "Payment already complete hai. Aap next ride ke liye free hain ✅",
  "Payment is already complete. You are free for the next ride ✅",
  "भुगतान पहले ही पूरा है। आप अगली यात्रा के लिए खाली हैं ✅",
  "Payment already complete hai. Aap next ride ke liye free hain ✅"
 ],
 [
  "Ride close ho gayi. Aap next ride ke liye free hain ✅ (customer payment pending)",
  "Ride closed. You are free for the next ride ✅ (customer payment pending)",
  "यात्रा बंद हो गई। आप अगली यात्रा के लिए खाली हैं ✅ (ग्राहक का भुगतान बाकी)",
  "Ride close ho gayi. Aap next ride ke liye free hain ✅ (customer payment pending)"
 ],
 [
  "Ride close nahi ho saki",
  "The ride could not be closed",
  "यात्रा बंद नहीं हो सकी",
  "Ride close nahi ho saki"
 ],
 [
  "Ye aapki ride nahi hai",
  "This is not your ride",
  "यह आपकी यात्रा नहीं है",
  "Ye aapki ride nahi hai"
 ],
 [
  "Ride complete hone ke baad hi pay later chun sakte hain",
  "Pay Later can be chosen only after the ride is completed",
  "बाद में भुगतान का विकल्प यात्रा पूरी होने के बाद ही चुना जा सकता है",
  "Ride complete hone ke baad hi pay later chun sakte hain"
 ],
 [
  "Theek hai — payment baad me 'My Rides' ya Home banner se kar sakte hain.",
  "Okay — you can pay later from My Rides or the Home banner.",
  "ठीक है — आप बाद में ‘मेरी यात्राएँ’ या होम बैनर से भुगतान कर सकते हैं।",
  "Theek hai — payment baad me 'My Rides' ya Home banner se kar sakte hain."
 ],
 [
  "Pay later set nahi ho saka",
  "Pay Later could not be set",
  "बाद में भुगतान सेट नहीं हो सका",
  "Pay later set nahi ho saka"
 ],
 [
  "Sirf driver platform fee access kar sakta hai",
  "Only a driver can access the platform fee",
  "प्लेटफ़ॉर्म शुल्क केवल चालक खोल सकता है",
  "Sirf driver platform fee access kar sakta hai"
 ],
 [
  "Platform fee status load nahi hua",
  "Platform fee status could not be loaded",
  "प्लेटफ़ॉर्म शुल्क की स्थिति लोड नहीं हो सकी",
  "Platform fee status load nahi hua"
 ],
 [
  "Platform fee payment ke liye Razorpay live payment setup ready nahi hai",
  "Online payment for the platform fee is not available yet",
  "प्लेटफ़ॉर्म शुल्क का ऑनलाइन भुगतान अभी उपलब्ध नहीं है",
  "Platform fee payment ke liye Razorpay live payment setup ready nahi hai"
 ],
 [
  "Aapki HimRideG platform fee already clear hai",
  "Your HimRideG platform fee is already cleared",
  "आपका HimRideG प्लेटफ़ॉर्म शुल्क पहले ही चुका दिया गया है",
  "Aapki HimRideG platform fee already clear hai"
 ],
 [
  "Platform fee payment ready hai",
  "Platform fee payment is ready",
  "प्लेटफ़ॉर्म शुल्क भुगतान तैयार है",
  "Platform fee payment ready hai"
 ],
 [
  "Platform fee order create nahi hua",
  "The platform fee order could not be created",
  "प्लेटफ़ॉर्म शुल्क ऑर्डर नहीं बन सका",
  "Platform fee order create nahi hua"
 ],
 [
  "Platform fee verification details incomplete hain",
  "Platform fee verification details are incomplete",
  "प्लेटफ़ॉर्म शुल्क सत्यापन विवरण अधूरे हैं",
  "Platform fee verification details incomplete hain"
 ],
 [
  "Razorpay live payment setup ready nahi hai",
  "Online payment is not available yet",
  "ऑनलाइन भुगतान अभी उपलब्ध नहीं है",
  "Razorpay live payment setup ready nahi hai"
 ],
 [
  "Platform fee payment signature invalid hai",
  "The platform fee payment signature is invalid",
  "प्लेटफ़ॉर्म शुल्क भुगतान हस्ताक्षर अमान्य है",
  "Platform fee payment signature invalid hai"
 ],
 [
  "Platform fee order is driver account se match nahi karta",
  "The platform fee order does not match this driver account",
  "प्लेटफ़ॉर्म शुल्क ऑर्डर इस चालक खाते से मेल नहीं खाता",
  "Platform fee order is driver account se match nahi karta"
 ],
 [
  "Razorpay payment/order mismatch hai",
  "The payment does not match the order",
  "भुगतान ऑर्डर से मेल नहीं खाता",
  "Razorpay payment/order mismatch hai"
 ],
 [
  "Platform fee payment amount/currency mismatch hai",
  "The platform fee payment amount does not match",
  "प्लेटफ़ॉर्म शुल्क भुगतान राशि मेल नहीं खाती",
  "Platform fee payment amount/currency mismatch hai"
 ],
 [
  "Platform fee payment successful ✅ Ab aap ride accept kar sakte hain.",
  "Platform fee paid ✅ You can now accept rides.",
  "प्लेटफ़ॉर्म शुल्क चुका दिया गया ✅ अब आप यात्राएँ स्वीकार कर सकते हैं।",
  "Platform fee payment successful ✅ Ab aap ride accept kar sakte hain."
 ],
 [
  "Platform fee verify nahi hui",
  "The platform fee could not be verified",
  "प्लेटफ़ॉर्म शुल्क सत्यापित नहीं हो सका",
  "Platform fee verify nahi hui"
 ],
 [
  "Sirf customer complaint kar sakta hai",
  "Only a customer can file a complaint",
  "शिकायत केवल ग्राहक कर सकता है",
  "Sirf customer complaint kar sakta hai"
 ],
 [
  "Ride select karein",
  "Select a ride",
  "यात्रा चुनें",
  "Ride select karein"
 ],
 [
  "Complaint thoda detail me likhein (kam se kam 5 akshar)",
  "Please describe the complaint in more detail (at least 5 characters)",
  "कृपया शिकायत थोड़ा विस्तार से लिखें (कम से कम 5 अक्षर)",
  "Complaint thoda detail me likhein (kam se kam 5 akshar)"
 ],
 [
  "Ride nahi mili",
  "Ride not found",
  "यात्रा नहीं मिली",
  "Ride nahi mili"
 ],
 [
  "Is ride me koi driver assign nahi tha",
  "No driver was assigned to this ride",
  "इस यात्रा में कोई चालक तय नहीं था",
  "Is ride me koi driver assign nahi tha"
 ],
 [
  "Driver ke pickup par pahunchne ke baad hi complaint kar sakte hain",
  "A complaint can be filed only after the driver reaches the pickup",
  "शिकायत केवल चालक के पिकअप पर पहुँचने के बाद की जा सकती है",
  "Driver ke pickup par pahunchne ke baad hi complaint kar sakte hain"
 ],
 [
  "Is ride ki complaint pehle hi ho chuki hai. Admin team dekh rahi hai.",
  "A complaint for this ride has already been filed. The admin team is reviewing it.",
  "इस यात्रा की शिकायत पहले ही हो चुकी है। प्रशासक टीम इसे देख रही है।",
  "Is ride ki complaint pehle hi ho chuki hai. Admin team dekh rahi hai."
 ],
 [
  "Complaint admin team ko bhej di gayi. Aapki details driver ko nahi dikhayi jaayengi.",
  "Complaint sent to the admin team. Your details will not be shown to the driver.",
  "शिकायत प्रशासक टीम को भेज दी गई। आपकी जानकारी चालक को नहीं दिखाई जाएगी।",
  "Complaint admin team ko bhej di gayi. Aapki details driver ko nahi dikhayi jaayengi."
 ],
 [
  "Aapki account delete request pehle se admin ke paas hai. 7 din ke andar process hogi.",
  "Your account deletion request is already with the admin. It will be processed within 7 days.",
  "आपका खाता हटाने का अनुरोध पहले से प्रशासक के पास है। 7 दिन के भीतर पूरा होगा।",
  "Aapki account delete request pehle se admin ke paas hai. 7 din ke andar process hogi."
 ],
 [
  "Account delete request admin ko bhej di gayi. 7 din ke andar process hogi aur aapko SMS/notification milega.",
  "Account deletion request sent to the admin. It will be processed within 7 days and you will receive an SMS/notification.",
  "खाता हटाने का अनुरोध प्रशासक को भेज दिया गया। 7 दिन के भीतर पूरा होगा और आपको SMS/सूचना मिलेगी।",
  "Account delete request admin ko bhej di gayi. 7 din ke andar process hogi aur aapko SMS/notification milega."
 ],
 [
  "Delete request cancel ho gayi.",
  "Deletion request cancelled.",
  "हटाने का अनुरोध रद्द हो गया।",
  "Delete request cancel ho gayi."
 ],
 [
  "Koi pending request nahi hai.",
  "There is no pending request.",
  "कोई लंबित अनुरोध नहीं है।",
  "Koi pending request nahi hai."
 ],
 [
  "Email sahi nahi hai (khali chhod sakte hain)",
  "The email is not valid (you can leave it empty)",
  "ईमेल सही नहीं है (आप इसे खाली छोड़ सकते हैं)",
  "Email sahi nahi hai (khali chhod sakte hain)"
 ],
 [
  "Request mil gayi. HimRideG team 7 din ke andar is number par call/SMS karke verify karegi, phir account delete hoga.",
  "Request received. The HimRideG team will verify it by call/SMS on this number within 7 days, then the account will be deleted.",
  "अनुरोध मिल गया। HimRideG टीम 7 दिन के भीतर इस नंबर पर कॉल/SMS से सत्यापन करेगी, फिर खाता हटाया जाएगा।",
  "Request mil gayi. HimRideG team 7 din ke andar is number par call/SMS karke verify karegi, phir account delete hoga."
 ],
 [
  "Payment confirm nahi hui",
  "The payment could not be confirmed",
  "भुगतान की पुष्टि नहीं हो सकी",
  "Payment confirm nahi hui"
 ],
 [
  "Payment confirm ho gayi. Aap next ride ke liye free hain ✅",
  "Payment confirmed. You are free for the next ride ✅",
  "भुगतान की पुष्टि हो गई। आप अगली यात्रा के लिए खाली हैं ✅",
  "Payment confirm ho gayi. Aap next ride ke liye free hain ✅"
 ],
 [
  "Payment sirf assigned driver confirm kar sakta hai",
  "Only the assigned driver can confirm the payment",
  "भुगतान की पुष्टि केवल तय चालक कर सकता है",
  "Payment sirf assigned driver confirm kar sakta hai"
 ],
 [
  "Sirf assigned driver is ride ki payment confirm kar sakta hai",
  "Only the assigned driver can confirm payment for this ride",
  "इस यात्रा के भुगतान की पुष्टि केवल तय चालक कर सकता है",
  "Sirf assigned driver is ride ki payment confirm kar sakta hai"
 ],
 [
  "Payment confirm save ho gayi. Ride complete karte hi booking release ho jayegi ✅",
  "Payment confirmation saved. The booking will be released when you complete the ride ✅",
  "भुगतान की पुष्टि सहेज ली गई। यात्रा पूरी करते ही बुकिंग मुक्त हो जाएगी ✅",
  "Payment confirm save ho gayi. Ride complete karte hi booking release ho jayegi ✅"
 ],
 [
  "Is ride status me payment confirm nahi ho sakti",
  "Payment cannot be confirmed at this stage of the ride",
  "यात्रा के इस चरण पर भुगतान की पुष्टि नहीं हो सकती",
  "Is ride status me payment confirm nahi ho sakti"
 ],
 [
  "Sirf is ride ka customer report kar sakta hai",
  "Only this ride's customer can file a report",
  "रिपोर्ट केवल इस यात्रा का ग्राहक कर सकता है",
  "Sirf is ride ka customer report kar sakta hai"
 ],
 [
  "Is ride me driver assigned nahi hai",
  "No driver is assigned to this ride",
  "इस यात्रा में कोई चालक तय नहीं है",
  "Is ride me driver assigned nahi hai"
 ],
 [
  "Report admin ko bhej di gayi. HimRideG team check karegi.",
  "Report sent to the admin. The HimRideG team will look into it.",
  "रिपोर्ट प्रशासक को भेज दी गई। HimRideG टीम इसकी जाँच करेगी।",
  "Report admin ko bhej di gayi. HimRideG team check karegi."
 ],
 [
  "Payment status check nahi ho saka",
  "The payment status could not be checked",
  "भुगतान की स्थिति जाँची नहीं जा सकी",
  "Payment status check nahi ho saka"
 ],
 [
  "Website link nahi ban saka. Dobara try karein.",
  "The website link could not be created. Please try again.",
  "वेबसाइट लिंक नहीं बन सका। कृपया दोबारा कोशिश करें।",
  "Website link nahi ban saka. Dobara try karein."
 ],
 [
  "Ye link expire ho gaya hai. App me dobara 'Upload on Website' dabayein.",
  "This link has expired. Tap 'Upload on Website' in the app again.",
  "यह लिंक समाप्त हो गया है। ऐप में दोबारा 'Upload on Website' दबाएँ।",
  "Ye link expire ho gaya hai. App me dobara 'Upload on Website' dabayein."
 ],
 [
  "Account nahi mila",
  "Account not found",
  "खाता नहीं मिला",
  "Account nahi mila"
 ],
 [
  "Payment method nahi mila",
  "Payment method not found",
  "भुगतान का तरीका नहीं मिला",
  "Payment method nahi mila"
 ],
 [
  "Primary payout method secure data nahi mila",
  "Secure details for the primary payout method were not found",
  "मुख्य भुगतान प्राप्ति तरीके का सुरक्षित विवरण नहीं मिला",
  "Primary payout method secure data nahi mila"
 ],
 [
  "Primary UPI ID required hai",
  "A primary UPI ID is required",
  "मुख्य UPI ID आवश्यक है",
  "Primary UPI ID required hai"
 ],
 [
  "Primary bank account secure data incomplete hai",
  "Secure details for the primary bank account are incomplete",
  "मुख्य बैंक खाते का सुरक्षित विवरण अधूरा है",
  "Primary bank account secure data incomplete hai"
 ],
 [
  "Wallet load nahi ho saka",
  "The wallet could not be loaded",
  "वॉलेट लोड नहीं हो सका",
  "Wallet load nahi ho saka"
 ],
 [
  "Payout settings save ho gayi",
  "Payout settings saved",
  "भुगतान प्राप्ति सेटिंग सहेज ली गईं",
  "Payout settings save ho gayi"
 ],
 [
  "Payout settings save nahi ho saki",
  "Payout settings could not be saved",
  "भुगतान प्राप्ति सेटिंग सहेजी नहीं जा सकीं",
  "Payout settings save nahi ho saki"
 ],
 [
  "Valid payout method required hai",
  "A valid payout method is required",
  "मान्य भुगतान प्राप्ति तरीका आवश्यक है",
  "Valid payout method required hai"
 ],
 [
  "Valid UPI ID required hai",
  "A valid UPI ID is required",
  "मान्य UPI ID आवश्यक है",
  "Valid UPI ID required hai"
 ],
 [
  "UPI pehle se saved hai",
  "This UPI ID is already saved",
  "यह UPI ID पहले से सहेजी गई है",
  "UPI pehle se saved hai"
 ],
 [
  "Account holder name required hai",
  "Account holder name is required",
  "खाताधारक का नाम आवश्यक है",
  "Account holder name required hai"
 ],
 [
  "Bank name required hai",
  "Bank name is required",
  "बैंक का नाम आवश्यक है",
  "Bank name required hai"
 ],
 [
  "Valid account number required hai",
  "A valid account number is required",
  "मान्य खाता नंबर आवश्यक है",
  "Valid account number required hai"
 ],
 [
  "Valid IFSC required hai",
  "A valid IFSC is required",
  "मान्य IFSC आवश्यक है",
  "Valid IFSC required hai"
 ],
 [
  "Bank account pehle se saved hai",
  "This bank account is already saved",
  "यह बैंक खाता पहले से सहेजा गया है",
  "Bank account pehle se saved hai"
 ],
 [
  "Payment method securely save ho gaya",
  "Payment method saved securely",
  "भुगतान का तरीका सुरक्षित रूप से सहेज लिया गया",
  "Payment method securely save ho gaya"
 ],
 [
  "Payment method save nahi hua",
  "The payment method could not be saved",
  "भुगतान का तरीका सहेजा नहीं जा सका",
  "Payment method save nahi hua"
 ],
 [
  "Primary receiving account update ho gaya",
  "Primary receiving account updated",
  "मुख्य प्राप्ति खाता अपडेट हो गया",
  "Primary receiving account update ho gaya"
 ],
 [
  "Primary receiving account update nahi hua",
  "The primary receiving account could not be updated",
  "मुख्य प्राप्ति खाता अपडेट नहीं हो सका",
  "Primary receiving account update nahi hua"
 ],
 [
  "Payment method remove ho gaya",
  "Payment method removed",
  "भुगतान का तरीका हटा दिया गया",
  "Payment method remove ho gaya"
 ],
 [
  "Payment method remove nahi hua",
  "The payment method could not be removed",
  "भुगतान का तरीका हटाया नहीं जा सका",
  "Payment method remove nahi hua"
 ],
 [
  "Primary payout method nahi mila",
  "Primary payout method not found",
  "मुख्य भुगतान प्राप्ति तरीका नहीं मिला",
  "Primary payout method nahi mila"
 ],
 [
  "Primary payout method required hai",
  "A primary payout method is required",
  "मुख्य भुगतान प्राप्ति तरीका आवश्यक है",
  "Primary payout method required hai"
 ],
 [
  "Payout processed ho gaya",
  "Payout processed",
  "भुगतान भेज दिया गया",
  "Payout processed ho gaya"
 ],
 [
  "Payout request bank/RazorpayX confirmation me hai. Duplicate payout se bachne ke liye same request safely reconcile hogi.",
  "The payout is awaiting bank confirmation. The same request will be reconciled safely to avoid a duplicate payout.",
  "भुगतान बैंक की पुष्टि की प्रतीक्षा में है। दोहरे भुगतान से बचने के लिए यही अनुरोध सुरक्षित रूप से मिलाया जाएगा।",
  "Payout request bank/RazorpayX confirmation me hai. Duplicate payout se bachne ke liye same request safely reconcile hogi."
 ],
 [
  "Payout RazorpayX ko submit ho gaya",
  "Payout submitted",
  "भुगतान अनुरोध भेज दिया गया",
  "Payout RazorpayX ko submit ho gaya"
 ],
 [
  "Withdrawal request nahi ho saki",
  "The withdrawal request could not be made",
  "निकासी अनुरोध नहीं हो सका",
  "Withdrawal request nahi ho saki"
 ],
 [
  "Withdrawal history load nahi hui",
  "Withdrawal history could not be loaded",
  "निकासी इतिहास लोड नहीं हो सका",
  "Withdrawal history load nahi hui"
 ],
 [
  "Withdrawal request nahi mila",
  "Withdrawal request not found",
  "निकासी अनुरोध नहीं मिला",
  "Withdrawal request nahi mila"
 ],
 [
  "Sirf failed withdrawal ko retry kar sakte hain",
  "Only a failed withdrawal can be retried",
  "केवल विफल निकासी को दोबारा किया जा सकता है",
  "Sirf failed withdrawal ko retry kar sakte hain"
 ],
 [
  "Withdrawal retry start ho gaya",
  "Withdrawal retry started",
  "निकासी दोबारा शुरू हो गई",
  "Withdrawal retry start ho gaya"
 ],
 [
  "Withdrawal retry nahi hua",
  "The withdrawal retry failed",
  "निकासी दोबारा नहीं हो सकी",
  "Withdrawal retry nahi hua"
 ],
 [
  "Payout status sync nahi ho saka",
  "The payout status could not be updated",
  "भुगतान की स्थिति अपडेट नहीं हो सकी",
  "Payout status sync nahi ho saka"
 ],
 [
  "Sirf driver ride accept kar sakta hai",
  "Only a driver can accept rides",
  "यात्रा केवल चालक स्वीकार कर सकता है",
  "Sirf driver ride accept kar sakta hai"
 ],
 [
  "Bahut zyada OTP requests hui hain. 10 minute baad dobara try karein.",
  "Too many OTP requests. Please try again in 10 minutes.",
  "बहुत अधिक OTP अनुरोध हो गए हैं। कृपया 10 मिनट बाद दोबारा कोशिश करें।",
  "Bahut zyada OTP requests hui hain. 10 minute baad dobara try karein."
 ],
 [
  "Bahut zyada login attempts hui hain. Thodi der baad dobara try karein.",
  "Too many login attempts. Please try again shortly.",
  "बहुत अधिक लॉगिन प्रयास हो गए हैं। कृपया थोड़ी देर बाद दोबारा कोशिश करें।",
  "Bahut zyada login attempts hui hain. Thodi der baad dobara try karein."
 ],
 [
  "Admin login attempts limit ho gayi hai. Thodi der baad try karein.",
  "Admin login attempt limit reached. Please try again shortly.",
  "प्रशासक लॉगिन प्रयासों की सीमा पूरी हो गई है। कृपया थोड़ी देर बाद कोशिश करें।",
  "Admin login attempts limit ho gayi hai. Thodi der baad try karein."
 ],
 [
  "Payment requests temporarily limited hain. Thodi der baad try karein.",
  "Payment requests are temporarily limited. Please try again shortly.",
  "भुगतान अनुरोध अस्थायी रूप से सीमित हैं। कृपया थोड़ी देर बाद कोशिश करें।",
  "Payment requests temporarily limited hain. Thodi der baad try karein."
 ],
 [
  "Bahut zyada requests aa rahi hain. Ek minute baad try karein.",
  "Too many requests. Please try again in a minute.",
  "बहुत अधिक अनुरोध आ रहे हैं। कृपया एक मिनट बाद कोशिश करें।",
  "Bahut zyada requests aa rahi hain. Ek minute baad try karein."
 ],
 [
  "Ride actions bahut tezi se aa rahe hain. Thodi der baad dobara try karein.",
  "Too many ride actions at once. Please try again shortly.",
  "यात्रा से जुड़ी कार्रवाइयाँ बहुत तेज़ी से हो रही हैं। कृपया थोड़ी देर बाद कोशिश करें।",
  "Ride actions bahut tezi se aa rahe hain. Thodi der baad dobara try karein."
 ],
 [
  "Live location updates temporarily limited hain. Ek moment baad retry karein.",
  "Live location updates are temporarily limited. Please retry in a moment.",
  "लाइव लोकेशन अपडेट अस्थायी रूप से सीमित हैं। कृपया एक पल बाद दोबारा कोशिश करें।",
  "Live location updates temporarily limited hain. Ek moment baad retry karein."
 ],
 [
  "Sirf JPG, PNG, WEBP ya PDF file upload karo",
  "Upload only a JPG, PNG, WEBP or PDF file",
  "केवल JPG, PNG, WEBP या PDF फ़ाइल अपलोड करें",
  "Sirf JPG, PNG, WEBP ya PDF file upload karo"
 ],
 [
  "Thodi der baad try karein.",
  "Please try again shortly.",
  "कृपया थोड़ी देर बाद कोशिश करें।",
  "Thodi der baad try karein."
 ],
 [
  "Driver auto-release ho gaya. Customer payment baad me bhi kar sakta hai.",
  "The driver has been released automatically. The customer can still pay later.",
  "चालक अपने-आप मुक्त हो गया। ग्राहक बाद में भी भुगतान कर सकता है।",
  "Driver auto-release ho gaya. Customer payment baad me bhi kar sakta hai."
 ],
 [
  "Driver ne ride close kar di. Aap payment baad me bhi kar sakte hain.",
  "The driver has closed the ride. You can still pay later.",
  "चालक ने यात्रा बंद कर दी। आप बाद में भी भुगतान कर सकते हैं।",
  "Driver ne ride close kar di. Aap payment baad me bhi kar sakte hain."
 ],
 [
  "Aap next ride ke liye free hain ✅",
  "You are free for the next ride ✅",
  "आप अगली यात्रा के लिए खाली हैं ✅",
  "Aap next ride ke liye free hain ✅"
 ],
 [
  "Pichli ride ka payment pending hai, par aapko next ride milti rahegi.",
  "Payment for your last ride is pending, but you will keep getting new rides.",
  "पिछली यात्रा का भुगतान बाकी है, लेकिन आपको नई यात्राएँ मिलती रहेंगी।",
  "Pichli ride ka payment pending hai, par aapko next ride milti rahegi."
 ],
 [
  "Ride close ho gayi. Ab nayi bookings aayengi.",
  "Ride closed. New bookings will now come in.",
  "यात्रा बंद हो गई। अब नई बुकिंग आएँगी।",
  "Ride close ho gayi. Ab nayi bookings aayengi."
 ],
 [
  "Aapki ride complete hai. Payment app me 'My Rides' se kabhi bhi kar sakte hain.",
  "Your ride is complete. You can pay anytime from My Rides in the app.",
  "आपकी यात्रा पूरी हो गई है। आप ऐप में ‘मेरी यात्राएँ’ से कभी भी भुगतान कर सकते हैं।",
  "Aapki ride complete hai. Payment app me 'My Rides' se kabhi bhi kar sakte hain."
 ],
 [
  "Sirf assigned driver is ride ko close kar sakta hai",
  "Only the assigned driver can close this ride",
  "यह यात्रा केवल तय चालक बंद कर सकता है",
  "Sirf assigned driver is ride ko close kar sakta hai"
 ],
 [
  "Ride complete hone ke baad hi close kar sakte ho",
  "The ride can be closed only after it is completed",
  "यात्रा पूरी होने के बाद ही बंद की जा सकती है",
  "Ride complete hone ke baad hi close kar sakte ho"
 ],
 [
  "Payment confirmation pending hai. Payment receive hone ke baad next ride available hogi",
  "Payment confirmation is pending. The next ride will be available after the payment is received",
  "भुगतान की पुष्टि बाकी है। भुगतान मिलने के बाद अगली यात्रा उपलब्ध होगी",
  "Payment confirmation pending hai. Payment receive hone ke baad next ride available hogi"
 ],
 [
  "Google credential required hai",
  "Google sign-in is required",
  "Google साइन-इन आवश्यक है",
  "Google credential required hai"
 ],
 [
  "Google credential invalid hai",
  "Google sign-in is invalid",
  "Google साइन-इन अमान्य है",
  "Google credential invalid hai"
 ],
 [
  "Google ID token expire ho chuka hai",
  "Google sign-in has expired. Please try again.",
  "Google साइन-इन समाप्त हो गया है। कृपया दोबारा कोशिश करें।",
  "Google ID token expire ho chuka hai"
 ],
 [
  "Google email verified nahi hai",
  "Your Google email is not verified",
  "आपका Google ईमेल सत्यापित नहीं है",
  "Google email verified nahi hai"
 ],
 [
  "Aap is booking ke payment data access nahi kar sakte",
  "You cannot access payment data for this booking",
  "आप इस बुकिंग का भुगतान डेटा नहीं देख सकते",
  "Aap is booking ke payment data access nahi kar sakte"
 ],
 [
  "Driver assigned nahi hai",
  "No driver is assigned",
  "कोई चालक तय नहीं है",
  "Driver assigned nahi hai"
 ],
 [
  "Primary payout account ko ride earning submit ho gayi.",
  "Ride earnings sent to your primary payout account.",
  "यात्रा की कमाई आपके मुख्य भुगतान खाते में भेज दी गई।",
  "Primary payout account ko ride earning submit ho gayi."
 ],
 [
  "Payout amount valid nahi hai",
  "The payout amount is not valid",
  "भुगतान राशि मान्य नहीं है",
  "Payout amount valid nahi hai"
 ],
 [
  "Scheduled ride ke liye date/time required hai",
  "A date and time are required for a scheduled ride",
  "निर्धारित यात्रा के लिए तारीख और समय आवश्यक हैं",
  "Scheduled ride ke liye date/time required hai"
 ],
 [
  "Current ride active. Ride complete hone ke baad action available hoga.",
  "You have an active ride. This action will be available after it is completed.",
  "आपकी एक यात्रा चल रही है। उसके पूरा होने के बाद यह कार्रवाई उपलब्ध होगी।",
  "You have an active ride. This action will be available after it is completed."
 ],
 [
  "Final fare accept hone ke baad hi pickup ke liye ja sakte ho",
  "You can go to pickup only after the final fare is accepted",
  "अंतिम किराया स्वीकार होने के बाद ही आप पिकअप के लिए जा सकते हैं",
  "Final fare accept hone ke baad hi pickup ke liye ja sakte ho"
 ],
 [
  "Sirf unconfirmed accepted ride ko release kar sakte ho",
  "Only an accepted ride without a locked fare can be released",
  "केवल बिना तय किराये वाली स्वीकार की गई यात्रा मुक्त की जा सकती है",
  "Sirf unconfirmed accepted ride ko release kar sakte ho"
 ],
 [
  "Driver ne unconfirmed ride release ki. Naya driver search ho raha hai.",
  "The driver released the ride. Searching for a new driver.",
  "चालक ने यात्रा छोड़ दी। नया चालक खोजा जा रहा है।",
  "Driver ne unconfirmed ride release ki. Naya driver search ho raha hai."
 ],
 [
  "Ride request ab kisi aur driver ne accept kar li ya expire ho gayi",
  "This ride request was accepted by another driver or has expired",
  "यह यात्रा अनुरोध किसी दूसरे चालक ने स्वीकार कर लिया या समाप्त हो गया",
  "Ride request ab kisi aur driver ne accept kar li ya expire ho gayi"
 ],
 [
  "Ride accept process already in progress hai. Request refresh karo.",
  "This ride is already being accepted. Please refresh.",
  "यह यात्रा पहले से स्वीकार की जा रही है। कृपया रीफ़्रेश करें।",
  "Ride accept process already in progress hai. Request refresh karo."
 ],
 [
  "Fast2SMS se OTP send nahi ho saka",
  "The OTP could not be sent",
  "OTP नहीं भेजा जा सका",
  "Fast2SMS se OTP send nahi ho saka"
 ],
 [
  "Booking me assigned driver nahi hai",
  "No driver is assigned to this booking",
  "इस बुकिंग में कोई चालक तय नहीं है",
  "Booking me assigned driver nahi hai"
 ],
 [
  "Driver wallet nahi mila",
  "Driver wallet not found",
  "चालक वॉलेट नहीं मिला",
  "Driver wallet nahi mila"
 ],
 [
  "Valid UPI ID save karo",
  "Save a valid UPI ID",
  "मान्य UPI ID सहेजें",
  "Valid UPI ID save karo"
 ],
 [
  "Valid bank account number save karo",
  "Save a valid bank account number",
  "मान्य बैंक खाता नंबर सहेजें",
  "Valid bank account number save karo"
 ],
 [
  "Valid IFSC code save karo",
  "Save a valid IFSC code",
  "मान्य IFSC कोड सहेजें",
  "Valid IFSC code save karo"
 ],
 [
  "Withdrawal method UPI ya bank hona chahiye",
  "The withdrawal method must be UPI or bank",
  "निकासी का तरीका UPI या बैंक होना चाहिए",
  "The withdrawal method must be UPI or bank"
 ],
 [
  "Sirf driver fare offer kar sakta hai",
  "Only the driver can offer a fare",
  "किराया केवल चालक प्रस्तावित कर सकता है",
  "Sirf driver fare offer kar sakta hai"
 ],
 [
  "Booking ID aur valid amount required hai",
  "A booking ID and a valid amount are required",
  "बुकिंग ID और मान्य राशि आवश्यक है",
  "Booking ID aur valid amount required hai"
 ],
 [
  "Fare ₹50 se ₹10,000 ke beech hona chahiye",
  "The fare must be between ₹50 and ₹10,000",
  "किराया ₹50 से ₹10,000 के बीच होना चाहिए",
  "Fare ₹50 se ₹10,000 ke beech hona chahiye"
 ],
 [
  "Initial driver fare already sent. Customer ke one-time counter ka wait karo.",
  "Your initial fare has already been sent. Please wait for the customer's one-time counter.",
  "आपका पहला किराया पहले ही भेजा जा चुका है। कृपया ग्राहक के एक बार के काउंटर की प्रतीक्षा करें।",
  "Initial driver fare already sent. Customer ke one-time counter ka wait karo."
 ],
 [
  "Initial fare sirf accepted ride par bhej sakte ho.",
  "The initial fare can be sent only on an accepted ride.",
  "पहला किराया केवल स्वीकार की गई यात्रा पर भेजा जा सकता है।",
  "Initial fare sirf accepted ride par bhej sakte ho."
 ],
 [
  "Fare offer nahi ho saka",
  "The fare could not be offered",
  "किराया प्रस्तावित नहीं हो सका",
  "Fare offer nahi ho saka"
 ],
 [
  "Sirf customer counter offer kar sakta hai",
  "Only the customer can send a counter offer",
  "काउंटर प्रस्ताव केवल ग्राहक भेज सकता है",
  "Sirf customer counter offer kar sakta hai"
 ],
 [
  "Counter fare ₹50 se ₹10,000 ke beech hona chahiye",
  "The counter fare must be between ₹50 and ₹10,000",
  "काउंटर किराया ₹50 से ₹10,000 के बीच होना चाहिए",
  "Counter fare ₹50 se ₹10,000 ke beech hona chahiye"
 ],
 [
  "Counter sirf driver ke initial fare ke baad bhej sakte ho.",
  "A counter can be sent only after the driver's initial fare.",
  "काउंटर केवल चालक के पहले किराये के बाद भेजा जा सकता है।",
  "Counter sirf driver ke initial fare ke baad bhej sakte ho."
 ],
 [
  "Customer ka one-time counter already use ho chuka hai.",
  "The one-time counter offer has already been used.",
  "एक बार का काउंटर पहले ही उपयोग हो चुका है।",
  "Customer ka one-time counter already use ho chuka hai."
 ],
 [
  "Counter offer nahi ho saka",
  "The counter offer could not be sent",
  "काउंटर प्रस्ताव नहीं भेजा जा सका",
  "Counter offer nahi ho saka"
 ],
 [
  "Ride complete hone par payment karna hoga",
  "Payment is due when the ride is completed",
  "यात्रा पूरी होने पर भुगतान करना होगा",
  "Payment is due when the ride is completed"
 ],
 [
  "Updated fare flow required: Reject sirf driver FINAL fare par customer karega.",
  "Only the customer can reject, and only the driver's final fare.",
  "केवल ग्राहक अस्वीकार कर सकता है, और केवल चालक के अंतिम किराये को।",
  "Only the customer can reject, and only the driver's final fare."
 ],
 [
  "Fare reject ho gaya. Phir se negotiate karo ya ride cancel karo.",
  "Fare rejected. Negotiate again or cancel the ride.",
  "किराया अस्वीकार हो गया। दोबारा बात करें या यात्रा रद्द करें।",
  "Fare reject ho gaya. Phir se negotiate karo ya ride cancel karo."
 ],
 [
  "Fare reject ho gaya",
  "Fare rejected",
  "किराया अस्वीकार हो गया",
  "Fare reject ho gaya"
 ],
 [
  "Booking ID aur payment method required hai",
  "A booking ID and payment method are required",
  "बुकिंग ID और भुगतान का तरीका आवश्यक है",
  "Booking ID aur payment method required hai"
 ],
 [
  "Payment sirf completed ride ke liye",
  "Payment is only for a completed ride",
  "भुगतान केवल पूरी हो चुकी यात्रा के लिए है",
  "Payment sirf completed ride ke liye"
 ],
 [
  "Payment already ho chuki hai",
  "Payment has already been made",
  "भुगतान पहले ही हो चुका है",
  "Payment already ho chuki hai"
 ],
 [
  "Driver ko cash collection notify kar diya",
  "The driver has been notified to collect cash",
  "चालक को नकद लेने की सूचना दे दी गई",
  "Driver ko cash collection notify kar diya"
 ],
 [
  "Online payment ke liye proceed karo",
  "Proceed to online payment",
  "ऑनलाइन भुगतान के लिए आगे बढ़ें",
  "Online payment ke liye proceed karo"
 ],
 [
  "Payment initiate nahi ho saka",
  "The payment could not be started",
  "भुगतान शुरू नहीं हो सका",
  "Payment initiate nahi ho saka"
 ],
 [
  "Google public keys response empty hai",
  "Google sign-in could not be verified. Please try again.",
  "Google साइन-इन सत्यापित नहीं हो सका। कृपया दोबारा कोशिश करें।",
  "Google public keys response empty hai"
 ],
 [
  "Google signing key nahi mili",
  "Google sign-in could not be verified. Please try again.",
  "Google साइन-इन सत्यापित नहीं हो सका। कृपया दोबारा कोशिश करें।",
  "Google signing key nahi mili"
 ],
 [
  "Google ID token signature invalid hai",
  "Google sign-in could not be verified. Please try again.",
  "Google साइन-इन सत्यापित नहीं हो सका। कृपया दोबारा कोशिश करें।",
  "Google ID token signature invalid hai"
 ],
 [
  "GOOGLE_CLIENT_ID server environment me configured nahi hai",
  "Google sign-in could not be verified. Please try again.",
  "Google साइन-इन सत्यापित नहीं हो सका। कृपया दोबारा कोशिश करें।",
  "GOOGLE_CLIENT_ID server environment me configured nahi hai"
 ],
 [
  "Google ID token format invalid hai",
  "Google sign-in could not be verified. Please try again.",
  "Google साइन-इन सत्यापित नहीं हो सका। कृपया दोबारा कोशिश करें।",
  "Google ID token format invalid hai"
 ],
 [
  "Google ID token algorithm invalid hai",
  "Google sign-in could not be verified. Please try again.",
  "Google साइन-इन सत्यापित नहीं हो सका। कृपया दोबारा कोशिश करें।",
  "Google ID token algorithm invalid hai"
 ],
 [
  "Google ID token issuer invalid hai",
  "Google sign-in could not be verified. Please try again.",
  "Google साइन-इन सत्यापित नहीं हो सका। कृपया दोबारा कोशिश करें।",
  "Google ID token issuer invalid hai"
 ],
 [
  "Google ID token audience invalid hai",
  "Google sign-in could not be verified. Please try again.",
  "Google साइन-इन सत्यापित नहीं हो सका। कृपया दोबारा कोशिश करें।",
  "Google ID token audience invalid hai"
 ],
 [
  "Google ID token issue time invalid hai",
  "Google sign-in could not be verified. Please try again.",
  "Google साइन-इन सत्यापित नहीं हो सका। कृपया दोबारा कोशिश करें।",
  "Google ID token issue time invalid hai"
 ],
 [
  "Google account ID missing hai",
  "Google sign-in could not be verified. Please try again.",
  "Google साइन-इन सत्यापित नहीं हो सका। कृपया दोबारा कोशिश करें।",
  "Google account ID missing hai"
 ],
 [
  "Razorpay live keys server par configure nahi hain",
  "Online payment is not available right now.",
  "ऑनलाइन भुगतान अभी उपलब्ध नहीं है।",
  "Razorpay live keys server par configure nahi hain"
 ],
 [
  "REAL_MONEY_MODE me rzp_live_ Razorpay key required hai",
  "Online payment is not available right now.",
  "ऑनलाइन भुगतान अभी उपलब्ध नहीं है।",
  "REAL_MONEY_MODE me rzp_live_ Razorpay key required hai"
 ],
 [
  "Razorpay API keys configured nahi hain",
  "Online payment is not available right now.",
  "ऑनलाइन भुगतान अभी उपलब्ध नहीं है।",
  "Razorpay API keys configured nahi hain"
 ],
 [
  "Production map service key configured nahi hai",
  "The service is temporarily unavailable. Please try again later.",
  "सेवा अभी अस्थायी रूप से उपलब्ध नहीं है। कृपया बाद में कोशिश करें।",
  "Production map service key configured nahi hai"
 ],
 [
  "Driver Razorpay Route linked account configured nahi hai",
  "The driver's payout account is not linked yet",
  "चालक का भुगतान खाता अभी जुड़ा नहीं है",
  "Driver Razorpay Route linked account configured nahi hai"
 ],
 [
  "Booking order ID se nahi mili",
  "Booking not found for this order",
  "इस ऑर्डर के लिए बुकिंग नहीं मिली",
  "Booking order ID se nahi mili"
 ],
 [
  "Webhook process nahi hua",
  "The service is temporarily unavailable. Please try again later.",
  "सेवा अभी अस्थायी रूप से उपलब्ध नहीं है। कृपया बाद में कोशिश करें।",
  "Webhook process nahi hua"
 ],
 [
  "Booking webhook mapping nahi mili",
  "The service is temporarily unavailable. Please try again later.",
  "सेवा अभी अस्थायी रूप से उपलब्ध नहीं है। कृपया बाद में कोशिश करें।",
  "Booking webhook mapping nahi mili"
 ],
 [
  "Matching withdrawal nahi mili",
  "Matching withdrawal not found",
  "मिलती-जुलती निकासी नहीं मिली",
  "Matching withdrawal nahi mili"
 ],
 [
  "Authentication required",
  "Authentication required",
  "लॉगिन आवश्यक है",
  "Authentication required"
 ],
 [
  "Push notification device registered",
  "Push notification device registered",
  "सूचनाओं के लिए डिवाइस पंजीकृत हो गया",
  "Push notification device registered"
 ],
 [
  "Push notification device unregistered",
  "Push notification device unregistered",
  "सूचनाओं के लिए डिवाइस हटा दिया गया",
  "Push notification device unregistered"
 ],
 [
  "HimRideG Notification Test 🔔",
  "HimRideG Notification Test 🔔",
  "HimRideG सूचना परीक्षण 🔔",
  "HimRideG Notification Test 🔔"
 ],
 [
  "Test push sent",
  "Test push sent",
  "परीक्षण सूचना भेजी गई",
  "Test push sent"
 ],
 [
  "Only drivers can access this route",
  "Only drivers can access this route",
  "यह केवल चालकों के लिए है",
  "Only drivers can access this route"
 ],
 [
  "Driver account not found",
  "Driver account not found",
  "चालक खाता नहीं मिला",
  "Driver account not found"
 ],
 [
  "Driver profile loaded successfully",
  "Driver profile loaded successfully",
  "चालक प्रोफ़ाइल लोड हो गई",
  "Driver profile loaded successfully"
 ],
 [
  "Driver profile updated successfully",
  "Driver profile updated successfully",
  "चालक प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई",
  "Driver profile updated successfully"
 ],
 [
  "Profile photo required",
  "Profile photo required",
  "प्रोफ़ाइल फ़ोटो आवश्यक है",
  "Profile photo required"
 ],
 [
  "Profile photo updated successfully",
  "Profile photo updated successfully",
  "प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट हो गई",
  "Profile photo updated successfully"
 ],
 [
  "Invalid document type",
  "Invalid document type",
  "अमान्य दस्तावेज़ प्रकार",
  "Invalid document type"
 ],
 [
  "Document file required",
  "Document file required",
  "दस्तावेज़ फ़ाइल आवश्यक है",
  "Document file required"
 ],
 [
  "Driver document uploaded successfully",
  "Driver document uploaded successfully",
  "दस्तावेज़ सफलतापूर्वक अपलोड हो गया",
  "Driver document uploaded successfully"
 ],
 [
  "Document not found",
  "Document not found",
  "दस्तावेज़ नहीं मिला",
  "Document not found"
 ],
 [
  "Document file not found",
  "Document file not found",
  "दस्तावेज़ फ़ाइल नहीं मिली",
  "Document file not found"
 ],
 [
  "No active ride found",
  "No active ride found",
  "कोई सक्रिय यात्रा नहीं मिली",
  "No active ride found"
 ],
 [
  "Valid date of birth chahiye",
  "A valid date of birth is required",
  "मान्य जन्म तिथि आवश्यक है",
  "A valid date of birth is required"
 ],
 [
  "Wallet top-up hua aur commission due automatically clear hua",
  "Wallet topped up and commission due cleared automatically",
  "वॉलेट टॉप-अप हुआ और बकाया कमीशन अपने-आप चुका दिया गया",
  "Wallet topped up and commission due cleared automatically"
 ],
 [
  "Withdrawal request pending",
  "Withdrawal request pending",
  "निकासी अनुरोध लंबित है",
  "Withdrawal request pending"
 ],
 [
  "Online UPI payment selected.",
  "Online UPI payment selected.",
  "ऑनलाइन UPI भुगतान चुना गया।",
  "Online UPI payment selected."
 ],
 [
  "Razorpay payment failed",
  "Razorpay payment failed",
  "भुगतान विफल रहा",
  "Razorpay payment failed"
 ],
 [
  "Payment signature invalid",
  "Payment signature invalid",
  "भुगतान हस्ताक्षर अमान्य है",
  "Payment signature invalid"
 ],
 [
  "Payment attempt failed",
  "Payment attempt failed",
  "भुगतान का प्रयास विफल रहा",
  "Payment attempt failed"
 ],
 [
  "Cash selected. Driver cash receive karke confirm karega.",
  "Cash selected. The driver will confirm after receiving the cash.",
  "नकद चुना गया। चालक नकद मिलने के बाद पुष्टि करेगा।",
  "Cash selected. The driver will confirm after receiving the cash."
 ],
 [
  "Assigned driver confirmed Cash Received",
  "Assigned driver confirmed Cash Received",
  "तय चालक ने नकद मिलने की पुष्टि की",
  "Assigned driver confirmed Cash Received"
 ],
 [
  "Payment status access denied",
  "Payment status access denied",
  "भुगतान की स्थिति देखने की अनुमति नहीं है",
  "Payment status access denied"
 ],
 [
  "Receipt access denied",
  "Receipt access denied",
  "रसीद देखने की अनुमति नहीं है",
  "Receipt access denied"
 ],
 [
  "Only customers can create bookings",
  "Only customers can create bookings",
  "बुकिंग केवल ग्राहक बना सकते हैं",
  "Only customers can create bookings"
 ],
 [
  "Booking created successfully. Searching for a driver.",
  "Booking created successfully. Searching for a driver.",
  "बुकिंग सफलतापूर्वक बन गई। चालक खोजा जा रहा है।",
  "Booking created successfully. Searching for a driver."
 ],
 [
  "Booking not found",
  "Booking not found",
  "बुकिंग नहीं मिली",
  "Booking not found"
 ],
 [
  "You are not allowed to view this booking",
  "You are not allowed to view this booking",
  "आप यह बुकिंग नहीं देख सकते",
  "You are not allowed to view this booking"
 ],
 [
  "Only customers can cancel their bookings from this route",
  "Only customers can cancel their bookings from this route",
  "यहाँ से केवल ग्राहक अपनी बुकिंग रद्द कर सकते हैं",
  "Only customers can cancel their bookings from this route"
 ],
 [
  "You cannot cancel another customer's booking",
  "You cannot cancel another customer's booking",
  "आप किसी दूसरे ग्राहक की बुकिंग रद्द नहीं कर सकते",
  "You cannot cancel another customer's booking"
 ],
 [
  "Cancellation reason is required",
  "Cancellation reason is required",
  "रद्द करने का कारण आवश्यक है",
  "Cancellation reason is required"
 ],
 [
  "Cancellation reason cannot exceed 500 characters",
  "Cancellation reason cannot exceed 500 characters",
  "रद्द करने का कारण 500 अक्षरों से अधिक नहीं हो सकता",
  "Cancellation reason cannot exceed 500 characters"
 ],
 [
  "Booking cancelled successfully",
  "Booking cancelled successfully",
  "बुकिंग सफलतापूर्वक रद्द हो गई",
  "Booking cancelled successfully"
 ],
 [
  "UPI Payment Confirmation Required 💳",
  "UPI Payment Confirmation Required 💳",
  "UPI भुगतान की पुष्टि आवश्यक है 💳",
  "UPI Payment Confirmation Required 💳"
 ],
 [
  "Payment history access denied",
  "Payment history access denied",
  "भुगतान इतिहास देखने की अनुमति नहीं है",
  "Payment history access denied"
 ],
 [
  "This phone number is already registered as a customer",
  "This phone number is already registered as a customer",
  "यह फ़ोन नंबर पहले से ग्राहक के रूप में पंजीकृत है",
  "This phone number is already registered as a customer"
 ],
 [
  "Maximum OTP resend limit reached. Please try again later.",
  "Maximum OTP resend limit reached. Please try again later.",
  "OTP दोबारा भेजने की सीमा पूरी हो गई। कृपया बाद में कोशिश करें।",
  "Maximum OTP resend limit reached. Please try again later."
 ],
 [
  "Driver OTP sent successfully",
  "Driver OTP sent successfully",
  "OTP सफलतापूर्वक भेजा गया",
  "Driver OTP sent successfully"
 ],
 [
  "OTP not found or already used",
  "OTP not found or already used",
  "OTP नहीं मिला या पहले ही उपयोग हो चुका है",
  "OTP not found or already used"
 ],
 [
  "OTP has expired. Please request a new OTP.",
  "OTP has expired. Please request a new OTP.",
  "OTP समाप्त हो गया है। कृपया नया OTP माँगें।",
  "OTP has expired. Please request a new OTP."
 ],
 [
  "Maximum OTP attempts reached. Please request a new OTP.",
  "Maximum OTP attempts reached. Please request a new OTP.",
  "OTP प्रयासों की सीमा पूरी हो गई। कृपया नया OTP माँगें।",
  "Maximum OTP attempts reached. Please request a new OTP."
 ],
 [
  "Your account is inactive",
  "Your account is inactive",
  "आपका खाता निष्क्रिय है",
  "Your account is inactive"
 ],
 [
  "Driver account created successfully",
  "Driver account created successfully",
  "चालक खाता सफलतापूर्वक बन गया",
  "Driver account created successfully"
 ],
 [
  "Driver login successful",
  "Driver login successful",
  "चालक लॉगिन सफल",
  "Driver login successful"
 ],
 [
  "Notification send in progress. Try later.",
  "Notification send in progress. Try later.",
  "सूचना भेजी जा रही है। बाद में कोशिश करें।",
  "Notification send in progress. Try later."
 ],
 [
  "HimRideG update available",
  "HimRideG update available",
  "HimRideG अपडेट उपलब्ध है",
  "HimRideG update available"
 ],
 [
  "Your account has been blocked",
  "Your account has been blocked",
  "आपका खाता ब्लॉक कर दिया गया है",
  "Your account has been blocked"
 ],
 [
  "Basic info saved successfully",
  "Basic info saved successfully",
  "बुनियादी जानकारी सफलतापूर्वक सहेजी गई",
  "Basic info saved successfully"
 ],
 [
  "Admin login successful",
  "Admin login successful",
  "प्रशासक लॉगिन सफल",
  "Admin login successful"
 ],
 [
  "Admin login failed",
  "Admin login failed",
  "प्रशासक लॉगिन विफल",
  "Admin login failed"
 ],
 [
  "Admin authentication required.",
  "Admin authentication required.",
  "प्रशासक लॉगिन आवश्यक है।",
  "Admin authentication required."
 ],
 [
  "Admin ne driver application reject ki.",
  "Your driver application was rejected by the admin.",
  "प्रशासक ने आपका चालक आवेदन अस्वीकार कर दिया।",
  "Admin ne driver application reject ki."
 ],
 [
  "Admin ne unblock request reject ki.",
  "Your unblock request was rejected by the admin.",
  "प्रशासक ने आपका अनब्लॉक अनुरोध अस्वीकार कर दिया।",
  "Admin ne unblock request reject ki."
 ],
 [
  "Admin ne account suspend kiya.",
  "Your account has been suspended by the admin.",
  "प्रशासक ने आपका खाता निलंबित कर दिया।",
  "Your account has been suspended by the admin."
 ],
 [
  "HimRideG Payment",
  "HimRideG Payment",
  "HimRideG भुगतान",
  "HimRideG Payment"
 ],
 [
  "Access denied",
  "Access denied",
  "अनुमति नहीं है",
  "Access denied"
 ],
 [
  "Only drivers can access ride requests",
  "Only drivers can access ride requests",
  "यात्रा अनुरोध केवल चालक देख सकते हैं",
  "Only drivers can access ride requests"
 ],
 [
  "Invalid booking ID",
  "Invalid booking ID",
  "अमान्य बुकिंग ID",
  "Invalid booking ID"
 ],
 [
  "Cash / Offline",
  "Cash / Offline",
  "नकद / ऑफ़लाइन",
  "Cash / Offline"
 ],
 [
  "Payment confirmed by driver ✅",
  "Payment confirmed by driver ✅",
  "चालक ने भुगतान की पुष्टि की ✅",
  "Payment confirmed by driver ✅"
 ],
 [
  "Online ya Offline (cash) chuniye",
  "Choose Online or Offline (cash)",
  "ऑनलाइन या ऑफ़लाइन (नकद) चुनें",
  "Online ya Offline (cash) chuniye"
 ],
 [
  "Please enter a valid email address",
  "Please enter a valid email address",
  "कृपया मान्य ईमेल पता दर्ज करें",
  "Please enter a valid email address"
 ],
 [
  "Email cannot exceed 150 characters",
  "Email cannot exceed 150 characters",
  "ईमेल 150 अक्षरों से अधिक नहीं हो सकता",
  "Email cannot exceed 150 characters"
 ],
 [
  "Profile image is too large",
  "Profile image is too large",
  "प्रोफ़ाइल फ़ोटो बहुत बड़ी है",
  "Profile image is too large"
 ],
 [
  "This phone number is already registered as a driver",
  "This phone number is already registered as a driver",
  "यह फ़ोन नंबर पहले से चालक के रूप में पंजीकृत है",
  "This phone number is already registered as a driver"
 ],
 [
  "OTP sent successfully",
  "OTP sent successfully",
  "OTP सफलतापूर्वक भेजा गया",
  "OTP sent successfully"
 ],
 [
  "Name is required for first-time registration",
  "Name is required for first-time registration",
  "पहली बार पंजीकरण के लिए नाम आवश्यक है",
  "Name is required for first-time registration"
 ],
 [
  "Customer account created and login successful",
  "Customer account created and login successful",
  "ग्राहक खाता बन गया और लॉगिन सफल रहा",
  "Customer account created and login successful"
 ],
 [
  "Login successful",
  "Login successful",
  "लॉगिन सफल",
  "Login successful"
 ],
 [
  "Name must contain at least 2 characters",
  "Name must contain at least 2 characters",
  "नाम में कम से कम 2 अक्षर होने चाहिए",
  "Name must contain at least 2 characters"
 ],
 [
  "Name cannot exceed 100 characters",
  "Name cannot exceed 100 characters",
  "नाम 100 अक्षरों से अधिक नहीं हो सकता",
  "Name cannot exceed 100 characters"
 ],
 [
  "Gender must be male, female or other",
  "Gender must be male, female or other",
  "लिंग पुरुष, महिला या अन्य होना चाहिए",
  "Gender must be male, female or other"
 ],
 [
  "Valid date of birth required",
  "Valid date of birth required",
  "मान्य जन्म तिथि आवश्यक है",
  "Valid date of birth required"
 ],
 [
  "Logout successful",
  "Logout successful",
  "लॉग आउट सफल",
  "Logout successful"
 ],
 [
  "Login required",
  "Login required",
  "लॉगिन आवश्यक है",
  "Login required"
 ],
 [
  "Invalid link",
  "Invalid link",
  "अमान्य लिंक",
  "Invalid link"
 ],
 [
  "Withdrawal rejected — amount wallet me release",
  "Withdrawal rejected — the amount has been returned to the wallet",
  "निकासी अस्वीकार — राशि वॉलेट में वापस कर दी गई",
  "Withdrawal rejected — amount wallet me release"
 ],
 [
  "Admin marked withdrawal transferred",
  "Admin marked withdrawal transferred",
  "प्रशासक ने निकासी को ट्रांसफ़र किया चिह्नित किया",
  "Admin marked withdrawal transferred"
 ],
 [
  "Selected location",
  "Selected location",
  "चुनी गई लोकेशन",
  "Selected location"
 ],
 [
  "Bus stand",
  "Bus stand",
  "बस अड्डा",
  "Bus stand"
 ],
 [
  "Railway station",
  "Railway station",
  "रेलवे स्टेशन",
  "Railway station"
 ],
 [
  "Taxi stand",
  "Taxi stand",
  "टैक्सी स्टैंड",
  "Taxi stand"
 ],
 [
  "Petrol pump",
  "Petrol pump",
  "पेट्रोल पंप",
  "Petrol pump"
 ],
 [
  "Police station",
  "Police station",
  "पुलिस थाना",
  "Police station"
 ],
 [
  "Post office",
  "Post office",
  "डाकघर",
  "Post office"
 ],
 [
  "Commission due",
  "Commission due",
  "बकाया कमीशन",
  "Commission due"
 ],
 [
  "⚠️ Final warning — HimRideG",
  "⚠️ Final warning — HimRideG",
  "⚠️ अंतिम चेतावनी — HimRideG",
  "⚠️ Final warning — HimRideG"
 ],
 [
  "⚠️ HimRideG warning",
  "⚠️ HimRideG warning",
  "⚠️ HimRideG चेतावनी",
  "⚠️ HimRideG warning"
 ],
 [
  "Complaint update — HimRideG",
  "Complaint update — HimRideG",
  "शिकायत अपडेट — HimRideG",
  "Complaint update — HimRideG"
 ],
 [
  "Mode aur rates valid daaliye",
  "Enter a valid mode and rates",
  "मान्य मोड और दरें दर्ज करें",
  "Enter a valid mode and rates"
 ],
 [
  "Fare aur km valid daaliye",
  "Enter a valid fare and distance",
  "मान्य किराया और दूरी दर्ज करें",
  "Enter a valid fare and distance"
 ],
 [
  "Driver Fare Offer",
  "Driver Fare Offer",
  "चालक का किराया प्रस्ताव",
  "Driver Fare Offer"
 ],
 [
  "Customer Counter Offer",
  "Customer Counter Offer",
  "ग्राहक का काउंटर प्रस्ताव",
  "Customer Counter Offer"
 ],
 [
  "Customer rejected final fare",
  "Customer rejected final fare",
  "ग्राहक ने अंतिम किराया अस्वीकार किया",
  "Customer rejected final fare"
 ],
 [
  "Customer has no active ride",
  "Customer has no active ride",
  "ग्राहक की कोई सक्रिय यात्रा नहीं है",
  "Customer has no active ride"
 ],
 [
  "Driver has no active ride",
  "Driver has no active ride",
  "चालक की कोई सक्रिय यात्रा नहीं है",
  "Driver has no active ride"
 ],
 [
  "No active dispatch request found",
  "No active dispatch request found",
  "कोई सक्रिय अनुरोध नहीं मिला",
  "No active dispatch request found"
 ],
 [
  "Booking is not eligible for expiry",
  "Booking is not eligible for expiry",
  "यह बुकिंग समाप्त नहीं की जा सकती",
  "Booking is not eligible for expiry"
 ],
 [
  "Driver arrival started successfully",
  "Driver arrival started successfully",
  "चालक पिकअप के लिए निकल पड़ा",
  "Driver arrival started successfully"
 ],
 [
  "Driver marked as arrived successfully",
  "Driver marked as arrived successfully",
  "चालक के पहुँचने की जानकारी दर्ज हो गई",
  "Driver marked as arrived successfully"
 ],
 [
  "Driver rated successfully",
  "Driver rated successfully",
  "चालक को रेटिंग दे दी गई",
  "Driver rated successfully"
 ],
 [
  "Customer rated successfully",
  "Customer rated successfully",
  "ग्राहक को रेटिंग दे दी गई",
  "Customer rated successfully"
 ],
 [
  "Sahi 10 digit mobile number likhein",
  "Enter a valid 10-digit mobile number",
  "सही 10 अंकों का मोबाइल नंबर लिखें",
  "Enter a valid 10-digit mobile number"
 ],
 [
  "Admin account no longer exists",
  "Admin account no longer exists",
  "प्रशासक खाता अब मौजूद नहीं है",
  "Admin account no longer exists"
 ],
 [
  "User account no longer exists",
  "User account no longer exists",
  "उपयोगकर्ता खाता अब मौजूद नहीं है",
  "User account no longer exists"
 ],
 [
  "Your account is not active",
  "Your account is not active",
  "आपका खाता सक्रिय नहीं है",
  "Your account is not active"
 ],
 [
  "Your account is not allowed to access this service",
  "Your account is not allowed to access this service",
  "आपके खाते को इस सेवा की अनुमति नहीं है",
  "Your account is not allowed to access this service"
 ],
 [
  "Your account is blocked. Please contact HimRideG support",
  "Your account is blocked. Please contact HimRideG support",
  "आपका खाता ब्लॉक है। कृपया HimRideG सहायता से संपर्क करें",
  "Your account is blocked. Please contact HimRideG support"
 ],
 [
  "Your account is suspended",
  "Your account is suspended",
  "आपका खाता निलंबित है",
  "Your account is suspended"
 ],
 [
  "You are not allowed to access this route",
  "You are not allowed to access this route",
  "आपको इसकी अनुमति नहीं है",
  "You are not allowed to access this route"
 ],
 [
  "Admin commission policy applies to new fare locks.",
  "Admin commission policy applies to new fare locks.",
  "प्रशासक की कमीशन नीति नए तय किरायों पर लागू होती है।",
  "Admin commission policy applies to new fare locks."
 ],
 [
  "New rides: 0% HimRideG commission, driver keeps the full fare.",
  "New rides: 0% HimRideG commission, driver keeps the full fare.",
  "नई यात्राएँ: 0% HimRideG कमीशन, पूरा किराया चालक का।",
  "New rides: 0% HimRideG commission, driver keeps the full fare."
 ],
 [
  "Cash ride platform commission wallet se debit",
  "Cash ride platform commission debited from the wallet",
  "नकद यात्रा का प्लेटफ़ॉर्म कमीशन वॉलेट से काटा गया",
  "Cash ride platform commission wallet se debit"
 ],
 [
  "New ride request received",
  "New ride request received",
  "नया यात्रा अनुरोध मिला",
  "New ride request received"
 ],
 [
  "Driver accepted the ride",
  "Driver accepted the ride",
  "चालक ने यात्रा स्वीकार की",
  "Driver accepted the ride"
 ],
 [
  "Driver rejected the ride",
  "Driver rejected the ride",
  "चालक ने यात्रा अस्वीकार की",
  "Driver rejected the ride"
 ],
 [
  "Driver is arriving at pickup location",
  "Driver is arriving at pickup location",
  "चालक पिकअप लोकेशन पर आ रहा है",
  "Driver is arriving at pickup location"
 ],
 [
  "Driver has arrived at pickup location",
  "Driver has arrived at pickup location",
  "चालक पिकअप लोकेशन पर पहुँच गया है",
  "Driver has arrived at pickup location"
 ],
 [
  "Driver location updated",
  "Driver location updated",
  "चालक की लोकेशन अपडेट हुई",
  "Driver location updated"
 ],
 [
  "Driver went offline",
  "Driver went offline",
  "चालक ऑफ़लाइन हो गया",
  "Driver went offline"
 ],
 [
  "HimRideG Driver Payout",
  "HimRideG Driver Payout",
  "HimRideG चालक भुगतान",
  "HimRideG Driver Payout"
 ],
 [
  "This account is not a driver account",
  "This account is not a driver account",
  "यह चालक खाता नहीं है",
  "This account is not a driver account"
 ],
 [
  "Driver account is inactive",
  "Driver account is inactive",
  "चालक खाता निष्क्रिय है",
  "Driver account is inactive"
 ],
 [
  "Driver account must be approved before going online",
  "Driver account must be approved before going online",
  "ऑनलाइन होने से पहले चालक खाते का स्वीकृत होना आवश्यक है",
  "Driver account must be approved before going online"
 ],
 [
  "Driver cannot go offline during an active ride",
  "Driver cannot go offline during an active ride",
  "यात्रा के दौरान ऑफ़लाइन नहीं हो सकते",
  "Driver cannot go offline during an active ride"
 ],
 [
  "Driver must be online before becoming available",
  "Driver must be online before becoming available",
  "उपलब्ध होने से पहले ऑनलाइन होना आवश्यक है",
  "Driver must be online before becoming available"
 ],
 [
  "Driver account is not approved",
  "Driver account is not approved",
  "चालक खाता स्वीकृत नहीं है",
  "Driver account is not approved"
 ],
 [
  "Driver cannot become available during an active ride",
  "Driver cannot become available during an active ride",
  "यात्रा के दौरान उपलब्ध नहीं हो सकते",
  "Driver cannot become available during an active ride"
 ],
 [
  "Pickup coordinates are invalid",
  "Pickup coordinates are invalid",
  "पिकअप लोकेशन अमान्य है",
  "Pickup coordinates are invalid"
 ],
 [
  "Driver not found or inactive",
  "Driver not found or inactive",
  "चालक नहीं मिला या निष्क्रिय है",
  "Driver not found or inactive"
 ],
 [
  "Customer not found or inactive",
  "Customer not found or inactive",
  "ग्राहक नहीं मिला या निष्क्रिय है",
  "Customer not found or inactive"
 ],
 [
  "You already have an active ride",
  "You already have an active ride",
  "आपकी एक यात्रा पहले से चल रही है",
  "You already have an active ride"
 ],
 [
  "Travel date is invalid",
  "Travel date is invalid",
  "यात्रा की तारीख अमान्य है",
  "Travel date is invalid"
 ],
 [
  "Scheduled ride date must be in the future",
  "Scheduled ride date must be in the future",
  "निर्धारित यात्रा की तारीख भविष्य की होनी चाहिए",
  "Scheduled ride date must be in the future"
 ],
 [
  "Passengers must be a whole number",
  "Passengers must be a whole number",
  "यात्रियों की संख्या पूर्ण संख्या होनी चाहिए",
  "Passengers must be a whole number"
 ],
 [
  "Vehicle type is invalid",
  "Vehicle type is invalid",
  "वाहन प्रकार अमान्य है",
  "Vehicle type is invalid"
 ],
 [
  "Payment method is invalid",
  "Payment method is invalid",
  "भुगतान का तरीका अमान्य है",
  "Payment method is invalid"
 ],
 [
  "You cannot access this ride",
  "You cannot access this ride",
  "आप इस यात्रा को नहीं देख सकते",
  "You cannot access this ride"
 ],
 [
  "No available drivers found",
  "No available drivers found",
  "कोई उपलब्ध चालक नहीं मिला",
  "No available drivers found"
 ],
 [
  "🚕 New HimRideG Ride",
  "🚕 New HimRideG Ride",
  "🚕 नई HimRideG यात्रा",
  "🚕 New HimRideG Ride"
 ],
 [
  "Driver is no longer available",
  "Driver is no longer available",
  "चालक अब उपलब्ध नहीं है",
  "Driver is no longer available"
 ],
 [
  "Driver cannot mark arriving for this ride",
  "Driver cannot mark arriving for this ride",
  "इस यात्रा के लिए पिकअप पर जाना दर्ज नहीं किया जा सकता",
  "Driver cannot mark arriving for this ride"
 ],
 [
  "Driver cannot mark arrived for this ride",
  "Driver cannot mark arrived for this ride",
  "इस यात्रा के लिए पहुँचना दर्ज नहीं किया जा सकता",
  "Driver cannot mark arrived for this ride"
 ],
 [
  "You are not assigned to this ride",
  "You are not assigned to this ride",
  "यह यात्रा आपको नहीं सौंपी गई है",
  "You are not assigned to this ride"
 ],
 [
  "OTP can only be verified after driver arrival",
  "OTP can only be verified after driver arrival",
  "OTP चालक के पहुँचने के बाद ही सत्यापित हो सकता है",
  "OTP can only be verified after driver arrival"
 ],
 [
  "Maximum OTP attempts exceeded",
  "Maximum OTP attempts exceeded",
  "OTP प्रयासों की सीमा पूरी हो गई",
  "Maximum OTP attempts exceeded"
 ],
 [
  "OTP is required",
  "OTP is required",
  "OTP आवश्यक है",
  "OTP is required"
 ],
 [
  "Incorrect ride OTP",
  "Incorrect ride OTP",
  "यात्रा OTP गलत है",
  "Incorrect ride OTP"
 ],
 [
  "OTP regeneration access denied",
  "OTP regeneration access denied",
  "OTP दोबारा बनाने की अनुमति नहीं है",
  "OTP regeneration access denied"
 ],
 [
  "OTP cannot be regenerated at this stage",
  "OTP cannot be regenerated at this stage",
  "इस चरण पर OTP दोबारा नहीं बनाया जा सकता",
  "OTP cannot be regenerated at this stage"
 ],
 [
  "Verify customer OTP before starting ride",
  "Verify customer OTP before starting ride",
  "यात्रा शुरू करने से पहले ग्राहक का OTP सत्यापित करें",
  "Verify customer OTP before starting ride"
 ],
 [
  "Driver cannot update this ride location",
  "Driver cannot update this ride location",
  "इस यात्रा की लोकेशन अपडेट नहीं की जा सकती",
  "Driver cannot update this ride location"
 ],
 [
  "Only a started ride can be completed",
  "Only a started ride can be completed",
  "केवल शुरू हुई यात्रा ही पूरी की जा सकती है",
  "Only a started ride can be completed"
 ],
 [
  "Customer not responding",
  "Customer not responding",
  "ग्राहक जवाब नहीं दे रहा",
  "Customer not responding"
 ],
 [
  "This ride cannot be cancelled",
  "This ride cannot be cancelled",
  "यह यात्रा रद्द नहीं की जा सकती",
  "This ride cannot be cancelled"
 ],
 [
  "You cannot cancel this ride",
  "You cannot cancel this ride",
  "आप यह यात्रा रद्द नहीं कर सकते",
  "You cannot cancel this ride"
 ],
 [
  "Customer cannot cancel ride at this stage",
  "Customer cannot cancel ride at this stage",
  "इस चरण पर यात्रा रद्द नहीं की जा सकती",
  "Customer cannot cancel ride at this stage"
 ],
 [
  "Driver cannot cancel ride at this stage",
  "Driver cannot cancel ride at this stage",
  "इस चरण पर यात्रा रद्द नहीं की जा सकती",
  "Driver cannot cancel ride at this stage"
 ],
 [
  "Rating must be between 1 and 5",
  "Rating must be between 1 and 5",
  "रेटिंग 1 से 5 के बीच होनी चाहिए",
  "Rating must be between 1 and 5"
 ],
 [
  "Driver not found",
  "Driver not found",
  "चालक नहीं मिला",
  "Driver not found"
 ],
 [
  "User account not found",
  "User account not found",
  "उपयोगकर्ता खाता नहीं मिला",
  "User account not found"
 ],
 [
  "User account is inactive",
  "User account is inactive",
  "उपयोगकर्ता खाता निष्क्रिय है",
  "User account is inactive"
 ],
 [
  "User account is blocked",
  "User account is blocked",
  "उपयोगकर्ता खाता ब्लॉक है",
  "User account is blocked"
 ],
 [
  "User account is suspended",
  "User account is suspended",
  "उपयोगकर्ता खाता निलंबित है",
  "User account is suspended"
 ],
 [
  "You are not allowed to join this ride room",
  "You are not allowed to join this ride room",
  "आपको इस यात्रा से जुड़ने की अनुमति नहीं है",
  "You are not allowed to join this ride room"
 ],
 [
  "Only the assigned driver can update ride location",
  "Only the assigned driver can update ride location",
  "यात्रा की लोकेशन केवल तय चालक अपडेट कर सकता है",
  "Only the assigned driver can update ride location"
 ],
 [
  "Location cannot be updated for this ride",
  "Location cannot be updated for this ride",
  "इस यात्रा की लोकेशन अपडेट नहीं की जा सकती",
  "Location cannot be updated for this ride"
 ],
 [
  "Counter offer bhej diya gaya",
  "Counter offer sent",
  "काउंटर प्रस्ताव भेज दिया गया",
  "Counter offer bhej diya gaya"
 ],
 [
  "Please enter a valid Indian mobile number",
  "Please enter a valid Indian mobile number",
  "कृपया मान्य भारतीय मोबाइल नंबर दर्ज करें",
  "Please enter a valid Indian mobile number"
 ],
 [
  "OTP must be a 6-digit number",
  "OTP must be a 6-digit number",
  "OTP 6 अंकों का होना चाहिए",
  "OTP must be a 6-digit number"
 ],
 [
  "Location data is required",
  "Location data is required",
  "लोकेशन जानकारी आवश्यक है",
  "Location data is required"
 ],
 [
  "Driver name is required",
  "Driver name is required",
  "चालक का नाम आवश्यक है",
  "Driver name is required"
 ],
 [
  "Driver name must contain at least 2 characters",
  "Driver name must contain at least 2 characters",
  "चालक के नाम में कम से कम 2 अक्षर होने चाहिए",
  "Driver name must contain at least 2 characters"
 ],
 [
  "Driver name cannot exceed 100 characters",
  "Driver name cannot exceed 100 characters",
  "चालक का नाम 100 अक्षरों से अधिक नहीं हो सकता",
  "Driver name cannot exceed 100 characters"
 ],
 [
  "Please provide a valid travel date",
  "Please provide a valid travel date",
  "कृपया मान्य यात्रा तारीख दें",
  "Please provide a valid travel date"
 ],
 [
  "Travel date cannot be in the past",
  "Travel date cannot be in the past",
  "यात्रा की तारीख बीती हुई नहीं हो सकती",
  "Travel date cannot be in the past"
 ],
 [
  "Distance must be greater than zero",
  "Distance must be greater than zero",
  "दूरी शून्य से अधिक होनी चाहिए",
  "Distance must be greater than zero"
 ],
 [
  "Distance cannot exceed 2000 kilometres",
  "Distance cannot exceed 2000 kilometres",
  "दूरी 2000 किलोमीटर से अधिक नहीं हो सकती",
  "Distance cannot exceed 2000 kilometres"
 ],
 [
  "Passengers must be a whole number between 1 and 20",
  "Passengers must be a whole number between 1 and 20",
  "यात्रियों की संख्या 1 से 20 के बीच होनी चाहिए",
  "Passengers must be a whole number between 1 and 20"
 ],
 [
  "Note cannot exceed 500 characters",
  "Note cannot exceed 500 characters",
  "नोट 500 अक्षरों से अधिक नहीं हो सकता",
  "Note cannot exceed 500 characters"
 ],
 [
  "Fare values cannot be negative",
  "Fare values cannot be negative",
  "किराया ऋणात्मक नहीं हो सकता",
  "Fare values cannot be negative"
 ],
 [
  "Vehicle Photo (number plate visible)",
  "Vehicle Photo (number plate visible)",
  "वाहन की फोटो (नंबर प्लेट दिखनी चाहिए)",
  "Vehicle Photo (number plate visible)"
 ],
 [
  "Vehicle Brand",
  "Vehicle Brand",
  "वाहन ब्रांड",
  "Vehicle Brand"
 ],
 [
  "Vehicle Model",
  "Vehicle Model",
  "वाहन मॉडल",
  "Vehicle Model"
 ],
 [
  "Internal server error",
  "Internal server error",
  "सर्वर में त्रुटि हुई। कृपया दोबारा कोशिश करें।",
  "Internal server error"
 ],
 [
  "Validation failed",
  "Validation failed",
  "दर्ज जानकारी सही नहीं है",
  "Validation failed"
 ],
 [
  "Duplicate value detected",
  "Duplicate value detected",
  "यह जानकारी पहले से मौजूद है",
  "Duplicate value detected"
 ],
 [
  "Session expired. Please login again.",
  "Session expired. Please login again.",
  "सत्र समाप्त हो गया। कृपया दोबारा लॉगिन करें।",
  "Session expired. Please login again."
 ],
 [
  "Valid latitude and longitude are required",
  "Valid latitude and longitude are required",
  "मान्य लोकेशन आवश्यक है",
  "Valid latitude and longitude are required"
 ],
 [
  "Ride cancelled successfully",
  "Ride cancelled successfully",
  "यात्रा सफलतापूर्वक रद्द हो गई",
  "Ride cancelled successfully"
 ]
];

const patterns = [
 [
  "Drop tak {0}",
  "Drop in {0}",
  "ड्रॉप तक {0}",
  "Drop tak {0}"
 ],
 [
  "Pickup tak {0}",
  "Pickup in {0}",
  "पिकअप तक {0}",
  "Pickup tak {0}"
 ],
 [
  "Driver {0} min door",
  "Driver is {0} min away",
  "चालक {0} मिनट दूर है",
  "Driver is {0} min away"
 ],
 [
  "Send an update notification to registered {0} devices? This does not install the APK.",
  "Send an update notification to registered {0} devices? This does not install the APK.",
  "पंजीकृत {0} डिवाइस को अपडेट सूचना भेजें? इससे APK इंस्टॉल नहीं होता।",
  "Send an update notification to registered {0} devices? This does not install the APK."
 ],
 [
  "{0} accepted by push provider, {1} rejected. Phone delivery is not confirmed.",
  "{0} accepted by the push provider, {1} rejected. Delivery to phones is not confirmed.",
  "{0} सूचनाएँ स्वीकार हुईं, {1} अस्वीकार हुईं। फ़ोन तक पहुँचना पक्का नहीं है।",
  "{0} accepted by the push provider, {1} rejected. Delivery to phones is not confirmed."
 ],
 [
  "{0} · {1} · {2}km tak {3}, upar {4}",
  "{0} · {1} · up to {2} km {3}, above {4}",
  "{0} · {1} · {2} किमी तक {3}, उससे ऊपर {4}",
  "{0} · {1} · {2}km tak {3}, upar {4}"
 ],
 [
  "+{0} aaj • {1} blocked",
  "+{0} today • {1} blocked",
  "आज +{0} • {1} ब्लॉक",
  "+{0} aaj • {1} blocked"
 ],
 [
  "{0} online • {1} pending approval",
  "{0} online • {1} pending approval",
  "{0} ऑनलाइन • {1} स्वीकृति बाकी",
  "{0} online • {1} pending approval"
 ],
 [
  "{0} high priority",
  "{0} high priority",
  "{0} उच्च प्राथमिकता",
  "{0} high priority"
 ],
 [
  "{0} complete • {1} cancel",
  "{0} completed • {1} cancelled",
  "{0} पूरी • {1} रद्द",
  "{0} completed • {1} cancelled"
 ],
 [
  "Kul {0} {1}",
  "Total {0} {1}",
  "कुल {0} {1}",
  "Kul {0} {1}"
 ],
 [
  "({0} open)",
  "({0} open)",
  "({0} खुली)",
  "({0} open)"
 ],
 [
  "• Ride {0}",
  "• Ride {0}",
  "• यात्रा {0}",
  "• Ride {0}"
 ],
 [
  "Customer ne aapki ride{0} me \"{1}\" ki complaint ki hai. Kripya HimRideG ke niyam follow karein, nahi to account block ho sakta hai.",
  "A customer has reported \"{1}\" on your ride{0}. Please follow HimRideG's rules, otherwise your account may be blocked.",
  "एक ग्राहक ने आपकी यात्रा{0} में “{1}” की शिकायत की है। कृपया HimRideG के नियमों का पालन करें, अन्यथा आपका खाता ब्लॉक हो सकता है।",
  "Customer ne aapki ride{0} me \"{1}\" ki complaint ki hai. Kripya HimRideG ke niyam follow karein, nahi to account block ho sakta hai."
 ],
 [
  "Customer: {0} {1}",
  "Customer: {0} {1}",
  "ग्राहक: {0} {1}",
  "Customer: {0} {1}"
 ],
 [
  "Driver: {0} {1}",
  "Driver: {0} {1}",
  "चालक: {0} {1}",
  "Driver: {0} {1}"
 ],
 [
  "Kya aapko{0} {1} payment mil gayi hai? Confirm karte hi booking release ho jayegi.",
  "Have you received{0} {1} payment? The booking will be released once you confirm.",
  "क्या आपको{0} {1} भुगतान मिल गया है? पुष्टि करते ही बुकिंग मुक्त हो जाएगी।",
  "Kya aapko{0} {1} payment mil gayi hai? Confirm karte hi booking release ho jayegi."
 ],
 [
  "Withdrawal {0} successful",
  "Withdrawal {0} successful",
  "निकासी {0} सफल",
  "Withdrawal {0} successful"
 ],
 [
  "{0} ki application reject karne ka reason likho:",
  "Enter the reason for rejecting {0}'s application:",
  "{0} का आवेदन अस्वीकार करने का कारण लिखें:",
  "{0} ki application reject karne ka reason likho:"
 ],
 [
  "Kya aap {0} ki application reject karna chahte hain?",
  "Do you want to reject {0}'s application?",
  "क्या आप {0} का आवेदन अस्वीकार करना चाहते हैं?",
  "Kya aap {0} ki application reject karna chahte hain?"
 ],
 [
  "{0} ko warning message likho:",
  "Write a warning message for {0}:",
  "{0} के लिए चेतावनी संदेश लिखें:",
  "{0} ko warning message likho:"
 ],
 [
  "{0} ko block karne ka reason likho:",
  "Enter the reason for blocking {0}:",
  "{0} को ब्लॉक करने का कारण लिखें:",
  "{0} ko block karne ka reason likho:"
 ],
 [
  "Kya aap {0} ko block karna chahte hain?",
  "Do you want to block {0}?",
  "क्या आप {0} को ब्लॉक करना चाहते हैं?",
  "Kya aap {0} ko block karna chahte hain?"
 ],
 [
  "Bank: {0} {1} • {2}",
  "Bank: {0} {1} • {2}",
  "बैंक: {0} {1} • {2}",
  "Bank: {0} {1} • {2}"
 ],
 [
  "₹{0} fare customer ko bhej diya. Ab customer Accept, Reject ya one-time Counter karega.",
  "₹{0} fare sent to the customer. The customer can now accept, reject or send a one-time counter offer.",
  "₹{0} किराया ग्राहक को भेज दिया गया। अब ग्राहक स्वीकार, अस्वीकार या एक बार काउंटर कर सकता है।",
  "₹{0} fare customer ko bhej diya. Ab customer Accept, Reject ya one-time Counter karega."
 ],
 [
  "{0} ki sirf TEST platform fee ₹0 karni hai? Ride history aur earnings preserve rahengi.",
  "Reset only the TEST platform fee for {0} to ₹0? Ride history and earnings will be kept.",
  "{0} का केवल परीक्षण प्लेटफ़ॉर्म शुल्क ₹0 करना है? यात्रा इतिहास और कमाई सुरक्षित रहेंगी।",
  "{0} ki sirf TEST platform fee ₹0 karni hai? Ride history aur earnings preserve rahengi."
 ],
 [
  "{0} ki Test Ride, Earning, Payment aur Platform Fee history permanently साफ करनी है. Confirm karne ke liye DELETE likho:",
  "Permanently clear the test ride, earning, payment and platform fee history for {0}? Type DELETE to confirm:",
  "{0} का परीक्षण यात्रा, कमाई, भुगतान और प्लेटफ़ॉर्म शुल्क इतिहास स्थायी रूप से साफ़ करना है? पुष्टि के लिए DELETE लिखें:",
  "{0} ki Test Ride, Earning, Payment aur Platform Fee history permanently साफ करनी है. Confirm karne ke liye DELETE likho:"
 ],
 [
  "Request pehle hi {0} hai",
  "The request is already {0}",
  "अनुरोध पहले से {0} है",
  "Request pehle hi {0} hai"
 ],
 [
  "Driver approve nahi ho sakta. Yeh documents missing ya rejected hain: {0}",
  "The driver cannot be approved. These documents are missing or rejected: {0}",
  "चालक को स्वीकृत नहीं किया जा सकता। ये दस्तावेज़ नहीं हैं या अस्वीकृत हैं: {0}",
  "Driver approve nahi ho sakta. Yeh documents missing ya rejected hain: {0}"
 ],
 [
  "{0} document verify ho gaya!",
  "{0} document verified!",
  "{0} दस्तावेज़ सत्यापित हो गया!",
  "{0} document verify ho gaya!"
 ],
 [
  "Aapka naam verify ho gaya: {0}",
  "Your name has been verified: {0}",
  "आपका नाम सत्यापित हो गया: {0}",
  "Aapka naam verify ho gaya: {0}"
 ],
 [
  "{0} ka Test Mode ON ho gaya. Platform fee lock bypass rahega.",
  "Test Mode is ON for {0}. The platform fee lock will be bypassed.",
  "{0} के लिए परीक्षण मोड चालू हो गया। प्लेटफ़ॉर्म शुल्क लॉक लागू नहीं होगा।",
  "{0} ka Test Mode ON ho gaya. Platform fee lock bypass rahega."
 ],
 [
  "{0} ka Test Mode OFF ho gaya. Normal platform fee rule apply hoga.",
  "Test Mode is OFF for {0}. The normal platform fee rule applies.",
  "{0} के लिए परीक्षण मोड बंद हो गया। सामान्य प्लेटफ़ॉर्म शुल्क नियम लागू होगा।",
  "{0} ka Test Mode OFF ho gaya. Normal platform fee rule apply hoga."
 ],
 [
  "Test platform fee ₹{0} reset ho gayi. Ride history aur earnings preserve hain.",
  "Test platform fee of ₹{0} has been reset. Ride history and earnings are kept.",
  "₹{0} का परीक्षण प्लेटफ़ॉर्म शुल्क रीसेट हो गया। यात्रा इतिहास और कमाई सुरक्षित हैं।",
  "Test platform fee ₹{0} reset ho gayi. Ride history aur earnings preserve hain."
 ],
 [
  "Customer ne ₹{0} aapke UPI par pay karne ka confirmation diya hai. Account me amount check karke Payment Received confirm karein.",
  "The customer has confirmed paying ₹{0} to your UPI. Check the amount in your account and confirm Payment Received.",
  "ग्राहक ने आपके UPI पर ₹{0} भुगतान करने की पुष्टि की है। खाते में राशि जाँचकर “भुगतान प्राप्त हुआ” की पुष्टि करें।",
  "Customer ne ₹{0} aapke UPI par pay karne ka confirmation diya hai. Account me amount check karke Payment Received confirm karein."
 ],
 [
  "Driver ne ₹{0} UPI payment receive confirm kar di. Ride payment complete hai.",
  "The driver has confirmed receiving ₹{0} by UPI. The ride payment is complete.",
  "चालक ने ₹{0} UPI भुगतान मिलने की पुष्टि कर दी। यात्रा का भुगतान पूरा है।",
  "Driver ne ₹{0} UPI payment receive confirm kar di. Ride payment complete hai."
 ],
 [
  "Insufficient balance. Aapka balance ₹{0} hai.",
  "Insufficient balance. Your balance is ₹{0}.",
  "पर्याप्त शेष राशि नहीं है। आपकी शेष राशि ₹{0} है।",
  "Insufficient balance. Aapka balance ₹{0} hai."
 ],
 [
  "₹{0} withdrawal request submit ho gayi. Admin 24-48 ghante mein process karega.",
  "Withdrawal request of ₹{0} submitted. The admin will process it within 24–48 hours.",
  "₹{0} का निकासी अनुरोध जमा हो गया। प्रशासक 24–48 घंटे में इसे पूरा करेगा।",
  "₹{0} withdrawal request submit ho gayi. Admin 24-48 ghante mein process karega."
 ],
 [
  "Ye cheezein abhi baaki hain: {0}",
  "These items are still pending: {0}",
  "ये चीज़ें अभी बाकी हैं: {0}",
  "Ye cheezein abhi baaki hain: {0}"
 ],
 [
  "Driver ne ₹{0} fare bheja. Accept, Reject ya Counter karein.",
  "The driver sent a fare of ₹{0}. Accept, reject or counter it.",
  "चालक ने ₹{0} किराया भेजा है। स्वीकार करें, अस्वीकार करें या काउंटर भेजें।",
  "Driver ne ₹{0} fare bheja. Accept, Reject ya Counter karein."
 ],
 [
  "Customer ne ₹{0} counter bheja. Accept karein ya apna FINAL fare bhejein.",
  "The customer sent a counter offer of ₹{0}. Accept it or send your FINAL fare.",
  "ग्राहक ने ₹{0} का काउंटर भेजा है। स्वीकार करें या अपना अंतिम किराया भेजें।",
  "Customer ne ₹{0} counter bheja. Accept karein ya apna FINAL fare bhejein."
 ],
 [
  "Driver ne ₹{0} final fare bheja. Accept ya Reject karein.",
  "The driver sent a final fare of ₹{0}. Accept or reject it.",
  "चालक ने ₹{0} अंतिम किराया भेजा है। स्वीकार या अस्वीकार करें।",
  "Driver ne ₹{0} final fare bheja. Accept ya Reject karein."
 ],
 [
  "₹{0} fare accept ho gaya. GO TO PICKUP enabled hai.",
  "Fare of ₹{0} accepted. Go to Pickup is now enabled.",
  "₹{0} किराया स्वीकार हो गया। अब “यात्री लेने जाएँ” चालू है।",
  "₹{0} fare accept ho gaya. GO TO PICKUP enabled hai."
 ],
 [
  "Driver ne aapka ₹{0} counter accept kar liya. Fare lock ho gaya.",
  "The driver accepted your counter offer of ₹{0}. The fare is locked.",
  "चालक ने आपका ₹{0} का काउंटर स्वीकार कर लिया। किराया तय हो गया।",
  "Driver ne aapka ₹{0} counter accept kar liya. Fare lock ho gaya."
 ],
 [
  "₹{0} final fare accept ho gaya",
  "Final fare of ₹{0} accepted",
  "₹{0} अंतिम किराया स्वीकार हो गया",
  "₹{0} final fare accept ho gaya"
 ],
 [
  "Google account email match nahi hui. {0} wale Google account se continue karo.",
  "The Google account email does not match. Continue with the Google account for {0}.",
  "Google खाते का ईमेल मेल नहीं खाता। {0} वाले Google खाते से आगे बढ़ें।",
  "Google account email match nahi hui. {0} wale Google account se continue karo."
 ],
 [
  "Ye mobile number pehle se {0} account me registered hai",
  "This mobile number is already registered with a {0} account",
  "यह मोबाइल नंबर पहले से {0} खाते में पंजीकृत है",
  "Ye mobile number pehle se {0} account me registered hai"
 ],
 [
  "Customer ne ₹{0} cash payment select ki hai. Cash receive karke confirm karein.",
  "The customer chose to pay ₹{0} in cash. Confirm after receiving the cash.",
  "ग्राहक ने ₹{0} नकद भुगतान चुना है। नकद मिलने के बाद पुष्टि करें।",
  "Customer ne ₹{0} cash payment select ki hai. Cash receive karke confirm karein."
 ],
 [
  "Customer ne ₹{0} cash select kiya. Cash receive karke confirm karein.",
  "The customer chose to pay ₹{0} in cash. Confirm after receiving the cash.",
  "ग्राहक ने ₹{0} नकद चुना है। नकद मिलने के बाद पुष्टि करें।",
  "Customer ne ₹{0} cash select kiya. Cash receive karke confirm karein."
 ],
 [
  "Payment captured nahi hai. Current status: {0}",
  "The payment has not been captured. Current status: {0}",
  "भुगतान पूरा नहीं हुआ है। वर्तमान स्थिति: {0}",
  "Payment captured nahi hai. Current status: {0}"
 ],
 [
  "₹{0} online payment successful ho gayi.",
  "Online payment of ₹{0} successful.",
  "₹{0} का ऑनलाइन भुगतान सफल रहा।",
  "₹{0} online payment successful ho gayi."
 ],
 [
  "Platform fee payment captured nahi hai. Status: {0}",
  "The platform fee payment has not been captured. Status: {0}",
  "प्लेटफ़ॉर्म शुल्क भुगतान पूरा नहीं हुआ है। स्थिति: {0}",
  "Platform fee payment captured nahi hai. Status: {0}"
 ],
 [
  "₹{0} platform fee paid. ₹{1} abhi due hai.",
  "₹{0} platform fee paid. ₹{1} is still due.",
  "₹{0} प्लेटफ़ॉर्म शुल्क चुकाया गया। ₹{1} अभी बाकी है।",
  "₹{0} platform fee paid. ₹{1} abhi due hai."
 ],
 [
  "Driver ne {0} payment milna confirm kiya. Agar aapne payment nahi di to \"Payment nahi di\" report karein.",
  "The driver confirmed receiving the {0} payment. If you have not paid, report \"I haven't paid\".",
  "चालक ने {0} भुगतान मिलने की पुष्टि की है। यदि आपने भुगतान नहीं किया है, तो “मैंने भुगतान नहीं किया” रिपोर्ट करें।",
  "Driver ne {0} payment milna confirm kiya. Agar aapne payment nahi di to \"Payment nahi di\" report karein."
 ],
 [
  "₹{0} {1} payment driver ne confirm ki. Galat hai to app me report karein.",
  "The driver confirmed a ₹{0} {1} payment. If this is wrong, report it in the app.",
  "चालक ने ₹{0} {1} भुगतान की पुष्टि की है। यदि यह गलत है, तो ऐप में रिपोर्ट करें।",
  "₹{0} {1} payment driver ne confirm ki. Galat hai to app me report karein."
 ],
 [
  "Driver ne {0} payment milna confirm kiya. Ride complete hote hi booking close ho jayegi.",
  "The driver confirmed receiving the {0} payment. The booking will close when the ride is completed.",
  "चालक ने {0} भुगतान मिलने की पुष्टि की है। यात्रा पूरी होते ही बुकिंग बंद हो जाएगी।",
  "Driver ne {0} payment milna confirm kiya. Ride complete hote hi booking close ho jayegi."
 ],
 [
  "Customer report: maine payment nahi di, lekin driver ne {0} payment confirm kar di.",
  "Customer report: I have not paid, but the driver confirmed the {0} payment.",
  "ग्राहक रिपोर्ट: मैंने भुगतान नहीं किया, लेकिन चालक ने {0} भुगतान की पुष्टि कर दी।",
  "Customer report: maine payment nahi di, lekin driver ne {0} payment confirm kar di."
 ],
 [
  "₹{0} platform commission due hai. Wallet top-up karke due clear karo.",
  "₹{0} platform commission is due. Top up your wallet to clear it.",
  "₹{0} प्लेटफ़ॉर्म कमीशन बाकी है। वॉलेट टॉप-अप करके इसे चुकाएँ।",
  "₹{0} platform commission due hai. Wallet top-up karke due clear karo."
 ],
 [
  "{0} minute tak customer response nahi aaya. Ride automatically cancel ho gayi.",
  "No response from the customer for {0} minutes. The ride was cancelled automatically.",
  "{0} मिनट तक ग्राहक का जवाब नहीं आया। यात्रा अपने-आप रद्द हो गई।",
  "{0} minute tak customer response nahi aaya. Ride automatically cancel ho gayi."
 ],
 [
  "{0} minute tak driver response nahi aaya. Ride automatically cancel ho gayi.",
  "No response from the driver for {0} minutes. The ride was cancelled automatically.",
  "{0} मिनट तक चालक का जवाब नहीं आया। यात्रा अपने-आप रद्द हो गई।",
  "{0} minute tak driver response nahi aaya. Ride automatically cancel ho gayi."
 ],
 [
  "{0} Aap next ride ke liye available hain.",
  "{0} You are available for the next ride.",
  "{0} आप अगली यात्रा के लिए उपलब्ध हैं।",
  "{0} Aap next ride ke liye available hain."
 ],
 [
  "₹{0} platform commission due hai",
  "₹{0} platform commission is due",
  "₹{0} प्लेटफ़ॉर्म कमीशन बाकी है",
  "₹{0} platform commission due hai"
 ],
 [
  "Cash commission ₹{0} wallet me insufficient balance ki wajah se due hai",
  "Cash commission of ₹{0} is due because of insufficient wallet balance",
  "वॉलेट में पर्याप्त राशि न होने के कारण ₹{0} नकद कमीशन बाकी है",
  "Cash commission ₹{0} wallet me insufficient balance ki wajah se due hai"
 ],
 [
  "Insufficient wallet balance. Available ₹{0} hai.",
  "Insufficient wallet balance. ₹{0} is available.",
  "वॉलेट में पर्याप्त राशि नहीं है। ₹{0} उपलब्ध है।",
  "Insufficient wallet balance. Available ₹{0} hai."
 ],
 [
  "Driver ne ₹{0} ka offer diya hai",
  "The driver has offered ₹{0}",
  "चालक ने ₹{0} का प्रस्ताव दिया है",
  "Driver ne ₹{0} ka offer diya hai"
 ],
 [
  "Fare ₹{0} pe lock ho gaya! 🎉",
  "Fare locked at ₹{0}! 🎉",
  "किराया ₹{0} पर तय हो गया! 🎉",
  "Fare ₹{0} pe lock ho gaya! 🎉"
 ],
 [
  "Fare ₹{0} accept ho gaya",
  "Fare of ₹{0} accepted",
  "₹{0} किराया स्वीकार हो गया",
  "Fare ₹{0} accept ho gaya"
 ],
 [
  "Google ID token {0} invalid hai",
  "Google sign-in could not be verified. Please try again.",
  "Google साइन-इन सत्यापित नहीं हो सका। कृपया दोबारा कोशिश करें।",
  "Google ID token {0} invalid hai"
 ],
 [
  "RazorpayX live payout ready nahi hai: {0}",
  "Automatic payouts are not available right now.",
  "स्वचालित भुगतान अभी उपलब्ध नहीं है।",
  "RazorpayX live payout ready nahi hai: {0}"
 ],
 [
  "Instant payout live ready nahi hai: {0}",
  "Instant payout is not available right now.",
  "तुरंत भुगतान अभी उपलब्ध नहीं है।",
  "Instant payout live ready nahi hai: {0}"
 ],
 [
  "{0} configure nahi hai",
  "The service is temporarily unavailable. Please try again later.",
  "सेवा अभी अस्थायी रूप से उपलब्ध नहीं है। कृपया बाद में कोशिश करें।",
  "{0} configure nahi hai"
 ],
 [
  "Cash commission me ₹{0} due raha",
  "₹{0} cash commission remains due",
  "₹{0} नकद कमीशन बाकी रहा",
  "Cash commission me ₹{0} due raha"
 ],
 [
  "Top-up ₹{0}; commission due ₹{1} automatically clear hua",
  "Top-up ₹{0}; commission due of ₹{1} cleared automatically",
  "टॉप-अप ₹{0}; ₹{1} का बकाया कमीशन अपने-आप चुका दिया गया",
  "Top-up ₹{0}; commission due of ₹{1} cleared automatically"
 ],
 [
  "Wallet top-up ₹{0}",
  "Wallet top-up ₹{0}",
  "वॉलेट टॉप-अप ₹{0}",
  "Wallet top-up ₹{0}"
 ],
 [
  "Driver ne ₹{0} cash received confirm kar diya.",
  "The driver confirmed receiving ₹{0} in cash.",
  "चालक ने ₹{0} नकद मिलने की पुष्टि कर दी।",
  "Driver ne ₹{0} cash received confirm kar diya."
 ],
 [
  "Booking cannot be cancelled when status is {0}",
  "Booking cannot be cancelled when status is {0}",
  "स्थिति {0} होने पर बुकिंग रद्द नहीं की जा सकती",
  "Booking cannot be cancelled when status is {0}"
 ],
 [
  "Please wait {0} seconds before requesting another OTP",
  "Please wait {0} seconds before requesting another OTP",
  "दूसरा OTP माँगने से पहले कृपया {0} सेकंड प्रतीक्षा करें",
  "Please wait {0} seconds before requesting another OTP"
 ],
 [
  "Invalid OTP. {0} attempts remaining.",
  "Invalid OTP. {0} attempts remaining.",
  "गलत OTP। {0} प्रयास बाकी हैं।",
  "Invalid OTP. {0} attempts remaining."
 ],
 [
  "Driver account is {0}",
  "Driver account is {0}",
  "चालक खाता {0} है",
  "Driver account is {0}"
 ],
 [
  "HimRideG platform fee ₹{0} paid{1}",
  "HimRideG platform fee ₹{0} paid{1}",
  "HimRideG प्लेटफ़ॉर्म शुल्क ₹{0} चुकाया गया{1}",
  "HimRideG platform fee ₹{0} paid{1}"
 ],
 [
  "Version {0} is ready. Open HimRideG and tap Update Now.",
  "Version {0} is ready. Open HimRideG and tap Update Now.",
  "संस्करण {0} तैयार है। HimRideG खोलें और “अभी अपडेट करें” दबाएँ।",
  "Version {0} is ready. Open HimRideG and tap Update Now."
 ],
 [
  "Your account is {0}",
  "Your account is {0}",
  "आपका खाता {0} है",
  "Your account is {0}"
 ],
 [
  "Admin ne naam update kiya: {0}",
  "The admin updated your name: {0}",
  "प्रशासक ने आपका नाम अपडेट किया: {0}",
  "The admin updated your name: {0}"
 ],
 [
  "Near {0}",
  "Near {0}",
  "{0} के पास",
  "Near {0}"
 ],
 [
  "Customer complaint{0}: {1}",
  "Customer complaint{0}: {1}",
  "ग्राहक शिकायत{0}: {1}",
  "Customer complaint{0}: {1}"
 ],
 [
  "Driver ne ₹{0} ka fare offer bheja",
  "The driver sent a fare offer of ₹{0}",
  "चालक ने ₹{0} का किराया प्रस्ताव भेजा",
  "Driver ne ₹{0} ka fare offer bheja"
 ],
 [
  "Customer ne ₹{0} ka counter offer bheja",
  "The customer sent a counter offer of ₹{0}",
  "ग्राहक ने ₹{0} का काउंटर प्रस्ताव भेजा",
  "Customer ne ₹{0} ka counter offer bheja"
 ],
 [
  "Driver final fare ₹{0} customer ko bhej diya",
  "Final fare of ₹{0} sent to the customer",
  "₹{0} अंतिम किराया ग्राहक को भेज दिया गया",
  "Driver final fare ₹{0} customer ko bhej diya"
 ],
 [
  "₹{0} final fare customer ne accept kiya — fare locked",
  "The customer accepted the final fare of ₹{0} — fare locked",
  "ग्राहक ने ₹{0} अंतिम किराया स्वीकार किया — किराया तय",
  "The customer accepted the final fare of ₹{0} — fare locked"
 ],
 [
  "Online earning ₹{0}; ₹{1} old cash commission recover hua, ₹{2} wallet credit",
  "Online earning ₹{0}; ₹{1} old cash commission recovered, ₹{2} credited to wallet",
  "ऑनलाइन कमाई ₹{0}; ₹{1} पुराना नकद कमीशन वसूला गया, ₹{2} वॉलेट में जमा",
  "Online earning ₹{0}; ₹{1} old cash commission recovered, ₹{2} credited to wallet"
 ],
 [
  "Online ride earning ₹{0} credited",
  "Online ride earning ₹{0} credited",
  "ऑनलाइन यात्रा की कमाई ₹{0} जमा हुई",
  "Online ride earning ₹{0} credited"
 ],
 [
  "Cash ride net earning ₹{0}",
  "Cash ride net earning ₹{0}",
  "नकद यात्रा की शुद्ध कमाई ₹{0}",
  "Cash ride net earning ₹{0}"
 ],
 [
  "Cash ride platform commission ₹{0} deducted",
  "Cash ride platform commission ₹{0} deducted",
  "नकद यात्रा का प्लेटफ़ॉर्म कमीशन ₹{0} काटा गया",
  "Cash ride platform commission ₹{0} deducted"
 ],
 [
  "Payout ₹{0} processed",
  "Payout ₹{0} processed",
  "भुगतान ₹{0} भेजा गया",
  "Payout ₹{0} processed"
 ],
 [
  "Processed payout ₹{0} reverse hua; wallet restore kiya",
  "Payout of ₹{0} was reversed; the wallet has been restored",
  "₹{0} का भुगतान वापस हुआ; वॉलेट में राशि लौटा दी गई",
  "Payout of ₹{0} was reversed; the wallet has been restored"
 ],
 [
  "Failed payout ₹{0} wallet me restore hua",
  "Failed payout of ₹{0} returned to the wallet",
  "विफल भुगतान ₹{0} वॉलेट में वापस आ गया",
  "Failed payout ₹{0} wallet me restore hua"
 ],
 [
  "Payout start fail hua; ₹{0} wallet me restore kiya",
  "The payout could not start; ₹{0} returned to the wallet",
  "भुगतान शुरू नहीं हो सका; ₹{0} वॉलेट में वापस किया गया",
  "Payout start fail hua; ₹{0} wallet me restore kiya"
 ],
 [
  "Payout ₹{0} reserved",
  "Payout ₹{0} reserved",
  "भुगतान ₹{0} आरक्षित",
  "Payout ₹{0} reserved"
 ],
 [
  "₹{0} commission due",
  "₹{0} commission due",
  "₹{0} कमीशन बाकी",
  "₹{0} commission due"
 ],
 [
  "🚕 New ride from {0}",
  "🚕 New ride from {0}",
  "🚕 {0} से नई यात्रा",
  "🚕 New ride from {0}"
 ],
 [
  "Send your fare to {0}.",
  "Send your fare to {0}.",
  "{0} को अपना किराया भेजें।",
  "Send your fare to {0}."
 ],
 [
  "Fare locked. {0} is on the way to your pickup point.",
  "Fare locked. {0} is on the way to your pickup point.",
  "किराया तय हो गया। {0} आपके पिकअप स्थान की ओर आ रहा है।",
  "Fare locked. {0} is on the way to your pickup point."
 ],
 [
  "Share OTP {0} with {1} when you meet.",
  "Share OTP {0} with {1} when you meet.",
  "मिलने पर {1} को OTP {0} बताएँ।",
  "Share OTP {0} with {1} when you meet."
 ],
 [
  "Your ride with {0} has started. Track it live to your drop.",
  "Your ride with {0} has started. Track it live to your drop.",
  "{0} के साथ आपकी यात्रा शुरू हो गई है। ड्रॉप तक लाइव ट्रैक करें।",
  "Your ride with {0} has started. Track it live to your drop."
 ],
 [
  "₹{0} payment received.",
  "₹{0} payment received.",
  "₹{0} भुगतान प्राप्त हुआ।",
  "₹{0} payment received."
 ],
 [
  "Fare ₹{0} offer bhej diya",
  "Fare offer of ₹{0} sent",
  "₹{0} का किराया प्रस्ताव भेज दिया गया",
  "Fare offer of ₹{0} sent"
 ],
 [
  "Customer ne ₹{0} ka counter offer diya",
  "The customer made a counter offer of ₹{0}",
  "ग्राहक ने ₹{0} का काउंटर प्रस्ताव दिया",
  "Customer ne ₹{0} ka counter offer diya"
 ],
 [
  "Customer ₹{0} cash dega",
  "The customer will pay ₹{0} in cash",
  "ग्राहक ₹{0} नकद देगा",
  "The customer will pay ₹{0} in cash"
 ]
];

export const V116_ENTRIES = rows
  .filter(([, en, hi]) => en && hi)
  .map(([source, en, hi]) => ({ en, hi, aliases: source === en ? [] : [source] }));

export const V116_HINGLISH = new Map(
  rows.filter(([, en]) => en).map(([, en, , hinglish]) => [en.toLowerCase(), hinglish])
);

export const V116_PATTERNS = patterns.map(([source, en, hi, hinglish]) => ({ source, en, hi, hinglish }));
