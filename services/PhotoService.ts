import { fetchWithAuth } from './fetchWithAuth';
import { Photo } from '../types/Photo';
import { logger } from '../utils/logger';

//Récupère toutes les photos d'une station.
export async function getPhotosByStation(idStation: string): Promise<Photo[]> {
    const response = await fetchWithAuth(`/photos/stations/${idStation}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Erreur récupération photos (status ${response.status})`);
    }

    const data: Photo[] = await response.json();
    logger.info('PhotoService', `${data.length} photos récupérées pour ${idStation}`);
    return data;
}