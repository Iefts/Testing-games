import Phaser from 'phaser';
import { UPGRADES } from '../config/Upgrades.js';

export const TIER_COLORS = [
  0x999999, // level 1: gray
  0x66dd44, // level 2: green
  0x44aaff, // level 3: blue
  0xaa44ff, // level 4: purple
  0xffdd44, // level 5: gold
];

export class UpgradeManager {
  constructor(scene, characterId) {
    this.scene = scene;
    this.characterId = characterId;
    // Track current level of each upgrade (0 = not acquired)
    this.acquired = {};
    Object.keys(UPGRADES).forEach((id) => {
      this.acquired[id] = 0;
    });
  }

  getRandomUpgrades(count = 3) {
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
      // Skip character-specific upgrades that don't belong to this character
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

    // Shuffle and pick up to count
    Phaser.Utils.Array.Shuffle(available);
    const selected = available.slice(0, count);

    // 4% chance each upgrade is rare (upgrades 2 levels)
    selected.forEach((upgrade) => {
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

  getLevel(upgradeId) {
    return this.acquired[upgradeId] || 0;
  }

  getStats(upgradeId) {
    const level = this.acquired[upgradeId];
    if (level <= 0) return null;
    return UPGRADES[upgradeId].statsPerLevel[level - 1];
  }
}
