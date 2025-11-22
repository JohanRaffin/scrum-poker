import { useState, useCallback } from 'react';
import type { FlyingEmojiData } from '../components/reactions/FlyingEmoji';

export function useFlyingEmojis() {
  const [flyingEmojis, setFlyingEmojis] = useState<FlyingEmojiData[]>([]);

  const addFlyingEmoji = useCallback(
    (emojiData: Omit<FlyingEmojiData, 'id' | 'timestamp'>) => {
      const newEmoji: FlyingEmojiData = {
        ...emojiData,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };

      setFlyingEmojis((prev) => [...prev, newEmoji]);
    },
    []
  );

  const removeFlyingEmoji = useCallback((id: string) => {
    setFlyingEmojis((prev) => prev.filter((emoji) => emoji.id !== id));
  }, []);

  const clearOldEmojis = useCallback(() => {
    const now = Date.now();
    setFlyingEmojis((prev) =>
      prev.filter((emoji) => now - emoji.timestamp < 10000)
    ); // Keep for max 10 seconds
  }, []);

  return {
    flyingEmojis,
    addFlyingEmoji,
    removeFlyingEmoji,
    clearOldEmojis,
  };
}
