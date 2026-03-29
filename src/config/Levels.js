import { MAP_WIDTH, MAP_HEIGHT } from './GameConfig.js';

export const LEVELS = {
  plains: {
    id: 'plains',
    name: 'Plains',
    tileKey: 'grass',
    mapWidth: MAP_WIDTH,
    mapHeight: MAP_HEIGHT,
    obstacles: [{ type: 'tree', density: 0.02 }],
    enemyTypes: ['greenSlime'],
    spawnRate: { base: 1, scalePerMinute: 0.3 },
    duration: 300, // 5 minutes
    bossName: 'Slime King',
    bossSprite: 'bossSlimeKing',
    bossHp: 2000,
    bossDamage: 20,
    bossSpeed: 22,
  },
};
