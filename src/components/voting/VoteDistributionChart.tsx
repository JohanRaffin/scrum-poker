import { useEffect, useState } from 'react';
import type { VoteStats } from '../../types';
import { ProgressRing } from '../ui/ProgressRing';
import { Confetti } from '../ui/Confetti';

interface VoteDistributionChartProps {
  voteStats: VoteStats;
  onChangeVote?: () => void;
  onResetVoting?: () => void;
  showConfetti?: boolean; // Whether to show confetti animation
}

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
];

export function VoteDistributionChart({
  voteStats,
  onChangeVote,
  onResetVoting,
  showConfetti = false,
}: VoteDistributionChartProps) {
  const { distribution, totalVotes, agreement } = voteStats;
  const [isConfettiActive, setIsConfettiActive] = useState(false);

  // Get the maximum count for scaling bars
  const maxCount = Math.max(...Object.values(distribution));

  // Trigger confetti when reaching 100% agreement (only once per round)
  const agreementPercentage = Math.round((agreement || 0) * 100);

  useEffect(() => {
    if (showConfetti) {
      setIsConfettiActive(true);
      // Auto-hide confetti after animation
      setTimeout(() => setIsConfettiActive(false), 3000);
    }
  }, [showConfetti]);

  return (
    <>
      <Confetti isActive={isConfettiActive} />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Vote Results</h3>

          {/* Action Buttons */}
          {(onChangeVote || onResetVoting) && (
            <div className="flex space-x-3">
              {onChangeVote && (
                <button
                  onClick={onChangeVote}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Change Vote
                </button>
              )}
              {onResetVoting && (
                <button
                  onClick={onResetVoting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  New Round
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Vote Distribution Bar Chart */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              Vote Distribution
            </h4>
            <div className="space-y-3">
              {FIBONACCI_VALUES.map((value) => {
                const key = value.toString();
                const count = distribution[key] || 0;
                const percentage =
                  totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

                // Only show bars for votes that were actually cast
                if (count === 0) return null;

                return (
                  <div key={key} className="flex items-center space-x-3">
                    {/* Vote Value */}
                    <div className="w-8 h-8 bg-blue-100 border border-blue-300 rounded flex items-center justify-center text-sm font-semibold text-blue-700 flex-shrink-0">
                      {value}
                    </div>

                    {/* Bar */}
                    <div className="flex-1 flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>

                      {/* Count and Percentage */}
                      <div className="text-sm text-gray-600 w-16 text-right">
                        {count} ({Math.round(percentage)}%)
                      </div>
                    </div>
                  </div>
                );
              })}

              {Object.keys(distribution).length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No votes cast yet
                </div>
              )}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:space-x-8 md:items-start md:justify-center">
            {/* Average */}
            <div className="flex flex-col items-center">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Average
              </h4>
              <div className="w-[100px] h-[100px] bg-white border-2 border-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {voteStats.average}
                </div>
              </div>
            </div>

            {/* Agreement Percentage */}
            <div className="flex flex-col items-center">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Agreement
              </h4>
              <ProgressRing
                percentage={agreementPercentage}
                size={100}
                strokeWidth={6}
              >
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${
                      agreementPercentage === 100
                        ? 'text-green-500'
                        : agreementPercentage >= 80
                          ? 'text-green-500'
                          : agreementPercentage >= 60
                            ? 'text-yellow-500'
                            : agreementPercentage >= 40
                              ? 'text-orange-500'
                              : 'text-red-500'
                    }`}
                  >
                    {agreementPercentage}%
                    {agreementPercentage === 100 && (
                      <div className="text-xs text-green-600 font-normal mt-1">
                        🎉 Perfect!
                      </div>
                    )}
                  </div>
                </div>
              </ProgressRing>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
