import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// In-memory file storage fallback (for when Supabase Storage has credential issues)
const fileCache = new Map<string, { blob: Blob; timestamp: number; metadata: any }>();
const FILE_CACHE_TTL = 3600000; // 1 hour in milliseconds

// Clean up old cached files periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of fileCache.entries()) {
    if (now - value.timestamp > FILE_CACHE_TTL) {
      fileCache.delete(key);
      console.log(`Cleaned up cached file: ${key}`);
    }
  }
}, 300000); // Run every 5 minutes

// Create Supabase clients
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );
};

const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_ANON_KEY') || '',
  );
};

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Middleware to verify authentication
const verifyAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    console.log('Authorization error during auth verification:', error);
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  c.set('userId', user.id);
  c.set('userEmail', user.email);
  await next();
};

// Storage bucket name constant
const STORAGE_BUCKET_NAME = 'make-f646c9b9-flashmind-files';
let storageInitialized = false;

// Initialize storage bucket on startup
const initStorage = async () => {
  const supabase = getSupabaseAdmin();
  
  try {
    console.log('Initializing storage bucket...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('Error listing buckets:', listError);
      // Continue anyway, bucket might still exist
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`Creating storage bucket: ${STORAGE_BUCKET_NAME}`);
      const { error } = await supabase.storage.createBucket(STORAGE_BUCKET_NAME, {
        public: false,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          'application/pdf',
          'text/plain',
          'image/jpeg',
          'image/png',
          'image/jpg',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword'
        ],
      });
      
      if (error) {
        console.log('Error creating storage bucket:', error);
        console.log('Storage may not be fully functional');
      } else {
        console.log('Storage bucket created successfully');
        storageInitialized = true;
      }
    } else {
      console.log('Storage bucket already exists');
      storageInitialized = true;
    }
  } catch (error) {
    console.log('Error initializing storage:', error);
    console.log('Will attempt to use storage anyway');
  }
};

// Call initialization
initStorage();

// Health check endpoint
app.get("/make-server-f646c9b9/health", (c) => {
  return c.json({ status: "ok", message: "FlashMind backend is running" });
});

// ============= AUTH ENDPOINTS =============

// Sign up
app.post("/make-server-f646c9b9/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Create user with admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true,
    });

    if (error) {
      console.log('Error during user signup:', error);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user data in KV store
    const userId = data.user.id;
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      name,
      created_at: new Date().toISOString(),
      stats: {
        streak: 0,
        total_cards: 0,
        level: 1,
        total_decks: 0,
        cards_studied_today: 0,
      }
    });

    // Auto-login the user after signup
    const supabaseClient = getSupabaseClient();
    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.log('Error during auto-login after signup:', loginError);
      // Still return success, but user will need to login manually
      return c.json({ 
        success: true, 
        user: { 
          id: userId, 
          email, 
          name 
        },
        message: 'Account created. Please login.'
      });
    }

    return c.json({ 
      success: true,
      access_token: loginData.session.access_token,
      user: { 
        id: userId, 
        email, 
        name 
      } 
    });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Login
app.post("/make-server-f646c9b9/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Error during user login:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      success: true, 
      access_token: data.session.access_token,
      user: data.user 
    });
  } catch (error) {
    console.log('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Get current user
app.get("/make-server-f646c9b9/auth/me", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userData = await kv.get(`user:${userId}`);
    
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404);
    }

    return c.json({ success: true, user: userData });
  } catch (error) {
    console.log('Error fetching user data:', error);
    return c.json({ error: 'Failed to fetch user data' }, 500);
  }
});

// ============= DECK ENDPOINTS =============

// Create deck
app.post("/make-server-f646c9b9/decks", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { title, description, privacy = 'private' } = await c.req.json();
    
    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    const deckId = crypto.randomUUID();
    const deck = {
      id: deckId,
      user_id: userId,
      title,
      description: description || '',
      privacy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      card_count: 0,
    };

    await kv.set(`deck:${deckId}`, deck);
    await kv.set(`user_deck:${userId}:${deckId}`, deckId);

    // Update user stats
    const userData = await kv.get(`user:${userId}`);
    if (userData) {
      userData.stats.total_decks = (userData.stats.total_decks || 0) + 1;
      await kv.set(`user:${userId}`, userData);
    }

    return c.json({ success: true, deck });
  } catch (error) {
    console.log('Error creating deck:', error);
    return c.json({ error: 'Failed to create deck' }, 500);
  }
});

// Get user's decks
app.get("/make-server-f646c9b9/decks", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userDecks = await kv.getByPrefix(`user_deck:${userId}:`);
    
    const decks = await Promise.all(
      userDecks.map(async (deckId) => {
        const deck = await kv.get(`deck:${deckId}`);
        return deck;
      })
    );

    return c.json({ success: true, decks: decks.filter(d => d !== null) });
  } catch (error) {
    console.log('Error fetching decks:', error);
    return c.json({ error: 'Failed to fetch decks' }, 500);
  }
});

// Get single deck
app.get("/make-server-f646c9b9/decks/:deckId", verifyAuth, async (c) => {
  try {
    const deckId = c.req.param('deckId');
    const deck = await kv.get(`deck:${deckId}`);
    
    if (!deck) {
      return c.json({ error: 'Deck not found' }, 404);
    }

    return c.json({ success: true, deck });
  } catch (error) {
    console.log('Error fetching deck:', error);
    return c.json({ error: 'Failed to fetch deck' }, 500);
  }
});

