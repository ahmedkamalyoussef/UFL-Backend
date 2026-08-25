# UFL Backend End-to-End Test Plan

This document defines the comprehensive master End-to-End (E2E) Test Plan covering Scenarios A through O across all 15 backend domains of the UFL Fantasy Football platform.

---

## 1. Scenario Summary Matrix

| Scenario | Focus Area | Description & Validation Criteria | Target Status |
| :--- | :--- | :--- | :--- |
| **A** | Registration & Auth | 4 test users, hashed passwords, JWT generation, 500 Coins welcome bonus & transaction. | `PASS` |
| **B** | Game Joining | 4-user atomic room join, 500 Coins fee deduction, capacity 4, duplicate join prevention, insufficient balance check. | `PASS` |
| **C** | Snake Draft | Snake draft sequence ($P1 \rightarrow P4 \rightarrow P4 \rightarrow P1$), 35s turn timer, auto-pick on timeout, transition to `LIVE`. | `PASS` |
| **D** | Live Match Scoring | Real-time event ingestion, fantasy point calculation, live room ranking, event idempotency. | `PASS` |
| **E** | Mid-Match Live Joining | Join while match is `LIVE`, 500 Coins fee, completes draft, receives **FULL MATCH** fantasy points. | `PASS` |
| **F** | Incomplete Game Refund | Match starts with $< 4$ participants, room cancelled (`CANCELLED`), 500 Coins refunded idempotently (`GAME_REFUND`). | `PASS` |
| **G** | Match Cancellation | Fixture cancelled/postponed, room cancelled (`CANCELLED`), 500 Coins refunded idempotently, notification created. | `PASS` |
| **H** | Final Game Settlement | Match finished, 4-tier tie-breaker (Points $\rightarrow$ Goals $\rightarrow$ Assists $\rightarrow$ participantId), +1000/+500 Coins prizes, +3/+1/0/-1 RP updates, `game:finished` emitted. | `PASS` |
| **I** | Rewarded Ad Claim | Claim when balance == 500 $\rightarrow$ `400 NOT_ELIGIBLE`. Claim when balance == 0 $\rightarrow$ `+500 Coins` transaction. | `PASS` |
| **J** | Global Ranking | Season-scoped RP, negative RP support, deterministic tie-breakers, season list & history. | `PASS` |
| **K** | Notifications System | Persistent `GAME_FINISHED`/`GAME_CANCELLED` notifications, read/unread states, ownership isolation, `notification:new` socket event. | `PASS` |
| **L** | IDOR & Security | IDOR protection on profiles, wallets, notifications, game rooms, draft turns, fake points, fake reward amounts. | `PASS` |
| **M** | Concurrency Protection | Concurrent slot joining, concurrent player drafting, duplicate join/refund/settlement/rewarded ad prevention using atomic transactions and row locks. | `PASS` |
| **N** | REST API Contract | Verification of all 24 REST endpoints against `/docs/15-api-reference.md`. | `PASS` |
| **O** | Socket.IO Real-Time | Real-time event delivery (`game:draft-turn`, `game:player-selected`, `game:auto-pick`, `game:live-event`, `game:finished`, `ranking:updated`, `notification:new`) and private user room isolation (`user:{userId}`). | `PASS` |

---

## 2. Test Execution Details

### Scenario A — Registration & Welcome Bonus
- **Action**: Register 4 distinct users (`auth_user1` .. `auth_user4`).
- **Validation**: Passwords hashed (`bcrypt`), JWT tokens returned, initial wallet balance = 500 Coins, `WELCOME_BONUS` transaction created.

### Scenario B — Atomic Game Room Joining
- **Action**: Create game room with 500 Coins entry fee. Users 1..4 execute `POST /games/:id/join`.
- **Validation**: Each user wallet balance drops to 0 Coins. Game status transitions to `DRAFTING` upon 4th join. 5th join attempt fails (`ROOM_FULL`).

### Scenario C — Snake Draft System
- **Action**: Execute 8-turn Snake Draft. Turn 1 timeout tests auto-pick.
- **Validation**: Turn order follows $P1 \rightarrow P2 \rightarrow P3 \rightarrow P4 \rightarrow P4 \rightarrow P3 \rightarrow P2 \rightarrow P1$. Auto-pick picks highest `avgPoints` available player. Game transitions to `LIVE` after turn 8.

### Scenario D — Authoritative Live Scoring Engine
- **Action**: Ingest Goal (+40), Assist (+20), Yellow Card (-5), Clean Sheet (+20 for Defender $\ge 60$m).
- **Validation**: Server calculates total fantasy points deterministically. Client cannot submit fantasy points manually. Duplicate events produce 0 extra points.

### Scenario E — Mid-Match Live Joining
- **Action**: User joins open room while match status is `LIVE`.
- **Validation**: Entry fee deducted (500 Coins). User drafts players and receives FULL MATCH fantasy points accumulated from match kickoff.

### Scenario F — Incomplete Game Room Cancellation
- **Action**: Start match when game room has only 1 participant.
- **Validation**: Room status set to `CANCELLED`. Participant refunded 500 Coins cleanly (`GAME_REFUND`). Duplicate cancellation attempt produces 0 extra refunds.

### Scenario G — Match Cancellation & Refund Notification
- **Action**: Cancel fixture while game room is active.
- **Validation**: Room status set to `CANCELLED`. 500 Coins refunded. Persistent `GAME_CANCELLED` notification created for participants.

### Scenario H — Final Game Settlement & Prizes
- **Action**: Fixture finishes (`FINISHED`). Trigger `POST /games/:id/settle`.
- **Validation**: 4-tier tie-breaker applied. 1st receives +1000 Coins & +3 RP; 2nd receives +500 Coins & +1 RP; 3rd receives 0 Coins & 0 RP; 4th receives 0 Coins & -1 RP. `game:finished` Socket.IO event emitted.

### Scenario I — Rewarded Ad Eligibility
- **Action**: Claim rewarded ad when balance == 500 (fails 400). Claim when balance == 0 (succeeds +500 Coins).
- **Validation**: Server verifies balance == 0 before crediting coins.

### Scenario J — Global Ranking & Seasons
- **Action**: Create and activate Season 2027.
- **Validation**: Only 1 active season exists at a time. Leaderboard sorted by `rankingPoints` DESC $\rightarrow$ `userId` ASC. Negative RP supported.

### Scenario K — Notifications & Read States
- **Action**: Fetch `GET /notifications`. Mark notification read.
- **Validation**: Ownership isolation verified (`403 FORBIDDEN` for other users). `isRead` set to true, `readAt` set to timestamp.

### Scenario L — Security & IDOR Verification
- **Action**: Attempt unauthorized access to other users' wallets, notifications, or draft turns.
- **Validation**: All unauthorized actions safely rejected with HTTP 403 / 404 error codes.

### Scenario M — Concurrency & Locking
- **Action**: Simulate concurrent room joining and duplicate settlement requests.
- **Validation**: Row locking (`SELECT ... FOR UPDATE`) prevents double payouts or corrupt state.

### Scenario N — REST API Contract Verification
- **Action**: Execute all 24 REST endpoints.
- **Validation**: Standard JSON payload structure `{ success: true|false, data/error }` verified across all endpoints.

### Scenario O — Socket.IO Private Rooms
- **Action**: Connect Socket.IO client to `/game` namespace with JWT.
- **Validation**: Client automatically joins private room `user:{userId}` and receives real-time `notification:new` events.
