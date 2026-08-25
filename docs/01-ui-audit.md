# 01 — UI Audit & Screen Analysis

This document provides a screen-by-screen audit of all 13 UI screens found in `/ui/` for the UFL Live Fantasy Football application.

---

## 1. Register Screen (`/ui/register/code.html`)

- **Screen Name**: Register ("Join the League")
- **Purpose**: New user account creation and welcome bonus presentation.
- **Navigation Entry Point**: App initial launch or "Create Account" link from Login.
- **Visible Data**:
  - UFL App Branding & Logo
  - Header Title: "Join the League"
  - Subtitle: "Create your profile to start competing in global tournaments."
  - Form Labels: Username, Email, Password, Confirm Password
  - Welcome Bonus Banner: "500 Coins instantly"
  - Navigation link: "Already have an account? Login here"
- **Form Inputs & Buttons**:
  - `username` (text input with `person` icon, placeholder `GamerTag99`)
  - `email` (email input with `mail` icon, placeholder `player@domain.com`)
  - `password` (password input with `lock` icon, placeholder `••••••••`)
  - `confirm_password` (password input with `lock_reset` icon, placeholder `••••••••`)
  - Submit Button: `CREATE ACCOUNT` (with arrow icon & shimmer effect)
- **User Actions**:
  - Enter credentials
  - Submit registration form
  - Click "Login here" link to navigate to Login screen
- **UI States**:
  - Normal/Default state
  - Focus state (Pitch green glow on active input border)
  - Hover / Active button states
- **Real-time Elements**: None.
- **Backend Requirements**:
  - `POST /api/v1/auth/register` (creates `User` & `Wallet` initialized with 500 Coins)

---

## 2. Login Screen 1 (`/ui/login_1/code.html`)

- **Screen Name**: Login Screen 1 ("Welcome Back")
- **Purpose**: Authenticate existing users into the application.
- **Navigation Entry Point**: App launch (if unauthenticated) or "Login here" link from Register screen.
- **Visible Data**:
  - Hero Header: "WELCOME BACK", Subtitle: "Enter the arena."
  - Form Fields: Email or Phone, Password
  - "Forgot Password?" link
  - Submit Button: `LOGIN`
  - Link: "Don't have an account? Create Account"
- **Form Inputs & Buttons**:
  - `email` (text input with `person` icon, placeholder `player@ufl.com`)
  - `password` (password input with `lock` icon, visibility toggle button)
  - Toggle Password Visibility Button (`visibility_off` icon)
  - Submit Button (`LOGIN` uppercase button with arrow)
- **User Actions**:
  - Toggle password visibility
  - Click "Forgot Password?"
  - Submit Login form
  - Click "Create Account" link
- **UI States**:
  - Default input states
  - Focus states (Pitch green ring)
  - Loading State (submit button disabled, spinner `refresh` icon animated, opacity 80%)
  - Success Feedback (button temporarily changes to Championship Gold)
- **Real-time Elements**: None.
- **Backend Requirements**:
  - `POST /api/v1/auth/login` (verifies credentials, returns JWT auth token & user profile)

---

## 3. Login Screen 2 (`/ui/login_2/code.html`)

- **Screen Name**: Login Screen 2 ("Welcome Back - Variant")
- **Purpose**: Secondary variant of the login interface (identical to Login Screen 1 in core structure).
- **Navigation Entry Point**: Alternative Auth Entry.
- **Visible Data & Actions**: Identical to `login_1`.
- **Backend Requirements**: Shared with `login_1`.

---

## 4. Home Dashboard Screen (`/ui/home_dashboard/code.html`)

- **Screen Name**: Home Dashboard
- **Purpose**: Main hub displaying user overview, active live match hero card, live matches carousel, upcoming match drafts, and primary navigation bar.
- **Navigation Entry Point**: Successful authentication or "HOME" tab tap on bottom nav.
- **Visible Data**:
  - Top Bar: App Logo, Title "HOME", User Coin Balance pill (`500 Coins`), User Profile Avatar ringed in Pitch Green.
  - Welcome Banner: "Welcome back, Alex. Your squad is ready for matchday."
  - Featured LIVE Match Hero Card:
    - Background image of eSports stadium at night
    - "LIVE 72'" pulsing badge
    - Teams: MCI (Manchester City) vs ARS (Arsenal) with crest logos
    - Live Score: `2 - 1`
    - CTA Button: `JOIN GAME ROOM`
  - "Live Now" Section:
    - Horizontal scroll cards (RMA 1 - 0 BAR 45+2', BAY 0 - 0 DOR 12')
    - "VIEW ALL" button
  - "Upcoming Drafts" Section:
    - LIV vs CHE (Starts in 2h 15m) with `DRAFT` button
    - JUV vs MIL (Starts in 4h 30m) with `DRAFT` button
  - Fixed Bottom Navigation Bar (HOME active, MATCHES, RANKING, WALLET, PROFILE)
