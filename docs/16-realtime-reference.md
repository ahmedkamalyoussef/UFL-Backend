# UFL Backend Real-Time Socket.IO Reference Specification

Namespace: `/game`
Path: `/socket.io`
Authentication: JWT query/auth handshake token required.

---

## 1. Socket Rooms
- **Game Room (`game:{gameId}`)**:
  - Joined via client emitting `game:join-room` with `{ gameId }`.
  - Authorized: Server verifies user is a valid participant in the game room (`GameParticipant`).
- **Private User Room (`user:{userId}`)**:
  - Automatically joined upon Socket.IO handshake authentication.
  - Receives personal real-time notifications (`notification:new`).

---

## 2. Real-Time Events Specification

### A. Draft Phase Events (Room: `game:{gameId}`)
1. **`game:draft-start`**
   - **Trigger**: Room reaches 4 participants and status transitions to `DRAFTING`.
   - **Payload**: `{ "gameId": "string", "draftSequence": ["p1", "p2", "p3", "p4", "p4", "p3", "p2", "p1"] }`
2. **`game:draft-turn`**
   - **Trigger**: Turn advances to next participant.
   - **Payload**: `{ "gameId": "string", "turnNumber": 1, "participantId": "string", "userId": "string", "timeRemainingSeconds": 35 }`
3. **`game:player-selected`**
   - **Trigger**: Turn holder selects a valid player.
   - **Payload**: `{ "gameId": "string", "turnNumber": 1, "participantId": "string", "playerId": "string", "isAutoPick": false }`
4. **`game:auto-pick`**
   - **Trigger**: 35-second turn timer expires; server picks highest-rated available player.
   - **Payload**: `{ "gameId": "string", "turnNumber": 1, "participantId": "string", "playerId": "string", "isAutoPick": true, "reason": "TURN_TIMEOUT" }`
5. **`game:draft-completed`**
   - **Trigger**: All 8 draft selections completed.
   - **Payload**: `{ "gameId": "string", "status": "LIVE" }`

---

### B. Live Gameplay & Scoring Events (Room: `game:{gameId}`)
1. **`game:live-event`**
   - **Trigger**: Football data provider ingests new match event (Goal, Assist, Card, Save).
   - **Payload**: `{ "gameId": "string", "fixtureId": "string", "event": { "type": "GOAL", "playerId": "string", "minute": 45, "pointsAdded": 40 } }`
2. **`game:ranking`**
   - **Trigger**: Live points update recalculates room leaderboard.
   - **Payload**: `{ "gameId": "string", "rankings": [ { "rank": 1, "participantId": "string", "userId": "string", "fantasyPoints": 120 } ] }`
3. **`game:finished`**
   - **Trigger**: Match finishes and `SettlementService.settleGame` completes.
   - **Payload**: `{ "gameId": "string", "status": "FINISHED", "results": [ { "rank": 1, "participantId": "string", "userId": "string", "fantasyPoints": 120, "coinReward": 1000, "rpChange": 3 } ] }`

---

### C. Global Leaderboard Event (Global Broadcast)
1. **`ranking:updated`**
   - **Trigger**: Settlement awards RP to participant.
   - **Payload**: `{ "seasonId": "string", "gameId": "string", "updatedUsers": [ { "userId": "string", "rpChange": 3, "newTotalRP": 1003 } ] }`

---

### D. Private User Notifications (Room: `user:{userId}`)
1. **`notification:new`**
   - **Trigger**: Database transaction commits a new notification for user.
   - **Payload**: `{ "id": "string", "type": "GAME_FINISHED|GAME_CANCELLED|GAME_REFUNDED|WELCOME_BONUS", "title": "string", "message": "string", "isRead": false, "createdAt": "Date" }`
