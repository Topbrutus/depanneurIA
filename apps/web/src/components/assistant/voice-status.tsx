import { useI18n } from '../../lib/i18n-context';
import type { VoiceState } from '../../lib/voice-adapter';

interface Props {
  state: VoiceState;
}

export function VoiceStatus({ state }: Props) {
  const { translations: t } = useI18n();

  const message = (() => {
    switch (state.status) {
      case 'unsupported':
        return t.assistant.micNotSupported;
      case 'listening':
        return t.assistant.listeningInProgress;
      case 'transcribing':
        return state.transcript
          ? `${t.assistant.transcribingWithText} « ${state.transcript} »`
          : t.assistant.transcribing;
      case 'error':
        return state.message ?? t.assistant.micProblem;
      case 'ready':
      default:
        return t.assistant.micReady;
    }
  })();

  return <div className={`assistant-voice-status ${state.status}`}>{message}</div>;
}
