# Mobile app (the product)

Duolingo-style language learning for English speakers. **This Expo React Native app is what we're building.**

The Next.js app in the repo root is a cloned reference project — useful for UI inspiration and optional content preview/admin, but not the learner experience we're shipping.

## What it does

- **Learn path** — sections, units, and lesson nodes (locked/unlocked progression)
- **Lesson engine** — exercises with feedback, hearts, XP, completion flow
- **Practice tab** — mistake review and spaced repetition (SRS)
- **Profile** — streak, stats, per-course progress
- **8 courses** — Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese (all for English speakers)

## How it's built

- **Expo SDK 56** + React Native, file-based routing in `app/`
- **Local-first** — progress lives on-device (zustand + AsyncStorage), per course. No accounts or backend in v1.
- **Bundled content packs** — compiled JSON + pre-generated TTS audio, not fetched at runtime

Content is authored in `../content/`, compiled by `../scripts/compile-content.ts`, and bundled into `src/content/packs/`. See `../AGENTS.md` for the full pipeline.

## Get started

From the repo root:

```bash
cd mobile && bun install && bunx expo start
```

Add `--web` to open in a browser. Typecheck:

```bash
cd mobile && bunx tsc --noEmit
```

## Project layout

```
mobile/
  app/              # screens (Expo Router)
  src/
    components/     # UI + exercise types
    content/        # bundled packs (generated — don't edit by hand)
    lib/            # stores, types, audio helpers
  assets/audio/     # pre-generated TTS MP3s (generated — don't edit by hand)
```

## Docs

- `../AGENTS.md` — repo overview, content pipeline, commands
- `../docs/plan.md` — roadmap (M0–M4), legal boundary on Duolingo content
