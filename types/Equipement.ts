export type TypeEquipement = 'PADDLE' | 'KAYAK' | 'CANOE';

export type Equipement = {
    id: number;
    idStation: string;
    type: TypeEquipement;
    nom: string;
    disponible: boolean;
    heureRetour: string | null; 
};