// Decorative patterns inspired by traditional Indian saree designs
import React from 'react';

interface DecorativePatternProps {
  className?: string;
  opacity?: string;
}

export const DecorativePattern: React.FC<DecorativePatternProps> = ({ 
  className = '', 
  opacity = 'opacity-10' 
}) => (
  <div className={`absolute inset-0 ${opacity} ${className}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="enhanced-floral-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          {/* Large lotus flower */}
          <g transform="translate(60,60)">
            <path d="M 0 -25 Q 15 -20 20 -5 Q 15 10 0 15 Q -15 10 -20 -5 Q -15 -20 0 -25" 
                  fill="currentColor" opacity="0.4"/>
            <path d="M 0 -20 Q 12 -15 15 -3 Q 12 8 0 12 Q -12 8 -15 -3 Q -12 -15 0 -20" 
                  fill="currentColor" opacity="0.6"/>
            <circle cx="0" cy="0" r="6" fill="currentColor" opacity="0.8"/>
            {/* Petals around lotus */}
            <path d="M 0 -30 Q 8 -25 0 -20 Q -8 -25 0 -30" fill="currentColor" opacity="0.3"/>
            <path d="M 21 -15 Q 26 -7 21 -2 Q 16 -7 21 -15" fill="currentColor" opacity="0.3"/>
            <path d="M 21 15 Q 26 7 21 2 Q 16 7 21 15" fill="currentColor" opacity="0.3"/>
            <path d="M 0 30 Q 8 25 0 20 Q -8 25 0 30" fill="currentColor" opacity="0.3"/>
            <path d="M -21 15 Q -26 7 -21 2 Q -16 7 -21 15" fill="currentColor" opacity="0.3"/>
            <path d="M -21 -15 Q -26 -7 -21 -2 Q -16 -7 -21 -15" fill="currentColor" opacity="0.3"/>
          </g>
          
          {/* Decorative leaves in corners */}
          <g transform="translate(20,20)">
            <path d="M 0 0 Q 8 -5 15 0 Q 8 8 0 5 Q -5 2 0 0" fill="currentColor" opacity="0.3"/>
            <path d="M 2 1 Q 6 -2 10 1 Q 6 5 2 3" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
          </g>
          <g transform="translate(100,20)">
            <path d="M 0 0 Q -8 -5 -15 0 Q -8 8 0 5 Q 5 2 0 0" fill="currentColor" opacity="0.3"/>
            <path d="M -2 1 Q -6 -2 -10 1 Q -6 5 -2 3" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
          </g>
          <g transform="translate(20,100)">
            <path d="M 0 0 Q 8 5 15 0 Q 8 -8 0 -5 Q -5 -2 0 0" fill="currentColor" opacity="0.3"/>
            <path d="M 2 -1 Q 6 2 10 -1 Q 6 -5 2 -3" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
          </g>
          <g transform="translate(100,100)">
            <path d="M 0 0 Q -8 5 -15 0 Q -8 -8 0 -5 Q 5 -2 0 0" fill="currentColor" opacity="0.3"/>
            <path d="M -2 -1 Q -6 2 -10 -1 Q -6 -5 -2 -3" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
          </g>
          
          {/* Small decorative dots */}
          <circle cx="30" cy="60" r="2" fill="currentColor" opacity="0.4"/>
          <circle cx="90" cy="60" r="2" fill="currentColor" opacity="0.4"/>
          <circle cx="60" cy="30" r="2" fill="currentColor" opacity="0.4"/>
          <circle cx="60" cy="90" r="2" fill="currentColor" opacity="0.4"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#enhanced-floral-pattern)"/>
    </svg>
  </div>
);

// Banarasi Silk Pattern - Enhanced with more visible Indian-inspired floral and leaf motifs
interface BanarasiPatternProps {
  className?: string;
  opacity?: string;
  animated?: boolean;
}

export const BanarasiPattern: React.FC<BanarasiPatternProps> = ({ 
  className = '', 
  opacity = 'opacity-10',
  animated = false
}) => (
  <div className={`absolute inset-0 ${opacity} ${className} ${animated ? 'animate-pattern-float' : ''}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="enhanced-banarasi-pattern" x="0" y="0" width="140" height="140" patternUnits="userSpaceOnUse">
          {/* Large paisley motif with enhanced visibility */}
          <g transform="translate(70,70)">
            <path d="M 0 -35 Q 25 -30 30 -5 Q 25 20 0 25 Q -15 20 -20 0 Q -15 -25 0 -35" 
                  fill="currentColor" opacity="0.6" stroke="currentColor" strokeWidth="1.5"/>
            {/* Inner paisley detail */}
            <path d="M 0 -25 Q 18 -20 22 -3 Q 18 15 0 18 Q -10 15 -13 0 Q -10 -18 0 -25" 
                  fill="currentColor" opacity="0.8"/>
            {/* Paisley center with gradient effect */}
            <circle cx="0" cy="0" r="8" fill="currentColor" opacity="0.9"/>
            <circle cx="0" cy="0" r="4" fill="currentColor"/>
            {/* Decorative dots around paisley */}
            <circle cx="-15" cy="-10" r="2" fill="currentColor" opacity="0.7"/>
            <circle cx="15" cy="10" r="2" fill="currentColor" opacity="0.7"/>
            <circle cx="10" cy="-15" r="1.5" fill="currentColor" opacity="0.6"/>
          </g>
          
          {/* Enhanced floral elements with more detail */}
          <g transform="translate(25,25)">
            <circle cx="0" cy="0" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.7"/>
            <circle cx="0" cy="0" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
            <path d="M 0 -10 Q 5 -5 0 0 Q -5 -5 0 -10" fill="currentColor" opacity="0.6"/>
            <path d="M 10 0 Q 5 5 0 0 Q 5 -5 10 0" fill="currentColor" opacity="0.6"/>
            <path d="M 0 10 Q -5 5 0 0 Q 5 5 0 10" fill="currentColor" opacity="0.6"/>
            <path d="M -10 0 Q -5 -5 0 0 Q -5 5 -10 0" fill="currentColor" opacity="0.6"/>
            {/* Central flower detail */}
            <circle cx="0" cy="0" r="3" fill="currentColor" opacity="0.8"/>
          </g>
          
          <g transform="translate(115,115)">
            <circle cx="0" cy="0" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.7"/>
            <circle cx="0" cy="0" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
            <path d="M 0 -10 Q 5 -5 0 0 Q -5 -5 0 -10" fill="currentColor" opacity="0.6"/>
            <path d="M 10 0 Q 5 5 0 0 Q 5 -5 10 0" fill="currentColor" opacity="0.6"/>
            <path d="M 0 10 Q -5 5 0 0 Q 5 5 0 10" fill="currentColor" opacity="0.6"/>
            <path d="M -10 0 Q -5 -5 0 0 Q -5 5 -10 0" fill="currentColor" opacity="0.6"/>
            <circle cx="0" cy="0" r="3" fill="currentColor" opacity="0.8"/>
          </g>
          
          {/* Enhanced decorative leaf motifs */}
          <g transform="translate(25,115)">
            <path d="M 0 0 Q 12 -10 24 0 Q 18 15 6 12 Q -6 10 0 0" fill="currentColor" opacity="0.5"/>
            <path d="M 4 3 Q 10 -4 16 3 Q 12 10 8 9" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
            <path d="M 8 6 Q 12 2 16 6" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
          </g>
          
          <g transform="translate(115,25)">
            <path d="M 0 0 Q -12 -10 -24 0 Q -18 15 -6 12 Q 6 10 0 0" fill="currentColor" opacity="0.5"/>
            <path d="M -4 3 Q -10 -4 -16 3 Q -12 10 -8 9" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7"/>
            <path d="M -8 6 Q -12 2 -16 6" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/>
          </g>
          
          {/* Enhanced decorative dots with varying sizes */}
          <circle cx="50" cy="25" r="4" fill="currentColor" opacity="0.7"/>
          <circle cx="90" cy="50" r="3.5" fill="currentColor" opacity="0.6"/>
          <circle cx="50" cy="115" r="4" fill="currentColor" opacity="0.7"/>
          <circle cx="10" cy="90" r="3.5" fill="currentColor" opacity="0.6"/>
          
          {/* Additional small accent dots */}
          <circle cx="70" cy="35" r="2" fill="currentColor" opacity="0.5"/>
          <circle cx="35" cy="70" r="2" fill="currentColor" opacity="0.5"/>
          <circle cx="105" cy="105" r="2" fill="currentColor" opacity="0.5"/>
          
          {/* Enhanced connecting vine elements */}
          <path d="M 35 35 Q 50 45 65 35" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
          <path d="M 105 75 Q 90 85 75 75" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
          <path d="M 20 60 Q 35 70 50 60" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
          <path d="M 90 20 Q 105 30 120 20" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
        </pattern>
        
        {/* Animated gradient overlay for shimmer effect */}
        <linearGradient id="shimmer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0">
            <animate attributeName="stop-opacity" values="0;0.3;0" dur="4s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" stopColor="currentColor" stopOpacity="0">
            <animate attributeName="stop-opacity" values="0;0.5;0" dur="4s" repeatCount="indefinite" begin="1s"/>
          </stop>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0">
            <animate attributeName="stop-opacity" values="0;0.3;0" dur="4s" repeatCount="indefinite" begin="2s"/>
          </stop>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#enhanced-banarasi-pattern)"/>
      {animated && (
        <rect width="100%" height="100%" fill="url(#shimmer-gradient)" opacity="0.3"/>
      )}
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

// Kalamkari Hero Pattern - Soft floral and paisley background for hero sections
interface KalamkariHeroPatternProps {
  className?: string;
  opacity?: string;
  animated?: boolean;
}

export const KalamkariHeroPattern: React.FC<KalamkariHeroPatternProps> = ({ 
  className = '', 
  opacity = 'opacity-5',
  animated = false
}) => (
  <div className={`absolute inset-0 ${opacity} ${className} ${animated ? 'animate-pattern-float' : ''}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Fabric grain texture filter */}
        <filter id="fabric-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence baseFrequency="0.9" numOctaves="4" result="noise"/>
          <feColorMatrix in="noise" type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0.1 0.15 0.1 0.2"/>
          </feComponentTransfer>
          <feComposite operator="multiply" in2="SourceGraphic"/>
        </filter>

        {/* Soft gradient for depth */}
        <radialGradient id="soft-depth" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.1"/>
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.05"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.02"/>
        </radialGradient>

        <pattern id="kalamkari-hero-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          {/* Large central paisley with soft edges */}
          <g transform="translate(100,100)">
            <path d="M 0 -50 Q 35 -45 45 -10 Q 40 30 0 40 Q -25 30 -30 0 Q -25 -35 0 -50" 
                  fill="currentColor" opacity="0.08" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.05"/>
            {/* Inner paisley detail */}
            <path d="M 0 -35 Q 25 -30 32 -8 Q 28 22 0 28 Q -18 22 -22 0 Q -18 -25 0 -35" 
                  fill="currentColor" opacity="0.12"/>
            {/* Soft center */}
            <circle cx="0" cy="0" r="12" fill="currentColor" opacity="0.15"/>
            <circle cx="0" cy="0" r="6" fill="currentColor" opacity="0.2"/>
            
            {/* Delicate decorative dots around paisley */}
            <circle cx="-20" cy="-15" r="2" fill="currentColor" opacity="0.1"/>
            <circle cx="20" cy="15" r="2" fill="currentColor" opacity="0.1"/>
            <circle cx="15" cy="-20" r="1.5" fill="currentColor" opacity="0.08"/>
            <circle cx="-15" cy="20" r="1.5" fill="currentColor" opacity="0.08"/>
          </g>
          
          {/* Soft floral motifs in corners */}
          <g transform="translate(40,40)">
            <circle cx="0" cy="0" r="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.06"/>
            <circle cx="0" cy="0" r="12" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.04"/>
            {/* Flower petals */}
            <path d="M 0 -12 Q 6 -6 0 0 Q -6 -6 0 -12" fill="currentColor" opacity="0.08"/>
            <path d="M 12 0 Q 6 6 0 0 Q 6 -6 12 0" fill="currentColor" opacity="0.08"/>
            <path d="M 0 12 Q -6 6 0 0 Q 6 6 0 12" fill="currentColor" opacity="0.08"/>
            <path d="M -12 0 Q -6 -6 0 0 Q -6 6 -12 0" fill="currentColor" opacity="0.08"/>
            <circle cx="0" cy="0" r="4" fill="currentColor" opacity="0.12"/>
          </g>
          
          <g transform="translate(160,160)">
            <circle cx="0" cy="0" r="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.06"/>
            <circle cx="0" cy="0" r="12" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.04"/>
            <path d="M 0 -12 Q 6 -6 0 0 Q -6 -6 0 -12" fill="currentColor" opacity="0.08"/>
            <path d="M 12 0 Q 6 6 0 0 Q 6 -6 12 0" fill="currentColor" opacity="0.08"/>
            <path d="M 0 12 Q -6 6 0 0 Q 6 6 0 12" fill="currentColor" opacity="0.08"/>
            <path d="M -12 0 Q -6 -6 0 0 Q -6 6 -12 0" fill="currentColor" opacity="0.08"/>
            <circle cx="0" cy="0" r="4" fill="currentColor" opacity="0.12"/>
          </g>

          {/* Delicate leaf motifs */}
          <g transform="translate(40,160)">
            <path d="M 0 0 Q 15 -12 30 0 Q 22 18 8 15 Q -8 12 0 0" fill="currentColor" opacity="0.06"/>
            <path d="M 6 4 Q 15 -6 24 4 Q 18 12 12 11" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.04"/>
            <path d="M 12 8 Q 18 4 24 8" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.03"/>
          </g>
          
          <g transform="translate(160,40)">
            <path d="M 0 0 Q -15 -12 -30 0 Q -22 18 -8 15 Q 8 12 0 0" fill="currentColor" opacity="0.06"/>
            <path d="M -6 4 Q -15 -6 -24 4 Q -18 12 -12 11" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.04"/>
            <path d="M -12 8 Q -18 4 -24 8" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.03"/>
          </g>

          {/* Scattered small paisley motifs */}
          <g transform="translate(70,30)">
            <path d="M 0 -8 Q 6 -6 8 -2 Q 6 4 0 6 Q -4 4 -5 0 Q -4 -5 0 -8" 
                  fill="currentColor" opacity="0.06"/>
            <circle cx="0" cy="0" r="2" fill="currentColor" opacity="0.08"/>
          </g>
          
          <g transform="translate(130,170)">
            <path d="M 0 -8 Q 6 -6 8 -2 Q 6 4 0 6 Q -4 4 -5 0 Q -4 -5 0 -8" 
                  fill="currentColor" opacity="0.06"/>
            <circle cx="0" cy="0" r="2" fill="currentColor" opacity="0.08"/>
          </g>

          {/* Delicate connecting vines */}
          <path d="M 60 60 Q 80 70 100 60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <path d="M 140 140 Q 120 130 100 140" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.04"/>
          <path d="M 30 100 Q 50 110 70 100" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.03"/>
          <path d="M 130 100 Q 150 110 170 100" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.03"/>

          {/* Tiny decorative dots for texture */}
          <circle cx="80" cy="50" r="1" fill="currentColor" opacity="0.05"/>
          <circle cx="120" cy="80" r="1" fill="currentColor" opacity="0.05"/>
          <circle cx="50" cy="120" r="1" fill="currentColor" opacity="0.05"/>
          <circle cx="150" cy="150" r="1" fill="currentColor" opacity="0.05"/>
          <circle cx="25" cy="75" r="1" fill="currentColor" opacity="0.05"/>
          <circle cx="175" cy="125" r="1" fill="currentColor" opacity="0.05"/>
        </pattern>
      </defs>
      
      {/* Base pattern */}
      <rect width="100%" height="100%" fill="url(#kalamkari-hero-pattern)"/>
      
      {/* Soft depth overlay */}
      <rect width="100%" height="100%" fill="url(#soft-depth)"/>
      
      {/* Fabric grain texture */}
      <rect width="100%" height="100%" fill="currentColor" opacity="0.02" filter="url(#fabric-grain)"/>
    </svg>
  </div>
);

// Diagonal Flowing Kalamkari Paisley Pattern - Softly blurred with fabric depth
interface DiagonalKalamkariPatternProps {
  className?: string;
  opacity?: string;
  animated?: boolean;
}

export const DiagonalKalamkariPattern: React.FC<DiagonalKalamkariPatternProps> = ({ 
  className = '', 
  opacity = 'opacity-10',
  animated = false
}) => (
  <div className={`absolute inset-0 ${opacity} ${className} ${animated ? 'animate-diagonal-flow' : ''}`}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Soft blur filter for paisley patterns */}
        <filter id="soft-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5"/>
          <feColorMatrix type="saturate" values="0.8"/>
        </filter>

        {/* Fabric depth shadow filter */}
        <filter id="fabric-depth" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="1" dy="2" stdDeviation="3" floodColor="currentColor" floodOpacity="0.15"/>
          <feDropShadow dx="-0.5" dy="1" stdDeviation="1.5" floodColor="currentColor" floodOpacity="0.1"/>
        </filter>

        {/* Enhanced fabric grain with depth */}
        <filter id="enhanced-fabric-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence baseFrequency="0.8" numOctaves="3" result="noise"/>
          <feColorMatrix in="noise" type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0.05 0.1 0.05 0.15"/>
          </feComponentTransfer>
          <feComposite operator="multiply" in2="SourceGraphic"/>
          <feDropShadow dx="0.5" dy="1" stdDeviation="1" floodColor="currentColor" floodOpacity="0.08"/>
        </filter>

        {/* Diagonal flowing pattern - rotated 45 degrees */}
        <pattern id="diagonal-kalamkari-pattern" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          
          {/* Large flowing paisley - main focal point */}
          <g transform="translate(150,80)">
            <path d="M 0 -60 Q 45 -55 55 -15 Q 50 35 0 50 Q -30 35 -35 0 Q -30 -40 0 -60" 
                  fill="currentColor" opacity="0.12" filter="url(#soft-blur)"/>
            {/* Inner paisley with gradient effect */}
            <path d="M 0 -45 Q 32 -40 40 -10 Q 35 25 0 35 Q -22 25 -26 0 Q -22 -30 0 -45" 
                  fill="currentColor" opacity="0.18" filter="url(#soft-blur)"/>
            {/* Paisley center with soft glow */}
            <circle cx="0" cy="0" r="15" fill="currentColor" opacity="0.25" filter="url(#soft-blur)"/>
            <circle cx="0" cy="0" r="8" fill="currentColor" opacity="0.3"/>
            
            {/* Flowing decorative elements around main paisley */}
            <path d="M -25 -20 Q -15 -25 -5 -20 Q -15 -10 -25 -20" fill="currentColor" opacity="0.15" filter="url(#soft-blur)"/>
            <path d="M 25 20 Q 35 15 45 20 Q 35 30 25 20" fill="currentColor" opacity="0.15" filter="url(#soft-blur)"/>
            <path d="M 20 -25 Q 30 -30 40 -25 Q 30 -15 20 -25" fill="currentColor" opacity="0.12" filter="url(#soft-blur)"/>
          </g>
          
          {/* Medium paisley - secondary flow */}
          <g transform="translate(80,220)">
            <path d="M 0 -40 Q 28 -35 35 -8 Q 30 20 0 30 Q -18 20 -22 0 Q -18 -25 0 -40" 
                  fill="currentColor" opacity="0.1" filter="url(#soft-blur)"/>
            <path d="M 0 -28 Q 20 -24 25 -5 Q 22 15 0 20 Q -12 15 -15 0 Q -12 -18 0 -28" 
                  fill="currentColor" opacity="0.15" filter="url(#soft-blur)"/>
            <circle cx="0" cy="0" r="8" fill="currentColor" opacity="0.2" filter="url(#soft-blur)"/>
          </g>

          {/* Small paisley - tertiary flow */}
          <g transform="translate(220,160)">
            <path d="M 0 -25 Q 18 -22 22 -5 Q 20 12 0 18 Q -12 12 -14 0 Q -12 -15 0 -25" 
                  fill="currentColor" opacity="0.08" filter="url(#soft-blur)"/>
            <circle cx="0" cy="0" r="6" fill="currentColor" opacity="0.12" filter="url(#soft-blur)"/>
          </g>

          {/* Flowing vine connections */}
          <path d="M 120 60 Q 140 80 160 100 Q 180 120 200 140" 
                fill="none" stroke="currentColor" strokeWidth="2" opacity="0.08" filter="url(#soft-blur)"/>
          <path d="M 60 180 Q 80 200 100 220 Q 120 240 140 260" 
                fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.06" filter="url(#soft-blur)"/>
          
          {/* Delicate floral sprigs along the flow */}
          <g transform="translate(180,120)">
            <path d="M 0 -8 Q 4 -4 0 0 Q -4 -4 0 -8" fill="currentColor" opacity="0.1" filter="url(#soft-blur)"/>
            <path d="M 8 0 Q 4 4 0 0 Q 4 -4 8 0" fill="currentColor" opacity="0.1" filter="url(#soft-blur)"/>
            <path d="M 0 8 Q -4 4 0 0 Q 4 4 0 8" fill="currentColor" opacity="0.1" filter="url(#soft-blur)"/>
            <path d="M -8 0 Q -4 -4 0 0 Q -4 4 -8 0" fill="currentColor" opacity="0.1" filter="url(#soft-blur)"/>
            <circle cx="0" cy="0" r="2" fill="currentColor" opacity="0.15"/>
          </g>

          <g transform="translate(100,180)">
            <path d="M 0 -6 Q 3 -3 0 0 Q -3 -3 0 -6" fill="currentColor" opacity="0.08" filter="url(#soft-blur)"/>
            <path d="M 6 0 Q 3 3 0 0 Q 3 -3 6 0" fill="currentColor" opacity="0.08" filter="url(#soft-blur)"/>
            <path d="M 0 6 Q -3 3 0 0 Q 3 3 0 6" fill="currentColor" opacity="0.08" filter="url(#soft-blur)"/>
            <path d="M -6 0 Q -3 -3 0 0 Q -3 3 -6 0" fill="currentColor" opacity="0.08" filter="url(#soft-blur)"/>
            <circle cx="0" cy="0" r="1.5" fill="currentColor" opacity="0.12"/>
          </g>

          {/* Scattered decorative dots following the diagonal flow */}
          <circle cx="140" cy="40" r="2" fill="currentColor" opacity="0.08" filter="url(#soft-blur)"/>
          <circle cx="160" cy="80" r="1.5" fill="currentColor" opacity="0.06" filter="url(#soft-blur)"/>
          <circle cx="200" cy="120" r="2.5" fill="currentColor" opacity="0.1" filter="url(#soft-blur)"/>
          <circle cx="240" cy="180" r="1.8" fill="currentColor" opacity="0.07" filter="url(#soft-blur)"/>
          <circle cx="120" cy="200" r="2.2" fill="currentColor" opacity="0.09" filter="url(#soft-blur)"/>
          <circle cx="80" cy="160" r="1.2" fill="currentColor" opacity="0.05" filter="url(#soft-blur)"/>

          {/* Additional small paisley elements for richness */}
          <g transform="translate(40,120)">
            <path d="M 0 -12 Q 8 -10 10 -3 Q 8 6 0 9 Q -6 6 -7 0 Q -6 -8 0 -12" 
                  fill="currentColor" opacity="0.06" filter="url(#soft-blur)"/>
          </g>
          
          <g transform="translate(260,80)">
            <path d="M 0 -10 Q 6 -8 8 -2 Q 6 5 0 7 Q -4 5 -5 0 Q -4 -6 0 -10" 
                  fill="currentColor" opacity="0.05" filter="url(#soft-blur)"/>
          </g>
        </pattern>

        {/* Animation keyframes for diagonal flow */}
        <animateTransform 
          attributeName="patternTransform" 
          type="translate" 
          values="0,0; 50,50; 0,0" 
          dur="25s" 
          repeatCount="indefinite"/>
      </defs>
      
      {/* Base diagonal pattern with fabric depth */}
      <rect width="100%" height="100%" fill="url(#diagonal-kalamkari-pattern)" filter="url(#fabric-depth)"/>
      
      {/* Enhanced fabric grain overlay */}
      <rect width="100%" height="100%" fill="currentColor" opacity="0.03" filter="url(#enhanced-fabric-grain)"/>
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