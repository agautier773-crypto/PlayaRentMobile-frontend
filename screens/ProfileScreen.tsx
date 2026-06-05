import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import BlueHeader from '../components/HeaderBlue';
import { useAuth } from '../context/AuthContext';
import {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
} from '../services/ProfilesService';
import { User } from '../types/User';
import { logger } from '../utils/logger';

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const { logout } = useAuth();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [mail, setMail] = useState('');

    const [ancienPassword, setAncienPassword] = useState('');
    const [nouveauPassword, setNouveauPassword] = useState('');
    const [confirmerPassword, setConfirmerPassword] = useState('');

    // Toggle pour voir les mots de passe (sauf ancien)
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await getProfile();
            setUser(data);
            setNom(data.nom);
            setPrenom(data.prenom);
            setMail(data.mail);
        } catch (error) {
            logger.error('ProfileScreen', 'Erreur chargement profil', error);
            Alert.alert('Erreur', 'Impossible de charger votre profil');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!nom.trim() || !prenom.trim() || !mail.trim()) {
            Alert.alert('Erreur', 'Tous les champs sont obligatoires');
            return;
        }

        try {
            setSaving(true);
            const updated = await updateProfile({ nom, prenom, mail });
            setUser(updated);
            Alert.alert('Succès', 'Votre profil a été mis à jour');
        } catch (error: any) {
            logger.error('ProfileScreen', 'Erreur mise à jour profil', error);
            Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le profil');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (!ancienPassword || !nouveauPassword || !confirmerPassword) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        if (nouveauPassword !== confirmerPassword) {
            Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas');
            return;
        }

        if (nouveauPassword.length < 6) {
            Alert.alert('Erreur', 'Le mot de passe doit faire au moins 6 caractères');
            return;
        }

        try {
            setSaving(true);
            await changePassword({ ancienPassword, nouveauPassword });
            setAncienPassword('');
            setNouveauPassword('');
            setConfirmerPassword('');
            Alert.alert('Succès', 'Votre mot de passe a été modifié');
        } catch (error: any) {
            logger.error('ProfileScreen', 'Erreur changement mot de passe', error);
            Alert.alert('Erreur', error.message || 'Impossible de changer le mot de passe');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Voulez-vous vraiment vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
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

    const handleDeleteAccountPress = () => {
        Alert.alert(
            'Supprimer mon compte',
            'Cette action est irréversible. Toutes vos données seront définitivement supprimées.',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Continuer',
                    style: 'destructive',
                    onPress: () => setShowDeleteModal(true),
                },
            ]
        );
    };

    const confirmDelete = async () => {
        if (!deletePassword) {
            Alert.alert('Erreur', 'Mot de passe requis');
            return;
        }

        try {
            setSaving(true);
            await deleteAccount(deletePassword);
            Alert.alert(
                'Compte supprimé',
                'Votre compte a été supprimé.',
                [
                    {
                        text: 'OK',
                        onPress: async () => {
                            await logout();
                        },
                    },
                ]
            );
        } catch (error: any) {
            logger.error('ProfileScreen', 'Erreur suppression compte', error);
            Alert.alert('Erreur', error.message || 'Impossible de supprimer le compte');
        } finally {
            setSaving(false);
            setShowDeleteModal(false);
            setDeletePassword('');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <BlueHeader title="Mon profil" showBackButton />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.PlayaBlue} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <BlueHeader title="Mon profil" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex1}
            >
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Une seule carte avec tout */}
                    <View style={styles.section}>
                        {/* Sous-section : Informations */}
                        <Text style={styles.sectionTitle}>Mes informations</Text>

                        <Text style={styles.label}>Prénom</Text>
                        <TextInput
                            style={styles.input}
                            value={prenom}
                            onChangeText={setPrenom}
                            placeholder="Votre prénom"
                            placeholderTextColor="#999"
                        />

                        <Text style={styles.label}>Nom</Text>
                        <TextInput
                            style={styles.input}
                            value={nom}
                            onChangeText={setNom}
                            placeholder="Votre nom"
                            placeholderTextColor="#999"
                        />

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={mail}
                            onChangeText={setMail}
                            placeholder="votre@email.com"
                            placeholderTextColor="#999"
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSaveProfile}
                            disabled={saving}
                        >
                            <Text style={styles.buttonText}>
                                {saving ? 'Enregistrement...' : 'Sauvegarder mes informations'}
                            </Text>
                        </TouchableOpacity>

                        {/* Séparateur visuel */}
                        <View style={styles.divider} />

                        {/* Sous-section : Mot de passe */}
                        <Text style={styles.sectionTitle}>Mot de passe</Text>

                        <Text style={styles.label}>Ancien mot de passe</Text>
                        <TextInput
                            style={styles.input}
                            value={ancienPassword}
                            onChangeText={setAncienPassword}
                            placeholder="••••••"
                            placeholderTextColor="#999"
                            secureTextEntry
                        />

                        <Text style={styles.label}>Nouveau mot de passe</Text>
                        <View style={styles.inputWithIcon}>
                            <TextInput
                                style={styles.inputFlex}
                                value={nouveauPassword}
                                onChangeText={setNouveauPassword}
                                placeholder="6 caractères minimum"
                                placeholderTextColor="#999"
                                secureTextEntry={!showNewPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowNewPassword(!showNewPassword)}
                                style={styles.eyeButton}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={22}
                                    color={Colors.PlayaBlue}
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Confirmer</Text>
                        <View style={styles.inputWithIcon}>
                            <TextInput
                                style={styles.inputFlex}
                                value={confirmerPassword}
                                onChangeText={setConfirmerPassword}
                                placeholder="••••••"
                                placeholderTextColor="#999"
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeButton}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={22}
                                    color={Colors.PlayaBlue}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleChangePassword}
                            disabled={saving}
                        >
                            <Text style={styles.buttonText}>Modifier le mot de passe</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Déconnexion */}
                    <TouchableOpacity
                        style={[styles.button, styles.buttonOutline]}
                        onPress={handleLogout}
                    >
                        <Text style={styles.buttonOutlineText}>Se déconnecter</Text>
                    </TouchableOpacity>

                    {/* Petit lien discret pour suppression */}
                    <TouchableOpacity
                        onPress={handleDeleteAccountPress}
                        style={styles.deleteLink}
                    >
                        <Text style={styles.deleteLinkText}>Supprimer mon compte</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* BOTTOM NAV */}
            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.navItem}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.navIcon}>⌂</Text>
                    <Text style={styles.navLabel}>Accueil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('Favoris')}
                >
                    <Text style={styles.navIcon}>♡</Text>
                    <Text style={styles.navLabel}>Favoris</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate('AideConseils')}
                >
                    <Text style={styles.navIcon}>?</Text>
                    <Text style={styles.navLabel}>Conseils</Text>
                </TouchableOpacity>
            </View>

            {/* Modal de suppression */}
            {showDeleteModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirmer la suppression</Text>
                        <Text style={styles.modalDescription}>
                            Entrez votre mot de passe pour confirmer la suppression définitive de votre compte.
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={deletePassword}
                            onChangeText={setDeletePassword}
                            placeholder="Votre mot de passe"
                            placeholderTextColor="#999"
                            secureTextEntry
                            autoFocus
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonOutline, styles.modalButton]}
                                onPress={() => {
                                    setShowDeleteModal(false);
                                    setDeletePassword('');
                                }}
                            >
                                <Text style={styles.buttonOutlineText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.modalButton, { backgroundColor: '#D32F2F' }]}
                                onPress={confirmDelete}
                                disabled={saving}
                            >
                                <Text style={styles.buttonText}>Supprimer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.PlayaYellow,
    },
    flex1: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: Fonts.bold,
        color: Colors.PlayaBlue,
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontFamily: Fonts.bold,
        color: Colors.PlayaBlue,
        marginBottom: 6,
        marginTop: 8,
    },
    input: {
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        color: '#000',
    },
    // Input + icône œil
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    inputFlex: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#000',
    },
    eyeButton: {
        paddingHorizontal: 12,
    },
    // Séparateur entre sous-sections
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 24,
    },
    button: {
        backgroundColor: Colors.PlayaBlue,
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Fonts.bold,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.PlayaBlue,
        marginTop: 8,
    },
    buttonOutlineText: {
        color: Colors.PlayaBlue,
        fontSize: 16,
        fontFamily: Fonts.bold,
    },
    deleteLink: {
        alignItems: 'center',
        marginTop: 24,
        padding: 8,
    },
    deleteLinkText: {
        color: '#888',
        fontSize: 13,
        textDecorationLine: 'underline',
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: Colors.PlayaYellow,
        paddingVertical: 16,
        paddingHorizontal: 40,
        paddingBottom: 30,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    navItem: {
        alignItems: 'center',
        flex: 1,
    },
    navIcon: {
        fontSize: 24,
        color: Colors.PlayaBlue,
        marginBottom: 4,
    },
    navLabel: {
        fontSize: 13,
        color: Colors.PlayaBlue,
        fontFamily: Fonts.bold,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        width: '100%',
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: Fonts.bold,
        color: Colors.PlayaBlue,
        marginBottom: 12,
    },
    modalDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
    },
    modalButton: {
        flex: 1,
        marginTop: 0,
    },
});