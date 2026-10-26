import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import { hrgGetMapType, hrgSetMapType } from "../v102GoogleBase";

/*
|--------------------------------------------------------------------------
| V113 ADD-ONLY: Ola / Uber style navigation map
|--------------------------------------------------------------------------
| Put inside any <MapContainer> that already has <V104LiveCar />.
|
| - Navigation mode: car hamesha screen par seedhi UPAR ki taraf; mod par
|   car nahi, MAP ghoomta hai (map ko car ki direction ke ulta rotate).
| - Zoom 18, camera car ke saath chalta hai (car beech me rehti hai).
| - Satellite (road names ke saath) default + Road / Terrain toggle.
| - ETA chip: "Driver 4 min door" / "Drop tak 12 min".
| - Road names Google layer me neeche hain, car Leaflet layer me upar —
|   isliye koi naam kabhi car ko cover nahi karta.
|
| Rotation: Leaflet container ko ek bada square (screen ka diagonal) bana
| kar ghumate hain, parent overflow hidden hai — isliye kone kabhi khaali
| nahi dikhte. Buttons parent me hain, wo nahi ghoomte.
|--------------------------------------------------------------------------
*/

const NAV_ZOOM = 18;
const STYLE_ID = "hrg-v113-nav-style";

const MAP_TYPE_BUTTONS = [
  ["hybrid", "🛰️", "Satellite"],
  ["roadmap", "🗺️", "Road"],
  ["terrain", "⛰️", "Terrain"]
];

