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
  /* V103: Google Places results first, in Google's own order */
  if (place?.provider === "google") score += 1000 - Number(place.googleRank || 0) * 10;
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
        /* V103: Google record wins when the same point comes twice */
        if (place.provider === "google" || existing.provider === "google") {
          const gPrimary = place.provider === "google" ? place : existing;
          const gSecondary = gPrimary === place ? existing : place;
          byKey.set(key, { ...gSecondary, ...gPrimary });
          continue;
        }
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

/*
|--------------------------------------------------------------------------
| V103 ADD-ONLY: Google Places search (same places as Google Maps)
|--------------------------------------------------------------------------
| Google Places API (New) Autocomplete + Place Details (location only).
| Results go FIRST; Geoapify/Photon stay as fallback. If Google fails
| (API off, quota, network) search silently keeps working as before.
| Key: GOOGLE_MAPS_SERVER_KEY env (recommended) or the website browser key
| sent with the himrideg.com referrer.
*/
const V103_GOOGLE_BROWSER_KEY = "AIzaSyDCnPOtLmYzg4yeIjrE4sOLQy-DhVSG8_M";
const V103_GOOGLE_DETAILS_TTL_MS = 25 * 24 * 60 * 60 * 1000;
const V103_GOOGLE_TIMEOUT_MS = 4500;
const V103_GOOGLE_MAX_DETAILS = 6;

function v103GoogleKey() {
  return String(
    process.env.GOOGLE_MAPS_SERVER_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      V103_GOOGLE_BROWSER_KEY
  ).trim();
}

function v103GoogleEnabled() {
  return (
    String(process.env.GOOGLE_PLACES_ENABLED || "true").toLowerCase() !== "false" &&
    Boolean(v103GoogleKey())
  );
}

async function v103GoogleRequest(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), V103_GOOGLE_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": v103GoogleKey(),
        "X-Goog-FieldMask": options.fieldMask || "*",
        Referer: "https://www.himrideg.com/",
        ...(options.headers || {})
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {})
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Google Places ${response.status}: ${body.slice(0, 160)}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function v103Component(components, type) {
  const found = (components || []).find((item) =>
    Array.isArray(item?.types) && item.types.includes(type)
  );
  return String(found?.longText || found?.shortText || "").trim();
}

