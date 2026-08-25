# UFL Backend Analysis Review

This document provides a comprehensive review of the UFL backend analysis (`/docs/all.md`) evaluated strictly against the **authoritative client business requirements** specified in `AGENT.md`.

---

## 1. Confirmed Authoritative Requirements

The following business rules represent the single source of truth for all backend implementations:

### Coin Economy
- **Initial User Balance**: Exactly **500 Coins** granted upon user registration (Welcome Bonus).
- **Game Room Entry Fee**: Exactly **500 Coins** per 4-player game room.
- **Game Payout Structure**:
  - **1st Place**: **1,000 Coins** (+3 Global RP)
  - **2nd Place**: **500 Coins** (Refund of entry fee, +1 Global RP)
  - **3rd Place**: **0 Coins** (0 Global RP)
  - **4th Place**: **0 Coins** (-1 Global RP)
- **Rewarded Advertisement Reward**: **+500 Coins**.
- **Rewarded Ad Eligibility**: Allowed **ONLY when user wallet balance equals EXACTLY 0 Coins**.

### Game & Draft Engine
- **Room Capacity**: Exactly **4 players** per game room.
- **Squad Size**: Each user selects exactly **2 football players**.
- **Total Room Selections**: **8 unique football players** selected per game room.
- **Draft Format**: **Snake Draft** ($P1 \rightarrow P2 \rightarrow P3 \rightarrow P4 \rightarrow P4 \rightarrow P3 \rightarrow P2 \rightarrow P1$).
- **Turn Duration**: Exactly **35 seconds** per turn.
- **Timeout Action**: If timer expires, backend automatically selects the highest-ranked available football player.
- **Exclusivity**: Selected football players are unique to the game room (marked `TAKEN`).

### Scoring Engine Matrix
- Goal: **+40 PTS**
- Assist: **+20 PTS**
- Big Chance Created: **+5 PTS**
- Successful Pass: **+1 PT**
- Failed Pass: **-1 PT**
- Tackle: **+3 PTS**
- Yellow Card: **-5 PTS**
- Red Card: **-20 PTS**
- Defender Clean Sheet: **+20 PTS**
- Goalkeeper Save: **+10 PTS**

### Global Ranking Points (RP)
- 1st Place: **+3 RP**
- 2nd Place: **+1 RP**
- 3rd Place: **0 RP**
- 4th Place: **-1 RP**
- Season Reset: Ranking points reset to 0 at the end of every football season.

### Supported Competitions (ONLY 5)
1. **English Premier League (EPL)**
2. **La Liga**
3. **Saudi Pro League (SPL)**
4. **UEFA Champions League (UCL)**
5. **AFC Champions League (ACL)**

---

## 2. UI Conflicts & Required Corrections

Where UI mockups in `/ui/` conflict with Authoritative Business Requirements, the backend MUST enforce the business requirements and flag the UI elements that require future frontend correction:

### Conflict 1: Final Results Payout Structure
- **UI currently says (`/ui/final_results/code.html`)**:
  - 3rd Place: `+250 Coins`
  - 4th Place: `+100 Coins`
- **Business requirement says (`AGENT.md`)**:
  - 1st Place: `1000 Coins`
  - 2nd Place: `500 Coins`
  - 3rd Place: `0 Coins`
  - 4th Place: `0 Coins`
- **Final backend rule**: Enforce `1000 / 500 / 0 / 0` coin distribution.
- **UI correction required**: Update `/ui/final_results/code.html` to display `0 Coins` for 3rd and 4th place instead of `+250` / `+100`.

### Conflict 2: Rewarded Ad Eligibility & Visibility
- **UI currently says (`/ui/wallet_coins/code.html`)**:
  - "Watch Ad (+500 Coins)" quick action button is active and clickable when user wallet balance is 500 Coins.
- **Business requirement says (`AGENT.md`)**:
  - Rewarded Ads are eligible **ONLY when user wallet balance equals EXACTLY 0 Coins**.
- **Final backend rule**: Reject `POST /api/v1/wallet/rewarded-ad/claim` with `400 NOT_ELIGIBLE` if balance $> 0$.
- **UI correction required**: Disable or hide the "Watch Ad" button in `/ui/wallet_coins/code.html` when balance $> 0$.

### Conflict 3: Unsupported Competitions Displayed in UI
- **UI currently says (`/ui/home_dashboard/code.html` & `/ui/match_discovery/code.html`)**:
  - Displays matches from Bundesliga (`BAY` vs `DOR`) and Serie A (`JUV` vs `MIL`).
- **Business requirement says (`AGENT.md`)**:
  - ONLY 5 competitions are supported (EPL, La Liga, SPL, UCL, ACL).
