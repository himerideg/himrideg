const {
  getMapCache,
  setMapCache
} = require(
  "../services/mapCacheService"
);

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


/*
|--------------------------------------------------------------------------
| Phase 4 Shared Cache Wrapper
|--------------------------------------------------------------------------
| Local Map() cache stays L1. Redis is only an additive shared L2 cache.
| Redis failure never blocks Geoapify or current map behavior.
*/
async function cachedAcrossInstances(
  key,
  ttl
) {
  const localHit = cached(key);

  if (localHit) {
    return localHit;
  }

  const redisHit =
    await getMapCache(key);

  if (!redisHit) {
    return null;
  }

  return saveCache(
    key,
    redisHit,
    ttl
  );
}

async function saveCacheAcrossInstances(
  key,
  value,
  ttl
) {
  const saved = saveCache(
    key,
    value,
    ttl
  );

  await setMapCache(
    key,
    value,
    ttl
  );

  return saved;
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

function looksLikePlusCode(value) {
  return /^[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}(?:\b|,)/i.test(
    String(value || "").trim()
  );
}

function cleanPlaceName(item = {}) {
  const candidates = [
    item.village,
    item.hamlet,
    item.suburb,
    item.neighbourhood,
    item.district,
    item.town,
    item.city,
    item.municipality,
    item.county,
    item.name,
    item.address_line1
  ];

  for (const value of candidates) {
    const text = String(value || "").trim();
    if (!text || looksLikePlusCode(text)) continue;
    return text.split(",")[0].trim();
  }

  return "Location";
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
      cleanPlaceName(item),
    village: item.village || item.hamlet || "",
    suburb: item.suburb || item.neighbourhood || "",
    district: item.district || "",
    town: item.town || item.municipality || "",
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


function normalizeSearchText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function searchTokens(value) {
  return normalizeSearchText(value).split(" ").filter(Boolean);
}

function editDistance(leftValue, rightValue) {
  const left = normalizeSearchText(leftValue);
  const right = normalizeSearchText(rightValue);
  if (!left) return right.length;
  if (!right) return left.length;

  const previous = Array.from(
    { length: right.length + 1 },
    (_, index) => index
  );

  for (let i = 1; i <= left.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost
      );
    }
    for (let j = 0; j < current.length; j += 1) {
      previous[j] = current[j];
    }
  }

  return previous[right.length];
}

