import { Platform } from 'react-native';

// URL du backend en développement (ton IP locale — adapte si ton IP change)
const DEV_API_URL = 'http://192.168.1.65:8080/api';

// URL du backend en production (le VPS, en HTTPS)
const PROD_API_URL = 'https://api.playa-rent.fr/api';

// __DEV__ = true en dev (Metro/Expo), false dans un build APK/prod
export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const ROUTES = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: 'auth/logout',
    ME: '/auth/me',
    STATIONS: '/stations',
    AIDE_LOUER: '/aide/louer',
    AIDE_CANOE: '/aide/sur-leau/canoe',
    AIDE_PADDLE: '/aide/sur-leau/paddle',
    AIDE_REGLES: '/aide/obligations',
};

export const STORAGE_KEYS = {
    JWT_TOKEN: 'jwt_token', 
    REFRESH_TOKEN: 'refresh_token',
    USER_ID: 'user_id',
    USER_EMAIL: 'user_email',
    USER_ROLE: 'user_role',
};
export const LEGAL_URLS = {
  cgu:'https://www.playa-rent.fr/wp-content/uploads/2026/04/CGAU-AloaSUP.pdf',
  privacy:'https://www.playa-rent.fr/politique-de-confidentialite/',
} as const;

export type LegalDoc = keyof typeof LEGAL_URLS;