# FlashMind Backend Setup Guide

## Overview
FlashMind now has a complete backend powered by Supabase, including:
- ✅ User authentication (signup/login)
- ✅ Database operations (decks, flashcards, progress tracking)
- ✅ File upload and storage
- ✅ Study progress with spaced repetition algorithm
- ✅ Community deck sharing and ratings
- ✅ Analytics and learning insights
- ✅ AI flashcard generation endpoints

## Backend Architecture

### Three-Tier Architecture
```
Frontend (React) → Server (Hono/Deno) → Database (Supabase)
```

### Server Location
- **Path**: `/supabase/functions/server/index.tsx`
- **Runtime**: Deno Edge Function
- **Framework**: Hono web server
- **Database**: Supabase KV Store + Auth + Storage

### API Base URL
```
https://${projectId}.supabase.co/functions/v1/make-server-f646c9b9
```

## Authentication System

### Sign Up Flow
1. User fills out signup form with email, password, and name
2. Frontend calls `authAPI.signup(email, password, name)`
3. Server creates user with Supabase Auth (email auto-confirmed)
4. User data stored in KV store with initial stats
5. User automatically logged in after signup

### Login Flow
1. User enters credentials
2. Frontend calls `authAPI.login(email, password)`
3. Server validates credentials with Supabase Auth
4. Returns access token and user data
5. Token stored in localStorage for subsequent requests

### Session Management
- Access token stored in localStorage as `flashmind_auth_token`
- Token sent in Authorization header: `Bearer ${token}`
- Session checked on app load to restore user state
- Logout clears token and user data

## Database Schema

### Users (`user:{userId}`)
```typescript
{
  userId: string
  email: string
  name: string
  createdAt: string
  stats: {
    totalDecks: number
    totalCards: number
    studyStreak: number
    level: number
    xp: number
  }
}
```

### Decks (`deck:{userId}:{deckId}`)
```typescript
{
  deckId: string
  userId: string
  name: string
  description: string
  category: string
  isPublic: boolean
  createdAt: string
  cardCount: number
  stats: {
    totalStudies: number
    averageAccuracy: number
    lastStudied: string | null
  }
}
```

### Flashcards (`card:{deckId}:{cardId}`)
```typescript
{
  cardId: string
  deckId: string
  userId: string
  question: string
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  source: 'manual' | 'ai' | 'upload'
  createdAt: string
  stats: {
    reviews: number
    correct: number
    incorrect: number
  }
}
```

### Study Progress (`progress:{userId}:{cardId}`)
```typescript
{
  cardId: string
  userId: string
  lastStudied: string | null
  nextReview: string
  interval: number // days until next review
  easeFactor: number // SM-2 algorithm factor
  repetitions: number
}
```

### Community Ratings (`rating:{deckId}:{userId}`)
```typescript
{
  ratingId: string
  deckId: string
  userId: string
  rating: number // 1-5
  review: string
  createdAt: string
}
```

### Analytics (`analytics:{userId}:{date}`)
```typescript
{
  date: string // YYYY-MM-DD
  cardsStudied: number
  timeSpent: number // minutes
  accuracy: number // percentage
  streakMaintained: boolean
}
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Login with email/password
- `GET /auth/session` - Get current session (requires auth)

### Decks
- `GET /decks` - Get all decks for authenticated user
- `POST /decks` - Create new deck
- `PUT /decks/:deckId` - Update deck
- `DELETE /decks/:deckId` - Delete deck

### Flashcards
- `GET /decks/:deckId/cards` - Get all cards in a deck
- `POST /decks/:deckId/cards` - Create new card
- `DELETE /cards/:cardId` - Delete card

### Study Progress
- `GET /study/progress` - Get all study progress for user
- `POST /study/progress` - Update progress (SM-2 spaced repetition)

### Community
- `GET /community/decks` - Get public decks with ratings
- `POST /community/decks/:deckId/rate` - Rate a community deck

### Analytics
- `GET /analytics` - Get user analytics and stats
- `POST /analytics/daily` - Update daily analytics

### File Upload
- `POST /upload` - Upload file to Supabase Storage

### AI Generation
- `POST /ai/generate-cards` - Generate flashcards from content

## Frontend API Usage

### Using the API Service
```typescript
import { authAPI, deckAPI, cardAPI, studyAPI } from '../utils/api';

// Sign up
await authAPI.signup('email@example.com', 'password123', 'John Doe');

// Login
const { user, accessToken } = await authAPI.login('email@example.com', 'password123');

