import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

export interface SelectedLocation {
  address: string;
  city: string;
  latitude: number;
  longitude: number;
}

interface TailorLocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (location: SelectedLocation) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  initialCity?: string;
}

export function TailorLocationPickerModal({
  visible,
  onClose,
  onConfirm,
  initialLat = 31.5204,
  initialLng = 74.3587,
  initialAddress = "",
  initialCity = "",
}: TailorLocationPickerModalProps) {
  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [currentCity, setCurrentCity] = useState(initialCity);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Tap map or drag pin to position shop");

  const webViewRef = useRef<WebView | null>(null);

  useEffect(() => {
    if (visible) {
      const lat = initialLat && !isNaN(Number(initialLat)) ? Number(initialLat) : 31.5204;
      const lng = initialLng && !isNaN(Number(initialLng)) ? Number(initialLng) : 74.3587;
      setCurrentLat(lat);
      setCurrentLng(lng);
      setCurrentAddress(initialAddress || "");
      setCurrentCity(initialCity || "");
      setStatusMessage("Tap map or drag pin to position shop");
    }
  }, [visible, initialLat, initialLng, initialAddress, initialCity]);

  // Handle messages from WebView or iframe
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const handleWindowMessage = (event: MessageEvent) => {
        try {
          const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          processIncomingData(data);
        } catch {
          // ignore
        }
      };

      window.addEventListener("message", handleWindowMessage);
      return () => window.removeEventListener("message", handleWindowMessage);
    }
  }, []);

  const processIncomingData = (data: any) => {
    if (!data) return;
    if (data.type === "LOCATION_PICKED") {
      setCurrentLat(data.latitude);
      setCurrentLng(data.longitude);
      if (data.address) setCurrentAddress(data.address);
      if (data.city) setCurrentCity(data.city);
      setIsGeocoding(false);
      setIsLocating(false);
      setStatusMessage(`Positioned at ${data.city || "selected area"}`);
    } else if (data.type === "GEOCODING_START") {
      setIsGeocoding(true);
      setStatusMessage("Fetching address details...");
    } else if (data.type === "LOCATING_START") {
      setIsLocating(true);
      setStatusMessage("Acquiring device GPS coordinates...");
    } else if (data.type === "LOCATING_FAILED") {
      setIsLocating(false);
      setStatusMessage(data.message || "GPS detection failed. Please tap map directly.");
    }
  };

  const handleNativeMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      processIncomingData(data);
    } catch {
      // ignore
    }
  };

  const triggerGpsDetect = () => {
    setIsLocating(true);
    setStatusMessage("Detecting your exact GPS location...");
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            // Send to iframe
            const iframe = document.querySelector("iframe") as HTMLIFrameElement;
            iframe?.contentWindow?.postMessage(
              JSON.stringify({ type: "SET_COORDS", latitude: lat, longitude: lng }),
              "*"
            );
          },
          () => {
            setIsLocating(false);
            setStatusMessage("Location permission denied or unavailable");
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    } else {
      webViewRef.current?.injectJavaScript("locateDevice(); true;");
    }
  };

  const handleApply = () => {
    onConfirm({
      latitude: parseFloat(currentLat.toFixed(6)),
      longitude: parseFloat(currentLng.toFixed(6)),
      address: currentAddress || `Location at ${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}`,
      city: currentCity || "Lahore",
    });
    onClose();
  };

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
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: #E8F0F2; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    
    .leaflet-control-attribution { display: none !important; }
    
    /* Top Floating Search & Action Bar */
    .top-container {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .search-row {
      display: flex;
      gap: 6px;
      background: #FFFFFF;
      padding: 4px;
      border-radius: 10px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.14);
      border: 1px solid #E5E7EB;
    }
    .search-box {
      flex: 1;
      height: 38px;
      border: none;
      padding: 0 10px;
      font-size: 13px;
      outline: none;
      color: #1A1D1F;
    }
    .btn-search {
      height: 38px;
      padding: 0 14px;
      border-radius: 7px;
      border: none;
      background: #078B87;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .btn-gps {
      height: 38px;
      padding: 0 12px;
      border-radius: 7px;
      border: 1.5px solid #078B87;
      background: #EBF8F9;
      color: #078B87;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }
    
    /* City Quick Chips */
    .chips-row {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
      -webkit-overflow-scrolling: touch;
    }
    .city-chip {
      background: rgba(255, 255, 255, 0.95);
      border: 1px solid #D1D5DB;
      padding: 4px 10px;
      border-radius: 16px;
      font-size: 11px;
      font-weight: 600;
      color: #374151;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      white-space: nowrap;
    }

    /* Floating Pin Status Callout */
    .pin-status-bar {
      position: absolute;
      bottom: 14px;
      left: 10px;
      right: 10px;
      z-index: 1000;
      background: rgba(26, 29, 31, 0.92);
      color: #FFFFFF;
      padding: 8px 14px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      backdrop-filter: blur(6px);
      pointer-events: none;
    }
    .pin-status-title {
      font-size: 12px;
      font-weight: 700;
      color: #F7B915;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .pin-status-coords {
      font-size: 11px;
      font-family: monospace;
      color: #D1D5DB;
    }

    /* Radar Pulse Animation around Pin Ground Tip */
    .radar-pulse {
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: rgba(7, 139, 135, 0.4);
      animation: pulse-ring 1.6s ease-out infinite;
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

    /* Custom Popup Styling */
    .leaflet-popup-content-wrapper {
      border-radius: 10px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.22);
      padding: 0;
      overflow: hidden;
      border: 1px solid #078B87;
    }
    .leaflet-popup-content {
      margin: 10px 14px;
      line-height: 1.35;
    }
    .popup-badge {
      display: inline-block;
      background: #EBF8F9;
      color: #078B87;
      font-weight: 800;
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .popup-title {
      font-size: 13px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }
    .popup-hint {
      font-size: 10px;
      color: #6B7280;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="top-container">
    <div class="search-row">
      <input type="text" id="searchInput" class="search-box" placeholder="Search street, bazaar, area, or landmark..." />
      <button type="button" class="btn-search" onclick="searchLocation()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        Search
      </button>
      <button type="button" class="btn-gps" onclick="locateDevice()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
        GPS
      </button>
    </div>
    <div class="chips-row">
      <div class="city-chip" onclick="jumpToCity('Lahore')">📍 Lahore</div>
      <div class="city-chip" onclick="jumpToCity('Karachi')">📍 Karachi</div>
      <div class="city-chip" onclick="jumpToCity('Islamabad')">📍 Islamabad</div>
      <div class="city-chip" onclick="jumpToCity('Delhi')">📍 Delhi</div>
      <div class="city-chip" onclick="jumpToCity('Mumbai')">📍 Mumbai</div>
    </div>
  </div>

  <div id="map"></div>

  <div class="pin-status-bar">
    <div>
      <div class="pin-status-title">
        <span>📍 Pinned Shop Spot</span>
      </div>
      <div id="liveAddressText" style="font-size: 11px; margin-top: 2px;">Setting initial location...</div>
    </div>
    <div class="pin-status-coords" id="liveCoordsText">${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}</div>
  </div>

  <script>
    function sendPayload(obj) {
      var s = JSON.stringify(obj);
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(s);
      } else if (window.parent) {
        window.parent.postMessage(s, '*');
      }
    }

    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([${currentLat}, ${currentLng}], 15);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Custom SVG Marker with pulse effect and ground needle
    var pinSvg = [
      '<div style="position: relative; width: 40px; height: 50px; display: flex; align-items: center; justify-content: center;">',
      '  <div class="radar-pulse"></div>',
      '  <div class="ground-dot"></div>',
      '  <svg width="38" height="46" viewBox="0 0 36 44" fill="none" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35)); position: relative; top: -5px;">',
      '    <path d="M18 0C8.05887 0 0 8.05887 0 18C0 29.5 18 44 18 44C18 44 36 29.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="#078B87"/>',
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

    var marker = L.marker([${currentLat}, ${currentLng}], {
      draggable: true,
      icon: customIcon
    }).addTo(map);

    function updateMarkerPopup(address, lat, lng) {
      var popupContent = [
        '<div class="popup-badge">📍 Selected Shop Spot</div>',
        '<div class="popup-title">' + (address || 'Exact Shop Location') + '</div>',
        '<div class="popup-hint">Drag pin or tap map to adjust</div>'
      ].join('');
      marker.bindPopup(popupContent, { autoClose: false, closeOnClick: false }).openPopup();

      var addrEl = document.getElementById('liveAddressText');
      if (addrEl) addrEl.innerText = address || 'Location identified';
      var coordsEl = document.getElementById('liveCoordsText');
      if (coordsEl) coordsEl.innerText = lat.toFixed(4) + ', ' + lng.toFixed(4);
    }

    function reverseGeocode(lat, lng) {
      sendPayload({ type: 'GEOCODING_START' });
      var addrEl = document.getElementById('liveAddressText');
      if (addrEl) addrEl.innerText = 'Identifying street address...';

      fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&addressdetails=1', {
        headers: { 'Accept-Language': 'en' }
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var addr = data.address || {};
        var street = addr.road || addr.street || addr.neighbourhood || addr.suburb || addr.commercial || addr.hamlet || '';
        var city = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || addr.county || 'Lahore';
        var state = addr.state || '';
        var formatted = [street, city, state].filter(Boolean).join(', ');
        if (!formatted) {
          formatted = data.display_name ? data.display_name.split(',').slice(0, 3).join(', ') : (lat.toFixed(4) + ', ' + lng.toFixed(4));
        }

        updateMarkerPopup(formatted, lat, lng);

        sendPayload({
          type: 'LOCATION_PICKED',
          latitude: lat,
          longitude: lng,
          address: formatted,
          city: city
        });
      })
      .catch(function(err) {
        var fallback = 'Pinned Location (' + lat.toFixed(4) + ', ' + lng.toFixed(4) + ')';
        updateMarkerPopup(fallback, lat, lng);
        sendPayload({
          type: 'LOCATION_PICKED',
          latitude: lat,
          longitude: lng,
          address: fallback,
          city: 'Lahore'
        });
      });
    }

    // Run initial reverse geocode and popup
    reverseGeocode(${currentLat}, ${currentLng});

    marker.on('dragend', function() {
      var pos = marker.getLatLng();
      reverseGeocode(pos.lat, pos.lng);
    });

    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    function searchLocation() {
      var query = document.getElementById('searchInput').value.trim();
      if (!query) return;
      var addrEl = document.getElementById('liveAddressText');
      if (addrEl) addrEl.innerText = 'Searching for "' + query + '"...';

      fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query) + '&limit=1', {
        headers: { 'Accept-Language': 'en' }
      })
      .then(function(res) { return res.json(); })
      .then(function(results) {
        if (results && results.length > 0) {
          var item = results[0];
          var lat = parseFloat(item.lat);
          var lng = parseFloat(item.lon);
          marker.setLatLng([lat, lng]);
          map.flyTo([lat, lng], 16, { duration: 1.2 });
          reverseGeocode(lat, lng);
        } else {
          alert('No location found for "' + query + '". Please check spelling or tap directly on the map.');
          if (addrEl) addrEl.innerText = 'No matches found';
        }
      });
    }

    document.getElementById('searchInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchLocation();
      }
    });

    function jumpToCity(cityName) {
      document.getElementById('searchInput').value = cityName;
      searchLocation();
    }

    function locateDevice() {
      sendPayload({ type: 'LOCATING_START' });
      var addrEl = document.getElementById('liveAddressText');
      if (addrEl) addrEl.innerText = 'Detecting device GPS...';

      if (!navigator.geolocation) {
        sendPayload({ type: 'LOCATING_FAILED', message: 'Geolocation is not supported by your device' });
        alert('Geolocation is not supported by your device.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        function(pos) {
          var lat = pos.coords.latitude;
          var lng = pos.coords.longitude;
          marker.setLatLng([lat, lng]);
          map.flyTo([lat, lng], 16, { duration: 1.4 });
          reverseGeocode(lat, lng);
        },
        function(err) {
          console.warn('Geolocation error:', err);
          sendPayload({ type: 'LOCATING_FAILED', message: 'GPS access failed. Please tap map directly.' });
          alert('Could not access device GPS. Please check location permissions or use the search bar above.');
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    }

    // External listener for web messaging
    window.addEventListener('message', function(e) {
      try {
        var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.type === 'SET_COORDS') {
          marker.setLatLng([data.latitude, data.longitude]);
          map.flyTo([data.latitude, data.longitude], 16, { duration: 1.2 });
          reverseGeocode(data.latitude, data.longitude);
        }
      } catch (err) {}
    });
  </script>
</body>
</html>
`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Modal Top Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={styles.headerIconWrap}>
                <Ionicons name="location" size={16} color="#078B87" />
              </View>
              <Text style={styles.headerTitle}>Pin Shop Location</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Tap anywhere or drag the pin to set your exact tailor shop
            </Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onClose}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={20} color="#1A1D1F" />
          </TouchableOpacity>
        </View>

        {/* Status Notification Strip */}
        <View style={styles.statusStrip}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
            {isGeocoding || isLocating ? (
              <ActivityIndicator size="small" color="#078B87" />
            ) : (
              <View style={styles.greenPulseDot} />
            )}
            <Text style={styles.statusText} numberOfLines={1}>
              {statusMessage}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={triggerGpsDetect}
            disabled={isLocating}
            style={styles.detectGpsBtn}
          >
            <Ionicons name="locate" size={13} color="#078B87" />
            <Text style={styles.detectGpsBtnText}>
              {isLocating ? "Locating..." : "Auto-Detect"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Map View */}
        <View style={styles.mapContainer}>
          {Platform.OS === "web" ? (
            // @ts-ignore
            <iframe
              srcDoc={html}
              style={{ width: "100%", height: "100%", border: "none" }}
              title="Tailor Location Picker Map"
            />
          ) : (
            <WebView
              ref={webViewRef}
              originWhitelist={["*"]}
              source={{ html }}
              onMessage={handleNativeMessage}
              style={StyleSheet.absoluteFill}
              javaScriptEnabled
              domStorageEnabled
              geolocationEnabled={true}
            />
          )}
        </View>

        {/* Bottom Details & Apply Bar */}
        <View style={styles.footer}>
          <View style={styles.detailsCard}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={styles.label}>Selected Shop Position</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                <Text style={styles.verifiedBadgeText}>Pin Active</Text>
              </View>
            </View>

            <Text style={styles.addressText} numberOfLines={2}>
              {currentAddress || "Tap on map or drag pin to position shop"}
            </Text>

            <View style={styles.infoRow}>
              <View style={styles.metaBadge}>
                <Ionicons name="business-outline" size={12} color="#078B87" />
                <Text style={styles.metaBadgeText}>{currentCity || "City"}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Ionicons name="compass-outline" size={12} color="#078B87" />
                <Text style={styles.coords}>
                  {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleApply}
              style={styles.applyBtn}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.applyBtnText}>Set Address from Map</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 54 : 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: "#EBF8F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1A1D1F",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  statusStrip: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EBF2F4",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16A34A",
  },
  statusText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  detectGpsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EBF8F9",
    borderWidth: 1,
    borderColor: "#BEE8EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detectGpsBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#078B87",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  footer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 16,
    gap: 12,
  },
  detailsCard: {
    backgroundColor: "#F7FCFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D2EFF1",
    padding: 14,
  },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "800",
    color: "#078B87",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#16A34A",
  },
  addressText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A1D1F",
    lineHeight: 19,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  coords: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: "#078B87",
    fontWeight: "700",
    fontSize: 11,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  applyBtn: {
    flex: 2,
    height: 46,
    borderRadius: 8,
    backgroundColor: "#078B87",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#078B87",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
