import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { CUSTOM_PROJECTILE } from '../../constants/customProjectile';

interface SelfEmojiAnimationProps {
  userId: string;
  emoji: string;
  onComplete: () => void;
  isVisible: boolean;
}

export function SelfEmojiAnimation({
  userId,
  emoji,
  onComplete,
  isVisible,
}: SelfEmojiAnimationProps) {
  const [animationData, setAnimationData] = useState(null);
  const [showLottie, setShowLottie] = useState(false);

  useEffect(() => {
    if (!isVisible || !emoji) return;

    // Handle custom projectile with shaking animation
    if (emoji === 'custom-projectile') {
      setTimeout(() => {
        setShowLottie(true);
      }, 400); // Wait for avatar flip to complete
      setTimeout(() => {
        onComplete();
      }, 6000);
      return;
    }

    // Convert emoji to unicode codepoint for Lottie URL
    const getEmojiCodepoint = (emoji: string) => {
      try {
        const codepoint = emoji.codePointAt(0)?.toString(16).padStart(4, '0');
        return codepoint;
      } catch {
        console.warn('Failed to get codepoint for emoji:', emoji);
        return null;
      }
    };

    const codepoint = getEmojiCodepoint(emoji);
    if (!codepoint) {
      // For non-Lottie emojis, wait for flip then show fallback emoji
      setTimeout(() => {
        setShowLottie(true);
      }, 400); // Wait for avatar flip to complete
      setTimeout(() => {
        onComplete();
      }, 6000);
      return;
    }

    const lottieUrl = `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoint}/lottie.json`;

    // Fetch Lottie animation
    fetch(lottieUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setAnimationData(data);
        setTimeout(() => {
          setShowLottie(true);
        }, 400); // Wait for avatar flip to complete (0.4s)
      })
      .catch((error) => {
        console.warn('Failed to load Lottie animation:', error);
        // Fallback: wait for flip then show regular emoji
        setTimeout(() => {
          setShowLottie(true);
        }, 400); // Wait for avatar flip to complete
      });

    // Clean up after animation - show emoji longer
    const cleanup = setTimeout(() => {
      setShowLottie(false);
      setAnimationData(null);
      onComplete();
    }, 6000); // Extended from 3000ms to 6000ms

    return () => {
      clearTimeout(cleanup);
    };
  }, [isVisible, emoji, onComplete]);

  if (!isVisible) return null;

  return (
    <>
      {/* CSS for shaking animation */}
      <style>
        {`
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-2px) rotate(-1deg); }
            50% { transform: translateX(2px) rotate(1deg); }
            75% { transform: translateX(-1px) rotate(-0.5deg); }
            100% { transform: translateX(0); }
          }
          .shake-animation {
            animation: shake 0.3s ease-in-out infinite;
          }
        `}
      </style>

      {/* Custom projectile with shaking animation */}
      {showLottie && emoji === 'custom-projectile' && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          data-user-id={userId}
        >
          <div className="w-16 h-16 shake-animation">
            <img
              src={CUSTOM_PROJECTILE}
              alt="Custom projectile"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Lottie animation overlay */}
      {showLottie && animationData && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          data-user-id={userId}
        >
          <div className="w-16 h-16">
            <Lottie
              animationData={animationData}
              loop={true}
              autoplay={true}
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        </div>
      )}

      {/* Fallback emoji overlay for non-Lottie emojis */}
      {showLottie && !animationData && emoji !== 'custom-projectile' && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          data-user-id={userId}
        >
          <div className="text-4xl animate-bounce"> {emoji} </div>
        </div>
      )}
    </>
  );
}
