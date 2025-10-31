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

// Floating decorative dots inspired by traditional Indian textile motifs
interface FloatingDotsProps {
  className?: string;
  count?: number;
}

export const FloatingDots: React.FC<FloatingDotsProps> = ({ 
  className = '', 
  count = 8 
}) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-accent-color/20 rounded-full animate-pulse"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 2}s`,
        }}
      />
    ))}
  </div>
);

// Decorative border inspired by saree borders
interface DecorativeBorderProps {
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const DecorativeBorder: React.FC<DecorativeBorderProps> = ({ 
  className = '', 
  position = 'top' 
}) => {
  const borderClasses = {
    top: 'top-0 left-0 right-0 h-1',
    bottom: 'bottom-0 left-0 right-0 h-1',
    left: 'left-0 top-0 bottom-0 w-1',
    right: 'right-0 top-0 bottom-0 w-1',
  };

  return (
    <div className={`absolute ${borderClasses[position]} bg-gradient-to-r from-accent-color via-primary to-accent-color opacity-30 ${className}`} />
  );
};