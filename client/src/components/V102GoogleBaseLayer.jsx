import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { HRG_GOOGLE_MAPS_KEY, hrgInstallGoogleBase } from "../v102GoogleBase";

/*
| V102 ADD-ONLY: put inside any <MapContainer> (right after <TileLayer />).
| Draws Google's map behind the Leaflet map; OSM stays as automatic fallback.
*/
export default function V102GoogleBaseLayer() {
  const map = useMap();

  useEffect(() => {
    if (!map) return undefined;
    let lang = "";
    try {
      const htmlLang = String(document.documentElement.lang || "").toLowerCase();
      if (htmlLang.startsWith("hi")) lang = "hi";
    } catch {
      lang = "";
    }
    const handle = hrgInstallGoogleBase(L, map, {
      key: HRG_GOOGLE_MAPS_KEY,
      language: lang
    });
    return () => {
      try {
        handle?.remove();
      } catch {
        /* ignore */
      }
    };
  }, [map]);

  return null;
}
