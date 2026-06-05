import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Equipement, TypeEquipement } from '../types/Equipement';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

type Props = {
    equipements: Equipement[];
    loading?: boolean;
};

// Mapping type → icône Ionicons
const ICONS: Record<TypeEquipement, keyof typeof Ionicons.glyphMap> = {
    PADDLE: 'boat-outline',
    KAYAK: 'boat-outline',
    CANOE: 'boat-outline',
};

// Mapping type → label affiché
const LABELS: Record<TypeEquipement, string> = {
    PADDLE: 'Paddle',
    KAYAK: 'Kayak',
    CANOE: 'Canoë',
};

 //Formate une date ISO en heure lisible (ex: "14:30")

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
                <View key={eq.id} style={styles.row}>
                    {/* Nom + type */}
                    <View style={styles.infoWrapper}>
                        <Text style={styles.equipementName}>{eq.nom}</Text>
                        <Text style={styles.equipementType}>{LABELS[eq.type] || eq.type}</Text>
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
                                : 'Loué'}
                        </Text>
                    </View>
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
    equipementName: {
        fontSize: 15,
        fontFamily: Fonts.bold,
        color: '#333',
    },
    equipementType: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
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
});