- **User Actions**:
  - Tap "JOIN GAME ROOM" on hero match
  - Tap "VIEW ALL" for Live matches
  - Tap a Live match card
  - Tap "DRAFT" on upcoming match card
  - Tap bottom navigation items
- **UI States**:
  - Animated live status pulsing badge
  - Horizontal scrolling list states
- **Real-time Elements**:
  - Live score changes (`match:updated`)
  - Live elapsed time ticker (`match:updated`)
  - User wallet balance updates (`wallet:updated`)
- **Backend Requirements**:
  - `GET /api/v1/me`
  - `GET /api/v1/matches/featured`
  - `GET /api/v1/matches/live`
  - `GET /api/v1/matches/upcoming`

---

## 5. Match Discovery Screen (`/ui/match_discovery/code.html`)

- **Screen Name**: Match Discovery ("Matches")
- **Purpose**: Browse, search, filter, and discover live and upcoming football matches eligible for fantasy room entry.
- **Navigation Entry Point**: "MATCHES" tab on bottom nav bar or "VIEW ALL" from Home.
- **Visible Data**:
  - Top Header Bar: Title "MATCHES", Coin Balance (`500`), Profile Avatar
  - Search Input: "Search teams, leagues, players..." with search icon
  - League Filter Pills: `ALL` (active pitch green), `Premier League`, `La Liga`, `UCL`, `SPL`
  - Status Tabs: `Live` (active container), `Upcoming`
  - Match Cards:
    - Card Header: Competition Name (e.g. Premier League), Live Time Tag (e.g., `68' LIVE`)
    - Matchup Display: Team Crests (ARS vs CHE, RMA vs ATM), Team Codes, Live Score (`2-1`, `0-0`)
    - CTA Button: `JOIN GAME | 500 Coins`
  - Infinite scroll / Loading spinner at bottom
- **User Actions**:
  - Type search query in search input
  - Filter by League pill
  - Switch between Live and Upcoming tabs
  - Click `JOIN GAME` (deducts 500 Coins & routes to Waiting Room)
- **UI States**:
  - Active/Inactive League Pill states
  - Active/Inactive Tab states
  - Pulsing live time indicator
  - Loading spinner state
- **Real-time Elements**:
  - Real-time score updates (`match:updated`)
  - Real-time match minute updates (`match:updated`)
- **Backend Requirements**:
  - `GET /api/v1/matches?status=live|upcoming&league_id=X&q=Y`
  - `POST /api/v1/games/join`

---

## 6. Waiting Room Screen (`/ui/waiting_room/code.html`)

- **Screen Name**: Waiting Room / Matchmaking ("Match Details")
- **Purpose**: Matchmaking lobby where 4 players gather before entering the Snake Draft.
- **Navigation Entry Point**: Clicking `JOIN GAME` or `JOIN GAME ROOM` from Home or Match Discovery.
- **Visible Data**:
  - Header: Back button, Logo, Title "Match Details"
  - Immersive eSports Arena background with ambient particle animations
  - Top Pill: "LIVE MATCHMAKING" with red pulsing dot
  - Room Meta: `Room #8821`, Status `3/4 Players Joined`
  - 4-Player Grid Slots:
    - Slot 1 (YOU): Avatar, Username (`GamerTag88`), `YOU` badge, `READY` badge (Pitch green border)
    - Slot 2 (Player 2): Avatar, Username (`StrikerX`), `READY` badge
    - Slot 3 (Player 3): Avatar, Username (`Viper99`), `READY` badge
    - Slot 4 (Empty): Pulsing search icon, "Searching..." label, dashed border
  - Countdown Area: "GAME STARTS IN" with gold glowing display (`10` -> `GO`), Pitch green progress bar
- **User Actions**:
  - Tap Back button (leave matchmaking room)
  - Wait for room to fill (4/4 players)
- **UI States**:
  - Searching / Empty slot state
  - Player ready slot state
  - Active user highlight (Pitch green ring)
  - Countdown state (`10`, `9`, ..., `GO` in Pitch green)
- **Real-time Elements**:
  - Player joined/left event (`game:state` socket event)
  - Room full trigger (`game:state` state='DRAFT_STARTING')
  - Countdown tick synchronization
