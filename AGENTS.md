# Project rules

- Visual tokens (colors, gradients, shadows, motion keyframes) live in `src/index.css`; `gold`/`brand` tokens alias the current accent so legacy classes follow the palette. Why: restyling happens in one place.
- Animated emojis use `src/components/ui/animated-emoji.tsx` (Noto webp, pauses off-screen) and completion bursts use `celebrate()` from `src/lib/celebrate.ts`. Why: consistent motion and reduced-motion handling.
- Resolve navigation centrally in ViewModeContext: phones use bottom navigation, tablets use a collapsed sidebar, and notebooks honor App/Site preferences with a collapsible sidebar; AppLayout reserves the actual menu width. Why: navigation must never squeeze or overlap the content.
- Keep shared tab overflow and arrow controls inside ui/tabs.tsx, reserving arrow space only when needed. Why: compact tab navigation stays consistent without changing page behavior.
- Keep Home catalog views in HomeTabViews, selected through the existing root route's view query, and share destinations in app-navigation. Why: separate navigation screens preserve existing module routes and business logic.
- Share the existing cycle phase read and estimation through useCurrentPhase. Why: the sidebar and phase card must show the same current phase without changing prediction rules.
