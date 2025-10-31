// Decorative Kalamkari pattern component inspired by traditional saree designs
import React from 'react';

interface DecorativePatternProps {
  className?: string;
  opacity?: string;
}

export const DecorativePattern: React.FC<DecorativePatternProps> = ({ 
  className = '', 
  opacity = 'opacity-5' 
}) => (
  <div className={`absolute inset-0 ${opacity} ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="kalamkari-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1"/>
          <path d="M 50 20 Q 70 50 50 80 Q 30 50 50 20" fill="none" stroke="currentColor" strokeWidth="1"/>
          <circle cx="50" cy="50" r="10" fill="currentColor"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#kalamkari-pattern)"/>
    </svg>
  </div>
);