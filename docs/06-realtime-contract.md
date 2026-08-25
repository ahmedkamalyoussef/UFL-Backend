# 06 — Real-Time Socket.IO Specification

This document defines the real-time event specifications, socket rooms, triggers, and payload schemas for UFL's WebSocket communication layer built on Socket.IO.

---

## Socket Connection & Room Architecture

### Connection Setup
- **Endpoint**: `wss://api.ufl.game`
- **Authentication**: Handshake query parameter or auth payload with JWT Bearer Token:
  ```js
  const socket = io("https://api.ufl.game", {
    auth: { token: "Bearer <jwt_token>" }
  });
  ```

### Room Subscriptions
- `room:game:<gameId>`: Joined by all 4 participants in a game room during matchmaking, drafting, and live gameplay.
- `room:fixture:<fixtureId>`: Broadcast channel for global live football match updates (scores, elapsed time, raw events).
- `room:user:<userId>`: Private channel for user-specific wallet updates and system notifications.

---

## Event Contracts

### 1. `game:state`
- **Direction**: Server $\rightarrow$ Client (Broadcast to `room:game:<gameId>`)
- **Trigger**: Occurs when player joins/leaves waiting room, room fills (4/4), countdown starts, or game state transitions.
- **Payload Schema**:
  ```json
  {
    "gameId": "g-8821",
    "state": "WAITING_FOR_PLAYERS", // WAITING_FOR_PLAYERS | COUNTDOWN | DRAFTING | LIVE | FINISHED
    "joinedCount": 3,
    "maxPlayers": 4,
    "countdownSeconds": 10,
    "participants": [
      { "id": "p-1", "username": "GamerTag88", "avatarUrl": "...", "status": "READY", "isYou": true },
      { "id": "p-2", "username": "StrikerX", "avatarUrl": "...", "status": "READY", "isYou": false },
      { "id": "p-3", "username": "Viper99", "avatarUrl": "...", "status": "READY", "isYou": false }
    ]
  }
  ```
- **UI Consumption**: Waiting Room Screen (Updates 4-player slot grid and countdown display).

---

### 2. `game:draft-turn`
- **Direction**: Server $\rightarrow$ Client (Broadcast to `room:game:<gameId>`)
- **Trigger**: Occurs when a new turn begins in the Snake Draft or a turn timer is updated.
- **Payload Schema**:
  ```json
  {
    "gameId": "g-8821",
    "currentTurnNumber": 3,
    "round": 1,
    "activeParticipantId": "p-1",
    "activeUserId": "u-12345",
    "isYourTurn": true,
    "turnDurationSeconds": 35,
    "expiresAt": "2026-08-25T03:55:35.000Z",
    "draftOrder": [
      { "turnNumber": 1, "round": 1, "username": "Player1", "status": "COMPLETED" },
      { "turnNumber": 2, "round": 1, "username": "Player2", "status": "COMPLETED" },
      { "turnNumber": 3, "round": 1, "username": "AlexPro", "status": "ACTIVE" },
      { "turnNumber": 4, "round": 1, "username": "Player4", "status": "UPCOMING" }
    ]
  }
  ```
- **UI Consumption**: Snake Draft Screen (Starts 35s timer, highlights active turn avatar in draft order HUD).

---

### 3. `game:player-selected`
- **Direction**: Server $\rightarrow$ Client (Broadcast to `room:game:<gameId>`)
- **Trigger**: Broadcast when a player is selected by a user during their turn.
- **Payload Schema**:
  ```json
  {
    "gameId": "g-8821",
    "participantId": "p-1",
    "username": "AlexPro",
    "selectedPlayer": {
      "id": "pl-105",
      "name": "V. Júnior",
      "position": "ATTACKER",
      "teamCode": "RMA",
      "photoUrl": "..."
    },
    "turnNumber": 3,
    "isAutoPick": false
  }
  ```
- **UI Consumption**: Snake Draft Screen (Marks player card as `TAKEN`, updates draft order HUD with checkmark).

---

### 4. `game:auto-pick`
- **Direction**: Server $\rightarrow$ Client (Broadcast to `room:game:<gameId>`)
- **Trigger**: Fired by backend timer when 35 seconds elapse without a user selection.
- **Payload Schema**:
  ```json
  {
    "gameId": "g-8821",
    "participantId": "p-1",
    "username": "AlexPro",
    "autoPickedPlayer": {
      "id": "pl-109",
      "name": "Rodrygo",
      "position": "ATTACKER",
      "teamCode": "RMA"
    },
    "reason": "TURN_TIMEOUT",
    "turnNumber": 3
  }
  ```