// Update deck
app.put("/make-server-f646c9b9/decks/:deckId", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.param('deckId');
    const updates = await c.req.json();
    
    const deck = await kv.get(`deck:${deckId}`);
    
    if (!deck) {
      return c.json({ error: 'Deck not found' }, 404);
    }

    if (deck.user_id !== userId) {
      return c.json({ error: 'Unauthorized to update this deck' }, 403);
    }

    const updatedDeck = {
      ...deck,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await kv.set(`deck:${deckId}`, updatedDeck);

    return c.json({ success: true, deck: updatedDeck });
  } catch (error) {
    console.log('Error updating deck:', error);
    return c.json({ error: 'Failed to update deck' }, 500);
  }
});

// Delete deck
app.delete("/make-server-f646c9b9/decks/:deckId", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.param('deckId');
    
    const deck = await kv.get(`deck:${deckId}`);
    
    if (!deck) {
      return c.json({ error: 'Deck not found' }, 404);
    }

    if (deck.user_id !== userId) {
      return c.json({ error: 'Unauthorized to delete this deck' }, 403);
    }

    // Delete all cards in the deck
    const cards = await kv.getByPrefix(`deck_card:${deckId}:`);
    for (const cardId of cards) {
      await kv.del(`card:${cardId}`);
      await kv.del(`deck_card:${deckId}:${cardId}`);
    }

    // Delete deck
    await kv.del(`deck:${deckId}`);
    await kv.del(`user_deck:${userId}:${deckId}`);

    // Update user stats
    const userData = await kv.get(`user:${userId}`);
    if (userData) {
      userData.stats.total_decks = Math.max(0, (userData.stats.total_decks || 1) - 1);
      userData.stats.total_cards = Math.max(0, (userData.stats.total_cards || cards.length) - cards.length);
      await kv.set(`user:${userId}`, userData);
    }

    return c.json({ success: true, message: 'Deck deleted successfully' });
  } catch (error) {
    console.log('Error deleting deck:', error);
    return c.json({ error: 'Failed to delete deck' }, 500);
  }
});

// ============= FLASHCARD ENDPOINTS =============

// Create flashcard
app.post("/make-server-f646c9b9/cards", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { deck_id, front, back, difficulty = 'medium' } = await c.req.json();
    
    if (!deck_id || !front || !back) {
      return c.json({ error: 'Deck ID, front, and back are required' }, 400);
    }

    // Verify deck ownership
    const deck = await kv.get(`deck:${deck_id}`);
    if (!deck || deck.user_id !== userId) {
      return c.json({ error: 'Deck not found or unauthorized' }, 403);
    }

    const cardId = crypto.randomUUID();
    const card = {
      id: cardId,
      deck_id,
      front,
      back,
      difficulty,
      created_at: new Date().toISOString(),
      next_review: new Date().toISOString(),
      interval: 1,
      ease_factor: 2.5,
      reviews: 0,
    };

    await kv.set(`card:${cardId}`, card);
    await kv.set(`deck_card:${deck_id}:${cardId}`, cardId);

    // Update deck card count
    deck.card_count = (deck.card_count || 0) + 1;
    deck.updated_at = new Date().toISOString();
    await kv.set(`deck:${deck_id}`, deck);

    // Update user stats
    const userData = await kv.get(`user:${userId}`);
    if (userData) {
      userData.stats.total_cards = (userData.stats.total_cards || 0) + 1;
      await kv.set(`user:${userId}`, userData);
    }

    return c.json({ success: true, card });
  } catch (error) {
    console.log('Error creating card:', error);
    return c.json({ error: 'Failed to create card' }, 500);
  }
});

// Get cards in a deck
app.get("/make-server-f646c9b9/decks/:deckId/cards", verifyAuth, async (c) => {
  try {
    const deckId = c.req.param('deckId');
    const cardIds = await kv.getByPrefix(`deck_card:${deckId}:`);
    
    const cards = await Promise.all(
      cardIds.map(async (cardId) => {
        const card = await kv.get(`card:${cardId}`);
        return card;
      })
    );

    return c.json({ success: true, cards: cards.filter(c => c !== null) });
  } catch (error) {
    console.log('Error fetching cards:', error);
    return c.json({ error: 'Failed to fetch cards' }, 500);
  }
});

// Update card
app.put("/make-server-f646c9b9/cards/:cardId", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const cardId = c.req.param('cardId');
    const updates = await c.req.json();
    
    const card = await kv.get(`card:${cardId}`);
    
    if (!card) {
      return c.json({ error: 'Card not found' }, 404);
    }

    // Verify deck ownership
    const deck = await kv.get(`deck:${card.deck_id}`);
    if (!deck || deck.user_id !== userId) {
      return c.json({ error: 'Unauthorized to update this card' }, 403);
    }

    const updatedCard = {
      ...card,
      ...updates,
    };

    await kv.set(`card:${cardId}`, updatedCard);

    return c.json({ success: true, card: updatedCard });
  } catch (error) {
    console.log('Error updating card:', error);
    return c.json({ error: 'Failed to update card' }, 500);
  }
});

