import { useState } from 'react';

interface EmojiReactionProps {
  onSendEmoji: (emoji: string, message?: string) => void;
  disabled?: boolean;
}

const QUICK_EMOJIS = ['👍', '👎', '🤔', '😄', '😮', '🔥', '❤️', '🎉'];

export function EmojiReaction({
  onSendEmoji,
  disabled = false,
}: EmojiReactionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const handleQuickEmoji = (emoji: string) => {
    onSendEmoji(emoji);
    setIsOpen(false);
  };

  const handleCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (customMessage.trim()) {
      onSendEmoji('💬', customMessage.trim());
      setCustomMessage('');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Send reaction"
      >
        <span className="text-xl">😊</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-64 z-10">
          <div className="space-y-3">
            {/* Quick Emojis */}
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-2">
                Quick Reactions
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleQuickEmoji(emoji)}
                    className="p-2 text-xl hover:bg-gray-100 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message */}
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-2">
                Send Message
              </h4>
              <form onSubmit={handleCustomMessage} className="space-y-2">
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  maxLength={100}
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={!customMessage.trim()}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