function ensureStyle() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .hrg-v113-parent {
      position: relative;
      overflow: hidden !important;
    }
    div.leaflet-container.leaflet-container.hrg-v113-nav {
      position: absolute !important;
      left: var(--hrg-v113-left, 0px) !important;
      top: var(--hrg-v113-top, 0px) !important;
      width: var(--hrg-v113-size, 100%) !important;
      height: var(--hrg-v113-size, 100%) !important;
      min-height: var(--hrg-v113-size, 100%) !important;
      max-width: none !important;
      max-height: none !important;
      margin: 0 !important;
      border-radius: 0 !important;
      transform: rotate(var(--hrg-v113-rot, 0deg)) !important;
      transform-origin: 50% 50% !important;
      transition: transform 0.7s linear !important;
      will-change: transform;
    }
    div.leaflet-container.hrg-v113-nav .leaflet-control-container {
      display: none !important;
    }
    .hrg-v113-ui {
      position: absolute;
      inset: 0;
      z-index: 1200;
      pointer-events: none;
      font-family: inherit;
    }
    .hrg-v113-types {
      position: absolute;
      top: 58px;
      right: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      pointer-events: auto;
    }
    .hrg-v113-types button,
    .hrg-v113-navbtn {
      border: 0;
      border-radius: 10px;
      padding: 7px 9px;
      font-size: 11px;
      font-weight: 800;
      line-height: 1.1;
      background: rgba(17, 17, 17, 0.86);
      color: #fff;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
    }
    .hrg-v113-types button.active {
      background: #f5c518;
      color: #111;
    }
    .hrg-v113-navbtn {
      position: absolute;
      right: 10px;
      bottom: 12px;
      pointer-events: auto;
    }
    .hrg-v113-navbtn.on {
      background: #f5c518;
      color: #111;
    }
    .hrg-v113-eta {
      position: absolute;
      left: 10px;
      bottom: 12px;
      max-width: calc(100% - 150px);
      padding: 8px 12px;
      border-radius: 12px;
      background: rgba(17, 17, 17, 0.9);
      color: #fff;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
      pointer-events: none;
    }
    .hrg-v113-eta strong {
      display: block;
      font-size: 15px;
      color: #f5c518;
      font-weight: 900;
    }
    .hrg-v113-eta small {
      display: block;
      font-size: 11px;
      font-weight: 700;
      opacity: 0.9;
    }
  `;
  document.head.appendChild(style);
}

export default function V113NavMap({
  active = false,
  etaTitle = "",
  etaSub = "",
  defaultNav = true
}) {
  const map = useMap();
  const [parentEl, setParentEl] = useState(null);
  const [navOn, setNavOn] = useState(Boolean(defaultNav));
  const [mapType, setMapType] = useState(() => hrgGetMapType());
  const saved = useRef(null);

  const navActive = Boolean(active && navOn);

  useEffect(() => {
    ensureStyle();
    const container = map?.getContainer?.();
    const parent = container?.parentElement || null;
    if (parent) parent.classList.add("hrg-v113-parent");
    setParentEl(parent);
    const onType = (event) => {
      if (event?.detail) setMapType(event.detail);
    };
    window.addEventListener("hrg:maptype", onType);
    return () => {
      window.removeEventListener("hrg:maptype", onType);
    };
  }, [map]);

  /* navigation mode on / off */
  useEffect(() => {
    const container = map?.getContainer?.();
    const parent = container?.parentElement;
    if (!container || !parent) return undefined;

    if (!navActive) {
      return undefined;
    }

    map.__v113NavActive = true;

    const layout = () => {
      const width = parent.clientWidth || container.clientWidth || 300;
      const height = parent.clientHeight || container.clientHeight || 255;
      const size = Math.ceil(Math.sqrt(width * width + height * height)) + 4;
      container.style.setProperty("--hrg-v113-size", `${size}px`);
      container.style.setProperty("--hrg-v113-left", `${Math.round((width - size) / 2)}px`);
      container.style.setProperty("--hrg-v113-top", `${Math.round((height - size) / 2)}px`);
      try {
        map.invalidateSize({ pan: false, animate: false });
      } catch {
        /* ignore */
      }
      const car = map.__hrgCarLatLng;
      if (car) {
        try {
          map.setView(car, Math.max(map.getZoom() || 0, NAV_ZOOM), { animate: false });
        } catch {
          /* ignore */
        }
      }
    };

    const rotate = (rotation) => {
      const value = Number(rotation);
      if (!Number.isFinite(value)) return;
      container.style.setProperty("--hrg-v113-rot", `${-value}deg`);
    };

    saved.current = {
      dragging: map.dragging?.enabled?.() ?? true,
      zoom: map.getZoom?.()
    };

    container.classList.add("hrg-v113-nav");
    rotate(map.__hrgCarRotation || 0);
    layout();

    try {
      map.dragging?.disable?.();
    } catch {
      /* ignore */
    }

    const car = map.__hrgCarLatLng;
    try {
      map.setView(car || map.getCenter(), NAV_ZOOM, { animate: false });
    } catch {
      /* ignore */
    }

    const onMove = (event) => {
      const latlng = event?.detail?.latlng;
      if (!latlng) return;
      try {
        map.setView(latlng, map.getZoom() || NAV_ZOOM, { animate: false });
      } catch {
        /* ignore */
      }
    };

    const onRotation = (event) => rotate(event?.detail?.rotation);

    container.addEventListener("hrg:car-move", onMove);
    container.addEventListener("hrg:car-rotation", onRotation);

    let observer = null;
    try {
      if (typeof ResizeObserver === "function") {
        observer = new ResizeObserver(() => layout());
        observer.observe(parent);
      }
    } catch {
      observer = null;
    }
    window.addEventListener("resize", layout);

    return () => {
      container.removeEventListener("hrg:car-move", onMove);
      container.removeEventListener("hrg:car-rotation", onRotation);
      window.removeEventListener("resize", layout);
      try {
        observer?.disconnect();
      } catch {
        /* ignore */
      }
      container.classList.remove("hrg-v113-nav");
      container.style.removeProperty("--hrg-v113-rot");
      container.style.removeProperty("--hrg-v113-size");
      container.style.removeProperty("--hrg-v113-left");
      container.style.removeProperty("--hrg-v113-top");
      map.__v113NavActive = false;
      try {
        if (saved.current?.dragging !== false) map.dragging?.enable?.();
      } catch {
        /* ignore */
      }
      window.setTimeout(() => {
        try {
          map.invalidateSize({ pan: false, animate: false });
        } catch {
          /* ignore */
        }
      }, 60);
    };
  }, [map, navActive]);

  if (!parentEl) return null;

  return createPortal(
    <div className="hrg-v113-ui">
      <div className="hrg-v113-types">
        {MAP_TYPE_BUTTONS.map(([type, icon, label]) => (
          <button
            key={type}
            type="button"
            className={mapType === type ? "active" : ""}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setMapType(type);
              hrgSetMapType(type);
            }}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {active && (etaTitle || etaSub) && (
        <div className="hrg-v113-eta">
          {etaTitle && <strong>{etaTitle}</strong>}
          {etaSub && <small>{etaSub}</small>}
        </div>
      )}

      {active && (
        <button
          type="button"
          className={`hrg-v113-navbtn${navOn ? " on" : ""}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setNavOn((value) => !value);
          }}
        >
          {navOn ? "🗺️ Poora route" : "🧭 Navigation"}
        </button>
      )}
    </div>,
    parentEl
  );
}
