---
name: UFL Pro Sports-Gaming
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#b9ccb2'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#84967e'
  outline-variant: '#3b4b37'
  surface-tint: '#00e639'
  primary: '#ebffe2'
  on-primary: '#003907'
  primary-container: '#00ff41'
  on-primary-container: '#007117'
  inverse-primary: '#006e16'
  secondary: '#fff9ef'
  on-secondary: '#3a3000'
  secondary-container: '#ffdb3c'
  on-secondary-container: '#725f00'
  tertiary: '#f9f8ff'
  on-tertiary: '#002e69'
  tertiary-container: '#cedcff'
  on-tertiary-container: '#005dc5'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#72ff70'
  primary-fixed-dim: '#00e639'
  on-primary-fixed: '#002203'
  on-primary-fixed-variant: '#00530e'
  secondary-fixed: '#ffe16d'
  secondary-fixed-dim: '#e9c400'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a41'
  on-tertiary-fixed-variant: '#004493'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  pitch-green: '#00FF41'
  championship-gold: '#FFD700'
  surface-obsidian: '#000000'
  surface-charcoal: '#1C1C1E'
  status-red: '#FF3B30'
  glass-overlay: rgba(255, 255, 255, 0.1)
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '900'
    lineHeight: 48px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  stats-mono:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 22px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  margin-mobile: 16px
  margin-desktop: 24px
  gutter: 12px
  stack-tight: 4px
  stack-loose: 20px
---

## Brand & Style

The design system is built on a "Stadium-at-Night" aesthetic—a premium, high-stakes environment that blends the intensity of live football with the sleek precision of modern eSports. The target audience is the competitive "super-fan" who demands real-time responsiveness and an immersive, cinematic experience.

The visual style is a hybrid of **Minimalism** and **Glassmorphism**, set against a deep, high-contrast backdrop. By utilizing obsidian surfaces and vibrant, neon-inflected accents, the interface directs focus entirely toward live data and player performance. The feel is aggressive yet refined, prioritizing legibility under pressure and the emotional high of a win.

## Colors

This design system uses a **dark-first** palette to maximize the vibrance of functional highlights.

- **Primary (Pitch Green):** Used exclusively for high-energy interaction points, "LIVE" indicators, and the user's active selections. It symbolizes the field of play.
- **Secondary (Championship Gold):** Reserved for the "Winner's Circle"—1st place rankings, premium rewards, and high-value achievements.
- **Surface Strategy:** We use a tiered black system. `#000000` is for the deepest background layer, while `#1C1C1E` (Charcoal) is used for interactive cards to provide soft contrast without breaking the dark immersion.
- **Glassmorphism:** Semi-transparent layers (`glass-overlay`) are used for transient elements like bottom sheets and HUD overlays to maintain spatial awareness of the game state beneath.

## Typography

The typography system is engineered for "glanceability" during live events. We utilize **Inter** across all levels, leaning heavily on its variable weights to create a clear hierarchy.

- **Display & Headlines:** Use 'Extra Bold' and 'Black' weights with tight letter-spacing to mimic sports broadcast graphics.
- **Stats:** Numbers must use tabular figures (`tnum`) to ensure scoreboards and timers don't "jump" as values increment.
- **Uppercase Usage:** Reserved for labels (e.g., "LIVE," "GK," "TAKEN") and primary branding to maintain an assertive, competitive tone.

## Layout & Spacing

The design system employs an **8px base grid** with a fluid-width logic for mobile and a centered fixed-width container for larger displays.

- **Information Density:** The "Game Room" and "Draft" screens utilize a "tight" spacing model (4px-8px gaps) to maximize data density, allowing players to see more stats without scrolling.
- **Safe Zones:** Content must respect a 16px lateral margin on mobile devices.
- **Reflow:** On tablets and larger screens, the layout shifts from a single-column stack to a multi-pane interface (e.g., Live Feed on the left, Leaderboard on the right) to utilize the extra horizontal real estate.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layering** and **Backdrop Blurs** rather than traditional drop shadows.

- **Level 0 (Base):** Deep Obsidian (`#000000`).
- **Level 1 (Cards):** Charcoal (`#1C1C1E`) with a subtle 1px inner border (opacity 10% white) to define edges.
- **Level 2 (Overlays):** Glassmorphic surfaces with a 20px blur and a semi-transparent white tint. This is used for "HUD" elements that float over the pitch or player list.
- **Level 3 (Highlights):** Primary Green or Gold glow effects (soft outer shadows with high spread and low opacity) are used to indicate "Turn Active" or "Winner" states, simulating light emitting from the UI.

## Shapes

The shape language is characterized by **generous, smooth radii** that contrast with the aggressive typography.

- **Standard Cards:** 16px (`rounded-lg`) is the default for all match and player containers to create a modern, premium handheld feel.
- **Interactive Elements:** Buttons and input fields should follow the 16px standard, though small tags (like "LIVE") may use a full pill-shape for distinctiveness.
- **Media:** Player portraits and team badges are always contained in circular masks.

## Components

- **Primary Buttons:** High-contrast Pitch Green backgrounds with Black text. Use uppercase `label-caps` for maximum impact.
- **Glass Cards:** Used for secondary information. These should feature a 1px border and a backdrop blur to separate stats from the background noise.
- **Draft Slots:** Rectangular containers with 16px corners. When "Active," the border should pulse with a 2px Pitch Green stroke.
- **Status Badges:** "LIVE" badges use a solid Green background. "TAKEN" or "OUT" badges use a desaturated charcoal with a 50% opacity strike-through.
- **Input Fields:** Darker than the card surface with a subtle focus ring in Primary Green.
- **Leaderboards:** Use alternating row highlights (Zebra striping) using `#1C1C1E` and `#2C2C2E` for maximum legibility in long lists.