async function v103GooglePlaceDetails(placeId) {
  const cacheKey = `gpd:${placeId}`;
  const hit = await cachedAcrossInstances(cacheKey, V103_GOOGLE_DETAILS_TTL_MS);
  if (hit) return hit;

  const data = await v103GoogleRequest(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en&regionCode=IN`,
    { fieldMask: "location,formattedAddress,addressComponents,types" }
  );

  const latitude = Number(data?.location?.latitude);
  const longitude = Number(data?.location?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const components = data?.addressComponents || [];
  const details = {
    latitude,
    longitude,
    formattedAddress: String(data?.formattedAddress || "").trim(),
    village: v103Component(components, "sublocality") || v103Component(components, "neighborhood"),
    city:
      v103Component(components, "locality") ||
      v103Component(components, "administrative_area_level_3"),
    district: v103Component(components, "administrative_area_level_2"),
    state: v103Component(components, "administrative_area_level_1"),
    postcode: v103Component(components, "postal_code"),
    countryCode: v103Component(components, "country") ? "IN" : "IN",
    types: Array.isArray(data?.types) ? data.types : []
  };

  return saveCacheAcrossInstances(cacheKey, details, V103_GOOGLE_DETAILS_TTL_MS);
}

/* V111 ADD-ONLY: friendly suggestion labels instead of raw Google types */
const V111_TYPE_LABELS = [
  [["bus_station", "bus_stop", "transit_station"], "Bus stand"],
  [["train_station", "railway_station"], "Railway station"],
  [["airport"], "Airport"],
  [["taxi_stand"], "Taxi stand"],
  [["hospital", "doctor", "medical_lab", "dental_clinic"], "Hospital"],
  [["pharmacy", "drugstore"], "Pharmacy"],
  [["secondary_school", "primary_school", "school", "educational_institution"], "School"],
  [["university", "college"], "College"],
  [["hindu_temple", "church", "mosque", "gurudwara", "place_of_worship"], "Temple"],
  [["bank"], "Bank"],
  [["atm"], "ATM"],
  [["gas_station"], "Petrol pump"],
  [["police"], "Police station"],
  [["post_office"], "Post office"],
  [["local_government_office", "city_hall", "courthouse", "government_office"], "Office"],
  [["lodging", "hotel", "guest_house", "resort_hotel"], "Hotel"],
  [["restaurant", "cafe", "food", "meal_takeaway", "bakery"], "Restaurant"],
  [["shopping_mall", "market", "supermarket", "grocery_store", "store", "clothing_store", "electronics_store", "hardware_store"], "Shop"],
  [["park", "tourist_attraction", "stadium", "playground", "sports_complex"], "Landmark"],
  [["route", "street_address", "intersection"], "Road"],
  [["locality", "sublocality", "sublocality_level_1", "neighborhood", "administrative_area_level_3", "administrative_area_level_2", "postal_code", "geocode", "political"], "Area"]
];

function v111TypeLabel(types) {
  const list = Array.isArray(types) ? types : [];
  for (const [keys, label] of V111_TYPE_LABELS) {
    if (list.some((type) => keys.includes(type))) return label;
  }
  return "Place";
}

async function v103GoogleSearch(query, bias, limit) {
  if (!v103GoogleEnabled()) return [];

  const body = {
    input: query,
    includedRegionCodes: ["in"],
    languageCode: "en",
    regionCode: "IN"
  };

  if (bias && Number.isFinite(bias.latitude) && Number.isFinite(bias.longitude)) {
    body.locationBias = {
      circle: {
        center: { latitude: bias.latitude, longitude: bias.longitude },
        radius: 50000
      }
    };
    body.origin = { latitude: bias.latitude, longitude: bias.longitude };
  }

  const data = await v103GoogleRequest(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      body,
      fieldMask:
        "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.types,suggestions.placePrediction.distanceMeters"
    }
  );

  const predictions = (data?.suggestions || [])
    .map((item) => item?.placePrediction)
    .filter((item) => item?.placeId)
    .slice(0, Math.min(limit, V103_GOOGLE_MAX_DETAILS));

  const rows = await Promise.all(
    predictions.map(async (prediction, index) => {
      try {
        const details = await v103GooglePlaceDetails(prediction.placeId);
        if (!details) return null;
        const mainText = String(prediction?.structuredFormat?.mainText?.text || "").trim();
        const secondaryText = String(prediction?.structuredFormat?.secondaryText?.text || "").trim();
        const fullText = String(prediction?.text?.text || "").trim();
        const shortName = mainText || fullText.split(",")[0] || "Location";
        return {
          id: `google:${prediction.placeId}`,
          placeId: prediction.placeId,
          address:
            fullText ||
            [mainText, secondaryText].filter(Boolean).join(", ") ||
            details.formattedAddress ||
            shortName,
          shortName,
          secondaryText,
          village: details.village,
          suburb: "",
          district: details.district,
          town: details.city,
          latitude: details.latitude,
          longitude: details.longitude,
          city: details.city,
          state: details.state,
          postcode: details.postcode,
          country: "India",
          countryCode: "IN",
          type: (prediction.types || details.types || [])[0] || "place",
          /* V111: "School", "Bus stand", "Area" ... (never "Geocode") */
          type: v111TypeLabel([...(prediction.types || []), ...(details.types || [])]),
          provider: "google",
          googleRank: index,
          confidence: 1
        };
      } catch (error) {
        return null;
      }
    })
  );

  return rows.filter(Boolean);
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

    /* V103: Google Places (same results as Google Maps) */
    tasks.push(
      v103GoogleSearch(query, bias, limit).catch((error) => {
        console.warn("[V103] Google Places search failed:", error?.message || error);
        return [];
      })
    );

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

/*
|--------------------------------------------------------------------------
| V105 ADD-ONLY: Google "My Location" name + Google road distance
|--------------------------------------------------------------------------
| Reverse: nearest named place from Google Places (e.g. "Govt Senior
| Secondary School Kandbari") + area from Google Geocoding.
| Route: Google Routes API (same km / time as Google Maps).
| Any Google failure falls back to the old Geoapify code unchanged.
*/
const V105_NEAR_RADIUS_M = 200;
const V105_NEAR_MAX_USE_M = 150;
/* V106c: Ola/Uber style landmarks only (no private homes), up to 300 m */
const V106_LANDMARK_RADIUS_M = 300;
const V106_NEAR_PREFIX_M = 60;
const V106_GENERIC_TYPES = new Set([
  "point_of_interest",
  "establishment",
  "premise",
  "subpremise",
  "street_address",
  "route",
  "political",
  "plus_code",
  "geocode",
  "intersection"
]);
/* V106d: well-known landmarks win over a slightly closer small shop */
const V106_MAJOR_TYPES = new Set([
  "bus_station", "bus_stop", "transit_station", "train_station", "taxi_stand",
  "school", "primary_school", "secondary_school", "university", "college",
  "hospital", "doctor", "pharmacy",
  "hindu_temple", "place_of_worship", "church", "mosque", "gurudwara",
  "bank", "atm", "post_office", "police", "local_government_office", "city_hall", "courthouse",
  "shopping_mall", "market", "supermarket", "park", "stadium", "tourist_attraction",
  "gas_station", "hotel", "restaurant"
]);
const V106_MAJOR_BONUS_M = 80;
const V106_PRIVATE_NAME = /\b(residence|niwas|nivas|house of|home of|villa of)\b/i;
const V105_REVERSE_TTL_MS = 24 * 60 * 60 * 1000;
const V105_ROUTE_TTL_MS = 10 * 60 * 1000;

function v105DistanceM(a, b) {
  const km = haversineKm(a, b);
  return Number.isFinite(km) ? km * 1000 : Infinity;
}

function v105GeoComponent(components, type) {
  const found = (components || []).find(
    (item) => Array.isArray(item?.types) && item.types.includes(type)
  );
  return String(found?.long_name || "").trim();
}

async function v105GoogleGeocodeArea(latitude, longitude) {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${latitude},${longitude}`);
  url.searchParams.set("language", "en");
  url.searchParams.set("region", "in");
  url.searchParams.set("key", v103GoogleKey());

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), V103_GOOGLE_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Referer: "https://www.himrideg.com/" }
    });
    const data = await response.json();
    if (data?.status !== "OK") {
      throw new Error(`Google Geocoding ${data?.status || response.status}: ${data?.error_message || ""}`);
    }
    const results = Array.isArray(data.results) ? data.results : [];
    const all = results.flatMap((item) => item.address_components || []);
    const first = results.find(
      (item) => !looksLikePlusCode(item?.formatted_address)
    ) || results[0] || {};
    return {
      village:
        v105GeoComponent(all, "sublocality_level_1") ||
        v105GeoComponent(all, "sublocality") ||
        v105GeoComponent(all, "neighborhood"),
      city:
        v105GeoComponent(all, "locality") ||
        v105GeoComponent(all, "administrative_area_level_3"),
      district: v105GeoComponent(all, "administrative_area_level_2"),
      state: v105GeoComponent(all, "administrative_area_level_1"),
      postcode: v105GeoComponent(all, "postal_code"),
      formatted: String(first?.formatted_address || "").replace(/^[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3},?\s*/i, "").trim()
    };
  } finally {
    clearTimeout(timer);
  }
}

