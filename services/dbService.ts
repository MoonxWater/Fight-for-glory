import { Participant, Match } from '../types';

const STORAGE_KEY = 'FIGHT_FOR_GLORY_DATABASE';

export const dbService = {
  getData: () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { participants: [], matches: [], settings: { announcement: 'Welcome to Fight for Glory 2025 at MACET!', liveStreamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' } };
  },
  getParticipants: async (): Promise<Participant[]> => dbService.getData().participants,
  getMatches: async (): Promise<Match[]> => dbService.getData().matches,
  getSettings: async () => dbService.getData().settings,
  
  saveData: (data: any) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('db_updated'));
  },

  updateMatch: async (id: string, updates: Partial<Match>) => {
    const data = dbService.getData();
    const index = data.matches.findIndex((m: Match) => m.id === id);
    if (index !== -1) {
      data.matches[index] = { ...data.matches[index], ...updates };
      dbService.saveData(data);
    }
  },

  addParticipant: async (p: Participant) => {
    const data = dbService.getData();
    data.participants.push(p);
    dbService.saveData(data);
  },

  addMatch: async (m: Match) => {
    const data = dbService.getData();
    data.matches.push(m);
    dbService.saveData(data);
  },

  updateParticipantPoints: async (id: string, points: number, wins: number, losses: number) => {
    const data = dbService.getData();
    const index = data.participants.findIndex((p: Participant) => p.id === id);
    if (index !== -1) {
      data.participants[index] = { ...data.participants[index], points, wins, losses };
      dbService.saveData(data);
    }
  },

  updateSettings: async (settings: any) => {
    const data = dbService.getData();
    data.settings = { ...data.settings, ...settings };
    dbService.saveData(data);
  },

  subscribeToChanges: (callback: () => void) => {
    window.addEventListener('db_updated', callback);
    return () => window.removeEventListener('db_updated', callback);
  }
};