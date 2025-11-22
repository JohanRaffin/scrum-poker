import { useState, useEffect, useCallback } from 'react';
import { PokerTable } from './PokerTable';
import { VoteDistributionChart } from './VoteDistributionChart';
import { FlyingEmojiPicker } from '../reactions/FlyingEmojiPicker';
import { FlyingEmoji, type FlyingEmojiData } from '../reactions/FlyingEmoji';
import { useFlyingEmojis } from '../../hooks/useFlyingEmojis';
import { useRoom } from '../../hooks/useRoom';
import type { VoteStats, VoteValue, EmojiFlyingEvent } from '../../types';
import { CUSTOM_PROJECTILE } from '../../constants/customProjectile';

// Fibonacci sequence for story point estimation
const FIBONACCI_VALUES: (number | string)[] = [
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
]; // "?" represents "don't know"

interface VoteResult {
  userId: string;
  userName: string;
  avatar: string | import('../../types').AvatarTheme;
  vote: VoteValue;
}

export function VotingInterface() {
  const { room, currentUser } = useRoom();
  const [isVoting, setIsVoting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [voteResults, setVoteResults] = useState<VoteResult[]>([]);
  const [voteStats, setVoteStats] = useState<VoteStats | null>(null);
  const [isAdjustingVote, setIsAdjustingVote] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Flying emoji state
  const { flyingEmojis, addFlyingEmoji, removeFlyingEmoji } = useFlyingEmojis();
  const [emojiPicker, setEmojiPicker] = useState<{
    isVisible: boolean;
    targetUserId: string;
    targetPosition: { x: number; y: number };
  }>({
    isVisible: false,
    targetUserId: '',
    targetPosition: { x: 0, y: 0 },
  });

  // Self emoji animation state
  const [selfEmojiAnimation, setSelfEmojiAnimation] = useState<{
    userId: string;
    emoji: string;
    isVisible: boolean;
  } | null>(null);

  const handleVoteClick = async (value: number | null | string) => {
    if (!room || !currentUser || isVoting) return;

    // Handle vote removal - send 'REMOVE_VOTE' to server to distinguish from "?" vote (null)
    // Don't convert to null here, let the server handle it

    setIsVoting(true);

    try {
      const response = await fetch('/api/cast-vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomCode: room.id,
          userId: currentUser.id,
          vote: value,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cast vote');
      }

      const data = await response.json();
      console.log('Vote cast successfully:', data);

      // If we were adjusting vote, exit adjustment mode
      if (isAdjustingVote) {
        setIsAdjustingVote(false);
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      // Vote will be reset via SSE update or page refresh
    } finally {
      setIsVoting(false);
    }
  };

  const handleChangeVote = () => {
    setIsAdjustingVote(true);
  };

  const handleCancelVoteChange = () => {
    setIsAdjustingVote(false);
  };

  const handleRevealVotes = async () => {
    if (!room || !currentUser || isRevealing) return;

    setIsRevealing(true);
    try {
      const response = await fetch('/api/reveal-votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomCode: room.id,
          userId: currentUser.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reveal votes');
      }

      const data = await response.json();
      console.log('Votes revealed successfully:', data);
    } catch (error) {
      console.error('Error revealing votes:', error);
    } finally {
      setIsRevealing(false);
    }
  };

  const handleResetVoting = async () => {
    if (!room || !currentUser) return;

    try {
      const response = await fetch('/api/reset-votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomCode: room.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset votes');
      }

      console.log('Votes reset successfully');
      // Clear previous round's results
      setVoteResults([]);
      setVoteStats(null);
    } catch (error) {
      console.error('Error resetting votes:', error);
    }
  };

  // Handle card click to show emoji picker
  const handleCardClick = useCallback(
    (userId: string, position: { x: number; y: number }) => {
      setEmojiPicker({
        isVisible: true,
        targetUserId: userId,
        targetPosition: position,
      });
    },
    []
  );

  // Handle emoji selection and throw
  const handleEmojiSelect = useCallback(
    async (emoji: string) => {
      if (!room || !currentUser || !emojiPicker.targetUserId) return;

      // Check if user is selecting emoji for themselves
      if (emojiPicker.targetUserId === currentUser.id) {
        // Send to server - the server will broadcast to all users including sender
        try {
          await fetch('/api/self-emoji', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              roomCode: room.id,
              userId: currentUser.id,
              emoji,
            }),
          });
        } catch (error) {
          console.error('Error broadcasting self emoji:', error);
        }

        // Close emoji picker
        setEmojiPicker({
          isVisible: false,
          targetUserId: '',
          targetPosition: { x: 0, y: 0 },
        });
        return;
      }

      try {
        const response = await fetch('/api/throw-emoji', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomCode: room.id,
            fromUserId: currentUser.id,
            toUserId: emojiPicker.targetUserId,
            emoji,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to throw emoji');
        }
      } catch (error) {
        console.error('Error throwing emoji:', error);
      }
    },
    [room, currentUser, emojiPicker.targetUserId]
  );

  // Handle closing emoji picker
  const handleCloseEmojiPicker = useCallback(() => {
    setEmojiPicker({
      isVisible: false,
      targetUserId: '',
      targetPosition: { x: 0, y: 0 },
    });
  }, []);

  // Handle completion of self emoji animation
  const handleSelfEmojiComplete = useCallback(() => {
    setSelfEmojiAnimation(null);
  }, []);

  // Calculate voting results and statistics
  const calculateVotingStats = useCallback(() => {
    if (!room || room.votingState !== 'revealed') return;

    // Calculate results from current room state
    const results = room.users.map((u) => ({
      userId: u.id,
      userName: u.name,
      avatar: u.avatar,
      vote: room.votes[u.id] || null,
    }));
    setVoteResults(results);

    // Calculate statistics - include all votes (including "?" votes)
    const allVotes = Object.values(room.votes).filter(
      (v) => v !== undefined && v !== null
    ); // Filter out undefined and null (absence of vote)
    const totalVotes = allVotes.length;

    if (totalVotes > 0) {
      // For average calculation, only use numeric votes (exclude "?" votes)
      const numericVotes = allVotes.filter(
        (v) => typeof v === 'number'
      ) as number[];
      const average =
        numericVotes.length > 0
          ? numericVotes.reduce((acc, vote) => acc + vote, 0) /
            numericVotes.length
          : 0;

      const distribution: Record<string, number> = {};
      allVotes.forEach((vote) => {
        const key = vote.toString();
        distribution[key] = (distribution[key] || 0) + 1;
      });

      const maxVotes = Math.max(...Object.values(distribution));
      const agreement = maxVotes / totalVotes;

      setVoteStats({
        average: numericVotes.length > 0 ? Math.round(average * 10) / 10 : 0,
        distribution,
        agreement: Math.round(agreement * 100) / 100,
        totalVotes,
      });
    } else {
      // If no votes at all, clear stats
      setVoteStats(null);
    }
  }, [room]);

  // Update local state when room voting state changes or room is loaded
  useEffect(() => {
    calculateVotingStats();
  }, [calculateVotingStats]);

  // Clear vote stats when starting a new round
  useEffect(() => {
    if (room?.votingState === 'voting') {
      setVoteResults([]);
      setVoteStats(null);
    }
  }, [room?.votingState]);

  // Check for 100% agreement when votes are revealed
  useEffect(() => {
    if (
      room?.votingState === 'revealed' &&
      voteStats &&
      voteStats.agreement === 1
    ) {
      setShowConfetti(true);
      // Reset confetti flag after a short delay
      setTimeout(() => setShowConfetti(false), 100);
    }
  }, [room?.votingState, voteStats]);

  // Handle flying emoji events received from server
  const handleFlyingEmojiReceived = useCallback(
    (flyingEmojiData: EmojiFlyingEvent['data']) => {
      if (!room || !flyingEmojiData?.flyingEmoji) return;

      // Find target user's card position
      const targetUser = room.users.find(
        (u) => u.id === flyingEmojiData.flyingEmoji.toUser.id
      );
      if (!targetUser) return;

      // Find the card element to get its position
      const cardElements = document.querySelectorAll('[data-user-id]');
      let targetPosition = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };

      for (const element of cardElements) {
        if (element.getAttribute('data-user-id') === targetUser.id) {
          const rect = element.getBoundingClientRect();
          targetPosition = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
          break;
        }
      }

      // Map custom-projectile identifier to actual base64 image
      let emoji = flyingEmojiData.flyingEmoji.emoji;
      if (emoji === 'custom-projectile') {
        emoji = CUSTOM_PROJECTILE;
      }

      const emojiData: FlyingEmojiData = {
        id: flyingEmojiData.flyingEmoji.id,
        emoji,
        toUserId: flyingEmojiData.flyingEmoji.toUser.id,
        targetPosition,
        timestamp: Date.now(),
      };

      addFlyingEmoji(emojiData);
    },
    [room, addFlyingEmoji]
  );

  // Handle self emoji events from server (including our own)
  const handleSelfEmojiReceived = useCallback(
    (data: { userId: string; emoji: string; timestamp: string }) => {
      if (data?.userId && data?.emoji) {
        // Show animation for any user (including sender)
        setSelfEmojiAnimation({
          userId: data.userId,
          emoji: data.emoji,
          isVisible: true,
        });
      }
    },
    []
  );

  // Set up the global callback for handling flying emojis
  useEffect(() => {
    (
      window as Window & {
        __handleFlyingEmoji?: typeof handleFlyingEmojiReceived;
      }
    ).__handleFlyingEmoji = handleFlyingEmojiReceived;
    return () => {
      delete (
        window as Window & {
          __handleFlyingEmoji?: typeof handleFlyingEmojiReceived;
        }
      ).__handleFlyingEmoji;
    };
  }, [handleFlyingEmojiReceived]);

  // Set up the global callback for handling self emojis
  useEffect(() => {
    (
      window as Window & {
        __handleSelfEmoji?: typeof handleSelfEmojiReceived;
      }
    ).__handleSelfEmoji = handleSelfEmojiReceived;
    return () => {
      delete (
        window as Window & {
          __handleSelfEmoji?: typeof handleSelfEmojiReceived;
        }
      ).__handleSelfEmoji;
    };
  }, [handleSelfEmojiReceived]);

  // Get current user's vote
  const currentUserVote = room?.votes?.[currentUser?.id || ''] ?? null;

  // Check if all users have voted
  const allUsersVoted =
    room?.users?.length &&
    Object.keys(room.votes || {}).length === room.users.length;

  // Check if any votes have been cast
  const anyVotesCast = Object.keys(room?.votes || {}).length > 0;

  // Show results if voting state is revealed
  if (room?.votingState === 'revealed' && voteResults.length > 0 && voteStats) {
    // If in vote adjustment mode, show voting cards along with current results
    if (isAdjustingVote) {
      return (
        <div className="space-y-8">
          {/* Poker Table with Results */}
          <PokerTable
            users={room?.users || []}
            votes={room?.votes || {}}
            currentUserId={currentUser?.id}
            votingState="revealed"
            currentUserVote={currentUserVote as VoteValue}
            onCardClick={handleCardClick}
            selfEmojiAnimation={selfEmojiAnimation}
            onSelfEmojiComplete={handleSelfEmojiComplete}
          />

          {/* Vote Adjustment Interface */}
          <div className="bg-white rounded-lg border-2 border-orange-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-orange-900">
                Adjust Your Vote
              </h3>
              <button
                onClick={handleCancelVoteChange}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {FIBONACCI_VALUES.map((value, index) => (
                <button
                  key={index}
                  onClick={() => handleVoteClick(value)}
                  disabled={isVoting}
                  className={`
                    w-10 h-14 rounded-lg border-2 flex items-center justify-center text-sm font-bold
                    transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
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

            <div className="text-center text-orange-700 text-sm">
              Select a new vote to update your estimate. Changes will be
              reflected immediately.
            </div>
          </div>

          {/* Statistics Panel */}
          <VoteDistributionChart
            voteStats={voteStats}
            onChangeVote={handleChangeVote}
            onResetVoting={handleResetVoting}
            showConfetti={showConfetti}
          />
        </div>
      );
    }

    // Normal results view - just show poker table with revealed cards
    return (
      <div className="space-y-8">
        {/* Poker Table with Revealed Cards */}
        <PokerTable
          users={room?.users || []}
          votes={room?.votes || {}}
          currentUserId={currentUser?.id}
          votingState="revealed"
          currentUserVote={currentUserVote as VoteValue}
          onCardClick={handleCardClick}
          selfEmojiAnimation={selfEmojiAnimation}
          onSelfEmojiComplete={handleSelfEmojiComplete}
        />

        {/* Statistics Panel */}
        <VoteDistributionChart
          voteStats={voteStats}
          onChangeVote={handleChangeVote}
          onResetVoting={handleResetVoting}
          showConfetti={showConfetti}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Poker Table */}
      <PokerTable
        users={room?.users || []}
        votes={room?.votes || {}}
        currentUserId={currentUser?.id}
        votingState={room?.votingState || 'voting'}
        onVote={handleVoteClick}
        currentUserVote={currentUserVote as VoteValue}
        onCardClick={handleCardClick}
        selfEmojiAnimation={selfEmojiAnimation}
        onSelfEmojiComplete={handleSelfEmojiComplete}
      />

      {/* Reveal Button - Always available during voting */}
      {room?.votingState === 'voting' && (
        <div className="text-center">
          <button
            onClick={handleRevealVotes}
            disabled={isRevealing || !anyVotesCast}
            className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
          >
            {isRevealing ? 'Revealing...' : '🃏 Reveal All Cards'}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            {!anyVotesCast
              ? 'No votes cast yet'
              : allUsersVoted
                ? `All ${room.users.length} players have voted!`
                : `${Object.keys(room.votes || {}).length} of ${room.users.length} players have voted`}
          </p>
        </div>
      )}

      {/* Flying Emoji Picker */}
      {emojiPicker.isVisible && (
        <FlyingEmojiPicker
          isVisible={emojiPicker.isVisible}
          targetPosition={emojiPicker.targetPosition}
          onEmojiSelect={handleEmojiSelect}
          onClose={handleCloseEmojiPicker}
        />
      )}

      {/* Flying Emojis */}
      {flyingEmojis.map((emoji) => (
        <FlyingEmoji
          key={emoji.id}
          data={emoji}
          onComplete={removeFlyingEmoji}
        />
      ))}
    </div>
  );
}
