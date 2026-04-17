import Phaser from 'phaser';
import { UPGRADES } from '../config/Upgrades.js';
import { EVOLUTIONS } from '../config/Evolutions.js';

export const TIER_COLORS = [
  0x999999, // level 1: gray
  0x66dd44, // level 2: green
  0x44aaff, // level 3: blue
  0xaa44ff, // level 4: purple
  0xffdd44, // level 5: gold
];

// Rainbow/gilded stroke used for evolved upgrade icons on the HUD grid.
export const EVOLVED_BORDER_COLOR = 0xffddaa;

export class UpgradeManager {
  constructor(scene, characterId) {
    this.scene = scene;
    this.characterId = characterId;
    // Track current level of each upgrade (0 = not acquired)
    this.acquired = {};
    Object.keys(UPGRADES).forEach((id) => {
      this.acquired[id] = 0;
    });
    // Track which evolutions have been claimed (prevents re-offering)
    this.evolved = {};
  }

  // Returns evolutions the player qualifies for right now.
  getAvailableEvolutions() {
    const available = [];
    Object.values(EVOLUTIONS).forEach((evo) => {
      if (this.evolved[evo.id]) return;
      if (evo.characterOnly && evo.characterOnly !== this.characterId) return;
      const tgt = UPGRADES[evo.target];
      const con = UPGRADES[evo.consume];
      if (!tgt || !con) return;
      if (this.acquired[evo.target] < tgt.maxLevel) return;
      if (this.acquired[evo.consume] < con.maxLevel) return;
      available.push({
        ...evo,
        isEvolution: true,
      });
    });
    return available;
  }

  getRandomUpgrades(count = 3) {
    // Evolutions take priority — if any are available, offer them first.
    const evolutions = this.getAvailableEvolutions();

    // Count how many distinct damage and utility upgrades the player has
    let damageCount = 0;
    let utilityCount = 0;
    Object.keys(this.acquired).forEach((id) => {
      if (this.acquired[id] <= 0) return;
      const upgrade = UPGRADES[id];
      if (!upgrade) return;
      if (upgrade.isPassive) utilityCount++;
      else damageCount++;
    });

    // Build pool of available upgrades (not maxed, matching character, within slot limits)
    const available = [];
    Object.keys(UPGRADES).forEach((id) => {
      const upgrade = UPGRADES[id];
      if (upgrade.characterOnly && upgrade.characterOnly !== this.characterId) return;
      if (this.acquired[id] >= upgrade.maxLevel) return;

      // Enforce 6 damage / 6 utility slot limit for NEW upgrades
      if (this.acquired[id] === 0) {
        if (upgrade.isPassive && utilityCount >= 6) return;
        if (!upgrade.isPassive && damageCount >= 6) return;
      }

      available.push({
        ...upgrade,
        currentLevel: this.acquired[id],
        nextLevel: this.acquired[id] + 1,
      });
    });

    // Shuffle normal upgrades
    Phaser.Utils.Array.Shuffle(available);

    // Fill selection: evolutions first, then normal upgrades
    const selected = [...evolutions.slice(0, count), ...available.slice(0, Math.max(0, count - evolutions.length))];

    // 4% chance each non-evolution upgrade is rare (upgrades 2 levels)
    selected.forEach((upgrade) => {
      if (upgrade.isEvolution) return;
      if (Math.random() < 0.04) {
        upgrade.isRare = true;
        upgrade.nextLevel = Math.min(
          upgrade.currentLevel + 2,
          UPGRADES[upgrade.id].maxLevel
        );
      }
    });

    return selected;
  }

  applyUpgrade(upgradeId) {
    const max = UPGRADES[upgradeId].maxLevel;
    if (this.acquired[upgradeId] < max) {
      this.acquired[upgradeId]++;
    }
    return this.acquired[upgradeId];
  }

  applyEvolution(evolutionId) {
    const evo = EVOLUTIONS[evolutionId];
    if (!evo) return null;
    this.evolved[evolutionId] = true;
    // Consume both base upgrades — they free up their HUD slot and can no
    // longer be upgraded. The target upgrade's weapon transforms in-place via
    // GameScene, and the consume upgrade's passive/weapon is removed entirely.
    this.acquired[evo.target] = 0;
    this.acquired[evo.consume] = 0;
    return evo;
  }

  getLevel(upgradeId) {
    return this.acquired[upgradeId] || 0;
  }

  getStats(upgradeId) {
    const level = this.acquired[upgradeId];
    if (level <= 0) return null;
    return UPGRADES[upgradeId].statsPerLevel[level - 1];
  }

  isEvolved(evolutionId) {
    return !!this.evolved[evolutionId];
  }

  getEvolvedList() {
    return Object.keys(this.evolved).filter((id) => this.evolved[id]);
  }
}
