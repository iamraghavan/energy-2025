import type { Sport, Match, SchoolTeam } from './types';

export const sports: Sport[] = [
  { name: 'Football', slug: 'football' },
  { name: 'Basketball', slug: 'basketball' },
  { name: 'Cricket', slug: 'cricket' },
  { name: 'Volleyball', slug: 'volleyball' },
  { name: 'Badminton', slug: 'badminton' },
  { name: 'Table Tennis', slug: 'table-tennis' },
  { name: 'Kabaddi', slug: 'kabaddi' },
  { name: 'Athletics', slug: 'athletics' },
  { name: 'Chess', slug: 'chess' },
];

export const matches: Match[] = [
  // Live Matches
  { id: 1, sport: 'Football', team1: { name: 'Red Dragons', score: 2 }, team2: { name: 'Blue Eagles', score: 1 }, status: 'live' },
  { id: 2, sport: 'Basketball', team1: { name: 'Hoop Masters', score: 88 }, team2: { name: 'Dunk Dynamos', score: 92 }, status: 'live' },
  { id: 3, sport: 'Cricket', team1: { name: 'Royal Strikers', score: 154 }, team2: { name: 'Kings XI', score: 120 }, status: 'live' },

  // Upcoming Matches
  { id: 4, sport: 'Football', team1: { name: 'Green Giants', score: 0 }, team2: { name: 'Yellow Hornets', score: 0 }, status: 'upcoming', time: '18:00', date: '2024-08-15' },
  { id: 5, sport: 'Volleyball', team1: { name: 'Spike Squad', score: 0 }, team2: { name: 'Net Ninjas', score: 0 }, status: 'upcoming', time: '19:30', date: '2024-08-15' },
  { id: 6, sport: 'Kabaddi', team1: { name: 'Raider Heroes', score: 0 }, team2: { name: 'Defence Titans', score: 0 }, status: 'upcoming', time: '20:00', date: '2024-08-15' },
  { id: 7, sport: 'Badminton', team1: { name: 'Shuttle Stars', score: 0 }, team2: { name: 'Racquet Rebels', score: 0 }, status: 'upcoming', time: '17:00', date: '2024-08-16' },
  
  // Finished Matches
  { id: 8, sport: 'Football', team1: { name: 'Black Knights', score: 3 }, team2: { name: 'White Wizards', score: 0 }, status: 'finished', date: '2024-08-14' },
  { id: 9, sport: 'Basketball', team1: { name: 'Alley-Oopers', score: 105 }, team2: { name: 'Slam Dunkers', score: 102 }, status: 'finished', date: '2024-08-14' },
  { id: 10, sport: 'Table Tennis', team1: { name: 'Ping Pong Pros', score: 3 }, team2: { name: 'Paddle Masters', score: 2 }, status: 'finished', date: '2024-08-14' },
  { id: 11, sport: 'Chess', team1: { name: 'Grand Masters', score: 1 }, team2: { name: 'Checkmate Kings', score: 0 }, status: 'finished', date: '2024-08-13' },
];

export const schoolTeams: Record<string, SchoolTeam[]> = {
  football: [
    { schoolName: 'St. Francis High School' },
    { schoolName: 'Northwood High' },
    { schoolName: 'Greenwood Academy' },
  ],
  basketball: [
    { schoolName: 'Lincoln High' },
    { schoolName: 'Eastwood Collegiate' },
  ],
  cricket: [
    { schoolName: 'Maple Leaf International' },
    { schoolName: 'Oakridge Secondary' },
    { schoolName: 'Westmount Public' },
  ],
  chess: [
    { schoolName: 'Riverdale High' },
    { schoolName: 'King\'s College' },
  ],
  // Add other sports here as needed
  volleyball: [],
  badminton: [],
  'table-tennis': [],
  kabaddi: [],
  athletics: [],
};