async function v105GoogleNearestPlace(latitude, longitude) {
  const data = await v103GoogleRequest(
    "https://places.googleapis.com/v1/places:searchNearby",
    {
      method: "POST",
      fieldMask:
        "places.displayName,places.location,places.shortFormattedAddress,places.formattedAddress,places.types,places.addressComponents",
      body: {
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: Math.max(V105_NEAR_RADIUS_M, V106_LANDMARK_RADIUS_M)
          }
        },
        rankPreference: "DISTANCE",
        maxResultCount: 15,
        languageCode: "en",
        regionCode: "IN"
      }
    }
  );

  const here = { latitude, longitude };
  const places = (data?.places || [])
    .map((place) => {
      const point = {
        latitude: Number(place?.location?.latitude),
        longitude: Number(place?.location?.longitude)
      };
      return {
        name: String(place?.displayName?.text || "").trim(),
        address: String(place?.shortFormattedAddress || place?.formattedAddress || "").trim(),
        types: Array.isArray(place?.types) ? place.types : [],
        /* V106: area from Places itself (Geocoding web API rejects website keys) */
        components: Array.isArray(place?.addressComponents) ? place.addressComponents : [],
        distanceM: v105DistanceM(here, point)
      };
    })
    .filter(
      (place) =>
        place.name &&
        !looksLikePlusCode(place.name) &&
        Number.isFinite(place.distanceM) &&
        place.distanceM <= Math.max(V105_NEAR_MAX_USE_M, V106_LANDMARK_RADIUS_M) &&
        /* V106c: real landmark types only, never a private home */
        place.types.some((type) => !V106_GENERIC_TYPES.has(type)) &&
        !V106_PRIVATE_NAME.test(place.name) &&
        !place.types.includes("route") &&
        !place.types.includes("political")
    )
    .sort((a, b) => a.distanceM - b.distanceM);

  /* V106d: prefer bus stand / school / hospital / temple etc. close by */
  const v106Score = (place) =>
    place.distanceM - (place.types.some((type) => V106_MAJOR_TYPES.has(type)) ? V106_MAJOR_BONUS_M : 0);
  places.sort((a, b) => v106Score(a) - v106Score(b));

  return places[0] || null;
}

