import { Participant, Match, SportType, Category } from '../types';

const BASE_URL = 'https://sports-amcet.onrender.com';
const ADMIN_HEADER_KEY = 'X-ADMIN';
const ADMIN_HEADER_VALUE = 'fight-for-glory';

const getHeaders = (isAdmin: boolean = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (isAdmin) {
    headers[ADMIN_HEADER_KEY] = ADMIN_HEADER_VALUE;
  }
  return headers;
};

export const dbService = {
  getParticipants: async (): Promise<Participant[]> => {
    try {
      const res = await fetch(`${BASE_URL}/participants`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch participants`);
      return res.json();
    } catch (e) {
      console.error("API Error (getParticipants):", e);
      return [];
    }
  },

  getMatches: async (): Promise<Match[]> => {
    try {
      const res = await fetch(`${BASE_URL}/matches`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch matches`);
      return res.json();
    } catch (e) {
      console.error("API Error (getMatches):", e);
      return [];
    }
  },

  getSettings: async () => {
    try {
      const res = await fetch(`${BASE_URL}/settings`);
      if (!res.ok) return { announcement: 'Welcome to Fight for Glory 2025 at MACET!', liveStreamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' };
      return res.json();
    } catch (e) {
      console.error("API Error (getSettings):", e);
      return { announcement: 'Welcome to Fight for Glory 2025 at MACET!', liveStreamUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' };
    }
  },

  addParticipant: async (p: Participant) => {
    const res = await fetch(`${BASE_URL}/participants`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(p),
    });
    if (!res.ok) throw new Error('Action failed: Ensure X-ADMIN header is correct or fields are valid.');
    return res.json();
  },

  deleteParticipant: async (id: string) => {
    const res = await fetch(`${BASE_URL}/participants/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to delete participant.');
    return true;
  },

  addMatch: async (m: Match) => {
    const res = await fetch(`${BASE_URL}/matches`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(m),
    });
    if (!res.ok) throw new Error('Action failed: Check X-ADMIN or match data.');
    return res.json();
  },

  deleteMatch: async (id: string) => {
    const res = await fetch(`${BASE_URL}/matches/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to delete match.');
    return true;
  },

  updateMatch: async (id: string, updates: Partial<Match>) => {
    const res = await fetch(`${BASE_URL}/matches/${id}`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Failed to update match ${id}`);
    return res.json();
  },

  updateParticipantPoints: async (id: string, points: number, wins: number, losses: number) => {
    const res = await fetch(`${BASE_URL}/participants/${id}`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ points, wins, losses }),
    });
    if (!res.ok) throw new Error('Failed to update standings');
    return res.json();
  },

  updateSettings: async (settings: any) => {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  subscribeToChanges: (callback: () => void) => {
    const interval = setInterval(callback, 5000); // Poll every 5 seconds for live feel
    return () => clearInterval(interval);
  }
};