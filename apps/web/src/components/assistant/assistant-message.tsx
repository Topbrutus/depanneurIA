import type { AssistantMessage } from '@depaneuria/types';
import type { CSSProperties } from 'react';

interface Props {
  message: AssistantMessage;
}

const USER_STYLE: CSSProperties = {
  maxWidth: '78%',
  padding: '0.55rem 0.9rem',
  borderRadius: '16px 16px 4px 16px',
  background: '#1a1a2e',
  color: '#fff',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  wordBreak: 'break-word',
};

const ASSISTANT_STYLE: CSSProperties = {
  maxWidth: '78%',
  padding: '0.55rem 0.9rem',
  borderRadius: '16px 16px 16px 4px',
  background: '#fff',
  color: '#1a1a2e',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  wordBreak: 'break-word',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
};

export function AssistantMessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      <div style={isUser ? USER_STYLE : ASSISTANT_STYLE}>{message.text}</div>
    </div>
  );
}