/*
| V106e ADD-ONLY: driver-friendly pickup text ("Near Saperu, Kandbari Road")
| Village / road names come from Geoapify (OpenStreetMap knows small
| Himachal villages well); Google road name used when available.
*/
async function v106GeoapifyArea(latitude, longitude) {
  if (!keyAvailable()) return null;
  const url = new URL("https://api.geoapify.com/v1/geocode/reverse");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("format", "json");
  url.searchParams.set("lang", "en");
  url.searchParams.set("apiKey", getApiKey());
  const data = await requestJson(url);
  const item = data?.results?.[0] || {};
  const clean = (value) => {
    const text = String(value || "").trim();
    return text && !looksLikePlusCode(text) ? text : "";
  };
  return {
    village: clean(item.village || item.hamlet || item.suburb || item.neighbourhood || item.quarter),
    road: clean(item.street),
    city: clean(item.city || item.town || item.municipality)
  };
}

function v106DriverText({ geo, near, area }) {
  const googleRoad = near?.components?.length ? v103Component(near.components, "route") : "";
  const village = geo?.village || area?.village || "";
  const road = googleRoad || geo?.road || "";
  const city = geo?.city || area?.city || "";
  const parts = [];
  for (const part of [village, road, city]) {
    const text = String(part || "").trim();
    if (!text) continue;
    if (/^(unnamed road|road)$/i.test(text)) continue;
    if (parts.some((p) => p.toLowerCase() === text.toLowerCase())) continue;
    parts.push(text);
  }
  if (!parts.length) return "";
  return `Near ${parts.join(", ")}`;
}

/* V106e: short top-bar name, e.g. "Saperu, Kandbari Road" (no city, no "Near") */
function v106AreaShort({ geo, near, area }) {
  const text = v106DriverText({ geo: { ...(geo || {}), city: "" }, near, area: { ...(area || {}), city: "" } });
  return text ? text.replace(/^Near\s+/i, "") : "";
}

