
//requete envoyé au back pour connexion
export type LoginRequest = {
    mail: string; 
    password: string;
};

//Requete envoyé au back pour register
export type RegisterRequest = {
    mail: string;
    password: string;
    prenom: string; 
    nom: string;
};

//Reponse du back apres login/register
export type LoginResponse = {
    accessToken: string;
    refreshToken: string;
    idUtilisateur: number; 
    mail: string;
    prenom: string;
    nom: string;
    role: string;
};

//Utilisateur connecté 
export type User = {
    id: number;
    mail: string;
    prenom: string; 
    nom: string;
    role: string;
};

