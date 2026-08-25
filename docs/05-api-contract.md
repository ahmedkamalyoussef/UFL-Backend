# 05 — REST API Specification

This document defines the complete RESTful API contract required by the UFL frontend application.

---

## Global API Standards

- **Base URL**: `https://api.ufl.game/api/v1`
- **Content-Type**: `application/json`
- **Authentication Header**: `Authorization: Bearer <jwt_token>`
- **Error Response Format**:
  ```json
  {
    "success": false,
    "error": {
      "code": "INSUFFICIENT_FUNDS",
      "message": "User balance must be at least 500 Coins to enter game."
    }
  }
  ```

---

## Endpoint Definitions

### 1. Authentication (`/api/v1/auth`)

#### `POST /api/v1/auth/register`
- **Purpose**: Create new user account & initialize wallet with 500 Welcome Bonus coins.
- **Auth Required**: No.
- **Trigger**: Click `CREATE ACCOUNT` on Register Screen.
- **Request Body**:
  ```json
  {
    "username": "GamerTag99",
    "email": "player@domain.com",
    "password": "SecretPassword123"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "u-12345",
        "username": "GamerTag99",
        "email": "player@domain.com",
        "avatarUrl": "https://cdn.ufl.game/avatars/default.png"
      },
      "wallet": {
        "balance": 500,
        "careerCoins": 500
      },
      "token": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```
- **Errors**: `400 Bad Request` (Validation), `409 Conflict` (Username/Email taken).

#### `POST /api/v1/auth/login`
- **Purpose**: Authenticate user and issue JWT token.
- **Auth Required**: No.
- **Trigger**: Click `LOGIN` on Login Screen.
- **Request Body**:
  ```json
  {
    "email": "player@ufl.com",
    "password": "••••••••"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "u-12345",
        "username": "AlexPro",
        "email": "player@ufl.com",
        "avatarUrl": "https://cdn.ufl.game/avatars/alex.png"
      },
      "wallet": {
        "balance": 500
      },
      "token": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```
- **Errors**: `401 Unauthorized` (Invalid credentials).

---

### 2. User & Profile (`/api/v1/me`)

#### `GET /api/v1/me`
- **Purpose**: Fetch current user account details & wallet summary.
- **Auth Required**: Yes.
- **Trigger**: App load / Top bar init.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "u-12345",
      "username": "AlexPro",
      "email": "player@ufl.com",
      "avatarUrl": "https://cdn.ufl.game/avatars/alex.png",
      "wallet": {
        "balance": 500
      }
    }
  }
  ```

#### `GET /api/v1/me/profile`
- **Purpose**: Fetch user career statistics & global rank summary for Profile screen.
- **Auth Required**: Yes.
- **Trigger**: Opening Profile Screen.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "username": "AlexPro",
      "avatarUrl": "https://cdn.ufl.game/avatars/alex.png",
      "globalRank": 1402,
      "rankingPoints": 12450,
      "careerStats": {
        "totalGames": 342,
        "totalWins": 210,
        "winRate": 61.4,
        "careerCoins": 85200
      }
    }
  }
  ```

#### `GET /api/v1/me/match-history`
- **Purpose**: Fetch user's recent match history.
- **Auth Required**: Yes.
- **Trigger**: Profile Screen Recent Matches section.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "gameId": "g-9910",
        "fixture": "BAR 2-1 RMA",
        "finalRank": 1,
        "coinReward": 1000,
        "rpChange": 3,
        "playedAt": "2026-08-24T18:30:00Z"
      },
      {
        "gameId": "g-9908",
        "fixture": "LIV 0-0 CHE",
        "finalRank": 2,
        "coinReward": 500,
        "rpChange": 1,
        "playedAt": "2026-08-24T14:00:00Z"
      }
    ]
  }
  ```

---

### 3. Football Matches (`/api/v1/matches`)

#### `GET /api/v1/matches/featured`
- **Purpose**: Fetch top live featured match for Home Dashboard Hero card.
- **Auth Required**: Yes.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "fix-771",
      "competition": "Premier League",
      "status": "LIVE",
      "elapsed": 72,
      "homeTeam": { "code": "MCI", "logoUrl": "..." },
      "awayTeam": { "code": "ARS", "logoUrl": "..." },
      "homeScore": 2,
      "awayScore": 1
    }
  }
  ```

