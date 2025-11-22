import { createContext } from 'react';
import type { Room, RoomState } from '../types';

interface RoomContextType extends RoomState {
  createRoom: (teamName: string, userName: string) => Promise<string | null>;
  joinRoom: (roomCode: string, userName: string) => Promise<void>;
  leaveRoom: () => void;
  updateRoom: (room: Room) => void;
  setError: (error: string | null) => void;
}

export const RoomContext = createContext<RoomContextType | undefined>(
  undefined
);