- **Backend Requirements**:
  - `GET /api/v1/games/:id/waiting-room`
  - Socket event: `game:join-room`, `game:leave-room`, broadcast `game:player-joined`

---

## 7. Snake Draft Screen (`/ui/snake_draft/code.html`)

- **Screen Name**: Snake Draft ("Draft Player")
- **Purpose**: Real-time 4-player draft where users take turns selecting 2 football players each for their squad.
- **Navigation Entry Point**: Transitioned automatically from Waiting Room when 4 players are matched.
- **Visible Data**:
  - Match Header HUD: Team logos (RMA vs FCB), Live score (`1 - 0`), Minute (`Live 42'`), Phase Info: "Your Pick", "Round 1/2"
  - Countdown Timer Focus Area: Animated Pitch Green timer (`35` Seconds Remaining), turns red when <= 10s
  - Position Filter Tabs: `ATTACKERS` (active), `MIDFIELDERS`, `DEFENDERS`, `GOALKEEPERS`
  - Football Player Selection Cards:
    - Available Star Player Card: Border accent, headshot, Name (`V. Júnior`), `STAR` badge, Team badge, Position (`FWD`), Points (`12.5 PTS`), `SELECT` button
    - Taken Player Card: Grayscale background, locked overlay icon, line-through name (`Lewandowski`), `TAKEN` badge (disabled)
    - Standard Available Card: Headshot, Name (`Rodrygo`, `Raphinha`), Team badge, Position, Points, `SELECT` button
  - Fixed Bottom Draft Order HUD:
    - "Draft Order" header, "Snake Draft Active" pulsing pill
    - Turn Cards:
      - R1.1 (Completed checkmark)
      - R1.2 (Completed checkmark)
      - R1.3 (Active Turn - YOU, Pitch green border & glow, `YOU` badge)
      - R1.4 (Upcoming player avatar)
      - Snake turn-around icon (`u_turn_right`)
      - R2.1 (Round 2 reversed turn order)
- **User Actions**:
  - Switch position tabs
  - Click `SELECT` on an available player card
- **UI States**:
  - Timer green (>10s) vs Timer red (<=10s)
  - Active user turn vs Waiting for opponent turn
  - Player available vs Player taken
- **Real-time Elements**:
  - Draft turn timer sync (`game:draft-turn`)
  - Player selection broadcast (`game:player-selected`)
  - Auto-pick trigger on timeout (`game:auto-pick`)
  - Draft completed state transition to Live Game Room
- **Backend Requirements**:
  - `GET /api/v1/games/:id/draft`
  - `POST /api/v1/games/:id/select-player`
  - Socket events: `game:draft-turn`, `game:player-selected`, `game:auto-pick`

---

## 8. Live Match Leaderboard Screen (`/ui/live_match_leaderboard/code.html`)

- **Screen Name**: Live Match & Leaderboard ("Match Details")
- **Purpose**: Real-time tracking of live fixture scoring, user's drafted player events, play-by-play feed, and live room rankings.
- **Navigation Entry Point**: Transited from Snake Draft or tapped from active game list.
- **Visible Data**:
  - Live Scoreboard Header: Stadium backdrop, Live Badge (`67' LIVE`), Teams (BAR vs RMA), Scores (`2 - 1`)
  - Sub-Navigation Tabs: `Feed` (active), `Leaderboard`
  - **Feed View**:
    - "Your Players" Section: Total drafted player points summary (`120 PTS`), Horizontal Player Cards (M. Salah: +78 PTS, K. De Bruyne: +42 PTS)
    - "Play-by-Play" Section: Timeline line, Live Event Cards:
      - GOAL! Event (+40 PTS, Mohamed Salah, assist Alexander-Arnold, Pitch Green badge)
      - ASSIST Event (+20 PTS, Kevin De Bruyne)
      - TACKLE Event (+3 PTS, Virgil Van Dijk)
      - FOUL Event (-1 PT, Camavinga)
  - **Leaderboard View**:
    - Header: "Live Ranking", `LIVE` badge
    - 1st Place Card: `1`, User `Alex_Striker`, `420.5 pts`, `2,450` coins/RP
    - 2nd Place Card (YOU): `2`, `YOU` badge, `RISING` pill, Pitch Green highlighted card, `395.2 pts`, `2,380` (+45 RP)
    - 3rd Place Card: `3`, User `Mia_Playmaker`, `380.0 pts`
    - 4th Place Card: `4`, User `GhostRunner`, `342.8 pts`
- **User Actions**:
  - Toggle between `Feed` and `Leaderboard` tabs
  - Filter events
  - Tap event card for visual pulse feedback
