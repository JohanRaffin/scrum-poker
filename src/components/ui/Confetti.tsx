import { useEffect, useState } from 'react';

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocity: {
    x: number;
    y: number;
    rotation: number;
  };
  shape: 'square' | 'circle';
}

export function Confetti({ isActive, duration = 3000 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const colors = [
      '#ff6b6b',
      '#4ecdc4',
      '#45b7d1',
      '#f9ca24',
      '#f0932b',
      '#eb4d4b',
      '#6c5ce7',
      '#a29bfe',
      '#fd79a8',
      '#fdcb6e',
    ];

    const createConfettiPiece = (id: number): ConfettiPiece => ({
      id,
      x: Math.random() * window.innerWidth,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      velocity: {
        x: (Math.random() - 0.5) * 4,
        y: Math.random() * 3 + 2,
        rotation: (Math.random() - 0.5) * 10,
      },
      shape: Math.random() > 0.5 ? 'square' : 'circle',
    });
    if (!isActive) return;

    setIsAnimating(true);

    // Create initial burst of confetti
    const initialPieces = Array.from({ length: 50 }, (_, i) =>
      createConfettiPiece(i)
    );
    setPieces(initialPieces);

    let animationId: number;
    let pieceId = initialPieces.length;

    const animate = () => {
      setPieces((currentPieces) => {
        return currentPieces
          .map((piece) => ({
            ...piece,
            x: piece.x + piece.velocity.x,
            y: piece.y + piece.velocity.y,
            rotation: piece.rotation + piece.velocity.rotation,
            velocity: {
              ...piece.velocity,
              y: piece.velocity.y + 0.1, // gravity
            },
          }))
          .filter((piece) => piece.y < window.innerHeight + 50) // Remove pieces that fall off screen
          .concat(
            // Add new pieces occasionally for continuous effect
            Math.random() < 0.1 ? [createConfettiPiece(pieceId++)] : []
          );
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Stop animation after duration
    const timeout = setTimeout(() => {
      setIsAnimating(false);
      cancelAnimationFrame(animationId);
      setPieces([]);
    }, duration);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(timeout);
      setIsAnimating(false);
      setPieces([]);
    };
  }, [isActive, duration]);

  if (!isAnimating && pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={`absolute transition-none ${
            piece.shape === 'circle' ? 'rounded-full' : ''
          }`}
          style={{
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}
