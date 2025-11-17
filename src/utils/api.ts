import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f646c9b9`;

// Auth token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('flashmind_auth_token', token);
  } else {
    localStorage.removeItem('flashmind_auth_token');
  }
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('flashmind_auth_token');
  }
  return authToken;
};

// Helper function to make API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export const authAPI = {
  signup: async (email: string, password: string, name: string) => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (data.success) {
      // If server provided access token, set it (auto-login)
      if (data.access_token) {
        setAuthToken(data.access_token);
      }
      return data;
    }
    throw new Error(data.error || 'Signup failed');
  },

  login: async (email: string, password: string) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.success && data.access_token) {
      setAuthToken(data.access_token);
      return data;
    }
    throw new Error(data.error || 'Login failed');
  },

  logout: () => {
    setAuthToken(null);
  },

  getCurrentUser: async () => {
    try {
      const data = await apiRequest('/auth/me');
      return data;
    } catch (error) {
      setAuthToken(null);
      throw error;
    }
  },

  getSession: () => {
    const token = getAuthToken();
    return token ? { access_token: token } : null;
  },
};

// ============================================================================
// DECK API
// ============================================================================

export const deckAPI = {
  getAll: async () => {
    return await apiRequest('/decks');
  },

  create: async (deck: {
    title: string;
    description?: string;
    privacy?: 'private' | 'public';
  }) => {
    return await apiRequest('/decks', {
      method: 'POST',
      body: JSON.stringify(deck),
    });
  },

  update: async (deckId: string, updates: any) => {
    return await apiRequest(`/decks/${deckId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  delete: async (deckId: string) => {
    return await apiRequest(`/decks/${deckId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// FLASHCARD API
// ============================================================================

export const cardAPI = {
  getForDeck: async (deckId: string) => {
    return await apiRequest(`/decks/${deckId}/cards`);
  },

  create: async (deckId: string, card: {
    front: string;
    back: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  }) => {
    return await apiRequest('/cards', {
      method: 'POST',
      body: JSON.stringify({ 
        deck_id: deckId,
        front: card.front,
        back: card.back,
        difficulty: card.difficulty || 'medium'
      }),
    });
  },

  createBulk: async (deckId: string, cards: Array<{ front: string; back: string; difficulty?: string }>) => {
    const results = [];
    for (const card of cards) {
      const result = await cardAPI.create(deckId, card);
      results.push(result);
    }
    return { success: true, cards: results };
  },

  delete: async (cardId: string) => {
    return await apiRequest(`/cards/${cardId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// STUDY PROGRESS API
// ============================================================================

export const studyAPI = {
  getProgress: async () => {
    return await apiRequest('/study/progress');
  },

  updateProgress: async (cardId: string, quality: number) => {
    return await apiRequest('/study/record', {
      method: 'POST',
      body: JSON.stringify({ card_id: cardId, quality }),
    });
  },

  getDueCards: async (deckId?: string) => {
    const query = deckId ? `?deck_id=${deckId}` : '';
    return await apiRequest(`/study/due${query}`);
  },
};

// ============================================================================
// COMMUNITY API
// ============================================================================

export const communityAPI = {
  getPublicDecks: async () => {
    return await apiRequest('/community/decks');
  },

  rateDeck: async (deckId: string, rating: number, review?: string) => {
    return await apiRequest(`/community/decks/${deckId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    });
  },
};

// ============================================================================
// ANALYTICS API
// ============================================================================

export const analyticsAPI = {
  getAnalytics: async () => {
    return await apiRequest('/analytics');
  },

  updateDaily: async (data: {
    cardsStudied?: number;
    timeSpent?: number;
    accuracy?: number;
  }) => {
    return await apiRequest('/analytics/daily', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// FILE UPLOAD API
// ============================================================================

export const uploadAPI = {
  uploadFile: async (file: File) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    let response;
    try {
      response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`,
        },
        body: formData,
      });
    } catch (fetchError: any) {
      console.error('Network error during file upload:', fetchError);
      
      // Check for specific error types
      if (fetchError.message?.toLowerCase().includes('credentials')) {
        throw new Error('Storage credentials error. Please try again in a moment.');
      }
      
      throw new Error(fetchError.message || 'Network error - could not reach server');
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Error parsing response:', jsonError);
      throw new Error('Invalid server response');
    }

    if (!response.ok) {
      const errorMessage = data.error || data.details || 'File upload failed';
      console.error('Upload failed:', errorMessage, data);
      throw new Error(errorMessage);
    }

    return data;
  },

  generateFlashcards: async (filePath: string, fileType: string, fileName: string, deckTitle: string) => {
    return await apiRequest('/upload/generate', {
      method: 'POST',
      body: JSON.stringify({
        file_path: filePath,
        file_type: fileType,
        file_name: fileName,
        deck_title: deckTitle,
      }),
    });
  },
};

// ============================================================================
// AI GENERATION API
// ============================================================================

export const aiAPI = {
  generateCards: async (content: string, deckId: string, count?: number) => {
    return await apiRequest('/ai/generate-cards', {
      method: 'POST',
      body: JSON.stringify({ content, deckId, count }),
    });
  },
};

// Health check
export const healthCheck = async () => {
  return await apiRequest('/health');
};