async function v105GoogleReverse(latitude, longitude) {
  if (!v103GoogleEnabled()) return null;

  const cacheKey = `rvg6:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;
  const hit = await cachedAcrossInstances(cacheKey, V105_REVERSE_TTL_MS);
  if (hit) return { ...hit, latitude, longitude };

  /* V106e: village + road names for the driver, in parallel */
  const v106GeoPromise = v106GeoapifyArea(latitude, longitude).catch((error) => {
    console.warn("[V106e] Geoapify area failed:", error?.message || error);
    return null;
  });

  const [near, area] = await Promise.all([
    v105GoogleNearestPlace(latitude, longitude).catch((error) => {
      console.warn("[V105] Google nearby failed:", error?.message || error);
      return null;
    }),
    v105GoogleGeocodeArea(latitude, longitude).catch((error) => {
      console.warn("[V105] Google geocode failed:", error?.message || error);
      return null;
    })
  ]);

  if (!near && !area) return null;

  /* V106: Geocoding failed -> area from the nearby place's own address */
  let v106Area = area;
  if (!v106Area && near && near.components.length) {
    v106Area = {
      village:
        v103Component(near.components, "sublocality_level_1") ||
        v103Component(near.components, "sublocality") ||
        v103Component(near.components, "neighborhood"),
      city:
        v103Component(near.components, "locality") ||
        v103Component(near.components, "administrative_area_level_3"),
      district: v103Component(near.components, "administrative_area_level_2"),
      state: v103Component(near.components, "administrative_area_level_1"),
      postcode: v103Component(near.components, "postal_code"),
      formatted: ""
    };
  }
  if (near) {
    /* V106: never show Google plus codes like "W96J+578" */
    near.address = String(near.address || "")
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part && !looksLikePlusCode(part))
      .join(", ");
  }

  const areaName =
    v106Area?.village || v106Area?.city || v106Area?.district || "";
  const areaLine = [v106Area?.village, v106Area?.city, v106Area?.district, v106Area?.state]
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index)
    .join(", ");

  /* V106: "Government Senior Secondary School, Kandbari" like Ola/Uber */
  const v106Place = String(v106Area?.village || v106Area?.city || "").trim();
  const shortName = near?.name
    ? v106Place && !near.name.toLowerCase().includes(v106Place.toLowerCase())
      ? `${near.name}, ${v106Place}`
      : near.name
    : areaName || "My Location";
  /* V106c: landmark a little away -> "Near ..." like Ola/Uber */
  const v106Near = near && near.distanceM > V106_NEAR_PREFIX_M;
  const v106ShortName = v106Near ? `Near ${shortName}` : shortName;
  const address = near
    ? [v106Near ? `Near ${near.name}` : near.name, areaLine || near.address].filter(Boolean).join(", ")
    : v106Area?.formatted || areaLine || shortName;

  const v106Geo = await v106GeoPromise;
  const v106DriverAddress = v106DriverText({ geo: v106Geo, near, area: v106Area });
  const v106ShortArea = v106AreaShort({ geo: v106Geo, near, area: v106Area });

  const location = {
    id: `google-rv:${latitude.toFixed(5)},${longitude.toFixed(5)}`,
    address,
    /* V106e: what the driver sees, e.g. "Near Saperu, Kandbari Road, Palampur" */
    address: v106DriverAddress || address,
    driverAddress: v106DriverAddress || address,
    landmarkAddress: address,
    landmark: near ? (v106Near ? `Near ${near.name}` : near.name) : "",
    shortName: v106ShortName,
    /* V106e: apps/top bar show the village/road, never just the state */
    shortName: v106ShortArea || v106ShortName,
    nearbyPlace: near?.name || "",
    nearbyDistanceM: near ? Math.round(near.distanceM) : null,
    village: v106Area?.village || "",
    suburb: "",
    district: v106Area?.district || "",
    town: v106Area?.city || "",
    latitude,
    longitude,
    city: v106Area?.city || v106Area?.village || "",
    state: v106Area?.state || "",
    postcode: v106Area?.postcode || "",
    country: "India",
    provider: "google",
    confidence: 1
  };

  await saveCacheAcrossInstances(cacheKey, location, V105_REVERSE_TTL_MS);
  return location;
}

function v105DecodePolyline(encoded) {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const text = String(encoded || "");
  while (index < text.length) {
    let result = 0;
    let shift = 0;
    let byte;
    do {
      byte = text.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < text.length);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    result = 0;
    shift = 0;
    do {
      byte = text.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < text.length);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

async function v105GoogleRoute(fromLat, fromLon, toLat, toLon) {
  if (!v103GoogleEnabled()) return null;

  const data = await v103GoogleRequest(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      fieldMask: "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
      body: {
        origin: { location: { latLng: { latitude: fromLat, longitude: fromLon } } },
        destination: { location: { latLng: { latitude: toLat, longitude: toLon } } },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        languageCode: "en-IN",
        regionCode: "IN",
        units: "METRIC"
      }
    }
  );

  const route = data?.routes?.[0];
  const distanceMeters = Number(route?.distanceMeters);
  if (!route || !Number.isFinite(distanceMeters) || distanceMeters <= 0) return null;

  const seconds = Number(String(route.duration || "0").replace(/s$/, ""));
  const coordinates = v105DecodePolyline(route?.polyline?.encodedPolyline).filter(
    ([latitude, longitude]) => Number.isFinite(latitude) && Number.isFinite(longitude)
  );

  return {
    coordinates,
    distanceKm: distanceMeters / 1000,
    durationMinutes: Number.isFinite(seconds) ? seconds / 60 : 0,
    provider: "google"
  };
}

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

    /* V105: Google nearby place name first */
    try {
      const googleLocation = await v105GoogleReverse(latitude, longitude);
      if (googleLocation) {
        return res.status(200).json({
          success: true,
          data: { location: googleLocation, provider: "google" }
        });
      }
    } catch (error) {
      console.warn("[V105] Google reverse failed:", error?.message || error);
    }

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

    /* V105: Google road route first (same km/time as Google Maps) */
    try {
      const googleCacheKey = `rtg:${fromLat.toFixed(5)}:${fromLon.toFixed(5)}:${toLat.toFixed(5)}:${toLon.toFixed(5)}`;
      const googleHit = await cachedAcrossInstances(googleCacheKey, V105_ROUTE_TTL_MS);
      if (googleHit) return res.status(200).json(googleHit);
      const googleRoute = await v105GoogleRoute(fromLat, fromLon, toLat, toLon);
      if (googleRoute) {
        return res.status(200).json(
          await saveCacheAcrossInstances(
            googleCacheKey,
            { success: true, data: googleRoute },
            V105_ROUTE_TTL_MS
          )
        );
      }
    } catch (error) {
      console.warn("[V105] Google route failed:", error?.message || error);
    }

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

/*
|--------------------------------------------------------------------------
| V106 ADD-ONLY: nearby available cars (Ola/Uber style home map)
|--------------------------------------------------------------------------
| GET /api/v2/maps/nearby-drivers?lat=..&lon=..
| - only online + available + approved drivers with fresh GPS (3 min)
| - driver privacy: no name/phone/id; every car is shown ~60-120 m away
|   from its real spot (fixed per driver per day, so movement stays smooth)
| - nearestEtaMinutes: Google road time from the nearest car (fallback:
|   distance estimate)
*/
const V106_NEARBY_RADIUS_M = 8000;
const V106_NEARBY_LIMIT = 12;
const V106_FRESH_MS = 3 * 60 * 1000;
const V106_ETA_TTL_MS = 60 * 1000;
const V106_SALT = require("crypto").randomBytes(16).toString("hex");

function v106PublicCar(driver) {
  const crypto = require("crypto");
  const day = new Date().toISOString().slice(0, 10);
  const digest = crypto
    .createHash("sha256")
    .update(`${V106_SALT}:${day}:${String(driver?._id || "")}`)
    .digest();
  const angle = (digest[0] / 255) * Math.PI * 2;
  const meters = 60 + (digest[1] / 255) * 60;
  const latitude = Number(driver?.currentLocation?.latitude);
  const longitude = Number(driver?.currentLocation?.longitude);
  const dLat = (meters * Math.cos(angle)) / 111320;
  const dLng =
    (meters * Math.sin(angle)) /
    (111320 * Math.max(0.2, Math.cos((latitude * Math.PI) / 180)));
  const rawHeading = driver?.currentLocation?.heading;
  const heading = rawHeading === null || rawHeading === undefined ? NaN : Number(rawHeading);
  return {
    id: digest.subarray(2, 10).toString("hex"),
    latitude: Number((latitude + dLat).toFixed(6)),
    longitude: Number((longitude + dLng).toFixed(6)),
    heading: Number.isFinite(heading) ? Math.round(heading) : null,
    vehicleType: String(
      driver?.driverProfile?.vehicleType ||
        driver?.driverProfile?.vehicle?.type ||
        ""
    ).toLowerCase(),
    distanceM: Math.round((Number(driver?.distanceMeters) || 0) / 100) * 100
  };
}

function v106EstimateEtaMinutes(distanceM) {
  const roadKm = (Number(distanceM) || 0) * 1.4 / 1000;
  return Math.max(1, Math.round((roadKm / 24) * 60 + 1));
}

exports.nearbyDrivers = async (req, res, next) => {
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

    const User = require("../models/User");
    const rows = await User.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distanceMeters",
          spherical: true,
          maxDistance: V106_NEARBY_RADIUS_M,
          key: "currentLocation.geo",
          query: {
            role: "driver",
            isActive: true,
            accountStatus: "active",
            isOnline: true,
            isAvailable: true,
            currentRide: null,
            "driverProfile.isApproved": true,
            "currentLocation.updatedAt": {
              $gte: new Date(Date.now() - V106_FRESH_MS)
            }
          }
        }
      },
      { $limit: V106_NEARBY_LIMIT },
      {
        $project: {
          currentLocation: 1,
          distanceMeters: 1,
          "driverProfile.vehicleType": 1,
          "driverProfile.vehicle.type": 1
        }
      }
    ]);

    const cars = rows
      .filter(
        (row) =>
          Number.isFinite(Number(row?.currentLocation?.latitude)) &&
          Number.isFinite(Number(row?.currentLocation?.longitude))
      )
      .map(v106PublicCar);

    let nearestEtaMinutes = null;
    let etaSource = null;
    const nearest = rows[0];
    if (nearest) {
      nearestEtaMinutes = v106EstimateEtaMinutes(nearest.distanceMeters);
      etaSource = "estimate";
      try {
        const etaKey = `nde:${latitude.toFixed(3)}:${longitude.toFixed(3)}`;
        let eta = await cachedAcrossInstances(etaKey, V106_ETA_TTL_MS);
        if (!eta) {
          const route = await v105GoogleRoute(
            Number(nearest.currentLocation.latitude),
            Number(nearest.currentLocation.longitude),
            latitude,
            longitude
          );
          if (route && Number.isFinite(route.durationMinutes)) {
            eta = { minutes: Math.max(1, Math.round(route.durationMinutes)) };
            await saveCacheAcrossInstances(etaKey, eta, V106_ETA_TTL_MS);
          }
        }
        if (eta && Number.isFinite(eta.minutes)) {
          nearestEtaMinutes = eta.minutes;
          etaSource = "google";
        }
      } catch (error) {
        console.warn("[V106] nearby ETA failed:", error?.message || error);
      }
    }

    res.set("Cache-Control", "no-store");
    return res.status(200).json({
      success: true,
      data: {
        drivers: cars,
        count: cars.length,
        nearestEtaMinutes,
        etaSource,
        radiusKm: V106_NEARBY_RADIUS_M / 1000
      }
    });
  } catch (error) {
    return next(error);
  }
};

exports.health = (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      geoapifyConfigured: keyAvailable(),
      /* V103 */
      googlePlacesEnabled: v103GoogleEnabled()
    }
  });
};
