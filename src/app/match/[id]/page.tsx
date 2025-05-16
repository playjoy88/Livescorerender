'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import Link from 'next/link';
import { 
  fetchFromApi, 
  getFixtureStatistics, 
  getFixtureEvents,
  getFixtureLineups,
  getHeadToHead 
} from '../../../services/api';

// Interface definitions for match data
interface Team {
  id: number;
  name: string;
  logo: string;
  goals?: number | null;
  statistics?: Record<string, number>;
}

interface League {
  id: number;
  name: string;
  logo: string;
  country?: string;
  season?: string;
  round?: string;
}

interface Venue {
  name?: string;
  city?: string;
}

interface EventTime {
  elapsed: number;
  extra?: number | null;
}

interface EventTeam {
  id?: number;
  name: string;
  logo?: string;
}

interface EventPlayer {
  id?: number;
  name: string;
}

interface EventAssist {
  id?: number;
  name?: string;
}

interface MatchEvent {
  time: EventTime;
  team: EventTeam;
  player: EventPlayer;
  assist?: EventAssist;
  type: string;
  detail: string;
  comments?: string;
}

interface MatchDetail {
  id: number;
  status: string;
  homeTeam: Team;
  awayTeam: Team;
  startTime: string;
  league: League;
  venue: Venue;
  referee?: string;
  elapsed?: number;
  events: MatchEvent[];
}

// Statistic item type for API response
interface StatItem {
  type: string;
  value: string | number | null;
}

// Default empty match for initial state
const emptyMatch: MatchDetail = {
  id: 0,
  status: 'UPCOMING',
  homeTeam: { id: 0, name: '', logo: '' },
  awayTeam: { id: 0, name: '', logo: '' },
  startTime: new Date().toISOString(),
  league: { id: 0, name: '', logo: '' },
  venue: {},
  events: []
};

