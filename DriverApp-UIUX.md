# Driver App UI/UX Guidelines

This document outlines a concise, general UI/UX specification to build a new Driver mobile app. It focuses on design foundations (colors, spacing, separators, backgrounds), navigation patterns, components, and critical flows tailored for drivers, without prescribing specific screen names.

## 1) Product Overview
- Purpose: Enable drivers to efficiently accept, navigate, and complete delivery tasks with minimal friction.
- Priorities: Speed, clarity, reliability, and safety while on the road.
- Platforms: Mobile (iOS/Android), built with React Native.

## 1.1) Design Foundations (General)
- Color System:
  - Roles: Primary (brand/CTAs), Secondary (support), Success, Warning, Error, Info, Neutral (grays).
  - Contrast: Meet WCAG AA for text/icons on backgrounds (≥ 4.5:1 for body, 3:1 for large text/icons).
  - Light Mode Tokens (example):
    - Background/Base: `#F7F8FA`
    - Surface/Card: `#FFFFFF`
    - On-Surface Text Primary: `#111827` (90% opacity on white)
    - On-Surface Text Secondary: `#6B7280` (60% opacity)
    - Divider/Border: `#E5E7EB`
    - Primary: your brand color (e.g., `#2563EB`), Primary-Pressed: darken by ~8–12%
    - Success `#16A34A`, Warning `#F59E0B`, Error `#DC2626`, Info `#0284C7`
  - Dark Mode Tokens (example):
    - Background/Base: `#0B0F14`
    - Surface/Card: `#121826`
    - On-Surface Text Primary: `#F3F4F6`
    - On-Surface Text Secondary: `#9CA3AF`
    - Divider/Border: `#1F2937`
    - Primary on Dark: keep hue; increase brightness/saturation for contrast.
  - State Overlays: Pressed/Focused overlays as translucent black/white (e.g., 8–12% for pressed) instead of hard tints.

- Spacing & Layout:
  - Grid: 8pt base with 4pt sub-steps when needed. Common scale: 4, 8, 12, 16, 20, 24, 32, 40.
  - Page gutters: 16–24pt; dense lists can use 12–16pt.
  - Component padding: Buttons 12–16pt vertical, 16–20pt horizontal; Cards 16–20pt internal padding.
  - Vertical rhythm: 8–12pt between related elements; 16–24pt between groups/sections.
  - Touch targets: ≥ 44x44pt; minimum 8pt spacing between tappable elements.

- Separators & Dividers:
  - Hairline dividers: 1px on iOS (align to pixel grid), 1dp on Android; color = neutral divider `#E5E7EB` (light) / `#1F2937` (dark).
  - Inset dividers: 16pt from left/right for lists with icons/avatars; full-bleed for system-level sections.
  - Use elevation (shadow) or contrast, not both: Prefer subtle shadows for surfaces, dividers for lists/forms.
  - Section headers: Use spacing and typography first; add a thin divider only if clarity is insufficient.

- Backgrounds & Surfaces:
  - App background: neutral, low-contrast color to reduce glare (see Background/Base tokens).
  - Surface hierarchy: Background < Card/Sheet < Modal. Each level has slightly higher elevation/contrast.
  - Cards: White (light) or near-black (dark) with 2–4dp elevation and 8pt radius; avoid heavy borders.
  - Sheets/Bottom sheets: Elevated surface (6–8dp), 16pt radius top corners, drag handle, scrim at 40–60%.
  - Overlays: Use blur on iOS sparingly; ensure legibility with dim scrim behind modals.
  - Map overlays: Place content on elevated surfaces with padding; avoid placing text directly over map without backing surface.

- Visual Density Modes (optional):
  - Comfortable (default while driving): larger spacing, larger text and buttons.
  - Compact (optional): reduced spacing for information-dense lists when stationary.

- Iconography & Imagery:
  - Icons: 24pt base; use filled icons for primary actions, outlined for secondary.
  - Imagery: Keep minimal; prefer functional graphics (maps, pins) over decorative photos.

- Motion & Feedback:
  - Duration: 150–250ms for transitions; 80–120ms for micro-interactions.
  - Easing: Standard material/ios curves; avoid excessive motion while driving.
  - Haptics: Light impact for confirmations; avoid repeated vibrations.

## 2) Personas & Goals
- Driver: Time-constrained, often on the move, needs glanceable info, low cognitive load, quick actions.
- Goals:
  - Go online/offline and manage availability.
  - Discover and accept orders promptly.
  - Navigate to pickup/dropoff with minimal taps.
  - Communicate with customer/support.
  - Provide proof of delivery and complete jobs accurately.

