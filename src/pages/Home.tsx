import { useState } from 'react';
import { CreateRoom } from '../components/room/CreateRoom';
import { JoinRoom } from '../components/room/JoinRoom';
import { Button } from '../components/ui/Button';
import { Footer } from '../components/ui/Footer';

export function Home() {
  const [mode, setMode] = useState<'choice' | 'create' | 'join'>('choice');

  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode('choice')}
              className="mb-4"
            >
              ← Back
            </Button>
          </div>
          <CreateRoom />
        </div>

        <Footer position="fixed" />
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode('choice')}
              className="mb-4"
            >
              ← Back
            </Button>
          </div>
          <JoinRoom />
        </div>

        <Footer position="fixed" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-36 h-36 mx-auto mb-6">
            <img
              src="/scrum-poker.png"
              alt="Scrum Poker Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Scrum Poker</h1>
          <p className="text-lg text-gray-600 mb-8">
            Estimate your team's work with collaborative planning poker sessions
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => setMode('create')}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Room
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => setMode('join')}
          >
            <svg
              className="w-5 h-5 mr-2"
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
            Join Existing Room
          </Button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Built for agile teams to estimate user stories collaboratively
          </p>
        </div>
      </div>

      <Footer position="fixed" />
    </div>
  );
}
