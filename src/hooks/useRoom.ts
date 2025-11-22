import { useContext } from 'react';
import { RoomContext } from '../contexts/RoomContextDefinition';

export function useRoom() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}
