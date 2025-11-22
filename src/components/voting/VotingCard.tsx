import { useState } from 'react';

interface VotingCardProps {
  value: number | '?';
  isSelected: boolean;
  onClick: () => void;
  isVoting: boolean;
  isRevealed?: boolean;
  animationDelay?: number;
}

export function VotingCard({
  value,
  isSelected,
  onClick,
  isVoting,
  isRevealed = false,
  animationDelay = 0,
}: VotingCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const displayValue = value;

  return (
    <button
      onClick={onClick}
      disabled={isVoting}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative w-12 h-16 sm:w-14 sm:h-20 lg:w-16 lg:h-24 rounded-lg border-2 transition-all duration-200 font-bold text-sm sm:text-base lg:text-lg
        ${
          isSelected
            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg scale-105'
            : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:shadow-md'
        }
        ${isHovered && !isSelected ? 'scale-102' : ''}
        ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isRevealed ? 'animate-cardFlip' : ''}
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      `}
      style={isRevealed ? { animationDelay: `${animationDelay}s` } : {}}
    >
      {/* Card content */}
      <div className="flex items-center justify-center h-full">
        <span className="text-lg sm:text-xl lg:text-2xl font-bold">
          {displayValue}
        </span>
      </div>

      {/* Corner values for classic playing card look */}
      <div className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 text-xs opacity-60">
        {displayValue}
      </div>
      <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 text-xs opacity-60 rotate-180">
        {displayValue}
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <svg
            className="w-2 h-2 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
