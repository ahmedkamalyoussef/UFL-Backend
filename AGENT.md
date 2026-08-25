# UFL Backend Development Agent

You are the senior backend engineer responsible for building the backend of the UFL mobile application.

The backend must be built to support the exact UI/UX contained in the `/ui` directory.

The `/ui` directory contains the screens designed in Google Stitch and is the visual source of truth for the application.

The application is a competitive live fantasy football game.

---

# CURRENT PROJECT STATE

The repository currently contains only:

- README.md
- agent.md
- ui/

There is currently NO backend implementation.

There is currently NO database.

There is currently NO API-Football API key.

Do not assume that any backend code already exists.

---

# CRITICAL RULE

DO NOT START IMPLEMENTING THE BACKEND YET.

Your first responsibility is to completely understand the UI and translate it into a backend specification.

Do not create:

- Express server
- Database
- Prisma schema
- Controllers
- Routes
- Services
- API-Football integration
- Socket.IO implementation
- Redis
- Background workers

yet.

First analyze the product.

---

# STEP 1 — INSPECT THE PROJECT

Inspect the entire repository.

Read:

- README.md
- agent.md
- every file inside `/ui`
- every screenshot/image/design file inside `/ui`

Do not modify anything inside `/ui`.

Do not assume a screen exists unless you actually find it.

---

# STEP 2 — ANALYZE EVERY UI SCREEN

For every screen found inside `/ui`, document:

- Screen name
- Screen purpose
- Navigation entry point
- Visible data
- Buttons
- User actions
- Forms
- Lists
- Cards
- Filters
- Counters
- Statistics
- Status indicators
- Loading states
- Empty states
- Error states
- Success states
- Real-time elements
- Authentication requirements
- Wallet/Coin requirements
- Ranking requirements
- Game requirements

The goal is to understand exactly what the frontend expects from the backend.

---

# STEP 3 — DOCUMENT USER FLOWS

Identify and document the complete user journeys.

At minimum analyze:

## Authentication

Register
→ Welcome Bonus
→ Home

Login
→ Home

## Match Discovery

Home
→ Matches
→ Match Details
→ Join Game

## Game

Join Game
→ Waiting Room
→ 4 Players
→ Snake Draft
→ Select 2 Football Players
→ Live Game
→ Live Ranking
→ Match Finished
→ Final Result

## Wallet

Wallet
→ Balance
→ Transactions

## Zero Coins

Balance = 0
→ Rewarded Advertisement
→ +500 Coins
→ Find Match

## Global Ranking

Home
→ Global Ranking
→ Season
→ Leaderboard

## Profile

Profile
→ Statistics
→ Game History
→ Settings

Document any additional flows discovered in the UI.

---

# STEP 4 — IDENTIFY BACKEND ENTITIES

Based on the UI and the confirmed product requirements, identify the backend entities required by the application.

Potential entities include:

- User
- Wallet
- WalletTransaction
- Competition
- Team
- Player
- Fixture
- FixtureEvent
- PlayerMatchStatistic
- Game
- GameParticipant
- DraftTurn
- PlayerSelection
- GameEvent
- GameRanking
- Season
- GlobalRanking
- Notification

These are examples only.

Do not create unnecessary entities.

For every entity explain:

- Purpose
- Important fields
- Relationships
- Lifecycle
- Which UI screens use it

---

# STEP 5 — UI TO BACKEND DATA CONTRACT

Create a complete mapping between the UI and backend.

For every important UI element document:

UI Element
→ Entity
→ Field
→ Data Type
→ Source
→ API endpoint
→ Real-time event if applicable

Example:

Coin Balance
→ Wallet
→ balance
→ number
→ Database
→ GET /api/v1/wallet

Username
→ User
→ username
→ string
→ Database
→ GET /api/v1/me

Live Match Score
→ Fixture
→ homeScore / awayScore
→ number
→ Football provider
→ GET /api/v1/matches/:id
→ match:updated

Draft Countdown
→ DraftTurn
→ expiresAt
→ datetime
→ Backend
→ GET /api/v1/games/:id
→ game:draft-turn

Live Fantasy Points
→ GameParticipant
→ totalPoints
→ number
→ Scoring Engine
→ GET /api/v1/games/:id
→ game:ranking

Do this for the actual UI.

---

# STEP 6 — DESIGN THE API CONTRACT

Design the REST API that the UI will need.

Do NOT implement it yet.

For every endpoint document:

- HTTP method
- URL
- Authentication requirement
- Request parameters
- Request body
- Response
- Error responses
- Which screen consumes it
- Which UI action triggers it

Possible API areas:

/api/v1/auth
/api/v1/me
/api/v1/matches
/api/v1/games
/api/v1/wallet
/api/v1/ranking
/api/v1/seasons
/api/v1/notifications

These are examples.

Choose the final API structure based on the actual UI.

Do not create endpoints that have no UI or business purpose.

---

# STEP 7 — DESIGN REAL-TIME EVENTS

The application contains real-time gameplay.

Identify every real-time event required by the UI.

Potential events:

game:state
game:draft-turn
game:player-selected
game:auto-pick
game:live-event
game:ranking
game:finished
wallet:updated
notification:new

For each event document:

- Event name
- When it occurs
- Who receives it
- Payload
- Which UI screen consumes it

Use Socket.IO conceptually.

Do not implement Socket.IO yet.

---

# STEP 8 — DOCUMENT BUSINESS RULES

Document these confirmed rules.

## Coins

New user:

500 Coins

Game entry:

500 Coins

1st place:

1000 Coins

2nd place:

500 Coins

3rd place:

0 Coins

4th place:

0 Coins

Rewarded advertisement:

500 Coins

Rewarded advertisement eligibility:

User balance must equal exactly 0.

---

# GAME

Players per room:

4

Players selected by each user:

2

Total selected football players:

8

Draft:

Snake Draft

Draft turn duration:

35 seconds

Selected football player:

Becomes unavailable to other users in the same game.

If the timer expires:

Backend automatically selects an available player.

---

# SCORING

Goal:

+40

Assist:

+20

Big Chance Created:

+5

Successful Pass:

+1

Failed Pass:

-1

Tackle:

+3

Yellow Card:

-5

Red Card:

-20

Defender Clean Sheet:

+20

Goalkeeper Save:

+10

---

# GLOBAL RANKING

1st:

+3

2nd:

+1

3rd:

0

4th:

-1

Ranking resets at the end of every football season.

---

# SUPPORTED COMPETITIONS

Only:

- English Premier League
- La Liga
- Saudi Pro League
- UEFA Champions League
- AFC Champions League

No other competitions should be exposed by the application.

---

# STEP 9 — API-FOOTBALL

The football data provider will be:

API-Football

Website:

https://www.api-football.com

However:

NO API key is currently available.

Therefore do not implement the real integration yet.

Instead design a provider abstraction.

Conceptually:

FootballProvider

It should eventually support operations such as:

- getCompetitions()
- getFixtures()
- getFixture()
- getFixtureEvents()
- getLineups()
- getPlayerStatistics()

The rest of the application must depend on the abstraction, not directly on API-Football.

Later we will implement:

ApiFootballProvider

Do not make the domain depend on API-Football response formats.

---

# STEP 10 — IDENTIFY AMBIGUITIES

Create a list of requirements that cannot safely be implemented without clarification.

Pay special attention to:

1. What happens when a user joins a match that is already LIVE?
2. Do they receive points from events that happened before they joined?
3. Exact Clean Sheet eligibility rules.
4. Exact definition/data source for Big Chance Created.
5. Exact definition of Successful Pass and Failed Pass.
6. What happens if two users have identical final points?
7. What happens if fewer than 4 players join?
8. What happens if a football match is cancelled?
9. What happens if football data is temporarily unavailable?
10. What happens if final match statistics are corrected after the game ends?

Do not silently invent critical business rules.

---

# STEP 11 — DESIGN THE PROPOSED ARCHITECTURE

Recommend a production-ready architecture.

Target stack:

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma
- Socket.IO

Recommended conceptual architecture:

Flutter
↓
Express REST API
↓
Application Services
↓
Domain Logic
↓
PostgreSQL

Football data:

Backend
↓
FootballProvider
↓
API-Football

Realtime:

Backend
↓
Socket.IO
↓
Flutter

Background processing:

Backend
↓
Jobs
↓
Football synchronization
↓
Scoring
↓
Game finalization

Do not implement this yet.

Only document the architecture.

---

# STEP 12 — CREATE DOCUMENTATION

Create:

/docs/

with:

01-ui-audit.md
02-user-flows.md
03-domain-model.md
04-ui-data-contract.md
05-api-contract.md
06-realtime-contract.md
07-business-rules.md
08-open-questions.md
09-backend-architecture.md

These documents must be based on the actual UI files.

---

# FINAL REQUIREMENT

When this analysis phase is complete:

DO NOT implement the backend.

DO NOT install backend dependencies.

DO NOT create package.json.

DO NOT create database migrations.

DO NOT create Prisma schema.

DO NOT create Express code.

DO NOT create Socket.IO code.

Instead provide a final summary containing:

- Number of screens analyzed
- Number of user flows identified
- Number of backend entities identified
- Number of API endpoints proposed
- Number of realtime events proposed
- Number of unresolved business questions
- Any mismatch between the UI and the confirmed requirements

The goal of this phase is:

UNDERSTAND FIRST.

DESIGN SECOND.

IMPLEMENT THIRD.

Do not skip the analysis phase.


# PHASE 1 REVIEW — IMPORTANT

The UI analysis has been completed and consolidated into:

/all.md

Before implementing any backend code, perform a REVIEW of the generated analysis.

Read the entire /all.md file.

Do NOT implement the backend yet.

Do NOT create the database yet.

Do NOT create Prisma schema yet.

Do NOT install backend dependencies yet.

Your task is to review the analysis against the ORIGINAL confirmed product requirements.

==================================================
AUTHORITATIVE BUSINESS REQUIREMENTS
==================================================

The original client requirements are authoritative.

If the UI conflicts with the confirmed business requirements, DO NOT silently follow the UI.

Instead:

1. Identify the conflict.
2. Document it.
3. Use the confirmed business requirement as the backend business rule.
4. Mark the UI element that must eventually be corrected.

==================================================
CRITICAL COIN RULES
==================================================

Initial user balance:

500 Coins

Game entry:

500 Coins

1st place:

1000 Coins

2nd place:

500 Coins

3rd place:

0 Coins

4th place:

0 Coins

Rewarded Advertisement:

500 Coins

Rewarded Ad eligibility:

ONLY when wallet balance == 0

These rules MUST NOT be changed based on values shown in UI mockups.

==================================================
CRITICAL GAME RULES
==================================================

Exactly 4 players per game.

Each user selects exactly 2 football players.

Total selections:

8 unique football players.

Draft format:

Snake Draft

Round 1:

P1 → P2 → P3 → P4

Round 2:

P4 → P3 → P2 → P1

Each turn:

35 seconds

If timer expires:

Backend automatically selects an available player.

Selected football players are UNIQUE inside the game room.

==================================================
SCORING
==================================================

Goal:
+40

Assist:
+20

Big Chance Created:
+5

Successful Pass:
+1

Failed Pass:
-1

Tackle:
+3

Yellow Card:
-5

Red Card:
-20

Defender Clean Sheet:
+20

Goalkeeper Save:
+10

==================================================
GLOBAL RANKING
==================================================

1st:
+3 RP

2nd:
+1 RP

3rd:
0 RP

4th:
-1 RP

Ranking resets at the end of each football season.

==================================================
SUPPORTED COMPETITIONS
==================================================

Only:

Premier League
La Liga
Saudi Pro League
UEFA Champions League
AFC Champions League

==================================================
IMPORTANT REVIEW TASK
==================================================

Review /all.md and find every conflict between:

UI
vs
confirmed business requirements.

At minimum verify:

1. Final Results rewards
2. Rewarded Ad eligibility
3. Game entry fee
4. Initial Coins
5. Ranking points
6. Draft rules
7. Scoring rules
8. Supported competitions

==================================================
DO NOT IMPLEMENT YET
==================================================

After reviewing /all.md, update the documentation only.

Create:

/review.md

The file must contain:

# UFL Backend Analysis Review

## 1. Confirmed Requirements

List the final authoritative rules.

## 2. UI Conflicts

For every conflict:

- UI currently says
- Business requirement says
- Final backend rule
- UI correction required

## 3. Missing Requirements

List anything required by the backend that is not represented clearly in the UI.

## 4. Dangerous Assumptions

List assumptions made by the previous analysis that should NOT yet be implemented.

## 5. Open Business Questions

List only questions that genuinely require a product decision.

## 6. Recommended Final Domain Model Changes

List any changes required to the previous domain model.

## 7. Recommended API Changes

List any changes required to the previous API contract.

## 8. Recommended Realtime Changes

List any changes required to the previous Socket.IO contract.

==================================================
FINAL RULE
==================================================

DO NOT START BACKEND IMPLEMENTATION.

Only perform the review and create /review.md.

When finished, report:

"PHASE 1 REVIEW COMPLETE"

and summarize the critical issues found.

# PHASE 2 — FINALIZE BUSINESS RULES

The UI analysis and review are complete.

Read:

/docs/all.md
/review.md

The product owner has now clarified the previously unresolved business questions.

IMPORTANT:

Do NOT implement the backend yet.

Do NOT create:

- package.json
- Express server
- PostgreSQL database
- Prisma schema
- migrations
- controllers
- services
- Socket.IO
- Redis
- workers
- API-Football integration

Your task is ONLY to finalize the business rules and create:

/business-decisions.md

==================================================
OWNER CONFIRMED DECISIONS
==================================================

## 1. MID-MATCH JOINING

Users ARE allowed to join a game while the real-world football match is already LIVE.

A user joining late:

- Can join the game if the game is still accepting players.
- Pays the normal 500 Coins entry fee.
- Completes their draft/selection using currently available football players.
- Receives FULL MATCH fantasy points for their selected players, including events that happened before they joined.

Do NOT reduce points based on the user's join time.

==================================================
## 2. GAME ROOM CAPACITY

A game requires exactly 4 users.

If the real-world football match starts and the game has fewer than 4 users:

- Cancel the game.
- Refund the 500 Coins entry fee to every participant.
- Do not calculate fantasy rankings.
- Do not distribute winner rewards.
- Mark the game as CANCELLED.

Refund must be idempotent.

==================================================
## 3. MATCH CANCELLATION / POSTPONEMENT

If the football fixture is cancelled or postponed in a way that prevents the fantasy game from being completed:

- Cancel the related game.
- Refund every participant's 500 Coins.
- Do not distribute winner rewards.
- Do not modify global ranking points.
- Notify affected users.

If a match is temporarily suspended but will continue:

- Keep the fantasy game active.
- Resume processing when the real-world match resumes.

==================================================
## 4. CLEAN SHEET

Use the following simple fantasy rule:

A defender receives +20 Clean Sheet points when:

- The player played at least 60 minutes.
- The team did not concede while the player was on the pitch.

Examples:

- Player plays 70 minutes, team concedes after substitution:
  → Eligible.

- Player plays 55 minutes and team keeps clean sheet:
  → Not eligible.

- Player enters at minute 70 and team keeps clean sheet:
  → Not eligible.

The backend should calculate this from reliable match/player event data.

==================================================
## 5. BIG CHANCE CREATED

Do NOT assume:

API-Football `passes.key`

equals:

Big Chance Created.

