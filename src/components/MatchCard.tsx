import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PinButton from './PinButton';
import MatchStats from './MatchStats';

interface Team {
  id: number;
  name: string;
  logo: string;
  goals?: number | null;
}

interface MatchCardProps {
  id: number;
  status: 'LIVE' | 'UPCOMING' | 'FINISHED';
  homeTeam: Team;
  awayTeam: Team;
  startTime: string;
  league: {
    id: number;
    name: string;
    logo: string;
    country?: string;
  };
  elapsed?: number;
}

const MatchCard: React.FC<MatchCardProps> = ({
  id,
  status,
  homeTeam,
  awayTeam,
  startTime,
  league,
  elapsed,
}) => {
  // Check if match is pinned
  const [isPinned, setIsPinned] = useState(false);
  // State for expanded stats
  const [showStats, setShowStats] = useState(false);
  
  // Load pinned status on component mount
  useEffect(() => {
    try {
      const pinnedMatches = JSON.parse(localStorage.getItem('pinnedMatches') || '[]');
      setIsPinned(pinnedMatches.includes(id));
    } catch (error) {
      console.error('Error loading pinned matches:', error);
    }
  }, [id]);
  
  // Handle pin toggle
  const handleTogglePin = (matchId: number, pinState: boolean) => {
    setIsPinned(pinState);
  };

  // Toggle stats visibility
  const toggleStats = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation(); // Stop event propagation
    setShowStats(!showStats);
  };

  // Format date/time
  const formatMatchTime = (timeString: string) => {
    const date = new Date(timeString);
    return new Intl.DateTimeFormat('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Helper function to handle match status display
  const getStatusLabel = () => {
    if (status === 'LIVE') {
      return elapsed ? `${elapsed}'` : 'LIVE';
    } else if (status === 'UPCOMING') {
      return formatMatchTime(startTime);
    } else {
      return 'FT';
    }
  };

  return (
    <div className="py-2">
      {/* Match Card */}
      <Link href={`/match/${id}`} className="block relative">
        <div className="p-1.5 cursor-pointer hover:bg-bg-light-hover transition-all">
          {/* League name */}
          <div className="mb-2">
            <div className="text-sm font-medium text-primary-color opacity-80">
              {league.name}
            </div>
          </div>
          
          {/* Match Status */}
          <div className="flex items-center justify-between mb-2">
            <div className={`text-sm font-semibold ${
              status === 'LIVE' ? 'text-live-color' : 
              status === 'UPCOMING' ? 'text-upcoming-color' : 
              'text-finished-color'
            }`}>
              {status === 'FINISHED' ? 'FT' : getStatusLabel()}
            </div>
            <PinButton 
              matchId={id} 
              initialPinned={isPinned} 
              onTogglePin={handleTogglePin}
              small={true}
            />
          </div>

          {/* Teams & Score */}
          <div className="flex items-center">
            {/* Home Team */}
            <div className="flex-1 flex items-center">
              <div className="mr-3">
                <img 
                  src={homeTeam.logo} 
                  alt={homeTeam.name} 
                  className="w-6 h-6"
                />
              </div>
              <span className="font-medium text-base truncate">{homeTeam.name}</span>
            </div>
            
            {/* Center Score */}
            <div className="px-4 flex justify-center items-center">
              {status !== 'UPCOMING' ? (
                <div className="flex font-bold text-lg">
                  <span className="mx-1">{homeTeam.goals}</span>
                  <span className="mx-1 text-text-light">-</span>
                  <span className="mx-1">{awayTeam.goals}</span>
                </div>
              ) : (
                <div className="text-center text-sm text-text-light mx-2">
                  <span>vs</span>
                </div>
              )}
            </div>
            
            {/* Away Team */}
            <div className="flex-1 flex items-center justify-end">
              <span className="font-medium text-base truncate text-right">{awayTeam.name}</span>
              <div className="ml-3">
                <img 
                  src={awayTeam.logo} 
                  alt={awayTeam.name} 
                  className="w-6 h-6"
                />
              </div>
            </div>
          </div>
          
          {/* Goal Times */}
          {status === 'LIVE' || status === 'FINISHED' ? (
            <div className="mt-1 text-xs text-center text-text-light">
              {homeTeam.goals && homeTeam.goals > 0 ? (
                <span className="inline-block mr-2">⚽ 23&apos;, 47&apos;</span>
              ) : null}
              {awayTeam.goals && awayTeam.goals > 0 ? (
                <span className="inline-block">⚽ 35&apos;</span>
              ) : null}
            </div>
          ) : null}
          
        </div>
      </Link>
      
      {/* Stats Toggle Button */}
      {status !== 'UPCOMING' && (
        <div 
          className="bg-primary-color bg-opacity-5 px-4 py-2 text-center text-sm text-primary-color cursor-pointer hover:bg-primary-color hover:bg-opacity-10 transition-all"
          onClick={toggleStats}
        >
          <div className="flex items-center justify-center">
            <span>{showStats ? 'ซ่อนสถิติ' : 'แสดงสถิติการแข่งขัน'}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 ml-1 transition-transform ${showStats ? 'rotate-180' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
      )}
      
      {/* Collapsible Stats Section */}
      {showStats && status !== 'UPCOMING' && (
        <MatchStats 
          homeTeam={homeTeam}
          awayTeam={awayTeam}
        />
      )}
    </div>
  );
};

export default MatchCard;
