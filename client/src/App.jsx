import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import api from "./api";
import socket from "./socket";

import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import CustomerLoginPage from "./pages/CustomerLoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import GoogleBasicInfo from "./pages/GoogleBasicInfo";
import CustomerDashboard from "./pages/CustomerDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import DriverOnboarding from "./pages/DriverOnboarding";
import AdminDashboard from "./pages/AdminDashboard";

import "./styles.css";
import "./hero.css";

/*
|--------------------------------------------------------------------------
| Default Data
|--------------------------------------------------------------------------
*/

const emptyBooking = {
  pickup: "",
  dropoff: "",
  passengers: 1,
  customerPhone: "",
  note: ""
};

const emptyMapData = {
  pickup: null,
  drop: null,
  distance: 0,
  estimatedFare: 0
};

const emptyDriverStatus = {
  isOnline: false,
  isAvailable: false,
  loading: false
};

/*
|--------------------------------------------------------------------------
| Response Helpers
|--------------------------------------------------------------------------
*/

function getErrorMessage(
  error,
  fallbackMessage
) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
}

function getBookingsFromResponse(data) {
  const possibleBookings = [
    data?.bookings,
    data?.rides,
    data?.data?.bookings,
    data?.data?.rides,
    data?.data
  ];

  const bookings =
    possibleBookings.find(
      Array.isArray
    );

  return bookings || [];
}

function getBookingFromResponse(data) {
  return (
    data?.booking ||
    data?.ride ||
    data?.data?.booking ||
    data?.data?.ride ||
    (
      data?.data?._id
        ? data.data
        : null
    )
  );
}

function getDriverFromResponse(data) {
  return (
    data?.driver ||
    data?.data?.driver ||
    data?.data ||
    null
  );
}

function getId(value) {
  if (!value) {
    return "";
  }

  if (
    typeof value ===
    "object"
  ) {
    return String(
      value._id ||
        value.id ||
        ""
    );
  }

  return String(value);
}

/*
|--------------------------------------------------------------------------
| Public URL Routing
|--------------------------------------------------------------------------
| Customer, Driver aur Admin login pages ab public URL se separate hain.
| App React Router dependency ke bina history API use karta hai taaki
| existing project structure preserve rahe.
*/

function getPublicPageFromLocation() {
  const path = String(window.location.pathname || "/").toLowerCase();
  const routeHint = new URLSearchParams(window.location.search).get("route");

  if (routeHint === "adminlogin" || path.startsWith("/adminlogin")) {
    return "adminAuth";
  }

  if (routeHint === "driverlogin" || path.startsWith("/driverlogin")) {
    return "driverAuth";
  }

  if (routeHint === "login" || path.startsWith("/login")) {
    return "customerAuth";
  }

  return "home";
}

function publicPathForPage(page) {
  if (page === "adminAuth") return "/adminlogin/";
  if (page === "driverAuth") return "/driverlogin/";
  if (page === "customerAuth") return "/login/";
  return "/";
}

