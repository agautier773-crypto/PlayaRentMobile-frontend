import { fetchWithAuth } from './fetchWithAuth';
import { Equipement } from '../types/Equipement';
import { logger } from '../utils/logger';

/**
 * Récupère les équipements d'une station.
 */
export async function getEquipementsByStation(idStation: string): Promise<Equipement[]> {
    const response = await fetchWithAuth(`/stations/${idStation}/equipements`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Erreur récupération équipements (status ${response.status})`);
    }

    const data: Equipement[] = await response.json();
    logger.info('EquipementService', `${data.length} équipements récupérés pour ${idStation}`);
    return data;
}