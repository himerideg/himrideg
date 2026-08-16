import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import RideMap from "../RideMap";

import {
  searchLocations,
  getHighAccuracyBrowserLocation,
  reverseLocation
} from "../locationService";

import "../customer-book-ride.css";

const money = (value) =>
  new Intl.NumberFormat(
    "en-IN"
  ).format(
    Number(value) || 0
  );

function LocationSearchField({
  label,
  type,
  value,
  placeholder,
  onChange,
  onCoordinateSelect,
  onMyLocation,
  myLocationBusy = false,
  locationMessage = "",
}) {
  const [
    focused,
    setFocused,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    suggestions,
    setSuggestions,
  ] = useState([]);

  const requestRef =
    useRef(null);

  useEffect(() => {
    const query =
      String(
        value || ""
      ).trim();

    if (
      !focused ||
      query.length < 2
    ) {
      setSuggestions([]);
      setLoading(false);

      return undefined;
    }

    requestRef.current?.abort();

    const controller =
      new AbortController();

    requestRef.current =
      controller;

    const timer =
      window.setTimeout(
        async () => {
          setLoading(true);

          try {
            const result =
              await searchLocations(
                query,
                {
                  signal:
                    controller.signal,
                  limit: 7,
                }
              );

            setSuggestions(
              Array.isArray(
                result
              )
                ? result
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

              setSuggestions(
                []
              );
            }
          } finally {
            if (
              !controller
                .signal
                .aborted
            ) {
              setLoading(
                false
              );
            }
          }
        },
        350
      );

    return () => {
      window.clearTimeout(
        timer
      );

      controller.abort();
    };
  }, [
    focused,
    value,
  ]);

  const selectSuggestion = (
    item
  ) => {
    const address =
      item?.address ||
      item?.display_name ||
      "";

    const latitude =
      Number(
        item?.latitude ??
        item?.lat
      );

    const longitude =
      Number(
        item?.longitude ??
        item?.lon ??
        item?.lng
      );

    onChange(address);

    if (
      Number.isFinite(
        latitude
      ) &&
      Number.isFinite(
        longitude
      )
    ) {
      onCoordinateSelect?.([
        latitude,
        longitude,
      ]);
    }

    setSuggestions([]);
    setFocused(false);
  };

  return (
    <label className="cbrLocationField">
      <span>
        {label}

        <b>*</b>
      </span>

      <div className="cbrLocationInput">
        <i
          className={
            type
          }
        />

        <input
          type="text"
          value={String(
            value || ""
          )}
          placeholder={
            placeholder
          }
          autoComplete="off"
          required
          style={{
            boxSizing:
              "border-box",

            width: "100%",

            minHeight:
              "48px",

            padding:
              "0 14px 0 48px",

            color:
              "#111827",

            WebkitTextFillColor:
              "#111827",

            caretColor:
              "#111827",

            backgroundColor:
              "#ffffff",

            opacity: 1,

            fontSize:
              "15px",

            fontWeight:
              700,
          }}
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={() => {
            window.setTimeout(
              () => {
                setFocused(
                  false
                );
              },
              180
            );
          }}
          onChange={(
            event
          ) => {
            onChange(
              event.target
                .value
            );
          }}
        />
      </div>

      {type === "pickup" && onMyLocation && (
        <>
          <button
            type="button"
            className="cbrMyLocationButton"
            onClick={onMyLocation}
            disabled={myLocationBusy}
          >
            {myLocationBusy
              ? "◎ Getting My Location…"
              : "◎ My Location"}
          </button>

          {locationMessage && (
            <small className="cbrLocationMessage">
              {locationMessage}
            </small>
          )}
        </>
      )}

      {focused &&
        String(
          value || ""
        ).trim().length >=
          2 && (
          <div className="cbrSuggestions">
            {loading && (
              <p>
                Matching
                locations search
                ho rahi hain...
              </p>
            )}

            {!loading &&
              suggestions.map(
                (item) => (
                  <button
                    type="button"
                    key={
                      item.id ||
                      `${item.latitude}_${item.longitude}`
                    }
                    onMouseDown={(
                      event
                    ) => {
                      event.preventDefault();
                    }}
                    onClick={() => {
                      selectSuggestion(
                        item
                      );
                    }}
                  >
                    <i>
                      ⌖
                    </i>

                    <span>
                      <strong>
                        {item.shortName ||
                          item.name ||
                          item.address?.split(
                            ","
                          )[0] ||
                          "Location"}
                      </strong>

                      <small>
                        {
                          item.address ||
                          item.display_name
                        }
                      </small>
                    </span>
                  </button>
                )
              )}

            {!loading &&
              suggestions.length ===
                0 && (
                <p>
                  Koi matching
                  location nahi
                  mili.
                </p>
              )}
          </div>
        )}
    </label>
  );
}

