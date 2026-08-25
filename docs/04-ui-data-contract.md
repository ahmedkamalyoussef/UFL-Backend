# 04 — UI to Backend Data Contract

This document provides a comprehensive mapping between every visible UI element across all 13 screens and its corresponding backend Entity, Field, Data Type, Data Source, API Endpoint, and Real-Time Socket Event.

---

## 1. Top Navigation Bar (Global Component)

| UI Element / Label | Entity | Field | Data Type | Data Source | API Endpoint | Real-time Event |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| App Logo Header | App | logoUrl | `string` | Static Asset | N/A | None |
| Coin Balance Pill (`500`) | `Wallet` | `balance` | `number` (integer) | Database | `GET /api/v1/wallet` | `wallet:updated` |
| User Profile Avatar | `User` | `avatarUrl` | `string` (URL) | Database | `GET /api/v1/me` | None |

---

## 2. Authentication Screens (`register`, `login_1`, `login_2`)

| UI Element / Label | Entity | Field | Data Type | Data Source | API Endpoint | Real-time Event |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Username Input | `User` | `username` | `string` | User Input | `POST /api/v1/auth/register` | None |
| Email Input | `User` | `email` | `string` | User Input | `POST /api/v1/auth/register` / `login` | None |
| Password Input | `User` | `password` | `string` | User Input | `POST /api/v1/auth/register` / `login` | None |
| Confirm Password | N/A | N/A | `string` | Frontend Validation | N/A | None |
| Welcome Bonus Banner (`500 Coins`) | `Wallet` | `balance` | `number` | Business Config | `POST /api/v1/auth/register` | None |

---

## 3. Home Dashboard (`home_dashboard`)

| UI Element / Label | Entity | Field | Data Type | Data Source | API Endpoint | Real-time Event |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Welcome Header ("Welcome back, Alex") | `User` | `username` | `string` | Database | `GET /api/v1/me` | None |
| Live Match Status (`LIVE 72'`) | `Fixture` | `status`, `elapsed` | `string`, `number` | API-Football | `GET /api/v1/matches/featured` | `match:updated` |
| Home Team Crest & Code (`MCI`) | `Team` | `logoUrl`, `code` | `string`, `string` | Database | `GET /api/v1/matches/featured` | None |
| Away Team Crest & Code (`ARS`) | `Team` | `logoUrl`, `code` | `string`, `string` | Database | `GET /api/v1/matches/featured` | None |
| Live Score (`2 - 1`) | `Fixture` | `homeScore`, `awayScore` | `number`, `number` | API-Football | `GET /api/v1/matches/featured` | `match:updated` |
| Hero CTA Button (`JOIN GAME ROOM`) | `Game` | `id`, `entryFee` | `string`, `number` | Database | `POST /api/v1/games/join` | None |
| Live Now Cards | `Fixture` | `homeScore`, `awayScore`, `elapsed` | `object[]` | API-Football | `GET /api/v1/matches/live` | `match:updated` |
| Upcoming Draft Cards ("Starts in 2h") | `Fixture` | `startTime` | `datetime` | Database / Provider | `GET /api/v1/matches/upcoming` | None |

---

## 4. Match Discovery (`match_discovery`)

| UI Element / Label | Entity | Field | Data Type | Data Source | API Endpoint | Real-time Event |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Search Input | `Fixture` / `Team` | `name`, `code` | `string` | User Input Filter | `GET /api/v1/matches?q=...` | None |
| League Filter Pills (`Premier League`, etc.) | `Competition` | `name` | `string[]` | Database | `GET /api/v1/competitions` | None |
| Tabs (`Live` / `Upcoming`) | `Fixture` | `status` | `string` | UI State | `GET /api/v1/matches?status=...` | None |
| Match Card Header (`Premier League`) | `Competition` | `name` | `string` | Database | `GET /api/v1/matches` | None |
| Match Minute (`68'`) | `Fixture` | `elapsed` | `number` | API-Football | `GET /api/v1/matches` | `match:updated` |
| Teams & Score (`ARS 2-1 CHE`) | `Fixture` | `homeScore`, `awayScore` | `number` | API-Football | `GET /api/v1/matches` | `match:updated` |
| CTA Button (`JOIN GAME \| 500`) | `Game` | `entryFee` | `number` | Database | `POST /api/v1/games/join` | None |

---

## 5. Waiting Room / Matchmaking (`waiting_room`)

