# UI API Audit & Data Contract Mapping

This document provides a comprehensive mapping of every UI screen and user flow to its supporting backend REST endpoint and Socket.IO real-time event.

---

## 1. Authentication (`/ui/auth`)
- **Login Screen**:
  - UI Requirement: Sign in with email and password, receive JWT & user profile.
  - Endpoint: `POST /api/v1/auth/login`
  - Status: `IMPLEMENTED`
- **Registration Screen**:
  - UI Requirement: Create new account, receive 500 Coins welcome bonus & JWT.
  - Endpoint: `POST /api/v1/auth/register`
  - Status: `IMPLEMENTED`
- **User Profile (`/me`)**:
  - UI Requirement: Fetch user profile, avatar, wallet balance, and RP stats.
  - Endpoint: `GET /api/v1/me`
  - Status: `IMPLEMENTED`

---

## 2. Match & Competition Discovery (`/ui/matches`, `/ui/competitions`)
- **Competitions List**:
  - UI Requirement: Display supported competition cards (EPL, La Liga, SPL, Champions League, AFC Champions League).
  - Endpoint: `GET /api/v1/competitions`
  - Status: `IMPLEMENTED`
- **Matches Discovery**:
  - UI Requirement: Filter upcoming & live fixtures by competition or status.
  - Endpoint: `GET /api/v1/matches`
  - Status: `IMPLEMENTED`
- **Match Details**:
  - UI Requirement: View single match info, teams, scores, elapsed time, and open game rooms.
  - Endpoint: `GET /api/v1/matches/:id`
  - Status: `IMPLEMENTED`

---

## 3. Game Rooms & Joining (`/ui/games`)
- **Game Rooms List**:
  - UI Requirement: Browse active game rooms for a fixture with participant counts ($X/4$).
  - Endpoint: `GET /api/v1/games`
  - Status: `IMPLEMENTED`
- **Create Game Room**:
  - UI Requirement: Create a new 4-player game room for a fixture with 500 Coins entry fee.
  - Endpoint: `POST /api/v1/games`
  - Status: `IMPLEMENTED`
- **Join Game Room**:
  - UI Requirement: Join open game room (pre-match or mid-match live), deduct 500 Coins entry fee atomically.
  - Endpoint: `POST /api/v1/games/:id/join`
  - Status: `IMPLEMENTED`
- **Cancel Game Room**:
  - UI Requirement: Cancel unfilled game room at match start or upon match cancellation, refund 500 Coins to all participants.
  - Endpoint: `POST /api/v1/games/:id/cancel`
  - Status: `IMPLEMENTED`

---

## 4. Snake Draft System (`/ui/draft`)
- **Draft Room State**:
  - UI Requirement: Fetch current draft turn, 8-turn sequence ($P1 \rightarrow P2 \rightarrow P3 \rightarrow P4 \rightarrow P4 \rightarrow P3 \rightarrow P2 \rightarrow P1$), timer, available player list.
  - Endpoint: `GET /api/v1/games/:id/draft/state`
  - Status: `IMPLEMENTED`
- **Player Selection**:
  - UI Requirement: Turn holder selects an available player within 35 seconds.
  - Endpoint: `POST /api/v1/games/:id/draft/select`
  - Status: `IMPLEMENTED`
- **Real-Time Draft Events**:
  - UI Requirement: Live turn updates, selection broadcasts, turn timeouts (`isAutoPick: true`).
  - Socket.IO Events: `game:draft-start`, `game:draft-turn`, `game:player-selected`, `game:auto-pick`, `game:draft-completed`
  - Status: `IMPLEMENTED`

---

## 5. Live Scoring & Leaderboard (`/ui/live`)
- **Live Room Ranking**:
  - UI Requirement: Live fantasy score calculation, clean sheet tracking, tie-breaker rankings.
  - Endpoint: `GET /api/v1/games/:id/ranking`
  - Status: `IMPLEMENTED`
