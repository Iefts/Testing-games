const SAVE_KEY = 'roguelikeSurvivor_save';

const DEFAULT_SAVE = {
  playerLevel: 1,
  playerXP: 0,
  coins: 0,
  unlockedCharacters: ['human'],
  unlockedLevels: ['plains'],
  unlockedCosmetics: [],
  equippedCosmetics: {},
  purchasedItems: [],
  activeBoosts: [],
  totalGamesPlayed: 0,
};

function xpForLevel(level) {
  return 100 + (level - 1) * 50;
}

class SaveSystemClass {
  constructor() {
    this.data = null;
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Merge with defaults to handle new fields
        this.data = { ...DEFAULT_SAVE, ...parsed };
      } else {
        this.data = { ...DEFAULT_SAVE };
      }
    } catch {
      this.data = { ...DEFAULT_SAVE };
    }
    return this.data;
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch {
      // localStorage full or unavailable
    }
  }

  reset() {
    this.data = { ...DEFAULT_SAVE };
    this.save();
  }

  get level() { return this.data.playerLevel; }
  get xp() { return this.data.playerXP; }
  get coins() { return this.data.coins; }
  get xpToNext() { return xpForLevel(this.data.playerLevel); }

  get xpProgress() {
    return this.data.playerXP / this.xpToNext;
  }

  addXP(amount) {
    const levelUps = [];
    this.data.playerXP += amount;

    while (this.data.playerLevel < 100 && this.data.playerXP >= this.xpToNext) {
      this.data.playerXP -= this.xpToNext;
      this.data.playerLevel++;
      levelUps.push(this.data.playerLevel);
    }

    if (this.data.playerLevel >= 100) {
      this.data.playerLevel = 100;
      this.data.playerXP = 0;
    }

    this.save();
    return levelUps;
  }

  addCoins(amount) {
    this.data.coins += amount;
    this.save();
  }

  spendCoins(amount) {
    if (this.data.coins < amount) return false;
    this.data.coins -= amount;
    this.save();
    return true;
  }

  unlockCharacter(id) {
    if (!this.data.unlockedCharacters.includes(id)) {
      this.data.unlockedCharacters.push(id);
      this.save();
    }
  }

  unlockLevel(id) {
    if (!this.data.unlockedLevels.includes(id)) {
      this.data.unlockedLevels.push(id);
      this.save();
    }
  }

  unlockCosmetic(id) {
    if (!this.data.unlockedCosmetics.includes(id)) {
      this.data.unlockedCosmetics.push(id);
      this.save();
    }
  }

  isCharacterUnlocked(id) {
    return this.data.unlockedCharacters.includes(id);
  }

  isLevelUnlocked(id) {
    return this.data.unlockedLevels.includes(id);
  }

  isCosmeticUnlocked(id) {
    return this.data.unlockedCosmetics.includes(id);
  }

  equipCosmetic(characterId, cosmeticId) {
    if (cosmeticId === null) {
      delete this.data.equippedCosmetics[characterId];
    } else {
      this.data.equippedCosmetics[characterId] = cosmeticId;
    }
    this.save();
  }

  getEquippedCosmetic(characterId) {
    return this.data.equippedCosmetics[characterId] || null;
  }

  purchaseItem(itemId) {
    if (!this.data.purchasedItems.includes(itemId)) {
      this.data.purchasedItems.push(itemId);
    }
    this.save();
  }

  isPurchased(itemId) {
    return this.data.purchasedItems.includes(itemId);
  }

  addBoost(boostId) {
    this.data.activeBoosts.push(boostId);
    this.save();
  }

  consumeBoost(boostId) {
    const idx = this.data.activeBoosts.indexOf(boostId);
    if (idx >= 0) {
      this.data.activeBoosts.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  hasBoost(boostId) {
    return this.data.activeBoosts.includes(boostId);
  }

  incrementGamesPlayed() {
    this.data.totalGamesPlayed++;
    this.save();
  }
}

export const SaveSystem = new SaveSystemClass();
