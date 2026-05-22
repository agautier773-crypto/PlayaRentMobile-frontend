export type LocationEtape = {
  numero: number;
  titre: string;
  description: string;
};

export type PratiqueEtape = {
  numero: number;
  titre: string;
  description: string;
  imageKey?: string;
};

export type obligations = {
  type: string; 
  titre: string;
  regles: string[];
}