// Delete card
app.delete("/make-server-f646c9b9/cards/:cardId", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const cardId = c.req.param('cardId');
    
    const card = await kv.get(`card:${cardId}`);
    
    if (!card) {
      return c.json({ error: 'Card not found' }, 404);
    }

    // Verify deck ownership
    const deck = await kv.get(`deck:${card.deck_id}`);
    if (!deck || deck.user_id !== userId) {
      return c.json({ error: 'Unauthorized to delete this card' }, 403);
    }

    await kv.del(`card:${cardId}`);
    await kv.del(`deck_card:${card.deck_id}:${cardId}`);

    // Update deck card count
    deck.card_count = Math.max(0, (deck.card_count || 1) - 1);
    deck.updated_at = new Date().toISOString();
    await kv.set(`deck:${card.deck_id}`, deck);

    // Update user stats
    const userData = await kv.get(`user:${userId}`);
    if (userData) {
      userData.stats.total_cards = Math.max(0, (userData.stats.total_cards || 1) - 1);
      await kv.set(`user:${userId}`, userData);
    }

    return c.json({ success: true, message: 'Card deleted successfully' });
  } catch (error) {
    console.log('Error deleting card:', error);
    return c.json({ error: 'Failed to delete card' }, 500);
  }
});

// ============= STUDY SESSION ENDPOINTS =============

// Get due cards for study
app.get("/make-server-f646c9b9/study/due", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.query('deck_id');
    
    let allCards = [];
    
    if (deckId) {
      // Get cards from specific deck
      const cardIds = await kv.getByPrefix(`deck_card:${deckId}:`);
      allCards = await Promise.all(
        cardIds.map(async (cardId) => await kv.get(`card:${cardId}`))
      );
    } else {
      // Get all user's cards
      const userDecks = await kv.getByPrefix(`user_deck:${userId}:`);
      for (const deckId of userDecks) {
        const cardIds = await kv.getByPrefix(`deck_card:${deckId}:`);
        const deckCards = await Promise.all(
          cardIds.map(async (cardId) => await kv.get(`card:${cardId}`))
        );
        allCards.push(...deckCards);
      }
    }

    // Filter due cards
    const now = new Date();
    const dueCards = allCards.filter(card => {
      if (!card) return false;
      const nextReview = new Date(card.next_review);
      return nextReview <= now;
    });

    return c.json({ success: true, cards: dueCards, total: dueCards.length });
  } catch (error) {
    console.log('Error fetching due cards:', error);
    return c.json({ error: 'Failed to fetch due cards' }, 500);
  }
});

// Record study session
app.post("/make-server-f646c9b9/study/record", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { card_id, quality } = await c.req.json();
    
    if (!card_id || quality === undefined) {
      return c.json({ error: 'Card ID and quality are required' }, 400);
    }

    const card = await kv.get(`card:${card_id}`);
    
    if (!card) {
      return c.json({ error: 'Card not found' }, 404);
    }

    // Verify deck ownership
    const deck = await kv.get(`deck:${card.deck_id}`);
    if (!deck || deck.user_id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // SM-2 Algorithm for spaced repetition
    const oldEaseFactor = card.ease_factor || 2.5;
    const oldInterval = card.interval || 1;
    
    let newEaseFactor = oldEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEaseFactor < 1.3) newEaseFactor = 1.3;
    
    let newInterval;
    if (quality < 3) {
      newInterval = 1;
    } else {
      if (oldInterval === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(oldInterval * newEaseFactor);
      }
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);

    card.ease_factor = newEaseFactor;
    card.interval = newInterval;
    card.next_review = nextReview.toISOString();
    card.reviews = (card.reviews || 0) + 1;
    card.last_reviewed = new Date().toISOString();

    await kv.set(`card:${card_id}`, card);

    // Record study session
    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      user_id: userId,
      card_id,
      quality,
      timestamp: new Date().toISOString(),
    };
    await kv.set(`session:${sessionId}`, session);
    await kv.set(`user_session:${userId}:${sessionId}`, sessionId);

    // Update user stats
    const userData = await kv.get(`user:${userId}`);
    if (userData) {
      userData.stats.cards_studied_today = (userData.stats.cards_studied_today || 0) + 1;
      
      // Update streak
      const today = new Date().toDateString();
      const lastStudy = userData.last_study_date || null;
      
      if (lastStudy !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastStudy === yesterday.toDateString()) {
          userData.stats.streak = (userData.stats.streak || 0) + 1;
        } else if (lastStudy !== today) {
          userData.stats.streak = 1;
        }
        
        userData.last_study_date = today;
        userData.stats.cards_studied_today = 1;
      }
      
      await kv.set(`user:${userId}`, userData);
    }

    return c.json({ success: true, card, next_interval: newInterval });
  } catch (error) {
    console.log('Error recording study session:', error);
    return c.json({ error: 'Failed to record study session' }, 500);
  }
});

// ============= COMMUNITY ENDPOINTS =============

