# Codex Prompt — Build OpenSentry Pixel MVP

You are building **OpenSentry Pixel**, a standalone retro arcade side project inspired by OpenSentry.

## Mission

Build a playable browser-based MVP of a retro C-UAS arcade defense game.

Think:

- Missile Command
- 1980s arcade cabinet
- Pixel/CRT visual style
- Drone warfare / counter-UAS flavor
- Fast, simple, fun

Do **not** build a full OpenSentry simulator. This is a lightweight arcade game, not a training dashboard.

## Project Name

**OpenSentry Pixel**

## Core Concept

The player defends a base at the bottom of the screen from incoming drones that approach from the top and sides.

The player aims with the mouse and uses a small set of C-UAS-inspired weapons to destroy or disable drones before they reach the base.

Core tagline:

> Detect. Track. Identify. Delete.

## Build Constraints

- Create a standalone web project.
- Use **Vite + TypeScript**.
- Use **Phaser 3** for the game loop, sprites/shapes, input, collisions, scenes, and arcade feel.
- Static deployable only. No backend.
- No account system.
- No multiplayer.
- No complex menus.
- No OpenSentry data import/export for MVP.
- Keep controls simple.
- Prioritize a playable arcade loop over realism.

## Recommended Folder/Stack

If the project is empty, scaffold it as:

```bash
npm create vite@latest . -- --template vanilla-ts
npm install phaser
```

You may use plain TypeScript with Phaser. React is not required for this MVP unless you have a strong reason.

## MVP Gameplay

Implement a single playable survival mode.

### Screen Layout

- Base sits at the bottom center of the screen.
- Drones enter from the top and upper-left/upper-right edges.
- Drones move toward the base.
- If drones reach the base, base health decreases.
- Game ends when base health reaches zero.
- Player wins or advances after surviving a set number of waves.

### Required UI

Show a simple HUD:

- Score
- Base health
- Current wave
- Laser heat / cooldown
- Missile ammo or reload status
- Jammer cooldown
- HPM cooldown
- Current weapon/help text

Include:

- Start screen
- Game screen
- Game over screen
- Victory/survival complete screen
- Restart option
- Local high score using `localStorage`

## Visual Style

Use a retro pixel arcade look:

- Dark background
- Pixel-style shapes/sprites
- CRT scanline overlay or subtle screen effect
- Radar green, amber, cyan, red threat colors
- Chunky monospace/pixel-style text
- Simple explosions and particle effects
- Missile smoke trail if practical

Do not spend excessive time on art assets. Phaser shapes are acceptable for MVP if styled well.

## Controls

Keep controls simple:

- Mouse: aim cursor
- Left click: fire selected weapon / primary shot
- Number keys or letter keys to select weapon:
  - `1` Laser
  - `2` Missile interceptor
  - `3` Jammer pulse
  - `4` HPM burst
- Optional shortcuts:
  - `Space` fire selected weapon
  - `R` restart on game over
  - `P` pause

Avoid a bunch of button-click UI. This should feel like an arcade shooter.

## Weapons

Implement four C-UAS-inspired tools.

### 1. Laser

Purpose: precise direct-fire weapon.

Behavior:

- Fires instantly at cursor or line-of-sight target.
- Best against small/medium drones.
- Uses heat or energy.
- Repeated firing overheats it briefly.
- Visual: bright beam or bolt.

### 2. Missile Interceptor

Purpose: core kinetic defense weapon.

Behavior:

- Launches from the base toward the cursor or nearest target near the cursor.
- Homes lightly toward a target.
- Slower than laser but more powerful.
- Has limited ammo, reload timer, or cooldown.
- Explodes with small splash radius.
- Best against fast fixed-wing drones and tougher loitering munitions.
- Visual: missile trail and pixel explosion.

### 3. Jammer Pulse

Purpose: disable RF-vulnerable drones.

Behavior:

- Creates a circular pulse centered at cursor or base.
- Affects only RF-vulnerable drone types.
- Jammed drones should drift, spin, fall, or crash after a brief delay.
- Does not affect hardened/immune drones.
- Has cooldown.
- Visual: expanding green/cyan ring.