`passes.key` represents Key Passes and must NOT automatically be mapped to Big Chance Created.

The backend must use the provider statistic that actually represents Big Chance Created if API-Football exposes it.

If the provider does not expose a reliable Big Chance Created statistic:

- Do not silently substitute Key Passes.
- Mark the statistic as unavailable.
- Do not award the +5 points for unsupported data.

Keep this mapping isolated inside the FootballProvider/scoring data normalization layer so it can be changed later without modifying domain logic.

==================================================
## 6. TIE BREAKING

Use deterministic tie-breaking.

Primary ranking:

1. Total Fantasy Points

If equal:

2. Goals scored by selected players

If still equal:

3. Assists by selected players

If still equal:

4. Deterministic stable tie-breaker based on participant/game IDs.

Do NOT split coin prizes.

Every final position has exactly one winner.

Rewards remain:

1st = 1000 Coins
2nd = 500 Coins
3rd = 0 Coins
4th = 0 Coins

Global RP:

1st = +3
2nd = +1
3rd = 0
4th = -1

==================================================
## 7. FOOTBALL DATA CORRECTIONS

Football-provider statistics may be corrected after a match.

The backend should support a controlled correction window.

Before final settlement:

- Recalculate affected fantasy points.
- Update rankings.
- Do not duplicate wallet transactions.

After final settlement:

- Treat the game as FINALIZED.
- Do not automatically reverse wallet rewards because of late provider corrections.

The correction/finalization mechanism must be designed so wallet rewards remain idempotent.

==================================================
## 8. GAME LIFECYCLE

Use this conceptual lifecycle:

WAITING
↓
DRAFTING
↓
LIVE
↓
FINISHED

Cancellation path:

WAITING / DRAFTING / LIVE
↓
CANCELLED

Rules:

- A game requires 4 users before the real-world fixture begins.
- If 4 users are present, the game can proceed.
- Users may join while the real-world match is LIVE if the game is still accepting players.
- A newly joined user must complete their draft before receiving gameplay scoring.
- A game becomes FINISHED after the real-world fixture is complete and scoring is finalized.

Do not allow new users to join after the game has been finalized.

==================================================
## 9. DRAFT TIMEOUT

Draft turns last exactly 35 seconds.

When a turn expires:

- Backend automatically selects the highest-ranked available football player.
- Emit a realtime `game:auto-pick` event.
- Include:

isAutoPick: true

reason: "TURN_TIMEOUT"

The player ranking used for auto-pick must be deterministic.

If multiple players have the same ranking:

- Use a deterministic secondary ordering.
- Player ID can be used as the final stable tie-breaker.

If no player is available:

- Mark the turn as failed.
- Move the game into an error/recovery state.
- Do not silently select an already-taken player.

==================================================
## 10. WALLET SAFETY

Coins are virtual in-game currency.

They are NOT real money.

However, wallet operations must still be transaction-safe.

The following operations MUST be atomic and idempotent:

### Game Join

- Verify balance >= 500.
- Deduct exactly 500 Coins.
- Create the participant.
- Prevent duplicate participation.
- Prevent double deduction from repeated requests.

### Game Cancellation

- Refund exactly 500 Coins to each participant.
- Refund only once.
- Never create duplicate refunds.

### Game Settlement

- Award exactly one final reward per participant.
- Rewards:

1000 / 500 / 0 / 0

- Apply RP exactly once.

### Rewarded Advertisement

- User must have balance exactly 0.
- Award exactly 500 Coins.
- A duplicated request/event must not award multiple times for the same ad completion.

Use database transactions and idempotency mechanisms where appropriate.

Do NOT implement wallet logic as simple non-transactional request handlers.

==================================================
## 11. REWARDED AD

Eligibility:

wallet.balance == 0

If balance > 0:

Reject claim.

Reward:

+500 Coins

The backend is authoritative.

The UI may hide/disable the button, but the backend must always enforce eligibility.

==================================================
## 12. SUPPORTED COMPETITIONS

Only expose:

- EPL
- La Liga
- Saudi Pro League
- UEFA Champions League
- AFC Champions League

Do not expose unsupported competitions.

Football-provider synchronization must filter unsupported competitions.

==================================================
## 13. COIN ECONOMY

Initial registration:

+500 Coins

Game entry:

-500 Coins

Final rewards:

1st: +1000
2nd: +500
3rd: +0
4th: +0

Rewarded advertisement:

+500

==================================================
## 14. GLOBAL RANKING

Final game RP:

1st: +3
2nd: +1
3rd: 0
4th: -1

Ranking resets to 0 at the beginning of every football season.

==================================================
## 15. SCORING

Goal: +40
Assist: +20
Big Chance Created: +5
Successful Pass: +1
Failed Pass: -1
Tackle: +3
Yellow Card: -5
Red Card: -20
Defender Clean Sheet: +20
Goalkeeper Save: +10

The scoring engine must depend on normalized football statistics, NOT raw API-Football JSON.

==================================================
## 16. API / ARCHITECTURE PRINCIPLES

The backend will eventually use:

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma
- Socket.IO

Football data must use an abstraction:

FootballProvider

The domain must NOT depend directly on API-Football response structures.

==================================================
## 17. FINAL DECISION DOCUMENT

Create:

/business-decisions.md

Use this structure:

# UFL Final Business Decisions

## 1. Game Joining
...

## 2. Game Capacity
...

## 3. Match Cancellation
...

## 4. Clean Sheet
...

## 5. Big Chance Created
...

## 6. Tie Breaking
...

## 7. Football Data Corrections
...

## 8. Game Lifecycle
...

## 9. Draft Timeout
...

## 10. Wallet Safety
...

## 11. Rewarded Advertisement
...

## 12. Supported Competitions
...

## 13. Coin Economy
...

## 14. Global Ranking
...

## 15. Scoring
...

## 16. Architecture Principles
...

==================================================
IMPORTANT

This document is now the authoritative business decision document for the future backend implementation.

Do NOT implement anything yet.

Do NOT modify /ui.

Do NOT modify /docs.

Only create:

/business-decisions.md

When finished, report exactly:

"PHASE 2 BUSINESS RULES COMPLETE"

Then provide a short summary of what was finalized.

# PHASE 3 DATABASE ORM DECISION

The final backend database is:

MySQL

The final ORM is:

Sequelize

The final backend stack is:

- Node.js
- TypeScript
- Express.js
- MySQL
- Sequelize
- Socket.IO
- Redis

IMPORTANT:

Sequelize is now the authoritative ORM choice for this project.

Do NOT use Prisma.

Do NOT create any backend code yet.

Do NOT install dependencies yet.

Do NOT create package.json yet.

Do NOT create database migrations yet.

Do NOT create Sequelize models yet.

This is a documentation correction only.

Update all project documentation that references:

PostgreSQL
Prisma

and replace the architecture/database references with:

MySQL
Sequelize

The database connection configuration is:

DB_NAME=ufl
DB_USER=root
DB_HOST=localhost
DB_PORT=3306

Do NOT expose or commit database passwords in documentation or source code.

The actual password must remain in environment variables.

Create/update only the documentation necessary to make this technology decision consistent across the project.

Do NOT modify /ui.

Do NOT implement the backend.

When finished report exactly:

"ORM DECISION UPDATED"

Then provide a short summary of the files changed.





docs/10-final-domain-model.md
docs/11-final-architecture.md
docs/12-concurrency-and-transactions.md
docs/13-final-api-map.md









# PHASE 4 — BACKEND PROJECT INITIALIZATION

The analysis, business decisions, domain model, architecture, concurrency design, and API map are complete.

The final technology stack is:

- Node.js
- TypeScript
- Express.js
- MySQL
- Sequelize
- Socket.IO
- Redis

Read the finalized documentation before starting:

/docs/10-final-domain-model.md
/docs/11-final-architecture.md
/docs/12-concurrency-and-transactions.md
/docs/13-final-api-map.md
/business-decisions.md

==================================================
TASK
==================================================

Now initialize the backend project only.

Create a clean backend structure using:

Node.js
TypeScript
Express.js
Sequelize
MySQL

==================================================
CREATE
==================================================

Create:

package.json

tsconfig.json

.env.example

.gitignore

src/

with a clean structure suitable for the architecture already documented.

The structure should prepare for:

- config
- models
- migrations
- seeders
- routes
- controllers
- services
- repositories
- middleware
- validators
- domain
- infrastructure
- utils

Do NOT create business logic yet.

Do NOT create database models yet.

Do NOT create migrations yet.

Do NOT create API endpoints yet.

Do NOT implement Socket.IO yet.

Do NOT implement Redis yet.

Do NOT implement API-Football yet.

==================================================
DEPENDENCIES
==================================================

Install only the dependencies required for the basic project foundation.

Use TypeScript and Express.

Use Sequelize with MySQL.

Use appropriate development tooling for TypeScript.

Do not install unnecessary packages.

==================================================
ENVIRONMENT
==================================================

Use environment variables.

Create:

.env.example

with:

NODE_ENV=development

DB_NAME=ufl
DB_USER=root
DB_PASS=
DB_HOST=localhost
DB_PORT=3306

Never write the real database password into source code or .env.example.

If a local .env file is needed, create it only if appropriate and NEVER commit it.

==================================================
BASIC SERVER
==================================================

Create the minimum Express application required to verify that the backend starts correctly.

Add:

GET /health

Response:

{
  "status": "ok"
}

The endpoint is only a health check.

Do not create any business endpoints.

==================================================
DATABASE
==================================================

Configure Sequelize for MySQL.

Do NOT create tables yet.

Do NOT run migrations yet.

The application should be structured so database connection initialization can be added cleanly.

==================================================
QUALITY
==================================================

Use strict TypeScript configuration.

Use clean naming.

Use async/await.

Keep configuration separated from application initialization.

Do not put business logic in server.ts/app.ts.

==================================================
FINAL CHECK
==================================================

After implementation:

1. Install dependencies.
2. Verify TypeScript compilation.
3. Start the server.
4. Verify GET /health works.
5. Verify no database tables were created.
6. Verify no real credentials are committed.
7. Verify .gitignore protects .env.

==================================================
DO NOT DO
==================================================

Do NOT:

- create Sequelize models
- create migrations
- create controllers
- create business services
- create wallet logic
- create game logic
- create draft logic
- create scoring logic
- create Socket.IO
- create Redis
- create API-Football integration
- modify /ui
- modify business decisions

This phase is ONLY project initialization.

When complete report exactly:

"PHASE 4 BACKEND INITIALIZATION COMPLETE"

Then summarize:

- files created
- dependencies installed
- TypeScript status
- server status
- /health status
- database tables created (must be zero)


# PHASE 5 — SEQUELIZE DATABASE MODELS

The backend project has been initialized successfully.

The health endpoint works.

Now implement ONLY the database layer.

Read carefully:

/docs/10-final-domain-model.md
/docs/11-final-architecture.md
/docs/12-concurrency-and-transactions.md
/business-decisions.md

==================================================
TASK
==================================================

Implement the MySQL database schema using Sequelize.

Create Sequelize models and migrations according to the finalized domain model.

The database is:

MySQL

The ORM is:

Sequelize

Use Sequelize migrations.

Do NOT use Prisma.

==================================================
IMPORTANT
==================================================

Do NOT implement:

- Controllers
- API routes
- Game services
- Wallet services
- Draft services
- Scoring engine
- Socket.IO
- Redis
- API-Football
- Background workers

Only implement the database layer.

==================================================
MODELS
==================================================

Implement ONLY the entities that are actually required by the finalized domain model.

Do NOT blindly create every example entity from previous documents.

For every model ensure:

- Correct primary key
- Correct data types
- Required fields
- Nullable fields
- Unique constraints
- Foreign keys
- Indexes
- Enum/status fields where appropriate
- Created/updated timestamps
- Appropriate cascade/restrict behavior

==================================================
RELATIONSHIPS
==================================================

Implement all documented relationships.

Examples may include:

User → Wallet

User → WalletTransaction

User → GameParticipant

Game → Fixture

Game → GameParticipant

GameParticipant → PlayerSelection

Game → DraftTurn

Fixture → Competition

Fixture → Team

Fixture → FixtureEvent

FootballPlayer → PlayerMatchStatistic

GameParticipant → GameScore

Season → GlobalRanking

Use the finalized domain documentation as the source of truth.

Do NOT invent unnecessary relationships.

==================================================
WALLET
==================================================

The wallet schema must support:

WELCOME_BONUS
GAME_ENTRY
GAME_REFUND
GAME_REWARD
REWARDED_AD

Wallet transactions must support idempotency.

There must be a database-level mechanism preventing duplicate financial-like virtual currency operations.

Remember:

Coins are virtual.

But wallet accounting must be atomic and auditable.

==================================================
GAME
==================================================

The Game model must support:

WAITING
DRAFTING
LIVE
FINISHED
CANCELLED

A Game belongs to exactly one football Fixture.

A user cannot participate twice in the same Game.

The schema must enforce this with a unique constraint.

==================================================
DRAFT
==================================================

The schema must support:

- Snake Draft
- 4 participants
- 2 selections per participant
- 8 total unique player selections
- 35-second turns
- Manual selection
- Automatic selection
- Turn timeout
- Draft rounds
- Turn ordering

Ensure the database prevents two participants from selecting the same football player in the same Game.

==================================================
FOOTBALL DATA
==================================================

Football provider data must be normalized.

Do NOT store raw API-Football JSON as the primary domain representation.

Support provider identification using fields such as:

provider
providerId

The provider ID must NOT be the primary database ID.

Supported competitions:

EPL
LALIGA
SPL
UCL
ACL

The schema should allow future football providers without redesigning the domain model.

==================================================
SCORING
==================================================

Support normalized player match statistics.

Support fantasy scoring for:

Goal
Assist
Big Chance Created
Successful Pass
Failed Pass
Tackle
Yellow Card
Red Card
Clean Sheet
Goalkeeper Save

The database should support recalculation before final settlement.

Do NOT hard-code scoring calculations inside Sequelize models.

==================================================
RANKING
==================================================

Support:

Game rank:

1
2
3
4

Global RP:

+3
+1
0
-1

Support historical seasons.

Do not delete old ranking history when a new season starts.

==================================================
SEASON
==================================================

Support:

- Season name
- Start date
- End date
- Active/current status

Historical seasons must remain available.

==================================================
NOTIFICATIONS
==================================================

Create the notification model only if it exists in the finalized domain model.

It should support:

- User
- Type
- Title
- Body
- Read/unread state
- Created timestamp

==================================================
INDEXING
==================================================

Add indexes for frequently queried fields.

At minimum consider:

User email / username

Wallet user ID

WalletTransaction user ID

WalletTransaction idempotency key

Game fixture ID

Game status

GameParticipant game ID

GameParticipant user ID

PlayerSelection game ID

PlayerSelection football player ID

Fixture competition ID

Fixture kickoff time

Fixture status

Global ranking season ID

Notification user ID

Notification read status

Do not add indexes blindly.

Only add indexes justified by expected queries.

==================================================
MIGRATIONS
==================================================

Create Sequelize migrations for all models.

Do NOT create tables manually.

Do NOT modify the database using raw SQL outside the migration system unless absolutely necessary.

Migration order must respect foreign keys.

==================================================
SEQUELIZE CONFIGURATION
==================================================

Use environment variables:

DB_NAME
DB_USER
DB_PASS
DB_HOST
DB_PORT

Do not hard-code credentials.

==================================================
SEED DATA
==================================================

Do NOT create production seed data.

