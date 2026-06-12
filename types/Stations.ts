import { Equipement } from './Equipement';

export type Station = {
    id: string;
    nom: string;
    etat: string;
    latitude: number;
    longitude: number;
    nombreComposantsDisponibles: number;
    nombreComposants: number;
    typeComposant?: string;
    estVisible: boolean;
    composants: Equipement[];
} 