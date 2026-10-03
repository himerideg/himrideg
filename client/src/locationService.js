import api from "./api";

const locationSearchCache = new Map();

export function normalizeLocation(value) {
  if (!value) return null;

  if (Array.isArray(value) && value.length >= 2) {
    const latitude = Number(value[0]);
    const longitude = Number(value[1]);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return {
        latitude,
        longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        shortName: "Location"
      };
    }
  }

  const latitude = Number(value.latitude ?? value.lat);
  const longitude = Number(value.longitude ?? value.lng ?? value.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    ...value,
    latitude,
    longitude,
    address:
      value.address ||
      value.formatted ||
      value.display_name ||
      `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    shortName:
      value.shortName ||
      value.name ||
      value.address?.split(",")?.[0] ||
      "Location",
    city: value.city || value.town || value.village || "",
    district: value.district || value.county || "",
    state: value.state || "",
    type: value.type || "place",
    provider: value.provider || "himrideg",
    distanceKm: Number.isFinite(Number(value.distanceKm)) ? Number(value.distanceKm) : null
  };
}

export async function searchLocations(query, options = {}) {
  const text = String(query || "").trim();
  if (text.length < 2) return [];

  const cacheKey = `${text.toLowerCase()}|${Number(options.latitude || 0).toFixed(2)}|${Number(options.longitude || 0).toFixed(2)}`;
  const cached = locationSearchCache.get(cacheKey);
  if (cached && Date.now() - cached.savedAt < 90000) return cached.results;

  const response = await api.get("/maps/autocomplete", {
    params: {
      q: text,
      limit: options.limit || 7,
      ...(Number.isFinite(Number(options.latitude))
        ? { lat: Number(options.latitude) }
        : {}),
      ...(Number.isFinite(Number(options.longitude))
        ? { lon: Number(options.longitude) }
        : {})
    },
    signal: options.signal
  });

  const rows =
    response.data?.data?.results ||
    response.data?.results ||
    [];

  const results = (Array.isArray(rows) ? rows : [])
    .map(normalizeLocation)
    .filter(Boolean);

  locationSearchCache.set(cacheKey, { savedAt: Date.now(), results });
  if (locationSearchCache.size > 30) {
    locationSearchCache.delete(locationSearchCache.keys().next().value);
  }

  return results;
}

export async function reverseLocation(latitude, longitude, options = {}) {
  const response = await api.get("/maps/reverse", {
    params: {
      lat: Number(latitude),
      lon: Number(longitude)
    },
    signal: options.signal
  });

  return normalizeLocation(
    response.data?.data?.location ||
      response.data?.location
  );
}

export async function getRoadRoute(start, end, options = {}) {
  const from = normalizeLocation(start);
  const to = normalizeLocation(end);

  if (!from || !to) {
    throw new Error("Pickup/drop coordinates required hain");
  }

  const response = await api.get("/maps/route", {
    params: {
      fromLat: from.latitude,
      fromLon: from.longitude,
      toLat: to.latitude,
      toLon: to.longitude
    },
    signal: options.signal
  });

  const data = response.data?.data || {};

  return {
    coordinates: Array.isArray(data.coordinates)
      ? data.coordinates
      : [],
    distanceKm: Number(data.distanceKm || 0),
    durationMinutes: Number(data.durationMinutes || 0),
    provider: data.provider || "geoapify"
  };
}

function geolocationErrorMessage(error) {
  if (!error) return "Current location nahi mil saki";

  if (error.code === 1) {
    return "Location permission allow karein, phir My Location dobara dabayein.";
  }

  if (error.code === 2) {
    return "GPS/location unavailable hai. Location services ON karein.";
  }

  if (error.code === 3) {
    return "GPS response timeout hua. Open area me dobara try karein.";
  }

  return error.message || "Current location nahi mil saki";
}

export function getHighAccuracyBrowserLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Browser geolocation support nahi karta"));
      return;
    }

    const targetAccuracy = Number(options.targetAccuracy || 30);
    const maxWaitMs = Number(options.maxWaitMs || 9000);

    let best = null;
    let watchId = null;
    let finished = false;

    const finish = (value, error = null) => {
      if (finished) return;
      finished = true;

      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      window.clearTimeout(timer);

      if (value) {
        resolve(value);
      } else {
        reject(
          error instanceof Error
            ? error
            : new Error(geolocationErrorMessage(error))
        );
      }
    };

    const onPosition = (position) => {
      const accuracy = Number(position.coords.accuracy || Infinity);
      const sample = {
        latitude: Number(position.coords.latitude),
        longitude: Number(position.coords.longitude),
        accuracy,
        heading: Number.isFinite(Number(position.coords.heading))
          ? Number(position.coords.heading)
          : null,
        speed: Number.isFinite(Number(position.coords.speed))
          ? Number(position.coords.speed)
          : null,
        timestamp: Number(position.timestamp || Date.now())
      };

      if (
        !best ||
        sample.accuracy < best.accuracy
      ) {
        best = sample;
      }

      if (sample.accuracy <= targetAccuracy) {
        finish(sample);
      }
    };

    const onError = (error) => {
      if (best) {
        finish(best);
        return;
      }
      finish(null, new Error(geolocationErrorMessage(error)));
    };

    watchId = navigator.geolocation.watchPosition(
      onPosition,
      onError,
      {
        enableHighAccuracy: true,
        timeout: Math.min(maxWaitMs, 10000),
        maximumAge: 0
      }
    );

    const timer = window.setTimeout(() => {
      if (best) {
        finish(best);
      } else {
        finish(null, new Error("High-accuracy GPS location nahi mili"));
      }
    }, maxWaitMs);
  });
}
