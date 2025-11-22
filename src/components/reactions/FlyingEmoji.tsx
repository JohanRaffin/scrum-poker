import { useEffect, useState } from 'react';

export interface FlyingEmojiData {
  id: string;
  emoji: string;
  toUserId: string;
  targetPosition: { x: number; y: number };
  timestamp: number;
}

interface FlyingEmojiProps {
  data: FlyingEmojiData;
  onComplete: (id: string) => void;
}

export function FlyingEmoji({ data, onComplete }: FlyingEmojiProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hasLanded, setHasLanded] = useState(false);

  useEffect(() => {
    // Choose random starting position (left or right side of screen)
    const startFromLeft = Math.random() < 0.5;
    const startX = startFromLeft ? -50 : window.innerWidth + 50;
    const startY =
      Math.random() * (window.innerHeight * 0.6) + window.innerHeight * 0.2;

    // Set initial position and make visible
    setPosition({ x: startX, y: startY });
    setIsVisible(true);

    // Bezier curve animation
    const animateWithBezier = () => {
      const duration = 1200; // Total animation duration in ms
      const startTime = performance.now();
      let animationHasLanded = false;

      // Control points for bezier curve (creates an arc)
      const startPoint = { x: startX, y: startY };
      const endPoint = data.targetPosition;

      // Create arc by making control points higher than start/end
      const midY = Math.min(startY, endPoint.y) - 80; // Arc height (reduced for less curve)
      const control1 = { x: startX + (endPoint.x - startX) * 0.25, y: midY };
      const control2 = { x: startX + (endPoint.x - startX) * 0.75, y: midY };

      // Cubic bezier curve function
      const cubicBezier = (
        t: number,
        p0: number,
        p1: number,
        p2: number,
        p3: number
      ) => {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
      };

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-in for more realistic throwing motion
        const easedProgress = progress * progress;

        const currentX = cubicBezier(
          easedProgress,
          startPoint.x,
          control1.x,
          control2.x,
          endPoint.x
        );
        const currentY = cubicBezier(
          easedProgress,
          startPoint.y,
          control1.y,
          control2.y,
          endPoint.y
        );

        setPosition({ x: currentX, y: currentY });

        // Start bouncing when we're 95% of the way there to eliminate pause
        if (progress >= 0.95 && !animationHasLanded) {
          setHasLanded(true);
          animationHasLanded = true;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Animation complete - cleanup
          setTimeout(() => {
            setIsVisible(false);
            onComplete(data.id);
          }, 3000);
        }
      };

      // Start animation after a frame
      setTimeout(() => {
        requestAnimationFrame(animate);
      }, 50);
    };

    animateWithBezier();

    // Cleanup function - no cleanup needed since we're not storing animation IDs
    return () => {};
  }, [data.id, data.targetPosition, onComplete]);

  if (!isVisible) return null;

  // Check if emoji is a base64 image
  const isImage = data.emoji.startsWith('data:image/');

  return (
    <div
      className={`fixed pointer-events-none z-40 select-none ${!isImage ? 'text-2xl' : ''}`}
      style={{
        left: `${position.x - 16}px`, // Offset by half the emoji width (reduced)
        top: `${position.y - 16}px`, // Offset by half the emoji height (reduced)
        filter: hasLanded ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'none',
        animation: hasLanded
          ? 'gentle-bounce 1.5s ease-in-out infinite'
          : 'none',
      }}
    >
      {isImage ? (
        <img
          src={data.emoji}
          alt="Flying projectile"
          className="w-6 h-6 object-contain"
        />
      ) : (
        data.emoji
      )}
    </div>
  );
}
