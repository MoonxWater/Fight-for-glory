import { SportType } from './types';

export const BOYS_SPORTS: SportType[] = [
  'Cricket', 'Football', 'Volleyball', 'Carrom', 'Kabaddi', 'Badminton', 'Chess', 'Race'
];

export const GIRLS_SPORTS: SportType[] = [
  'Cricket', 'Tug of War', 'Carrom', 'Ludo', 'Musical Chair', 'Kho-Kho', 'Chess', 'Badminton', 'Race'
];

export const SPORT_ICONS: Record<SportType, string> = {
  'Cricket': 'fa-baseball-bat-ball',
  'Football': 'fa-futbol',
  'Volleyball': 'fa-volleyball',
  'Carrom': 'fa-square',
  'Kabaddi': 'fa-people-group',
  'Badminton': 'fa-shuttlecock',
  'Chess': 'fa-chess',
  'Race': 'fa-person-running',
  'Tug of War': 'fa-hands-holding-child',
  'Ludo': 'fa-dice',
  'Musical Chair': 'fa-chair',
  'Kho-Kho': 'fa-arrows-rotate'
};

export const SPORT_CONFIG: Record<SportType, { type: 'TEAM' | 'SOLO' }> = {
  'Cricket': { type: 'TEAM' },
  'Football': { type: 'TEAM' },
  'Volleyball': { type: 'TEAM' },
  'Kabaddi': { type: 'TEAM' },
  'Tug of War': { type: 'TEAM' },
  'Kho-Kho': { type: 'TEAM' },
  'Musical Chair': { type: 'SOLO' },
  'Carrom': { type: 'SOLO' },
  'Badminton': { type: 'SOLO' },
  'Chess': { type: 'SOLO' },
  'Race': { type: 'SOLO' },
  'Ludo': { type: 'SOLO' }
};