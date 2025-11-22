import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useRoom } from '../../hooks/useRoom';
import { formatRoomCode, isValidRoomCode } from '../../utils/roomCodeGenerator';
import { isValidUserName } from '../../utils/avatarGenerator';

export function JoinRoom() {
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState('');
  const { joinRoom, isLoading, error } = useRoom();
  const navigate = useNavigate();

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRoomCode(e.target.value);
    setRoomCode(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidRoomCode(roomCode)) {
      return;
    }

    if (!isValidUserName(userName)) {
      return;
    }

    try {
      await joinRoom(roomCode, userName.trim());
      navigate(`/${roomCode}`);
    } catch {
      // Error will be shown via the error state from useRoom
    }
  };

  const isFormValid = isValidRoomCode(roomCode) && isValidUserName(userName);

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Room</h2>
        <p className="text-gray-600">
          Enter the room code to join an existing session
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="roomCode"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Room Code
          </label>
          <input
            type="text"
            id="roomCode"
            value={roomCode}
            onChange={handleRoomCodeChange}
            placeholder="ABC123"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-wider"
            required
            maxLength={6}
            disabled={isLoading}
            style={{ textTransform: 'uppercase' }}
          />
          {roomCode.length > 0 && !isValidRoomCode(roomCode) && (
            <p className="text-red-500 text-xs mt-1">
              Room code must be 6 characters
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="userName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Name
          </label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            maxLength={20}
            disabled={isLoading}
          />
          {userName.length > 0 && !isValidUserName(userName) && (
            <p className="text-red-500 text-xs mt-1">
              Name is required (max 20 characters)
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          disabled={!isFormValid}
        >
          Join Room
        </Button>
      </form>
    </Card>
  );
}
