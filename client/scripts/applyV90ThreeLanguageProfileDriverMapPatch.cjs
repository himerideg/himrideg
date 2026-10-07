/*
|--------------------------------------------------------------------------
| HimRideG V90 — ADD-ONLY website patch (runs after V89)
|--------------------------------------------------------------------------
| 1. Three languages like the app: English / हिन्दी / Hinglish.
|    - English mode no longer shows Hinglish source text (new EXTRA_ENTRIES).
|    - Hinglish is the new third language (src/i18n/hinglishWeb.js).
| 2. The floating 🌐 button covered "Sign Up" (and the profile button) on
|    phones. It is no longer shown; the language choice is at the very bottom
|    of the page before login, and in Profile (customer) / Hub (driver) after
|    login — same places as the app.
| 3. Driver dashboard: the map is shown all the time with the driver's live
|    position, not only after a ride request (src/components/DriverIdleMap).
| 4. Customer profile: Gender + Date of Birth (calendar) fields.
|
| Every change keeps the original code. Each step is skipped when its marker
| is already present, so running the script again changes nothing.
*/

const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "src");
let applied = 0;
let skipped = 0;
const missing = [];

function patchFile(relativeFile, steps) {
  const file = path.join(SRC, relativeFile);

  if (!fs.existsSync(file)) {
    missing.push(`${relativeFile} (file not found)`);
    return;
  }

  let source = fs.readFileSync(file, "utf8");
  const before = source;

  for (const step of steps) {
    if (source.includes(step.marker)) {
      skipped += 1;
      continue;
    }

    // V91 placed the idle map directly in the dashboard. Keep that map and
    // avoid importing the same component twice when V90 language wiring runs.
    if (relativeFile === "pages/DriverDashboard.jsx" &&
        step.marker === "V90_DRIVER_IDLE_MAP" &&
        source.includes("<DriverIdleMap />")) {
      skipped += 1;
      continue;
    }

    if (!source.includes(step.find)) {
      missing.push(`${relativeFile}: ${step.marker}`);
      continue;
    }

    const replacement = relativeFile === "pages/DriverDashboard.jsx" &&
      step.marker === "V90_DRIVER_IMPORTS" &&
      source.includes('import DriverIdleMap from "../components/DriverIdleMap";')
        ? step.replace.replace('import DriverIdleMap from "../components/DriverIdleMap";\n', "")
        : step.replace;
    source = source.replace(step.find, replacement);
    applied += 1;
  }

  if (source !== before) {
    fs.writeFileSync(file, source, "utf8");
  }
}

/* ------------------------------------------------------------------ */
/* 1 + 2. Language provider                                            */
/* ------------------------------------------------------------------ */

