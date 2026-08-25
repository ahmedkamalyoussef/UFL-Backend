# UFL Backend — Flutter Integration Contract Guide

This document is the authoritative Flutter Mobile Application Integration Specification for the **UFL Fantasy Football Platform**. It details the exact REST API contracts, Socket.IO real-time events, authentication lifecycle, wallet financial rules, error handling strategies, and developer integration checklists.

---

## 1. Overview & Connection Base URLs

- **Default Base API URL**: `http://localhost:3000/api/v1` (Local Development) / `http://10.0.2.2:3000/api/v1` (Android Emulator)
- **Default Socket.IO URL**: `http://localhost:3000` (Namespace: `/game`, Path: `/socket.io`)
- **Default Content-Type Header**: `application/json`
- **Authentication Header**: `Authorization: Bearer <JWT_TOKEN>`

---

## 2. Authentication & Token Management Flow

### A. Authentication Lifecycle
1. **Registration / Login**:
   - Flutter user submits credentials to `POST /api/v1/auth/register` or `POST /api/v1/auth/login`.
   - Backend returns JWT token (`token`) and user profile object.
2. **Secure Token Storage**:
   - Store `token` in secure device storage (e.g. `flutter_secure_storage`).
3. **API Request Authorization**:
   - Attach header `Authorization: Bearer <token>` to all protected HTTP requests.
4. **Socket.IO Handshake Authentication**:
   - Pass token in handshake options when connecting to `/game` namespace:
     ```dart
     IO.OptionBuilder()
       .setTransports(['websocket'])
       .setAuth({'token': storedJwtToken})
       .build()
     ```
5. **Token Expiration**:
   - Tokens expire after 7 days (`JWT_EXPIRES_IN=7d`). When backend returns HTTP `401 UNAUTHORIZED`, Flutter must clear stored credentials and navigate to Login Screen.

---

## 3. Authoritative Wallet Rules

All coin balances and transaction values are strictly **backend-authoritative**. Flutter mobile applications MUST NOT submit arbitrary coin amounts to the backend.

- **Welcome Bonus**: **+500 Coins** credited automatically upon registration (`WELCOME_BONUS` transaction).
- **Game Entry Fee**: **500 Coins** deducted automatically upon joining a 4-player game room (`GAME_ENTRY` transaction).
- **Rewarded Ad Eligibility**: Available **ONLY when balance === 0**.
- **Rewarded Ad Bonus**: **+500 Coins** credited upon claiming (`REWARDED_AD` transaction).
- **Game Cancellation Refund**: **+500 Coins** refunded automatically to participants if game room is cancelled (`GAME_REFUND` transaction).
- **Final Game Settlement Prizes**:
  - **1st Place**: **+1000 Coins** (`GAME_REWARD` transaction)
  - **2nd Place**: **+500 Coins** (`GAME_REWARD` transaction)
  - **3rd Place**: **0 Coins**
  - **4th Place**: **0 Coins**

---

## 4. Game Lifecycle & Display States

| Status | Display Name | UI State Description | Allowed User Actions |
| :--- | :--- | :--- | :--- |
| **`WAITING`** | Open Room | Waiting for 4 participants to fill room slots ($X/4$). | Join Room, Cancel Room |
| **`DRAFTING`** | Snake Draft | 8-turn Snake Draft in progress. Active player drafting. | Select Player (Turn Holder) |
| **`LIVE`** | Live Match | Match in progress. Real-time points & ranking live updates. | View Live Leaderboard & Stats |
| **`FINISHED`** | Finalized | Match finished & settled. Final prize payouts & RP awarded. | View Final Results & Prize |
| **`CANCELLED`** | Cancelled | Match cancelled/postponed or room unfilled at match start. | View Cancellation Refund Info |

---

## 5. Mid-Match Live Joining Specification

- **Condition**: Fixture status is `LIVE` AND Game room status is `WAITING` AND participant count $< 4$.
- **Fee**: **500 Coins** (same standard entry fee).
- **Drafting**: Late joiner immediately drafts available players.
- **Fantasy Points Calculation**: Late joiner receives **FULL MATCH** fantasy points accumulated from match kickoff (no late join penalty).

---

## 6. Snake Draft Engine & Turn Timeout Rules

- **Room Capacity**: Exactly 4 participants.
- **Draft Order**: 8-turn Snake Sequence:
  - **Round 1**: Participant 1 $\rightarrow$ Participant 2 $\rightarrow$ Participant 3 $\rightarrow$ Participant 4
  - **Round 2**: Participant 4 $\rightarrow$ Participant 3 $\rightarrow$ Participant 2 $\rightarrow$ Participant 1
