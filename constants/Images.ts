// Mapping entre les clés d'images (back) et les fichiers locaux assets 

export const CONSEIL_IMAGES: { [key: string]: any } = {
    posture_canoe: require('../assets/posture_canoe.png'),
    pagaie_canoe: require('../assets/pagaie_canoe.png'),
    tourner_canoe: require('../assets/tourner_canoe.png'),

    posture_paddle: require('../assets/posture_paddle.png'),
    pagaie_paddle: require('../assets/pagaie_paddle.png'),
    tourner_paddle: require('../assets/tourner_paddle.png'),
};

//Retourne l'image correspondant à la clé 

export function getConseilImage(imageKey: string | undefined){
    if(!imageKey) return null;
    return CONSEIL_IMAGES[imageKey] || null;
}