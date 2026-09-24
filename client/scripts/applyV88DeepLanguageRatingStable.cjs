const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const providerPath = path.join(root, "src/i18n/AppLanguageProvider.jsx");
const v86Path = path.join(root, "scripts/applyV86DeepLanguageAndRatingFix.cjs");

if (!fs.existsSync(providerPath) || !fs.existsSync(v86Path)) {
  console.error("HimRideG V88 required source missing");
  process.exit(1);
}

let source = fs.readFileSync(providerPath, "utf8");
const v86Source = fs.readFileSync(v86Path, "utf8");

// Reuse the already-audited English/Hindi/Hinglish dictionary data from V86.
if (!source.includes("V88_DEEP_LANGUAGE_ENTRIES")) {
  const prefix = "const entries = ";
  const startDecl = v86Source.indexOf(prefix);
  const endDecl = v86Source.indexOf("\n  ];\n\n  const aliasIndex", startDecl);
  if (startDecl < 0 || endDecl < 0) {
    console.error("HimRideG V88 audited dictionary source missing");
    process.exit(1);
  }
  const arrayText = v86Source.slice(startDecl + prefix.length, endDecl + 4).trim().replace(/;$/, "");
  const entries = Function(`"use strict"; return (${arrayText});`)();
  const aliasIndex = source.indexOf("const aliasMap = (() => {");
  const arrayEnd = source.lastIndexOf("];", aliasIndex);
  if (aliasIndex < 0 || arrayEnd < 0) {
    console.error("HimRideG V88 dictionary boundary missing");
    process.exit(1);
  }
  const lines = entries.map(([en, hi, aliases]) => {
    const aliasPart = aliases && aliases.length ? `, aliases: ${JSON.stringify(aliases)}` : "";
    return `  { en: ${JSON.stringify(en)}, hi: ${JSON.stringify(hi)}${aliasPart} },`;
  }).join("\n");
  source = source.slice(0, arrayEnd) + `  // V88_DEEP_LANGUAGE_ENTRIES\n${lines}\n` + source.slice(arrayEnd);
}

if (!source.includes("V88_DYNAMIC_LANGUAGE_PATTERNS")) {
  const anchor = "  const patterns = [\n";
  if (!source.includes(anchor)) {
    console.error("HimRideG V88 patterns anchor missing");
    process.exit(1);
  }
  const block = [
    "  const patterns = [",
    "    // V88_DYNAMIC_LANGUAGE_PATTERNS",
    "    { re: /^Aapki ride successfully complete ho gayi\\. (.+) ko rate karein\\.$/i, en: (m) => \"Your Ride was completed successfully. Rate \" + m[1] + \".\", hi: (m) => \"आपकी Ride सफलतापूर्वक पूरी हुई। \" + m[1] + \" को रेट करें।\" },",
    "    { re: /^Cash Received\\s*(₹[\\d,.]+)$/i, en: (m) => \"Cash Received \" + m[1], hi: (m) => \"नकद प्राप्त \" + m[1] },",
    "    { re: /^Open UPI App · Pay\\s*(₹[\\d,.]+)$/i, en: (m) => \"Open UPI App · Pay \" + m[1], hi: (m) => \"UPI ऐप खोलें · \" + m[1] + \" भुगतान करें\" },",
    "    { re: /^I Paid\\s*(₹[\\d,.]+)\\s*· Driver Verify Kare$/i, en: (m) => \"I Paid \" + m[1] + \" · Driver Verify\", hi: (m) => \"मैंने \" + m[1] + \" भुगतान किया · चालक सत्यापित करे\" },",
    "    { re: /^प्लेटफॉर्म फीस ₹([\\d,.]+) जमा करें$/i, en: (m) => \"Pay Platform Fee ₹\" + m[1], hi: (m) => \"प्लेटफॉर्म फीस ₹\" + m[1] + \" जमा करें\" },",
    "    { re: /^(\\d+) star$/i, en: (m) => m[1] + \" star\", hi: (m) => m[1] + \" स्टार\" },"
  ].join("\n") + "\n";
  source = source.replace(anchor, block);
}

if (!source.includes("V88_REACT_DYNAMIC_TEXT_SOURCE")) {
  const start = source.indexOf("function translateTextNode(node, language, originals) {");
  const endMarker = "\n}\n\nfunction translateElementAttributes";
  const end = source.indexOf(endMarker, start);
  if (start < 0 || end < 0) {
    console.error("HimRideG V88 text translator boundary missing");
    process.exit(1);
  }
  const fn = [
    "function translateTextNode(node, language, originals) {",
    "  // V88_REACT_DYNAMIC_TEXT_SOURCE",
    "  if (!node || shouldSkip(node)) return;",
    "  const current = String(node.nodeValue || \"\");",
    "  if (!current.trim()) return;",
    "",
    "  let record = originals.get(node);",
    "  if (!record || typeof record === \"string\") {",
    "    record = { source: typeof record === \"string\" ? record : current, lastApplied: null };",
    "    originals.set(node, record);",
    "  }",
    "",
    "  if (record.lastApplied !== null && current !== record.lastApplied) {",
    "    record.source = current;",
    "  }",
    "",
    "  const rawSource = String(record.source || current);",
    "  const leading = rawSource.match(/^\\s*/)?.[0] || \"\";",
    "  const trailing = rawSource.match(/\\s*$/)?.[0] || \"\";",
    "  const core = rawSource.trim();",
    "  const translated = dynamicTranslation(core, language);",
    "  const next = `${leading}${translated}${trailing}`;",
    "  record.lastApplied = next;",
    "  if (node.nodeValue !== next) node.nodeValue = next;",
    "}"
  ].join("\n");
  source = source.slice(0, start) + fn + source.slice(end + 2);
}

if (!source.includes("V88_REACT_DYNAMIC_ATTRIBUTE_SOURCE")) {
  const start = source.indexOf("function translateElementAttributes(element, language, attributeOriginals) {");
  const endMarker = "\n}\n\nfunction translateTree";
  const end = source.indexOf(endMarker, start);
  if (start < 0 || end < 0) {
    console.error("HimRideG V88 attribute translator boundary missing");
    process.exit(1);
  }
  const fn = [
    "function translateElementAttributes(element, language, attributeOriginals) {",
    "  // V88_REACT_DYNAMIC_ATTRIBUTE_SOURCE",
    "  if (!element || shouldSkip(element)) return;",
    "  for (const attr of ATTRIBUTES) {",
    "    if (!element.hasAttribute?.(attr)) continue;",
    "    let store = attributeOriginals.get(element);",
    "    if (!store) { store = {}; attributeOriginals.set(element, store); }",
    "    const current = element.getAttribute(attr) || \"\";",
    "    let record = store[attr];",
    "    if (!record || typeof record === \"string\") {",
    "      record = { source: typeof record === \"string\" ? record : current, lastApplied: null };",
    "      store[attr] = record;",
    "    }",
    "    if (record.lastApplied !== null && current !== record.lastApplied) record.source = current;",
    "    const translated = dynamicTranslation(record.source, language);",
    "    record.lastApplied = translated;",
    "    if (current !== translated) element.setAttribute(attr, translated);",
    "  }",
    "}"
  ].join("\n");
  source = source.slice(0, start) + fn + source.slice(end + 2);
}

fs.writeFileSync(providerPath, source, "utf8");
console.log("HimRideG V88 applied: deep bilingual coverage + correct per-star rating labels; layout untouched");