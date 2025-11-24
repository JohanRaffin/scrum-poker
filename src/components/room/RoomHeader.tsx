import { useState } from 'react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { useRoom } from '../../hooks/useRoom';
import { useNavigate } from 'react-router-dom';

export function RoomHeader() {
  const { room, currentUser, leaveRoom } = useRoom();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);

  if (!room || !currentUser) {
    return null;
  }

  const handleLeaveRoomClick = () => {
    setLeaveModalOpen(true);
  };

  const confirmLeaveRoom = () => {
    leaveRoom();
    navigate('/');
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(room.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  const copyInviteLink = async () => {
    try {
      const roomUrl = `${window.location.origin}/${room.id}`;
      await navigator.clipboard.writeText(roomUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy invite link:', err);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12">
              <img
                src="/scrum-poker.webp"
                alt="Scrum Poker"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{room.name}</h1>
              <p className="text-sm text-gray-500">Scrum Poker Voting</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Room Code:</span>
            <div className="relative">
              <button
                onClick={copyRoomCode}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm font-mono tracking-wider text-gray-700 transition-colors"
                title="Click to copy"
              >
                {room.id}
              </button>
              {copied && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Copied to clipboard
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {currentUser.name}
            </p>
            <p className="text-xs text-gray-500">
              {room.users.length} participants
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLeaveRoomClick}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Leave Room
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setInviteModalOpen(true)}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Invite Players
          </Button>
        </div>
      </div>

      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Players"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Share this link with other players to invite them to the room:
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Code
              </label>
              <div className="flex items-center space-x-2">
                <div className="bg-gray-100 px-3 py-2 rounded-md font-mono text-lg tracking-wider text-gray-800 flex-1 text-center">
                  {room.id}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Direct Link
              </label>
              <div className="flex items-center space-x-2">
                <div className="bg-gray-100 px-3 py-2 rounded-md text-sm text-gray-700 flex-1 break-all">
                  {window.location.origin}/{room.id}
                </div>
                <div className="relative">
                  <button
                    onClick={copyInviteLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Copy Link
                  </button>
                  {linkCopied && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      Copied!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        onConfirm={confirmLeaveRoom}
        title="Leave Room?"
        message="Are you sure you want to leave this room? You will lose your current vote and need to rejoin to continue participating."
        confirmText="Leave Room"
        cancelText="Stay"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </header>
  );
}
