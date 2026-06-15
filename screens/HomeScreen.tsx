import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Svg, { Path } from 'react-native-svg';

import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { useAuth } from '../context/AuthContext';

import { getAllStations } from '../services/StationService';
import { Station } from '../types/Stations';
import { logger } from '../utils/logger';
import { PLAYA_LOGO_SVG } from '../constants/Logos';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useNavigation } from '@react-navigation/native';
import StationDetailSheet, { StationDetailSheetRef } from './StationDetailSheet';
import { useFocusEffect } from '@react-navigation/native';
import BlueHeader from '../components/HeaderBlue';
import BottomNav from '../components/BottomNav';
import { Ionicons } from '@expo/vector-icons';
import { FiltrerState, FILTRES_VIDES } from '../types/Filtres';
import { applyFiltres } from '../utils/filtres';
import FiltrersDrawer from '../components/FiltrersDrawer';



const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Centre initial : Pornic
const INITIAL_LAT = 47.1153;
const INITIAL_LNG = -2.1031;
const INITIAL_ZOOM = 6;

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const webViewRef = useRef<WebView>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const stationSheetRef = useRef<StationDetailSheetRef>(null);
  const [backendDown, setBackendDown] = useState(false);
  const [filtresVisible, setFiltresVisible] = useState(false);
  const [filtres, setFiltres] = useState<FiltrerState>(FILTRES_VIDES);
  

  const loadStations = async () => {
    try {
      const data = await getAllStations();
      setStations(data.filter(s => 
        s.estVisible && 
        s.latitude != null &&
        s.longitude != null &&
        applyFiltres(s, filtres)
      ));
      setBackendDown(false);
    }catch (error) {
      setBackendDown(true);
    }
  };
  // refresh les markers a chauqe fois que l'ecran devient actif 
  useFocusEffect(
    useCallback(() => {
    loadStations();
  }, [])
);

useEffect(() => {
    loadStations();
}, [filtres]);

// On injecte les stations sur la carte 
  const injectStations = (data: Station[]) => {
    if (data.length === 0) return;
    const stationsJson = JSON.stringify(data);
    const script = `window.setStations(${JSON.stringify(stationsJson)}); true;`;
    webViewRef.current?.injectJavaScript(script);
  };

//Quand les stations changent on tente de les réinjecter 
  useEffect(() => {
    if(mapReady && stations.length > 0) {

      injectStations(stations);
    }
  }, [mapReady, stations]);