If development seed data is useful, create it separately and clearly label it as development-only.

Do NOT create fake football matches unless explicitly required.

==================================================
VALIDATION
==================================================

After implementation:

1. Run migrations against the local MySQL database.
2. Verify all tables are created.
3. Verify foreign keys.
4. Verify unique constraints.
5. Verify indexes.
6. Verify Sequelize can connect.
7. Verify TypeScript compilation.
8. Verify the Express /health endpoint still works.

Do NOT implement business services yet.

==================================================
FINAL CHECK

Confirm:

- Sequelize is used.
- MySQL is used.
- No Prisma exists.
- Models match the finalized domain documentation.
- Migrations exist.
- Foreign keys work.
- Unique constraints work.
- Wallet idempotency structure exists.
- Game participant uniqueness exists.
- Player selection uniqueness exists.
- Historical seasons are preserved.
- No business logic was placed inside models.
- No API endpoints were implemented except /health.
- No Socket.IO was implemented.
- No Redis was implemented.
- No API-Football integration was implemented.

When complete report exactly:

"PHASE 5 DATABASE LAYER COMPLETE"

Then summarize:

- Number of models
- Number of migrations
- Main relationships
- Main unique constraints
- Main indexes
- Migration status




# PHASE 6 — AUTHENTICATION & WALLET

The database layer is complete.

Read before implementation:

/docs/10-final-domain-model.md
/docs/11-final-architecture.md
/docs/12-concurrency-and-transactions.md
/docs/13-final-api-map.md
/business-decisions.md

The final stack is:

- Node.js
- TypeScript
- Express.js
- MySQL
- Sequelize
- Socket.IO
- Redis

==================================================
TASK
==================================================

Implement ONLY:

1. Authentication
2. User management
3. Wallet
4. Wallet transaction ledger

Do NOT implement:

- Games
- Draft
- Scoring
- Football provider
- Match synchronization
- Socket.IO
- Redis
- Ranking
- Notifications

==================================================
AUTHENTICATION
==================================================

Implement:

POST /api/v1/auth/register

POST /api/v1/auth/login

GET /api/v1/me

Use JWT authentication.

Registration must:

- Validate input.
- Prevent duplicate email.
- Hash passwords securely.
- Create the User.
- Create the User Wallet.
- Grant exactly 500 Coins as the welcome bonus.
- Create a WELCOME_BONUS wallet transaction.
- All registration + wallet initialization must happen inside ONE database transaction.

If any operation fails:

- User creation must rollback.
- Wallet creation must rollback.
- Welcome bonus must rollback.

==================================================
LOGIN
==================================================

Login must:

- Validate credentials.
- Compare hashed password.
- Return JWT.
- Return appropriate user information.

Do not expose:

- password hash
- sensitive credentials

==================================================
JWT
==================================================

Implement:

- JWT generation
- JWT verification middleware
- Authenticated request user context

Protect:

GET /api/v1/me

==================================================
USER PROFILE
==================================================

GET /api/v1/me

Return only data required by the UI.

Include appropriate information such as:

- id
- username
- email
- avatar/profile information if supported by the model
- wallet balance
- global RP / ranking information if already available from the existing model

Do not expose database internals unnecessarily.

==================================================
WALLET
==================================================

Implement:

GET /api/v1/wallet

GET /api/v1/wallet/transactions

The wallet response should include:

- current balance
- eligibility for rewarded advertisement
- recent transactions if appropriate

Rewarded ad eligibility:

balance === 0

==================================================
WALLET TRANSACTION SAFETY
==================================================

Wallet operations must be transactional.

Create a reusable wallet service responsible for balance changes.

Do NOT modify wallet.balance with simple non-transactional arithmetic.

Use database transactions and row locking where appropriate.

Every balance-changing operation must create a WalletTransaction record.

For this phase implement:

WELCOME_BONUS

Only the registration flow creates it.

==================================================
IDEMPOTENCY
==================================================

The welcome bonus must never be granted twice.

Use the wallet transaction idempotency mechanism already defined by the database model.

A duplicate registration request must not create duplicate accounts or duplicate welcome bonuses.

==================================================
VALIDATION
==================================================

Validate:

- email
- username
- password
- required fields

Return consistent API errors.

Do not leak sensitive information.

==================================================
ERROR FORMAT
==================================================

Use a consistent JSON error structure.

Example:

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}

Do not expose stack traces in production responses.

==================================================
SUCCESS FORMAT
==================================================

Use a consistent response structure where appropriate.

Example:

{
  "success": true,
  "data": {}
}

Keep the API response format consistent.

==================================================
ARCHITECTURE

Follow the documented architecture.

Do NOT put business logic inside:

- routes
- controllers
- Sequelize models

Use appropriate:

- controllers
- services
- repositories where required
- validators
- middleware

The wallet business logic must live in a service.

==================================================
SECURITY

Implement basic security best practices:

- Password hashing
- JWT verification
- Input validation
- No password hash in responses
- No database credentials in source code
- Environment variables for secrets

Do not add unnecessary authentication complexity.

==================================================
TESTING

At minimum verify:

1. Register succeeds.
2. User is created.
3. Wallet is created.
4. Balance is exactly 500.
5. WELCOME_BONUS transaction exists.
6. Duplicate email is rejected.
7. Login succeeds.
8. Wrong password is rejected.
9. JWT-protected /me works.
10. Unauthenticated /me is rejected.
11. Wallet endpoint returns 500 for a new user.
12. Wallet transactions endpoint returns the welcome bonus.
13. TypeScript compilation succeeds.
14. Existing /health endpoint still works.

Do not create Game logic.

Do not create Draft logic.

Do not create Scoring logic.

When complete report exactly:

"PHASE 6 AUTH & WALLET COMPLETE"

Then summarize:

- Authentication endpoints
- Wallet endpoints
- Security measures
- Transaction behavior
- Tests performed
- Any issues








# PHASE 7 — FOOTBALL DATA LAYER

The Authentication and Wallet phases are complete.

Now implement ONLY the football data layer.

Read:

/docs/10-final-domain-model.md
/docs/11-final-architecture.md
/docs/13-final-api-map.md
/business-decisions.md

==================================================
TASK
==================================================

Implement the football data architecture using the FootballProvider abstraction.

The application MUST NOT depend directly on API-Football response formats.

Create a normalized internal football data model.

The final supported competitions are ONLY:

- EPL
- LALIGA
- SPL
- UCL
- ACL

No other competitions may be exposed by the application.

==================================================
FOOTBALL PROVIDER
==================================================

Create a FootballProvider interface/contract.

It should support the operations required by the application, including:

- getCompetitions()
- getFixtures()
- getFixture()
- getFixtureEvents()
- getLineups()
- getPlayerStatistics()

Use normalized DTOs.

The domain layer must never receive raw API-Football JSON.

==================================================
API-FOOTBALL
==================================================

There is currently NO API-Football API key.

Therefore:

DO NOT make real API-Football requests.

Create the provider abstraction and an ApiFootballProvider structure that is ready for future implementation.

The provider must read credentials from environment variables.

Add to .env.example:

API_FOOTBALL_BASE_URL=
API_FOOTBALL_KEY=

Never hard-code the API key.

==================================================
FOOTBALL ENTITIES
==================================================

Implement only the football models/entities required by the finalized domain model.

They should support:

Competition
Team
FootballPlayer
Fixture
FixtureEvent
PlayerMatchStatistic

Use providerId/provider identifiers where required.

The internal database primary key must remain independent from the provider ID.

==================================================
SUPPORTED COMPETITIONS
==================================================

The backend must enforce the supported competition whitelist.

Only:

EPL
LALIGA
SPL
UCL
ACL

may be stored/exposed as supported competitions.

Create a single centralized definition for this whitelist.

Do not duplicate the values throughout the codebase.

==================================================
FIXTURES
==================================================

The football layer must support:

- Upcoming fixtures
- Live fixtures
- Finished fixtures
- Cancelled/postponed fixtures

Store:

- kickoff time
- status
- home team
- away team
- competition
- provider ID

Add appropriate indexes for fixture discovery.

==================================================
FIXTURE EVENTS
==================================================

Support normalized events such as:

- Goal
- Assist
- Yellow Card
- Red Card
- Substitution
- Other provider events required by scoring

Do not calculate fantasy points here.

Football events describe what happened in the real-world match.

Fantasy scoring will be implemented later.

==================================================
PLAYER STATISTICS
==================================================

Support normalized player match statistics required by the scoring engine:

- Goals
- Assists
- Key passes
- Passes attempted/completed
- Tackles
- Yellow cards
- Red cards
- Saves
- Minutes played
- Goals conceded
- Big Chance Created ONLY if the provider explicitly supplies it

IMPORTANT:

NEVER map:

passes.key

to:

Big Chance Created

unless the provider explicitly identifies it as Big Chance Created.

If unavailable, represent the statistic as unavailable/null.

==================================================
NORMALIZATION
==================================================

Create a clear normalization boundary:

Provider Response
        ↓
FootballProvider
        ↓
Normalized DTO
        ↓
Application Services
        ↓
Sequelize Models

Raw provider response formats must NOT leak into domain services.

==================================================
API ENDPOINTS
==================================================

Implement only football read endpoints required by the UI/API contract.

Examples:

GET /api/v1/competitions

GET /api/v1/matches

GET /api/v1/matches/:id

Do not invent unnecessary endpoints.

Use the finalized API contract as the source of truth.

Because there is currently no API key:

The endpoints may return an appropriate "football data unavailable/not configured" response.

Do NOT fabricate real football data.

==================================================
SYNCHRONIZATION
==================================================

Do NOT implement background synchronization yet.

Do NOT implement cron jobs yet.

Do NOT implement Redis jobs yet.

Do NOT implement scoring yet.

The provider layer must simply be ready for the future synchronization worker.

==================================================
TESTING
==================================================

Test:

1. FootballProvider interface exists.
2. ApiFootballProvider does not require a hard-coded key.
3. Missing API key is handled cleanly.
4. Unsupported competitions are rejected/filtered.
5. Normalized DTOs are independent from provider JSON.
6. No raw API-Football response reaches controllers/domain services.
7. Football endpoints follow the API response format.
8. Existing Auth and Wallet functionality still works.
9. /health still works.
10. TypeScript compilation succeeds.

Do NOT:

- implement real API-Football calls
- implement scoring
- implement game creation
- implement game joining
- implement draft
- implement Socket.IO
- implement Redis
- modify /ui

When complete report exactly:

"PHASE 7 FOOTBALL DATA LAYER COMPLETE"

Then summarize:

- Football models
- Provider interface
- Normalized DTOs
- Football endpoints
- Supported competition handling
- Tests performed
- Any issues







# PHASE 8 — GAME ROOMS, JOINING & CANCELLATION

Authentication, Wallet, and Football Data Layer are complete.

Now implement the Game Room lifecycle and joining system.

Read:

/docs/10-final-domain-model.md
/docs/11-final-architecture.md
/docs/12-concurrency-and-transactions.md
/docs/13-final-api-map.md
/business-decisions.md

==================================================
SCOPE
==================================================

Implement ONLY:

- Game creation
- Game room discovery
- Game joining
- Participant management
- Entry fee deduction
- Room capacity
- Live-match joining
- Game cancellation
- Entry fee refunds
- Cancellation notifications preparation
- Game lifecycle state transitions related to this phase

Do NOT implement:

- Draft
- Player selection
- Fantasy scoring
- Ranking settlement
- Socket.IO
- Redis
- Background workers
- API-Football synchronization

==================================================
GAME STATES
==================================================

Supported states:

WAITING
DRAFTING
LIVE
FINISHED
CANCELLED

For this phase:

WAITING
→ room accepts players

DRAFTING
→ reserved for the next phase

LIVE
→ match is currently live and room is active

FINISHED
→ no new users may join

CANCELLED
→ no new users may join

==================================================
GAME CREATION
==================================================

Implement the game creation flow according to the finalized domain model.

A Game belongs to exactly one Fixture.

Do not create duplicate active game rooms for the same fixture unless the finalized domain model explicitly supports multiple rooms.

If multiple rooms are supported, follow the documented room model.

Validate that the fixture belongs to one of the supported competitions.

Do not allow games for unsupported competitions.

==================================================
GAME DISCOVERY
==================================================

Implement the API required by the UI to discover available games/matches.

The response should provide the information required by the UI, such as:

- Game ID
- Fixture ID
- Competition
- Home team
- Away team
- Kickoff time
- Game status
- Current participant count
- Maximum participant count
- Entry fee
- Whether the user has already joined

Do not expose unnecessary database fields.

==================================================
JOIN GAME
==================================================

Implement:

POST /api/v1/games/:gameId/join

The authenticated user:

1. Must have wallet.balance >= 500.
2. Must not already be a participant in the game.
3. The game must not be FINISHED.
4. The game must not be CANCELLED.
5. The room must not already contain 4 users.

Then atomically:

- Lock the wallet row.
- Re-check wallet balance.
- Deduct exactly 500 Coins.
- Create GameParticipant.
- Create GAME_ENTRY WalletTransaction.

All operations MUST happen inside ONE database transaction.

If anything fails:

- Wallet deduction rolls back.
- Participant creation rolls back.
- Wallet transaction rolls back.

==================================================
CONCURRENCY
==================================================

The join operation must be safe when multiple users attempt to join simultaneously.

Example:

Only one available slot remains.

Two users send JOIN at the same time.

The backend MUST guarantee:

- Only one user gets the final slot.
- No fifth participant is created.
- No user is charged without receiving a valid participant record.
- No participant is created without charging the entry fee.

Use database transactions and appropriate row-level locking.

==================================================
LIVE MATCH JOINING
==================================================

IMPORTANT:

Users ARE allowed to join while the real-world football fixture is LIVE.

If:

fixture.status = LIVE

and:

game.status = WAITING or LIVE

and:

room has fewer than 4 participants

then joining is allowed.

The user still pays:

500 Coins

The user still completes the normal draft/selection process.

The user receives FULL MATCH fantasy points for their selected players.

Events that happened before the user joined MUST count.

Do NOT apply any join-time penalty.

==================================================
ROOM CAPACITY
==================================================

Maximum participants:

4

Never allow:

participantCount > 4

Enforce this at the application level AND through transaction/locking logic.

If the room already has 4 participants:

Reject the join request.

Use an appropriate error code such as:

GAME_FULL

==================================================
JOIN ERROR CASES
==================================================

Handle at minimum:

INSUFFICIENT_FUNDS
GAME_NOT_FOUND
GAME_FULL
ALREADY_JOINED
GAME_FINISHED
GAME_CANCELLED
UNSUPPORTED_COMPETITION
INVALID_GAME_STATE

Use the project's standard error response format.

==================================================
CANCELLATION — UNFILLED ROOM
==================================================

When the real-world fixture starts:

If Game participant count < 4:

- Set Game status = CANCELLED.
- Refund exactly 500 Coins to every participant.
- Do not calculate fantasy rankings.
- Do not distribute winner rewards.
- Do not change Global RP.

Refund each participant exactly once.

==================================================
CANCELLATION — FIXTURE CANCELLED / POSTPONED
==================================================

If the real-world fixture is cancelled or postponed in a way that prevents fantasy completion:

- Set Game status = CANCELLED.
- Refund exactly 500 Coins to every participant.
- Do not distribute rewards.
- Do not change RP.

If the fixture is temporarily suspended but scheduled to resume:

