import { useReducer, useEffect, type ReactNode } from 'react';
import type { Room, User, RoomState } from '../types';
import { RoomContext } from './RoomContextDefinition';

type RoomAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ROOM'; payload: Room }
  | { type: 'SET_USER'; payload: User }
  | { type: 'UPDATE_ROOM'; payload: Room }
  | { type: 'LEAVE_ROOM' };

const initialState: RoomState = {
  room: null,
  currentUser: null,
  isLoading: false,
  error: null,
};

function roomReducer(state: RoomState, action: RoomAction): RoomState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_ROOM':
      return { ...state, room: action.payload, isLoading: false, error: null };
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'UPDATE_ROOM':
      return { ...state, room: action.payload };
    case 'LEAVE_ROOM':
      return { ...initialState };
    default:
      return state;
  }
}

export function RoomProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(roomReducer, initialState);

  // Restore room state on page load
  const restoreRoomState = async () => {
    const savedRoomCode = localStorage.getItem('scrumPokerRoomCode');
    const savedUser = localStorage.getItem('scrumPokerUser');

    if (savedRoomCode && savedUser) {
      try {
        const user = JSON.parse(savedUser);

        // Fetch current room state from server
        const response = await fetch(`/api/room/${savedRoomCode}`);
        if (response.ok) {
          const data = await response.json();

          // Check if user still exists in the room
          const userStillInRoom = data.room.users.find(
            (u: User) => u.id === user.id
          );

          if (userStillInRoom) {
            dispatch({
              type: 'SET_ROOM',
              payload: {
                ...data.room,
                createdAt: new Date(data.room.createdAt || Date.now()),
              },
            });
            dispatch({ type: 'SET_USER', payload: user });
          } else {
            // User no longer in room, clear localStorage
            localStorage.removeItem('scrumPokerRoomCode');
            localStorage.removeItem('scrumPokerUser');
          }
        } else {
          // Room doesn't exist anymore, clear localStorage
          localStorage.removeItem('scrumPokerRoomCode');
          localStorage.removeItem('scrumPokerUser');
        }
      } catch (error) {
        console.error('Failed to restore room state:', error);
        // Clear localStorage on error
        localStorage.removeItem('scrumPokerRoomCode');
        localStorage.removeItem('scrumPokerUser');
      }
    }
  };

  // Restore state on component mount
  useEffect(() => {
    restoreRoomState();
  }, []);

  const createRoom = async (
    teamName: string,
    userName: string
  ): Promise<string | null> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch('/api/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create room');
      }

      const data = await response.json();

      // Store room code for the join call
      const roomCode = data.roomCode;

      // Now join the room as the creator
      await joinRoom(roomCode, userName);

      return roomCode;
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  };

  const joinRoom = async (
    roomCode: string,
    userName: string,
    isSpectator: boolean = false
  ) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch('/api/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomCode, userName, isSpectator }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join room');
      }

      const data = await response.json();

      dispatch({
        type: 'SET_ROOM',
        payload: {
          ...data.room,
          createdAt: new Date(data.room.createdAt || Date.now()),
        },
      });
      dispatch({ type: 'SET_USER', payload: data.user });

      // Store user and room info for reconnection
      localStorage.setItem('scrumPokerRoomCode', roomCode);
      localStorage.setItem('scrumPokerUser', JSON.stringify(data.user));
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error; // Re-throw so calling code can handle it
    }
  };

  const leaveRoom = () => {
    dispatch({ type: 'LEAVE_ROOM' });
    localStorage.removeItem('scrumPokerRoomCode');
    localStorage.removeItem('scrumPokerUser');
  };

  const updateRoom = (room: Room) => {
    dispatch({ type: 'UPDATE_ROOM', payload: room });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  return (
    <RoomContext.Provider
      value={{
        ...state,
        createRoom,
        joinRoom,
        leaveRoom,
        updateRoom,
        setError,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}
