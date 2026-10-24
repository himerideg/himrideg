import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { reverseLocation, getHighAccuracyBrowserLocation } from "../locationService";

/*
|--------------------------------------------------------------------------
| V106 ADD-ONLY: Ola/Uber style centre pickup pin
|--------------------------------------------------------------------------
| - pin stays in the middle of the map; drag the map to move pickup
| - when you stop, Google gives the nearest place name ("Govt Senior
|   Secondary School Kandbari") and pickup is set automatically
| - bubble shows "X min" = nearest car (from V106NearbyCars)
| - locate button jumps to your GPS
| - pickup chosen from search moves the map to it (no loop)
*/

const STYLE_ID = "hrg-v106-pin-style";

function ensureStyle() {
  if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .hrg-v106-pin {
      position: absolute; left: 50%; top: 50%;
      z-index: 650; pointer-events: none;
      transform: translate(-50%, -100%);
      display: flex; flex-direction: column; align-items: center;
    }
    .hrg-v106-bubble {
      pointer-events: none;
      display: flex; align-items: center; gap: 8px;
      max-width: 240px;
      background: #111; color: #fff;
      border-radius: 999px; padding: 6px 12px 6px 6px;
      font: 600 12px/1.2 system-ui, sans-serif;
      box-shadow: 0 6px 18px rgba(0,0,0,.35);
      margin-bottom: 6px; white-space: nowrap;
    }
    .hrg-v106-eta {
      background: #f5c518; color: #111; border-radius: 999px;
      min-width: 34px; height: 34px; padding: 0 6px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font: 800 13px/1 system-ui, sans-serif;
    }
    .hrg-v106-eta small { font-size: 9px; font-weight: 700; }
    .hrg-v106-name { overflow: hidden; text-overflow: ellipsis; }
    .hrg-v106-stick {
      width: 4px; height: 22px; background: #111; border-radius: 2px;
      transition: transform .18s ease;
    }
    .hrg-v106-head {
      width: 18px; height: 18px; border-radius: 50%;
      background: #22c55e; border: 4px solid #111;
      margin-bottom: -3px; transition: transform .18s ease;
    }
    .hrg-v106-pin.is-moving .hrg-v106-head,
    .hrg-v106-pin.is-moving .hrg-v106-stick { transform: translateY(-10px); }
    .hrg-v106-shadow {
      position: absolute; left: 50%; top: 50%; z-index: 649;
      width: 10px; height: 4px; margin-left: -5px; margin-top: -2px;
      border-radius: 50%; background: rgba(0,0,0,.35); pointer-events: none;
    }
    .hrg-v106-locate {
      position: absolute; right: 10px; bottom: 22px; z-index: 660;
      width: 40px; height: 40px; border-radius: 50%;
      border: 0; background: #fff; color: #111; cursor: pointer;
      box-shadow: 0 3px 10px rgba(0,0,0,.3); font-size: 18px;
    }
    .hrg-v106-locate[disabled] { opacity: .6; cursor: wait; }
  `;
  document.head.appendChild(style);
}

function keyOf(p) {
  const lat = Number(p?.latitude);
  const lng = Number(p?.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) ? `${lat.toFixed(5)},${lng.toFixed(5)}` : "";
}

export default function V106PickupPin({ active = true, value = null, onPick, etaMinutes = null, carCount = null }) {
  const map = useMap();
  const [moving, setMoving] = useState(false);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const lastPinned = useRef("");
  const timer = useRef(null);
  const seq = useRef(0);
  const pickRef = useRef(onPick);
  pickRef.current = onPick;

  useEffect(() => {
    ensureStyle();
  }, []);

  /* tell FitRoute to leave the map alone while the pin drives it */
  useEffect(() => {
    if (!map) return undefined;
    map.__v106PinActive = Boolean(active);
    return () => {
      map.__v106PinActive = false;
    };
  }, [map, active]);

  const resolveCenter = async () => {
    const c = map.getCenter();
    const mySeq = ++seq.current;
    setBusy(true);
    setLabel("");
    try {
      const location = await reverseLocation(c.lat, c.lng);
      if (mySeq !== seq.current) return;
      const picked = {
        ...(location || {}),
        latitude: c.lat,
        longitude: c.lng,
        address: location?.address || `${c.lat.toFixed(6)}, ${c.lng.toFixed(6)}`,
        shortName: location?.shortName || "Pin location",
        source: "map-pin"
      };
      lastPinned.current = keyOf(picked);
      setLabel(picked.shortName);
      try {
        pickRef.current?.(picked);
      } catch {
        /* ignore */
      }
    } catch {
      if (mySeq === seq.current) setLabel("Jagah ka naam nahi mila");
    } finally {
      if (mySeq === seq.current) setBusy(false);
    }
  };

  /* user drags / zooms the map */
  useEffect(() => {
    if (!map || !active) return undefined;
    const onStart = () => {
      setMoving(true);
      if (timer.current) clearTimeout(timer.current);
    };
    const onEnd = () => {
      setMoving(false);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(resolveCenter, 450);
    };
    map.on("dragstart", onStart);
    map.on("dragend", onEnd);
    return () => {
      map.off("dragstart", onStart);
      map.off("dragend", onEnd);
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, active]);

  /* pickup chosen elsewhere (search / My Location): bring map to it */
  useEffect(() => {
    if (!map || !active) return;
    const k = keyOf(value);
    if (!k || k === lastPinned.current) {
      if (value?.shortName && k === lastPinned.current) setLabel(value.shortName);
      return;
    }
    lastPinned.current = k;
    setLabel(value?.shortName || "");
    try {
      map.setView([Number(value.latitude), Number(value.longitude)], Math.max(map.getZoom(), 16), {
        animate: true
      });
    } catch {
      /* ignore */
    }
  }, [map, active, value]);

  /* first open: if GPS already allowed, start at the rider like Ola/Uber */
  useEffect(() => {
    if (!map || !active || keyOf(value)) return;
    let cancelled = false;
    (async () => {
      try {
        const status = await navigator.permissions?.query?.({ name: "geolocation" });
        if (!status || status.state !== "granted" || cancelled) return;
        const point = await getHighAccuracyBrowserLocation({ targetAccuracy: 40, maxWaitMs: 7000 });
        if (cancelled) return;
        map.setView([point.latitude, point.longitude], 16, { animate: true });
        setTimeout(resolveCenter, 350);
      } catch {
        /* keep default map */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, active]);

  const locate = async () => {
    setLocating(true);
    try {
      const point = await getHighAccuracyBrowserLocation({ targetAccuracy: 30, maxWaitMs: 9000 });
      map.setView([point.latitude, point.longitude], 17, { animate: true });
      setTimeout(resolveCenter, 350);
    } catch {
      setLabel("Location permission allow karein");
    } finally {
      setLocating(false);
    }
  };

  if (!map || !active) return null;
  const container = map.getContainer();

  const etaText =
    Number.isFinite(Number(etaMinutes)) && Number(carCount) > 0 ? Math.max(1, Math.round(Number(etaMinutes))) : null;

  const text = moving
    ? "Pickup yahan set karein"
    : busy
    ? "Jagah dhoondh rahe hain…"
    : label || "Map khiskaayein ya 📍 dabayein";

  return createPortal(
    <>
      <div className="hrg-v106-shadow" />
      <div className={`hrg-v106-pin${moving ? " is-moving" : ""}`}>
        <div className="hrg-v106-bubble">
          <span className="hrg-v106-eta">
            {etaText ? (
              <>
                {etaText}
                <small>MIN</small>
              </>
            ) : carCount === 0 ? (
              <small>NO CAR</small>
            ) : (
              "•"
            )}
          </span>
          <span className="hrg-v106-name">{text}</span>
        </div>
        <div className="hrg-v106-head" />
        <div className="hrg-v106-stick" />
      </div>
      <button
        type="button"
        className="hrg-v106-locate"
        ref={(el) => {
          if (el && !el.__v106Stop) {
            el.__v106Stop = true;
            L.DomEvent.disableClickPropagation(el);
          }
        }}
        onClick={locate}
        disabled={locating}
        title="Meri location"
        aria-label="Meri location"
      >
        {locating ? "…" : "📍"}
      </button>
    </>,
    container
  );
}