// Get community decks
app.get("/make-server-f646c9b9/community/decks", async (c) => {
  try {
    const search = c.req.query('search') || '';
    const allDecks = await kv.getByPrefix('deck:');
    
    const publicDecks = [];
    for (const deckKey of allDecks) {
      const deckId = deckKey.split(':')[1];
      const deck = await kv.get(`deck:${deckId}`);
      
      if (deck && deck.privacy === 'public') {
        // Get community stats
        const stats = await kv.get(`community_stats:${deckId}`) || {
          likes: 0,
          views: 0,
          downloads: 0,
        };
        
        // Get creator info
        const creator = await kv.get(`user:${deck.user_id}`);
        
        publicDecks.push({
          ...deck,
          stats,
          creator: creator ? { name: creator.name, id: creator.id } : null,
        });
      }
    }

    // Filter by search
    let filteredDecks = publicDecks;
    if (search) {
      filteredDecks = publicDecks.filter(deck => 
        deck.title.toLowerCase().includes(search.toLowerCase()) ||
        deck.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by popularity
    filteredDecks.sort((a, b) => (b.stats.likes + b.stats.downloads) - (a.stats.likes + a.stats.downloads));

    return c.json({ success: true, decks: filteredDecks });
  } catch (error) {
    console.log('Error fetching community decks:', error);
    return c.json({ error: 'Failed to fetch community decks' }, 500);
  }
});

// Like a community deck
app.post("/make-server-f646c9b9/community/decks/:deckId/like", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.param('deckId');
    
    const likeKey = `like:${userId}:${deckId}`;
    const existingLike = await kv.get(likeKey);
    
    const stats = await kv.get(`community_stats:${deckId}`) || {
      likes: 0,
      views: 0,
      downloads: 0,
    };

    if (existingLike) {
      // Unlike
      await kv.del(likeKey);
      stats.likes = Math.max(0, stats.likes - 1);
    } else {
      // Like
      await kv.set(likeKey, true);
      stats.likes = (stats.likes || 0) + 1;
    }

    await kv.set(`community_stats:${deckId}`, stats);

    return c.json({ success: true, liked: !existingLike, stats });
  } catch (error) {
    console.log('Error liking deck:', error);
    return c.json({ error: 'Failed to like deck' }, 500);
  }
});

