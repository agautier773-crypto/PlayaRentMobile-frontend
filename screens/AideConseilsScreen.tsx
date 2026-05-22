import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { RootStackParamList } from '../navigation/AppNavigation';
import { getEtapesCanoe, getEtapesLocation, getEtapesPaddle, getObligations } from '../services/AideService';
import { LocationEtape, PratiqueEtape, obligations } from '../types/Aide';
import { logger } from '../utils/logger';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getConseilImage } from '../constants/Images';


type Props = NativeStackScreenProps<RootStackParamList, 'AideConseils'>;
type Tab = 'LOUER' | 'SUR_LEAU' | 'REGLES';
type SubTabSurLEau = 'CANOE_KAYAK' | 'PADDLE'; 

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 64; 

export default function AideConseilsScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('LOUER');
  const [etapes, setEtapes] = useState<LocationEtape[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const [subTabSurLEau, setSubTabSurLEau] = useState<SubTabSurLEau>('CANOE_KAYAK');
const [etapesCanoe, setEtapesCanoe] = useState<PratiqueEtape[]>([]);
const [etapesPaddle, setEtapesPaddle] = useState<PratiqueEtape[]>([]);
const [loadingSurLEau, setLoadingSurLEau] = useState(false);
const [obligations, setObligations] = useState<obligations[]>([]);
const [loadingRegles, setLoadingRegles] = useState(false);

  // Charge les étapes au montage
  useEffect(() => {
    (async () => {
      try {
        const data = await getEtapesLocation();
        setEtapes(data);
      } catch (error) {
        logger.error('AideConseils', 'Erreur chargement étapes', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Charge les tutos pratiques 
  useEffect(() => {
    if(activeTab !== 'SUR_LEAU') return;
    if(etapesCanoe.length > 0 && etapesPaddle.length > 0) return;

    (async () => {
      setLoadingSurLEau(true);
      try {
        const [CanoeData, paddleData] = await Promise.all([
          getEtapesCanoe(),
          getEtapesPaddle(),
        ]);
        setEtapesCanoe(CanoeData);
        setEtapesPaddle(paddleData);
      }catch (error) {
        logger.error('AideConseils', 'Erreur chargement sur l\eau', error);
      }finally {
        setLoadingSurLEau(false);
      }
    })();
  }, [activeTab]);

  //Charge les règles la première fois qu'on ouvre l'onglet 
  useEffect(() => {
    if(activeTab !== 'REGLES') return;
    if(obligations.length > 0) return;

    (async () => {
      setLoadingRegles(true);
      try {
        const data = await getObligations();
        setObligations(data);
      }catch (error){
        logger.error('AideConseils', 'Erreur chargement des règles', error);
      }finally {
        setLoadingRegles(false);
      }
    })();
  }, [activeTab]);

  // Détecte le scroll pour mettre à jour l'index actif (pour les dots de pagination)
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / CARD_WIDTH);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  // Render d'une carte d'étape (pour la FlatList horizontale)
  const renderEtape = ({ item }: { item: LocationEtape }) => (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        <View style={styles.numeroCircle}>
          <Text style={styles.numeroText}>{item.numero}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.titre}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </View>
    </View>
  );

const renderPratiqueEtape = ({ item }: { item: PratiqueEtape }) => {
  const imageSource = getConseilImage(item.imageKey);
  
  return (
    <View style={styles.cardWrapper}>
      <View style={styles.card}>
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            {imageSource && (
              <Image 
                source={imageSource} 
                style={styles.cardImageSmall}
                resizeMode="cover"
              />
            )}
            <Text style={styles.cardTitleInline}>{item.titre}</Text>
          </View>
          <Text style={styles.cardDescription}>{item.description}</Text>
        </View>
      </View>
    </View>
  );
};
  
  return (
    <View style={styles.container}>
      {/* HEADER BLEU */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        
        <Image
          source={require('../assets/logo_playarent.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Aide & Conseils</Text>
      </View>
            <Svg
              width={SCREEN_WIDTH}
              height={30}
              viewBox={`0 0 ${SCREEN_WIDTH} 30`}
              style={styles.wave}
            >
              <Path
                d={`M0,0 Q${SCREEN_WIDTH * 0.25},30 ${SCREEN_WIDTH * 0.5},15 T${SCREEN_WIDTH},10 L${SCREEN_WIDTH},0 Z`}
                fill={Colors.PlayaBlue}
              />
            </Svg>
      

      {/* TABS */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'LOUER' && styles.tabActive]}
          onPress={() => setActiveTab('LOUER')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'LOUER' && styles.tabTextActive]}>
            Louer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'SUR_LEAU' && styles.tabActive]}
          onPress={() => setActiveTab('SUR_LEAU')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'SUR_LEAU' && styles.tabTextActive]}>
            Sur l'eau
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'REGLES' && styles.tabActive]}
          onPress={() => setActiveTab('REGLES')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'REGLES' && styles.tabTextActive]}>
            Règles
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENU */}
      <View style={styles.contentArea}>
        {activeTab === 'LOUER' && (
          <>
            {loading ? (
              <ActivityIndicator size="large" color={Colors.PlayaBlue} style={{ marginTop: 40 }} />
            ) : (
              <>
                <FlatList
                  ref={flatListRef}
                  data={etapes}
                  keyExtractor={(item) => item.numero.toString()}
                  renderItem={renderEtape}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={CARD_WIDTH}
                  decelerationRate="fast"
                  contentContainerStyle={{ paddingHorizontal: 32 }}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                />

                {/* Dots de pagination */}
                <View style={styles.dotsContainer}>
                  {etapes.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        index === currentIndex && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              </>
            )}
          </>
        )}

 {activeTab === 'SUR_LEAU' && (
  <>
    {/* SOUS-ONGLETS Canoë/Kayak vs Paddle */}
    <View style={styles.subTabsContainer}>
      <TouchableOpacity
        style={[
          styles.subTab,
          subTabSurLEau === 'CANOE_KAYAK' && styles.subTabActive,
        ]}
        onPress={() => setSubTabSurLEau('CANOE_KAYAK')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.subTabText,
          subTabSurLEau === 'CANOE_KAYAK' && styles.subTabTextActive,
        ]}>
          Canoë/Kayak
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.subTab,
          subTabSurLEau === 'PADDLE' && styles.subTabActive,
        ]}
        onPress={() => setSubTabSurLEau('PADDLE')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.subTabText,
          subTabSurLEau === 'PADDLE' && styles.subTabTextActive,
        ]}>
          Paddle
        </Text>
      </TouchableOpacity>
    </View>

    {/* CARROUSEL D'ÉTAPES */}
    {loadingSurLEau ? (
      <ActivityIndicator size="large" color={Colors.PlayaBlue} style={{ marginTop: 40 }} />
    ) : (
      <FlatList
        data={subTabSurLEau === 'CANOE_KAYAK' ? etapesCanoe : etapesPaddle}
        keyExtractor={(item) => `${subTabSurLEau}-${item.numero}`}
        renderItem={renderPratiqueEtape}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 32 }}
        extraData={subTabSurLEau}  // force le re-render quand on change de sous-onglet
      />
    )}
  </>
)}

