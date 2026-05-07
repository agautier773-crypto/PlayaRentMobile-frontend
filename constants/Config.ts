import { Platform } from 'react-native';

export const API_BASE_URL = Platform.select({
    android: 'http://192.168.1.174:8080/api',
  ios: 'http://192.168.1.174:8080/api',
  default: 'http://192.168.1.174:8080/api',
});

export const ROUTES = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
};

export const STORAGE_KEYS = {
    JWT_TOKEN: 'jwt_token', 
    USER_ID: 'user_id',
    USER_EMAIL: 'user_email',
    USER_ROLE: 'user_role',
};