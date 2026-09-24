import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import "./app-language.css";

const STORAGE_KEY = "himrideg_home_language";
const LANGUAGE_EVENT = "himrideg:language-change";
const AppLanguageContext = createContext(null);

const MANAGED_ROOTS = [".homePage", ".publicInfoPage", ".hbrPage"];
const ATTRIBUTES = ["placeholder", "title", "aria-label"];

const ENTRIES = [
  { en: "Home", hi: "मुखपृष्ठ", aliases: ["होम"] },
  { en: "Dashboard", hi: "डैशबोर्ड" },
  { en: "Customer Dashboard", hi: "ग्राहक डैशबोर्ड" },
  { en: "Driver Dashboard", hi: "चालक डैशबोर्ड" },
  { en: "Admin Dashboard", hi: "प्रशासक डैशबोर्ड" },
  { en: "Customer", hi: "ग्राहक" },
  { en: "Driver", hi: "चालक" },
  { en: "Admin", hi: "प्रशासक" },
  { en: "Customers", hi: "ग्राहक" },
  { en: "Drivers", hi: "चालक" },
  { en: "Rides", hi: "यात्राएँ" },
  { en: "Ride", hi: "यात्रा" },
  { en: "Book Ride", hi: "यात्रा बुक करें" },
  { en: "Book a Ride", hi: "यात्रा बुक करें" },
  { en: "My Rides", hi: "मेरी यात्राएँ" },
  { en: "Active Ride", hi: "सक्रिय यात्रा" },
  { en: "ACTIVE RIDE", hi: "सक्रिय यात्रा" },
  { en: "Ride Requests", hi: "यात्रा अनुरोध" },
  { en: "New Ride Request", hi: "नया यात्रा अनुरोध" },
  { en: "Recent Rides", hi: "हाल की यात्राएँ" },
  { en: "Completed Rides", hi: "पूरी हुई यात्राएँ" },
  { en: "Cancelled Rides", hi: "रद्द यात्राएँ" },
  { en: "Ride History", hi: "यात्रा इतिहास" },
  { en: "Earning History", hi: "कमाई इतिहास" },
  { en: "History", hi: "इतिहास" },
  { en: "Account", hi: "खाता" },
  { en: "Profile", hi: "प्रोफ़ाइल" },
  { en: "Settings", hi: "सेटिंग" },
  { en: "Help", hi: "सहायता" },
  { en: "Support", hi: "सहायता" },
  { en: "Safety", hi: "सुरक्षा" },
  { en: "Logout", hi: "लॉग आउट" },
  { en: "Log Out", hi: "लॉग आउट" },
  { en: "Login", hi: "लॉगिन" },
  { en: "Sign Up", hi: "खाता बनाएँ" },
  { en: "Create Account", hi: "खाता बनाएँ" },
  { en: "Back", hi: "वापस" },
  { en: "Close", hi: "बंद करें" },
  { en: "Cancel", hi: "रद्द करें" },
  { en: "Confirm", hi: "पुष्टि करें" },
  { en: "Continue", hi: "आगे बढ़ें" },
  { en: "Save", hi: "सहेजें" },
  { en: "Update", hi: "अपडेट करें" },
  { en: "Edit", hi: "संपादित करें" },
  { en: "Delete", hi: "हटाएँ" },
  { en: "Submit", hi: "जमा करें" },
  { en: "Done", hi: "पूरा करें" },
  { en: "Search", hi: "खोजें" },
  { en: "Refresh", hi: "रीफ़्रेश करें" },
  { en: "Loading...", hi: "लोड हो रहा है..." },
  { en: "Please wait...", hi: "कृपया प्रतीक्षा करें..." },
  { en: "Online", hi: "ऑनलाइन" },
  { en: "Offline", hi: "ऑफ़लाइन" },
  { en: "Go Online", hi: "ऑनलाइन जाएँ" },
  { en: "Go Offline", hi: "ऑफ़लाइन जाएँ" },
  { en: "Available", hi: "उपलब्ध" },
  { en: "Unavailable", hi: "अनुपलब्ध" },
  { en: "Waiting for new request", hi: "नए अनुरोध की प्रतीक्षा है" },
  { en: "Waiting for response", hi: "जवाब की प्रतीक्षा है" },
  { en: "Accept", hi: "स्वीकार करें" },
  { en: "Reject", hi: "अस्वीकार करें" },
  { en: "Resend", hi: "दोबारा भेजें" },
  { en: "Cancel Ride", hi: "यात्रा रद्द करें" },
  { en: "Send Fare", hi: "किराया भेजें" },
  { en: "Enter Fare", hi: "किराया दर्ज करें" },
  { en: "Final Fare", hi: "अंतिम किराया" },
  { en: "Fare Locked", hi: "किराया तय हो गया" },
  { en: "Fare locked", hi: "किराया तय हो गया" },
  { en: "Go to Pickup", hi: "यात्री लेने जाएँ" },
  { en: "I Have Arrived", hi: "मैं पहुँच गया हूँ" },
  { en: "Arrived", hi: "पहुँच गए" },
  { en: "Generate OTP", hi: "ओटीपी बनाएँ" },
  { en: "Regenerate OTP", hi: "ओटीपी दोबारा बनाएँ" },
  { en: "Enter OTP", hi: "ओटीपी दर्ज करें" },
  { en: "Verify OTP", hi: "ओटीपी सत्यापित करें" },
  { en: "Start Ride", hi: "यात्रा शुरू करें" },
  { en: "Complete Ride", hi: "यात्रा पूरी करें" },
  { en: "Ride Completed", hi: "यात्रा पूरी हुई" },
  { en: "Payment", hi: "भुगतान" },
  { en: "Payments", hi: "भुगतान" },
  { en: "Payment History", hi: "भुगतान इतिहास" },
  { en: "Pay Online", hi: "ऑनलाइन भुगतान करें" },
  { en: "Cash Payment", hi: "नकद भुगतान" },
  { en: "Cash Received", hi: "नकद प्राप्त हुआ" },
  { en: "Payment Received", hi: "भुगतान प्राप्त हुआ" },
  { en: "Payment Successful", hi: "भुगतान सफल" },
  { en: "Payment Failed", hi: "भुगतान विफल" },
  { en: "Pay Now", hi: "अभी भुगतान करें" },
  { en: "Pay Later", hi: "बाद में भुगतान करें" },
  { en: "Wallet", hi: "वॉलेट" },
  { en: "Wallet & Withdraw", hi: "वॉलेट और निकासी" },
  { en: "Wallet Balance", hi: "वॉलेट शेष" },
  { en: "Available Balance", hi: "उपलब्ध शेष" },
  { en: "Total Earnings", hi: "कुल कमाई" },
  { en: "Total Earned", hi: "कुल कमाई" },
  { en: "Withdraw", hi: "निकासी" },
  { en: "Withdraw Money", hi: "राशि निकालें" },
  { en: "Withdrawal History", hi: "निकासी इतिहास" },
  { en: "UPI & Payment Settings", hi: "यूपीआई और भुगतान सेटिंग" },
  { en: "UPI ID", hi: "यूपीआई आईडी" },
  { en: "Bank Account", hi: "बैंक खाता" },
  { en: "Payout Method", hi: "भुगतान प्राप्ति तरीका" },
  { en: "Primary", hi: "मुख्य" },
  { en: "Platform Fee", hi: "प्लेटफ़ॉर्म शुल्क" },
  { en: "Platform Fee Due", hi: "बकाया प्लेटफ़ॉर्म शुल्क" },
  { en: "Driver Share", hi: "चालक का हिस्सा" },
  { en: "Commission", hi: "कमीशन" },
  { en: "Test Mode", hi: "परीक्षण मोड" },
  { en: "Test Mode ON", hi: "परीक्षण मोड चालू" },
  { en: "Test Mode OFF", hi: "परीक्षण मोड बंद" },
  { en: "Reset Platform Fee", hi: "प्लेटफ़ॉर्म शुल्क शून्य करें" },
  { en: "Pending", hi: "लंबित" },
  { en: "Approved", hi: "स्वीकृत" },
  { en: "Rejected", hi: "अस्वीकृत" },
  { en: "Approve", hi: "स्वीकृत करें" },
  { en: "Approve Driver", hi: "चालक स्वीकृत करें" },
  { en: "Reject Driver", hi: "चालक अस्वीकार करें" },
  { en: "Pending Drivers", hi: "लंबित चालक" },
  { en: "Approved Drivers", hi: "स्वीकृत चालक" },
  { en: "Driver Verification", hi: "चालक सत्यापन" },
  { en: "Check Documents", hi: "दस्तावेज़ जाँचें" },
  { en: "Documents", hi: "दस्तावेज़" },
  { en: "Document", hi: "दस्तावेज़" },
  { en: "Driving Licence", hi: "ड्राइविंग लाइसेंस" },
  { en: "Driving License", hi: "ड्राइविंग लाइसेंस" },
  { en: "Vehicle RC", hi: "वाहन आरसी" },
  { en: "Commercial Permit", hi: "व्यावसायिक परमिट" },
  { en: "Vehicle Photo", hi: "वाहन की फोटो" },
  { en: "Upload", hi: "अपलोड करें" },
  { en: "Choose File", hi: "फ़ाइल चुनें" },
  { en: "Verification Pending", hi: "सत्यापन लंबित" },
  { en: "Verification Approved", hi: "सत्यापन स्वीकृत" },
  { en: "Name", hi: "नाम" },
  { en: "Full Name", hi: "पूरा नाम" },
  { en: "Mobile Number", hi: "मोबाइल नंबर" },
  { en: "Phone Number", hi: "फ़ोन नंबर" },
  { en: "Email", hi: "ईमेल" },
  { en: "Password", hi: "पासवर्ड" },
  { en: "Vehicle Number", hi: "वाहन नंबर" },
  { en: "Vehicle Type", hi: "वाहन प्रकार" },
  { en: "Pickup", hi: "यात्रा शुरू" },
  { en: "Drop", hi: "गंतव्य" },
  { en: "Pickup Location", hi: "यात्रा शुरू करने की जगह" },
  { en: "Drop Location", hi: "गंतव्य" },
  { en: "Destination", hi: "गंतव्य" },
  { en: "Distance", hi: "दूरी" },
  { en: "Duration", hi: "समय" },
  { en: "Fare", hi: "किराया" },
  { en: "Status", hi: "स्थिति" },
  { en: "Date", hi: "तारीख" },
  { en: "Time", hi: "समय" },
  { en: "Today", hi: "आज" },
  { en: "Scheduled", hi: "निर्धारित" },
  { en: "Schedule Ride", hi: "यात्रा निर्धारित करें" },
  { en: "Schedule Booking", hi: "बुकिंग निर्धारित करें" },
  { en: "Notifications", hi: "सूचनाएँ" },
  { en: "Notification", hi: "सूचना" },
  { en: "No notifications", hi: "कोई सूचना नहीं" },
  { en: "No rides found", hi: "कोई यात्रा नहीं मिली" },
  { en: "No ride found", hi: "कोई यात्रा नहीं मिली" },
  { en: "No requests", hi: "कोई अनुरोध नहीं" },
  { en: "No data found", hi: "कोई जानकारी नहीं मिली" },
  { en: "Retry", hi: "फिर कोशिश करें" },
  { en: "Try Again", hi: "फिर कोशिश करें" },
  { en: "Success", hi: "सफल" },
  { en: "Error", hi: "त्रुटि" },
  { en: "Location", hi: "स्थान" },
  { en: "My Location", hi: "मेरी वर्तमान जगह" },
  { en: "Use Current Location", hi: "वर्तमान जगह उपयोग करें" },
  { en: "Current Location", hi: "वर्तमान जगह" },
  { en: "Live Location", hi: "सीधा स्थान" },
  { en: "Live Tracking", hi: "सीधी निगरानी" },
  { en: "Map", hi: "मानचित्र" },
  { en: "Customer Support", hi: "ग्राहक सहायता" },
  { en: "Emergency", hi: "आपातकाल" },
  { en: "SOS", hi: "आपात सहायता" },

  { en: "Welcome to HimRideG", hi: "HimRideG में आपका स्वागत है" },
  { en: "Back to HimRideG", hi: "HimRideG पर वापस" },
  { en: "Verified Drivers", hi: "सत्यापित चालक" },
  { en: "Transparent Fares", hi: "स्पष्ट किराया" },
  { en: "Live Ride Tracking", hi: "यात्रा की सीधी निगरानी" },
  { en: "Trusted and approved local drivers", hi: "विश्वसनीय और स्वीकृत स्थानीय चालक" },
  { en: "No hidden charges", hi: "कोई छिपा शुल्क नहीं" },
  { en: "Track your ride in real-time", hi: "अपनी यात्रा की सीधी स्थिति देखें" },
  { en: "Google account chooser", hi: "Google खाता चुनें" },
  { en: "Already registered?", hi: "पहले से पंजीकृत हैं?" },
  { en: "New to HimRideG?", hi: "HimRideG पर नए हैं?" },
  { en: "Create Account / Sign Up", hi: "खाता बनाएँ" },
  { en: "Continue with Google", hi: "Google से आगे बढ़ें" },
  { en: "Sign Up with Google", hi: "Google से खाता बनाएँ" },
  { en: "Verifying...", hi: "सत्यापन हो रहा है..." },
  { en: "How it works", hi: "यह कैसे काम करता है" },
  { en: "SAFE • RELIABLE • HIMACHAL", hi: "सुरक्षित • विश्वसनीय • हिमाचल" },
  { en: "Your journey. Our responsibility.", hi: "आपकी यात्रा। हमारी जिम्मेदारी।" },

  { en: "SECURE ADMINISTRATION", hi: "सुरक्षित प्रशासन" },
  { en: "Admin Login", hi: "प्रशासक लॉगिन" },
  { en: "Authorized HimRideG administrators only", hi: "केवल अधिकृत HimRideG प्रशासकों के लिए" },
  { en: "Admin Email", hi: "प्रशासक ईमेल" },
  { en: "Enter admin email", hi: "प्रशासक ईमेल दर्ज करें" },
  { en: "Enter admin password", hi: "प्रशासक पासवर्ड दर्ज करें" },
  { en: "Signing in...", hi: "लॉगिन हो रहा है..." },
  { en: "Login to Admin Panel →", hi: "प्रशासक पैनल में लॉगिन करें →" },
  { en: "← Back to www.himrideg.com", hi: "← www.himrideg.com पर वापस" },
  { en: "HimRideG protected management access • Customer login is separate", hi: "HimRideG सुरक्षित प्रबंधन प्रवेश • ग्राहक लॉगिन अलग है" },

  { en: "Overview", hi: "सारांश" },
  { en: "Bookings", hi: "बुकिंग" },
  { en: "All Bookings", hi: "सभी बुकिंग" },
  { en: "All Rides", hi: "सभी यात्राएँ" },
  { en: "Total Rides", hi: "कुल यात्राएँ" },
  { en: "Total Drivers", hi: "कुल चालक" },
  { en: "Total Customers", hi: "कुल ग्राहक" },
  { en: "Online Drivers", hi: "ऑनलाइन चालक" },
  { en: "Pending Approvals", hi: "लंबित स्वीकृतियाँ" },
  { en: "Driver Management", hi: "चालक प्रबंधन" },
  { en: "Customer Management", hi: "ग्राहक प्रबंधन" },
  { en: "Booking Management", hi: "बुकिंग प्रबंधन" },
  { en: "System Logs", hi: "सिस्टम रिकॉर्ड" },
  { en: "Admin Tools", hi: "प्रशासक उपकरण" },
  { en: "View Details", hi: "विवरण देखें" },
  { en: "Details", hi: "विवरण" },
  { en: "Actions", hi: "कार्रवाई" },
  { en: "Search driver", hi: "चालक खोजें" },
  { en: "Search customer", hi: "ग्राहक खोजें" },
  { en: "Search rides", hi: "यात्राएँ खोजें" },
  { en: "All", hi: "सभी" },

  { en: "Basic Info", hi: "मूल जानकारी" },
  { en: "Complete your profile", hi: "अपनी प्रोफ़ाइल पूरी करें" },
  { en: "Continue to Dashboard", hi: "डैशबोर्ड पर जाएँ" },
  { en: "Save & Continue", hi: "सहेजें और आगे बढ़ें" },
  { en: "Driver Onboarding", hi: "चालक पंजीकरण" },
  { en: "Complete Driver Profile", hi: "चालक प्रोफ़ाइल पूरी करें" },
  { en: "Submit for Verification", hi: "सत्यापन के लिए जमा करें" },
  { en: "Waiting for approval", hi: "स्वीकृति की प्रतीक्षा है" },
  { en: "Your account is under review", hi: "आपका खाता जाँच में है" },

  { en: "Add UPI", hi: "यूपीआई जोड़ें" },
  { en: "Add Bank Account", hi: "बैंक खाता जोड़ें" },
  { en: "Set as Primary", hi: "मुख्य बनाएँ" },
  { en: "Remove", hi: "हटाएँ" },
  { en: "Amount", hi: "राशि" },
  { en: "Transaction", hi: "लेन-देन" },
  { en: "Transactions", hi: "लेन-देन" },
  { en: "Transaction ID", hi: "लेन-देन आईडी" },
  { en: "Reference", hi: "संदर्भ" },
  { en: "Driver Earnings", hi: "चालक कमाई" },
  { en: "Earnings", hi: "कमाई" },
  { en: "Net Earnings", hi: "शुद्ध कमाई" },
  { en: "Gross Fare", hi: "कुल किराया" },
  { en: "Direct UPI", hi: "सीधा यूपीआई" },
  { en: "Cash", hi: "नकद" },
  { en: "Online Payment", hi: "ऑनलाइन भुगतान" }
];