function CustomerBookRide({
  open,
  onClose,
  booking,
  setBooking,
  mapData,
  setMapData,
  createBooking,
  activeRide,
  driverLocation,
}) {
  const [
    myLocationBusy,
    setMyLocationBusy,
  ] = useState(false);

  const [
    locationMessage,
    setLocationMessage,
  ] = useState("");

  if (!open) {
    return null;
  }

  const changeBooking = (
    changes
  ) => {
    setBooking(
      (current) => ({
        ...current,
        ...changes,
      })
    );
  };

  const handleAddressChange = (
    data = {}
  ) => {
    setBooking(
      (current) => ({
        ...current,

        ...(data.pickup !==
        undefined
          ? {
              pickup:
                data.pickup,
            }
          : {}),

        ...(data.dropoff !==
        undefined
          ? {
              dropoff:
                data.dropoff,
            }
          : {}),
      })
    );
  };

  const useMyLocation =
    async () => {
      setMyLocationBusy(true);
      setLocationMessage(
        "High-accuracy GPS location li ja rahi hai…"
      );

      try {
        const point =
          await getHighAccuracyBrowserLocation({
            targetAccuracy: 30,
            maxWaitMs: 9000,
          });

        const location =
          await reverseLocation(
            point.latitude,
            point.longitude
          );

        const address =
          location?.address ||
          `${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`;

        changeBooking({
          pickup:
            address,
        });

        setMapData(
          (current) => ({
            ...current,
            pickup: [
              point.latitude,
              point.longitude,
            ],
            pickupAccuracy:
              point.accuracy,
          })
        );

        setLocationMessage(
          `My Location set • GPS ±${Math.round(
            point.accuracy
          )}m`
        );
      } catch (error) {
        setLocationMessage(
          error.message ||
          "My Location nahi mil saki"
        );
      } finally {
        setMyLocationBusy(false);
      }
    };

  const handleSubmit = (
    event
  ) => {
    createBooking(
      event
    );
  };

  const minimumScheduleTime =
    new Date(
      Date.now() -
        new Date()
          .getTimezoneOffset() *
          60000
    )
      .toISOString()
      .slice(0, 16);

  return (
    <div
      className="cvModalShade"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section className="cvBookModal customerBookRideModal">
        <header>
          <div>
            <small>
              BOOK YOUR RIDE
            </small>

            <h2>
              Plan your
              journey
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Close booking"
          >
            ×
          </button>
        </header>

        <div className="cvBookingGrid">
          <form
            onSubmit={
              handleSubmit
            }
          >
            <LocationSearchField
              label="Pickup Location"
              type="pickup"
              value={
                booking.pickup
              }
              placeholder="Pickup area ka naam likhein"
              onChange={(
                pickup
              ) => {
                changeBooking({
                  pickup,
                });
              }}
              onCoordinateSelect={(
                coordinates
              ) => {
                setMapData(
                  (current) => ({
                    ...current,
                    pickup:
                      coordinates,
                  })
                );
              }}
              onMyLocation={
                useMyLocation
              }
              myLocationBusy={
                myLocationBusy
              }
              locationMessage={
                locationMessage
              }
            />

            <LocationSearchField
              label="Drop Location"
              type="drop"
              value={
                booking.dropoff
              }
              placeholder="Destination area ka naam likhein"
              onChange={(
                dropoff
              ) => {
                changeBooking({
                  dropoff,
                });
              }}
              onCoordinateSelect={(
                coordinates
              ) => {
                setMapData(
                  (current) => ({
                    ...current,
                    drop:
                      coordinates,
                  })
                );
              }}
            />

            <div className="cvTwoFields">
              <label>
                Pickup time

                <select
                  value={
                    booking.bookingMode ||
                    "now"
                  }
                  onChange={(
                    event
                  ) => {
                    const bookingMode =
                      event.target
                        .value;

                    changeBooking({
                      bookingMode,

                      travelDate:
                        bookingMode ===
                        "now"
                          ? ""
                          : booking.travelDate ||
                            "",
                    });
                  }}
                >
                  <option value="now">
                    Pickup Now
                  </option>

                  <option value="schedule">
                    Schedule
                    Booking
                  </option>
                </select>
              </label>

              <label>
                Ride for

                <select
                  value={
                    booking.riderFor ||
                    "self"
                  }
                  onChange={(
                    event
                  ) => {
                    changeBooking({
                      riderFor:
                        event
                          .target
                          .value,
                    });
                  }}
                >
                  <option value="self">
                    For me
                  </option>

                  <option value="other">
                    Someone else
                  </option>
                </select>
              </label>
            </div>

            {booking.bookingMode ===
              "schedule" && (
              <label>
                Schedule Date
                &amp; Time

                <b>*</b>

                <input
                  type="datetime-local"
                  value={
                    booking.travelDate ||
                    ""
                  }
                  min={
                    minimumScheduleTime
                  }
                  required
                  onChange={(
                    event
                  ) => {
                    changeBooking({
                      travelDate:
                        event
                          .target
                          .value,
                    });
                  }}
                />
              </label>
            )}

            <div className="cvTwoFields">
              <label>
                Passengers

                <b>*</b>

                <input
                  type="number"
                  min="1"
                  max="8"
                  value={
                    booking.passengers ||
                    1
                  }
                  required
                  onChange={(
                    event
                  ) => {
                    changeBooking({
                      passengers:
                        event
                          .target
                          .value,
                    });
                  }}
                />
              </label>

              <label>
                Phone Number

                <b>*</b>

                <input
                  type="tel"
                  value={
                    booking.customerPhone ||
                    ""
                  }
                  maxLength="15"
                  required
                  onChange={(
                    event
                  ) => {
                    changeBooking({
                      customerPhone:
                        event.target.value.replace(
                          /[^0-9+]/g,
                          ""
                        ),
                    });
                  }}
                />
              </label>
            </div>

            <div className="cvPaymentTiming">
              <span>
                Payment Option
              </span>

              <div>
                <button
                  type="button"
                  className={
                    (booking.paymentTiming || "pay_later") ===
                    "pay_later"
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    changeBooking({
                      paymentTiming:
                        "pay_later",
                    });
                  }}
                >
                  Pay Later
                  <small>
                    Ride complete hone ke baad Online / Cash
                  </small>
                </button>

                <button
                  type="button"
                  className={
                    booking.paymentTiming ===
                    "pay_now"
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    changeBooking({
                      paymentTiming:
                        "pay_now",
                    });
                  }}
                >
                  Pay Now
                  <small>
                    Final fare lock hote hi Online only
                  </small>
                </button>
              </div>
            </div>

            <label>
              Note

              <textarea
                value={
                  booking.note ||
                  ""
                }
                placeholder="Landmark, luggage, special instructions..."
                onChange={(
                  event
                ) => {
                  changeBooking({
                    note:
                      event
                        .target
                        .value,
                  });
                }}
              />
            </label>

            <div className="cvFare">
              <span>
                Distance

                <strong>
                  {mapData.distance
                    ? `${mapData.distance} km`
                    : "—"}
                </strong>
              </span>

              <span>
                Est. Time

                <strong>
                  {mapData.duration
                    ? `${Math.max(
                        1,
                        Math.round(
                          mapData.duration
                        )
                      )} min`
                    : "—"}
                </strong>
              </span>

              <span>
                Fare

                <strong>
                  Driver offer karega
                </strong>
              </span>
            </div>

            <button
              type="submit"
              className="cvBookSubmit"
              disabled={Boolean(
                activeRide
              )}
            >
              {activeRide
                ? "Active ride already exists"
                : "Book Ride →"}
            </button>
          </form>

          <div className="cvBookingMap">
            <RideMap
              onLocationChange={
                setMapData
              }
              onAddressChange={
                handleAddressChange
              }
              pickupAddress={
                booking.pickup
              }
              dropAddress={
                booking.dropoff
              }
              pickupCoordinates={
                mapData.pickup
              }
              dropCoordinates={
                mapData.drop
              }
              driverLocation={
                driverLocation
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default CustomerBookRide;