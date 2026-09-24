const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const providerPath = path.join(root, "src/i18n/AppLanguageProvider.jsx");
const v86Path = path.join(root, "scripts/applyV86DeepLanguageAndRatingFix.cjs");

if (!fs.existsSync(providerPath) || !fs.existsSync(v86Path)) {
  console.error("HimRideG V87 required source missing");
  process.exit(1);
}

let source = fs.readFileSync(providerPath, "utf8");
const v86Source = fs.readFileSync(v86Path, "utf8");

/* Reuse the audited V86 dictionary data without executing V86's broken dynamic block. */
if (!source.includes("V87_DEEP_LANGUAGE_ENTRIES")) {
  const prefix = "const entries = ";
  const startDecl = v86Source.indexOf(prefix);
  const endDecl = v86Source.indexOf("\n  ];\n\n  const aliasIndex", startDecl);
  if (startDecl < 0 || endDecl < 0) {
    console.error("HimRideG V87 could not read audited V86 entries");
    process.exit(1);
  }

  const arrayText = v86Source.slice(startDecl + prefix.length, endDecl + 4).trim().replace(/;$/, "");
  const entries = Function(`"use strict"; return (${arrayText});`)();

  const aliasIndex = source.indexOf("const aliasMap = (() => {");
  const arrayEnd = source.lastIndexOf("];", aliasIndex);
  if (aliasIndex < 0 || arrayEnd < 0) {
    console.error("HimRideG V87 dictionary boundary missing");
    process.exit(1);
  }

  const lines = entries.map(([en, hi, aliases]) => {
    const aliasPart = aliases && aliases.length ? `, aliases: ${JSON.stringify(aliases)}` : "";
    return `  { en: ${JSON.stringify(en)}, hi: ${JSON.stringify(hi)}${aliasPart} },`;
  }).join("\n");

  source = source.slice(0, arrayEnd) +
    `  // V87_DEEP_LANGUAGE_ENTRIES\n${lines}\n` +
    source.slice(arrayEnd);
}

if (!source.includes("V87_DYNAMIC_LANGUAGE_PATTERNS")) {
  const anchor = "  const patterns = [\n";
  if (!source.includes(anchor)) {
    console.error("HimRideG V87 patterns anchor missing");
    process.exit(1);
  }

  const block = [
    "  const patterns = [",
    "    // V87_DYNAMIC_LANGUAGE_PATTERNS",
    "    {",
    "      re: /^Aapki ride successfully complete ho gayi\\. (.+) ko rate karein\\.$/i,",
    "      en: (m) => \"Your Ride was completed successfully. Rate \" + m[1] + \".\",",
    "      hi: (m) => \"आपकी Ride सफलतापूर्वक पूरी हुई। \" + m[1] + \" को रेट करें।\"",
    "    },",
    "    {",
    "      re: /^Cash Received\\s*(₹[\\d,.]+)$/i,",
    "      en: (m) => \"Cash Received \" + m[1],",
    "      hi: (m) => \"नकद प्राप्त \" + m[1]",
    "    },",
    "    {",
    "      re: /^Open UPI App · Pay\\s*(₹[\\d,.]+)$/i,",
    "      en: (m) => \"Open UPI App · Pay \" + m[1],",
    "      hi: (m) => \"UPI ऐप खोलें · \" + m[1] + \" भुगतान करें\"",
    "    },",
    "    {",
    "      re: /^I Paid\\s*(₹[\\d,.]+)\\s*· Driver Verify Kare$/i,",
    "      en: (m) => \"I Paid \" + m[1] + \" · Driver Verify\",",
    "      hi: (m) => \"मैंने \" + m[1] + \" भुगतान किया · चालक सत्यापित करे\"",
    "    },",
    "    {",
    "      re: /^प्लेटफॉर्म फीस ₹([\\d,.]+) जमा करें$/i,",
    "      en: (m) => \"Pay Platform Fee ₹\" + m[1],",
    "      hi: (m) => \"प्लेटफॉर्म फीस ₹\" + m[1] + \" जमा करें\"",
    "    },",
    "    {",
    "      re: /^(\\d+) star$/i,",
    "      en: (m) => m[1] + \" star\",",
    "      hi: (m) => m[1] + \" स्टार\"",
    "    },"
  ].join("\n") + "\n";

  source = source.replace(anchor, block);
}