- **UI States**:
  - Feed active vs Leaderboard active
  - Highlighted "YOU" row on leaderboard
  - Real-time slide-up animation for new incoming feed items
- **Real-time Elements**:
  - Real-time fixture events (`game:live-event`)
  - Real-time score & minute update (`match:updated`)
  - Real-time fantasy points recalculation (`game:ranking`)
  - Real-time leaderboard re-ranking
- **Backend Requirements**:
  - `GET /api/v1/games/:id/live`
  - Socket events: `game:live-event`, `game:ranking`, `game:finished`

---

## 9. Final Results Screen (`/ui/final_results/code.html`)

- **Screen Name**: Final Results ("FINAL STANDINGS")
- **Purpose**: Post-match summary showing podium winners, final fantasy points, coin payouts, season RP gains/losses, and confetti/coin shower animations.
- **Navigation Entry Point**: Triggered automatically when the live match finishes.
- **Visible Data**:
  - Top Badge: "Full Time", Header: "FINAL STANDINGS"
  - Podium Visualization (3D-style staggered podiums):
    - **1st Place (Center)**: Trophy icon, Gold crown ring avatar, Username `AlexPro`, `5,120 pts`, Reward: `+1,000 Coins`, `+3 RP`
    - **2nd Place (Left)**: Silver ring avatar, Username `GhostSniper`, `4,250 pts`, Reward: `+500 Coins`, `+1 RP`
    - **3rd Place (Right)**: Bronze ring avatar, Username `ShadowFX`, `3,980 pts`, Reward: `+250 Coins`, `0 RP`
  - 4th Place List Row: User `NeonStrike`, `3,100 pts`, `+100 Coins` (Note: UI displays 250 for 3rd and 100 for 4th; Business rule discrepancy to reconcile in Open Questions)
  - Bottom Fixed Bar: `Finish Game` CTA button (with arrow icon)
  - Canvas element for gold coin shower animation
- **User Actions**:
  - Click `Finish Game` (returns user to Home Dashboard / Wallet updated)
- **UI States**:
  - Staggered entry animation (Podium 3 -> Podium 2 -> Podium 1 -> Coin shower -> Other Ranks)
- **Real-time Elements**: None (Static settlement screen upon receipt of `game:finished` event).
- **Backend Requirements**:
  - `GET /api/v1/games/:id/results`
  - `POST /api/v1/games/:id/claim-rewards`

---

## 10. Wallet & Coins Screen (`/ui/wallet_coins/code.html`)

- **Screen Name**: Wallet & Coins ("Wallet")
- **Purpose**: View current coin balance, trigger rewarded ad top-ups, and review wallet transaction history.
- **Navigation Entry Point**: "WALLET" tab on bottom navigation bar or clicking top-bar coin balance.
- **Visible Data**:
  - Header: Logo, Title "Wallet", Coin Balance Pill (`500`), Profile Avatar
  - Balance Card: Gold monetization icon, Label "Total Balance", `500 COINS`
  - Quick Actions Section:
    - `Watch Ad` Button (Icon `play_circle`, "Get 500 Coins instantly", `+500 Coins` badge)
  - Transaction History Section:
    - "Game Reward" (+1,000 Coins, Today 14:30, `emoji_events` icon)
    - "Game Entry" (-500 Coins, Today 14:00, `sports_esports` icon)
    - "Welcome Bonus" (+500 Coins, Yesterday 09:15, `celebration` icon)
  - Bottom Navigation Bar (WALLET active)
- **User Actions**:
  - Click `Watch Ad` (opens Rewarded Ad flow)
  - Scroll transaction history
- **UI States**:
  - Normal wallet state
  - Zero balance state (Watch Ad button highlighted)
- **Real-time Elements**:
  - Real-time balance updates (`wallet:updated`)
- **Backend Requirements**:
  - `GET /api/v1/wallet`
  - `GET /api/v1/wallet/transactions`

---

## 11. Watch Ad for Rewards Screen (`/ui/watch_ad_for_rewards/code.html`)

- **Screen Name**: Rewarded Ad Screen ("Watch to Earn")
- **Purpose**: Play rewarded video advertisement to grant +500 Coins when user balance is 0.
- **Navigation Entry Point**: "Watch Ad" button in Wallet or Zero-Coins modal trigger.
- **Visible Data**:
  - Video Player Header HUD: "ADVERTISEMENT" badge, Close Button `X` (disabled during playback)
  - Video Content Area: Background footage of football player, Play icon
  - Video Footer HUD: Reward badge (`+500 COINS`), Time Remaining (`30s`), Pitch Green Progress Bar
  - Info Section: Gift icon, "Watch to Earn", "Support the game and claim your daily reward. Don't close the video until it finishes."
  - **Success Overlay** (Fades in when ad completes):
    - Gold coin icon glowing
    - Header: "Reward Claimed!"
    - Reward display: `+500`
    - CTA Button: `CONTINUE`
