import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
} from './voice-browser';

export type VoiceStatus =
  | 'ready'
  | 'listening'
  | 'transcribing'
  | 'error'
  | 'unsupported';

export interface VoiceState {
  status: VoiceStatus;
  message?: string;
  transcript?: string;
}

interface VoiceAdapterOptions {
  lang?: string;
  onTranscript: (text: string) => void;
  onStatusChange?: (state: VoiceState) => void;
}

export interface VoiceAdapter {
  start: () => void;
  stop: () => void;
  dispose: () => void;
  getState: () => VoiceState;
  isSupported: boolean;
}

function describeError(error: SpeechRecognitionErrorCode): string {
  switch (error) {
    case 'audio-capture':
      return 'Micro non détecté.';
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Permission micro refusée.';
    case 'no-speech':
      return 'Aucun son détecté.';
    case 'aborted':
      return 'Écoute annulée.';
    default:
      return 'Erreur vocale inattendue.';
  }
}

export function createVoiceAdapter({
  lang = 'fr-FR',
  onTranscript,
  onStatusChange,
}: VoiceAdapterOptions): VoiceAdapter {
  const recognition = createSpeechRecognition();
  let state: VoiceState = isSpeechRecognitionSupported()
    ? { status: 'ready' }
    : { status: 'unsupported', message: 'Micro non supporté sur ce navigateur.' };

  const notify = () => {
    onStatusChange?.(state);
  };

  if (!recognition) {
    notify();
    return {
      start: () => notify(),
      stop: () => undefined,
      dispose: () => undefined,
      getState: () => state,
      isSupported: false,
    };
  }

  recognition.lang = lang;
  recognition.continuous = false;
  recognition.interimResults = false;

  const updateState = (next: VoiceState) => {
    state = next;
    notify();
  };

  recognition.onstart = () => {
    updateState({ status: 'listening' });
  };

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const firstResult = event.results[0];
    const alternative = firstResult?.[0];
    const transcript = alternative?.transcript?.trim() ?? '';

    if (!transcript) {
      updateState({
        status: 'error',
        message: 'Nous n’avons rien compris, réessayez.',
      });
      return;
    }

    updateState({ status: 'transcribing', transcript });
    onTranscript(transcript);
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    updateState({ status: 'error', message: describeError(event.error) });
  };

  recognition.onend = () => {
    if (state.status !== 'transcribing' && state.status !== 'error') {
      updateState({ status: 'ready' });
      return;
    }

    if (state.status === 'transcribing') {
      updateState({ status: 'ready', transcript: state.transcript });
    }
  };

  const start = () => {
    if (state.status === 'listening' || state.status === 'transcribing') {
      return;
    }

    try {
      recognition.start();
    } catch (error) {
      updateState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Micro indisponible.',
      });
    }
  };

  const stop = () => {
    recognition.stop();
    updateState({ status: 'ready' });
  };

  const dispose = () => {
    recognition.onstart = null;
    recognition.onerror = null;
    recognition.onresult = null;
    recognition.onend = null;
    recognition.stop();
  };

  notify();

  return {
    start,
    stop,
    dispose,
    getState: () => state,
    isSupported: true,
  };
}
