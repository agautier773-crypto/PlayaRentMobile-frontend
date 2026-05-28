import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getFavoris, removeFavori } from '../services/FavoriService';
import { Station } from '../types/Stations';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { logger } from '../utils/logger';

export default function FavorisScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [favoris, setFavoris] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recharge à chaque fois qu'on arrive sur l'écran
  useFocusEffect(
    useCallback(() => {
      loadFavoris();
    }, [])
  );

  const loadFavoris = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFavoris();
      setFavoris(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      logger.error('FavorisScreen', message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetirer = async (station: Station) => {
    try {
      await removeFavori(station.id);
      // Mise à jour optimiste : on retire de la liste localement
      setFavoris(favoris.filter((s) => s.id !== station.id));
    } catch (err) {
      logger.error('FavorisScreen', 'Erreur retrait favori', err);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes Favoris</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Contenu */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.PlayaBlue} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadFavoris}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : favoris.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="heart-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>Aucune station en favori</Text>
          <Text style={styles.emptySubtext}>
            Ajoute des stations en favori depuis la carte
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoris}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.favoriCard}>
              <View style={styles.favoriInfo}>
                <Text style={styles.favoriName}>{item.nom}</Text>
                <View style={styles.favoriMeta}>
                  <View
                    style={[
                      styles.badge,
                      item.etat === 'OUVERTE'
                        ? styles.badgeOuverte
                        : styles.badgeFermee,
                    ]}
                  >
                    <Text style={styles.badgeText}>{item.etat}</Text>
                  </View>
                  <Text style={styles.composants}>
                    {item.nombreComposants} équipements
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleRetirer(item)}
                activeOpacity={1}
                style={styles.heartButton}
              >
                <Ionicons name="heart" size={26} color={Colors.PlayaOrange} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
  backText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.bold,
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.PlayaBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  favoriCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  favoriInfo: {
    flex: 1,
  },
  favoriName: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    color: Colors.PlayaBlue,
    marginBottom: 4,
  },
  favoriAdresse: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  favoriMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeOuverte: { backgroundColor: '#DFFFDF' },
  badgeFermee: { backgroundColor: '#FFDFDF' },
  badgeText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: '#333',
  },
  composants: {
    fontSize: 12,
    color: '#999',
  },
  heartButton: {
    padding: 8,
  },
});