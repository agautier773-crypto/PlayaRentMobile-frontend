import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigation';
import { Colors } from './constants/Colors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      await Font.loadAsync({
        'Antonio-Bold': require('./assets/fonts/Antonio-Bold.ttf'),
        'Antonio-Regular': require('./assets/fonts/Antonio-Regular.ttf'), 
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
      <GestureHandlerRootView style={{ flex: 1}}>
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </SafeAreaProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
    
  );
}