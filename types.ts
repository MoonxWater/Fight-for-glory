export type SportType =
  | 'Cricket' | 'Volleyball' | 'Carrom' | 'Kabaddi' | 'Football'
  | 'Badminton' | 'Chess' | 'Race' | 'Tug of War' | 'Ludo'
  | 'Musical Chair' | 'Kho-Kho';

export interface Participant {
  name: string;
  points: number;
  wins: number;
  losses: number;
  draws: number;
  sport: string; // "Cricket", etc.
  category?: string; // Optional inferred category
}

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';

export interface Match {
  id: string;
  sport: string; // The API returns a string, e.g., "Cricket"
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: MatchStatus;
  createdAt?: string;
  updatedAt?: string;
  // These are not in the new API but were in the old types. 
  // We might need to infer them or remove them.
  category?: string;
  startTime?: string;
}

export interface MatchUpdates {
  scoreA?: number;
  scoreB?: number;
  status?: string;
}

export type ViewState = 'LANDING' | 'CATEGORY' | 'SPORT_DETAIL' | 'LEADERBOARD' | 'LIVE_STREAM';

export interface AppState {
  matches: Match[];
  liveStreamUrl: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
  announcement?: string;
}