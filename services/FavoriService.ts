import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '../constants/Config';
import { Station } from '../types/Stations';
import { logger } from '../utils/logger';

export async function getFavoris(): Promise<Station[]> {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
    if(!token) throw new Error ('Aucun token dispo');

    const response = await fetch (`${API_BASE_URL}/favoris`, {
        method: 'GET', 
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok){
        throw new Error (`Erreur récupération favoris (status ${response.status})`);
    }
    return await response.json();
}

export async function addFavori(idStation: string): Promise<void>{
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
    if(!token) throw new Error('Aucun token dispo');

    const response = await fetch(`${API_BASE_URL}/favoris/${idStation}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok){
        throw new Error (`Erreur ajout favori (status ${response.status})`);
    }
}

export async function removeFavori(idStation: string): Promise<void> {
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
  if (!token) throw new Error('Aucun token disponible');

  const response = await fetch(`${API_BASE_URL}/favoris/${idStation}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur retrait favori (status ${response.status})`);
  }
  
}