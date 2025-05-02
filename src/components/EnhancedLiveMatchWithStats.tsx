import React, { useState, useEffect } from 'react';
import MatchCard from './MatchCard';
import MatchStats from './MatchStats';
import { getFixtureEvents, getFixtureLineups, getFixturePredictions } from '../services/api';

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

interface Player {
  id: number;
  name: string;
  number: number;
  position: string;
  grid?: string;
}

interface Lineup {
  team: {
    id: number;
    name: string;
    logo: string;
    colors?: {
      player: {
        primary: string;
        number: string;
        border: string;
      };
      goalkeeper: {
        primary: string;
        number: string;
        border: string;
      };
    };
  };
  formation: string;
  startXI: Player[];
  substitutes: Player[];
  coach: {
    id: number;
    name: string;
    photo?: string;
  };
}

interface Prediction {
  winner: {
    id: number | null;
    name: string | null;
    comment: string;
  };
  win_or_draw: boolean;
  under_over: string;
  goals: {
    home: number;
    away: number;
  };
  advice: string;
  percent: {
    home: string;
    draw: string;
    away: string;
  };
}

interface EnhancedLiveMatchWithStatsProps {
  match: Match;
}

const EnhancedLiveMatchWithStats: React.FC<EnhancedLiveMatchWithStatsProps> = ({ match }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'events' | 'lineups' | 'predictions'>('stats');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [homeLineup, setHomeLineup] = useState<Lineup | null>(null);
  const [awayLineup, setAwayLineup] = useState<Lineup | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingLineups, setIsLoadingLineups] = useState(false);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [lineupsError, setLineupsError] = useState<string | null>(null);
  const [predictionsError, setPredictionsError] = useState<string | null>(null);

  // Fetch events when match or activeTab changes
  useEffect(() => {
    const fetchEvents = async () => {
      if (activeTab !== 'events' || !match.id) return;

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
  }, [match.id, activeTab]);

  // Fetch lineups when match or activeTab changes
  useEffect(() => {
    const fetchLineups = async () => {
      if (activeTab !== 'lineups' || !match.id) return;

      try {
        setIsLoadingLineups(true);
        setLineupsError(null);
        const data = await getFixtureLineups(match.id);

        if (data && data.response && data.response.length >= 2) {
          // Extract lineups data
          setHomeLineup(data.response[0]);
          setAwayLineup(data.response[1]);
        } else {
          setLineupsError('ข้อมูลผู้เล่นยังไม่พร้อม');
        }
      } catch (err) {
        console.error('Error fetching match lineups:', err);
        setLineupsError('ไม่สามารถโหลดข้อมูลผู้เล่นได้');
      } finally {
        setIsLoadingLineups(false);
      }
    };

    fetchLineups();
  }, [match.id, activeTab]);

  // Fetch predictions when match or activeTab changes
  useEffect(() => {
    const fetchPredictions = async () => {
      if (activeTab !== 'predictions' || !match.id) return;

      try {
        setIsLoadingPredictions(true);
        setPredictionsError(null);
        const data = await getFixturePredictions(match.id);

        if (data && data.response && data.response.predictions) {
          // Extract prediction data
          setPrediction(data.response.predictions);
        } else {
          setPredictionsError('ข้อมูลการทำนายผลยังไม่พร้อม');
        }
      } catch (err) {
        console.error('Error fetching match predictions:', err);
        setPredictionsError('ไม่สามารถโหลดข้อมูลการทำนายผลได้');
      } finally {
        setIsLoadingPredictions(false);
      }
    };

    fetchPredictions();
  }, [match.id, activeTab]);

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
      
      {/* Control Tabs */}
      <div className="flex border-t border-border-color">
        <button 
          className={`flex-1 py-2 px-3 text-center text-sm font-medium transition-all flex items-center justify-center ${activeTab === 'stats' ? 'bg-primary-color text-white' : 'bg-primary-color bg-opacity-10 text-primary-color hover:bg-opacity-20'}`}
          onClick={() => setActiveTab('stats')}
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
          <span>สถิติ</span>
        </button>
        
        <button 
          className={`flex-1 py-2 px-3 text-center text-sm font-medium transition-all flex items-center justify-center ${activeTab === 'events' ? 'bg-secondary-color text-white' : 'bg-secondary-color bg-opacity-10 text-secondary-color hover:bg-opacity-20'}`}
          onClick={() => setActiveTab('events')}
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
          <span>เหตุการณ์</span>
        </button>

        <button 
          className={`flex-1 py-2 px-3 text-center text-sm font-medium transition-all flex items-center justify-center ${activeTab === 'lineups' ? 'bg-green-600 text-white' : 'bg-green-600 bg-opacity-10 text-green-600 hover:bg-opacity-20'}`}
          onClick={() => setActiveTab('lineups')}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>ผู้เล่น</span>
        </button>

        <button 
          className={`flex-1 py-2 px-3 text-center text-sm font-medium transition-all flex items-center justify-center ${activeTab === 'predictions' ? 'bg-purple-600 text-white' : 'bg-purple-600 bg-opacity-10 text-purple-600 hover:bg-opacity-20'}`}
          onClick={() => setActiveTab('predictions')}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>ทำนายผล</span>
        </button>
      </div>
      
      {/* Stats Section */}
      {activeTab === 'stats' && (
        <div className="bg-bg-light p-4 border-t border-border-color">
          <h3 className="text-center text-sm font-medium mb-4">สถิติการแข่งขัน</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-1">
              <MatchStats 
                homeTeam={match.homeTeam}
                awayTeam={match.awayTeam}
                matchId={match.id}
                position="left"
              />
            </div>
            <div className="col-span-1">
              <MatchStats 
                homeTeam={match.homeTeam}
                awayTeam={match.awayTeam}
                matchId={match.id}
                position="right"
                secondaryStats={true}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Events Section */}
      {activeTab === 'events' && (
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
            <div className="grid grid-cols-2 gap-6">
              {/* Goals */}
              <div className="col-span-1">
                <h4 className="text-sm font-medium mb-2">⚽ ประตู</h4>
                {goals.length > 0 ? (
                  <div className="space-y-2">
                    {goals.map((goal, index) => (
                      <div key={`goal-${index}`} className="flex items-center text-xs">
                        <span className="w-10 text-center font-medium">{goal.time.elapsed}{goal.time.extra ? `+${goal.time.extra}` : ''}&apos;</span>
                        <span className="flex-1">{goal.player.name}</span>
                        <span className="text-right">{goal.team.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-text-light mb-3">ยังไม่มีประตู</p>
                )}
              </div>
                
              {/* Cards */}
              <div className="col-span-1">
                <h4 className="text-sm font-medium mb-2">🟨 ใบเหลือง / 🟥 ใบแดง</h4>
                {cards.length > 0 ? (
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
                ) : (
                  <p className="text-center text-sm text-text-light">ยังไม่มีใบเหลือง/ใบแดง</p>
                )}
              </div>
              
              {goals.length === 0 && cards.length === 0 && (
                <p className="text-center text-sm text-text-light mt-2 col-span-2">ยังไม่มีเหตุการณ์สำคัญ</p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Lineups Section */}
      {activeTab === 'lineups' && (
        <div className="bg-bg-light p-4 border-t border-border-color">
          <h3 className="text-center text-sm font-medium mb-4">แผนการเล่น</h3>
          
          {isLoadingLineups ? (
            <div className="text-center py-3">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-600"></div>
              <p className="mt-1 text-xs text-text-light">กำลังโหลดข้อมูล...</p>
            </div>
          ) : lineupsError ? (
            <p className="text-red-500 text-center text-sm">{lineupsError}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Home Team Lineup */}
              <div className="col-span-1">
                <div className="text-center mb-3">
                  <div className="flex items-center justify-center">
                    <img src={homeLineup?.team.logo} alt={homeLineup?.team.name} className="w-6 h-6 mr-2" />
                    <h4 className="text-sm font-bold">{homeLineup?.team.name}</h4>
                  </div>
                  {homeLineup?.formation && (
                    <p className="text-xs text-text-light">รูปแบบ: {homeLineup.formation}</p>
                  )}
                  {homeLineup?.coach && (
                    <p className="text-xs text-text-light">โค้ช: {homeLineup.coach.name}</p>
                  )}
                </div>
                
                {/* Starting XI */}
                <div className="mb-4">
                  <h5 className="text-xs font-semibold mb-2 bg-bg-dark py-1 px-2 rounded">ผู้เล่นตัวจริง</h5>
                  <ul className="space-y-1">
                    {homeLineup?.startXI?.map((player, index) => (
                      <li key={`home-starter-${index}`} className="text-xs flex">
                        <span className="w-6 text-center font-semibold">{player.number}</span>
                        <span className="ml-2">{player.name}</span>
                        <span className="ml-auto text-text-light">{player.position}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Substitutes */}
                <div>
                  <h5 className="text-xs font-semibold mb-2 bg-bg-dark py-1 px-2 rounded">ผู้เล่นสำรอง</h5>
                  <ul className="space-y-1">
                    {homeLineup?.substitutes?.map((player, index) => (
                      <li key={`home-sub-${index}`} className="text-xs flex">
                        <span className="w-6 text-center font-semibold">{player.number}</span>
                        <span className="ml-2">{player.name}</span>
                        <span className="ml-auto text-text-light">{player.position}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Away Team Lineup */}
              <div className="col-span-1">
                <div className="text-center mb-3">
                  <div className="flex items-center justify-center">
                    <img src={awayLineup?.team.logo} alt={awayLineup?.team.name} className="w-6 h-6 mr-2" />
                    <h4 className="text-sm font-bold">{awayLineup?.team.name}</h4>
                  </div>
                  {awayLineup?.formation && (
                    <p className="text-xs text-text-light">รูปแบบ: {awayLineup.formation}</p>
                  )}
                  {awayLineup?.coach && (
                    <p className="text-xs text-text-light">โค้ช: {awayLineup.coach.name}</p>
                  )}
                </div>
                
                {/* Starting XI */}
                <div className="mb-4">
                  <h5 className="text-xs font-semibold mb-2 bg-bg-dark py-1 px-2 rounded">ผู้เล่นตัวจริง</h5>
                  <ul className="space-y-1">
                    {awayLineup?.startXI?.map((player, index) => (
                      <li key={`away-starter-${index}`} className="text-xs flex">
                        <span className="w-6 text-center font-semibold">{player.number}</span>
                        <span className="ml-2">{player.name}</span>
                        <span className="ml-auto text-text-light">{player.position}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Substitutes */}
                <div>
                  <h5 className="text-xs font-semibold mb-2 bg-bg-dark py-1 px-2 rounded">ผู้เล่นสำรอง</h5>
                  <ul className="space-y-1">
                    {awayLineup?.substitutes?.map((player, index) => (
                      <li key={`away-sub-${index}`} className="text-xs flex">
                        <span className="w-6 text-center font-semibold">{player.number}</span>
                        <span className="ml-2">{player.name}</span>
                        <span className="ml-auto text-text-light">{player.position}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Predictions Section */}
      {activeTab === 'predictions' && (
        <div className="bg-bg-light p-4 border-t border-border-color">
          <h3 className="text-center text-sm font-medium mb-4">ทำนายผลการแข่งขัน</h3>
          
          {isLoadingPredictions ? (
            <div className="text-center py-3">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-600"></div>
              <p className="mt-1 text-xs text-text-light">กำลังโหลดข้อมูล...</p>
            </div>
          ) : predictionsError ? (
            <p className="text-red-500 text-center text-sm">{predictionsError}</p>
          ) : prediction ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <div className="bg-bg-dark rounded-lg p-3 mb-4">
                  <div className="text-center mb-3">
                    <h4 className="text-sm font-semibold">ทีมที่น่าจะชนะ</h4>
                    <p className="text-xl font-bold mt-1">
                      {prediction.winner.name || 'เสมอกัน'}
                    </p>
                    <p className="text-xs text-text-light mt-1">
                      {prediction.winner.comment}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="text-center">
                      <div className="text-xs text-text-light mb-1">เจ้าบ้านชนะ</div>
                      <div className="text-lg font-bold">{prediction.percent.home}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-text-light mb-1">เสมอ</div>
                      <div className="text-lg font-bold">{prediction.percent.draw}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-text-light mb-1">ทีมเยือนชนะ</div>
                      <div className="text-lg font-bold">{prediction.percent.away}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-span-1">
                <div className="bg-bg-dark rounded-lg p-3 h-full">
                  <h4 className="text-sm font-semibold mb-2 text-center">คาดการณ์สกอร์</h4>
                  <div className="flex justify-center items-center text-xl font-bold mt-2">
                    <span>{prediction.goals.home}</span>
                    <span className="mx-2">-</span>
                    <span>{prediction.goals.away}</span>
                  </div>
                  <p className="text-center text-xs mt-3 text-text-light">
                    {prediction.under_over}
                  </p>
                </div>
              </div>
              
              <div className="col-span-1">
                <div className="bg-bg-dark rounded-lg p-3 h-full">
                  <h4 className="text-sm font-semibold mb-2 text-center">คำแนะนำ</h4>
                  <p className="text-center text-sm mt-2">
                    {prediction.advice}
                  </p>
                  <div className="text-center mt-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${prediction.win_or_draw ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {prediction.win_or_draw ? 'ทีมเต็งชนะหรือเสมอ' : 'ทีมรองชนะได้'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-text-light">ไม่มีข้อมูลการทำนายผลสำหรับการแข่งขันนี้</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedLiveMatchWithStats;
