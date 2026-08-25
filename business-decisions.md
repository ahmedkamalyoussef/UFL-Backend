# UFL Final Business Decisions

This document contains the authoritative, owner-confirmed business decisions and rules governing the backend implementation of the UFL Live Fantasy Football platform.

---

## 1. Game Joining

- Users **ARE allowed** to join a game while the real-world football match is already LIVE, provided the game room is still accepting players.
- A user joining late:
  - Pays the standard **500 Coins** entry fee.
  - Completes their draft/selection from currently available, non-taken football players.
  - Receives **FULL MATCH** fantasy points for their selected players, including events that occurred in the match prior to the user joining.
- No fantasy point penalties or reductions are applied based on a user's join timestamp.

---

## 2. Game Capacity

- A game room requires **exactly 4 users** to compete.
- If the real-world football match starts and the game room has fewer than 4 users:
  - The game is set to `CANCELLED`.
  - The **500 Coins** entry fee is refunded to every participant.
  - No fantasy rankings are computed.
  - No winner rewards or RP changes are distributed.
- Refund operations MUST be atomic and idempotent.

---

## 3. Match Cancellation / Postponement

- If a real-world football fixture is cancelled or postponed in a way that prevents fantasy completion:
  - The game room is set to `CANCELLED`.
  - Every participant's **500 Coins** entry fee is refunded.
  - No winner rewards or Global RP changes are distributed.
  - Affected users receive system notifications.
- If a match is temporarily suspended but scheduled to resume:
  - The game room remains active (`status = LIVE`).
  - Event ingestion and scoring resume when the real-world match continues.

---

## 4. Clean Sheet

A defender or goalkeeper receives **+20 Clean Sheet points** if and only if:
1. The player played **at least 60 minutes** in the match.
2. The player's team **conceded zero goals while the player was on the pitch**.

### Rule Examples:
- *Player plays 70 minutes, team concedes after substitution*: **Eligible (+20 PTS)**.
- *Player plays 55 minutes, team keeps clean sheet*: **Not eligible (0 PTS)**.
- *Player enters as substitute at minute 70, team keeps clean sheet*: **Not eligible (0 PTS)**.

---

## 5. Big Chance Created

- API-Football `passes.key` (Key Passes) **MUST NOT** be automatically mapped to "Big Chance Created".
- The backend MUST use the provider statistic that explicitly represents Big Chance Created if available.
- If the provider does not expose a reliable Big Chance Created statistic:
  - The statistic MUST be marked as unavailable.
  - Do NOT award the +5 points for unsupported data.
  - Do NOT silently substitute Key Passes.
- All provider stat mappings MUST remain isolated within the `FootballProvider` data normalization layer.

---

## 6. Tie Breaking

Ties are resolved deterministically so that every rank position has **exactly one participant**:

### Tie-Breaking Priority:
1. **Total Fantasy Points** (Highest first)
2. **Total Goals Scored** by user's drafted players
3. **Total Assists** by user's drafted players
4. **Stable Deterministic Fallback** (UUID string comparison on `participantId` / `gameId`)

### Prize & RP Distribution (No Splitting):
- **1st Place**: **1,000 Coins**, **+3 RP**
- **2nd Place**: **500 Coins**, **+1 RP**
- **3rd Place**: **0 Coins**, **0 RP**
- **4th Place**: **0 Coins**, **-1 RP**

---

## 7. Football Data Corrections

Real-world football data provider corrections are handled via a controlled settlement window:

- **Pre-Settlement Window**:
  - Recalculate affected fantasy points and update live room rankings.
  - Ensure wallet balance operations are not duplicated.
- **Post-Settlement Window**:
  - Once a match ends and payouts execute, the game is marked `FINALIZED`.
  - Late provider corrections occurring after finalization will **NOT** retroactively reverse or alter distributed wallet rewards.
- Settlement and wallet crediting logic MUST be fully idempotent.

---

## 8. Game Lifecycle

### Standard Lifecycle Path:
```
WAITING -> DRAFTING -> LIVE -> FINISHED
```

### Cancellation Path:
```
WAITING / DRAFTING / LIVE -> CANCELLED
```

### State Rules:
- **`WAITING`**: Lobby gathering up to 4 users. Entry fee deducted.
- **`DRAFTING`**: 4 users matched. 2-round 35s Snake Draft in progress.
- **`LIVE`**: Draft complete. Live fixture events ingested and scored.
- **`FINISHED`**: Match complete, final ranks settled, rewards & RP distributed. No new joins allowed.
- **`CANCELLED`**: Unfilled room or fixture cancelled. Fees refunded.