- **Final backend rule**: Ingest, store, and expose fixtures ONLY from the 5 supported competitions.
- **UI correction required**: Replace mock match cards for Bundesliga & Serie A in `/ui/home_dashboard/code.html` with supported leagues (e.g., Saudi Pro League or AFC Champions League).

---

## 3. Missing Requirements

The following requirements are essential for the backend but are not explicitly represented in the current UI mockups:

1. **Zero-Coins Dialog / Modal**:
   - When a user with 0 Coins attempts to tap "JOIN GAME", there is no UI modal dialog prompting: *"Insufficient Coins! Watch a rewarded ad to claim 500 Coins and enter the arena."*
2. **Auto-Pick Visual Badge**:
   - The Snake Draft UI (`/ui/snake_draft/code.html`) does not distinguish between a manually selected player and an auto-picked player when a turn times out.
3. **Fixture Postponement / Cancellation Handler**:
   - No UI state or notification banner for when a real-world match is abandoned or postponed mid-game.
4. **Season Transition / Reset Notice**:
   - No UI screen or alert informing users that Global Ranking Points have been reset for the new football season.

---

## 4. Dangerous Assumptions

The following assumptions present in previous analysis or UI mockups MUST NOT be implemented in the backend:

1. **Do NOT assume 3rd and 4th place receive positive coin payouts**: UI mockup displays `+250` and `+100`, but backend MUST enforce `0 Coins`.
2. **Do NOT assume Rewarded Ads can be watched at any time**: UI displays an active ad button at 500 Coins, but backend MUST restrict access to `balance == 0`.
3. **Do NOT couple domain logic directly to API-Football JSON formats**: Keep backend decoupled via the `FootballProvider` interface abstraction.
4. **Do NOT ingest fixtures from unsupported leagues**: Avoid ingesting Bundesliga, Serie A, MLS, or other non-supported competitions.

---

## 5. Open Business Questions

The following technical and product ambiguities require explicit decision-making before backend engineering starts:

1. **Mid-Match Game Room Joining**:
   - *Question*: When a user joins a room for a live match (e.g. at the 68th minute), do they receive fantasy points for events that occurred prior to joining?
   - *Recommendation*: Grant full match points for drafted players (reflecting the full 90-minute performance).
2. **Unfilled 4-Player Game Rooms**:
   - *Question*: What happens if a room has only 2 or 3 players when the real-world match starts?
   - *Recommendation*: Cancel the room and refund the 500 Coins entry fee.
3. **Clean Sheet Eligibility Threshold**:
   - *Question*: What minimum minute threshold must a defender play to earn the +20 Clean Sheet bonus?
   - *Recommendation*: Require playing $\ge 60$ minutes with 0 goals conceded while on the pitch.
4. **"Big Chance Created" Data Mapping**:
   - *Question*: Standard API-Football feeds provide `passes.key`. Should `passes.key` map to "Big Chance Created (+5 PTS)"?
   - *Recommendation*: Map `passes.key` to "Big Chance Created".
5. **Tie-Breaking Rules**:
   - *Question*: How are coin rewards and RP split if two participants tie with identical fantasy points?
   - *Recommendation*: In a 1st-place tie, split the combined 1st + 2nd prize pool ($1500 / 2 = 750$ Coins each).

---

## 6. Recommended Final Domain Model Changes

1. **`GameParticipant` Entity**:
   - Add explicit validation constraint on `coinReward` (`1000 | 500 | 0`) and `rpChange` (`3 | 1 | 0 | -1`).
2. **`Wallet` Entity**:
   - Add computed property `isEligibleForRewardedAd`: `boolean` (evaluated as `balance == 0`).
3. **`Competition` Entity**:
   - Enforce enum constraint on `code` (`EPL | LALIGA | SPL | UCL | ACL`).

---

## 7. Recommended API Changes

1. **`POST /api/v1/wallet/rewarded-ad/claim`**:
   - Enforce strict middleware check ensuring `wallet.balance == 0` before processing claim. Return `400 NOT_ELIGIBLE` if balance $> 0$.
2. **`POST /api/v1/games/join`**:
   - Enforce strict check ensuring `wallet.balance >= 500`. Return `400 INSUFFICIENT_FUNDS` if balance $< 500$.
3. **`GET /api/v1/competitions`**:
   - Filter response to return ONLY the 5 supported competitions.

---

## 8. Recommended Realtime Changes

1. **`game:finished` Event**:
   - Payload MUST emit exact `1000 / 500 / 0 / 0` coin rewards and `+3 / +1 / 0 / -1` RP changes.
2. **`game:auto-pick` Event**:
   - Payload MUST include explicit `isAutoPick: true` and `reason: "TURN_TIMEOUT"` flags.