- **User Actions**:
  - Watch ad to completion
  - Click `CONTINUE` on success modal
  - Click Close `X` (enabled after ad completes)
- **UI States**:
  - Playing state (Close button disabled, countdown ticking `30s` -> `0s`)
  - Completed state (Close button enabled, Success Overlay visible)
- **Real-time Elements**: None.
- **Backend Requirements**:
  - `POST /api/v1/wallet/rewarded-ad/start`
  - `POST /api/v1/wallet/rewarded-ad/claim` (validates ad completion token, adds +500 Coins to Wallet)

---

## 12. Global Ranking Screen (`/ui/global_ranking/code.html`)

- **Screen Name**: Global Ranking / Leaderboard ("Ranking")
- **Purpose**: Season-long global leaderboard showing top competitive fantasy users and the current user's global position.
- **Navigation Entry Point**: "RANKING" tab on bottom navigation bar.
- **Visible Data**:
  - Top Header Bar: Logo, Title "Ranking", Coin Balance (`500`), Profile Avatar
  - Page Header: "GLOBAL RANKING", "2026/27 Season"
  - User Sticky Summary Card:
    - `Rank` (#1,402 in Gold)
    - `Pts` (12,450)
    - `Played` (342)
    - `Wins` (210 in Pitch Green)
  - Global Leaderboard List (Ranks 1 to 10):
    - Rank 1: Gold #1, Avatar with glow, `xX_Striker_Xx`, `94,200` points
    - Rank 2: #2, Avatar, `NeonGoalie`, `91,050` points
    - Rank 3: #3, Avatar, `PitchMaster99`, `88,700` points
    - Ranks 4–10: User Avatars, Usernames (`VortexKicker`, `CyberMidfield`, `ShadowStriker`, `TheWall1`, `EchoPass`, `NovaGoal`, `FrostDefend`), Points
  - Bottom Navigation Bar (RANKING active)
- **User Actions**:
  - Scroll global leaderboard list
- **UI States**:
  - Sticky top summary bar
  - Top 3 rank highlighting (Gold #1, Silver #2, Bronze #3 styling)
- **Real-time Elements**: None (Periodic cache update).
- **Backend Requirements**:
  - `GET /api/v1/ranking/global?season_id=X&page=1`
  - `GET /api/v1/ranking/me`

---

## 13. User Profile Screen (`/ui/user_profile/code.html`)

- **Screen Name**: User Profile ("Profile")
- **Purpose**: View user career statistics, recent match history, global rank, and access settings/profile editing.
- **Navigation Entry Point**: "PROFILE" tab on bottom navigation bar or clicking top-bar profile avatar.
- **Visible Data**:
  - Settings Button (icon `settings`)
  - Profile Header:
    - Large Avatar with Pitch Green glow ring and `edit` button
    - Username (`AlexPro`)
    - Global Rank Badge (`#1,402` in Gold, `12,450 RP`)
    - `EDIT PROFILE` CTA Button
  - Career Stats Grid (2x2):
    - `Total Games`: 342
    - `Total Wins`: 210 (Pitch Green border)
    - `Win Rate`: 61%
    - `Career Coins`: 85.2k (Gold border & background icon)
  - Recent Match History Section:
    - Header: "Recent Matches", `VIEW ALL` link
    - Match 1 (Win): `BAR 2-1 RMA`, `1st Place` (Gold badge), `+1,000 Coins`, `+3 RP` (Pitch Green accent)
    - Match 2 (2nd Place): `LIV 0-0 CHE`, `2nd Place`, `+500 Coins`, `+1 RP`
    - Match 3 (Loss/4th Place): `MCI 1-2 ARS`, `4th Place`, `0 Coins`, `-1 RP` (Error red text)
  - Bottom Navigation Bar (PROFILE active)
- **User Actions**:
  - Click Settings icon
  - Click `EDIT PROFILE`
  - Click `VIEW ALL` on Recent Matches
- **UI States**:
  - Win/Loss color accents on match history items
- **Real-time Elements**: None.
- **Backend Requirements**:
  - `GET /api/v1/me/profile`
  - `GET /api/v1/me/match-history`
  - `PATCH /api/v1/me/profile`
