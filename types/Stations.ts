import { Equipement } from './Equipement';

export type Station = {
    id: string;
    nom: string;
    etat: string;
    latitude: number;
    longitude: number;
    nombreComposantsTotal: number;
    nombreComposantsDisponibles: number;
    typeComposant?: string;
    estVisible: boolean;
    composants: Equipement[];
} 