// Clone a community deck
app.post("/make-server-f646c9b9/community/decks/:deckId/clone", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const deckId = c.req.param('deckId');
    
    const originalDeck = await kv.get(`deck:${deckId}`);
    
    if (!originalDeck || originalDeck.privacy !== 'public') {
      return c.json({ error: 'Deck not found or not public' }, 404);
    }

    // Create new deck
    const newDeckId = crypto.randomUUID();
    const newDeck = {
      ...originalDeck,
      id: newDeckId,
      user_id: userId,
      title: `${originalDeck.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      privacy: 'private',
    };

    await kv.set(`deck:${newDeckId}`, newDeck);
    await kv.set(`user_deck:${userId}:${newDeckId}`, newDeckId);

    // Clone cards
    const cardIds = await kv.getByPrefix(`deck_card:${deckId}:`);
    for (const cardId of cardIds) {
      const originalCard = await kv.get(`card:${cardId}`);
      if (originalCard) {
        const newCardId = crypto.randomUUID();
        const newCard = {
          ...originalCard,
          id: newCardId,
          deck_id: newDeckId,
          created_at: new Date().toISOString(),
          next_review: new Date().toISOString(),
          interval: 1,
          ease_factor: 2.5,
          reviews: 0,
        };
        
        await kv.set(`card:${newCardId}`, newCard);
        await kv.set(`deck_card:${newDeckId}:${newCardId}`, newCardId);
      }
    }

    // Update stats
    const stats = await kv.get(`community_stats:${deckId}`) || {
      likes: 0,
      views: 0,
      downloads: 0,
    };
    stats.downloads = (stats.downloads || 0) + 1;
    await kv.set(`community_stats:${deckId}`, stats);

    // Update user stats
    const userData = await kv.get(`user:${userId}`);
    if (userData) {
      userData.stats.total_decks = (userData.stats.total_decks || 0) + 1;
      userData.stats.total_cards = (userData.stats.total_cards || 0) + cardIds.length;
      await kv.set(`user:${userId}`, userData);
    }

    return c.json({ success: true, deck: newDeck });
  } catch (error) {
    console.log('Error cloning deck:', error);
    return c.json({ error: 'Failed to clone deck' }, 500);
  }
});

// ============= ANALYTICS ENDPOINTS =============

// Get user analytics
app.get("/make-server-f646c9b9/analytics", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    
    // Get user data
    const userData = await kv.get(`user:${userId}`);
    
    // Get study sessions
    const sessionIds = await kv.getByPrefix(`user_session:${userId}:`);
    const sessions = await Promise.all(
      sessionIds.map(async (sessionId) => await kv.get(`session:${sessionId}`))
    );

    // Calculate analytics
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const recentSessions = sessions.filter(s => 
      s && new Date(s.timestamp) >= last7Days
    );

    const dailyActivity = {};
    recentSessions.forEach(session => {
      const date = new Date(session.timestamp).toDateString();
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    // Get all cards for mastery calculation
    const userDecks = await kv.getByPrefix(`user_deck:${userId}:`);
    let allCards = [];
    for (const deckId of userDecks) {
      const cardIds = await kv.getByPrefix(`deck_card:${deckId}:`);
      const deckCards = await Promise.all(
        cardIds.map(async (cardId) => await kv.get(`card:${cardId}`))
      );
      allCards.push(...deckCards.filter(c => c !== null));
    }

    const masteryLevels = {
      beginner: allCards.filter(c => (c.reviews || 0) <= 2).length,
      intermediate: allCards.filter(c => (c.reviews || 0) > 2 && (c.reviews || 0) <= 5).length,
      advanced: allCards.filter(c => (c.reviews || 0) > 5).length,
    };

    return c.json({ 
      success: true, 
      analytics: {
        user_stats: userData?.stats || {},
        daily_activity: dailyActivity,
        total_sessions: sessions.length,
        recent_sessions: recentSessions.length,
        mastery_levels: masteryLevels,
        total_cards: allCards.length,
      }
    });
  } catch (error) {
    console.log('Error fetching analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// ============= FILE UPLOAD ENDPOINTS =============

// Upload file
app.post("/make-server-f646c9b9/upload", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const formData = await c.req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    const supabase = getSupabaseAdmin();
    const fileName = `${userId}/${Date.now()}-${file.name}`;

    // Try to upload to Supabase Storage with retry logic
    let uploadError;
    let data;
    let usedFallback = false;
    
    for (let attempt = 1; attempt <= 2; attempt++) {
      console.log(`Upload attempt ${attempt}...`);
      try {
        const uploadResult = await supabase.storage
          .from(STORAGE_BUCKET_NAME)
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false,
          });
        
        data = uploadResult.data;
        uploadError = uploadResult.error;
        
        if (!uploadError) {
          console.log(`Upload successful on attempt ${attempt}`);
          break;
        }
        
        console.log(`Upload attempt ${attempt} failed:`, uploadError);
        
        // Wait before retry
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (err) {
        console.log(`Upload attempt ${attempt} threw error:`, err);
        uploadError = err;
        
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // If storage upload failed, use in-memory cache as fallback
    if (uploadError) {
      console.log('Storage upload failed, using in-memory cache fallback');
      
      try {
        // Store file in memory cache
        fileCache.set(fileName, {
          blob: file,
          timestamp: Date.now(),
          metadata: {
            name: file.name,
            type: file.type,
            size: file.size,
          }
        });
        
        usedFallback = true;
        console.log(`File cached in memory: ${fileName}`);
      } catch (cacheError) {
        console.log('Cache fallback also failed:', cacheError);
        const errorMsg = uploadError?.message || 'Failed to upload file';
        return c.json({ 
          error: errorMsg,
          details: 'Storage is temporarily unavailable. Please try again later.'
        }, 500);
      }
    }

    console.log(`File ${usedFallback ? 'cached' : 'uploaded'} successfully: ${fileName}`);

    // Create signed URL (only if not using fallback)
    let signedUrl = null;
    if (!usedFallback) {
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from(STORAGE_BUCKET_NAME)
        .createSignedUrl(fileName, 3600); // 1 hour expiry

      if (urlError) {
        console.log('Error creating signed URL:', urlError);
      } else {
        signedUrl = signedUrlData?.signedUrl;
      }
    }

    return c.json({ 
      success: true, 
      file: {
        name: file.name,
        path: fileName,
        url: signedUrl,
        type: file.type,
        usedFallback,
      }
    });
  } catch (error) {
    console.log('Error handling file upload:', error);
    return c.json({ 
      error: error?.message || 'Failed to upload file',
      details: 'An unexpected error occurred during upload'
    }, 500);
  }
});

// Process file and extract content
async function processFileContent(filePath: string, fileType: string, fileName: string, supabase: any): Promise<string> {
  console.log(`Processing file: ${fileName}, type: ${fileType}, path: ${filePath}`);
  
  try {
    let data;
    let downloadError;
    
    // First, check if file is in memory cache
    const cachedFile = fileCache.get(filePath);
    if (cachedFile) {
      console.log('File found in memory cache');
      data = cachedFile.blob;
      downloadError = null;
    } else {
      // Try to download file from storage with better error handling
      console.log('Downloading file from storage...');
      
      // First, try the download method
      try {
        const downloadResult = await supabase.storage
          .from(STORAGE_BUCKET_NAME)
          .download(filePath);
        
        data = downloadResult.data;
        downloadError = downloadResult.error;
      } catch (err) {
        console.log('Download method failed, trying alternative approach:', err);
        
        // Alternative: Use signed URL to fetch the file
        try {
          const { data: signedUrlData, error: urlError } = await supabase.storage
            .from(STORAGE_BUCKET_NAME)
            .createSignedUrl(filePath, 3600);
          
          if (urlError || !signedUrlData?.signedUrl) {
            throw new Error('Failed to create signed URL');
          }
          
          console.log('Fetching file via signed URL...');
          const response = await fetch(signedUrlData.signedUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
          }
          
          data = await response.blob();
          downloadError = null;
        } catch (urlErr) {
          console.log('Signed URL approach also failed:', urlErr);
          downloadError = urlErr;
        }
      }
    }

    if (downloadError || !data) {
      console.log('Error downloading file from storage:', downloadError);
      throw new Error(`Failed to download file: ${downloadError?.message || 'Unknown error'}`);
    }

    console.log(`File ${cachedFile ? 'retrieved from cache' : 'downloaded'} successfully, size: ${data.size} bytes`);

    // Convert blob to text based on file type
    let content = '';
    
    if (fileType === 'text/plain') {
      console.log('Processing as text file...');
      content = await data.text();
      console.log(`Extracted ${content.length} characters from text file`);
    } else if (fileType === 'application/pdf') {
      console.log('Processing as PDF file...');
      // For PDF files, try to extract text
      const arrayBuffer = await data.arrayBuffer();
      console.log(`PDF ArrayBuffer size: ${arrayBuffer.byteLength} bytes`);
      
      // Try using pdfjs-dist which works better in Deno
      try {
        // Import pdfjs for better PDF parsing
        const pdfjsLib = await import('npm:pdfjs-dist@3.11.174');
        
        // Load the PDF
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        
        console.log(`PDF loaded successfully, ${pdf.numPages} pages`);
        
        // Extract text from all pages with better formatting
        const pageTexts: string[] = [];
        for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 50); pageNum++) {
          try {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            // Sort items by Y position (top to bottom) then X position (left to right)
            const items = textContent.items.sort((a: any, b: any) => {
              const yDiff = Math.abs(a.transform[5] - b.transform[5]);
              if (yDiff > 5) {
                return b.transform[5] - a.transform[5]; // Sort by Y position (top to bottom)
              }
              return a.transform[4] - b.transform[4]; // Sort by X position (left to right)
            });
            
            // Build text with better spacing
            let pageText = '';
            let lastY = -1;
            
            items.forEach((item: any) => {
              const currentY = item.transform[5];
              const text = item.str;
              
              // Add line break if Y position changed significantly
              if (lastY !== -1 && Math.abs(currentY - lastY) > 5) {
                pageText += '\n';
              } else if (pageText.length > 0 && !pageText.endsWith(' ')) {
                pageText += ' ';
              }
              
              pageText += text;
              lastY = currentY;
            });
            
            if (pageText.trim()) {
              pageTexts.push(`[Page ${pageNum}]\n${pageText.trim()}`);
            }
            
            console.log(`Extracted ${pageText.length} characters from page ${pageNum}`);
          } catch (pageError) {
            console.log(`Error extracting page ${pageNum}:`, pageError);
          }
        }
        
        content = pageTexts.join('\n\n');
        console.log(`Total extracted: ${content.length} characters from ${pageTexts.length} pages`);
        
        // Clean up the content
        content = content
          .replace(/\s+/g, ' ') // Normalize whitespace
          .replace(/\n\s+/g, '\n') // Remove whitespace at line starts
          .replace(/\n{3,}/g, '\n\n'); // Normalize multiple line breaks
        
        if (content.length < 100) {
          // If very little content extracted, provide detailed fallback
          console.log('Warning: Very little content extracted from PDF');
          content = `PDF Document Analysis: ${fileName}

This PDF contains ${pdf.numPages} page(s) (${Math.floor(arrayBuffer.byteLength / 1024)}KB).

Possible reasons for limited text extraction:
- The PDF may contain scanned images instead of searchable text
- The document might use special formatting or embedded fonts
- The content could be in images, charts, or diagrams

What we know:
- Document title: ${fileName.replace(/\.[^/.]+$/, '')}
- Number of pages: ${pdf.numPages}
- File size: ${Math.floor(arrayBuffer.byteLength / 1024)}KB

The flashcards generated will focus on the document title and structure. For better results, try uploading a PDF with searchable text or convert scanned PDFs using OCR first.`;
        } else {
          console.log('Successfully extracted meaningful content from PDF');
        }
      } catch (pdfError) {
        console.log('PDF parsing error:', pdfError);
        console.log('Error type:', pdfError instanceof Error ? pdfError.name : 'Unknown');
        console.log('Error message:', pdfError instanceof Error ? pdfError.message : 'Unknown');
        
        // Fallback content with helpful information
        const sizeKB = Math.floor(arrayBuffer.byteLength / 1024);
        content = `PDF Document: ${fileName}

This ${sizeKB}KB PDF file encountered a processing error during text extraction.

Error details: ${pdfError instanceof Error ? pdfError.message : 'Unknown error occurred'}

Common causes:
- PDF may be password-protected or encrypted
- File might be corrupted
- PDF format might be incompatible with the parser

Recommendations:
- Ensure the PDF is not password-protected
- Try converting to a different PDF format
- Check if the PDF contains readable text (not just images)

The flashcards will be generated based on the filename and general educational concepts related to: ${fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')}`;
      }
    } else if (fileType.startsWith('image/')) {
      console.log('Processing as image file...');
      const sizeKB = Math.floor(data.size / 1024);
      content = `Image File: ${fileName}\n\nThis is a ${sizeKB}KB image file. In a production environment, OCR (Optical Character Recognition) would be used to extract any text visible in the image.\n\nTypical content that could be extracted:\n- Handwritten notes\n- Printed text from slides or documents\n- Diagrams with labels\n- Charts and graphs with annotations\n\nFlashcards will be generated based on the file name and common study patterns.`;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      console.log('Processing as Word document...');
      const sizeKB = Math.floor(data.size / 1024);
      content = `Word Document: ${fileName}\n\nThis is a ${sizeKB}KB Word document. In a production environment, document parsing libraries (like mammoth.js) would extract:\n- All paragraph text\n- Headings and subheadings\n- Lists and bullet points\n- Table contents\n- Comments and annotations\n\nFlashcards will be generated based on the file name and document structure.`;
    } else {
      console.log('Unsupported file type');
      content = `File: ${fileName}\n\nThis file type (${fileType}) requires specialized processing. Flashcards will be generated based on the file name.`;
    }

    console.log(`Final content length: ${content.length} characters`);
    return content;
  } catch (error) {
    console.log('Error processing file content:', error);
    // Return a fallback content instead of throwing
    return `File: ${fileName}\n\nUnable to process file content automatically. Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nFlashcards will be generated with general study questions.`;
  }
}

