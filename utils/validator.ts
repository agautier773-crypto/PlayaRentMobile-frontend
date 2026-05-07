
//Vérifie qu'un email est au format avec Regex 
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

//Evalue si mot de passe est assez solide 
export type PasswordStrength = {
  hasMinLength: boolean;   // ≥ 8 caractères
  hasUppercase: boolean;   // ≥ 1 majuscule
  hasLowercase: boolean;   // ≥ 1 minuscule
  hasNumber: boolean;      // ≥ 1 chiffre
  hasSpecialChar: boolean; // ≥ 1 caractère spécial
  isValid: boolean;        // toutes les règles obligatoires sont OK
};

//On exige 8+ caractère, une majuscule, minuscule et un chiffre et caractère spécial conseillé 
export function checkPasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]~`';]/.test(password);

  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    isValid,
  };
}

//Vérifie qu'un nom/prenom est au bon format 
// Accepte lettres + accents + tirets + apostrophes + espaces 
export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  // Autorise : lettres (avec accents), espace, tiret, apostrophe
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  return nameRegex.test(trimmed);
}
