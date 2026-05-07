import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigation';
import { Colors } from './constants/Colors';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      await Font.loadAsync({
        'Antonio-Bold': require('./assets/fonts/Antonio-Bold.ttf'),
        'Antonio-Regular': require('./assets/fonts/Antonio-Regular.ttf'),  // si tu l'as ajoutée
      });
      setFontsLoaded(true);
    })();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.PlayaBlue }}>
        <ActivityIndicator size="large" color={Colors.PlayaYellow} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}