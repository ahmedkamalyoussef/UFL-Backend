# 13 — Final API Route & Realtime Socket Event Specification

This document maps out the complete REST API interface and Socket.IO real-time WebSocket protocol for the UFL backend.

---

## 1. REST API Endpoint Map (`/api/v1`)

### A. Authentication & User Profile

#### 1. `POST /api/v1/auth/register`
- **Description**: Registers a new user and initializes their wallet with 500 Coins.
- **Headers**: `Content-Type: application/json`
- **Request Body (Zod Schema)**:
  ```json
  {
    "username": "GamerTag99",
    "email": "player@domain.com",
    "password": "Password123!"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "u-uuid-1",
      "username": "GamerTag99",
      "email": "player@domain.com",
      "avatarUrl": null,
      "wallet": {
        "balance": 500,
        "careerCoins": 500,
        "isEligibleForRewardedAd": false
      }
    }
  }
  ```

#### 2. `POST /api/v1/auth/login`
- **Description**: Authenticates user and returns JWT token.
- **Request Body**:
  ```json
  {
    "email": "player@domain.com",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "u-uuid-1",
      "username": "GamerTag99",
      "email": "player@domain.com",
      "avatarUrl": "https://cdn.ufl.com/avatars/01.png"
    }
  }
  ```

#### 3. `GET /api/v1/me/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
  ```json
  {
    "id": "u-uuid-1",
    "username": "GamerTag99",
    "email": "player@domain.com",
    "avatarUrl": "https://cdn.ufl.com/avatars/01.png",
    "wallet": {
      "balance": 500,
      "careerCoins": 1500,
      "isEligibleForRewardedAd": false
    },
    "stats": {
      "rankingPoints": 12,
      "gamesPlayed": 6,
      "gamesWon": 3,
      "globalRank": 142
    }
  }
  ```

---

### B. Matches & Competitions

#### 4. `GET /api/v1/competitions`
- **Description**: Returns the 5 supported competitions (EPL, La Liga, SPL, UCL, ACL).
- **Response `200 OK`**:
  ```json
  [
    { "id": "comp-1", "code": "EPL", "name": "English Premier League", "logoUrl": "https://cdn.ufl.com/leagues/epl.png" },
    { "id": "comp-2", "code": "LALIGA", "name": "La Liga", "logoUrl": "https://cdn.ufl.com/leagues/laliga.png" },
    { "id": "comp-3", "code": "SPL", "name": "Saudi Pro League", "logoUrl": "https://cdn.ufl.com/leagues/spl.png" },
    { "id": "comp-4", "code": "UCL", "name": "UEFA Champions League", "logoUrl": "https://cdn.ufl.com/leagues/ucl.png" },
    { "id": "comp-5", "code": "ACL", "name": "AFC Champions League", "logoUrl": "https://cdn.ufl.com/leagues/acl.png" }
  ]
  ```

#### 5. `GET /api/v1/matches/live`
- **Description**: Retrieves active live fixtures for supported competitions.

#### 6. `GET /api/v1/matches/upcoming`
- **Description**: Retrieves upcoming fixtures available for fantasy draft matching.

---

### C. Game Room & Draft Engine

#### 7. `POST /api/v1/games/join`
- **Headers**: `Authorization: Bearer <token>`, `X-Idempotency-Key: <uuid>`
- **Request Body**:
  ```json
  {
    "fixtureId": "fix-mci-ars-123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "game": {
      "id": "game-room-789",
      "fixtureId": "fix-mci-ars-123",
      "status": "WAITING",
      "entryFee": 500,
      "joinedCount": 3,
      "capacity": 4,
      "myDraftPosition": 3
    },
    "remainingBalance": 0
  }
  ```
- **Error Responses**:
  - `400 INSUFFICIENT_FUNDS`: Balance $< 500$.
  - `400 ROOM_FULL`: Game capacity reached.

#### 8. `POST /api/v1/games/:id/draft/select-player`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "playerId": "player-haaland-9",
    "turnNumber": 3
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "selection": {
      "gameId": "game-room-789",
      "playerId": "player-haaland-9",
      "playerName": "Erling Haaland",
      "turnNumber": 3,
      "isAutoPick": false
    },
    "nextTurn": {
      "turnNumber": 4,
      "participantId": "part-uuid-4",
      "expiresAt": "2026-08-25T14:35:35Z"
    }
  }
  ```

---

### D. Wallet & Economy

#### 9. `GET /api/v1/wallet/balance`
- **Response `200 OK`**:
  ```json
  {
    "balance": 500,
    "careerCoins": 1200,
    "isEligibleForRewardedAd": false
  }
  ```

#### 10. `POST /api/v1/wallet/rewarded-ad/claim`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "adImpressionToken": "ad-tok-xyz-987"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "claimedAmount": 500,
    "newBalance": 500,
    "message": "+500 Coins added to wallet!"
  }
  ```
