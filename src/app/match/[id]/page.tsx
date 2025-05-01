'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Sample match data - in a real app, this would be fetched from API
const matchDetails = {
  id: 1,
  status: 'LIVE',
  homeTeam: {
    id: 101,
    name: 'เมืองทอง ยูไนเต็ด',
    logo: 'https://media.api-sports.io/football/teams/2420.png',
    goals: 2,
    statistics: {
      shots: 15,
      shotsOnTarget: 7,
      possession: 55,
      corners: 6,
      fouls: 8,
      yellowCards: 1,
      redCards: 0
    }
  },
  awayTeam: {
    id: 102,
    name: 'บุรีรัมย์ ยูไนเต็ด',
    logo: 'https://media.api-sports.io/football/teams/2418.png',
    goals: 1,
    statistics: {
      shots: 10,
      shotsOnTarget: 3,
      possession: 45,
      corners: 4,
      fouls: 12,
      yellowCards: 2,
      redCards: 0
    }
  },
  startTime: '2025-04-30T12:00:00Z',
  league: {
    id: 290,
    name: 'ไทยลีก',
    logo: 'https://media.api-sports.io/football/leagues/290.png',
    country: 'ไทย',
    season: '2024/2025',
    round: 'Round 26'
  },
  venue: {
    name: 'SCG สเตเดียม',
    city: 'นนทบุรี'
  },
  referee: 'สมชาย ใจดี',
  elapsed: 67,
  events: [
    {
      time: {
        elapsed: 12
      },
      team: {
        name: 'เมืองทอง ยูไนเต็ด'
      },
      player: {
        name: 'ธีรศิลป์ แดงดา'
      },
      type: 'Goal',
      detail: 'Normal Goal'
    },
    {
      time: {
        elapsed: 35
      },
      team: {
        name: 'บุรีรัมย์ ยูไนเต็ด'
      },
      player: {
        name: 'ศศลักษณ์ ไหประโคน'
      },
      type: 'Goal',
      detail: 'Normal Goal'
    },
    {
      time: {
        elapsed: 42
      },
      team: {
        name: 'บุรีรัมย์ ยูไนเต็ด'
      },
      player: {
        name: 'ศุภณัฏฐ์ เหมือนตา'
      },
      type: 'Card',
      detail: 'Yellow Card'
    },
    {
      time: {
        elapsed: 55
      },
      team: {
        name: 'เมืองทอง ยูไนเต็ด'
      },
      player: {
        name: 'วิลเลียน โพรสเตส'
      },
      type: 'Goal',
      detail: 'Normal Goal'
    }
  ]
};

export default function MatchDetail() {
  const params = useParams();
  const matchId = Number(params.id);
  const [activeTab, setActiveTab] = useState('events');
  const match = matchDetails; // Using constant instead of state since we're not updating it
  
  // In a real app, we would fetch data based on the matchId
  useEffect(() => {
    // Simulating API fetch
    console.log(`Fetching match data for ID: ${matchId}`);
    // Would be replaced with actual API call
  }, [matchId]);
  
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
                  {match.events.map((event, index) => (
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
    const statItems = [
      { label: 'การครองบอล (%)', home: match.homeTeam.statistics.possession, away: match.awayTeam.statistics.possession },
      { label: 'ยิงเข้ากรอบ', home: match.homeTeam.statistics.shotsOnTarget, away: match.awayTeam.statistics.shotsOnTarget },
      { label: 'ยิงทั้งหมด', home: match.homeTeam.statistics.shots, away: match.awayTeam.statistics.shots },
      { label: 'เตะมุม', home: match.homeTeam.statistics.corners, away: match.awayTeam.statistics.corners },
      { label: 'ฟาวล์', home: match.homeTeam.statistics.fouls, away: match.awayTeam.statistics.fouls },
      { label: 'ใบเหลือง', home: match.homeTeam.statistics.yellowCards, away: match.awayTeam.statistics.yellowCards },
      { label: 'ใบแดง', home: match.homeTeam.statistics.redCards, away: match.awayTeam.statistics.redCards }
    ];
    
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
                    style={{ width: `${stat.home / (stat.home + stat.away) * 100}%` }}
                    className="flex flex-col justify-center overflow-hidden bg-primary-color text-white text-center whitespace-nowrap"
                  ></div>
                  <div
                    style={{ width: `${stat.away / (stat.home + stat.away) * 100}%` }}
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
              {formatMatchDate(match.startTime)} • {match.venue.name}, {match.venue.city}
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
                {match.homeTeam.goals} - {match.awayTeam.goals}
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
        
        {/* Tabs for match details */}
        <div className="bg-bg-light rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b border-border-color">
            <button 
              className={`flex-1 py-3 text-center font-medium ${activeTab === 'events' ? 'text-primary-color border-b-2 border-primary-color' : 'text-text-light'}`}
              onClick={() => setActiveTab('events')}
            >
              เหตุการณ์
            </button>
            <button 
              className={`flex-1 py-3 text-center font-medium ${activeTab === 'statistics' ? 'text-primary-color border-b-2 border-primary-color' : 'text-text-light'}`}
              onClick={() => setActiveTab('statistics')}
            >
              สถิติ
            </button>
            <button 
              className={`flex-1 py-3 text-center font-medium ${activeTab === 'lineups' ? 'text-primary-color border-b-2 border-primary-color' : 'text-text-light'}`}
              onClick={() => setActiveTab('lineups')}
            >
              รายชื่อผู้เล่น
            </button>
            <button 
              className={`flex-1 py-3 text-center font-medium ${activeTab === 'h2h' ? 'text-primary-color border-b-2 border-primary-color' : 'text-text-light'}`}
              onClick={() => setActiveTab('h2h')}
            >
              พบกันล่าสุด
            </button>
          </div>
          
          <div className="py-4">
            {activeTab === 'events' && renderEvents()}
            {activeTab === 'statistics' && renderStatistics()}
            {activeTab === 'lineups' && (
              <div className="text-center p-6 text-text-light">
                ยังไม่มีข้อมูลรายชื่อผู้เล่น
              </div>
            )}
            {activeTab === 'h2h' && (
              <div className="text-center p-6 text-text-light">
                ยังไม่มีข้อมูลการพบกันล่าสุด
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
