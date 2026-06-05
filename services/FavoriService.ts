import { fetchWithAuth } from './fetchWithAuth';
import { ROUTES } from '../constants/Config';
import { Station } from '../types/Stations';
import { logger } from '../utils/logger';

//Récupère les stations favorites de l'utilisateur connecté.
export async function getFavoris(): Promise<Station[]> {
    const response = await fetchWithAuth('/favoris', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Erreur récupération favoris (status ${response.status})`);
    }

    return await response.json();
}

// Ajoute une station aux favoris.
export async function addFavori(idStation: string): Promise<void> {
    const response = await fetchWithAuth(`/favoris/${idStation}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error(`Erreur ajout favori (status ${response.status})`);
    }

    logger.info('FavoriService', `Station ${idStation} ajoutée aux favoris`);
}

 //Retire une station des favoris.
export async function removeFavori(idStation: string): Promise<void> {
    const response = await fetchWithAuth(`/favoris/${idStation}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Erreur retrait favori (status ${response.status})`);
    }

    logger.info('FavoriService', `Station ${idStation} retirée des favoris`);
}
//Vérifie si une station est en favori
export async function existeFavori(idStation: string): Promise<boolean> {
    const response = await fetchWithAuth(`/favoris/${idStation}/exists`, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error(`Erreur vérification favori (status ${response.status})`);
    }

    const data = await response.json();
    return data.exists;
}