function fuzzySimilarity(a, b) {
  const left = normalizeSearchText(a);
  const right = normalizeSearchText(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (right.startsWith(left) || left.startsWith(right)) return 0.94;
  if (right.includes(left) || left.includes(right)) return 0.86;
  const maxLength = Math.max(left.length, right.length);
  return maxLength
    ? Math.max(0, 1 - editDistance(left, right) / maxLength)
    : 0;
}

function haversineKm(a, b) {
  if (!a || !b) return null;
  const lat1 = Number(a.latitude);
  const lon1 = Number(a.longitude);
  const lat2 = Number(b.latitude);
  const lon2 = Number(b.longitude);
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null;

  const toRad = (value) => (value * Math.PI) / 180;
  const earthKm = 6371.0088;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const p1 = toRad(lat1);
  const p2 = toRad(lat2);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dLon / 2) ** 2;
  return earthKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function photonAddress(properties = {}) {
  const parts = [
    properties.name,
    [properties.housenumber, properties.street].filter(Boolean).join(" "),
    properties.locality,
    properties.district,
    properties.city,
    properties.county,
    properties.state,
    properties.postcode,
    properties.country
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return [...new Set(parts)].join(", ");
}

function photonToLocation(feature = {}, index = 0) {
  const properties = feature.properties || {};
  const coordinates = feature.geometry?.coordinates || [];
  const longitude = Number(coordinates[0]);
  const latitude = Number(coordinates[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const shortName =
    String(properties.name || "").trim() ||
    String(properties.street || "").trim() ||
    String(properties.locality || properties.city || "").trim() ||
    "Location";

  return {
    id: properties.osm_id
      ? `${properties.osm_type || "P"}:${properties.osm_id}`
      : `photon:${latitude}:${longitude}:${index}`,
    address: photonAddress(properties) || shortName,
    shortName,
    village: String(properties.locality || "").trim(),
    suburb: "",
    district: String(properties.district || properties.county || "").trim(),
    town: String(properties.city || "").trim(),
    latitude,
    longitude,
    city: String(properties.city || properties.locality || "").trim(),
    state: String(properties.state || "").trim(),
    postcode: String(properties.postcode || "").trim(),
    country: String(properties.country || "India").trim(),
    countryCode: String(properties.countrycode || "IN").toUpperCase(),
    type: String(properties.type || properties.osm_value || properties.osm_key || "place"),
    provider: "photon",
    confidence: 0
  };
}

function rankLocation(place, query, bias) {
  const q = normalizeSearchText(query);
  const name = normalizeSearchText(place?.shortName);
  const address = normalizeSearchText(place?.address);
  const tokens = searchTokens(query);
  let score = 0;

  if (name === q) score += 160;
  else if (name.startsWith(q)) score += 125;
  else if (name.includes(q)) score += 105;
  else if (address.includes(q)) score += 72;

  score += Math.max(
    fuzzySimilarity(query, place?.shortName),
    fuzzySimilarity(query, `${place?.shortName || ""} ${place?.city || ""}`)
  ) * 70;

  if (tokens.length) {
    const haystack = `${name} ${address}`;
    const matched = tokens.filter((token) => haystack.includes(token)).length;
    score += (matched / tokens.length) * 55;
  }

  if (place?.provider === "geoapify") score += 12;
  if (normalizeSearchText(place?.state).includes("himachal")) score += 16;

  const distanceKm = haversineKm(bias, place);
  if (Number.isFinite(distanceKm)) {
    if (distanceKm <= 3) score += 58;
    else if (distanceKm <= 10) score += 48;
    else if (distanceKm <= 25) score += 38;
    else if (distanceKm <= 60) score += 25;
    else if (distanceKm <= 120) score += 12;
    else if (distanceKm > 350) score -= 35;
  }

  return { score, distanceKm };
}

function mergeSearchResults(groups, query, bias, limit) {
  const byKey = new Map();

  for (const group of groups) {
    for (const place of group || []) {
      if (!place) continue;
      const latitude = Number(place.latitude);
      const longitude = Number(place.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

      const countryCode = String(place.countryCode || "").toUpperCase();
      const country = normalizeSearchText(place.country);
      if ((countryCode && countryCode !== "IN") || (country && country !== "india")) {
        continue;
      }

      const key = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, place);
      } else {
        const primary = place.provider === "geoapify" ? place : existing;
        const secondary = primary === place ? existing : place;
        byKey.set(key, {
          ...secondary,
          ...primary,
          address: primary.address || secondary.address,
          city: primary.city || secondary.city,
          district: primary.district || secondary.district,
          state: primary.state || secondary.state,
          postcode: primary.postcode || secondary.postcode,
          type: primary.type || secondary.type
        });
      }
    }
  }

  return [...byKey.values()]
    .map((place) => {
      const ranking = rankLocation(place, query, bias);
      return { ...place, distanceKm: ranking.distanceKm, _score: ranking.score };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map(({ _score, ...place }) => place);
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
        data: { results: [] }
      });
    }

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      12
    );

    const latitude = Number(req.query.lat);
    const longitude = Number(req.query.lon);
    const bias = {
      latitude: Number.isFinite(latitude) ? latitude : DEFAULT_CENTER.latitude,
      longitude: Number.isFinite(longitude) ? longitude : DEFAULT_CENTER.longitude
    };

    const cacheKey = `ac2:${query.toLowerCase()}:${limit}:${bias.latitude.toFixed(2)}:${bias.longitude.toFixed(2)}`;
    const hit = await cachedAcrossInstances(cacheKey, AUTOCOMPLETE_TTL_MS);
    if (hit) return res.status(200).json(hit);

    const tasks = [];

    if (keyAvailable()) {
      const geoUrl = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
      geoUrl.searchParams.set("text", query);
      geoUrl.searchParams.set("format", "json");
      geoUrl.searchParams.set("limit", String(Math.min(limit, 10)));
      geoUrl.searchParams.set("filter", "countrycode:in");
      geoUrl.searchParams.set("bias", `proximity:${bias.longitude},${bias.latitude}`);
      geoUrl.searchParams.set("lang", "en");
      geoUrl.searchParams.set("apiKey", getApiKey());

      tasks.push(
        requestJson(geoUrl)
          .then((data) => (data?.results || []).map(toLocation).filter(Boolean).map((item) => ({
            ...item,
            provider: "geoapify",
            type: item.type || "place",
            countryCode: "IN"
          })))
          .catch(() => [])
      );
    }

    const queryVariants = [query];
    const normalized = normalizeSearchText(query);
    if (
      normalized.length >= 4 &&
      !normalized.includes("himachal") &&
      !normalized.includes("india")
    ) {
      queryVariants.push(`${query} Himachal Pradesh`);
    }

    for (const variant of queryVariants.slice(0, 2)) {
      const photonUrl = new URL("https://photon.komoot.io/api");
      photonUrl.searchParams.set("q", variant);
      photonUrl.searchParams.set("limit", String(limit));
      photonUrl.searchParams.set("lang", "en");
      photonUrl.searchParams.set("lat", String(bias.latitude));
      photonUrl.searchParams.set("lon", String(bias.longitude));
      photonUrl.searchParams.set("location_bias_scale", "0.35");
      photonUrl.searchParams.set("zoom", "13");
      photonUrl.searchParams.set("dedupe", "1");

      tasks.push(
        requestJson(photonUrl)
          .then((data) => (data?.features || []).map(photonToLocation).filter(Boolean))
          .catch(() => [])
      );
    }

    const groups = await Promise.all(tasks);
    const results = mergeSearchResults(groups, query, bias, limit);

    const payload = {
      success: true,
      data: {
        results,
        provider: keyAvailable() ? "geoapify+photon" : "photon",
        locationBias: bias
      }
    };

    return res.status(200).json(
      await saveCacheAcrossInstances(cacheKey, payload, AUTOCOMPLETE_TTL_MS)
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
    const hit = await cachedAcrossInstances(
      cacheKey,
      REVERSE_TTL_MS
    );
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
      await saveCacheAcrossInstances(
        cacheKey,
        payload,
        REVERSE_TTL_MS
      )
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
    const hit = await cachedAcrossInstances(
      cacheKey,
      ROUTE_TTL_MS
    );
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
      await saveCacheAcrossInstances(
        cacheKey,
        payload,
        ROUTE_TTL_MS
      )
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
