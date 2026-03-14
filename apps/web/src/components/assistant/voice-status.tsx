import type { VoiceState } from '../../lib/voice-adapter';
import { useI18n } from '../../lib/i18n-context';

interface Props {
  state: VoiceState;
}

export function VoiceStatus({ state }: Props) {
  const { t } = useI18n();
  const message = (() => {
    switch (state.status) {
      case 'unsupported':
        return t('assistant.voice.unsupported');
      case 'listening':
        return t('assistant.voice.listening');
      case 'transcribing':
        return state.transcript
          ? t('assistant.voice.transcribing.text', { text: state.transcript })
          : t('assistant.voice.transcribing');
      case 'error':
        return state.message ?? t('assistant.voice.error');
      case 'ready':
      default:
        return t('assistant.voice.ready');
    }
  })();

  return <div className={`assistant-voice-status ${state.status}`}>{message}</div>;
}