patchFile("i18n/AppLanguageProvider.jsx", [
  {
    marker: "V90_IMPORTS",
    find: 'import "./app-language.css";\n',
    replace:
      'import "./app-language.css";\n' +
      "// V90_IMPORTS — third language (Hinglish) + English fixes + picker\n" +
      'import { EXTRA_ENTRIES, EN_FIXES, toHinglish, translateExtraPattern, cleanWebLanguage, htmlLangFor } from "./hinglishWeb";\n' +
      'import WebLanguagePicker from "./WebLanguagePicker";\n' +
      'import "./v90-language-visibility.css";\n'
  },
  {
    marker: "V90_STATE",
    find: 'const ATTRIBUTES = ["placeholder", "title", "aria-label"];\n',
    replace:
      'const ATTRIBUTES = ["placeholder", "title", "aria-label"];\n' +
      "\n" +
      "// V90_STATE — active language for the DOM translator. Home / public /\n" +
      "// booking pages have their own English+Hindi copy; in Hinglish mode the\n" +
      "// translator converts their English text too.\n" +
      'let CURRENT_WEB_LANGUAGE = "en";\n' +
      "\n" +
      "// The floating button covered Sign Up / profile on phones. Kept, not shown.\n" +
      "const SHOW_FLOATING_LANGUAGE_TOGGLE = false;\n" +
      "\n" +
      "function isInManagedRoot(node) {\n" +
      "  const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;\n" +
      "  return Boolean(element) && MANAGED_ROOTS.some((selector) => element.closest(selector));\n" +
      "}\n"
  },
  {
    marker: "V90_EXTRA_ENTRIES",
    find: "  for (const entry of ENTRIES) {\n    const aliases = [entry.en, entry.hi, ...(entry.aliases || [])];",
    replace:
      "  // V90_EXTRA_ENTRIES — new entries first, so existing ENTRIES still win;\n" +
      "  // EN_FIXES last: old entries whose English text was Hinglish.\n" +
      "  for (const entry of [...EXTRA_ENTRIES, ...ENTRIES, ...EN_FIXES]) {\n    const aliases = [entry.en, entry.hi, ...(entry.aliases || [])];"
  },
  {
    marker: "V90_STORED_LANGUAGE",
    find: '  return localStorage.getItem(STORAGE_KEY) === "hi" ? "hi" : "en";\n',
    replace:
      "  // V90_STORED_LANGUAGE — en / hi / hinglish (was en / hi)\n" +
      "  return cleanWebLanguage(localStorage.getItem(STORAGE_KEY));\n"
  },
  {
    marker: "V90_SKIP_PICKER",
    find: 'if (element.closest("script,style,noscript,code,pre,.appLanguageToggle")) return true;',
    replace:
      '// V90_SKIP_PICKER — the picker writes each language in its own script\n' +
      '  if (element.closest("script,style,noscript,code,pre,.appLanguageToggle,.webLanguagePicker")) return true;'
  },
  {
    marker: "V90_MANAGED_ROOTS",
    find: "  if (MANAGED_ROOTS.some((selector) => element.closest(selector))) return true;\n",
    replace:
      "  // V90_MANAGED_ROOTS — in Hinglish mode home/public pages are translated too\n" +
      '  if (CURRENT_WEB_LANGUAGE !== "hinglish" && MANAGED_ROOTS.some((selector) => element.closest(selector))) return true;\n'
  },
  {
    marker: "V90_HINGLISH_TRANSLATION",
    find: "function dynamicTranslation(source, language) {\n",
    replace:
      "function dynamicTranslation(source, language) {\n" +
      "  // V90_HINGLISH_TRANSLATION — Hinglish = the English result, then English -> Hinglish\n" +
      '  if (language === "hinglish") return toHinglish(dynamicTranslation(source, "en"));\n'
  },
  {
    marker: "V90_EXTRA_PATTERNS",
    find: "  const patterns = [\n    // V88_DYNAMIC_LANGUAGE_PATTERNS",
    replace:
      "  // V90_EXTRA_PATTERNS — Hinglish source text with a changing value\n" +
      "  const v90Pattern = translateExtraPattern(value, language);\n" +
      "  if (v90Pattern !== null) return v90Pattern;\n\n" +
      "  const patterns = [\n    // V88_DYNAMIC_LANGUAGE_PATTERNS"
  },
  {
    marker: "V90_RESTORE_TEXT",
    find: "function translateTextNode(node, language, originals) {\n  // V88_REACT_DYNAMIC_TEXT_SOURCE\n",
    replace:
      "function translateTextNode(node, language, originals) {\n  // V88_REACT_DYNAMIC_TEXT_SOURCE\n" +
      "  // V90_RESTORE_TEXT — leaving Hinglish: give home/public text back to React's copy\n" +
      '  if (node && CURRENT_WEB_LANGUAGE !== "hinglish" && isInManagedRoot(node)) {\n' +
      "    const saved = originals.get(node);\n" +
      '    if (saved && typeof saved === "object" && saved.lastApplied !== null && node.nodeValue === saved.lastApplied) {\n' +
      "      node.nodeValue = saved.source;\n" +
      "      saved.lastApplied = null;\n" +
      "    }\n" +
      "    return;\n" +
      "  }\n"
  },
  {
    marker: "V90_RESTORE_ATTRIBUTES",
    find: "function translateElementAttributes(element, language, attributeOriginals) {\n  // V88_REACT_DYNAMIC_ATTRIBUTE_SOURCE\n",
    replace:
      "function translateElementAttributes(element, language, attributeOriginals) {\n  // V88_REACT_DYNAMIC_ATTRIBUTE_SOURCE\n" +
      "  // V90_RESTORE_ATTRIBUTES — same as V90_RESTORE_TEXT for placeholder/title/aria-label\n" +
      '  if (element && CURRENT_WEB_LANGUAGE !== "hinglish" && isInManagedRoot(element)) {\n' +
      "    const store = attributeOriginals.get(element);\n" +
      "    if (store) {\n" +
      "      for (const attr of ATTRIBUTES) {\n" +
      "        const saved = store[attr];\n" +
      '        if (saved && typeof saved === "object" && saved.lastApplied !== null && element.getAttribute?.(attr) === saved.lastApplied) {\n' +
      "          element.setAttribute(attr, saved.source);\n" +
      "          saved.lastApplied = null;\n" +
      "        }\n" +
      "      }\n" +
      "    }\n" +
      "    return;\n" +
      "  }\n"
  },
  {
    marker: "V90_SET_LANGUAGE",
    find: '    const next = nextLanguage === "hi" ? "hi" : "en";\n',
    replace:
      "    // V90_SET_LANGUAGE — en / hi / hinglish\n" +
      "    const next = cleanWebLanguage(nextLanguage);\n"
  },
  {
    marker: "V90_TOGGLE_CYCLE",
    find: '    setLanguage(language === "hi" ? "en" : "hi");\n',
    replace:
      "    // V90_TOGGLE_CYCLE — English -> हिन्दी -> Hinglish -> English\n" +
      '    setLanguage(language === "en" ? "hi" : language === "hi" ? "hinglish" : "en");\n'
  },
  {
    marker: "V90_SYNC_LANGUAGE",
    find: '      const clean = next === "hi" ? "hi" : "en";\n',
    replace:
      "      // V90_SYNC_LANGUAGE — en / hi / hinglish\n" +
      "      const clean = cleanWebLanguage(next);\n"
  },
  {
    marker: "V90_CURRENT_LANGUAGE",
    find: "  useEffect(() => {\n    const originals = originalsRef.current;\n",
    replace:
      "  useEffect(() => {\n" +
      "    // V90_CURRENT_LANGUAGE\n" +
      "    CURRENT_WEB_LANGUAGE = language;\n" +
      "    document.documentElement.lang = htmlLangFor(language);\n" +
      "    const originals = originalsRef.current;\n"
  },
  {
    marker: "V90_FLOATING_HIDDEN",
    find: "      {!isDedicatedLanguageScreen() && (\n",
    replace:
      "      {/* V90_FLOATING_HIDDEN — replaced by the bottom picker (code kept) */}\n" +
      "      {SHOW_FLOATING_LANGUAGE_TOGGLE && !isDedicatedLanguageScreen() && (\n"
  },
  {
    marker: "V90_BOTTOM_PICKER",
    find: '          <strong>{language === "hi" ? "English" : "हिन्दी"}</strong>\n        </button>\n      )}\n',
    replace:
      '          <strong>{language === "hi" ? "English" : "हिन्दी"}</strong>\n        </button>\n      )}\n' +
      "      {/* V90_BOTTOM_PICKER — very bottom of the page, like the app before login.\n" +
      "          Hidden on customer/driver dashboards (they have it in Profile / Hub). */}\n" +
      '      <WebLanguagePicker variant="bar" language={language} setLanguage={setLanguage} />\n'
  }
]);

