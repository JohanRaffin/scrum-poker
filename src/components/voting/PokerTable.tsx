import type { User, VoteValue } from '../../types';
import { SelfEmojiAnimation } from '../reactions/SelfEmojiAnimation';

interface Position {
  angle: number;
  isCustom: boolean;
}

type PlayerPosition = Position | string;

interface PokerTableProps {
  users: User[];
  votes: Record<string, VoteValue>;
  currentUserId?: string;
  votingState: 'voting' | 'revealed';
  onVote?: (value: VoteValue) => void;
  currentUserVote?: VoteValue;
  onCardClick?: (userId: string, position: { x: number; y: number }) => void;
  selfEmojiAnimation?: {
    userId: string;
    emoji: string;
    isVisible: boolean;
  } | null;
  onSelfEmojiComplete?: () => void;
}

const FIBONACCI_VALUES: VoteValue[] = [
  0,
  1,
  2,
  3,
  5,
  8,
  13,
  21,
  34,
  55,
  89,
  '?',
];

export function PokerTable({
  users,
  votes,
  currentUserId,
  votingState,
  onVote,
  currentUserVote,
  onCardClick,
  selfEmojiAnimation,
  onSelfEmojiComplete,
}: PokerTableProps) {
  // Position users around the table based on count
  const getPlayerPosition = (index: number, total: number) => {
    if (total <= 2) {
      // Two players: opposite sides
      return index === 0 ? 'top' : 'bottom';
    } else if (total <= 4) {
      // Four players: one on each side
      const positions = ['top', 'right', 'bottom', 'left'];
      return positions[index];
    } else if (total <= 6) {
      // Six players: two on top/bottom, one on each side
      const positions = [
        'top-left',
        'top-right',
        'right',
        'bottom-right',
        'bottom-left',
        'left',
      ];
      return positions[index];
    } else {
      // More players: distribute around the oval with collision avoidance
      // Start from top and distribute evenly
      let angle = (index / total) * 2 * Math.PI - Math.PI / 2;

      // For 10+ players, adjust angles to prevent side clustering
      if (total >= 10) {
        // Create better distribution by slightly adjusting angles
        // to avoid tight clustering on the sides
        const adjustedIndex = index;
        const baseAngle = (adjustedIndex / total) * 2 * Math.PI - Math.PI / 2;

        // Add small offset to spread out side participants
        const sideAdjustment = Math.sin(baseAngle * 2) * 0.15; // Spread sides more
        angle = baseAngle + sideAdjustment;
      }

      return { angle, isCustom: true };
    }
  };

  const getPositionStyles = (position: PlayerPosition) => {
    if (typeof position === 'object' && position.isCustom) {
      // Custom positioning for more than 6 players
      // Aggressive radius scaling for better spacing, especially for 10+ players
      const baseRadius = 42;
      let extraRadius = Math.max(0, (users.length - 6) * 2.5);

      // Extra boost for 10+ players to prevent side overlaps
      if (users.length >= 10) {
        extraRadius += (users.length - 9) * 2;
      }

      const radius = Math.min(47, baseRadius + extraRadius); // Increased cap

      // Use less oval shape for more players to spread them out better
      const ovalFactor =
        users.length >= 10 ? 0.8 : users.length > 8 ? 0.75 : 0.65;

      const x = 50 + radius * Math.cos(position.angle);
      const y = 50 + radius * ovalFactor * Math.sin(position.angle);

      return {
        position: 'absolute' as const,
        left: `${Math.max(2, Math.min(98, x))}%`, // Maximum width usage
        top: `${Math.max(2, Math.min(98, y))}%`,
        transform: 'translate(-50%, -50%)',
      };
    }

    // Predefined positions
    const positions = {
      top: { top: '10%', left: '50%', transform: 'translate(-50%, -50%)' },
      'top-left': {
        top: '15%',
        left: '25%',
        transform: 'translate(-50%, -50%)',
      },
      'top-right': {
        top: '15%',
        left: '75%',
        transform: 'translate(-50%, -50%)',
      },
      right: { top: '50%', right: '10%', transform: 'translate(50%, -50%)' },
      'bottom-right': {
        bottom: '15%',
        right: '25%',
        transform: 'translate(50%, 50%)',
      },
      bottom: { bottom: '10%', left: '50%', transform: 'translate(-50%, 50%)' },
      'bottom-left': {
        bottom: '15%',
        left: '25%',
        transform: 'translate(-50%, 50%)',
      },
      left: { top: '50%', left: '10%', transform: 'translate(-50%, -50%)' },
    };

    return {
      position: 'absolute' as const,
      ...positions[position as keyof typeof positions],
    };
  };

  const renderCard = (userId: string, position: PlayerPosition) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return null;

    const userVote = votes[userId];
    const hasVoted = userVote !== undefined;
    const isCurrentUser = userId === currentUserId;
    const showCardBack = votingState === 'voting' && hasVoted && !isCurrentUser;
    const showCardValue = votingState === 'revealed' && hasVoted;
    const showCurrentUserVote =
      votingState === 'voting' && hasVoted && isCurrentUser;
    const showEmptyCard = !hasVoted;
    const canThrowEmoji = onCardClick; // Allow throwing emoji at anyone, including self

    // Scale elements based on number of users
    const isCompact = users.length > 6;
    const cardSize = isCompact ? 'w-10 h-12' : 'w-14 h-18';
    const textSize = isCompact ? 'text-sm' : 'text-lg';
    const avatarSize = isCompact ? 'w-10 h-10' : 'w-12 h-12';
    const avatarTextSize = isCompact ? 'text-2xl' : 'text-3xl';
    const nameSize = isCompact ? 'text-xs max-w-14' : 'text-xs max-w-20';

    return (
      <div
        key={userId}
        className="absolute"
        style={getPositionStyles(position)}
        data-user-id={userId}
      >
        {/* Voting Card */}
        <div className="flex flex-col items-center space-y-2">
          <div
            className={`
              ${cardSize} rounded-lg border-2 flex items-center justify-center ${textSize} font-bold
              ${showCardBack ? 'bg-blue-500 border-blue-600 text-white' : ''}
              ${showCardValue ? 'bg-white border-blue-500 text-blue-600' : ''}
              ${showCurrentUserVote ? 'bg-green-500 border-green-600 text-white' : ''}
              ${showEmptyCard ? 'bg-gray-100 border-gray-300 text-gray-400 border-dashed' : ''}
              ${isCurrentUser && hasVoted ? 'ring-2 ring-blue-400' : ''}
              ${canThrowEmoji ? 'cursor-pointer hover:scale-105 hover:shadow-xl hover:ring-2 hover:ring-yellow-400' : ''}
              transition-all duration-300 shadow-lg
            `}
            onClick={
              canThrowEmoji
                ? (e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = rect.left + rect.width / 2;
                    const y = rect.top + rect.height / 2;
                    onCardClick!(userId, { x, y });
                  }
                : undefined
            }
            title={
              canThrowEmoji
                ? isCurrentUser
                  ? `Select emoji for yourself`
                  : `Throw emoji at ${user.name}`
                : undefined
            }
          >
            {showCardBack && '🂠'}
            {showCardValue && (userVote === null ? '?' : userVote)}
            {showCurrentUserVote && (userVote === null ? '?' : userVote)}
            {showEmptyCard && '—'}
          </div>

          {/* User Avatar and Name */}
          <div className="flex flex-col items-center space-y-1">
            <div
              className={`relative ${avatarSize} ${avatarTextSize} ${typeof user.avatar === 'string' ? user.avatar : user.avatar?.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-white font-semibold shadow-lg avatar-container`}
              title={
                typeof user.avatar === 'object' ? user.avatar?.name : undefined
              }
              data-has-emoji-animation={
                selfEmojiAnimation?.userId === userId &&
                selfEmojiAnimation?.isVisible
                  ? 'true'
                  : 'false'
              }
            >
              <div className="avatar-content">
                {typeof user.avatar === 'object' && user.avatar?.emoji
                  ? user.avatar.emoji
                  : user.name.charAt(0).toUpperCase()}
              </div>

              {/* Self Emoji Animation */}
              {selfEmojiAnimation?.userId === userId && (
                <SelfEmojiAnimation
                  userId={userId}
                  emoji={selfEmojiAnimation.emoji}
                  isVisible={selfEmojiAnimation.isVisible}
                  onComplete={onSelfEmojiComplete || (() => {})}
                />
              )}
            </div>
            <span
              className={`${nameSize} font-medium text-center truncate ${isCurrentUser ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
            >
              {isCompact && user.name.length > 6
                ? user.name.slice(0, 6) + '...'
                : user.name}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* CSS for avatar animations */}
      <style>
        {`
          .avatar-container {
            transition: transform 0.4s ease-in-out, opacity 0.3s ease-in-out;
          }
          .avatar-container[data-has-emoji-animation="true"] {
            transform: rotateY(180deg);
          }
          .avatar-container[data-has-emoji-animation="true"] .avatar-content {
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
          }
          .avatar-content {
            transition: opacity 0.3s ease-in-out;
          }
        `}
      </style>

      {/* Table */}
      <div
        className={`relative ${users.length > 9 ? 'h-[28rem]' : users.length > 8 ? 'h-96' : users.length > 6 ? 'h-88' : 'h-80'} bg-gradient-to-br from-green-100 to-green-200 rounded-2xl border-4 border-green-300 shadow-inner`}
      >
        {/* Table surface with subtle pattern */}
        <div className="absolute inset-4 bg-green-50 rounded-xl opacity-50"></div>

        {/* Center area */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-green-300">
            <div className="text-lg font-semibold text-green-800">
              {votingState === 'voting'
                ? 'Voting in Progress'
                : 'Votes Revealed'}
            </div>
            <div className="text-sm text-green-600">
              {votingState === 'voting'
                ? `${Object.keys(votes).length}/${users.length} voted`
                : `Average: ${(() => {
                    const numericVotes = Object.values(votes).filter(
                      (v) => v !== null && typeof v === 'number'
                    ) as number[];
                    return numericVotes.length > 0
                      ? (
                          numericVotes.reduce((a, b) => a + b, 0) /
                          numericVotes.length
                        ).toFixed(1)
                      : '—';
                  })()}`}
            </div>
          </div>
        </div>

        {/* Players around the table */}
        {users.map((user, index) => {
          const position = getPlayerPosition(index, users.length);
          return renderCard(user.id, position);
        })}
      </div>

      {/* Voting Cards for Current User */}
      {votingState === 'voting' && onVote && (
        <div className="mt-12">
          <div className="text-center mb-6">
            <h4 className="text-lg font-medium text-gray-700">
              Choose your card 👇
            </h4>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {FIBONACCI_VALUES.map((value) => (
              <button
                key={value}
                onClick={() => {
                  // If clicking the same card that's already selected, deselect it (remove vote)
                  if (currentUserVote === value) {
                    // Send 'REMOVE_VOTE' to indicate vote removal
                    onVote('REMOVE_VOTE');
                  } else {
                    onVote(value);
                  }
                }}
                className={`
                  w-10 h-14 rounded-lg border-2 flex items-center justify-center text-sm font-bold
                  transition-all duration-200 hover:scale-105
                  ${
                    currentUserVote === value
                      ? 'bg-blue-500 border-blue-600 text-white shadow-lg scale-105'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }
                `}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
