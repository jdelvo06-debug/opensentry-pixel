# AGENTS.md — OpenSentry Pixel

Guidance for Codex, Hermes, and other AI agents working in this repository.

## Mission

OpenSentry Pixel is a standalone retro arcade C-UAS game. Keep it fast, playable, and simple.

This is **not** the full OpenSentry simulator and should not grow into one.

## Source of Truth

Use Linear as the task board.

- Linear team: `OpenSentry Pixel` (`PIXEL`)
- Linear project: `OpenSentry Pixel MVP`
- GitHub repo: `jdelvo06-debug/opensentry-pixel`
- Local repo path: `/Users/jeremydelvaux/projects/opensentry-pixel`
- Live GitHub Pages URL: `https://jdelvo06-debug.github.io/opensentry-pixel/`
- Work one Linear issue at a time.
- Before editing, read the active Linear issue and confirm its goal, constraints, acceptance criteria, and verification commands.
- If the issue is ambiguous, ask for clarification before changing code.

## Branch Discipline

Use one branch per issue.

Branch naming examples:

- `docs/pixel-2-agent-workflow`
- `feat/pixel-3-gameplay-feel`
- `fix/pixel-4-wave-balance`

Do not work directly on `main` unless Jeremy explicitly says to.

## Scope Control

Make the smallest reasonable change that satisfies the current issue.

Do not refactor unrelated files.
Do not rename scenes, systems, entities, or config keys unless the issue requires it.
Do not add a backend, account system, multiplayer, database, or OpenSentry data import/export for the MVP.
Do not turn this arcade game into a training dashboard. The adults already have enough dashboards.

## Current Stack

- Vite
- TypeScript
- Phaser 3
- Static deploy only
- Production output: `dist/`

Primary commands:

```bash
npm install
npm run dev
npm run build
```

For GitHub Pages behavior:

```bash
GITHUB_PAGES=true npm run build
```

## Code Style and Architecture

Prefer straightforward TypeScript and Phaser patterns already present in `src/game/`.

Current structure includes:

- `src/game/scenes/`
- `src/game/entities/`
- `src/game/systems/`
- `src/game/config.ts`
- `src/game/types.ts`

Use existing scene/system/entity patterns before introducing new abstractions.

Keep gameplay logic readable. Clever code is not a substitute for a fun game loop.

## Gameplay Priorities

Prioritize:

1. Playable arcade feel
2. Clear feedback to the player
3. Weapon usefulness and tradeoffs
4. Wave balance
5. Retro CRT visual polish

Avoid excessive realism. The game should feel like Missile Command met a C-UAS battle captain and both had too much coffee.

## Verification Requirements

Before marking an issue complete, run:

```bash
npm run build
```

If the issue changes deployment behavior, also run:

```bash
GITHUB_PAGES=true npm run build
```

When visual/gameplay behavior changes, include a short manual smoke-test note in the Linear comment. Screenshots are helpful when practical, but do not block small fixes on screenshots unless the issue asks for them.

## Linear Update Requirements

At the end of work, comment on the Linear issue with:

- What changed
- Files touched
- Verification commands run
- Any caveats or follow-up recommendations

Then move the issue to `In Review` if verification passes.

## Safety Rails

- Never commit secrets or API keys.
- Do not edit deployment settings unless the issue is about deployment.
- Do not delete existing dogfood output unless the issue asks for cleanup.
- Preserve `PROMPT.md` as the original MVP brief.
- Keep `README.md` accurate when setup, build, or deploy behavior changes.
