'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Layout from '../../components/Layout';
import MatchCard from '../../components/MatchCard';
import LiveMatchWithStats from '../../components/LiveMatchWithStats';
import Banner from '../../components/Banner';
import { fetchFromApi, getFixturesByDate, LEAGUE_IDS } from '../../services/api';

// Interface for match data
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
  venue?: string;
}

// Interface for API fixture
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
  };
}

// Next.js page component
export default function FixturesPage() {
  // We don't need the page params for this component
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterLeague, setFilterLeague] = useState<string>('all');
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [fixturesByLeague, setFixturesByLeague] = useState<Record<string, Match[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Helper function to generate dates for the date picker
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    // Include dates from 3 days ago to 7 days in the future
    for (let i = -3; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: formatDateToThai(date)
      });
    }
    
    return dates;
  };
  
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
  
  // Map API status to app status
  const mapStatus = (status: string): 'LIVE' | 'UPCOMING' | 'FINISHED' => {
    const statusMap: Record<string, 'LIVE' | 'UPCOMING' | 'FINISHED'> = {
      'NS': 'UPCOMING',
      '1H': 'LIVE',
      '2H': 'LIVE',
      'HT': 'LIVE',
      'ET': 'LIVE',
      'BT': 'LIVE',
      'P': 'LIVE',
      'SUSP': 'LIVE',
      'INT': 'LIVE',
      'FT': 'FINISHED',
      'AET': 'FINISHED',
      'PEN': 'FINISHED',
      'PST': 'UPCOMING',
      'CANC': 'FINISHED',
      'ABD': 'FINISHED',
      'AWD': 'FINISHED',
      'WO': 'FINISHED',
      'LIVE': 'LIVE'
    };
    
    return statusMap[status] || 'UPCOMING';
  };
  
  // Format fixtures from API response - using useCallback to make it stable for dependencies
  const formatFixtures = useCallback((apiFixtures: ApiFixture[]): Match[] => {
    return apiFixtures.map(fixture => ({
      id: fixture.fixture.id,
      status: mapStatus(fixture.fixture.status.short),
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
      elapsed: fixture.fixture.status.elapsed || undefined,
      venue: fixture.fixture.venue?.name
    }));
  }, [mapStatus]);
  
  // Group fixtures by league
  const groupFixturesByLeague = (fixtures: Match[]) => {
    const grouped: Record<string, Match[]> = {};
    
    fixtures.forEach(fixture => {
      const leagueId = fixture.league.id.toString();
      if (!grouped[leagueId]) {
        grouped[leagueId] = [];
      }
      grouped[leagueId].push(fixture);
    });
    
    return grouped;
  };
  
  // Define popular leagues to load initially
  const popularLeagueIds = [
    LEAGUE_IDS.THAI_LEAGUE,
    LEAGUE_IDS.PREMIER_LEAGUE,
    LEAGUE_IDS.LA_LIGA,
    LEAGUE_IDS.BUNDESLIGA,
    LEAGUE_IDS.SERIE_A,
    LEAGUE_IDS.CHAMPIONS_LEAGUE
  ];
  
  // Track which leagues have been loaded
  const [loadedLeagueIds, setLoadedLeagueIds] = useState<Set<number>>(new Set());
  const [isLoadingLeague, setIsLoadingLeague] = useState<boolean>(false);
  
  // Fetch fixtures for the selected date, filtering by league IDs
  useEffect(() => {
    const fetchFixtures = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching fixtures for popular leagues on date: ${selectedDate}`);
        
        // Create URL to fetch fixtures for the selected date
        const params = { date: selectedDate };
        const data = await fetchFromApi({
          endpoint: 'fixtures',
          params,
          cacheDuration: 5 * 60 * 1000 // 5 minutes
        });
        
        if (data?.response) {
          // Filter to only include popular leagues initially
          const allFixtures = data.response as ApiFixture[];
          const popularFixtures = allFixtures.filter(fixture => 
            popularLeagueIds.includes(fixture.league.id)
          );
          
          // Track which leagues have been loaded
          const newLoadedLeagueIds = new Set(loadedLeagueIds);
          popularLeagueIds.forEach(id => newLoadedLeagueIds.add(id));
          setLoadedLeagueIds(newLoadedLeagueIds);
          
          // Format and set the fixtures
          const formattedFixtures = formatFixtures(popularFixtures);
          setFixtures(formattedFixtures);
          setFixturesByLeague(groupFixturesByLeague(formattedFixtures));
          console.log(`Initially loaded ${formattedFixtures.length} fixtures from ${popularLeagueIds.length} popular leagues`);
        } else {
          setFixtures([]);
          setFixturesByLeague({});
          setError('ไม่พบข้อมูลการแข่งขันในวันที่เลือก');
        }
      } catch (err) {
        console.error('Error fetching fixtures:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล โปรดลองอีกครั้ง');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFixtures();
    // Reset loaded leagues when date changes
    setLoadedLeagueIds(new Set());
  }, [selectedDate, formatFixtures, loadedLeagueIds]); // Only fetch when selected date changes
  
  // Function to load specific league data
  const loadLeagueData = useCallback(async (leagueId: number) => {
    // Don't reload if already loaded
    if (loadedLeagueIds.has(leagueId) || isLoadingLeague) {
      return;
    }
    
    setIsLoadingLeague(true);
    try {
      console.log(`Loading additional data for league ID: ${leagueId}`);
      
      // Create URL to fetch fixtures for the selected date and league
      const params = { date: selectedDate, league: leagueId };
      const data = await fetchFromApi({
        endpoint: 'fixtures',
        params,
        cacheDuration: 5 * 60 * 1000 // 5 minutes
      });
      
      if (data?.response) {
        // Format and merge with existing fixtures
        const leagueFixtures = formatFixtures(data.response);
        const newFixtures = [...fixtures, ...leagueFixtures];
        
        // Remove duplicates based on match ID
        const uniqueFixtures = Array.from(
          new Map(newFixtures.map(item => [item.id, item])).values()
        );
        
        // Update fixtures state
        setFixtures(uniqueFixtures);
        setFixturesByLeague(groupFixturesByLeague(uniqueFixtures));
        
        // Add to loaded leagues
        const newLoadedLeagueIds = new Set(loadedLeagueIds);
        newLoadedLeagueIds.add(leagueId);
        setLoadedLeagueIds(newLoadedLeagueIds);
        
        console.log(`Successfully loaded data for league ID: ${leagueId}`);
      }
    } catch (err) {
      console.error(`Error loading data for league ID: ${leagueId}`, err);
    } finally {
      setIsLoadingLeague(false);
    }
  }, [loadedLeagueIds, isLoadingLeague, selectedDate, fixtures, formatFixtures]);
  
  // Handle league selection
  useEffect(() => {
    if (filterLeague !== 'all') {
      const leagueId = parseInt(filterLeague, 10);
      if (!isNaN(leagueId) && !loadedLeagueIds.has(leagueId)) {
        loadLeagueData(leagueId);
      }
    }
  }, [filterLeague, loadedLeagueIds, loadLeagueData]);
  
  // Filter fixtures by league
  const filteredFixtures = filterLeague === 'all'
    ? fixtures
    : fixtures.filter(fixture => fixture.league.id.toString() === filterLeague);
  
  // Get league names for the filter
  const leagueOptions = Object.entries(fixturesByLeague).map(([id, fixtures]) => ({
    id,
    name: fixtures[0].league.name,
    logo: fixtures[0].league.logo,
    count: fixtures.length
  })).sort((a, b) => {
    // Thai League first, then by match count
    if (a.id === LEAGUE_IDS.THAI_LEAGUE.toString()) return -1;
    if (b.id === LEAGUE_IDS.THAI_LEAGUE.toString()) return 1;
    return b.count - a.count;
  });
  
  // Date options for the date picker
  const dateOptions = generateDateOptions();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Hero Banner */}
        <Banner position="hero" size="large" />
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-prompt)' }}>
            ตารางแข่งขัน
          </h1>
          <p className="text-text-light mt-2">
            ตารางการแข่งขันฟุตบอลจากลีกชั้นนำทั่วโลก
          </p>
        </div>
        
        {/* Date selection */}
        <div className="mb-6 bg-bg-light rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3">วันที่แข่งขัน</h2>
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
              value={filterLeague}
              onChange={(e) => setFilterLeague(e.target.value)}
              className="appearance-none block w-full px-4 py-3 bg-white border border-border-color rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-primary-color"
            >
              <option value="all">ทั้งหมด ({fixtures.length} แมตช์)</option>
              {leagueOptions.map(league => (
                <option key={league.id} value={league.id}>
                  {league.name} ({league.count} แมตช์)
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
          {filterLeague !== 'all' && (
            <div className="mt-3 flex items-center p-2 bg-gray-100 rounded">
              {leagueOptions.find(l => l.id === filterLeague) && (
                <>
                  <Image 
                    src={leagueOptions.find(l => l.id === filterLeague)?.logo || ''} 
                    alt={leagueOptions.find(l => l.id === filterLeague)?.name || ''}
                    width={24}
                    height={24}
                    className="w-6 h-6 mr-2"
                  />
                  <span className="font-medium">{leagueOptions.find(l => l.id === filterLeague)?.name}</span>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Fixtures list */}
        <div className="bg-bg-light rounded-lg shadow-md p-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-color"></div>
              <p className="mt-4 text-text-light">กำลังโหลดข้อมูลตารางการแข่งขัน...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                className="bg-primary-color text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
                onClick={() => getFixturesByDate(selectedDate)}
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : filteredFixtures.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-text-light">ไม่พบการแข่งขันในวันที่เลือก</p>
              <p className="text-text-lighter mt-2">ลองเลือกวันที่อื่น หรือลีกอื่น</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filterLeague === 'all' ? (
                // Group by league when showing all
                Object.entries(fixturesByLeague).map(([leagueId, matches]) => (
                  <div key={leagueId} className="space-y-2">
                    <div className="flex items-center mb-2 pb-2 border-b border-border-color">
                      <Image
                        src={matches[0].league.logo}
                        alt={matches[0].league.name}
                        width={24}
                        height={24}
                        className="w-6 h-6 mr-2"
                      />
                      <h3 className="font-semibold">{matches[0].league.name}</h3>
                      <span className="text-text-light text-sm ml-2">
                        ({matches[0].league.country})
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {matches.map(match => (
                        match.status === 'LIVE' ? (
                          <LiveMatchWithStats
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
                ))
              ) : (
                // Show flat list when filtered to a specific league
                <div className="space-y-4">
                  {filteredFixtures.map(match => (
                    match.status === 'LIVE' ? (
                      <LiveMatchWithStats
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
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
