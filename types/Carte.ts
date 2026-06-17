import type { Station } from './Stations';

export type Groupe = {
    id: string;
    nom: string;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
    etat: string;
    nombreComposantsTotal: number;
    nombreComposantsDisponibles: number;
    stations: Station[];
};

export type CarteResponse = {
    stationsSeules: Station[];
    groupes: Groupe[];
};