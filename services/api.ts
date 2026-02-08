
import { Match, MatchUpdates } from '../types';

const BASE_URL = 'https://sports-amcet.onrender.com/api';

// This should ideally be an environment variable or user input, 
// for now we'll use a placeholder or assume the user will provide it in the UI
let ADMIN_KEY = 'fight-for-glory'; // This is what the API expects

export const setAdminKey = (key: string) => {
  console.log('Setting admin key to:', key);
  // Always use fight-for-glory for API calls regardless of UI input
  ADMIN_KEY = 'fight-for-glory';
};

export const getAdminKey = () => ADMIN_KEY;

const getHeaders = (isAdmin = false) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
  if (isAdmin && ADMIN_KEY) {
    headers['X-MACET-ADMIN'] = ADMIN_KEY;
  }
  return headers;
};

const parseErrorResponse = async (response: Response): Promise<string> => {
  const contentType = response.headers.get('content-type');

  try {
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      return errorData.message || errorData.error || JSON.stringify(errorData);
    } else {
      // Handle HTML error responses
      const errorText = await response.text();

      // Extract meaningful error from HTML
      if (errorText.includes('<!DOCTYPE html>') || errorText.includes('<html')) {
        // Try to extract title or error message from HTML
        const titleMatch = errorText.match(/<title>(.*?)<\/title>/i);
        if (titleMatch) {
          return titleMatch[1].replace(/[^a-zA-Z0-9\s]/g, '').trim();
        }

        // Look for common error patterns in HTML
        const errorPatterns = [
          /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi,
          /<p[^>]*class="error"[^>]*>(.*?)<\/p>/gi,
          /<div[^>]*class="error"[^>]*>(.*?)<\/div>/gi
        ];

        for (const pattern of errorPatterns) {
          const matches = errorText.match(pattern);
          if (matches && matches.length > 0) {
            return matches[0].replace(/<[^>]*>/g, '').trim();
          }
        }

        // Fallback to HTTP status message
        return response.statusText || `HTTP ${response.status} Error`;
      }

      return errorText;
    }
  } catch (parseError) {
    console.error('Error parsing error response:', parseError);
    return response.statusText || `HTTP ${response.status} Error`;
  }
};

export const api = {
  getGamesByGender: async (gender: 'boys' | 'girls'): Promise<string[]> => {
    try {
      console.log(`Fetching ${gender} games from API...`);
      const res = await fetch(`${BASE_URL}/sports/games/${gender}`);
      if (!res.ok) {
        const errorMessage = await parseErrorResponse(res);
        throw new Error(`Failed to fetch games: ${res.status} - ${errorMessage}`);
      }
      const data = await res.json();
      console.log(`Fetched ${gender} games:`, data.games);
      return data.games || [];
    } catch (e) {
      console.error(`Failed to fetch ${gender} games:`, e);
      return [];
    }
  },

  getUpcomingMatches: async (): Promise<Match[]> => {
    try {
      console.log('Fetching upcoming matches from API...');
      const res = await fetch(`${BASE_URL}/matches/upcoming`);
      if (!res.ok) {
        const errorMessage = await parseErrorResponse(res);
        throw new Error(`Failed to fetch upcoming matches: ${res.status} - ${errorMessage}`);
      }
      const data = await res.json();
      console.log('Fetched upcoming matches:', data);
      return data;
    } catch (e) {
      console.error("Failed to fetch upcoming matches:", e);
      return [];
    }
  },

  getMatchByFilters: async (gender: string, sport: string, matchId: string): Promise<Match | null> => {
    try {
      console.log(`Fetching match with filters: gender=${gender}, sport=${sport}, id=${matchId}`);
      const res = await fetch(`${BASE_URL}/matches/gender/${gender}/${sport}/${matchId}`);
      if (!res.ok) {
        const errorMessage = await parseErrorResponse(res);
        throw new Error(`Failed to fetch match: ${res.status} - ${errorMessage}`);
      }
      const data = await res.json();
      console.log('Fetched filtered match:', data);
      return data;
    } catch (e) {
      console.error("Failed to fetch filtered match:", e);
      return null;
    }
  },

  getMatchesBySport: async (sport: string): Promise<Match[]> => {
    try {
      console.log(`Fetching matches for sport: ${sport}`);
      const res = await fetch(`${BASE_URL}/matches/sport/${sport}`);
      if (!res.ok) {
        const errorMessage = await parseErrorResponse(res);
        throw new Error(`Failed to fetch ${sport} matches: ${res.status} - ${errorMessage}`);
      }
      const data = await res.json();
      console.log(`Fetched ${sport} matches:`, data);
      return data;
    } catch (e) {
      console.error(`Failed to fetch ${sport} matches:`, e);
      return [];
    }
  },

  getMatches: async (): Promise<Match[]> => {
    try {
      console.log('Fetching matches from API...');
      const res = await fetch(`${BASE_URL}/matches?t=${Date.now()}`, {
        headers: getHeaders(false)
      });
      if (!res.ok) {
        const errorMessage = await parseErrorResponse(res);
        throw new Error(`Failed to fetch matches: ${res.status} - ${errorMessage}`);
      }
      const data = await res.json();
      console.log('Fetched matches:', data);
      console.log('Number of matches:', data.length);
      return data;
    } catch (e) {
      console.error("Failed to fetch matches:", e);
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

  createMatch: async (matchData: any) => {
    console.log('Creating match with admin key:', ADMIN_KEY ? 'SET' : 'NOT SET');
    console.log('Match data:', matchData);

    // Remove scores and status from payload as they are not allowed in creation
    const { scoreA, scoreB, status, ...payload } = matchData;

    const res = await fetch(`${BASE_URL}/matches`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(payload),
    });

    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const errorMessage = await parseErrorResponse(res);
      console.error('Error response:', errorMessage);
      throw new Error(`Failed to create match: ${res.status} - ${errorMessage}`);
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
      const errorMessage = await parseErrorResponse(res);
      console.error('Error response:', errorMessage);
      throw new Error(`Failed to update match: ${res.status} - ${errorMessage}`);
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
      const errorMessage = await parseErrorResponse(res);
      console.error('Error response:', errorMessage);

      if (res.status === 404) {
        throw new Error('Match not found. It may have already been deleted or the match ID is invalid.');
      } else if (res.status === 401) {
        throw new Error('Unauthorized. Please check your admin access.');
      } else {
        throw new Error(`Failed to delete match: ${res.status} - ${errorMessage}`);
      }
    }
    return true;
  }
};