| UI Element / Label | Entity | Field | Data Type | Data Source | API Endpoint | Real-time Event |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Room Title (`Room #8821`) | `Game` | `id` | `string` (Short ID) | Database | `GET /api/v1/games/:id` | None |
| Player Count (`3/4 Players Joined`) | `Game` | `participants.length` | `number` | Socket State | `GET /api/v1/games/:id` | `game:state` |
| Player Slot Avatar | `User` | `avatarUrl` | `string` | Database | `GET /api/v1/games/:id` | `game:state` |
| Player Slot Username (`GamerTag88`) | `User` | `username` | `string` | Database | `GET /api/v1/games/:id` | `game:state` |
| Slot Badge (`READY` / `Searching...`) | `GameParticipant` | `status` | `string` | Socket State | N/A | `game:state` |
| Countdown Timer (`10` -> `GO`) | `Game` | `countdown` | `number` | Server Socket Timer | N/A | `game:state` |

---

## 6. Snake Draft (`snake_draft`)

| UI Element / Label | Entity | Field | Data Type | Data Source | API Endpoint | Real-time Event |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Fixture Score Header (`RMA 1 - 0 FCB`) | `Fixture` | `homeScore`, `awayScore` | `number` | API-Football | `GET /api/v1/games/:id` | `match:updated` |
| Live Match Minute (`Live 42'`) | `Fixture` | `elapsed` | `number` | API-Football | `GET /api/v1/games/:id` | `match:updated` |
| Phase Info ("Round 1/2", "Your Pick") | `Game` | `currentDraftTurn` | `number` | Game Engine | `GET /api/v1/games/:id` | `game:draft-turn` |
| Countdown Timer (`35` Seconds) | `DraftTurn` | `expiresAt` | `datetime` | Server Timer | N/A | `game:draft-turn` |
| Position Tabs (`ATTACKERS`, etc.) | `Player` | `position` | `string` | Enum Filter | `GET /api/v1/games/:id/players` | None |
| Player Name (`V. Júnior`) | `Player` | `name` | `string` | Database | `GET /api/v1/games/:id/players` | None |
| Player Star Tag (`STAR`) | `Player` | `isStar` | `boolean` | Database | `GET /api/v1/games/:id/players` | None |
| Player Rating (`12.5 PTS`) | `Player` | `avgPoints` | `number` | Database | `GET /api/v1/games/:id/players` | None |
| Select Button (`SELECT`) | `PlayerSelection` | `playerId` | `string` | User Action | `POST /api/v1/games/:id/select` | `game:player-selected` |
| Taken Player Card (`Lewandowski`, `TAKEN`) | `PlayerSelection` | `playerId` | `string` | Game State | `GET /api/v1/games/:id` | `game:player-selected` |
| Draft Order Avatars (`R1.1` to `R2.1`) | `DraftTurn` | `participantId`, `order` | `object[]` | Game Engine | `GET /api/v1/games/:id` | `game:draft-turn` |

---

## 7. Live Match Leaderboard (`live_match_leaderboard`)

| UI Element / Label | Entity | Field | Data Type | Data Source | API Endpoint | Real-time Event |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Match Scoreboard (`67' LIVE BAR 2-1 RMA`) | `Fixture` | `elapsed`, `homeScore`, `awayScore` | `number` | API-Football | `GET /api/v1/games/:id/live` | `match:updated` |
| Total Roster Points (`120`) | `GameParticipant` | `totalPoints` | `number` | Scoring Engine | `GET /api/v1/games/:id/live` | `game:ranking` |
| Roster Player Card (`M. Salah`, `+78 PTS`) | `PlayerMatchStatistic` | `totalFantasyPoints` | `number` | Scoring Engine | `GET /api/v1/games/:id/live` | `game:ranking` |
| Play-by-Play Event (`GOAL! +40 M. Salah`) | `FixtureEvent` | `eventType`, `detail`, `minute` | `object` | API-Football / Engine | `GET /api/v1/games/:id/live` | `game:live-event` |
| Leaderboard Ranks (1st `Alex_Striker` 420.5pts) | `GameParticipant` | `finalRank`, `totalPoints` | `object[]` | Game Engine | `GET /api/v1/games/:id/live` | `game:ranking` |
| Highlighted YOU Row (`2`, `395.2 pts`, `+45 RP`) | `GameParticipant` | `totalPoints`, `rpChange` | `object` | Game Engine | `GET /api/v1/games/:id/live` | `game:ranking` |

---

## 8. Final Results (`final_results`)

