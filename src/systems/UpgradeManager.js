import { UPGRADES } from '../config/Upgrades.js';

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
    // Build pool of available upgrades (not maxed, matching character)
    const available = [];
    Object.keys(UPGRADES).forEach((id) => {
      const upgrade = UPGRADES[id];
      // Skip character-specific upgrades that don't belong to this character
      if (upgrade.characterOnly && upgrade.characterOnly !== this.characterId) return;
      if (this.acquired[id] < upgrade.maxLevel) {
        available.push({
          ...upgrade,
          currentLevel: this.acquired[id],
          nextLevel: this.acquired[id] + 1,
        });
      }
    });

    // Shuffle and pick up to count
    Phaser.Utils.Array.Shuffle(available);
    return available.slice(0, count);
  }

  applyUpgrade(upgradeId) {
    this.acquired[upgradeId]++;
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
