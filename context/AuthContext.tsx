import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as AuthService from '../services/AuthService';
import { User } from '../types/Auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { setOnSessionExpired } from '../services/fetchWithAuth';


const GUEST_STORAGE_KEY = 'isGuest';

//Définition de la base du context
type AuthContextType = {
    user: User | null;
    isLoggedIn: boolean;
    isGuest: boolean;
    isLoading: boolean;
    login: (mail: string, password: string) => Promise<void>;
    register: (mail: string, password: string, prenom: string, nom: string) => Promise<void>;
    loginAsGuest: () => Promise<void>;
    logout: () => Promise<void>;
};

//Création du contexte (par défaut pour forcer l'utilisation du provider)
const AuthContext = createContext<AuthContextType | undefined>(undefined);
//Provider qui wrap l'app
type Props = {children: ReactNode };

export function AuthProvider({ children }: Props){
    const [user, setUser] = useState<User | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    //Tente de restaurer la session au démarrage 
    useEffect(() => {
        (async() => {
            const restored = await AuthService.tryRestoreSession();
            if (restored){
                setUser(AuthService.getCurrentUser());
                setIsLoading(false);
                return;
            }
            const guestFlag = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
            if(guestFlag === 'true'){
                setIsGuest(true);
            }
            setIsLoading(false);
        })();
    }, []);

    // Enregistre le callback de déconnexion forcée
// Si le refresh token expire vraiment, fetchWithAuth notifie pour basculer sur Login
useEffect(() => {
    setOnSessionExpired(() => {
        setUser(null);
        setIsGuest(false);
        AsyncStorage.removeItem(GUEST_STORAGE_KEY).catch(() => {});
    });
}, []);

    //Wrapper qui appellent AuthService et met à jour les states 
    const login = async (mail: string, password: string) => {
        const loggedUser = await AuthService.login(mail, password);
        setIsGuest(false);
        await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
        setUser(loggedUser);
    };

    const register = async (mail: string, password: string, prenom: string, nom:string) => {
        const newUser = await AuthService.register(mail, password, prenom, nom);
        setIsGuest(false);
        await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
        setUser(newUser);
    };

    const loginAsGuest = async () => {
        await AsyncStorage.setItem(GUEST_STORAGE_KEY, 'true');
        setIsGuest(true);
    };

    const logout = async () => {
        await AuthService.logout();
        await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
        setUser(null);
        setIsGuest(false);
    };

    //Chargement pendant le check session 
      if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.PlayaBlue }}>
        <ActivityIndicator size="large" color={Colors.PlayaYellow} />
      </View>
    );
}
return (
        <AuthContext.Provider value={{
      user,
      isLoggedIn: user !== null,
      isGuest,
      isLoading,
      login,
      register,
      loginAsGuest,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(){
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth doit être utilisé dans un AuthProvider");
    }
    return ctx;
}

