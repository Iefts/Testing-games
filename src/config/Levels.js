import { MAP_WIDTH, MAP_HEIGHT, GAME_DURATION } from './GameConfig.js';

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
    duration: GAME_DURATION,
  },
};