- Do NOT cancel the game.
- Keep the game active.
- Allow the football layer to resume processing later.

==================================================
REFUND SAFETY
==================================================

Refunds MUST be:

- Atomic
- Idempotent
- Auditable

Use the WalletTransaction idempotency mechanism.

A participant must never receive the same GAME_REFUND twice.

If cancellation is triggered twice:

The second execution must produce no additional refund.

==================================================
CANCELLATION TRANSACTION
==================================================

Game cancellation and refunds must be handled safely.

For each participant:

- Lock wallet.
- Verify refund has not already been applied.
- Credit exactly 500 Coins.
- Create GAME_REFUND transaction.
- Mark/record the refund as completed.

The process must be safe if execution is interrupted.

Never partially refund a participant without a recoverable transaction state.

==================================================
API ENDPOINTS
==================================================

Implement only endpoints required by the finalized API contract.

At minimum, if present in the API contract:

GET /api/v1/games

GET /api/v1/games/:gameId

POST /api/v1/games/:gameId/join

Do NOT create unnecessary endpoints.

==================================================
GAME STATUS TRANSITIONS
==================================================

Implement a controlled state transition mechanism.

Valid examples:

WAITING → DRAFTING
WAITING → CANCELLED
DRAFTING → LIVE
DRAFTING → CANCELLED
LIVE → FINISHED
LIVE → CANCELLED

Do not allow arbitrary status changes.

For this phase, only implement transitions actually required now.

Draft-related transitions can remain prepared for the next phase.

==================================================
TRANSACTION BOUNDARIES
==================================================

Do NOT perform:

wallet deduction

participant creation

refund

game state mutation

as unrelated independent database operations.

Whenever they form one business operation, use one Sequelize transaction.

Use row locking where required.

==================================================
TESTING
==================================================

Test at minimum:

1. Create a game for a supported fixture.
2. Discover available game.
3. User joins successfully.
4. Exactly 500 Coins are deducted.
5. GAME_ENTRY transaction exists.
6. User cannot join the same game twice.
7. User with <500 Coins cannot join.
8. Fourth participant can join.
9. Fifth participant is rejected.
10. Two concurrent join attempts cannot create a fifth participant.
11. User can join while fixture is LIVE.
12. Live joining still charges 500 Coins.
13. Game with fewer than 4 users can be cancelled.
14. Cancellation refunds exactly 500 Coins.
15. Repeating cancellation does NOT refund twice.
16. Cancelled game cannot be joined.
17. Finished game cannot be joined.
18. Cancelled fixture refunds participants.
19. Suspended/resumable fixture does not trigger cancellation.
20. Existing Auth, Wallet, Football APIs still work.
21. TypeScript compilation succeeds.
22. /health still works.

==================================================
DO NOT IMPLEMENT
==================================================

Do NOT implement:

- Snake Draft
- Draft timer
- Auto-pick
- Player selection
- Fantasy scoring
- Global ranking
- Settlement
- Socket.IO
- Redis
- API-Football synchronization
- Background jobs

When complete report exactly:

"PHASE 8 GAME SYSTEM COMPLETE"

Then summarize:

- Game endpoints
- Join flow
- Concurrency strategy
- Cancellation flow
- Refund strategy
- Tests performed
- Any issues




# PHASE 9 — SNAKE DRAFT & REAL-TIME GAMEPLAY

The following phases are complete:

- Backend initialization
- Database layer
- Authentication
- Wallet
- Football data layer
- Game rooms
- Game joining
- Cancellation
- Refunds

Now implement the Snake Draft system.

Read:

/docs/10-final-domain-model.md
/docs/11-final-architecture.md
/docs/12-concurrency-and-transactions.md
/docs/13-final-api-map.md
/business-decisions.md

==================================================
SCOPE
==================================================

Implement ONLY:

- Draft initialization
- Draft turns
- Snake Draft ordering
- Player selection
- Player availability
- 35-second turn timer
- Server-side timeout
- Auto-pick
- Draft completion
- Socket.IO realtime draft events

Do NOT implement:

- Fantasy scoring
- Match event scoring
- Global ranking
- Final rewards
- Match settlement
- API-Football synchronization
- Redis workers

==================================================
DRAFT START
==================================================

A game can enter DRAFTING only when:

- Game exists.
- Game is not CANCELLED.
- Game has exactly 4 participants.

Initialize exactly:

8 draft turns.

Each participant receives exactly 2 selections.

==================================================
SNAKE ORDER
==================================================

The turn order MUST be:

Turn 1: P1
Turn 2: P2
Turn 3: P3
Turn 4: P4

Turn 5: P4
Turn 6: P3
Turn 7: P2
Turn 8: P1

Do NOT calculate this order from client input.

The backend generates and persists the turn order.

==================================================
TURN
==================================================

Each turn has:

- turn number
- participant
- round
- startedAt
- expiresAt
- status
- selected player if completed
- whether selection was automatic

Each turn duration:

35 seconds.

The server is the source of truth for time.

Do NOT trust client countdown timers.

==================================================
PLAYER SELECTION
==================================================

Implement an authenticated endpoint for selecting a football player.

The server MUST verify:

- Game exists.
- Game is in DRAFTING.
- Current turn belongs to authenticated participant.
- Turn has not expired.
- Player exists.
- Player is available.
- Player has not already been selected in this game.

If valid:

- Lock the relevant rows where required.
- Mark player as taken for this game.
- Create PlayerSelection.
- Complete current DraftTurn.
- Advance to the next turn.

All selection operations MUST be transactional.

==================================================
PLAYER UNIQUENESS
==================================================

A football player can be selected only once inside a game.

Two users attempting to select the same player concurrently:

Only one may succeed.

The other must receive:

PLAYER_ALREADY_TAKEN

Do not rely only on application-level checks.

Use database constraints and/or transaction locking.

==================================================
AUTO PICK
==================================================

If the current turn reaches expiresAt without a valid manual selection:

The backend automatically selects:

The highest-ranked available football player.

The ranking must use a deterministic player rating.

If two players have the same rating:

Sort by stable playerId.

Never select an already-selected player.

The auto-selection must happen exactly once.

==================================================
IMPORTANT AUTO-PICK SAFETY
==================================================

Two timeout handlers must never create two selections for the same turn.

If timeout processing runs twice:

Only the first execution may select a player.

The second execution must detect that the turn is already completed and do nothing.

Use transaction locking/idempotent state transitions.

==================================================
NO PLAYER AVAILABLE
==================================================

If no eligible football player remains:

Do NOT select a taken player.

Mark the turn as FAILED.

Move the game into a safe recovery state.

Do not silently continue with invalid data.

==================================================
DRAFT COMPLETION
==================================================

After the 8th successful selection:

- Mark draft as completed.
- Mark Game as LIVE if the real-world fixture is live.
- Otherwise use the appropriate documented game state.
- Store the draft completion timestamp.

All 8 selections must be unique.

Each participant must have exactly 2 players.

==================================================
REAL-TIME SOCKET.IO
==================================================

Implement Socket.IO for draft realtime updates.

The server must control the state.

Clients should receive events such as:

game:draft-start

game:draft-turn

game:player-selected

game:auto-pick

game:draft-completed

game:state

==================================================
EVENT PAYLOADS
==================================================

game:draft-start:

Include enough information for the UI to initialize the draft.

Example:

{
  "gameId": "...",
  "status": "DRAFTING",
  "currentTurn": 1,
  "expiresAt": "..."
}

game:draft-turn:

{
  "gameId": "...",
  "turnNumber": 3,
  "participantId": "...",
  "expiresAt": "..."
}

game:player-selected:

{
  "gameId": "...",
  "turnNumber": 3,
  "participantId": "...",
  "playerId": "...",
  "isAutoPick": false
}

game:auto-pick:

{
  "gameId": "...",
  "turnNumber": 3,
  "participantId": "...",
  "playerId": "...",
  "isAutoPick": true,
  "reason": "TURN_TIMEOUT"
}

game:draft-completed:

{
  "gameId": "...",
  "status": "LIVE"
}

Do not expose unnecessary internal database fields.

==================================================
SOCKET AUTHENTICATION
==================================================

Socket connections must be authenticated.

Use the same JWT authentication mechanism used by the REST API.

A user must only receive events for games they are participating in or otherwise authorized to observe.

Do not allow arbitrary users to subscribe to private game rooms.

==================================================
ROOMS
==================================================

Use Socket.IO rooms.

Conceptually:

game:{gameId}

When a participant joins the game realtime channel:

- Authenticate user.
- Verify game access.
- Join game:{gameId}.

Broadcast draft events only to the appropriate game room.

==================================================
SERVER AUTHORITY
==================================================

The Flutter client MUST NOT determine:

- Current turn
- Turn expiration
- Player availability
- Auto-pick player
- Draft completion
- Game state

The client only sends:

"select this player"

The backend decides whether the action is valid.

==================================================
TIMER IMPLEMENTATION
==================================================

The timer must be server-side.

Do NOT depend on:

setTimeout alone

inside a request handler.

The implementation must survive:

- Multiple requests
- Multiple server processes
- Process restarts

For this phase, implement the safest architecture possible using the currently available infrastructure.

If persistent background scheduling is required, structure the code so Redis/BullMQ can be introduced later.

Do NOT add Redis/BullMQ unless required by the finalized architecture and project dependencies.

The database remains the source of truth.

==================================================
API
==================================================

Implement only the draft endpoints required by the API contract.

At minimum:

GET /api/v1/games/:gameId/draft

POST /api/v1/games/:gameId/draft/select

Do not create unnecessary endpoints.

==================================================
DRAFT RESPONSE
==================================================

GET draft must provide the UI with enough information to render:

- Game status
- Participants
- Their selections
- Current turn
- Current participant
- Turn expiration
- Available players
- Player rating used for auto-pick if appropriate
- Draft progress

Do not expose internal implementation details.

==================================================
VALIDATION
==================================================

Test:

1. Four users join a game.
2. Draft initializes.
3. Turn order is exactly P1 → P2 → P3 → P4 → P4 → P3 → P2 → P1.
4. Every turn lasts 35 seconds.
5. Correct participant can select.
6. Wrong participant cannot select.
7. Expired turn cannot accept manual selection.
8. Manual selection marks player unavailable.
9. Same player cannot be selected twice.
10. Concurrent selection of same player allows only one winner.
11. Timeout creates exactly one auto-pick.
12. Auto-pick chooses highest-rated available player.
13. Rating ties use deterministic playerId ordering.
14. Auto-pick broadcasts game:auto-pick.
15. Draft completes after 8 selections.
16. Every participant has exactly 2 players.
17. Game transitions correctly after draft.
18. Socket authentication works.
19. Unauthorized users cannot join private game rooms.
20. Existing Auth/Wallet/Game functionality still works.
21. /health still works.
22. TypeScript compilation succeeds.

==================================================
DO NOT IMPLEMENT
==================================================

Do NOT implement:

- Scoring engine
- Fantasy points
- Match event processing
- API-Football live synchronization
- Final ranking
- Rewards
- RP
- Redis workers
- Background football synchronization

When complete report exactly:

"PHASE 9 DRAFT COMPLETE"

Then summarize:

- Draft implementation
- Turn ordering
- Timeout mechanism
- Auto-pick mechanism
- Player uniqueness protection
- Socket.IO events
- Authentication
- Tests performed
- Any issues






# PHASE 10 — FANTASY SCORING ENGINE

The following phases are complete:

- Backend initialization
- Database layer
- Authentication
- Wallet
- Football data layer
- Game rooms
- Joining
- Cancellation and refunds
- Snake Draft
- Real-time draft

Now implement the Fantasy Scoring Engine.

Read:

/docs/10-final-domain-model.md
/docs/11-final-architecture.md
/docs/12-concurrency-and-transactions.md
/docs/13-final-api-map.md
/business-decisions.md

==================================================
SCOPE
==================================================

Implement ONLY:

- Normalized football event processing
- Fantasy scoring
- Player match statistics processing
- Fantasy points calculation
- Game participant points
- Live ranking calculation
- Scoring recalculation
- Pre-settlement corrections

Do NOT implement:

- Final wallet rewards
- Global RP settlement
- API-Football real integration
- Background synchronization
- Redis workers
- Final game settlement

==================================================
AUTHORITATIVE SCORING
==================================================

Goal:

+40

Assist:

+20

Big Chance Created:

+5

Successful Pass:

+1

Failed Pass:

-1

Tackle:

+3

Yellow Card:

-5

Red Card:

-20

Defender Clean Sheet:

+20

Goalkeeper Save:

+10

These values are authoritative.

Do not change them based on UI values.

==================================================
SCORING ARCHITECTURE
==================================================

The scoring engine MUST NOT depend on:

- API-Football JSON
- Express controllers
- Sequelize models directly
- Socket.IO

Use normalized internal football data.

Architecture:

FootballProvider
        ↓
Normalized Football DTO
        ↓
Scoring Engine
        ↓
Fantasy Points
        ↓
Game Participant Score
        ↓
Live Ranking

==================================================
SCORING EVENTS
==================================================

Support normalized events for:

- Goal
- Assist
- Big Chance Created
- Successful Pass
- Failed Pass
- Tackle
- Yellow Card
- Red Card
- Save
- Substitution

Do not calculate points from raw provider JSON.

==================================================
BIG CHANCE CREATED
==================================================

CRITICAL:

Do NOT map:

passes.key

to:

Big Chance Created.

Big Chance Created receives +5 ONLY when the football provider explicitly provides a reliable Big Chance Created statistic.

If unavailable:

- Do not award the points.
- Do not substitute Key Passes.
- Represent the statistic as unavailable.

==================================================
PLAYER ELIGIBILITY
==================================================

Only football players selected in the game's draft can earn fantasy points for that game.

A player's fantasy score must be associated with:

Game
Participant
Selected Player
Fixture

==================================================
GOALS
==================================================

Every goal scored by a selected player:

+40

Do not award points to users who did not draft that player.

==================================================
ASSISTS
==================================================

Every valid assist:

+20

Use normalized provider data.

Do not invent assists when provider data is unavailable.

==================================================
PASSES
==================================================

Successful Pass:

+1

Failed Pass:

-1

Use normalized statistics.

Do not confuse:

passes attempted
passes completed
key passes

with Big Chance Created.

==================================================
TACKLES
==================================================

Every valid successful tackle:

+3

Use the normalized provider statistic.

==================================================
CARDS
==================================================

Yellow Card:

-5

Red Card:

-20

If provider data contains a second yellow resulting in red:

Do not double-count incorrectly.

Normalize the provider event first.

The scoring engine must receive a consistent red-card event representation.

==================================================
GOALKEEPER SAVES
==================================================

Goalkeeper Save:

+10

Only goalkeeper saves count.

Outfield-player defensive actions must not become saves.

==================================================
CLEAN SHEET
==================================================

A defender or goalkeeper receives:

+20

ONLY if:

1. Player played at least 60 minutes.
2. The player's team conceded zero goals while the player was on the pitch.

Examples:

Player plays 70 minutes.
Team concedes after substitution.

→ Eligible.

Player plays 55 minutes.
Team keeps clean sheet.

→ Not eligible.

Player enters at minute 70.
Team keeps clean sheet.

→ Not eligible.

The engine must evaluate the player's actual minutes and goals conceded while on the pitch.

Do not award clean sheet points based only on final match score.

==================================================
LIVE SCORING
==================================================

During a LIVE match:

- Process incoming normalized events.
- Update selected players' fantasy points.
- Update participant totals.
- Update live game rankings.

