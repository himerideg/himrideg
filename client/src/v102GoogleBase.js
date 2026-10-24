/*
|--------------------------------------------------------------------------
| V102 ADD-ONLY: Google Map base layer under the existing Leaflet map
|--------------------------------------------------------------------------
| The whole HimRideG map (markers, route, pins, taps) stays on Leaflet.
| This only draws Google's official map (Maps JavaScript API) *behind* it
| and keeps it in sync with Leaflet's center/zoom.
|
| - OpenStreetMap tiles stay loaded underneath. They are hidden only after
|   Google's map has really painted, and shown again if Google fails
|   (bad key, quota, no internet) — so the map never goes blank.
| - Google map receives no touches (pointer-events: none); Leaflet keeps
|   handling every gesture exactly as before.
|
| Plain ES5 on purpose: the apps inject the same code into their WebView
| map (MapPanel.js, src/components/V102GoogleBaseSource.js).
|--------------------------------------------------------------------------
*/

/* Browser key, restricted in Google Cloud to himrideg.com (+ localhost). */
export const HRG_GOOGLE_MAPS_KEY = "AIzaSyDCnPOtLmYzg4yeIjrE4sOLQy-DhVSG8_M";

/* eslint-disable no-var */
export function hrgInstallGoogleBase(L, map, opts) {
  opts = opts || {};
  if (!L || !map || !opts.key || typeof document === "undefined") return null;

  var w = window;
  var container = map.getContainer();
  var div = document.createElement("div");
  div.className = "hrg-gmap";
  div.style.cssText =
    "position:absolute;left:0;top:0;right:0;bottom:0;z-index:0;pointer-events:none;";
  container.insertBefore(div, container.firstChild);

  var gmap = null;
  var ready = false;
  var dead = false;
  var removed = false;
  var timer = null;

  function tilePane() {
    try {
      return map.getPane("tilePane");
    } catch (e) {
      return null;
    }
  }

  function showOsm(show) {
    var tp = tilePane();
    if (tp) tp.style.opacity = show ? "" : "0";
  }

  function camera(center, zoom) {
    if (!gmap || dead) return;
    try {
      gmap.moveCamera({ center: { lat: center.lat, lng: center.lng }, zoom: zoom });
    } catch (e) {}
  }

  function sync() {
    try {
      camera(map.getCenter(), map.getZoom());
    } catch (e) {}
  }

  function onZoomAnim(e) {
    if (e && e.center) camera(e.center, e.zoom);
  }

  function onResize() {
    try {
      if (w.google && w.google.maps && gmap) w.google.maps.event.trigger(gmap, "resize");
    } catch (e) {}
    sync();
  }

  function detach() {
    try {
      map.off("move zoom viewreset", sync);
      map.off("zoomanim", onZoomAnim);
      map.off("resize", onResize);
    } catch (e) {}
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    try {
      if (div.parentNode) div.parentNode.removeChild(div);
    } catch (e) {}
  }

  function fail(reason) {
    if (dead || removed) return;
    dead = true;
    detach();
    showOsm(true);
    if (opts.onError) {
      try {
        opts.onError(reason);
      } catch (e) {}
    }
  }

  function init() {
    if (dead || removed) return;
    /* Leaflet map without a center yet: wait for its first setView. */
    if (!map._loaded) {
      map.once("load", init);
      return;
    }
    try {
      var c = map.getCenter();
      gmap = new w.google.maps.Map(div, {
        center: { lat: c.lat, lng: c.lng },
        zoom: map.getZoom(),
        disableDefaultUI: true,
        gestureHandling: "none",
        keyboardShortcuts: false,
        clickableIcons: false,
        isFractionalZoomEnabled: true,
        backgroundColor: opts.dark ? "#11161a" : "#eef1f3"
      });
      w.google.maps.event.addListenerOnce(gmap, "tilesloaded", function () {
        if (dead || removed) return;
        ready = true;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        showOsm(false);
        if (opts.onReady) {
          try {
            opts.onReady();
          } catch (e) {}
        }
      });
      map.on("move zoom viewreset", sync);
      map.on("zoomanim", onZoomAnim);
      map.on("resize", onResize);
      /* V106c ADD-ONLY: map shown later (panel opens / tab switch) */
      try {
        if (typeof w.ResizeObserver === "function") {
          var v106Ro = new w.ResizeObserver(function () {
            if (dead || removed) {
              try { v106Ro.disconnect(); } catch (e2) {}
              return;
            }
            onResize();
          });
          v106Ro.observe(container);
        }
      } catch (e3) {}
    } catch (e) {
      fail("init");
    }
  }

  /* Google calls this when the key is rejected (referrer, billing, ...). */
  w.__hrgGmapFailHandlers = w.__hrgGmapFailHandlers || [];
  w.__hrgGmapFailHandlers.push(fail);
  if (!w.__hrgGmapAuthHooked) {
    w.__hrgGmapAuthHooked = true;
    var previous = w.gm_authFailure;
    w.gm_authFailure = function () {
      w.__hrgGmapAuthFailed = true;
      var list = w.__hrgGmapFailHandlers || [];
      for (var i = 0; i < list.length; i += 1) {
        try {
          list[i]("auth");
        } catch (e) {}
      }
      if (typeof previous === "function") {
        try {
          previous();
        } catch (e) {}
      }
    };
  }

  /* Never wait forever: keep OSM if Google is slow / blocked. */
  timer = setTimeout(function () {
    /* V106c ADD-ONLY: slow / hidden map is not an error. Keep OSM visible
       and let Google take over as soon as its tiles really load. */
    if (!ready && !dead && !removed) {
      showOsm(true);
      return;
    }
    if (!ready) fail("timeout");
  }, opts.timeoutMs || 15000);

  if (w.__hrgGmapAuthFailed) {
    fail("auth");
  } else if (w.google && w.google.maps && w.google.maps.Map) {
    init();
  } else {
    w.__hrgGmapWaiters = w.__hrgGmapWaiters || [];
    w.__hrgGmapWaiters.push(init);
    if (!w.__hrgGmapScriptAdded) {
      w.__hrgGmapScriptAdded = true;
      w.__hrgGmapLoaded = function () {
        var list = w.__hrgGmapWaiters || [];
        w.__hrgGmapWaiters = [];
        for (var i = 0; i < list.length; i += 1) {
          try {
            list[i]();
          } catch (e) {}
        }
      };
      var s = document.createElement("script");
      s.async = true;
      s.src =
        "https://maps.googleapis.com/maps/api/js?key=" +
        encodeURIComponent(opts.key) +
        "&v=weekly&loading=async&callback=__hrgGmapLoaded" +
        (opts.language ? "&language=" + encodeURIComponent(opts.language) : "") +
        "&region=IN";
      s.onerror = function () {
        w.__hrgGmapScriptAdded = false;
        var list = w.__hrgGmapFailHandlers || [];
        for (var i = 0; i < list.length; i += 1) {
          try {
            list[i]("script");
          } catch (e) {}
        }
      };
      document.head.appendChild(s);
    }
  }

  return {
    remove: function () {
      if (removed) return;
      removed = true;
      detach();
      showOsm(true);
      var list = w.__hrgGmapFailHandlers || [];
      var idx = list.indexOf(fail);
      if (idx >= 0) list.splice(idx, 1);
    },
    isReady: function () {
      return ready && !dead;
    }
  };
}
/* eslint-enable no-var */
