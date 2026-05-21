import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { useAuth } from '../context/AuthContext';
import AideConseilsScreen from '../screens/AideConseilsScreen';


export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: undefined;
    AideConseils: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
    isLoggedIn: boolean;
};

export default function AppNavigator(){
    const {isLoggedIn } = useAuth();
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false}}>
            {isLoggedIn ? (
                <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="AideConseils" component={AideConseilsScreen} />
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