- **Turn Timer**: **35 seconds per turn** enforced by backend server.
- **Auto-Pick Timeout Handler**: If active participant does not select a player within 35 seconds, server automatically selects the highest `avgPoints` available player (`isAutoPick: true`, `reason: "TURN_TIMEOUT"`).

---

## 7. Feature Endpoint Contracts

### A. Authentication
#### 1. Register User
- **Method**: `POST`
- **Path**: `/auth/register`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "Password123!"
  }
  ```
- **Success Status**: `201 Created`
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1Ni...",
      "user": {
        "id": "e43b1740-...",
        "username": "johndoe",
        "email": "johndoe@example.com"
      },
      "wallet": {
        "balance": 500
      }
    }
  }
  ```
- **Possible Error Codes**: `EMAIL_ALREADY_EXISTS`, `INVALID_INPUT` (Status: 400/409)

#### 2. Login User
- **Method**: `POST`
- **Path**: `/auth/login`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "Password123!"
  }
  ```
- **Success Status**: `200 OK`
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1Ni...",
      "user": {
        "id": "e43b1740-...",
        "username": "johndoe",
        "email": "johndoe@example.com"
      }
    }
  }
  ```
- **Possible Error Codes**: `INVALID_CREDENTIALS` (Status: 401)

#### 3. Current User Profile
- **Method**: `GET`
- **Path**: `/me`
- **Auth**: Bearer JWT (`Authorization: Bearer <token>`)
- **Success Status**: `200 OK`
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "e43b1740-...",
      "username": "johndoe",
      "email": "johndoe@example.com",
      "avatarUrl": null,
      "createdAt": "2026-08-25T01:00:00.000Z",
      "wallet": {
        "balance": 500,
        "careerCoins": 500,
        "isEligibleForRewardedAd": false
      },
      "stats": {
        "rankingPoints": 1000,
        "gamesPlayed": 0,
        "gamesWon": 0,
        "rankPosition": null
      }
    }
  }
  ```

---

### B. User Profile & Game History
#### 1. User Game History
- **Method**: `GET`
- **Path**: `/users/me/games`
- **Auth**: Bearer JWT
- **Query Parameters**: `page=1&limit=20`
- **Success Status**: `200 OK`
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "gameId": "cbe34be7-...",
          "status": "FINISHED",
          "totalPoints": 100,
          "joinedAt": "2026-08-25T02:00:00.000Z",
          "fixture": {
            "id": "fa27a9ce-...",
            "homeScore": 3,
            "awayScore": 1,
            "status": "FINISHED",
            "competition": { "code": "UCL", "name": "UEFA Champions League" },
            "homeTeam": { "name": "Real Madrid", "logoUrl": "https://cdn.ufl.com/rma.png" },
            "awayTeam": { "name": "Barcelona", "logoUrl": "https://cdn.ufl.com/bar.png" }
          }
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 1,
        "hasNext": false
      }
    }
  }
  ```

---

### C. Wallet & Rewarded Advertisements
#### 1. Wallet Overview
- **Method**: `GET`
- **Path**: `/wallet`
- **Auth**: Bearer JWT
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "wallet-uuid",
      "balance": 0,
      "careerCoins": 500,
      "isEligibleForRewardedAd": true
    }
  }
  ```

#### 2. Wallet Transactions List
- **Method**: `GET`
- **Path**: `/wallet/transactions`
- **Auth**: Bearer JWT
- **Query Parameters**: `page=1&limit=20`
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "tx-uuid",
          "amount": 500,
          "type": "WELCOME_BONUS",
          "description": "Initial registration bonus",
          "createdAt": "2026-08-25T01:00:00.000Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 1,
        "hasNext": false
      }
    }
  }
  ```

#### 3. Claim Rewarded Advertisement
- **Method**: `POST`
- **Path**: `/wallet/claim-rewarded-ad`
- **Auth**: Bearer JWT
- **Success Status**: `200 OK`
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "addedCoins": 500,
      "newBalance": 500,
      "transactionId": "tx-uuid"
    }
  }
  ```
- **Error Code**: `NOT_ELIGIBLE` (Status 400: Rewarded Ad eligible ONLY when balance == 0)

---

### D. Competitions & Matches Discovery
#### 1. List Supported Competitions
- **Method**: `GET`
- **Path**: `/competitions`
- **Auth**: Public
- **Success Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "comp-uuid",
        "code": "EPL",
        "name": "Premier League",
        "logoUrl": "https://media.api-sports.io/football/leagues/39.png"
      }
    ]
  }
  ```