A user joining the game while the match is already LIVE must receive FULL MATCH fantasy points.

Therefore:

When a late participant drafts a player:

The scoring engine must be able to calculate the player's accumulated statistics from the beginning of the fixture.

Do NOT calculate points only from the user's join timestamp.

==================================================
IDEMPOTENCY
==================================================

The same football event must never award fantasy points twice.

Every normalized event must have a stable provider event identifier where available.

Use an idempotent processing mechanism.

If the same event is received twice:

The second processing attempt must not create duplicate points.

==================================================
CORRECTIONS
==================================================

Football provider statistics may be corrected.

Before final settlement:

The game must support recalculating affected player fantasy points.

Recalculation must be deterministic.

Avoid simply adding the new value on top of the old value.

Instead:

Source Statistics
        ↓
Deterministic Calculation
        ↓
Current Fantasy Score

This prevents double counting.

==================================================
SCORING RECORDS
==================================================

Store enough information to explain how a participant reached their score.

The system should be able to answer:

Why does this player have 87 points?

For example:

Goal × 1 = +40
Assist × 1 = +20
Tackle × 3 = +9
Yellow Card × 1 = -5
Clean Sheet = +20
Total = 84

The exact storage structure must follow the finalized domain model.

Do not create unnecessary duplicate tables.

==================================================
LIVE RANKING
==================================================

For each active game calculate:

- Participant
- Total fantasy points
- Rank

Ranking order:

1. Total Fantasy Points descending
2. Total Goals Scored descending
3. Total Assists descending
4. Stable participantId ordering

This same deterministic ordering must later be used for final settlement.

==================================================
REAL-TIME EVENTS
==================================================

Prepare Socket.IO events:

game:live-event

Payload should contain only normalized/public information needed by the UI.

Example:

{
  "gameId": "...",
  "eventType": "GOAL",
  "playerId": "...",
  "fantasyPointsDelta": 40
}

Also support:

game:ranking

Example:

{
  "gameId": "...",
  "rankings": [...]
}

Do not expose internal database fields.

==================================================
API
==================================================

Implement only read endpoints required by the UI/API contract.

For example:

GET /api/v1/games/:gameId/ranking

GET /api/v1/games/:gameId/players/:playerId/points

Use the finalized API contract.

Do NOT create arbitrary endpoints.

==================================================
TRANSACTIONS
==================================================

When processing an event:

- Use database transactions where multiple related records change.
- Ensure event processing is idempotent.
- Ensure participant totals cannot become inconsistent.

Do not update wallet balances in the scoring engine.

Do not distribute rewards here.

==================================================
TESTING
==================================================

Create comprehensive automated tests for:

1. Goal = +40.
2. Assist = +20.
3. Big Chance Created = +5 when explicitly available.
4. Big Chance Created unavailable = 0.
5. Key Pass does NOT become Big Chance Created.
6. Successful Pass = +1.
7. Failed Pass = -1.
8. Tackle = +3.
9. Yellow Card = -5.
10. Red Card = -20.
11. Goalkeeper Save = +10.
12. Clean Sheet after 60+ minutes = +20.
13. Clean Sheet under 60 minutes = 0.
14. Player concedes after substitution = still eligible if all conditions are met.
15. Substitute entering after 60 minutes = not eligible.
16. Duplicate event does not double-count.
17. Corrected statistics recalculate deterministically.
18. Late joiner receives full-match accumulated points.
19. Only drafted players earn points.
20. Live rankings are deterministic.
21. Tie-breaking follows:
    points
    goals
    assists
    participantId
22. Existing Auth works.
23. Existing Wallet works.
24. Existing Game/Draft works.
25. /health works.
26. TypeScript compilation succeeds.

==================================================
DO NOT IMPLEMENT
==================================================

Do NOT implement:

- API-Football real requests
- Football synchronization workers
- Redis
- Final rewards
- Wallet settlement
- Global RP
- Season reset
- Game finalization

When complete report exactly:

"PHASE 10 SCORING ENGINE COMPLETE"

Then summarize:

- Scoring rules implemented
- Clean sheet implementation
- Big Chance Created handling
- Idempotency strategy
- Recalculation strategy
- Ranking calculation
- Socket events
- Tests performed
- Any issues







# PHASE 11 — API-FOOTBALL PROVIDER INTEGRATION

The following phases are complete:

- Backend foundation
- MySQL + Sequelize
- Authentication
- Wallet
- Game rooms
- Game joining
- Refunds
- Snake Draft
- Socket.IO draft
- Fantasy Scoring Engine

Now connect the FootballProvider abstraction to the real API-Football provider.

Read:

/docs/10-final-domain-model.md
/docs/11-final-architecture.md
/docs/12-concurrency-and-transactions.md
/docs/13-final-api-map.md
/business-decisions.md

==================================================
ENVIRONMENT
==================================================

API-Football credentials are provided through environment variables:

API_FOOTBALL_BASE_URL
API_FOOTBALL_KEY

Never hardcode the API key.

Never expose the API key to Flutter.

Never return the API key through an API response.

==================================================
SCOPE
==================================================

Implement ONLY:

- ApiFootballProvider
- API-Football HTTP client
- Provider authentication
- Competition mapping
- Fixture mapping
- Fixture events mapping
- Player statistics mapping
- Provider DTO normalization
- Error handling
- Retry-safe provider calls
- Basic provider integration tests

Do NOT implement yet:

- Background synchronization workers
- Redis/BullMQ
- Automatic live polling
- Final settlement
- Wallet rewards
- Global ranking settlement

==================================================
SUPPORTED COMPETITIONS
==================================================

Only synchronize:

1. English Premier League
2. La Liga
3. Saudi Pro League
4. UEFA Champions League
5. AFC Champions League

The provider must reject/filter all unsupported competitions.

Do not expose Bundesliga, Serie A, MLS, or any other competition.

==================================================
PROVIDER ABSTRACTION
==================================================

The domain must continue using:

FootballProvider

The domain must NOT import:

ApiFootballProvider

directly.

Use dependency injection.

Architecture:

Application
    ↓
FootballProvider
    ↓
ApiFootballProvider
    ↓
API-Football

==================================================
NORMALIZATION
==================================================

API-Football responses must be converted into internal normalized DTOs.

Do NOT pass raw API-Football responses into:

- Scoring Engine
- Domain Services
- Game Services
- Controllers
- Socket.IO

Create clear mappings for:

Competition
Fixture
Team
Player
FixtureEvent
PlayerMatchStatistics

==================================================
FIXTURE DATA
==================================================

The provider should support retrieving:

- Fixtures
- Fixture details
- Fixture status
- Teams
- Players
- Fixture events
- Player statistics

Use only the operations already defined by FootballProvider.

Do not invent unnecessary provider methods.

==================================================
SCORING DATA
==================================================

Ensure normalized statistics can represent:

- Goals
- Assists
- Big Chance Created
- Successful Passes
- Failed Passes
- Tackles
- Yellow Cards
- Red Cards
- Saves
- Minutes Played

IMPORTANT:

Do NOT map:

passes.key

to:

Big Chance Created.

If API-Football does not provide a reliable Big Chance Created statistic:

Return it as unavailable.

The Scoring Engine must then award:

0 points

for that statistic.

==================================================
CLEAN SHEET DATA
==================================================

The normalized data must provide enough information for the existing scoring engine to determine:

- Minutes played
- Substitution minute
- Goals conceded while player was on pitch
- Player position

Do NOT calculate clean sheet points inside ApiFootballProvider.

The provider only normalizes the source data.

The Scoring Engine owns fantasy rules.

==================================================
HTTP CLIENT
==================================================

Create a dedicated API-Football HTTP client.

Requirements:

- Base URL from environment.
- API key from environment.
- Request timeout.
- Proper HTTP error handling.
- Provider-specific error normalization.
- No secrets in logs.
- No API key in error messages.

Do not use raw HTTP calls throughout the application.

All API-Football requests must pass through the dedicated client.

==================================================
RATE LIMIT SAFETY
==================================================

Respect API-Football rate limits.

Do not implement aggressive polling.

Do not create unnecessary API requests.

Do not repeatedly request the same data inside loops if it can be avoided.

If the provider returns rate-limit information, preserve enough information for future synchronization logic.

==================================================
ERROR HANDLING
==================================================

Normalize provider errors into application-level errors such as:

FOOTBALL_PROVIDER_UNAVAILABLE

FOOTBALL_PROVIDER_TIMEOUT

FOOTBALL_PROVIDER_RATE_LIMITED

FOOTBALL_PROVIDER_INVALID_RESPONSE

Do not expose raw API-Football responses to clients.

==================================================
TESTING
==================================================

Create tests using mocked API-Football responses.

Do NOT make automated tests depend on the real API.

Test:

1. Successful authentication.
2. Competition mapping.
3. Supported competition filtering.
4. Unsupported competition filtering.
5. Fixture normalization.
6. Fixture status normalization.
7. Team normalization.
8. Player normalization.
9. Fixture event normalization.
10. Player statistics normalization.
11. Big Chance Created remains unavailable when not explicitly provided.
12. Key Pass does not become Big Chance Created.
13. Provider timeout.
14. Provider HTTP error.
15. Provider rate-limit response.
16. Malformed provider response.
17. API key is never exposed in logs/errors.
18. Existing Scoring Engine tests still pass.
19. Existing Draft tests still pass.
20. Existing Wallet/Auth tests still pass.
21. TypeScript compilation succeeds.

==================================================
SECURITY
==================================================

Never:

- Commit .env
- Log API_FOOTBALL_KEY
- Return API_FOOTBALL_KEY
- Send API_FOOTBALL_KEY to Flutter
- Put the key in frontend code

Ensure .gitignore contains:

.env
.env.*
!.env.example

Create/update:

.env.example

with placeholders only.

==================================================
FINAL OUTPUT
==================================================

When complete report exactly:

"PHASE 11 API-FOOTBALL PROVIDER COMPLETE"

Then summarize:

- Provider implementation
- Normalized DTOs
- Supported competitions
- Big Chance Created handling
- Error handling
- Rate-limit handling
- Tests
- Any remaining issues

DO NOT implement background synchronization yet.








# PHASE 12 — FOOTBALL DATA SYNCHRONIZATION

The following phases are complete:

- Backend foundation
- MySQL + Sequelize
- Authentication
- Wallet
- Game rooms
- Game joining
- Refunds
- Snake Draft
- Socket.IO
- Fantasy Scoring Engine
- ApiFootballProvider

Now implement the Football Data Synchronization system.

Read:

/docs/10-final-domain-model.md
/docs/11-final-architecture.md
/docs/12-concurrency-and-transactions.md
/docs/13-final-api-map.md
/business-decisions.md

==================================================
SCOPE
==================================================

Implement:

- Competition synchronization
- Team synchronization
- Fixture synchronization
- Fixture event synchronization
- Player statistics synchronization
- Live fixture updates
- Normalized data persistence
- Scoring Engine integration
- Idempotent synchronization
- Safe retries
- Basic synchronization jobs

Do NOT implement:

- Final game settlement
- Wallet rewards
- Global RP settlement
- Season reset
- Redis/BullMQ unless already required by the finalized architecture

==================================================
SUPPORTED COMPETITIONS
==================================================

Synchronize ONLY:

EPL
LALIGA
SPL
UCL
ACL

Never synchronize unsupported competitions.

The database must not receive fixtures from unsupported competitions.

==================================================
COMPETITION SYNC
==================================================

Create a synchronization service that:

1. Retrieves supported competitions from FootballProvider.
2. Maps them to internal Competition records.
3. Creates missing competitions.
4. Updates existing competitions.
5. Does not create duplicates.

Use stable provider IDs.

==================================================
TEAM SYNC
==================================================

For supported competitions:

- Synchronize participating teams.
- Store provider team ID.
- Store team name.
- Store logo if available.
- Update existing records instead of duplicating them.

==================================================
FIXTURE SYNC
==================================================

Synchronize fixtures belonging ONLY to supported competitions.

Persist:

- provider fixture ID
- competition
- season
- home team
- away team
- kickoff time
- status
- scores

Use the provider fixture ID as the external identity.

Repeated synchronization must be idempotent.

==================================================
FIXTURE STATUS
==================================================

Normalize provider statuses into internal statuses.

At minimum support:

SCHEDULED
LIVE
HALFTIME
SUSPENDED
POSTPONED
CANCELLED
FINISHED

Do not expose raw API-Football status codes to the rest of the application.

==================================================
LIVE FIXTURES
==================================================

For fixtures currently LIVE:

Synchronize frequently enough to keep fantasy scores reasonably current.

Update:

- fixture status
- score
- match events
- player statistics

Do NOT use uncontrolled polling.

Centralize synchronization scheduling.

==================================================
FIXTURE EVENTS
==================================================

Synchronize:

- Goals
- Assists
- Cards
- Substitutions
- Other relevant events supported by the provider

Store normalized events.

Every provider event must have a stable external identity whenever possible.

Repeated synchronization must not create duplicate events.

==================================================
PLAYER STATISTICS
==================================================

Synchronize normalized player match statistics required by the scoring engine:

- Minutes
- Goals
- Assists
- Passes
- Tackles
- Cards
- Saves
- Big Chance Created when explicitly available

IMPORTANT:

Never convert:

Key Passes

into:

Big Chance Created.

If unavailable, keep the value unavailable.

==================================================
SCORING INTEGRATION
==================================================

After synchronized data changes:

Send normalized data to the existing Scoring Engine.

The synchronization layer must NOT contain fantasy scoring rules.

Architecture:

API-Football
↓
ApiFootballProvider
↓
Football Sync Service
↓
Normalized DB Data
↓
Scoring Engine
↓
Game Rankings

==================================================
LIVE GAME INTEGRATION
==================================================

For every active UFL game associated with a LIVE fixture:

- Detect new/changed football data.
- Recalculate affected fantasy points.
- Update participant rankings.
- Broadcast relevant Socket.IO events.

Possible events:

game:live-event
game:ranking

Do not broadcast raw API-Football responses.

==================================================
LATE JOINERS
==================================================

A participant may join while the football fixture is already LIVE.

Their selected players must receive FULL MATCH fantasy points.

Therefore after a late participant drafts a player:

The backend must calculate the player's accumulated statistics from the beginning of the fixture.

Do NOT calculate only from the join timestamp.

==================================================
SUSPENDED MATCHES
==================================================

If provider reports:

SUSPENDED

Keep the associated UFL game:

LIVE

Do not cancel it automatically.

Pause/stop scoring updates until football data resumes.

When the fixture resumes:

Continue synchronization.

==================================================
POSTPONED / CANCELLED MATCHES
==================================================

If a fixture is cancelled or postponed in a way that prevents fantasy completion:

Find active UFL games associated with that fixture.

For each affected game:

- Mark game CANCELLED.
- Refund every participant exactly 500 Coins.
- Do not distribute rewards.
- Do not change Global RP.
- Create system notifications.

Refund logic must reuse the existing idempotent wallet refund mechanism.

Do not implement duplicate refund logic.

==================================================
UNFILLED GAMES
==================================================

When the real-world fixture starts:

Check UFL games associated with the fixture.

If a game has fewer than 4 participants:

- Mark game CANCELLED.
- Refund every participant 500 Coins.
- No ranking.
- No rewards.
- No RP changes.

Refund must be atomic and idempotent.

==================================================
DATA CORRECTIONS
==================================================

Football provider data can change.

Before game settlement:

