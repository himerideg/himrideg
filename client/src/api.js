import axios from "axios";

/*
|--------------------------------------------------------------------------
| API Base URL
|--------------------------------------------------------------------------
|
| DEVELOPMENT:
|
| Laptop:
| Frontend = http://localhost:5173
| Backend  = http://localhost:5001
|
| Mobile:
| Frontend = http://192.168.x.x:5173
| Backend  = http://192.168.x.x:5001
|
| Browser jis hostname se frontend kholta hai,
| development me wahi hostname backend ke liye use hoga.
|
| Isse:
| - localhost / local IP mismatch nahi hoga
| - refresh cookie properly kaam karegi
| - laptop aur mobile dono par same code chalega
|
| PRODUCTION:
|
| VITE_API_URL use hoga.
|
*/

const host =
  window.location.hostname ||
  "localhost";

const localApiUrl =
  `http://${host}:5001/api/v2`;

const configuredApiUrl =
  String(
    import.meta.env.VITE_API_URL ||
      ""
  )
    .trim()
    .replace(/\/+$/, "");

/*
|--------------------------------------------------------------------------
| Final API URL
|--------------------------------------------------------------------------
|
| Development me .env ka fixed local IP force nahi karna.
|
| Example:
|
| localhost:5173
|     ↓
| localhost:5001
|
| 10.138.247.5:5173
|     ↓
| 10.138.247.5:5001
|
*/

const apiBaseUrl =
  import.meta.env.PROD &&
  configuredApiUrl
    ? configuredApiUrl
    : localApiUrl;

/*
|--------------------------------------------------------------------------
| Debug
|--------------------------------------------------------------------------
*/

if (import.meta.env.DEV) {
  console.log(
    "HimRideG API:",
    apiBaseUrl
  );
}

/*
|--------------------------------------------------------------------------
| Axios Instance
|--------------------------------------------------------------------------
*/

const api = axios.create({
  baseURL: apiBaseUrl,

  timeout: 30000,

  headers: {
    "Content-Type":
      "application/json",

    Accept:
      "application/json"
  },

  /*
  |--------------------------------------------------------------------------
  | IMPORTANT
  |--------------------------------------------------------------------------
  |
  | Refresh-token httpOnly cookie bhejne ke liye required hai.
  |
  */

  withCredentials: true
});

/*
|--------------------------------------------------------------------------
| Saved Access Token
|--------------------------------------------------------------------------
*/

function getSavedToken() {
  return (
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
  );
}

/*
|--------------------------------------------------------------------------
| Save Access Token
|--------------------------------------------------------------------------
*/

function saveAccessToken(
  token
) {
  const cleanToken =
    String(token || "")
      .replace(
        /^Bearer\s+/i,
        ""
      )
      .trim();

  if (!cleanToken) {
    return;
  }

  sessionStorage.setItem(
    "himrideg_token",
    cleanToken
  );

  /*
  |--------------------------------------------------------------------------
  | Old Duplicate Keys Remove
  |--------------------------------------------------------------------------
  |
  | Ek hi canonical token rakhenge.
  |
  */

  sessionStorage.removeItem(
    "accessToken"
  );

  sessionStorage.removeItem(
    "token"
  );
}

/*
|--------------------------------------------------------------------------
| Clear Login Data
|--------------------------------------------------------------------------
*/

function clearLoginData() {
  [
    "himrideg_token",
    "himrideg_user",
    "himrideg_role",
    "accessToken",
    "token"
  ].forEach((key) => {
    sessionStorage.removeItem(
      key
    );
  });
}

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
|
| Har API request se pehle fresh token sessionStorage se uthta hai.
|
*/

api.interceptors.request.use(
  (config) => {
    const cleanToken =
      String(
        getSavedToken()
      )
        .replace(
          /^Bearer\s+/i,
          ""
        )
        .trim();

    config.headers =
      config.headers || {};

    if (cleanToken) {
      config.headers.Authorization =
        `Bearer ${cleanToken}`;
    } else {
      delete config.headers
        .Authorization;
    }

    /*
    |--------------------------------------------------------------------------
    | Credentials
    |--------------------------------------------------------------------------
    |
    | Har request par refresh cookie allow karo.
    |
    */

    config.withCredentials =
      true;

    return config;
  },

  (error) => {
    return Promise.reject(
      error
    );
  }
);

/*
|--------------------------------------------------------------------------
| Refresh State
|--------------------------------------------------------------------------
|
| Agar ek hi time par 5 requests ko 401 mile,
| refresh API sirf ek baar chalegi.
|
*/

