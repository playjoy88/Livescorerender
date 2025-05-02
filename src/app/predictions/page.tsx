'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Layout from '../../components/Layout';
import { getFixturesByDate, LEAGUE_IDS } from '../../services/api';

// Interface for match data
interface Team {
  id: number;
  name: string;
  logo: string;
}

interface League {
  id: number;
  name: string;
  logo: string;
  country?: string;
}

interface Match {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  startTime: string;
  league: League;
  venue?: string;
}

// Interface for prediction
interface Prediction {
  matchId: number;
  homeScore: number | null;
  awayScore: number | null;
  winnerPrediction: 'home' | 'away' | 'draw' | null;
  confidence: number;
}

// Interface for API fixture
interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    venue?: {
      name?: string;
      city?: string;
    };
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
    };
    away: {
      id: number;
      name: string;
      logo: string;
    };
  };
  league: {
    id: number;
    name: string;
    logo: string;
    country: string;
  };
}

export default function PredictionsPage() {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<number, Prediction>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<number | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  
  // Format date to Thai format (short)
  const formatDateToThai = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      weekday: 'short'
    });
  };
  
  // Format date to Thai format (long)
  const formatDateToThaiLong = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    });
  };
  
  // Format time from date string
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Helper function to generate dates for the date picker
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    // Include dates from today to 7 days in the future
    for (let i = 0; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: formatDateToThai(date)
      });
    }
    
    return dates;
  };
  
  // Format fixtures from API response
  const formatFixtures = (apiFixtures: ApiFixture[]): Match[] => {
    return apiFixtures
      .filter(fixture => {
        // Filter only upcoming matches (future dates)
        const matchDate = new Date(fixture.fixture.date);
        const now = new Date();
        return matchDate > now;
      })
      .map(fixture => ({
        id: fixture.fixture.id,
        homeTeam: {
          id: fixture.teams.home.id,
          name: fixture.teams.home.name,
          logo: fixture.teams.home.logo
        },
        awayTeam: {
          id: fixture.teams.away.id,
          name: fixture.teams.away.name,
          logo: fixture.teams.away.logo
        },
        startTime: fixture.fixture.date,
        league: {
          id: fixture.league.id,
          name: fixture.league.name,
          logo: fixture.league.logo,
          country: fixture.league.country
        },
        venue: fixture.fixture.venue?.name
      }));
  };
  
  // Fetch fixtures for the selected date
  useEffect(() => {
    const fetchUpcomingMatches = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getFixturesByDate(selectedDate);
        
        if (data?.response) {
          const formattedFixtures = formatFixtures(data.response);
          setUpcomingMatches(formattedFixtures);
          
          // Initialize predictions for new matches
          const initializedPredictions = { ...predictions };
          formattedFixtures.forEach(match => {
            if (!initializedPredictions[match.id]) {
              initializedPredictions[match.id] = {
                matchId: match.id,
                homeScore: null,
                awayScore: null,
                winnerPrediction: null,
                confidence: 50
              };
            }
          });
          setPredictions(initializedPredictions);
        } else {
          setUpcomingMatches([]);
          setError('ไม่พบข้อมูลการแข่งขันในวันที่เลือก');
        }
      } catch (err) {
        console.error('Error fetching fixtures:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล โปรดลองอีกครั้ง');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUpcomingMatches();
  }, [selectedDate, predictions]);
  
  // Update prediction scores
  const handleScoreChange = (matchId: number, team: 'home' | 'away', value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    
    setPredictions(prev => {
      const prediction = prev[matchId] || {
        matchId,
        homeScore: null,
        awayScore: null,
        winnerPrediction: null,
        confidence: 50
      };
      
      const updated = {
        ...prediction,
        [team === 'home' ? 'homeScore' : 'awayScore']: numValue
      };
      
      // Auto-update winner prediction based on scores
      if (updated.homeScore !== null && updated.awayScore !== null) {
        if (updated.homeScore > updated.awayScore) {
          updated.winnerPrediction = 'home';
        } else if (updated.homeScore < updated.awayScore) {
          updated.winnerPrediction = 'away';
        } else {
          updated.winnerPrediction = 'draw';
        }
      }
      
      return { ...prev, [matchId]: updated };
    });
  };
  
  // Update winner prediction directly
  const handleWinnerChange = (matchId: number, winner: 'home' | 'away' | 'draw') => {
    setPredictions(prev => {
      const prediction = prev[matchId] || {
        matchId,
        homeScore: null,
        awayScore: null,
        winnerPrediction: null,
        confidence: 50
      };
      
      return {
        ...prev,
        [matchId]: {
          ...prediction,
          winnerPrediction: winner
        }
      };
    });
  };
  
  // Update confidence level
  const handleConfidenceChange = (matchId: number, value: number) => {
    setPredictions(prev => {
      const prediction = prev[matchId] || {
        matchId,
        homeScore: null,
        awayScore: null,
        winnerPrediction: null,
        confidence: 50
      };
      
      return {
        ...prev,
        [matchId]: {
          ...prediction,
          confidence: value
        }
      };
    });
  };
  
  // Handle save predictions
  const savePredictions = () => {
    // In a real app, this would send the predictions to a server
    // For now, just save to localStorage
    localStorage.setItem('userPredictions', JSON.stringify(predictions));
    alert('บันทึกการทำนายเรียบร้อยแล้ว!');
  };
  
  // Load saved predictions on initial load
  useEffect(() => {
    const savedPredictions = localStorage.getItem('userPredictions');
    if (savedPredictions) {
      setPredictions(JSON.parse(savedPredictions));
    }
  }, [/* Empty dependency array is intentional - we only want to load predictions once */]);
  
  // Filter matches by league
  const filteredMatches = selectedLeague === 'all'
    ? upcomingMatches
    : upcomingMatches.filter(match => match.league.id === selectedLeague);
  
  // Date options for the date picker
  const dateOptions = generateDateOptions();
  
  // Available leagues
  const availableLeagues = [...new Set(upcomingMatches.map(match => match.league.id))]
    .map(id => {
      const match = upcomingMatches.find(match => match.league.id === id);
      return {
        id,
        name: match?.league.name || '',
        logo: match?.league.logo || '',
      };
    })
    .sort((a, b) => {
      // Thai League first, then popular leagues
      if (a.id === LEAGUE_IDS.THAI_LEAGUE) return -1;
      if (b.id === LEAGUE_IDS.THAI_LEAGUE) return 1;
      if (a.id === LEAGUE_IDS.PREMIER_LEAGUE) return -1;
      if (b.id === LEAGUE_IDS.PREMIER_LEAGUE) return 1;
      return 0;
    });
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>
            ทำนายผลบอล
          </h1>
          <p className="text-text-light mt-2">
            เลือกทำนายผลการแข่งขันฟุตบอลที่จะเกิดขึ้นในอนาคต
          </p>
        </div>
        
        {/* Date selection */}
        <div className="mb-6 bg-bg-light rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3">เลือกวันที่</h2>
          <div className="flex overflow-x-auto pb-2 space-x-2">
            {dateOptions.map(date => (
              <button
                key={date.value}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  selectedDate === date.value
                    ? 'bg-primary-color text-white'
                    : 'bg-white border hover:border-primary-color'
                }`}
                onClick={() => setSelectedDate(date.value)}
              >
                {date.label}
              </button>
            ))}
          </div>
          <div className="mt-2 text-text-light text-sm">
            วันที่เลือก: {formatDateToThaiLong(new Date(selectedDate))}
          </div>
        </div>
        
        {/* League filter dropdown */}
        <div className="mb-6 bg-bg-light rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3">กรองตามลีก</h2>
          <div className="relative">
            <select
              value={selectedLeague === 'all' ? 'all' : selectedLeague.toString()}
              onChange={(e) => setSelectedLeague(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="appearance-none block w-full px-4 py-3 bg-white border border-border-color rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-primary-color"
            >
              <option value="all">ทั้งหมด ({upcomingMatches.length} แมตช์)</option>
              {availableLeagues.map(league => (
                <option key={league.id} value={league.id.toString()}>
                  {league.name} ({upcomingMatches.filter(m => m.league.id === league.id).length} แมตช์)
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          
          {/* Selected league info */}
          {selectedLeague !== 'all' && (
            <div className="mt-3 flex items-center p-2 bg-gray-100 rounded">
              {availableLeagues.find(l => l.id === selectedLeague) && (
                <>
                  <Image 
                    src={availableLeagues.find(l => l.id === selectedLeague)?.logo || ''} 
                    alt={availableLeagues.find(l => l.id === selectedLeague)?.name || ''}
                    width={24}
                    height={24}
                    className="w-6 h-6 mr-2"
                  />
                  <span className="font-medium">{availableLeagues.find(l => l.id === selectedLeague)?.name}</span>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Predictions content */}
        <div className="mb-6">
          {isLoading ? (
            <div className="bg-bg-light rounded-lg shadow-md p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-color"></div>
              <p className="mt-4 text-text-light">กำลังโหลดข้อมูลการแข่งขัน...</p>
            </div>
          ) : error ? (
            <div className="bg-bg-light rounded-lg shadow-md p-10 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                className="bg-primary-color text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
                onClick={() => setSelectedDate(selectedDate)}
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="bg-bg-light rounded-lg shadow-md p-10 text-center">
              <p className="text-text-light">ไม่พบการแข่งขันในวันที่เลือก</p>
              <p className="text-text-lighter mt-2">ลองเลือกวันที่อื่น หรือลีกอื่น</p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-4">การแข่งขันที่จะเกิดขึ้น</h2>
              
              <div className="space-y-6">
                {filteredMatches.map(match => {
                  const prediction = predictions[match.id] || {
                    matchId: match.id,
                    homeScore: null,
                    awayScore: null,
                    winnerPrediction: null,
                    confidence: 50
                  };
                  
                  return (
                    <div key={match.id} className="bg-bg-light rounded-lg shadow-md overflow-hidden">
                      {/* Match header */}
                      <div className="p-4 bg-gray-50 border-b border-border-color">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Image src={match.league.logo} alt={match.league.name} width={24} height={24} className="w-6 h-6 mr-2" />
                            <span className="font-medium">{match.league.name}</span>
                            <span className="text-text-light text-sm ml-2">({match.league.country})</span>
                          </div>
                          <div className="text-text-light text-sm">
                            {formatDateToThai(new Date(match.startTime))} • {formatTime(match.startTime)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Match content */}
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row items-center">
                          {/* Home team */}
                          <div className="w-full md:w-2/5 flex flex-col items-center">
                            <Image 
                              src={match.homeTeam.logo} 
                              alt={match.homeTeam.name} 
                              width={64}
                              height={64}
                              className="w-16 h-16 mb-2"
                            />
                            <span className="font-bold text-center">{match.homeTeam.name}</span>
                            
                            {/* Home score input */}
                            <div className="mt-4">
                              <input
                                type="number"
                                min="0"
                                max="99"
                                value={prediction.homeScore === null ? '' : prediction.homeScore}
                                onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                                className="w-16 h-12 text-center text-2xl font-bold border border-border-color rounded-lg"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          
                          {/* VS */}
                          <div className="w-full md:w-1/5 my-4 md:my-0 flex flex-col items-center">
                            <div className="text-2xl font-bold text-text-light">VS</div>
                            <div className="mt-2 flex space-x-2">
                              <button
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  prediction.winnerPrediction === 'home'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-text-light'
                                }`}
                                onClick={() => handleWinnerChange(match.id, 'home')}
                                title="ทีมเจ้าบ้านชนะ"
                              >
                                1
                              </button>
                              <button
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  prediction.winnerPrediction === 'draw'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-gray-100 text-text-light'
                                }`}
                                onClick={() => handleWinnerChange(match.id, 'draw')}
                                title="เสมอ"
                              >
                                X
                              </button>
                              <button
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  prediction.winnerPrediction === 'away'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-text-light'
                                }`}
                                onClick={() => handleWinnerChange(match.id, 'away')}
                                title="ทีมเยือนชนะ"
                              >
                                2
                              </button>
                            </div>
                          </div>
                          
                          {/* Away team */}
                          <div className="w-full md:w-2/5 flex flex-col items-center">
                            <Image 
                              src={match.awayTeam.logo} 
                              alt={match.awayTeam.name} 
                              width={64}
                              height={64}
                              className="w-16 h-16 mb-2"
                            />
                            <span className="font-bold text-center">{match.awayTeam.name}</span>
                            
                            {/* Away score input */}
                            <div className="mt-4">
                              <input
                                type="number"
                                min="0"
                                max="99"
                                value={prediction.awayScore === null ? '' : prediction.awayScore}
                                onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                                className="w-16 h-12 text-center text-2xl font-bold border border-border-color rounded-lg"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Confidence slider */}
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-text-light mb-2">
                            ระดับความมั่นใจ: {prediction.confidence}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={prediction.confidence}
                            onChange={(e) => handleConfidenceChange(match.id, parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-text-light mt-1">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Save button */}
              <div className="mt-8 text-center">
                <button
                  onClick={savePredictions}
                  className="bg-primary-color text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition"
                >
                  บันทึกการทำนาย
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
