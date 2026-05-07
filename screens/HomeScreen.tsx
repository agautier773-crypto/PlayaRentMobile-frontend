import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import BoutonCustom from '../components/BoutonCustom';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Es-tu sûr de vouloir te déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // Pas besoin de naviguer : le context met à jour isLoggedIn → AppNavigator bascule auto vers Login
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcome}>Bienvenue 👋</Text>
        
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.prenom} {user.nom}
            </Text>
            <Text style={styles.userEmail}>{user.mail}</Text>
            <Text style={styles.userRole}>Rôle : {user.role}</Text>
          </View>
        )}

        <Text style={styles.todo}>
          🚧 Cet écran sera bientôt rempli avec les fonctionnalités PlayaRent
        </Text>
      </View>

      <View style={styles.footer}>
        <BoutonCustom
          text="Se déconnecter"
          backgroundColor={Colors.PlayaOrange}
          onPress={handleLogout}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  welcome: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.PlayaBlue,
    marginBottom: 24,
  },
  userInfo: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.PlayaBlue,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  todo: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
});