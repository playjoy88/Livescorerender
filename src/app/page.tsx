'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import MatchCard from '../components/MatchCard';
import Banner from '../components/Banner';
import LeagueSection from '../components/LeagueSection';

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

// Sample league and match data for demonstration
const leagues = [
  {
    id: 290,
    name: 'ไทยลีก',
    logo: 'https://media.api-sports.io/football/leagues/290.png',
    country: 'ไทย'
  },
  {
    id: 39,
    name: 'พรีเมียร์ลีก',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    country: 'อังกฤษ'
  },
  {
    id: 140,
    name: 'ลาลีกา',
    logo: 'https://media.api-sports.io/football/leagues/140.png',
    country: 'สเปน'
  },
  {
    id: 78,
    name: 'บุนเดสลีกา',
    logo: 'https://media.api-sports.io/football/leagues/78.png',
    country: 'เยอรมัน'
  },
  {
    id: 135,
    name: 'เซเรีย อา',
    logo: 'https://media.api-sports.io/football/leagues/135.png',
    country: 'อิตาลี'
  },
  {
    id: 61,
    name: 'ลีกเอิง',
    logo: 'https://media.api-sports.io/football/leagues/61.png',
    country: 'ฝรั่งเศส'
  },
  {
    id: 2,
    name: 'แชมเปียนส์ลีก',
    logo: 'https://media.api-sports.io/football/leagues/2.png',
    country: 'ยุโรป'
  }
];

// Sample match data for demonstration - abbreviated for brevity
const sampleMatches = [
  // Thai League matches
  {
    id: 1,
    status: 'LIVE',
    homeTeam: {
      id: 101,
      name: 'เมืองทอง ยูไนเต็ด',
      logo: 'https://media.api-sports.io/football/teams/2420.png',
      goals: 2
    },
    awayTeam: {
      id: 102,
      name: 'บุรีรัมย์ ยูไนเต็ด',
      logo: 'https://media.api-sports.io/football/teams/2418.png',
      goals: 1
    },
    startTime: '2025-04-30T12:00:00Z',
    league: {
      id: 290,
      name: 'ไทยลีก',
      logo: 'https://media.api-sports.io/football/leagues/290.png',
      country: 'ไทย'
    },
    elapsed: 67
  },
  {
    id: 10,
    status: 'UPCOMING',
    homeTeam: {
      id: 115,
      name: 'ทรู แบงค็อก ยูไนเต็ด',
      logo: 'https://media.api-sports.io/football/teams/2417.png',
      goals: null
    },
    awayTeam: {
      id: 116,
      name: 'ชลบุรี เอฟซี',
      logo: 'https://media.api-sports.io/football/teams/2421.png',
      goals: null
    },
    startTime: '2025-05-05T12:00:00Z',
    league: {
      id: 290,
      name: 'ไทยลีก',
      logo: 'https://media.api-sports.io/football/leagues/290.png',
      country: 'ไทย'
    }
  },
  // Premier League matches
  {
    id: 2,
    status: 'UPCOMING',
    homeTeam: {
      id: 103,
      name: 'ลิเวอร์พูล',
      logo: 'https://media.api-sports.io/football/teams/40.png',
      goals: null
    },
    awayTeam: {
      id: 104,
      name: 'แมนเชสเตอร์ ซิตี้',
      logo: 'https://media.api-sports.io/football/teams/50.png',
      goals: null
    },
    startTime: '2025-05-03T14:00:00Z',
    league: {
      id: 39,
      name: 'พรีเมียร์ลีก',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      country: 'อังกฤษ'
    }
  },
  // La Liga matches
  {
    id: 3,
    status: 'FINISHED',
    homeTeam: {
      id: 105,
      name: 'บาร์เซโลน่า',
      logo: 'https://media.api-sports.io/football/teams/529.png',
      goals: 3
    },
    awayTeam: {
      id: 106,
      name: 'เรอัล มาดริด',
      logo: 'https://media.api-sports.io/football/teams/541.png',
      goals: 2
    },
    startTime: '2025-04-29T19:00:00Z',
    league: {
      id: 140,
      name: 'ลาลีกา',
      logo: 'https://media.api-sports.io/football/leagues/140.png',
      country: 'สเปน'
    }
  },
  // Bundesliga matches
  {
    id: 4,
    status: 'LIVE',
    homeTeam: {
      id: 107,
      name: 'บาเยิร์น มิวนิค',
      logo: 'https://media.api-sports.io/football/teams/157.png',
      goals: 0
    },
    awayTeam: {
      id: 108,
      name: 'ดอร์ทมุนด์',
      logo: 'https://media.api-sports.io/football/teams/165.png',
      goals: 0
    },
    startTime: '2025-05-01T11:30:00Z',
    league: {
      id: 78,
      name: 'บุนเดสลีกา',
      logo: 'https://media.api-sports.io/football/leagues/78.png',
      country: 'เยอรมัน'
    },
    elapsed: 12
  },
  // Serie A matches
  {
    id: 5,
    status: 'UPCOMING',
    homeTeam: {
      id: 109,
      name: 'อินเตอร์ มิลาน',
      logo: 'https://media.api-sports.io/football/teams/505.png',
      goals: null
    },
    awayTeam: {
      id: 110,
      name: 'ยูเวนตุส',
      logo: 'https://media.api-sports.io/football/teams/496.png',
      goals: null
    },
    startTime: '2025-05-05T18:45:00Z',
    league: {
      id: 135,
      name: 'เซเรีย อา',
      logo: 'https://media.api-sports.io/football/leagues/135.png',
      country: 'อิตาลี'
    }
  }
];

