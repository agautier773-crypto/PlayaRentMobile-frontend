import { fetchWithAuth } from './fetchWithAuth';
import { ROUTES } from '../constants/Config';
import { Station } from '../types/Stations';
import { logger } from '../utils/logger';

export async function getAllStations(): Promise<Station[]>{
    const response = await fetchWithAuth(ROUTES.STATIONS, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    if (!response.ok) {
        logger.error('StationService', `Erreur récupération stations (status ${response.status})`);
        throw new Error('Impossible de récupérer les stations');
    }
    return await response.json();
}

export async function getStationById(id: string): Promise<Station>{
    const response = await fetchWithAuth(`${ROUTES.STATIONS}/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok){
        if(response.status === 404){
            throw new Error('Station introuvable');
        }
        throw new Error(`Erreur récupération station (status ${response.status})`);
    }

    const data: Station = await response.json();
    logger.info('StationService', `Station ${id} récupérée`);
    return data;
}