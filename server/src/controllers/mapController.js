const DEFAULT_CENTER = {
  latitude: 32.1109,
  longitude: 76.5363
};

const AUTOCOMPLETE_TTL_MS = 5 * 60 * 1000;
const ROUTE_TTL_MS = 2 * 60 * 1000;
const REVERSE_TTL_MS = 10 * 60 * 1000;

const cache = new Map();

function keyAvailable() {
  return Boolean(
    String(process.env.GEOAPIFY_API_KEY || "").trim()
  );
}

function getApiKey() {
  const key = String(
    process.env.GEOAPIFY_API_KEY || ""
  ).trim();

  if (!key) {
    const error = new Error(
      "Production map service key configured nahi hai"
    );
    error.statusCode = 503;
    throw error;
  }

  return key;
}

function cached(key) {
  const item = cache.get(key);
  if (!item) return null;

  if (item.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  return item.value;
}

function saveCache(key, value, ttl) {
  if (cache.size > 500) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }

  cache.set(key, {
    value,
    expiresAt: Date.now() + ttl
  });

  return value;
}

async function requestJson(url, signal) {
  const response = await fetch(url, {
    signal,
    headers: {
      Accept: "application/json",
      "User-Agent": "HimRideG/2.0 (https://www.himrideg.com)"
    }
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const error = new Error(
      `Map service request failed (${response.status})${body ? `: ${body.slice(0, 180)}` : ""}`
    );
    error.statusCode = 502;
    throw error;
  }

  return response.json();
}

function toLocation(item = {}) {
  const latitude = Number(item.lat);
  const longitude = Number(item.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    id:
      item.place_id ||
      item.datasource?.raw?.place_id ||
      `${latitude.toFixed(6)},${longitude.toFixed(6)}`,
    address:
      item.formatted ||
      [item.address_line1, item.address_line2]
        .filter(Boolean)
        .join(", ") ||
      item.name ||
      "Selected location",
    shortName:
      item.name ||
      item.address_line1 ||
      item.city ||
      item.village ||
      item.county ||
      "Location",
    latitude,
    longitude,
    city:
      item.city ||
      item.town ||
      item.village ||
      "",
    state: item.state || "",
    postcode: item.postcode || "",
    country: item.country || "India",
    confidence:
      Number(
        item.rank?.confidence ??
          item.rank?.importance ??
          0
      ) || 0
  };
}

function flattenRouteCoordinates(geometry) {
  if (!geometry) return [];

  if (geometry.type === "LineString") {
    return (geometry.coordinates || [])
      .map(([longitude, latitude]) => [
        Number(latitude),
        Number(longitude)
      ])
      .filter(
        ([latitude, longitude]) =>
          Number.isFinite(latitude) &&
          Number.isFinite(longitude)
      );
  }

  if (geometry.type === "MultiLineString") {
    return (geometry.coordinates || [])
      .flatMap((line) =>
        (line || []).map(([longitude, latitude]) => [
          Number(latitude),
          Number(longitude)
        ])
      )
      .filter(
        ([latitude, longitude]) =>
          Number.isFinite(latitude) &&
          Number.isFinite(longitude)
      );
  }

  return [];
}

exports.autocomplete = async (req, res, next) => {
  try {
    const query = String(req.query.q || "").trim();

    if (query.length < 2) {
      return res.status(200).json({
        success: true,
        data: {
          results: []
        }
      });
    }

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 7, 1),
      10
    );

    const latitude = Number(req.query.lat);
    const longitude = Number(req.query.lon);

    const biasLatitude = Number.isFinite(latitude)
      ? latitude
      : DEFAULT_CENTER.latitude;

    const biasLongitude = Number.isFinite(longitude)
      ? longitude
      : DEFAULT_CENTER.longitude;

    const cacheKey = `ac:${query.toLowerCase()}:${limit}:${biasLatitude.toFixed(2)}:${biasLongitude.toFixed(2)}`;
    const hit = cached(cacheKey);
    if (hit) return res.status(200).json(hit);

    const key = getApiKey();
    const url = new URL(
      "https://api.geoapify.com/v1/geocode/autocomplete"
    );

    url.searchParams.set("text", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("filter", "countrycode:in");
    url.searchParams.set(
      "bias",
      `proximity:${biasLongitude},${biasLatitude}`
    );
    url.searchParams.set("lang", "en");
    url.searchParams.set("apiKey", key);

    const data = await requestJson(url);

    const results = (data?.results || [])
      .map(toLocation)
      .filter(Boolean);

    const payload = {
      success: true,
      data: {
        results,
        provider: "geoapify"
      }
    };

    return res.status(200).json(
      saveCache(cacheKey, payload, AUTOCOMPLETE_TTL_MS)
    );
  } catch (error) {
    return next(error);
  }
};

