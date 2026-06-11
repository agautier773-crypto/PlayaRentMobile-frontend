import { API_BASE_URL } from '../constants/Config';
import { Equipement } from '../types/Equipement';
import { logger } from '../utils/logger';

/**
 * Récupère les équipements d'une station.
 */
export async function getEquipementsByStation(idStation: string): Promise<Equipement[]> {
    const response = await fetch(`${API_BASE_URL}/stations/${idStation}/equipements`, {
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