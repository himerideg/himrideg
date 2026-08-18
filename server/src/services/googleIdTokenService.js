const crypto = require("node:crypto");

const GOOGLE_JWKS_URL =
  "https://www.googleapis.com/oauth2/v3/certs";

const GOOGLE_ISSUERS = new Set([
  "accounts.google.com",
  "https://accounts.google.com"
]);

let cachedKeys = new Map();
let cacheExpiresAt = 0;

const text = (value) =>
  String(value || "").trim();

const decodeBase64Url = (
  value
) => {
  return Buffer.from(
    String(value || ""),
    "base64url"
  );
};

const parseJsonSegment = (
  value,
  label
) => {
  try {
    return JSON.parse(
      decodeBase64Url(
        value
      ).toString("utf8")
    );
  } catch {
    throw new Error(
      `Google ID token ${label} invalid hai`
    );
  }
};

const getMaxAgeMs = (
  cacheControl
) => {
  const match =
    String(cacheControl || "")
      .match(
        /(?:^|,)\s*max-age=(\d+)/i
      );

  if (!match) {
    return 30 * 60 * 1000;
  }

  const seconds =
    Number(match[1]);

  if (
    !Number.isFinite(
      seconds
    ) ||
    seconds <= 0
  ) {
    return 30 * 60 * 1000;
  }

  return Math.min(
    seconds * 1000,
    12 * 60 * 60 * 1000
  );
};

const loadGoogleKeys =
  async (
    forceRefresh = false
  ) => {
    if (
      !forceRefresh &&
      cachedKeys.size > 0 &&
      Date.now() <
        cacheExpiresAt
    ) {
      return cachedKeys;
    }

    const response =
      await fetch(
        GOOGLE_JWKS_URL,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json"
          },
          signal:
            AbortSignal.timeout(
              8000
            )
        }
      );

    if (!response.ok) {
      throw new Error(
        `Google public keys fetch failed (${response.status})`
      );
    }

    const payload =
      await response.json();

    const nextKeys =
      new Map();

    for (
      const jwk of
        payload?.keys || []
    ) {
      if (
        jwk?.kid &&
        jwk?.kty === "RSA"
      ) {
        nextKeys.set(
          jwk.kid,
          jwk
        );
      }
    }

    if (
      nextKeys.size === 0
    ) {
      throw new Error(
        "Google public keys response empty hai"
      );
    }

    cachedKeys =
      nextKeys;

    cacheExpiresAt =
      Date.now() +
      getMaxAgeMs(
        response.headers.get(
          "cache-control"
        )
      );

    return cachedKeys;
  };

const verifySignature =
  async ({
    signingInput,
    signature,
    kid
  }) => {
    let keys =
      await loadGoogleKeys(
        false
      );

    let jwk =
      keys.get(kid);

    if (!jwk) {
      keys =
        await loadGoogleKeys(
          true
        );

      jwk =
        keys.get(kid);
    }

    if (!jwk) {
      throw new Error(
        "Google signing key nahi mili"
      );
    }

    const publicKey =
      crypto.createPublicKey({
        key: jwk,
        format: "jwk"
      });

    const valid =
      crypto.verify(
        "RSA-SHA256",
        Buffer.from(
          signingInput,
          "utf8"
        ),
        publicKey,
        signature
      );

    if (!valid) {
      throw new Error(
        "Google ID token signature invalid hai"
      );
    }
  };

const normalizeAudience = (
  audience
) => {
  if (
    Array.isArray(audience)
  ) {
    return audience.map(
      (item) =>
        text(item)
    );
  }

  return [
    text(audience)
  ];
};

const verifyGoogleIdToken =
  async (
    credential
  ) => {
    const token =
      text(credential);

    if (!token) {
      throw new Error(
        "Google credential required hai"
      );
    }

    if (
      token.length > 12000
    ) {
      throw new Error(
        "Google credential invalid hai"
      );
    }

    const clientId =
      text(
        process.env
          .GOOGLE_CLIENT_ID
      );

    if (!clientId) {
      throw new Error(
        "GOOGLE_CLIENT_ID server environment me configured nahi hai"
      );
    }

    const parts =
      token.split(".");

    if (
      parts.length !== 3
    ) {
      throw new Error(
        "Google ID token format invalid hai"
      );
    }

    const [
      encodedHeader,
      encodedPayload,
      encodedSignature
    ] = parts;

    const header =
      parseJsonSegment(
        encodedHeader,
        "header"
      );

    const payload =
      parseJsonSegment(
        encodedPayload,
        "payload"
      );

    if (
      header?.alg !==
        "RS256" ||
      !header?.kid
    ) {
      throw new Error(
        "Google ID token algorithm invalid hai"
      );
    }

    await verifySignature({
      signingInput:
        `${encodedHeader}.${encodedPayload}`,
      signature:
        decodeBase64Url(
          encodedSignature
        ),
      kid:
        header.kid
    });

    if (
      !GOOGLE_ISSUERS.has(
        payload?.iss
      )
    ) {
      throw new Error(
        "Google ID token issuer invalid hai"
      );
    }

    const audiences =
      normalizeAudience(
        payload?.aud
      );

    if (
      !audiences.includes(
        clientId
      )
    ) {
      throw new Error(
        "Google ID token audience invalid hai"
      );
    }

    const nowSeconds =
      Math.floor(
        Date.now() / 1000
      );

    const exp =
      Number(payload?.exp);

    if (
      !Number.isFinite(exp) ||
      exp <= nowSeconds
    ) {
      throw new Error(
        "Google ID token expire ho chuka hai"
      );
    }

    const iat =
      Number(payload?.iat);

    if (
      Number.isFinite(iat) &&
      iat > nowSeconds + 120
    ) {
      throw new Error(
        "Google ID token issue time invalid hai"
      );
    }

    const googleId =
      text(payload?.sub);

    const email =
      text(
        payload?.email
      ).toLowerCase();

    if (!googleId) {
      throw new Error(
        "Google account ID missing hai"
      );
    }

    if (
      !email ||
      payload?.email_verified !==
        true
    ) {
      throw new Error(
        "Google email verified nahi hai"
      );
    }

    return {
      googleId,
      email,
      emailVerified:
        true,
      name:
        text(payload?.name),
      givenName:
        text(
          payload?.given_name
        ),
      familyName:
        text(
          payload?.family_name
        ),
      picture:
        text(payload?.picture),
      hostedDomain:
        text(payload?.hd),
      isGoogleAuthoritativeEmail:
        email.endsWith(
          "@gmail.com"
        ) ||
        Boolean(
          payload?.hd
        )
    };
  };

module.exports = {
  verifyGoogleIdToken
};