let isRefreshing = false;

let refreshWaitQueue = [];

/*
|--------------------------------------------------------------------------
| Auth Failure Classification
|--------------------------------------------------------------------------
|
| Payment button par temporary refresh/network/CORS failure ki wajah se
| customer ko turant global logout nahi karna chahiye. Backend phir bhi
| protected rahega; payment request unauthorized hi fail hogi.
|
*/

function isPaymentApiRequest(requestUrl) {
  return String(requestUrl || "").includes("/payments/");
}

function isHardRefreshFailure(refreshError) {
  const refreshStatus =
    refreshError?.response?.status;

  return (
    refreshStatus === 401 ||
    refreshStatus === 403
  );
}

function dispatchUnauthorized(reason = "session_expired") {
  window.dispatchEvent(
    new CustomEvent("himrideg:unauthorized", {
      detail: { reason }
    })
  );
}

/*
|--------------------------------------------------------------------------
| Resolve Refresh Queue
|--------------------------------------------------------------------------
*/

function onRefreshDone(
  newToken
) {
  refreshWaitQueue.forEach(
    ({
      resolve,
      reject,
      originalError
    }) => {
      if (newToken) {
        resolve(newToken);
      } else {
        reject(
          originalError ||
            new Error(
              "Session refresh failed"
            )
        );
      }
    }
  );

  refreshWaitQueue = [];
}

/*
|--------------------------------------------------------------------------
| Refresh Session
|--------------------------------------------------------------------------
|
| Ye normal "api" instance use nahi karta,
| warna response interceptor ka infinite loop ban sakta hai.
|
*/

