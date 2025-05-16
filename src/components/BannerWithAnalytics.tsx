import React, { useState, useEffect } from 'react';
import { getActiveAdvertisementsByPosition, Advertisement } from '../services/supabaseAdvertisementService';
import Banner from './Banner';

interface BannerWithAnalyticsProps {
  position: string;
  size?: 'small' | 'medium' | 'large';
}

const BannerWithAnalytics: React.FC<BannerWithAnalyticsProps> = ({ position, size = 'medium' }) => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const fetchedAds = await getActiveAdvertisementsByPosition(position);
        setAds(fetchedAds);
      } catch (err) {
        console.error(`Error fetching ads for position ${position}:`, err);
        setError(`ไม่สามารถโหลดข้อมูลโฆษณาตำแหน่ง ${position} ได้`);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [position]);

  // Calculate analytics totals
  const totalImpressions = ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="border p-4 rounded-lg bg-white">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : (
          <Banner position={position} size={size} />
        )}
      </div>
      
      <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg">
        <div className="analytics-stat">
          <span className="font-medium">{totalImpressions.toLocaleString()}</span> การแสดงผล
        </div>
        <div className="analytics-stat">
          <span className="font-medium">{totalClicks.toLocaleString()}</span> คลิก
        </div>
        <div className="analytics-stat">
          <span className="font-medium">{ctr.toFixed(1)}%</span> CTR
        </div>
        <div className="analytics-stat">
          <span className="font-medium">{ads.length}</span> โฆษณาใช้งาน
        </div>
      </div>
    </div>
  );
};

export default BannerWithAnalytics;
