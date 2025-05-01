import React from 'react';

interface BannerProps {
  position: 'hero' | 'in-feed' | 'sidebar' | 'pre-footer' | 'interstitial';
  size?: 'small' | 'medium' | 'large';
}

const Banner: React.FC<BannerProps> = ({ position, size = 'medium' }) => {
  // Get ad description based on position
  const getAdDescription = (pos: string) => {
    switch (pos) {
      case 'hero':
        return 'ส่วนบนสุด';
      case 'in-feed':
        return 'ในฟีด';
      case 'sidebar':
        return 'ด้านข้าง';
      case 'pre-footer':
        return 'ก่อนส่วนท้าย';
      case 'interstitial':
        return 'ระหว่างเนื้อหา';
      default:
        return '';
    }
  };
  // Determine banner style based on position and size
  const getBannerStyle = () => {
    let className = 'ad-placeholder rounded-lg text-center overflow-hidden ';
    
    switch (position) {
      case 'hero':
        className += 'w-full h-32 md:h-40 mb-6 ';
        break;
      case 'in-feed':
        className += 'w-full h-24 my-4 ';
        break;
      case 'sidebar':
        className += 'w-full h-64 mb-6 ';
        break;
      case 'pre-footer':
        className += 'w-full h-28 my-8 ';
        break;
      case 'interstitial':
        className += 'w-full h-20 my-4 ';
        break;
      default:
        className += 'w-full h-24 my-4 ';
    }
    
    switch (size) {
      case 'small':
        className += 'text-sm';
        break;
      case 'medium':
        className += 'text-base';
        break;
      case 'large':
        className += 'text-lg';
        break;
      default:
        className += 'text-base';
    }
    
    return className;
  };
  
  return (
    <div className={getBannerStyle()}>
      <div className="h-full w-full bg-gradient-to-br from-primary-color to-accent-color flex flex-col items-center justify-center p-4 text-white">
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="font-bold text-lg">โฆษณา {getAdDescription(position)}</span>
        </div>
        <p className="text-center text-sm">
          {size === 'large' ? 'สมัครวันนี้รับโบนัส 100%' : 'สมัครสมาชิกวันนี้'}
        </p>
        {size === 'large' && (
          <div className="mt-2 bg-white bg-opacity-20 py-1 px-3 rounded-full text-sm">
            www.betthaisport.com
          </div>
        )}
      </div>
    </div>
  );
};

export default Banner;
