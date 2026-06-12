export type Equipement = {
    id: string;
    idStation: string;
    type: string;
    nom: string;
    disponible: boolean;
    informations?: Informations | null;        
    heureRetour?: string | null;
};

export type Informations = {
    contenu: string;
};