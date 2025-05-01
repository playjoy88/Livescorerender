import React from 'react';

interface StatItem {
  label: string;
  home: number;
  away: number;
}

interface MatchStatsProps {
  homeTeam: {
    name: string;
  };
  awayTeam: {
    name: string;
  };
  stats?: StatItem[];
}

const MatchStats: React.FC<MatchStatsProps> = ({ 
  homeTeam, 
  awayTeam, 
  stats = [
    { label: 'การครองบอล (%)', home: 55, away: 45 },
    { label: 'ยิงเข้ากรอบ', home: 7, away: 3 },
    { label: 'ยิงทั้งหมด', home: 15, away: 10 },
    { label: 'เตะมุม', home: 6, away: 4 },
    { label: 'ฟาวล์', home: 8, away: 12 }
  ] 
}) => {
  return (
    <div className="bg-bg-light rounded-b-lg p-4 border-t border-border-color">
      <h3 className="text-center text-sm font-medium mb-4">สถิติการแข่งขัน</h3>
      
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
