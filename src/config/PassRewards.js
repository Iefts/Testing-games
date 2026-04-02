// Pass rewards for player levels 1-100
// Types: 'coins', 'character', 'level', 'cosmetic'

export const PASS_REWARDS = {
  1:  { type: 'none', description: 'Starting rewards: Human + Plains' },
  2:  { type: 'coins', amount: 50 },
  3:  { type: 'character', characterId: 'fencer', description: 'Unlock Fencer' },
  4:  { type: 'coins', amount: 75 },
  5:  { type: 'level', levelId: 'desert', description: 'Unlock Desert' },
  6:  { type: 'cosmetic', cosmeticId: 'shadow_human', description: 'Shadow Human skin' },
  7:  { type: 'coins', amount: 100 },
  8:  { type: 'character', characterId: 'dealer', description: 'Unlock Dealer' },
  9:  { type: 'coins', amount: 75 },
  10: { type: 'level', levelId: 'ocean', description: 'Unlock Ocean' },
  11: { type: 'cosmetic', cosmeticId: 'golden_fencer', description: 'Golden Fencer skin' },
  12: { type: 'coins', amount: 100 },
  13: { type: 'character', characterId: 'bloodMage', description: 'Unlock Blood Mage' },
  14: { type: 'coins', amount: 100 },
  15: { type: 'level', levelId: 'moon', description: 'Unlock Moon' },
  16: { type: 'cosmetic', cosmeticId: 'neon_dealer', description: 'Neon Dealer skin' },
  17: { type: 'coins', amount: 150 },
  18: { type: 'character', characterId: 'dronePilot', description: 'Unlock Drone Pilot' },
  19: { type: 'coins', amount: 100 },
  20: { type: 'cosmetic', cosmeticId: 'frost_bloodMage', description: 'Frost Blood Mage skin' },
  21: { type: 'coins', amount: 150 },
  22: { type: 'character', characterId: 'snakeSwordsman', description: 'Unlock Snake Swordsman' },
  23: { type: 'coins', amount: 100 },
  24: { type: 'cosmetic', cosmeticId: 'chrome_dronePilot', description: 'Chrome Drone Pilot skin' },
  25: { type: 'coins', amount: 200 },
};

// Levels 26-100: alternating coin rewards
for (let i = 26; i <= 100; i++) {
  PASS_REWARDS[i] = {
    type: 'coins',
    amount: 100 + (i % 5 === 0 ? 100 : 0), // 100 normally, 200 every 5th level
  };
}

// Apply a pass reward to the save system
export function applyReward(save, level) {
  const reward = PASS_REWARDS[level];
  if (!reward) return null;

  switch (reward.type) {
    case 'coins':
      save.addCoins(reward.amount);
      return { type: 'coins', amount: reward.amount, description: `+${reward.amount} Coins` };
    case 'character':
      save.unlockCharacter(reward.characterId);
      return { type: 'character', description: reward.description };
    case 'level':
      save.unlockLevel(reward.levelId);
      return { type: 'level', description: reward.description };
    case 'cosmetic':
      save.unlockCosmetic(reward.cosmeticId);
      return { type: 'cosmetic', description: reward.description };
    default:
      return null;
  }
}
