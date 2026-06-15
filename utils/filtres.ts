import { Station } from '../types/Stations';
import { FiltrerState } from '../types/Filtres';

/**
 * Vérifie si une station passe les filtres.
 * Tous les filtres sont en ET logique : la station doit passer TOUS les critères.
 */
export function applyFiltres(station: Station, filtres: FiltrerState): boolean {
    // Filtre par type d'équipement
    if (filtres.types.length > 0) {
        const stationTypes = (station.composants || []).map((c) => c.type.toLowerCase());
        const hasMatchingType = filtres.types.some((filterType) => {
            if (filterType === 'paddle') return stationTypes.some((t) => t.includes('paddle'));
            if (filterType === 'kayak 1 place') return stationTypes.some((t) => t.includes('kayak 1 place'));
            if (filterType === 'kayak 2 places') return stationTypes.some((t) => t.includes('kayak 2 places'));
            if (filterType === 'beachwheel') return stationTypes.some((t) => t.includes('fauteuil'));
            return false;
        });
        if (!hasMatchingType) return false;
    }

    // Filtre disponibilité : au moins 1 équipement dispo
    if (filtres.onlyDisponibles && station.nombreComposantsDisponibles === 0) {
        return false;
    }

    // Filtre état : station ouverte uniquement
    if (filtres.onlyOuvertes && station.etat !== 'OUVERTE') {
        return false;
    }

    return true;
}