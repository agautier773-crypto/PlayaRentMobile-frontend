import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Animated,
  Easing
} from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView  } from '@gorhom/bottom-sheet';
import { getStationById } from '../services/StationService';
import { Station } from '../types/Stations';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { logger } from '../utils/logger';
import { getPhotosByStation } from '../services/PhotoService';
import { Photo } from '../types/Photo';
import { addFavori, removeFavori, existeFavori } from '../services/FavoriService';
import { Ionicons } from '@expo/vector-icons';
import EquipementsList from '../components/EquipementList';
import { Equipement } from '../types/Equipement';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import type { Groupe } from '../types/Carte';


export type StationDetailSheetRef = {
  open: (stationId: string) => void;
  openGroupe: (groupe: Groupe) => void;
  close: () => void;
};

const StationDetailSheet = forwardRef<StationDetailSheetRef>((_props, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const navigation = useNavigation<any>();
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [isFavori, setIsFavori] = useState(false);
  const [favoriLoading, setFavoriLoading] = useState(false);
  // Points d'arrêt du sheet : 35% (preview) et 80% (étendu)
  const snapPoints = useMemo(() => ['35%', '85%'], []);
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const {isGuest, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [groupe, setGroupe] = useState<Groupe | null>(null);
  const [stationsDuGroupe, setStationsDuGroupe] = useState<Station[]>([]);

  // Expose des méthodes au parent (HomeScreen)
useImperativeHandle(ref, () => ({
    open: (stationId: string) => {
        setGroupe(null);              // reset mode groupe
        setStationsDuGroupe([]);
        loadStation(stationId);
        bottomSheetRef.current?.snapToIndex(0);
    },
    openGroupe: (g: Groupe) => {
        setStation(null);             // reset mode station
        setGroupe(g);
        loadStationsDuGroupe(g);
        bottomSheetRef.current?.snapToIndex(0);
    },
    close: () => {
        bottomSheetRef.current?.close();
        setStation(null);
        setGroupe(null);
        setStationsDuGroupe([]);
    },
}));

const loadStation = async (stationId: string) => {
    setLoading(true);
    setError(null);
    setStation(null);
    setPhotos([]);
    setEquipements([]);
    setIsFavori(false);
    try {
      const data = await getStationById(stationId);
      setStation(data);
      setEquipements(data.composants || []);
      loadPhotos(stationId);
      
      // Favoris uniquement si connecté
      if (!isGuest) {
          checkFavoriStatus(stationId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(message);
      logger.error('StationDetailSheet', message);
    } finally {
      setLoading(false);
    }
};
// fonction de chargement des photos 
  const loadPhotos = async (stationId: string) => {
  setLoadingPhotos(true);
  try {
    const data = await getPhotosByStation(stationId);
    setPhotos(data);
  } catch (err) {
    logger.error('StationDetailSheet', 'Erreur chargement photos', err);
  } finally {
    setLoadingPhotos(false);
  }
};
const loadStationsDuGroupe = async (g: Groupe) => {
    setLoading(true);
    setError(null);
    setStationsDuGroupe([]);
    
    try {
        // Charger les détails de chaque station du groupe en parallèle
        const promises = g.stations.map(s => getStationById(s.id));
        const detailedStations = await Promise.all(promises);
        setStationsDuGroupe(detailedStations);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(message);
        logger.error('StationDetailSheet', message);
    } finally {
        setLoading(false);
    }
};

// Vérifie si la station est en favori
const checkFavoriStatus = async (stationId: string) => {
  try {
    const isFavori = await existeFavori(stationId);
    setIsFavori(isFavori);
  } catch (err) {
    logger.error('StationDetailSheet', 'Erreur vérification favori', err);
  }
};

const toggleFavori = async () => {

  if (!station || favoriLoading) return;
      if (isGuest) {
        Alert.alert(
            'Connexion requise',
            'Créez un compte pour ajouter cette station à vos favoris.',
            [
                { text: 'Plus tard', style: 'cancel' },
                { text: 'Créer un compte', onPress: () => logout() },
            ]
        );
        return;
    }

  setFavoriLoading(true);
  try {
    if (isFavori) {
      await removeFavori(station.id);
      setIsFavori(false);
    } else {
      await addFavori(station.id);
      setIsFavori(true);
    }
  } catch (err) {
    logger.error('StationDetailSheet', 'Erreur toggle favori', err);
  } finally {
    setFavoriLoading(false);
  }
};

const handleRefresh = async () => {
    if (!station || refreshing) return;
    setRefreshing(true);
    try {
        await loadStation(station.id);
    } finally {
        setRefreshing(false);
    }
};

function getInformationsUniques(composants: Equipement[]): string[] {
    const set = new Set<string>();
    composants.forEach((eq) => {
        if (eq.informations && eq.informations.contenu) {
            set.add(eq.informations.contenu);
        }
    });
    return Array.from(set);
}

const rotateAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
    if (refreshing) {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    } else {
        rotateAnim.stopAnimation();
        rotateAnim.setValue(0);
    }
}, [refreshing]);

const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
});
const toutesInfosGroupe = (): string[] => {
    const set = new Set<string>();
    stationsDuGroupe.forEach((s) => {
        (s.composants || []).forEach((eq) => {
            if (eq.informations && eq.informations.contenu) {
                set.add(eq.informations.contenu);
            }
        });
    });
    return Array.from(set);
};

const renderModeStationContent = () => {
    if (!station) return null;
    return (
        <>
            <View style={styles.titleRow}>
                <Text style={styles.stationName}>{station.nom}</Text>
                
                <View style={styles.titleActions}>
                    <TouchableOpacity
                        onPress={handleRefresh}
                        disabled={refreshing}
                        activeOpacity={0.7}
                        style={styles.refreshButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Animated.View style={{ transform: [{ rotate }] }}>
                            <Ionicons name="refresh-outline" size={24} color={Colors.PlayaBlue} />
                        </Animated.View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={toggleFavori}
                        disabled={favoriLoading}
                        activeOpacity={1}
                        style={styles.favoriButton}
                    >
                        <Ionicons
                            name={isFavori ? 'heart' : 'heart-outline'}
                            size={28}
                            color={Colors.PlayaOrange}
                        />
                    </TouchableOpacity>
                </View>
            </View>

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

            <EquipementsList equipements={equipements} />

            {photos.length > 0 && (
                <View style={styles.photosSection}>
                    <Text style={styles.sectionTitle}>Photos</Text>
                    <View style={styles.photosGrid}>
                        {photos.map((photo) => (
                            <View key={photo.idPhoto} style={styles.photoCard}>
                                <Image
                                    source={{ uri: photo.url }}
                                    style={styles.photoImage}
                                    resizeMode="cover"
                                />
                                {photo.titre && (
                                    <Text style={styles.photoTitre} numberOfLines={1}>
                                        {photo.titre}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {loadingPhotos && (
                <ActivityIndicator
                    size="small"
                    color={Colors.PlayaBlue}
                    style={{ marginVertical: 16 }}
                />
            )}

            <TouchableOpacity
                style={[
                    styles.mainAction,
                    station.etat !== 'OUVERTE' && styles.mainActionDisabled,
                ]}
                disabled={station.etat !== 'OUVERTE'}
                onPress={() => {
                    bottomSheetRef.current?.close();
                    setStation(null);
                    navigation.navigate('ScanRide');
                }}
            >
                <Text style={styles.mainActionText}>
                    {station.etat === 'OUVERTE' ? ' Scan&ride' : 'Station indisponible'}
                </Text>
            </TouchableOpacity>
        </>
    );
};

const renderModeGroupeContent = () => {
    if (!groupe) return null;
    
    // Récupère TOUTES les infos uniques de TOUTES les stations du groupe
  const toutesInfosGroupe = (): string[] => {
      const set = new Set<string>();
      const valeursUniques: string[] = [];
      
      stationsDuGroupe.forEach((s) => {
          (s.composants || []).forEach((eq) => {
              if (eq.informations && eq.informations.contenu) {
                  // Normaliser pour la déduplication
                  const normalisee = eq.informations.contenu.trim().toLowerCase();
                  
                  if (!set.has(normalisee)) {
                      set.add(normalisee);
                      // On garde la version ORIGINALE (avec sa casse) pour l'affichage
                      valeursUniques.push(eq.informations.contenu.trim());
                  }
              }
          });
      });
      
      return valeursUniques;
  };
    
    const infosGroupe = toutesInfosGroupe();
    
    return (
        <>
            <View style={styles.titleRow}>
                <Text style={styles.stationName}>{groupe.nom}</Text>
                <View style={styles.titleActions}>
                    <TouchableOpacity
                        onPress={handleRefresh}
                        disabled={refreshing}
                        activeOpacity={0.7}
                        style={styles.refreshButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Animated.View style={{ transform: [{ rotate }] }}>
                            <Ionicons name="refresh-outline" size={24} color={Colors.PlayaBlue} />
                        </Animated.View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={toggleFavori}
                        disabled={favoriLoading}
                        activeOpacity={1}
                        style={styles.favoriButton}
                    >
                        <Ionicons
                            name={isFavori ? 'heart' : 'heart-outline'}
                            size={28}
                            color={Colors.PlayaOrange}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.groupeSubtitle}>
                {groupe.stations.length} stations
            </Text>

            <View style={styles.badgeContainer}>
                <View
                    style={[
                        styles.badge,
                        groupe.etat === 'OUVERTE' ? styles.badgeOuverte : styles.badgeFermee,
                    ]}
                >
                    <Text style={styles.badgeText}>{groupe.etat}</Text>
                </View>
            </View>

            {groupe.description && (
                <View style={styles.descriptionSection}>
                    <Text style={styles.descriptionText}>{groupe.description}</Text>
                </View>
            )}

            <View style={styles.statsSection}>
                <Text style={styles.statsValue}>
                    {groupe.nombreComposantsDisponibles} / {groupe.nombreComposantsTotal}
                </Text>
                <Text style={styles.statsLabel}>équipements disponibles</Text>
            </View>

            {/* Sections empilées pour chaque station (SANS infos individuelles) */}
            {stationsDuGroupe.map((s) => (
                <View key={s.id} style={styles.stationSection}>
                    <View style={styles.stationSectionHeader}>
                        <Text style={styles.stationSectionTitle}>{s.nom}</Text>
                        <View
                            style={[
                                styles.miniBadge,
                                s.etat === 'OUVERTE' ? styles.badgeOuverte : styles.badgeFermee,
                            ]}
                        >
                            <Text style={styles.miniBadgeText}>{s.etat}</Text>
                        </View>
                    </View>
                    <EquipementsList equipements={s.composants || []} />
                </View>
            ))}

            <TouchableOpacity
                style={[
                    styles.mainAction,
                    groupe.etat !== 'OUVERTE' && styles.mainActionDisabled,
                ]}
                disabled={groupe.etat !== 'OUVERTE'}
                onPress={() => {
                    bottomSheetRef.current?.close();
                    setGroupe(null);
                    navigation.navigate('ScanRide');
                }}
            >
                <Text style={styles.mainActionText}>
                    {groupe.etat === 'OUVERTE' ? ' Scan&ride' : 'Indisponible'}
                </Text>
            </TouchableOpacity>
        </>
    );
};
return (
    <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableContentPanningGesture={true}
        enableHandlePanningGesture={true}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handle}
    >
        {loading ? (
            <BottomSheetView style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.PlayaBlue} />
            </BottomSheetView>
        ) : error ? (
            <BottomSheetView style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
            </BottomSheetView>
        ) : groupe ? (
            <BottomSheetScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {renderModeGroupeContent()}
            </BottomSheetScrollView>
        ) : station ? (
            <BottomSheetScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {renderModeStationContent()}
            </BottomSheetScrollView>
        ) : null}
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

  scrollView: {
    flex: 1,
},
scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 80,
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
  badgeOuverte: { backgroundColor: '#3aed3a' },
  badgeFermee: { backgroundColor: '#ff6969' },
  badgeMaintenance: { backgroundColor: '#ffda62' },
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
photosSection: {
  marginTop: 20,
  marginBottom: 16,
},
photosGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',         
  gap: 12,                   
},
sectionTitle: {
  fontSize: 14,
  fontFamily: Fonts.bold,
  color: Colors.PlayaBlue,
  marginBottom: 12,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
},
photoCard: {
  width: 160,                
  borderRadius: 12,
  overflow: 'hidden',
  // pas de fond
},
photoImage: {
  width: 160,
  height: 110,
},
photoTitre: {
  fontSize: 12,
  color: '#666',
  paddingTop: 6,
  paddingHorizontal: 4,
},
titleRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 4,
},
favoriButton: {
  padding: 4,
},
tarifsSection: {
    marginVertical: 16,
    paddingHorizontal: 4,
},
tarifBloc: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
},
tarifDescription: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.PlayaBlue,
    marginBottom: 8,
},

infosSection: {
    marginVertical: 16,
    paddingHorizontal: 4,
},
infosBloc: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
},
infosContenu: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
},
titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
},
refreshButton: {
    padding: 4,
},
groupeSubtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: Fonts.regular,
    marginBottom: 12,
    marginLeft: 4,
},
descriptionSection: {
    marginVertical: 8,
    paddingHorizontal: 4,
},
descriptionText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    lineHeight: 20,
},
statsSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginVertical: 12,
    paddingHorizontal: 4,
},
statsValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.PlayaBlue,
    fontFamily: Fonts.bold,
},
statsLabel: {
    fontSize: 13,
    color: '#666',
    fontFamily: Fonts.regular,
},
stationSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
},
stationSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
},
stationSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.PlayaBlue,
    fontFamily: Fonts.bold,
},
miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
},
miniBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
},
infosSectionGroupe: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
},
sectionTitleSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    fontFamily: Fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
},
});