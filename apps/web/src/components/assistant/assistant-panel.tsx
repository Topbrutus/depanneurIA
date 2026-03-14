'use client';

import type { AssistantMessage } from '@depaneuria/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { processMessage } from '../../lib/assistant-adapter';
import {
  createVoiceAdapter,
  type VoiceAdapter,
  type VoiceState,
} from '../../lib/voice-adapter';
import { AssistantInput } from './assistant-input';
import { AssistantMessageBubble } from './assistant-message';
import { VoiceButton } from './voice-button';
import { VoiceStatus } from './voice-status';
import '../../styles/assistant.css';
import { useI18n } from '../../lib/i18n-context';

export function AssistantPanel() {
  const { t } = useI18n();
  const welcomeMessage: AssistantMessage = useMemo(
    () => ({
      id: 'welcome',
      role: 'assistant',
      text: t('assistant.welcome'),
      timestamp: 0,
    }),
    [t]
  );
  const [messages, setMessages] = useState<AssistantMessage[]>([welcomeMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>({ status: 'ready' });
  const bottomRef = useRef<HTMLDivElement>(null);
  const voiceRef = useRef<VoiceAdapter | null>(null);

  useEffect(() => {
    setMessages((prev) => [welcomeMessage, ...prev.slice(1)]);
  }, [welcomeMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: AssistantMessage = {
      id: `u-${Date.now().toString()}`,
      role: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Léger délai pour un rendu naturel (moteur synchrone, mais UX préférable)
    setTimeout(() => {
      const response = processMessage(trimmed);
      const assistantMsg: AssistantMessage = {
        id: `a-${Date.now().toString()}`,
        role: 'assistant',
        text: response.text,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 250);
  }, []);

  useEffect(() => {
    const adapter = createVoiceAdapter({
      onTranscript: (transcript) => handleSend(transcript),
      onStatusChange: (state) => setVoiceState(state),
    });

    voiceRef.current = adapter;
    setVoiceState(adapter.getState());

    return () => adapter.dispose();
  }, [handleSend]);

  const startVoice = () => {
    voiceRef.current?.start();
  };

  const stopVoice = () => {
    voiceRef.current?.stop();
  };

  return (
    <section
      aria-label={t('assistant.aria.panel')}
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '500px',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      {/* En-tête */}
      <div
        style={{
          padding: '0.9rem 1.2rem',
          background: '#1a1a2e',
          color: '#fff',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '1.1rem' }}>🤖</span>
        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
          {t('assistant.title')}
        </span>
      </div>

      {/* Liste de messages */}
      <div
        role="log"
        aria-live="polite"
        aria-label={t('assistant.aria.log')}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {messages.map((msg) => (
          <AssistantMessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div
            aria-label="L'assistant est en train de répondre"
            style={{
              color: '#aaa',
              fontSize: '0.82rem',
              fontStyle: 'italic',
              paddingLeft: '0.25rem',
            }}
          >
            {t('assistant.typing')}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="assistant-voice-row">
        <VoiceButton
          status={voiceState.status}
          onStart={startVoice}
          onStop={stopVoice}
          disabled={isLoading}
        />
        <VoiceStatus state={voiceState} />
      </div>

      {/* Zone de saisie */}
      <AssistantInput onSend={handleSend} disabled={isLoading} />
    </section>
  );
}
