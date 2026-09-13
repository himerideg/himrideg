import React, { useEffect, useRef, useState } from "react";
import { isRequestCanceled } from "../api";
import {
  getHighAccuracyBrowserLocation,
  reverseLocation,
  searchLocations
} from "../locationService";
import "../home-growth.css";

function createLocation(item = {}) {
  return {
    ...item,
    address:
      item.address ||
      item.display_name ||
      item.formatted ||
      "",
    shortName:
      item.shortName ||
      item.name ||
      item.address?.split(",")?.[0] ||
      "Location",
    latitude: Number(item.latitude ?? item.lat),
    longitude: Number(item.longitude ?? item.lon ?? item.lng)
  };
}

const COPY = {
  en: {
    pickup: "Pickup location",
    drop: "Where to?",
    myLocation: "Use my location",
    searching: "Searching…",
    submit: "Continue booking",
    full: "Open full booking",
    pickupRequired: "Select a pickup from suggestions",
    dropRequired: "Select a destination from suggestions",
    gps: "Finding your location…",
    gpsFail: "Location could not be detected"
  },
  hi: {
    pickup: "Pickup location",
    drop: "कहाँ जाना है?",
    myLocation: "मेरी location इस्तेमाल करें",
    searching: "खोज रहे हैं…",
    submit: "Booking आगे बढ़ाएँ",
    full: "पूरी booking खोलें",
    pickupRequired: "Suggestions से pickup चुनें",
    dropRequired: "Suggestions से destination चुनें",
    gps: "आपकी location मिल रही है…",
    gpsFail: "Location detect नहीं हो सकी"
  }
};

function HomeQuickBook({ onBookRide, language = "en" }) {
  const t = COPY[language] || COPY.en;
  const [text, setText] = useState({ pickup: "", dropoff: "" });
  const [selected, setSelected] = useState({ pickup: null, dropoff: null });
  const [focus, setFocus] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);
  const [message, setMessage] = useState("");
  const abortRef = useRef(null);

  useEffect(() => {
    const query = String(text[focus] || "").trim();
    if (!focus || query.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return undefined;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const result = await searchLocations(query, {
          signal: controller.signal,
          latitude: selected.pickup?.latitude,
          longitude: selected.pickup?.longitude,
          limit: 6
        });
        if (!controller.signal.aborted) {
          setSuggestions(Array.isArray(result) ? result : []);
        }
      } catch (error) {
        if (!isRequestCanceled(error)) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [focus, text, selected.pickup?.latitude, selected.pickup?.longitude]);

  const choose = (item) => {
    const location = createLocation(item);
    if (!focus) return;
    setSelected((current) => ({ ...current, [focus]: location }));
    setText((current) => ({ ...current, [focus]: location.address }));
    setSuggestions([]);
    setFocus("");
    setMessage("");
  };

  const change = (field, value) => {
    setText((current) => ({ ...current, [field]: value }));
    setSelected((current) => ({ ...current, [field]: null }));
    setFocus(field);
    setMessage("");
  };

  const useMyLocation = async () => {
    setGpsBusy(true);
    setMessage(t.gps);
    try {
      const point = await getHighAccuracyBrowserLocation({
        targetAccuracy: 30,
        maxWaitMs: 9000
      });
      const reverse = await reverseLocation(point.latitude, point.longitude);
      const pickup = createLocation({
        ...(reverse || {}),
        latitude: point.latitude,
        longitude: point.longitude,
        address:
          reverse?.address ||
          `${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`,
        shortName: reverse?.shortName || "My Location"
      });
      setSelected((current) => ({ ...current, pickup }));
      setText((current) => ({ ...current, pickup: pickup.address }));
      setFocus("");
      setSuggestions([]);
      setMessage(`GPS ±${Math.round(point.accuracy || 0)}m`);
    } catch (error) {
      setMessage(error?.message || t.gpsFail);
    } finally {
      setGpsBusy(false);
    }
  };

  const persistAndOpen = () => {
    if (!selected.pickup) {
      setMessage(t.pickupRequired);
      setFocus("pickup");
      return;
    }
    if (!selected.dropoff) {
      setMessage(t.dropRequired);
      setFocus("dropoff");
      return;
    }

    let existing = {};
    try {
      existing = JSON.parse(localStorage.getItem("himrideg_pending_booking") || "{}") || {};
    } catch {
      existing = {};
    }

    localStorage.setItem(
      "himrideg_pending_booking",
      JSON.stringify({
        ...existing,
        pickup: selected.pickup,
        dropoff: selected.dropoff,
        bookingMode: existing.bookingMode || "now",
        passengers: Number(existing.passengers) || 1,
        vehicleType: existing.vehicleType || "sedan"
      })
    );

    onBookRide?.();
  };

  const renderSuggestions = (field) => {
    if (focus !== field) return null;
    return (
      <div className="homeQuickSuggestions" role="listbox">
        {searching && <div className="homeQuickSearchState">{t.searching}</div>}
        {!searching && suggestions.map((item, index) => {
          const location = createLocation(item);
          return (
            <button
              type="button"
              key={`${location.latitude}-${location.longitude}-${index}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(item)}
            >
              <strong>{location.shortName}</strong>
              <span>{location.address}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="homeQuickBook" aria-label="Quick ride booking">
      <div className="homeQuickFieldWrap">
        <span className="homeQuickDot pickup" aria-hidden="true" />
        <input
          value={text.pickup}
          onChange={(event) => change("pickup", event.target.value)}
          onFocus={() => setFocus("pickup")}
          placeholder={t.pickup}
          aria-label={t.pickup}
        />
        {renderSuggestions("pickup")}
      </div>

      <button
        type="button"
        className="homeQuickLocationButton"
        onClick={useMyLocation}
        disabled={gpsBusy}
      >
        {gpsBusy ? "…" : "⌖"} {t.myLocation}
      </button>

      <div className="homeQuickFieldWrap">
        <span className="homeQuickDot drop" aria-hidden="true" />
        <input
          value={text.dropoff}
          onChange={(event) => change("dropoff", event.target.value)}
          onFocus={() => setFocus("dropoff")}
          placeholder={t.drop}
          aria-label={t.drop}
        />
        {renderSuggestions("dropoff")}
      </div>

      {message && <div className="homeQuickMessage">{message}</div>}

      <button type="button" className="homeQuickContinue" onClick={persistAndOpen}>
        {t.submit} <span>→</span>
      </button>

      <button type="button" className="homeQuickFull" onClick={onBookRide}>
        {t.full}
      </button>
    </div>
  );
}

export default HomeQuickBook;
