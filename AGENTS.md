# Project rules

- Visual tokens (colors, gradients, shadows, motion keyframes) live in `src/index.css`; `gold`/`brand` tokens alias the current accent so legacy classes follow the palette. Why: restyling happens in one place.
- Animated emojis use `src/components/ui/animated-emoji.tsx` (Noto webp, pauses off-screen) and completion bursts use `celebrate()` from `src/lib/celebrate.ts`. Why: consistent motion and reduced-motion handling.
- Resolve App/Site presentation in ViewModeContext using the screen width, honoring saved preferences only on notebook-sized screens; constrain AppLayout centrally. Why: a saved Site setting must never squeeze the phone behind a sidebar.
- Keep shared tab overflow and arrow controls inside ui/tabs.tsx, reserving arrow space only when needed. Why: compact tab navigation stays consistent without changing page behavior.
