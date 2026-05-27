import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, ROUTES, STORAGE_KEYS } from '../constants/Config';
import { Station } from '../types/Stations';
import { logger } from '../utils/logger';

export async function getAllStations(): Promise<Station[]>{
    // Récupère le token en session
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
    if(!token){
        throw new Error('Aucun token disponible');
    }
    const response = await fetch (`${API_BASE_URL}${ROUTES.STATIONS}`, {
        method: 'GET',
        headers:{
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        logger.error('StationService', `Erreur récupération stations (status ${response.status})`);
        throw new Error('Impossible de récupérer les stations');
    }
    const data: Station[] = await response.json();
    
    return data;
}

export async function getStationById(id: string): Promise<Station>{
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
    if(!token) throw new Error('Aucun token dispo');

    const url = `${API_BASE_URL}${ROUTES.STATIONS}/${id}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok){
        if(response.status === 404){
            throw new Error('Station introuvable');
        }
        throw new Error ('Erreur récupération station (status ${response.status})');
    }

    const data: Station = await response.json();
    logger.info('StationService', `Station ${id} récupérée`);
    return data;
}