'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import MatchCard from '../../components/MatchCard';

// Sample match data for demonstration
const liveMatches = [
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
  {
    id: 6,
    status: 'LIVE',
    homeTeam: {
      id: 111,
      name: 'แมนเชสเตอร์ ยูไนเต็ด',
      logo: 'https://media.api-sports.io/football/teams/33.png',
      goals: 1
    },
    awayTeam: {
      id: 112,
      name: 'เชลซี',
      logo: 'https://media.api-sports.io/football/teams/49.png',
      goals: 1
    },
    startTime: '2025-05-01T11:45:00Z',
    league: {
      id: 39,
      name: 'พรีเมียร์ลีก',
      logo: 'https://media.api-sports.io/football/leagues/39.png',
      country: 'อังกฤษ'
    },
    elapsed: 32
  },
  {
    id: 7,
    status: 'LIVE',
    homeTeam: {
      id: 113,
      name: 'เอซี มิลาน',
      logo: 'https://media.api-sports.io/football/teams/489.png',
      goals: 2
    },
    awayTeam: {
      id: 114,
      name: 'นาโปลี',
      logo: 'https://media.api-sports.io/football/teams/492.png',
      goals: 0
    },
    startTime: '2025-05-01T11:15:00Z',
    league: {
      id: 135,
      name: 'เซเรีย อา',
      logo: 'https://media.api-sports.io/football/leagues/135.png',
      country: 'อิตาลี'
    },
    elapsed: 58
  }
];

export default function LiveScores() {
  const [matches, setMatches] = useState(liveMatches);
  const [filterLeague, setFilterLeague] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60); // seconds
  
  // In a real app, we would fetch live data here
  useEffect(() => {
    const fetchLiveScores = () => {
      setIsLoading(true);
      
      // This would be an API call in a real app
      // For now, we'll simulate loading with timeout
      setTimeout(() => {
        // Simulate data refresh by updating one score
        if (matches.length > 0) {
          const updatedMatches = [...matches];
          const randomIndex = Math.floor(Math.random() * updatedMatches.length);
          const randomMatch = {...updatedMatches[randomIndex]};
          
          // Randomly decide which team scores
          if (Math.random() > 0.5) {
            randomMatch.homeTeam.goals = (randomMatch.homeTeam.goals || 0) + 1;
          } else {
            randomMatch.awayTeam.goals = (randomMatch.awayTeam.goals || 0) + 1;
          }
          
          // Increase elapsed time for all matches
          updatedMatches.forEach(match => {
            if (match.elapsed) {
              match.elapsed += 1;
            }
          });
          
          updatedMatches[randomIndex] = randomMatch;
          setMatches(updatedMatches);
        }
        
        setIsLoading(false);
      }, 1000);
    };
    
    // Initial fetch
    fetchLiveScores();
    
    // Set up polling interval
    const intervalId = setInterval(fetchLiveScores, refreshInterval * 1000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);
  
  // Filter matches by league
  const filteredMatches = filterLeague === 'all' 
    ? matches 
    : matches.filter(match => match.league.id.toString() === filterLeague);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Hero section */}
        <section className="bg-bg-light rounded-lg shadow-md p-6 mb-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-prompt)' }}>
              ผลบอลสด
            </h1>
            <p className="text-text-light mb-4">
              อัพเดทผลบอลสดแบบเรียลไทม์จากลีกชั้นนำทั่วโลก
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm">
              <span className="text-text-light">รีเฟรชทุก:</span>
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
              <button 
                className={`px-3 py-1 rounded-full text-sm flex items-center ${filterLeague === '290' ? 'bg-primary-color text-white' : 'bg-bg-light text-text-light'}`}
                onClick={() => setFilterLeague('290')}
              >
                <img src="https://media.api-sports.io/football/leagues/290.png" alt="Thai League" className="w-4 h-4 mr-1" />
                ไทยลีก
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm flex items-center ${filterLeague === '39' ? 'bg-primary-color text-white' : 'bg-bg-light text-text-light'}`}
                onClick={() => setFilterLeague('39')}
              >
                <img src="https://media.api-sports.io/football/leagues/39.png" alt="Premier League" className="w-4 h-4 mr-1" />
                พรีเมียร์ลีก
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm flex items-center ${filterLeague === '78' ? 'bg-primary-color text-white' : 'bg-bg-light text-text-light'}`}
                onClick={() => setFilterLeague('78')}
              >
                <img src="https://media.api-sports.io/football/leagues/78.png" alt="Bundesliga" className="w-4 h-4 mr-1" />
                บุนเดสลีกา
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-sm flex items-center ${filterLeague === '135' ? 'bg-primary-color text-white' : 'bg-bg-light text-text-light'}`}
                onClick={() => setFilterLeague('135')}
              >
                <img src="https://media.api-sports.io/football/leagues/135.png" alt="Serie A" className="w-4 h-4 mr-1" />
                เซเรีย อา
              </button>
            </div>
          </div>
        </div>
        
        {/* Matches list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMatches.length > 0 ? (
            filteredMatches.map(match => (
              <MatchCard 
                key={match.id}
                id={match.id}
                status={match.status as 'LIVE' | 'UPCOMING' | 'FINISHED'}
                homeTeam={match.homeTeam}
                awayTeam={match.awayTeam}
                startTime={match.startTime}
                league={match.league}
                elapsed={match.elapsed}
              />
            ))
          ) : (
            <div className="col-span-2 text-center p-10 bg-bg-light rounded-lg shadow">
              <div className="text-text-light text-lg mb-2">ไม่พบการแข่งขันที่กำลังถ่ายทอดสด</div>
              <p className="text-text-lighter">
                อาจจะเป็นเพราะตัวกรองที่คุณเลือก หรือไม่มีการแข่งขันที่กำลังถ่ายทอดสดในขณะนี้
              </p>
            </div>
          )}
        </div>
        
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
    </Layout>
  );
}
