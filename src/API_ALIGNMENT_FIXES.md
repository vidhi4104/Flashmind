# API Alignment Fixes

## Overview
Fixed inconsistencies between frontend API client and backend server endpoints to ensure proper communication.

## Issues Fixed

### 1. Duplicate API Files ✅
**Problem**: Two API files existed (`/utils/api.ts` and `/utils/api.tsx`) with different implementations
**Solution**: Deleted the old `/utils/api.tsx` file and kept the updated `/utils/api.ts`

### 2. Deck API Field Mismatch ✅
**Problem**: Frontend sent `name`, `category`, `isPublic` but server expected `title`, `description`, `privacy`
**Solution**: Updated `deckAPI.create()` to match server expectations

**Before**:
```typescript
create: async (deck: {
  name: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
})
```

**After**:
```typescript
create: async (deck: {
  title: string;
  description?: string;
  privacy?: 'private' | 'public';
})
```

### 3. Card API Endpoint Mismatch ✅
**Problem**: Frontend sent to `/decks/:deckId/cards` but server expects `/cards` with `deck_id` in body
**Solution**: Updated `cardAPI.create()` to send to correct endpoint with proper fields

**Before**:
```typescript
create: async (deckId: string, card: {
  question: string;
  answer: string;
  difficulty?: string;
})
```

**After**:
```typescript
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
}
```

### 4. Study API Endpoint Mismatch ✅
**Problem**: Frontend called `/study/progress` but server uses `/study/record`
**Solution**: Updated `studyAPI.updateProgress()` to use correct endpoint and field names

**Before**:
```typescript
updateProgress: async (cardId: string, quality: number) => {
  return await apiRequest('/study/progress', {
    method: 'POST',
    body: JSON.stringify({ cardId, quality }),
  });
}
```

**After**:
```typescript
updateProgress: async (cardId: string, quality: number) => {
  return await apiRequest('/study/record', {
    method: 'POST',
    body: JSON.stringify({ card_id: cardId, quality }),
  });
}
```

### 5. Missing getDueCards Method ✅
**Problem**: `DashboardWithBackend` called `studyAPI.getDueCards()` which didn't exist
**Solution**: Added `getDueCards()` method to studyAPI

```typescript
getDueCards: async (deckId?: string) => {
  const query = deckId ? `?deck_id=${deckId}` : '';
  return await apiRequest(`/study/due${query}`);
}
```

## API Consistency Summary

### Authentication Endpoints
| Frontend Method | Backend Endpoint | Request Fields | Response Fields |
|----------------|------------------|----------------|-----------------|
| `authAPI.signup()` | `POST /auth/signup` | `email, password, name` | `success, access_token, user` |
| `authAPI.login()` | `POST /auth/login` | `email, password` | `success, access_token, user` |
| `authAPI.getCurrentUser()` | `GET /auth/me` | Headers: `Authorization` | `success, user` |

### Deck Endpoints
| Frontend Method | Backend Endpoint | Request Fields | Response Fields |
|----------------|------------------|----------------|-----------------|
| `deckAPI.create()` | `POST /decks` | `title, description, privacy` | `success, deck` |
| `deckAPI.getAll()` | `GET /decks` | Headers: `Authorization` | `success, decks` |
| `deckAPI.update()` | `PUT /decks/:deckId` | `updates object` | `success, deck` |
| `deckAPI.delete()` | `DELETE /decks/:deckId` | - | `success, message` |

### Card Endpoints
| Frontend Method | Backend Endpoint | Request Fields | Response Fields |
|----------------|------------------|----------------|-----------------|
| `cardAPI.create()` | `POST /cards` | `deck_id, front, back, difficulty` | `success, card` |
| `cardAPI.getForDeck()` | `GET /decks/:deckId/cards` | - | `success, cards` |
| `cardAPI.delete()` | `DELETE /cards/:cardId` | - | `success, message` |

### Study Endpoints
| Frontend Method | Backend Endpoint | Request Fields | Response Fields |
|----------------|------------------|----------------|-----------------|
| `studyAPI.getDueCards()` | `GET /study/due` | Query: `deck_id?` | `success, cards, total` |
| `studyAPI.updateProgress()` | `POST /study/record` | `card_id, quality` | `success, card` |

### Community Endpoints
| Frontend Method | Backend Endpoint | Request Fields | Response Fields |
|----------------|------------------|----------------|-----------------|
| `communityAPI.getPublicDecks()` | `GET /community/decks` | - | `success, decks` |
| `communityAPI.rateDeck()` | `POST /community/decks/:deckId/rate` | `rating, review` | `success` |

### Analytics Endpoints
| Frontend Method | Backend Endpoint | Request Fields | Response Fields |
|----------------|------------------|----------------|-----------------|
| `analyticsAPI.getAnalytics()` | `GET /analytics` | Headers: `Authorization` | `success, analytics` |

### Upload Endpoints
| Frontend Method | Backend Endpoint | Request Fields | Response Fields |
|----------------|------------------|----------------|-----------------|
| `uploadAPI.uploadFile()` | `POST /upload` | FormData with `file` | `success, url, path` |

## Field Name Conventions

### Server Conventions (Snake Case)
- `user_id`
- `deck_id`
- `card_id`
- `created_at`
- `updated_at`
- `next_review`
- `ease_factor`

### Frontend Conventions (Camel Case in TypeScript, Snake Case in API Calls)
- Frontend TypeScript uses camelCase for better JS conventions
- API calls transform to snake_case to match server expectations
- Responses may use snake_case and should be handled appropriately

## Testing Checklist

After these fixes, verify:
- [x] User can sign up successfully
- [x] User can log in successfully
- [x] Dashboard loads with user stats
- [ ] User can create a new deck
- [ ] User can add flashcards to a deck
- [ ] Study mode shows due cards
- [ ] Study progress updates correctly with spaced repetition
- [ ] Community features work
- [ ] Analytics display properly
- [ ] File upload works

## Next Steps

1. Test all API endpoints with real user actions
2. Verify data persistence across page refreshes
3. Test edge cases (empty states, errors, etc.)
4. Implement proper error handling and user feedback
5. Add loading states for all async operations

---

**Status**: API alignment complete! All endpoints now match between frontend and backend.
