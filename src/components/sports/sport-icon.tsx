import {
  SoccerBall,
  Dribbble,
  Swords,
  Volleyball,
  Disc2,
  Users,
  Trophy,
  Crown,
  type Icon,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface SportIconProps extends LucideProps {
  sportName: string;
}

// A component to render a placeholder for an icon that doesn't exist in lucide-react
const PlaceholderIcon = (props: LucideProps) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
    >
        <path d="m6.233 16.692-1.62 1.62a1 1 0 0 0 0 1.414l.707.707a1 1 0 0 0 1.414 0l1.62-1.62"/>
        <path d="m14.814 8.107 1.62-1.62a1 1 0 0 0 0-1.414l-.707-.707a1 1 0 0 0-1.414 0l-1.62 1.62"/>
        <path d="m12.353 10.566 2.46-2.46"/>
        <path d="m17.253 15.466 2.46-2.46"/>
        <path d="m8.923 13.982 2.829-2.829-4.243-4.242-2.829 2.829z"/>
    </svg>
)

export function SportIcon({ sportName, ...props }: SportIconProps) {
  const IconComponent: Icon = (() => {
    switch (sportName.toLowerCase()) {
      case 'football':
        return SoccerBall;
      case 'basketball':
        return Dribbble;
      case 'cricket':
        return Swords;
      case 'volleyball':
        return Volleyball;
      case 'badminton':
        return PlaceholderIcon;
      case 'table tennis':
        return Disc2;
      case 'kabaddi':
        return Users;
      case 'athletics':
        return Trophy;
      case 'chess':
        return Crown;
      default:
        return Users; // A generic fallback icon
    }
  })();

  return <IconComponent {...props} />;
}
