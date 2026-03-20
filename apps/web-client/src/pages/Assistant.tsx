import React, { useState } from 'react';
import { SuggestionTile, spacing, colors, radii } from '@depaneuria/ui';
import { useAppContext } from '../lib/AppContext';
import { mockProducts } from '../lib/mock-data';

export function Assistant() {
  const { addToCart } = useAppContext();
  const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([
    { text: "Bonjour ! De quoi avez-vous besoin aujourd'hui ?", isBot: true },
  ]);
  const [input, setInput] = useState('');

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((m) => [...m, { text: input, isBot: false }]);
    const query = input.toLowerCase();
    setInput('');

    setTimeout(() => {
      // Mock logic simple
      if (query.includes('chips') || query.includes('doritos')) {
        const product = mockProducts.find((p: any) => p.id === 'doritos-nacho');
        addToCart(product);
        setMessages((m) => [
          ...m,
          { text: "J'ai ajouté des Doritos Nacho à votre panier. Autre chose ?", isBot: true },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          { text: "Désolé, ce prototype ne comprend que 'chips' pour le moment.", isBot: true },
        ]);
      }
    }, 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)' }}>
      <h1>Mode Assisté</h1>
      <div
        style={{
          flexGrow: 1,
          backgroundColor: '#fff',
          borderRadius: radii.md,
          border: '1px solid #e5e7eb',
          padding: spacing.md,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.isBot ? 'flex-start' : 'flex-end',
              backgroundColor: m.isBot ? '#f3f4f6' : colors.primary,
              color: m.isBot ? '#000' : '#fff',
              padding: spacing.md,
              borderRadius: radii.md,
              maxWidth: '75%',
            }}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div
        style={{ display: 'flex', gap: spacing.sm, overflowX: 'auto', marginBottom: spacing.sm }}
      >
        <SuggestionTile
          label="Je veux des chips"
          onClick={() => {
            setInput('Je veux des chips');
          }}
        />
        <SuggestionTile
          label="Boissons"
          onClick={() => {
            setInput('Boissons');
          }}
        />
      </div>

      <form onSubmit={send} style={{ display: 'flex', gap: spacing.sm }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            flexGrow: 1,
            padding: spacing.md,
            borderRadius: radii.full,
            border: '1px solid #ccc',
          }}
          placeholder="Écrivez ou dites ce que vous cherchez..."
        />
        <button
          type="submit"
          style={{
            padding: `${spacing.sm} ${spacing.lg}`,
            backgroundColor: colors.primary,
            color: '#fff',
            border: 'none',
            borderRadius: radii.full,
            cursor: 'pointer',
          }}
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
