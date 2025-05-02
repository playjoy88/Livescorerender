'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import MatchCard from '../../components/MatchCard';
import EnhancedLiveMatchWithStats from '../../components/EnhancedLiveMatchWithStats';
import StandingsWidget from '../../components/StandingsWidget';
import { getLiveFixtures, LEAGUE_IDS } from '../../services/api';

// Define the Match interface
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

// Define API response types
interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      elapsed: number | null;
    };
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
  goals: {
    home: number | null;
    away: number | null;
  };
  league: {
    id: number;
    name: string;
    logo: string;
    country: string;
    season?: string;
    round?: string;
  };
}

// Helper function to convert API response to Match format
const formatMatchFromAPI = (fixture: ApiFixture): Match => {
  const status = fixture.fixture.status.short === 'NS' ? 'UPCOMING' : 
                fixture.fixture.status.short === 'FT' ? 'FINISHED' : 'LIVE';
  
  return {
    id: fixture.fixture.id,
    status: status,
    homeTeam: {
      id: fixture.teams.home.id,
      name: fixture.teams.home.name,
      logo: fixture.teams.home.logo,
      goals: fixture.goals.home
    },
    awayTeam: {
      id: fixture.teams.away.id,
      name: fixture.teams.away.name,
      logo: fixture.teams.away.logo,
      goals: fixture.goals.away
    },
    startTime: fixture.fixture.date,
    league: {
      id: fixture.league.id,
      name: fixture.league.name,
      logo: fixture.league.logo,
      country: fixture.league.country
    },
    elapsed: fixture.fixture.status.elapsed || undefined
  };
};

