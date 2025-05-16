'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getLeagueStandings, LEAGUE_IDS, CURRENT_SEASON } from '../../services/api';

// Interfaces for standings data
interface TeamStats {
  played: number;
  win: number;
  draw: number;
  lose: number;
  goals: {
    for: number;
    against: number;
  };
}

interface Standing {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string;
  all: TeamStats;
  home: TeamStats;
  away: TeamStats;
  update: string;
}

interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
}

interface StandingsResponse {
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    standings: Standing[][];
  };
}

export default function StandingsPage({
  params: _params,
  searchParams: _searchParams
}: {
  params: Record<string, never>;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [selectedLeague, setSelectedLeague] = useState<number>(LEAGUE_IDS.THAI_LEAGUE);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'home' | 'away'>('all');

  // Available leagues for selection
  const availableLeagues = [
    { id: LEAGUE_IDS.THAI_LEAGUE, name: 'ไทยลีก', logo: 'https://media.api-sports.io/football/leagues/290.png' },
    { id: LEAGUE_IDS.PREMIER_LEAGUE, name: 'พรีเมียร์ลีก', logo: 'https://media.api-sports.io/football/leagues/39.png' },
    { id: LEAGUE_IDS.LA_LIGA, name: 'ลาลีกา', logo: 'https://media.api-sports.io/football/leagues/140.png' },
    { id: LEAGUE_IDS.BUNDESLIGA, name: 'บุนเดสลีกา', logo: 'https://media.api-sports.io/football/leagues/78.png' },
    { id: LEAGUE_IDS.SERIE_A, name: 'เซเรีย อา', logo: 'https://media.api-sports.io/football/leagues/135.png' },
    { id: LEAGUE_IDS.LIGUE_1, name: 'ลีกเอิง', logo: 'https://media.api-sports.io/football/leagues/61.png' },
    { id: LEAGUE_IDS.CHAMPIONS_LEAGUE, name: 'แชมเปียนส์ลีก', logo: 'https://media.api-sports.io/football/leagues/2.png' }
  ];

  // Fetch standings when league changes
  useEffect(() => {
    const fetchStandings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getLeagueStandings(selectedLeague, CURRENT_SEASON);
        
        if (data?.response && data.response.length > 0) {
          const standingsData = data.response[0] as StandingsResponse;
          
          // Handle group standings (some leagues have multiple tables)
          if (standingsData.league.standings && standingsData.league.standings.length > 0) {
            // Use the first group if there are multiple
            setStandings(standingsData.league.standings[0]);
            setLeague({
              id: standingsData.league.id,
              name: standingsData.league.name,
              country: standingsData.league.country,
              logo: standingsData.league.logo,
              flag: standingsData.league.flag,
              season: standingsData.league.season
            });
          } else {
            setError('ไม่พบข้อมูลตารางคะแนนสำหรับลีกนี้');
          }
        } else {
          setError('ไม่พบข้อมูลตารางคะแนนสำหรับลีกนี้');
        }
      } catch (err) {
        console.error('Error fetching standings:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล โปรดลองอีกครั้ง');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStandings();
  }, [selectedLeague]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>
            ตารางคะแนน
          </h1>
          <p className="text-text-light mt-2">
            ตารางอันดับคะแนนล่าสุดจากลีกฟุตบอลทั่วโลก
          </p>
        </div>
        
        {/* League selection */}
        <div className="mb-6 bg-bg-light rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3">เลือกลีก</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
            {availableLeagues.map(league => (
              <button
                key={league.id}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition ${
                  selectedLeague === league.id 
                    ? 'bg-primary-color bg-opacity-20 border border-primary-color' 
                    : 'bg-white border hover:border-primary-color'
                }`}
                onClick={() => setSelectedLeague(league.id)}
              >
                <img src={league.logo} alt={league.name} className="w-8 h-8 mb-1" />
                <span className="text-sm text-center">{league.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Standings table */}
        <div className="bg-bg-light rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-color"></div>
              <p className="ml-4 text-text-light">กำลังโหลดข้อมูลตารางคะแนน...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-500">{error}</p>
              <button 
                className="mt-4 bg-primary-color text-white px-4 py-2 rounded"
                onClick={() => setSelectedLeague(selectedLeague)} // Retry
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : (
            <>
              {/* League info header */}
              {league && (
                <div className="p-4 border-b border-border-color bg-bg-light flex items-center">
                  <img src={league.logo} alt={league.name} className="w-10 h-10 mr-3" />
                  <div>
                    <h2 className="font-bold text-lg">{league.name}</h2>
                    <div className="flex items-center text-sm text-text-light">
                      <img src={league.flag} alt={league.country} className="w-4 h-4 mr-1" />
                      {league.country} • ฤดูกาล {league.season}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-color">
                  <thead className="bg-bg-light">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">อันดับ</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">ทีม</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-text-light uppercase tracking-wider">แข่ง</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-text-light uppercase tracking-wider">ชนะ</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-text-light uppercase tracking-wider">เสมอ</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-text-light uppercase tracking-wider">แพ้</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-text-light uppercase tracking-wider">ได้</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-text-light uppercase tracking-wider">เสีย</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-text-light uppercase tracking-wider">ต่าง</th>
                      <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-text-light uppercase tracking-wider font-bold">คะแนน</th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">ฟอร์ม</th>
                    </tr>
                  </thead>
              {/* View mode tabs */}
              <div className="p-4 border-b border-border-color bg-bg-light">
                <div className="flex space-x-2">
                  <button
                    className={`px-4 py-2 rounded text-sm font-medium ${viewMode === 'all' ? 'bg-primary-color text-white' : 'bg-white border hover:border-primary-color'}`}
                    onClick={() => setViewMode('all')}
                  >
                    ผลรวม
                  </button>
                  <button
                    className={`px-4 py-2 rounded text-sm font-medium ${viewMode === 'home' ? 'bg-primary-color text-white' : 'bg-white border hover:border-primary-color'}`}
                    onClick={() => setViewMode('home')}
                  >
                    เจ้าบ้าน
                  </button>
                  <button
                    className={`px-4 py-2 rounded text-sm font-medium ${viewMode === 'away' ? 'bg-primary-color text-white' : 'bg-white border hover:border-primary-color'}`}
                    onClick={() => setViewMode('away')}
                  >
                    ทีมเยือน
                  </button>
                </div>
              </div>
              
                  <tbody className="bg-white divide-y divide-border-color">
                    {standings.map((standing, index) => {
                      // Select the right stats based on view mode
                      const stats = viewMode === 'home' ? standing.home : 
                                    viewMode === 'away' ? standing.away : standing.all;
                      
                      return (
                        <React.Fragment key={index}>
                          <tr 
                            className={`hover:bg-gray-50 cursor-pointer ${
                              standing.description?.includes('Champions League') ? 'border-l-4 border-green-500' :
                              standing.description?.includes('Europa') ? 'border-l-4 border-orange-400' :
                              standing.description?.includes('Relegation') ? 'border-l-4 border-red-500' : ''
                            }`}
                            onClick={() => setExpandedTeam(expandedTeam === standing.team.id ? null : standing.team.id)}
                          >
                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">{standing.rank}</td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img 
                                  src={standing.team.logo}
                                  alt={standing.team.name}
                                  className="w-6 h-6 mr-2"
                                />
                                <span className="text-sm font-medium">{standing.team.name}</span>
                                {expandedTeam === standing.team.id ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-primary-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center">{stats.played}</td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center">{stats.win}</td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center">{stats.draw}</td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center">{stats.lose}</td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center">{stats.goals.for}</td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center">{stats.goals.against}</td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center">{standing.goalsDiff}</td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-center font-bold">{standing.points}</td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="flex">
                                {standing.form?.split('').map((result, i) => (
                                  <span 
                                    key={i} 
                                    className={`w-5 h-5 text-xs flex items-center justify-center rounded mr-1 ${
                                      result === 'W' ? 'bg-green-500 text-white' :
                                      result === 'D' ? 'bg-yellow-500 text-white' :
                                      result === 'L' ? 'bg-red-500 text-white' : 'bg-gray-200'
                                    }`}
                                  >
                                    {result === 'W' ? 'ช' : result === 'D' ? 'ส' : result === 'L' ? 'พ' : '?'}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                          
                          {/* Expanded team details */}
                          {expandedTeam === standing.team.id && (
                            <tr>
                              <td colSpan={11} className="px-4 py-4 bg-bg-light">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {/* Overall performance */}
                                  <div className="bg-white rounded-lg shadow p-4">
                                    <h3 className="font-bold text-sm mb-2 text-primary-color">ผลงานโดยรวม</h3>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span>แข่ง:</span>
                                        <span className="font-medium">{standing.all.played} นัด</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>ชนะ-เสมอ-แพ้:</span>
                                        <span className="font-medium">{standing.all.win}-{standing.all.draw}-{standing.all.lose}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>ได้ประตู-เสียประตู:</span>
                                        <span className="font-medium">{standing.all.goals.for}-{standing.all.goals.against}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>คะแนนเฉลี่ยต่อนัด:</span>
                                        <span className="font-medium">{(standing.points / standing.all.played).toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Home performance */}
                                  <div className="bg-white rounded-lg shadow p-4">
                                    <h3 className="font-bold text-sm mb-2 text-primary-color">ผลงานในบ้าน</h3>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span>แข่ง:</span>
                                        <span className="font-medium">{standing.home.played} นัด</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>ชนะ-เสมอ-แพ้:</span>
                                        <span className="font-medium">{standing.home.win}-{standing.home.draw}-{standing.home.lose}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>ได้ประตู-เสียประตู:</span>
                                        <span className="font-medium">{standing.home.goals.for}-{standing.home.goals.against}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>คะแนนเฉลี่ยต่อนัด:</span>
                                        <span className="font-medium">
                                          {((standing.home.win * 3 + standing.home.draw) / standing.home.played).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Away performance */}
                                  <div className="bg-white rounded-lg shadow p-4">
                                    <h3 className="font-bold text-sm mb-2 text-primary-color">ผลงานนอกบ้าน</h3>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span>แข่ง:</span>
                                        <span className="font-medium">{standing.away.played} นัด</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>ชนะ-เสมอ-แพ้:</span>
                                        <span className="font-medium">{standing.away.win}-{standing.away.draw}-{standing.away.lose}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>ได้ประตู-เสียประตู:</span>
                                        <span className="font-medium">{standing.away.goals.for}-{standing.away.goals.against}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>คะแนนเฉลี่ยต่อนัด:</span>
                                        <span className="font-medium">
                                          {((standing.away.win * 3 + standing.away.draw) / standing.away.played).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Performance visualization */}
                                <div className="mt-4">
                                  <h3 className="font-bold text-sm mb-2 text-primary-color">ข้อมูลเชิงเปรียบเทียบ</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Win percentage */}
                                    <div className="bg-white rounded-lg shadow p-4">
                                      <div className="text-sm font-medium mb-2">อัตราชนะ</div>
                                      <div className="relative pt-1">
                                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                          <div style={{ width: `${(standing.all.win / standing.all.played) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                                        </div>
                                        <div className="text-right text-xs font-medium text-green-600">
                                          {((standing.all.win / standing.all.played) * 100).toFixed(1)}%
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Goal efficiency */}
                                    <div className="bg-white rounded-lg shadow p-4">
                                      <div className="text-sm font-medium mb-2">ประสิทธิภาพการทำประตู</div>
                                      <div className="relative pt-1">
                                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                                          <div 
                                            style={{ 
                                              width: `${Math.min(100, (standing.all.goals.for / (standing.all.goals.for + standing.all.goals.against)) * 100)}%` 
                                            }} 
                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                                          ></div>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                          <span>ได้: {standing.all.goals.for}</span>
                                          <span className="font-medium">
                                            {((standing.all.goals.for / standing.all.played)).toFixed(2)} ประตู/นัด
                                          </span>
                                          <span>เสีย: {standing.all.goals.against}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Legend */}
              <div className="p-4 text-sm">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 mr-2"></div>
                    <span>แชมเปียนส์ลีก</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-400 mr-2"></div>
                    <span>ยูโรป้าลีก</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 mr-2"></div>
                    <span>ตกชั้น</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
