import React, { useState, useEffect } from 'react';
import { getActiveAdvertisementsByPosition as getActiveAdsByPosition, trackImpression, trackClick, Advertisement, blobStorage } from '../services/supabaseAdvertisementService';

interface BannerProps {
  position: string;
  size?: 'small' | 'medium' | 'large'; // Add size prop
}

const Banner: React.FC<BannerProps> = ({ position, size = 'medium' }) => {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const ads = await getActiveAdsByPosition(position);
        if (ads.length > 0) {
          // Select a random ad from the list
          const randomAd = ads[Math.floor(Math.random() * ads.length)];
          setAd(randomAd);
          // Track impression
          await trackImpression(randomAd.id);
        }
      } catch (error) {
        console.error('Error fetching ad:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [position]);

  const handleClick = async () => {
    if (ad) {
      await trackClick(ad.id);
      window.open(ad.url, '_blank');
    }
  };

  if (loading) {
    return <div>Loading ad...</div>;
  }

  if (!ad) {
    return <div>No ad available</div>;
  }

  // Apply different sizes based on the size prop
  const getSizeClass = () => {
    switch(size) {
      case 'small': return 'max-w-xs';
      case 'large': return 'w-full';
      case 'medium':
      default: return 'max-w-2xl';
    }
  };

  return (
    <div 
      className={`banner ${ad.position} ${getSizeClass()} mx-auto overflow-hidden rounded-lg shadow-md`} 
      onClick={handleClick} 
      style={{ cursor: 'pointer' }}
    >
      <img 
        src={blobStorage.formatBlobUrl(ad.imageUrl)} 
        alt={ad.name} 
        style={{ width: '100%', height: 'auto' }} 
        className="transition-transform hover:scale-105 duration-300"
      />
    </div>
  );
};

export default Banner;
