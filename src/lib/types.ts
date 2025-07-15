
export interface Sport {
  name: string;
  slug: string;
}

export interface TeamSummary {
  name: string;
  score: number;
  logo?: string;
}

// This type is based on mock data and used on the public-facing pages.
export interface UIMatch {
  id: number;
  sport: string;
  team1: TeamSummary;
  team2: TeamSummary;
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
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SportAPI {
    _id: string;
    sportId: string;
    name: string;
    gender: 'M' | 'F';
    createdAt: string;
    updatedAt: string;
}

export interface Team {
    _id: string;
    teamId: string;
    name: string;
    sport: SportAPI;
    school: School;
    gender: 'M' | 'F';
    createdAt: string;
    updatedAt: string;
}

export interface TeamPayload {
    name: string;
    sportId: string;
    schoolId: string;
    gender: 'M' | 'F';
}

// Types for the Match API
export interface MatchAPI {
  _id: string;
  matchId: string;
  sport: SportAPI;
  teamOne: Team;
  teamTwo: Team;
  teamOneScore: number;
  teamTwoScore: number;
  status: 'upcoming' | 'live' | 'finished';
  date?: string;
  time?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMatchPayload {
  sport: string;
  teamA: string;
  teamB: string;
  scheduledAt: string;
  venue: string;
  courtNumber: string;
  refereeName: string;
}

export interface UpdateMatchPayload {
  teamOneScore?: number;
  teamTwoScore?: number;
  status?: 'upcoming' | 'live' | 'finished';
}
