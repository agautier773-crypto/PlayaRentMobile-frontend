import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Colors } from '../constants/Colors';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import BoutonCustom from '../components/BoutonCustom';
import { Fonts } from '../constants/Fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login, loginAsGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const canLogin = email.length > 0 && password.length > 0 && !isLoading;

  const handleLogin = async () => {
    if (!canLogin) return;

    try {
      setIsLoading(true);
      setErrorMessage('');
      await login(email.trim(), password);
    } catch (error: any) {
      if (error.statusCode === 401) {
        setErrorMessage('Email ou mot de passe incorrect');
      } else if (error.statusCode === 500) {
        setErrorMessage('Le serveur rencontre un problème, réessaie plus tard');
      } else if (error.message?.includes('Network')) {
        setErrorMessage('Impossible de se connecter au serveur. Vérifie ta connexion.');
      } else {
        setErrorMessage(error.message || 'Une erreur est survenue');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      await loginAsGuest();
    } catch(error){
      setErrorMessage('Impossible de continuer en tant qu\'invité');
    }
  }

  return (
    <AuthLayout title="Se connecter"
      logo={require('../assets/logo_playarent.png')}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="email@exemple.com"
        placeholderTextColor="#000000"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Mot de passe</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        placeholderTextColor="#000000"
        secureTextEntry
      />

      {errorMessage !== '' && (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>{errorMessage}</Text>
        </View>
      )}

      <BoutonCustom
        text="Se connecter"
        backgroundColor={Colors.PlayaBlue}
        onPress={handleLogin}
        disabled={!canLogin}
        loading={isLoading}
      />

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkContainer}>
        <Text style={styles.linkText}>
          Pas de compte ? <Text style={styles.linkBold}>S'inscrire</Text>
        </Text>
      </TouchableOpacity>

        {/* Lien discret invité — placé après "S'inscrire" */}
        <TouchableOpacity onPress={handleGuestLogin} style={styles.guestLinkContainer}>
            <Text style={styles.guestLinkText}>Continuer en tant qu'invité</Text>
        </TouchableOpacity>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.PlayaBlue,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    color: '#000000',
    borderWidth: 0,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    backgroundColor: '#FFFAEB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  errorBoxText: {
    color: '#D32F2F',
    fontSize: 14,
  },
  linkContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: Colors.PlayaBlue,
  },
  linkBold: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  guestLinkContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 8,
},
guestLinkText: {
    color: '#666',
    fontSize: 13,
    textDecorationLine: 'underline',
},
});