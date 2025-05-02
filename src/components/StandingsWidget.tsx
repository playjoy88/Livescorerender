import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLeagueStandings, LEAGUE_IDS, CURRENT_SEASON } from '../services/api';

// Interfaces for standings data
interface Standing {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
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

interface StandingsWidgetProps {
  leagueId: number; // The league ID to display standings for
  limit?: number; // Number of teams to display
  showHeader?: boolean; // Whether to show the league header
  showViewAllLink?: boolean; // Whether to show a link to the full standings page
}

const StandingsWidget: React.FC<StandingsWidgetProps> = ({
  leagueId,
  limit = 5,
  showHeader = true,
  showViewAllLink = true
}) => {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [league, setLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // League names in Thai
  const thaiLeagueNames: Record<number, string> = {
    [LEAGUE_IDS.PREMIER_LEAGUE]: 'พรีเมียร์ลีก',
    [LEAGUE_IDS.LA_LIGA]: 'ลาลีกา',
    [LEAGUE_IDS.BUNDESLIGA]: 'บุนเดสลีกา',
    [LEAGUE_IDS.SERIE_A]: 'เซเรีย อา',
    [LEAGUE_IDS.LIGUE_1]: 'ลีกเอิง',
    [LEAGUE_IDS.CHAMPIONS_LEAGUE]: 'แชมเปียนส์ลีก',
    [LEAGUE_IDS.THAI_LEAGUE]: 'ไทยลีก'
  };

  // Fetch standings when league changes
  useEffect(() => {
    const fetchStandings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getLeagueStandings(leagueId, CURRENT_SEASON);
        
        if (data?.response && data.response.length > 0) {
          const standingsData = data.response[0] as StandingsResponse;
          
          // Handle group standings (some leagues have multiple tables)
          if (standingsData.league.standings && standingsData.league.standings.length > 0) {
            // Use the first group if there are multiple
            setStandings(standingsData.league.standings[0].slice(0, limit)); // Limit the number of teams
            setLeague({
              id: standingsData.league.id,
              name: standingsData.league.name,
              country: standingsData.league.country,
              logo: standingsData.league.logo,
              flag: standingsData.league.flag,
              season: standingsData.league.season
            });
          } else {
            setError('ไม่พบข้อมูลตารางคะแนน');
          }
        } else {
          setError('ไม่พบข้อมูลตารางคะแนน');
        }
      } catch (err) {
        console.error('Error fetching standings:', err);
        setError('ไม่สามารถโหลดข้อมูล');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStandings();
  }, [leagueId, limit]);

  if (isLoading) {
    return (
      <div className="bg-bg-light rounded-lg shadow-md p-4 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-color"></div>
        <p className="mt-2 text-sm text-text-light">กำลังโหลดตารางคะแนน...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-bg-light rounded-lg shadow-md p-4 text-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!league || standings.length === 0) {
    return null;
  }

  return (
    <div className="bg-bg-light rounded-lg shadow-md overflow-hidden">
      {/* League header */}
      {showHeader && (
        <div className="p-3 border-b border-border-color bg-primary-color bg-opacity-10 flex items-center justify-between">
          <div className="flex items-center">
            <img src={league.logo} alt={league.name} className="w-6 h-6 mr-2" />
            <h3 className="font-bold text-primary-color">
              {thaiLeagueNames[leagueId] || league.name}
            </h3>
          </div>
          <div className="text-xs text-text-light">
            ฤดูกาล {league.season}
          </div>
        </div>
      )}
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-bg-light border-b border-border-color">
            <tr>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-text-light">#</th>
              <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-text-light">ทีม</th>
              <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-text-light">แข่ง</th>
              <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-text-light">ชนะ</th>
              <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-text-light">แพ้</th>
              <th scope="col" className="px-2 py-2 text-center text-xs font-medium text-text-light">แต้ม</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {standings.map((standing) => (
              <tr key={standing.team.id} className="hover:bg-gray-50">
                <td className="px-2 py-2 whitespace-nowrap text-sm font-medium">{standing.rank}</td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="flex items-center">
                    <img 
                      src={standing.team.logo}
                      alt={standing.team.name}
                      className="w-5 h-5 mr-2"
                    />
                    <span className="text-sm font-medium truncate max-w-[100px]">{standing.team.name}</span>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-center text-sm">{standing.all.played}</td>
                <td className="px-2 py-2 whitespace-nowrap text-center text-sm">{standing.all.win}</td>
                <td className="px-2 py-2 whitespace-nowrap text-center text-sm">{standing.all.lose}</td>
                <td className="px-2 py-2 whitespace-nowrap text-center text-sm font-bold">{standing.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* View all link */}
      {showViewAllLink && (
        <div className="py-2 text-center border-t border-border-color">
          <Link 
            href="/standings" 
            className="text-primary-color hover:text-secondary-color text-sm font-medium flex items-center justify-center"
          >
            ดูตารางคะแนนทั้งหมด
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};

export default StandingsWidget;