exports.reverse = async (req, res, next) => {
  try {
    const latitude = Number(req.query.lat);
    const longitude = Number(req.query.lon);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude/longitude required hai"
      });
    }

    const cacheKey = `rv:${latitude.toFixed(5)}:${longitude.toFixed(5)}`;
    const hit = cached(cacheKey);
    if (hit) return res.status(200).json(hit);

    const key = getApiKey();
    const url = new URL(
      "https://api.geoapify.com/v1/geocode/reverse"
    );

    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("format", "json");
    url.searchParams.set("lang", "en");
    url.searchParams.set("apiKey", key);

    const data = await requestJson(url);
    const location = toLocation(data?.results?.[0] || {});

    const payload = {
      success: true,
      data: {
        location:
          location || {
            id: `${latitude},${longitude}`,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            shortName: "My Location",
            latitude,
            longitude,
            confidence: 0
          },
        provider: "geoapify"
      }
    };

    return res.status(200).json(
      saveCache(cacheKey, payload, REVERSE_TTL_MS)
    );
  } catch (error) {
    return next(error);
  }
};

exports.route = async (req, res, next) => {
  try {
    const fromLat = Number(req.query.fromLat);
    const fromLon = Number(req.query.fromLon);
    const toLat = Number(req.query.toLat);
    const toLon = Number(req.query.toLon);

    const values = [fromLat, fromLon, toLat, toLon];
    if (!values.every(Number.isFinite)) {
      return res.status(400).json({
        success: false,
        message: "Route ke liye valid pickup/drop coordinates required hain"
      });
    }

    const cacheKey = `rt:${fromLat.toFixed(5)}:${fromLon.toFixed(5)}:${toLat.toFixed(5)}:${toLon.toFixed(5)}`;
    const hit = cached(cacheKey);
    if (hit) return res.status(200).json(hit);

    const key = getApiKey();
    const url = new URL(
      "https://api.geoapify.com/v1/routing"
    );

    url.searchParams.set(
      "waypoints",
      `${fromLat},${fromLon}|${toLat},${toLon}`
    );
    url.searchParams.set("mode", "drive");
    url.searchParams.set("format", "geojson");
    url.searchParams.set("details", "instruction_details");
    url.searchParams.set("apiKey", key);

    const data = await requestJson(url);
    const feature = data?.features?.[0];

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: "Road route available nahi hai"
      });
    }

    const coordinates = flattenRouteCoordinates(
      feature.geometry
    );

    const distanceKm =
      Number(feature.properties?.distance || 0) / 1000;

    const durationMinutes =
      Number(feature.properties?.time || 0) / 60;

    const payload = {
      success: true,
      data: {
        coordinates,
        distanceKm,
        durationMinutes,
        provider: "geoapify"
      }
    };

    return res.status(200).json(
      saveCache(cacheKey, payload, ROUTE_TTL_MS)
    );
  } catch (error) {
    return next(error);
  }
};

exports.health = (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      geoapifyConfigured: keyAvailable()
    }
  });
};