- **Player Points Breakdown**:
  - UI Requirement: Inspect detailed fantasy points breakdown for a drafted player.
  - Endpoint: `GET /api/v1/games/:id/players/:playerId/points`
  - Status: `IMPLEMENTED`
- **Real-Time Scoring Events**:
  - Socket.IO Events: `game:live-event`, `game:ranking`
  - Status: `IMPLEMENTED`

---

## 6. Final Results & Settlement (`/ui/results`)
- **Final Game Results**:
  - UI Requirement: View finalized 4-tier tie-breaker results, Coin prize (+1000 / +500), and RP changes (+3 / +1 / 0 / -1).
  - Endpoint: `GET /api/v1/games/:id/result`
  - Status: `IMPLEMENTED`
- **System Settlement Trigger**:
  - Endpoint: `POST /api/v1/games/:id/settle`
  - Status: `IMPLEMENTED`
- **Real-Time Finish Event**:
  - Socket.IO Event: `game:finished`
  - Status: `IMPLEMENTED`

---

## 7. Wallet & Transactions (`/ui/wallet`)
- **Wallet Overview**:
  - UI Requirement: View current balance, career coins, and Rewarded Ad eligibility (`balance == 0`).
  - Endpoint: `GET /api/v1/wallet`
  - Status: `IMPLEMENTED`
- **Transaction History**:
  - UI Requirement: View financial transaction log (`WELCOME_BONUS`, `GAME_ENTRY`, `GAME_REFUND`, `GAME_REWARD`, `REWARDED_AD`).
  - Endpoint: `GET /api/v1/wallet/transactions`
  - Status: `IMPLEMENTED`
- **Claim Rewarded Ad**:
  - UI Requirement: Watch Rewarded Ad when balance is 0 to receive +500 Coins.
  - Endpoint: `POST /api/v1/wallet/claim-rewarded-ad`
  - Status: `IMPLEMENTED`

---

## 8. Global Ranking & Seasons (`/ui/leaderboard`)
- **Global Leaderboard**:
  - UI Requirement: View active season leaderboard ranked by RP DESC $\rightarrow$ userId ASC.
  - Endpoint: `GET /api/v1/ranking`
  - Status: `IMPLEMENTED`
- **Current User Rank**:
  - UI Requirement: View current user rank, RP, games played, and wins.
  - Endpoint: `GET /api/v1/ranking/me`
  - Status: `IMPLEMENTED`
- **Seasons List & Historical Leaderboard**:
  - UI Requirement: Browse active and historical seasons and inspect immutable season rankings.
  - Endpoints: `GET /api/v1/seasons`, `GET /api/v1/seasons/:seasonId/ranking`
  - Status: `IMPLEMENTED`

---

## 9. User Profile & Game History (`/ui/profile`)
- **Profile Details**:
  - UI Requirement: View avatar, username, email, joined date, career coins, and RP.
  - Endpoint: `GET /api/v1/me`
  - Status: `IMPLEMENTED`
- **Game History**:
  - UI Requirement: Paginated list of user's past game participations, total points, and fixture scores.
  - Endpoint: `GET /api/v1/users/me/games`
  - Status: `IMPLEMENTED`

---

## 10. Notifications (`/ui/notifications`)
- **User Notifications List**:
  - UI Requirement: Paginated notification list with `unreadCount`.
  - Endpoint: `GET /api/v1/notifications`
  - Status: `IMPLEMENTED`
- **Mark Notification Read**:
  - Endpoint: `PATCH /api/v1/notifications/:id/read`
  - Status: `IMPLEMENTED`
- **Mark All Read**:
  - Endpoint: `PATCH /api/v1/notifications/read-all`
  - Status: `IMPLEMENTED`
- **Real-Time Notification Event**:
  - Socket.IO Event: `notification:new` (delivered to private user room `user:{userId}`)
  - Status: `IMPLEMENTED`