// Generate intelligent flashcards from content
function generateFlashcardsFromContent(content: string, fileName: string): Array<{ front: string; back: string }> {
  console.log('=== GENERATING FLASHCARDS ===');
  console.log('Content length:', content.length);
  console.log('File name:', fileName);
  
  const flashcards: Array<{ front: string; back: string }> = [];
  
  // Clean and normalize content
  const normalizedContent = content.replace(/\s+/g, ' ').trim();
  console.log('Normalized content length:', normalizedContent.length);
  
  // If content is too short, generate basic cards
  if (normalizedContent.length < 50) {
    console.log('Content too short, returning basic cards');
    return [
      { 
        front: `What is this document about?`, 
        back: normalizedContent || `This is the file: ${fileName}`
      }
    ];
  }
  
  // Split content into paragraphs and sentences
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 20);
  const sentences = normalizedContent.match(/[^.!?]+[.!?]+/g) || [];
  
  console.log('Paragraphs found:', paragraphs.length);
  console.log('Sentences found:', sentences.length);
  
  // Extract headings and titles (lines that are shorter and potentially titles)
  const headings = content.split('\n')
    .filter(line => line.trim().length > 5 && line.trim().length < 100 && !line.includes('.'))
    .slice(0, 5);
  
  console.log('Potential headings found:', headings.length);
  
  // 1. Create cards from headings/titles
  headings.forEach((heading, index) => {
    const headingText = heading.trim();
    if (headingText && index < paragraphs.length) {
      flashcards.push({
        front: `What is ${headingText.toLowerCase()}?`,
        back: paragraphs[index].substring(0, 300).trim()
      });
    }
  });
  
  // 2. Extract definitions (lines containing "is", "means", "refers to", "defined as")
  const definitionPatterns = [
    /(.+?)\s+is\s+(.+?)[.!?]/gi,
    /(.+?)\s+means\s+(.+?)[.!?]/gi,
    /(.+?)\s+refers to\s+(.+?)[.!?]/gi,
    /(.+?)\s+is defined as\s+(.+?)[.!?]/gi,
  ];
  
  definitionPatterns.forEach(pattern => {
    const matches = [...content.matchAll(pattern)];
    matches.slice(0, 3).forEach(match => {
      if (match[1] && match[2]) {
        const term = match[1].trim();
        const definition = match[2].trim();
        
        // Only add if term is reasonable length (not a whole sentence)
        if (term.length > 3 && term.length < 80 && !term.includes(',')) {
          flashcards.push({
            front: `What is ${term}?`,
            back: definition
          });
        }
      }
    });
  });
  
  // 3. Extract numbered lists and bullet points
  const numberedItems = content.match(/\d+\.\s*(.+?)(?=\n\d+\.|\n\n|$)/gs);
  const bulletItems = content.match(/[•\-\*]\s*(.+?)(?=\n[•\-\*]|\n\n|$)/gs);
  
  if (numberedItems && numberedItems.length > 2) {
    console.log('Found numbered list with', numberedItems.length, 'items');
    flashcards.push({
      front: `List the key points from ${fileName}`,
      back: numberedItems.slice(0, 7).map(item => item.trim()).join('\n')
    });
  }
  
  if (bulletItems && bulletItems.length > 2) {
    console.log('Found bullet list with', bulletItems.length, 'items');
    flashcards.push({
      front: `What are the main items discussed?`,
      back: bulletItems.slice(0, 7).map(item => item.trim()).join('\n')
    });
  }
  
  // 4. Find sentences with key educational keywords
  const keywords = [
    'important', 'significant', 'key', 'main', 'primary', 'essential',
    'define', 'definition', 'concept', 'theory', 'principle', 
    'rule', 'law', 'formula', 'equation', 'theorem',
    'example', 'instance', 'case', 'demonstrates',
    'because', 'therefore', 'thus', 'hence', 'consequently',
    'first', 'second', 'third', 'finally', 'lastly'
  ];
  
  const importantSentences = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    return keywords.some(keyword => lowerSentence.includes(keyword));
  });
  
  console.log('Important sentences found:', importantSentences.length);
  
  // Create cards from important sentences
  importantSentences.slice(0, 5).forEach(sentence => {
    const trimmedSentence = sentence.trim();
    
    // Try to extract the key part as a question
    if (trimmedSentence.length > 30 && trimmedSentence.length < 300) {
      // Find the main subject
      const words = trimmedSentence.split(' ');
      if (words.length > 5) {
        flashcards.push({
          front: `Explain: "${words.slice(0, 8).join(' ')}..."`,
          back: trimmedSentence
        });
      }
    }
  });
  
  // 5. Create summary cards from first few sentences
  if (sentences.length >= 3) {
    flashcards.push({
      front: `What is the introduction/overview of ${fileName.replace(/\.[^/.]+$/, '')}?`,
      back: sentences.slice(0, 3).join(' ').substring(0, 400)
    });
  }
  
  // 6. Create cards from distinct paragraphs
  if (paragraphs.length >= 3 && flashcards.length < 5) {
    paragraphs.slice(1, 4).forEach((para, index) => {
      if (para.trim().length > 50) {
        flashcards.push({
          front: `What is discussed in section ${index + 1}?`,
          back: para.trim().substring(0, 350)
        });
      }
    });
  }
  
  // 7. Extract question-answer pairs if they exist in the content
  const qaPattern = /(?:Q:|Question:|query:)\s*(.+?)\s*(?:A:|Answer:|response:)\s*(.+?)(?=Q:|Question:|$)/gis;
  const qaMatches = [...content.matchAll(qaPattern)];
  
  qaMatches.slice(0, 3).forEach(match => {
    if (match[1] && match[2]) {
      flashcards.push({
        front: match[1].trim(),
        back: match[2].trim().substring(0, 400)
      });
    }
  });
  
  // Remove duplicates based on similar front text
  const uniqueFlashcards: Array<{ front: string; back: string }> = [];
  const seenFronts = new Set<string>();
  
  flashcards.forEach(card => {
    const normalizedFront = card.front.toLowerCase().substring(0, 50);
    if (!seenFronts.has(normalizedFront) && card.back.length > 10) {
      seenFronts.add(normalizedFront);
      uniqueFlashcards.push(card);
    }
  });
  
  console.log('Generated', uniqueFlashcards.length, 'unique flashcards');
  
  // If we still don't have enough cards, create some from content chunks
  if (uniqueFlashcards.length < 3) {
    console.log('Not enough cards, adding content chunks');
    const chunkSize = Math.floor(normalizedContent.length / 5);
    for (let i = 0; i < 5 && uniqueFlashcards.length < 5; i++) {
      const chunk = normalizedContent.substring(i * chunkSize, (i + 1) * chunkSize).trim();
      if (chunk.length > 50) {
        uniqueFlashcards.push({
          front: `What is covered in part ${i + 1} of the document?`,
          back: chunk.substring(0, 300)
        });
      }
    }
  }
  
  // Return 5-15 cards
  const finalCards = uniqueFlashcards.slice(0, 15);
  console.log('Returning', finalCards.length, 'flashcards');
  
  // Log first card as example
  if (finalCards.length > 0) {
    console.log('Example card - Front:', finalCards[0].front);
    console.log('Example card - Back:', finalCards[0].back.substring(0, 100));
  }
  
  return finalCards;
}

