const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "src/components/HomeBookRide.jsx");

if (!fs.existsSync(file)) {
  console.error("HimRideG V80 target missing: src/components/HomeBookRide.jsx");
  process.exit(1);
}

let source = fs.readFileSync(file, "utf8");
const marker = "V80_FULL_BILINGUAL_HOME_BOOKING";

function replaceOnce(oldText, newText, label) {
  if (!source.includes(oldText)) {
    console.error(`HimRideG V80 anchor missing: ${label}`);
    process.exit(1);
  }
  source = source.replace(oldText, newText);
}

if (!source.includes(marker)) {
  replaceOnce(
    "function HomeBookRide({\n  onBack,\n  onContinue,\n}) {",
    "function HomeBookRide({\n  onBack,\n  onContinue,\n  language = \"en\",\n}) {\n  /* V80_FULL_BILINGUAL_HOME_BOOKING */\n  const hi = language === \"hi\";",
    "component language prop"
  );

  const replacements = [
    ["\"High-accuracy GPS location li ja rahi hai…\"", "hi ? \"उच्च सटीकता वाली GPS जगह ली जा रही है…\" : \"Getting high-accuracy GPS location…\"", "gps loading"],
    ["location?.shortName ||\n              \"My Location\"", "location?.shortName ||\n              (hi ? \"मेरी वर्तमान जगह\" : \"My Location\")", "my location short name"],
    ["? `My Location set • GPS ±${Math.round(point.accuracy)}m`\n            : `My Location set • GPS accuracy ±${Math.round(point.accuracy)}m`", "? (hi ? `मेरी वर्तमान जगह तय • GPS ±${Math.round(point.accuracy)}m` : `My Location set • GPS ±${Math.round(point.accuracy)}m`)\n            : (hi ? `मेरी वर्तमान जगह तय • GPS सटीकता ±${Math.round(point.accuracy)}m` : `My Location set • GPS accuracy ±${Math.round(point.accuracy)}m`)", "gps result"],
    ["error.message ||\n            \"My Location nahi mil saki\"", "error.message ||\n            (hi ? \"मेरी वर्तमान जगह नहीं मिल सकी\" : \"My Location could not be detected\")", "gps error"],
    ["\"Suggestion list se pickup select karo\"", "hi ? \"सुझावों में से यात्रा शुरू करने की जगह चुनें\" : \"Select a pickup from the suggestion list\"", "pickup validation"],
    ["\"Suggestion list se destination select karo\"", "hi ? \"सुझावों में से गंतव्य चुनें\" : \"Select a destination from the suggestion list\"", "drop validation"],
    ["\"Schedule booking ke liye date aur time select karo\"", "hi ? \"निर्धारित यात्रा के लिए तारीख और समय चुनें\" : \"Select a date and time for the scheduled booking\"", "schedule validation"],
    ["\"Passengers required hain\"", "hi ? \"यात्रियों की संख्या जरूरी है\" : \"Number of passengers is required\"", "passenger validation"],
    ["← Back to Home", "{hi ? \"← मुखपृष्ठ पर वापस\" : \"← Back to Home\"}", "back home"],
    ["Secure local taxi booking", "{hi ? \"सुरक्षित स्थानीय टैक्सी बुकिंग\" : \"Secure local taxi booking\"}", "topbar subtitle"],
    ["BOOK YOUR RIDE", "{hi ? \"अपनी यात्रा बुक करें\" : \"BOOK YOUR RIDE\"}", "booking eyebrow"],
    ["Where are you going?", "{hi ? \"आप कहाँ जा रहे हैं?\" : \"Where are you going?\"}", "booking title"],
    ["2 letters type karo aur\n            sahi location select karo.", "{hi\n              ? \"कम से कम 2 अक्षर लिखें और सही स्थान चुनें।\"\n              : \"Type at least 2 letters and select the correct location.\"}", "booking intro"],
    ["\"Pickup location\",", "hi ? \"यात्रा शुरू करने की जगह\" : \"Pickup location\",", "pickup label"],
    ["\"Drop location\",", "hi ? \"गंतव्य\" : \"Drop location\",", "drop label"],
    ["? \"Enter pickup location\"\n                        : \"Enter destination\"", "? (hi ? \"यात्रा शुरू करने की जगह लिखें\" : \"Enter pickup location\")\n                        : (hi ? \"गंतव्य लिखें\" : \"Enter destination\")", "location placeholders"],
    ["? \"◎ Getting My Location…\"\n                        : \"◎ My Location\"", "? (hi ? \"◎ मेरी जगह ली जा रही है…\" : \"◎ Getting My Location…\")\n                        : (hi ? \"◎ मेरी वर्तमान जगह\" : \"◎ My Location\")", "my location button"],
    ["Locations search\n                          ho rahi hain…", "{hi ? \"स्थान खोजे जा रहे हैं…\" : \"Searching locations…\"}", "location searching"],
    ["No matching\n                            location", "{hi ? \"कोई मिलता-जुलता स्थान नहीं मिला\" : \"No matching location\"}", "no location"],
    ["Pickup time", "{hi ? \"यात्रा का समय\" : \"Pickup time\"}", "pickup time label"],
    ["Pickup Now", "{hi ? \"अभी यात्रा\" : \"Pickup Now\"}", "pickup now"],
    ["Schedule Booking", "{hi ? \"यात्रा निर्धारित करें\" : \"Schedule Booking\"}", "schedule option"],
    ["Ride for", "{hi ? \"यात्रा किसके लिए\" : \"Ride for\"}", "ride for label"],
    ["? \"For me\"\n                    : \"Someone else\"", "? (hi ? \"मेरे लिए\" : \"For me\")\n                    : (hi ? \"किसी और के लिए\" : \"Someone else\")", "ride for value"],
    ["Schedule date and time", "{hi ? \"निर्धारित तारीख और समय\" : \"Schedule date and time\"}", "schedule date label"],
    ["Passengers{\" \"}", "{hi ? \"यात्रियों की संख्या\" : \"Passengers\"}{\" \"}", "passengers label"],
    ["Vehicle type{\" \"}", "{hi ? \"वाहन का प्रकार\" : \"Vehicle type\"}{\" \"}", "vehicle type label"],
    ["Search Ride", "{hi ? \"यात्रा खोजें\" : \"Search Ride\"}", "search ride"],
    ["🔒 Login or sign up ke\n            baad yahi booking continue\n            hogi.", "{hi\n              ? \"🔒 लॉगिन या खाता बनाने के बाद यही बुकिंग आगे जारी रहेगी।\"\n              : \"🔒 This booking will continue after you log in or sign up.\"}", "login note"],
    [">\n                      Pickup\n                    </strong>", ">\n                      {hi ? \"यात्रा शुरू\" : \"Pickup\"}\n                    </strong>", "pickup map popup"],
    [">\n                      Drop\n                    </strong>", ">\n                      {hi ? \"गंतव्य\" : \"Drop\"}\n                    </strong>", "drop map popup"],
    ["<span>\n                Pickup\n              </span>", "<span>\n                {hi ? \"यात्रा शुरू\" : \"Pickup\"}\n              </span>", "summary pickup"],
    ["\"Select pickup\"", "hi ? \"शुरुआती स्थान चुनें\" : \"Select pickup\"", "summary pickup empty"],
    ["<span>\n                Drop\n              </span>", "<span>\n                {hi ? \"गंतव्य\" : \"Drop\"}\n              </span>", "summary drop"],
    ["\"Select destination\"", "hi ? \"गंतव्य चुनें\" : \"Select destination\"", "summary destination empty"],
    ["Booking time", "{hi ? \"बुकिंग का समय\" : \"Booking time\"}", "booking time summary"],
    ["? \"Pickup Now\"\n                  : form.scheduledAt ||\n                    \"Select time\"", "? (hi ? \"अभी यात्रा\" : \"Pickup Now\")\n                  : form.scheduledAt ||\n                    (hi ? \"समय चुनें\" : \"Select time\")", "booking time summary value"],
    ["Rider", "{hi ? \"यात्री\" : \"Rider\"}", "rider summary label"],
    ["Estimated distance", "{hi ? \"अनुमानित दूरी\" : \"Estimated distance\"}", "distance label"],
    ["Estimated time", "{hi ? \"अनुमानित समय\" : \"Estimated time\"}", "time label"],
    ["Fare", "{hi ? \"किराया\" : \"Fare\"}", "fare label"],
    ["Driver offer karega", "{hi ? \"चालक किराया बताएगा\" : \"Driver will offer the fare\"}", "fare summary"],
    ["Choose a rider", "{hi ? \"यात्री चुनें\" : \"Choose a rider\"}", "rider modal title"],
    ["aria-label=\"Close\"", "aria-label={hi ? \"बंद करें\" : \"Close\"}", "close aria"],
    ["<i>ME</i>", "<i>{hi ? \"मैं\" : \"ME\"}</i>", "me icon"],
    ["<span>\n                Me\n              </span>", "<span>\n                {hi ? \"मैं\" : \"Me\"}\n              </span>", "me option"],
    ["Order ride for\n                someone else", "{hi ? \"किसी और के लिए यात्रा बुक करें\" : \"Order ride for someone else\"}", "other rider option"],
    ["Done", "{hi ? \"पूरा करें\" : \"Done\"}", "done button"]
  ];

  for (const [oldText, newText, label] of replacements) {
    replaceOnce(oldText, newText, label);
  }

  fs.writeFileSync(file, source, "utf8");
  console.log("HimRideG V80 full bilingual HomeBookRide applied");
} else {
  console.log("HimRideG V80 full bilingual HomeBookRide already applied");
}
