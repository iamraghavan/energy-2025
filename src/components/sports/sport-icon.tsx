import {
  SoccerBall,
  Dribbble,
  Swords,
  Volleyball,
  Shuttlecock,
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
        return Shuttlecock;
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
