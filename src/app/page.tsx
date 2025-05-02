'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import MatchCard from '../components/MatchCard';
import Banner from '../components/Banner';
import LeagueSection from '../components/LeagueSection';
import StandingsWidget from '../components/StandingsWidget';
import LiveMatchWithStats from '../components/LiveMatchWithStats';
import { getLiveFixtures, getFixturesByDate, LEAGUE_IDS } from '../services/api';

// Match interface for type safety
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

// API response fixture type
interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      elapsed: number | null;
    }
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
  };
}

// Define our top leagues
const mainLeagueIds = [
  LEAGUE_IDS.PREMIER_LEAGUE,
  LEAGUE_IDS.LA_LIGA, 
  LEAGUE_IDS.SERIE_A, 
  LEAGUE_IDS.BUNDESLIGA, 
  LEAGUE_IDS.LIGUE_1, 
  LEAGUE_IDS.CHAMPIONS_LEAGUE
];

// Thai translations for league names
const leagueTranslations: Record<number, string> = {
  [LEAGUE_IDS.PREMIER_LEAGUE]: 'พรีเมียร์ลีก',
  [LEAGUE_IDS.LA_LIGA]: 'ลาลีกา',
  [LEAGUE_IDS.SERIE_A]: 'เซเรีย อา',
  [LEAGUE_IDS.BUNDESLIGA]: 'บุนเดสลีกา',
  [LEAGUE_IDS.LIGUE_1]: 'ลีกเอิง',
  [LEAGUE_IDS.CHAMPIONS_LEAGUE]: 'แชมเปียนส์ลีก',
  [LEAGUE_IDS.THAI_LEAGUE]: 'ไทยลีก',
};

// Country translations
const countryTranslations: Record<string, string> = {
  'England': 'อังกฤษ',
  'Spain': 'สเปน',
  'Italy': 'อิตาลี',
  'Germany': 'เยอรมัน',
  'France': 'ฝรั่งเศส',
  'Thailand': 'ไทย',
  'World': 'โลก',
  'Europe': 'ยุโรป',
};

