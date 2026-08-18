import React, {
  useEffect,
  useMemo,
  useRef,
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
import "./home-book-ride.css";

/*
|--------------------------------------------------------------------------
| Default Map Location
|--------------------------------------------------------------------------
*/

const PALAMPUR_CENTER = [
  32.1109,
  76.5363,
];

/*
|--------------------------------------------------------------------------
| Map Marker
|--------------------------------------------------------------------------
*/

function createPin(color) {
  return L.divIcon({
    className: "",

    html: `
      <span
        class="hbrPin"
        style="background:${color}"
      ></span>
    `,

    iconSize: [28, 38],
    iconAnchor: [14, 36],
  });
}

const pickupIcon =
  createPin("#22c55e");

const dropIcon =
  createPin("#ef4444");

/*
|--------------------------------------------------------------------------
| Fit Map According To Selected Locations
|--------------------------------------------------------------------------
*/

function FitRoute({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 1) {
      map.setView(
        points[0],
        14
      );
    }

    if (points.length > 1) {
      map.fitBounds(
        L.latLngBounds(
          points
        ),
        {
          padding: [35, 35],
          maxZoom: 15,
        }
      );
    }
  }, [
    map,
    points,
  ]);

  return null;
}

/*
|--------------------------------------------------------------------------
| Location Object
|--------------------------------------------------------------------------
*/

function createLocation(item) {
  return {
    address:
      item.display_name,

    latitude:
      Number(item.lat),

    longitude:
      Number(item.lon),
  };
}

/*
|--------------------------------------------------------------------------
| Read Saved Guest Booking
|--------------------------------------------------------------------------
*/

function getSavedBooking() {
  try {
    const savedBooking =
      localStorage.getItem(
        "himrideg_pending_booking"
      );

    if (!savedBooking) {
      return {};
    }

    return (
      JSON.parse(
        savedBooking
      ) || {}
    );
  } catch {
    return {};
  }
}

/*
|--------------------------------------------------------------------------
| Minimum Schedule Time
|--------------------------------------------------------------------------
*/

function getMinimumScheduleTime() {
  const date =
    new Date();

  date.setMinutes(
    date.getMinutes() -
      date.getTimezoneOffset()
  );

  return date
    .toISOString()
    .slice(0, 16);
}

/*
|--------------------------------------------------------------------------
| Home Book Ride
|--------------------------------------------------------------------------
*/

