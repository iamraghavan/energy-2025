import {
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

const SoccerBallIcon = (props: LucideProps) => (
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
    <circle cx="12" cy="12" r="10" />
    <path d="M12 18.2a4.93 4.93 0 0 1-4.82-3.6" />
    <path d="M12 5.8a4.93 4.93 0 0 1 4.82 3.6" />
    <path d="M18.18 12a4.93 4.93 0 0 1-3.58-4.82" />
    <path d="M5.82 12a4.93 4.93 0 0 1 3.58 4.82" />
    <path d="M12 12l4.82 3.6" />
    <path d="M12 12l-4.82-3.6" />
    <path d="M12 12l-3.6 4.82" />
    <path d="M12 12l3.6-4.82" />
    <path d="M15.58 7.38l-3.58 4.82" />
    <path d="M8.42 16.62l3.58-4.82" />
    <path d="M16.62 15.58l-4.82-3.58" />
    <path d="M7.38 8.42l4.82 3.58" />
  </svg>
)

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
        return SoccerBallIcon;
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