- Recalculate affected fantasy scores.
- Update rankings.
- Do not duplicate wallet operations.

After game finalization:

Do NOT retroactively modify wallet rewards or RP.

Final settlement will be implemented separately.

==================================================
SYNC IDEMPOTENCY
==================================================

Synchronization must be safe to run multiple times.

Repeated execution must NOT:

- Duplicate competitions
- Duplicate teams
- Duplicate fixtures
- Duplicate events
- Duplicate player statistics
- Duplicate fantasy points
- Duplicate refunds

Use external provider IDs and appropriate database constraints.

==================================================
FAILURE HANDLING
==================================================

If API-Football is unavailable:

- Do not corrupt existing data.
- Do not mark fixtures cancelled merely because the provider is temporarily unavailable.
- Log a safe provider error without secrets.
- Retry according to the synchronization strategy.

If synchronization fails halfway through:

The next synchronization must safely continue.

==================================================
JOBS
==================================================

Create synchronization jobs/services for:

1. Competition synchronization
2. Upcoming fixture synchronization
3. Live fixture synchronization
4. Fixture finalization synchronization

Keep job scheduling separate from business logic.

If Redis/BullMQ is already part of the finalized architecture, use it appropriately.

Otherwise structure the services so a persistent queue can be introduced without rewriting domain logic.

==================================================
MANUAL SYNC
==================================================

Provide an internal/development mechanism to trigger synchronization manually.

This is for development/testing only.

Do NOT expose an unauthenticated public sync endpoint.

==================================================
TESTING
==================================================

Test:

1. Supported competitions synchronize.
2. Unsupported competitions are ignored.
3. Teams synchronize without duplicates.
4. Fixtures synchronize without duplicates.
5. Fixture status is normalized.
6. Events synchronize idempotently.
7. Player statistics synchronize idempotently.
8. LIVE fixtures update.
9. Suspended fixture remains active.
10. Cancelled fixture cancels UFL games.
11. Postponed fixture follows cancellation policy.
12. Unfilled game at match start is cancelled.
13. Participant refunds happen exactly once.
14. Late joiner receives full accumulated match points.
15. Corrected provider data recalculates scoring.
16. Provider outage does not cancel games.
17. Repeated synchronization produces the same database state.
18. Existing scoring tests pass.
19. Existing draft tests pass.
20. Existing wallet tests pass.
21. Existing authentication tests pass.
22. TypeScript compilation succeeds.

==================================================
IMPORTANT
==================================================

Do NOT implement final game settlement.

Do NOT implement:

- 1000 / 500 / 0 / 0 rewards
- +3 / +1 / 0 / -1 RP settlement
- Season reset

Those belong to the next phase.

When complete report exactly:

"PHASE 12 FOOTBALL SYNC COMPLETE"

Then summarize:

- Sync services
- Jobs
- Competition filtering
- Fixture synchronization
- Event synchronization
- Player statistics
- Live integration
- Cancellation/refund integration
- Idempotency
- Tests
- Any issues





# PHASE 13 — FINAL GAME SETTLEMENT

The following phases are complete:

- Backend foundation
- MySQL + Sequelize
- Authentication
- Wallet
- Game rooms
- Game joining
- Refunds
- Snake Draft
- Socket.IO
- Fantasy Scoring Engine
- ApiFootballProvider
- Football synchronization
- Live scoring

Now implement the FINAL GAME SETTLEMENT system.

Read:

/docs/10-final-domain-model.md
/docs/11-final-architecture.md
/docs/12-concurrency-and-transactions.md
/docs/13-final-api-map.md
/business-decisions.md

==================================================
SCOPE
==================================================

Implement ONLY:

- Match/game finalization
- Final fantasy score calculation
- Deterministic ranking
- Tie-breaking
- Coin rewards
- Global RP rewards
- Wallet settlement
- Settlement idempotency
- Final game state
- Final result realtime event
- Final result API

Do NOT implement:

- Season reset
- Notifications system expansion
- Admin dashboard
- Payment system
- New football provider functionality

==================================================
FINAL GAME CONDITIONS
==================================================

A UFL game may be finalized only when:

- The associated football fixture is actually finished.
- The game has exactly 4 participants.
- The game is not CANCELLED.
- Draft has completed.
- Final football statistics required by the scoring engine have been processed.

If these conditions are not satisfied:

Do NOT distribute rewards.

==================================================
FINAL SCORE
==================================================

Before settlement:

Recalculate the final fantasy score for every selected player.

Then calculate:

Participant Total Fantasy Points

from all drafted players.

Do not trust a client-provided score.

The server is authoritative.

==================================================
RANKING
==================================================

Rank the 4 participants using exactly:

1. Total Fantasy Points DESC
2. Total Goals Scored by drafted players DESC
3. Total Assists by drafted players DESC
4. Stable participantId ASC

This guarantees exactly one unique rank:

1
2
3
4

There must never be shared ranks.

==================================================
COIN REWARDS
==================================================

Final rewards are:

1st:

+1000 Coins

2nd:

+500 Coins

3rd:

+0 Coins

4th:

+0 Coins

These values are authoritative.

Do NOT use UI mockup values such as:

+250
+100

==================================================
GLOBAL RANKING POINTS
==================================================

Final RP changes:

1st:

+3 RP

2nd:

+1 RP

3rd:

0 RP

4th:

-1 RP

==================================================
WALLET SETTLEMENT
==================================================

The game entry fee was already deducted when joining.

Therefore settlement only credits the final prize.

Example:

Player starts with:

500

Joins:

-500

Balance:

0

Finishes 1st:

+1000

Final balance:

1000

Second place:

500

Final balance:

500

Third/Fourth:

0

Final balance:

0

Do NOT deduct the entry fee again during settlement.

==================================================
ATOMIC SETTLEMENT
==================================================

Final settlement MUST be performed inside a single database transaction where appropriate.

The transaction must ensure:

- Final ranks are stored.
- Coin rewards are stored.
- Wallet balances are updated.
- Wallet transactions are created.
- RP changes are stored.
- Game status becomes FINISHED.

Either everything succeeds or everything rolls back.

Never allow:

Wallet credited
but game remains LIVE.

Never allow:

Game marked FINISHED
but wallet reward missing.

==================================================
IDEMPOTENCY
==================================================

Settlement must happen exactly once.

If settlement is triggered twice:

The second execution must NOT:

- Credit coins again.
- Add RP again.
- Create duplicate wallet transactions.
- Modify final ranks incorrectly.

Use database state/unique settlement records/idempotency constraints.

The final settlement operation must be safe against:

- Worker retries.
- HTTP retries.
- Server restarts.
- Duplicate requests.
- Concurrent settlement attempts.

==================================================
FINAL SETTLEMENT RECORD
==================================================

Store enough information to prove that settlement happened.

At minimum track:

- gameId
- participantId
- finalRank
- fantasyPoints
- coinReward
- rpChange
- settledAt

Use unique constraints where appropriate.

==================================================
RP STORAGE
==================================================

Update the user's Global Ranking Points using the existing domain model.

Do not create duplicate RP records for the same game participant.

Every participant receives exactly one RP change.

==================================================
FINAL GAME STATE
==================================================

Normal path:

LIVE

↓

FINISHED

After FINISHED:

- No new participants.
- No new draft selections.
- No score recalculation affecting rewards.
- No additional settlement.
- No additional rewards.

The game becomes immutable from the perspective of settlement.

==================================================
POST-SETTLEMENT DATA CORRECTIONS
==================================================

Provider corrections occurring AFTER final settlement:

Do NOT modify:

- Coin rewards
- Global RP
- Final ranks

The previously distributed rewards remain final.

The game remains FINISHED.

==================================================
FINAL RESULTS API
==================================================

Implement the final results endpoint required by the existing API contract.

For example:

GET /api/v1/games/:gameId/result

The response should provide everything required by the Final Results UI:

- Game information
- Final ranking
- Participant
- Avatar/name
- Drafted players
- Fantasy points
- Final rank
- Coin reward
- RP change
- Final score
- Settlement timestamp

Do not expose internal database implementation details.

==================================================
REALTIME
==================================================

After successful settlement broadcast:

game:finished

The event should contain the final public result.

Example:

{
  "gameId": "...",
  "status": "FINISHED",
  "results": [
    {
      "rank": 1,
      "participantId": "...",
      "fantasyPoints": 120,
      "coinReward": 1000,
      "rpChange": 3
    },
    {
      "rank": 2,
      "participantId": "...",
      "fantasyPoints": 110,
      "coinReward": 500,
      "rpChange": 1
    },
    {
      "rank": 3,
      "participantId": "...",
      "fantasyPoints": 90,
      "coinReward": 0,
      "rpChange": 0
    },
    {
      "rank": 4,
      "participantId": "...",
      "fantasyPoints": 80,
      "coinReward": 0,
      "rpChange": -1
    }
  ]
}

Do not include wallet internals or sensitive information.

==================================================
NOTIFICATION HOOK
==================================================

After successful settlement, create a clean application-level hook/service event for future notifications.

Do NOT build the complete notification system yet.

The hook should allow later implementation of:

"You finished 1st place and earned 1000 Coins."

==================================================
CONCURRENCY
==================================================

Two settlement processes may attempt to finalize the same game simultaneously.

Only one may succeed.

The other must safely detect that settlement already happened.

Use database transactions and row locking/unique constraints where appropriate.

Do not rely only on:

if (game.status === FINISHED)

without transactional protection.

==================================================
CANCELLED GAMES
==================================================

A CANCELLED game MUST NEVER be finalized.

A CANCELLED game receives:

- No prize
- No RP
- No final ranking settlement

Refunds are handled by the existing cancellation/refund system.

==================================================
VALIDATION
==================================================

Before settlement verify:

- Exactly 4 participants.
- Every participant has exactly 2 drafted players.
- Draft completed.
- Fixture finished.
- Game not CANCELLED.
- Final player statistics available.
- Fantasy scores calculated successfully.

If validation fails:

Do not partially settle.

==================================================
TESTING
==================================================

Create automated tests for:

1. Correct final fantasy score calculation.
2. Correct ranking.
3. Points tie resolved by goals.
4. Goals tie resolved by assists.
5. Goals and assists tie resolved by participantId.
6. Exactly one rank per participant.
7. 1st receives +1000 Coins.
8. 2nd receives +500 Coins.
9. 3rd receives 0 Coins.
10. 4th receives 0 Coins.
11. 1st receives +3 RP.
12. 2nd receives +1 RP.
13. 3rd receives 0 RP.
14. 4th receives -1 RP.
15. Entry fee is NOT deducted again.
16. Wallet reward transaction is created exactly once.
17. RP change is created exactly once.
18. Duplicate settlement does not duplicate rewards.
19. Concurrent settlement allows only one successful settlement.
20. Transaction rollback works correctly.
21. CANCELLED games cannot settle.
22. Incomplete games cannot settle.
23. Final result endpoint works.
24. game:finished event is emitted only after successful settlement.
25. Existing scoring tests pass.
26. Existing draft tests pass.
27. Existing wallet tests pass.
28. Existing authentication tests pass.
29. Existing football synchronization tests pass.
30. TypeScript compilation succeeds.

==================================================
IMPORTANT
==================================================

DO NOT implement:

- Season reset
- Global leaderboard redesign
- Notifications UI
- Payment
- Admin features

When complete report exactly:

"PHASE 13 FINAL SETTLEMENT COMPLETE"

Then summarize:

- Settlement flow
- Ranking algorithm
- Coin rewards
- RP rewards
- Transaction safety
- Idempotency
- Concurrency protection
- Final result API
- Socket event
- Tests
- Any issues





# PHASE 14 — GLOBAL RANKING & FOOTBALL SEASONS

The following phases are complete:

- Backend foundation
- MySQL + Sequelize
- Authentication
- Wallet
- Game rooms
- Game joining
- Refunds
- Snake Draft
- Socket.IO
- Fantasy Scoring Engine
- ApiFootballProvider
- Football synchronization
- Live scoring
- Final Game Settlement

Now implement Global Ranking and Football Seasons.

Read:

/docs/10-final-domain-model.md
/docs/11-final-architecture.md
/docs/12-concurrency-and-transactions.md
/docs/13-final-api-map.md
/business-decisions.md

==================================================
SCOPE
==================================================

Implement:

- Season management
- Active season
- Global Ranking Points
- Global leaderboard
- Season-specific ranking
- Season reset
- Ranking APIs
- Ranking realtime updates
- Historical season ranking support

Do NOT implement:

- New game scoring rules
- Wallet rewards
- Game settlement changes
- Football provider changes
- Notifications UI
- Admin dashboard

==================================================
AUTHORITATIVE RP RULES
==================================================

1st place:

+3 RP

2nd place:

+1 RP

3rd place:

0 RP

4th place:

-1 RP

These values are authoritative.

Every finalized game produces exactly one RP change per participant.

==================================================
SEASONS
==================================================

The system must support football seasons.

A Season should have enough information to represent:

- season identifier
- name
- start date
- end date
- status
- provider season ID where applicable

Possible statuses:

UPCOMING
ACTIVE
COMPLETED

Only ONE season may be ACTIVE at a time.

==================================================
ACTIVE SEASON
==================================================

All newly finalized games must award RP to the currently ACTIVE season.

Do NOT allow a game to silently write RP to an inactive season.

The season associated with a game must be persisted so historical results remain correct.

==================================================
RANKING MODEL
==================================================

Global leaderboard should contain:

- User
- Current season
- RP
- Rank

Ranking order:

1. RP descending
2. Stable userId ascending

Rank must be deterministic.

Do not use random ordering.

==================================================
RP TRANSACTIONS
==================================================

Every RP change should be traceable.

For each finalized game:

Store:

- userId
- seasonId
- gameId
- RP change
- createdAt

The same:

seasonId + gameId + userId

must NOT be inserted twice.

This guarantees idempotency.

==================================================
GAME SETTLEMENT INTEGRATION
==================================================

The existing Final Settlement already calculates:

1st = +3 RP
2nd = +1 RP
3rd = 0 RP
4th = -1 RP

Do NOT duplicate settlement logic.

Create a clean Ranking service responsible for applying the RP change.

The Final Settlement service should call the Ranking service.

Do not create a second competing implementation.

==================================================
SEASON RESET
==================================================

At the start of a new football season:

The new season becomes ACTIVE.

Users start that season with:

0 RP

Do NOT destroy historical season data.

Previous season rankings must remain available.

Do NOT simply overwrite one global RP column if that would destroy history.

Ranking must be season-scoped.

==================================================
SEASON TRANSITION
==================================================

When activating a new season:

1. Previous ACTIVE season becomes COMPLETED.
2. New season becomes ACTIVE.
3. New season starts with no RP.
4. Historical ranking remains accessible.
5. New games use the new active season.

The transition must be transactional.

Only one active season may exist after the operation.

==================================================
SEASON SAFETY
==================================================

Do not automatically create arbitrary seasons from user requests.

Season creation/activation should be controlled by backend/admin-level logic.

Do NOT expose unauthenticated season mutation endpoints.

==================================================
LEADERBOARD API
==================================================

Implement endpoints required by the UI.

At minimum support:

GET /api/v1/ranking

GET /api/v1/ranking/me

GET /api/v1/seasons

GET /api/v1/seasons/:seasonId/ranking

Use the finalized API map.

Do not create duplicate or unnecessary endpoints.

==================================================
RANKING RESPONSE
==================================================

Leaderboard response should provide the UI with:

