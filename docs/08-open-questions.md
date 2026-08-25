# 08 — Open Questions & Ambiguities

This document lists requirements, edge cases, and potential UI/backend discrepancies that require explicit stakeholder clarification before backend engineering begins.

---

## 1. Gameplay & Mid-Match Joining

> [!WARNING]
> **Question 1: Joining Live Matches**
> What happens when a user joins a game room for a fixture that is already LIVE (e.g. 68' minute in progress)?
> - **Option A**: User receives points ONLY for events that occur AFTER they join the room.
> - **Option B (Recommended)**: User receives full accumulated points for events that occurred prior to joining (since drafted players' stats reflect the entire 90-minute match).
> - *Impact*: Option A requires filtering events by player selection timestamp; Option B uses total fixture player stats.

> [!QUESTION]
> **Question 2: Unfilled 4-Player Rooms**
> What happens if a game room has 2 or 3 players when the real-world match starts?
> - **Option A**: Cancel room, refund 500 Coins to joined participants.
> - **Option B**: Fill remaining slots with AI / Bot participants.
> - *Recommendation*: Option A (Cancel & refund) to prevent artificial coin farming.

---

## 2. Scoring & Data Provider Ambiguities

> [!IMPORTANT]
> **Question 3: Clean Sheet Eligibility Threshold**
> What exact minute/duration threshold must a defender or goalkeeper play to qualify for the **Defender Clean Sheet (+20 PTS)** bonus?
> - Standard fantasy rules require playing at least 60 minutes.
> - API-Football provides full team clean sheet flags and player minutes played.
> - *Proposed Rule*: Player must play $\ge 60$ minutes and their team must concede 0 goals while they are on the pitch.

> [!QUESTION]
> **Question 4: Provider Mapping for "Big Chance Created" & Pass Tracking**
> API-Football standard statistics endpoints include `passes.total`, `passes.accuracy`, `tackles.total`, `goals`, `assists`, `cards.yellow`, `cards.red`.
> - How is **Big Chance Created (+5 PTS)** derived if not directly exposed in standard API-Football feeds?
> - *Proposed Solution*: Map `passes.key` (Key Passes) from API-Football as "Big Chance Created" or negotiate Opta/StatsBomb data feed extension.

---

## 3. Ties & Match Interruptions

> [!QUESTION]
> **Question 5: Tie-Breaking Rules for Identical Points**
> What happens if two participants in a room finish with identical total fantasy points (e.g., User A and User B both have 395.2 pts for 2nd place)?
> - **Option A**: Split combined prize pool (e.g. 2nd & 3rd place prizes split: $(500 + 0) / 2 = 250$ Coins each).
> - **Option B**: Tie-breaker based on draft order (earlier pick gets higher rank).
> - **Option C**: Both users awarded the higher rank and full prize (1st place tie = 1,000 coins each).

> [!CAUTION]
> **Question 6: Postponed or Cancelled Matches**
> What happens if a real-world match is abandoned, postponed, or cancelled after a draft has completed?
> - Proposed Rule: Automatically set `Game.status = CANCELLED`, refund 500 Coins to all 4 participants, and void RP changes.

> [!QUESTION]
> **Question 7: Stat Corrections Post-Match**
> API-Football sometimes updates official match statistics (e.g., changing a goal to an own goal or re-assigning an assist) up to 2 hours after full-time.
> - *Proposed Rule*: Game rooms finalize and pay out immediately at the final whistle based on live stats. Post-match stat corrections will NOT retroactively alter coin balances or standings to protect user trust.

---

## 4. UI vs Business Rule Mismatches

> [!WARNING]
> **Mismatch 1: Final Results Payout Display vs Confirmed Business Rules**
> - **UI Design (`/ui/final_results/code.html`)**: Shows 3rd Place getting `+250 Coins` and 4th Place getting `+100 Coins` (Total payout = $1000 + 500 + 250 + 100 = 1,850$ Coins).
> - **Confirmed Business Rules (`AGENT.md`)**: States 1st = 1000 Coins, 2nd = 500 Coins, 3rd = 0 Coins, 4th = 0 Coins (Total payout = 1,500 Coins).
> - *Action Required*: Confirm whether 3rd and 4th place receive 0 coins (per `AGENT.md`) or partial payouts (per UI screenshot).

> [!NOTE]
> **Mismatch 2: Rewarded Ad Eligibility Text**
> - **UI Design (`/ui/wallet_coins/code.html`)**: Shows a "Watch Ad (+500 Coins)" button active in the Quick Actions section while user balance is 500 Coins.
> - **Confirmed Business Rules (`AGENT.md`)**: States user balance must equal **EXACTLY 0** to be eligible for rewarded ads.
> - *Action Required*: Frontend must disable or hide the "Watch Ad" button when balance $> 0$.
