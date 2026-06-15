import React, { useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { FiltrerState, FILTRES_VIDES } from '../types/Filtres';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;

type Props = {
    visible: boolean;
    filtres: FiltrerState;
    onClose: () => void;
    onApply: (filtres: FiltrerState) => void;
};

const TYPES_DISPONIBLES = [
    { key: 'paddle', label: 'Paddle' },
    { key: 'kayak 1 place', label: 'Kayak 1 place' },
    { key: 'kayak 2 places', label: 'Kayak 2 places' },
    { key: 'beachwheel', label: 'Fauteuil de plage' },
];

export default function FiltrersDrawer({ visible, filtres, onClose, onApply }: Props) {
    const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const [localFiltres, setLocalFiltres] = React.useState<FiltrerState>(filtres);
    
    useEffect(() => {
        if(visible){
            setLocalFiltres(filtres);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 280,
                useNativeDriver: true,
            }).start();
            }else{
                Animated.timing(slideAnim, {
                toValue: -DRAWER_WIDTH,
                duration: 200,
                useNativeDriver: true,
            }).start();
            }
        }, [visible]);

        const toggleType = (typeKey: string) => {
            setLocalFiltres((prev) => ({
            ...prev,
            types: prev.types.includes(typeKey)
                ? prev.types.filter((t) => t !== typeKey)
                : [...prev.types, typeKey],
            }));
        };

        const toggleDispo = () => {
            setLocalFiltres((prev) => ({ ...prev, onlyDisponibles: !prev.onlyDisponibles }));
        };

        const toggleOuvertes = () => {
            setLocalFiltres((prev) => ({ ...prev, onlyOuvertes: !prev.onlyOuvertes }));
        };

        const handleApply = () => {
            onApply(localFiltres);
            onClose();
        };

        const handleReset = () => {
            setLocalFiltres(FILTRES_VIDES);
        };

        return (
            <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
                {/* Backdrop semi-transparent */}
                <Pressable style={styles.backdrop} onPress={onClose} />

                {/* Drawer animé */}
                <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Filtres</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons name="close" size={24} color={Colors.PlayaBlue} />
                        </TouchableOpacity>
                    </View>

                    {/* Section Type d'équipement */}
                    <Text style={styles.sectionTitle}>Type d'équipement</Text>
                    {TYPES_DISPONIBLES.map((t) => (
                        <TouchableOpacity
                            key={t.key}
                            style={styles.row}
                            onPress={() => toggleType(t.key)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.rowLabel}>{t.label}</Text>
                            <View style={[styles.checkbox, localFiltres.types.includes(t.key) && styles.checkboxActive]}>
                                {localFiltres.types.includes(t.key) && (
                                    <Ionicons name="checkmark" size={16} color="#fff" />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Section Disponibilité */}
                    <Text style={styles.sectionTitle}>Disponibilité</Text>
                    <TouchableOpacity style={styles.row} onPress={toggleDispo} activeOpacity={0.7}>
                        <Text style={styles.rowLabel}>Avec équipements disponibles</Text>
                        <View style={[styles.checkbox, localFiltres.onlyDisponibles && styles.checkboxActive]}>
                            {localFiltres.onlyDisponibles && <Ionicons name="checkmark" size={16} color="#fff" />}
                        </View>
                    </TouchableOpacity>

                    {/* Section État */}
                    <Text style={styles.sectionTitle}>État de la station</Text>
                    <TouchableOpacity style={styles.row} onPress={toggleOuvertes} activeOpacity={0.7}>
                        <Text style={styles.rowLabel}>Stations ouvertes uniquement</Text>
                        <View style={[styles.checkbox, localFiltres.onlyOuvertes && styles.checkboxActive]}>
                            {localFiltres.onlyOuvertes && <Ionicons name="checkmark" size={16} color="#fff" />}
                        </View>
                    </TouchableOpacity>

                    {/* Boutons d'action */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                            <Text style={styles.resetButtonText}>Réinitialiser</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                            <Text style={styles.applyButtonText}>Appliquer</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Modal>
        );
    }


const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    drawer: {
        position: 'absolute',
        top: 140,
        left: 0,
        bottom: 100,
        width: DRAWER_WIDTH,
        backgroundColor: '#FFFFFF',
        padding: 20,
        paddingTop: 20,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
        shadowColor: Colors.PlayaBlue,
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 22,
        fontFamily: Fonts.bold,
        color: Colors.PlayaBlue,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: Fonts.bold,
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.PlayaBlue,
    },
    rowLabel: {
        fontSize: 15,
        color: '#333',
        flex: 1,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: Colors.PlayaBlue,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: Colors.PlayaBlue,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 'auto',
        paddingTop: 20,
    },
    resetButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.PlayaBlue,
        alignItems: 'center',
    },
    resetButtonText: {
        color: Colors.PlayaBlue,
        fontFamily: Fonts.bold,
        fontSize: 14,
    },
    applyButton: {
        flex: 2,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: Colors.PlayaBlue,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontFamily: Fonts.bold,
        fontSize: 14,
    },
});
    
