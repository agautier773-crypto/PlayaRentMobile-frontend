import { fetchWithAuth } from './fetchWithAuth';
import { User, UpdateProfileData, ChangePasswordData } from '../types/User';
import { logger } from '../utils/logger';

//Récupère le profil de l'utilisateur connecté 
export async function getProfile(): Promise<User>{
    const response = await fetchWithAuth('/utilisateurs/me', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if(!response.ok){
        throw new Error(`Erreur récupération profil (status ${response.status})`);
    }
    return await response.json();
}
//Met à jour le profil 
export async function updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await fetchWithAuth('/utilisateurs/me', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if(!response.ok){
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Erreur mise à jour profil (status ${response.status})`;
        throw new Error(errorMessage);
    }
    logger.info('ProfilService', 'Profil mis à jour');
    return await response.json();
}
//changer le mot de passe 
export async function changePassword(data: ChangePasswordData): Promise<void> {
    const response = await fetchWithAuth('/utilisateurs/me/password', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Erreur changement mot de passe (status ${response.status})`;
        throw new Error(errorMessage);
    }

    logger.info('ProfileService', 'Mot de passe modifié');
}
//Supprime le compte de l'utilisateur connecté 
export async function deleteAccount(password: string): Promise<void> {
    const response = await fetchWithAuth('/utilisateurs/me', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Erreur suppression compte (status ${response.status})`;
        throw new Error(errorMessage);
    }

    logger.info('ProfileService', 'Compte supprimé');
}