---

## 9. Draft Timeout

- Each draft turn has a strict **35-second timer**.
- When a turn timer expires without a user selection:
  - Backend automatically selects the highest-ranked available player based on a deterministic player rating.
  - Ties in player rating are resolved using stable `playerId` sorting.
  - Server broadcasts a `game:auto-pick` WebSocket event with:
    ```json
    { "isAutoPick": true, "reason": "TURN_TIMEOUT" }
    ```
- If no players remain available in a category:
  - Mark turn as failed and transition game into a recovery state.
  - NEVER select an already-taken player.

---

## 10. Wallet Safety

Coins are in-game virtual currency, but all wallet operations MUST be database-transaction safe, atomic, and idempotent:

- **Game Join**: Verify `balance >= 500`, atomically deduct 500 Coins, create participant record. Prevent duplicate joins or double deductions.
- **Game Cancellation**: Refund exactly 500 Coins to each participant. Prevent duplicate refunds via transaction idempotency keys.
- **Game Settlement**: Award rewards (1000 / 500 / 0 / 0) and RP (+3 / +1 / 0 / -1) exactly once per participant.
- **Rewarded Advertisement**: Verify `balance == 0`, credit 500 Coins. Prevent duplicate claim submissions.

---

## 11. Rewarded Advertisement

- **Eligibility Condition**: `wallet.balance == 0`.
- If user balance $> 0$: Backend rejects claim with `400 NOT_ELIGIBLE`.
- **Reward**: **+500 Coins**.
- Backend enforcement is authoritative, regardless of client UI state.

---

## 12. Supported Competitions

The platform exclusively supports the following **5 competitions**:
1. **English Premier League (EPL)**
2. **La Liga**
3. **Saudi Pro League (SPL)**
4. **UEFA Champions League (UCL)**
5. **AFC Champions League (ACL)**

Background synchronization workers MUST filter out all other competitions.

---

## 13. Coin Economy

- **Initial Registration**: **+500 Coins** (Welcome Bonus)
- **Game Entry Fee**: **-500 Coins**
- **1st Place Payout**: **+1,000 Coins** (Net +500)
- **2nd Place Payout**: **+500 Coins** (Net 0, refund)
- **3rd Place Payout**: **0 Coins** (Net -500)
- **4th Place Payout**: **0 Coins** (Net -500)
- **Rewarded Ad Claim**: **+500 Coins** (when balance = 0)

---

## 14. Global Ranking

- **1st Place**: **+3 RP**
- **2nd Place**: **+1 RP**
- **3rd Place**: **0 RP**
- **4th Place**: **-1 RP**
- **Season Reset**: Global RP resets to 0 at the start of every official football season.

---

## 15. Scoring Engine Matrix

| Event | Points | Condition / Applies To |
| :--- | :---: | :--- |
| **Goal** | **+40** | All Players |
| **Assist** | **+20** | All Players |
| **Big Chance Created** | **+5** | All Players (Verified stat only) |
| **Successful Pass** | **+1** | All Players |
| **Failed Pass** | **-1** | All Players |
| **Tackle** | **+3** | All Players |
| **Yellow Card** | **-5** | All Players |
| **Red Card** | **-20** | All Players |
| **Defender Clean Sheet** | **+20** | Defenders / Goalkeepers ($\ge 60$ mins, 0 conceded while on pitch) |
| **Goalkeeper Save** | **+10** | Goalkeepers |

The scoring engine evaluates normalized DTOs from `FootballProvider`, keeping domain logic clean of raw provider JSON.

---

## 16. Architecture Principles

- **Tech Stack**: Node.js, TypeScript, Express.js, MySQL, Sequelize ORM, Socket.IO, Redis.
- **Database Connection Configuration**: `DB_NAME=ufl`, `DB_USER=root`, `DB_HOST=localhost`, `DB_PORT=3306` (Actual password maintained safely in environment variables).
- **Provider Abstraction**: All provider calls pass through the `FootballProvider` interface (`getCompetitions`, `getFixtures`, `getFixtureEvents`, `getPlayerStatistics`).
- **Domain Independence**: Domain services and database schemas must never directly depend on API-Football vendor schemas.
