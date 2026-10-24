import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

/*
|--------------------------------------------------------------------------
| V104 ADD-ONLY: Google-style live car for every website map
|--------------------------------------------------------------------------
| Put inside any <MapContainer> next to the old driver <Marker>.
| - smooth constant-speed glide between GPS updates (real time gap)
| - car turns to the real driving direction (bearing from movement;
|   keeps last direction while standing)
| - the old static car/taxi pin in the same map is hidden by CSS, nothing
|   else in the map changes
|--------------------------------------------------------------------------
*/

const CAR_IMAGE = "/HimRideG_map_car.png";
const BOX = 58;
const STYLE_ID = "hrg-v104-live-car-style";

function ensureStyle() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .hrg-v104-car-on .leaflet-marker-icon:has(> .driverCarMarker),
    .hrg-v104-car-on .leaflet-marker-icon:has(> .driverLiveBluePin) {
      display: none !important;
    }
    .leaflet-marker-icon.hrg-v104-car {
      background: transparent;
      border: 0;
    }
    .hrg-v104-car-rot {
      width: ${BOX}px;
      height: ${BOX}px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.7s linear;
      will-change: transform;
      filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.35));
    }
    .hrg-v104-car-rot img {
      width: 34px;
      height: 52px;
      display: block;
      pointer-events: none;
      user-select: none;
    }
  `;
  document.head.appendChild(style);
}

function toLatLng(value) {
  if (!value) return null;
  if (Array.isArray(value) && value.length >= 2) {
    const lat = Number(value[0]);
    const lng = Number(value[1]);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
  }
  const lat = Number(value.lat ?? value.latitude);
  const lng = Number(value.lng ?? value.lon ?? value.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
}

const rad = (v) => (v * Math.PI) / 180;

function distanceM(a, b) {
  const dLat = rad(b[0] - a[0]);
  const dLng = rad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 6371008.8 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function bearingDeg(a, b) {
  const y = Math.sin(rad(b[1] - a[1])) * Math.cos(rad(b[0]));
  const x =
    Math.cos(rad(a[0])) * Math.sin(rad(b[0])) -
    Math.sin(rad(a[0])) * Math.cos(rad(b[0])) * Math.cos(rad(b[1] - a[1]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export default function V104LiveCar({ position, heading = null, label = "HimRideG Car", follow = false }) {
  const map = useMap();
  const ref = useRef({
    marker: null,
    shown: null,
    anim: null,
    lastAt: 0,
    lastPoint: null,
    rotation: null,
    target: null,
    followCamera: null
  });

  useEffect(() => {
    ensureStyle();
    const container = map?.getContainer?.();
    if (!container) return undefined;
    const count = Number(container.dataset.hrgV104Cars || 0) + 1;
    container.dataset.hrgV104Cars = String(count);
    container.classList.add("hrg-v104-car-on");
    const state = ref.current;
    return () => {
      if (state.anim) cancelAnimationFrame(state.anim);
      state.anim = null;
      try {
        if (state.marker) map.removeLayer(state.marker);
      } catch {
        /* ignore */
      }
      state.marker = null;
      state.shown = null;
      const left = Math.max(0, Number(container.dataset.hrgV104Cars || 1) - 1);
      container.dataset.hrgV104Cars = String(left);
      if (!left) container.classList.remove("hrg-v104-car-on");
    };
  }, [map]);

  // Keep the car low in the viewport, following its interpolated position.
  useEffect(() => {
    if (!follow) return undefined;
    let following = true;
    let initialized = false;
    const control = L.control({ position: "topright" });
    let button;
    const camera = (point) => {
      if (!following || !point) return;
      const zoom = initialized ? map.getZoom() : 16;
      const pixel = map.project(point, zoom);
      const center = map.unproject(L.point(pixel.x, pixel.y - map.getSize().y * 0.22), zoom);
      map.setView(center, zoom, { animate: false });
      initialized = true;
    };
    const pause = () => {
      following = false;
      if (button) button.hidden = false;
    };
    control.onAdd = () => {
      const box = L.DomUtil.create("div", "leaflet-bar");
      button = L.DomUtil.create("button", "", box);
      button.type = "button";
      button.textContent = "Follow car";
      button.setAttribute("aria-label", "Resume following the live car");
      button.style.cssText = "padding:10px;border:0;background:white;color:#111;font-weight:700;cursor:pointer;min-height:44px";
      button.hidden = true;
      L.DomEvent.disableClickPropagation(box);
      L.DomEvent.disableScrollPropagation(box);
      L.DomEvent.on(button, "click", () => {
        following = true;
        button.hidden = true;
        camera(ref.current.shown);
      });
      return box;
    };
    control.addTo(map);
    map.on("dragstart", pause);
    ref.current.followCamera = camera;
    camera(ref.current.shown);
    return () => {
      ref.current.followCamera = null;
      map.off("dragstart", pause);
      control.remove();
    };
  }, [map, follow]);

  useEffect(() => {
    const state = ref.current;
    const target = toLatLng(position);

    if (!target) {
      if (state.anim) cancelAnimationFrame(state.anim);
      state.anim = null;
      try {
        if (state.marker) map.removeLayer(state.marker);
      } catch {
        /* ignore */
      }
      state.marker = null;
      state.shown = null;
      state.target = null;
      return;
    }

    /* same point again (re-render): nothing to do */
    if (
      state.marker &&
      state.target &&
      Math.abs(state.target[0] - target[0]) < 0.0000005 &&
      Math.abs(state.target[1] - target[1]) < 0.0000005
    ) {
      return;
    }
    state.target = target;

    /* direction */
    let nextBearing = null;
    if (state.lastPoint && distanceM(state.lastPoint, target) >= 4) {
      nextBearing = bearingDeg(state.lastPoint, target);
      state.lastPoint = target;
    } else if (!state.lastPoint) {
      state.lastPoint = target;
      const gps = Number(heading);
      if (heading !== null && heading !== "" && Number.isFinite(gps) && gps >= 0) nextBearing = gps;
    }

    const applyRotation = () => {
      if (nextBearing === null) return;
      /* shortest turn: 350 -> 10 turns 20 degrees, not 340 */
      if (state.rotation === null) {
        state.rotation = nextBearing;
      } else {
        const current = ((state.rotation % 360) + 360) % 360;
        let delta = nextBearing - current;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        state.rotation += delta;
      }
      const el = state.marker?.getElement?.()?.querySelector?.(".hrg-v104-car-rot");
      if (el) el.style.transform = `rotate(${state.rotation}deg)`;
    };

    if (!state.marker) {
      state.marker = L.marker(target, {
        icon: L.divIcon({
          className: "hrg-v104-car",
          html: `<div class="hrg-v104-car-rot"><img src="${CAR_IMAGE}" alt="HimRideG car" /></div>`,
          iconSize: [BOX, BOX],
          iconAnchor: [BOX / 2, BOX / 2],
          popupAnchor: [0, -24]
        }),
        zIndexOffset: 1200,
        keyboard: false
      })
        .bindPopup(`<strong>${String(label || "HimRideG Car").replace(/[<>&]/g, "")}</strong>`)
        .addTo(map);
      state.shown = target;
      state.lastAt = Date.now();
      state.followCamera?.(target);
      applyRotation();
      return;
    }

    applyRotation();

    const now = Date.now();
    const gap = state.lastAt ? now - state.lastAt : 1000;
    state.lastAt = now;
    const duration = Math.max(700, Math.min(3500, gap));
    const from = state.marker.getLatLng ? [state.marker.getLatLng().lat, state.marker.getLatLng().lng] : state.shown;

    if (state.anim) cancelAnimationFrame(state.anim);
    if (!from || distanceM(from, target) > 3000) {
      /* teleport for big jumps (first fix after reconnect) */
      state.marker.setLatLng(target);
      state.shown = target;
      state.followCamera?.(target);
      state.anim = null;
      return;
    }

    const start = performance.now();
    const step = (t) => {
      const p = Math.min(1, Math.max(0, (t - start) / duration));
      const lat = from[0] + (target[0] - from[0]) * p;
      const lng = from[1] + (target[1] - from[1]) * p;
      state.marker.setLatLng([lat, lng]);
      state.shown = [lat, lng];
      state.followCamera?.(state.shown);
      state.anim = p < 1 ? requestAnimationFrame(step) : null;
    };
    state.anim = requestAnimationFrame(step);
  }, [map, position, heading, label]);

  return null;
}