export default function MatchDetail({
  params,
  searchParams: _searchParams
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const matchId = Number(params.id);
  const [activeTab, setActiveTab] = useState('events');
  
  // State for match data and loading status
  const [match, setMatch] = useState<MatchDetail>(emptyMatch);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for different data types
  const [events, setEvents] = useState<MatchEvent[]>([]);
  
  // Fetch match data
  useEffect(() => {
    const fetchMatchData = async () => {
      if (!matchId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch fixture details
        const fixtureData = await fetchFromApi({
          endpoint: 'fixtures',
          params: { id: matchId }
        });
        
        if (fixtureData?.response?.length > 0) {
          const fixture = fixtureData.response[0];
          
          // Format the API data to our match format
          const formattedMatch: MatchDetail = {
            id: fixture.fixture.id,
            status: mapStatus(fixture.fixture.status.short),
            homeTeam: {
              id: fixture.teams.home.id,
              name: fixture.teams.home.name,
              logo: fixture.teams.home.logo,
              goals: fixture.goals.home,
              statistics: {}
            },
            awayTeam: {
              id: fixture.teams.away.id,
              name: fixture.teams.away.name,
              logo: fixture.teams.away.logo,
              goals: fixture.goals.away,
              statistics: {}
            },
            startTime: fixture.fixture.date,
            league: {
              id: fixture.league.id,
              name: fixture.league.name,
              logo: fixture.league.logo,
              country: fixture.league.country,
              season: `${fixture.league.season}`,
              round: fixture.league.round
            },
            venue: {
              name: fixture.fixture.venue?.name,
              city: fixture.fixture.venue?.city
            },
            referee: fixture.fixture.referee,
            elapsed: fixture.fixture.status.elapsed,
            events: []
          };
          
          setMatch(formattedMatch);
          
          // Fetch events
          const eventsData = await getFixtureEvents(matchId);
          if (eventsData?.response?.length > 0) {
            setEvents(eventsData.response);
          }
          
          // Check if statistics are available
          const statsData = await getFixtureStatistics(matchId);
          if (statsData?.response?.length >= 2) {
            // Process home team statistics
            const homeStats = statsData.response[0].statistics;
            const awayStats = statsData.response[1].statistics;
            
            if (homeStats && awayStats) {
              const homeStatistics: Record<string, number> = {};
              const awayStatistics: Record<string, number> = {};
              
              homeStats.forEach((stat: StatItem) => {
                const value = processStatValue(stat.value);
                if (value !== null) {
                  homeStatistics[stat.type] = value;
                }
              });
              
              awayStats.forEach((stat: StatItem) => {
                const value = processStatValue(stat.value);
                if (value !== null) {
                  awayStatistics[stat.type] = value;
                }
              });
              
              // Update teams with statistics
              setMatch(prev => ({
                ...prev,
                homeTeam: {
                  ...prev.homeTeam,
                  statistics: homeStatistics
                },
                awayTeam: {
                  ...prev.awayTeam,
                  statistics: awayStatistics
                }
              }));
            }
          }
          
          // Check if lineups are available
          await getFixtureLineups(matchId);
          
          // Check if H2H data is available
          if (formattedMatch.homeTeam.id && formattedMatch.awayTeam.id) {
            await getHeadToHead(
              formattedMatch.homeTeam.id, 
              formattedMatch.awayTeam.id
            );
          }
          
        } else {
          setError('ไม่พบข้อมูลการแข่งขัน');
        }
      } catch (err) {
        console.error('Error fetching match data:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล โปรดลองอีกครั้ง');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMatchData();
  }, [matchId]);
  
  // Helper function to process statistic values
  const processStatValue = (value: string | number | null): number | null => {
    if (value === null || value === undefined) return null;
    
    // Handle percentage strings
    if (typeof value === 'string' && value.includes('%')) {
      return parseInt(value.replace('%', ''), 10) || 0;
    }
    
    // Handle numeric strings
    if (typeof value === 'string') {
      return parseInt(value, 10) || 0;
    }
    
    // Handle numbers
    return typeof value === 'number' ? value : 0;
  };
  
  // Map API status codes to our status format
  const mapStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'NS': 'UPCOMING',
      '1H': 'LIVE',
      '2H': 'LIVE',
      'HT': 'LIVE',
      'ET': 'LIVE',
      'BT': 'LIVE',
      'P': 'LIVE',
      'SUSP': 'SUSPENDED',
      'INT': 'INTERRUPTED',
      'FT': 'FINISHED',
      'AET': 'FINISHED',
      'PEN': 'FINISHED',
      'PST': 'POSTPONED',
      'CANC': 'CANCELLED',
      'ABD': 'ABANDONED',
      'AWD': 'AWARDED',
      'WO': 'WALKOVER',
      'LIVE': 'LIVE'
    };
    
    return statusMap[status] || status;
  };
  
  // Format the match date
  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Render match events
  const renderEvents = () => {
    if (events.length === 0) {
      return (
        <div className="text-center p-6 text-text-light">
          ยังไม่มีเหตุการณ์ในการแข่งขันนี้
        </div>
      );
    }
    
    return (
      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="py-2 align-middle inline-block min-w-full">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-border-color">
                <thead className="bg-bg-light">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                      เวลา
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                      ทีม
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                      ผู้เล่น
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                      เหตุการณ์
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-bg-light divide-y divide-border-color">
                  {events.map((event: MatchEvent, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {event.time.elapsed}&#39;
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{event.team.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{event.player.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          event.type === 'Goal' 
                            ? 'bg-green-100 text-green-800' 
                            : event.type === 'Card' && event.detail === 'Yellow Card'
                            ? 'bg-yellow-100 text-yellow-800'
                            : event.type === 'Card' && event.detail === 'Red Card'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {event.detail}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render statistics
  const renderStatistics = () => {
    if (!match.homeTeam.statistics || !match.awayTeam.statistics || 
        Object.keys(match.homeTeam.statistics).length === 0 || 
        Object.keys(match.awayTeam.statistics).length === 0) {
      return (
        <div className="text-center p-6 text-text-light">
          ยังไม่มีข้อมูลสถิติสำหรับการแข่งขันนี้
        </div>
      );
    }
    
    // Map API stats to Thai labels
    const statsMap: Record<string, string> = {
      'Ball Possession': 'การครองบอล (%)',
      'Shots on Goal': 'ยิงเข้ากรอบ',
      'Total Shots': 'ยิงทั้งหมด',
      'Corner Kicks': 'เตะมุม',
      'Fouls': 'ฟาวล์',
      'Yellow Cards': 'ใบเหลือง',
      'Red Cards': 'ใบแดง',
      'Offsides': 'ล้ำหน้า',
      'Goalkeeper Saves': 'เซฟประตู',
      'Passes Total': 'ส่งบอลทั้งหมด',
      'Passes Accurate': 'ส่งบอลถูกเป้า'
    };
    
    // Create stat items from the available statistics
    const statItems = Object.keys(match.homeTeam.statistics).map(key => {
      const label = statsMap[key] || key;
      return {
        label,
        home: match.homeTeam.statistics![key] || 0,
        away: match.awayTeam.statistics![key] || 0
      };
    });
    
    return (
      <div className="space-y-4 px-4">
        {statItems.map((stat, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="text-right font-medium w-1/3">{stat.home}</div>
            <div className="flex-grow">
              <div className="relative pt-1">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-xs font-medium text-text-light">{stat.label}</span>
                </div>
                <div className="flex h-2 overflow-hidden rounded bg-gray-200">
                  <div
                    style={{ width: `${stat.home / (stat.home + stat.away || 1) * 100}%` }}
                    className="flex flex-col justify-center overflow-hidden bg-primary-color text-white text-center whitespace-nowrap"
                  ></div>
                  <div
                    style={{ width: `${stat.away / (stat.home + stat.away || 1) * 100}%` }}
                    className="flex flex-col justify-center overflow-hidden bg-secondary-color text-white text-center whitespace-nowrap"
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-left font-medium w-1/3">{stat.away}</div>
          </div>
        ))}
      </div>
    );
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
            <p className="mt-4 text-text-light">กำลังโหลดข้อมูลการแข่งขัน...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-10 bg-red-50 rounded-lg p-6">
            <div className="text-red-500 mb-4 text-lg">{error}</div>
            <button 
              className="bg-primary-color text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
              onClick={() => window.location.reload()}
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="text-sm breadcrumbs mb-4">
          <ul className="flex space-x-2 text-text-light">
            <li><Link href="/" className="hover:text-primary-color">หน้าหลัก</Link></li>
            <li><span className="mx-2">/</span></li>
            <li><Link href="/live" className="hover:text-primary-color">ผลบอลสด</Link></li>
            <li><span className="mx-2">/</span></li>
            <li className="text-primary-color font-medium">{match.homeTeam.name} vs {match.awayTeam.name}</li>
          </ul>
        </div>
        
        {/* Match info header */}
        <div className="bg-bg-light rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <img 
                src={match.league.logo} 
                alt={match.league.name}
                className="w-6 h-6 mr-2" 
              />
              <span className="text-sm">{match.league.name} • {match.league.round}</span>
            </div>
            <div className="live-badge">
              {match.status === 'LIVE' ? `${match.elapsed}'` : match.status}
            </div>
          </div>
          
          <div className="text-center mb-4">
            <div className="text-text-light text-sm mb-1">
              {formatMatchDate(match.startTime)} • {match.venue.name || 'ไม่ระบุสนาม'}, {match.venue.city || 'ไม่ระบุเมือง'}
            </div>
            {match.referee && (
              <div className="text-text-lighter text-xs">
                ผู้ตัดสิน: {match.referee}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between py-4">
            <div className="flex flex-col items-center w-2/5">
              <img 
                src={match.homeTeam.logo} 
                alt={match.homeTeam.name} 
                className="w-16 h-16 mb-2"
              />
              <span className="font-bold text-lg">{match.homeTeam.name}</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-2">
                {match.homeTeam.goals || 0} - {match.awayTeam.goals || 0}
              </div>
              {match.status === 'LIVE' && (
                <span className="text-live-color text-sm animate-pulse">แบบเรียลไทม์</span>
              )}
            </div>
            
            <div className="flex flex-col items-center w-2/5">
              <img 
                src={match.awayTeam.logo} 
                alt={match.awayTeam.name}
                className="w-16 h-16 mb-2" 
              />
              <span className="font-bold text-lg">{match.awayTeam.name}</span>
            </div>
          </div>
        </div>
        
        {/* Match Details Sections */}
        <div className="space-y-4">
          {/* Statistics Section - Expandable */}
          <div className="bg-bg-light rounded-lg shadow-md overflow-hidden">
            <button 
              className="w-full px-4 py-3 flex items-center justify-between border-b border-border-color"
              onClick={() => setActiveTab(activeTab === 'statistics' ? '' : 'statistics')}
            >
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2 text-primary-color" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium text-lg">สถิติการแข่งขัน</span>
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 transition-transform ${activeTab === 'statistics' ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {activeTab === 'statistics' && (
              <div className="py-4">
                {renderStatistics()}
              </div>
            )}
          </div>
          
          {/* Events Section - Expandable */}
          <div className="bg-bg-light rounded-lg shadow-md overflow-hidden">
            <button 
              className="w-full px-4 py-3 flex items-center justify-between border-b border-border-color"
              onClick={() => setActiveTab(activeTab === 'events' ? '' : 'events')}
            >
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2 text-secondary-color" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-medium text-lg">เหตุการณ์สำคัญ</span>
                {events.length > 0 && (
                  <span className="ml-2 bg-secondary-color text-white text-xs px-2 py-0.5 rounded-full">
                    {events.length}
                  </span>
                )}
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 transition-transform ${activeTab === 'events' ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {activeTab === 'events' && (
              <div className="overflow-x-auto">
                {renderEvents()}
              </div>
            )}
          </div>
          
          {/* Lineups Section - Expandable */}
          <div className="bg-bg-light rounded-lg shadow-md overflow-hidden">
            <button 
              className="w-full px-4 py-3 flex items-center justify-between border-b border-border-color"
              onClick={() => setActiveTab(activeTab === 'lineups' ? '' : 'lineups')}
            >
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2 text-green-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium text-lg">รายชื่อผู้เล่น</span>
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 transition-transform ${activeTab === 'lineups' ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {activeTab === 'lineups' && (
              <div className="py-4">
                <div className="text-center p-6 text-text-light">
                  ยังไม่มีข้อมูลรายชื่อผู้เล่น
                </div>
              </div>
            )}
          </div>
          
          {/* Head-to-Head Section - Expandable */}
          <div className="bg-bg-light rounded-lg shadow-md overflow-hidden">
            <button 
              className="w-full px-4 py-3 flex items-center justify-between border-b border-border-color"
              onClick={() => setActiveTab(activeTab === 'h2h' ? '' : 'h2h')}
            >
              <div className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2 text-blue-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span className="font-medium text-lg">พบกันล่าสุด</span>
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 transition-transform ${activeTab === 'h2h' ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {activeTab === 'h2h' && (
              <div className="py-4">
                <div className="text-center p-6 text-text-light">
                  ยังไม่มีข้อมูลการพบกันล่าสุด
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