#### 2. List Matches / Fixtures
- **Method**: `GET`
- **Path**: `/matches`
- **Auth**: Public
- **Query Parameters**: `competitionId=comp-uuid&status=SCHEDULED|LIVE|FINISHED`
- **Success Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "fix-uuid",
        "externalId": 1035041,
        "status": "LIVE",
        "homeScore": 1,
        "awayScore": 0,
        "elapsed": 25,
        "startTime": "2026-08-25T18:00:00.000Z",
        "competition": { "id": "comp-uuid", "code": "EPL", "name": "Premier League" },
        "homeTeam": { "id": "team-1", "name": "Arsenal", "code": "ARS" },
        "awayTeam": { "id": "team-2", "name": "Chelsea", "code": "CHE" }
      }
    ]
  }
  ```

#### 3. Single Match Details
- **Method**: `GET`
- **Path**: `/matches/:id`
- **Auth**: Public
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "fix-uuid",
      "status": "LIVE",
      "homeScore": 1,
      "awayScore": 0,
      "elapsed": 25,
      "startTime": "2026-08-25T18:00:00.000Z",
      "competition": { "code": "EPL", "name": "Premier League" },
      "homeTeam": { "name": "Arsenal", "logoUrl": "..." },
      "awayTeam": { "name": "Chelsea", "logoUrl": "..." },
      "openGames": [
        { "id": "game-uuid", "entryFee": 500, "currentParticipantCount": 2, "maxParticipants": 4 }
      ]
    }
  }
  ```

---

### E. Game Rooms & Joining
#### 1. List Game Rooms
- **Method**: `GET`
- **Path**: `/games`
- **Auth**: Public
- **Query Parameters**: `fixtureId=fix-uuid&status=WAITING`
- **Success Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "game-uuid",
        "fixtureId": "fix-uuid",
        "status": "WAITING",
        "entryFee": 500,
        "currentParticipantCount": 3,
        "maxParticipants": 4
      }
    ]
  }
  ```

#### 2. Create Game Room
- **Method**: `POST`
- **Path**: `/games`
- **Auth**: Public / Internal
- **Request Body**: `{ "fixtureId": "fix-uuid", "entryFee": 500 }`
- **Success Response**: `{ "success": true, "data": { "id": "game-uuid", "status": "WAITING", "entryFee": 500 } }`

#### 3. Join Game Room
- **Method**: `POST`
- **Path**: `/games/:id/join`
- **Auth**: Bearer JWT
- **Success Status**: `200 OK`
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "gameId": "game-uuid",
      "participantId": "part-uuid",
      "draftPosition": 1,
      "remainingBalance": 0
    }
  }
  ```
- **Possible Error Codes**: `INSUFFICIENT_FUNDS`, `ROOM_FULL`, `ALREADY_JOINED`, `GAME_FINISHED`, `GAME_CANCELLED`

#### 4. Cancel Game Room
- **Method**: `POST`
- **Path**: `/games/:id/cancel`
- **Auth**: Public / Internal
- **Request Body**: `{ "reason": "UNFILLED_ROOM_AT_MATCH_START" }`
- **Success Response**: `{ "success": true, "data": { "gameId": "game-uuid", "status": "CANCELLED", "refundedCount": 3 } }`

---

### F. Snake Draft System
#### 1. Get Draft State
- **Method**: `GET`
- **Path**: `/games/:id/draft/state`
- **Auth**: Bearer JWT
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "gameId": "game-uuid",
      "status": "DRAFTING",
      "currentTurn": {
        "turnNumber": 1,
        "participantId": "part-uuid",
        "userId": "user-uuid",
        "timeRemainingSeconds": 35
      },
      "selections": [],
      "availablePlayers": [
        { "id": "player-1", "name": "Saka", "position": "ATTACKER", "avgPoints": 15.5 }
      ]
    }
  }
  ```

#### 2. Select Player
- **Method**: `POST`
- **Path**: `/games/:id/draft/select`
- **Auth**: Bearer JWT
- **Request Body**: `{ "playerId": "player-1" }`
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "turnNumber": 1,
      "participantId": "part-uuid",
      "playerId": "player-1",
      "isAutoPick": false
    }
  }
  ```
