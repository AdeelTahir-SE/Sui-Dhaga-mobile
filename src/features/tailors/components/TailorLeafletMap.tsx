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
}

export function TailorLeafletMap({
  latitude = 31.5204,
  longitude = 74.3587,
  shopName,
  locationText,
  zoom = 15,
  interactive = false,
  height = 140,
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
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: #E8F0F2; overflow: hidden; }
    .custom-pin-wrap {
      position: relative;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .custom-pin {
      width: 32px;
      height: 32px;
      background: #14919B;
      border: 2.5px solid #FFFFFF;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 10px rgba(20, 145, 155, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      top: -6px;
    }
    .custom-pin::after {
      content: '';
      width: 10px;
      height: 10px;
      background: #FFFFFF;
      border-radius: 50%;
      position: absolute;
    }
    .custom-shadow {
      position: absolute;
      bottom: 2px;
      left: 7px;
      width: 22px;
      height: 6px;
      background: rgba(20, 145, 155, 0.35);
      border-radius: 50%;
      filter: blur(1px);
    }
    .leaflet-control-attribution { display: none !important; }
    .leaflet-popup-content-wrapper {
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 2px;
    }
    .leaflet-popup-content {
      margin: 8px 12px;
      line-height: 1.3;
    }
    .popup-title { font-weight: 700; color: #1A1D1F; font-size: 13px; margin: 0; }
    .popup-sub { font-size: 11px; color: #6B7280; margin: 3px 0 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: ${interactive ? "true" : "false"},
      attributionControl: false,
      dragging: ${interactive ? "true" : "false"},
      touchZoom: ${interactive ? "true" : "false"},
      doubleClickZoom: ${interactive ? "true" : "false"},
      scrollWheelZoom: ${interactive ? "true" : "false"}
    }).setView([${latitude}, ${longitude}], ${zoom});

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    var customIcon = L.divIcon({
      className: '',
      html: '<div class="custom-pin-wrap"><div class="custom-shadow"></div><div class="custom-pin"></div></div>',
      iconSize: [36, 36],
      iconAnchor: [18, 34],
      popupAnchor: [0, -32]
    });

    var marker = L.marker([${latitude}, ${longitude}], { icon: customIcon }).addTo(map);
    marker.bindPopup('<div class="popup-title">${safeName}</div><div class="popup-sub">${safeLocation}</div>');
    
    ${interactive ? "marker.openPopup();" : ""}
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
        pointerEvents={interactive ? "auto" : "none"}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
