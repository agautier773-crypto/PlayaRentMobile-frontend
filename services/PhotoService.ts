import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, STORAGE_KEYS } from '../constants/Config';
import { Photo } from '../types/Photo';
import { logger } from '../utils/logger';

/**
 * Récupère toutes les photos d'une station.
 */
export async function getPhotosByStation(idStation: string): Promise<Photo[]> {
  const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
  if (!token) throw new Error('Aucun token disponible');

  const url = `${API_BASE_URL}/photos/stations/${idStation}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
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