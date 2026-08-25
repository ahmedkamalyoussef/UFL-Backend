# 07 — Confirmed Business Rules

This document specifies the exact business logic rules governing the UFL economy, matchmaking, draft engine, live scoring, and global ranking system.

---

## 1. Coin Economy & Wallet Rules

### Initial Registration Bonus
- Every newly registered user receives exactly **500 Coins** upon account creation.
- Initial wallet balance: `500`.

### Game Room Entry Fee
- Joining a 4-player game room costs exactly **500 Coins**.
- Coins are deducted atomically at the moment of room joining (`POST /api/v1/games/join`).
- If a user's wallet balance is `< 500 Coins`, game entry is blocked.

### Payout & Prize Structure per 4-Player Game

| Rank | Coin Reward | Net Coin Gain / Loss | Season Ranking Points (RP) |
| :---: | :---: | :---: | :---: |
| **1st Place** | **1,000 Coins** | **+500 Coins** | **+3 RP** |
| **2nd Place** | **500 Coins** | **0 Coins (Refund)** | **+1 RP** |
| **3rd Place** | **0 Coins** | **-500 Coins** | **0 RP** |
| **4th Place** | **0 Coins** | **-500 Coins** | **-1 RP** |

*Total Prize Pool generated*: $4 \text{ players} \times 500 \text{ coins} = 2,000 \text{ Coins}$.
*Total Prize Pool distributed*: $1,000 + 500 = 1,500 \text{ Coins}$ (Platform rake / sink = 500 Coins per game).

### Rewarded Advertisement Rules
- Reward amount: **+500 Coins** per completed video ad view.
- **Strict Eligibility Rule**: A user is eligible to watch a rewarded ad ONLY when their wallet balance equals **exactly 0 Coins**.
- Attempting to claim ad rewards with balance $> 0$ will return error `400 NOT_ELIGIBLE`.

---

## 2. Matchmaking & Room Assembly Rules

- **Room Capacity**: Exactly **4 players** per game room.
- **Match Association**: Each game room is bound to a single real-world football fixture (e.g. Real Madrid vs Barcelona).
- **Start Trigger**: As soon as 4 players join a room, matchmaking locks, a 10-second countdown begins, and the room transitions to the Snake Draft.

---

## 3. Snake Draft Rules

- **Players Selected per User**: Exactly **2 football players** per participant.
- **Total Players Selected per Room**: $4 \text{ participants} \times 2 \text{ players} = 8 \text{ football players}$.
- **Draft Format**: **Snake Draft** (Order reverses in Round 2).
  - Round 1: Player 1 $\rightarrow$ Player 2 $\rightarrow$ Player 3 $\rightarrow$ Player 4
  - Round 2: Player 4 $\rightarrow$ Player 3 $\rightarrow$ Player 2 $\rightarrow$ Player 1
- **Draft Turn Duration**: Exactly **35 seconds** per turn.
- **Exclusivity Rule**: Once a football player is drafted by any user in a game room, that player becomes **TAKEN** and is unavailable to all other users in that same room.
- **Auto-Pick Timeout Rule**: If a user's 35-second timer expires without a manual selection, the backend auto-pick worker automatically assigns the available player with the highest `avgPoints` rating in the active position category.

---

## 4. Fantasy Point Scoring Engine Matrix

Points are granted to drafted players based on real-time match events in their real-world fixture:

| Action / Event | Fantasy Points | Applicable Position(s) |
| :--- | :---: | :--- |
| **Goal Scored** | **+40 PTS** | All Players |
| **Assist** | **+20 PTS** | All Players |
| **Big Chance Created** | **+5 PTS** | All Players |
| **Successful Pass** | **+1 PT** | All Players |
| **Failed Pass** | **-1 PT** | All Players |
| **Tackle** | **+3 PTS** | All Players |
| **Yellow Card** | **-5 PTS** | All Players |
| **Red Card** | **-20 PTS** | All Players |
| **Defender Clean Sheet** | **+20 PTS** | Defenders / Goalkeepers |
| **Goalkeeper Save** | **+10 PTS** | Goalkeepers |

---

## 5. Global Ranking System

- **Ranking Point (RP) System**: Players accumulate or lose RP based on their final rank in every completed 4-player game.
  - 1st Place: **+3 RP**
  - 2nd Place: **+1 RP**
  - 3rd Place: **0 RP**
  - 4th Place: **-1 RP**
- **Season Reset**: Global Rankings reset to 0 at the end of every official football season (e.g. 2026/27 Season).

---

## 6. Supported Competitions

Only the following 5 official football competitions are supported by the application backend:

1. **English Premier League (EPL)**
2. **La Liga (Spain)**
3. **Saudi Pro League (SPL)**
4. **UEFA Champions League (UCL)**
5. **AFC Champions League (ACL)**

No other competitions or leagues shall be exposed or processed by the API or sync workers.
