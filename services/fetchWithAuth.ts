import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, ROUTES, STORAGE_KEYS } from '../constants/Config';
import { logger } from '../utils/logger';

// Evite plusieurs refresh simultané 
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;
let onSessionExpiredCallback: (() => void) | null = null;

//Enregistre un callback à appeler quand la session expire vraiment 
export function setOnSessionExpired(callback: () => void) {
    onSessionExpiredCallback = callback;
}

//Tente de renouveler l'access toekn via refresh token 
async function refreshAccessToken(): Promise<string> {
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

    if(!refreshToken) {
        throw new Error ('Aucun refresh token disponible');
    }

    logger.info('refreshWithAuth', 'Tentative de renouvellement du token... ');

    const response = await fetch(`${API_BASE_URL}${ROUTES.REFRESH}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
    });

    if(!response.ok) {
        logger.warn('fetchWithAuth', `Refresh échoué (status ${response.status})`);
        throw new Error ('Refresh token invalide ou expiré');
    }

    const data = await response.json();
    const newAccessToken = data.accessToken;

    await SecureStore.setItemAsync(STORAGE_KEYS.JWT_TOKEN, newAccessToken);

    logger.info('fetchWithAuth', 'Token renouvelé avec succès');
    return newAccessToken;
}

//Nettoie la session locale 
async function clearSession(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.JWT_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_EMAIL);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ROLE);
}

//Wrapper de fetch qui gère automatiquement l'authentification et le refresh token 
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
    if(!token){
        throw new SessionExpiredError('Aucun token disponible');
    }
// Contruit l'url complète 
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    //Ajoute le header Authorization aux options 
    const optionsWithAuth: RequestInit = {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        },
    };
//Première tentative 

    let response = await fetch(url, optionsWithAuth);

    //Si pas de 401, on retourne la réponse telle quelle 
    if(response.status !== 401) {
        return response;
    }
    //C'est une 401 on vérifie que le token est bien expiré 
    const errorData = await response.clone().json().catch(() => null);
    
    if (errorData?.error !== 'TOKEN_EXPIRED') {
        // Autre type d'erreur 401 (token invalide, pas TOKEN_EXPIRED)
        return response;
    }

    logger.info('fetchWithAuth', 'Token expiré, tentative de refresh');
// Si un refresh en cours on attend qu'il finisse 
    try {
        let newToken: string;
        if(isRefreshing && refreshPromise) {
            newToken = await refreshPromise;
        }else{
            isRefreshing = true;
            refreshPromise = refreshAccessToken();
            try{
                newToken = await refreshPromise;
            } finally {
                isRefreshing = false;
                refreshPromise = null;
            }
        }
        //Refait la requête avec le nouveau token 
        const newOptions: RequestInit = {
            ...options, 
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${newToken}`,
            },
        };

        response = await fetch(url, newOptions);
        return response;

    } catch (refreshError){
        logger.error('fetchWithAuth', 'Refresh impossible, déconnexion forcée', refreshError)
        await clearSession();

        if(onSessionExpiredCallback){
            onSessionExpiredCallback();
        }
        throw new SessionExpiredError('Session expirée, veuillez vous reconnectez');
    }
}

export class SessionExpiredError extends Error {
    constructor(message: string = 'Session expirée'){
        super(message);
        this.name = 'SessionExpiredError';
    }
}