import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { getStationById } from '../services/StationService';
import { Station } from '../types/Stations';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { logger } from '../utils/logger';


type RouteParams = {
  StationDetail: { stationId: string };
};

export default function StationDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'StationDetail'>>();
  const insets = useSafeAreaInsets();

  const { stationId } = route.params;

  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStation();
  }, [stationId]);

  const loadStation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getStationById(stationId);
      setStation(data);
    
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      logger.error('StationDetailScreen', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header bleu */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la station</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Vague décorative */}
      <Svg height="40" width="100%" viewBox="0 0 1440 100" style={styles.wave}>
        <Path
          fill={Colors.PlayaBlue}
          d="M0,32L48,42.7C96,53,192,75,288,80C384,85,480,75,576,69.3C672,64,768,64,864,58.7C960,53,1056,43,1152,42.7C1248,43,1344,53,1392,58.7L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        />
      </Svg>

      {/* Contenu */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.PlayaBlue} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadStation}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : station ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Titre */}
          <Text style={styles.stationName}>{station.nom}</Text>

          {/* Badge état */}
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.badge,
                station.etat === 'OUVERTE'
                  ? styles.badgeOuverte
                  : station.etat === 'FERMEE'
                  ? styles.badgeFermee
                  : styles.badgeMaintenance,
              ]}
            >
              <Text style={styles.badgeText}>{station.etat}</Text>
            </View>
          </View>

          {/* Section infos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Équipements disponibles</Text>
              <Text style={styles.infoValueBig}>{station.nombreComposants}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Coordonnées GPS</Text>
              <Text style={styles.infoValueSmall}>
                {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
              </Text>
            </View>
          </View>

          {/* Section action principale */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[
                styles.mainAction,
                station.etat !== 'OUVERTE' && styles.mainActionDisabled,
              ]}
              disabled={station.etat !== 'OUVERTE'}
              onPress={() => {
                // À implémenter : Scan&Ride / Réservation
              }}
            >
              <Text style={styles.mainActionText}>
                {station.etat === 'OUVERTE'
                  ? 'Louer maintenant'
                  : 'Station indisponible'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: Colors.PlayaBlue,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.bold,
    flex: 1,
    textAlign: 'center',
  },
  wave: {
    marginTop: -1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#C62828',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.PlayaBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  stationName: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: Colors.PlayaBlue,
    marginBottom: 4,
  },
  stationCode: {
    fontSize: 13,
    color: '#999',
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  badgeOuverte: {
    backgroundColor: '#DFFFDF',
  },
  badgeFermee: {
    backgroundColor: '#FFDFDF',
  },
  badgeMaintenance: {
    backgroundColor: '#FFF3CD',
  },
  badgeText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: '#333',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.PlayaBlue,
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
  },
  infoValueBig: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.PlayaBlue,
  },
  infoValueSmall: {
    fontSize: 13,
    color: '#666',
    fontFamily: Fonts.bold,
  },
  actionSection: {
    marginTop: 8,
  },
  mainAction: {
    backgroundColor: Colors.PlayaOrange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  mainActionDisabled: {
    backgroundColor: '#CCC',
  },
  mainActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
});