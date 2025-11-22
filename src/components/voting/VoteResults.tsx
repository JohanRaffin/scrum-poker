import type { VoteStats, AvatarTheme } from '../../types';
import { ProgressRing } from '../ui/ProgressRing';

interface VoteResult {
  userId: string;
  userName: string;
  avatar: AvatarTheme | string;
  vote: number | null;
}

interface VoteResultsProps {
  votes: VoteResult[];
  stats: VoteStats;
  onReset?: () => void;
  onChangeVote?: () => void;
}

export function VoteResults({
  votes,
  stats,
  onReset,
  onChangeVote,
}: VoteResultsProps) {
  // Sort votes by value for better display
  const sortedVotes = [...votes].sort((a, b) => {
    if (a.vote === null && b.vote === null) return 0;
    if (a.vote === null) return 1;
    if (b.vote === null) return -1;
    return a.vote - b.vote;
  });

  // Create distribution chart data
  const distributionEntries = Object.entries(stats.distribution).sort(
    ([a], [b]) => {
      if (a === 'null') return 1;
      if (b === 'null') return -1;
      return parseInt(a) - parseInt(b);
    }
  );

  const maxCount = Math.max(...Object.values(stats.distribution));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Statistics Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Voting Results
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          <div
            className="text-center animate-slideUp"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="text-3xl font-bold text-blue-600">
              {stats.average}
            </div>
            <div className="text-sm text-gray-600">Average</div>
          </div>

          <div
            className="text-center animate-slideUp"
            style={{ animationDelay: '0.4s' }}
          >
            <ProgressRing
              percentage={stats.agreement * 100}
              size={80}
              strokeWidth={6}
            />
          </div>

          <div
            className="text-center animate-slideUp"
            style={{ animationDelay: '0.6s' }}
          >
            <div className="text-3xl font-bold text-purple-600">
              {stats.totalVotes}
            </div>
            <div className="text-sm text-gray-600">Total Votes</div>
          </div>

          <div
            className="col-span-2 sm:col-span-1 text-center animate-slideUp"
            style={{ animationDelay: '0.8s' }}
          >
            {onChangeVote && (
              <button
                onClick={onChangeVote}
                className="px-3 py-2 text-sm lg:px-4 lg:py-2 lg:text-base bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors transform hover:scale-105 mb-2"
              >
                Change Vote
              </button>
            )}
          </div>

          <div
            className="col-span-2 sm:col-span-1 text-center animate-slideUp"
            style={{ animationDelay: '1.0s' }}
          >
            <button
              onClick={onReset}
              className="px-3 py-2 text-sm lg:px-4 lg:py-2 lg:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors transform hover:scale-105"
            >
              New Round
            </button>
          </div>
        </div>
      </div>

      {/* Vote Distribution Chart */}
      <div
        className="bg-white rounded-lg border border-gray-200 p-6 animate-slideUp"
        style={{ animationDelay: '0.6s' }}
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Vote Distribution
        </h4>
        <div className="space-y-3">
          {distributionEntries.map(([vote, count], index) => {
            const percentage = (count / stats.totalVotes) * 100;
            const barWidth = (count / maxCount) * 100;
            const displayVote = vote === 'null' ? '?' : vote;

            return (
              <div
                key={vote}
                className="flex items-center space-x-3 animate-slideUp"
                style={{ animationDelay: `${1.0 + index * 0.1}s` }}
              >
                <div className="w-8 text-sm font-medium text-gray-700">
                  {displayVote}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 animate-expandWidth"
                    style={{
                      width: `${barWidth}%`,
                      animationDelay: `${1.2 + index * 0.1}s`,
                    }}
                  >
                    <span
                      className="text-xs font-medium text-white opacity-0 animate-fadeIn"
                      style={{ animationDelay: `${1.5 + index * 0.1}s` }}
                    >
                      {count}
                    </span>
                  </div>
                </div>
                <div
                  className="w-12 text-xs text-gray-500 text-right animate-fadeIn"
                  style={{ animationDelay: `${1.3 + index * 0.1}s` }}
                >
                  {Math.round(percentage)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Votes */}
      <div
        className="bg-white rounded-lg border border-gray-200 p-6 animate-slideUp"
        style={{ animationDelay: '0.8s' }}
      >
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Individual Votes
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedVotes.map((result, index) => (
            <div
              key={result.userId}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-md animate-slideUp"
              style={{ animationDelay: `${1.5 + index * 0.1}s` }}
            >
              <div
                className={`w-8 h-8 ${typeof result.avatar === 'string' ? result.avatar : result.avatar?.color || 'bg-gray-500'} rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm`}
                title={
                  typeof result.avatar === 'object'
                    ? result.avatar?.name
                    : undefined
                }
              >
                {typeof result.avatar === 'object' && result.avatar?.emoji
                  ? result.avatar.emoji
                  : result.userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {result.userName}
                </div>
              </div>
              <div
                className="text-lg font-bold text-blue-600 animate-pulseOnce"
                style={{ animationDelay: `${1.8 + index * 0.1}s` }}
              >
                {result.vote === null ? '?' : result.vote}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