- Rank
- User ID
- Username
- Avatar
- RP
- Current season
- Optional games played/statistics if already required by the UI

Do not expose:

- Password hashes
- JWTs
- Wallet internals
- Private database fields

==================================================
CURRENT USER RANK
==================================================

GET /api/v1/ranking/me should return:

- Current active season
- Current user RP
- Current rank
- Total participants if required by the UI

If the user has no ranking entry yet:

Return rank appropriately as unranked/0 depending on the finalized API contract.

Do not create fake ranking records unnecessarily.

==================================================
SEASON HISTORY
==================================================

Users should be able to view historical season rankings if required by the UI.

Historical ranking data must remain immutable after a season is completed, except for controlled administrative correction.

Do not reset/delete old records.

==================================================
REALTIME RANKING
==================================================

After successful Final Game Settlement:

The backend may emit:

ranking:updated

The event should contain only the public information necessary for the leaderboard UI.

Example:

{
  "seasonId": "...",
  "gameId": "...",
  "updatedUsers": [
    {
      "userId": "...",
      "rpChange": 3
    }
  ]
}

Do not broadcast private wallet information.

==================================================
RANK CALCULATION
==================================================

Leaderboard rank must be deterministic.

Example:

User A: 20 RP
User B: 20 RP
User C: 15 RP

If A.userId < B.userId:

A = Rank 1
B = Rank 2
C = Rank 3

Do not produce shared ranks.

==================================================
NEGATIVE RP
==================================================

Negative RP is allowed.

A user may have:

- 0 RP
- positive RP
- negative RP

Do not clamp RP to zero.

The only automatic reset is when a NEW season starts.

==================================================
SEASON START
==================================================

At the beginning of an ACTIVE season:

All users effectively start at:

0 RP

There is no need to create zero-value ranking rows for every user unless required by the database/UI.

A user can receive their first ranking record when they participate in a finalized game.

==================================================
CONCURRENCY
==================================================

Season activation must be transaction-safe.

Two processes attempting to activate different seasons simultaneously must not result in:

- Two ACTIVE seasons
- RP written to the wrong season
- Partial transition

Use database constraints and transactions.

==================================================
TESTING
==================================================

Test:

1. Create season.
2. Activate season.
3. Only one ACTIVE season exists.
4. Previous season becomes COMPLETED.
5. New season starts at 0 RP.
6. Final settlement adds correct RP.
7. 1st receives +3.
8. 2nd receives +1.
9. 3rd receives 0.
10. 4th receives -1.
11. Negative RP works.
12. Duplicate RP transaction is prevented.
13. Historical season remains accessible.
14. Current ranking is season-scoped.
15. Ranking order is deterministic.
16. Equal RP uses userId fallback.
17. Current user ranking endpoint works.
18. Season list endpoint works.
19. Historical ranking endpoint works.
20. Concurrent season activation is safe.
21. Existing settlement tests pass.
22. Existing wallet tests pass.
23. Existing scoring tests pass.
24. Existing draft tests pass.
25. Existing football sync tests pass.
26. TypeScript compilation succeeds.

==================================================
DO NOT IMPLEMENT
==================================================

Do NOT implement:

- Notifications
- Admin dashboard
- Payment
- New scoring rules
- New game states
- API-Football changes

When complete report exactly:

"PHASE 14 GLOBAL RANKING COMPLETE"

Then summarize:

- Season implementation
- RP implementation
- Ranking calculation
- Season transition
- Historical rankings
- APIs
- Realtime events
- Concurrency protection
- Tests
- Any issues



# PHASE 15 — NOTIFICATIONS SYSTEM

The following phases are complete:

- Backend foundation
- MySQL + Sequelize
- Authentication
- Wallet
- Game rooms
- Game joining
- Refunds
- Snake Draft
- Socket.IO
- Fantasy Scoring Engine
- ApiFootballProvider
- Football synchronization
- Live scoring
- Final Game Settlement
- Global Ranking
- Football Seasons

Now implement the Notifications system.

Read:

/docs/10-final-domain-model.md
/docs/11-final-architecture.md
/docs/12-concurrency-and-transactions.md
/docs/13-final-api-map.md
/business-decisions.md

==================================================
SCOPE
==================================================

Implement:

- Notification entity/model if not already implemented
- Notification service
- Creating notifications from backend events
- Read/unread state
- Notification list API
- Mark notification as read
- Mark all notifications as read
- Realtime notification event through Socket.IO
- Notification lifecycle
- Idempotency for important system notifications

Do NOT implement:

- Firebase Cloud Messaging
- Push notification provider
- Email
- SMS
- Notification scheduling system
- Admin notification dashboard

Socket.IO is enough for this phase.

==================================================
NOTIFICATION ENTITY
==================================================

A notification should contain at minimum:

- id
- userId
- type
- title
- message
- isRead
- createdAt
- readAt where applicable
- relatedEntityType where useful
- relatedEntityId where useful

Use the existing Sequelize/domain conventions.

Do not duplicate models.

==================================================
NOTIFICATION TYPES
==================================================

Use stable notification types.

Examples:

GAME_JOINED
GAME_STARTED
DRAFT_TURN
DRAFT_AUTO_PICK
GAME_FINISHED
GAME_CANCELLED
GAME_REFUNDED
RANKING_UPDATED
SEASON_STARTED
SYSTEM

Use the smallest set actually required by the existing UI and backend events.

Do not create unnecessary notification types.

==================================================
GAME FINISHED
==================================================

After successful final settlement:

Create a notification for each participant.

Example:

Title:

"Game Finished"

Message:

"You finished 1st and earned 1000 Coins."

The message must use the actual:

- rank
- coin reward
- RP change

Do NOT calculate the result on the client.

==================================================
GAME CANCELLED
==================================================

When a game is cancelled:

Create a notification for every participant.

Example:

Title:

"Game Cancelled"

Message:

"Your game was cancelled. Your 500 Coins entry fee has been refunded."

Only create the notification after the refund succeeds.

Do not send a false refund notification.

==================================================
REFUND NOTIFICATION
==================================================

Refund notifications must be idempotent.

If cancellation/refund processing is retried:

Do NOT create duplicate refund notifications.

Use an appropriate unique/idempotency strategy.

==================================================
DRAFT NOTIFICATIONS
==================================================

If required by the current UI:

Notify the user when:

- It becomes their draft turn.
- Their turn is automatically completed because of timeout.

Example:

"Your turn"

"You can now select a player."

For auto-pick:

"Draft Auto-Pick"

"Your turn expired and a player was automatically selected."

Realtime Socket.IO events may be used instead of persistent notifications for short-lived gameplay events.

Do NOT persist every gameplay event unnecessarily.

==================================================
PERSISTENT VS REALTIME
==================================================

Use this rule:

Persistent notification:

Important event that the user may need to see later.

Examples:

- Game finished
- Game cancelled
- Refund
- Season started
- Important ranking update

Realtime only:

Short-lived gameplay events.

Examples:

- Draft countdown
- Current turn
- Player selected
- Live score update

Do not fill the notification table with high-frequency live events.

==================================================
SOCKET EVENT
==================================================

Emit:

notification:new

to the affected user's private Socket.IO room.

Payload:

{
  "id": "...",
  "type": "GAME_FINISHED",
  "title": "Game Finished",
  "message": "...",
  "createdAt": "..."
}

Do not broadcast private notifications to other users.

==================================================
PRIVATE SOCKET ROOMS
==================================================

Use the authenticated user's private Socket.IO room.

Conceptually:

user:{userId}

Only the authenticated owner of that userId may receive the notification.

Do not trust a client-supplied userId.

==================================================
NOTIFICATION API
==================================================

Implement according to the existing API contract.

At minimum:

GET /api/v1/notifications

PATCH /api/v1/notifications/:id/read

PATCH /api/v1/notifications/read-all

Support pagination for notification listing.

Return:

- id
- type
- title
- message
- isRead
- createdAt
- readAt
- related entity information where appropriate

Do not expose internal database fields.

==================================================
AUTHORIZATION
==================================================

A user may only:

- Read their own notifications.
- Mark their own notification as read.
- Mark their own notifications as read-all.

Never allow:

GET another user's notifications.

Never allow:

Mark another user's notification as read.

==================================================
READ STATE
==================================================

When marking a notification as read:

Set:

isRead = true

readAt = current timestamp

The operation should be idempotent.

Calling it multiple times must not produce an error or corrupt the record.

==================================================
READ ALL
==================================================

Mark all unread notifications belonging to the authenticated user as read.

Do not modify notifications belonging to other users.

==================================================
NOTIFICATION CREATION
==================================================

Create a NotificationService.

Business services should call the notification service after successful business operations.

Examples:

GameService
→ NotificationService

SettlementService
→ NotificationService

RefundService
→ NotificationService

SeasonService
→ NotificationService

Do NOT put notification creation directly inside controllers.

==================================================
TRANSACTION SAFETY
==================================================

Important rule:

A notification claiming that money/coins were awarded or refunded must NEVER be created if the underlying operation failed.

For operations inside a database transaction:

Create the notification in the same transaction when appropriate.

For realtime Socket.IO emission:

Emit only AFTER the database transaction commits successfully.

Never emit:

notification:new

for an operation that later rolls back.

==================================================
IDEMPOTENCY
==================================================

Important notifications must not be duplicated.

At minimum protect:

- GAME_FINISHED
- GAME_CANCELLED
- GAME_REFUNDED
- SEASON_STARTED

Use deterministic business identifiers where appropriate.

Examples:

GAME_FINISHED:

userId + gameId + type

GAME_REFUNDED:

userId + gameId + type

SEASON_STARTED:

userId + seasonId + type

Do not rely only on application-level checks.

Use database constraints where appropriate.

==================================================
SEASON STARTED
==================================================

When a new season becomes ACTIVE:

Users may receive a season-start notification.

Do not generate millions of notifications synchronously if the application has a large user base.

If the existing architecture supports background jobs, create a safe asynchronous job/hook.

For now, implement the service abstraction without requiring a massive synchronous operation.

==================================================
RANKING UPDATED
==================================================

Do not create a persistent notification for every RP change unless the UI explicitly requires it.

Use the existing realtime:

ranking:updated

for live leaderboard changes.

Only create a persistent ranking notification if clearly required by the UI.

==================================================
NOTIFICATION LIST
==================================================

The API should support:

- pagination
- newest first
- unread count if useful to the UI

Example response:

{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasNext": true
  },
  "unreadCount": 5
}

Follow the existing project API response conventions if they already exist.

==================================================
TESTING
==================================================

Create tests for:

1. User can list own notifications.
2. User cannot list another user's notifications.
3. User can mark own notification as read.
4. User cannot mark another user's notification as read.
5. Mark read is idempotent.
6. Read-all affects only current user.
7. GAME_FINISHED creates notification.
8. GAME_CANCELLED creates notification.
9. Refund notification only appears after successful refund.
10. Duplicate settlement does not create duplicate GAME_FINISHED notifications.
11. Duplicate refund does not create duplicate GAME_REFUNDED notifications.
12. notification:new is emitted after successful commit.
13. Failed transaction does not emit notification:new.
14. Draft realtime events are not unnecessarily persisted.
15. Season notification mechanism is safe.
16. Pagination works.
17. Unread count works if implemented.
18. Existing settlement tests pass.
19. Existing ranking tests pass.
20. Existing wallet tests pass.
21. Existing game tests pass.
22. TypeScript compilation succeeds.

==================================================
IMPORTANT
==================================================

Do NOT implement:

- Firebase Cloud Messaging
- Push notifications
- Email
- SMS
- Admin notification management

Keep the system ready for a future push provider.

When complete report exactly:

"PHASE 15 NOTIFICATIONS COMPLETE"

Then summarize:

- Notification model
- Notification types
- APIs
- Socket event
- Authorization
- Idempotency
- Transaction safety
- Tests
- Any issues


# PHASE 16 — FINAL API AUDIT & UI CONTRACT VALIDATION

The following phases are complete:

- Backend foundation
- MySQL + Sequelize
- Authentication
- Wallet
- Game rooms
- Game joining
- Refunds
- Snake Draft
- Socket.IO
- Fantasy Scoring Engine
- ApiFootballProvider
- Football synchronization
- Live scoring
- Final Game Settlement
- Global Ranking
- Football Seasons
- Notifications

Now perform a FINAL API AUDIT against the actual UI.

==================================================
CRITICAL RULE
==================================================

DO NOT redesign the backend architecture.

DO NOT create a new architecture.

DO NOT replace Sequelize.

DO NOT replace MySQL.

DO NOT change existing business rules.

DO NOT implement unrelated features.

This phase is an audit and correction phase.

Only make implementation changes when they are required to satisfy:

1. Existing UI requirements.
2. Confirmed business decisions.
3. Existing API contracts.
4. Security requirements.
5. Data consistency requirements.

==================================================
READ THE SOURCE OF TRUTH
==================================================

Read:

/ui/
/docs/all.md
/docs/01-ui-audit.md
/docs/02-user-flows.md
/docs/03-domain-model.md
/docs/04-ui-data-contract.md
/docs/05-api-contract.md
/docs/06-realtime-contract.md
/docs/07-business-rules.md
/docs/08-open-questions.md
/docs/09-backend-architecture.md
/docs/10-final-domain-model.md
/docs/11-final-architecture.md
/docs/12-concurrency-and-transactions.md
/docs/13-final-api-map.md
/business-decisions.md
/review.md

Also inspect the actual implemented backend routes/controllers/services.

==================================================
STEP 1 — INVENTORY ALL API ENDPOINTS
==================================================

Create a complete inventory of every currently implemented REST endpoint.

For each endpoint document:

- HTTP method
- URL
- Authentication
- Authorization
- Request parameters
- Request body
- Response
- Errors
- Controller
- Service
- Database entities
- UI screen consuming it

Do not document endpoints that do not actually exist as implemented.

==================================================
STEP 2 — UI → API COVERAGE
==================================================

Inspect every UI screen.

For every backend-required UI action determine:

- Existing endpoint
- Missing endpoint
- Incorrect endpoint
- Incorrect response shape
- Missing response field
- Incorrect authentication requirement

Create:

/docs/14-ui-api-audit.md

Use this structure:

# UI API Audit

## Authentication
## Home
## Match Discovery
## Match Details
## Join Game
## Waiting Room
## Snake Draft
## Live Game
## Live Ranking
## Final Results
## Wallet
## Transactions
## Global Ranking
## Seasons
## Profile
## Game History
## Notifications
## Settings

For every section document:

UI requirement
→ Endpoint
→ Status

Possible statuses:

IMPLEMENTED
MISSING
INCORRECT
NOT_REQUIRED

==================================================
STEP 3 — RESPONSE CONTRACT VALIDATION
==================================================

Compare actual backend responses against what the UI needs.

Pay special attention to:

- IDs
- names
- avatars
- images
- timestamps
- coin balances
- wallet transactions
- game status
- participant count
- player selection
- draft turn
- draft countdown
- fantasy points
- rankings
- rewards
- RP
- notifications
- pagination

If a response is missing required data:

Fix the backend response.

Do not force the Flutter application to make unnecessary additional requests if the existing API contract can reasonably provide the data.

==================================================
STEP 4 — AUTHORIZATION AUDIT
==================================================

Verify every protected endpoint.

Check:

- Authentication middleware
- Ownership checks
- Game membership checks
- User-specific resources
- Wallet access
- Notifications
- Profile
- Game history
- Ranking