function HomeBookRide({
  onBack,
  onContinue,
}) {
  const savedBooking =
    useMemo(
      getSavedBooking,
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Booking Form
  |--------------------------------------------------------------------------
  */

  const [form, setForm] =
    useState({
      pickup:
        savedBooking.pickup ||
        null,

      dropoff:
        savedBooking.dropoff ||
        null,

      bookingMode:
        savedBooking.bookingMode ||
        "now",

      scheduledAt:
        savedBooking.scheduledAt ||
        savedBooking.time ||
        "",

      riderFor:
        savedBooking.riderFor ||
        "self",

      passengers:
        Number(
          savedBooking.passengers
        ) || 1,

      vehicleType:
        savedBooking.vehicleType ||
        "sedan",
    });

  /*
  |--------------------------------------------------------------------------
  | Location Input Text
  |--------------------------------------------------------------------------
  */

  const [
    locationText,
    setLocationText,
  ] = useState({
    pickup:
      savedBooking.pickup
        ?.address || "",

    dropoff:
      savedBooking.dropoff
        ?.address || "",
  });

  /*
  |--------------------------------------------------------------------------
  | Location Search State
  |--------------------------------------------------------------------------
  */

  const [
    focusedField,
    setFocusedField,
  ] = useState("");

  const [
    suggestions,
    setSuggestions,
  ] = useState([]);

  const [
    searching,
    setSearching,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Route State
  |--------------------------------------------------------------------------
  */

  const [
    route,
    setRoute,
  ] = useState([]);

  const [
    trip,
    setTrip,
  ] = useState({
    distance: 0,
    duration: 0,
    fare: 0,
  });

  /*
  |--------------------------------------------------------------------------
  | Validation
  |--------------------------------------------------------------------------
  */

  const [
    errors,
    setErrors,
  ] = useState({});

  /*
  |--------------------------------------------------------------------------
  | Rider Modal
  |--------------------------------------------------------------------------
  */

  const [
    riderModalOpen,
    setRiderModalOpen,
  ] = useState(false);

  const [
    selectedRider,
    setSelectedRider,
  ] = useState(
    form.riderFor
  );

  const searchAbortRef =
    useRef(null);

  /*
  |--------------------------------------------------------------------------
  | Location Suggestions
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const query =
      locationText[
        focusedField
      ]?.trim();

    if (
      !focusedField ||
      !query ||
      query.length < 2
    ) {
      setSuggestions([]);
      setSearching(false);

      return undefined;
    }

    const timer =
      window.setTimeout(
        async () => {
          searchAbortRef.current
            ?.abort();

          const controller =
            new AbortController();

          searchAbortRef.current =
            controller;

          setSearching(true);

          try {
            const url =
              "https://nominatim.openstreetmap.org/search" +
              "?format=jsonv2" +
              "&addressdetails=1" +
              "&limit=6" +
              "&countrycodes=in" +
              "&accept-language=en" +
              `&q=${encodeURIComponent(
                query
              )}`;

            const response =
              await fetch(
                url,
                {
                  signal:
                    controller.signal,

                  headers: {
                    Accept:
                      "application/json",
                  },
                }
              );

            if (
              !response.ok
            ) {
              throw new Error(
                "Location search failed"
              );
            }

            const data =
              await response.json();

            setSuggestions(
              Array.isArray(data)
                ? data
                : []
            );
          } catch (error) {
            if (
              error.name !==
              "AbortError"
            ) {
              console.error(
                "Location search error:",
                error
              );

              setSuggestions([]);
            }
          } finally {
            if (
              searchAbortRef.current ===
              controller
            ) {
              setSearching(false);
            }
          }
        },
        350
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    focusedField,
    locationText,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Route, Distance And Fare
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !form.pickup ||
      !form.dropoff
    ) {
      setRoute([]);

      setTrip({
        distance: 0,
        duration: 0,
        fare: 0,
      });

      return undefined;
    }

    const controller =
      new AbortController();

    const loadRoute =
      async () => {
        try {
          const pickup =
            form.pickup;

          const dropoff =
            form.dropoff;

          const url =
            "https://router.project-osrm.org/route/v1/driving/" +
            `${pickup.longitude},${pickup.latitude};` +
            `${dropoff.longitude},${dropoff.latitude}` +
            "?overview=full" +
            "&geometries=geojson";

          const response =
            await fetch(
              url,
              {
                signal:
                  controller.signal,
              }
            );

          if (
            !response.ok
          ) {
            throw new Error(
              "Route request failed"
            );
          }

          const data =
            await response.json();

          const foundRoute =
            data.routes?.[0];

          if (!foundRoute) {
            throw new Error(
              "Route not found"
            );
          }

          const distance =
            foundRoute.distance /
            1000;

          const duration =
            foundRoute.duration /
            60;

          const fare =
            Math.round(
              80 +
              distance * 18
            );

          const coordinates =
            foundRoute.geometry
              .coordinates
              .map(
                ([
                  longitude,
                  latitude,
                ]) => [
                  latitude,
                  longitude,
                ]
              );

          setRoute(
            coordinates
          );

          setTrip({
            distance,
            duration,
            fare,
          });
        } catch (error) {
          if (
            error.name !==
            "AbortError"
          ) {
            console.error(
              "Route loading error:",
              error
            );
          }
        }
      };

    loadRoute();

    return () => {
      controller.abort();
    };
  }, [
    form.pickup,
    form.dropoff,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Location Select
  |--------------------------------------------------------------------------
  */

  const selectSuggestion =
    (item) => {
      const location =
        createLocation(item);

      const field =
        focusedField;

      if (!field) {
        return;
      }

      setForm(
        (current) => ({
          ...current,
          [field]: location,
        })
      );

      setLocationText(
        (current) => ({
          ...current,

          [field]:
            location.address,
        })
      );

      setErrors(
        (current) => ({
          ...current,
          [field]: "",
        })
      );

      setSuggestions([]);
      setFocusedField("");
    };

  /*
  |--------------------------------------------------------------------------
  | Location Input Change
  |--------------------------------------------------------------------------
  */

  const changeLocation = (
    field,
    value
  ) => {
    setLocationText(
      (current) => ({
        ...current,
        [field]: value,
      })
    );

    setForm(
      (current) => ({
        ...current,
        [field]: null,
      })
    );

    setFocusedField(
      field
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Change Booking Mode
  |--------------------------------------------------------------------------
  */

  const changeBookingMode =
    (event) => {
      const bookingMode =
        event.target.value;

      setForm(
        (current) => ({
          ...current,

          bookingMode,

          scheduledAt:
            bookingMode ===
            "now"
              ? ""
              : current.scheduledAt,
        })
      );

      if (
        bookingMode ===
        "now"
      ) {
        setErrors(
          (current) => ({
            ...current,
            scheduledAt: "",
          })
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Open Rider Modal
  |--------------------------------------------------------------------------
  */

  const openRiderModal =
    () => {
      setSelectedRider(
        form.riderFor
      );

      setRiderModalOpen(
        true
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Save Rider Selection
  |--------------------------------------------------------------------------
  */

  const confirmRider =
    () => {
      setForm(
        (current) => ({
          ...current,

          riderFor:
            selectedRider,
        })
      );

      setRiderModalOpen(
        false
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Submit Guest Booking
  |--------------------------------------------------------------------------
  */

  const submitBooking =
    (event) => {
      event.preventDefault();

      const validationErrors =
        {};

      if (!form.pickup) {
        validationErrors.pickup =
          "Suggestion list se pickup select karo";
      }

      if (!form.dropoff) {
        validationErrors.dropoff =
          "Suggestion list se destination select karo";
      }

      /*
      |--------------------------------------------------------------------------
      | Time Is Required Only For Scheduled Ride
      |--------------------------------------------------------------------------
      */

      if (
        form.bookingMode ===
          "schedule" &&
        !form.scheduledAt
      ) {
        validationErrors.scheduledAt =
          "Schedule booking ke liye date aur time select karo";
      }

      if (
        !form.passengers ||
        form.passengers < 1
      ) {
        validationErrors.passengers =
          "Passengers required hain";
      }

      setErrors(
        validationErrors
      );

      if (
        Object.keys(
          validationErrors
        ).length > 0
      ) {
        return;
      }

      const bookingDraft = {
        pickup:
          form.pickup,

        dropoff:
          form.dropoff,

        bookingMode:
          form.bookingMode,

        /*
        |--------------------------------------------------------------------------
        | Pickup Now Uses Current Time
        |--------------------------------------------------------------------------
        */

        time:
          form.bookingMode ===
          "schedule"
            ? form.scheduledAt
            : new Date()
                .toISOString(),

        scheduledAt:
          form.bookingMode ===
          "schedule"
            ? form.scheduledAt
            : "",

        riderFor:
          form.riderFor,

        passengers:
          form.passengers,

        vehicleType:
          form.vehicleType,

        distance:
          trip.distance,

        estimatedDurationMinutes:
          trip.duration,

        estimatedFare:
          trip.fare,
      };

      localStorage.setItem(
        "himrideg_pending_booking",
        JSON.stringify(
          bookingDraft
        )
      );

      localStorage.setItem(
        "himrideg_auth_account_type",
        "customer"
      );

      onContinue?.(
        bookingDraft
      );
    };

  /*
  |--------------------------------------------------------------------------
  | Map Points
  |--------------------------------------------------------------------------
  */

  const markerPoints = [
    form.pickup
      ? [
          form.pickup.latitude,
          form.pickup.longitude,
        ]
      : null,

    form.dropoff
      ? [
          form.dropoff.latitude,
          form.dropoff.longitude,
        ]
      : null,
  ].filter(Boolean);

  return (
    <div className="hbrPage">
      <header className="hbrTopbar">
        <button
          type="button"
          onClick={onBack}
        >
          ← Back to Home
        </button>

        <strong>
          Him<span>Ride</span>G
        </strong>

        <small>
          Secure local taxi booking
        </small>
      </header>

      <main className="hbrLayout">
        <form
          className="hbrForm"
          onSubmit={
            submitBooking
          }
        >
          <p className="hbrEyebrow">
            BOOK YOUR RIDE
          </p>

          <h1>
            Where are you going?
          </h1>

          <p className="hbrIntro">
            2 letters type karo aur
            sahi location select karo.
          </p>

          {[
            [
              "pickup",
              "Pickup location",
            ],

            [
              "dropoff",
              "Drop location",
            ],
          ].map(
            ([
              field,
              label,
            ]) => (
              <label
                className="hbrField"
                key={field}
              >
                <span>
                  {label}{" "}
                  <b>*</b>
                </span>

                <div
                  className={`hbrInput ${
                    errors[field]
                      ? "error"
                      : ""
                  }`}
                >
                  <i
                    className={
                      field
                    }
                  />

                  <input
                    type="text"
                    value={
                      locationText[
                        field
                      ]
                    }
                    placeholder={
                      field ===
                      "pickup"
                        ? "Enter pickup location"
                        : "Enter destination"
                    }
                    autoComplete="off"
                    onFocus={() =>
                      setFocusedField(
                        field
                      )
                    }
                    onChange={(
                      event
                    ) =>
                      changeLocation(
                        field,
                        event.target
                          .value
                      )
                    }
                  />
                </div>

                {errors[field] && (
                  <em>
                    {
                      errors[
                        field
                      ]
                    }
                  </em>
                )}

                {focusedField ===
                  field &&
                  locationText[
                    field
                  ]
                    .trim()
                    .length >= 2 && (
                    <div className="hbrSuggestions">
                      {searching && (
                        <p>
                          Locations search
                          ho rahi hain…
                        </p>
                      )}

                      {!searching &&
                        suggestions.map(
                          (item) => (
                            <button
                              type="button"
                              key={
                                item.place_id
                              }
                              onClick={() =>
                                selectSuggestion(
                                  item
                                )
                              }
                            >
                              <i>⌖</i>

                              <span>
                                <strong>
                                  {item.name ||
                                    item.display_name.split(
                                      ","
                                    )[0]}
                                </strong>

                                <small>
                                  {
                                    item.display_name
                                  }
                                </small>
                              </span>
                            </button>
                          )
                        )}

                      {!searching &&
                        suggestions.length ===
                          0 && (
                          <p>
                            No matching
                            location
                          </p>
                        )}
                    </div>
                  )}
              </label>
            )
          )}

          {/*
          |--------------------------------------------------------------------------
          | Pickup Now And Rider Selection
          |--------------------------------------------------------------------------
          */}

          <div className="hbrOptionGrid">
            <label className="hbrField">
              <span>
                Pickup time
              </span>

              <select
                value={
                  form.bookingMode
                }
                onChange={
                  changeBookingMode
                }
              >
                <option value="now">
                  Pickup Now
                </option>

                <option value="schedule">
                  Schedule Booking
                </option>
              </select>
            </label>

            <div className="hbrField">
              <span>
                Ride for
              </span>

              <button
                type="button"
                className="hbrRiderButton"
                onClick={
                  openRiderModal
                }
              >
                <span>
                  {form.riderFor ===
                  "self"
                    ? "For me"
                    : "Someone else"}
                </span>

                <strong>⌄</strong>
              </button>
            </div>
          </div>

          {/*
          |--------------------------------------------------------------------------
          | Calendar And Time Appear Only For Scheduled Booking
          |--------------------------------------------------------------------------
          */}

          {form.bookingMode ===
            "schedule" && (
            <label className="hbrField hbrScheduleField">
              <span>
                Schedule date and time{" "}
                <b>*</b>
              </span>

              <input
                type="datetime-local"
                min={
                  getMinimumScheduleTime()
                }
                value={
                  form.scheduledAt
                }
                onChange={(
                  event
                ) =>
                  setForm(
                    (current) => ({
                      ...current,

                      scheduledAt:
                        event.target
                          .value,
                    })
                  )
                }
              />

              {errors.scheduledAt && (
                <em>
                  {
                    errors.scheduledAt
                  }
                </em>
              )}
            </label>
          )}

          <label className="hbrField">
            <span>
              Passengers{" "}
              <b>*</b>
            </span>

            <input
              type="number"
              min="1"
              max="20"
              value={
                form.passengers
              }
              onChange={(
                event
              ) =>
                setForm(
                  (current) => ({
                    ...current,

                    passengers:
                      Number(
                        event.target
                          .value
                      ),
                  })
                )
              }
            />

            {errors.passengers && (
              <em>
                {
                  errors.passengers
                }
              </em>
            )}
          </label>

          <label className="hbrField">
            <span>
              Vehicle type{" "}
              <b>*</b>
            </span>

            <select
              value={
                form.vehicleType
              }
              onChange={(
                event
              ) =>
                setForm(
                  (current) => ({
                    ...current,

                    vehicleType:
                      event.target
                        .value,
                  })
                )
              }
            >
              <option value="hatchback">
                Mini / Hatchback
              </option>

              <option value="sedan">
                Sedan
              </option>

              <option value="suv">
                SUV
              </option>

              <option value="traveller">
                Traveller
              </option>
            </select>
          </label>

          <button
            type="submit"
            className="hbrSubmit"
          >
            Search Ride
            <span>→</span>
          </button>

          <p className="hbrLoginNote">
            🔒 Login or sign up ke
            baad yahi booking continue
            hogi.
          </p>
        </form>

        {/*
        |--------------------------------------------------------------------------
        | Map And Booking Summary
        |--------------------------------------------------------------------------
        */}

        <section className="hbrSide">
          <div className="hbrMap">
            <MapContainer
              center={
                PALAMPUR_CENTER
              }
              zoom={10}
              scrollWheelZoom
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <FitRoute
                points={
                  markerPoints
                }
              />

              {form.pickup && (
                <Marker
                  icon={
                    pickupIcon
                  }
                  position={[
                    form.pickup
                      .latitude,

                    form.pickup
                      .longitude,
                  ]}
                >
                  <Popup>
                    <strong>
                      Pickup
                    </strong>

                    <br />

                    {
                      form.pickup
                        .address
                    }
                  </Popup>
                </Marker>
              )}

              {form.dropoff && (
                <Marker
                  icon={
                    dropIcon
                  }
                  position={[
                    form.dropoff
                      .latitude,

                    form.dropoff
                      .longitude,
                  ]}
                >
                  <Popup>
                    <strong>
                      Drop
                    </strong>

                    <br />

                    {
                      form.dropoff
                        .address
                    }
                  </Popup>
                </Marker>
              )}

              {route.length >
                1 && (
                <Polyline
                  positions={
                    route
                  }
                  pathOptions={{
                    color:
                      "#ffc400",

                    weight: 5,
                    opacity: 0.9,
                  }}
                />
              )}
            </MapContainer>
          </div>

          <div className="hbrSummary">
            <div>
              <b className="green" />

              <span>
                Pickup
              </span>

              <strong>
                {form.pickup
                  ?.address ||
                  "Select pickup"}
              </strong>
            </div>

            <div>
              <b className="red" />

              <span>
                Drop
              </span>

              <strong>
                {form.dropoff
                  ?.address ||
                  "Select destination"}
              </strong>
            </div>

            <hr />

            <p>
              <span>
                Booking time
              </span>

              <strong>
                {form.bookingMode ===
                "now"
                  ? "Pickup Now"
                  : form.scheduledAt ||
                    "Select time"}
              </strong>
            </p>

            <p>
              <span>
                Rider
              </span>

              <strong>
                {form.riderFor ===
                "self"
                  ? "For me"
                  : "Someone else"}
              </strong>
            </p>

            <p>
              <span>
                Estimated distance
              </span>

              <strong>
                {trip.distance
                  ? `${trip.distance.toFixed(
                      1
                    )} km`
                  : "—"}
              </strong>
            </p>

            <p>
              <span>
                Estimated fare
              </span>

              <strong>
                {trip.fare
                  ? `₹${trip.fare}`
                  : "—"}
              </strong>
            </p>
          </div>
        </section>
      </main>

      {/*
      |--------------------------------------------------------------------------
      | Choose Rider Modal
      |--------------------------------------------------------------------------
      */}

      {riderModalOpen && (
        <div
          className="hbrModalBackdrop"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setRiderModalOpen(
                false
              );
            }
          }}
        >
          <section
            className="hbrRiderModal"
            role="dialog"
            aria-modal="true"
          >
            <header>
              <h2>
                Choose a rider
              </h2>

              <button
                type="button"
                aria-label="Close"
                onClick={() =>
                  setRiderModalOpen(
                    false
                  )
                }
              >
                ×
              </button>
            </header>

            <button
              type="button"
              className={`hbrRiderOption ${
                selectedRider ===
                "self"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setSelectedRider(
                  "self"
                )
              }
            >
              <i>ME</i>

              <span>
                Me
              </span>

              <b>
                {selectedRider ===
                "self"
                  ? "●"
                  : "○"}
              </b>
            </button>

            <button
              type="button"
              className={`hbrRiderOption ${
                selectedRider ===
                "other"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setSelectedRider(
                  "other"
                )
              }
            >
              <i>＋</i>

              <span>
                Order ride for
                someone else
              </span>

              <b>
                {selectedRider ===
                "other"
                  ? "●"
                  : "○"}
              </b>
            </button>

            <button
              type="button"
              className="hbrModalDone"
              onClick={
                confirmRider
              }
            >
              Done
            </button>
          </section>
        </div>
      )}

      {/*
      |--------------------------------------------------------------------------
      | New Booking Option And Modal Styling
      |--------------------------------------------------------------------------
      */}

      <style>
        {`
          .hbrOptionGrid {
            display: grid;
            grid-template-columns:
              minmax(0, 1fr)
              minmax(0, 1fr);
            gap: 16px;
          }

          .hbrRiderButton {
            box-sizing: border-box;
            width: 100%;
            height: 54px;
            padding: 0 15px;
            display: flex;
            align-items: center;
            justify-content:
              space-between;
            color: #ffffff;
            background: #171b22;
            border: 1px solid #333b47;
            border-radius: 12px;
            font-family: inherit;
            font-size: 15px;
            cursor: pointer;
          }

          .hbrRiderButton strong {
            color: #ffffff;
          }

          .hbrScheduleField {
            padding: 16px;
            border: 1px solid
              rgba(
                255,
                196,
                0,
                0.3
              );
            border-radius: 14px;
            background:
              rgba(
                255,
                196,
                0,
                0.05
              );
          }

          .hbrModalBackdrop {
            position: fixed;
            inset: 0;
            z-index: 5000;
            padding: 18px;
            display: grid;
            place-items: center;
            background:
              rgba(
                0,
                0,
                0,
                0.75
              );
            backdrop-filter:
              blur(5px);
          }

          .hbrRiderModal {
            width: min(
              500px,
              100%
            );
            overflow: hidden;
            color: #ffffff;
            background: #101319;
            border: 1px solid
              #303641;
            border-radius: 18px;
            box-shadow:
              0 30px 90px
              rgba(
                0,
                0,
                0,
                0.75
              );
          }

          .hbrRiderModal header {
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content:
              space-between;
            border-bottom:
              1px solid #2b3039;
          }

          .hbrRiderModal h2 {
            margin: 0;
            font-size: 22px;
          }

          .hbrRiderModal
          header button {
            width: 42px;
            height: 42px;
            display: grid;
            place-items: center;
            color: #ffffff;
            background: #292e37;
            border: 0;
            border-radius: 50%;
            font-size: 25px;
            cursor: pointer;
          }

          .hbrRiderOption {
            box-sizing: border-box;
            width: 100%;
            min-height: 72px;
            padding: 0 20px;
            display: grid;
            grid-template-columns:
              42px 1fr auto;
            align-items: center;
            gap: 14px;
            color: #ffffff;
            background: #13171d;
            border: 0;
            border-bottom:
              1px solid #2b3039;
            font-family: inherit;
            font-size: 16px;
            text-align: left;
            cursor: pointer;
          }

          .hbrRiderOption:hover,
          .hbrRiderOption.selected {
            background: #1b2028;
          }

          .hbrRiderOption i {
            width: 38px;
            height: 38px;
            display: grid;
            place-items: center;
            color: #ffc400;
            background: #050608;
            border-radius: 50%;
            font-size: 12px;
            font-style: normal;
            font-weight: 900;
          }

          .hbrRiderOption b {
            color: #ffc400;
            font-size: 18px;
          }

          .hbrModalDone {
            width:
              calc(
                100% - 40px
              );
            height: 52px;
            margin: 20px;
            color: #080808;
            background: #ffc400;
            border: 0;
            border-radius: 10px;
            font-family: inherit;
            font-size: 16px;
            font-weight: 900;
            cursor: pointer;
          }

          @media (
            max-width: 560px
          ) {
            .hbrOptionGrid {
              grid-template-columns:
                1fr;
            }
          }
        `}
      </style>
    </div>
  );
}

export default HomeBookRide;