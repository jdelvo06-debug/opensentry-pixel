import type { HudState, WeaponKey } from '../types';

const WEAPON_LABELS: Record<WeaponKey, string> = {
  laser: 'LASER',
  missile: 'INTERCEPTOR',
  jammer: 'JAMMER',
  hpm: 'HPM',
};

const WEAPON_IDS: Record<WeaponKey, string> = {
  laser: 'laser',
  missile: 'missile',
  jammer: 'jammer',
  hpm: 'hpm',
};

export class Hud {
  private readonly score = this.requireElement('score');
  private readonly highScore = this.requireElement('high-score');
  private readonly wave = this.requireElement('wave');
  private readonly health = this.requireElement('health');
  private readonly weapon = this.requireElement('weapon');
  private readonly laser = this.requireElement('laser');
  private readonly missile = this.requireElement('missile');
  private readonly jammer = this.requireElement('jammer');
  private readonly hpm = this.requireElement('hpm');
  private readonly message = this.requireElement('message');

  update(state: HudState): void {
    this.score.textContent = `SCORE ${this.padScore(state.score)}`;
    this.highScore.textContent = `HIGH ${this.padScore(state.highScore)}`;
    this.wave.textContent = `WAVE ${state.wave}`;
    this.health.textContent = `BASE ${Math.max(0, Math.ceil(state.health))}%`;
    this.weapon.textContent = `ACTIVE ${WEAPON_LABELS[state.weapons.selected]}`;

    const heat = Math.round(state.weapons.laserHeat);
    this.laser.textContent = state.weapons.laserOverheated ? 'LASER OVERHEAT' : `HEAT ${heat}%`;

    const reload = Math.round(state.weapons.missileReloadProgress * 100);
    this.missile.textContent =
      state.weapons.missileAmmo > 0
        ? `MISSILES ${state.weapons.missileAmmo}/${state.weapons.missileMaxAmmo}`
        : `RELOAD ${reload}%`;

    this.jammer.textContent =
      state.weapons.jammerCooldownProgress >= 1
        ? 'JAM READY'
        : `JAM ${Math.round(state.weapons.jammerCooldownProgress * 100)}%`;
    this.hpm.textContent =
      state.weapons.hpmCooldownProgress >= 1
        ? 'HPM READY'
        : `HPM ${Math.round(state.weapons.hpmCooldownProgress * 100)}%`;
    this.message.textContent = state.message;

    for (const [weapon, id] of Object.entries(WEAPON_IDS) as [WeaponKey, string][]) {
      this.requireElement(id).classList.toggle('selected', state.weapons.selected === weapon);
    }
  }

  private padScore(value: number): string {
    return Math.max(0, value).toString().padStart(6, '0');
  }

  private requireElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Missing HUD element #${id}`);
    }

    return element;
  }
}
