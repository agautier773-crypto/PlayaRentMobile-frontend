import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator,Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Equipement } from '../types/Equipement';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import PaddleIcon from '../assets/module-Paddle.png';
import KayakIcon from '../assets/kayak.png';
import CanoeIcon from '../assets/canoe.png';
type Props = {
    equipements: Equipement[];
    loading?: boolean;
};

/**
 * Sélectionne l'icône Ionicons selon le type d'équipement.
 */
function getIconSource(type: string) {
    if (!type) return null;
    const lower = type.toLowerCase();
    if (lower.includes('paddle')) return PaddleIcon;
    if (lower.includes('kayak 1 place')) return KayakIcon;
    if (lower.includes('kayak 2 places')) return CanoeIcon;
    return null;
}

/**
 * Formate une date ISO en heure lisible (ex: "14:30")
 */
function formatHeure(isoString: string): string {
    try {
        const date = new Date(isoString);
        const heures = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${heures}h${minutes}`;
    } catch {
        return '';
    }
}

export default function EquipementsList({ equipements, loading }: Props) {
    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="small" color={Colors.PlayaBlue} />
            </View>
        );
    }

    if (equipements.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.emptyText}>Aucun équipement disponible</Text>
            </View>
        );
    }

return (
    <View style={styles.container}>
        <Text style={styles.title}>Équipements</Text>
        {equipements.map((eq) => (
            <View key={eq.id} style={styles.equipementBlock}>
                {/* Ligne principale : icône + type + statut */}
                <View style={styles.row}>
                    {/* Icône */}
                    {getIconSource(eq.type) && (
                        <Image
                            source={getIconSource(eq.type)!}
                            style={styles.icon}
                            resizeMode="contain"
                        />
                    )}

                    {/* Nom + type */}
                    <View style={styles.infoWrapper}>
                        <Text style={styles.equipementType}>{eq.type}</Text>
                    </View>

                    {/* Statut */}
                    <View style={styles.statusWrapper}>
                        <View
                            style={[
                                styles.dot,
                                { backgroundColor: eq.disponible ? '#4CAF50' : '#FF9800' },
                            ]}
                        />
                        <Text
                            style={[
                                styles.statusText,
                                { color: eq.disponible ? '#4CAF50' : '#FF9800' },
                            ]}
                        >
                            {eq.disponible
                                ? 'Disponible'
                                : eq.heureRetour
                                ? `Retour ${formatHeure(eq.heureRetour)}`
                                : 'Indisponible'}
                        </Text>
                    </View>
                </View>

                {/* Informations complémentaires sous l'équipement */}
                {eq.informations?.contenu && (
                    <Text style={styles.equipementInfo}>
                        {eq.informations.contenu}
                    </Text>
                )}
            </View>
        ))}
    </View>
);
}
const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
    },
    title: {
        fontSize: 16,
        fontFamily: Fonts.bold,
        color: Colors.PlayaBlue,
        marginBottom: 8,
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoWrapper: {
        flex: 1,
    },
    equipementType: {
        fontSize: 15,
        fontFamily: Fonts.bold,
        color: '#333',
    },
    statusWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
        fontFamily: Fonts.bold,
    },
    emptyText: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 16,
    },
equipementPrice: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    lineHeight: 14,
},
icon: {
    width: 32,
    height: 32,
    marginRight: 12,
},
equipementBlock: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
},
equipementInfo: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 38,                 
    lineHeight: 16,
},
});