function App() {
  const notificationTimer =
    useRef(null);

  const [
    user,
    setUser
  ] =
    useState(() => {
      const savedUser =
        sessionStorage.getItem(
          "himrideg_user"
        );

      if (!savedUser) {
        return null;
      }

      try {
        return JSON.parse(
          savedUser
        );
      } catch {
        sessionStorage.removeItem(
          "himrideg_user"
        );

        return null;
      }
    });

  const [
    page,
    setPage
  ] =
    useState(() => {
      const savedUser =
        sessionStorage.getItem(
          "himrideg_user"
        );

      if (!savedUser) {
        return getPublicPageFromLocation();
      }

      try {
        const parsedUser =
          JSON.parse(
            savedUser
          );

        return parsedUser
          ?.needsBasicInfo
          ? "basicInfo"
          : "dashboard";
      } catch {
        return getPublicPageFromLocation();
      }
    });

  const [
    authMode,
    setAuthMode
  ] =
    useState(
      "register"
    );

  /*
  |-----------------------------------------------------------------------
  | Browser URL Sync For Public Login Pages
  |-----------------------------------------------------------------------
  */

  useEffect(() => {
    const routeHint = new URLSearchParams(window.location.search).get("route");

    if (!user && routeHint) {
      const resolvedPage = getPublicPageFromLocation();
      setPage(resolvedPage);
      window.history.replaceState({}, "", publicPathForPage(resolvedPage));
    }

    const handlePopState = () => {
      if (user) return;
      setPage(getPublicPageFromLocation());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [user]);

  const [
    booking,
    setBooking
  ] =
    useState(
      emptyBooking
    );

  const [
    bookings,
    setBookings
  ] =
    useState([]);

  const [
    mapData,
    setMapData
  ] =
    useState(
      emptyMapData
    );

  const [
    drivers,
    setDrivers
  ] =
    useState([]);

  const [
    customers,
    setCustomers
  ] =
    useState([]);

  const [
    stats,
    setStats
  ] =
    useState(null);

  const [
    message,
    setMessage
  ] =
    useState("");

  const [
    driverStatus,
    setDriverStatus
  ] =
    useState(
      emptyDriverStatus
    );

  /*
  | Driver approval gate - jab tak approve nahi hota,
  | onboarding screen dikhegi
  */
  const [
    driverApproved,
    setDriverApproved
  ] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | Notification
  |--------------------------------------------------------------------------
  */

  const notify =
    useCallback(
      (text) => {
        const cleanMessage =
          String(
            text ||
              ""
          ).trim();

        if (
          !cleanMessage
        ) {
          return;
        }

        setMessage(
          cleanMessage
        );

        if (
          notificationTimer
            .current
        ) {
          window.clearTimeout(
            notificationTimer
              .current
          );
        }

        notificationTimer.current =
          window.setTimeout(
            () => {
              setMessage("");
            },
            4500
          );
      },
      []
    );

  useEffect(() => {
    return () => {
      if (
        notificationTimer
          .current
      ) {
        window.clearTimeout(
          notificationTimer
            .current
        );
      }
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Unauthorized Session Handler
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleUnauthorized =
      () => {
        let expiredRole = "customer";

        try {
          const storedUser = JSON.parse(
            sessionStorage.getItem("himrideg_user") || "null"
          );
          expiredRole = storedUser?.role || "customer";
        } catch {
          expiredRole = "customer";
        }

        sessionStorage.removeItem(
          "himrideg_token"
        );

        sessionStorage.removeItem(
          "himrideg_user"
        );

        sessionStorage.removeItem(
          "himrideg_role"
        );

        sessionStorage.removeItem(
          "accessToken"
        );

        sessionStorage.removeItem(
          "token"
        );

        if (
          socket.connected
        ) {
          socket.disconnect();
        }

        setUser(null);
        setBookings([]);
        setDrivers([]);
        setStats(null);

        setBooking(
          emptyBooking
        );

        setMapData(
          emptyMapData
        );

        setDriverStatus(
          emptyDriverStatus
        );

        setDriverApproved(null);

        setAuthMode(
          "login"
        );

        const expiredPage =
          expiredRole === "admin"
            ? "adminAuth"
            : expiredRole === "driver"
              ? "driverAuth"
              : "customerAuth";

        setPage(expiredPage);
        window.history.replaceState(
          {},
          "",
          publicPathForPage(expiredPage)
        );

        notify(
          "Session expire ho gayi. Dobara login karo."
        );
      };

    window.addEventListener(
      "himrideg:unauthorized",
      handleUnauthorized
    );

    return () => {
      window.removeEventListener(
        "himrideg:unauthorized",
        handleUnauthorized
      );
    };
  }, [
    notify
  ]);

  /*
  |--------------------------------------------------------------------------
  | Sound
  |--------------------------------------------------------------------------
  */

  const playNotificationSound =
    useCallback(
      () => {
        try {
          const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

          if (
            !AudioContextClass
          ) {
            return;
          }

          const audioContext =
            new AudioContextClass();

          const oscillator =
            audioContext
              .createOscillator();

          const gainNode =
            audioContext
              .createGain();

          oscillator.type =
            "sine";

          oscillator
            .frequency
            .setValueAtTime(
              880,
              audioContext
                .currentTime
            );

          gainNode
            .gain
            .setValueAtTime(
              0.0001,
              audioContext
                .currentTime
            );

          gainNode
            .gain
            .exponentialRampToValueAtTime(
              0.2,
              audioContext
                .currentTime +
                0.02
            );

          gainNode
            .gain
            .exponentialRampToValueAtTime(
              0.0001,
              audioContext
                .currentTime +
                0.45
            );

          oscillator.connect(
            gainNode
          );

          gainNode.connect(
            audioContext
              .destination
          );

          oscillator.start();

          oscillator.stop(
            audioContext
              .currentTime +
              0.5
          );

          oscillator.onended =
            () => {
              audioContext
                .close();
            };
        } catch (error) {
          console.log(
            "Notification sound error:",
            error
          );
        }
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Browser Notification
  |--------------------------------------------------------------------------
  */

  const showBrowserNotification =
    useCallback(
      (text) => {
        if (
          !(
            "Notification" in
            window
          )
        ) {
          return;
        }

        if (
          Notification
            .permission ===
          "granted"
        ) {
          new Notification(
            "HimRideG",
            {
              body:
                text,

              icon:
                "/himrideg-logo.png"
            }
          );

          return;
        }

        if (
          Notification
            .permission ===
          "default"
        ) {
          Notification
            .requestPermission();
        }
      },
      []
    );

  const realtimeNotify =
    useCallback(
      (
        text,
        shouldPlaySound =
          true
      ) => {
        notify(
          text
        );

        if (
          shouldPlaySound
        ) {
          playNotificationSound();
        }

        showBrowserNotification(
          text
        );
      },
      [
        notify,
        playNotificationSound,
        showBrowserNotification
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const navigatePublic =
    (nextPage, path, { replace = false } = {}) => {
      setPage(nextPage);

      const method = replace ? "replaceState" : "pushState";
      window.history[method]({}, "", path);
    };

  const openCustomerLogin =
    () => {
      setAuthMode("login");
      navigatePublic("customerAuth", "/login/");
    };

  const openCustomerRegister =
    () => {
      setAuthMode("register");
      navigatePublic("customerAuth", "/login/");
    };

  const openDriverLogin =
    () => {
      setAuthMode("login");
      navigatePublic("driverAuth", "/driverlogin/");
    };

  const openAdminLogin =
    () => {
      setAuthMode("login");
      navigatePublic("adminAuth", "/adminlogin/");
    };

  const goHome =
    () => {
      navigatePublic("home", "/");
    };

  /*
  |--------------------------------------------------------------------------
  | Authentication Success
  |--------------------------------------------------------------------------
  */

  const handleAuthSuccess =
    async (data) => {
      const token =
        data?.token ||
        data?.accessToken ||
        data?.data?.token ||
        data?.data
          ?.accessToken;

      const authenticatedUser =
        data?.user ||
        data?.data?.user;

      if (
        !token ||
        !authenticatedUser
      ) {
        notify(
          "Login response me token ya user nahi mila"
        );

        return;
      }

      sessionStorage.setItem(
        "himrideg_token",

        String(token)
          .replace(
            /^Bearer\s+/i,
            ""
          )
      );

      sessionStorage.setItem(
        "himrideg_user",

        JSON.stringify(
          authenticatedUser
        )
      );

      setUser(
        authenticatedUser
      );

      const requiresBasicInfo =
        Boolean(
          data?.requiresBasicInfo ||
          data?.data
            ?.requiresBasicInfo ||
          authenticatedUser
            ?.needsBasicInfo
        );

      if (
        requiresBasicInfo
      ) {
        setPage(
          "basicInfo"
        );

        if (authenticatedUser?.role === "customer") {
          window.history.replaceState({}, "", "/login/");
        }

        localStorage.removeItem(
          "himrideg_auth_account_type"
        );

        return;
      }

      setPage(
        "dashboard"
      );

      window.history.replaceState({}, "", "/");

      if (
        "Notification" in
          window &&
        Notification
          .permission ===
          "default"
      ) {
        Notification
          .requestPermission();
      }

      if (
        authenticatedUser
          .role !==
        "customer"
      ) {
        localStorage.removeItem(
          "himrideg_auth_account_type"
        );

        return;
      }

      let pendingBooking =
        null;

      try {
        const savedBooking =
          localStorage.getItem(
            "himrideg_pending_booking"
          );

        if (
          savedBooking
        ) {
          pendingBooking =
            JSON.parse(
              savedBooking
            );
        }
      } catch (error) {
        console.error(
          "Saved booking read error:",
          error
        );
      }

      if (
        !pendingBooking
      ) {
        localStorage.removeItem(
          "himrideg_auth_account_type"
        );

        return;
      }

      const pickup =
        pendingBooking
          .pickup;

      const dropoff =
        pendingBooking
          .dropoff;

      const pickupAddress =
        typeof pickup ===
          "object"
          ? pickup?.address
          : pickup;

      const dropoffAddress =
        typeof dropoff ===
          "object"
          ? dropoff?.address
          : dropoff;

      const pickupLatitude =
        Number(
          pickup?.latitude
        );

      const pickupLongitude =
        Number(
          pickup?.longitude
        );

      const dropLatitude =
        Number(
          dropoff?.latitude
        );

      const dropLongitude =
        Number(
          dropoff?.longitude
        );

      const validLocations =
        pickupAddress &&
        dropoffAddress &&
        Number.isFinite(
          pickupLatitude
        ) &&
        Number.isFinite(
          pickupLongitude
        ) &&
        Number.isFinite(
          dropLatitude
        ) &&
        Number.isFinite(
          dropLongitude
        );

      if (
        !validLocations
      ) {
        notify(
          "Saved booking ki location dobara select karo"
        );

        return;
      }

      let travelDate =
        new Date()
          .toISOString();

      if (
        pendingBooking
          .time
      ) {
        const selectedDate =
          new Date(
            pendingBooking
              .time
          );

        if (
          !Number.isNaN(
            selectedDate
              .getTime()
          )
        ) {
          travelDate =
            selectedDate
              .toISOString();
        }
      }

      const bookingPayload = {
        pickup:
          String(
            pickupAddress
          ).trim(),

        dropoff:
          String(
            dropoffAddress
          ).trim(),

        passengers:
          Number(
            pendingBooking
              .passengers
          ) || 1,

        customerPhone:
          String(
            authenticatedUser
              .phone ||
              pendingBooking
                .customerPhone ||
              ""
          ).trim(),

        note:
          String(
            pendingBooking
              .note ||
              ""
          ).trim(),

        travelDate,

        pickupCoordinates: {
          latitude:
            pickupLatitude,

          longitude:
            pickupLongitude
        },

        dropCoordinates: {
          latitude:
            dropLatitude,

          longitude:
            dropLongitude
        },

        distance:
          Number(
            pendingBooking
              .distance
          ) || 0,

        estimatedFare:
          Number(
            pendingBooking
              .estimatedFare
          ) || 0,

        vehicleType:
          pendingBooking
            .vehicleType ||
          "sedan"
      };

      if (
        !bookingPayload
          .customerPhone
      ) {
        setBooking({
          pickup:
            bookingPayload
              .pickup,

          dropoff:
            bookingPayload
              .dropoff,

          passengers:
            bookingPayload
              .passengers,

          customerPhone:
            "",

          note:
            bookingPayload
              .note
        });

        setMapData({
          pickup: [
            pickupLatitude,
            pickupLongitude
          ],

          drop: [
            dropLatitude,
            dropLongitude
          ],

          distance:
            bookingPayload
              .distance,

          estimatedFare:
            bookingPayload
              .estimatedFare
        });

        notify(
          "Booking continue karne ke liye phone number bharo"
        );

        return;
      }

      try {
        notify(
          "Saved booking confirm ho rahi hai..."
        );

        const {
          data:
            rideData
        } =
          await api.post(
            "/rides",
            bookingPayload
          );

        const createdRide =
          getBookingFromResponse(
            rideData
          );

        if (
          createdRide
        ) {
          setBookings(
            (
              currentBookings
            ) => [
              createdRide,

              ...currentBookings
                .filter(
                  (ride) =>
                    getId(
                      ride
                    ) !==
                    getId(
                      createdRide
                    )
                )
            ]
          );
        }

        localStorage.removeItem(
          "himrideg_pending_booking"
        );

        localStorage.removeItem(
          "himrideg_auth_account_type"
        );

        setBooking(
          emptyBooking
        );

        setMapData(
          emptyMapData
        );

        notify(
          rideData?.message ||
            "Ride successfully book ho gayi"
        );
      } catch (error) {
        setBooking({
          pickup:
            bookingPayload
              .pickup,

          dropoff:
            bookingPayload
              .dropoff,

          passengers:
            bookingPayload
              .passengers,

          customerPhone:
            bookingPayload
              .customerPhone,

          note:
            bookingPayload
              .note
        });

        setMapData({
          pickup: [
            pickupLatitude,
            pickupLongitude
          ],

          drop: [
            dropLatitude,
            dropLongitude
          ],

          distance:
            bookingPayload
              .distance,

          estimatedFare:
            bookingPayload
              .estimatedFare
        });

        notify(
          getErrorMessage(
            error,
            "Login ho gaya, lekin saved ride book nahi hui. Booking details safe hain."
          )
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Google Basic Info Completed
  |--------------------------------------------------------------------------
  |
  | Basic Info page ke baad same authenticated session continue hota hai.
  | handleAuthSuccess dobara use karne se saved booking resume logic aur
  | role-based dashboard navigation existing behavior me hi rehti hai.
  |
  */

  const handleGoogleBasicInfoComplete =
    async (
      updatedUser
    ) => {
      const accessToken =
        sessionStorage.getItem(
          "himrideg_token"
        ) ||
        sessionStorage.getItem(
          "accessToken"
        ) ||
        sessionStorage.getItem(
          "token"
        ) ||
        "";

      if (
        !accessToken ||
        !updatedUser
      ) {
        notify(
          "Basic info save hui, lekin session continue nahi ho paya. Dobara login karo."
        );

        setUser(null);
        setPage("auth");
        return;
      }

      await handleAuthSuccess({
        accessToken,
        user: {
          ...updatedUser,
          needsBasicInfo: false
        },
        provider: "google",
        requiresBasicInfo: false
      });
    };

  /*
  |--------------------------------------------------------------------------
  | Update One Ride In State
  |--------------------------------------------------------------------------
  */

  const updateRideInState =
    useCallback(
      (
        updatedRide
      ) => {
        if (
          !updatedRide?._id
        ) {
          return;
        }

        setBookings(
          (
            currentBookings
          ) => {
            const exists =
              currentBookings
                .some(
                  (ride) =>
                    getId(
                      ride
                    ) ===
                    getId(
                      updatedRide
                    )
                );

            if (
              !exists
            ) {
              return [
                updatedRide,
                ...currentBookings
              ];
            }

            return currentBookings
              .map(
                (ride) =>
                  getId(
                    ride
                  ) ===
                  getId(
                    updatedRide
                  )
                    ? {
                        ...ride,
                        ...updatedRide
                      }
                    : ride
              );
          }
        );
      },
      []
    );

  /*
  |--------------------------------------------------------------------------
  | Load Rides
  |--------------------------------------------------------------------------
  */

  const loadBookings =
    useCallback(
      async () => {
        if (
          !user
        ) {
          return;
        }

        try {
          const endpoint =
            user.role ===
            "admin"
              ? "/rides"
              : user.role ===
                "driver"
                ? "/rides/driver/feed"
                : "/rides/mine";

          const {
            data
          } =
            await api.get(
              endpoint
            );

          setBookings(
            getBookingsFromResponse(
              data
            )
          );
        } catch (error) {
          console.error(
            "Ride loading error:",
            error
          );

          notify(
            getErrorMessage(
              error,
              "Rides load nahi hui"
            )
          );
        }
      },
      [
        notify,
        user
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Driver Status
  |--------------------------------------------------------------------------
  */

  const updateDriverOnlineStatus =
    useCallback(
      async (
        isOnline,
        showMessage =
          true
      ) => {
        if (
          user?.role !==
          "driver"
        ) {
          return null;
        }

        setDriverStatus(
          (current) => ({
            ...current,
            loading:
              true
          })
        );

        try {
          const endpoint =
            isOnline
              ? "/driver/go-online"
              : "/driver/go-offline";

          const {
            data
          } =
            await api.patch(
              endpoint
            );

          const driver =
            getDriverFromResponse(
              data
            );

          const updatedStatus = {
            isOnline:
              Boolean(
                driver
                  ?.isOnline ??
                  isOnline
              ),

            isAvailable:
              Boolean(
                driver
                  ?.isAvailable
              ),

            loading:
              false
          };

          setDriverStatus(
            updatedStatus
          );

          if (
            showMessage
          ) {
            notify(
              data?.message ||
                (
                  isOnline
                    ? "Driver online hai"
                    : "Driver offline hai"
                )
            );
          }

          return updatedStatus;
        } catch (error) {
          setDriverStatus(
            (current) => ({
              ...current,
              loading:
                false
            })
          );

          if (
            showMessage
          ) {
            notify(
              getErrorMessage(
                error,
                "Driver status update nahi hua"
              )
            );
          }

          return null;
        }
      },
      [
        notify,
        user
      ]
    );

  const loadDriverProfile =
    useCallback(
      async () => {
        if (
          user?.role !==
          "driver"
        ) {
          return;
        }

        try {
          const {
            data
          } =
            await api.get(
              "/driver/profile"
            );

          const driver =
            getDriverFromResponse(
              data
            );

          /*
          |------------------------------------------------------------------
          | Fresh Driver Snapshot -> Auth State
          |------------------------------------------------------------------
          | Login token me driver ka purana snapshot ho sakta hai. Admin jab
          | documents verify karta hai, /driver/profile MongoDB ka latest
          | driver return karta hai. Pehle yahan sirf online status uthaya ja
          | raha tha, isliye DriverDashboard ko stale documents milte the aur
          | 0/5 uploaded dikhta tha. Ab latest profile + documents + approval
          | authenticated user state aur sessionStorage dono me sync honge.
          */

          if (driver) {
            setUser((currentUser) => {
              if (
                !currentUser ||
                currentUser.role !== "driver"
              ) {
                return currentUser;
              }

              const mergedDriver = {
                ...currentUser,
                ...driver,
                driverProfile: {
                  ...(currentUser.driverProfile || {}),
                  ...(driver.driverProfile || {}),
                  documents: Array.isArray(
                    driver?.driverProfile?.documents
                  )
                    ? driver.driverProfile.documents
                    : (
                        currentUser?.driverProfile?.documents ||
                        []
                      )
                }
              };

              /*
              | React state ko same server snapshot par baar-baar replace na
              | karo. Isse profile refresh loop avoid hota hai.
              */
              try {
                if (
                  JSON.stringify(currentUser) ===
                  JSON.stringify(mergedDriver)
                ) {
                  return currentUser;
                }
              } catch (_) {
                // Safe fallback: merged snapshot use karo.
              }

              try {
                sessionStorage.setItem(
                  "himrideg_user",
                  JSON.stringify(mergedDriver)
                );
              } catch (_) {}

              return mergedDriver;
            });

            setDriverApproved(
              Boolean(
                driver?.approved ||
                driver?.isApproved ||
                driver?.driverProfile?.isApproved
              )
            );
          }

          setDriverStatus({
            isOnline:
              Boolean(
                driver
                  ?.isOnline
              ),

            isAvailable:
              Boolean(
                driver
                  ?.isAvailable
              ),

            loading:
              false
          });
        } catch (error) {
          console.error(
            "Driver profile load error:",
            error
          );
        }
      },
      [
        user
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Admin Data
  |--------------------------------------------------------------------------
  */

  const loadAdminData =
    useCallback(
      async () => {
        if (
          user?.role !==
          "admin"
        ) {
          return;
        }

        /*
        | allSettled use karo taaki ek API fail hone par
        | baaki data bhi load ho jaye
        */
        const [
          driverResult,
          statsResult,
          customerResult
        ] =
          await Promise
            .allSettled([
              api.get(
                "/admin/drivers"
              ),

              api.get(
                "/admin/dashboard"
              ),

              api.get(
                "/admin/customers"
              )
            ]);

        if (
          driverResult.status ===
          "fulfilled"
        ) {
          setDrivers(
            driverResult
              .value
              .data
              ?.drivers ||
              driverResult
                .value
                .data
                ?.data
                ?.drivers ||
              []
          );
        } else {
          notify(
            getErrorMessage(
              driverResult.reason,
              "Drivers load nahi hue"
            )
          );
        }

        if (
          statsResult.status ===
          "fulfilled"
        ) {
          setStats(
            statsResult
              .value
              .data
              ?.data ||
              statsResult
                .value
                .data ||
              null
          );
        }

        if (
          customerResult.status ===
          "fulfilled"
        ) {
          setCustomers(
            customerResult
              .value
              .data
              ?.data
              ?.customers ||
              customerResult
                .value
                .data
                ?.customers ||
              []
          );
        } else {
          /*
          | Customer route abhi server par nahi hai -
          | chup-chaap skip karo, baaki dashboard chalta rahe
          */
          console.warn(
            "Customers load nahi hue:",
            customerResult.reason
              ?.message
          );

          setCustomers([]);
        }
      },
      [
        notify,
        user
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | Driver Approval Check
  |--------------------------------------------------------------------------
  | Login ke turant baad check karo ki driver approved hai ya nahi.
  | Approved nahi hai toh onboarding screen dikhegi.
  */

  const checkDriverApproval =
    useCallback(async () => {
      if (
        user?.role !== "driver"
      ) {
        return;
      }

      try {
        const { data } =
          await api.get(
            "/driver/onboarding"
          );

        setDriverApproved(
          Boolean(
            data?.data
              ?.onboarding
              ?.isApproved
          )
        );
      } catch (error) {
        console.error(
          "Driver approval check error:",
          error
        );

        setDriverApproved(false);
      }
    }, [user]);

  useEffect(() => {
    if (
      user?.role === "driver"
    ) {
      checkDriverApproval();
    }
  }, [
    checkDriverApproval,
    user
  ]);

  /*
  | Stable callback - inline arrow function pass karne se
  | child component infinite re-render loop mein chala jata hai
  */
  const handleDriverApproved =
    useCallback(() => {
      setDriverApproved(true);
    }, []);

  /*
  |--------------------------------------------------------------------------
  | Initial Data
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !user
    ) {
      return undefined;
    }

    loadBookings();

    if (
      user.role ===
      "admin"
    ) {
      loadAdminData();
    }

    if (
      user.role ===
      "driver"
    ) {
      loadDriverProfile();
    }

    const refreshTimer =
      window.setInterval(
        () => {
          loadBookings();

          if (
            user.role ===
            "driver"
          ) {
            loadDriverProfile();
          }
        },
        30000
      );

    return () => {
      window.clearInterval(
        refreshTimer
      );
    };
  }, [
    loadAdminData,
    loadBookings,
    loadDriverProfile,
    user
  ]);

  /*
  |--------------------------------------------------------------------------
  | Socket.IO
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      !user
    ) {
      return undefined;
    }

    const token =
      sessionStorage.getItem(
        "himrideg_token"
      );

    if (
      !token
    ) {
      return undefined;
    }

    /*
    | socket.js ab khud har connection par
    | sessionStorage se taaza token uthata hai,
    | isliye yahan manually set karne ki zaroorat nahi.
    */

    const handleConnect =
      async () => {
        console.log(
          "Socket connected:",
          socket.id
        );

        if (
          user.role ===
          "driver"
        ) {
          await updateDriverOnlineStatus(
            true,
            false
          );
        }
      };

    const handleConnectError =
      (error) => {
        console.error(
          "Socket connection error:",
          error.message
        );
      };

    const handleRideRequest =
      (payload) => {
        if (
          user.role !==
          "driver"
        ) {
          return;
        }

        const updatedRide =
          getBookingFromResponse(
            payload
          );

        if (
          updatedRide
        ) {
          updateRideInState(
            updatedRide
          );
        }

        realtimeNotify(
          payload?.message ||
            "Nayi ride request aayi hai.",

          payload
            ?.playSound !==
            false
        );

        loadBookings();
      };

    const handleRideStatus =
      (payload) => {
        const updatedRide =
          getBookingFromResponse(
            payload
          );

        if (
          updatedRide
        ) {
          updateRideInState(
            updatedRide
          );
        }

        if (
          user.role ===
          "customer"
        ) {
          realtimeNotify(
            payload?.message ||
              "Ride status update hua hai.",

            payload
              ?.playSound ===
              true
          );
        }

        loadBookings();

        if (
          user.role ===
          "driver"
        ) {
          loadDriverProfile();
        }
      };

    const handleCashPaymentSelected =
      (payload) => {
        const bookingId =
          payload?.bookingId;

        if (!bookingId) {
          return;
        }

        setBookings(
          (currentBookings) =>
            currentBookings.map(
              (ride) =>
                getId(ride) === getId(bookingId)
                  ? {
                      ...ride,
                      paymentMethod: "cash",
                      paymentStatus: "pending",
                      paymentChoiceAfterRide: "cash",
                      cashSelectedAt:
                        payload?.cashSelectedAt ||
                        new Date().toISOString()
                    }
                  : ride
            )
        );

        if (user.role === "driver") {
          realtimeNotify(
            payload?.message ||
              `Customer ne ₹${Number(payload?.fare || 0).toFixed(0)} cash payment select ki hai.`,
            true
          );
        }

        loadBookings();
      };

    /*
    |------------------------------------------------------------------
    | Driver approval status — realtime update karo user state mein
    |------------------------------------------------------------------
    */

    const handleDriverApproved = () => {
      setUser(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          isApproved: true,
          approved: true,
          accountStatus: "active",
          driverProfile: {
            ...(prev.driverProfile || {}),
            isApproved: true,
            approvalStatus: "approved"
          }
        };
        try {
          sessionStorage.setItem("himrideg_user", JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
    };

    const handleDocumentStatusUpdated = (payload) => {
      if (!payload?.documentId) return;
      setUser(prev => {
        if (!prev) return prev;
        const docs = Array.isArray(prev.driverProfile?.documents)
          ? prev.driverProfile.documents
          : [];
        const updatedDocs = docs.map(doc =>
          String(doc._id) === String(payload.documentId)
            ? { ...doc, verificationStatus: payload.verificationStatus, rejectionReason: payload.rejectionReason || "" }
            : doc
        );
        const updated = {
          ...prev,
          driverProfile: { ...(prev.driverProfile || {}), documents: updatedDocs }
        };
        try {
          sessionStorage.setItem("himrideg_user", JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
    };

    // NEW: Handle driver name verified/updated by admin
    const handleDriverNameUpdated = (payload) => {
      if (!payload?.legalName) return;
      setUser(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          driverProfile: {
            ...(prev.driverProfile || {}),
            legalName: payload.legalName,
            legalNameVerified: Boolean(payload.legalNameVerified)
          }
        };
        try {
          sessionStorage.setItem("himrideg_user", JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
    };

    const handleDriverRejected = (payload) => {
      setUser(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          isApproved: false,
          approved: false,
          driverProfile: {
            ...(prev.driverProfile || {}),
            isApproved: false,
            approvalStatus: "rejected",
            rejectionReason: payload?.reason || "Admin ne reject kiya."
          }
        };
        try {
          sessionStorage.setItem("himrideg_user", JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
    };

    const handleDriverBlocked = () => {
      setUser(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          accountStatus: "blocked",
          isActive: false
        };
        try {
          sessionStorage.setItem("himrideg_user", JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
    };

    const handleDriverSuspended = () => {
      setUser(prev => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          accountStatus: "suspended",
          driverProfile: {
            ...(prev.driverProfile || {}),
            isApproved: false,
            approvalStatus: "suspended"
          }
        };
        try {
          sessionStorage.setItem("himrideg_user", JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });
    };

    const handleLocationUpdated =
      (payload) => {
        if (
          user.role !==
          "customer"
        ) {
          return;
        }

        const bookingId =
          payload
            ?.bookingId;

        const driverLocation =
          payload
            ?.location ||
          payload
            ?.driverLocation;

        if (
          !bookingId ||
          !driverLocation
        ) {
          return;
        }

        setBookings(
          (
            currentBookings
          ) =>
            currentBookings
              .map(
                (ride) =>
                  getId(
                    ride
                  ) ===
                  getId(
                    bookingId
                  )
                    ? {
                        ...ride,
                        driverLocation
                      }
                    : ride
              )
        );
      };

    const handleSocketError =
      (payload) => {
        console.error(
          "Socket error:",
          payload
        );
      };

    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "connect_error",
      handleConnectError
    );

    socket.on(
      "socket:error",
      handleSocketError
    );

    socket.on(
      "ride:request",
      handleRideRequest
    );

    socket.on(
      "ride:request:cancelled",
      handleRideStatus
    );

    socket.on(
      "ride:accepted",
      handleRideStatus
    );

    socket.on(
      "ride:rejected",
      handleRideStatus
    );

    socket.on(
      "ride:driver-arriving",
      handleRideStatus
    );

    socket.on(
      "ride:driver-arrived",
      handleRideStatus
    );

    socket.on(
      "ride:otp-generated",
      handleRideStatus
    );

    socket.on(
      "ride:otp-verified",
      handleRideStatus
    );

    socket.on(
      "ride:started",
      handleRideStatus
    );

    socket.on(
      "ride:completed",
      handleRideStatus
    );

    socket.on(
      "ride:cancelled",
      handleRideStatus
    );

    socket.on(
      "ride:status-updated",
      handleRideStatus
    );

    socket.on(
      "payment:cash-selected",
      handleCashPaymentSelected
    );

    socket.on(
      "driver:location:updated",
      handleLocationUpdated
    );

    socket.on(
      "driver:approved",
      handleDriverApproved
    );

    socket.on(
      "document:status:updated",
      handleDocumentStatusUpdated
    );

    // NEW: Driver name updated by admin
    socket.on(
      "driver:name:updated",
      handleDriverNameUpdated
    );

    socket.on(
      "driver:rejected",
      handleDriverRejected
    );

    socket.on(
      "driver:blocked",
      handleDriverBlocked
    );

    socket.on(
      "driver:suspended",
      handleDriverSuspended
    );

    if (
      !socket.connected
    ) {
      socket.connect();
    }

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "connect_error",
        handleConnectError
      );

      socket.off(
        "socket:error",
        handleSocketError
      );

      socket.off(
        "ride:request",
        handleRideRequest
      );

      socket.off(
        "ride:request:cancelled",
        handleRideStatus
      );

      socket.off(
        "ride:accepted",
        handleRideStatus
      );

      socket.off(
        "ride:rejected",
        handleRideStatus
      );

      socket.off(
        "ride:driver-arriving",
        handleRideStatus
      );

      socket.off(
        "ride:driver-arrived",
        handleRideStatus
      );

      socket.off(
        "ride:otp-generated",
        handleRideStatus
      );

      socket.off(
        "ride:otp-verified",
        handleRideStatus
      );

      socket.off(
        "ride:started",
        handleRideStatus
      );

      socket.off(
        "ride:completed",
        handleRideStatus
      );

      socket.off(
        "ride:cancelled",
        handleRideStatus
      );

      socket.off(
        "ride:status-updated",
        handleRideStatus
      );

      socket.off(
        "payment:cash-selected",
        handleCashPaymentSelected
      );

      socket.off(
        "driver:location:updated",
        handleLocationUpdated
      );

      socket.off(
        "driver:approved",
        handleDriverApproved
      );

      socket.off(
        "document:status:updated",
        handleDocumentStatusUpdated
      );

      // NEW: cleanup
      socket.off(
        "driver:name:updated",
        handleDriverNameUpdated
      );

      socket.off(
        "driver:rejected",
        handleDriverRejected
      );

      socket.off(
        "driver:blocked",
        handleDriverBlocked
      );

      socket.off(
        "driver:suspended",
        handleDriverSuspended
      );
    };
  }, [
    loadBookings,
    loadDriverProfile,
    realtimeNotify,
    updateDriverOnlineStatus,
    updateRideInState,
    user
  ]);

  /*
  |--------------------------------------------------------------------------
  | Create Ride
  |--------------------------------------------------------------------------
  */

  const createBooking =
    async (event) => {
      event.preventDefault();

      if (
        !booking
          .pickup
          .trim() ||
        !booking
          .dropoff
          .trim()
      ) {
        notify(
          "Pickup aur drop location bharo"
        );

        return;
      }

      if (
        !booking
          .customerPhone
          .trim()
      ) {
        notify(
          "Phone number bharo"
        );

        return;
      }

      if (
        !mapData.pickup ||
        !mapData.drop
      ) {
        notify(
          "Pehle map par pickup aur drop select karo"
        );

        return;
      }

      const bookingPayload = {
        pickup:
          booking
            .pickup
            .trim(),

        dropoff:
          booking
            .dropoff
            .trim(),

        passengers:
          Number(
            booking
              .passengers
          ) || 1,

        customerPhone:
          booking
            .customerPhone
            .trim(),

        note:
          booking
            .note
            ?.trim() ||
          "",

        travelDate:
          new Date()
            .toISOString(),

        pickupCoordinates: {
          latitude:
            Number(
              mapData
                .pickup[0]
            ),

          longitude:
            Number(
              mapData
                .pickup[1]
            )
        },

        dropCoordinates: {
          latitude:
            Number(
              mapData
                .drop[0]
            ),

          longitude:
            Number(
              mapData
                .drop[1]
            )
        },

        distance:
          Number(
            mapData
              .distance
          ) || 0,

        estimatedFare:
          Number(
            mapData
              .estimatedFare
          ) || 0
      };

      try {
        const {
          data
        } =
          await api.post(
            "/rides",
            bookingPayload
          );

        const createdRide =
          getBookingFromResponse(
            data
          );

        if (
          createdRide
        ) {
          updateRideInState(
            createdRide
          );
        }

        notify(
          data?.message ||
            "Ride successfully book ho gayi"
        );

        setBooking(
          emptyBooking
        );

        setMapData(
          emptyMapData
        );

        await loadBookings();

        /*
        |--------------------------------------------------------------------------
        | Booking Success -> Customer Main Dashboard
        |--------------------------------------------------------------------------
        |
        | Ride successfully create hone ke baad hamesha customer ko main
        | dashboard par rakho. Return value CustomerDashboard ko batata hai ki
        | booking successful hui, taaki booking modal turant close ho sake.
        |
        */
        setPage(
          "dashboard"
        );

        return (
          createdRide ||
          {
            success: true
          }
        );
      } catch (error) {
        notify(
          getErrorMessage(
            error,
            "Ride book nahi hui"
          )
        );

        return null;
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Generic Ride Action
  |--------------------------------------------------------------------------
  */

  const updateBooking =
    async (
      id,
      status,
      extraData = {}
    ) => {
      if (
        !id ||
        !status
      ) {
        notify(
          "Ride ID ya status missing hai"
        );

        return null;
      }

      const actionMap = {
        accepted: {
          method:
            "patch",

          url:
            `/rides/${id}/accept`
        },

        rejected: {
          method:
            "patch",

          url:
            `/rides/${id}/reject`
        },

        driver_arriving: {
          method:
            "patch",

          url:
            `/rides/${id}/arriving`
        },

        driver_arrived: {
          method:
            "patch",

          url:
            `/rides/${id}/arrived`
        },

        started: {
          method:
            "patch",

          url:
            `/rides/${id}/start`
        },

        completed: {
          method:
            "patch",

          url:
            `/rides/${id}/complete`
        },

        cancelled: {
          method:
            "patch",

          url:
            `/rides/${id}/cancel`
        }
      };

      const action =
        actionMap[
          status
        ];

      if (
        !action
      ) {
        notify(
          `Unsupported ride status: ${status}`
        );

        return null;
      }

      try {
        const {
          data
        } =
          await api.request({
            method:
              action
                .method,

            url:
              action
                .url,

            data:
              extraData
          });

        const updatedRide =
          getBookingFromResponse(
            data
          );

        if (
          updatedRide
        ) {
          updateRideInState(
            updatedRide
          );
        }

        notify(
          data?.message ||
            "Ride update ho gayi"
        );

        await loadBookings();

        if (
          user?.role ===
          "driver"
        ) {
          await loadDriverProfile();
        }

        return updatedRide;
      } catch (error) {
        notify(
          getErrorMessage(
            error,
            "Ride update nahi hui"
          )
        );

        return null;
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Admin Driver Action
  |--------------------------------------------------------------------------
  */

  const updateDriver =
    async (
      id,
      action
    ) => {
      try {
        const {
          data
        } =
          await api.patch(
            `/admin/drivers/${id}/${action}`
          );

        notify(
          data?.message ||
            "Driver update ho gaya"
        );

        await loadAdminData();
      } catch (error) {
        notify(
          getErrorMessage(
            error,
            "Driver update nahi hua"
          )
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Admin Customer Action
  |--------------------------------------------------------------------------
  */

  const updateCustomer =
    async (
      id,
      action,
      reason = ""
    ) => {
      try {
        const {
          data
        } =
          await api.patch(
            `/admin/customers/${id}/${action}`,
            { reason }
          );

        notify(
          data?.message ||
            "Customer update ho gaya"
        );

        await loadAdminData();
      } catch (error) {
        notify(
          getErrorMessage(
            error,
            "Customer update nahi hua"
          )
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const logout =
    async () => {
      if (
        user?.role ===
        "driver"
      ) {
        try {
          await api.patch(
            "/driver/go-offline"
          );
        } catch (error) {
          console.log(
            "Driver offline error:",
            error
          );
        }
      }

      if (
        socket.connected
      ) {
        socket.disconnect();
      }

      sessionStorage.removeItem(
        "himrideg_token"
      );

      sessionStorage.removeItem(
        "himrideg_user"
      );

      sessionStorage.removeItem(
        "himrideg_role"
      );

      sessionStorage.removeItem(
        "accessToken"
      );

      sessionStorage.removeItem(
        "token"
      );

      setUser(null);
      setBookings([]);
      setDrivers([]);
      setStats(null);

      setBooking(
        emptyBooking
      );

      setMapData(
        emptyMapData
      );

      setDriverStatus(
        emptyDriverStatus
      );

      setDriverApproved(null);

      setPage(
        "home"
      );

      window.history.replaceState({}, "", "/");
    };

  if (
    page === "customerAuth" &&
    !user
  ) {
    return (
      <>
        {message && <div className="toast">{message}</div>}

        <CustomerLoginPage
          key={`customer-${authMode}`}
          initialMode={authMode}
          onBack={goHome}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  if (
    page === "adminAuth" &&
    !user
  ) {
    return (
      <>
        {message && <div className="toast">{message}</div>}

        <AdminLoginPage
          onBack={goHome}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  if (
    page === "driverAuth" &&
    !user
  ) {
    return (
      <>
        {message && <div className="toast">{message}</div>}

        <AuthPage
          key={`driver-${authMode}`}
          initialMode={authMode}
          initialAccountType="driver"
          lockAccountType
          onBack={goHome}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  if (
    page ===
      "auth" &&
    !user
  ) {
    return (
      <>
        {
          message &&
          (
            <div className="toast">
              {
                message
              }
            </div>
          )
        }

        <AuthPage
          key={
            authMode
          }
          initialMode={
            authMode
          }
          onBack={
            goHome
          }
          onSuccess={
            handleAuthSuccess
          }
        />
      </>
    );
  }

  if (
    page ===
      "basicInfo" &&
    user &&
    (
      user.role ===
        "customer" ||
      user.role ===
        "driver"
    )
  ) {
    return (
      <>
        {
          message &&
          (
            <div className="toast">
              {message}
            </div>
          )
        }

        <GoogleBasicInfo
          user={user}
          onComplete={
            handleGoogleBasicInfoComplete
          }
          logout={logout}
        />
      </>
    );
  }

  if (
    page ===
      "dashboard" &&
    user?.role ===
      "customer"
  ) {
    return (
      <>
        {
          message &&
          (
            <div className="toast">
              {
                message
              }
            </div>
          )
        }

        <CustomerDashboard
          user={
            user
          }
          booking={
            booking
          }
          setBooking={
            setBooking
          }
          bookings={
            bookings
          }
          mapData={
            mapData
          }
          setMapData={
            setMapData
          }
          createBooking={
            createBooking
          }
          loadBookings={
            loadBookings
          }
          updateBooking={
            updateBooking
          }
          onUserUpdate={
            setUser
          }
          logout={
            logout
          }
        />
      </>
    );
  }

  if (
    page ===
      "dashboard" &&
    user?.role ===
      "driver"
  ) {
    /*
    | Approval status abhi load ho raha hai
    */
    if (driverApproved === null) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#0b0f1a",
            color: "#9ca3af"
          }}
        >
          Loading...
        </div>
      );
    }

    return (
      <>
        {
          message &&
          (
            <div className="toast">
              {
                message
              }
            </div>
          )
        }

        {/*
          Approved nahi hai toh dashboard ke upar
          verification popup dikhega
        */}
        {
          !driverApproved &&
          (
            <DriverOnboarding
              user={user}
              onApproved={
                handleDriverApproved
              }
              logout={logout}
            />
          )
        }

        <DriverDashboard
          user={
            user
          }
          bookings={
            bookings
          }
          loadBookings={
            loadBookings
          }
          updateBooking={
            updateBooking
          }
          driverStatus={
            driverStatus
          }
          updateDriverOnlineStatus={
            updateDriverOnlineStatus
          }
          logout={
            logout
          }
        />
      </>
    );
  }

  if (
    page ===
      "dashboard" &&
    user?.role ===
      "admin"
  ) {
    return (
      <>
        {
          message &&
          (
            <div className="toast">
              {
                message
              }
            </div>
          )
        }

        <AdminDashboard
          user={
            user
          }
          stats={
            stats
          }
          drivers={
            drivers
          }
          customers={
            customers
          }
          bookings={
            bookings
          }
          loadAdminData={
            loadAdminData
          }
          loadBookings={
            loadBookings
          }
          updateDriver={
            updateDriver
          }
          updateCustomer={
            updateCustomer
          }
          notify={
            notify
          }
          logout={
            logout
          }
        />
      </>
    );
  }

  return (
    <>
      {
        message &&
        (
          <div className="toast">
            {
              message
            }
          </div>
        )
      }

      <Home
        onLogin={openCustomerLogin}
        onRegister={openCustomerRegister}
        onDriverLogin={openDriverLogin}
        onAdminLogin={openAdminLogin}
      />
    </>
  );
}

export default App;