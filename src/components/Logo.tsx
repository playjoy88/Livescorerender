import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { blobStorage } from '../services/vercelDb';
import { supabase } from '../services/supabaseClient';

// Logo component that uses Blob Storage instead of Next.js Image optimization
const Logo = () => {
  const [logoSettings, setLogoSettings] = useState({
    logoUrl: '/images/logo.png', // Default fallback
    altText: 'PlayJoy Live',
    width: 150,
    height: 40
  });
  
  // Load logo settings from database if available
  useEffect(() => {
    const fetchLogoSettings = async () => {
      try {
        // Try to get logo settings from Supabase
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('setting_type', 'logo')
          .single();
          
        if (error || !data) {
          console.log('Using default logo settings');
          return;
        }
        
        // Update logo settings from database
        setLogoSettings({
          logoUrl: data.image_url || '/images/logo.png',
          altText: data.alt_text || 'PlayJoy Live',
          width: data.width || 150,
          height: data.height || 40
        });
      } catch (error) {
        console.error('Error fetching logo settings:', error);
      }
    };
    
    fetchLogoSettings();
  }, []);
  
  // Format the logo URL properly using the blob service
  const formattedLogoUrl = blobStorage.isValidBlobUrl(logoSettings.logoUrl) 
    ? blobStorage.formatBlobUrl(logoSettings.logoUrl) 
    : logoSettings.logoUrl;
  
  return (
    <Link href="/" className="flex items-center">
      <div className="relative" style={{ width: logoSettings.width, height: logoSettings.height }}>
        <img 
          src={formattedLogoUrl}
          alt={logoSettings.altText}
          width={logoSettings.width}
          height={logoSettings.height}
          style={{ maxWidth: '100%', height: 'auto' }}
          onError={(e) => {
            // If image fails to load, fallback to text logo
            console.log("Logo image failed to load");
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>
      <div className="ml-2 text-sm text-text-light">
        Livescore
      </div>
    </Link>
  );
};

export default Logo;
