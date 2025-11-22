import { useEffect, useState } from 'react';
import EmojiPicker, {
  type EmojiClickData,
  EmojiStyle,
  SkinTonePickerLocation,
} from 'emoji-picker-react';
import { CUSTOM_PROJECTILE } from '../../constants/customProjectile';

interface FlyingEmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
  targetPosition: { x: number; y: number };
  isVisible: boolean;
}

export function FlyingEmojiPicker({
  onEmojiSelect,
  onClose,
  targetPosition,
  isVisible,
}: FlyingEmojiPickerProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    // Close picker when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.emoji-picker-modal')) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    onClose();
  };

  const handlePlusButtonClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  // Quick emoji shortcuts for common reactions
  const quickEmojis = ['👍', '🎯', '✈️', '⏰', '🍅', '🎉'];

  const handleCustomProjectileClick = () => {
    onEmojiSelect('custom-projectile');
  };

  const handleQuickEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
  };

  return (
    <div
      className="emoji-picker-modal fixed z-[9999]"
      style={{
        left: `${Math.min(targetPosition.x - 160, window.innerWidth - 320)}px`,
        top: `${Math.max(targetPosition.y - 80, 10)}px`,
      }}
    >
      {/* Quick picker with + button */}
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-3 mb-2">
        <div className="flex items-center gap-2">
          {/* Quick emoji buttons */}
          {quickEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleQuickEmojiClick(emoji)}
              className="w-10 h-10 text-lg hover:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
              title={`Throw ${emoji}`}
            >
              {emoji}
            </button>
          ))}

          {/* Custom projectile button */}
          <button
            onClick={handleCustomProjectileClick}
            className="w-10 h-10 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 p-1"
            title="Throw custom projectile"
          >
            <img
              src={CUSTOM_PROJECTILE}
              alt="Custom projectile"
              className="w-6 h-6 object-contain"
            />
          </button>

          {/* + button to toggle full emoji picker */}
          <button
            onClick={handlePlusButtonClick}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              showEmojiPicker
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            title="Open full emoji picker"
          >
            <svg
              className={`w-5 h-5 transition-transform ${showEmojiPicker ? 'rotate-45' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Full emoji picker */}
      {showEmojiPicker && (
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            searchDisabled={false}
            skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
            height={350}
            width={320}
            lazyLoadEmojis={true}
            emojiStyle={EmojiStyle.NATIVE}
            previewConfig={{
              showPreview: false,
            }}
          />
        </div>
      )}
    </div>
  );
}
