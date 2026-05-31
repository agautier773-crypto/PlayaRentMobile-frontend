import { fetchWithAuth } from './fetchWithAuth';
import { ROUTES } from '../constants/Config';
import { LocationEtape, PratiqueEtape, obligations } from '../types/Aide';
import { logger } from '../utils/logger';

//Récupère les étapes de location.
export async function getEtapesLocation(): Promise<LocationEtape[]> {
    const response = await fetchWithAuth(ROUTES.AIDE_LOUER, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        logger.error('AideService', `Erreur récupération étapes (status ${response.status})`);
        throw new Error('Impossible de récupérer les étapes');
    }

    return await response.json();
}

//Récupère les étapes pour le canoë / kayak.
export async function getEtapesCanoe(): Promise<PratiqueEtape[]> {
    const response = await fetchWithAuth(ROUTES.AIDE_CANOE, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        logger.error('AideService', `Erreur récupération étapes canoe (status ${response.status})`);
        throw new Error('Impossible de récupérer les étapes');
    }

    return await response.json();
}

// Récupère les étapes pour le paddle.
export async function getEtapesPaddle(): Promise<PratiqueEtape[]> {
    const response = await fetchWithAuth(ROUTES.AIDE_PADDLE, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        logger.error('AideService', `Erreur récupération étapes paddle (status ${response.status})`);
        throw new Error('Impossible de récupérer les étapes');
    }

    return await response.json();
}

//Récupère les obligations / règles.
export async function getObligations(): Promise<obligations[]> {
    const response = await fetchWithAuth(ROUTES.AIDE_REGLES, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        logger.error('AideService', `Erreur récupération obligations (status ${response.status})`);
        throw new Error('Impossible de récupérer les obligations');
    }

    return await response.json();
}