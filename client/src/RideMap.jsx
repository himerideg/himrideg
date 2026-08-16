import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./driver-ride-map.css";

import { getRoadRoute } from "./locationService";

const DEFAULT_CENTER = [32.1109, 76.5363];

const pickupIcon = L.divIcon({
  className: "driverMapCustomIcon",
  html: '<div class="driverMapPin pickupPin"><span>P</span></div>',
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -45],
});

const dropIcon = L.divIcon({
  className: "driverMapCustomIcon",
  html: '<div class="driverMapPin dropPin"><span>D</span></div>',
  iconSize: [50, 50],
  iconAnchor: [25, 50],
  popupAnchor: [0, -45],
});

const driverIcon = L.divIcon({
  className: "driverMapCustomIcon",
  html: '<div class="driverMapPin driverPin"><span>🚕</span></div>',
  iconSize: [56, 56],
  iconAnchor: [28, 56],
  popupAnchor: [0, -50],
});

function getCoordinates(value) {
  if (!value) {
    return null;
  }

  if (Array.isArray(value) && value.length >= 2) {
    const first = Number(value[0]);
    const second = Number(value[1]);

    if (
      Number.isFinite(first) &&
      Number.isFinite(second)
    ) {
      if (
        Math.abs(first) <= 90 &&
        Math.abs(second) <= 180
      ) {
        return [first, second];
      }

      if (
        Math.abs(second) <= 90 &&
        Math.abs(first) <= 180
      ) {
        return [second, first];
      }
    }
  }

  const source =
    value?.coordinates &&
    typeof value.coordinates === "object"
      ? value.coordinates
      : value;

  const geo =
    source?.geo ||
    value?.geo;

  if (
    geo?.type === "Point" &&
    Array.isArray(geo.coordinates) &&
    geo.coordinates.length >= 2
  ) {
    const longitude = Number(
      geo.coordinates[0]
    );

    const latitude = Number(
      geo.coordinates[1]
    );

    if (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      return [latitude, longitude];
    }
  }

  const latitude = Number(
    source?.latitude ??
      source?.lat
  );

  const longitude = Number(
    source?.longitude ??
      source?.lng ??
      source?.lon
  );

  if (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  ) {
    return [latitude, longitude];
  }

  return null;
}

function getPickupPosition(ride) {
  return (
    getCoordinates(
      ride?.pickupCoordinates
    ) ||
    getCoordinates(
      ride?.pickup?.coordinates
    ) ||
    getCoordinates(ride?.pickup) ||
    null
  );
}

function getDropPosition(ride) {
  return (
    getCoordinates(
      ride?.dropCoordinates
    ) ||
    getCoordinates(
      ride?.dropoff?.coordinates
    ) ||
    getCoordinates(
      ride?.drop?.coordinates
    ) ||
    getCoordinates(ride?.dropoff) ||
    getCoordinates(ride?.drop) ||
    null
  );
}

function getAddress(value, fallback) {
  if (typeof value === "string") {
    return value;
  }

  return (
    value?.address ||
    value?.formattedAddress ||
    value?.label ||
    value?.name ||
    fallback
  );
}

function getPickupAddress(ride) {
  return getAddress(
    ride?.pickup,
    "Pickup location"
  );
}

function getDropAddress(ride) {
  return getAddress(
    ride?.dropoff || ride?.drop,
    "Destination"
  );
}

