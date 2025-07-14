export interface Sport {
  name: string;
  slug: string;
}

export interface Match {
  id: number;
  sport: string;
  team1: { name: string; score: number };
  team2: { name: string; score: number };
  status: 'live' | 'upcoming' | 'finished';
  time?: string;
  date?: string;
}

export interface SchoolTeam {
  schoolName: string;
}