const aliasMap = (() => {
  const map = new Map();
  for (const entry of ENTRIES) {
    const aliases = [entry.en, entry.hi, ...(entry.aliases || [])];
    for (const alias of aliases) {
      map.set(normalize(alias), entry);
    }
  }
  return map;
})();

function normalize(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getStoredLanguage() {
  return localStorage.getItem(STORAGE_KEY) === "hi" ? "hi" : "en";
}

function shouldSkip(node) {
  const element = node?.nodeType === Node.ELEMENT_NODE
    ? node
    : node?.parentElement;

  if (!element) return true;
  if (element.closest("script,style,noscript,code,pre,.appLanguageToggle")) return true;
  if (MANAGED_ROOTS.some((selector) => element.closest(selector))) return true;
  return false;
}

function dynamicTranslation(source, language) {
  const value = String(source || "").trim();
  if (!value) return value;

  const exact = aliasMap.get(normalize(value));
  if (exact) return language === "hi" ? exact.hi : exact.en;

  const patterns = [
    {
      re: /^Welcome,?\s+(.+)$/i,
      en: (m) => `Welcome, ${m[1]}`,
      hi: (m) => `स्वागत है, ${m[1]}`
    },
    {
      re: /^Hello\s+(.+)$/i,
      en: (m) => `Hello ${m[1]}`,
      hi: (m) => `नमस्ते ${m[1]}`
    },
    {
      re: /^Payment Received\s*₹\s*([\d,.]+)$/i,
      en: (m) => `Payment Received ₹${m[1]}`,
      hi: (m) => `भुगतान प्राप्त हुआ ₹${m[1]}`
    },
    {
      re: /^Final fare\s*₹\s*([\d,.]+)\s*locked$/i,
      en: (m) => `Final fare ₹${m[1]} locked`,
      hi: (m) => `अंतिम किराया ₹${m[1]} तय हो गया`
    },
    {
      re: /^Platform Fee\s*\((\d+(?:\.\d+)?)%\)$/i,
      en: (m) => `Platform Fee (${m[1]}%)`,
      hi: (m) => `प्लेटफ़ॉर्म शुल्क (${m[1]}%)`
    },
    {
      re: /^Driver Share\s*\((\d+(?:\.\d+)?)%\)$/i,
      en: (m) => `Driver Share (${m[1]}%)`,
      hi: (m) => `चालक का हिस्सा (${m[1]}%)`
    },
    {
      re: /^(\d+)\s+rides?$/i,
      en: (m) => `${m[1]} rides`,
      hi: (m) => `${m[1]} यात्राएँ`
    },
    {
      re: /^Ride\s*#?\s*(.+)$/i,
      en: (m) => `Ride #${m[1].replace(/^#/, "")}`,
      hi: (m) => `यात्रा #${m[1].replace(/^#/, "")}`
    }
  ];

  for (const item of patterns) {
    const match = value.match(item.re);
    if (match) return language === "hi" ? item.hi(match) : item.en(match);
  }

  const aliases = [
    ["login nahi ho paya", "login could not be completed", "लॉगिन नहीं हो सका"],
    ["dobara try karo", "try again", "फिर कोशिश करें"],
    ["valid 10 digit mobile number enter karo", "enter a valid 10 digit mobile number", "मान्य 10 अंकों का मोबाइल नंबर दर्ज करें"],
    ["google login abhi ready nahi hai", "google login is not ready yet", "Google लॉगिन अभी तैयार नहीं है"],
    ["google credential nahi mila", "google credential was not received", "Google पहचान जानकारी नहीं मिली"],
    ["account nahi hai", "account does not match", "खाता मेल नहीं खाता"],
    ["waiting for response", "waiting for response", "जवाब की प्रतीक्षा है"],
    ["waiting for new request", "waiting for new request", "नए अनुरोध की प्रतीक्षा है"]
  ];

  const lower = value.toLowerCase();
  for (const [needle, en, hi] of aliases) {
    if (lower === needle) return language === "hi" ? hi : en;
  }

  return value;
}

function translateTextNode(node, language, originals) {
  if (!node || shouldSkip(node)) return;
  const current = String(node.nodeValue || "");
  if (!current.trim()) return;

  if (!originals.has(node)) originals.set(node, current);
  const source = originals.get(node);
  const leading = source.match(/^\s*/)?.[0] || "";
  const trailing = source.match(/\s*$/)?.[0] || "";
  const core = source.trim();
  const translated = dynamicTranslation(core, language);
  const next = `${leading}${translated}${trailing}`;

  if (node.nodeValue !== next) node.nodeValue = next;
}

function translateElementAttributes(element, language, attributeOriginals) {
  if (!element || shouldSkip(element)) return;
  for (const attr of ATTRIBUTES) {
    if (!element.hasAttribute?.(attr)) continue;
    let store = attributeOriginals.get(element);
    if (!store) {
      store = {};
      attributeOriginals.set(element, store);
    }
    if (!(attr in store)) store[attr] = element.getAttribute(attr) || "";
    const source = store[attr];
    const translated = dynamicTranslation(source, language);
    if (element.getAttribute(attr) !== translated) {
      element.setAttribute(attr, translated);
    }
  }
}

function translateTree(root, language, originals, attributeOriginals) {
  if (!root || shouldSkip(root)) return;

  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root, language, originals);
    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;

  if (root.nodeType === Node.ELEMENT_NODE) {
    translateElementAttributes(root, language, attributeOriginals);
  }

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  );

  let current = walker.currentNode;
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      translateTextNode(current, language, originals);
    } else if (current.nodeType === Node.ELEMENT_NODE) {
      translateElementAttributes(current, language, attributeOriginals);
    }
    current = walker.nextNode();
  }
}

