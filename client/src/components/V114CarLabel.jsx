import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

/*
|--------------------------------------------------------------------------
| V114 ADD-ONLY: booked car ke upar naam (customer website map)
|--------------------------------------------------------------------------
| Put inside a <MapContainer> that already has <V104LiveCar />.
| - lines: ["Swift Dzire", "HP 67 1234", "Jaspal"] (khaali lines skip)
|   gaadi number parent tabhi bhejta hai jab driver "Go to Pickup" dabata hai.
| - V104 car ke "hrg:car-move" event ke saath chalta hai (smooth, car ke saath)
| - car se thoda upar rehta hai, car ko kabhi cover nahi karta
| - V113 navigation mode me map ghoomta hai, label seedha rehta hai
|--------------------------------------------------------------------------
*/

const STYLE_ID = "hrg-v114-car-label-style";

function ensureStyle() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .leaflet-marker-icon.hrg-v114-lbl { background: transparent; border: 0; }
    .hrg-v114-rot {
      position: absolute; left: 0; top: 0; width: 0; height: 0;
      transform: rotate(var(--hrg-v114-unrot, 0deg));
      transform-origin: 0 0;
    }
    .hrg-v114-tag {
      position: absolute; left: 0; bottom: 32px;
      transform: translateX(-50%);
      white-space: nowrap; text-align: center; pointer-events: none;
      background: rgba(17, 17, 17, 0.9); color: #fff;
      border: 1px solid #f5c518; border-radius: 8px;
      padding: 3px 8px; font: 700 11px/1.3 Arial, Helvetica, sans-serif;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
    }
    .hrg-v114-tag b { display: block; color: #f5c518; font-size: 12px; }
    .hrg-v114-tag i { display: block; font-style: normal; letter-spacing: 0.4px; }
    .hrg-v114-tag.small { bottom: 26px; padding: 2px 6px; font-size: 10px; }
    .hrg-v114-tag.small b { font-size: 10px; }
  `;
  document.head.appendChild(style);
}

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function v114LabelHtml(lines, small = false) {
  ensureStyle();
  const list = (Array.isArray(lines) ? lines : [lines])
    .map((line) => String(line ?? "").trim())
    .filter(Boolean);
  if (!list.length) return "";
  const inner = list.map((t, i) => (i === 0 ? `<b>${esc(t)}</b>` : `<i>${esc(t)}</i>`)).join("");
  return `<div class="hrg-v114-rot"><div class="hrg-v114-tag${small ? " small" : ""}">${inner}</div></div>`;
}

export function v114LabelIcon(lines, small = false) {
  ensureStyle();
  return L.divIcon({
    className: "hrg-v114-lbl",
    html: v114LabelHtml(lines, small),
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
}

/* V113 navigation: container ghoomta hai, label ulta ghuma ke seedha */
export function v114SyncUnrotate(map) {
  try {
    const container = map?.getContainer?.();
    if (!container) return;
    let deg = 0;
    if (container.classList.contains("hrg-v113-nav")) {
      deg = -parseFloat(container.style.getPropertyValue("--hrg-v113-rot") || "0") || 0;
    }
    container.style.setProperty("--hrg-v114-unrot", `${deg}deg`);
  } catch {
    /* ignore */
  }
}

export default function V114CarLabel({ lines = [], position = null }) {
  const map = useMap();
  const ref = useRef({ marker: null, html: "", pos: null });
  const html = v114LabelHtml(lines);

  useEffect(() => {
    ensureStyle();
    const container = map?.getContainer?.();
    if (!container) return undefined;
    const state = ref.current;
    const onMove = (event) => {
      const ll = event?.detail?.latlng;
      const lat = Number(Array.isArray(ll) ? ll[0] : ll?.lat);
      const lng = Number(Array.isArray(ll) ? ll[1] : ll?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      state.pos = [lat, lng];
      try { state.marker?.setLatLng(state.pos); } catch { /* ignore */ }
    };
    container.addEventListener("hrg:car-move", onMove);
    const timer = window.setInterval(() => v114SyncUnrotate(map), 250);
    return () => {
      container.removeEventListener("hrg:car-move", onMove);
      window.clearInterval(timer);
      try { if (state.marker) map.removeLayer(state.marker); } catch { /* ignore */ }
      state.marker = null;
      state.html = "";
    };
  }, [map]);

  useEffect(() => {
    const state = ref.current;
    const lat = Number(Array.isArray(position) ? position[0] : position?.lat ?? position?.latitude);
    const lng = Number(Array.isArray(position) ? position[1] : position?.lng ?? position?.longitude);
    if (!state.pos && Array.isArray(map.__hrgCarLatLng)) state.pos = map.__hrgCarLatLng;
    if (!state.pos && Number.isFinite(lat) && Number.isFinite(lng)) state.pos = [lat, lng];
    if (!html || !state.pos) {
      try { if (state.marker) map.removeLayer(state.marker); } catch { /* ignore */ }
      state.marker = null;
      state.html = "";
      return;
    }
    if (!state.marker) {
      try {
        state.marker = L.marker(state.pos, {
          icon: v114LabelIcon(lines),
          interactive: false,
          keyboard: false,
          zIndexOffset: 1300
        }).addTo(map);
        state.html = html;
      } catch {
        state.marker = null;
      }
      return;
    }
    if (state.html !== html) {
      try { state.marker.setIcon(v114LabelIcon(lines)); } catch { /* ignore */ }
      state.html = html;
    }
  }, [map, html, position]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