- **UI Consumption**: Snake Draft Screen (Shows auto-pick banner, updates taken players).

---

### 5. `match:updated`
- **Direction**: Server $\rightarrow$ Client (Broadcast to `room:fixture:<fixtureId>` & `room:game:<gameId>`)
- **Trigger**: Fired when real-world fixture score or elapsed minute changes in FootballProvider.
- **Payload Schema**:
  ```json
  {
    "fixtureId": "fix-882",
    "homeScore": 2,
    "awayScore": 1,
    "elapsed": 68,
    "status": "LIVE" // LIVE | HALFTIME | FINISHED
  }
  ```
- **UI Consumption**: Home Dashboard, Match Discovery, Snake Draft Header, Live Scoreboard Header.

---

### 6. `game:live-event`
- **Direction**: Server $\rightarrow$ Client (Broadcast to `room:game:<gameId>`)
- **Trigger**: Fired when a fantasy point event occurs for a drafted player in the fixture.
- **Payload Schema**:
  ```json
  {
    "gameId": "g-8821",
    "eventId": "evt-9901",
    "fixtureId": "fix-882",
    "minute": 67,
    "eventType": "GOAL", // GOAL | ASSIST | TACKLE | SAVE | YELLOW_CARD | RED_CARD | CLEAN_SHEET
    "pointsGranted": 40,
    "player": {
      "id": "pl-101",
      "name": "Mohamed Salah",
      "teamCode": "LIV"
    },
    "detail": "Incredible strike from outside the box! Assisted by Alexander-Arnold.",
    "affectedParticipantIds": ["p-1"] // Participants who drafted Mohamed Salah
  }
  ```
- **UI Consumption**: Live Match Feed (Slides up new play-by-play event card with green/gold point badge).

---

### 7. `game:ranking`
- **Direction**: Server $\rightarrow$ Client (Broadcast to `room:game:<gameId>`)
- **Trigger**: Fired immediately after fantasy points recalculation following a live match event.
- **Payload Schema**:
  ```json
  {
    "gameId": "g-8821",
    "rankings": [
      { "rank": 1, "participantId": "p-2", "username": "Alex_Striker", "totalPoints": 420.5, "pointChange": +12 },
      { "rank": 2, "participantId": "p-1", "username": "AlexPro", "totalPoints": 395.2, "pointChange": +45, "isYou": true },
      { "rank": 3, "participantId": "p-3", "username": "Mia_Playmaker", "totalPoints": 380.0, "pointChange": -8 },
      { "rank": 4, "participantId": "p-4", "username": "GhostRunner", "totalPoints": 342.8, "pointChange": 0 }
    ]
  }
  ```
- **UI Consumption**: Live Match Leaderboard Tab (Re-animates and re-orders 4-player ranking rows).

---

### 8. `game:finished`
- **Direction**: Server $\rightarrow$ Client (Broadcast to `room:game:<gameId>`)
- **Trigger**: Fired when real-world fixture reaches full time and game room settlement is complete.
- **Payload Schema**:
  ```json
  {
    "gameId": "g-8821",
    "status": "FINISHED",
    "finalStandings": [
      { "rank": 1, "userId": "u-1", "username": "AlexPro", "totalPoints": 5120, "coinReward": 1000, "rpChange": 3 },
      { "rank": 2, "userId": "u-2", "username": "GhostSniper", "totalPoints": 4250, "coinReward": 500, "rpChange": 1 },
      { "rank": 3, "userId": "u-3", "username": "ShadowFX", "totalPoints": 3980, "coinReward": 0, "rpChange": 0 },
      { "rank": 4, "userId": "u-4", "username": "NeonStrike", "totalPoints": 3100, "coinReward": 0, "rpChange": -1 }
    ]
  }
  ```
- **UI Consumption**: Triggers navigation to Final Results Screen.

---

### 9. `wallet:updated`
- **Direction**: Server $\rightarrow$ Client (Emitted to `room:user:<userId>`)
- **Trigger**: Fired whenever the user's coin balance changes (Game payout, Ad reward, Entry fee deduction).
- **Payload Schema**:
  ```json
  {
    "userId": "u-12345",
    "newBalance": 1000,
    "change": +500,
    "reason": "REWARDED_AD"
  }
  ```
- **UI Consumption**: Updates Top Navigation Bar Coin Pill & Wallet Screen balance display.
