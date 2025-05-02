import React, { useEffect, useState, useCallback } from 'react';
import { getFixtureStatistics } from '../services/api';

interface StatItem {
  label: string;
  home: number;
  away: number;
}

// API response types
interface ApiStatistic {
  type: string;
  value: string | number | null;
}

interface MatchStatsProps {
  homeTeam: {
    id: number;
    name: string;
  };
  awayTeam: {
    id: number;
    name: string;
  };
  matchId?: number;
  stats?: StatItem[];
  position?: 'left' | 'right'; // For split-screen layout
  secondaryStats?: boolean; // Show secondary stats instead of primary
}

const MatchStats: React.FC<MatchStatsProps> = ({ 
  homeTeam, 
  awayTeam,
  matchId,
  position = 'left',
  secondaryStats = false
}) => {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Provide default stats based on primary or secondary configuration
  const getDefaultStats = useCallback((): StatItem[] => {
    if (!secondaryStats) {
      return [
        { label: 'การครองบอล (%)', home: 50, away: 50 },
        { label: 'ยิงเข้ากรอบ', home: 0, away: 0 },
        { label: 'ยิงทั้งหมด', home: 0, away: 0 },
        { label: 'เตะมุม', home: 0, away: 0 },
        { label: 'ฟาวล์', home: 0, away: 0 }
      ];
    } else {
      return [
        { label: 'ใบเหลือง', home: 0, away: 0 },
        { label: 'ใบแดง', home: 0, away: 0 },
        { label: 'ล้ำหน้า', home: 0, away: 0 },
        { label: 'เซฟประตู', home: 0, away: 0 },
        { label: 'ส่งบอลถูกเป้า', home: 0, away: 0 }
      ];
    }
  }, [secondaryStats]);

  // Process statistic values from various formats
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
  
  // Fetch statistics from API if matchId is provided
  useEffect(() => {
    const fetchStats = async () => {
      if (!matchId) {
        // Use default stats if no matchId provided
        setStats(getDefaultStats());
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getFixtureStatistics(matchId);
        
        if (data && data.response && data.response.length >= 2) {
          // Format API data into our stats format
          const homeStats = data.response[0].statistics || [];
          const awayStats = data.response[1].statistics || [];
          
          const formattedStats: StatItem[] = [];
          
          // Map API stats to our format with Thai labels
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
          
          // Process each statistic type
          homeStats.forEach((stat: ApiStatistic, index: number) => {
            const key = stat.type;
            const thaiLabel = statsMap[key] || key;
            const homeValue = processStatValue(stat.value);
            const awayValue = processStatValue(awayStats[index]?.value || 0);
            
            if (homeValue !== null && awayValue !== null) {
              formattedStats.push({
                label: thaiLabel,
                home: homeValue,
                away: awayValue
              });
            }
          });
          
          // Filter stats based on primary or secondary display
          let filteredStats: StatItem[] = [];
          if (secondaryStats) {
            // Secondary stats: yellow/red cards, offsides, saves, accurate passes
            filteredStats = formattedStats.filter(stat => 
              stat.label === 'ใบเหลือง' || 
              stat.label === 'ใบแดง' || 
              stat.label === 'ล้ำหน้า' || 
              stat.label === 'เซฟประตู' || 
              stat.label === 'ส่งบอลถูกเป้า'
            );
          } else {
            // Primary stats: possession, shots on goal, total shots, corners, fouls
            filteredStats = formattedStats.filter(stat => 
              stat.label === 'การครองบอล (%)' || 
              stat.label === 'ยิงเข้ากรอบ' || 
              stat.label === 'ยิงทั้งหมด' || 
              stat.label === 'เตะมุม' || 
              stat.label === 'ฟาวล์'
            );
          }
          
          setStats(filteredStats.length > 0 ? filteredStats : getDefaultStats());
        } else {
          // Fallback to default stats if API didn't return expected data
          setStats(getDefaultStats());
        }
      } catch (err) {
        console.error('Error fetching match statistics:', err);
        setError('ไม่สามารถโหลดข้อมูลสถิติได้');
        setStats(getDefaultStats());
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [matchId, secondaryStats, getDefaultStats]);
  
  if (isLoading) {
    return (
      <div className="bg-bg-light rounded-b-lg p-4 border-t border-border-color text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-color"></div>
        <p className="mt-2 text-sm text-text-light">กำลังโหลดข้อมูลสถิติ...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-bg-light rounded-b-lg p-4 border-t border-border-color">
        <p className="text-red-500 text-center text-sm">{error}</p>
      </div>
    );
  }
  
  // Define title based on stat group
  const title = secondaryStats ? 'สถิติเพิ่มเติม' : 'สถิติการแข่งขัน';
  
  return (
    <div className={`bg-bg-light rounded-b-lg ${position === 'left' ? 'pr-2' : 'pl-2'}`}>
      <h3 className="text-center text-sm font-medium mb-4">{title}</h3>
      
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center space-x-2">
            {/* Home value */}
            <div className="text-right font-medium w-1/4 text-xs">
              {stat.home}
            </div>
            
            {/* Progress bar */}
            <div className="flex-grow">
              <div className="relative pt-1">
                <div className="flex items-center justify-center mb-1">
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
            
            {/* Away value */}
            <div className="text-left font-medium w-1/4 text-xs">
              {stat.away}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center items-center mt-4 text-xs text-text-light">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-primary-color rounded-full mr-1"></div>
          <span className="mr-3">{homeTeam.name}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-secondary-color rounded-full mr-1"></div>
          <span>{awayTeam.name}</span>
        </div>
      </div>
    </div>
  );
};

export default MatchStats;
