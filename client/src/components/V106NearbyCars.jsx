import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import api from "../api";

/*
|--------------------------------------------------------------------------
| V106 ADD-ONLY: nearby cars on the booking map (Ola/Uber style)
|--------------------------------------------------------------------------
| Polls /maps/nearby-drivers every few seconds (only while the tab is
| visible), glides every car smoothly and turns it with its direction.
| Positions are approximate on the server for driver privacy.
*/

const CAR_IMAGE = "/HimRideG_map_car.png";
const BOX = 44;
const POLL_MS = 6000;
const STYLE_ID = "hrg-v106-nearby-style";

function ensureStyle() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .leaflet-marker-icon.hrg-v106-car { background: transparent; border: 0; }
    .hrg-v106-car-rot {
      width: ${BOX}px; height: ${BOX}px;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.8s linear, opacity 0.4s ease;
      filter: drop-shadow(0 2px 3px rgba(0,0,0,.35));
    }
    .hrg-v106-car-rot img { width: 24px; height: 37px; pointer-events: none; user-select: none; }
  `;
  document.head.appendChild(style);
}

const rad = (v) => (v * Math.PI) / 180;

function bearingDeg(a, b) {
  const y = Math.sin(rad(b[1] - a[1])) * Math.cos(rad(b[0]));
  const x =
    Math.cos(rad(a[0])) * Math.sin(rad(b[0])) -
    Math.sin(rad(a[0])) * Math.cos(rad(b[0])) * Math.cos(rad(b[1] - a[1]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function movedM(a, b) {
  const dx = (b[1] - a[1]) * 111320 * Math.cos(rad(a[0]));
  const dy = (b[0] - a[0]) * 111320;
  return Math.hypot(dx, dy);
}

function makeIcon() {
  return L.divIcon({
    className: "hrg-v106-car",
    html: `<div class="hrg-v106-car-rot"><img src="${CAR_IMAGE}" alt="" /></div>`,
    iconSize: [BOX, BOX],
    iconAnchor: [BOX / 2, BOX / 2]
  });
}

export default function V106NearbyCars({ center = null, enabled = true, onInfo }) {
  const map = useMap();
  const carsRef = useRef(new Map());
  const infoRef = useRef(onInfo);
  infoRef.current = onInfo;
  const centerRef = useRef(center);
  centerRef.current = center;

  useEffect(() => {
    ensureStyle();
    const cars = carsRef.current;
    let stopped = false;
    let timer = null;
    let controller = null;

    const setRotation = (car, bearing) => {
      if (bearing === null || bearing === undefined) return;
      if (car.rotation === null) car.rotation = bearing;
      else {
        const current = ((car.rotation % 360) + 360) % 360;
        let delta = bearing - current;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        car.rotation += delta;
      }
      const el = car.marker.getElement?.()?.querySelector?.(".hrg-v106-car-rot");
      if (el) el.style.transform = `rotate(${car.rotation}deg)`;
    };

    const glide = (car, to, duration) => {
      if (car.anim) cancelAnimationFrame(car.anim);
      const fromLL = car.marker.getLatLng();
      const from = [fromLL.lat, fromLL.lng];
      const start = performance.now();
      const step = (t) => {
        const p = Math.min(1, Math.max(0, (t - start) / duration));
        car.marker.setLatLng([from[0] + (to[0] - from[0]) * p, from[1] + (to[1] - from[1]) * p]);
        car.anim = p < 1 ? requestAnimationFrame(step) : null;
      };
      car.anim = requestAnimationFrame(step);
    };

    const apply = (rows) => {
      const seen = new Set();
      for (const row of rows) {
        const lat = Number(row?.latitude);
        const lng = Number(row?.longitude);
        if (!row?.id || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        seen.add(row.id);
        const to = [lat, lng];
        let car = cars.get(row.id);
        if (!car) {
          const marker = L.marker(to, {
            icon: makeIcon(),
            interactive: false,
            keyboard: false,
            zIndexOffset: 400
          }).addTo(map);
          car = { marker, last: to, rotation: null, anim: null };
          cars.set(row.id, car);
          const gps = Number(row.heading);
          setRotation(car, Number.isFinite(gps) && row.heading !== null ? gps : (row.id.charCodeAt(0) * 37) % 360);
          continue;
        }
        if (movedM(car.last, to) >= 4) {
          setRotation(car, bearingDeg(car.last, to));
          glide(car, to, POLL_MS - 400);
          car.last = to;
        }
      }
      for (const [id, car] of cars) {
        if (!seen.has(id)) {
          if (car.anim) cancelAnimationFrame(car.anim);
          try { map.removeLayer(car.marker); } catch { /* ignore */ }
          cars.delete(id);
        }
      }
    };

    const poll = async () => {
      if (stopped) return;
      if (!enabled || (typeof document !== "undefined" && document.hidden)) {
        timer = setTimeout(poll, POLL_MS);
        return;
      }
      const c = centerRef.current;
      const mc = map.getCenter();
      const lat = Array.isArray(c) ? Number(c[0]) : Number(c?.latitude ?? mc.lat);
      const lon = Array.isArray(c) ? Number(c[1]) : Number(c?.longitude ?? mc.lng);
      try {
        controller = new AbortController();
        const response = await api.get("/maps/nearby-drivers", {
          params: { lat, lon },
          signal: controller.signal
        });
        const data = response.data?.data || {};
        if (!stopped) {
          apply(Array.isArray(data.drivers) ? data.drivers : []);
          try {
            infoRef.current?.({
              count: Number(data.count) || 0,
              etaMinutes: Number.isFinite(Number(data.nearestEtaMinutes))
                ? Number(data.nearestEtaMinutes)
                : null
            });
          } catch { /* ignore */ }
        }
      } catch {
        /* network / rate limit: keep last cars, try again */
      }
      if (!stopped) timer = setTimeout(poll, POLL_MS);
    };

    poll();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      try { controller?.abort(); } catch { /* ignore */ }
      for (const [, car] of cars) {
        if (car.anim) cancelAnimationFrame(car.anim);
        try { map.removeLayer(car.marker); } catch { /* ignore */ }
      }
      cars.clear();
    };
  }, [map, enabled]);

  return null;
}
