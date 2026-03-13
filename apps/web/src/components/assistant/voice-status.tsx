import type { VoiceState } from '../../lib/voice-adapter';

interface Props {
  state: VoiceState;
}

export function VoiceStatus({ state }: Props) {
  const message = (() => {
    switch (state.status) {
      case 'unsupported':
        return 'Micro non supporté. Utilisez le clavier pour écrire.';
      case 'listening':
        return 'Écoute en cours… parlez clairement près du micro.';
      case 'transcribing':
        return state.transcript
          ? `Transcription… « ${state.transcript} »`
          : 'Transcription…';
      case 'error':
        return state.message ?? 'Le micro a rencontré un problème.';
      case 'ready':
      default:
        return 'Micro prêt. Cliquez pour parler ou utilisez le clavier.';
    }
  })();

  return <div className={`assistant-voice-status ${state.status}`}>{message}</div>;
}
