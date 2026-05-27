import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView  } from '@gorhom/bottom-sheet';
import { getStationById } from '../services/StationService';
import { Station } from '../types/Stations';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { logger } from '../utils/logger';

export type StationDetailSheetRef = {
  open: (stationId: string) => void;
  close: () => void;
};

const StationDetailSheet = forwardRef<StationDetailSheetRef>((_props, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Points d'arrêt du sheet : 35% (preview) et 80% (étendu)
  const snapPoints = useMemo(() => ['35%', '80%'], []);

  // Expose des méthodes au parent (HomeScreen)
  useImperativeHandle(ref, () => ({
    open: (stationId: string) => {
      loadStation(stationId);
      bottomSheetRef.current?.snapToIndex(0);
    },
    close: () => {
      bottomSheetRef.current?.close();
      setStation(null);
    },
  }));

  const loadStation = async (stationId: string) => {
    setLoading(true);
    setError(null);
    setStation(null);
    try {
      const data = await getStationById(stationId);
      setStation(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      logger.error('StationDetailSheet', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}                    // fermé par défaut
      snapPoints={snapPoints}
      enablePanDownToClose
      enableContentPanningGesture
      enableHandlePanningGesture         
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.container}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.PlayaBlue} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : station ? (
          <BottomSheetScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.stationName}>{station.nom}</Text>

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

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🛶 Équipements</Text>
              <Text style={styles.infoValueBig}>{station.nombreComposants}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Coordonnées</Text>
              <Text style={styles.infoValueSmall}>
                {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.mainAction,
                station.etat !== 'OUVERTE' && styles.mainActionDisabled,
              ]}
              disabled={station.etat !== 'OUVERTE'}
            >
              <Text style={styles.mainActionText}>
                {station.etat === 'OUVERTE'
                  ? ' Louer maintenant'
                  : 'Station indisponible'}
              </Text>
            </TouchableOpacity>
          </BottomSheetScrollView>
        ) : null}
      </BottomSheetView>
    </BottomSheet>
  );
});

StationDetailSheet.displayName = 'StationDetailSheet';

export default StationDetailSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    backgroundColor: '#CCC',
    width: 40,
    height: 4,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
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
    textAlign: 'center',
  },
  stationName: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.PlayaBlue,
    marginBottom: 4,
  },
  stationCode: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  badgeOuverte: { backgroundColor: '#DFFFDF' },
  badgeFermee: { backgroundColor: '#FFDFDF' },
  badgeMaintenance: { backgroundColor: '#FFF3CD' },
  badgeText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: '#333',
  },
  infoRow: {
    marginBottom: 16,
    paddingHorizontal: 4,
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
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.PlayaBlue,
  },
  infoValueSmall: {
    fontSize: 13,
    color: '#666',
    fontFamily: Fonts.bold,
  },
  mainAction: {
    backgroundColor: Colors.PlayaOrange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
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