#### `GET /api/v1/matches`
- **Purpose**: Search and filter live & upcoming matches for Match Discovery.
- **Query Params**:
  - `status`: `live` | `upcoming`
  - `league_id`: Optional Competition ID
  - `q`: Search keyword (team name / code)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "fix-882",
        "competition": "Premier League",
        "status": "LIVE",
        "elapsed": 68,
        "homeTeam": { "code": "ARS", "logoUrl": "..." },
        "awayTeam": { "code": "CHE", "logoUrl": "..." },
        "homeScore": 2,
        "awayScore": 1,
        "entryFee": 500
      }
    ]
  }
  ```

---

### 4. Game Rooms & Gameplay (`/api/v1/games`)

#### `POST /api/v1/games/join`
- **Purpose**: Join/matchmake into a 4-player game room for a fixture. Deducts 500 Coins.
- **Auth Required**: Yes.
- **Request Body**:
  ```json
  {
    "fixtureId": "fix-882"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "gameId": "g-8821",
      "roomId": "room-8821",
      "entryFee": 500,
      "remainingBalance": 0
    }
  }
  ```
- **Errors**: `400 Bad Request` (`INSUFFICIENT_FUNDS` if balance < 500).

#### `GET /api/v1/games/:id/draft`
- **Purpose**: Get current draft state and available football players list for Snake Draft.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "gameId": "g-8821",
      "currentTurnNumber": 3,
      "currentRound": 1,
      "activeParticipantId": "p-123",
      "turnExpiresAt": "2026-08-25T03:55:35Z",
      "takenPlayerIds": ["pl-99", "pl-102"],
      "availablePlayers": [
        {
          "id": "pl-105",
          "name": "V. Júnior",
          "teamCode": "RMA",
          "position": "ATTACKER",
          "avgPoints": 12.5,
          "isStar": true,
          "photoUrl": "..."
        }
      ]
    }
  }
  ```

#### `POST /api/v1/games/:id/select-player`
- **Purpose**: Submit player selection during user's draft turn.
- **Request Body**:
  ```json
  {
    "playerId": "pl-105"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "selectionId": "sel-001",
      "playerId": "pl-105",
      "turnNumber": 3,
      "isAutoPick": false
    }
  }
  ```
- **Errors**: `400 Bad Request` (`NOT_YOUR_TURN`, `PLAYER_TAKEN`, `TURN_EXPIRED`).

#### `GET /api/v1/games/:id/live`
- **Purpose**: Get live match score, user roster points, live event feed, and current 4-player leaderboard standings.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "gameId": "g-8821",
      "fixture": {
        "elapsed": 67,
        "homeScore": 2,
        "awayScore": 1
      },
      "userRoster": {
        "totalPoints": 120.0,
        "players": [
          { "id": "pl-101", "name": "M. Salah", "pts": 78.0, "status": "PLAYING" },
          { "id": "pl-105", "name": "K. De Bruyne", "pts": 42.0, "status": "BENCH" }
        ]
      },
      "leaderboard": [
        { "rank": 1, "username": "Alex_Striker", "points": 420.5 },
        { "rank": 2, "username": "AlexPro", "isYou": true, "points": 395.2 },
        { "rank": 3, "username": "Mia_Playmaker", "points": 380.0 },
        { "rank": 4, "username": "GhostRunner", "points": 342.8 }
      ]
    }
  }
  ```

#### `GET /api/v1/games/:id/results`
- **Purpose**: Fetch finalized game results, podium payouts, and RP updates upon match end.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "gameId": "g-8821",
      "standings": [
        { "rank": 1, "username": "AlexPro", "points": 5120, "coinReward": 1000, "rpChange": 3 },
        { "rank": 2, "username": "GhostSniper", "points": 4250, "coinReward": 500, "rpChange": 1 },
        { "rank": 3, "username": "ShadowFX", "points": 3980, "coinReward": 0, "rpChange": 0 },
        { "rank": 4, "username": "NeonStrike", "points": 3100, "coinReward": 0, "rpChange": -1 }
      ]
    }
  }
  ```

---

### 5. Wallet & Rewarded Ads (`/api/v1/wallet`)

#### `GET /api/v1/wallet`
- **Purpose**: Fetch current user wallet balance.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "balance": 500,
      "careerCoins": 85200
    }
  }
  ```

#### `GET /api/v1/wallet/transactions`
- **Purpose**: Fetch coin transaction history log.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      { "id": "t-1", "description": "Game Reward", "amount": 1000, "type": "GAME_REWARD", "createdAt": "2026-08-25T14:30:00Z" },
      { "id": "t-2", "description": "Game Entry", "amount": -500, "type": "GAME_ENTRY", "createdAt": "2026-08-25T14:00:00Z" }
    ]
  }
  ```

#### `POST /api/v1/wallet/rewarded-ad/claim`
- **Purpose**: Validate completed rewarded ad and grant +500 Coins (eligible when balance equals 0).
- **Request Body**:
  ```json
  {
    "adImpressionToken": "token_xyz789"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "rewardAmount": 500,
      "newBalance": 500
    }
  }
  ```
- **Errors**: `400 Bad Request` (`NOT_ELIGIBLE` if balance > 0).

---

### 6. Ranking (`/api/v1/ranking`)

#### `GET /api/v1/ranking/global`
- **Purpose**: Fetch global season leaderboard.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "season": "2026/27 Season",
      "leaderboard": [
        { "rank": 1, "username": "xX_Striker_Xx", "points": 94200, "avatarUrl": "..." },
        { "rank": 2, "username": "NeonGoalie", "points": 91050, "avatarUrl": "..." }
      ]
    }
  }
  ```

#### `GET /api/v1/ranking/me`
- **Purpose**: Fetch logged-in user's global ranking summary card.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "rankPosition": 1402,
      "rankingPoints": 12450,
      "gamesPlayed": 342,
      "gamesWon": 210
    }
  }
  ```