/* ------------------------------------------------------------------ */
/* Public pages (privacy, terms, help…): header button cycles 3 and   */
/* tells the provider.                                                 */
/* ------------------------------------------------------------------ */

patchFile("pages/PublicInfoPage.jsx", [
  {
    marker: "V90_PUBLIC_LANGUAGE_EVENT",
    find:
      '    setLanguage((current) => {\n      const next = current === "en" ? "hi" : "en";\n      localStorage.setItem("himrideg_home_language", next);\n      return next;\n    });\n',
    replace:
      "    // V90_PUBLIC_LANGUAGE_EVENT — English -> हिन्दी -> Hinglish, shared with the provider\n" +
      "    setLanguage((current) => {\n" +
      '      const stored = localStorage.getItem("himrideg_home_language");\n' +
      '      const active = stored === "hinglish" ? "hinglish" : current;\n' +
      '      const next = active === "en" ? "hi" : active === "hi" ? "hinglish" : "en";\n' +
      '      localStorage.setItem("himrideg_home_language", next);\n' +
      '      window.dispatchEvent(new CustomEvent("himrideg:language-change", { detail: { language: next } }));\n' +
      '      return next === "hi" ? "hi" : "en";\n' +
      "    });\n"
  }
]);

/* ------------------------------------------------------------------ */
/* Home keeps its own en/hi copy; it must not overwrite "hinglish"     */
/* ------------------------------------------------------------------ */

