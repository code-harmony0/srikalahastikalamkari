// Decorative patterns inspired by traditional Indian saree designs
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

// Banarasi Silk Pattern - Intricate paisley and floral motifs
interface BanarasiPatternProps {
  className?: string;
  opacity?: string;
}

export const BanarasiPattern: React.FC<BanarasiPatternProps> = ({ 
  className = '', 
  opacity = 'opacity-5' 
}) => (
  <div className={`absolute inset-0 ${opacity} ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="banarasi-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          {/* Paisley motif */}
          <path d="M 60 20 Q 80 30 85 50 Q 80 70 60 80 Q 50 75 45 60 Q 50 40 60 20" 
                fill="none" stroke="currentColor" strokeWidth="1.5"/>
          {/* Inner paisley detail */}
          <path d="M 60 30 Q 70 35 72 45 Q 70 55 60 60 Q 55 57 53 50 Q 55 40 60 30" 
                fill="currentColor" opacity="0.3"/>
          {/* Decorative dots */}
          <circle cx="30" cy="30" r="2" fill="currentColor"/>
          <circle cx="90" cy="30" r="2" fill="currentColor"/>
          <circle cx="30" cy="90" r="2" fill="currentColor"/>
          <circle cx="90" cy="90" r="2" fill="currentColor"/>
          {/* Floral elements */}
          <circle cx="20" cy="60" r="8" fill="none" stroke="currentColor" strokeWidth="1"/>
          <circle cx="100" cy="60" r="8" fill="none" stroke="currentColor" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#banarasi-pattern)"/>
    </svg>
  </div>
);

// Kanjeevaram Pattern - Bold temple borders and geometric designs
interface KanjeevaramPatternProps {
  className?: string;
  opacity?: string;
}

export const KanjeevaramPattern: React.FC<KanjeevaramPatternProps> = ({ 
  className = '', 
  opacity = 'opacity-5' 
}) => (
  <div className={`absolute inset-0 ${opacity} ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="kanjeevaram-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          {/* Temple border design */}
          <rect x="10" y="10" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="2"/>
          <rect x="20" y="20" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1"/>
          {/* Geometric elements */}
          <polygon points="40,15 50,25 40,35 30,25" fill="currentColor" opacity="0.4"/>
          <polygon points="40,45 50,55 40,65 30,55" fill="currentColor" opacity="0.4"/>
          <polygon points="15,40 25,50 15,60 5,50" fill="currentColor" opacity="0.4"/>
          <polygon points="55,40 65,50 55,60 45,50" fill="currentColor" opacity="0.4"/>
          {/* Central motif */}
          <circle cx="40" cy="40" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="40" cy="40" r="3" fill="currentColor"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#kanjeevaram-pattern)"/>
    </svg>
  </div>
);

// Chanderi Pattern - Delicate floral and coin motifs
interface ChanderiPatternProps {
  className?: string;
  opacity?: string;
}

export const ChanderiPattern: React.FC<ChanderiPatternProps> = ({ 
  className = '', 
  opacity = 'opacity-5' 
}) => (
  <div className={`absolute inset-0 ${opacity} ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="chanderi-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          {/* Coin motifs */}
          <circle cx="25" cy="25" r="12" fill="none" stroke="currentColor" strokeWidth="1"/>
          <circle cx="75" cy="75" r="12" fill="none" stroke="currentColor" strokeWidth="1"/>
          <circle cx="25" cy="25" r="6" fill="currentColor" opacity="0.2"/>
          <circle cx="75" cy="75" r="6" fill="currentColor" opacity="0.2"/>
          {/* Delicate floral sprigs */}
          <path d="M 50 15 Q 55 20 50 25 Q 45 20 50 15" fill="currentColor" opacity="0.3"/>
          <path d="M 50 75 Q 55 80 50 85 Q 45 80 50 75" fill="currentColor" opacity="0.3"/>
          <path d="M 15 50 Q 20 55 15 60 Q 10 55 15 50" fill="currentColor" opacity="0.3"/>
          <path d="M 85 50 Q 90 55 85 60 Q 80 55 85 50" fill="currentColor" opacity="0.3"/>
          {/* Connecting lines */}
          <line x1="25" y1="37" x2="50" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
          <line x1="75" y1="63" x2="50" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#chanderi-pattern)"/>
    </svg>
  </div>
);

// Patola Pattern - Double ikat geometric designs
interface PatolaPatternProps {
  className?: string;
  opacity?: string;
}

export const PatolaPattern: React.FC<PatolaPatternProps> = ({ 
  className = '', 
  opacity = 'opacity-5' 
}) => (
  <div className={`absolute inset-0 ${opacity} ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="patola-pattern" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
          {/* Diamond lattice */}
          <polygon points="45,10 65,30 45,50 25,30" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <polygon points="45,40 65,60 45,80 25,60" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <polygon points="15,25 35,45 15,65 -5,45" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <polygon points="75,25 95,45 75,65 55,45" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          {/* Inner geometric fills */}
          <polygon points="45,20 55,30 45,40 35,30" fill="currentColor" opacity="0.3"/>
          <polygon points="45,50 55,60 45,70 35,60" fill="currentColor" opacity="0.3"/>
          {/* Star motifs */}
          <path d="M 20 20 L 22 25 L 27 25 L 23 28 L 25 33 L 20 30 L 15 33 L 17 28 L 13 25 L 18 25 Z" 
                fill="currentColor" opacity="0.4"/>
          <path d="M 70 70 L 72 75 L 77 75 L 73 78 L 75 83 L 70 80 L 65 83 L 67 78 L 63 75 L 68 75 Z" 
                fill="currentColor" opacity="0.4"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#patola-pattern)"/>
    </svg>
  </div>
);

// Bandhani Pattern - Tie-dye circular motifs
interface BandhaniPatternProps {
  className?: string;
  opacity?: string;
}

export const BandhaniPattern: React.FC<BandhaniPatternProps> = ({ 
  className = '', 
  opacity = 'opacity-5' 
}) => (
  <div className={`absolute inset-0 ${opacity} ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="bandhani-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          {/* Circular tie-dye motifs */}
          <circle cx="15" cy="15" r="8" fill="none" stroke="currentColor" strokeWidth="1"/>
          <circle cx="45" cy="15" r="8" fill="none" stroke="currentColor" strokeWidth="1"/>
          <circle cx="30" cy="30" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="15" cy="45" r="8" fill="none" stroke="currentColor" strokeWidth="1"/>
          <circle cx="45" cy="45" r="8" fill="none" stroke="currentColor" strokeWidth="1"/>
          {/* Inner dots */}
          <circle cx="15" cy="15" r="3" fill="currentColor" opacity="0.4"/>
          <circle cx="45" cy="15" r="3" fill="currentColor" opacity="0.4"/>
          <circle cx="30" cy="30" r="4" fill="currentColor" opacity="0.3"/>
          <circle cx="15" cy="45" r="3" fill="currentColor" opacity="0.4"/>
          <circle cx="45" cy="45" r="3" fill="currentColor" opacity="0.4"/>
          {/* Connecting dots */}
          <circle cx="7" cy="7" r="1.5" fill="currentColor" opacity="0.5"/>
          <circle cx="53" cy="7" r="1.5" fill="currentColor" opacity="0.5"/>
          <circle cx="7" cy="53" r="1.5" fill="currentColor" opacity="0.5"/>
          <circle cx="53" cy="53" r="1.5" fill="currentColor" opacity="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bandhani-pattern)"/>
    </svg>
  </div>
);

// Ikat Pattern - Blurred geometric designs
interface IkatPatternProps {
  className?: string;
  opacity?: string;
}

export const IkatPattern: React.FC<IkatPatternProps> = ({ 
  className = '', 
  opacity = 'opacity-5' 
}) => (
  <div className={`absolute inset-0 ${opacity} ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="blur">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1"/>
        </filter>
        <pattern id="ikat-pattern" x="0" y="0" width="110" height="110" patternUnits="userSpaceOnUse">
          {/* Blurred chevron patterns */}
          <path d="M 20 20 L 40 40 L 20 60 L 0 40 Z" fill="currentColor" opacity="0.3" filter="url(#blur)"/>
          <path d="M 70 20 L 90 40 L 70 60 L 50 40 Z" fill="currentColor" opacity="0.3" filter="url(#blur)"/>
          <path d="M 45 45 L 65 65 L 45 85 L 25 65 Z" fill="currentColor" opacity="0.2" filter="url(#blur)"/>
          {/* Sharp accent lines */}
          <line x1="10" y1="10" x2="100" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
          <line x1="10" y1="55" x2="100" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
          <line x1="10" y1="100" x2="100" y2="100" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
          {/* Vertical accents */}
          <line x1="30" y1="0" x2="30" y2="110" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
          <line x1="80" y1="0" x2="80" y2="110" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ikat-pattern)"/>
    </svg>
  </div>
);

// Chikankari Pattern - Delicate embroidery-inspired motifs
interface ChikankariPatternProps {
  className?: string;
  opacity?: string;
}

export const ChikankariPattern: React.FC<ChikankariPatternProps> = ({ 
  className = '', 
  opacity = 'opacity-5' 
}) => (
  <div className={`absolute inset-0 ${opacity} ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="chikankari-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          {/* Delicate floral vine */}
          <path d="M 10 40 Q 20 30 30 40 Q 40 50 50 40 Q 60 30 70 40" 
                fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
          {/* Small flowers */}
          <circle cx="20" cy="35" r="3" fill="none" stroke="currentColor" strokeWidth="0.8"/>
          <circle cx="40" cy="45" r="3" fill="none" stroke="currentColor" strokeWidth="0.8"/>
          <circle cx="60" cy="35" r="3" fill="none" stroke="currentColor" strokeWidth="0.8"/>
          {/* Petals */}
          <path d="M 20 32 Q 22 30 24 32" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <path d="M 20 38 Q 22 40 24 38" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <path d="M 40 42 Q 42 40 44 42" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          <path d="M 40 48 Q 42 50 44 48" fill="none" stroke="currentColor" strokeWidth="0.5"/>
          {/* Scattered dots */}
          <circle cx="15" cy="20" r="1" fill="currentColor" opacity="0.4"/>
          <circle cx="35" cy="25" r="1" fill="currentColor" opacity="0.4"/>
          <circle cx="55" cy="20" r="1" fill="currentColor" opacity="0.4"/>
          <circle cx="25" cy="60" r="1" fill="currentColor" opacity="0.4"/>
          <circle cx="45" cy="65" r="1" fill="currentColor" opacity="0.4"/>
          <circle cx="65" cy="60" r="1" fill="currentColor" opacity="0.4"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#chikankari-pattern)"/>
    </svg>
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