export default function Home() {
  // Group matches by league
  const [matchesByLeague, setMatchesByLeague] = useState<Record<number, Match[]>>({});
  const [pinnedMatches, setPinnedMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  
  // TypeScript typecast for sample data
  const typedMatches = sampleMatches as unknown as Match[];
  
  // Load pinned matches and group matches by league
  useEffect(() => {
    try {
      // Load pinned matches from localStorage
      const pinnedIds = JSON.parse(localStorage.getItem('pinnedMatches') || '[]');
      const pinnedMatchesData = typedMatches.filter(match => pinnedIds.includes(match.id));
      setPinnedMatches(pinnedMatchesData);
      
      // Group matches by league
      const groupedMatches: Record<number, Match[]> = {};
      
      // Group matches based on active tab
      let filteredMatches = typedMatches;
      if (activeTab === 'live') {
        filteredMatches = typedMatches.filter(match => match.status === 'LIVE');
      } else if (activeTab === 'upcoming') {
        filteredMatches = typedMatches.filter(match => match.status === 'UPCOMING');
      } else if (activeTab === 'finished') {
        filteredMatches = typedMatches.filter(match => match.status === 'FINISHED');
      }
      
      // Group by league
      filteredMatches.forEach(match => {
        const leagueId = match.league.id;
        if (!groupedMatches[leagueId]) {
          groupedMatches[leagueId] = [];
        }
        groupedMatches[leagueId].push(match);
      });
      
      setMatchesByLeague(groupedMatches);
    } catch (error) {
      console.error('Error organizing matches:', error);
    }
  }, [activeTab]);
  
  // State for showing all leagues vs main leagues only
  const [showAllLeagues, setShowAllLeagues] = useState(false);
  
  // Prepare leagues in order of importance (Thai League first, then others)
  const orderedLeagues = leagues.sort((a, b) => {
    // Thai League first
    if (a.id === 290) return -1;
    if (b.id === 290) return 1;
    
    // For remaining leagues, sort by id to ensure predictable order
    return a.id - b.id;
  });
  
  // The 7 main leagues to display by default
  const mainLeagueIds = [290, 39, 140, 78, 135, 61, 2];
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
            
            {/* Render each league section */}
            {displayedLeagues.map(league => {
              const matches = matchesByLeague[league.id] || [];
              if (matches.length === 0 && activeTab !== 'all') return null;
              
              return (
                <LeagueSection 
                  key={league.id}
                  league={league}
                  matches={matches}
                  isExpanded={league.id === 290} // Thai League expanded by default
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
            
            {/* League standings widget */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-prompt)' }}>
                ตารางคะแนนยอดนิยม
              </h2>
              
              <div className="card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <img 
                      src="https://media.api-sports.io/football/leagues/39.png" 
                      alt="Premier League"
                      className="w-6 h-6 mr-2" 
                    />
                    <span className="font-medium">พรีเมียร์ลีก</span>
                  </div>
                  <a href="/standings/premier-league" className="text-primary-color text-sm hover:underline">
                    ดูเพิ่มเติม
                  </a>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border-color">
                        <th className="text-left p-2">#</th>
                        <th className="text-left p-2">ทีม</th>
                        <th className="text-center p-2">แข่ง</th>
                        <th className="text-center p-2">คะแนน</th>
                      </tr>
                    </thead>
                    <tbody className="text-text-light">
                      <tr className="border-b border-border-color hover:bg-gray-50">
                        <td className="p-2">1</td>
                        <td className="p-2 flex items-center">
                          <img src="https://media.api-sports.io/football/teams/50.png" alt="Man City" className="w-4 h-4 mr-2" />
                          <span>แมนฯ ซิตี้</span>
                        </td>
                        <td className="text-center p-2">33</td>
                        <td className="text-center p-2 font-bold">79</td>
                      </tr>
                      <tr className="border-b border-border-color hover:bg-gray-50">
                        <td className="p-2">2</td>
                        <td className="p-2 flex items-center">
                          <img src="https://media.api-sports.io/football/teams/40.png" alt="Liverpool" className="w-4 h-4 mr-2" />
                          <span>ลิเวอร์พูล</span>
                        </td>
                        <td className="text-center p-2">33</td>
                        <td className="text-center p-2 font-bold">75</td>
                      </tr>
                      <tr className="border-b border-border-color hover:bg-gray-50">
                        <td className="p-2">3</td>
                        <td className="p-2 flex items-center">
                          <img src="https://media.api-sports.io/football/teams/42.png" alt="Arsenal" className="w-4 h-4 mr-2" />
                          <span>อาร์เซนอล</span>
                        </td>
                        <td className="text-center p-2">33</td>
                        <td className="text-center p-2 font-bold">71</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* News section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-prompt)' }}>
                ข่าวสารล่าสุด
              </h2>
              
              <div className="card p-4 mb-3 hover:border-primary-color transition-all cursor-pointer">
                <h3 className="font-bold mb-2">มูรินโญ่ประกาศลาโรม่า เตรียมรับตำแหน่งใหม่ที่ซาอุฯ</h3>
                <p className="text-text-light text-sm mb-2 line-clamp-2">
                  โชเซ่ มูรินโญ่ ประกาศอำลาสโมสร เอเอส โรม่า หลังคุมทีมมาได้ 2 ฤดูกาลครึ่ง โดยมีข่าวลือว่าจะไปรับงานคุมทีมในซาอุดิอาระเบีย
                </p>
                <div className="text-xs text-text-lighter">30 เมษายน 2025 • 15:45 น.</div>
              </div>
              
              <div className="card p-4 mb-3 hover:border-primary-color transition-all cursor-pointer">
                <h3 className="font-bold mb-2">ลิเวอร์พูลเตรียมประกาศตัวกุนซือคนใหม่แทนคล็อปป์</h3>
                <p className="text-text-light text-sm mb-2 line-clamp-2">
                  หลังจากที่ เจอร์เก้น คล็อปป์ ประกาศอำลาทีมอย่างเป็นทางการ ลิเวอร์พูลก็เตรียมประกาศตัวกุนซือคนใหม่ ซึ่งคาดว่าจะเป็น ชาบี อัลอนโซ่
                </p>
                <div className="text-xs text-text-lighter">29 เมษายน 2025 • 20:30 น.</div>
              </div>
              
              <div className="text-center mt-4">
                <a href="/news" className="text-primary-color hover:text-secondary-color font-medium">
                  ดูข่าวทั้งหมด →
                </a>
              </div>
            </div>
            
            {/* Second sidebar banner */}
            <Banner position="sidebar" size="medium" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
