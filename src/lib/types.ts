export interface Sport {
  name: string;
  slug: string;
}

export interface Team {
  name: string;
  score: number;
  logo?: string;
}

export interface Match {
  id: number;
  sport: string;
  team1: Team;
  team2: Team;
  status: 'live' | 'upcoming' | 'finished';
  time?: string;
  date?: string;
}

export interface SchoolTeam {
  schoolName: string;
}

export interface School {
  _id: string;
  schoolId: string;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}
