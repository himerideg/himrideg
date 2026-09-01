/*
|--------------------------------------------------------------------------
| HimRideG Background Push Notification Bridge — Phase 2
|--------------------------------------------------------------------------
|
| High-volume ride notifications ko Redis queue par move karta hai when the
| distributed queue is ready. Queue unavailable ho to original direct push
| immediately use hota hai, isliye notification flow Redis par dependent nahi.
|
*/

const {
  sendPushToUser
} = require(
  "./pushNotificationService"
);

const {
  registerBackgroundJobHandler,
  enqueueBackgroundJob,
  canUseDistributedQueue
} = require(
  "./backgroundJobService"
);

const PUSH_USER_JOB =
  "notification:push-user";

let handlerRegistered = false;

function registerBackgroundNotificationHandler() {
  if (handlerRegistered) {
    return;
  }

  registerBackgroundJobHandler(
    PUSH_USER_JOB,
    async (payload = {}) => {
      const userId =
        String(
          payload.userId || ""
        ).trim();

      if (!userId) {
        return;
      }

      await sendPushToUser(
        userId,
        payload.options || {}
      );
    }
  );

  handlerRegistered = true;
}

async function queuePushToUser(
  userId,
  options = {}
) {
  const resolvedUserId =
    String(userId || "").trim();

  if (!resolvedUserId) {
    return {
      sent: 0,
      skipped: "no-user"
    };
  }

  if (
    !canUseDistributedQueue()
  ) {
    return sendPushToUser(
      resolvedUserId,
      options
    );
  }

  try {
    const queued =
      await enqueueBackgroundJob(
        PUSH_USER_JOB,
        {
          userId:
            resolvedUserId,
          options
        }
      );

    if (queued.queued) {
      return {
        sent: 0,
        queued: true,
        jobId:
          queued.jobId
      };
    }
  } catch (error) {
    console.error(
      "[BackgroundNotification] queue error; direct push fallback:",
      error?.message || error
    );
  }

  return sendPushToUser(
    resolvedUserId,
    options
  );
}

module.exports = {
  PUSH_USER_JOB,
  registerBackgroundNotificationHandler,
  queuePushToUser
};
