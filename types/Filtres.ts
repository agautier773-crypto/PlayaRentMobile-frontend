export type FiltrerState = {
    types: string[];
    onlyDisponibles: boolean;
    onlyOuvertes: boolean;
};

export const FILTRES_VIDES: FiltrerState = {
    types: [],
    onlyDisponibles: false,
    onlyOuvertes: false,
};