export default function Home() {
  // Group matches by league
  const [matchesByLeague, setMatchesByLeague] = useState<Record<number, Match[]>>({});
  const [pinnedMatches, setPinnedMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  
  // State for loading and error status
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // State for leagues data
  const [leagues, setLeagues] = useState<League[]>([]);
  
  // State for news data
  const [newsItems, setNewsItems] = useState<{id: number; title: string; content: string; date: string}[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  
  // Helper function to convert API response to our Match format
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
  
  // Fetch and load matches data
  const fetchMatchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Load matches based on active tab
      let fetchedMatches: Match[] = [];
      
      if (activeTab === 'live') {
        // Get live matches
        const liveData = await getLiveFixtures();
        if (liveData && liveData.response) {
          fetchedMatches = liveData.response.map((fixture: ApiFixture) => formatMatchFromAPI(fixture));
        }
      } else if (activeTab === 'upcoming' || activeTab === 'all') {
        // Get today's matches
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const fixturesData = await getFixturesByDate(today);
        if (fixturesData && fixturesData.response) {
          fetchedMatches = fixturesData.response.map((fixture: ApiFixture) => formatMatchFromAPI(fixture));
          
          // Filter only upcoming matches if needed
          if (activeTab === 'upcoming') {
            fetchedMatches = fetchedMatches.filter((match: Match) => match.status === 'UPCOMING');
          }
        }
      } else if (activeTab === 'finished') {
        // Get yesterday's matches (most likely to be finished)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const fixturesData = await getFixturesByDate(yesterdayStr);
        if (fixturesData && fixturesData.response) {
          fetchedMatches = fixturesData.response
            .map((fixture: ApiFixture) => formatMatchFromAPI(fixture))
            .filter((match: Match) => match.status === 'FINISHED');
        }
      }
      
      // If API didn't return matches or failed, log an error
      if (fetchedMatches.length === 0) {
        console.log('No matches from API');
      }
      
      // Load pinned matches from localStorage
      const pinnedIds = JSON.parse(localStorage.getItem('pinnedMatches') || '[]');
      const pinnedMatchesData = fetchedMatches.filter((match: Match) => pinnedIds.includes(match.id));
      setPinnedMatches(pinnedMatchesData);
      
      // Group matches by league
      const groupedMatches: Record<number, Match[]> = {};
      fetchedMatches.forEach((match: Match) => {
        const leagueId = match.league.id;
        if (!groupedMatches[leagueId]) {
          groupedMatches[leagueId] = [];
        }
        groupedMatches[leagueId].push(match);
      });
      
      setMatchesByLeague(groupedMatches);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setErrorMessage('Failed to load match data. Please try again later.');
      setIsLoading(false);
      
      // Just set empty match data on error
      console.log('API error, could not fetch matches');
      setPinnedMatches([]);
      setMatchesByLeague({});
    }
  }, [activeTab]);
  
  // Load matches when tab changes
  useEffect(() => {
    fetchMatchData();
  }, [activeTab, fetchMatchData]);
  
  // Fetch news data
  const fetchNewsData = async () => {
    setIsNewsLoading(true);
    
    try {
      // In a real implementation, this would be an API call to your news endpoint
      // For now, we'll simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockNewsData = [
        {
          id: 1,
          title: 'ข่าวฟุตบอลล่าสุดจากทั่วโลก',
          content: 'ติดตามข่าวสารความเคลื่อนไหววงการฟุตบอล การซื้อขายนักเตะ และความคืบหน้าล่าสุดจากสโมสรชั้นนำ',
          date: new Date().toISOString()
        },
        {
          id: 2,
          title: 'ตารางคะแนนล่าสุดจากลีกชั้นนำ',
          content: 'อัพเดทตารางคะแนนล่าสุดจากลีกชั้นนำทั่วโลก พร้อมวิเคราะห์โอกาสในการคว้าแชมป์ของทีมต่างๆ',
          date: new Date().toISOString()
        },
        {
          id: 3,
          title: 'วิเคราะห์ฟอร์มการเล่นของทีมชั้นนำ',
          content: 'ผู้เชี่ยวชาญวิเคราะห์ฟอร์มการเล่นของทีมชั้นนำในยุโรป พร้อมคาดการณ์ผลการแข่งขันที่กำลังจะมาถึง',
          date: new Date().toISOString()
        }
      ];
      
      setNewsItems(mockNewsData);
      setIsNewsLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      setIsNewsLoading(false);
      // Set empty news on error
      setNewsItems([]);
    }
  };
  
  // Load news data on component mount
  useEffect(() => {
    fetchNewsData();
  }, []);
  
  // Display a loading indicator or error message
  const renderLoadingOrError = () => {
    if (isLoading) {
      return (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-color"></div>
          <p className="mt-2 text-text-light">กำลังโหลดข้อมูลการแข่งขัน...</p>
        </div>
      );
    }
    
    if (errorMessage) {
      return (
        <div className="text-center py-10 text-red-500">
          <p>{errorMessage}</p>
          <button 
            className="mt-4 bg-primary-color text-white px-4 py-2 rounded"
            onClick={() => fetchMatchData()}
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      );
    }
    
    return null;
  };
  
  // Extract leagues from matches
  useEffect(() => {
    if (!isLoading && Object.keys(matchesByLeague).length > 0) {
      const leaguesFromMatches: League[] = [];
      const processedLeagueIds = new Set();
      
      // Extract leagues from matches
      Object.values(matchesByLeague).forEach(matches => {
        if (matches.length > 0) {
          const match = matches[0];
          const leagueId = match.league.id;
          
          // Skip if we've already processed this league
          if (processedLeagueIds.has(leagueId)) return;
          processedLeagueIds.add(leagueId);
          
          // Use Thai translation for the league name if available
          const translatedName = leagueTranslations[leagueId] || match.league.name;
          
          // Use Thai translation for the country if available
          const country = match.league.country;
          const translatedCountry = country ? (countryTranslations[country] || country) : undefined;
          
          leaguesFromMatches.push({
            id: leagueId,
            name: translatedName,
            logo: match.league.logo,
            country: translatedCountry
          });
        }
      });
      
      setLeagues(leaguesFromMatches);
    }
  }, [matchesByLeague, isLoading]);
  
  // State for showing all leagues vs main leagues only
  const [showAllLeagues, setShowAllLeagues] = useState(false);
  
  // Prepare leagues in order of importance
  const orderedLeagues = [...leagues].sort((a, b) => {
    // Priority order based on mainLeagueIds
    const leaguePriority: Record<number, number> = {};
    mainLeagueIds.forEach((id, index) => {
      leaguePriority[id] = index + 1;
    });
    
    const priorityA = leaguePriority[a.id] || 999;
    const priorityB = leaguePriority[b.id] || 999;
    
    return priorityA - priorityB;
  });
  
  // Filter leagues based on showAllLeagues state
  const displayedLeagues = showAllLeagues 
    ? orderedLeagues 
    : orderedLeagues.filter(league => mainLeagueIds.includes(league.id));
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Hero banner */}
        <Banner position="hero" size="large" />
        
        {/* Pinned matches section */}
        {pinnedMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-prompt)' }}>
              การแข่งขันที่ปักหมุด
            </h2>
            <div className="space-y-2">
              {pinnedMatches.map(match => (
                <MatchCard 
                  key={`pinned-${match.id}`}
                  id={match.id}
                  status={match.status}
                  homeTeam={match.homeTeam}
                  awayTeam={match.awayTeam}
                  startTime={match.startTime}
                  league={match.league}
                  elapsed={match.elapsed}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Match filters */}
        <div className="flex flex-wrap mb-6 border-b border-border-color">
          <button 
            className={`px-4 py-2 mr-2 ${activeTab === 'all' ? 'text-primary-color border-b-2 border-primary-color font-medium' : 'text-text-light'}`}
            onClick={() => setActiveTab('all')}
          >
            ทั้งหมด
          </button>
          <button 
            className={`px-4 py-2 mr-2 ${activeTab === 'live' ? 'text-live-color border-b-2 border-live-color font-medium' : 'text-text-light'}`}
            onClick={() => setActiveTab('live')}
          >
            <span className="flex items-center">
              <span className="w-2 h-2 bg-live-color rounded-full mr-2 animate-pulse"></span>
              กำลังแข่งขัน
            </span>
          </button>
          <button 
            className={`px-4 py-2 mr-2 ${activeTab === 'upcoming' ? 'text-upcoming-color border-b-2 border-upcoming-color font-medium' : 'text-text-light'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            กำลังจะแข่ง
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'finished' ? 'text-finished-color border-b-2 border-finished-color font-medium' : 'text-text-light'}`}
            onClick={() => setActiveTab('finished')}
          >
            จบการแข่งขัน
          </button>
        </div>
        
        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left/Main column - leagues and matches */}
          <div className="md:col-span-2">
            {/* In-feed banner at top */}
            <Banner position="in-feed" size="medium" />
            
            {/* Loading/Error States */}
            {renderLoadingOrError()}
            
            {/* Content when loaded */}
            {!isLoading && !errorMessage && (
              <>
                {/* League toggle */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">ลีกการแข่งขัน</h2>
                  <button 
                    className="text-primary-color text-sm font-medium hover:underline flex items-center"
                    onClick={() => setShowAllLeagues(!showAllLeagues)}
                  >
                    {showAllLeagues ? 'แสดงลีกหลัก' : 'แสดงทุกลีก'}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 ml-1" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      {showAllLeagues ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      )}
                    </svg>
                  </button>
                </div>
                
                {/* Live matches with stats section - only shown when on live tab */}
                {activeTab === 'live' && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold mb-4">การแข่งขันสด</h2>
                    <div className="space-y-4">
                      {Object.values(matchesByLeague).flat().filter(match => match.status === 'LIVE').map(match => (
                        <LiveMatchWithStats key={`live-detailed-${match.id}`} match={match} />
                      ))}
                      {Object.values(matchesByLeague).flat().filter(match => match.status === 'LIVE').length === 0 && (
                        <div className="text-center p-6 bg-bg-light rounded-lg">
                          <div className="text-text-light text-lg mb-2">ไม่มีการแข่งขันที่กำลังถ่ายทอดสดในขณะนี้</div>
                          <p className="text-text-lighter">
                            โปรดกลับมาใหม่ภายหลัง หรือดูการแข่งขันที่กำลังจะมาถึง
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Render each league section (skip when on live tab as live matches are shown above) */}
                {activeTab !== 'live' && displayedLeagues.map(league => {
                  const matches = matchesByLeague[league.id] || [];
                  if (matches.length === 0 && activeTab !== 'all') return null;
                  
                  return (
                    <LeagueSection 
                      key={league.id}
                      league={league}
                      matches={matches}
                      isExpanded={league.id === 39} // Premier League expanded by default
                      initialVisibleCount={5} // Show 5 matches by default
                    />
                  );
                })}
                
                {/* No matches message */}
                {Object.keys(matchesByLeague).length === 0 && (
                  <div className="text-center p-10 bg-bg-light rounded-lg">
                    <div className="text-text-light text-lg mb-2">ไม่พบการแข่งขันที่ตรงกับเงื่อนไข</div>
                    <p className="text-text-lighter">
                      ลองเปลี่ยนตัวกรองหรือกลับมาใหม่ภายหลัง
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Right sidebar */}
          <div className="md:col-span-1">
            {/* Sidebar Banners - Added multiple as requested */}
            <Banner position="sidebar" size="large" />
            <div className="mb-4"></div>
            <Banner position="sidebar" size="medium" />
            <div className="mb-4"></div>
            <Banner position="sidebar" size="small" />
            <div className="mb-4"></div>
            <Banner position="sidebar" size="medium" />
            
            {/* League standings widgets */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-prompt)' }}>
                ตารางคะแนนยอดนิยม
              </h2>
              
              <div className="space-y-6">
                <StandingsWidget leagueId={LEAGUE_IDS.PREMIER_LEAGUE} limit={3} />
                <StandingsWidget leagueId={LEAGUE_IDS.LA_LIGA} limit={3} />
                <StandingsWidget leagueId={LEAGUE_IDS.SERIE_A} limit={3} />
              </div>
            </div>
            
            {/* News section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-prompt)' }}>
                ข่าวสารล่าสุด
              </h2>
              
              {/* Using state to manage news data */}
              {isNewsLoading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-color"></div>
                </div>
              ) : newsItems.length === 0 ? (
                <div className="text-center py-4 text-text-light">
                  <p>ไม่พบข่าวในขณะนี้ โปรดลองใหม่ภายหลัง</p>
                </div>
              ) : (
                <>
                  {/* News items dynamically loaded from API */}
                  {newsItems.slice(0, 2).map(news => (
                    <a href={`/news/${news.id}`} className="block" key={news.id}>
                      <div className="card p-4 mb-3 hover:border-primary-color transition-all cursor-pointer">
                        <h3 className="font-bold mb-2">{news.title}</h3>
                        <p className="text-text-light text-sm mb-2 line-clamp-2">
                          {news.content}
                        </p>
                        <div className="text-xs text-text-lighter">
                          {new Date(news.date).toLocaleDateString('th-TH')} • 
                          {new Date(news.date).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </a>
                  ))}
                  
                  <div className="text-center mt-4">
                    <a href="/news" className="text-primary-color hover:text-secondary-color font-medium">
                      ดูข่าวทั้งหมด ({newsItems.length}) →
                    </a>
                  </div>
                </>
              )}
            </div>
            
            {/* Second sidebar banner */}
            <Banner position="sidebar" size="medium" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
