import React, { useState } from 'react';

interface PinButtonProps {
  matchId: number;
  initialPinned?: boolean;
  onTogglePin?: (matchId: number, isPinned: boolean) => void;
  small?: boolean;
}

const PinButton: React.FC<PinButtonProps> = ({ 
  matchId, 
  initialPinned = false,
  onTogglePin,
  small = false
}) => {
  const [isPinned, setIsPinned] = useState(initialPinned);
  
  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    const newPinState = !isPinned;
    setIsPinned(newPinState);
    
    if (onTogglePin) {
      onTogglePin(matchId, newPinState);
    }
    
    // In a real app, we'd save the pin state to local storage or user account
    const pinnedMatches = JSON.parse(localStorage.getItem('pinnedMatches') || '[]');
    
    if (newPinState) {
      // Add to pinned matches if not already there
      if (!pinnedMatches.includes(matchId)) {
        pinnedMatches.push(matchId);
      }
    } else {
      // Remove from pinned matches
      const index = pinnedMatches.indexOf(matchId);
      if (index > -1) {
        pinnedMatches.splice(index, 1);
      }
    }
    
    localStorage.setItem('pinnedMatches', JSON.stringify(pinnedMatches));
  };
  
  return (
    <button 
      className={`${small ? 'p-0.5' : 'p-1'} rounded-md transition-colors text-sm ${
        isPinned 
          ? 'bg-accent-color text-white' 
          : 'bg-white border border-gray-200 text-text-light hover:text-accent-color'
      }`}
      onClick={togglePin}
      title={isPinned ? 'ปักหมุดอยู่แล้ว (คลิกเพื่อยกเลิก)' : 'ปักหมุดการแข่งขันนี้'}
      aria-label={isPinned ? 'ยกเลิกการปักหมุด' : 'ปักหมุดการแข่งขัน'}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill={isPinned ? "#ff6600" : "none"} 
        viewBox="0 0 24 24" 
        stroke={isPinned ? "#ff6600" : "currentColor"} 
        className={`${small ? 'w-4 h-4' : 'w-5 h-5'}`}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    </button>
  );
};

export default PinButton;