- **Possible Error Codes**: `NOT_YOUR_TURN`, `PLAYER_ALREADY_TAKEN`, `INVALID_GAME_STATE`

---

### G. Live Game & Fantasy Points
#### 1. Get Live Room Ranking
- **Method**: `GET`
- **Path**: `/games/:id/ranking`
- **Auth**: Public / Authenticated
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "gameId": "game-uuid",
      "rankings": [
        {
          "rank": 1,
          "participantId": "part-uuid",
          "userId": "user-uuid",
          "username": "johndoe",
          "avatarUrl": null,
          "fantasyPoints": 60
        }
      ]
    }
  }
  ```

#### 2. Get Player Fantasy Points Breakdown
- **Method**: `GET`
- **Path**: `/games/:id/players/:playerId/points`
- **Auth**: Public / Authenticated
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "playerId": "player-1",
      "totalFantasyPoints": 40,
      "breakdown": [
        { "rule": "GOAL", "points": 40, "count": 1 }
      ]
    }
  }
  ```

---

### H. Final Settlement & Results
#### 1. Get Final Game Result
- **Method**: `GET`
- **Path**: `/games/:id/result`
- **Auth**: Bearer JWT
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "gameId": "game-uuid",
      "status": "FINISHED",
      "fixture": { "id": "fix-uuid", "homeScore": 3, "awayScore": 1, "status": "FINISHED" },
      "currentUserResult": {
        "rank": 1,
        "participantId": "part-uuid",
        "userId": "user-uuid",
        "username": "johndoe",
        "fantasyPoints": 100,
        "coinReward": 1000,
        "rpChange": 3
      },
      "results": [
        {
          "rank": 1,
          "participantId": "part-1",
          "userId": "user-1",
          "username": "johndoe",
          "fantasyPoints": 100,
          "coinReward": 1000,
          "rpChange": 3
        },
        {
          "rank": 2,
          "participantId": "part-2",
          "userId": "user-2",
          "username": "alex",
          "fantasyPoints": 50,
          "coinReward": 500,
          "rpChange": 1
        },
        {
          "rank": 3,
          "participantId": "part-3",
          "userId": "user-3",
          "username": "sam",
          "fantasyPoints": 20,
          "coinReward": 0,
          "rpChange": 0
        },
        {
          "rank": 4,
          "participantId": "part-4",
          "userId": "user-4",
          "username": "chris",
          "fantasyPoints": 0,
          "coinReward": 0,
          "rpChange": -1
        }
      ]
    }
  }
  ```

---

### I. Global Ranking & Seasons
#### 1. Global Leaderboard
- **Method**: `GET`
- **Path**: `/ranking`
- **Auth**: Public
- **Query Parameters**: `limit=50`
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "season": { "id": "season-1", "name": "Season 2026", "status": "ACTIVE" },
      "leaderboard": [
        {
          "rank": 1,
          "userId": "user-1",
          "username": "johndoe",
          "avatarUrl": null,
          "rankingPoints": 1003,
          "gamesPlayed": 1,
          "gamesWon": 1
        }
      ]
    }
  }
  ```

#### 2. Current User Rank
- **Method**: `GET`
- **Path**: `/ranking/me`
- **Auth**: Bearer JWT
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "season": { "id": "season-1", "name": "Season 2026" },
      "userRank": {
        "rank": 1,
        "userId": "user-1",
        "username": "johndoe",
        "rankingPoints": 1003,
        "gamesPlayed": 1,
        "gamesWon": 1
      },
      "totalParticipants": 1
    }
  }
  ```

#### 3. Seasons List
- **Method**: `GET`
- **Path**: `/seasons`
- **Auth**: Public
- **Success Response**:
  ```json
  {
    "success": true,
    "data": [
      { "id": "season-1", "name": "Season 2026", "status": "ACTIVE", "startDate": "2026-01-01", "endDate": "2026-12-31" }
    ]
  }
  ```

#### 4. Historical Season Leaderboard
- **Method**: `GET`
- **Path**: `/seasons/:seasonId/ranking`
- **Auth**: Public
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "season": { "id": "season-1", "name": "Season 2026", "status": "COMPLETED" },
      "leaderboard": []
    }
  }
  ```

---