// Create deck
const { deck } = await deckAPI.create({
  name: 'Biology 101',
  description: 'Cell biology fundamentals',
  category: 'science',
  isPublic: false
});

// Add cards
await cardAPI.create(deck.deckId, {
  question: 'What is mitochondria?',
  answer: 'The powerhouse of the cell',
  difficulty: 'medium',
  tags: ['biology', 'cells']
});

// Update study progress (quality: 0-5)
await studyAPI.updateProgress(cardId, 4);
```

### Auth Context
```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  return <div>Welcome, {user.name}!</div>;
}
```

## Spaced Repetition Algorithm

FlashMind uses the **SM-2 algorithm** for optimal learning:

### Quality Ratings (0-5)
- **5**: Perfect recall
- **4**: Correct after hesitation
- **3**: Correct with difficulty
- **2**: Incorrect but remembered
- **1**: Incorrect, vague memory
- **0**: Complete blackout

### Algorithm Logic
```typescript
if (quality >= 3) {
  // Correct answer
  if (repetitions === 0) interval = 1 day
  else if (repetitions === 1) interval = 6 days
  else interval = Math.round(previousInterval * easeFactor)
  repetitions++
} else {
  // Incorrect answer - reset
  repetitions = 0
  interval = 1 day
}

// Update ease factor
easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
easeFactor = Math.max(1.3, easeFactor) // minimum 1.3
```

## File Storage

### Bucket Configuration
- **Name**: `make-f646c9b9-flashmind-uploads`
- **Type**: Private bucket
- **Access**: Signed URLs (1 hour expiry)

### Upload Flow
1. User selects file in Upload Studio
2. File sent to `/upload` endpoint
3. Server uploads to Supabase Storage
4. Returns signed URL for frontend access
5. File metadata stored with deck/cards

## Development Workflow

### Running Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Testing Authentication
1. Open app in browser
2. Click "Sign Up" tab
3. Create account with email/password
4. Should auto-login after signup
5. User data appears in sidebar

### Testing Backend
```typescript
// Check server health
fetch('https://${projectId}.supabase.co/functions/v1/make-server-f646c9b9/health')
  .then(r => r.json())
  .then(console.log); // { status: "ok", service: "FlashMind Backend" }
```

## Security Notes

### Important
- ⚠️ **This is a prototype/demo environment**
- ⚠️ **Not suitable for production or PII**
- ⚠️ **SUPABASE_SERVICE_ROLE_KEY never exposed to frontend**
- ✅ All API routes use proper authentication
- ✅ Protected routes verify access tokens
- ✅ Storage buckets are private with signed URLs

### Protected Routes
Routes requiring authentication:
- All `/decks/*` endpoints
- All `/cards/*` endpoints
- `/study/progress`
- `/analytics`
- `/upload`
- `/community/decks/:deckId/rate`

## Error Handling

### Frontend
All API calls wrapped in try/catch with toast notifications:
```typescript
try {
  await deckAPI.create({ name: 'New Deck' });
  toast.success('Deck created!');
} catch (error) {
  toast.error(error.message || 'Failed to create deck');
}
```

### Backend
Detailed error messages logged and returned:
```typescript
console.error('Error creating deck:', error);
return c.json({ error: 'Internal server error while creating deck' }, 500);
```

## Future Enhancements

### Planned Features
- [ ] Real-time collaboration on decks
- [ ] AI-powered study recommendations
- [ ] Integration with external APIs (OpenAI, Anthropic)
- [ ] Advanced analytics with ML insights
- [ ] Social features (followers, comments)
- [ ] Mobile app with offline support

### Database Migrations
**Note**: The current setup uses a flexible KV store. For production:
- Consider migrating to structured Postgres tables
- Implement proper database migrations
- Add database indexes for performance
- Set up foreign key constraints

## Troubleshooting

### Common Issues

**Problem**: "Unauthorized" error on all API calls
**Solution**: Check if access token is stored and valid:
```typescript
import { getAuthToken } from '../utils/api';
console.log('Token:', getAuthToken());
```

**Problem**: Can't create decks/cards
**Solution**: Ensure user is logged in and token is fresh

**Problem**: File upload fails
**Solution**: Check file size and type, ensure storage bucket exists

**Problem**: Spaced repetition not working
**Solution**: Verify progress is being tracked in `/study/progress` endpoint

## Support

For issues or questions:
1. Check browser console for errors
2. Check server logs in Supabase dashboard
3. Verify API endpoints are accessible
4. Test with simple curl/fetch requests first

---

**Built with**: React, TypeScript, Supabase, Hono, Tailwind CSS
**Last Updated**: October 13, 2025