## 3) Information Architecture & Navigation
- Global navigation: Bottom Tab Bar or Drawer, chosen based on feature breadth and frequency of access.
- Primary areas (example, customizable): Status/Availability, Tasks, Activity, Settings.
- Hierarchy: Keep depth shallow (≤2–3 levels). Use Tabs for top-level, Stacks for details.
- Secondary navigation: Contextual headers with back navigation on detail screens; bottom sheets to present details over maps or primary context.

## 4) Global Patterns
- Layout: 8pt grid; generous touch targets (min 44x44pt); safe areas respected.
- Typography: 3–4 levels (Title, Subtitle, Body, Caption). Favor readability over density.
- Color:
  - Primary: Brand color for CTAs (Accept, Go Online).
  - Status: Green=Online/Delivered, Orange=In-progress, Red=Issue/Declined, Gray=Disabled.
  - High contrast for legibility; pass WCAG AA where possible.
- States: Default, Hover (web), Pressed, Focused, Disabled, Loading.
- Feedback: Toasts for non-blocking updates; dialogs for confirmations; banners for persistent alerts.
- Connectivity: Offline banner with limited functionality and queued actions.
- Localization: All user-facing text externalized; support RTL.
- Accessibility: VoiceOver/TalkBack labels, large text support, color-independent cues.

## 4.1) Headers (App Bars)
- Purpose: Provide context (title), navigation (back/menu), and primary contextual actions.
- Structure:
  - Left: Back button when in a sub-view; otherwise menu or profile.
  - Center: Title (single line, truncates with ellipsis). Optional subtitle for secondary context.
  - Right: 0–2 high-value actions (e.g., search, filter, overflow). Avoid more than 2.
- Sizing:
  - Default height: 56pt (compact) to 64pt (comfortable). Increase to 72pt with subtitle if needed.
  - Touch targets: ≥44x44pt; min 8pt spacing between icons.
- Typography:
  - Title: Medium/Semibold weight; 17–20pt depending on density.
  - Subtitle: Regular; 13–15pt; secondary color.
- Colors & Elevation:
  - Use Surface color; keep high contrast for title/actions (meets AA).
  - Elevation: 0–2dp when at top; increase to 4dp on scroll for separation (or add hairline divider).
  - Support translucent/blurred headers where content scrolls under; ensure contrast with scrim.
- Behavior:
  - Scroll: Collapse on scroll if content benefits from more space; pin actions when necessary.
  - Large Titles (optional): Present large title (up to ~34pt) that collapses to standard size on scroll.
  - Avoid overloading: Put secondary actions in an overflow menu.
- Platform:
  - iOS: Respect safe areas; use large titles where appropriate.
  - Android: Material App Bar patterns; consistent back behavior with the system back.

 
 
 
## 7) Components & Patterns
- Task Card: Title, locations, status chips (ASAP/Scheduled), payout/metrics, distance/time, timer.
- Status Chips: Online, Incoming, En route, At first location, Collected, At final location, Completed, Canceled.
- Bottom Sheet: Drag handle, snap points (peek/half/full), scrollable details.
- Action Bar: Persistent CTAs relevant to current step.
- Map Annotations: Key locations pins, driver location, route polyline.

## 8) Empty / Loading / Error States
- Empty Orders: Illustration, short message, CTA to go online or refresh.
- Loading: Skeletons for cards and lists; map shimmer.
- Errors: Clear messages with recovery actions (Retry, Contact support).

## 9) Visual Design Tokens (Example)
- Spacing: 4, 8, 12, 16, 24, 32.
- Corners: 8 for cards/buttons, 16 for sheets.
- Elevation: Cards=2, Sheets=8, Modals=16.
- Colors: Primary, Success, Warning, Error, Surface, On-surface; ensure AA contrast.

 

## 11) Security & Privacy
- Protect PII: Phone masking, limited data exposure, secure storage.
- Session: Token-based auth with refresh; biometric quick unlock.
- Media: Encrypt at rest; upload over TLS; expiring URLs.

## 12) Content & Microcopy Guidelines
- Tone: Clear, concise, action-oriented.
- Buttons: Verb-first ("Accept Order", "Navigate", "Mark as Delivered").
- Errors: State what happened, why (when useful), and how to fix.

## 13) Quality Bar & NFRs
- App start < 2s on modern devices; interaction response < 100ms.
- No blockers with poor connectivity; graceful degradation.
- Accessibility: Screen-reader pass, large text support, color-safe.

---

This guideline should be adapted to your brand and regional rules. It is intentionally general and screen-agnostic to guide a fresh Driver app build focused on strong foundations (colors, spacing, separators, backgrounds, navigation patterns, components, and flows).
