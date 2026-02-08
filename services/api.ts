
import { Match, MatchUpdates } from '../types';

const BASE_URL = 'https://sports-amcet.onrender.com/api';

// This should ideally be an environment variable or user input, 
// for now we'll use a placeholder or assume the user will provide it in the UI
let ADMIN_KEY = ''; 

export const setAdminKey = (key: string) => {
  ADMIN_KEY = key;
};

const getHeaders = (isAdmin = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (isAdmin && ADMIN_KEY) {
    headers['X-MACET-ADMIN'] = ADMIN_KEY;
  }
  return headers;
};

export const api = {
  getMatches: async (): Promise<Match[]> => {
    try {
      const res = await fetch(`${BASE_URL}/matches`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // The API returns a list of matches directly? Or wrapped? 
      // Based on Swagger: "List of matches"
      return data;
    } catch (e) {
      console.error("Failed to fetch matches:", e);
      return [];
    }
  },

  getLiveMatches: async (): Promise<Match[]> => {
    try {
      const res = await fetch(`${BASE_URL}/matches/live`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error("Failed to fetch live matches:", e);
      return [];
    }
  },

  getMatchesBySport: async (sport: string): Promise<Match[]> => {
    try {
      const res = await fetch(`${BASE_URL}/matches/sport/${sport}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error(`Failed to fetch matches for ${sport}:`, e);
      return [];
    }
  },

  getMatchById: async (id: string): Promise<Match | null> => {
     try {
      const res = await fetch(`${BASE_URL}/matches/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      console.error(`Failed to fetch match ${id}:`, e);
      return null;
    }
  },

  createMatch: async (matchData: Partial<Match>) => {
    const res = await fetch(`${BASE_URL}/matches`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(matchData),
    });
    if (!res.ok) throw new Error('Failed to create match');
    return await res.json();
  },

  updateMatch: async (id: string, updates: MatchUpdates) => {
    const res = await fetch(`${BASE_URL}/matches/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update match');
    return await res.json();
  },

  deleteMatch: async (id: string) => {
    const res = await fetch(`${BASE_URL}/matches/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error('Failed to delete match');
    return true;
  }
};
