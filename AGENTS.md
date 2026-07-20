# AGENTS.md — OpenSentry Pixel

Guidance for Codex, Hermes, and other AI agents working in this repository.

## Mission

OpenSentry Pixel is a standalone retro arcade C-UAS game. Keep it fast, playable, and simple.

This is **not** the full OpenSentry simulator and should not grow into one.

## Repository Context

- GitHub repo: `jdelvo06-debug/opensentry-pixel`
- Local repo path: `/Users/jeremydelvaux/projects/opensentry-pixel`
- Live GitHub Pages URL: `https://jdelvo06-debug.github.io/opensentry-pixel/`

## Tasking and Reporting

- Cortana Command Center (CCC) Kanban is the source of truth for active Agent OS tasking; Jeremy's direct instruction is sufficient when no relevant card exists.
- Work one CCC card or Jeremy-directed task at a time. Review the goal, constraints, acceptance criteria, and verification commands before editing.
- Ask for clarification only when ambiguity materially affects scope, safety, or acceptance. Otherwise, state a reasonable assumption and proceed within the smallest safe scope.
- Feature work does not automatically authorize creating, updating, or moving a CCC card or any other task record.
- Codex and other implementation agents report evidence: what changed, files touched, verification commands and results, caveats, and follow-up recommendations. Cortana/Hermes updates CCC unless Jeremy expressly authorizes the implementation agent to do so.
- GitHub is the code/version-control workflow, not a substitute task board. Bypass Hermes Kanban and external task boards unless Jeremy explicitly requests them.

## Branch Discipline

Stay on the current approved branch and worktree. Create or switch branches or worktrees only with Jeremy's explicit approval.

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

Primary build command:

```bash
npm run build
```

Do not run `npm install` or add, update, remove, or otherwise mutate dependencies or lockfiles without Jeremy's explicit approval for that exact action. Run `npm run dev` only for an authorized UI smoke test, using an unused port that Jeremy has approved.

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

When visual/gameplay behavior changes, report a short manual smoke-test note to Cortana/Hermes for reconciliation; do not put that evidence in a CCC card unless Jeremy explicitly authorizes it. Screenshots are helpful when practical, but do not block small fixes on screenshots unless the task asks for them.

## Safety Rails

- Never commit secrets or API keys.
- Preserve pre-existing tracked and untracked work. Do not reset, clean, stash, overwrite, stage, or otherwise alter it without Jeremy's explicit approval.
- Do not commit, push, open or update a pull request, merge, deploy, publish a release, or mutate external systems (including GitHub, CCC, other task boards, and deployment consoles) without Jeremy's explicit approval.
- Do not edit deployment settings unless the issue is about deployment.
- Do not delete existing dogfood output unless the issue asks for cleanup.
- Preserve `PROMPT.md` as the original MVP brief.
- Keep `README.md` accurate when setup, build, or deploy behavior changes.

