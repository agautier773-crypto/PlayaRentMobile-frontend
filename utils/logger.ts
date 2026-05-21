// Détecte si on est en mode développement
// __DEV__ est une variable globale fournie par React Native
const isDev = __DEV__;

type LogLevel = 'log' | 'info' | 'warn' | 'error';

function formatMessage(level: LogLevel, tag: string, message: string): string {
  return `[${level.toUpperCase()}] [${tag}] ${message}`;
}

export const logger = {
  /**
   * Log d'info standard. Affiché uniquement en dev.
   */
  log: (tag: string, message: string, data?: any) => {
    if (!isDev) return;
    if (data !== undefined) {
      console.log(formatMessage('log', tag, message), data);
    } else {
      console.log(formatMessage('log', tag, message));
    }
  },

  /**
   * Log d'information. Affiché uniquement en dev.
   */
  info: (tag: string, message: string, data?: any) => {
    if (!isDev) return;
    if (data !== undefined) {
      console.info(formatMessage('info', tag, message), data);
    } else {
      console.info(formatMessage('info', tag, message));
    }
  },

  /**
   * Avertissement. Affiché uniquement en dev.
   */
  warn: (tag: string, message: string, data?: any) => {
    if (!isDev) return;
    if (data !== undefined) {
      console.warn(formatMessage('warn', tag, message), data);
    } else {
      console.warn(formatMessage('warn', tag, message));
    }
  },

  /**
   * Erreur. Toujours affichée (même en prod) car critique.
   * À terme, on enverra ça à un service externe (Sentry, Bugsnag...).
   */
  error: (tag: string, message: string, error?: any) => {
    if (error !== undefined) {
      console.error(formatMessage('error', tag, message), error);
    } else {
      console.error(formatMessage('error', tag, message));
    }
    // TODO: envoyer à Sentry en prod quand on l'aura intégré
  },
};