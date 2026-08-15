/*
|--------------------------------------------------------------------------
| SMS Service — Fast2SMS
|--------------------------------------------------------------------------
|
| Fast2SMS India ka fastest aur cheapest SMS provider hai.
| Free tier mein bhi OTP bhej sakte hain.
|
| Setup:
| 1. https://www.fast2sms.com par account banao
| 2. Dashboard → Dev API → API Key copy karo
| 3. server/.env mein add karo:
|    FAST2SMS_API_KEY=your_api_key_here
|    SMS_ENABLED=true
|
| Jab SMS_ENABLED=false ho (ya key na ho) toh:
| - Development mein OTP console pe print hogi
| - Response mein developmentOtp aayegi (existing behaviour)
|
*/

const https = require("node:https");

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const FAST2SMS_API_KEY =
  process.env.FAST2SMS_API_KEY || "";

const SMS_ENABLED =
  process.env.SMS_ENABLED === "true" &&
  Boolean(FAST2SMS_API_KEY);

/*
|--------------------------------------------------------------------------
| Fast2SMS API Call
|--------------------------------------------------------------------------
*/

function sendFast2SMS(phone, otp) {
  return new Promise((resolve, reject) => {
    /*
    | Phone number se leading +91 ya 91 hata do
    | Fast2SMS sirf 10-digit number chahta hai
    */
    const cleanPhone = String(phone)
      .replace(/^\+?91/, "")
      .replace(/\D/g, "")
      .slice(-10);

    if (cleanPhone.length !== 10) {
      return reject(
        new Error(`Invalid phone number: ${phone}`)
      );
    }

    const postData = JSON.stringify({
      route: "q",
      message: `${otp} is your HimRideG OTP. Valid for 10 minutes. Do not share. -HimRideG`,
      numbers: cleanPhone,
      flash: 0
    });

    const options = {
      hostname: "www.fast2sms.com",
      path: "/dev/bulkV2",
      method: "POST",
      headers: {
        authorization: FAST2SMS_API_KEY,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);

          if (parsed.return === true) {
            console.log(
              `[SMS] OTP sent to ${cleanPhone} via Fast2SMS. RequestId: ${parsed.request_id}`
            );
            resolve({ success: true, provider: "fast2sms" });
          } else {
            console.error(
              "[SMS] Fast2SMS API error:",
              parsed
            );
            reject(
              new Error(
                parsed.message?.[0] ||
                  "Fast2SMS se OTP send nahi ho saka"
              )
            );
          }
        } catch (parseError) {
          reject(
            new Error(
              `Fast2SMS response parse error: ${data}`
            )
          );
        }
      });
    });

    req.on("error", (error) => {
      reject(
        new Error(`Fast2SMS network error: ${error.message}`)
      );
    });

    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error("Fast2SMS request timeout"));
    });

    req.write(postData);
    req.end();
  });
}

/*
|--------------------------------------------------------------------------
| Main sendOtp Function
|--------------------------------------------------------------------------
|
| Yeh function dono controllers (authController + driverAuthController)
| mein use hoga.
|
| Returns: { sent: true/false, provider: "fast2sms"/"console", error?: string }
|
*/

async function sendOtpSms(phone, otp) {
  if (!SMS_ENABLED) {
    /*
    | SMS disabled hai — development mode
    | OTP console pe print karo
    */
    console.log(
      `[SMS DEV] OTP for ${phone}: ${otp} (SMS_ENABLED=false, SMS send nahi hua)`
    );

    return {
      sent: false,
      provider: "console",
      devOtp: otp
    };
  }

  try {
    const result = await sendFast2SMS(phone, otp);

    return {
      sent: true,
      provider: result.provider
    };
  } catch (smsError) {
    /*
    | SMS fail hone par bhi OTP DB mein save hai.
    | Error log karo lekin request fail mat karo.
    | Development mein OTP console pe dikh jayegi.
    */
    console.error(
      "[SMS] OTP delivery failed (non-blocking):",
      smsError.message
    );

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[SMS FALLBACK] OTP for ${phone}: ${otp}`
      );
    }

    return {
      sent: false,
      provider: "failed",
      error: smsError.message
    };
  }
}

module.exports = {
  sendOtpSms,
  SMS_ENABLED
};