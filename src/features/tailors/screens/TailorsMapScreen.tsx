import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { RatingLine } from "../components/RatingLine";
import { TailorBadge } from "../components/TailorBadge";
import { TailorBottomTabs } from "../components/TailorBottomTabs";
import { TailorPlaceholder } from "../components/TailorPlaceholder";
import { FixedBottomTabs } from "@/components/layout/FixedBottomTabs";
import { useTailorsMap } from "../hooks/useTailors";
import { TailorItem } from "@/types/api";

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  All: { lat: 31.5204, lng: 74.3587 },
  Lahore: { lat: 31.5204, lng: 74.3587 },
  Karachi: { lat: 24.8607, lng: 67.0011 },
  Islamabad: { lat: 33.6844, lng: 73.0479 },
  Rawalpindi: { lat: 33.5651, lng: 73.0169 },
  Faisalabad: { lat: 31.4504, lng: 73.1350 },
  Multan: { lat: 30.1575, lng: 71.5249 },
};

const CITY_CHIPS = ["All", "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad"];

const DISTANCE_OPTIONS = [5, 10, 15] as const;
type AllowedRadius = (typeof DISTANCE_OPTIONS)[number];

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  const [selectedCity, setSelectedCity] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxRadius, setMaxRadius] = useState<AllowedRadius>(10);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // User Geolocation State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);

  // Effective location: device GPS coords if available, otherwise city center or Lahore as default reference
  const effectiveCoords = useMemo(() => {
    if (userCoords) return userCoords;
    if (selectedCity !== "All" && CITY_COORDINATES[selectedCity]) {
      return CITY_COORDINATES[selectedCity];
    }
    return CITY_COORDINATES["Lahore"];
  }, [userCoords, selectedCity]);

  // Selected Tailor State
  const [selectedTailorId, setSelectedTailorId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const webViewRef = useRef<WebView | null>(null);

  // Fetch tailors with map endpoint using effective coordinates & maxRadius
  const { tailors, isLoading } = useTailorsMap({
    city: selectedCity !== "All" ? selectedCity : undefined,
    search: appliedSearch || undefined,
    lat: effectiveCoords?.lat,
    lng: effectiveCoords?.lng,
    radius: maxRadius,
  });

  // Client-side strict filtering for distance, rating, and verification
  const filteredTailors = useMemo(() => {
    const originLat = effectiveCoords?.lat;
    const originLng = effectiveCoords?.lng;

    return tailors
      .map((t) => {
        let dist = typeof t.distanceKm === "number" ? t.distanceKm : undefined;
        if (
          typeof originLat === "number" &&
          typeof originLng === "number" &&
          typeof t.latitude === "number" &&
          typeof t.longitude === "number"
        ) {
          dist = calculateDistanceKm(originLat, originLng, t.latitude, t.longitude);
        }
        return {
          ...t,
          distanceKm: dist,
        };
      })
      .filter((t) => {
        if (minRating && (t.rating || 0) < minRating) return false;
        if (verifiedOnly && !t.verified && !t.isVerified) return false;
        // Strictly check distance: only tailors within maxRadius (5, 10, or 15 km)
        if (typeof t.distanceKm === "number") {
          return t.distanceKm <= maxRadius;
        }
        // Exclude tailors with no distance or invalid coordinates
        return false;
      })
      .sort((a, b) => {
        const distA = typeof a.distanceKm === "number" ? a.distanceKm : 999999;
        const distB = typeof b.distanceKm === "number" ? b.distanceKm : 999999;
        return distA - distB;
      });
  }, [tailors, minRating, verifiedOnly, maxRadius, effectiveCoords]);

  // Keep a selected tailor in view
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
      if (!selectedTailorId || !filteredTailors.some((t) => t.id === selectedTailorId)) {
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
          const iframe = document.querySelector("#tailors-map-frame") as HTMLIFrameElement;
          iframe?.contentWindow?.postMessage(command, "*");
        } catch {}
      }
    } else {
      webViewRef.current?.injectJavaScript(`${command}; true;`);
    }
  }, []);

  // Handle messages from WebView or iframe
  const processIncomingData = useCallback((data: any) => {
    if (!data) return;
    if (data.type === "TAILOR_PIN_CLICKED") {
      if (data.tailorId) {
        setSelectedTailorId(data.tailorId);
      }
    } else if (data.type === "USER_LOCATED") {
      setUserCoords({ lat: data.latitude, lng: data.longitude });
      setIsLocating(false);
      setGpsStatusMsg(`GPS Location Acquired (Filtered within ${maxRadius} km)`);
      sendMapCommand(`setUserMarker(${data.latitude}, ${data.longitude}, ${maxRadius})`);
      setTimeout(() => setGpsStatusMsg(null), 3500);
    } else if (data.type === "LOCATING_FAILED") {
      setIsLocating(false);
      setGpsStatusMsg(data.message || "Could not detect GPS. Using area reference.");
      setTimeout(() => setGpsStatusMsg(null), 3500);
    }
  }, [maxRadius, sendMapCommand]);

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
  }, [processIncomingData]);

  const handleNativeMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      processIncomingData(data);
    } catch {
      // ignore
    }
  };

  // Sync active tailor pins with map
  useEffect(() => {
    const payload = JSON.stringify({
      type: "SYNC_PINS",
      tailors: filteredTailors.map((t) => ({
        id: t.id,
        name: t.shopName || t.name || "Tailor Studio",
        rating: t.rating || 0,
        specialty: Array.isArray(t.specialties) ? t.specialties.join(", ") : t.specialty || "",
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
      sendMapCommand(`setUserMarker(${effectiveCoords.lat}, ${effectiveCoords.lng}, ${maxRadius})`);
    }
  }, [effectiveCoords, maxRadius, sendMapCommand]);

  // Center on tailor when card changes
  const handleSelectTailor = (tailor: TailorItem) => {
    setSelectedTailorId(tailor.id);
    if (typeof tailor.latitude === "number" && typeof tailor.longitude === "number") {
      sendMapCommand(`flyToTailor(${tailor.latitude}, ${tailor.longitude}, "${tailor.id}")`);
    }
  };

  const handleNextTailor = () => {
    if (filteredTailors.length <= 1) return;
    const nextIdx = (selectedIndex + 1) % filteredTailors.length;
    handleSelectTailor(filteredTailors[nextIdx]);
  };

  const handlePrevTailor = () => {
    if (filteredTailors.length <= 1) return;
    const prevIdx = (selectedIndex - 1 + filteredTailors.length) % filteredTailors.length;
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
            setGpsStatusMsg(`GPS Location Acquired (Filtered within ${maxRadius} km)`);
            sendMapCommand(`setUserMarker(${lat}, ${lng}, ${maxRadius})`);
            setTimeout(() => setGpsStatusMsg(null), 3500);
          },
          () => {
            setIsLocating(false);
            setGpsStatusMsg("Location access denied. Using area reference.");
            setTimeout(() => setGpsStatusMsg(null), 3500);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    } else {
      webViewRef.current?.injectJavaScript("locateDevice(); true;");
    }
  }, [maxRadius, sendMapCommand]);

  // Auto-detect location on initial screen mount
  useEffect(() => {
    handleTriggerGps();
  }, [handleTriggerGps]);

  // City chip selection
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    const coords = CITY_COORDINATES[city] || CITY_COORDINATES["Lahore"];
    const zoom = city === "All" ? 7 : 13;
    sendMapCommand(`map.flyTo([${coords.lat}, ${coords.lng}], ${zoom}, { duration: 1.2 });`);
  };

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
    sendMapCommand("fitAllBounds();");
  };

  const toggleFavorite = (tailorId: string) => {
    setFavorites((prev) => ({ ...prev, [tailorId]: !prev[tailorId] }));
  };

  // Initial center coordinates
  const initialCenter = selectedTailor && typeof selectedTailor.latitude === "number" && typeof selectedTailor.longitude === "number"
    ? { lat: selectedTailor.latitude, lng: selectedTailor.longitude }
    : CITY_COORDINATES["Lahore"];

  // HTML Content for the Leaflet Map
  const mapHtml = useMemo(() => {
    const sanitizedTailors = filteredTailors.map((t) => ({
      id: t.id,
      name: (t.shopName || t.name || "Tailor Studio").replace(/"/g, '\\"'),
      rating: typeof t.rating === "number" ? t.rating : 0,
      specialty: (Array.isArray(t.specialties) ? t.specialties.join(", ") : t.specialty || "").replace(/"/g, '\\"'),
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
      border: 2px solid #078B87;
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
      background: #078B87 !important;
      box-shadow: 0 6px 20px rgba(7, 139, 135, 0.55);
      transform: scale(1.12);
    }
    .pin-icon {
      font-size: 13px;
      font-weight: 900;
      color: #078B87;
      line-height: 1;
    }
    .marker-selected .pin-icon {
      color: #FFFFFF !important;
    }
    .pin-rating {
      font-size: 9px;
      font-weight: 700;
      color: #FFFFFF;
      background: #078B87;
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
      border-top: 7px solid #078B87;
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

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

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
            color: '#078B87',
            fillColor: '#078B87',
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
        var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.type === 'SYNC_PINS') {
          renderPins(data.tailors || [], data.selectedId || null);
        }
      } catch (err) {}
    });
  </script>
</body>
</html>
    `;
  }, [filteredTailors, initialCenter.lat, initialCenter.lng, selectedTailor?.id]);

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
    Array.isArray(selectedTailor?.specialties) && selectedTailor.specialties.length > 0
      ? selectedTailor.specialties.slice(0, 3).join(", ")
      : selectedTailor?.bio || "Custom & Bespoke Tailoring";
  const tailorImage =
    selectedTailor?.imageUrl ||
    selectedTailor?.image ||
    selectedTailor?.avatarUrl ||
    selectedTailor?.avatar;
  const startingPrice =
    selectedTailor?.startingPrice && Number(selectedTailor.startingPrice) > 0
      ? `Rs. ${Number(selectedTailor.startingPrice).toLocaleString()}`
      : "Price on request";

  const isFavorite = selectedTailor?.id ? !!favorites[selectedTailor.id] : false;

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
      <View style={[styles.topHeaderWrap, { paddingTop: insets.top > 0 ? insets.top + 8 : 16 }]}>
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
              <TouchableOpacity onPress={handleClearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsFilterModalVisible(true)}
            style={[styles.circleBtn, (minRating || verifiedOnly || maxRadius !== 10) ? styles.activeFilterBtn : null]}
            accessibilityLabel="Filter Tailors"
          >
            <Ionicons
              name="options-outline"
              size={19}
              color={(minRating || verifiedOnly || maxRadius !== 10) ? "#078B87" : "#1A1D1F"}
            />
          </TouchableOpacity>
        </View>

        {/* City Quick Chips Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cityChipsContent}
          style={styles.cityChipsScroll}
        >
          {CITY_CHIPS.map((cityName) => {
            const isActive = selectedCity === cityName;
            return (
              <TouchableOpacity
                key={cityName}
                activeOpacity={0.8}
                onPress={() => handleCityChange(cityName)}
                style={[styles.cityChip, isActive && styles.cityChipActive]}
              >
                <Ionicons
                  name="location-sharp"
                  size={12}
                  color={isActive ? "#FFFFFF" : "#078B87"}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.cityChipText, isActive && styles.cityChipTextActive]}>
                  {cityName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

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
                style={[styles.radiusPill, isSelected && styles.radiusPillActive]}
              >
                <Ionicons
                  name="navigate"
                  size={11}
                  color={isSelected ? "#FFFFFF" : "#078B87"}
                  style={{ marginRight: 3 }}
                />
                <Text style={[styles.radiusPillText, isSelected && styles.radiusPillTextActive]}>
                  {d} km
                </Text>
              </TouchableOpacity>
            );
          })}
          {userCoords ? (
            <View style={styles.gpsActiveBadge}>
              <Ionicons name="navigate-circle" size={12} color="#059669" />
              <Text style={styles.gpsActiveText}>GPS Active</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={handleTriggerGps} style={styles.gpsDetectBadge}>
              <Ionicons name="locate" size={11} color="#078B87" />
              <Text style={styles.gpsDetectText}>Detect GPS</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* GPS Status Message Strip if any */}
        {gpsStatusMsg ? (
          <View style={styles.gpsBanner}>
            <Ionicons name="navigate" size={13} color="#078B87" />
            <Text style={styles.gpsBannerText}>{gpsStatusMsg}</Text>
          </View>
        ) : null}
      </View>

      {/* FLOATING ACTION BUTTONS (Right Side) */}
      <View style={styles.fabContainer}>
        {/* Fit all pins button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleFitAllPins}
          style={styles.fabBtn}
          accessibilityLabel="Fit all pins in view"
        >
          <Ionicons name="scan-outline" size={20} color="#1A1D1F" />
        </TouchableOpacity>

        {/* GPS locate me button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleTriggerGps}
          disabled={isLocating}
          style={styles.fabBtn}
          accessibilityLabel="Locate current position"
        >
          {isLocating ? (
            <ActivityIndicator size="small" color="#078B87" />
          ) : (
            <Ionicons name="locate" size={20} color="#078B87" />
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
      </View>

      {/* BOTTOM SELECTED TAILOR CARD */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom + 65 : 80 }]}>
        {isLoading ? (
          <View style={styles.cardLoading}>
            <ActivityIndicator size="small" color="#078B87" />
            <Text style={styles.cardLoadingText}>Finding tailors on map...</Text>
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

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleFavorite(selectedTailor.id)}
                  style={styles.favBtn}
                >
                  <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={20}
                    color={isFavorite ? "#EF4444" : "#1A1D1F"}
                  />
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
                    <Ionicons name="checkmark-circle" size={16} color="#078B87" style={{ marginLeft: 4 }} />
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
                onPress={() => router.push(`/tailors/${selectedTailor.id}` as never)}
                style={styles.viewProfileBtn}
              >
                <Text style={styles.viewProfileBtnText}>View Full Profile</Text>
                <Ionicons name="arrow-forward" size={15} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="location-outline" size={28} color="#9CA3AF" />
            <Text style={styles.emptyCardTitle}>No tailors within {maxRadius} km</Text>
            <Text style={styles.emptyCardSubtitle}>
              {userCoords
                ? `No registered tailors found within ${maxRadius} km of your GPS coordinates.`
                : `No registered tailors found within ${maxRadius} km of ${selectedCity === "All" ? "your current area" : selectedCity}.`}
              {maxRadius < 15 ? " Try expanding distance to 10 km or 15 km." : ""}
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              {maxRadius < 15 && (
                <TouchableOpacity
                  onPress={() => setMaxRadius((prev) => (prev === 5 ? 10 : 15))}
                  style={styles.expandRadiusBtn}
                >
                  <Text style={styles.expandRadiusBtnText}>
                    Expand to {maxRadius === 5 ? "10 km" : "15 km"}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  setSelectedCity("All");
                  setSearchQuery("");
                  setAppliedSearch("");
                  setMinRating(null);
                  setVerifiedOnly(false);
                  setMaxRadius(10);
                  handleCityChange("All");
                }}
                style={styles.resetBtn}
              >
                <Text style={styles.resetBtnText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* FILTER MODAL */}
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 24 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Tailors on Map</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)} style={styles.circleBtn}>
                <Ionicons name="close" size={20} color="#1A1D1F" />
              </TouchableOpacity>
            </View>

            {/* Minimum Rating */}
            <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
            <View style={styles.filterOptionsRow}>
              {[null, 4.0, 4.5, 4.8].map((r) => {
                const isSelected = minRating === r;
                return (
                  <TouchableOpacity
                    key={r === null ? "all" : r.toString()}
                    onPress={() => setMinRating(r)}
                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                      {r === null ? "Any Rating" : `★ ${r.toFixed(1)}+`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Verified Filter */}
            <Text style={styles.filterSectionTitle}>Verification</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setVerifiedOnly(!verifiedOnly)}
              style={styles.toggleRow}
            >
              <View>
                <Text style={styles.toggleLabel}>Verified Tailors Only</Text>
                <Text style={styles.toggleDesc}>Show only boutiques with verified studio credentials</Text>
              </View>
              <View style={[styles.switchTrack, verifiedOnly && styles.switchTrackActive]}>
                <View style={[styles.switchThumb, verifiedOnly && styles.switchThumbActive]} />
              </View>
            </TouchableOpacity>

            {/* Distance Radius (Strictly 5, 10, 15 km) */}
            <Text style={styles.filterSectionTitle}>Distance Radius</Text>
            <Text style={styles.filterSectionSubtitle}>
              Checks and displays tailors within this distance from your location (lat & lng)
            </Text>
            <View style={styles.filterOptionsRow}>
              {DISTANCE_OPTIONS.map((d) => {
                const isSelected = maxRadius === d;
                return (
                  <TouchableOpacity
                    key={d.toString()}
                    onPress={() => setMaxRadius(d)}
                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  >
                    <Ionicons
                      name="navigate-circle"
                      size={14}
                      color={isSelected ? "#078B87" : "#6B7280"}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                      Within {d} km
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Apply & Reset Buttons */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                onPress={() => {
                  setMinRating(null);
                  setVerifiedOnly(false);
                  setMaxRadius(10);
                  setIsFilterModalVisible(false);
                }}
                style={styles.modalResetBtn}
              >
                <Text style={styles.modalResetBtnText}>Reset to 10 km</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsFilterModalVisible(false)}
                style={styles.modalApplyBtn}
              >
                <Text style={styles.modalApplyBtnText}>Apply ({filteredTailors.length})</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FIXED BOTTOM TABS */}
      <FixedBottomTabs>
        <TailorBottomTabs />
      </FixedBottomTabs>
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
    borderColor: "#078B87",
    backgroundColor: "#EBF8F9",
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
  cityChipsScroll: {
    marginTop: 10,
  },
  cityChipsContent: {
    gap: 8,
    paddingVertical: 2,
  },
  cityChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cityChipActive: {
    backgroundColor: "#078B87",
    borderColor: "#078B87",
  },
  cityChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  cityChipTextActive: {
    color: "#FFFFFF",
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
    color: "#078B87",
  },
  fabContainer: {
    position: "absolute",
    right: 16,
    top: 155,
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
    color: "#078B87",
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
  favBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
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
    backgroundColor: "#EBF8F9",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  priceBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#078B87",
  },
  cardActions: {
    marginTop: 14,
  },
  viewProfileBtn: {
    height: 46,
    borderRadius: 10,
    backgroundColor: "#078B87",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#078B87",
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
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1D1F",
    marginTop: 8,
  },
  emptyCardSubtitle: {
    fontSize: 12,
    color: "#6F767E",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 16,
  },
  resetBtn: {
    marginTop: 12,
    backgroundColor: "#EBF8F9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#078B87",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1A1D1F",
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  filterOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  filterChipActive: {
    borderColor: "#078B87",
    backgroundColor: "#EBF8F9",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
  filterChipTextActive: {
    color: "#078B87",
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1D1F",
  },
  toggleDesc: {
    fontSize: 11,
    color: "#6F767E",
    marginTop: 2,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    padding: 2,
    justifyContent: "center",
  },
  switchTrackActive: {
    backgroundColor: "#078B87",
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    alignSelf: "flex-end",
  },
  modalActionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalResetBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  modalResetBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6F767E",
  },
  modalApplyBtn: {
    flex: 2,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#078B87",
    alignItems: "center",
    justifyContent: "center",
  },
  modalApplyBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  filterSectionSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: -4,
    marginBottom: 10,
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
    backgroundColor: "#078B87",
    borderColor: "#078B87",
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
    backgroundColor: "#EBF8F9",
    borderWidth: 1,
    borderColor: "#BEE8EB",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 10,
    marginLeft: "auto",
  },
  gpsDetectText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#078B87",
  },
  expandRadiusBtn: {
    backgroundColor: "#078B87",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  expandRadiusBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

