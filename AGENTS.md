# Project rules
- Keep future-self personal inputs in the user's profile and validate them with the shared future-self-details parser; key daily message caches by user and inputs, and persist minimization per user on the device. Why: messages must reflect the user's latest goals while staying private.
- Send standard and checkpoint reminders through the minute scheduler using profile preferences and timezone; claim per-user delivery keys to prevent duplicates. Keep client initialization permission-safe and settings in NotificationSettingsCard. Why: edited times must apply with the app closed without duplicate local reminders.
- Store generated Web Push signing keys only in the service-role-only scheduler configuration; expose only the public key through an authenticated RPC and renew mismatched device subscriptions. Why: private signing material stays inaccessible to users.

- Visual tokens (colors, gradients, shadows, motion keyframes) live in `src/index.css`; `gold`/`brand` tokens alias the current accent so legacy classes follow the palette. Why: restyling happens in one place.
- Animated emojis use `src/components/ui/animated-emoji.tsx` (Noto webp, pauses off-screen) and completion bursts use `celebrate()` from `src/lib/celebrate.ts`. Why: consistent motion and reduced-motion handling.
- Resolve navigation centrally in ViewModeContext: phones use bottom navigation, tablets use a collapsed sidebar, and notebooks honor App/Site preferences with a collapsible sidebar; AppLayout reserves the actual menu width. Why: navigation must never squeeze or overlap the content.
- Keep shared tab overflow and arrow controls inside ui/tabs.tsx, reserving arrow space only when needed. Why: compact tab navigation stays consistent without changing page behavior.
- Keep Home catalog views in HomeTabViews, selected through the existing root route's view query, and share destinations in app-navigation. Why: separate navigation screens preserve existing module routes and business logic.
- Share the existing cycle phase read and estimation through useCurrentPhase. Why: the sidebar and phase card must show the same current phase without changing prediction rules.
