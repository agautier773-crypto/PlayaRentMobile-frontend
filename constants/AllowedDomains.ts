// Liste des domaines autorisés pour les QR codes Scan&Ride 

export const ALLOWED_DOMAINS: string[] = [
    'playa-rent.fr',
    'www.playa-rent.fr',
    'app.playa-rent.fr',
    'reservation.playa-rent.fr',
];

// Vérifie si une URL est autorisée 
export function isUrlAllowed(url: string): boolean {
    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();

        // Vérifie si le hostname correspond à un domaine autorisé 
        return ALLOWED_DOMAINS.some((domain) => {
            const d = domain.toLowerCase();
            return hostname === d || hostname.endsWith('.' + d);
        });
    }catch {
        // URL invalide
        return false;
    }
}