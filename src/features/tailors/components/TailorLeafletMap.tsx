import React from "react";
import { DimensionValue, Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface TailorLeafletMapProps {
  latitude?: number;
  longitude?: number;
  shopName: string;
  locationText: string;
  zoom?: number;
  interactive?: boolean;
  height?: DimensionValue;
  showPinCallout?: boolean;
}

export function TailorLeafletMap({
  latitude = 31.5204,
  longitude = 74.3587,
  shopName,
  locationText,
  zoom = 15,
  interactive = true,
  height = 200,
  showPinCallout = true,
}: TailorLeafletMapProps) {
  const safeName = (shopName || "Tailor Studio").replace(/'/g, "\\'");
  const safeLocation = (locationText || "Shop Location").replace(/'/g, "\\'");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: #E8F0F2;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .leaflet-control-attribution { display: none !important; }

    /* Custom Pulsing Pin Marker (Matches Edit Tailor Location Picker) */
    .radar-pulse {
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: rgba(20, 145, 155, 0.45);
      animation: pulse-ring 1.8s ease-out infinite;
      pointer-events: none;
    }
    .ground-dot {
      position: absolute;
      bottom: 1px;
      left: 50%;
      transform: translateX(-50%);
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #111111;
      box-shadow: 0 0 4px rgba(0,0,0,0.6);
      pointer-events: none;
    }
    @keyframes pulse-ring {
      0% { transform: translateX(-50%) scale(0.6); opacity: 0.9; }
      100% { transform: translateX(-50%) scale(2.8); opacity: 0; }
    }

    /* Floating Status Callout at bottom of map */
    .pin-status-bar {
      position: absolute;
      bottom: 10px;
      left: 10px;
      right: 10px;
      z-index: 1000;
      background: rgba(26, 29, 31, 0.92);
      color: #FFFFFF;
      padding: 8px 12px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.22);
      backdrop-filter: blur(8px);
      pointer-events: none;
    }
    .pin-status-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #F7B915;
    }
    .pin-status-sub {
      font-size: 10.5px;
      color: #E2E8F0;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 220px;
    }
    .pin-status-coords {
      font-size: 10px;
      font-family: monospace;
      color: #94A3B8;
      flex-shrink: 0;
    }

    /* Floating Recenter Target Button */
    .recenter-btn {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 1000;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #FFFFFF;
      border: 1px solid rgba(0,0,0,0.12);
      box-shadow: 0 2px 6px rgba(0,0,0,0.18);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    .recenter-btn:active {
      background: #F1F5F9;
      transform: scale(0.96);
    }

    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.18);
      font-family: inherit;
      padding: 4px;
    }
    .leaflet-popup-content {
      margin: 8px 12px;
      line-height: 1.35;
    }
    .popup-title { font-weight: 800; color: #0F172A; font-size: 13.5px; margin: 0; }
    .popup-sub { font-size: 11.5px; color: #14919B; font-weight: 700; margin: 2px 0 0; }
    .popup-addr { font-size: 11px; color: #64748B; margin: 3px 0 0; }
  </style>
</head>
<body>
  <div id="map"></div>

  ${
    interactive
      ? `<button class="recenter-btn" id="recenterBtn" title="Recenter to shop">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14919B" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="7"/>
      <polyline points="12 1 12 5"/>
      <polyline points="12 19 12 23"/>
      <polyline points="1 12 5 12"/>
      <polyline points="19 12 23 12"/>
    </svg>
  </button>`
      : ""
  }

  ${
    showPinCallout
      ? `<div class="pin-status-bar">
    <div style="overflow: hidden;">
      <div class="pin-status-title">📍 ${safeName}</div>
      <div class="pin-status-sub">${safeLocation}</div>
    </div>
    <div class="pin-status-coords">${latitude.toFixed(4)}, ${longitude.toFixed(4)}</div>
  </div>`
      : ""
  }

  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: ${interactive ? "true" : "false"},
      touchZoom: ${interactive ? "true" : "false"},
      doubleClickZoom: ${interactive ? "true" : "false"},
      scrollWheelZoom: ${interactive ? "true" : "false"}
    }).setView([${latitude}, ${longitude}], ${zoom});

    ${interactive ? "L.control.zoom({ position: 'bottomright' }).addTo(map);" : ""}

    // English Map Layer (Google Maps English raster tiles with hl=en parameter)
    var googleTiles = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    });

    // Fallback to Carto Voyager English tiles if Google tile fails
    googleTiles.on('tileerror', function() {
      if (!window.__fallbackActive) {
        window.__fallbackActive = true;
        map.removeLayer(googleTiles);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(map);
      }
    });

    googleTiles.addTo(map);

    // Matching SVG Pin from Edit Tailor Shop Location Picker
    var pinSvg = [
      '<div style="position: relative; width: 40px; height: 50px; display: flex; align-items: center; justify-content: center;">',
      '  <div class="radar-pulse"></div>',
      '  <div class="ground-dot"></div>',
      '  <svg width="38" height="46" viewBox="0 0 36 44" fill="none" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35)); position: relative; top: -5px;">',
      '    <path d="M18 0C8.05887 0 0 8.05887 0 18C0 29.5 18 44 18 44C18 44 36 29.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="#14919B"/>',
      '    <circle cx="18" cy="18" r="7.5" fill="#FFFFFF"/>',
      '    <circle cx="18" cy="18" r="4" fill="#F7B915"/>',
      '  </svg>',
      '</div>'
    ].join('');

    var customIcon = L.divIcon({
      className: '',
      html: pinSvg,
      iconSize: [40, 50],
      iconAnchor: [20, 48],
      popupAnchor: [0, -48]
    });

    var marker = L.marker([${latitude}, ${longitude}], { icon: customIcon }).addTo(map);
    marker.bindPopup(
      '<div class="popup-title">${safeName}</div>' +
      '<div class="popup-sub">Verified Tailor Workshop</div>' +
      '<div class="popup-addr">${safeLocation}</div>'
    );

    var recenterBtn = document.getElementById('recenterBtn');
    if (recenterBtn) {
      recenterBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        map.flyTo([${latitude}, ${longitude}], ${zoom}, { duration: 0.8 });
      });
    }
  </script>
</body>
</html>
`;

  if (Platform.OS === "web") {
    return (
      <View style={{ height, width: "100%", overflow: "hidden" }}>
        {/* @ts-ignore - iframe in react-native-web */}
        <iframe
          srcDoc={html}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            pointerEvents: interactive ? "auto" : "none",
          }}
          title="Tailor Location Map"
        />
      </View>
    );
  }

  return (
    <View style={{ height, width: "100%", overflow: "hidden" }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        scrollEnabled={interactive}
        nestedScrollEnabled={true}
        pointerEvents={interactive ? "auto" : "none"}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
