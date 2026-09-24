const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) {
    console.error(`HimRideG V82 target missing: ${relativePath}`);
    process.exit(1);
  }
  return { file, source: fs.readFileSync(file, "utf8") };
}

function write(file, source, label) {
  fs.writeFileSync(file, source, "utf8");
  console.log(`HimRideG V82 applied: ${label}`);
}

function replaceRequired(source, oldText, newText, label) {
  if (!source.includes(oldText)) {
    console.error(`HimRideG V82 anchor missing: ${label}`);
    process.exit(1);
  }
  return source.replace(oldText, newText);
}

/*
|--------------------------------------------------------------------------
| 1. Global language provider — keep original English source across toggles
|--------------------------------------------------------------------------
*/
{
  const { file, source: original } = read("src/i18n/AppLanguageProvider.jsx");
  let source = original;

  if (!source.includes("useRef")) {
    source = replaceRequired(
      source,
      'import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";',
      'import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";',
      "language provider useRef import"
    );
  }

  if (!source.includes("originalsRef = useRef")) {
    source = replaceRequired(
      source,
      '  const [language, setLanguageState] = useState(getStoredLanguage);',
      '  const [language, setLanguageState] = useState(getStoredLanguage);\n  const originalsRef = useRef(new WeakMap());\n  const attributeOriginalsRef = useRef(new WeakMap());',
      "persistent original translation refs"
    );
  }

  if (source.includes("    const originals = new WeakMap();\n    const attributeOriginals = new WeakMap();")) {
    source = source.replace(
      "    const originals = new WeakMap();\n    const attributeOriginals = new WeakMap();",
      "    const originals = originalsRef.current;\n    const attributeOriginals = attributeOriginalsRef.current;"
    );
  }

  if (source !== original) write(file, source, "global language provider");
  else console.log("HimRideG V82 global language provider already applied");
}

/*
|--------------------------------------------------------------------------
| 2. Wrap the full website in one shared Hindi / English provider
|--------------------------------------------------------------------------
*/
{
  const { file, source: original } = read("src/main.jsx");
  let source = original;

  if (!source.includes('from "./i18n/AppLanguageProvider"')) {
    source = replaceRequired(
      source,
      'import "./pages/PublicInfoPageLanguage.css";',
      'import "./pages/PublicInfoPageLanguage.css";\nimport AppLanguageProvider from "./i18n/AppLanguageProvider";',
      "main language provider import"
    );
  }

  if (!source.includes("<AppLanguageProvider>")) {
    source = replaceRequired(
      source,
      "  <React.StrictMode>\n    <React.Suspense",
      "  <React.StrictMode>\n    <AppLanguageProvider>\n      <React.Suspense",
      "main provider open"
    );

    source = replaceRequired(
      source,
      "      <RootScreen />\n    </React.Suspense>\n  </React.StrictMode>",
      "        <RootScreen />\n      </React.Suspense>\n    </AppLanguageProvider>\n  </React.StrictMode>",
      "main provider close"
    );
  }

  if (source !== original) write(file, source, "full website language provider");
  else console.log("HimRideG V82 main provider already applied");
}

/*
|--------------------------------------------------------------------------
| 3. Home language selection also updates Customer / Driver / Admin screens
|--------------------------------------------------------------------------
*/
{
  const { file, source: original } = read("src/pages/Home.jsx");
  let source = original;

  const oldToggle = [
    "  const toggleLanguage = () => {",
    '    setLanguage((current) => current === "en" ? "hi" : "en");',
    "  };"
  ].join("\n");

  const newToggle = [
    "  const toggleLanguage = () => {",
    "    setLanguage((current) => {",
    '      const next = current === "en" ? "hi" : "en";',
    '      localStorage.setItem("himrideg_home_language", next);',
    "      window.dispatchEvent(",
    '        new CustomEvent("himrideg:language-change", {',
    "          detail: { language: next }",
    "        })",
    "      );",
    "      return next;",
    "    });",
    "  };"
  ].join("\n");

  if (!source.includes('new CustomEvent("himrideg:language-change"')) {
    source = replaceRequired(source, oldToggle, newToggle, "home global language event");
  }

  if (source !== original) write(file, source, "Home shared language selection");
  else console.log("HimRideG V82 Home shared language already applied");
}

console.log("HimRideG V82 GLOBAL Hindi/English website parity complete");
