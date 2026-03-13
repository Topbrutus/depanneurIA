import { Mic, MicOff, Square } from 'lucide-react';

import type { VoiceStatus } from '../../lib/voice-adapter';

interface Props {
  status: VoiceStatus;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function VoiceButton({ status, onStart, onStop, disabled = false }: Props) {
  const isListening = status === 'listening';
  const isUnsupported = status === 'unsupported';
  const isBusy = status === 'transcribing';
  const isDisabled = disabled || isUnsupported || isBusy;

  const label = (() => {
    if (isUnsupported) return 'Micro indisponible';
    if (isListening) return 'Arrêter';
    if (isBusy) return 'Transcription…';
    return 'Micro';
  })();

  const handleClick = () => {
    if (isDisabled) return;
    if (isListening) {
      onStop();
      return;
    }
    onStart();
  };

  const Icon = (() => {
    if (isUnsupported) return MicOff;
    if (isListening) return Square;
    return Mic;
  })();

  const variantClass = isListening
    ? 'assistant-voice-button listening'
    : 'assistant-voice-button ready';

  return (
    <button
      type="button"
      className={`${variantClass}${isDisabled ? ' disabled' : ''}`}
      onClick={handleClick}
      aria-pressed={isListening}
      aria-label={label}
      disabled={isDisabled}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}