patchFile("pages/Home.jsx", [
  {
    marker: "V90_HOME_KEEP_HINGLISH",
    find: '    localStorage.setItem("himrideg_home_language", language);\n',
    replace:
      "    // V90_HOME_KEEP_HINGLISH — Home renders English for Hinglish; keep the saved choice\n" +
      '    if (!(language === "en" && localStorage.getItem("himrideg_home_language") === "hinglish"))\n' +
      '    localStorage.setItem("himrideg_home_language", language);\n'
  }
]);

/* ------------------------------------------------------------------ */
/* Sentences with links: one version per language (CSS shows one)     */
/* ------------------------------------------------------------------ */

patchFile("pages/CustomerLoginPage.jsx", [
  {
    marker: "V90_LOGIN_CONSENT",
    find:
      '            <span>मैं HimRideG <a href="#terms">Terms</a>, <a href="#privacy">Privacy</a> और <a href="#cancellation-refund">Cancellation/Refund rules</a> पढ़कर accept करता/करती हूँ.</span>\n',
    replace:
      "            {/* V90_LOGIN_CONSENT — the original Hindi line is kept for हिन्दी */}\n" +
      '            <span className="v90LangOnly-hi">मैं HimRideG <a href="#terms">Terms</a>, <a href="#privacy">Privacy</a> और <a href="#cancellation-refund">Cancellation/Refund rules</a> पढ़कर accept करता/करती हूँ.</span>\n' +
      '            <span className="v90LangOnly-en">I have read and accept the HimRideG <a href="#terms">Terms</a>, <a href="#privacy">Privacy</a> and <a href="#cancellation-refund">Cancellation/Refund rules</a>.</span>\n' +
      '            <span className="v90LangOnly-hinglish">Maine HimRideG ke <a href="#terms">Terms</a>, <a href="#privacy">Privacy</a> aur <a href="#cancellation-refund">Cancellation/Refund rules</a> padhkar accept kiye hain.</span>\n'
  }
]);

