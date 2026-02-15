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
  summary?: string;
  createdAt?: string;
  updatedAt?: string;
  gender?: 'boys' | 'girls';
  venue?: string;
  batchA?: string;
  batchB?: string;
  category?: string; // Kept for backward compatibility if needed
  startTime?: string;
  details?: {
    // Cricket
    oversA?: number;
    wicketsA?: number;
    oversB?: number;
    wicketsB?: number;
    currentInnings?: string;

    // Football
    halfTimeScoreA?: number;
    halfTimeScoreB?: number;
    currentPeriod?: string;

    // Volleyball & Badminton
    setsWonA?: number;
    setsWonB?: number;
    currentSetScoreA?: number;
    currentSetScoreB?: number;

    // Kabaddi
    raidPointsA?: number;
    raidPointsB?: number;
    tacklePointsA?: number;
    tacklePointsB?: number;

    // Musical Chair & Spoon Race
    roundsCompleted?: number;

    // Kho-Kho
    inningsA?: number;
    inningsB?: number;

    // LUDO
    coinsA?: number;
    coinsB?: number;

    // Chess
    movesPlayed?: number;

    // Carrom
    boardsWonA?: number;
    boardsWonB?: number;

    // Race
    distance?: number;

    // Skipping
    jumps?: number;

    // Tug of War
    roundsWonA?: number;
    roundsWonB?: number;

    // Shot Put
    distanceA?: number;
    distanceB?: number;

    // Needle & Thread
    completed?: boolean;

    // Legacy/Common
    overs?: number;
    wickets?: number;
    pointsA?: number;
    pointsB?: number;
    winner?: string;

    // Note: removed batchA/B from here as they are now top-level
    [key: string]: any;
  };
}

export interface MatchUpdates {
  scoreA?: number;
  scoreB?: number;
  status?: string;
  summary?: string;
  batchA?: string;
  batchB?: string;
  venue?: string;
  details?: {
    winner?: string;
    [key: string]: any;
  };
}

export type ViewState = 'LANDING' | 'CATEGORY' | 'SPORT_DETAIL' | 'LEADERBOARD' | 'LIVE_STREAM' | 'MATCHES';

export interface AppState {
  matches: Match[];
  liveStreamUrl: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
  announcement?: string;
}