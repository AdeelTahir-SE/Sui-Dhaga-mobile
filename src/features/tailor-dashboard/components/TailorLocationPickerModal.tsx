import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setCurrentLat(initialLat || 31.5204);
      setCurrentLng(initialLng || 74.3587);
      setCurrentAddress(initialAddress || "");
      setCurrentCity(initialCity || "");
    }
  }, [visible, initialLat, initialLng, initialAddress, initialCity]);

  // Listen to messages from webview / iframe (for web & native)
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const handleWindowMessage = (event: MessageEvent) => {
        try {
          const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          if (data && data.type === "LOCATION_PICKED") {
            setCurrentLat(data.latitude);
            setCurrentLng(data.longitude);
            if (data.address) setCurrentAddress(data.address);
            if (data.city) setCurrentCity(data.city);
            setIsGeocoding(false);
          } else if (data && data.type === "GEOCODING_START") {
            setIsGeocoding(true);
          }
        } catch {
          // ignore non-json messages
        }
      };

      window.addEventListener("message", handleWindowMessage);
      return () => window.removeEventListener("message", handleWindowMessage);
    }
  }, []);

  const handleNativeMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data && data.type === "LOCATION_PICKED") {
        setCurrentLat(data.latitude);
        setCurrentLng(data.longitude);
        if (data.address) setCurrentAddress(data.address);
        if (data.city) setCurrentCity(data.city);
        setIsGeocoding(false);
      } else if (data && data.type === "GEOCODING_START") {
        setIsGeocoding(true);
      }
    } catch {
      // ignore
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
    .custom-pin-wrap {
      position: relative;
      width: 36px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .leaflet-control-attribution { display: none !important; }
    .floating-bar {
      position: absolute;
      top: 12px;
      left: 12px;
      right: 12px;
      z-index: 1000;
      display: flex;
      gap: 6px;
    }
    .search-box {
      flex: 1;
      height: 40px;
      background: #FFFFFF;
      border: 1px solid #D1D5DB;
      border-radius: 8px;
      padding: 0 12px;
      font-size: 13px;
      outline: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .btn-action {
      height: 40px;
      padding: 0 14px;
      border-radius: 8px;
      border: none;
      background: #14919B;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .btn-gps {
      height: 40px;
      padding: 0 12px;
      border-radius: 8px;
      border: 1px solid #14919B;
      background: #EBF8F9;
      color: #14919B;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .hint-chip {
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      background: rgba(26, 29, 31, 0.88);
      color: #FFFFFF;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      pointer-events: none;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>
  <div class="floating-bar">
    <input type="text" id="searchInput" class="search-box" placeholder="Search area, landmark or street..." />
    <button type="button" class="btn-action" onclick="searchLocation()">Search</button>
    <button type="button" class="btn-gps" onclick="locateDevice()">GPS</button>
  </div>
  <div id="map"></div>
  <div class="hint-chip">📍 Tap map or drag pin to your shop</div>

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
      zoomControl: true,
      attributionControl: false
    }).setView([${currentLat}, ${currentLng}], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    var pinSvg = '<svg width="36" height="44" viewBox="0 0 36 44" fill="none" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));"><path d="M18 0C8.05887 0 0 8.05887 0 18C0 29.5 18 44 18 44C18 44 36 29.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="#14919B"/><circle cx="18" cy="18" r="7" fill="#FFFFFF"/><circle cx="18" cy="18" r="3.5" fill="#F7B915"/></svg>';
    var customIcon = L.divIcon({
      className: 'custom-pin-wrap',
      html: pinSvg,
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -44]
    });

    var marker = L.marker([${currentLat}, ${currentLng}], {
      draggable: true,
      icon: customIcon
    }).addTo(map);

    function reverseGeocode(lat, lng) {
      sendPayload({ type: 'GEOCODING_START' });
      fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&addressdetails=1', {
        headers: { 'Accept-Language': 'en' }
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var addr = data.address || {};
        var street = addr.road || addr.street || addr.neighbourhood || addr.suburb || addr.commercial || '';
        var city = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || addr.county || 'Lahore';
        var state = addr.state || '';
        var formatted = [street, city, state].filter(Boolean).join(', ');
        if (!formatted) {
          formatted = data.display_name ? data.display_name.split(',').slice(0, 3).join(', ') : (lat.toFixed(4) + ', ' + lng.toFixed(4));
        }

        sendPayload({
          type: 'LOCATION_PICKED',
          latitude: lat,
          longitude: lng,
          address: formatted,
          city: city
        });
      })
      .catch(function(err) {
        sendPayload({
          type: 'LOCATION_PICKED',
          latitude: lat,
          longitude: lng,
          address: 'Shop Location (' + lat.toFixed(4) + ', ' + lng.toFixed(4) + ')',
          city: 'Lahore'
        });
      });
    }

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
          map.flyTo([lat, lng], 15, { duration: 1.2 });
          reverseGeocode(lat, lng);
        } else {
          alert('No location found for "' + query + '". Please try another area or tap on the map.');
        }
      });
    }

    document.getElementById('searchInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchLocation();
      }
    });

    function locateDevice() {
      if (!navigator.geolocation) {
        alert('Geolocation not supported on this device');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          var lat = pos.coords.latitude;
          var lng = pos.coords.longitude;
          marker.setLatLng([lat, lng]);
          map.flyTo([lat, lng], 15, { duration: 1.2 });
          reverseGeocode(lat, lng);
        },
        function(err) {
          alert('Could not retrieve device location. Please search or tap on map.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
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
          <View>
            <Text style={styles.headerTitle}>Pin Shop Location</Text>
            <Text style={styles.headerSubtitle}>
              Drag the pin or tap the map to set your tailor shop
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
              originWhitelist={["*"]}
              source={{ html }}
              onMessage={handleNativeMessage}
              style={StyleSheet.absoluteFill}
              javaScriptEnabled
              domStorageEnabled
            />
          )}

          {isGeocoding && (
            <View style={styles.loadingBanner}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.loadingText}>Fetching address details...</Text>
            </View>
          )}
        </View>

        {/* Bottom Details & Apply Bar */}
        <View style={styles.footer}>
          <View style={styles.detailsCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Selected Address</Text>
              <Text style={styles.addressText} numberOfLines={2}>
                {currentAddress || "Tap on map or drag pin to select"}
              </Text>
              <Text style={styles.cityText}>
                City: <strong>{currentCity || "Not set"}</strong> • GPS:{" "}
                <Text style={styles.coords}>
                  {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
                </Text>
              </Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1D1F",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  loadingBanner: {
    position: "absolute",
    top: 60,
    left: 16,
    zIndex: 100,
    backgroundColor: "rgba(20, 145, 155, 0.92)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    padding: 16,
    gap: 12,
  },
  detailsCard: {
    backgroundColor: "#F3F9F9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D3ECEE",
    padding: 12,
  },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "700",
    color: "#14919B",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1D1F",
    lineHeight: 18,
  },
  cityText: {
    fontSize: 12,
    color: "#4B5563",
    marginTop: 4,
  },
  coords: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: "#14919B",
    fontWeight: "600",
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
    backgroundColor: "#14919B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#14919B",
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