A user must never be able to access another user's private information by changing an ID in the URL.

Test IDOR scenarios.

Examples:

User A:

GET /users/UserB

must fail.

User A:

GET /games/GameB

must fail if GameB is private and User A is not a participant.

User A:

GET /wallet/UserB

must fail.

==================================================
STEP 5 — WALLET API AUDIT
==================================================

Verify:

- Initial 500 Coins
- Join deduction 500
- Rewarded Ad +500
- Rewarded Ad only when balance == 0
- Refund +500
- First place +1000
- Second place +500
- Third +0
- Fourth +0

Verify:

No endpoint trusts a client-provided wallet balance.

The server must always read the authoritative balance.

Verify idempotency for:

- Join
- Refund
- Reward
- Settlement
- Rewarded Ad

==================================================
STEP 6 — GAME API AUDIT
==================================================

Verify complete lifecycle:

WAITING
→ DRAFTING
→ LIVE
→ FINISHED

Cancellation:

WAITING / DRAFTING / LIVE
→ CANCELLED

Verify:

- Exactly 4 participants required for competition.
- Joining is allowed while the room is accepting players.
- Joining is allowed even when the real-world match is already LIVE.
- Late joiners receive full match fantasy points.
- Incomplete room at match start is cancelled.
- 500 Coins refunded.
- Match cancellation causes refund.
- Postponed fixture handling.
- Suspended fixture remains active when appropriate.
- FINISHED games cannot accept joins.
- CANCELLED games cannot accept joins.

==================================================
STEP 7 — DRAFT API AUDIT
==================================================

Verify:

- Exactly 2 selections per user.
- 8 unique players.
- Snake Draft.
- 35 second turns.
- Server controls turn expiration.
- Auto-pick uses deterministic player rating.
- Already-selected players cannot be selected.
- Client cannot select for another user.
- Client cannot select outside its turn.
- Client cannot select an already taken player.

Verify concurrency protection.

Two users must never successfully select the same football player.

==================================================
STEP 8 — SCORING API AUDIT
==================================================

Verify server-side scoring.

The client must never submit final fantasy points.

Verify:

Goal +40
Assist +20
Big Chance Created +5 only when verified
Successful Pass +1
Failed Pass -1
Tackle +3
Yellow -5
Red -20
Clean Sheet +20
Goalkeeper Save +10

Verify:

- Clean Sheet requires >= 60 minutes.
- Zero goals conceded while player was on pitch.
- Key Passes are NOT used as Big Chance Created.
- Provider mapping remains isolated.

==================================================
STEP 9 — FINAL SETTLEMENT AUDIT
==================================================

Verify:

1st:

1000 Coins
+3 RP

2nd:

500 Coins
+1 RP

3rd:

0 Coins
0 RP

4th:

0 Coins
-1 RP

Verify deterministic tie-breaking:

1. Fantasy Points
2. Goals
3. Assists
4. participantId

Verify:

- No shared rank.
- No duplicate settlement.
- No duplicate wallet reward.
- No duplicate RP.
- CANCELLED games cannot settle.

==================================================
STEP 10 — RANKING API AUDIT
==================================================

Verify:

GET /api/v1/ranking

GET /api/v1/ranking/me

GET /api/v1/seasons

GET /api/v1/seasons/:seasonId/ranking

Verify:

- Active season.
- Historical seasons.
- Negative RP.
- Deterministic ranking.
- Current user rank.
- Season isolation.

==================================================
STEP 11 — NOTIFICATION API AUDIT
==================================================

Verify:

GET /api/v1/notifications

PATCH /api/v1/notifications/:id/read

PATCH /api/v1/notifications/read-all

Verify:

- User isolation.
- Pagination.
- Unread state.
- Read timestamp.
- Idempotent read.
- GAME_FINISHED.
- GAME_CANCELLED.
- GAME_REFUNDED.
- SEASON_STARTED.

==================================================
STEP 12 — SOCKET.IO AUDIT
==================================================

Inventory every implemented Socket.IO event.

For each:

- Event
- Sender
- Receiver
- Authentication
- Payload
- UI consumer
- Frequency
- Persistence requirement

Verify private user rooms.

Verify game rooms.

Verify users cannot subscribe to unauthorized private game/user rooms.

Verify important events:

game:state
game:draft-turn
game:player-selected
game:auto-pick
game:live-event
game:ranking
game:finished
wallet:updated
notification:new
ranking:updated

Only keep events that are actually needed.

Do not invent unnecessary events.

==================================================
STEP 13 — ERROR CONTRACT
==================================================

Audit all API errors.

Use consistent structure.

Example:

{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Insufficient Coins."
  }
}

Do not expose:

- Stack traces
- SQL errors
- Internal filesystem paths
- Secrets
- API keys
- Database credentials

Verify HTTP status codes.

==================================================
STEP 14 — SECURITY AUDIT
==================================================

Check:

- Authentication
- Authorization
- IDOR
- Input validation
- SQL injection protection through Sequelize
- Mass assignment
- Rate limiting where needed
- CORS
- Helmet/security headers
- JWT validation
- Password hashing
- Sensitive data exposure
- Socket authentication
- Socket room authorization
- Wallet manipulation
- Game manipulation
- Draft manipulation
- Score manipulation

Do NOT introduce unnecessary security packages.

Use the existing architecture.

==================================================
STEP 15 — DATABASE/API CONSISTENCY
==================================================

Verify all API operations match Sequelize models.

Check:

- Foreign keys
- Unique constraints
- Indexes
- Nullable fields
- Enum values
- Transaction boundaries

Identify N+1 query problems where obvious.

Do not perform premature optimization.

==================================================
STEP 16 — FIX REAL PROBLEMS
==================================================

After the audit:

Fix only actual problems found.

Examples:

- Missing endpoint.
- Missing field.
- Wrong authorization.
- Wrong response.
- Broken validation.
- Incorrect business rule.
- Missing transaction.
- Missing idempotency.
- Security vulnerability.

Do not rewrite working code unnecessarily.

==================================================
STEP 17 — TEST
==================================================

Run:

- Unit tests
- Integration tests
- API tests
- Existing tests

Also test:

- Authentication failures.
- Authorization failures.
- Wallet race conditions.
- Duplicate requests.
- Duplicate settlement.
- Duplicate refund.
- Duplicate rewarded ad claim.
- Concurrent draft selections.
- Concurrent game joining.
- Unauthorized Socket.IO access.

Fix failures caused by this audit.

==================================================
FINAL DOCUMENTATION
==================================================

Create:

/docs/14-ui-api-audit.md

And:

/docs/15-api-reference.md

15-api-reference.md must contain the final implemented REST API reference.

For every endpoint include:

- Method
- Path
- Auth
- Request
- Response
- Errors
- UI consumer

Also create:

/docs/16-realtime-reference.md

Document final Socket.IO events.

==================================================
IMPORTANT
==================================================

Do NOT implement:

- Admin dashboard
- Payment
- Firebase Push Notifications
- New game mechanics
- New scoring rules
- New competitions

This phase is ONLY:

FINAL API AUDIT
+
UI CONTRACT VALIDATION
+
SECURITY REVIEW
+
FIX REAL ISSUES

When complete report exactly:

"PHASE 16 API AUDIT COMPLETE"

Then summarize:

- Total implemented endpoints
- Missing endpoints
- Fixed endpoints
- Security issues found
- Authorization issues found
- Wallet issues found
- Game issues found
- Socket issues found
- Tests executed
- Remaining issues







# PHASE 17 — END-TO-END BACKEND VALIDATION

The backend implementation is now substantially complete.

The project already contains:

- MySQL
- Sequelize
- Models
- Associations
- Controllers
- Services
- REST APIs
- Authentication
- Wallet
- Game lifecycle
- Game joining
- Refunds
- Snake Draft
- Socket.IO
- Fantasy scoring
- API-Football integration
- Football synchronization
- Live scoring
- Final game settlement
- Global ranking
- Seasons
- Notifications

DO NOT add new features.

DO NOT redesign the architecture.

DO NOT replace MySQL.

DO NOT replace Sequelize.

DO NOT replace existing controllers/services.

DO NOT rewrite working code unnecessarily.

The purpose of this phase is ONLY to validate that the existing backend works correctly as one complete system.

==================================================
STEP 1 — READ THE PROJECT
==================================================

Read:

/business-decisions.md

/docs/
/ui/

Inspect the actual implemented backend.

Identify:

- Routes
- Controllers
- Services
- Models
- Jobs/workers
- Socket.IO handlers
- Football provider
- Scoring engine
- Settlement
- Ranking
- Notifications

Do not assume documentation is correct if implementation differs.

==================================================
STEP 2 — BUILD AN END-TO-END TEST PLAN
==================================================

Create:

/docs/19-end-to-end-test-plan.md

The test plan must cover the complete application lifecycle.

==================================================
SCENARIO A — REGISTRATION
==================================================

Create 4 test users.

Verify:

- Registration succeeds.
- Password is hashed.
- JWT/login works.
- Each user receives exactly 500 Coins.
- Welcome bonus transaction exists.
- Duplicate welcome bonus cannot occur.

==================================================
SCENARIO B — GAME JOIN
==================================================

Create/find a valid football fixture.

Create or find a WAITING game.

Join with all 4 users.

Verify:

- Each user pays exactly 500 Coins.
- Each user becomes a participant.
- No user can join the same game twice.
- Fifth user cannot join.
- A user with insufficient balance cannot join.
- Wallet transactions are correct.

==================================================
SCENARIO C — DRAFT
==================================================

Run the Snake Draft.

Verify:

Round 1:

P1 → P2 → P3 → P4

Round 2:

P4 → P3 → P2 → P1

Verify:

- 35 second turns.
- Only current participant can select.
- Exactly 2 selections per participant.
- 8 unique football players.
- Same football player cannot be selected twice.
- Expired turn triggers deterministic auto-pick.
- Auto-pick emits game:auto-pick.
- Game moves to LIVE after draft completion.

==================================================
SCENARIO D — LIVE GAME
==================================================

Use available football provider/test data.

Verify:

- Fixture events are ingested.
- Selected players receive normalized statistics.
- Scoring engine calculates fantasy points.
- Live rankings update.
- Client cannot submit fantasy points manually.
- Duplicate football events do not duplicate points.

==================================================
SCENARIO E — LATE JOIN
==================================================

Test joining a game while the real-world fixture is already LIVE.

Verify:

- Join is allowed while the room accepts players.
- User pays 500 Coins.
- User completes draft.
- User receives FULL MATCH fantasy points.
- Events that happened before joining are included.

==================================================
SCENARIO F — INCOMPLETE GAME
==================================================

Start a fixture with fewer than 4 participants.

Verify:

- Game becomes CANCELLED.
- Every participant receives exactly +500 Coins refund.
- Refund transaction exists.
- No winner rewards.
- No RP changes.
- Duplicate cancellation does not duplicate refunds.

==================================================
SCENARIO G — MATCH CANCELLATION
==================================================

Cancel/postpone a fixture in a way that prevents completion.

Verify:

- Game becomes CANCELLED.
- Every participant receives exactly +500 Coins refund.
- No settlement.
- No RP.
- Notification is created.
- Refund is idempotent.

==================================================
SCENARIO H — FINAL SETTLEMENT
==================================================

Finish a valid fixture.

Verify final scoring.

Rank participants using:

1. Fantasy Points DESC
2. Goals DESC
3. Assists DESC
4. participantId ASC

Verify:

1st:

+1000 Coins
+3 RP

2nd:

+500 Coins
+1 RP

3rd:

+0 Coins
0 RP

4th:

+0 Coins
-1 RP

Verify:

- Entry fee is NOT deducted again.
- Wallet reward happens exactly once.
- RP happens exactly once.
- Settlement happens exactly once.
- game:finished emitted after successful settlement.
- Final result endpoint returns correct results.

==================================================
SCENARIO I — REWARDED AD
==================================================

Test:

Balance = 500

Claim rewarded ad.

Expected:

❌ NOT_ELIGIBLE

Then:

Balance = 0

Claim rewarded ad.

Expected:

+500 Coins

Verify:

- Duplicate claim is protected.
- Client cannot specify reward amount.
- Server verifies balance.

==================================================
SCENARIO J — GLOBAL RANKING
==================================================

Verify:

- RP is associated with correct season.
- Leaderboard is correct.
- Negative RP works.
- Equal RP uses deterministic ordering.
- Current user rank works.
- Historical seasons remain available.

==================================================
SCENARIO K — NOTIFICATIONS
==================================================

Verify:

- Game finished notification.
- Game cancelled notification.
- Refund notification.
- Notification list.
- Mark as read.
- Mark all as read.
- User cannot access another user's notifications.
- Duplicate business operation does not duplicate notification.

==================================================
SCENARIO L — SECURITY
==================================================

Test IDOR and authorization:

- User A accessing User B profile.
- User A accessing User B wallet.
- User A accessing User B notifications.
- User A accessing private game of User B.
- User A selecting during User B's draft turn.
- User A selecting a player for User B.
- Client submitting fake fantasy points.
- Client submitting fake reward amount.
- Client submitting fake wallet balance.

All must fail safely.

==================================================
SCENARIO M — CONCURRENCY
==================================================

Test concurrent requests for:

- Two users joining the final available game slot.
- Two users selecting the same player.
- Duplicate game join.
- Duplicate refund.
- Duplicate settlement.
- Duplicate rewarded-ad claim.

Verify database transactions and unique constraints prevent inconsistent state.

==================================================
SCENARIO N — API CONTRACT
==================================================

Run through all implemented endpoints.

Verify:

- HTTP methods.
- Authentication.
- Authorization.
- Validation.
- Response structure.
- Error structure.
- Pagination.
- UI-required fields.

Compare against:

/docs/15-api-reference.md

==================================================
SCENARIO O — SOCKET.IO
==================================================

Verify:

- Authentication.
- Private user rooms.
- Game rooms.
- Authorization.
- game:state
- game:draft-turn
- game:player-selected
- game:auto-pick
- game:live-event
- game:ranking
- game:finished
- wallet:updated
- notification:new
- ranking:updated

Verify events are emitted only to authorized recipients.

==================================================
STEP 3 — AUTOMATED TESTS
==================================================

Implement missing automated tests required for the scenarios above.

Use the existing testing framework.

Do NOT introduce a new testing framework unless absolutely necessary.

Prefer integration tests for:

- Auth
- Wallet
- Games
- Draft
- Settlement
- Ranking
- Notifications

==================================================
STEP 4 — FIX ONLY REAL BUGS
==================================================

If tests reveal bugs:

Fix them.

Do NOT rewrite working architecture.

Do NOT change confirmed business rules.

Do NOT add speculative features.

==================================================
STEP 5 — API FOOTBALL
==================================================

The API-Football integration already exists.

Do NOT replace it.

Do NOT create a new provider.

Verify configuration through environment variables.

If a real API key is required to execute a live integration test and the key is missing:

DO NOT invent one.

Do NOT hardcode one.

Mark the integration test as:

BLOCKED — API_FOOTBALL_KEY not configured.

Continue testing all other backend functionality.

==================================================
STEP 6 — FINAL REPORT
==================================================

Create:

/docs/20-e2e-test-report.md

Include:

- Total tests
- Passed
- Failed
- Blocked
- Bugs fixed
- Security issues
- Concurrency issues
- API issues
- Socket issues
- Remaining limitations

When complete report exactly:

"PHASE 17 E2E VALIDATION COMPLETE"

Then summarize the results.