- **Error Response `400 NOT_ELIGIBLE`**:
  ```json
  {
    "error": "NOT_ELIGIBLE",
    "message": "Rewarded ads are eligible ONLY when wallet balance equals 0 Coins."
  }
  ```

---

### E. Global Ranking

#### 11. `GET /api/v1/ranking/leaderboard`
- **Query Params**: `?seasonId=current&page=1&limit=20`
- **Response `200 OK`**:
  ```json
  {
    "season": "2026/27 Season",
    "leaderboard": [
      { "rank": 1, "username": "ApexStriker", "avatarUrl": "...", "rankingPoints": 45, "gamesWon": 12 },
      { "rank": 2, "username": "GamerTag99", "avatarUrl": "...", "rankingPoints": 42, "gamesWon": 10 }
    ]
  }
  ```

---

## 2. Real-Time WebSocket Event Protocol (Socket.IO)

Clients connect to namespace `/game` with auth header `token: Bearer <JWT>`.

### Client-to-Server Events

| Event Name | Payload | Description |
| :--- | :--- | :--- |
| `game:join-room` | `{ "gameId": "game-789" }` | Subscribes client to game room socket room. |
| `game:leave-room` | `{ "gameId": "game-789" }` | Unsubscribes client from game room. |
| `game:select-player` | `{ "gameId": "game-789", "playerId": "p-9", "turnNumber": 3 }` | Submits draft pick via socket. |

---

### Server-to-Client Broadcast Events

#### 1. `game:state`
- **Trigger**: Emitted upon room join or status transition.
- **Payload**:
  ```json
  {
    "gameId": "game-789",
    "status": "DRAFTING",
    "currentTurn": 3,
    "participants": [
      { "userId": "u-1", "username": "Alex", "draftPosition": 1, "selectedPlayers": [...] }
    ]
  }
  ```

#### 2. `game:draft-turn`
- **Trigger**: Turn transition during Snake Draft.
- **Payload**:
  ```json
  {
    "gameId": "game-789",
    "turnNumber": 4,
    "round": 1,
    "activeUserId": "u-4",
    "activeUsername": "Sarah",
    "expiresAt": "2026-08-25T14:35:35Z"
  }
  ```

#### 3. `game:auto-pick`
- **Trigger**: 35-second timer expiration during draft.
- **Payload**:
  ```json
  {
    "gameId": "game-789",
    "turnNumber": 4,
    "userId": "u-4",
    "player": { "id": "p-10", "name": "Bukayo Saka", "position": "ATTACKER" },
    "isAutoPick": true,
    "reason": "TURN_TIMEOUT"
  }
  ```

#### 4. `game:live-event`
- **Trigger**: Real-world match event ingested (Goal, Assist, Card, Clean Sheet).
- **Payload**:
  ```json
  {
    "gameId": "game-789",
    "fixtureId": "fix-123",
    "event": {
      "type": "GOAL",
      "minute": 72,
      "playerName": "Erling Haaland",
      "pointsAwarded": 40
    }
  }
  ```

#### 5. `game:ranking`
- **Trigger**: Points recalculation following a live match event.
- **Payload**:
  ```json
  {
    "gameId": "game-789",
    "standings": [
      { "rank": 1, "userId": "u-1", "username": "Alex", "totalPoints": 80.0 },
      { "rank": 2, "userId": "u-2", "username": "John", "totalPoints": 45.0 },
      { "rank": 3, "userId": "u-3", "username": "Mike", "totalPoints": 20.0 },
      { "rank": 4, "userId": "u-4", "username": "Sarah", "totalPoints": -5.0 }
    ]
  }
  ```

#### 6. `game:finished`
- **Trigger**: Match full-time and final reward settlement.
- **Payload**:
  ```json
  {
    "gameId": "game-789",
    "status": "FINISHED",
    "finalResults": [
      { "rank": 1, "userId": "u-1", "username": "Alex", "totalPoints": 120.0, "coinReward": 1000, "rpChange": 3 },
      { "rank": 2, "userId": "u-2", "username": "John", "totalPoints": 85.0, "coinReward": 500, "rpChange": 1 },
      { "rank": 3, "userId": "u-3", "username": "Mike", "totalPoints": 40.0, "coinReward": 0, "rpChange": 0 },
      { "rank": 4, "userId": "u-4", "username": "Sarah", "totalPoints": 10.0, "coinReward": 0, "rpChange": -1 }
    ]
  }
  ```

---

## 3. Standard Error Response Specification

All API errors return a standard JSON envelope:

```json
{
  "error": "INSUFFICIENT_FUNDS",
  "message": "User wallet balance is insufficient (500 Coins required).",
  "statusCode": 400,
  "timestamp": "2026-08-25T14:30:00.000Z"
}
```
