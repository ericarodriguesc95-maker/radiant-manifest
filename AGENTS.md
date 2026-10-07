# Project rules

- Visual tokens (colors, gradients, shadows, motion keyframes) live in `src/index.css`; `gold`/`brand` tokens alias the current accent so legacy classes follow the palette. Why: restyling happens in one place.
- Animated emojis use `src/components/ui/animated-emoji.tsx` (Noto webp, pauses off-screen) and completion bursts use `celebrate()` from `src/lib/celebrate.ts`. Why: consistent motion and reduced-motion handling.
