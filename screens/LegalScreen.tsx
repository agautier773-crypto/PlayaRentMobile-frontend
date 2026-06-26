import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigation';
import { LEGAL_URLS } from '../constants/Config';

// Palette — aligne avec ton constants/Colors si les clés correspondent
const COLORS = {
  bleu: '#1A4D5C',
  corail: '#E8623C',
  jaune: '#F5C842',
  white: '#FFFFFF',
  textMuted: '#5A6B70',
};

type Props = NativeStackScreenProps<RootStackParamList, 'Legal'>;

const DEFAULT_TITLES: Record<string, string> = {
  cgu: 'Conditions générales',
  privacy: 'Politique de confidentialité',
};

export default function LegalScreen({ route, navigation }: Props) {
  const { doc, title } = route.params;
  const uri = LEGAL_URLS[doc];
  const headerTitle = title ?? DEFAULT_TITLES[doc] ?? 'Informations';

  const webviewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(() => {
    setError(false);
    setLoading(true);
    webviewRef.current?.reload();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Ionicons name="chevron-back" size={26} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitle}
        </Text>
        {/* Spacer pour centrer le titre */}
        <View style={{ width: 26 }} />
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        {error ? (
          <View style={styles.center}>
            <Ionicons
              name="cloud-offline-outline"
              size={48}
              color={COLORS.textMuted}
            />
            <Text style={styles.errorText}>
              Impossible de charger le document.{'\n'}Vérifie ta connexion.
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={reload}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <WebView
              ref={webviewRef}
              source={{ uri }}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
              onHttpError={() => {
                setLoading(false);
                setError(true);
              }}
              originWhitelist={['https://*']}
              allowsBackForwardNavigationGestures
              setSupportMultipleWindows={false}
              style={styles.webview}
            />
            {loading && (
              <View style={styles.loadingOverlay} pointerEvents="none">
                <ActivityIndicator size="large" color={COLORS.bleu} />
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bleu,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bleu,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 8,
    // fontFamily: 'Antonio_700Bold', // décommente si Antonio est chargé
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 24,
    backgroundColor: COLORS.corail,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});