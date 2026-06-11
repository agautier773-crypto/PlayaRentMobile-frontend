import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { useAuth } from '../context/AuthContext';
import AideConseilsScreen from '../screens/AideConseilsScreen';
import ScanRideScreen from '../screens/ScanRideScreen';
import FavorisScreen from '../screens/FavorisScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: undefined;
    AideConseils: undefined;
    StationDetail: { stationId: string };
    ScanRide: undefined;
    Favoris: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();


export default function AppNavigator(){
    const {isLoggedIn, isGuest } = useAuth();
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false}}>

            {(isLoggedIn || isGuest) ? (
                <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="AideConseils" component={AideConseilsScreen} />
                <Stack.Screen
                    name="ScanRide"
                    component={ScanRideScreen}
                    options={{ headerShown: false }}
                    />
                <Stack.Screen
                    name="Favoris"
                    component={FavorisScreen}
                    options={{ headerShown: false }}
                    />
                <Stack.Screen 
                    name="Profile" 
                    component={ProfileScreen} 
                    options={{ headerShown: false }}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                )}
                </Stack.Navigator>
        </NavigationContainer>
    );
}