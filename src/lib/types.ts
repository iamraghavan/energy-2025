
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

// Type matching the API response for a single match
export interface MatchAPI {
  _id: string;
  matchId: string;
  sport: string;
  teamA: string; // Team ID
  teamB: string; // Team ID
  teamOneScore: number;
  teamTwoScore: number;
  status: 'scheduled' | 'live' | 'completed';
  scheduledAt: string;
  venue: string;
  courtNumber: string;
  refereeName: string;
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
}

export interface UpdateMatchPayload {
  teamOneScore?: number;
  teamTwoScore?: number;
  status?: 'scheduled' | 'live' | 'completed';
}
