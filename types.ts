export type SportType = 
  | 'Cricket' | 'Volleyball' | 'Carrom' | 'Kabaddi' | 'Football' 
  | 'Badminton' | 'Chess' | 'Race' | 'Tug of War' | 'Ludo' 
  | 'Musical Chair' | 'Kho-Kho';

export type Category = 'Boys' | 'Girls';

export interface Participant {
  id: string;
  name: string;
  type: 'TEAM' | 'SOLO';
  logo?: string;
  wins: number;
  losses: number;
  points: number;
  category: Category;
  sport: SportType;
  semester?: string;
  year?: string;
}

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'FINISHED';

export interface Match {
  id: string;
  sport: SportType;
  category: Category;
  teamAId: string;
  teamBId: string;
  scoreA: number;
  scoreB: number;
  startTime: string;
  status: MatchStatus;
  winnerId?: string;
  summary?: string;
}

export type ViewState = 'LANDING' | 'CATEGORY' | 'SPORT_DETAIL' | 'LEADERBOARD' | 'LIVE_STREAM';

export interface AppState {
  participants: Participant[];
  matches: Match[];
  liveStreamUrl: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
  announcement?: string;
}