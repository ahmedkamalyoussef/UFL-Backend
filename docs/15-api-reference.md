# UFL Backend Final REST API Reference Specification

Base URL: `/api/v1`

---

## 1. Authentication
- **`POST /auth/register`**
  - **Auth**: Public
  - **Body**: `{ "username": "string", "email": "string", "password": "string" }`
  - **Response**: `{ "success": true, "data": { "token": "JWT", "user": { "id", "username", "email" }, "wallet": { "balance": 500 } } }`
- **`POST /auth/login`**
  - **Auth**: Public
  - **Body**: `{ "email": "string", "password": "string" }`
  - **Response**: `{ "success": true, "data": { "token": "JWT", "user": { "id", "username", "email" } } }`
- **`GET /me`**
  - **Auth**: Bearer JWT
  - **Response**: `{ "success": true, "data": { "id", "username", "email", "avatarUrl", "wallet": { "balance", "careerCoins" }, "stats": { "rankingPoints", "gamesPlayed", "gamesWon" } } }`

---

## 2. User & Game History
- **`GET /users/me/games`**
  - **Auth**: Bearer JWT
  - **Query**: `page=1&limit=20`
  - **Response**: `{ "success": true, "data": { "items": [ { "gameId", "status", "totalPoints", "joinedAt", "fixture": { "homeScore", "awayScore", "competition", "homeTeam", "awayTeam" } } ], "pagination": { "page", "limit", "total", "hasNext" } } }`

---

## 3. Wallet
- **`GET /wallet`**
  - **Auth**: Bearer JWT
  - **Response**: `{ "success": true, "data": { "id", "balance", "careerCoins", "isEligibleForRewardedAd": boolean } }`
- **`GET /wallet/transactions`**
  - **Auth**: Bearer JWT
  - **Query**: `page=1&limit=20`
  - **Response**: `{ "success": true, "data": { "items": [ { "id", "amount", "type", "description", "createdAt" } ], "pagination": { "page", "limit", "total", "hasNext" } } }`
- **`POST /wallet/claim-rewarded-ad`**
  - **Auth**: Bearer JWT
  - **Response**: `{ "success": true, "data": { "addedCoins": 500, "newBalance": 500, "transactionId": "string" } }`

---

## 4. Football Data
- **`GET /competitions`**
  - **Auth**: Public
  - **Response**: `{ "success": true, "data": [ { "id", "code", "name", "logoUrl" } ] }`
- **`GET /matches`**
  - **Auth**: Public
  - **Query**: `competitionId=string&status=SCHEDULED|LIVE|FINISHED`
  - **Response**: `{ "success": true, "data": [ { "id", "externalId", "status", "homeScore", "awayScore", "elapsed", "startTime", "competition", "homeTeam", "awayTeam" } ] }`
- **`GET /matches/:id`**
  - **Auth**: Public
  - **Response**: `{ "success": true, "data": { "id", "status", "homeScore", "awayScore", "elapsed", "startTime", "competition", "homeTeam", "awayTeam", "openGames": [] } }`

---

## 5. Game Rooms
- **`GET /games`**
  - **Auth**: Public
  - **Query**: `fixtureId=string&status=WAITING|DRAFTING|LIVE`
  - **Response**: `{ "success": true, "data": [ { "id", "fixtureId", "status", "entryFee", "currentParticipantCount": 4, "maxParticipants": 4 } ] }`
- **`POST /games`**
  - **Auth**: Public / Internal
  - **Body**: `{ "fixtureId": "string", "entryFee": 500 }`
  - **Response**: `{ "success": true, "data": { "id", "fixtureId", "status": "WAITING", "entryFee": 500 } }`
- **`POST /games/:id/join`**
  - **Auth**: Bearer JWT
  - **Response**: `{ "success": true, "data": { "gameId", "participantId", "draftPosition", "remainingBalance" } }`
- **`POST /games/:id/cancel`**
  - **Auth**: Public / System
  - **Body**: `{ "reason": "string" }`
  - **Response**: `{ "success": true, "data": { "gameId", "status": "CANCELLED", "refundedCount": 4 } }`

---

## 6. Snake Draft
- **`GET /games/:id/draft/state`**
  - **Auth**: Bearer JWT
  - **Response**: `{ "success": true, "data": { "gameId", "status", "currentTurn": { "turnNumber", "participantId", "timeRemainingSeconds" }, "selections": [], "availablePlayers": [] } }`
- **`POST /games/:id/draft/select`**
  - **Auth**: Bearer JWT
  - **Body**: `{ "playerId": "string" }`
  - **Response**: `{ "success": true, "data": { "turnNumber", "participantId", "playerId", "isAutoPick": false } }`

---

## 7. Scoring & Settlement
- **`GET /games/:id/ranking`**
  - **Auth**: Public / Authenticated
  - **Response**: `{ "success": true, "data": { "gameId", "rankings": [ { "rank", "participantId", "username", "fantasyPoints" } ] } }`
- **`GET /games/:id/players/:playerId/points`**
  - **Auth**: Public / Authenticated
  - **Response**: `{ "success": true, "data": { "playerId", "totalFantasyPoints": 45, "breakdown": [ { "rule": "GOAL", "points": 40, "count": 1 } ] } }`
- **`GET /games/:id/result`**
  - **Auth**: Bearer JWT
  - **Response**: `{ "success": true, "data": { "gameId", "status": "FINISHED", "currentUserResult": { "rank": 1, "coinReward": 1000, "rpChange": 3 }, "results": [] } }`
- **`POST /games/:id/settle`**
  - **Auth**: Public / System
  - **Response**: `{ "success": true, "data": { "gameId", "status": "FINISHED", "settledAt": "Date", "results": [] } }`

---

## 8. Global Ranking & Seasons
- **`GET /ranking`**
  - **Auth**: Public
  - **Query**: `limit=50`
  - **Response**: `{ "success": true, "data": { "season": { "id", "name", "status" }, "leaderboard": [ { "rank": 1, "userId", "username", "rankingPoints": 1003 } ] } }`
- **`GET /ranking/me`**
  - **Auth**: Bearer JWT
  - **Response**: `{ "success": true, "data": { "season": { "id", "name" }, "userRank": { "rank": 1, "rankingPoints": 1003 }, "totalParticipants": 100 } }`
- **`GET /seasons`**
  - **Auth**: Public
  - **Response**: `{ "success": true, "data": [ { "id", "name", "status", "startDate", "endDate" } ] }`
- **`GET /seasons/:seasonId/ranking`**
  - **Auth**: Public
  - **Response**: `{ "success": true, "data": { "season": { "id", "name" }, "leaderboard": [] } }`

---

## 9. Notifications
- **`GET /notifications`**
  - **Auth**: Bearer JWT
  - **Query**: `page=1&limit=20`
  - **Response**: `{ "success": true, "data": { "items": [ { "id", "type", "title", "message", "isRead", "createdAt" } ], "pagination": { "page", "limit", "total", "hasNext" }, "unreadCount": 1 } }`
- **`PATCH /notifications/:id/read`**
  - **Auth**: Bearer JWT
  - **Response**: `{ "success": true, "data": { "id", "isRead": true, "readAt": "Date" } }`
- **`PATCH /notifications/read-all`**
  - **Auth**: Bearer JWT
  - **Response**: `{ "success": true, "data": { "updatedCount": 5 } }`