useEffect(() => {
    const interval = setInterval(() => {
        logger.info('HomeScreen', 'Auto-refresh stations (60s)');
        loadStations();
    },60_000);

    // Nettoyage à la sortie du composant (essentiel pour éviter les memory leaks)
    return () => clearInterval(interval);
}, [filtres]);



  // HTML de la carte Leaflet
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
          body { background: #f0f0f0; }
          .custom-marker { background: transparent !important; border: none !important; }
                .leaflet-popup-content-wrapper {
                  border-radius: 12px !important;
                  padding: 0 !important;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                }

                .leaflet-popup-content {
                  margin: 0 !important;
                  width: auto !important;
                  min-width: 140px; 
                }

                .popup-card {
                  padding: 14px 16px;
                  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                  min-width: 140px;
                }

                .popup-title {
                  font-size: 15px;
                  font-weight: 700;
                  color: #1A4D5C;
                  margin-bottom: 8px;
                  line-height: 1.2;
                }

                .popup-badge {
                  display: inline-block;
                  padding: 3px 10px;
                  border-radius: 12px;
                  font-size: 11px;
                  font-weight: 700;
                  margin-bottom: 10px;
                }

                .popup-badge-open {
                  background-color: #E8F5E9;
                  color: #2E7D32;
                }

                .popup-badge-closed {
                  background-color: #FFEBEE;
                  color: #C62828;
                }

                .popup-stats {
                  margin-bottom: 12px;
                  font-size: 13px;
                  color: #555;
                }

                .popup-stat-value {
                  font-size: 18px;
                  font-weight: 700;
                  color: #1A4D5C;
                }

                .popup-stat-sep {
                  font-size: 18px;
                  color: #999;
                }

                .popup-stat-total {
                  font-size: 18px;
                  font-weight: 700;
                  color: #999;
                }

                .popup-stat-label {
                  font-size: 12px;
                  color: #666;
                }

                .popup-button {
                  width: 100%;
                  background-color: #1A4D5C;
                  color: white;
                  border: none;
                  border-radius: 8px;
                  padding: 10px 16px;
                  font-weight: 700;
                  font-size: 13px;
                  cursor: pointer;
                  font-family: inherit;
                }

                .popup-button:active {
                  background-color: #0d3743;
                }

                /* Cache la flèche par défaut Leaflet */
                .leaflet-popup-tip-container {
                  display: none;
                }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            window.onerror = function(msg, url, line) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              type: 'jsError', 
              message: msg + ' (ligne ' + line + ')' 
            }));
            return false;
          };
          var PLAYA_LOGO_SVG = ${JSON.stringify(PLAYA_LOGO_SVG)};
          const map = L.map('map', { zoomControl: false })
            .setView([${INITIAL_LAT}, ${INITIAL_LNG}], ${INITIAL_ZOOM});

          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap',
          }).addTo(map);

          // Fonction exposée pour recentrer
          window.recenterMap = function(lat, lng, zoom) {
            map.flyTo([lat, lng], zoom || ${INITIAL_ZOOM}, { duration: 0.8 });
          };

          // Gestion des markers de stations
          var stationMarkers = [];

          window.setStations = function(stationsJson) {
            try {
              stationMarkers.forEach(function(m) { map.removeLayer(m); });
              stationMarkers = [];
              var stations = JSON.parse(stationsJson);

              function getMarkerIcon(etat){
                var color;
                if (etat === 'OUVERTE') color = '#015060';
                else if (etat === 'FERME') color = '#D32F2F';
                else color = '#888888' 
                var html = 
                  '<div style="position: relative; width: 36px; height: 48px;">' +
                    // La goutte en SVG
                    '<svg width="36" height="38" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));">' +
                      '<path d="M18 0 C8 0 0 8 0 18 C0 30 18 48 18 48 C18 48 36 30 36 18 C36 8 28 0 18 0 Z" fill="' + color + '"/>' +
                    '</svg>' +
                    '<div style="position: absolute; top: 7px; left: 9px; width: 18px; height: 18px;">' + PLAYA_LOGO_SVG + '</div>' +
                  '</div>';
                
                return L.divIcon({
                  html: html,
                  className: 'custom-marker',
                  iconSize: [30, 40],
                  iconAnchor: [18, 48],     // ← la pointe touche la coordonnée GPS
                  popupAnchor: [0, -48]
                });
              }

              stations.forEach(function(s) {
                var marker = L.marker([s.latitude, s.longitude], {
                  icon: getMarkerIcon(s.etat)
                  }).addTo(map);

            marker.bindPopup(
                '<div class="popup-card">' +
                  '<div class="popup-title">' + s.nom + '</div>' +
                  '<div class="popup-badge popup-badge-' + (s.etat === 'OUVERTE' ? 'open' : 'closed') + '">' + s.etat + '</div>' +
                  '<div class="popup-stats">' +
                    '<span class="popup-stat-value">' + (s.nombreComposantsDisponibles != null ? s.nombreComposantsDisponibles : 0) + '</span>' +
                    '<span class="popup-stat-sep"> / </span>' +
                    '<span class="popup-stat-total">' + (s.nombreComposantsTotal != null ? s.nombreComposantsTotal : 0) + '</span>' +
                    '<span class="popup-stat-label"> équipements disponibles</span>' +
                  '</div>' +
                 
                  '<button class="popup-button" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type:\\'stationClicked\\', stationId:\\'' + s.id + '\\'}))">' +
                    'Voir le détail' +
                  '</button>' +
                '</div>',
                );
                stationMarkers.push(marker);
              });
            }catch (e){
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'jsError',
                message: 'setStations: ' + e.message
              }));
            }
          };
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
        </script>
      </body>
    </html>
  `;
const handleLogout = async () => {
    try {
        await logout();
        
    } catch (error) {
        logger.error('HomeScreen', 'Erreur déconnexion', error);
    }
};

  const handleRecenter = () => {
    const script = `window.recenterMap(${INITIAL_LAT}, ${INITIAL_LNG}, ${INITIAL_ZOOM}); true;`;
    webViewRef.current?.injectJavaScript(script);
  };

  const handleMenuPress = () => {
    setFiltresVisible(true);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if(data.type === 'log') {
        logger.info('WebView', data.message);
      }
      if (data.type === 'jsError'){
        logger.error('WebView JS', data.message);
      }
      if(data.type === 'mapReady'){
        
        setMapReady(true);
      }
      else if (data.type === 'stationClicked'){
        stationSheetRef.current?.open(data.stationId);
      }
    }catch (err){
      logger.error('HomeScreen', 'Erreur de chargement de la WebView', err);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
        <BlueHeader title="" showProfile showLogo showLogout compact />
        {backendDown && (
          <View style={styles.offlineBanner}>
              <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
              <Text style={styles.offlineBannerText}>
                  Reconnexion au serveur en cours...
              </Text>
          </View>
      )}
      {/* CARTE LEAFLET dans WEBVIEW */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={styles.webview}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onMessage={handleWebViewMessage}
        />
        {/* Bouton burger menu */}
        <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton} activeOpacity={0.8}>
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </TouchableOpacity>


        {/* Bouton recentrer */}
        <TouchableOpacity onPress={handleRecenter} style={styles.recenterButton} activeOpacity={0.8}>
            <Ionicons name="locate-outline" size={26} color={Colors.PlayaBlue} />
        </TouchableOpacity>
      </View>

      {/* BOTTOM NAV JAUNE */}
      <BottomNav />
      <StationDetailSheet ref={stationSheetRef} />
      <FiltrersDrawer
    visible={filtresVisible}
    filtres={filtres}
    onClose={() => setFiltresVisible(false)}
    onApply={setFiltres}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PlayaBlue,
  },
  header: {
    backgroundColor: Colors.PlayaBlue,
    paddingHorizontal: 150,
    paddingBottom: 60,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    flex: 1,
  },
  logo: {
    width: 150,
    height: 100,
  },
  brandText: {
    fontSize: 16,
    color: Colors.PlayaYellow,
    fontFamily: Fonts.bold,
    marginTop: 2,
  },
  profileButton: {
    position: 'absolute',
    right:16,
    top: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  profileIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  wave: {
    marginTop: -1,
    backgroundColor:'transparent',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F0F0F0',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  menuLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#333',
    marginVertical: 2,
    borderRadius: 1,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  recenterIcon: {
    fontSize: 24,
    color: Colors.PlayaBlue,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: Colors.PlayaYellow,
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navIcon: {
    fontSize: 24,
    color: Colors.PlayaBlue,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 13,
    color: Colors.PlayaBlue,
    fontFamily: Fonts.bold,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F5A623',         // orange doux
    paddingVertical: 6,
    paddingHorizontal: 12,
},
offlineBannerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
},
});