{activeTab === 'REGLES' && (
  <>
    {loadingRegles ? (
      <ActivityIndicator size="large" color={Colors.PlayaBlue} style={{ marginTop: 40 }} />
    ) : (
      <ScrollView 
        contentContainerStyle={styles.reglesContainer}
        showsVerticalScrollIndicator={false}
      >
        {obligations.map((item) => {
          const isObligation = item.type === 'OBLIGATION';
          const cardStyle = isObligation ? styles.cardObligation : styles.cardInterdiction;
          const iconBg = isObligation ? styles.iconBgObligation : styles.iconBgInterdiction;
          const icon = isObligation ? '✓' : '✕';
          
          return (
            <View key={item.type} style={[styles.regleCard, cardStyle]}>
              <View style={styles.regleHeader}>
                <View style={[styles.regleIconCircle, iconBg]}>
                  <Text style={styles.regleIconText}>{icon}</Text>
                </View>
                <Text style={styles.regleTitre}>{item.titre}</Text>
              </View>
              {item.regles.map((regle, index) => (
                <View key={index} style={styles.reglePuce}>
                  <Text style={styles.reglePuceBullet}>•</Text>
                  <Text style={styles.reglePuceText}>{regle}</Text>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    )}
  </>
)}
    
    </View>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Text style={styles.navIcon}>♡</Text>
          <Text style={styles.navLabel}>Favoris</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.navIcon}>⌂</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Accueil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PlayaYellow,
  },
  header: {
    backgroundColor: Colors.PlayaBlue,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  aideTutoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.bold,
    alignSelf: 'flex-start',
    opacity: 0.8,
    marginBottom: 4,
  },
  logo: {
    width: 150,
    height: 150,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 40,
    fontFamily: Fonts.bold,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 30,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 25,
  },
  tabActive: {
    backgroundColor: Colors.PlayaBlue,
  },
  tabText: {
    fontSize: 14,
    color: Colors.PlayaBlue,
    fontFamily: Fonts.bold,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  contentArea: {
    flex: 1,
    paddingTop: 30,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  numeroCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.PlayaBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  numeroText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontFamily: Fonts.bold,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.PlayaBlue,
    textAlign: 'center',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: Fonts.bold,
    textAlign: 'center',
    lineHeight: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: Colors.PlayaBlue,
    width: 24,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: Colors.PlayaBlue,
    fontFamily: Fonts.bold,
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
  wave: {
  marginTop: -1,
  backgroundColor: 'transparent',
},
subTabsContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  marginVertical: 16,
  paddingHorizontal: 32,
},
subTab: {
  paddingVertical: 8,
  paddingHorizontal: 20,
  borderRadius: 20,
  marginHorizontal: 6,
  backgroundColor: '#FFFFFF',
  borderWidth: 2,
  borderColor: Colors.PlayaBlue,
},
subTabActive: {
  backgroundColor: Colors.PlayaBlue,
},
subTabText: {
  fontSize: 13,
  fontFamily: Fonts.bold,
  color: Colors.PlayaBlue,
},
subTabTextActive: {
  color: '#FFFFFF',
},
cardHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12,
},

cardTitleInline: {
  fontSize: 24,
  fontFamily: Fonts.bold,
  color: Colors.PlayaBlue,
  flex: 1,
  flexWrap: 'wrap',
},
cardImage: {
  width: '100%',
  height: 160,
  backgroundColor: '#E0E0E0',   // gris si l'image met du temps à charger
},
cardBody: {
  padding: 24,
},
cardImageSmall: {
  width: 80,
  height: 80,
  borderRadius: 8,
  marginRight: 12,
},
reglesContainer: {
  paddingHorizontal: 20,
  paddingVertical: 16,
  paddingBottom: 32,
},
regleCard: {
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 4,
},
cardObligation: {
  backgroundColor: Colors.PlayaBlue,
},
cardInterdiction: {
  backgroundColor: Colors.PlayaOrange,
},
regleHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12,
},
regleIconCircle: {
  width: 28,
  height: 28,
  borderRadius: 14,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 10,
},
iconBgObligation: {
  backgroundColor: Colors.PlayaYellow,
},
iconBgInterdiction: {
  backgroundColor: '#FFFFFF',
},
regleIconText: {
  color: Colors.PlayaBlue,
  fontSize: 14,
  fontFamily: Fonts.bold,
},
regleTitre: {
  flex: 1,
  fontSize: 18,
  color: '#FFFFFF',
  fontFamily: Fonts.bold,
},
reglePuce: {
  flexDirection: 'row',
  marginBottom: 6,
  paddingLeft: 4,
},
reglePuceBullet: {
  color: '#FFFFFF',
  fontSize: 14,
  marginRight: 8,
  lineHeight: 20,
},
reglePuceText: {
  flex: 1,
  color: '#FFFFFF',
  fontSize: 13,
  lineHeight: 20,
},
});