import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isUrlAllowed } from '../constants/AllowedDomains';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { logger } from '../utils/logger';
import BlueHeader from '../components/HeaderBlue';

export default function ScanRideScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const URL_PREFIX = 'https://reservation.playa-rent.fr/';

  // Demande la permission au montage
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // Gère un QR code scanné
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    processUrl(data);
  };

  // Traite une URL (scannée ou saisie manuellement)
  const processUrl = async (url: string) => {
    const trimmedUrl = url.trim();

    if (!isUrlAllowed(trimmedUrl)) {
      Alert.alert(
        'Lien non autorisé',
        "Ce QR code ne correspond pas à un lien PlayaRent valide.",
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
      return;
    }

    try {
      const supported = await Linking.canOpenURL(trimmedUrl);
      if (supported) {
        await Linking.openURL(trimmedUrl);
        // Retour à l'écran précédent après ouverture
        navigation.goBack();
      } else {
        Alert.alert('Erreur', "Impossible d'ouvrir ce lien.", [
          { text: 'OK', onPress: () => setScanned(false) },
        ]);
      }
    } catch (err) {
      logger.error('ScanRide', 'Erreur ouverture lien', err);
      Alert.alert('Erreur', "Une erreur est survenue.", [
        { text: 'OK', onPress: () => setScanned(false) },
      ]);
    }
  };

  // Soumission du lien manuel
  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      Alert.alert('Code vide', 'Saisis un code valide.');
      return;
    }
    const fullUrl = URL_PREFIX + manualCode.trim();
    processUrl(fullUrl);
  };

return (
  <View style={styles.container}>
    {/* CONTENU D'ABORD (caméra / manuel / pas de permission) */}
    {manualMode ? (
      /* MODE SAISIE MANUELLE */
      <View style={styles.manualContainer}>
        <Text style={styles.manualTitle}>Saisie manuelle du code</Text>
        <Text style={styles.manualSubtitle}>
          Entre le code qui suit le lien playa-rent.fr sous le Qr Code
        </Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.prefix}>{URL_PREFIX}</Text>
          <TextInput
            style={styles.codeInput}
            value={manualCode}
            onChangeText={setManualCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleManualSubmit}>
          <Text style={styles.submitButtonText}>Valider</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.switchButton} onPress={() => setManualMode(false)}>
          <Text style={styles.switchButtonText}>← Revenir au scan</Text>
        </TouchableOpacity>
      </View>
    ) : permission?.granted ? (
      /* MODE CAMÉRA */
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanHint}>Place le QR code dans le cadre</Text>
        </View>
        <TouchableOpacity style={styles.manualSwitchButton} onPress={() => setManualMode(true)}>
          <Text style={styles.manualSwitchText}>
            Caméra ne fonctionne pas ? Saisir le lien
          </Text>
        </TouchableOpacity>
      </View>
    ) : (
      /* PAS DE PERMISSION */
      <View style={styles.noPermission}>
        <Text style={styles.noPermissionText}>
          L'accès à la caméra est nécessaire pour scanner les QR codes.
        </Text>
        <TouchableOpacity style={styles.submitButton} onPress={requestPermission}>
          <Text style={styles.submitButtonText}>Autoriser la caméra</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.switchButton} onPress={() => setManualMode(true)}>
          <Text style={styles.switchButtonText}>Ou saisir le lien manuellement</Text>
        </TouchableOpacity>
      </View>
    )}

    {/* HEADER PAR-DESSUS, en absolu */}
    <View style={styles.headerOverlay}>
      <BlueHeader title="Scan&ride" showBackButton showLogo />
    </View>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PlayaBlue,
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
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 160,
  },
  scanFrame: {
    width: 300,
    height: 300,
    borderWidth: 5,
    paddingTop: 240,
    borderColor: Colors.PlayaYellow,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scanHint: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.bold,
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  manualSwitchButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  manualSwitchText: {
    color: Colors.PlayaBlue,
    fontSize: 13,
    fontFamily: Fonts.bold,
  },
  manualContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 160,
    justifyContent: 'center',
  },
  manualTitle: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.PlayaBlue,
    marginBottom: 8,
    textAlign: 'center',
  },
  manualSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#015060',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: Colors.PlayaOrange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchButtonText: {
    color: Colors.PlayaBlue,
    fontSize: 14,
  },
  noPermission: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 160,
    justifyContent: 'center',
  },
  noPermissionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
inputWrapper: {
  marginBottom: 20,
},
prefix: {
  fontSize: 16,
  color: '#999',
  marginBottom: 8,
  paddingHorizontal: 4,
},
codeInput: {
  fontSize: 18,
  fontFamily: Fonts.bold,
  color: '#333',
  borderWidth: 1.5,
  borderColor: Colors.PlayaBlue,
  borderRadius: 12,
  paddingVertical: 14,
  paddingHorizontal: 16,
  backgroundColor: '#FFFF',
  textAlign: 'center',
},
headerOverlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  elevation: 100,
},
});