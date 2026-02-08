
import { Match, MatchUpdates } from '../types';

const BASE_URL = 'https://sports-amcet.onrender.com/api';

// This should ideally be an environment variable or user input, 
// for now we'll use a placeholder or assume the user will provide it in the UI
let ADMIN_KEY = 'fight-for-glory';

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
  getGamesByGender: async (gender: 'boys' | 'girls'): Promise<string[]> => {
    try {
      console.log(`Fetching ${gender} games from API...`);
      const res = await fetch(`${BASE_URL}/sports/games/${gender}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log(`Fetched ${gender} games:`, data.games);
      return data.games || [];
    } catch (e) {
      console.error(`Failed to fetch ${gender} games:`, e);
      return [];
    }
  },

  getMatches: async (): Promise<Match[]> => {
    try {
      console.log('Fetching matches from API...');
      const res = await fetch(`${BASE_URL}/matches`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('Fetched matches:', data);
      console.log('Number of matches:', data.length);
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
    console.log('Creating match with admin key:', ADMIN_KEY ? 'SET' : 'NOT SET');
    console.log('Match data:', matchData);

    const res = await fetch(`${BASE_URL}/matches`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(matchData),
    });

    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to create match: ${res.status} - ${errorText}`);
    }
    return await res.json();
  },

  updateMatch: async (id: string, updates: MatchUpdates) => {
    console.log('Updating match with admin key:', ADMIN_KEY ? 'SET' : 'NOT SET');
    console.log('Match ID:', id);
    console.log('Update data:', updates);

    const res = await fetch(`${BASE_URL}/matches/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });

    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to update match: ${res.status} - ${errorText}`);
    }
    return await res.json();
  },

  deleteMatch: async (id: string) => {
    console.log('=== DELETE MATCH DEBUG ===');
    console.log('ADMIN_KEY value:', ADMIN_KEY);
    console.log('ADMIN_KEY type:', typeof ADMIN_KEY);
    console.log('ADMIN_KEY length:', ADMIN_KEY?.length);
    console.log('Match ID:', id);

    const headers = getHeaders(true);
    console.log('Headers being sent:', headers);
    console.log('X-MACET-ADMIN header:', headers['X-MACET-ADMIN']);

    const res = await fetch(`${BASE_URL}/matches/${id}`, {
      method: 'DELETE',
      headers: headers,
    });

    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to delete match: ${res.status} - ${errorText}`);
    }
    return true;
  }
};
