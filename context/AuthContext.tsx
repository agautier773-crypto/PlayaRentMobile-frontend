import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as AuthService from '../services/AuthService';
import { User } from '../types/Auth';
import { Colors } from '../constants/Colors';
import { setOnSessionExpired } from '../services/fetchWithAuth';

//Définition de la base du context
type AuthContextType = {
    user: User | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (mail: string, password: string) => Promise<void>;
    register: (mail: string, password: string, prenom: string, nom: string) => Promise<void>;
    logout: () => Promise<void>;
};

//Création du contexte (par défaut pour forcer l'utilisation du provider)
const AuthContext = createContext<AuthContextType | undefined>(undefined);
//Provider qui wrap l'app
type Props = {children: ReactNode };

export function AuthProvider({ children }: Props){
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    //Tente de restaurer la session au démarrage 
    useEffect(() => {
        (async() => {
            const restored = await AuthService.tryRestoreSession();
            if (restored){
                setUser(AuthService.getCurrentUser());
            }
            setIsLoading(false);
        })();
    }, []);

    // Enregistre le callback de déconnexion forcée
// Si le refresh token expire vraiment, fetchWithAuth notifie pour basculer sur Login
useEffect(() => {
    setOnSessionExpired(() => {
        setUser(null);
    });
}, []);

    //Wrapper qui appellent AuthService et met à jour les states 
    const login = async (mail: string, password: string) => {
        const loggedUser = await AuthService.login(mail, password);
        setUser(loggedUser);
    };

    const register = async (mail: string, password: string, prenom: string, nom:string) => {
        const newUser = await AuthService.register(mail, password, prenom, nom);
        setUser(newUser);
    };

    const logout = async () => {
        await AuthService.logout();
        setUser(null);
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
      isLoading,
      login,
      register,
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

