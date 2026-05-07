import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, ROUTES, STORAGE_KEYS } from '../constants/Config';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../types/Auth';

//Stock l'utilisateur courant 
let currentUser: User | null = null;

// Tentative de connexion via le back 
export async function login(mail: string, password: string): Promise<User> {
    const requestBody: LoginRequest = {mail, password };
    const response = await fetch(`${API_BASE_URL}${ROUTES.LOGIN}`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if(!response.ok){
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.message || 'Erreur de connexion');
    }
    const data: LoginResponse = await response.json();

    await persistSession(data);
    return currentUser!;
}

//Inscription nouvel utilisateur 
export async function register(mail: string, password: string, prenom: string, nom: string) : Promise<User>{
    const requestBody: RegisterRequest = {mail, password, prenom, nom };
    const response = await fetch (`${API_BASE_URL}${ROUTES.REGISTER}`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if(!response.ok){
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.message || "Erreur lors de l'inscription");
    }
    const data: LoginResponse = await response.json();
    await persistSession(data);

    return currentUser!; 
}

//Déconnexion supprime le token et les infos 
export async function logout(): Promise<void>{
    await SecureStore.deleteItemAsync(STORAGE_KEYS.JWT_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_EMAIL);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ROLE);
    currentUser = null;
}

//Récupère l'utilisateur courant 
export function getCurrentUser(): User | null{
    return currentUser;
}

//Tente de restaurer la session depuis le SecureStorage 
export async function tryRestoreSession(): Promise<boolean>{
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
    if(!token) return false;

    const userId = await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
    const mail = await SecureStore.getItemAsync(STORAGE_KEYS.USER_EMAIL);
    const role = await SecureStore.getItemAsync(STORAGE_KEYS.USER_ROLE);

      if (!userId || !mail || !role) {
    await logout();
    return false;
  }

  currentUser = {
    id: parseInt(userId),
    mail,
    role,
    prenom: '',
    nom: '',
  };

  return true;
}

//Stocke la session après un login/register 
async function persistSession(response: LoginResponse): Promise<void>{
  await SecureStore.setItemAsync(STORAGE_KEYS.JWT_TOKEN, response.token);
  await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, response.userId.toString());
  await SecureStore.setItemAsync(STORAGE_KEYS.USER_EMAIL, response.mail);
  await SecureStore.setItemAsync(STORAGE_KEYS.USER_ROLE, response.role);

  currentUser = {
    id: response.userId,
    mail: response.mail,
    prenom: response.prenom,
    nom: response.nom,
    role: response.role,
  };
}

//Récupère le token actuel 
export async function getToken(): Promise<string | null>{
    return await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
}

// Classe custom pour les erreurs d'API 
export class ApiError extends Error{
    statusCode: number;
    constructor(statusCode: number, message:string){
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}