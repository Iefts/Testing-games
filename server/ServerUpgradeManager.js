import { UPGRADES } from '../src/config/Upgrades.js';
import { shuffle } from '../src/shared/GameMath.js';

export class ServerUpgradeManager {
  constructor(characterId) {
    this.characterId = characterId;
    this.acquired = {};
    Object.keys(UPGRADES).forEach((id) => {
      this.acquired[id] = 0;
    });
  }

  getRandomUpgrades(count = 3) {
    const available = [];
    Object.keys(UPGRADES).forEach((id) => {
      const upgrade = UPGRADES[id];
      if (upgrade.characterOnly && upgrade.characterOnly !== this.characterId) return;
      if (this.acquired[id] < upgrade.maxLevel) {
        available.push({
          id: upgrade.id,
          name: upgrade.name,
          description: upgrade.description,
          icon: upgrade.icon,
          maxLevel: upgrade.maxLevel,
          currentLevel: this.acquired[id],
          nextLevel: this.acquired[id] + 1,
        });
      }
    });

    const selected = shuffle(available).slice(0, count);

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
