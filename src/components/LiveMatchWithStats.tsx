import React, { useState, useEffect } from 'react';
import MatchCard from './MatchCard';
import MatchStats from './MatchStats';
import { getFixtureEvents } from '../services/api';

interface Team {
  id: number;
  name: string;
  logo: string;
  goals?: number | null;
}

interface League {
  id: number;
  name: string;
  logo: string;
  country?: string;
}

interface Match {
  id: number;
  status: 'LIVE' | 'UPCOMING' | 'FINISHED';
  homeTeam: Team;
  awayTeam: Team;
  startTime: string;
  league: League;
  elapsed?: number;
}

interface Goal {
  team: {
    id: number;
    name: string;
  };
  player: {
    id: number;
    name: string;
  };
  time: {
    elapsed: number;
    extra?: number;
  };
}

interface Card {
  team: {
    id: number;
    name: string;
  };
  player: {
    id: number;
    name: string;
  };
  time: {
    elapsed: number;
    extra?: number;
  };
  type: 'Yellow Card' | 'Red Card';
}

interface LiveMatchWithStatsProps {
  match: Match;
}

const LiveMatchWithStats: React.FC<LiveMatchWithStatsProps> = ({ match }) => {
  const [showStats, setShowStats] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Fetch events when match or showEvents changes
  useEffect(() => {
    const fetchEvents = async () => {
      if (!showEvents || !match.id) return;

      try {
        setIsLoadingEvents(true);
        setEventsError(null);
        const data = await getFixtureEvents(match.id);

        if (data && data.response) {
          // Extract goals and cards
          const eventsList = data.response;
          const extractedGoals: Goal[] = [];
          const extractedCards: Card[] = [];

          interface ApiEvent {
            type: string;
            team: {
              id: number;
              name: string;
            };
            player: {
              id: number;
              name: string;
            };
            time: {
              elapsed: number;
              extra?: number;
            };
            detail: 'Yellow Card' | 'Red Card';
          }
          
          eventsList.forEach((event: ApiEvent) => {
            if (event.type === 'Goal') {
              extractedGoals.push({
                team: event.team,
                player: event.player,
                time: event.time
              });
            } else if (event.type === 'Card') {
              extractedCards.push({
                team: event.team,
                player: event.player,
                time: event.time,
                type: event.detail
              });
            }
          });

          setGoals(extractedGoals);
          setCards(extractedCards);
        }
      } catch (err) {
        console.error('Error fetching match events:', err);
        setEventsError('ไม่สามารถโหลดข้อมูลเหตุการณ์ได้');
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [match.id, showEvents]);

  const toggleStats = () => {
    setShowStats(!showStats);
    if (!showStats) {
      setShowEvents(false); // Close events when opening stats
    }
  };

  const toggleEvents = () => {
    setShowEvents(!showEvents);
    if (!showEvents) {
      setShowStats(false); // Close stats when opening events
    }
  };

  return (
    <div className="mb-4 border border-border-color rounded-lg shadow-sm overflow-hidden">
      {/* Highlight that this is a live match */}
      <div className="bg-live-color text-white py-1 px-4 flex items-center">
        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
        <span className="text-sm font-medium">กำลังแข่งขัน{match.elapsed ? ` - นาทีที่ ${match.elapsed}` : ''}</span>
      </div>

      {/* Match Information */}
      <MatchCard
        id={match.id}
        status={match.status}
        homeTeam={match.homeTeam}
        awayTeam={match.awayTeam}
        startTime={match.startTime}
        league={match.league}
        elapsed={match.elapsed}
      />
      
      {/* Control Buttons */}
      <div className="flex border-t border-border-color">
        <button 
          className={`flex-1 py-2 px-4 text-center text-sm font-medium transition-all flex items-center justify-center ${showStats ? 'bg-primary-color text-white' : 'bg-primary-color bg-opacity-10 text-primary-color hover:bg-opacity-20'}`}
          onClick={toggleStats}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>{showStats ? 'ซ่อนสถิติ' : 'สถิติการแข่งขัน'}</span>
        </button>
        
        <button 
          className={`flex-1 py-2 px-4 text-center text-sm font-medium transition-all flex items-center justify-center ${showEvents ? 'bg-secondary-color text-white' : 'bg-secondary-color bg-opacity-10 text-secondary-color hover:bg-opacity-20'}`}
          onClick={toggleEvents}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>{showEvents ? 'ซ่อนเหตุการณ์' : 'เหตุการณ์สำคัญ'}</span>
        </button>
      </div>
      
      {/* Stats Section */}
      {showStats && (
        <MatchStats 
          homeTeam={match.homeTeam}
          awayTeam={match.awayTeam}
          matchId={match.id}
        />
      )}
      
      {/* Events Section */}
      {showEvents && (
        <div className="bg-bg-light p-4 border-t border-border-color">
          <h3 className="text-center text-sm font-medium mb-4">เหตุการณ์สำคัญ</h3>
          
          {isLoadingEvents ? (
            <div className="text-center py-3">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-secondary-color"></div>
              <p className="mt-1 text-xs text-text-light">กำลังโหลดข้อมูล...</p>
            </div>
          ) : eventsError ? (
            <p className="text-red-500 text-center text-sm">{eventsError}</p>
          ) : (
            <div>
              {/* Goals */}
              {goals.length > 0 ? (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">⚽ ประตู</h4>
                  <div className="space-y-2">
                    {goals.map((goal, index) => (
                      <div key={`goal-${index}`} className="flex items-center text-xs">
                        <span className="w-10 text-center font-medium">{goal.time.elapsed}{goal.time.extra ? `+${goal.time.extra}` : ''}&apos;</span>
                        <span className="flex-1">{goal.player.name}</span>
                        <span className="text-right">{goal.team.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-text-light mb-3">ยังไม่มีประตู</p>
              )}
              
              {/* Cards */}
              {cards.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium mb-2">🟨 ใบเหลือง / 🟥 ใบแดง</h4>
                  <div className="space-y-2">
                    {cards.map((card, index) => (
                      <div key={`card-${index}`} className="flex items-center text-xs">
                        <span className="w-10 text-center font-medium">{card.time.elapsed}{card.time.extra ? `+${card.time.extra}` : ''}&apos;</span>
                        <span className="w-5 text-center">
                          {card.type === 'Yellow Card' ? '🟨' : '🟥'}
                        </span>
                        <span className="flex-1">{card.player.name}</span>
                        <span className="text-right">{card.team.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-text-light">ยังไม่มีใบเหลือง/ใบแดง</p>
              )}
              
              {goals.length === 0 && cards.length === 0 && (
                <p className="text-center text-sm text-text-light mt-2">ยังไม่มีเหตุการณ์สำคัญ</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveMatchWithStats;