patchFile("components/Footer.jsx", [
  {
    marker: "V90_FOOTER_REFUND_HINDI",
    find:
      "<p>Applicable cancellation/no-show fees are shown before booking confirmation. Eligible online refunds are processed to the original payment method according to gateway and bank timelines. Mandatory consumer and statutory rights are not removed.</p>",
    replace:
      '<p className="v90LangHideHi">Applicable cancellation/no-show fees are shown before booking confirmation. Eligible online refunds are processed to the original payment method according to gateway and bank timelines. Mandatory consumer and statutory rights are not removed.</p>' +
      '<p className="v90LangOnly-hi">{/* V90_FOOTER_REFUND_HINDI */}लागू रद्दीकरण/नो-शो शुल्क बुकिंग की पुष्टि से पहले दिखाए जाते हैं। पात्र ऑनलाइन रिफ़ंड गेटवे और बैंक की समय-सीमा के अनुसार मूल भुगतान माध्यम में भेजे जाते हैं। अनिवार्य उपभोक्ता और वैधानिक अधिकार समाप्त नहीं होते।</p>'
  }
]);

/* ------------------------------------------------------------------ */
/* Customer dashboard: language card in Profile + Gender / DOB fields  */
/* ------------------------------------------------------------------ */

patchFile("pages/CustomerDashboard.jsx", [
  {
    marker: "V90_CUSTOMER_IMPORTS",
    find: 'import "../customer-mobile-app-parity.css";\n',
    replace:
      'import "../customer-mobile-app-parity.css";\n' +
      "// V90_CUSTOMER_IMPORTS\n" +
      'import WebLanguagePicker from "../i18n/WebLanguagePicker";\n' +
      'import { useAppLanguage } from "../i18n/AppLanguageProvider";\n' +
      'import "../i18n/v90-dashboard-language.css";\n'
  },
  {
    marker: "V90_CUSTOMER_LANGUAGE_HOOK",
    find: "  const [profileOpen, setProfileOpen] = useState(false);\n",
    replace:
      "  const [profileOpen, setProfileOpen] = useState(false);\n" +
      "  // V90_CUSTOMER_LANGUAGE_HOOK\n" +
      "  const v90Language = useAppLanguage();\n"
  },
  {
    marker: "V90_CUSTOMER_PROFILE_STATE",
    find: '    profileImage: user?.profileImage || "",\n  });\n',
    replace:
      '    profileImage: user?.profileImage || "",\n' +
      "    // V90_CUSTOMER_PROFILE_STATE — same fields as the app profile\n" +
      '    gender: user?.gender || "",\n' +
      '    dateOfBirth: String(user?.dateOfBirth || "").slice(0, 10),\n' +
      "  });\n"
  },
  {
    marker: "V90_CUSTOMER_PROFILE_SEND",
    find: "        profileImage: profile.profileImage,\n      });\n",
    replace:
      "        profileImage: profile.profileImage,\n" +
      "        // V90_CUSTOMER_PROFILE_SEND\n" +
      '        gender: profile.gender || "",\n' +
      '        dateOfBirth: profile.dateOfBirth || "",\n' +
      "      });\n"
  },
  {
    marker: "V90_CUSTOMER_PROFILE_SAVED",
    find: '          profileImage: updatedUser.profileImage || "",\n        });\n',
    replace:
      '          profileImage: updatedUser.profileImage || "",\n' +
      "          // V90_CUSTOMER_PROFILE_SAVED — show what the server saved\n" +
      '          gender: updatedUser.gender || "",\n' +
      '          dateOfBirth: String(updatedUser.dateOfBirth || "").slice(0, 10),\n' +
      "        });\n"
  },
  {
    marker: "V90_CUSTOMER_PROFILE_FIELDS",
    find:
      "                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}\n                />\n              </label>\n",
    replace:
      "                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}\n                />\n              </label>\n\n" +
      "              {/* V90_CUSTOMER_PROFILE_FIELDS — Gender buttons + Date of Birth calendar */}\n" +
      '              <div className="v90GenderField">\n' +
      "                <span>Gender</span>\n" +
      '                <div className="v90GenderOptions" role="radiogroup">\n' +
      '                  {[["male", "Male"], ["female", "Female"], ["other", "Other"]].map(([value, label]) => (\n' +
      "                    <button\n" +
      "                      key={value}\n" +
      '                      type="button"\n' +
      '                      role="radio"\n' +
      "                      aria-checked={profile.gender === value}\n" +
      '                      className={profile.gender === value ? "isSelected" : ""}\n' +
      "                      onClick={() => setProfile({ ...profile, gender: value })}\n" +
      "                    >\n" +
      "                      {label}\n" +
      "                    </button>\n" +
      "                  ))}\n" +
      "                </div>\n" +
      "              </div>\n\n" +
      "              <label>\n" +
      "                Date of Birth\n" +
      "                <input\n" +
      '                  type="date"\n' +
      '                  className="v90DobInput"\n' +
      "                  max={new Date().toISOString().slice(0, 10)}\n" +
      '                  min="1920-01-01"\n' +
      "                  value={profile.dateOfBirth}\n" +
      "                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}\n" +
      "                />\n" +
      "              </label>\n"
  },
  {
    marker: "V90_CUSTOMER_LANGUAGE_CARD",
    find: '            <div className="cvProfilePhotoWrap">\n',
    replace:
      "            {/* V90_CUSTOMER_LANGUAGE_CARD — language in Profile, like app Settings */}\n" +
      '            <WebLanguagePicker variant="card" language={v90Language.language} setLanguage={v90Language.setLanguage} />\n\n' +
      '            <div className="cvProfilePhotoWrap">\n'
  }
]);