| UI Element / Label | Entity | Field | Data Type | Data Source | API Endpoint | Real-time Event |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1st Place Podium (Avatar, `AlexPro`, `5,120 pts`) | `GameParticipant` | `finalRank`, `totalPoints` | `object` | Game Settlement | `GET /api/v1/games/:id/results` | `game:finished` |
| 1st Place Payout (`+1,000 Coins`, `+3 RP`) | `GameParticipant` | `coinReward`, `rpChange` | `number`, `number` | Business Logic | `GET /api/v1/games/:id/results` | `game:finished` |
| 2nd Place Payout (`+500 Coins`, `+1 RP`) | `GameParticipant` | `coinReward`, `rpChange` | `number`, `number` | Business Logic | `GET /api/v1/games/:id/results` | `game:finished` |
| 3rd Place Payout (`+250 Coins`, `0 RP`) | `GameParticipant` | `coinReward`, `rpChange` | `number`, `number` | Business Logic | `GET /api/v1/games/:id/results` | `game:finished` |
| 4th Place List Row (`NeonStrike`, `3,100 pts`) | `GameParticipant` | `finalRank`, `totalPoints` | `object` | Game Settlement | `GET /api/v1/games/:id/results` | `game:finished` |
| Finish Game Button | N/A | N/A | Action | Client Navigation | `POST /api/v1/games/:id/claim` | None |

---

## 9. Wallet & Rewarded Ads (`wallet_coins`, `watch_ad_for_rewards`)

| UI Element / Label | Entity | Field | Data Type | Data Source | API Endpoint | Real-time Event |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Total Balance Display (`500 COINS`) | `Wallet` | `balance` | `number` | Database | `GET /api/v1/wallet` | `wallet:updated` |
| Watch Ad Button (`+500 Coins`) | `Wallet` | `balance` | Action | Client Action | `POST /api/v1/wallet/rewarded-ad/start` | None |
| Transaction History List ("Game Reward +1000") | `WalletTransaction` | `amount`, `type`, `createdAt` | `object[]` | Database | `GET /api/v1/wallet/transactions` | None |
| Ad Timer Remaining (`30s`) | N/A | N/A | `number` | Ad SDK / Client | N/A | None |
| Reward Claimed Overlay (`+500`) | `Wallet` | `balance` | `number` | Database | `POST /api/v1/wallet/rewarded-ad/claim` | `wallet:updated` |

---

## 10. Global Ranking (`global_ranking`)

| UI Element / Label | Entity | Field | Data Type | Data Source | API Endpoint | Real-time Event |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Season Header ("2026/27 Season") | `Season` | `name` | `string` | Database | `GET /api/v1/seasons/current` | None |
| User Sticky Rank (`#1,402`) | `GlobalRanking` | `rankPosition` | `number` | Database | `GET /api/v1/ranking/me` | None |
| User Sticky Points (`12,450`) | `GlobalRanking` | `rankingPoints` | `number` | Database | `GET /api/v1/ranking/me` | None |
| User Played / Wins (`342` / `210`) | `GlobalRanking` | `gamesPlayed`, `gamesWon` | `number`, `number` | Database | `GET /api/v1/ranking/me` | None |
| Global Top 10 List (Rank, Avatar, User, Pts) | `GlobalRanking` | `rankPosition`, `rankingPoints` | `object[]` | Database | `GET /api/v1/ranking/global` | None |

---

## 11. User Profile (`user_profile`)

| UI Element / Label | Entity | Field | Data Type | Data Source | API Endpoint | Real-time Event |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Profile Avatar & Name (`AlexPro`) | `User` | `avatarUrl`, `username` | `string`, `string` | Database | `GET /api/v1/me/profile` | None |
| Global Rank Badge (`#1,402`, `12,450 RP`) | `GlobalRanking` | `rankPosition`, `rankingPoints` | `number`, `number` | Database | `GET /api/v1/me/profile` | None |
| Career Stats (`Total Games`: 342) | `GlobalRanking` | `gamesPlayed` | `number` | Database | `GET /api/v1/me/profile` | None |
| Career Stats (`Total Wins`: 210) | `GlobalRanking` | `gamesWon` | `number` | Database | `GET /api/v1/me/profile` | None |
| Career Stats (`Win Rate`: 61%) | `GlobalRanking` | Computed `(gamesWon/gamesPlayed)*100` | `number` | Calculation | `GET /api/v1/me/profile` | None |
| Career Stats (`Career Coins`: 85.2k) | `Wallet` | `careerCoins` | `number` | Database | `GET /api/v1/me/profile` | None |
| Recent Matches List (`BAR 2-1 RMA 1st Place`) | `GameParticipant` | `finalRank`, `coinReward`, `rpChange` | `object[]` | Database | `GET /api/v1/me/match-history` | None |
