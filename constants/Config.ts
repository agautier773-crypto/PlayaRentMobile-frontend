import { Platform } from 'react-native';

export const API_BASE_URL = Platform.select({
    android: 'http://192.168.137.103:8080/api',
  ios: 'http://192.168.137.103:8080/api',
  default: 'http://192.168.137.103:8080/api',
});

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