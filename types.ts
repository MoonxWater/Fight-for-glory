export type SportType =
  | 'Cricket' | 'Volleyball' | 'Carrom' | 'Kabaddi' | 'Football'
  | 'Badminton' | 'Chess' | 'Race' | 'Tug of War' | 'Ludo'
  | 'Musical Chair' | 'Kho-Kho' | 'Needle & Thread';

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
  gender?: 'boys' | 'girls';
  venue?: string;
  category?: string; // Kept for backward compatibility if needed
  startTime?: string;
  details?: {
    // Cricket
    overs?: number;
    wickets?: number; // Format: 0
    wicketsA?: number; // Helper for UI, might not be in API
    wicketsB?: number;

    // Football
    halfTimeScoreA?: number;
    halfTimeScoreB?: number;

    // Volleyball
    setsWonA?: number;
    setsWonB?: number;

    // Kabaddi
    pointsA?: number;
    pointsB?: number;

    // Musical Chair
    roundsCompleted?: number;

    // Race
    distance?: number;

    // Needle & Thread
    completed?: boolean;

    [key: string]: any;
  } | {};
}

export interface MatchUpdates {
  scoreA?: number;
  scoreB?: number;
  status?: string;
}

export type ViewState = 'LANDING' | 'CATEGORY' | 'SPORT_DETAIL' | 'LEADERBOARD' | 'LIVE_STREAM' | 'MATCHES';

export interface AppState {
  matches: Match[];
  liveStreamUrl: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
  announcement?: string;
}