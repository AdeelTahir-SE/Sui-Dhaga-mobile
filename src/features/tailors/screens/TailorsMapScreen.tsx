import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { FixedBottomTabs } from "@/components/layout/FixedBottomTabs";
import { TailorItem } from "@/types/api";
import { RatingLine } from "../components/RatingLine";
import { TailorBadge } from "../components/TailorBadge";
import { TailorBottomTabs } from "../components/TailorBottomTabs";
import { TailorPlaceholder } from "../components/TailorPlaceholder";
import { useTailorsMap } from "../hooks/useTailors";
import { lightHaptic, selectionHaptic } from "../../../utils/haptics";

const DEFAULT_CENTER = { lat: 31.5204, lng: 74.3587 };

const DISTANCE_OPTIONS = [5, 10, 15] as const;
type AllowedRadius = (typeof DISTANCE_OPTIONS)[number];

function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((6371 * c).toFixed(1));
}

export default function TailorsMapScreen() {
  const insets = useSafeAreaInsets();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [maxRadius, setMaxRadius] = useState<AllowedRadius>(10);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [showAllTailors, setShowAllTailors] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Live search debounce (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // User Geolocation State
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);

  // Effective location: device GPS coords if available, otherwise default center
  const effectiveCoords = useMemo(() => {
    if (userCoords) return userCoords;
    return DEFAULT_CENTER;
  }, [userCoords]);

  // Selected Tailor State
  const [selectedTailorId, setSelectedTailorId] = useState<string | null>(null);

  const webViewRef = useRef<WebView | null>(null);

  // Fetch tailors with map endpoint using effective coordinates & maxRadius
  const { tailors, isLoading } = useTailorsMap({
    search: appliedSearch || undefined,
    lat: effectiveCoords?.lat,
    lng: effectiveCoords?.lng,
    radius: maxRadius,
  });

  // Client-side strict filtering: ONLY within specified maxRadius!
  const filteredTailors = useMemo(() => {
    const originLat = effectiveCoords?.lat;
    const originLng = effectiveCoords?.lng;

    // 1. Calculate distances and filter STRICTLY within specified radius
    const withinRadius = tailors
      .map((t) => {
        let dist = typeof t.distanceKm === "number" ? t.distanceKm : undefined;
        if (
          typeof originLat === "number" &&
          typeof originLng === "number" &&
          typeof t.latitude === "number" &&
          typeof t.longitude === "number"
        ) {
          dist = calculateDistanceKm(
            originLat,
            originLng,
            t.latitude,
            t.longitude,
          );
        }
        return {
          ...t,
          distanceKm: dist,
        };
      })
      .filter((t) => typeof t.distanceKm === "number" && t.distanceKm <= maxRadius);

    // 2. If search query is provided, filter within those tailors within the specified radius
    if (appliedSearch) {
      const q = appliedSearch.toLowerCase().trim();
      return withinRadius
        .filter((t) => {
          const name = (t.shopName || t.name || t.businessName || "").toLowerCase();
          const city = (t.city || "").toLowerCase();
          const address = (t.address || "").toLowerCase();
          const specs = Array.isArray(t.specialties)
            ? t.specialties.join(" ").toLowerCase()
            : (t.specialty || "").toLowerCase();
          const bio = (t.bio || "").toLowerCase();
          return (
            name.includes(q) ||
            city.includes(q) ||
            address.includes(q) ||
            specs.includes(q) ||
            bio.includes(q)
          );
        })
        .sort((a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999));
    }

    return withinRadius.sort(
      (a, b) => (a.distanceKm ?? 999999) - (b.distanceKm ?? 999999),
    );
  }, [tailors, maxRadius, effectiveCoords, appliedSearch]);

  // Keep a selected tailor in view (strictly within filteredTailors)
  const selectedTailor = useMemo(() => {
    if (!filteredTailors.length) return null;
    if (selectedTailorId) {
      const found = filteredTailors.find((t) => t.id === selectedTailorId);
      if (found) return found;
    }
    return filteredTailors[0];
  }, [filteredTailors, selectedTailorId]);

  const selectedIndex = useMemo(() => {
    if (!selectedTailor) return -1;
    return filteredTailors.findIndex((t) => t.id === selectedTailor.id);
  }, [filteredTailors, selectedTailor]);

  // Update selectedTailorId when filteredTailors changes
  useEffect(() => {
    if (filteredTailors.length > 0) {
      if (
        !selectedTailorId ||
        !filteredTailors.some((t) => t.id === selectedTailorId)
      ) {
        setSelectedTailorId(filteredTailors[0].id);
      }
    } else {
      setSelectedTailorId(null);
    }
  }, [filteredTailors, selectedTailorId]);

  // Execute JavaScript in Map WebView or iframe
  const sendMapCommand = useCallback((command: string) => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        try {
          const iframe = document.querySelector(
            "#tailors-map-frame",
          ) as HTMLIFrameElement;
          iframe?.contentWindow?.postMessage(command, "*");
        } catch {}
      }
    } else {
      webViewRef.current?.injectJavaScript(`${command}; true;`);
    }
  }, []);

  // Handle messages from WebView or iframe
  const processIncomingData = useCallback(
    (data: any) => {
      if (!data) return;
      if (data.type === "TAILOR_PIN_CLICKED") {
        if (data.tailorId) {
          lightHaptic();
          setSelectedTailorId(data.tailorId);
        }
      } else if (data.type === "USER_LOCATED") {
        setUserCoords({ lat: data.latitude, lng: data.longitude });
        setIsLocating(false);
        setGpsStatusMsg(
          `GPS Location Acquired (Filtered within ${maxRadius} km)`,
        );
        sendMapCommand(
          `setUserMarker(${data.latitude}, ${data.longitude}, ${maxRadius})`,
        );
        setTimeout(() => setGpsStatusMsg(null), 3500);
      } else if (data.type === "LOCATING_FAILED") {
        setIsLocating(false);
        setGpsStatusMsg(
          data.message || "Could not detect GPS. Using area reference.",
        );
        setTimeout(() => setGpsStatusMsg(null), 3500);
      }
    },
    [maxRadius, sendMapCommand],
  );

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const handleWindowMessage = (event: MessageEvent) => {
        try {
          const data =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;
          processIncomingData(data);
        } catch {
          // ignore
        }
      };

      window.addEventListener("message", handleWindowMessage);
      return () => window.removeEventListener("message", handleWindowMessage);
    }
  }, [processIncomingData]);

  const handleNativeMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      processIncomingData(data);
    } catch {
      // ignore
    }
  };

  // Sync active tailor pins with map (strictly within specified radius)
  useEffect(() => {
    const payload = JSON.stringify({
      type: "SYNC_PINS",
      tailors: filteredTailors.map((t) => ({
        id: t.id,
        name: t.shopName || t.name || "Tailor Studio",
        rating: t.rating || 0,
        specialty: Array.isArray(t.specialties)
          ? t.specialties.join(", ")
          : t.specialty || "",
        latitude: t.latitude,
        longitude: t.longitude,
        city: t.city || "",
        address: t.address || "",
        verified: !!(t.verified || t.isVerified),
      })),
      selectedId: selectedTailor?.id || null,
    });
    sendMapCommand(`handleMapMessage(${JSON.stringify(payload)})`);
  }, [filteredTailors, selectedTailor?.id, sendMapCommand]);

  // Sync user location marker & radius boundary circle on map whenever coordinates or maxRadius change
  useEffect(() => {
    if (effectiveCoords) {
      sendMapCommand(
        `setUserMarker(${effectiveCoords.lat}, ${effectiveCoords.lng}, ${maxRadius})`,
      );
    }
  }, [effectiveCoords, maxRadius, sendMapCommand]);

  // Center on tailor when card changes
  const handleSelectTailor = (tailor: TailorItem) => {
    lightHaptic();
    setSelectedTailorId(tailor.id);
    if (
      typeof tailor.latitude === "number" &&
      typeof tailor.longitude === "number"
    ) {
      sendMapCommand(
        `flyToTailor(${tailor.latitude}, ${tailor.longitude}, "${tailor.id}")`,
      );
    }
  };

  const handleNextTailor = () => {
    if (filteredTailors.length <= 1) return;
    const nextIdx = (selectedIndex + 1) % filteredTailors.length;
    handleSelectTailor(filteredTailors[nextIdx]);
  };

  const handlePrevTailor = () => {
    if (filteredTailors.length <= 1) return;
    const prevIdx =
      (selectedIndex - 1 + filteredTailors.length) % filteredTailors.length;
    handleSelectTailor(filteredTailors[prevIdx]);
  };

  // Trigger GPS detection
  const handleTriggerGps = useCallback(() => {
    setIsLocating(true);
    setGpsStatusMsg("Detecting your location...");

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setUserCoords({ lat, lng });
            setIsLocating(false);
            setGpsStatusMsg(
              `GPS Location Acquired (Filtered within ${maxRadius} km)`,
            );
            sendMapCommand(`setUserMarker(${lat}, ${lng}, ${maxRadius})`);
            setTimeout(() => setGpsStatusMsg(null), 3500);
          },
          () => {
            setIsLocating(false);
            setGpsStatusMsg("Location access denied. Using area reference.");
            setTimeout(() => setGpsStatusMsg(null), 3500);
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      }
    } else {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            const pos = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setUserCoords({ lat, lng });
            setIsLocating(false);
            setGpsStatusMsg(
              `GPS Location Acquired (Filtered within ${maxRadius} km)`,
            );
            sendMapCommand(`setUserMarker(${lat}, ${lng}, ${maxRadius})`);
            setTimeout(() => setGpsStatusMsg(null), 3500);
            return;
          }
        } catch {
          // Fallback to webview inject
        }
        webViewRef.current?.injectJavaScript("locateDevice(); true;");
      })();
    }
  }, [maxRadius, sendMapCommand]);

  // Auto-detect location on initial screen mount
  useEffect(() => {
    handleTriggerGps();
  }, [handleTriggerGps]);



  // Search submission
  const handleSearchSubmit = () => {
    setAppliedSearch(searchQuery.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setAppliedSearch("");
  };

  // Fit all pins in map
  const handleFitAllPins = () => {
    lightHaptic();
    sendMapCommand("fitAllBounds();");
  };

  // Initial center coordinates
  const initialCenter =
    selectedTailor &&
    typeof selectedTailor.latitude === "number" &&
    typeof selectedTailor.longitude === "number"
      ? { lat: selectedTailor.latitude, lng: selectedTailor.longitude }
      : DEFAULT_CENTER;

  // HTML Content for the Leaflet Map
  const mapHtml = useMemo(() => {
    const sanitizedTailors = filteredTailors.map((t) => ({
      id: t.id,
      name: (t.shopName || t.name || "Tailor Studio").replace(/"/g, '\\"'),
      rating: typeof t.rating === "number" ? t.rating : 0,
      specialty: (Array.isArray(t.specialties)
        ? t.specialties.join(", ")
        : t.specialty || ""
      ).replace(/"/g, '\\"'),
      latitude: t.latitude,
      longitude: t.longitude,
      city: (t.city || "").replace(/"/g, '\\"'),
      address: (t.address || "").replace(/"/g, '\\"'),
      verified: !!(t.verified || t.isVerified),
    }));

    return `
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

    /* Custom Tailor Pins */
    .tailor-pin-container {
      background: transparent;
      border: none;
    }
    .tailor-pin-wrapper {
      position: relative;
      width: 68px;
      height: 64px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .tailor-pin-wrapper:active {
      transform: scale(0.92);
    }
    .pin-marker {
      width: 44px;
      height: 38px;
      background: #FFFFFF;
      border-radius: 12px;
      border: 2px solid #14919B;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.22);
      position: relative;
      z-index: 2;
      transition: all 0.25s ease;
    }
    .marker-selected {
      border: 2.5px solid #F7B915 !important;
      background: #14919B !important;
      box-shadow: 0 6px 20px rgba(7, 139, 135, 0.55);
      transform: scale(1.12);
    }
    .pin-icon {
      font-size: 13px;
      font-weight: 900;
      color: #14919B;
      line-height: 1;
    }
    .marker-selected .pin-icon {
      color: #FFFFFF !important;
    }
    .pin-rating {
      font-size: 9px;
      font-weight: 700;
      color: #FFFFFF;
      background: #14919B;
      padding: 1px 4px;
      border-radius: 4px;
      margin-top: 2px;
      line-height: 1.1;
    }
    .marker-selected .pin-rating {
      background: #F7B915 !important;
      color: #111827 !important;
    }
    .pin-tip {
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 7px solid #14919B;
      position: relative;
      top: -1px;
      z-index: 1;
      transition: border-top-color 0.25s ease;
    }
    .marker-selected + .pin-tip {
      border-top-color: #F7B915 !important;
      transform: scale(1.1);
    }
    .pin-pulse {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(7, 139, 135, 0.45);
      animation: pulse-ring 1.6s ease-out infinite;
      pointer-events: none;
    }
    .pin-name-bubble {
      position: absolute;
      top: -18px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(26, 29, 31, 0.95);
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 6px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      pointer-events: none;
      z-index: 10;
      border: 1px solid rgba(255,255,255,0.2);
    }
    @keyframes pulse-ring {
      0% { transform: translateX(-50%) scale(0.6); opacity: 0.9; }
      100% { transform: translateX(-50%) scale(3.0); opacity: 0; }
    }

    /* User Blue GPS Marker */
    .user-pulse-ring {
      position: absolute;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(37, 99, 235, 0.3);
      animation: pulse-ring 1.8s ease-out infinite;
    }
    .user-dot {
      position: absolute;
      top: 5px;
      left: 5px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #2563EB;
      border: 3px solid #FFFFFF;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    }
  </style>
</head>
<body>
  <div id="map"></div>

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
    }).setView([${initialCenter.lat}, ${initialCenter.lng}], 13);

    // English Map Layer (Google Maps English raster tiles with hl=en)
    var googleTiles = L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    });

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

    var markersLayer = L.layerGroup().addTo(map);
    var markerMap = {};
    var currentSelectedId = "${selectedTailor?.id || ""}";
    var userMarker = null;

    function renderPins(tailorsList, activeId) {
      markersLayer.clearLayers();
      markerMap = {};

      tailorsList.forEach(function(t) {
        if (typeof t.latitude !== 'number' || typeof t.longitude !== 'number') return;

        var isSelected = t.id === activeId;
        var ratingStr = typeof t.rating === 'number' && t.rating > 0 ? Number(t.rating).toFixed(1) : 'New';
        var nameStr = (t.name || 'Tailor').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var initial = (t.name || 'T').charAt(0).toUpperCase();

        var pinHtml = [
          '<div class="tailor-pin-wrapper ' + (isSelected ? 'pin-active' : '') + '">',
          isSelected ? '  <div class="pin-pulse"></div>' : '',
          '  <div class="pin-marker ' + (isSelected ? 'marker-selected' : '') + '">',
          '    <div class="pin-icon">' + initial + '</div>',
          '    <div class="pin-rating">★ ' + ratingStr + '</div>',
          '  </div>',
          '  <div class="pin-tip"></div>',
          isSelected ? '  <div class="pin-name-bubble">' + nameStr + '</div>' : '',
          '</div>'
        ].join('');

        var icon = L.divIcon({
          className: 'tailor-pin-container',
          html: pinHtml,
          iconSize: [68, 64],
          iconAnchor: [34, 46]
        });

        var m = L.marker([t.latitude, t.longitude], { icon: icon }).addTo(markersLayer);
        markerMap[t.id] = { marker: m, data: t };

        m.on('click', function(e) {
          L.DomEvent.stopPropagation(e);
          sendPayload({ type: 'TAILOR_PIN_CLICKED', tailorId: t.id, lat: t.latitude, lng: t.longitude });
          flyToTailor(t.latitude, t.longitude, t.id);
        });
      });
    }

    function flyToTailor(lat, lng, tailorId) {
      currentSelectedId = tailorId;
      map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 0.8 });

      // Refresh pin highlights
      Object.keys(markerMap).forEach(function(id) {
        var item = markerMap[id];
        var isSelected = id === tailorId;
        var t = item.data;
        var ratingStr = typeof t.rating === 'number' && t.rating > 0 ? Number(t.rating).toFixed(1) : 'New';
        var nameStr = (t.name || 'Tailor').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var initial = (t.name || 'T').charAt(0).toUpperCase();

        var pinHtml = [
          '<div class="tailor-pin-wrapper ' + (isSelected ? 'pin-active' : '') + '">',
          isSelected ? '  <div class="pin-pulse"></div>' : '',
          '  <div class="pin-marker ' + (isSelected ? 'marker-selected' : '') + '">',
          '    <div class="pin-icon">' + initial + '</div>',
          '    <div class="pin-rating">★ ' + ratingStr + '</div>',
          '  </div>',
          '  <div class="pin-tip"></div>',
          isSelected ? '  <div class="pin-name-bubble">' + nameStr + '</div>' : '',
          '</div>'
        ].join('');

        item.marker.setIcon(L.divIcon({
          className: 'tailor-pin-container',
          html: pinHtml,
          iconSize: [68, 64],
          iconAnchor: [34, 46]
        }));
      });
    }

    function fitAllBounds() {
      var keys = Object.keys(markerMap);
      if (keys.length === 0) return;
      var group = L.featureGroup(keys.map(function(k) { return markerMap[k].marker; }));
      map.fitBounds(group.getBounds().pad(0.18));
    }

    var userCircle = null;

    function setUserMarker(lat, lng, radiusKm) {
      if (userMarker) {
        userMarker.setLatLng([lat, lng]);
      } else {
        var userIcon = L.divIcon({
          className: '',
          html: '<div style="position:relative; width:28px; height:28px;"><div class="user-pulse-ring"></div><div class="user-dot"></div></div>',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        userMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
      }

      var rKm = Number(radiusKm) || ${maxRadius};
      if (rKm > 0) {
        var radiusMeters = rKm * 1000;
        if (userCircle) {
          userCircle.setLatLng([lat, lng]);
          userCircle.setRadius(radiusMeters);
        } else {
          userCircle = L.circle([lat, lng], {
            radius: radiusMeters,
            color: '#14919B',
            fillColor: '#14919B',
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '5, 5'
          }).addTo(map);
        }
      }
      map.flyTo([lat, lng], Math.max(map.getZoom(), 12), { duration: 1.0 });
    }

    function locateDevice() {
      if (!navigator.geolocation) {
        sendPayload({ type: 'LOCATING_FAILED', message: 'Geolocation not supported by device' });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          var lat = pos.coords.latitude;
          var lng = pos.coords.longitude;
          setUserMarker(lat, lng, ${maxRadius});
          sendPayload({ type: 'USER_LOCATED', latitude: lat, longitude: lng });
        },
        function(err) {
          sendPayload({ type: 'LOCATING_FAILED', message: 'GPS access denied or unavailable' });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }

    map.on('click', function() {
      sendPayload({ type: 'MAP_CLICKED' });
    });

    // Initial render
    var initialData = ${JSON.stringify(sanitizedTailors)};
    renderPins(initialData, currentSelectedId);

    // Initial user location and radius circle
    var initLat = ${effectiveCoords?.lat ?? "null"};
    var initLng = ${effectiveCoords?.lng ?? "null"};
    if (initLat !== null && initLng !== null) {
      setUserMarker(initLat, initLng, ${maxRadius});
    }

    // Auto locate device
    setTimeout(function() {
      locateDevice();
    }, 400);

    // Zoom controls callable from React Native
    function zoomInMap() {
      if (map) map.zoomIn();
    }
    function zoomOutMap() {
      if (map) map.zoomOut();
    }

    // Dynamic message receiver
    function handleMapMessage(payloadStr) {
      try {
        var data = typeof payloadStr === 'string' ? JSON.parse(payloadStr) : payloadStr;
        if (data && data.type === 'SYNC_PINS') {
          renderPins(data.tailors || [], data.selectedId || null);
        }
      } catch (e) {}
    }

    window.addEventListener('message', function(e) {
      try {
        if (typeof e.data === 'string') {
          if (
            e.data.indexOf('zoomInMap') !== -1 ||
            e.data.indexOf('zoomOutMap') !== -1 ||
            e.data.indexOf('flyToTailor') !== -1 ||
            e.data.indexOf('setUserMarker') !== -1 ||
            e.data.indexOf('fitAllBounds') !== -1 ||
            e.data.indexOf('handleMapMessage') !== -1
          ) {
            try {
              eval(e.data);
              return;
            } catch (evalErr) {}
          }
          var data = JSON.parse(e.data);
          if (data && data.type === 'SYNC_PINS') {
            renderPins(data.tailors || [], data.selectedId || null);
          }
        }
      } catch (err) {}
    });
  </script>
</body>
</html>
    `;
  }, [
    initialCenter.lat,
    initialCenter.lng,
  ]);

  // Selected tailor card attributes
  const tailorName =
    selectedTailor?.shopName ||
    selectedTailor?.businessName ||
    selectedTailor?.name ||
    "Tailor Studio";
  const ratingText = selectedTailor?.rating
    ? `${Number(selectedTailor.rating).toFixed(1)} (${selectedTailor.reviewsCount ?? selectedTailor.reviews ?? 0} reviews)`
    : "New (0 reviews)";
  const distanceText =
    selectedTailor?.distanceKm !== undefined
      ? `${selectedTailor.distanceKm.toFixed(1)} km away`
      : selectedTailor?.city || selectedTailor?.address || "Nearby";
  const specialtiesText =
    Array.isArray(selectedTailor?.specialties) &&
    selectedTailor.specialties.length > 0
      ? selectedTailor.specialties.slice(0, 3).join(", ")
      : selectedTailor?.bio || "Custom & Bespoke Tailoring";
  const tailorImage =
    selectedTailor?.imageUrl ||
    selectedTailor?.image ||
    selectedTailor?.avatarUrl ||
    selectedTailor?.avatar;
  const actualStartingPrice =
    selectedTailor?.startingPrice && Number(selectedTailor.startingPrice) > 0
      ? Number(selectedTailor.startingPrice)
      : (selectedTailor as any)?.starting_price && Number((selectedTailor as any).starting_price) > 0
        ? Number((selectedTailor as any).starting_price)
        : (selectedTailor as any)?.price && Number((selectedTailor as any).price) > 0
          ? Number((selectedTailor as any).price)
          : selectedTailor?.services?.[0]?.price && Number(selectedTailor.services[0].price) > 0
            ? Number(selectedTailor.services[0].price)
            : null;
  const startingPrice = actualStartingPrice
    ? `Rs. ${actualStartingPrice.toLocaleString()}`
    : "Pricing on request";

  return (
    <View style={styles.container}>
      {/* MAP LAYER */}
      <View style={styles.mapWrap}>
        {Platform.OS === "web" ? (
          // @ts-ignore
          <iframe
            id="tailors-map-frame"
            srcDoc={mapHtml}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Tailors Real Map"
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
            geolocationEnabled
          />
        )}
      </View>

      {/* TOP FLOATING CONTROLS */}
      <View
        style={[
          styles.topHeaderWrap,
          { paddingTop: insets.top > 0 ? insets.top + 8 : 16 },
        ]}
      >
        {/* Navigation & Search Row */}
        <View style={styles.searchRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.circleBtn}
            accessibilityLabel="Go Back"
          >
            <Ionicons name="arrow-back" size={20} color="#1A1D1F" />
          </TouchableOpacity>

          <View style={styles.searchInputWrap}>
            <Ionicons name="search" size={17} color="#6F767E" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tailors or specialties..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={handleClearSearch}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>



        {/* Quick Distance Radius Bar: 5 km, 10 km, 15 km */}
        <View style={styles.radiusQuickBar}>
          <Text style={styles.radiusBarLabel}>Radius:</Text>
          {DISTANCE_OPTIONS.map((d) => {
            const isSelected = maxRadius === d;
            return (
              <TouchableOpacity
                key={d}
                activeOpacity={0.8}
                onPress={() => setMaxRadius(d)}
                style={[
                  styles.radiusPill,
                  isSelected && styles.radiusPillActive,
                ]}
              >
                <Ionicons
                  name="navigate"
                  size={11}
                  color={isSelected ? "#FFFFFF" : "#14919B"}
                  style={{ marginRight: 3 }}
                />
                <Text
                  style={[
                    styles.radiusPillText,
                    isSelected && styles.radiusPillTextActive,
                  ]}
                >
                  {d} km
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* GPS Status Message Strip if any */}
        {gpsStatusMsg ? (
          <View style={styles.gpsBanner}>
            <Ionicons name="navigate" size={13} color="#14919B" />
            <Text style={styles.gpsBannerText}>{gpsStatusMsg}</Text>
          </View>
        ) : null}
      </View>

      {/* FLOATING ACTION BUTTONS (Right Side) */}
      <View style={styles.fabContainer}>
        {/* GPS locate me button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleTriggerGps}
          disabled={isLocating}
          style={styles.fabBtn}
          accessibilityLabel="Locate current position"
        >
          {isLocating ? (
            <ActivityIndicator size="small" color="#14919B" />
          ) : (
            <Ionicons name="locate" size={20} color="#14919B" />
          )}
        </TouchableOpacity>

        {/* Switch to list view button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/tailors" as never)}
          style={styles.fabBtn}
          accessibilityLabel="List View"
        >
          <Ionicons name="list" size={20} color="#1A1D1F" />
        </TouchableOpacity>

        {/* Zoom In button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            lightHaptic();
            sendMapCommand("zoomInMap();");
          }}
          style={styles.fabBtn}
          accessibilityLabel="Zoom In"
        >
          <Ionicons name="add" size={22} color="#1A1D1F" />
        </TouchableOpacity>

        {/* Zoom Out button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            lightHaptic();
            sendMapCommand("zoomOutMap();");
          }}
          style={styles.fabBtn}
          accessibilityLabel="Zoom Out"
        >
          <Ionicons name="remove" size={22} color="#1A1D1F" />
        </TouchableOpacity>
      </View>

      {/* BOTTOM SELECTED TAILOR CARD */}
      <View
        style={[
          styles.bottomContainer,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 16 },
        ]}
      >
        {isLoading ? (
          <View style={styles.cardLoading}>
            <ActivityIndicator size="small" color="#14919B" />
            <Text style={styles.cardLoadingText}>
              Finding tailors on map...
            </Text>
          </View>
        ) : selectedTailor ? (
          <View style={styles.tailorCard}>
            {/* Card Header Drag / Controls Row */}
            <View style={styles.cardTopRow}>
              <View style={styles.counterWrap}>
                <View style={styles.greenDot} />
                <Text style={styles.counterText}>
                  Tailor {selectedIndex + 1} of {filteredTailors.length}
                </Text>
              </View>

              {/* Prev / Next Tailor Navigators */}
              <View style={styles.navRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handlePrevTailor}
                  style={styles.navBtn}
                  accessibilityLabel="Previous tailor"
                >
                  <Ionicons name="chevron-back" size={17} color="#1A1D1F" />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleNextTailor}
                  style={styles.navBtn}
                  accessibilityLabel="Next tailor"
                >
                  <Ionicons name="chevron-forward" size={17} color="#1A1D1F" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Tailor Info Content */}
            <View style={styles.cardBody}>
              <TailorPlaceholder image={tailorImage} size="md" tone="coral" />

              <View style={styles.cardInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.shopName} numberOfLines={1}>
                    {tailorName}
                  </Text>
                  {selectedTailor.isVerified || selectedTailor.verified ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#14919B"
                      style={{ marginLeft: 4 }}
                    />
                  ) : null}
                </View>

                <RatingLine rating={ratingText} distance={distanceText} />

                <Text style={styles.specialties} numberOfLines={1}>
                  {specialtiesText}
                </Text>

                <View style={styles.badgeRow}>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>{startingPrice}</Text>
                  </View>
                  {selectedTailor.topRated || selectedTailor.isTopRated ? (
                    <TailorBadge label="Top Rated" tone="gray" />
                  ) : null}
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.cardActions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  router.push(`/tailors/${selectedTailor.id}` as never)
                }
                style={styles.viewProfileBtn}
              >
                <Text style={styles.viewProfileBtnText}>View Full Profile</Text>
                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color="#FFFFFF"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            {/* Top Indicator Badge */}
            <View style={styles.emptyTopBadge}>
              <Ionicons name="compass-outline" size={13} color="#14919B" />
              <Text style={styles.emptyTopBadgeText}>
                {appliedSearch
                  ? `Search: "${appliedSearch}"`
                  : `Current Radius: ${maxRadius} km`}
              </Text>
            </View>

            {/* Icon Graphic */}
            <View style={styles.emptyIconOuter}>
              <View style={styles.emptyCardIconWrap}>
                <Ionicons name="location" size={24} color="#14919B" />
              </View>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.emptyCardTitle}>
              {appliedSearch
                ? "No Tailors Found For Search"
                : `No Tailors Within ${maxRadius} km`}
            </Text>
            <Text style={styles.emptyCardSubtitle}>
              {appliedSearch
                ? `No tailoring studios matched "${appliedSearch}". Try a different spelling or clear search filters.`
                : `No registered tailors found within ${maxRadius} km of this position. Expand your search distance or view all available masters.`}
            </Text>

            {/* Action Buttons */}
            <View style={styles.emptyCardButtons}>
              {!appliedSearch && maxRadius < 15 && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    lightHaptic();
                    setMaxRadius((prev) => (prev === 5 ? 10 : 15));
                    setShowAllTailors(false);
                  }}
                  style={styles.expandRadiusBtn}
                >
                  <Ionicons
                    name="expand-outline"
                    size={14}
                    color="#FFFFFF"
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.expandRadiusBtnText}>
                    Expand to {maxRadius === 5 ? "10 km" : "15 km"}
                  </Text>
                </TouchableOpacity>
              )}

              {appliedSearch ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    lightHaptic();
                    handleClearSearch();
                  }}
                  style={styles.resetBtn}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={14}
                    color="#4B5563"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.resetBtnText}>Clear Search</Text>
                </TouchableOpacity>
              ) : maxRadius !== 10 ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    lightHaptic();
                    setMaxRadius(10);
                  }}
                  style={styles.resetBtn}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={13}
                    color="#4B5563"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.resetBtnText}>Reset Radius (10 km)</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F0F2",
  },
  mapWrap: {
    flex: 1,
    position: "relative",
  },
  topHeaderWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
  activeFilterBtn: {
    borderWidth: 2,
    borderColor: "#14919B",
    backgroundColor: "#F0FAFA",
  },
  searchInputWrap: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#1A1D1F",
    fontWeight: "500",
    paddingVertical: 0,
  },

  gpsBanner: {
    marginTop: 8,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(235, 248, 249, 0.96)",
    borderWidth: 1,
    borderColor: "#BEE8EB",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  gpsBannerText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#14919B",
  },
  fabContainer: {
    position: "absolute",
    right: 16,
    top: 125,
    zIndex: 15,
    gap: 10,
  },
  fabBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    zIndex: 25,
  },
  cardLoading: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
  cardLoadingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  tailorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  counterWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#10B981",
  },
  counterText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#14919B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  navBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flexDirection: "row",
    paddingTop: 12,
  },
  cardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  shopName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1A1D1F",
    flex: 1,
  },
  specialties: {
    fontSize: 11,
    fontWeight: "500",
    color: "#6F767E",
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  priceBadge: {
    backgroundColor: "#F0FAFA",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  priceBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#14919B",
  },
  cardActions: {
    marginTop: 14,
  },
  viewProfileBtn: {
    height: 46,
    borderRadius: 10,
    backgroundColor: "#14919B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#14919B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  viewProfileBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyTopBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FAFA",
    borderWidth: 1,
    borderColor: "#BEE8EB",
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 12,
    marginBottom: 12,
  },
  emptyTopBadgeText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#14919B",
    marginLeft: 5,
  },
  emptyIconOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0FAFA",
    borderWidth: 1.5,
    borderColor: "#D2F0F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyCardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E0F7F7",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCardTitle: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
    textAlign: "center",
  },
  emptyCardSubtitle: {
    fontSize: 12.5,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  emptyCardButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  showAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FAFA",
    borderWidth: 1,
    borderColor: "#BEE8EB",
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
  },
  showAllBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#14919B",
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  radiusQuickBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  radiusBarLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4B5563",
    marginRight: 2,
  },
  radiusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  radiusPillActive: {
    backgroundColor: "#14919B",
    borderColor: "#14919B",
  },
  radiusPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  radiusPillTextActive: {
    color: "#FFFFFF",
  },
  gpsActiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: "auto",
  },
  gpsActiveText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#065F46",
  },
  gpsDetectBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#E0F7F7",
    borderWidth: 1,
    borderColor: "#B2EBF2",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 10,
    marginLeft: "auto",
  },
  gpsDetectText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#14919B",
  },
  expandRadiusBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#14919B",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: "#14919B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  expandRadiusBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