### 4. HPM Burst

Purpose: emergency swarm clear.

Behavior:

- Large cone or radius burst.
- Strong against groups/swarms.
- Long cooldown.
- Should feel powerful but limited.
- Visual: big electric/radar pulse effect.

## Drone Types

Implement at least four drone types.

### Quadcopter

- Slow
- Common
- RF-vulnerable
- Low health
- Good jammer target

### Micro Drone

- Small
- Fast/erratic
- Low health
- Lower damage
- Harder to hit

### Fixed-Wing Drone

- Faster, straighter path
- Medium health
- Good missile target

### Loitering Munition

- Tougher
- More dangerous
- May dive late toward base
- Requires laser focus or missile interceptor
- Not easily jammed, or fully jammer-immune

Optional if time permits:

### Decoy/Bird

- Looks like a weak contact
- Shooting it penalizes score
- Keep this optional for MVP. Do not let it derail the build.

## Waves

Implement simple wave progression:

- Wave 1: slow quadcopters
- Wave 2: quadcopters + micro drones
- Wave 3: fixed-wing drones
- Wave 4: mixed drones + first loitering munition
- Wave 5: mixed pressure wave / mini swarm

After wave 5, show victory/survival complete screen.

Difficulty should increase through:

- More drones
- Faster spawn rate
- More varied paths
- Tougher drones

## Scoring

Simple scoring:

- Destroy drone: +points based on type
- Jam/crash drone: +points, maybe slightly less than kill
- Base hit: health loss
- Wave survived: bonus
- High score stored in `localStorage`

## C-UAS Flavor Without Complexity

Keep the OpenSentry/C-UAS feel through naming and feedback:

- Use words like RADAR, TRACK, JAM, INTERCEPT, HPM, BASE HEALTH, WAVE.
- Show short event messages such as:
  - `RADAR CONTACT`
  - `RF LINK DISRUPTED`
  - `INTERCEPTOR AWAY`
  - `HPM BURST READY`
  - `BASE IMPACT`
- Do not add complex doctrine screens, ROE workflow, or training panels in MVP.

## Technical Requirements

- Use TypeScript cleanly.
- Keep code organized.
- Suggested structure:

```text
src/
  main.ts
  game/
    config.ts
    scenes/
      BootScene.ts
      MenuScene.ts
      GameScene.ts
      GameOverScene.ts
    entities/
      Drone.ts
      Missile.ts
      Explosion.ts
    systems/
      WaveManager.ts
      WeaponSystem.ts
      Hud.ts
    types.ts
```

This structure is suggested, not mandatory.

## Acceptance Criteria

The MVP is complete when:

- `npm install` works.
- `npm run dev` starts the game.
- `npm run build` succeeds.
- Game launches to a retro start screen.
- Player can start a game.
- Drones spawn in waves from top/sides.
- Base sits at bottom and can take damage.
- Player can use:
  - Laser
  - Missile interceptor
  - Jammer pulse
  - HPM burst
- At least four drone types exist.
- Game has score, health, wave counter, cooldown/ammo indicators.
- Game over and restart work.
- Victory after wave 5 works.
- High score persists in `localStorage`.
- Visual style clearly reads as retro arcade/pixel/CRT.

## Quality Bar

Make it playable first.

Do not overbuild.

Avoid:

- Backend services
- Login/account systems
- Complex upgrade trees
- Full OpenSentry simulation rules
- Mobile-first control work
- Excessive menus
- Asset pipelines that slow down the MVP

If you have extra time after MVP works, improve game feel:

- Better explosions
- Hit pause/slowdown on impact
- Screen shake
- Sound effects generated or simple oscillator tones
- Better wave pacing
- Better weapon feedback

## Final Output Expected From Codex

When finished, provide:

1. Short summary of what was built.
2. Commands run.
3. Test/build status.
4. Any known limitations.
5. Next recommended improvements.

Remember: this should feel like a lost C-UAS arcade cabinet. Simple, kinetic, and fun.