async function refreshSession() {
  const refreshUrl =
    `${apiBaseUrl}/auth/refresh`;

  const response =
    await axios.post(
      refreshUrl,

      {},

      {
        withCredentials:
          true,

        timeout: 30000,

        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json"
        }
      }
    );

  /*
  |--------------------------------------------------------------------------
  | Find New Access Token
  |--------------------------------------------------------------------------
  */

  const newToken =
    response.data
      ?.data
      ?.accessToken ||
    response.data
      ?.data
      ?.token ||
    response.data
      ?.accessToken ||
    response.data
      ?.token ||
    "";

  if (!newToken) {
    throw new Error(
      "Refresh response me access token nahi mila"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Save New Token
  |--------------------------------------------------------------------------
  */

  saveAccessToken(
    newToken
  );

  /*
  |--------------------------------------------------------------------------
  | Update User
  |--------------------------------------------------------------------------
  */

  const refreshedUser =
    response.data
      ?.data
      ?.user;

  if (refreshedUser) {
    sessionStorage.setItem(
      "himrideg_user",
      JSON.stringify(
        refreshedUser
      )
    );

    if (
      refreshedUser.role
    ) {
      sessionStorage.setItem(
        "himrideg_role",
        refreshedUser.role
      );
    }
  }

  return String(
    newToken
  )
    .replace(
      /^Bearer\s+/i,
      ""
    )
    .trim();
}

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  /*
  |--------------------------------------------------------------------------
  | Success
  |--------------------------------------------------------------------------
  */

  (response) => {
    return response;
  },

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  async (error) => {
    /*
    |--------------------------------------------------------------------------
    | Network Error
    |--------------------------------------------------------------------------
    */

    if (!error.response) {
      console.error(
        "Backend network error"
      );

      console.error(
        "API URL:",
        apiBaseUrl
      );

      console.error(
        "Reason:",
        error.message
      );

      return Promise.reject(
        error
      );
    }

    const status =
      error.response.status;

    const originalRequest =
      error.config || {};

    const requestUrl =
      String(
        originalRequest.url ||
          ""
      );

    /*
    |--------------------------------------------------------------------------
    | Authentication Requests
    |--------------------------------------------------------------------------
    |
    | In endpoints ko khud refresh nahi karna chahiye.
    |
    */

    const isAuthRequest =
      requestUrl.includes(
        "/login"
      ) ||
      requestUrl.includes(
        "/send-otp"
      ) ||
      requestUrl.includes(
        "/verify-otp"
      ) ||
      requestUrl.includes(
        "/refresh"
      );

    /*
    |--------------------------------------------------------------------------
    | Access Token Expired
    |--------------------------------------------------------------------------
    |
    | Protected API ne 401 diya:
    |
    | 1. refresh token cookie se new access token lo
    | 2. old request retry karo
    |
    */

    if (
      status === 401 &&
      !isAuthRequest &&
      !originalRequest._retried
    ) {
      originalRequest._retried =
        true;

      /*
      |--------------------------------------------------------------------------
      | Refresh Already Running
      |--------------------------------------------------------------------------
      */

      if (isRefreshing) {
        try {
          const newToken =
            await new Promise(
              (
                resolve,
                reject
              ) => {
                refreshWaitQueue.push(
                  {
                    resolve,
                    reject,
                    originalError:
                      error
                  }
                );
              }
            );

          originalRequest.headers =
            originalRequest.headers ||
            {};

          originalRequest
            .headers
            .Authorization =
            `Bearer ${newToken}`;

          originalRequest
            .withCredentials =
            true;

          return api(
            originalRequest
          );
        } catch (
          queueError
        ) {
          return Promise.reject(
            queueError
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Start Refresh
      |--------------------------------------------------------------------------
      */

      isRefreshing = true;

      try {
        const newToken =
          await refreshSession();

        /*
        |--------------------------------------------------------------------------
        | Mark Refresh Complete
        |--------------------------------------------------------------------------
        */

        isRefreshing =
          false;

        /*
        |--------------------------------------------------------------------------
        | Release Waiting Requests
        |--------------------------------------------------------------------------
        */

        onRefreshDone(
          newToken
        );

        /*
        |--------------------------------------------------------------------------
        | Retry Failed Request
        |--------------------------------------------------------------------------
        */

        originalRequest.headers =
          originalRequest.headers ||
          {};

        originalRequest
          .headers
          .Authorization =
          `Bearer ${newToken}`;

        originalRequest
          .withCredentials =
          true;

        return api(
          originalRequest
        );
      } catch (
        refreshError
      ) {
        /*
        |--------------------------------------------------------------------------
        | Refresh Failed
        |--------------------------------------------------------------------------
        */

        isRefreshing =
          false;

        onRefreshDone(
          null
        );

        console.warn(
          "Session refresh fail hui - login page par bhej rahe hain.",
          refreshError
            ?.response
            ?.data
            ?.message ||
            refreshError
              ?.message ||
            ""
        );

        /*
        |--------------------------------------------------------------------------
        | Hard Session Failure vs Temporary Failure
        |--------------------------------------------------------------------------
        |
        | 401/403 from /auth/refresh = session really invalid/expired.
        | Network / timeout / CORS / 5xx = temporary backend problem; login data
        | ko delete nahi karna.
        |
        | IMPORTANT PAYMENT RULE:
        | Online Payment click par refresh fail hone se customer ko dashboard se
        | force-logout nahi karenge. Payment backend request unauthorized hi rahegi
        | aur modal error show karega, but customer ka dashboard state preserve hoga.
        |
        */

        const hardSessionFailure =
          isHardRefreshFailure(
            refreshError
          );

        const paymentRequest =
          isPaymentApiRequest(
            requestUrl
          );

        if (
          hardSessionFailure &&
          !paymentRequest
        ) {
          clearLoginData();

          dispatchUnauthorized(
            "refresh_session_invalid"
          );
        } else if (paymentRequest) {
          console.warn(
            "Payment request auth refresh fail hui; false auto-logout suppress kiya gaya."
          );

          window.dispatchEvent(
            new CustomEvent(
              "himrideg:payment-auth-error",
              {
                detail: {
                  status:
                    refreshError
                      ?.response
                      ?.status ||
                    0,
                  message:
                    refreshError
                      ?.response
                      ?.data
                      ?.message ||
                    refreshError
                      ?.message ||
                    "Payment session refresh failed"
                }
              }
            )
          );
        }

        return Promise.reject(
          refreshError
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Other Unauthorized Response
    |--------------------------------------------------------------------------
    */

    if (
      status === 401 &&
      !isAuthRequest
    ) {
      const paymentRequest =
        isPaymentApiRequest(
          requestUrl
        );

      /*
      |--------------------------------------------------------------------------
      | Never False-Logout From Payment Button
      |--------------------------------------------------------------------------
      |
      | Payment endpoint ki 401 ko global logout signal me convert nahi karna.
      | Payment modal error handle karega. Backend authorization bypass nahi hota.
      |
      */

      if (!paymentRequest) {
        clearLoginData();

        dispatchUnauthorized(
          "protected_request_unauthorized"
        );
      }
    }

    return Promise.reject(
      error
    );
  }
);

/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

export {
  apiBaseUrl,
  clearLoginData,
  getSavedToken,
  saveAccessToken
};

export default api;