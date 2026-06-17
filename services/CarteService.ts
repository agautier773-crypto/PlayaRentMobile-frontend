import { API_BASE_URL } from '../constants/Config';
import { logger } from '../utils/logger';
import type { CarteResponse } from '../types/Carte';

export async function getDonneesCarte(): Promise<CarteResponse> {
    const response = await fetch(`${API_BASE_URL}/carte`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        logger.error('CarteService', `Erreur récupération carte (status ${response.status})`);
        throw new Error('Impossible de récupérer les données carte');
    }
    return await response.json();
}