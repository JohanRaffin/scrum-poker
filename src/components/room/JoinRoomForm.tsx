import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../hooks/useRoom';

interface JoinRoomFormProps {
  roomCode: string;
}

export function JoinRoomForm({ roomCode }: JoinRoomFormProps) {
  const [userName, setUserName] = useState('');
  const [isSpectator, setIsSpectator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { joinRoom } = useRoom();
  const navigate = useNavigate();

  // Pre-fill name from localStorage if available
  useEffect(() => {
    const storedUser = localStorage.getItem('scrumPokerUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.name) {
          setUserName(userData.name);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await joinRoom(roomCode, userName.trim(), isSpectator);
      // Navigation will happen automatically when room state updates
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

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
          maxLength={20}
          required
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isSpectator"
          checked={isSpectator}
          onChange={(e) => setIsSpectator(e.target.checked)}
          disabled={isLoading}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isSpectator" className="ml-2 block text-sm text-gray-700">
          Join as spectator (watch only, no voting)
        </label>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={!userName.trim() || isLoading}
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Joining...' : 'Join Room'}
        </button>

        <button
          type="button"
          onClick={handleBackToHome}
          disabled={isLoading}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
      </div>
    </form>
  );
}