if (!source.includes("V87_REACT_DYNAMIC_TEXT_SOURCE")) {
  const oldTextFn = `function translateTextNode(node, language, originals) {\n  if (!node || shouldSkip(node)) return;\n  const current = String(node.nodeValue || \"\");\n  if (!current.trim()) return;\n\n  if (!originals.has(node)) originals.set(node, current);\n  const source = originals.get(node);\n  const leading = source.match(/^\\s*/)?.[0] || \"\";\n  const trailing = source.match(/\\s*$/)?.[0] || \"\";\n  const core = source.trim();\n  const translated = dynamicTranslation(core, language);\n  const next = \`\\${leading}\\${translated}\\${trailing}\`;\n\n  if (node.nodeValue !== next) node.nodeValue = next;\n}`;

  const newTextFn = `function translateTextNode(node, language, originals) {\n  // V87_REACT_DYNAMIC_TEXT_SOURCE\n  if (!node || shouldSkip(node)) return;\n  const current = String(node.nodeValue || \"\");\n  if (!current.trim()) return;\n\n  let record = originals.get(node);\n  if (!record || typeof record === \"string\") {\n    record = { source: typeof record === \"string\" ? record : current, lastApplied: null };\n    originals.set(node, record);\n  }\n\n  if (record.lastApplied !== null && current !== record.lastApplied) {\n    record.source = current;\n  }\n\n  const rawSource = String(record.source || current);\n  const leading = rawSource.match(/^\\s*/)?.[0] || \"\";\n  const trailing = rawSource.match(/\\s*$/)?.[0] || \"\";\n  const core = rawSource.trim();\n  const translated = dynamicTranslation(core, language);\n  const next = \`\\${leading}\\${translated}\\${trailing}\`;\n  record.lastApplied = next;\n\n  if (node.nodeValue !== next) node.nodeValue = next;\n}`;

  if (!source.includes(oldTextFn)) {
    console.error("HimRideG V87 translateTextNode anchor missing");
    process.exit(1);
  }
  source = source.replace(oldTextFn, newTextFn);
}

if (!source.includes("V87_REACT_DYNAMIC_ATTRIBUTE_SOURCE")) {
  const oldAttrFn = `function translateElementAttributes(element, language, attributeOriginals) {\n  if (!element || shouldSkip(element)) return;\n  for (const attr of ATTRIBUTES) {\n    if (!element.hasAttribute?.(attr)) continue;\n    let store = attributeOriginals.get(element);\n    if (!store) {\n      store = {};\n      attributeOriginals.set(element, store);\n    }\n    if (!(attr in store)) store[attr] = element.getAttribute(attr) || \"\";\n    const source = store[attr];\n    const translated = dynamicTranslation(source, language);\n    if (element.getAttribute(attr) !== translated) {\n      element.setAttribute(attr, translated);\n    }\n  }\n}`;

  const newAttrFn = `function translateElementAttributes(element, language, attributeOriginals) {\n  // V87_REACT_DYNAMIC_ATTRIBUTE_SOURCE\n  if (!element || shouldSkip(element)) return;\n  for (const attr of ATTRIBUTES) {\n    if (!element.hasAttribute?.(attr)) continue;\n    let store = attributeOriginals.get(element);\n    if (!store) {\n      store = {};\n      attributeOriginals.set(element, store);\n    }\n\n    const current = element.getAttribute(attr) || \"\";\n    let record = store[attr];\n    if (!record || typeof record === \"string\") {\n      record = { source: typeof record === \"string\" ? record : current, lastApplied: null };\n      store[attr] = record;\n    }\n    if (record.lastApplied !== null && current !== record.lastApplied) {\n      record.source = current;\n    }\n\n    const translated = dynamicTranslation(record.source, language);\n    record.lastApplied = translated;\n    if (current !== translated) element.setAttribute(attr, translated);\n  }\n}`;

  if (!source.includes(oldAttrFn)) {
    console.error("HimRideG V87 translateElementAttributes anchor missing");
    process.exit(1);
  }
  source = source.replace(oldAttrFn, newAttrFn);
}

fs.writeFileSync(providerPath, source, "utf8");
console.log("HimRideG V87 applied: deep English/Hindi audit + rating star dynamic fix; layout untouched");