function isDedicatedLanguageScreen() {
  const path = String(window.location.pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";
  const publicPaths = new Set([
    "/privacy",
    "/terms",
    "/refund-cancellation",
    "/safety",
    "/accessibility",
    "/help",
    "/contact",
    "/business"
  ]);
  return path === "/" || publicPaths.has(path);
}

export function useAppLanguage() {
  const value = useContext(AppLanguageContext);
  if (!value) {
    throw new Error("useAppLanguage must be used inside AppLanguageProvider");
  }
  return value;
}

export default function AppLanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getStoredLanguage);

  const setLanguage = useCallback((nextLanguage) => {
    const next = nextLanguage === "hi" ? "hi" : "en";
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
    setLanguageState(next);
    window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: { language: next } }));
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "hi" ? "en" : "hi");
  }, [language, setLanguage]);

  useEffect(() => {
    const sync = (event) => {
      const next = event?.detail?.language || getStoredLanguage();
      const clean = next === "hi" ? "hi" : "en";
      setLanguageState(clean);
      document.documentElement.lang = clean;
    };
    const storage = (event) => {
      if (event.key === STORAGE_KEY) sync();
    };

    window.addEventListener(LANGUAGE_EVENT, sync);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(LANGUAGE_EVENT, sync);
      window.removeEventListener("storage", storage);
    };
  }, []);

  useEffect(() => {
    const originals = new WeakMap();
    const attributeOriginals = new WeakMap();
    let scheduled = false;

    const apply = (root = document.body) => {
      if (!root) return;
      translateTree(root, language, originals, attributeOriginals);
    };

    const scheduleApply = (root) => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        apply(root || document.body);
      });
    };

    apply(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          scheduleApply(mutation.target);
          return;
        }
        if (mutation.addedNodes?.length) {
          scheduleApply(mutation.target);
          return;
        }
        if (mutation.type === "attributes") {
          scheduleApply(mutation.target);
          return;
        }
      }
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ATTRIBUTES
      });
    }

    return () => observer.disconnect();
  }, [language]);

  const contextValue = useMemo(
    () => ({ language, setLanguage, toggleLanguage }),
    [language, setLanguage, toggleLanguage]
  );

  return (
    <AppLanguageContext.Provider value={contextValue}>
      {children}
      {!isDedicatedLanguageScreen() && (
        <button
          type="button"
          className="appLanguageToggle"
          onClick={toggleLanguage}
          aria-label={language === "hi" ? "Switch to English" : "हिन्दी में बदलें"}
          title={language === "hi" ? "Switch to English" : "हिन्दी में बदलें"}
        >
          <span aria-hidden="true">🌐</span>
          <strong>{language === "hi" ? "English" : "हिन्दी"}</strong>
        </button>
      )}
    </AppLanguageContext.Provider>
  );
}
