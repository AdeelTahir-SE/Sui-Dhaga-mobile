import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { toast } from "../../../stores/toast.store";

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

function buildMapHtml(initLat: number, initLng: number) {
  return `<!DOCTYPE html>
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

    /* Custom Pulsing Pin Marker */
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

    /* Floating Pin Status Callout at bottom of map */
    .pin-status-bar {
      position: absolute;
      bottom: 14px;
      left: 14px;
      right: 14px;
      z-index: 1000;
      background: rgba(26, 29, 31, 0.92);
      color: #FFFFFF;
      padding: 9px 14px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      backdrop-filter: blur(8px);
      pointer-events: none;
    }
    .pin-status-title {
      font-size: 12px;
      font-weight: 700;
      color: #F7B915;
    }
    .pin-status-coords {
      font-size: 11px;
      font-family: monospace;
      color: #D1D5DB;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <div class="pin-status-bar">
    <div>
      <div class="pin-status-title">📍 Selected Shop Pin</div>
      <div id="liveAddressText" style="font-size: 11px; margin-top: 2px;">Setting initial location...</div>
    </div>
    <div class="pin-status-coords" id="liveCoordsText">${initLat.toFixed(4)}, ${initLng.toFixed(4)}</div>
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

    // Initialize Leaflet Map
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([${initLat}, ${initLng}], 15);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // English-first CARTO Voyager tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Custom SVG Pin Icon
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

    var marker = L.marker([${initLat}, ${initLng}], {
      draggable: true,
      icon: customIcon
    }).addTo(map);

    var geocodeTimeout = null;

    function updateMarkerLabels(address, lat, lng) {
      var addrEl = document.getElementById('liveAddressText');
      if (addrEl) addrEl.innerText = address || 'Location identified';
      var coordsEl = document.getElementById('liveCoordsText');
      if (coordsEl) coordsEl.innerText = lat.toFixed(4) + ', ' + lng.toFixed(4);
    }

    function reverseGeocode(lat, lng) {
      if (geocodeTimeout) clearTimeout(geocodeTimeout);

      updateMarkerLabels('Identifying street address...', lat, lng);
      sendPayload({ type: 'GEOCODING_START' });

      geocodeTimeout = setTimeout(function() {
        fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&addressdetails=1&accept-language=en', {
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

          updateMarkerLabels(formatted, lat, lng);

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
          updateMarkerLabels(fallback, lat, lng);
          sendPayload({
            type: 'LOCATION_PICKED',
            latitude: lat,
            longitude: lng,
            address: fallback,
            city: 'Lahore'
          });
        });
      }, 300);
    }

    // Run initial reverse geocoding
    reverseGeocode(${initLat}, ${initLng});

    // Smooth drag and click handlers (do not cause full page reload)
    marker.on('dragend', function() {
      var pos = marker.getLatLng();
      reverseGeocode(pos.lat, pos.lng);
    });

    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    // Function to reposition marker smoothly without page reload
    window.setMapCoords = function(lat, lng) {
      marker.setLatLng([lat, lng]);
      map.flyTo([lat, lng], 16, { duration: 1.2 });
      reverseGeocode(lat, lng);
    };

    // External listener for web postMessage
    window.addEventListener('message', function(e) {
      try {
        var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.type === 'SET_COORDS') {
          window.setMapCoords(data.latitude, data.longitude);
        }
      } catch (err) {}
    });
  </script>
</body>
</html>`;
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
  const [isLocating, setIsLocating] = useState(false);

  const webViewRef = useRef<WebView | null>(null);

  // Keep a stable HTML string so the WebView NEVER reloads on pin movements
  const mapHtml = useMemo(() => {
    const lat = initialLat && !isNaN(Number(initialLat)) ? Number(initialLat) : 31.5204;
    const lng = initialLng && !isNaN(Number(initialLng)) ? Number(initialLng) : 74.3587;
    return buildMapHtml(lat, lng);
  }, [visible]);

  useEffect(() => {
    if (visible) {
      const lat = initialLat && !isNaN(Number(initialLat)) ? Number(initialLat) : 31.5204;
      const lng = initialLng && !isNaN(Number(initialLng)) ? Number(initialLng) : 74.3587;
      setCurrentLat(lat);
      setCurrentLng(lng);
      setCurrentAddress(initialAddress || "");
      setCurrentCity(initialCity || "");
    }
  }, [visible, initialLat, initialLng, initialAddress, initialCity]);

  // Handle messages from Web iframe
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const handleWindowMessage = (event: MessageEvent) => {
        try {
          const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          processIncomingData(data);
        } catch {}
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
    }
  };

  const handleNativeMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      processIncomingData(data);
    } catch {}
  };

  // High-reliability GPS auto-detect using native Expo Location / Web Geolocation
  const triggerGpsDetect = async () => {
    setIsLocating(true);
    try {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              setCurrentLat(lat);
              setCurrentLng(lng);

              // Update iframe map
              const iframe = document.querySelector("iframe") as HTMLIFrameElement;
              iframe?.contentWindow?.postMessage(
                JSON.stringify({ type: "SET_COORDS", latitude: lat, longitude: lng }),
                "*"
              );
              setIsLocating(false);
              toast.success("Location updated to your GPS position!");
            },
            () => {
              setIsLocating(false);
              toast.error("Could not access GPS. Please check browser location permissions.");
            },
            { enableHighAccuracy: false, timeout: 10000 }
          );
        } else {
          setIsLocating(false);
          toast.error("Geolocation is not supported in this environment.");
        }
      } else {
        // Native Android / iOS Location Detection
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setIsLocating(false);
          toast.error("Location permission denied. Please allow location access in your device settings.");
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const lat = location.coords.latitude;
        const lng = location.coords.longitude;

        setCurrentLat(lat);
        setCurrentLng(lng);

        webViewRef.current?.injectJavaScript(`window.setMapCoords(${lat}, ${lng}); true;`);
        setIsLocating(false);
        toast.success("Location updated to your GPS position!");
      }
    } catch (err: any) {
      setIsLocating(false);
      toast.error(err?.message || "Could not detect GPS location.");
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom", "left", "right"]}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={styles.headerIconWrap}>
                  <Ionicons name="location" size={18} color="#14919B" />
                </View>
                <Text style={styles.headerTitle}>Pin Shop Location</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                Tap anywhere or drag the pin to set your exact shop location
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

          {/* Interactive Map Area with Floating GPS Auto-Detect Button at Top Right */}
          <View style={styles.mapContainer}>
            {Platform.OS === "web" ? (
              // @ts-ignore
              <iframe
                srcDoc={mapHtml}
                style={{ width: "100%", height: "100%", border: "none" }}
                title="Tailor Location Picker Map"
              />
            ) : (
              <WebView
                ref={webViewRef}
                originWhitelist={["*"]}
                source={{ html: mapHtml }}
                onMessage={handleNativeMessage}
                style={StyleSheet.absoluteFill}
                javaScriptEnabled
                domStorageEnabled
                geolocationEnabled={true}
              />
            )}

            {/* Floating GPS Auto-Detect Icon at Top Right of Map */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={triggerGpsDetect}
              disabled={isLocating}
              style={styles.floatingGpsBtn}
              accessibilityLabel="Auto-detect current location"
            >
              {isLocating ? (
                <ActivityIndicator size="small" color="#14919B" />
              ) : (
                <Ionicons name="locate" size={22} color="#14919B" />
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom Card & Apply Action */}
          <View style={styles.footer}>
            <View style={styles.detailsCard}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <Text style={styles.label}>Selected Shop Position</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
                  <Text style={styles.verifiedBadgeText}>Pin Active</Text>
                </View>
              </View>

              <Text style={styles.addressText} numberOfLines={2}>
                {currentAddress || "Tap on map or drag pin to position shop"}
              </Text>

              <View style={styles.infoRow}>
                <View style={styles.metaBadge}>
                  <Ionicons name="business-outline" size={13} color="#14919B" />
                  <Text style={styles.metaBadgeText}>{currentCity || "City"}</Text>
                </View>
                <View style={styles.metaBadge}>
                  <Ionicons name="compass-outline" size={13} color="#14919B" />
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
                activeOpacity={0.85}
                onPress={handleApply}
                style={styles.applyBtn}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.applyBtnText}>Set Address from Map</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#E0F7F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1A1D1F",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6F767E",
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
    backgroundColor: "#E8F0F2",
  },
  floatingGpsBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 1000,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  footer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  detailsCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#15803D",
  },
  addressText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 18,
    marginTop: 2,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
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
    borderRadius: 8,
  },
  metaBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  coords: {
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontWeight: "600",
    color: "#14919B",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#4B5563",
  },
  applyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#14919B",
    shadowColor: "#14919B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