### J. Notifications
#### 1. List User Notifications
- **Method**: `GET`
- **Path**: `/notifications`
- **Auth**: Bearer JWT
- **Query Parameters**: `page=1&limit=20&isRead=false`
- **Success Response**:
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "notif-uuid",
          "type": "GAME_FINISHED",
          "title": "Game Finished",
          "message": "You finished 1st and earned 1000 Coins (+3 RP).",
          "isRead": false,
          "readAt": null,
          "relatedEntityType": "GAME",
          "relatedEntityId": "game-uuid",
          "createdAt": "2026-08-25T02:00:00.000Z"
        }
      ],
      "pagination": { "page": 1, "limit": 20, "total": 1, "hasNext": false },
      "unreadCount": 1
    }
  }
  ```

#### 2. Mark Notification Read
- **Method**: `PATCH`
- **Path**: `/notifications/:id/read`
- **Auth**: Bearer JWT
- **Success Response**: `{ "success": true, "data": { "id": "notif-uuid", "isRead": true, "readAt": "2026-08-25T02:05:00.000Z" } }`

#### 3. Mark All Notifications Read
- **Method**: `PATCH`
- **Path**: `/notifications/read-all`
- **Auth**: Bearer JWT
- **Success Response**: `{ "success": true, "data": { "updatedCount": 3 } }`

---

## 8. Socket.IO Real-Time Engine Specification

- **Namespace**: `/game`
- **Path**: `/socket.io`
- **Handshake Authentication**: Pass token in `auth: { token: storedJwtToken }`

### Client Room Subscriptions
- **Game Room Subscription (`game:{gameId}`)**:
  - Client emits `game:join-room` with `{ "gameId": "game-uuid" }`.
  - Backend verifies user is a participant before adding socket to room.
- **Private User Room Subscription (`user:{userId}`)**:
  - Automatically joined upon authenticated connection.

### Real-Time Events Reference

| Event Name | Direction | Room | Trigger Condition | Payload |
| :--- | :--- | :--- | :--- | :--- |
| **`game:draft-start`** | Server $\rightarrow$ Client | `game:{gameId}` | Room reaches 4 participants. | `{ "gameId", "draftSequence": ["p1", "p2", "p3", "p4", "p4", "p3", "p2", "p1"] }` |
| **`game:draft-turn`** | Server $\rightarrow$ Client | `game:{gameId}` | Draft turn advances. | `{ "gameId", "turnNumber", "participantId", "userId", "timeRemainingSeconds": 35 }` |
| **`game:player-selected`** | Server $\rightarrow$ Client | `game:{gameId}` | Turn holder selects player. | `{ "gameId", "turnNumber", "participantId", "playerId", "isAutoPick": false }` |
| **`game:auto-pick`** | Server $\rightarrow$ Client | `game:{gameId}` | 35s turn timer expires. | `{ "gameId", "turnNumber", "participantId", "playerId", "isAutoPick": true, "reason": "TURN_TIMEOUT" }` |
| **`game:draft-completed`**| Server $\rightarrow$ Client | `game:{gameId}` | All 8 draft picks complete. | `{ "gameId", "status": "LIVE" }` |
| **`game:live-event`** | Server $\rightarrow$ Client | `game:{gameId}` | Match event ingested. | `{ "gameId", "fixtureId", "event": { "type", "playerId", "minute", "pointsAdded" } }` |
| **`game:ranking`** | Server $\rightarrow$ Client | `game:{gameId}` | Live fantasy points update. | `{ "gameId", "rankings": [ { "rank", "participantId", "userId", "fantasyPoints" } ] }` |
| **`game:finished`** | Server $\rightarrow$ Client | `game:{gameId}` | Final settlement finishes. | `{ "gameId", "status": "FINISHED", "results": [ { "rank", "participantId", "userId", "fantasyPoints", "coinReward", "rpChange" } ] }` |
| **`ranking:updated`** | Server $\rightarrow$ Client | Global Broadcast | Global RP updated. | `{ "seasonId", "gameId", "updatedUsers": [ { "userId", "rpChange", "newTotalRP" } ] }` |
| **`notification:new`** | Server $\rightarrow$ Client | `user:{userId}` | System notification created. | `{ "id", "type", "title", "message", "isRead": false, "createdAt" }` |

---

## 9. Comprehensive Error Code Reference Table

All error responses from the backend adhere strictly to the format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error description."
  }
}
```

