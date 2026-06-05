export type User = {
    idUtilisateurs: number;
    nom: string;
    prenom: string;
    mail: string;
    role: string;
};

export type UpdateProfileData = {
    nom: string;
    prenom: string;
    mail: string;
};

export type ChangePasswordData = {
    ancienPassword: string;
    nouveauPassword: string;
};