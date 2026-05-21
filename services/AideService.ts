import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, ROUTES, STORAGE_KEYS } from '../constants/Config';
import { LocationEtape, PratiqueEtape } from '../types/Aide';
import { logger } from '../utils/logger';

// Récupère les étapes de location

export async function getEtapesLocation(): Promise<LocationEtape[]> {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
    if(!token){
        throw new Error('Aucun token dispo');
    }

    const url = `${API_BASE_URL}${ROUTES.AIDE_LOUER}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        logger.error('AideService', `Erreur récupération étapes (status ${response.status})`);
        throw new Error('Impossible de récupérer les étapes');
    }

    const data: LocationEtape[] = await response.json();
    
    return data;
}

export async function getEtapesCanoe(): Promise<PratiqueEtape[]>{
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
    if(!token){
        throw new Error ('Aucun token dispo');
    }
    const url = `${API_BASE_URL}${ROUTES.AIDE_CANOE}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        logger.error('AideService', `Erreur récupération étapes (status ${response.status})`);
        throw new Error('Impossible de récupérer les étapes');
    }
    const data: PratiqueEtape[] = await response.json();

    return data;
} 
export async function getEtapesPaddle(): Promise<PratiqueEtape[]>{
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
    if(!token){
        throw new Error ('Aucun token dispo');
    }
    const url = `${API_BASE_URL}${ROUTES.AIDE_PADDLE}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        logger.error('AideService', `Erreur récupération étapes (status ${response.status})`);
        throw new Error('Impossible de récupérer les étapes');
    }
    const data: PratiqueEtape[] = await response.json();

    return data;
} 