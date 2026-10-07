import React, { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./driver-idle-map.css";

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

export default function DriverIdleMap() {
  const [position, setPosition] = useState(null);
  const [gpsState, setGpsState] = useState("waiting");

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
        {position ? <Marker position={position} icon={driverIcon} /> : null}
        <FollowDriver position={position} />
      </MapContainer>

      <div className={`driverIdleGps driverIdleGps--${gpsState}`}>{gpsText}</div>
    </div>
  );
}
