import { io } from "socket.io-client";

/*
|--------------------------------------------------------------------------
| URL Helpers
|--------------------------------------------------------------------------
*/

function trimURL(value) {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "");
}

function getSocketServerURL() {
  const configuredSocketURL =
    import.meta.env.VITE_SOCKET_URL;

  if (
    import.meta.env.PROD &&
    configuredSocketURL
  ) {
    return trimURL(
      configuredSocketURL
    );
  }

  const configuredApiURL =
    import.meta.env.VITE_API_URL;

  if (
    import.meta.env.PROD &&
    configuredApiURL
  ) {
    return trimURL(
      configuredApiURL
    )
      .replace(
        /\/api\/v\d+\/?$/i,
        ""
      )
      .replace(
        /\/api\/?$/i,
        ""
      );
  }

  /*
  |--------------------------------------------------------------------------
  | Development
  |--------------------------------------------------------------------------
  |
  | Laptop:
  | localhost:5173 -> localhost:5001
  |
  | Phone:
  | 192.168.x.x:5173 -> 192.168.x.x:5001
  |
  */

  return `http://${window.location.hostname}:5001`;
}

/*
|--------------------------------------------------------------------------
| Fresh Access Token Reader
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Current HimRideG login session sessionStorage me save hoti hai.
| Purana localStorage token socket ko kabhi nahi dena.
|
| DriverDashboard.jsx ke purane code me localStorage ka expired token mil sakta
| hai aur woh socket.auth ko overwrite kar deta hai. Neeche connect wrapper har
| connection attempt se just pehle fresh session token dobara set karta hai.
|
*/

function getFreshToken() {
  return String(
    sessionStorage.getItem(
      "himrideg_token"
    ) ||
      sessionStorage.getItem(
        "accessToken"
      ) ||
      sessionStorage.getItem(
        "token"
      ) ||
      ""
  )
    .replace(
      /^Bearer\s+/i,
      ""
    )
    .trim();
}

/*
|--------------------------------------------------------------------------
| Save Fresh Access Token
|--------------------------------------------------------------------------
*/

function saveFreshToken(token) {
  const cleanToken = String(
    token || ""
  )
    .replace(
      /^Bearer\s+/i,
      ""
    )
    .trim();

  if (!cleanToken) {
    return "";
  }

  sessionStorage.setItem(
    "himrideg_token",
    cleanToken
  );

  /*
  |--------------------------------------------------------------------------
  | Compatibility Keys
  |--------------------------------------------------------------------------
  |
  | Canonical token sirf himrideg_token rakhenge.
  |
  */

  sessionStorage.removeItem(
    "accessToken"
  );

  sessionStorage.removeItem(
    "token"
  );

  return cleanToken;
}

/*
|--------------------------------------------------------------------------
| Refresh Socket Session
|--------------------------------------------------------------------------
|
| Access token expire hone par refresh-token httpOnly cookie se naya access
| token liya jayega.
|
*/

async function refreshSocketSession() {
  const {
    apiBaseUrl
  } = await import("./api");

  const response = await fetch(
    `${apiBaseUrl}/auth/refresh`,
    {
      method: "POST",

      credentials:
        "include",

      headers: {
        "Content-Type":
          "application/json",

        Accept:
          "application/json"
      },

      body: "{}"
    }
  );

  if (!response.ok) {
    let message =
      "Session refresh failed";

    try {
      const errorData =
        await response.json();

      message =
        errorData?.message ||
        errorData?.error ||
        message;
    } catch (error) {
      /*
      |--------------------------------------------------------------------------
      | Ignore Invalid Error Body
      |--------------------------------------------------------------------------
      */
    }

    throw new Error(
      message
    );
  }

  const data =
    await response.json();

  const newToken =
    data?.data?.accessToken ||
    data?.data?.token ||
    data?.accessToken ||
    data?.token ||
    "";

  if (!newToken) {
    throw new Error(
      "Refresh response me access token nahi mila"
    );
  }

  return saveFreshToken(
    newToken
  );
}

/*
|--------------------------------------------------------------------------
| Socket Auth Provider
|--------------------------------------------------------------------------
|
| Callback form use hota hai taaki har fresh connection / reconnect par
| token sessionStorage se us waqt uthaya jaye.
|
*/

function createFreshAuthProvider() {
  return (
    callback
  ) => {
    callback({
      token:
        getFreshToken()
    });
  };
}

/*
|--------------------------------------------------------------------------
| Socket Instance
|--------------------------------------------------------------------------
*/

