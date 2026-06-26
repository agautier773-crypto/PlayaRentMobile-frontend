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
import BlueHeader from '../components/HeaderBlue';
import { RootStackParamList } from '../navigation/AppNavigation';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import EquipementsList from '../components/EquipementList';

export default function FavorisScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isGuest, logout } = useAuth();

  const [favoris, setFavoris] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Recharge à chaque fois qu'on arrive sur l'écran
  useFocusEffect(
    useCallback(() => {
      if(isGuest){
        setLoading(false);
        return;
      }
      loadFavoris();
    }, [isGuest])
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

  const handleCreerCompte = () => {
    logout();
  };

  const toggleExpand = (id: string) => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setExpandedId((prev) => (prev === id ? null : id));  // accordéon : un seul ouvert à la fois
};

if(isGuest) {
  return (
          <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <BlueHeader title="Mes Favoris" showProfile showLogo />

        <View style={styles.guestContainer}>
          <Ionicons name="heart-outline" size={80} color={Colors.PlayaOrange} />
          <Text style={styles.guestTitle}>Vos favoris vous attendent</Text>
          <Text style={styles.guestSubtitle}>
            Créez un compte pour sauvegarder vos stations préférées et y accéder rapidement.
          </Text>
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleCreerCompte}
            activeOpacity={0.8}
          >
            <Text style={styles.guestButtonText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>

        <BottomNav />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <BlueHeader title="Mes Favoris" showProfile showLogo showLogout />

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
renderItem={({ item }) => {
  const expanded = expandedId === item.id;
  return (
    <View style={styles.favoriCard}>
      <View style={styles.favoriHeader}>
        {/* Zone tappable pour déplier */}
        <TouchableOpacity
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
          style={styles.favoriInfo}
        >
          <Text style={styles.favoriName}>{item.nom}</Text>
          <View style={styles.favoriMeta}>
            <View
              style={[
                styles.badge,
                item.etat === 'OUVERTE' ? styles.badgeOuverte : styles.badgeFermee,
              ]}
            >
              <Text style={styles.badgeText}>{item.etat}</Text>
            </View>
            <Text style={styles.composants}>
              {item.nombreComposantsDisponibles} équipements disponibles
            </Text>
          </View>
        </TouchableOpacity>

              {/* Actions : retirer + chevron */}
              <View style={styles.favoriActions}>
                <TouchableOpacity
                  onPress={() => handleRetirer(item)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.heartButton}
                >
                  <Ionicons name="heart" size={26} color={Colors.PlayaOrange} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggleExpand(item.id)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color={Colors.PlayaBlue}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Détails dépliés */}
            {expanded && (
              <View style={styles.favoriDetails}>
                <EquipementsList equipements={item.composants} loading={false} />
              </View>
            )}
          </View>
        );
      }}
        />
      )}
      <BottomNav />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFDA6F',
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
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: Colors.PlayaYellow,
    paddingVertical: 16,
    paddingHorizontal: 40,
    paddingBottom: 30,
    justifyContent: 'space-around',
    alignItems: 'center',
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
  navLabelActive: {
    textDecorationLine: 'underline',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 60,
},
guestTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.PlayaBlue,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
},
guestSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
},
guestButton: {
    backgroundColor: Colors.PlayaBlue,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
},
guestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.bold,
},

favoriCard: {
  backgroundColor: '#FFF',
  borderRadius: 12,
  marginBottom: 12,
  padding: 16,
  // ⚠️ retire 'flexDirection: row' s'il y était — on veut une colonne maintenant
},
favoriHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

favoriActions: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},
favoriDetails: {
  marginTop: 12,
  paddingTop: 12,
  borderTopWidth: 1,
  borderTopColor: '#EEE',
},
});