// Generate flashcards from uploaded file
app.post("/make-server-f646c9b9/upload/generate", verifyAuth, async (c) => {
  try {
    console.log('=== FLASHCARD GENERATION REQUEST ===');
    const userId = c.get('userId');
    const { file_path, file_type, file_name, deck_title } = await c.req.json();
    
    console.log('User ID:', userId);
    console.log('File path:', file_path);
    console.log('File type:', file_type);
    console.log('File name:', file_name);
    console.log('Deck title:', deck_title);
    
    if (!file_path || !deck_title) {
      console.log('ERROR: Missing required fields');
      return c.json({ error: 'File path and deck title are required' }, 400);
    }

    const supabase = getSupabaseAdmin();
    
    // Extract content from the file
    console.log('Starting content extraction...');
    let extractedContent = '';
    try {
      extractedContent = await processFileContent(file_path, file_type, file_name, supabase);
      console.log('Content extracted successfully, length:', extractedContent.length);
      console.log('Content preview:', extractedContent.substring(0, 200));
    } catch (error) {
      console.log('Content extraction error:', error);
      extractedContent = `Unable to extract full content from ${file_name}. The file was uploaded successfully. Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Create a new deck
    const deckId = crypto.randomUUID();
    const deck = {
      id: deckId,
      user_id: userId,
      title: deck_title,
      description: `Auto-generated from ${file_name}`,
      privacy: 'private',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      card_count: 0,
    };

    await kv.set(`deck:${deckId}`, deck);
    await kv.set(`user_deck:${userId}:${deckId}`, deckId);

    // Generate flashcards from extracted content
    console.log('Generating flashcards from content...');
    const generatedCards = generateFlashcardsFromContent(extractedContent, file_name || 'document');
    console.log(`Generated ${generatedCards.length} flashcard templates`);
    
    // Log first card as example
    if (generatedCards.length > 0) {
      console.log('Example flashcard:');
      console.log('Front:', generatedCards[0].front);
      console.log('Back:', generatedCards[0].back.substring(0, 100));
    }

    console.log('Saving flashcards to database...');
    const cards = [];
    for (const generatedCard of generatedCards) {
      const cardId = crypto.randomUUID();
      const card = {
        id: cardId,
        deck_id: deckId,
        front: generatedCard.front,
        back: generatedCard.back,
        difficulty: 'medium',
        created_at: new Date().toISOString(),
        next_review: new Date().toISOString(),
        interval: 1,
        ease_factor: 2.5,
        reviews: 0,
      };

      await kv.set(`card:${cardId}`, card);
      await kv.set(`deck_card:${deckId}:${cardId}`, cardId);
      cards.push(card);
    }
    console.log(`Saved ${cards.length} cards to database`);

    // Update deck card count
    deck.card_count = cards.length;
    await kv.set(`deck:${deckId}`, deck);
    console.log('Updated deck card count');

    // Update user stats
    const userData = await kv.get(`user:${userId}`);
    if (userData) {
      userData.stats.total_decks = (userData.stats.total_decks || 0) + 1;
      userData.stats.total_cards = (userData.stats.total_cards || 0) + cards.length;
      await kv.set(`user:${userId}`, userData);
      console.log('Updated user stats');
    }

    const response = { 
      success: true, 
      deck,
      cards,
      extracted_content: extractedContent.substring(0, 500), // Send preview of content
      message: `Generated ${cards.length} flashcards from ${file_name}`
    };
    
    console.log('=== FLASHCARD GENERATION SUCCESS ===');
    console.log(`Returning ${cards.length} cards in deck "${deck_title}"`);
    
    return c.json(response);
  } catch (error) {
    console.log('=== FLASHCARD GENERATION ERROR ===');
    console.log('Error details:', error);
    console.log('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate flashcards',
      details: error instanceof Error ? error.stack : undefined
    }, 500);
  }
});

Deno.serve(app.fetch);
