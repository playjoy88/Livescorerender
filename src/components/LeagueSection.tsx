import React, { useEffect, useState } from 'react';
import MatchCard from './MatchCard';
import Banner from './Banner';

interface Match {
  id: number;
  status: 'LIVE' | 'UPCOMING' | 'FINISHED';
  homeTeam: {
    id: number;
    name: string;
    logo: string;
    goals?: number | null;
  };
  awayTeam: {
    id: number;
    name: string;
    logo: string;
    goals?: number | null;
  };
  startTime: string;
  league: {
    id: number;
    name: string;
    logo: string;
    country?: string;
  };
  elapsed?: number;
}

interface LeagueSectionProps {
  league: {
    id: number;
    name: string;
    logo: string;
    country?: string;
  };
  matches: Match[];
  isExpanded?: boolean;
  initialVisibleCount?: number;
}

const LeagueSection: React.FC<LeagueSectionProps> = ({
  league,
  matches,
  isExpanded: initialExpanded = false,
  initialVisibleCount = 5
}) => {
  // State for expanded/collapsed
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  
  // Number of matches to show
  const visibleCount = initialVisibleCount;
  
  // Load expanded state from localStorage on mount
  useEffect(() => {
    try {
      const expandedLeagues = JSON.parse(localStorage.getItem('expandedLeagues') || '{}');
      if (expandedLeagues.hasOwnProperty(league.id.toString())) {
        setIsExpanded(expandedLeagues[league.id.toString()]);
      }
    } catch (error) {
      console.error('Error loading expanded leagues:', error);
    }
  }, [league.id]);
  
  // Save expanded state to localStorage
  const toggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    
    try {
      const expandedLeagues = JSON.parse(localStorage.getItem('expandedLeagues') || '{}');
      expandedLeagues[league.id.toString()] = newState;
      localStorage.setItem('expandedLeagues', JSON.stringify(expandedLeagues));
    } catch (error) {
      console.error('Error saving expanded leagues:', error);
    }
  };
  
  // Calculate matches to display
  const displayMatches = isExpanded ? matches : matches.slice(0, visibleCount);
  
  // Check if we need a "Show More" button
  const showMoreButton = matches.length > visibleCount;
  
  return (
    <div className="mb-10 border border-border-color rounded-xl overflow-hidden shadow-sm">
      {/* League header - improved layout with more prominence */}
      <div className="bg-primary-color bg-opacity-10 border-b border-border-color">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            {league.logo && (
              <div className="flex-shrink-0 mr-3">
                <img 
                  src={league.logo} 
                  alt={league.name || 'League logo'}
                  className="w-7 h-7 object-contain" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://media.api-sports.io/football/leagues/0.png'; // Default image on error
                  }}
                />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold leading-tight" style={{ fontFamily: 'var(--font-prompt)' }}>
                {league.name || 'ลีกไม่ระบุชื่อ'}
              </h2>
              {league.country && (
                <div className="text-xs text-primary-color opacity-75 mt-0.5">
                  {league.country}
                </div>
              )}
            </div>
          </div>
          {showMoreButton && (
            <button 
              className="text-primary-color hover:text-secondary-color text-sm flex items-center font-medium"
              onClick={toggleExpand}
            >
              {isExpanded ? 'แสดงน้อยลง' : 'แสดงเพิ่มเติม'}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Matches */}
      <div className="divide-y divide-border-color">
        {displayMatches.map((match, index) => (
          <div key={match.id} className={`${index % 2 === 0 ? 'bg-bg-light' : 'bg-primary-color bg-opacity-5'}`}>
            <MatchCard 
              id={match.id}
              status={match.status}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              startTime={match.startTime}
              league={match.league}
              elapsed={match.elapsed}
            />
            
            {/* Add banner after every 5th match when expanded */}
            {isExpanded && (index + 1) % 5 === 0 && index < displayMatches.length - 1 && (
              <div className="py-2">
                <Banner position="in-feed" size="small" />
              </div>
            )}
          </div>
        ))}
        
        {displayMatches.length === 0 && (
          <div className="text-center p-4 bg-bg-light rounded-lg">
            <p className="text-text-light">ไม่พบการแข่งขันในลีกนี้</p>
          </div>
        )}
      </div>
      
      {/* "Show More" button - visible on all screen sizes */}
      {showMoreButton && (
        <div className="py-3 text-center bg-bg-light border-t border-border-color">
          <button 
            className="text-primary-color hover:text-secondary-color flex items-center justify-center mx-auto"
            onClick={toggleExpand}
          >
            <span className="font-medium">
              {isExpanded ? 'แสดงน้อยลง' : `แสดงเพิ่ม ${matches.length - visibleCount} รายการ`}
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default LeagueSection;
