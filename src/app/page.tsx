'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import Banner from '../components/Banner';
import MatchCard from '../components/MatchCard';
import LeagueSection from '../components/LeagueSection';
import StandingsWidget from '../components/StandingsWidget';
import NewsFeed from '../components/NewsFeed';
import { LEAGUE_IDS, getFixturesByDate } from '../services/api';

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const today = new Date();
const formattedToday = formatDate(today);

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

export default function Home({
  params: _params,
  searchParams: _searchParams
}: {
  params: Record<string, never>;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [featuredMatches, setFeaturedMatches] = useState<Match[]>([]);
  const [topLeagueMatches, setTopLeagueMatches] = useState<{[key: string]: Match[]}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodayMatches = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await getFixturesByDate(formattedToday);
        
        if (data && data.response) {
          // Convert all fixtures to our Match format
          const allMatches = data.response
            .filter((fixture: ApiFixture) => fixture && fixture.fixture && fixture.teams && fixture.goals)
            .map((fixture: ApiFixture) => formatMatchFromAPI(fixture));
          
          // Sort all matches with LIVE first, then UPCOMING, then FINISHED
          const sortedMatches = [...allMatches].sort((a, b) => {
            const statusOrder: Record<string, number> = { LIVE: 0, UPCOMING: 1, FINISHED: 2 };
            const statusA = statusOrder[a.status] || 0;
            const statusB = statusOrder[b.status] || 0;
            
            if (statusA !== statusB) return statusA - statusB;
            
            // If both are LIVE, sort by elapsed time (higher first)
            if (a.status === 'LIVE' && b.status === 'LIVE' && a.elapsed && b.elapsed) {
              return b.elapsed - a.elapsed;
            }
            
            // Otherwise sort by start time
            return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
          });
          
          // Get featured matches (top 5 from sorted matches)
          setFeaturedMatches(sortedMatches.slice(0, 5));
          
          // Group matches by priority leagues
          const leagueGroups: {[key: string]: Match[]} = {};
          
          // Define priority leagues
          const priorityLeagues = [
            LEAGUE_IDS.PREMIER_LEAGUE,
            LEAGUE_IDS.LA_LIGA,
            LEAGUE_IDS.SERIE_A,
            LEAGUE_IDS.BUNDESLIGA,
            LEAGUE_IDS.THAI_LEAGUE
          ];
          
          // Populate league groups
          priorityLeagues.forEach(leagueId => {
            const matchesForLeague = sortedMatches.filter(match => match.league.id === leagueId);
            if (matchesForLeague.length > 0) {
              leagueGroups[leagueId] = matchesForLeague;
            }
          });
          
          setTopLeagueMatches(leagueGroups);
        }
      } catch (err) {
        console.error('Error fetching today\'s matches:', err);
        setError('ไม่สามารถโหลดข้อมูลการแข่งขันได้ โปรดลองอีกครั้งในภายหลัง');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTodayMatches();
  }, []);

  return (
    <Layout>
      <Banner position="hero" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:space-x-6">
          <div className="flex-1">
            {/* Popular League Matches Section */}
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>การแข่งขันจากลีกยอดนิยม</h2>
                <Link 
                  href="/live" 
                  className="text-sm text-primary-color hover:underline flex items-center"
                >
                  ดูผลบอลสด
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              
              {isLoading ? (
                <div className="text-center p-10 bg-bg-light rounded-lg shadow">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-color"></div>
                  <p className="mt-4 text-text-light">กำลังโหลดข้อมูลการแข่งขัน...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : topLeagueMatches[LEAGUE_IDS.PREMIER_LEAGUE]?.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {topLeagueMatches[LEAGUE_IDS.PREMIER_LEAGUE].slice(0, 5).map(match => (
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
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-bg-light rounded-lg">
                  <p className="text-text-light">ไม่พบการแข่งขันจากพรีเมียร์ลีกในวันนี้</p>
                </div>
              )}
            </section>
            
            {/* Banner between sections */}
            <div className="mb-8">
              <Banner position="in-feed" size="large" />
            </div>
            
            {/* League Sections */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'var(--font-prompt)' }}>การแข่งขันจากลีกยอดนิยม</h2>
              
              <div className="space-y-8">
                {/* Premier League */}
                {topLeagueMatches[LEAGUE_IDS.PREMIER_LEAGUE] && (
                  <LeagueSection 
                    league={{
                      id: LEAGUE_IDS.PREMIER_LEAGUE,
                      name: "พรีเมียร์ลีก",
                      logo: "https://media.api-sports.io/football/leagues/39.png",
                      country: "England"
                    }}
                    matches={topLeagueMatches[LEAGUE_IDS.PREMIER_LEAGUE]}
                  />
                )}
                
                {/* La Liga */}
                {topLeagueMatches[LEAGUE_IDS.LA_LIGA] && (
                  <LeagueSection 
                    league={{
                      id: LEAGUE_IDS.LA_LIGA,
                      name: "ลาลีกา",
                      logo: "https://media.api-sports.io/football/leagues/140.png",
                      country: "Spain"
                    }}
                    matches={topLeagueMatches[LEAGUE_IDS.LA_LIGA]}
                  />
                )}
                
                {/* Serie A */}
                {topLeagueMatches[LEAGUE_IDS.SERIE_A] && (
                  <LeagueSection 
                    league={{
                      id: LEAGUE_IDS.SERIE_A,
                      name: "กัลโช่ เซเรีย อา",
                      logo: "https://media.api-sports.io/football/leagues/135.png",
                      country: "Italy"
                    }}
                    matches={topLeagueMatches[LEAGUE_IDS.SERIE_A]}
                  />
                )}
                
                {/* Bundesliga */}
                {topLeagueMatches[LEAGUE_IDS.BUNDESLIGA] && (
                  <LeagueSection 
                    league={{
                      id: LEAGUE_IDS.BUNDESLIGA,
                      name: "บุนเดสลีกา",
                      logo: "https://media.api-sports.io/football/leagues/78.png",
                      country: "Germany"
                    }}
                    matches={topLeagueMatches[LEAGUE_IDS.BUNDESLIGA]}
                  />
                )}
                
                {/* Thai League */}
                {topLeagueMatches[LEAGUE_IDS.THAI_LEAGUE] && (
                  <LeagueSection 
                    league={{
                      id: LEAGUE_IDS.THAI_LEAGUE,
                      name: "ไทยลีก",
                      logo: "https://media.api-sports.io/football/leagues/290.png",
                      country: "Thailand"
                    }}
                    matches={topLeagueMatches[LEAGUE_IDS.THAI_LEAGUE]}
                  />
                )}
                
                {/* Show message if no matches are available */}
                {Object.keys(topLeagueMatches).length === 0 && (
                  <div className="text-center p-6 bg-bg-light rounded-lg">
                    <p className="text-text-light">ไม่พบการแข่งขันในลีกยอดนิยมวันนี้</p>
                    <p className="text-sm mt-2">
                      <Link href="/fixtures" className="text-primary-color hover:underline">
                        ดูตารางการแข่งขันในวันอื่น
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </section>
            
            {/* Banner before CTA */}
            <div className="mb-8">
              <Banner position="pre-footer" size="medium" />
            </div>
            
            {/* Call-to-action section */}
            <section className="mb-8">
              <div className="bg-primary-color bg-opacity-10 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold mb-3 text-primary-color" style={{ fontFamily: 'var(--font-prompt)' }}>
                  ติดตามผลบอลสดและตารางแข่งขันได้ทุกที่ทุกเวลา
                </h3>
                <p className="mb-4 text-text-light">
                  ดูผลบอลสด อัพเดททุกนาที พร้อมสถิติและการวิเคราะห์ครบถ้วน
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Link 
                    href="/live" 
                    className="bg-primary-color text-white px-6 py-2 rounded hover:bg-opacity-90 transition"
                  >
                    ดูบอลสด
                  </Link>
                  <Link 
                    href="/fixtures" 
                    className="bg-white text-primary-color border border-primary-color px-6 py-2 rounded hover:bg-primary-color hover:bg-opacity-10 transition"
                  >
                    ตารางการแข่งขัน
                  </Link>
                </div>
              </div>
            </section>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-80 mt-6 lg:mt-0">
            <div className="mb-6">
              <Banner position="sidebar" size="medium" />
            </div>
            <div className="sticky top-4">
              <div className="bg-bg-light rounded-lg shadow-md p-4 mb-6">
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-prompt)' }}>
                  ตารางคะแนน
                </h3>
                <p className="text-sm text-text-light mb-3">
                  ตารางคะแนนล่าสุดจากลีกชั้นนำ
                </p>
                
                {/* Standings widgets */}
                <div className="space-y-4">
                  <StandingsWidget leagueId={LEAGUE_IDS.PREMIER_LEAGUE} limit={5} />
                  <Link 
                    href="/standings" 
                    className="text-sm text-primary-color hover:underline inline-flex items-center mt-2"
                  >
                    ดูตารางคะแนนทั้งหมด
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              <div className="bg-bg-light rounded-lg shadow-md p-4 mb-6">
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-prompt)' }}>
                  ทำนายผลบอล
                </h3>
                <p className="text-sm text-text-light mb-3">
                  AI วิเคราะห์ผลการแข่งขันพร้อมสถิติ
                </p>
                <Link 
                  href="/predictions" 
                  className="bg-secondary-color text-white px-4 py-2 rounded inline-flex items-center text-sm"
                >
                  ดูการทำนายผล
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              
              <div className="bg-bg-light rounded-lg shadow-md p-4">
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-prompt)' }}>
                  ข่าวสารล่าสุด
                </h3>
                {/* News Feed Component */}
                <NewsFeed />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
