import { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RoomHeader } from '../components/room/RoomHeader';
import { JoinRoomForm } from '../components/room/JoinRoomForm';
import { VotingInterface } from '../components/voting/VotingInterface';
import { Footer } from '../components/ui/Footer';
import { useRoom } from '../hooks/useRoom';
import { useSocket } from '../hooks/useSocket';
import type { GenericSSEEvent } from '../types';

export function Room() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { room, currentUser, updateRoom, joinRoom, isLoading } = useRoom();
  const [joinError, setJoinError] = useState<string | null>(null);
  const [hasAttemptedJoin, setHasAttemptedJoin] = useState(false);
  const [roomExists, setRoomExists] = useState<boolean | null>(null);
  const [checkingRoom, setCheckingRoom] = useState(false);

  // Check if room exists
  const checkRoomExists = async (roomCode: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/room/${roomCode.toUpperCase()}`);
      return response.ok;
    } catch (error) {
      console.error('Error checking room existence:', error);
      return false;
    }
  };

  // Check if we should show join form immediately based on localStorage
  const shouldShowJoinFormImmediately = () => {
    if (!roomCode || roomExists === false) return false; // Don't show form if room doesn't exist
    const storedUser = localStorage.getItem('scrumPokerUser');
    return !storedUser; // If no stored user, show join form immediately
  };

  // Handle URL-based room joining
  useEffect(() => {
    let isComponentMounted = true;

    const handleRoomJoin = async () => {
      if (!roomCode || !isComponentMounted) {
        if (roomCode) navigate('/');
        return;
      }

      // Check if room exists first if we haven't checked yet
      if (roomExists === null) {
        setCheckingRoom(true);
        const exists = await checkRoomExists(roomCode);
        if (!isComponentMounted) return;

        setRoomExists(exists);
        setCheckingRoom(false);

        if (!exists) {
          return; // Room doesn't exist, let the render logic handle it
        }
      }

      // If user is already in the correct room, do nothing
      if (room && room.id === roomCode.toUpperCase() && currentUser) {
        return;
      }

      // If we've already attempted to join, don't try again
      if (hasAttemptedJoin) {
        return;
      }

      // Set attempted join immediately to prevent multiple attempts
      setHasAttemptedJoin(true);

      // Check if user info is in localStorage
      const storedUser = localStorage.getItem('scrumPokerUser');
      const storedRoomCode = localStorage.getItem('scrumPokerRoomCode');

      if (
        storedUser &&
        storedRoomCode === roomCode.toUpperCase() &&
        isComponentMounted
      ) {
        // If we have stored data for this exact room, let RoomContext handle restoration
        // Don't call joinRoom here as it would create duplicates
        console.log(
          'User data found for this room, letting RoomContext handle restoration'
        );
        setJoinError(null);
      } else if (storedUser && isComponentMounted) {
        try {
          const userData = JSON.parse(storedUser);

          if (userData.name) {
            // User has stored data but for a different room, try to join
            console.log(
              'Attempting auto-join with stored user for new room:',
              userData.name
            );

            try {
              await joinRoom(roomCode, userData.name);
            } catch (error) {
              console.error('Auto-join failed:', error);
              // If join fails, show the form (it will be pre-filled)
              setJoinError(
                error instanceof Error ? error.message : 'Failed to join room'
              );
            }
          } else {
            setJoinError(null);
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clear invalid localStorage data
          localStorage.removeItem('scrumPokerUser');
          localStorage.removeItem('scrumPokerRoomCode');
          setJoinError(null);
        }
      } else {
        // No stored user data, show join form
        console.log('No stored user data found, will show join form');
        setJoinError(null);
      }
    };

    handleRoomJoin();

    return () => {
      isComponentMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]); // Only depend on roomCode to avoid re-running on state changes

  // Reset hasAttemptedJoin when roomCode changes
  useEffect(() => {
    setHasAttemptedJoin(false);
    setJoinError(null);
    setRoomExists(null); // Reset room existence check
    setCheckingRoom(false);
  }, [roomCode]);

  // Handle Socket.IO events
  const handleSocketEvent = useCallback(
    (event: GenericSSEEvent) => {
      console.log('Room received Socket.IO event:', event);

      switch (event.type) {
        case 'user-joined':
          if (event.data?.room && event.data?.user) {
            // Don't update room state if this is our own join event
            // The room state was already updated by the joinRoom response
            if (currentUser && event.data.user.id !== currentUser.id) {
              console.log('Updating room with new user data:', event.data.room);
              updateRoom(event.data.room);
            } else {
              console.log('Ignoring own user-joined event');
            }
          }
          break;
        case 'user-left':
          if (event.data?.room) {
            updateRoom(event.data.room);
          }
          break;
        case 'vote-cast':
          if (event.data?.room) {
            console.log(
              'Vote cast by user:',
              event.data.user?.name,
              'vote:',
              event.data.vote
            );
            updateRoom(event.data.room);
          }
          break;
        case 'votes-revealed':
          if (event.data?.room) {
            console.log('Votes revealed:', event.data.stats);
            updateRoom(event.data.room);
          }
          break;
        case 'voting-reset':
          if (event.data?.room) {
            console.log('Voting reset');
            updateRoom(event.data.room);
          }
          break;
        case 'emoji-flying':
          if (event.data?.flyingEmoji) {
            // Call the global handler set by VotingInterface
            const windowWithHandler = window as Window & {
              __handleFlyingEmoji?: (data: typeof event.data) => void;
            };
            if (windowWithHandler.__handleFlyingEmoji) {
              windowWithHandler.__handleFlyingEmoji(event.data);
            }
          }
          break;
        case 'self-emoji':
          if (event.data) {
            // Call the global handler set by VotingInterface
            const windowWithHandler = window as Window & {
              __handleSelfEmoji?: (data: typeof event.data) => void;
            };
            if (windowWithHandler.__handleSelfEmoji) {
              windowWithHandler.__handleSelfEmoji(event.data);
            }
          }
          break;
        default:
          console.log('Unhandled Socket.IO event type:', event.type);
      }
    },
    [updateRoom, currentUser]
  );

  // Set up Socket.IO connection for this room
  useSocket({
    roomCode: room?.id || '',
    userId: currentUser?.id,
    onEvent: handleSocketEvent,
    enabled: !!room?.id && !!currentUser?.id,
  });

  // Show room not found message
  if (roomExists === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Room Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The room{' '}
              <span className="font-mono font-semibold bg-gray-100 px-2 py-1 rounded">
                {roomCode?.toUpperCase()}
              </span>{' '}
              doesn't exist or may have been deleted.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Back to Welcome Page
          </button>
        </div>
      </div>
    );
  }

  // Show checking room state
  if (checkingRoom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking room...</p>
        </div>
      </div>
    );
  }

  // Show loading state while joining (use context loading state)
  if (isLoading && hasAttemptedJoin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Joining room...</p>
        </div>
      </div>
    );
  }

  // Show join form only if we haven't attempted to join yet, or if we have no room/user data
  if ((!room || !currentUser) && hasAttemptedJoin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Join Room {roomCode?.toUpperCase()}
          </h2>

          {joinError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{joinError}</p>
            </div>
          )}

          <JoinRoomForm roomCode={roomCode || ''} />
        </div>
      </div>
    );
  }

  // Show nothing while we're still attempting initial join
  if (!room || !currentUser) {
    // If we should show join form immediately OR we've attempted join but failed and not loading
    if (shouldShowJoinFormImmediately() || (hasAttemptedJoin && !isLoading)) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Join Room {roomCode?.toUpperCase()}
            </h2>

            {joinError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{joinError}</p>
              </div>
            )}

            <JoinRoomForm roomCode={roomCode || ''} />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RoomHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-16 relative">
        {/* Main Voting Area - Full Width */}
        <div className="mb-6 lg:mb-0">
          <VotingInterface />
        </div>
      </main>

      <Footer position="fixed" />
    </div>
  );
}
