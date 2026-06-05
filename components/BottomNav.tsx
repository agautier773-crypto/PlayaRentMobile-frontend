import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Ionicons } from '@expo/vector-icons';

type NavItemConfig = {
    route: string;        
    icon: keyof typeof Ionicons.glyphMap;        
    label: string;        
    isAccent?: boolean;   
};

const NAV_ITEMS: NavItemConfig[] = [
    { route: 'Home', icon: 'home-outline', label: 'Accueil' },
    { route: 'Favoris', icon: 'heart-outline', label: 'Favoris' },
    { route: 'ScanRide', icon: 'qr-code-outline', label: 'Scan&Ride', isAccent: true },
    { route: 'AideConseils', icon: 'help-circle-outline', label: 'Conseils' },
];

export default function BottomNav() {
    const navigation = useNavigation<any>();
    const route = useRoute();

    // Filtrer pour exclure l'écran courant
    const itemsToShow = NAV_ITEMS.filter(item => item.route !== route.name);

    return (
        <View style={styles.bottomNav}>
            {itemsToShow.map(item => (
                <TouchableOpacity
                    key={item.route}
                    style={styles.navItem}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate(item.route)}
                >
                    <Ionicons
                        name={item.icon}
                        size={26}
                        color={item.isAccent ? Colors.PlayaOrange : Colors.PlayaBlue}
                        style={styles.navIcon}
                    />
                    <Text
                        style={[
                            styles.navLabel,
                            item.isAccent && styles.navLabelAccent,
                        ]}
                    >
                        {item.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
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
    navIconAccent: {
        color: Colors.PlayaOrange,
    },
    navLabel: {
        fontSize: 13,
        color: Colors.PlayaBlue,
        fontFamily: Fonts.bold,
    },
    navLabelAccent: {
        color: Colors.PlayaOrange,
    },
});