import React, { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./driver-idle-map.css";
// V102 ADD-ONLY: Google map base layer
import V102GoogleBaseLayer from "./V102GoogleBaseLayer";
// V104 ADD-ONLY: Google-style live car
import V104LiveCar from "./V104LiveCar";
// V109 ADD-ONLY: Uber-style close zoom + place name for the driver
import { reverseLocation } from "../locationService";

/*
|--------------------------------------------------------------------------
| Driver Idle Map (V90, added)
|--------------------------------------------------------------------------
| Before: the driver dashboard showed a map only after a ride request was
| selected; otherwise just "Waiting for Ride". Now the driver always sees
| the map with their own live position (same OpenStreetMap tiles and the
| same HimRideG car marker as DriverRideMap). When a ride is selected the
| original DriverRideMap takes over unchanged.
*/

const DEFAULT_CENTER = [32.1109, 76.5363]; // Palampur (same as DriverRideMap)

const driverIcon = L.divIcon({
  className: "driverMapCustomIcon",
  html: '<div class="driverCarMarker"><img src="/HimRideG_map_car.png" alt="HimRideG car" /></div>',
  iconSize: [42, 65],
  iconAnchor: [21, 32]
});

function FollowDriver({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, Math.max(map.getZoom(), 15), { animate: true });
    }
  }, [map, position]);

  return null;
}

/* V109: first GPS fix -> fly close to the car like the Uber driver app */
function V109DriverZoom({ position }) {
  const map = useMap();
  const done = React.useRef(false);
  useEffect(() => {
    if (!position || done.current) return;
    done.current = true;
    try {
      map.flyTo(position, 17, { duration: 0.9 });
    } catch {
      /* ignore */
    }
  }, [map, position]);
  return null;
}

export default function DriverIdleMap() {
  const [position, setPosition] = useState(null);
  const [gpsState, setGpsState] = useState("waiting");
  /* V109: area name under the car (e.g. "Kandbari Saperu Road") */
  const [v109Place, setV109Place] = useState("");
  const v109Last = React.useRef(null);
  useEffect(() => {
    if (!position) return undefined;
    const last = v109Last.current;
    const moved = last
      ? Math.hypot((position[0] - last[0]) * 111320, (position[1] - last[1]) * 111320 * Math.cos((position[0] * Math.PI) / 180))
      : Infinity;
    if (moved < 120) return undefined;
    v109Last.current = position;
    let cancelled = false;
    reverseLocation(position[0], position[1])
      .then((place) => {
        if (!cancelled && place) setV109Place(place.shortName || place.address || "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [position]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsState("unsupported");
      return undefined;
    }

    const watchId = navigator.geolocation.watchPosition(
      (event) => {
        setPosition([event.coords.latitude, event.coords.longitude]);
        setGpsState("live");
      },
      (error) => {
        setGpsState(error?.code === 1 ? "denied" : "retry");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const gpsText = {
    waiting: "Finding your location…",
    live: "Your live location",
    denied: "Allow location permission to see yourself on the map.",
    retry: "GPS signal is weak. Retrying…",
    unsupported: "This browser does not support location."
  }[gpsState];

  return (
    <div className="driverIdleMap">
      <MapContainer
        center={position || DEFAULT_CENTER}
        zoom={position ? 15 : 12}
        scrollWheelZoom={false}
        className="driverIdleMapCanvas"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* V102: Google map under Leaflet (OSM stays as fallback) */}
        <V102GoogleBaseLayer />
        {position ? <Marker position={position} icon={driverIcon} /> : null}
        {/* V104: Google-style live car */}
        {position ? <V104LiveCar position={position} label="Aapki location" /> : null}
        <FollowDriver position={position} />
        {/* V109: close zoom on first fix */}
        <V109DriverZoom position={position} />
      </MapContainer>

      <div className={`driverIdleGps driverIdleGps--${gpsState}`}>{gpsText}</div>
      {/* V109: where the driver is right now */}
      {gpsState === "live" && v109Place ? (
        <div className="driverIdleGps driverIdleGps--live" style={{ bottom: 46, color: "#ffffff" }}>
          📍 {v109Place}
        </div>
      ) : null}
    </div>
  );
}