function formatDuration(seconds) {
  const minutes = Math.max(
    0,
    Math.round(
      Number(seconds || 0) / 60
    )
  );

  if (!minutes) {
    return "—";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  const remainingMinutes =
    minutes % 60;

  return remainingMinutes
    ? `${hours} hr ${remainingMinutes} min`
    : `${hours} hr`;
}

function formatDistance(distanceKm) {
  const value = Number(
    distanceKm || 0
  );

  if (!value) {
    return "—";
  }

  if (value < 1) {
    return `${Math.round(
      value * 1000
    )} m`;
  }

  return `${value.toFixed(1)} km`;
}

function FitMapBounds({
  pickupPosition,
  dropPosition,
  driverPosition,
  pickupRoute,
  tripRoute,
}) {
  const map = useMap();

  useEffect(() => {
    const routePoints = [
      ...(pickupRoute || []),
      ...(tripRoute || []),
    ];

    const points =
      routePoints.length > 1
        ? routePoints
        : [
            pickupPosition,
            dropPosition,
            driverPosition,
          ].filter(Boolean);

    if (!points.length) {
      return;
    }

    if (points.length === 1) {
      map.setView(
        points[0],
        14
      );

      return;
    }

    map.fitBounds(points, {
      padding: [32, 32],
      maxZoom: 15,
    });

    const timer =
      window.setTimeout(() => {
        map.invalidateSize();
      }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    map,
    pickupPosition,
    dropPosition,
    driverPosition,
    pickupRoute,
    tripRoute,
  ]);

  return null;
}

async function fetchRoadRoute(
  start,
  end,
  signal
) {
  if (!start || !end) {
    return null;
  }

  const [
    startLatitude,
    startLongitude,
  ] = start;

  const [
    endLatitude,
    endLongitude,
  ] = end;

  /*
  |--------------------------------------------------------------------------
  | Production Route — HimRideG Map API / Geoapify
  |--------------------------------------------------------------------------
  |
  | Public OSRM code fallback ke liye preserve hai, lekin production route
  | HimRideG backend ke managed /maps/route endpoint se aata hai.
  |
  */

  try {
    const managedRoute = await getRoadRoute(
      {
        latitude: startLatitude,
        longitude: startLongitude,
      },
      {
        latitude: endLatitude,
        longitude: endLongitude,
      },
      {
        signal,
      }
    );

    if (
      Array.isArray(managedRoute?.coordinates) &&
      managedRoute.coordinates.length >= 2
    ) {
      return {
        positions: managedRoute.coordinates.map((point) => {
          if (Array.isArray(point)) {
            return [Number(point[0]), Number(point[1])];
          }

          return [
            Number(point.latitude ?? point.lat),
            Number(point.longitude ?? point.lng ?? point.lon),
          ];
        }).filter((point) =>
          Number.isFinite(point[0]) &&
          Number.isFinite(point[1])
        ),
        distanceKm: Number(managedRoute.distanceKm || 0),
        durationSeconds: Number(managedRoute.durationMinutes || 0) * 60,
        provider: managedRoute.provider || "geoapify",
      };
    }
  } catch (managedError) {
    if (signal?.aborted) {
      throw managedError;
    }

    console.warn(
      "Managed road route unavailable, development fallback try hoga:",
      managedError?.message || managedError
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Legacy OSRM Fallback
  |--------------------------------------------------------------------------
  |
  | Existing code delete nahi kiya gaya. Production me managed route fail ho
  | to visual continuity ke liye fallback available hai.
  |
  */

  const routeUrl =
    "https://router.project-osrm.org/route/v1/driving/" +
    `${startLongitude},${startLatitude};` +
    `${endLongitude},${endLatitude}` +
    "?overview=full&geometries=geojson&steps=false";

  const response = await fetch(
    routeUrl,
    {
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(
      "Road route calculate nahi hua"
    );
  }

  const data =
    await response.json();

  const route =
    data?.routes?.[0];

  if (!route) {
    throw new Error(
      "Road route available nahi hai"
    );
  }

  return {
    positions:
      route.geometry.coordinates.map(
        ([
          longitude,
          latitude,
        ]) => [
          latitude,
          longitude,
        ]
      ),

    distanceKm:
      Number(route.distance || 0) /
      1000,

    durationSeconds:
      Number(route.duration || 0),

    provider: "osrm-fallback",
  };
}

function openGoogleMaps(
  start,
  destination
) {
  if (!destination) {
    return;
  }

  const destinationValue =
    destination.join(",");

  const originValue =
    start
      ? `&origin=${start.join(",")}`
      : "";

  const url =
    "https://www.google.com/maps/dir/?api=1" +
    originValue +
    `&destination=${destinationValue}` +
    "&travelmode=driving";

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}

function DriverRideMap({ ride }) {
  const [
    driverPosition,
    setDriverPosition,
  ] = useState(null);

  const [
    locationError,
    setLocationError,
  ] = useState("");

  const [
    routeError,
    setRouteError,
  ] = useState("");

  const [
    pickupRoute,
    setPickupRoute,
  ] = useState([]);

  const [
    tripRoute,
    setTripRoute,
  ] = useState([]);

  const [
    pickupInfo,
    setPickupInfo,
  ] = useState({
    distanceKm: 0,
    durationSeconds: 0,
  });

  const [
    tripInfo,
    setTripInfo,
  ] = useState({
    distanceKm: 0,
    durationSeconds: 0,
  });

  const [
    routeLoading,
    setRouteLoading,
  ] = useState(false);

  const pickupPosition =
    useMemo(
      () =>
        getPickupPosition(ride),
      [ride]
    );

  const dropPosition =
    useMemo(
      () =>
        getDropPosition(ride),
      [ride]
    );

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError(
        "Browser location support nahi karta."
      );

      return undefined;
    }

    const watchId =
      navigator.geolocation.watchPosition(
        (position) => {
          setDriverPosition([
            position.coords.latitude,
            position.coords.longitude,
          ]);

          setLocationError("");
        },

        (error) => {
          if (
            error.code ===
            error.PERMISSION_DENIED
          ) {
            setLocationError(
              "Driver location permission allow karo."
            );
          } else {
            setLocationError(
              "Current location nahi mil paayi."
            );
          }
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        }
      );

    return () => {
      navigator.geolocation.clearWatch(
        watchId
      );
    };
  }, []);

  useEffect(() => {
    if (
      !driverPosition ||
      !pickupPosition
    ) {
      setPickupRoute([]);

      setPickupInfo({
        distanceKm: 0,
        durationSeconds: 0,
      });

      return undefined;
    }

    const controller =
      new AbortController();

    const loadRoute = async () => {
      try {
        setRouteLoading(true);
        setRouteError("");

        const result =
          await fetchRoadRoute(
            driverPosition,
            pickupPosition,
            controller.signal
          );

        setPickupRoute(
          result?.positions || []
        );

        setPickupInfo({
          distanceKm:
            result?.distanceKm || 0,

          durationSeconds:
            result?.durationSeconds ||
            0,
        });
      } catch (error) {
        if (
          error.name !==
          "AbortError"
        ) {
          setRouteError(
            "Pickup tak ka road route calculate nahi hua."
          );
        }
      } finally {
        setRouteLoading(false);
      }
    };

    loadRoute();

    return () => {
      controller.abort();
    };
  }, [
    driverPosition?.[0],
    driverPosition?.[1],
    pickupPosition?.[0],
    pickupPosition?.[1],
  ]);

  useEffect(() => {
    if (
      !pickupPosition ||
      !dropPosition
    ) {
      setTripRoute([]);

      setTripInfo({
        distanceKm: 0,
        durationSeconds: 0,
      });

      return undefined;
    }

    const controller =
      new AbortController();

    const loadRoute = async () => {
      try {
        setRouteLoading(true);
        setRouteError("");

        const result =
          await fetchRoadRoute(
            pickupPosition,
            dropPosition,
            controller.signal
          );

        setTripRoute(
          result?.positions || []
        );

        setTripInfo({
          distanceKm:
            result?.distanceKm || 0,

          durationSeconds:
            result?.durationSeconds ||
            0,
        });
      } catch (error) {
        if (
          error.name !==
          "AbortError"
        ) {
          setRouteError(
            "Destination ka road route calculate nahi hua."
          );
        }
      } finally {
        setRouteLoading(false);
      }
    };

    loadRoute();

    return () => {
      controller.abort();
    };
  }, [
    pickupPosition?.[0],
    pickupPosition?.[1],
    dropPosition?.[0],
    dropPosition?.[1],
  ]);

  const mapCenter =
    driverPosition ||
    pickupPosition ||
    dropPosition ||
    DEFAULT_CENTER;

  const hasRideRoute = Boolean(
    pickupPosition ||
    dropPosition
  );

  return (
    <section className="driverRideMapWrapper">
      <header className="driverMapHeader">
        <div>
          <small>
            {hasRideRoute
              ? "LIVE ROUTE"
              : "DRIVER LOCATION"}
          </small>

          <strong>
            {hasRideRoute
              ? "Selected Ride Route"
              : "Waiting for New Ride"}
          </strong>
        </div>

        <span
          className={
            driverPosition
              ? "locationActive"
              : ""
          }
        >
          {driverPosition
            ? "● Live"
            : "Location..."}
        </span>
      </header>

      {hasRideRoute && (
        <div className="driverRouteSummary">
          <article>
            <span className="summaryIcon">
              📍
            </span>

            <div>
              <small>
                Pickup tak
              </small>

              <strong>
                {routeLoading &&
                !pickupInfo.durationSeconds
                  ? "Calculating..."
                  : formatDuration(
                      pickupInfo.durationSeconds
                    )}
              </strong>

              <p>
                {formatDistance(
                  pickupInfo.distanceKm
                )}
              </p>
            </div>
          </article>

          <article>
            <span className="summaryIcon">
              🏁
            </span>

            <div>
              <small>
                Trip time
              </small>

              <strong>
                {routeLoading &&
                !tripInfo.durationSeconds
                  ? "Calculating..."
                  : formatDuration(
                      tripInfo.durationSeconds
                    )}
              </strong>

              <p>
                {formatDistance(
                  tripInfo.distanceKm
                )}
              </p>
            </div>
          </article>
        </div>
      )}

      {locationError && (
        <div className="driverMapMessage error">
          {locationError}
        </div>
      )}

      {routeError && (
        <div className="driverMapMessage warning">
          {routeError}
        </div>
      )}

      <div className="driverCompactMap">
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom
          className="driverRideMap"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitMapBounds
            pickupPosition={
              pickupPosition
            }
            dropPosition={
              dropPosition
            }
            driverPosition={
              driverPosition
            }
            pickupRoute={
              pickupRoute
            }
            tripRoute={tripRoute}
          />

          {pickupPosition && (
            <Marker
              position={
                pickupPosition
              }
              icon={pickupIcon}
            >
              <Popup>
                <strong>Pickup</strong>
                <br />
                {getPickupAddress(
                  ride
                )}
              </Popup>
            </Marker>
          )}

          {dropPosition && (
            <Marker
              position={
                dropPosition
              }
              icon={dropIcon}
            >
              <Popup>
                <strong>
                  Destination
                </strong>
                <br />
                {getDropAddress(
                  ride
                )}
              </Popup>
            </Marker>
          )}

          {driverPosition && (
            <Marker
              position={
                driverPosition
              }
              icon={driverIcon}
            >
              <Popup>
                <strong>
                  Aapki current location
                </strong>
              </Popup>
            </Marker>
          )}

          {pickupRoute.length >
            1 && (
            <Polyline
              positions={
                pickupRoute
              }
              pathOptions={{
                color: "#2563eb",
                weight: 6,
                opacity: 0.95,
              }}
            />
          )}

          {tripRoute.length >
            1 && (
            <Polyline
              positions={tripRoute}
              pathOptions={{
                color: "#f5b700",
                weight: 6,
                opacity: 0.95,
              }}
            />
          )}
        </MapContainer>
      </div>

      {hasRideRoute ? (
        <>
          <div className="driverMapLocations">
            <article>
              <span className="locationBadge pickup">
                P
              </span>

              <div>
                <small>Pickup</small>

                <strong>
                  {getPickupAddress(
                    ride
                  )}
                </strong>
              </div>
            </article>

            <article>
              <span className="locationBadge drop">
                D
              </span>

              <div>
                <small>
                  Destination
                </small>

                <strong>
                  {getDropAddress(
                    ride
                  )}
                </strong>
              </div>
            </article>
          </div>

          <div className="driverMapActions">
            <button
              type="button"
              onClick={() =>
                openGoogleMaps(
                  driverPosition,
                  pickupPosition
                )
              }
              disabled={
                !pickupPosition
              }
            >
              Navigate to Pickup
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() =>
                openGoogleMaps(
                  pickupPosition,
                  dropPosition
                )
              }
              disabled={
                !dropPosition
              }
            >
              View Full Trip
            </button>
          </div>
        </>
      ) : (
        <div
          style={{
            padding: "12px 14px 14px",
            color: "#64748b",
            fontSize: "12px",
            fontWeight: 800,
            textAlign: "center"
          }}
        >
          Aapki live location map par dikh rahi hai.
          Nayi ride aate hi pickup aur destination route
          automatically yahin show hoga.
        </div>
      )}
    </section>
  );
}

export default DriverRideMap;