export default function LiveScores() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filterLeague, setFilterLeague] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60); // seconds
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isConnectionError, setIsConnectionError] = useState<boolean>(false);

  // Fetch live matches from API
  useEffect(() => {
    const fetchLiveScores = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getLiveFixtures();
        setIsConnectionError(false);
        
        if (data && data.response) {
          // Safely map fixtures with error handling
          const formattedMatches = data.response
            .filter((fixture: ApiFixture) => {
              // Filter out invalid data
              if (!fixture || !fixture.fixture || !fixture.teams || !fixture.goals || !fixture.league) {
                console.warn('Skipping invalid fixture data:', fixture);
                return false;
              }
              return true;
            })
            .map((fixture: ApiFixture) => formatMatchFromAPI(fixture));
          
          setMatches(formattedMatches);
          setLastUpdated(new Date());
          
          // Clear any previous errors
          setError(null);
          setErrorDetails(null);
        } else {
          // If no matches are returned, set empty array
          setMatches([]);
          setLastUpdated(new Date());
          console.log('No live matches available at this time');
        }
      } catch (err) {
        console.error('Error fetching live matches:', err);
        setError('ไม่สามารถโหลดข้อมูลการแข่งขันสดได้ โปรดลองอีกครั้งในภายหลัง');
        setErrorDetails(err instanceof Error ? err.message : 'Unknown error');
        
        // Check if it's a connection error
        if (err instanceof Error && 
           (err.message.includes('network') || 
            err.message.includes('connection') || 
            err.message.includes('fetch'))) {
          setIsConnectionError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Initial fetch
    fetchLiveScores();
    
    // Set up polling interval
    const intervalId = setInterval(fetchLiveScores, refreshInterval * 1000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);
  
  // Group matches by league for better organization
  const matchesByLeague = useMemo(() => {
    // First filter by search query if present
    let filtered = matches;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = matches.filter(match => 
        match.homeTeam.name.toLowerCase().includes(query) || 
        match.awayTeam.name.toLowerCase().includes(query) ||
        match.league.name.toLowerCase().includes(query)
      );
    }
    
    // Then filter by selected league if not 'all'
    if (filterLeague !== 'all') {
      filtered = filtered.filter(match => match.league.id.toString() === filterLeague);
    }
    
    // Group by league
    const grouped: Record<string, Match[]> = {};
    filtered.forEach(match => {
      const leagueId = match.league.id.toString();
      if (!grouped[leagueId]) {
        grouped[leagueId] = [];
      }
      grouped[leagueId].push(match);
    });
    
    // Sort leagues by priority (Premier League first, then others)
    // Then sort matches by status (LIVE first, then UPCOMING, then FINISHED)
    const sortedGroups: Record<string, Match[]> = {};
    
    const priorityOrder = [
      LEAGUE_IDS.PREMIER_LEAGUE.toString(),
      LEAGUE_IDS.LA_LIGA.toString(),
      LEAGUE_IDS.SERIE_A.toString(),
      LEAGUE_IDS.BUNDESLIGA.toString(),
      LEAGUE_IDS.LIGUE_1.toString()
    ];
    
    // First add priority leagues in specified order
    priorityOrder.forEach(leagueId => {
      if (grouped[leagueId]) {
        sortedGroups[leagueId] = grouped[leagueId].sort((a, b) => {
          // First by status (LIVE first, then UPCOMING, then FINISHED)
          const statusOrder = {LIVE: 0, UPCOMING: 1, FINISHED: 2};
          const statusDiff = statusOrder[a.status] - statusOrder[b.status];
          if (statusDiff !== 0) return statusDiff;
          
          // Then by elapsed time (for LIVE matches)
          if (a.status === 'LIVE' && b.status === 'LIVE' && a.elapsed && b.elapsed) {
            return b.elapsed - a.elapsed; // Higher elapsed time first
          }
          
          // Then by start time
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });
      }
    });
    
    // Then add all other leagues
    Object.keys(grouped)
      .filter(leagueId => !priorityOrder.includes(leagueId))
      .forEach(leagueId => {
        sortedGroups[leagueId] = grouped[leagueId].sort((a, b) => {
          // Sort by status, then elapsed time, then start time
          const statusOrder = {LIVE: 0, UPCOMING: 1, FINISHED: 2};
          const statusDiff = statusOrder[a.status] - statusOrder[b.status];
          if (statusDiff !== 0) return statusDiff;
          
          if (a.status === 'LIVE' && b.status === 'LIVE' && a.elapsed && b.elapsed) {
            return b.elapsed - a.elapsed;
          }
          
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        });
      });
    
    return grouped;
  }, [matches, filterLeague, searchQuery]);
  
  // Get all leagues in current matches for the filter
  const availableLeagues = useMemo(() => {
    const leagues = new Map();
    matches.forEach(match => {
      if (!leagues.has(match.league.id)) {
        leagues.set(match.league.id, {
          id: match.league.id,
          name: match.league.name,
          logo: match.league.logo
        });
      }
    });
    return Array.from(leagues.values());
  }, [matches]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:space-x-6">
          <div className="flex-1">
        {/* Hero section */}
        <section className="bg-bg-light rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-prompt)' }}>
              ผลบอลสด
            </h1>
            <p className="text-text-light mb-4">
              อัพเดทผลบอลสดแบบเรียลไทม์จากลีกชั้นนำทั่วโลก
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-4">
              <div className="relative w-full md:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full md:w-64 pl-10 pr-3 py-2 border border-border-color rounded-lg"
                  placeholder="ค้นหาทีม หรือ ลีก..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-text-light whitespace-nowrap">รีเฟรชทุก:</span>
                <select 
                  className="bg-white border border-border-color rounded px-2 py-1"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                >
                  <option value="30">30 วินาที</option>
                  <option value="60">1 นาที</option>
                  <option value="120">2 นาที</option>
                  <option value="300">5 นาที</option>
                </select>
                <button 
                  className="bg-primary-color text-white px-3 py-1 rounded flex items-center"
                  onClick={() => setIsLoading(true)}
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isLoading ? 'กำลังโหลด...' : 'รีเฟรช'}
                </button>
              </div>
            </div>
            
            {lastUpdated && (
              <div className="text-xs text-text-light">
                อัพเดทล่าสุด: {lastUpdated.toLocaleTimeString('th-TH')}
              </div>
            )}
          </div>
        </section>
        
        {/* Filter by league */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center">
            <div className="mr-4 mb-2 text-text-light">กรองตามลีก:</div>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-1 rounded-full text-sm ${filterLeague === 'all' ? 'bg-primary-color text-white' : 'bg-bg-light text-text-light'}`}
                onClick={() => setFilterLeague('all')}
              >
                ทั้งหมด
              </button>
              
              {/* Dynamic league filter buttons based on available leagues */}
              {availableLeagues.map(league => (
                <button 
                  key={league.id}
                  className={`px-3 py-1 rounded-full text-sm flex items-center ${
                    filterLeague === league.id.toString() ? 'bg-primary-color text-white' : 'bg-bg-light text-text-light'
                  }`}
                  onClick={() => setFilterLeague(league.id.toString())}
                >
                  {league.logo && <img src={league.logo} alt={league.name} className="w-4 h-4 mr-1" />}
                  {league.name === 'Premier League' ? 'พรีเมียร์ลีก' : 
                   league.name === 'Serie A' ? 'เซเรีย อา' : 
                   league.name === 'Bundesliga' ? 'บุนเดสลีกา' : 
                   league.name === 'Ligue 1' ? 'ลีกเอิง' : 
                   league.name === 'La Liga' ? 'ลาลีกา' : 
                   league.name === 'Thai League' ? 'ไทยลีก' : 
                   league.name}
                </button>
              ))}
              
              {!availableLeagues.some(league => league.id === LEAGUE_IDS.PREMIER_LEAGUE) && (
                <button 
                  className={`px-3 py-1 rounded-full text-sm flex items-center bg-bg-light text-text-light opacity-60`}
                  onClick={() => setFilterLeague(LEAGUE_IDS.PREMIER_LEAGUE.toString())}
                >
                  <img src="https://media.api-sports.io/football/leagues/39.png" alt="Premier League" className="w-4 h-4 mr-1" />
                  พรีเมียร์ลีก
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Show error message if any */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                {errorDetails && (
                  <details className="mt-1">
                    <summary className="text-xs text-red-600 cursor-pointer">แสดงรายละเอียดข้อผิดพลาด</summary>
                    <p className="mt-1 text-xs font-mono bg-red-50 p-2 rounded">{errorDetails}</p>
                  </details>
                )}
                {isConnectionError && (
                  <div className="mt-2 text-xs">
                    <p>อาจเกิดจาก:</p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>การเชื่อมต่ออินเทอร์เน็ตขัดข้อง</li>
                      <li>เซิร์ฟเวอร์ API ไม่ตอบสนอง</li>
                      <li>มีการปิดกั้นการเข้าถึง API</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Matches list with loading state */}
        {isLoading ? (
          <div className="text-center p-10 bg-bg-light rounded-lg shadow">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-color"></div>
            <p className="mt-4 text-text-light">กำลังโหลดข้อมูลการแข่งขันสด...</p>
          </div>
        ) : Object.keys(matchesByLeague).length > 0 ? (
          <div className="space-y-8">
            {/* Live match counter */}
            <div className="flex items-center justify-between bg-bg-light p-3 rounded-lg mb-2">
              <div className="flex items-center">
                <span className="inline-block w-2 h-2 bg-live-color rounded-full mr-2 animate-pulse"></span>
                <span className="font-medium">แมตช์ที่กำลังถ่ายทอดสด</span>
              </div>
              <div className="text-sm text-text-light">
                {Object.values(matchesByLeague).flat().filter(match => match.status === 'LIVE').length} แมตช์
              </div>
            </div>
            
            {/* For each league, display matches */}
            {Object.entries(matchesByLeague).map(([leagueId, leagueMatches]) => {
              const league = leagueMatches[0].league;
              return (
                <div key={leagueId} className="mb-8">
                  {/* League header */}
                  <div className="flex items-center mb-4 bg-bg-light p-3 rounded-lg">
                    <img src={league.logo} alt={league.name} className="w-6 h-6 mr-2" />
                    <h2 className="font-bold">
                      {league.name === 'Premier League' ? 'พรีเมียร์ลีก' : 
                       league.name === 'Serie A' ? 'เซเรีย อา' : 
                       league.name === 'Bundesliga' ? 'บุนเดสลีกา' : 
                       league.name === 'Ligue 1' ? 'ลีกเอิง' : 
                       league.name === 'La Liga' ? 'ลาลีกา' : 
                       league.name === 'Thai League' ? 'ไทยลีก' : 
                       league.name}
                    </h2>
                    {league.country && (
                      <span className="text-text-light text-xs ml-2">({league.country})</span>
                    )}
                    <div className="ml-auto flex items-center">
                      <div className="flex mr-2">
                        <span className="bg-live-color text-white text-xs px-2 py-0.5 rounded-full mr-1">
                          {leagueMatches.filter(m => m.status === 'LIVE').length} สด
                        </span>
                        <span className="bg-upcoming-color text-white text-xs px-2 py-0.5 rounded-full">
                          {leagueMatches.filter(m => m.status === 'UPCOMING').length} กำลังจะมาถึง
                        </span>
                      </div>
                      <span className="text-sm text-text-light">
                        {leagueMatches.length} แมตช์
                      </span>
                    </div>
                  </div>
                  
                  {/* Matches for this league */}
                  <div className="grid grid-cols-1 gap-4">
                    {leagueMatches.map(match => (
                      match.status === 'LIVE' ? (
                        <EnhancedLiveMatchWithStats 
                          key={match.id}
                          match={match}
                        />
                      ) : (
                        <MatchCard 
                          key={match.id}
                          id={match.id}
                          status={match.status}
                          homeTeam={match.homeTeam}
                          awayTeam={match.awayTeam}
                          startTime={match.startTime}
                          league={match.league}
                          elapsed={match.elapsed}
                        />
                      )
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-10 bg-bg-light rounded-lg shadow">
            <div className="text-text-light text-lg mb-2">ไม่พบการแข่งขันที่กำลังถ่ายทอดสด</div>
            <p className="text-text-lighter">
              {searchQuery ? (
                <>ไม่พบการแข่งขันที่ตรงกับคำค้นหา &quot;{searchQuery}&quot;</>
              ) : (
                <>อาจจะเป็นเพราะตัวกรองที่คุณเลือก หรือไม่มีการแข่งขันที่กำลังถ่ายทอดสดในขณะนี้</>
              )}
            </p>
            
            {/* Display upcoming fixtures notice */}
            <div className="mt-6 bg-bg-light rounded-lg p-4 border-l-4 border-upcoming-color">
              <div className="flex items-start">
                <div className="flex-shrink-0 text-upcoming-color">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-700">ไม่พบการแข่งขันที่ถ่ายทอดสดในขณะนี้</h3>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>คุณสามารถดูตารางการแข่งขันที่กำลังจะมาถึงได้ที่หน้า &quot;ตารางแข่งขัน&quot;</p>
                    <Link href="/fixtures" className="inline-flex items-center mt-3 text-primary-color hover:underline">
                      ไปที่ตารางการแข่งขัน
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {searchQuery && (
                <button 
                  className="bg-secondary-color text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
                  onClick={() => setSearchQuery('')}
                >
                  ล้างการค้นหา
                </button>
              )}
              {filterLeague !== 'all' && (
                <button 
                  className="bg-primary-color text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
                  onClick={() => setFilterLeague('all')}
                >
                  แสดงทุกลีก
                </button>
              )}
            </div>
          </div>
        )}
        
          {/* Sponsors and ads section */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-prompt)' }}>
              สนับสนุนโดย
            </h2>
            <div className="ad-placeholder rounded-lg mb-6 mt-4">
              พื้นที่โฆษณา
            </div>
          </div>
          </div>
          
          {/* Sidebar with popular standings */}
          <div className="lg:w-80 mt-6 lg:mt-0 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-prompt)' }}>
                ตารางคะแนน
              </h2>
              
              {/* Popular league standings */}
              <div className="space-y-6">
                <StandingsWidget leagueId={LEAGUE_IDS.PREMIER_LEAGUE} limit={5} />
                <StandingsWidget leagueId={LEAGUE_IDS.LA_LIGA} limit={5} />
                <StandingsWidget leagueId={LEAGUE_IDS.SERIE_A} limit={5} />
                <StandingsWidget leagueId={LEAGUE_IDS.BUNDESLIGA} limit={5} />
              </div>
            </div>
            
            {/* News section link */}
            <div className="bg-bg-light rounded-lg shadow-md p-4">
              <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-prompt)' }}>
                ข่าวสารล่าสุด
              </h3>
              <p className="text-sm text-text-light mb-3">
                ติดตามข่าวสารล่าสุดในวงการฟุตบอล อัพเดททุกวัน
              </p>
              <Link 
                href="/news" 
                className="bg-primary-color text-white px-4 py-2 rounded inline-flex items-center text-sm"
              >
                อ่านข่าวล่าสุด
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