/* ------------------------------------------------------------------ */
/* Driver dashboard: map always visible + language card in the Hub     */
/* ------------------------------------------------------------------ */

patchFile("pages/DriverDashboard.jsx", [
  {
    marker: "V90_DRIVER_IMPORTS",
    find: 'import "../driver-mobile-app-parity.css";\n',
    replace:
      'import "../driver-mobile-app-parity.css";\n' +
      "// V90_DRIVER_IMPORTS\n" +
      'import DriverIdleMap from "../components/DriverIdleMap";\n' +
      'import WebLanguagePicker from "../i18n/WebLanguagePicker";\n' +
      'import { useAppLanguage } from "../i18n/AppLanguageProvider";\n' +
      'import "../i18n/v90-dashboard-language.css";\n'
  },
  {
    marker: "V90_DRIVER_LANGUAGE_HOOK",
    find: "}) {\n  const currentUserId =\n    getId(user);\n",
    replace:
      "}) {\n" +
      "  // V90_DRIVER_LANGUAGE_HOOK\n" +
      "  const v90Language = useAppLanguage();\n" +
      "  const currentUserId =\n    getId(user);\n"
  },
  {
    marker: "V90_DRIVER_IDLE_MAP",
    find: '                    <div className="driverCustomerEmpty"><span>🗺️</span><strong>Waiting for Ride</strong></div>\n',
    replace:
      "                    // V90_DRIVER_IDLE_MAP — live map while waiting; original card kept on top\n" +
      '                    <div className="driverIdleMapStage">\n' +
      "                      <DriverIdleMap />\n" +
      '                    <div className="driverCustomerEmpty driverIdleOverlay"><span>🗺️</span><strong>Waiting for Ride</strong></div>\n' +
      "                    </div>\n"
  },
  {
    marker: "V90_DRIVER_LANGUAGE_CARD",
    find: '                  <button\n                    type="button"\n                    className="hgDriverHubLogout"\n',
    replace:
      "                  {/* V90_DRIVER_LANGUAGE_CARD — language in the driver Hub (settings) */}\n" +
      '                  <WebLanguagePicker variant="card" language={v90Language.language} setLanguage={v90Language.setLanguage} />\n\n' +
      '                  <button\n                    type="button"\n                    className="hgDriverHubLogout"\n'
  }
]);

console.log(
  `HimRideG V90: ${applied} change(s) applied, ${skipped} already present` +
    (missing.length ? `; NOT FOUND: ${missing.join(" | ")}` : "")
);

if (missing.length) {
  console.warn("HimRideG V90 warning: some anchors were not found; those parts were skipped.");
}
