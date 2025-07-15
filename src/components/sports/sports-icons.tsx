import type { LucideProps } from 'lucide-react';

interface SportIconProps extends Omit<LucideProps, 'ref'> {
  sportName: string;
}

// Custom SVGs for sports
const FootballIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 18.2a4.93 4.93 0 0 1-4.82-3.6" /><path d="M12 5.8a4.93 4.93 0 0 1 4.82 3.6" />
    <path d="M18.18 12a4.93 4.93 0 0 1-3.58-4.82" /><path d="M5.82 12a4.93 4.93 0 0 1 3.58 4.82" />
    <path d="M12 12l4.82 3.6" /><path d="M12 12l-4.82-3.6" /><path d="M12 12l-3.6 4.82" />
    <path d="M12 12l3.6-4.82" /><path d="M15.58 7.38l-3.58 4.82" /><path d="M8.42 16.62l3.58-4.82" />
    <path d="M16.62 15.58l-4.82-3.58" /><path d="M7.38 8.42l4.82 3.58" />
  </svg>
);
const BasketballIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a5 5 0 0 0-5 5c0 1.66.84 3.13 2.1 4H14.9c1.26-.87 2.1-2.34 2.1-4a5 5 0 0 0-5-5z" />
    <path d="M12 22a5 5 0 0 0 5-5c0-1.66-.84-3.13-2.1-4H9.1c-1.26.87-2.1 2.34-2.1 4a5 5 0 0 0 5 5z" />
    <path d="M2 12a5 5 0 0 0 5 5c1.66 0 3.13-.84 4-2.1V9.1C10.13 7.84 8.66 7 7 7a5 5 0 0 0-5 5z" />
    <path d="M22 12a5 5 0 0 0-5-5c-1.66 0-3.13.84-4 2.1v5.8c.87 1.26 2.34 2.1 4 2.1a5 5 0 0 0 5-5z" />
  </svg>
);
const CricketIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m14.36 14.36 4.24-4.24" /><path d="m18.6 18.6 1.4-1.4" />
    <path d="M13.66 8.76a2 2 0 0 0-2.82-2.82" /><path d="M9.1 13.5a2 2 0 1 0 0-4.2" />
    <path d="m14.1 18.7-4.6-4.6" /><circle cx="12" cy="12" r="10" />
  </svg>
);
const VolleyballIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/><path d="M12 12a5 5 0 0 0-5 5"/><path d="M12 12a5 5 0 0 0 5 5"/>
    <path d="M12 12a5 5 0 0 1 5-5"/><path d="M12 12a5 5 0 0 1-5-5"/>
    <path d="M12 2a5 5 0 0 0-5 5"/><path d="M12 2a5 5 0 0 1 5 5"/>
    <path d="M2 12a5 5 0 0 1 5-5"/><path d="M22 12a5 5 0 0 0-5-5"/>
  </svg>
);
const BadmintonIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17.73 17.73 6.27 6.27" /><path d="m14.17 10.3-4.24-4.24" />
    <path d="m19.8 19.8-1.41 1.41" /><path d="m8.49 15.51 1.41 1.41" />
    <path d="m12 12 5.66 5.66" /><path d="m12 12-5.66-5.66" />
    <path d="M4.27 4.27 2 2" /><path d="M22 22 18.34 18.34" />
    <path d="M15.51 8.49 14.1 7.08" /><path d="M7.08 14.1 8.49 15.51" />
  </svg>
);
const TableTennisIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 14.5 21 8" /><path d="m13 17 5-5" />
    <path d="M11 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /><path d="M4 20h16" />
    <path d="M10 18a2 2 0 1 0-4 0" /><path d="M18 18a2 2 0 1 0-4 0" />
  </svg>
);
const KabaddiIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 3v18h18"/><path d="m14 9-2 2-2-2"/>
    <path d="m10 13 4 4"/><path d="m14 13-4 4"/>
    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="7.5" cy="16.5" r=".5" fill="currentColor"/>
    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="16.5" cy="16.5" r=".5" fill="currentColor"/>
  </svg>
);
const AthleticsIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 20h10"/><path d="M12 4v16"/>
    <path d="M6 12H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/><path d="M18 12h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2"/>
    <path d="m15 12-3-3-3 3"/>
  </svg>
);
const ChessIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2l2 4h-4l2-4z"/><path d="M18 18v-5h-2v5h-8v-5H6v5H4v2h16v-2h-2z"/>
    <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M18 18H6"/>
  </svg>
);
const GenericSportIcon = (props: LucideProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);


export function SportIcon({ sportName, ...props }: SportIconProps) {
  const IconComponent = (() => {
    switch (sportName.toLowerCase()) {
      case 'football': return FootballIcon;
      case 'basketball': return BasketballIcon;
      case 'cricket': return CricketIcon;
      case 'volleyball': return VolleyballIcon;
      case 'badminton': return BadmintonIcon;
      case 'table tennis': return TableTennisIcon;
      case 'kabaddi': return KabaddiIcon;
      case 'athletics': return AthleticsIcon;
      case 'chess': return ChessIcon;
      default: return GenericSportIcon;
    }
  })();

  return <IconComponent {...props} />;
}
