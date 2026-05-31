import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Colors } from '../constants/Colors';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, checkPasswordStrength, isValidName } from '../utils/validator';
import AuthLayout from '../components/AuthLayout';
import BoutonCustom from '../components/BoutonCustom';
import { Ionicons } from '@expo/vector-icons';


type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [acceptNewsletter, setAcceptNewsletter] = useState(false);
  const [acceptCGU, setAcceptCGU] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  const validation = useMemo(() => {
    const passwordStrength = checkPasswordStrength(password);
    return {
      prenomValid: isValidName(prenom),
      nomValid: isValidName(nom),
      emailValid: isValidEmail(email),
      passwordStrength,
      passwordsMatch: password === passwordConfirm && password.length > 0,
      cguAccepted: acceptCGU,
    };
  }, [prenom, nom, email, password, passwordConfirm, acceptCGU]);

  const canRegister =
    validation.prenomValid &&
    validation.nomValid &&
    validation.emailValid &&
    validation.passwordStrength.isValid &&
    validation.passwordsMatch &&
    validation.cguAccepted &&
    !isLoading;

  const handleRegister = async () => {
    setShowValidation(true);
    if (!canRegister) return;

    try {
      setIsLoading(true);
      setErrorMessage('');
      await register(email.trim(), password, prenom.trim(), nom.trim());
    } catch (error: any) {
      if (error.statusCode === 409) {
        setErrorMessage('Cet email est déjà utilisé');
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

  return (
    <AuthLayout title="S'inscrire"
      logo={require('../assets/module-Paddle.png')}>
      {/* Nom + Prénom sur la même ligne */}
      <View style={styles.row}>
        <View style={styles.halfField}>
          <TextInput
            style={styles.input}
            value={nom}
            onChangeText={setNom}
            placeholder="Nom"
            placeholderTextColor="#000000"
            autoCapitalize="words"
          />
          {showValidation && !validation.nomValid && (
            <Text style={styles.errorText}>Nom invalide</Text>
          )}
        </View>

        <View style={styles.halfField}>
          <TextInput
            style={styles.input}
            value={prenom}
            onChangeText={setPrenom}
            placeholder="Prénom"
            placeholderTextColor="#000000"
            autoCapitalize="words"
          />
          {showValidation && !validation.prenomValid && (
            <Text style={styles.errorText}>Prénom invalide</Text>
          )}
        </View>
      </View>

      {/* Email */}
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {showValidation && !validation.emailValid && (
        <Text style={styles.errorText}>Email invalide</Text>
      )}

      {/* Mot de passe avec œil */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.passwordInput, {color:'#000000'}]}
          value={password}
          onChangeText={setPassword}
          placeholder="Mot de passe"
          placeholderTextColor="#000000"
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
        >
          <Text style={styles.eyeIcon}>{showPassword ? '' : ''}</Text>
        </TouchableOpacity>
      </View>

      {/* Règles de mot de passe */}
      {password.length > 0 && (
        <View style={styles.passwordRules}>
          <PasswordRule ok={validation.passwordStrength.hasMinLength} text="8 caractères minimum" />
          <PasswordRule ok={validation.passwordStrength.hasUppercase} text="1 majuscule" />
          <PasswordRule ok={validation.passwordStrength.hasLowercase} text="1 minuscule" />
          <PasswordRule ok={validation.passwordStrength.hasNumber} text="1 chiffre" />
        </View>
      )}

      {/* Confirmation mot de passe */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          placeholder="Confirmer le mot de passe"
          placeholderTextColor="#000000"
          secureTextEntry={!showPasswordConfirm}
        />
        <TouchableOpacity
          onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
          style={styles.eyeButton}
        >
          <Text style={styles.eyeIcon}>{showPasswordConfirm ? '' : ''}</Text>
        </TouchableOpacity>
      </View>
      {showValidation && !validation.passwordsMatch && (
        <Text style={styles.errorText}>Les mots de passe ne correspondent pas</Text>
      )}

      {/* Newsletter */}
      <Checkbox
        checked={acceptNewsletter}
        onPress={() => setAcceptNewsletter(!acceptNewsletter)}
        label="Je souhaite recevoir par mail des offres personnalisées et les dernières mises à jour"
      />

      {/* CGU */}
      <Checkbox
        checked={acceptCGU}
        onPress={() => setAcceptCGU(!acceptCGU)}
        label="En m'inscrivant, je confirme que j'accepte les Termes et conditions de PlayaRent, avoir lu la politique de confidentialité et avoir au moins 18 ans."
      />
      {showValidation && !validation.cguAccepted && (
        <Text style={styles.errorText}>Tu dois accepter les CGU</Text>
      )}

      {/* Erreur API */}
      {errorMessage !== '' && (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>{errorMessage}</Text>
        </View>
      )}

      {/* Bouton Envoyer */}
      <BoutonCustom
        text="Envoyer"
        backgroundColor={Colors.PlayaBlue}
        onPress={handleRegister}
        disabled={!canRegister}
        loading={isLoading}
      />

      {/* Lien retour Login */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkContainer}>
        <Text style={styles.linkText}>
          Déjà un compte ? <Text style={styles.linkBold}>Se connecter</Text>
        </Text>
      </TouchableOpacity>
    </AuthLayout>
  );
}

// Composants internes
function PasswordRule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <View style={styles.ruleRow}>
      <Text style={[styles.ruleIcon, { color: ok ? '#2E7D32' : '#999' }]}>
        {ok ? '✓' : '○'}
      </Text>
      <Text style={[styles.ruleText, { color: ok ? '#2E7D32' : '#666' }]}>{text}</Text>
    </View>
  );
}

function Checkbox({ checked, onPress, label }: { checked: boolean; onPress: () => void; label: string }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.checkboxContainer} activeOpacity={0.7}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  halfField: {
    flex: 1,
  },
  input: {
    color: '#000000',
    borderWidth: 0,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    backgroundColor: '#FFFAEB',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFAEB',
    borderRadius: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  eyeButton: {
    paddingHorizontal: 16,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordRules: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  ruleIcon: {
    fontSize: 13,
    marginRight: 8,
    width: 14,
  },
  ruleText: {
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: Colors.PlayaBlue,
    borderRadius: 4,
    marginRight: 10,
    marginTop: 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.PlayaBlue,
  },
  checkmark: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  checkboxLabel: {
    fontSize: 12,
    color: Colors.PlayaBlue,
    flex: 1,
    lineHeight: 16,
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
});