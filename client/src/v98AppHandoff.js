/*
|--------------------------------------------------------------------------
| V98 ADD-ONLY: Driver app -> website documents upload
|--------------------------------------------------------------------------
| 1. Driver app opens  https://himrideg.com/?hrgHandoff=<one-time code>&hrgNext=driver-docs
|    -> we swap the code for a normal web login and reload, so the existing
|       App shows the driver documents (onboarding) screen.
| 2. While the driver came from the app, a bar shows "Back to HimRideG Driver
|    App" (opens himrideg-driver://driver = app main page). After "Submit for
|    approval" succeeds we open the app automatically.
| 3. Big phone photos are shrunk before upload (server limit is 5 MB).
|--------------------------------------------------------------------------
*/

import api, { apiBaseUrl } from "./api";

const FROM_APP_KEY = "hrg_v98_from_driver_app";
const APP_MAIN_LINK = "himrideg-driver://driver";

function safeSession(fn, fallback = null) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

function showOverlay(text, isError = false) {
  let box = document.getElementById("hrgV98Overlay");
  if (!box) {
    box = document.createElement("div");
    box.id = "hrgV98Overlay";
    box.style.cssText =
      "position:fixed;inset:0;z-index:2147483646;background:#070809;color:#fff;display:flex;" +
      "flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;" +
      "font-family:Arial,Helvetica,sans-serif;text-align:center";
    document.body.appendChild(box);
  }
  box.innerHTML = "";
  const brand = document.createElement("div");
  brand.textContent = "HimRideG";
  brand.style.cssText = "color:#F5C518;font-weight:900;font-size:26px";
  const msg = document.createElement("div");
  msg.textContent = text;
  msg.style.cssText = `font-size:16px;line-height:1.5;max-width:360px;color:${isError ? "#ff8a8a" : "#e4e6ea"}`;
  box.appendChild(brand);
  box.appendChild(msg);
  if (isError) {
    const back = document.createElement("a");
    back.href = APP_MAIN_LINK;
    back.textContent = "Back to HimRideG Driver App";
    back.style.cssText =
      "margin-top:8px;padding:14px 20px;border-radius:12px;background:#F5C518;color:#070809;" +
      "font-weight:900;text-decoration:none";
    box.appendChild(back);
  }
}

function openDriverApp() {
  window.location.href = APP_MAIN_LINK;
}

function mountBackBar() {
  if (document.getElementById("hrgV98BackBar")) return;
  const bar = document.createElement("div");
  bar.id = "hrgV98BackBar";
  bar.style.cssText =
    "position:fixed;left:0;right:0;bottom:0;z-index:2147483600;padding:10px 12px calc(10px + env(safe-area-inset-bottom));" +
    "background:#070809;border-top:2px solid #F5C518;display:flex;gap:10px;align-items:center;" +
    "font-family:Arial,Helvetica,sans-serif";
  const info = document.createElement("div");
  info.id = "hrgV98BackInfo";
  info.textContent = "Documents upload karke app par wapas jayein";
  info.style.cssText = "flex:1;color:#e4e6ea;font-size:13px;line-height:1.35";
  const btn = document.createElement("a");
  btn.href = APP_MAIN_LINK;
  btn.textContent = "Back to Driver App";
  btn.style.cssText =
    "flex:none;padding:12px 14px;border-radius:12px;background:#F5C518;color:#070809;" +
    "font-weight:900;font-size:14px;text-decoration:none;white-space:nowrap";
  bar.appendChild(info);
  bar.appendChild(btn);
  document.body.appendChild(bar);
}

function setBackInfo(text) {
  const el = document.getElementById("hrgV98BackInfo");
  if (el) el.textContent = text;
}

/* ---------- 1. one-time login handoff ---------- */

async function runHandoff(code) {
  showOverlay("Aapke documents khul rahe hain…");
  try {
    const response = await fetch(`${apiBaseUrl}/auth/v98/web-handoff/exchange`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const body = await response.json().catch(() => ({}));
    const token = body?.data?.accessToken;
    const user = body?.data?.user;
    if (!response.ok || !token || !user) {
      throw new Error(body?.message || "Link expire ho gaya. App me dobara 'Upload Documents on Website' dabayein.");
    }
    sessionStorage.setItem("himrideg_token", String(token).replace(/^Bearer\s+/i, ""));
    sessionStorage.setItem("himrideg_user", JSON.stringify(user));
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("token");
    sessionStorage.setItem(FROM_APP_KEY, "1");
    window.location.replace("/");
  } catch (error) {
    showOverlay(error?.message || "Website login nahi ho saka. App se dobara try karein.", true);
  }
}

/* ---------- 3. shrink big photos before the page uploads them ---------- */

const MAX_BYTES = 1.5 * 1024 * 1024;
const MAX_SIDE = 1800;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}

async function shrinkImage(file) {
  const img = await loadImage(file);
  let { width, height } = img;
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(img, 0, 0, width, height);
  for (const quality of [0.82, 0.7, 0.55]) {
    const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (blob && (blob.size <= MAX_BYTES || quality === 0.55)) {
      const name = String(file.name || "document").replace(/\.[^.]+$/, "") + ".jpg";
      return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
    }
  }
  return file;
}

function installPhotoShrinker() {
  window.addEventListener(
    "change",
    (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "file") return;
      if (input.dataset.hrgV98Shrunk === "1") {
        delete input.dataset.hrgV98Shrunk;
        return;
      }
      const file = input.files && input.files[0];
      if (!file || !/^image\/(jpeg|png|webp)$/i.test(file.type) || file.size <= MAX_BYTES) return;
      if (typeof DataTransfer === "undefined") return;

      // Hold the original event; re-fire it once the smaller photo is ready.
      event.stopImmediatePropagation();
      event.stopPropagation();
      shrinkImage(file)
        .catch(() => file)
        .then((smaller) => {
          try {
            const dt = new DataTransfer();
            dt.items.add(smaller);
            input.files = dt.files;
          } catch {
            /* keep original */
          }
          input.dataset.hrgV98Shrunk = "1";
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
    },
    true
  );
}

/* ---------- 2. back-to-app bar + auto return after submit ---------- */

function installFromAppHelpers() {
  const start = () => mountBackBar();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  api.interceptors.response.use(
    (response) => {
      try {
        const url = String(response?.config?.url || "");
        if (/\/driver\/documents\//.test(url)) {
          setBackInfo("✅ Document upload ho gaya. Baaki upload karein, phir 'Submit' ya 'Back to Driver App' dabayein.");
        }
        if (/\/driver\/submit-approval/.test(url)) {
          setBackInfo("✅ Approval ke liye submit ho gaya. App khul raha hai…");
          setTimeout(openDriverApp, 1500);
        }
      } catch {
        /* ignore */
      }
      return response;
    },
    (error) => Promise.reject(error)
  );
}

/* ---------- boot ---------- */

(function v98Boot() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const code = params.get("hrgHandoff");

  installPhotoShrinker();

  if (code) {
    const run = () => runHandoff(code);
    if (document.body) run();
    else document.addEventListener("DOMContentLoaded", run);
    return;
  }

  const fromApp = safeSession(() => sessionStorage.getItem(FROM_APP_KEY) === "1", false);
  const loggedIn = safeSession(() => Boolean(sessionStorage.getItem("himrideg_user")), false);
  if (fromApp && loggedIn) {
    installFromAppHelpers();
  }
})();
