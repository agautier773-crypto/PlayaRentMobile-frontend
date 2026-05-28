import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

const SCREEN_WIDTH = Dimensions.get('window').width;

type Props = {
  title: string;              // le titre affiché
  showBackButton?: boolean;   // afficher la flèche retour ? (défaut: false)
  showLogo?: boolean;         // afficher le logo ? (défaut: false)
};

export default function BlueHeader({ title, showBackButton = false, showLogo = false }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

return (
  <View style={styles.wrapper}>
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      {/* Flèche retour en position absolue (haut gauche) */}
      {showBackButton && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { top: insets.top + 12 }]}
        >
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
      )}

      {/* Logo centré en haut */}
      {showLogo && (
        <Image
          source={require('../assets/logo_playarent.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      )}

      {/* Titre centré en dessous */}
      <Text style={styles.headerTitle}>{title}</Text>
    </View>

    {/* Vague */}
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
  </View>
);
}

const styles = StyleSheet.create({
header: {
  backgroundColor: Colors.PlayaBlue,
  paddingHorizontal: 16,
  paddingBottom: 16,
  alignItems: 'center',     // centre logo + titre horizontalement
},
backButton: {
  position: 'absolute',    
  left: 16,                 // collée à gauche
  zIndex: 10,               
},
backText: {
  color: '#FFFFFF',
  fontSize: 12,
  fontFamily: Fonts.bold,
},
logo: {
  width: 120,
  height: 120,
  marginBottom: -10,
},
headerTitle: {
  color: '#FFFFFF',
  fontSize: 40,
  fontFamily: Fonts.bold,
  textAlign: 'center',
},
wave: {
  marginTop: -1,
},
wrapper: {
  zIndex: 10,
  elevation: 10,
},
});