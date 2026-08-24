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
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./driver-ride-map.css";

import {
  isRequestCanceled,
} from "./api";

import {
  getRoadRoute,
  reverseLocation,
} from "./locationService";

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

  try {
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
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    /*
    | Never make the route disappear completely. Managed Geoapify and OSRM
    | remain the road-route authorities; this direct geometry is only a visual
    | continuity fallback until the next automatic refresh succeeds.
    */
    return {
      positions: [start, end],
      distanceKm: 0,
      durationSeconds: 0,
      provider: "visual-fallback",
      approximate: true,
    };
  }
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
      /* Keep last visible pickup route during transient GPS reconnects. */
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
          !isRequestCanceled(
            error
          )
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
          !isRequestCanceled(
            error
          )
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


/*
|--------------------------------------------------------------------------
| Customer Map Compatibility + Advanced Route Layer
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Purana DriverRideMap code upar intentionally preserve kiya gaya hai.
| Customer dashboard / booking form RideMap ko direct props ke saath call
| karte hain, isliye un props ke liye dedicated customer map layer add hai.
|
| Is layer se:
| - pickup/drop direct props actually map par use hote hain
| - Geoapify road route draw hota hai
| - distance + ETA parent form ko return hota hai
| - customer map driver GPS permission automatically nahi maangta
| - modal open hone par Leaflet size automatically recalculate hota hai
| - map click se pickup/drop pin + reverse address set ho sakta hai
| - live driver marker active ride me show hota hai
|
*/

function normalizeCustomerPosition(value) {
  return getCoordinates(value);
}

function CustomerMapViewport({
  pickupPosition,
  dropPosition,
  driverPosition,
  routePositions,
}) {
  const map = useMap();

  useEffect(() => {
    const invalidateTimers = [
      0,
      120,
      350,
      700,
    ].map((delay) =>
      window.setTimeout(() => {
        map.invalidateSize({
          pan: false,
          animate: false,
        });
      }, delay)
    );

    const routePoints = Array.isArray(routePositions)
      ? routePositions.filter(Boolean)
      : [];

    const fallbackPoints = [
      pickupPosition,
      dropPosition,
      driverPosition,
    ].filter(Boolean);

    const points =
      routePoints.length > 1
        ? [
            ...routePoints,
            ...fallbackPoints,
          ]
        : fallbackPoints;

    if (points.length === 1) {
      map.setView(points[0], 16, {
        animate: true,
      });
    } else if (points.length > 1) {
      map.fitBounds(points, {
        padding: [42, 42],
        maxZoom: 16,
        animate: true,
      });
    }

    return () => {
      invalidateTimers.forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }, [
    map,
    pickupPosition?.[0],
    pickupPosition?.[1],
    dropPosition?.[0],
    dropPosition?.[1],
    driverPosition?.[0],
    driverPosition?.[1],
    routePositions,
  ]);

  return null;
}

function CustomerMapClickHandler({
  enabled,
  pickupPosition,
  dropPosition,
  onPick,
}) {
  useMapEvents({
    click(event) {
      if (!enabled) {
        return;
      }

      const latitude = Number(event?.latlng?.lat);
      const longitude = Number(event?.latlng?.lng);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return;
      }

      let target = "drop";

      if (!pickupPosition) {
        target = "pickup";
      } else if (!dropPosition) {
        target = "drop";
      }

      onPick?.({
        target,
        latitude,
        longitude,
      });
    },
  });

  return null;
}

