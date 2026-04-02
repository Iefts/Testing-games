// Per-game challenges — 3 randomly selected each game

export const CHALLENGE_POOL = [
  {
    id: 'kill_50',
    name: 'Slayer',
    description: 'Kill 50 enemies',
    xpReward: 25,
    check: (stats) => stats.kills >= 50,
  },
  {
    id: 'kill_100',
    name: 'Massacre',
    description: 'Kill 100 enemies',
    xpReward: 25,
    check: (stats) => stats.kills >= 100,
  },
  {
    id: 'kill_200',
    name: 'Annihilator',
    description: 'Kill 200 enemies',
    xpReward: 25,
    check: (stats) => stats.kills >= 200,
  },
  {
    id: 'survive_2min',
    name: 'Endurance',
    description: 'Survive 2 minutes',
    xpReward: 25,
    check: (stats) => stats.elapsedSeconds >= 120,
  },
  {
    id: 'survive_4min',
    name: 'Iron Will',
    description: 'Survive 4 minutes',
    xpReward: 25,
    check: (stats) => stats.elapsedSeconds >= 240,
  },
  {
    id: 'reach_lv5',
    name: 'Leveling Up',
    description: 'Reach in-game level 5',
    xpReward: 25,
    check: (stats) => stats.level >= 5,
  },
  {
    id: 'reach_lv10',
    name: 'Powerhouse',
    description: 'Reach in-game level 10',
    xpReward: 25,
    check: (stats) => stats.level >= 10,
  },
  {
    id: 'defeat_boss',
    name: 'Boss Slayer',
    description: 'Defeat the boss',
    xpReward: 50,
    check: (stats) => stats.victory === true,
  },
];

// Pick 3 random challenges (no duplicates)
export function pickChallenges() {
  const shuffled = [...CHALLENGE_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}
