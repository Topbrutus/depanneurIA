type SpeechRecognitionConstructor = new () => SpeechRecognition;

interface SpeechWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

/** Retourne le constructeur SpeechRecognition si disponible dans le navigateur. */
export function getSpeechRecognitionConstructor():
  | SpeechRecognitionConstructor
  | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const candidate =
    (window as SpeechWindow).SpeechRecognition ??
    (window as SpeechWindow).webkitSpeechRecognition;

  return typeof candidate === 'function' ? candidate : null;
}

/** Créé une instance de SpeechRecognition ou null si non supporté. */
export function createSpeechRecognition(): SpeechRecognition | null {
  const Ctor = getSpeechRecognitionConstructor();
  if (!Ctor) {
    return null;
  }

  return new Ctor();
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}