function CustomerRideMap({
  ride = null,
  onLocationChange,
  onAddressChange,
  pickupAddress = "",
  dropAddress = "",
  pickupCoordinates = null,
  dropCoordinates = null,
  driverLocation = null,
  readOnly = false,
}) {
  const effectivePickup = useMemo(() => {
    return (
      normalizeCustomerPosition(pickupCoordinates) ||
      getPickupPosition(ride)
    );
  }, [
    pickupCoordinates,
    ride,
  ]);

  const effectiveDrop = useMemo(() => {
    return (
      normalizeCustomerPosition(dropCoordinates) ||
      getDropPosition(ride)
    );
  }, [
    dropCoordinates,
    ride,
  ]);

  const effectiveDriver = useMemo(() => {
    return normalizeCustomerPosition(driverLocation);
  }, [driverLocation]);

  const effectivePickupAddress =
    pickupAddress ||
    (ride ? getPickupAddress(ride) : "Pickup location");

  const effectiveDropAddress =
    dropAddress ||
    (ride ? getDropAddress(ride) : "Destination");

  const [routePositions, setRoutePositions] = useState([]);
  const [routeInfo, setRouteInfo] = useState({
    distanceKm: 0,
    durationMinutes: 0,
    provider: "",
  });
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [pinMessage, setPinMessage] = useState("");

  const pushMapData = (
    extra = {}
  ) => {
    if (typeof onLocationChange !== "function") {
      return;
    }

    onLocationChange((current) => ({
      ...(current && typeof current === "object"
        ? current
        : {}),
      pickup: effectivePickup || null,
      drop: effectiveDrop || null,
      distance: Number(routeInfo.distanceKm || 0),
      duration: Number(routeInfo.durationMinutes || 0),
      routeCoordinates: routePositions,
      routeProvider: routeInfo.provider || "",
      ...extra,
    }));
  };

  useEffect(() => {
    if (!effectivePickup || !effectiveDrop) {
      setRoutePositions([]);
      setRouteInfo({
        distanceKm: 0,
        durationMinutes: 0,
        provider: "",
      });
      setRouteError("");

      if (typeof onLocationChange === "function") {
        onLocationChange((current) => ({
          ...(current && typeof current === "object"
            ? current
            : {}),
          pickup: effectivePickup || null,
          drop: effectiveDrop || null,
          distance: 0,
          duration: 0,
          routeCoordinates: [],
          routeProvider: "",
        }));
      }

      return undefined;
    }

    const controller = new AbortController();

    const loadCustomerRoute = async () => {
      try {
        setRouteLoading(true);
        setRouteError("");

        const result = await fetchRoadRoute(
          effectivePickup,
          effectiveDrop,
          controller.signal
        );

        const positions = Array.isArray(result?.positions)
          ? result.positions.filter(
              (point) =>
                Array.isArray(point) &&
                Number.isFinite(Number(point[0])) &&
                Number.isFinite(Number(point[1]))
            )
          : [];

        const nextInfo = {
          distanceKm: Number(result?.distanceKm || 0),
          durationMinutes:
            Number(result?.durationSeconds || 0) / 60,
          provider: result?.provider || "geoapify",
        };

        setRoutePositions(positions);
        setRouteInfo(nextInfo);

        if (typeof onLocationChange === "function") {
          onLocationChange((current) => ({
            ...(current && typeof current === "object"
              ? current
              : {}),
            pickup: effectivePickup,
            drop: effectiveDrop,
            distance: Number(nextInfo.distanceKm.toFixed(1)),
            duration: Number(nextInfo.durationMinutes.toFixed(1)),
            routeCoordinates: positions,
            routeProvider: nextInfo.provider,
          }));
        }
      } catch (error) {
        if (
          isRequestCanceled(
            error
          )
        ) {
          return;
        }

        console.error(
          "Customer road route error:",
          error
        );

        setRoutePositions([]);
        setRouteInfo({
          distanceKm: 0,
          durationMinutes: 0,
          provider: "",
        });

        setRouteError(
          error?.response?.data?.message ||
            error?.message ||
            "Road route calculate nahi hua"
        );
      } finally {
        if (!controller.signal.aborted) {
          setRouteLoading(false);
        }
      }
    };

    loadCustomerRoute();

    return () => {
      controller.abort();
    };
  }, [
    effectivePickup?.[0],
    effectivePickup?.[1],
    effectiveDrop?.[0],
    effectiveDrop?.[1],
  ]);

  useEffect(() => {
    if (typeof onLocationChange !== "function") {
      return;
    }

    onLocationChange((current) => ({
      ...(current && typeof current === "object"
        ? current
        : {}),
      pickup: effectivePickup || null,
      drop: effectiveDrop || null,
    }));
  }, [
    effectivePickup?.[0],
    effectivePickup?.[1],
    effectiveDrop?.[0],
    effectiveDrop?.[1],
  ]);

  const handleMapPick = async ({
    target,
    latitude,
    longitude,
  }) => {
    if (readOnly) {
      return;
    }

    setPinMessage(
      target === "pickup"
        ? "Pickup pin set ho raha hai…"
        : "Destination pin set ho raha hai…"
    );

    try {
      const location = await reverseLocation(
        latitude,
        longitude
      );

      const address =
        location?.address ||
        `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      if (typeof onAddressChange === "function") {
        onAddressChange(
          target === "pickup"
            ? { pickup: address }
            : { dropoff: address }
        );
      }

      if (typeof onLocationChange === "function") {
        onLocationChange((current) => ({
          ...(current && typeof current === "object"
            ? current
            : {}),
          ...(target === "pickup"
            ? { pickup: [latitude, longitude] }
            : { drop: [latitude, longitude] }),
        }));
      }

      setPinMessage(
        target === "pickup"
          ? "Pickup map se set ho gaya"
          : "Destination map se set ho gaya"
      );
    } catch (error) {
      setPinMessage(
        error?.message ||
          "Map location address me convert nahi hui"
      );
    }
  };

  const center =
    effectivePickup ||
    effectiveDrop ||
    effectiveDriver ||
    DEFAULT_CENTER;

  return (
    <section
      className="driverRideMapWrapper customerRideMapWrapper"
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100%",
        borderRadius: 0,
        border: 0,
        boxShadow: "none",
        background: "#e2e8f0",
      }}
    >
      {(routeLoading || routeError || pinMessage) && (
        <div
          style={{
            position: "absolute",
            zIndex: 900,
            top: 10,
            left: 10,
            right: 10,
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 10px",
            borderRadius: 10,
            background: routeError
              ? "rgba(254,226,226,.96)"
              : "rgba(255,255,255,.95)",
            color: routeError ? "#991b1b" : "#334155",
            fontSize: 11,
            fontWeight: 800,
            boxShadow: "0 6px 20px rgba(15,23,42,.12)",
          }}
        >
          <span>
            {routeLoading
              ? "Road route calculate ho raha hai…"
              : routeError || pinMessage}
          </span>

          {routeInfo.distanceKm > 0 && !routeError && (
            <span>
              {routeInfo.distanceKm.toFixed(1)} km •{" "}
              {Math.max(
                1,
                Math.round(routeInfo.durationMinutes)
              )}{" "}
              min
            </span>
          )}
        </div>
      )}

      <div
        className="driverCompactMap customerCompactMap"
        style={{
          width: "100%",
          maxWidth: "none",
          height: "100%",
          minHeight: "100%",
          margin: 0,
          border: 0,
          borderRadius: 0,
        }}
      >
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom
          doubleClickZoom
          touchZoom
          dragging
          zoomControl
          className="driverRideMap customerRideMap"
          style={{
            width: "100%",
            height: "100%",
            minHeight: "100%",
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <CustomerMapViewport
            pickupPosition={effectivePickup}
            dropPosition={effectiveDrop}
            driverPosition={effectiveDriver}
            routePositions={routePositions}
          />

          <CustomerMapClickHandler
            enabled={!readOnly}
            pickupPosition={effectivePickup}
            dropPosition={effectiveDrop}
            onPick={handleMapPick}
          />

          {effectivePickup && (
            <Marker
              position={effectivePickup}
              icon={pickupIcon}
            >
              <Popup>
                <strong>Pickup</strong>
                <br />
                {effectivePickupAddress || "Pickup location"}
              </Popup>
            </Marker>
          )}

          {effectiveDrop && (
            <Marker
              position={effectiveDrop}
              icon={dropIcon}
            >
              <Popup>
                <strong>Destination</strong>
                <br />
                {effectiveDropAddress || "Destination"}
              </Popup>
            </Marker>
          )}

          {effectiveDriver && (
            <Marker
              position={effectiveDriver}
              icon={driverIcon}
            >
              <Popup>
                <strong>Driver Live</strong>
              </Popup>
            </Marker>
          )}

          {routePositions.length > 1 && (
            <Polyline
              positions={routePositions}
              pathOptions={{
                color: "#f5b700",
                weight: 6,
                opacity: 0.96,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          )}
        </MapContainer>
      </div>
    </section>
  );
}

export default CustomerRideMap;