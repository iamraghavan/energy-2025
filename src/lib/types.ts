

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
  location: string;
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

// Type matching the API response for a single match
export interface MatchAPI {
  _id: string;
  matchId?: string; // Is optional in some contexts
  sport: string;
  teamA: string; // Team ID
  teamB: string; // Team ID
  pointsA: number;
  pointsB: number;
  status: 'scheduled' | 'live' | 'completed';
  scheduledAt: string;
  venue: string;
  courtNumber: string;
  refereeName: string;
  isComplete: boolean;
  scorekeeperId: string;
  result?: string;
  winnerTeam?: string;
  winnerPlayer?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

// Type used on the frontend after populating team details
export interface PopulatedMatch extends Omit<MatchAPI, 'teamA' | 'teamB'> {
  teamOne: Team;
  teamTwo: Team;
}


export interface CreateMatchPayload {
  sport: string;
  teamA: string; // This is the MongoDB _id of the team
  teamB: string; // This is the MongoDB _id of the team
  scheduledAt: string;
  venue: string;
  courtNumber: string;
  refereeName: string;
  scorekeeperId: string;
}

export interface UpdateMatchPayload {
  pointsA?: number;
  pointsB?: number;
  status?: 'scheduled' | 'live' | 'completed';
  result?: string;
  winnerTeam?: string;
}

// Type for a user from the API
export interface User {
  _id: string;
  id: string;
  username: string;
  role: 'superadmin' | 'lv2admin' | 'scorekeeper' | 'user';
  apiKey?: string; // API key is returned on login for superadmin
  createdAt?: string;
  updatedAt?: string;
}

export interface QuadrantConfig {
  quadrant1: string | null;
  quadrant2: string | null;
  quadrant3: string | null;
  quadrant4: string | null;
}
