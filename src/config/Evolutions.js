// Evolution recipes.
// When the player has BOTH required upgrades at max level, an "EVOLVE" option
// appears in the level-up scene. Selecting it consumes both base upgrades and
// replaces them with a supercharged, flashier version in a single slot.
//
// `target` is the upgrade id whose weapon transforms in-place (keeps its HUD
// slot). `consume` is the partner upgrade id whose effect/weapon is removed.
// `evolvedStats` is applied via the weapon's existing updateStats() after
// evolve() flips the isEvolved flag.
export const EVOLUTIONS = {
  // --- Universal (damage + damage) ---
  infernalHalo: {
    id: 'infernalHalo',
    name: 'Infernal Halo',
    description: 'A blazing halo of fire incinerates all nearby foes.',
    icon: 'evo_infernalHalo',
    target: 'damageAura',
    consume: 'flameTrail',
    evolvedStats: { radius: 180, damage: 40, tickRate: 180 },
  },
  lanceCavalry: {
    id: 'lanceCavalry',
    name: 'Lance Cavalry',
    description: 'Unicorns charge from all sides, loosing piercing lances.',
    icon: 'evo_lanceCavalry',
    target: 'unicornRider',
    consume: 'piercingDart',
    evolvedStats: { damage: 180, cooldown: 1500, speed: 500 },
  },
  tempestRain: {
    id: 'tempestRain',
    name: 'Tempest Rain',
    description: 'Spears fall from a storm of lightning-wreathed tornadoes.',
    icon: 'evo_tempestRain',
    target: 'spearRain',
    consume: 'tornado',
    evolvedStats: { spearCount: 24, damage: 60, cooldown: 1500 },
  },
  locustPlague: {
    id: 'locustPlague',
    name: 'Locust Plague',
    description: 'Immense swarms of shimmering locusts hunt with blinding speed.',
    icon: 'evo_locustPlague',
    target: 'bugs',
    consume: 'speedBoost',
    evolvedStats: { swarmCount: 8, bugsPerSwarm: 8, damage: 10, speed: 380 },
  },

  // --- Character-specific ---
  hailstorm: {
    id: 'hailstorm',
    name: 'Hailstorm',
    description: 'Bullets spray in all directions with supernatural aim.',
    icon: 'evo_hailstorm',
    target: 'revolverUp',
    consume: 'magnetRange',
    characterOnly: 'human',
    evolvedStats: { fireRate: 120, damage: 50, bulletSpeed: 340, range: 360 },
  },
  phantomRapier: {
    id: 'phantomRapier',
    name: 'Phantom Rapier',
    description: 'A ghostly blade strikes three times in a single thrust.',
    icon: 'evo_phantomRapier',
    target: 'rapierUp',
    consume: 'magnetRange',
    characterOnly: 'fencer',
    evolvedStats: { fireRate: 350, damage: 120, range: 440 },
  },
  royalFlush: {
    id: 'royalFlush',
    name: 'Royal Flush',
    description: 'Fan out all four suits at once — the house always wins.',
    icon: 'evo_royalFlush',
    target: 'cardDeckUp',
    consume: 'xpBoost',
    characterOnly: 'dealer',
    evolvedStats: { fireRate: 250, damage: 48, speed: 300, range: 240, diamondBonusXP: 8 },
  },
  crimsonNova: {
    id: 'crimsonNova',
    name: 'Crimson Nova',
    description: 'Blood orbs detonate in pulsing crimson supernovae.',
    icon: 'evo_crimsonNova',
    target: 'bloodOrbUp',
    consume: 'xpBoost',
    characterOnly: 'bloodMage',
    evolvedStats: { fireRate: 320, damage: 60, bulletSpeed: 260, range: 260, lifeStealPercent: 0.6, killHealPercent: 0.3 },
  },
  hydraFang: {
    id: 'hydraFang',
    name: 'Hydra Fang',
    description: 'A three-headed hydra slashes, spits, and strikes as one.',
    icon: 'evo_hydraFang',
    target: 'snakeSwordUp',
    consume: 'magnetRange',
    characterOnly: 'snakeSwordsman',
    evolvedStats: { slashRate: 220, slashDamage: 48, poisonRate: 320, poisonDamage: 28, poisonSpeed: 260, range: 260 },
  },
  tesseractDrones: {
    id: 'tesseractDrones',
    name: 'Tesseract Drones',
    description: 'Four drones lock targets and unleash beams that pierce eternity.',
    icon: 'evo_tesseractDrones',
    target: 'laserDronesUp',
    consume: 'xpBoost',
    characterOnly: 'dronePilot',
    evolvedStats: { damage: 140, fireRate: 600, range: 300, pierceCount: 12 },
  },
};

// Map of upgradeId -> list of evolution ids that include it.
// Used to quickly check whether a given upgrade can participate in evolutions.
export const EVOLUTION_INDEX = Object.values(EVOLUTIONS).reduce((acc, evo) => {
  (acc[evo.target] ||= []).push(evo.id);
  (acc[evo.consume] ||= []).push(evo.id);
  return acc;
}, {});
