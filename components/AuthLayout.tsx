import React, { ReactNode } from 'react';
import {
  View,
  Text,
  Image,
  ImageSourcePropType,  // ← nouveau import
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Colors } from '../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AuthLayoutProps = {
  title: string;
  logo: ImageSourcePropType;  // ← nouveau : logo passé en prop
  children: ReactNode;
};

export default function AuthLayout({ title, logo, children }: AuthLayoutProps) {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={logo}                    // ← utilise la prop
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{title}</Text>
        </View>

        <Svg
          width={SCREEN_WIDTH}
          height={60}
          viewBox={`0 0 ${SCREEN_WIDTH} 60`}
          style={styles.wave}
        >
          <Path
            d={`M0,0 Q${SCREEN_WIDTH * 0.25},60 ${SCREEN_WIDTH * 0.5},30 T${SCREEN_WIDTH},20 L${SCREEN_WIDTH},0 Z`}
            fill={Colors.PlayaBlue}
          />
        </Svg>

        <View style={styles.formContainer}>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.PlayaYellow,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: Colors.PlayaBlue,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    marginBottom: 16,
  },
  title: {
    fontSize: 58,
    fontFamily: 'Antonio-Bold',
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  wave: {
    marginTop: -1, // évite un fin liseré entre le header et la vague
  },
  formContainer: {
    backgroundColor: Colors.PlayaYellow,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    flex: 1,
  },
});