const socket = io(
  getSocketServerURL(),
  {
    /*
    |--------------------------------------------------------------------------
    | Manual Connection
    |--------------------------------------------------------------------------
    */

    autoConnect: false,

    /*
    |--------------------------------------------------------------------------
    | Transport
    |--------------------------------------------------------------------------
    */

    transports: [
      "websocket",
      "polling"
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    |
    | Har connection attempt par latest token.
    |
    */

    auth:
      createFreshAuthProvider(),

    /*
    |--------------------------------------------------------------------------
    | Reconnection
    |--------------------------------------------------------------------------
    */

    reconnection: true,

    reconnectionAttempts:
      Infinity,

    reconnectionDelay:
      1000,

    reconnectionDelayMax:
      5000,

    timeout:
      20000
  }
);

/*
|--------------------------------------------------------------------------
| Force Fresh Auth Before Every Manual Connect
|--------------------------------------------------------------------------
|
| IMPORTANT FIX:
|
| DriverDashboard.jsx ke current code me:
|
| socket.auth = {
|   token
| };
|
| socket.connect();
|
| chal raha hai.
|
| Agar `token` localStorage ka old expired token hai to socket.js ka
| fresh auth callback overwrite ho jata hai.
|
| Is wrapper ki wajah se App.jsx ya DriverDashboard.jsx koi bhi
| socket.connect() kare, actual connection se just pehle fresh
| sessionStorage token use hoga.
|
*/

const originalSocketConnect =
  socket.connect.bind(
    socket
  );

socket.connect = (
  ...args
) => {
  /*
  |--------------------------------------------------------------------------
  | Restore Dynamic Fresh Auth
  |--------------------------------------------------------------------------
  */

  socket.auth =
    createFreshAuthProvider();

  /*
  |--------------------------------------------------------------------------
  | Original Socket.IO Connect
  |--------------------------------------------------------------------------
  */

  return originalSocketConnect(
    ...args
  );
};

/*
|--------------------------------------------------------------------------
| Automatic Reconnect Attempt
|--------------------------------------------------------------------------
|
| Wi-Fi/network disconnect hone ke baad Socket.IO automatic reconnect kare
| tab bhi latest token handshake me jana chahiye.
|
*/

socket.io.on(
  "reconnect_attempt",
  () => {
    socket.auth =
      createFreshAuthProvider();
  }
);

/*
|--------------------------------------------------------------------------
| Socket Refresh State
|--------------------------------------------------------------------------
|
| Ek auth error par multiple refresh calls nahi bhejni.
|
*/

let socketRefreshInProgress =
  false;

/*
|--------------------------------------------------------------------------
| Connected
|--------------------------------------------------------------------------
*/

socket.on(
  "connect",
  () => {
    /*
    |--------------------------------------------------------------------------
    | Reset Refresh State
    |--------------------------------------------------------------------------
    */

    socketRefreshInProgress =
      false;

    console.log(
      "Socket connected:",
      socket.id
    );
  }
);

/*
|--------------------------------------------------------------------------
| Disconnected
|--------------------------------------------------------------------------
*/

socket.on(
  "disconnect",
  (
    reason
  ) => {
    console.log(
      "Socket disconnected:",
      reason
    );
  }
);

/*
|--------------------------------------------------------------------------
| Connection Error
|--------------------------------------------------------------------------
*/

socket.on(
  "connect_error",
  (
    error
  ) => {
    /*
    |--------------------------------------------------------------------------
    | Error Message
    |--------------------------------------------------------------------------
    */

    const message =
      String(
        error?.message ||
          ""
      );

    const lowerMessage =
      message.toLowerCase();

    const errorCode =
      String(
        error?.data?.code ||
          ""
      ).toUpperCase();

    /*
    |--------------------------------------------------------------------------
    | Authentication Error Detection
    |--------------------------------------------------------------------------
    */

    const isAuthError =
      lowerMessage.includes(
        "token"
      ) ||
      lowerMessage.includes(
        "expired"
      ) ||
      lowerMessage.includes(
        "unauthorized"
      ) ||
      lowerMessage.includes(
        "authentication"
      ) ||
      errorCode.includes(
        "AUTH"
      ) ||
      errorCode.includes(
        "TOKEN"
      );

    /*
    |--------------------------------------------------------------------------
    | Normal Socket Error
    |--------------------------------------------------------------------------
    */

    if (!isAuthError) {
      console.error(
        "Socket connection failed:",
        message,
        error?.data ||
          ""
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Refresh Already Running
    |--------------------------------------------------------------------------
    |
    | App.jsx aur DriverDashboard.jsx dono connect_error listener rakh sakte
    | hain. socket.js refresh sirf ek baar karega.
    |
    */

    if (
      socketRefreshInProgress
    ) {
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Start Refresh
    |--------------------------------------------------------------------------
    */

    socketRefreshInProgress =
      true;

    console.warn(
      "Socket token expire hua - session refresh kar rahe hain..."
    );

    /*
    |--------------------------------------------------------------------------
    | Stop Current Failed Connection
    |--------------------------------------------------------------------------
    */

    socket.disconnect();

    /*
    |--------------------------------------------------------------------------
    | Refresh Access Token
    |--------------------------------------------------------------------------
    */

    refreshSocketSession()
      .then(
        () => {
          /*
          |--------------------------------------------------------------------------
          | Refresh Successful
          |--------------------------------------------------------------------------
          */

          socketRefreshInProgress =
            false;

          /*
          |--------------------------------------------------------------------------
          | IMPORTANT
          |--------------------------------------------------------------------------
          |
          | DriverDashboard ne socket.auth object overwrite kiya ho tab bhi
          | fresh callback dobara restore karo.
          |
          */

          socket.auth =
            createFreshAuthProvider();

          /*
          |--------------------------------------------------------------------------
          | Reconnect
          |--------------------------------------------------------------------------
          |
          | Wrapped socket.connect() ek baar aur fresh auth set karega.
          |
          */

          socket.connect();
        }
      )
      .catch(
        (
          refreshError
        ) => {
          /*
          |--------------------------------------------------------------------------
          | Refresh Failed
          |--------------------------------------------------------------------------
          */

          socketRefreshInProgress =
            false;

          console.warn(
            "Socket session refresh fail - login page par bhej rahe hain.",
            refreshError
              ?.message ||
              ""
          );

          /*
          |--------------------------------------------------------------------------
          | Make Sure Socket Is Closed
          |--------------------------------------------------------------------------
          */

          socket.disconnect();

          /*
          |--------------------------------------------------------------------------
          | Tell Main App To Logout
          |--------------------------------------------------------------------------
          */

          window.dispatchEvent(
            new CustomEvent(
              "himrideg:unauthorized"
            )
          );
        }
      );
  }
);

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

export {
  getFreshToken,
  getSocketServerURL,
  refreshSocketSession
};

export default socket;