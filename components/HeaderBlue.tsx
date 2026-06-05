import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

type Props = {
  title: string;              
  showBackButton?: boolean;   
  showLogo?: boolean;
  showLogout?: boolean;  
  compact?: boolean;        
};

export default function BlueHeader({ title, showBackButton = false, showLogo = false, showLogout = false, compact = false, }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { logout } = useAuth();

    const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

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

        {showLogout && (
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.logoutButton, { top: insets.top + 12 }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="log-out-outline" size={26} color="#FFFFFF" />
          </TouchableOpacity>
      )}

      {showLogo && (
        <Image
          source={require('../assets/logo_playarent.png')}
          style={compact ? styles.logoCompact : styles.logo}
          resizeMode="contain"
        />
      )}

      {title ? (
        <Text style={compact ? styles.headerTitleCompact : styles.headerTitle}>
          {title}
        </Text>
      ) : null}
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
  height: 100,
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
logoutButton: {
  position: 'absolute',
  right: 16,
  zIndex: 10,
  padding: 4,
},

logoCompact: {
  width: 100,
  height: 120,
  marginTop: -75,
  marginBottom: -60,
},
headerTitleCompact: {
  color: '#FFFFFF',
  fontSize: 20,
  fontFamily: Fonts.bold,
  textAlign: 'center',
},
});