| Error Code | HTTP Status | Meaning | Flutter Remediation Action |
| :--- | :--- | :--- | :--- |
| **`UNAUTHORIZED`** | `401` | Missing, invalid, or expired JWT token. | Clear secure storage and navigate user to Login Screen. |
| **`FORBIDDEN`** | `403` | User does not own the target resource. | Show toast notification: "Unauthorized access". |
| **`INVALID_CREDENTIALS`** | `401` | Invalid email or password during login. | Display inline error: "Incorrect email or password". |
| **`EMAIL_ALREADY_EXISTS`** | `409` | Email registered by another user. | Display inline error: "Email is already registered". |
| **`INSUFFICIENT_FUNDS`** | `400` | User wallet balance $< 500$ Coins. | Display dialog: "Insufficient Coins (500 required)". Offer Rewarded Ad if balance == 0. |
| **`NOT_ELIGIBLE`** | `400` | Rewarded Ad claimed when balance $> 0$. | Disable Rewarded Ad button until balance drops to 0. |
| **`ROOM_FULL`** | `400` | Game room already has 4 participants. | Refresh games list and prompt user to select another room. |
| **`ALREADY_JOINED`** | `400` | User is already in this game room. | Navigate directly to Game Room screen. |
| **`GAME_FINISHED`** | `400` | Game room has already finished. | Navigate directly to Final Results screen. |
| **`GAME_CANCELLED`** | `400` | Game room was cancelled and refunded. | Show alert dialog: "Game room was cancelled". |
| **`NOT_YOUR_TURN`** | `400` | Player selected outside active turn. | Disable draft selection buttons until active turn belongs to user. |
| **`PLAYER_ALREADY_TAKEN`**| `400` | Selected player already drafted in room. | Mark player as TAKEN in UI list and prompt to pick another. |
| **`GAME_NOT_FOUND`** | `404` | Invalid gameId in request URL. | Show error dialog and return to Home Screen. |
| **`FIXTURE_NOT_FINISHED`** | `400` | Settlement attempted on unfinished match. | Disable manual settle button. |
| **`NOTIFICATION_NOT_FOUND`**|`404`| Invalid notificationId in request URL. | Refresh notifications list. |

---

## 10. Flutter Integration Checklist

- [ ] **Base Configuration**: Set base URL (`http://10.0.2.2:3000/api/v1` for Android emulator, `http://localhost:3000/api/v1` for iOS simulator).
- [ ] **Auth Storage**: Integrate `flutter_secure_storage` to save JWT token upon register/login.
- [ ] **HTTP Interceptor**: Add request header interceptor to attach `Authorization: Bearer <token>`.
- [ ] **HTTP Error Handler**: Intercept HTTP `401` responses globally to trigger auto-logout and redirect to Login Screen.
- [ ] **Socket.IO Connection**: Initialize `socket_io_client` targeting `/game` namespace with JWT handshake auth.
- [ ] **Private Notification Room**: Listen for `notification:new` on Socket.IO and update badge counter.
- [ ] **Home & Discovery**: Fetch `/competitions` and `/matches` to render fixture cards.
- [ ] **Game Room Join Flow**: Call `POST /games/:id/join`, handle `INSUFFICIENT_FUNDS` error gracefully.
- [ ] **Snake Draft Room**: Connect to `game:{gameId}` room, listen to `game:draft-turn`, `game:player-selected`, `game:auto-pick`, `game:draft-completed`.
- [ ] **Draft 35s Timer Widget**: Render countdown timer synced with `timeRemainingSeconds` from backend.
- [ ] **Live Match Room**: Listen to `game:live-event` and `game:ranking` for live score updates.
- [ ] **Final Results Screen**: Fetch `GET /games/:id/result` to display 1st-4th rank breakdown, coin rewards, and RP changes.
- [ ] **Rewarded Ad Widget**: Enable claim button `POST /wallet/claim-rewarded-ad` ONLY when `balance == 0`.
- [ ] **Leaderboard Screen**: Fetch `/ranking` and `/ranking/me` for global RP standings.

---

## 11. Backend Deployment & Staging/Production Requirements

### A. Required for Local Flutter Integration (CURRENT STATUS: READY)
- [x] Node.js server running locally (`npm run dev` on port 3000).
- [x] MySQL database connected (`DB_NAME=ufl`).
- [x] Socket.IO server active on `/game` namespace.

### B. Required Before Staging Deployment
- [ ] Generate static database migration files in `src/migrations/` for database deployment pipelines.
- [ ] Configure environment variables for staging server host, staging database, and JWT secret.

### C. Required Before Production Release
- [ ] Supply live API-Sports key (`API_FOOTBALL_KEY`) in production `.env` file to stream real-world match events automatically.
- [ ] Enable HTTPS SSL certificate termination for API base URL and WSS for Socket.IO connection.
