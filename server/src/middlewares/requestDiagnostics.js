const crypto = require("node:crypto");

const {
  observability
} = require("../config/scalability");

/*
|--------------------------------------------------------------------------
| Request Diagnostics — ADD-ONLY
|--------------------------------------------------------------------------
|
| Har request ko unique request ID deta hai aur sirf slow / 5xx requests ko
| log karta hai. Business response body, authentication, payment, ride state
| ya Socket.IO behavior me koi change nahi karta.
|
*/

function requestDiagnostics(
  req,
  res,
  next
) {
  const requestId =
    crypto.randomUUID();

  const startedAt =
    process.hrtime.bigint();

  req.himridegRequestId =
    requestId;

  res.setHeader(
    observability.requestIdHeader,
    requestId
  );

  res.on(
    "finish",
    () => {
      const endedAt =
        process.hrtime.bigint();

      const durationMs =
        Number(
          endedAt - startedAt
        ) / 1_000_000;

      const isSlow =
        durationMs >=
        observability.slowRequestMs;

      const isServerError =
        res.statusCode >= 500;

      if (
        !isSlow &&
        !isServerError
      ) {
        return;
      }

      const logPayload = {
        requestId,
        method: req.method,
        path:
          req.originalUrl ||
          req.url,
        statusCode:
          res.statusCode,
        durationMs:
          Number(
            durationMs.toFixed(1)
          ),
        userId:
          req.user?._id ||
          req.user?.id ||
          null,
        userRole:
          req.user?.role ||
          null
      };

      if (isServerError) {
        console.error(
          "[HimRideG request failure]",
          logPayload
        );

        return;
      }

      console.warn(
        "[HimRideG slow request]",
        logPayload
      );
    }
  );

  return next();
}

module.exports =
  requestDiagnostics;
