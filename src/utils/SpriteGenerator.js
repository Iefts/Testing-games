export function generateSprites(scene) {
  generatePlayer(scene);
  generateFencer(scene);
  generateDealer(scene);
  generateSlime(scene);
  generateBlueSlime(scene);
  generateSkeleton(scene);
  generateArrow(scene);
  generateBullet(scene);
  generateXPGem(scene);
  generateGrass(scene);
  generateTree(scene);
  generateDart(scene);
  generateUnicorn(scene);
  generateAura(scene);
  generateSpear(scene);
  generateFlame(scene);
  generateTornado(scene);
  generateBugs(scene);
  generatePot(scene);
  generateHealthPotion(scene);
  generateRapier(scene);
  generateCards(scene);
  generateBloodMage(scene);
  generateBloodOrbBullet(scene);
  generateBoot(scene);
  generatePowerupFlamethrower(scene);
  generatePowerupFreeze(scene);
  generateSnakeSwordsman(scene);
  generateSnakeSword(scene);
  generatePoisonBolt(scene);
  generateDronePilot(scene);
  generateDrone(scene);
  generateBossSlimeKing(scene);
  generateSand(scene);
  generateCactus(scene);
  generateScorpion(scene);
  generateMummy(scene);
  generateSandGolem(scene);
  generateBossMummyKing(scene);
}

function generatePlayer(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 4-frame spritesheet (64x16): idle, walk1, walk2, walk3
  // Vampire Survivors-style cowboy with dark outlines and detailed shading

  for (let frame = 0; frame < 4; frame++) {
    const ox = frame * 16;
    const legOffset = [0, -1, 0, 1][frame];

    // === Dark outline silhouette (drawn first, behind everything) ===
    gfx.fillStyle(0x1a1a1a);
    // Hat outline
    gfx.fillRect(ox + 2, 0, 12, 1);
    gfx.fillRect(ox + 4, 1, 8, 1);
    // Head outline
    gfx.fillRect(ox + 4, 3, 1, 3);
    gfx.fillRect(ox + 11, 3, 1, 3);
    // Body outline
    gfx.fillRect(ox + 2, 6, 1, 6);
    gfx.fillRect(ox + 13, 6, 1, 6);
    // Leg outlines
    gfx.fillRect(ox + 4, 11, 1, 4);
    gfx.fillRect(ox + 11, 11, 1, 4);

    // === Cowboy hat (3 brown tones + red band) ===
    gfx.fillStyle(0x4a2e16);
    gfx.fillRect(ox + 3, 0, 10, 1);  // brim dark
    gfx.fillStyle(0x6b4226);
    gfx.fillRect(ox + 5, 0, 6, 1);   // brim highlight
    gfx.fillStyle(0x5c3a1e);
    gfx.fillRect(ox + 5, 1, 6, 1);   // hat body
    gfx.fillStyle(0x7a5030);
    gfx.fillRect(ox + 6, 1, 3, 1);   // hat highlight
    // Hat band (red with shading)
    gfx.fillStyle(0xcc3333);
    gfx.fillRect(ox + 5, 2, 6, 1);
    gfx.fillStyle(0xee4444);
    gfx.fillRect(ox + 7, 2, 2, 1);   // band highlight

    // === Head (skin with shading) ===
    gfx.fillStyle(0xf5c69a);
    gfx.fillRect(ox + 5, 3, 6, 3);
    // Skin shadow on sides
    gfx.fillStyle(0xdba878);
    gfx.fillRect(ox + 5, 4, 1, 2);
    gfx.fillRect(ox + 10, 4, 1, 2);
    // Eyes (darker, more expressive)
    gfx.fillStyle(0x000000);
    gfx.fillRect(ox + 6, 4, 1, 1);
    gfx.fillRect(ox + 9, 4, 1, 1);
    // Eye highlight
    gfx.fillStyle(0xffffff);
    gfx.fillRect(ox + 6, 4, 1, 1);  // overwrite with white dot
    gfx.fillStyle(0x222222);
    gfx.fillRect(ox + 6, 4, 1, 1);  // dark pupil
    gfx.fillRect(ox + 9, 4, 1, 1);
    // Mouth/stubble
    gfx.fillStyle(0xc49468);
    gfx.fillRect(ox + 6, 5, 4, 1);
    gfx.fillStyle(0xb08050);
    gfx.fillRect(ox + 7, 5, 2, 1);   // chin shadow

    // === Vest (layered leather with detail) ===
    gfx.fillStyle(0x5c3a1e);
    gfx.fillRect(ox + 5, 6, 6, 5);
    // Shirt underneath (warm off-white with dither)
    gfx.fillStyle(0xddccaa);
    gfx.fillRect(ox + 6, 6, 4, 4);
    gfx.fillStyle(0xccbb99);
    gfx.fillRect(ox + 7, 7, 1, 1);   // dither
    gfx.fillRect(ox + 6, 8, 1, 1);   // dither
    // Vest lapels (darker brown)
    gfx.fillStyle(0x3d2010);
    gfx.fillRect(ox + 5, 6, 1, 4);
    gfx.fillRect(ox + 10, 6, 1, 4);
    // Vest highlight
    gfx.fillStyle(0x7a5030);
    gfx.fillRect(ox + 5, 7, 1, 1);
    gfx.fillRect(ox + 10, 7, 1, 1);

    // === Belt with gold buckle ===
    gfx.fillStyle(0x222222);
    gfx.fillRect(ox + 5, 10, 6, 1);
    gfx.fillStyle(0xffd700);
    gfx.fillRect(ox + 7, 10, 2, 1);
    gfx.fillStyle(0xccaa00);
    gfx.fillRect(ox + 8, 10, 1, 1);  // buckle shadow

    // === Arms (skin + leather gloves) ===
    gfx.fillStyle(0xf5c69a);
    gfx.fillRect(ox + 3, 7, 2, 2);
    gfx.fillRect(ox + 11, 7, 2, 2);
    // Arm shadow
    gfx.fillStyle(0xdba878);
    gfx.fillRect(ox + 3, 8, 1, 1);
    gfx.fillRect(ox + 12, 8, 1, 1);
    // Gloves (dark brown with highlight)
    gfx.fillStyle(0x3d2010);
    gfx.fillRect(ox + 3, 9, 2, 2);
    gfx.fillRect(ox + 11, 9, 2, 2);
    gfx.fillStyle(0x5c3a1e);
    gfx.fillRect(ox + 3, 9, 1, 1);
    gfx.fillRect(ox + 11, 9, 1, 1);

    // === Legs (brown pants with shading) ===
    gfx.fillStyle(0x6b5030);
    gfx.fillRect(ox + 5, 11, 2, 3 + legOffset);
    gfx.fillRect(ox + 9, 11, 2, 3 - legOffset);
    // Pant highlight
    gfx.fillStyle(0x7a6040);
    gfx.fillRect(ox + 5, 11, 1, 2);
    gfx.fillRect(ox + 9, 11, 1, 2);
    // Pant shadow
    gfx.fillStyle(0x5a4020);
    gfx.fillRect(ox + 6, 12, 1, 1);
    gfx.fillRect(ox + 10, 12, 1, 1);

    // === Boots (dark with spur detail) ===
    gfx.fillStyle(0x2a1508);
    gfx.fillRect(ox + 4, 14 + legOffset, 3, 2 - Math.abs(legOffset));
    gfx.fillRect(ox + 9, 14 - legOffset, 3, 2 - Math.abs(legOffset));
    // Boot highlight
    gfx.fillStyle(0x3a2010);
    gfx.fillRect(ox + 5, 14 + legOffset, 1, 1);
    gfx.fillRect(ox + 10, 14 - legOffset, 1, 1);
    // Spur (silver)
    gfx.fillStyle(0xdddddd);
    if (frame === 0 || frame === 2) {
      gfx.fillRect(ox + 4, 15, 1, 1);
      gfx.fillRect(ox + 11, 15, 1, 1);
    }

    // === Holster ===
    gfx.fillStyle(0x3d2010);
    gfx.fillRect(ox + 11, 10, 1, 2);
    gfx.fillStyle(0x888888);
    gfx.fillRect(ox + 12, 10, 1, 1); // gun handle
  }

  gfx.generateTexture('player_sheet', 64, 16);
  gfx.destroy();

  scene.textures.get('player_sheet').add('__BASE', 0, 0, 0, 64, 16);

  const rt = scene.make.renderTexture({ width: 16, height: 16, add: false });
  const tempSprite = scene.add.sprite(0, 0, 'player_sheet').setOrigin(0, 0).setCrop(0, 0, 16, 16);
  rt.draw(tempSprite, 0, 0);
  rt.saveTexture('player');
  tempSprite.destroy();
}

function generateSlime(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 16x16 green slime with dark outline, glossy highlight, drip detail

  // Dark outline
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(3, 5, 10, 1);
  gfx.fillRect(1, 9, 1, 5);
  gfx.fillRect(14, 9, 1, 5);
  gfx.fillRect(2, 7, 1, 3);
  gfx.fillRect(13, 7, 1, 3);
  gfx.fillRect(2, 14, 12, 1);
  gfx.fillRect(3, 15, 10, 1);

  // Main body (mid green)
  gfx.fillStyle(0x44cc44);
  gfx.fillRect(3, 8, 10, 6);
  gfx.fillRect(2, 10, 12, 4);
  gfx.fillRect(4, 6, 8, 2);

  // Dark shading (bottom/sides)
  gfx.fillStyle(0x2d9e2d);
  gfx.fillRect(3, 12, 10, 2);
  gfx.fillRect(2, 11, 1, 3);
  gfx.fillRect(13, 11, 1, 3);

  // Shadow underneath
  gfx.fillStyle(0x1a7a1a);
  gfx.fillRect(4, 14, 8, 1);

  // Glossy highlight (top)
  gfx.fillStyle(0x66ee66);
  gfx.fillRect(4, 7, 4, 2);
  gfx.fillStyle(0x88ff88);
  gfx.fillRect(5, 7, 2, 1);  // bright spot

  // Eyes (bigger, more expressive)
  gfx.fillStyle(0xffffff);
  gfx.fillRect(5, 9, 2, 2);
  gfx.fillRect(9, 9, 2, 2);
  // Pupils
  gfx.fillStyle(0x000000);
  gfx.fillRect(6, 9, 1, 2);
  gfx.fillRect(10, 9, 1, 2);

  // Mouth (simple smile)
  gfx.fillStyle(0x228822);
  gfx.fillRect(6, 12, 4, 1);

  // Drip detail on side
  gfx.fillStyle(0x44cc44);
  gfx.fillRect(2, 13, 1, 2);
  gfx.fillRect(13, 12, 1, 2);

  gfx.generateTexture('slime', 16, 16);
  gfx.destroy();
}

function generateBlueSlime(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 16x16 blue slime — same shape as green but blue palette

  // Dark outline
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(3, 5, 10, 1);
  gfx.fillRect(1, 9, 1, 5);
  gfx.fillRect(14, 9, 1, 5);
  gfx.fillRect(2, 7, 1, 3);
  gfx.fillRect(13, 7, 1, 3);
  gfx.fillRect(2, 14, 12, 1);
  gfx.fillRect(3, 15, 10, 1);

  // Main body (blue)
  gfx.fillStyle(0x4488ee);
  gfx.fillRect(3, 8, 10, 6);
  gfx.fillRect(2, 10, 12, 4);
  gfx.fillRect(4, 6, 8, 2);

  // Dark shading (bottom/sides)
  gfx.fillStyle(0x2266cc);
  gfx.fillRect(3, 12, 10, 2);
  gfx.fillRect(2, 11, 1, 3);
  gfx.fillRect(13, 11, 1, 3);

  // Shadow underneath
  gfx.fillStyle(0x1a55aa);
  gfx.fillRect(4, 14, 8, 1);

  // Glossy highlight (top)
  gfx.fillStyle(0x66aaff);
  gfx.fillRect(4, 7, 4, 2);
  gfx.fillStyle(0x88ccff);
  gfx.fillRect(5, 7, 2, 1);

  // Eyes
  gfx.fillStyle(0xffffff);
  gfx.fillRect(5, 9, 2, 2);
  gfx.fillRect(9, 9, 2, 2);
  // Pupils
  gfx.fillStyle(0x000000);
  gfx.fillRect(6, 9, 1, 2);
  gfx.fillRect(10, 9, 1, 2);

  // Mouth (stern)
  gfx.fillStyle(0x1a55aa);
  gfx.fillRect(6, 12, 4, 1);

  // Drip detail
  gfx.fillStyle(0x4488ee);
  gfx.fillRect(2, 13, 1, 2);
  gfx.fillRect(13, 12, 1, 2);

  gfx.generateTexture('blueSlime', 16, 16);
  gfx.destroy();
}

function generateSkeleton(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 16x16 skeleton archer

  // === Dark outline ===
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(5, 0, 6, 1);
  gfx.fillRect(4, 1, 1, 5);
  gfx.fillRect(11, 1, 1, 5);
  gfx.fillRect(3, 6, 1, 5);
  gfx.fillRect(12, 6, 1, 5);
  gfx.fillRect(5, 11, 1, 5);
  gfx.fillRect(10, 11, 1, 5);

  // === Skull ===
  gfx.fillStyle(0xddddcc);
  gfx.fillRect(5, 1, 6, 4);
  // Skull highlight
  gfx.fillStyle(0xeeeedd);
  gfx.fillRect(6, 1, 4, 2);
  // Eye sockets (dark)
  gfx.fillStyle(0x111111);
  gfx.fillRect(6, 2, 1, 2);
  gfx.fillRect(9, 2, 1, 2);
  // Eye glow (red)
  gfx.fillStyle(0xff3333);
  gfx.fillRect(6, 2, 1, 1);
  gfx.fillRect(9, 2, 1, 1);
  // Nose hole
  gfx.fillStyle(0x888877);
  gfx.fillRect(7, 3, 2, 1);
  // Jaw
  gfx.fillStyle(0xccccbb);
  gfx.fillRect(6, 4, 4, 1);
  // Teeth
  gfx.fillStyle(0xeeeedd);
  gfx.fillRect(6, 4, 1, 1);
  gfx.fillRect(8, 4, 1, 1);

  // === Ribcage / body ===
  gfx.fillStyle(0xccccbb);
  gfx.fillRect(5, 5, 6, 1);
  // Ribs
  gfx.fillStyle(0xddddcc);
  gfx.fillRect(5, 6, 6, 1);
  gfx.fillStyle(0xaaaaaa);
  gfx.fillRect(5, 7, 6, 1);
  gfx.fillStyle(0xddddcc);
  gfx.fillRect(5, 8, 6, 1);
  gfx.fillStyle(0xaaaaaa);
  gfx.fillRect(5, 9, 6, 1);
  // Spine
  gfx.fillStyle(0x999988);
  gfx.fillRect(7, 6, 2, 4);

  // === Arms (bones) ===
  gfx.fillStyle(0xccccbb);
  gfx.fillRect(3, 6, 2, 1);
  gfx.fillRect(11, 6, 2, 1);
  gfx.fillStyle(0xddddcc);
  gfx.fillRect(3, 7, 2, 1);
  gfx.fillRect(11, 7, 2, 1);
  // Hands
  gfx.fillStyle(0xbbbbaa);
  gfx.fillRect(3, 8, 2, 1);
  gfx.fillRect(11, 8, 2, 1);

  // Bow in hand
  gfx.fillStyle(0x6b4226);
  gfx.fillRect(12, 5, 1, 5);
  gfx.fillStyle(0x888888);
  gfx.fillRect(13, 6, 1, 3); // bowstring

  // === Pelvis ===
  gfx.fillStyle(0xbbbbaa);
  gfx.fillRect(5, 10, 6, 1);

  // === Legs (bones) ===
  gfx.fillStyle(0xccccbb);
  gfx.fillRect(5, 11, 2, 3);
  gfx.fillRect(9, 11, 2, 3);
  // Knee joints
  gfx.fillStyle(0xaaaaaa);
  gfx.fillRect(5, 12, 2, 1);
  gfx.fillRect(9, 12, 2, 1);

  // === Feet ===
  gfx.fillStyle(0xbbbbaa);
  gfx.fillRect(5, 14, 2, 1);
  gfx.fillRect(9, 14, 2, 1);

  gfx.generateTexture('skeleton', 16, 16);
  gfx.destroy();
}

function generateArrow(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 12x5 arrow projectile — red with black outline for visibility

  // Black outline
  gfx.fillStyle(0x000000);
  gfx.fillRect(0, 0, 9, 1);
  gfx.fillRect(0, 4, 9, 1);
  gfx.fillRect(0, 0, 1, 5);
  gfx.fillRect(9, 1, 1, 3);
  gfx.fillRect(10, 1, 1, 3);
  gfx.fillRect(11, 2, 1, 1);

  // Red shaft
  gfx.fillStyle(0xcc2222);
  gfx.fillRect(1, 1, 7, 3);

  // Bright red center
  gfx.fillStyle(0xff4444);
  gfx.fillRect(2, 2, 6, 1);

  // Dark red arrowhead
  gfx.fillStyle(0x991111);
  gfx.fillRect(8, 1, 2, 3);
  gfx.fillRect(10, 2, 1, 1);

  // Arrowhead tip highlight
  gfx.fillStyle(0xff6666);
  gfx.fillRect(9, 2, 1, 1);

  // Black fletching at back
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(1, 0, 2, 1);
  gfx.fillRect(1, 4, 2, 1);

  gfx.generateTexture('arrow', 12, 5);
  gfx.destroy();
}

function generateBullet(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 4x4 yellow bullet with outline and glow
  // Outline
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(0, 0, 4, 4);
  // Body
  gfx.fillStyle(0xffaa00);
  gfx.fillRect(1, 0, 2, 4);
  gfx.fillRect(0, 1, 4, 2);
  // Bright center
  gfx.fillStyle(0xffee44);
  gfx.fillRect(1, 1, 2, 2);
  // Hot core
  gfx.fillStyle(0xffffff);
  gfx.fillRect(1, 1, 1, 1);
  gfx.generateTexture('bullet', 4, 4);
  gfx.destroy();
}

function generateXPGem(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 6x6 blue gem with outline and faceted shading

  // Dark outline
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(2, 0, 2, 1);
  gfx.fillRect(1, 1, 1, 1);
  gfx.fillRect(4, 1, 1, 1);
  gfx.fillRect(0, 2, 1, 2);
  gfx.fillRect(5, 2, 1, 2);
  gfx.fillRect(1, 4, 1, 1);
  gfx.fillRect(4, 4, 1, 1);
  gfx.fillRect(2, 5, 2, 1);

  // Base blue
  gfx.fillStyle(0x3388dd);
  gfx.fillRect(2, 1, 2, 1);
  gfx.fillRect(1, 2, 4, 2);
  gfx.fillRect(2, 4, 2, 1);

  // Light facet (top-left)
  gfx.fillStyle(0x66bbff);
  gfx.fillRect(1, 2, 2, 1);
  gfx.fillRect(2, 1, 1, 1);

  // Dark facet (bottom-right)
  gfx.fillStyle(0x2266aa);
  gfx.fillRect(3, 3, 2, 1);
  gfx.fillRect(3, 4, 1, 1);

  // Bright highlight
  gfx.fillStyle(0xaaddff);
  gfx.fillRect(2, 2, 1, 1);

  gfx.generateTexture('xpGem', 6, 6);
  gfx.destroy();
}

function generateGrass(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 16x16 grass tile with more variation and detail

  // Base green
  gfx.fillStyle(0x4a8c3f);
  gfx.fillRect(0, 0, 16, 16);

  // Darker patches (earth showing through)
  gfx.fillStyle(0x3d7a33);
  gfx.fillRect(2, 3, 3, 2);
  gfx.fillRect(10, 7, 3, 2);
  gfx.fillRect(6, 12, 3, 2);
  gfx.fillRect(13, 1, 2, 2);
  gfx.fillRect(0, 8, 2, 2);
  gfx.fillRect(8, 0, 2, 1);

  // Dithered transition areas
  gfx.fillStyle(0x3d7a33);
  gfx.fillRect(5, 3, 1, 1);
  gfx.fillRect(12, 8, 1, 1);
  gfx.fillRect(1, 5, 1, 1);
  gfx.fillRect(9, 12, 1, 1);
  gfx.fillRect(14, 4, 1, 1);
  gfx.fillRect(7, 9, 1, 1);

  // Lighter patches
  gfx.fillStyle(0x5a9c4f);
  gfx.fillRect(7, 2, 2, 1);
  gfx.fillRect(0, 9, 2, 1);
  gfx.fillRect(12, 13, 2, 1);
  gfx.fillRect(4, 7, 2, 1);
  gfx.fillRect(9, 4, 1, 1);

  // Bright highlight grass blades
  gfx.fillStyle(0x6aac5f);
  gfx.fillRect(3, 1, 1, 1);
  gfx.fillRect(11, 5, 1, 1);
  gfx.fillRect(6, 10, 1, 1);
  gfx.fillRect(14, 11, 1, 1);

  // Small flowers (occasional color)
  gfx.fillStyle(0xffee55);
  gfx.fillRect(11, 3, 1, 1);
  gfx.fillStyle(0xff8888);
  gfx.fillRect(4, 14, 1, 1);

  // Tiny pebbles
  gfx.fillStyle(0x8a7a6a);
  gfx.fillRect(1, 12, 1, 1);
  gfx.fillRect(14, 7, 1, 1);

  gfx.generateTexture('grass', 16, 16);
  gfx.destroy();
}

function generateTree(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 16x24 tree with dark outline, bark texture, leafy detail

  // === Dark outline ===
  gfx.fillStyle(0x1a1a1a);
  // Trunk outline
  gfx.fillRect(5, 14, 1, 10);
  gfx.fillRect(10, 14, 1, 10);
  gfx.fillRect(5, 23, 6, 1);
  // Leaf canopy outline
  gfx.fillRect(0, 7, 1, 5);
  gfx.fillRect(15, 7, 1, 5);
  gfx.fillRect(1, 5, 1, 3);
  gfx.fillRect(14, 5, 1, 3);
  gfx.fillRect(3, 3, 1, 2);
  gfx.fillRect(12, 3, 1, 2);
  gfx.fillRect(4, 3, 8, 1);
  gfx.fillRect(1, 12, 14, 1);

  // === Trunk (3 brown tones) ===
  gfx.fillStyle(0x6b4226);
  gfx.fillRect(6, 14, 4, 9);
  // Bark texture (darker)
  gfx.fillStyle(0x4a2e16);
  gfx.fillRect(7, 15, 1, 2);
  gfx.fillRect(8, 18, 1, 3);
  gfx.fillRect(6, 20, 1, 2);
  // Bark highlight
  gfx.fillStyle(0x7a5536);
  gfx.fillRect(6, 16, 1, 2);
  gfx.fillRect(9, 14, 1, 3);

  // === Leaves (layered, 4 green tones) ===
  // Darkest (back layer)
  gfx.fillStyle(0x1e5512);
  gfx.fillRect(2, 6, 12, 6);
  gfx.fillRect(1, 8, 14, 4);

  // Mid-dark
  gfx.fillStyle(0x2d6b1e);
  gfx.fillRect(2, 5, 12, 6);
  gfx.fillRect(4, 4, 8, 2);

  // Mid-light
  gfx.fillStyle(0x3d8b2e);
  gfx.fillRect(3, 5, 5, 4);
  gfx.fillRect(8, 6, 5, 3);

  // Bright highlights
  gfx.fillStyle(0x4a9c3f);
  gfx.fillRect(5, 4, 3, 2);
  gfx.fillRect(4, 6, 2, 1);

  // Dithered leaf detail
  gfx.fillStyle(0x2d6b1e);
  gfx.fillRect(4, 7, 1, 1);
  gfx.fillRect(6, 9, 1, 1);
  gfx.fillRect(10, 7, 1, 1);
  gfx.fillRect(8, 5, 1, 1);
  gfx.fillStyle(0x4a9c3f);
  gfx.fillRect(9, 6, 1, 1);
  gfx.fillRect(3, 8, 1, 1);
  gfx.fillRect(11, 9, 1, 1);

  gfx.generateTexture('tree', 16, 24);
  gfx.destroy();
}

function generateDart(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 8x3 dart with outline, metallic shading, fletching

  // Outline
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(0, 0, 8, 3);

  // Shaft (metallic silver with shading)
  gfx.fillStyle(0xaaaaaa);
  gfx.fillRect(0, 1, 5, 1);
  // Shaft highlight
  gfx.fillStyle(0xdddddd);
  gfx.fillRect(1, 1, 3, 1);

  // Fletching (feather detail)
  gfx.fillStyle(0x8888cc);
  gfx.fillRect(0, 0, 2, 1);
  gfx.fillRect(0, 2, 2, 1);
  gfx.fillStyle(0x6666aa);
  gfx.fillRect(0, 0, 1, 1);
  gfx.fillRect(0, 2, 1, 1);

  // Tip (red, sharp)
  gfx.fillStyle(0xff4444);
  gfx.fillRect(5, 0, 2, 3);
  gfx.fillStyle(0xdd2222);
  gfx.fillRect(6, 0, 1, 1);
  gfx.fillRect(6, 2, 1, 1);
  gfx.fillStyle(0xee3333);
  gfx.fillRect(7, 1, 1, 1); // point

  gfx.generateTexture('dart', 8, 3);
  gfx.destroy();
}

function generateUnicorn(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 32x24 unicorn with rider — outlined, detailed

  // === Dark outline ===
  gfx.fillStyle(0x1a1a1a);
  // Body outline
  gfx.fillRect(7, 9, 18, 1);
  gfx.fillRect(7, 10, 1, 9);
  gfx.fillRect(25, 10, 1, 9);
  gfx.fillRect(7, 18, 18, 1);
  // Head outline
  gfx.fillRect(1, 7, 7, 1);
  gfx.fillRect(1, 8, 1, 6);
  gfx.fillRect(1, 13, 6, 1);
  // Leg outlines
  gfx.fillRect(9, 19, 1, 5);
  gfx.fillRect(12, 19, 1, 5);
  gfx.fillRect(18, 19, 1, 5);
  gfx.fillRect(21, 19, 1, 5);
  // Rider outline
  gfx.fillRect(13, 3, 1, 7);
  gfx.fillRect(19, 3, 1, 7);

  // === Horse body (white with muscle shading) ===
  gfx.fillStyle(0xffffff);
  gfx.fillRect(8, 10, 17, 8);
  // Belly shadow
  gfx.fillStyle(0xdddddd);
  gfx.fillRect(8, 16, 17, 2);
  gfx.fillRect(8, 10, 1, 8);
  // Muscle highlight
  gfx.fillStyle(0xffffff);
  gfx.fillRect(12, 11, 4, 3);
  gfx.fillRect(19, 11, 3, 3);

  // Neck
  gfx.fillStyle(0xeeeeee);
  gfx.fillRect(6, 10, 3, 6);

  // === Head ===
  gfx.fillStyle(0xffffff);
  gfx.fillRect(2, 8, 6, 5);
  gfx.fillStyle(0xeeeeee);
  gfx.fillRect(2, 11, 6, 2);
  // Eye
  gfx.fillStyle(0x000000);
  gfx.fillRect(3, 9, 2, 2);
  gfx.fillStyle(0x4444cc);
  gfx.fillRect(3, 9, 1, 1);
  // Nostril
  gfx.fillStyle(0xccbbbb);
  gfx.fillRect(2, 11, 1, 1);

  // === Horn (golden, shaded) ===
  gfx.fillStyle(0xffd700);
  gfx.fillRect(3, 4, 2, 4);
  gfx.fillRect(4, 2, 1, 2);
  // Horn highlight
  gfx.fillStyle(0xffee66);
  gfx.fillRect(3, 5, 1, 2);
  // Horn shadow
  gfx.fillStyle(0xccaa00);
  gfx.fillRect(4, 4, 1, 3);

  // === Mane (purple, flowing) ===
  gfx.fillStyle(0xaa44ff);
  gfx.fillRect(6, 7, 3, 5);
  gfx.fillStyle(0x8833cc);
  gfx.fillRect(7, 8, 2, 3);
  gfx.fillStyle(0xcc66ff);
  gfx.fillRect(6, 7, 1, 2);

  // === Tail (purple) ===
  gfx.fillStyle(0xaa44ff);
  gfx.fillRect(25, 10, 4, 2);
  gfx.fillRect(27, 12, 3, 3);
  gfx.fillStyle(0xcc66ff);
  gfx.fillRect(25, 10, 2, 1);

  // === Legs (white, shaded) ===
  gfx.fillStyle(0xeeeeee);
  gfx.fillRect(10, 18, 2, 5);
  gfx.fillRect(14, 18, 2, 5);
  gfx.fillRect(19, 18, 2, 5);
  gfx.fillRect(23, 18, 2, 5);
  // Leg shadow
  gfx.fillStyle(0xcccccc);
  gfx.fillRect(11, 19, 1, 4);
  gfx.fillRect(15, 19, 1, 4);
  gfx.fillRect(20, 19, 1, 4);
  gfx.fillRect(24, 19, 1, 4);

  // === Hooves (dark grey) ===
  gfx.fillStyle(0x555555);
  gfx.fillRect(10, 23, 2, 1);
  gfx.fillRect(14, 23, 2, 1);
  gfx.fillRect(19, 23, 2, 1);
  gfx.fillRect(23, 23, 2, 1);

  // === Rider body (red tunic with shading) ===
  gfx.fillStyle(0xcc3333);
  gfx.fillRect(14, 4, 5, 6);
  gfx.fillStyle(0xaa2222);
  gfx.fillRect(14, 8, 5, 2);  // shadow
  gfx.fillStyle(0xdd4444);
  gfx.fillRect(15, 5, 2, 2);  // highlight
  // Belt
  gfx.fillStyle(0x4a2e16);
  gfx.fillRect(14, 9, 5, 1);

  // === Rider head ===
  gfx.fillStyle(0xf5c69a);
  gfx.fillRect(15, 0, 3, 4);
  gfx.fillStyle(0xdba878);
  gfx.fillRect(17, 1, 1, 2);  // face shadow
  // Eyes
  gfx.fillStyle(0x000000);
  gfx.fillRect(15, 1, 1, 1);
  // Hair
  gfx.fillStyle(0x4a2e16);
  gfx.fillRect(15, 0, 3, 1);

  gfx.generateTexture('unicorn', 32, 24);
  gfx.destroy();
}

function generateAura(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 32x32 circular aura with ring pattern
  gfx.fillStyle(0x44aaff, 0.2);
  gfx.fillCircle(16, 16, 16);
  gfx.fillStyle(0x66ccff, 0.15);
  gfx.fillCircle(16, 16, 12);
  // Inner ring detail
  gfx.lineStyle(1, 0x88ddff, 0.3);
  gfx.strokeCircle(16, 16, 14);
  gfx.lineStyle(1, 0xaaeeff, 0.2);
  gfx.strokeCircle(16, 16, 10);
  // Core glow
  gfx.fillStyle(0xaaddff, 0.1);
  gfx.fillCircle(16, 16, 6);
  gfx.generateTexture('aura', 32, 32);
  gfx.destroy();
}

function generateSpear(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 4x14 vertical spear with outline, wood grain, sharp head

  // Dark outline
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(0, 0, 4, 14);

  // Shaft (brown wood with grain)
  gfx.fillStyle(0x8b6914);
  gfx.fillRect(1, 0, 2, 10);
  // Wood grain (darker stripe)
  gfx.fillStyle(0x6b4e10);
  gfx.fillRect(2, 0, 1, 9);
  // Wood highlight
  gfx.fillStyle(0xa07a1e);
  gfx.fillRect(1, 1, 1, 3);
  gfx.fillRect(1, 6, 1, 2);

  // Spearhead (steel with shading)
  gfx.fillStyle(0xbbbbbb);
  gfx.fillRect(1, 10, 2, 2);
  gfx.fillRect(0, 11, 4, 2);
  // Head highlight
  gfx.fillStyle(0xeeeeee);
  gfx.fillRect(1, 10, 1, 2);
  // Head shadow
  gfx.fillStyle(0x888888);
  gfx.fillRect(3, 12, 1, 1);
  // Tip
  gfx.fillStyle(0xdddddd);
  gfx.fillRect(1, 13, 2, 1);

  gfx.generateTexture('spear', 4, 14);
  gfx.destroy();
}

function generateFlame(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 8x8 fire patch with layered gradient and outline

  // Outer dark edge (red-black)
  gfx.fillStyle(0x661100);
  gfx.fillRect(1, 1, 6, 6);
  gfx.fillRect(2, 0, 4, 8);
  gfx.fillRect(0, 2, 8, 4);

  // Red outer flame
  gfx.fillStyle(0xcc2200);
  gfx.fillRect(2, 1, 4, 6);
  gfx.fillRect(1, 2, 6, 4);

  // Orange mid flame
  gfx.fillStyle(0xff6600);
  gfx.fillRect(2, 2, 4, 4);
  gfx.fillRect(3, 1, 2, 5);

  // Yellow inner flame
  gfx.fillStyle(0xffcc00);
  gfx.fillRect(3, 2, 2, 3);

  // Hot white-yellow core
  gfx.fillStyle(0xffee88);
  gfx.fillRect(3, 3, 2, 2);

  // White hot center pixel
  gfx.fillStyle(0xffffcc);
  gfx.fillRect(4, 3, 1, 1);

  // Flame tips (red, reaching up)
  gfx.fillStyle(0xcc2200);
  gfx.fillRect(3, 0, 1, 1);
  gfx.fillRect(5, 0, 1, 1);

  gfx.generateTexture('flame', 8, 8);
  gfx.destroy();
}

function generateTornado(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 12x20 funnel with outline, swirl detail, debris

  // Dark outline
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(0, 0, 12, 1);
  gfx.fillRect(0, 0, 1, 4);
  gfx.fillRect(11, 0, 1, 4);
  gfx.fillRect(1, 3, 1, 4);
  gfx.fillRect(10, 3, 1, 4);
  gfx.fillRect(2, 7, 1, 4);
  gfx.fillRect(9, 7, 1, 4);
  gfx.fillRect(3, 11, 1, 4);
  gfx.fillRect(8, 11, 1, 4);
  gfx.fillRect(4, 15, 1, 5);
  gfx.fillRect(7, 15, 1, 5);

  // Top (lightest, widest)
  gfx.fillStyle(0xbbbbbb);
  gfx.fillRect(1, 0, 10, 3);
  // Upper middle
  gfx.fillStyle(0x999999);
  gfx.fillRect(2, 3, 8, 4);
  // Middle
  gfx.fillStyle(0x777777);
  gfx.fillRect(3, 7, 6, 4);
  // Lower middle
  gfx.fillStyle(0x666666);
  gfx.fillRect(4, 11, 4, 4);
  // Base (darkest, narrowest)
  gfx.fillStyle(0x555555);
  gfx.fillRect(5, 15, 2, 5);

  // Swirl highlights (white streaks)
  gfx.fillStyle(0xdddddd);
  gfx.fillRect(3, 1, 3, 1);
  gfx.fillRect(7, 2, 2, 1);
  gfx.fillStyle(0xcccccc);
  gfx.fillRect(4, 5, 3, 1);
  gfx.fillRect(6, 8, 2, 1);
  gfx.fillRect(4, 12, 2, 1);
  gfx.fillRect(5, 16, 1, 1);

  // Swirl shadows (darker streaks)
  gfx.fillStyle(0x444444);
  gfx.fillRect(6, 4, 2, 1);
  gfx.fillRect(3, 9, 2, 1);
  gfx.fillRect(5, 13, 2, 1);

  // Debris pixels
  gfx.fillStyle(0x8b6914);  // wood
  gfx.fillRect(2, 2, 1, 1);
  gfx.fillStyle(0x4a8c3f);  // leaf
  gfx.fillRect(9, 4, 1, 1);
  gfx.fillStyle(0x888888);  // stone
  gfx.fillRect(4, 10, 1, 1);

  gfx.generateTexture('tornado', 12, 20);
  gfx.destroy();
}

function generateBugs(scene) {
  // Light green bug (5x4) with outline and wing detail
  const gfx1 = scene.make.graphics({ add: false });
  // Outline
  gfx1.fillStyle(0x1a1a1a);
  gfx1.fillRect(0, 0, 5, 4);
  // Body
  gfx1.fillStyle(0x66dd44);
  gfx1.fillRect(1, 0, 3, 3);
  // Head highlight
  gfx1.fillStyle(0x88ff66);
  gfx1.fillRect(1, 0, 2, 1);
  // Wing shimmer
  gfx1.fillStyle(0xaaffaa);
  gfx1.fillRect(2, 1, 1, 1);
  // Legs
  gfx1.fillStyle(0x44aa22);
  gfx1.fillRect(0, 1, 1, 1);
  gfx1.fillRect(4, 1, 1, 1);
  gfx1.fillRect(0, 2, 1, 1);
  gfx1.fillRect(4, 2, 1, 1);
  // Eyes
  gfx1.fillStyle(0x000000);
  gfx1.fillRect(1, 1, 1, 1);
  gfx1.fillRect(3, 1, 1, 1);
  // Antenna
  gfx1.fillStyle(0x44aa22);
  gfx1.fillRect(1, 0, 1, 1);
  gfx1.fillRect(3, 0, 1, 1);
  // Abdomen detail
  gfx1.fillStyle(0x55cc33);
  gfx1.fillRect(2, 2, 1, 1);
  gfx1.generateTexture('bug_light', 5, 4);
  gfx1.destroy();

  // Dark green bug (5x4) with outline and wing detail
  const gfx2 = scene.make.graphics({ add: false });
  // Outline
  gfx2.fillStyle(0x1a1a1a);
  gfx2.fillRect(0, 0, 5, 4);
  // Body
  gfx2.fillStyle(0x338822);
  gfx2.fillRect(1, 0, 3, 3);
  // Head highlight
  gfx2.fillStyle(0x44aa33);
  gfx2.fillRect(1, 0, 2, 1);
  // Wing shimmer
  gfx2.fillStyle(0x55bb44);
  gfx2.fillRect(2, 1, 1, 1);
  // Legs
  gfx2.fillStyle(0x226611);
  gfx2.fillRect(0, 1, 1, 1);
  gfx2.fillRect(4, 1, 1, 1);
  gfx2.fillRect(0, 2, 1, 1);
  gfx2.fillRect(4, 2, 1, 1);
  // Eyes
  gfx2.fillStyle(0x000000);
  gfx2.fillRect(1, 1, 1, 1);
  gfx2.fillRect(3, 1, 1, 1);
  // Antenna
  gfx2.fillStyle(0x226611);
  gfx2.fillRect(1, 0, 1, 1);
  gfx2.fillRect(3, 0, 1, 1);
  // Abdomen detail
  gfx2.fillStyle(0x2a7718);
  gfx2.fillRect(2, 2, 1, 1);
  gfx2.generateTexture('bug_dark', 5, 4);
  gfx2.destroy();

  // Combined 'bug' icon for upgrade card
  const gfx3 = scene.make.graphics({ add: false });
  // Outline
  gfx3.fillStyle(0x1a1a1a);
  gfx3.fillRect(0, 0, 8, 7);
  // Light bug top-left
  gfx3.fillStyle(0x66dd44);
  gfx3.fillRect(1, 0, 3, 3);
  gfx3.fillStyle(0x88ff66);
  gfx3.fillRect(1, 0, 2, 1);
  gfx3.fillStyle(0x44aa22);
  gfx3.fillRect(0, 1, 1, 1);
  gfx3.fillRect(4, 1, 1, 1);
  gfx3.fillStyle(0x000000);
  gfx3.fillRect(1, 1, 1, 1);
  gfx3.fillRect(3, 1, 1, 1);
  // Dark bug bottom-right
  gfx3.fillStyle(0x338822);
  gfx3.fillRect(4, 3, 3, 3);
  gfx3.fillStyle(0x44aa33);
  gfx3.fillRect(4, 3, 2, 1);
  gfx3.fillStyle(0x226611);
  gfx3.fillRect(3, 4, 1, 1);
  gfx3.fillRect(7, 4, 1, 1);
  gfx3.fillStyle(0x000000);
  gfx3.fillRect(4, 4, 1, 1);
  gfx3.fillRect(6, 4, 1, 1);
  gfx3.generateTexture('bug', 8, 7);
  gfx3.destroy();
}

function generateFencer(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 4-frame spritesheet (64x16): idle, walk1, walk2, walk3
  // Fencer with mask, white fencing outfit, rapier

  for (let frame = 0; frame < 4; frame++) {
    const ox = frame * 16;
    const legOffset = [0, -1, 0, 1][frame];

    // === Dark outline ===
    gfx.fillStyle(0x1a1a1a);
    gfx.fillRect(ox + 4, 0, 8, 1);
    gfx.fillRect(ox + 3, 1, 1, 5);
    gfx.fillRect(ox + 12, 1, 1, 5);
    gfx.fillRect(ox + 2, 6, 1, 6);
    gfx.fillRect(ox + 13, 6, 1, 6);
    gfx.fillRect(ox + 4, 11, 1, 5);
    gfx.fillRect(ox + 11, 11, 1, 5);

    // === Fencer mask (grey mesh with dark visor) ===
    gfx.fillStyle(0xaaaaaa);
    gfx.fillRect(ox + 4, 0, 8, 5);
    // Mask highlight
    gfx.fillStyle(0xcccccc);
    gfx.fillRect(ox + 5, 0, 4, 2);
    // Mesh pattern (dithered)
    gfx.fillStyle(0x888888);
    gfx.fillRect(ox + 5, 2, 1, 1);
    gfx.fillRect(ox + 7, 2, 1, 1);
    gfx.fillRect(ox + 9, 2, 1, 1);
    gfx.fillRect(ox + 6, 3, 1, 1);
    gfx.fillRect(ox + 8, 3, 1, 1);
    // Visor slit
    gfx.fillStyle(0x222222);
    gfx.fillRect(ox + 5, 3, 5, 1);
    // Mask brim
    gfx.fillStyle(0x666666);
    gfx.fillRect(ox + 4, 5, 8, 1);

    // === White fencing jacket ===
    gfx.fillStyle(0xeeeeee);
    gfx.fillRect(ox + 4, 6, 8, 5);
    // Jacket shadow
    gfx.fillStyle(0xcccccc);
    gfx.fillRect(ox + 4, 9, 8, 2);
    gfx.fillRect(ox + 4, 6, 1, 5);
    gfx.fillRect(ox + 11, 6, 1, 5);
    // Jacket highlight
    gfx.fillStyle(0xffffff);
    gfx.fillRect(ox + 6, 6, 3, 3);
    // Chest protector (plastron) - slightly off-white
    gfx.fillStyle(0xdddddd);
    gfx.fillRect(ox + 5, 7, 2, 3);
    // Zipper line
    gfx.fillStyle(0xaaaaaa);
    gfx.fillRect(ox + 7, 6, 1, 4);

    // === Arms (gloved) ===
    gfx.fillStyle(0xeeeeee);
    gfx.fillRect(ox + 2, 7, 2, 2);
    gfx.fillRect(ox + 12, 7, 2, 2);
    // Glove (white fencing glove)
    gfx.fillStyle(0xdddddd);
    gfx.fillRect(ox + 2, 9, 2, 2);
    gfx.fillRect(ox + 12, 9, 2, 2);
    // Glove cuff
    gfx.fillStyle(0x888888);
    gfx.fillRect(ox + 2, 9, 2, 1);
    gfx.fillRect(ox + 12, 9, 2, 1);

    // === Belt ===
    gfx.fillStyle(0x444444);
    gfx.fillRect(ox + 4, 10, 8, 1);
    // Buckle
    gfx.fillStyle(0xcccccc);
    gfx.fillRect(ox + 7, 10, 2, 1);

    // === Legs (white fencing breeches) ===
    gfx.fillStyle(0xdddddd);
    gfx.fillRect(ox + 5, 11, 2, 3 + legOffset);
    gfx.fillRect(ox + 9, 11, 2, 3 - legOffset);
    // Leg shadow
    gfx.fillStyle(0xbbbbbb);
    gfx.fillRect(ox + 6, 12, 1, 1);
    gfx.fillRect(ox + 10, 12, 1, 1);

    // === Fencing shoes (dark) ===
    gfx.fillStyle(0x333333);
    gfx.fillRect(ox + 4, 14 + legOffset, 3, 2 - Math.abs(legOffset));
    gfx.fillRect(ox + 9, 14 - legOffset, 3, 2 - Math.abs(legOffset));
    // Shoe highlight
    gfx.fillStyle(0x444444);
    gfx.fillRect(ox + 5, 14 + legOffset, 1, 1);
    gfx.fillRect(ox + 10, 14 - legOffset, 1, 1);
  }

  gfx.generateTexture('fencer_sheet', 64, 16);
  gfx.destroy();

  scene.textures.get('fencer_sheet').add('__BASE', 0, 0, 0, 64, 16);

  const rt = scene.make.renderTexture({ width: 16, height: 16, add: false });
  const tempSprite = scene.add.sprite(0, 0, 'fencer_sheet').setOrigin(0, 0).setCrop(0, 0, 16, 16);
  rt.draw(tempSprite, 0, 0);
  rt.saveTexture('fencer');
  tempSprite.destroy();
}

function generatePot(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 12x12 clay pot with outline

  // Dark outline
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(3, 0, 6, 1);
  gfx.fillRect(2, 1, 1, 2);
  gfx.fillRect(9, 1, 1, 2);
  gfx.fillRect(1, 3, 1, 7);
  gfx.fillRect(10, 3, 1, 7);
  gfx.fillRect(2, 10, 1, 1);
  gfx.fillRect(9, 10, 1, 1);
  gfx.fillRect(3, 11, 6, 1);

  // Pot body (terracotta)
  gfx.fillStyle(0xcc7744);
  gfx.fillRect(2, 3, 8, 7);
  gfx.fillRect(3, 10, 6, 1);

  // Rim
  gfx.fillStyle(0xbb6633);
  gfx.fillRect(3, 0, 6, 1);
  gfx.fillRect(2, 1, 8, 2);
  // Rim highlight
  gfx.fillStyle(0xdd8855);
  gfx.fillRect(3, 0, 4, 1);
  gfx.fillRect(3, 1, 5, 1);

  // Body shading
  gfx.fillStyle(0xaa5533);
  gfx.fillRect(7, 4, 3, 5);
  gfx.fillRect(8, 9, 1, 1);
  // Body highlight
  gfx.fillStyle(0xdd8855);
  gfx.fillRect(3, 4, 2, 4);
  gfx.fillStyle(0xee9966);
  gfx.fillRect(3, 5, 1, 2);

  // Decorative band
  gfx.fillStyle(0x996633);
  gfx.fillRect(2, 5, 8, 1);

  gfx.generateTexture('pot', 12, 12);
  gfx.destroy();
}

function generateHealthPotion(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 8x10 health potion bottle

  // Dark outline
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(2, 0, 4, 1);
  gfx.fillRect(3, 0, 2, 3);
  gfx.fillRect(1, 3, 1, 6);
  gfx.fillRect(6, 3, 1, 6);
  gfx.fillRect(2, 9, 4, 1);

  // Cork
  gfx.fillStyle(0x8b6914);
  gfx.fillRect(3, 0, 2, 2);
  gfx.fillStyle(0xa07a1e);
  gfx.fillRect(3, 0, 1, 1);

  // Bottle neck
  gfx.fillStyle(0xcc3333);
  gfx.fillRect(3, 2, 2, 1);

  // Bottle body (red liquid)
  gfx.fillStyle(0xcc3333);
  gfx.fillRect(2, 3, 4, 6);
  // Liquid highlight
  gfx.fillStyle(0xff4444);
  gfx.fillRect(2, 4, 2, 3);
  gfx.fillStyle(0xff6666);
  gfx.fillRect(2, 5, 1, 1);
  // Liquid dark
  gfx.fillStyle(0xaa2222);
  gfx.fillRect(4, 6, 2, 2);

  // Glass shine
  gfx.fillStyle(0xffaaaa);
  gfx.fillRect(2, 3, 1, 2);

  // Heart symbol on bottle
  gfx.fillStyle(0xff8888);
  gfx.fillRect(3, 5, 1, 1);
  gfx.fillRect(4, 5, 1, 1);
  gfx.fillRect(3, 6, 2, 1);

  gfx.generateTexture('healthPotion', 8, 10);
  gfx.destroy();
}

function generateRapier(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 30x7 rapier - long, flashy blade with glow

  // Outer glow (cyan/white aura)
  gfx.fillStyle(0x88ccff, 0.3);
  gfx.fillRect(6, 0, 24, 7);

  // Dark outline
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(5, 1, 25, 5);

  // Blade body (silver)
  gfx.fillStyle(0xbbbbbb);
  gfx.fillRect(8, 2, 20, 3);

  // Blade mid highlight
  gfx.fillStyle(0xdddddd);
  gfx.fillRect(10, 2, 16, 3);

  // Blade bright center line
  gfx.fillStyle(0xffffff);
  gfx.fillRect(12, 3, 14, 1);

  // Blade tip (bright white point)
  gfx.fillStyle(0xffffff);
  gfx.fillRect(28, 3, 2, 1);
  gfx.fillRect(27, 2, 2, 3);

  // Sparkle at tip
  gfx.fillStyle(0xaaddff);
  gfx.fillRect(29, 2, 1, 1);
  gfx.fillRect(29, 4, 1, 1);

  // Guard (gold ornate cross)
  gfx.fillStyle(0xffd700);
  gfx.fillRect(6, 0, 2, 7);
  gfx.fillStyle(0xffaa00);
  gfx.fillRect(6, 0, 2, 1);
  gfx.fillRect(6, 6, 2, 1);
  // Guard gem (red center)
  gfx.fillStyle(0xff2222);
  gfx.fillRect(6, 3, 2, 1);

  // Handle (dark wood with wrap)
  gfx.fillStyle(0x4a2e16);
  gfx.fillRect(0, 2, 6, 3);
  gfx.fillStyle(0x5c3a1e);
  gfx.fillRect(1, 2, 1, 3);
  gfx.fillRect(3, 2, 1, 3);
  // Pommel
  gfx.fillStyle(0xffd700);
  gfx.fillRect(0, 2, 1, 3);

  gfx.generateTexture('rapier', 30, 7);
  gfx.destroy();
}

function generateDealer(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 4-frame spritesheet (64x16): idle, walk1, walk2, walk3
  // Card dealer: top hat, vest, bowtie, elegant look

  for (let frame = 0; frame < 4; frame++) {
    const ox = frame * 16;
    const legOffset = [0, -1, 0, 1][frame];

    // === Dark outline ===
    gfx.fillStyle(0x1a1a1a);
    gfx.fillRect(ox + 3, 0, 10, 1);
    gfx.fillRect(ox + 4, 0, 8, 1);
    gfx.fillRect(ox + 3, 3, 1, 3);
    gfx.fillRect(ox + 12, 3, 1, 3);
    gfx.fillRect(ox + 2, 6, 1, 6);
    gfx.fillRect(ox + 13, 6, 1, 6);
    gfx.fillRect(ox + 4, 11, 1, 5);
    gfx.fillRect(ox + 11, 11, 1, 5);

    // === Top hat (tall, dark) ===
    gfx.fillStyle(0x222222);
    gfx.fillRect(ox + 5, 0, 6, 3); // hat crown
    gfx.fillStyle(0x333333);
    gfx.fillRect(ox + 6, 0, 4, 2); // hat highlight
    // Hat brim
    gfx.fillStyle(0x1a1a1a);
    gfx.fillRect(ox + 3, 2, 10, 1);
    // Hat band (purple/magenta)
    gfx.fillStyle(0xaa44cc);
    gfx.fillRect(ox + 5, 2, 6, 1);
    gfx.fillStyle(0xcc66ee);
    gfx.fillRect(ox + 7, 2, 2, 1); // band highlight

    // === Head (pale skin — mysterious) ===
    gfx.fillStyle(0xf0d8c0);
    gfx.fillRect(ox + 5, 3, 6, 3);
    gfx.fillStyle(0xdcc0a8);
    gfx.fillRect(ox + 5, 4, 1, 2);
    gfx.fillRect(ox + 10, 4, 1, 2);
    // Eyes (sharp, dark)
    gfx.fillStyle(0x220022);
    gfx.fillRect(ox + 6, 4, 1, 1);
    gfx.fillRect(ox + 9, 4, 1, 1);
    // Sly smirk
    gfx.fillStyle(0xc0a088);
    gfx.fillRect(ox + 7, 5, 2, 1);

    // === Vest (dark purple with gold trim) ===
    gfx.fillStyle(0x442266);
    gfx.fillRect(ox + 5, 6, 6, 5);
    // White shirt underneath
    gfx.fillStyle(0xeeeeee);
    gfx.fillRect(ox + 6, 6, 4, 4);
    // Shirt dither
    gfx.fillStyle(0xdddddd);
    gfx.fillRect(ox + 7, 7, 1, 1);
    gfx.fillRect(ox + 6, 8, 1, 1);
    // Vest lapels
    gfx.fillStyle(0x331155);
    gfx.fillRect(ox + 5, 6, 1, 4);
    gfx.fillRect(ox + 10, 6, 1, 4);
    // Gold vest trim
    gfx.fillStyle(0xffd700);
    gfx.fillRect(ox + 5, 6, 1, 1);
    gfx.fillRect(ox + 10, 6, 1, 1);
    // Bowtie (red)
    gfx.fillStyle(0xcc2222);
    gfx.fillRect(ox + 7, 6, 2, 1);
    gfx.fillStyle(0xee3333);
    gfx.fillRect(ox + 7, 6, 1, 1);

    // === Belt ===
    gfx.fillStyle(0x222222);
    gfx.fillRect(ox + 5, 10, 6, 1);
    gfx.fillStyle(0xffd700);
    gfx.fillRect(ox + 7, 10, 2, 1);

    // === Arms (white sleeves + gloves) ===
    gfx.fillStyle(0xeeeeee);
    gfx.fillRect(ox + 3, 7, 2, 2);
    gfx.fillRect(ox + 11, 7, 2, 2);
    // White gloves
    gfx.fillStyle(0xffffff);
    gfx.fillRect(ox + 3, 9, 2, 2);
    gfx.fillRect(ox + 11, 9, 2, 2);
    // Glove shadow
    gfx.fillStyle(0xdddddd);
    gfx.fillRect(ox + 3, 10, 1, 1);
    gfx.fillRect(ox + 12, 10, 1, 1);

    // Card in hand (frame 0 and 2 only)
    if (frame === 0 || frame === 2) {
      gfx.fillStyle(0xffffff);
      gfx.fillRect(ox + 13, 8, 2, 3);
      gfx.fillStyle(0xcc2222);
      gfx.fillRect(ox + 13, 9, 1, 1);
    }

    // === Legs (dark dress pants) ===
    gfx.fillStyle(0x2a2a2a);
    gfx.fillRect(ox + 5, 11, 2, 3 + legOffset);
    gfx.fillRect(ox + 9, 11, 2, 3 - legOffset);
    // Pant highlight
    gfx.fillStyle(0x3a3a3a);
    gfx.fillRect(ox + 5, 11, 1, 2);
    gfx.fillRect(ox + 9, 11, 1, 2);

    // === Shoes (polished black) ===
    gfx.fillStyle(0x111111);
    gfx.fillRect(ox + 4, 14 + legOffset, 3, 2 - Math.abs(legOffset));
    gfx.fillRect(ox + 9, 14 - legOffset, 3, 2 - Math.abs(legOffset));
    // Shoe shine
    gfx.fillStyle(0x333333);
    gfx.fillRect(ox + 5, 14 + legOffset, 1, 1);
    gfx.fillRect(ox + 10, 14 - legOffset, 1, 1);
  }

  gfx.generateTexture('dealer_sheet', 64, 16);
  gfx.destroy();

  scene.textures.get('dealer_sheet').add('__BASE', 0, 0, 0, 64, 16);

  const rt = scene.make.renderTexture({ width: 16, height: 16, add: false });
  const tempSprite = scene.add.sprite(0, 0, 'dealer_sheet').setOrigin(0, 0).setCrop(0, 0, 16, 16);
  rt.draw(tempSprite, 0, 0);
  rt.saveTexture('dealer');
  tempSprite.destroy();
}

function generateCards(scene) {
  // Generate 5 card sprites: heart, spade, diamond, club, joker
  // Each card is 8x10 pixels

  const suits = [
    { key: 'card_heart', bg: 0xffffff, symbol: 0xff2222, drawSymbol: drawHeart },
    { key: 'card_spade', bg: 0xffffff, symbol: 0x222222, drawSymbol: drawSpade },
    { key: 'card_diamond', bg: 0xffffff, symbol: 0x22cccc, drawSymbol: drawDiamond },
    { key: 'card_club', bg: 0xffffff, symbol: 0x228822, drawSymbol: drawClub },
    { key: 'card_joker', bg: 0xffdd00, symbol: 0xff2222, drawSymbol: drawJoker },
  ];

  suits.forEach(({ key, bg, symbol, drawSymbol }) => {
    const gfx = scene.make.graphics({ add: false });

    // Card border
    gfx.fillStyle(0x333333);
    gfx.fillRect(0, 0, 8, 10);

    // Card face
    gfx.fillStyle(bg);
    gfx.fillRect(1, 1, 6, 8);

    // Suit symbol
    gfx.fillStyle(symbol);
    drawSymbol(gfx);

    gfx.generateTexture(key, 8, 10);
    gfx.destroy();
  });

  function drawHeart(gfx) {
    gfx.fillRect(2, 3, 1, 1);
    gfx.fillRect(5, 3, 1, 1);
    gfx.fillRect(2, 4, 4, 1);
    gfx.fillRect(3, 5, 2, 1);
    gfx.fillRect(3, 3, 1, 1);
    gfx.fillRect(4, 3, 1, 1);
  }

  function drawSpade(gfx) {
    gfx.fillRect(3, 3, 2, 1);
    gfx.fillRect(2, 4, 4, 1);
    gfx.fillRect(2, 5, 4, 1);
    gfx.fillRect(3, 6, 2, 1);
    gfx.fillRect(4, 2, 1, 1);
    gfx.fillRect(3, 2, 1, 1);
  }

  function drawDiamond(gfx) {
    gfx.fillRect(3, 2, 2, 1);
    gfx.fillRect(2, 3, 4, 2);
    gfx.fillRect(3, 5, 2, 1);
  }

  function drawClub(gfx) {
    gfx.fillRect(3, 2, 2, 1);
    gfx.fillRect(2, 3, 1, 2);
    gfx.fillRect(5, 3, 1, 2);
    gfx.fillRect(3, 3, 2, 2);
    gfx.fillRect(3, 5, 2, 1);
  }

  function drawJoker(gfx) {
    // Star pattern on gold card
    gfx.fillRect(3, 2, 2, 1);
    gfx.fillRect(2, 3, 4, 2);
    gfx.fillRect(3, 5, 2, 1);
    // Extra sparkle dots
    gfx.fillStyle(0xffffff);
    gfx.fillRect(2, 2, 1, 1);
    gfx.fillRect(5, 2, 1, 1);
    gfx.fillRect(2, 5, 1, 1);
    gfx.fillRect(5, 5, 1, 1);
  }
}

function generateBloodMage(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 4-frame spritesheet (64x16): idle, walk1, walk2, walk3
  // Blood Mage: dark red hooded robe, pale skin, glowing red eyes

  for (let frame = 0; frame < 4; frame++) {
    const ox = frame * 16;
    const legOffset = [0, -1, 0, 1][frame];

    // === Dark outline ===
    gfx.fillStyle(0x1a1a1a);
    gfx.fillRect(ox + 3, 0, 10, 1);
    gfx.fillRect(ox + 4, 0, 8, 1);
    gfx.fillRect(ox + 3, 3, 1, 3);
    gfx.fillRect(ox + 12, 3, 1, 3);
    gfx.fillRect(ox + 2, 6, 1, 6);
    gfx.fillRect(ox + 13, 6, 1, 6);
    gfx.fillRect(ox + 4, 11, 1, 5);
    gfx.fillRect(ox + 11, 11, 1, 5);

    // === Hood (dark crimson, pointed) ===
    gfx.fillStyle(0x5c0e0e);
    gfx.fillRect(ox + 4, 0, 8, 3); // hood body
    gfx.fillStyle(0x8b1a1a);
    gfx.fillRect(ox + 5, 0, 6, 2); // hood highlight
    gfx.fillStyle(0x3a0808);
    gfx.fillRect(ox + 4, 2, 8, 1); // hood brim shadow
    // Hood peak
    gfx.fillStyle(0x5c0e0e);
    gfx.fillRect(ox + 6, 0, 4, 1);
    gfx.fillStyle(0x7a1515);
    gfx.fillRect(ox + 7, 0, 2, 1); // peak highlight

    // === Face (pale, shadowed under hood) ===
    gfx.fillStyle(0xd4c4b0);
    gfx.fillRect(ox + 5, 3, 6, 3);
    gfx.fillStyle(0xb8a898);
    gfx.fillRect(ox + 5, 3, 1, 2); // left shadow
    gfx.fillRect(ox + 10, 3, 1, 2); // right shadow
    // Glowing red eyes
    gfx.fillStyle(0xff2222);
    gfx.fillRect(ox + 6, 4, 1, 1);
    gfx.fillRect(ox + 9, 4, 1, 1);
    // Eye glow highlight
    gfx.fillStyle(0xff6666);
    gfx.fillRect(ox + 6, 3, 1, 1);
    gfx.fillRect(ox + 9, 3, 1, 1);
    // Mouth shadow
    gfx.fillStyle(0x9a8878);
    gfx.fillRect(ox + 7, 5, 2, 1);

    // === Robe body (deep red with darker folds) ===
    gfx.fillStyle(0x6b1111);
    gfx.fillRect(ox + 5, 6, 6, 5);
    // Darker folds
    gfx.fillStyle(0x4a0a0a);
    gfx.fillRect(ox + 5, 6, 1, 4);
    gfx.fillRect(ox + 10, 6, 1, 4);
    // Inner robe highlight
    gfx.fillStyle(0x8b2020);
    gfx.fillRect(ox + 7, 7, 2, 3);
    // Blood sash/belt
    gfx.fillStyle(0xcc1111);
    gfx.fillRect(ox + 5, 10, 6, 1);
    gfx.fillStyle(0xff3333);
    gfx.fillRect(ox + 7, 10, 2, 1); // sash highlight

    // === Arms (robe sleeves + pale hands with red glow) ===
    gfx.fillStyle(0x5c0e0e);
    gfx.fillRect(ox + 3, 7, 2, 2);
    gfx.fillRect(ox + 11, 7, 2, 2);
    // Hands (pale with red tinge)
    gfx.fillStyle(0xd4c4b0);
    gfx.fillRect(ox + 3, 9, 2, 2);
    gfx.fillRect(ox + 11, 9, 2, 2);
    // Red glow at fingertips
    gfx.fillStyle(0xff3333);
    gfx.fillRect(ox + 3, 10, 1, 1);
    gfx.fillRect(ox + 12, 10, 1, 1);

    // Blood orb in hand (frame 0 and 2)
    if (frame === 0 || frame === 2) {
      gfx.fillStyle(0xcc1111);
      gfx.fillRect(ox + 13, 8, 2, 2);
      gfx.fillStyle(0xff3333);
      gfx.fillRect(ox + 13, 8, 1, 1);
    }

    // === Legs (dark robe bottom) ===
    gfx.fillStyle(0x3a0808);
    gfx.fillRect(ox + 5, 11, 2, 3 + legOffset);
    gfx.fillRect(ox + 9, 11, 2, 3 - legOffset);
    // Robe edge highlight
    gfx.fillStyle(0x5c0e0e);
    gfx.fillRect(ox + 5, 11, 1, 2);
    gfx.fillRect(ox + 9, 11, 1, 2);

    // === Feet (dark boots) ===
    gfx.fillStyle(0x1a0808);
    gfx.fillRect(ox + 4, 14 + legOffset, 3, 2 - Math.abs(legOffset));
    gfx.fillRect(ox + 9, 14 - legOffset, 3, 2 - Math.abs(legOffset));
    // Boot edge
    gfx.fillStyle(0x2a0808);
    gfx.fillRect(ox + 5, 14 + legOffset, 1, 1);
    gfx.fillRect(ox + 10, 14 - legOffset, 1, 1);
  }

  gfx.generateTexture('bloodMage_sheet', 64, 16);
  gfx.destroy();

  scene.textures.get('bloodMage_sheet').add('__BASE', 0, 0, 0, 64, 16);

  const rt = scene.make.renderTexture({ width: 16, height: 16, add: false });
  const tempSprite = scene.add.sprite(0, 0, 'bloodMage_sheet').setOrigin(0, 0).setCrop(0, 0, 16, 16);
  rt.draw(tempSprite, 0, 0);
  rt.saveTexture('bloodMage');
  tempSprite.destroy();
}

function generateBloodOrbBullet(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 6x6 blood orb with glow

  // Dark outline
  gfx.fillStyle(0x1a0000);
  gfx.fillRect(2, 0, 2, 1);
  gfx.fillRect(1, 1, 1, 1);
  gfx.fillRect(4, 1, 1, 1);
  gfx.fillRect(0, 2, 1, 2);
  gfx.fillRect(5, 2, 1, 2);
  gfx.fillRect(1, 4, 1, 1);
  gfx.fillRect(4, 4, 1, 1);
  gfx.fillRect(2, 5, 2, 1);

  // Body (dark red)
  gfx.fillStyle(0xcc1111);
  gfx.fillRect(2, 1, 2, 1);
  gfx.fillRect(1, 2, 4, 2);
  gfx.fillRect(2, 4, 2, 1);

  // Inner bright
  gfx.fillStyle(0xff3333);
  gfx.fillRect(2, 2, 2, 2);

  // Core highlight
  gfx.fillStyle(0xff8888);
  gfx.fillRect(2, 2, 1, 1);

  gfx.generateTexture('bloodOrb', 6, 6);
  gfx.destroy();
}

function generateBoot(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 8x8 boot icon — brown boot with yellow wing

  // Outline
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(2, 1, 3, 1);
  gfx.fillRect(1, 2, 1, 4);
  gfx.fillRect(2, 6, 6, 1);
  gfx.fillRect(7, 5, 1, 1);
  gfx.fillRect(5, 2, 1, 3);

  // Boot body (brown)
  gfx.fillStyle(0x8b5a2b);
  gfx.fillRect(2, 2, 3, 4);
  gfx.fillRect(5, 5, 2, 1);

  // Boot highlight
  gfx.fillStyle(0xb07840);
  gfx.fillRect(3, 2, 1, 3);

  // Boot sole (dark)
  gfx.fillStyle(0x3a2a1a);
  gfx.fillRect(2, 6, 5, 1);

  // Wing (yellow speed lines)
  gfx.fillStyle(0xffdd44);
  gfx.fillRect(5, 2, 2, 1);
  gfx.fillRect(6, 3, 2, 1);
  gfx.fillRect(5, 4, 2, 1);

  gfx.generateTexture('boot', 8, 8);
  gfx.destroy();
}

function generatePowerupFlamethrower(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 10x10 flamethrower icon — nozzle shooting fire

  // Nozzle body (dark gray)
  gfx.fillStyle(0x555555);
  gfx.fillRect(0, 3, 4, 4);

  // Nozzle tip (lighter)
  gfx.fillStyle(0x888888);
  gfx.fillRect(3, 4, 1, 2);

  // Fire burst — red outer
  gfx.fillStyle(0xcc2200);
  gfx.fillRect(4, 2, 3, 6);
  gfx.fillRect(7, 3, 2, 4);

  // Orange mid
  gfx.fillStyle(0xff6600);
  gfx.fillRect(5, 3, 2, 4);
  gfx.fillRect(7, 4, 2, 2);

  // Yellow inner
  gfx.fillStyle(0xffcc00);
  gfx.fillRect(5, 4, 2, 2);

  // White hot core
  gfx.fillStyle(0xffffcc);
  gfx.fillRect(6, 4, 1, 2);

  gfx.generateTexture('powerup_flamethrower', 10, 10);
  gfx.destroy();
}

function generatePowerupFreeze(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 10x10 snowflake/ice crystal icon

  // Outer ice glow
  gfx.fillStyle(0x88ccff);
  gfx.fillRect(4, 0, 2, 10);
  gfx.fillRect(0, 4, 10, 2);

  // Diagonal arms
  gfx.fillStyle(0x88ccff);
  gfx.fillRect(1, 1, 2, 2);
  gfx.fillRect(7, 1, 2, 2);
  gfx.fillRect(1, 7, 2, 2);
  gfx.fillRect(7, 7, 2, 2);

  // Inner bright blue
  gfx.fillStyle(0xaaddff);
  gfx.fillRect(4, 1, 2, 8);
  gfx.fillRect(1, 4, 8, 2);

  // Center white crystal
  gfx.fillStyle(0xeeffff);
  gfx.fillRect(3, 3, 4, 4);

  // Core white
  gfx.fillStyle(0xffffff);
  gfx.fillRect(4, 4, 2, 2);

  gfx.generateTexture('powerup_freeze', 10, 10);
  gfx.destroy();
}

function generateSnakeSwordsman(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 4-frame spritesheet (64x16): idle, walk1, walk2, walk3
  // Snake-themed swordsman with dark green hooded armor

  for (let frame = 0; frame < 4; frame++) {
    const ox = frame * 16;
    const legOffset = [0, -1, 0, 1][frame];

    // === Dark outline ===
    gfx.fillStyle(0x1a1a1a);
    gfx.fillRect(ox + 4, 0, 8, 1);
    gfx.fillRect(ox + 3, 1, 1, 5);
    gfx.fillRect(ox + 12, 1, 1, 5);
    gfx.fillRect(ox + 2, 6, 1, 6);
    gfx.fillRect(ox + 13, 6, 1, 6);
    gfx.fillRect(ox + 4, 11, 1, 5);
    gfx.fillRect(ox + 11, 11, 1, 5);

    // === Hood (dark green) ===
    gfx.fillStyle(0x2a5a2a);
    gfx.fillRect(ox + 4, 0, 8, 3);
    // Hood highlight
    gfx.fillStyle(0x3a7a3a);
    gfx.fillRect(ox + 5, 0, 4, 2);
    // Hood shadow
    gfx.fillStyle(0x1a4a1a);
    gfx.fillRect(ox + 4, 2, 8, 1);

    // === Face (shadowed under hood) ===
    gfx.fillStyle(0xddbb88);
    gfx.fillRect(ox + 5, 3, 6, 2);
    // Eyes (snake-like yellow)
    gfx.fillStyle(0xcccc00);
    gfx.fillRect(ox + 6, 3, 1, 1);
    gfx.fillRect(ox + 9, 3, 1, 1);
    // Eye slits (dark vertical pupils)
    gfx.fillStyle(0x222200);
    gfx.fillRect(ox + 6, 3, 1, 1);
    gfx.fillRect(ox + 9, 3, 1, 1);
    // Lighter eye glow
    gfx.fillStyle(0xdddd22);
    gfx.fillRect(ox + 6, 3, 1, 1);
    gfx.fillRect(ox + 9, 3, 1, 1);

    // === Green scale armor tunic ===
    gfx.fillStyle(0x2d6b2d);
    gfx.fillRect(ox + 4, 5, 8, 6);
    // Scale pattern (dithered lighter green)
    gfx.fillStyle(0x3a8a3a);
    gfx.fillRect(ox + 5, 5, 1, 1);
    gfx.fillRect(ox + 7, 5, 1, 1);
    gfx.fillRect(ox + 9, 5, 1, 1);
    gfx.fillRect(ox + 6, 7, 1, 1);
    gfx.fillRect(ox + 8, 7, 1, 1);
    gfx.fillRect(ox + 5, 9, 1, 1);
    gfx.fillRect(ox + 7, 9, 1, 1);
    gfx.fillRect(ox + 9, 9, 1, 1);
    // Tunic highlight
    gfx.fillStyle(0x4a9a4a);
    gfx.fillRect(ox + 6, 6, 3, 2);
    // Tunic shadow
    gfx.fillStyle(0x1a5a1a);
    gfx.fillRect(ox + 4, 9, 8, 2);

    // === Arms (armored green) ===
    gfx.fillStyle(0x2d6b2d);
    gfx.fillRect(ox + 2, 7, 2, 3);
    gfx.fillRect(ox + 12, 7, 2, 3);
    // Arm highlight
    gfx.fillStyle(0x3a8a3a);
    gfx.fillRect(ox + 3, 7, 1, 2);
    gfx.fillRect(ox + 12, 7, 1, 2);

    // === Belt with snake buckle ===
    gfx.fillStyle(0x5a3a1a);
    gfx.fillRect(ox + 4, 10, 8, 1);
    // Snake buckle (green)
    gfx.fillStyle(0x44cc44);
    gfx.fillRect(ox + 7, 10, 2, 1);

    // === Legs (dark brown pants) ===
    gfx.fillStyle(0x4a3520);
    gfx.fillRect(ox + 5, 11, 2, 3 + legOffset);
    gfx.fillRect(ox + 9, 11, 2, 3 - legOffset);
    // Leg highlight
    gfx.fillStyle(0x5a4530);
    gfx.fillRect(ox + 5, 11, 1, 2);
    gfx.fillRect(ox + 9, 11, 1, 2);

    // === Boots (dark green) ===
    gfx.fillStyle(0x1a4a1a);
    gfx.fillRect(ox + 4, 14 + legOffset, 3, 2 - Math.abs(legOffset));
    gfx.fillRect(ox + 9, 14 - legOffset, 3, 2 - Math.abs(legOffset));
    // Boot highlight
    gfx.fillStyle(0x2a5a2a);
    gfx.fillRect(ox + 5, 14 + legOffset, 1, 1);
    gfx.fillRect(ox + 10, 14 - legOffset, 1, 1);
  }

  gfx.generateTexture('snakeSwordsman_sheet', 64, 16);
  gfx.destroy();

  scene.textures.get('snakeSwordsman_sheet').add('__BASE', 0, 0, 0, 64, 16);

  const rt = scene.make.renderTexture({ width: 16, height: 16, add: false });
  const tempSprite = scene.add.sprite(0, 0, 'snakeSwordsman_sheet').setOrigin(0, 0).setCrop(0, 0, 16, 16);
  rt.draw(tempSprite, 0, 0);
  rt.saveTexture('snakeSwordsman');
  tempSprite.destroy();
}

function generateSnakeSword(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 30x7 snake sword — silver blade + green snake hilt

  // === BLADE (right half) — silver ===
  // Dark outline
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(12, 1, 18, 5);

  // Blade body (silver)
  gfx.fillStyle(0xbbbbbb);
  gfx.fillRect(13, 2, 15, 3);

  // Blade highlight
  gfx.fillStyle(0xdddddd);
  gfx.fillRect(15, 2, 11, 3);

  // Blade center line (bright)
  gfx.fillStyle(0xeeeeee);
  gfx.fillRect(16, 3, 10, 1);

  // Blade tip
  gfx.fillStyle(0xffffff);
  gfx.fillRect(27, 2, 2, 3);
  gfx.fillRect(29, 3, 1, 1);

  // === HILT (left half) — green snake ===
  // Snake body coiled around handle
  gfx.fillStyle(0x228822);
  gfx.fillRect(1, 2, 10, 3);

  // Snake scales (lighter green)
  gfx.fillStyle(0x33aa33);
  gfx.fillRect(2, 2, 2, 3);
  gfx.fillRect(5, 2, 2, 3);
  gfx.fillRect(8, 2, 2, 3);

  // Snake belly (lighter)
  gfx.fillStyle(0x66cc66);
  gfx.fillRect(2, 3, 8, 1);

  // Guard (snake coil between hilt and blade)
  gfx.fillStyle(0x1a6a1a);
  gfx.fillRect(11, 0, 2, 7);
  gfx.fillStyle(0x33aa33);
  gfx.fillRect(11, 1, 2, 5);

  // Snake head at pommel end (left)
  gfx.fillStyle(0x228822);
  gfx.fillRect(0, 1, 2, 5);
  // Snake eye (red)
  gfx.fillStyle(0xff2222);
  gfx.fillRect(0, 2, 1, 1);
  // Snake tongue (red, forked)
  gfx.fillStyle(0xff3333);
  gfx.fillRect(0, 4, 1, 1);

  // Darker outline on snake
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(0, 0, 12, 1);
  gfx.fillRect(0, 6, 12, 1);
  gfx.fillRect(0, 1, 1, 1);
  gfx.fillRect(0, 5, 1, 1);

  gfx.generateTexture('snakeSword', 30, 7);
  gfx.destroy();
}

function generatePoisonBolt(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 8x4 squiggly green poison projectile

  // Dark outline
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(0, 0, 8, 1);
  gfx.fillRect(0, 3, 8, 1);
  gfx.fillRect(0, 0, 1, 4);
  gfx.fillRect(7, 0, 1, 4);

  // Poison body (squiggly shape)
  gfx.fillStyle(0x33aa33);
  gfx.fillRect(1, 1, 6, 2);

  // Squiggle pattern (alternating lighter/darker)
  gfx.fillStyle(0x55cc55);
  gfx.fillRect(1, 1, 2, 1);
  gfx.fillRect(4, 2, 2, 1);
  gfx.fillRect(6, 1, 1, 1);

  // Bright drip at front
  gfx.fillStyle(0x88ff88);
  gfx.fillRect(6, 1, 1, 2);

  gfx.generateTexture('poisonBolt', 8, 4);
  gfx.destroy();
}

function generateDronePilot(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 4-frame spritesheet (64x16): floaty pilot with goggles and tech vest

  for (let frame = 0; frame < 4; frame++) {
    const ox = frame * 16;
    const legOffset = [0, -1, 0, 1][frame];

    // Dark outline
    gfx.fillStyle(0x1a1a1a);
    // Head outline
    gfx.fillRect(ox + 4, 1, 8, 7);
    // Body outline
    gfx.fillRect(ox + 3, 7, 10, 5);
    // Legs outline
    gfx.fillRect(ox + 4, 12, 3, 4);
    gfx.fillRect(ox + 9, 12, 3, 4);

    // Hair (silver-white, techy)
    gfx.fillStyle(0xccccdd);
    gfx.fillRect(ox + 5, 1, 6, 2);
    gfx.fillRect(ox + 4, 2, 1, 2);
    gfx.fillRect(ox + 11, 2, 1, 2);

    // Face (light skin)
    gfx.fillStyle(0xf0c8a0);
    gfx.fillRect(ox + 5, 3, 6, 4);

    // Goggles (red lenses)
    gfx.fillStyle(0x333344);
    gfx.fillRect(ox + 5, 4, 6, 2);
    gfx.fillStyle(0xdd3333);
    gfx.fillRect(ox + 5, 4, 2, 2);
    gfx.fillRect(ox + 9, 4, 2, 2);
    // Goggle shine
    gfx.fillStyle(0xff6666);
    gfx.fillRect(ox + 5, 4, 1, 1);
    gfx.fillRect(ox + 9, 4, 1, 1);

    // Mouth
    gfx.fillStyle(0xd4a07a);
    gfx.fillRect(ox + 7, 6, 2, 1);

    // Tech vest (dark blue-gray)
    gfx.fillStyle(0x3a4466);
    gfx.fillRect(ox + 4, 7, 8, 5);
    // Vest highlights (tech panel)
    gfx.fillStyle(0x5566aa);
    gfx.fillRect(ox + 5, 8, 2, 2);
    gfx.fillRect(ox + 9, 8, 2, 2);
    // Glowing indicator on chest
    gfx.fillStyle(0x44ffaa);
    gfx.fillRect(ox + 7, 8, 2, 1);
    gfx.fillStyle(0x33cc88);
    gfx.fillRect(ox + 7, 9, 2, 1);

    // Arms (slightly lighter vest color)
    gfx.fillStyle(0x4a5577);
    gfx.fillRect(ox + 3, 8, 1, 3);
    gfx.fillRect(ox + 12, 8, 1, 3);
    // Hands
    gfx.fillStyle(0xf0c8a0);
    gfx.fillRect(ox + 3, 11, 1, 1);
    gfx.fillRect(ox + 12, 11, 1, 1);

    // Legs (dark pants) with walk offset
    gfx.fillStyle(0x2a2a3a);
    gfx.fillRect(ox + 5, 12 + legOffset, 2, 3);
    gfx.fillRect(ox + 9, 12 - legOffset, 2, 3);

    // Boots (gray tech boots)
    gfx.fillStyle(0x555566);
    gfx.fillRect(ox + 4, 14 + legOffset, 3, 2);
    gfx.fillRect(ox + 9, 14 - legOffset, 3, 2);
  }

  gfx.generateTexture('dronePilot_sheet', 64, 16);
  gfx.destroy();

  scene.textures.get('dronePilot_sheet').add('__BASE', 0, 0, 0, 64, 16);

  const rt = scene.make.renderTexture({ width: 16, height: 16, add: false });
  const tempSprite = scene.add.sprite(0, 0, 'dronePilot_sheet').setOrigin(0, 0).setCrop(0, 0, 16, 16);
  rt.draw(tempSprite, 0, 0);
  rt.saveTexture('dronePilot');
  tempSprite.destroy();
}

function generateDrone(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 8x8 small floating drone with red eye

  // Dark outline
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(1, 0, 6, 1);
  gfx.fillRect(0, 1, 8, 1);
  gfx.fillRect(0, 6, 8, 1);
  gfx.fillRect(1, 7, 6, 1);

  // Body (dark metallic gray)
  gfx.fillStyle(0x444455);
  gfx.fillRect(1, 1, 6, 6);

  // Inner hull (lighter gray)
  gfx.fillStyle(0x666677);
  gfx.fillRect(2, 2, 4, 4);

  // Red eye/sensor
  gfx.fillStyle(0xdd3333);
  gfx.fillRect(3, 3, 2, 2);
  // Eye glow
  gfx.fillStyle(0xff5555);
  gfx.fillRect(3, 3, 1, 1);

  // Propeller hints (top and bottom edges)
  gfx.fillStyle(0x888899);
  gfx.fillRect(1, 1, 2, 1);
  gfx.fillRect(5, 1, 2, 1);
  gfx.fillRect(1, 6, 2, 1);
  gfx.fillRect(5, 6, 2, 1);

  gfx.generateTexture('drone', 8, 8);
  gfx.destroy();
}

function generateBossSlimeKing(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 16x16 large slime king — dark green with crown, menacing eyes

  // Dark outline
  gfx.fillStyle(0x1a3a1a);
  gfx.fillRect(3, 2, 10, 12);
  gfx.fillRect(2, 4, 12, 8);
  gfx.fillRect(1, 6, 14, 5);

  // Main body — dark green
  gfx.fillStyle(0x2d6b1e);
  gfx.fillRect(3, 4, 10, 9);
  gfx.fillRect(2, 5, 12, 7);
  gfx.fillRect(4, 3, 8, 1);

  // Lighter belly
  gfx.fillStyle(0x44882e);
  gfx.fillRect(4, 5, 8, 6);
  gfx.fillRect(3, 6, 10, 4);

  // Highlight / sheen
  gfx.fillStyle(0x66aa44);
  gfx.fillRect(4, 5, 3, 2);
  gfx.fillRect(5, 4, 2, 1);

  // Angry eyes — red
  gfx.fillStyle(0xff2222);
  gfx.fillRect(5, 7, 2, 2);
  gfx.fillRect(9, 7, 2, 2);

  // Eye pupils
  gfx.fillStyle(0x000000);
  gfx.fillRect(6, 8, 1, 1);
  gfx.fillRect(10, 8, 1, 1);

  // Angry brow
  gfx.fillStyle(0x1a3a1a);
  gfx.fillRect(4, 6, 3, 1);
  gfx.fillRect(9, 6, 3, 1);

  // Mouth
  gfx.fillStyle(0x114411);
  gfx.fillRect(6, 10, 4, 1);
  gfx.fillRect(5, 11, 6, 1);

  // Crown — gold
  gfx.fillStyle(0xffcc00);
  gfx.fillRect(4, 1, 8, 3);
  gfx.fillRect(5, 0, 1, 1);
  gfx.fillRect(7, 0, 2, 1);
  gfx.fillRect(10, 0, 1, 1);

  // Crown gems
  gfx.fillStyle(0xff2222);
  gfx.fillRect(6, 2, 1, 1);
  gfx.fillStyle(0x2244ff);
  gfx.fillRect(9, 2, 1, 1);

  // Drip details
  gfx.fillStyle(0x2d6b1e);
  gfx.fillRect(2, 12, 2, 2);
  gfx.fillRect(12, 12, 2, 2);
  gfx.fillRect(7, 13, 2, 1);

  gfx.generateTexture('bossSlimeKing', 16, 16);
  gfx.destroy();
}

function generateSand(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 16x16 sand tile with warm tones and dithered texture

  // Base warm sand
  gfx.fillStyle(0xd4a843);
  gfx.fillRect(0, 0, 16, 16);

  // Darker sand patches
  gfx.fillStyle(0xc49833);
  gfx.fillRect(1, 2, 3, 2);
  gfx.fillRect(9, 6, 3, 2);
  gfx.fillRect(5, 11, 3, 2);
  gfx.fillRect(12, 0, 2, 2);
  gfx.fillRect(0, 7, 2, 2);
  gfx.fillRect(7, 0, 2, 1);

  // Dithered transition
  gfx.fillStyle(0xc49833);
  gfx.fillRect(4, 2, 1, 1);
  gfx.fillRect(11, 7, 1, 1);
  gfx.fillRect(0, 4, 1, 1);
  gfx.fillRect(8, 11, 1, 1);
  gfx.fillRect(13, 3, 1, 1);
  gfx.fillRect(6, 8, 1, 1);

  // Lighter sun-bleached patches
  gfx.fillStyle(0xe4c060);
  gfx.fillRect(6, 1, 2, 1);
  gfx.fillRect(0, 8, 2, 1);
  gfx.fillRect(11, 12, 2, 1);
  gfx.fillRect(3, 6, 2, 1);
  gfx.fillRect(8, 3, 1, 1);

  // Bright highlights
  gfx.fillStyle(0xecd070);
  gfx.fillRect(2, 0, 1, 1);
  gfx.fillRect(10, 4, 1, 1);
  gfx.fillRect(5, 9, 1, 1);
  gfx.fillRect(13, 10, 1, 1);

  // Tiny pebbles/rocks
  gfx.fillStyle(0x9a8a6a);
  gfx.fillRect(0, 11, 1, 1);
  gfx.fillRect(13, 6, 1, 1);
  gfx.fillRect(7, 14, 1, 1);

  gfx.generateTexture('sand', 16, 16);
  gfx.destroy();
}

function generateCactus(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 16x24 saguaro cactus with arms, spines, and pink flower

  // === Dark outline ===
  gfx.fillStyle(0x1a1a1a);
  // Main trunk outline
  gfx.fillRect(6, 6, 1, 17);
  gfx.fillRect(10, 6, 1, 17);
  gfx.fillRect(6, 23, 5, 1);
  gfx.fillRect(7, 5, 3, 1);
  // Left arm outline
  gfx.fillRect(2, 10, 1, 6);
  gfx.fillRect(3, 9, 3, 1);
  gfx.fillRect(3, 16, 4, 1);
  gfx.fillRect(2, 15, 1, 1);
  // Right arm outline
  gfx.fillRect(14, 12, 1, 5);
  gfx.fillRect(11, 11, 3, 1);
  gfx.fillRect(11, 17, 3, 1);
  gfx.fillRect(14, 16, 1, 1);

  // === Main trunk ===
  gfx.fillStyle(0x2d8b2e);
  gfx.fillRect(7, 6, 3, 17);

  // Trunk highlight
  gfx.fillStyle(0x44aa44);
  gfx.fillRect(8, 7, 1, 14);

  // Trunk shadow
  gfx.fillStyle(0x1e6b1e);
  gfx.fillRect(7, 8, 1, 12);
  gfx.fillRect(9, 10, 1, 8);

  // === Left arm ===
  gfx.fillStyle(0x2d8b2e);
  gfx.fillRect(3, 10, 4, 6);

  gfx.fillStyle(0x44aa44);
  gfx.fillRect(4, 11, 1, 4);

  gfx.fillStyle(0x1e6b1e);
  gfx.fillRect(3, 12, 1, 3);

  // === Right arm ===
  gfx.fillStyle(0x2d8b2e);
  gfx.fillRect(11, 12, 3, 5);

  gfx.fillStyle(0x44aa44);
  gfx.fillRect(12, 13, 1, 3);

  gfx.fillStyle(0x1e6b1e);
  gfx.fillRect(13, 14, 1, 2);

  // === Spines (pale yellow dots along edges) ===
  gfx.fillStyle(0xddddaa);
  gfx.fillRect(6, 8, 1, 1);
  gfx.fillRect(6, 12, 1, 1);
  gfx.fillRect(6, 16, 1, 1);
  gfx.fillRect(6, 20, 1, 1);
  gfx.fillRect(10, 9, 1, 1);
  gfx.fillRect(10, 13, 1, 1);
  gfx.fillRect(10, 17, 1, 1);
  gfx.fillRect(10, 21, 1, 1);
  gfx.fillRect(2, 11, 1, 1);
  gfx.fillRect(2, 14, 1, 1);
  gfx.fillRect(14, 13, 1, 1);
  gfx.fillRect(14, 15, 1, 1);

  // === Pink flower on top ===
  gfx.fillStyle(0xff6688);
  gfx.fillRect(7, 4, 3, 1);
  gfx.fillRect(8, 3, 1, 1);
  gfx.fillStyle(0xffaacc);
  gfx.fillRect(8, 4, 1, 1);

  gfx.generateTexture('cactus', 16, 24);
  gfx.destroy();
}

function generateScorpion(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 16x16 scorpion with pincers and curved stinger tail

  // === Dark outline ===
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(5, 7, 6, 6);
  gfx.fillRect(4, 8, 8, 4);

  // === Body (amber/tan) ===
  gfx.fillStyle(0x8b6914);
  gfx.fillRect(6, 8, 4, 4);
  gfx.fillRect(5, 9, 6, 2);

  // Body highlight
  gfx.fillStyle(0xaa8828);
  gfx.fillRect(7, 8, 2, 3);

  // Body shadow
  gfx.fillStyle(0x6a5010);
  gfx.fillRect(5, 11, 6, 1);

  // === Pincers (front) ===
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(2, 6, 2, 3);
  gfx.fillRect(12, 6, 2, 3);

  gfx.fillStyle(0x8b6914);
  gfx.fillRect(2, 7, 2, 2);
  gfx.fillRect(12, 7, 2, 2);

  // Pincer tips
  gfx.fillStyle(0x6a5010);
  gfx.fillRect(1, 6, 1, 2);
  gfx.fillRect(3, 6, 1, 1);
  gfx.fillRect(14, 6, 1, 2);
  gfx.fillRect(12, 6, 1, 1);

  // === Legs (3 per side) ===
  gfx.fillStyle(0x6a5010);
  gfx.fillRect(4, 10, 1, 2);
  gfx.fillRect(3, 11, 1, 2);
  gfx.fillRect(5, 12, 1, 1);
  gfx.fillRect(11, 10, 1, 2);
  gfx.fillRect(12, 11, 1, 2);
  gfx.fillRect(10, 12, 1, 1);

  // === Tail (curving up and over) ===
  gfx.fillStyle(0x8b6914);
  gfx.fillRect(7, 12, 2, 2);
  gfx.fillRect(7, 13, 1, 2);
  gfx.fillRect(7, 14, 1, 1);
  gfx.fillRect(8, 13, 1, 1);

  // Tail segments going up
  gfx.fillStyle(0xaa8828);
  gfx.fillRect(8, 4, 1, 4);
  gfx.fillRect(7, 5, 1, 3);

  // Stinger tip (red)
  gfx.fillStyle(0xff4444);
  gfx.fillRect(8, 3, 1, 1);
  gfx.fillRect(9, 4, 1, 1);

  // === Eyes ===
  gfx.fillStyle(0x000000);
  gfx.fillRect(6, 8, 1, 1);
  gfx.fillRect(9, 8, 1, 1);

  gfx.generateTexture('scorpion', 16, 16);
  gfx.destroy();
}

function generateMummy(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 16x16 mummy with bandage wrappings and glowing eyes

  // === Dark outline ===
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(5, 0, 6, 1);
  gfx.fillRect(4, 1, 1, 5);
  gfx.fillRect(11, 1, 1, 5);
  gfx.fillRect(3, 6, 1, 8);
  gfx.fillRect(12, 6, 1, 8);
  gfx.fillRect(4, 14, 3, 2);
  gfx.fillRect(9, 14, 3, 2);

  // === Head bandages ===
  gfx.fillStyle(0xccbb88);
  gfx.fillRect(5, 1, 6, 5);

  // Head darker wrapping lines
  gfx.fillStyle(0x998866);
  gfx.fillRect(5, 2, 6, 1);
  gfx.fillRect(5, 4, 6, 1);

  // Head highlight
  gfx.fillStyle(0xddccaa);
  gfx.fillRect(6, 1, 4, 1);
  gfx.fillRect(6, 3, 3, 1);

  // === Glowing green eyes ===
  gfx.fillStyle(0x44ff44);
  gfx.fillRect(6, 3, 1, 1);
  gfx.fillRect(9, 3, 1, 1);

  // Dark gaps showing underneath
  gfx.fillStyle(0x332211);
  gfx.fillRect(7, 3, 2, 1);

  // === Body bandages ===
  gfx.fillStyle(0xccbb88);
  gfx.fillRect(4, 6, 8, 8);

  // Body wrapping lines (horizontal bands)
  gfx.fillStyle(0x998866);
  gfx.fillRect(4, 7, 8, 1);
  gfx.fillRect(4, 9, 8, 1);
  gfx.fillRect(4, 11, 8, 1);
  gfx.fillRect(4, 13, 8, 1);

  // Body highlight strips
  gfx.fillStyle(0xddccaa);
  gfx.fillRect(5, 6, 6, 1);
  gfx.fillRect(5, 8, 5, 1);
  gfx.fillRect(5, 10, 4, 1);
  gfx.fillRect(6, 12, 3, 1);

  // Dark gaps (loose wrapping)
  gfx.fillStyle(0x332211);
  gfx.fillRect(11, 8, 1, 2);
  gfx.fillRect(4, 12, 1, 2);

  // === Arms (outstretched) ===
  gfx.fillStyle(0xccbb88);
  gfx.fillRect(2, 7, 2, 2);
  gfx.fillRect(12, 7, 2, 2);
  gfx.fillStyle(0x998866);
  gfx.fillRect(2, 8, 2, 1);
  gfx.fillRect(12, 8, 2, 1);

  // Dangling bandage strips
  gfx.fillStyle(0xbbaa77);
  gfx.fillRect(1, 8, 1, 3);
  gfx.fillRect(14, 8, 1, 3);

  // === Feet ===
  gfx.fillStyle(0x998866);
  gfx.fillRect(4, 14, 3, 2);
  gfx.fillRect(9, 14, 3, 2);

  gfx.generateTexture('mummy', 16, 16);
  gfx.destroy();
}

function generateSandGolem(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 16x16 sand golem — bulky rocky creature

  // === Dark outline ===
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(3, 1, 10, 1);
  gfx.fillRect(2, 2, 1, 12);
  gfx.fillRect(13, 2, 1, 12);
  gfx.fillRect(3, 14, 4, 2);
  gfx.fillRect(9, 14, 4, 2);
  gfx.fillRect(1, 4, 1, 6);
  gfx.fillRect(14, 5, 1, 5);

  // === Main body (sand colored) ===
  gfx.fillStyle(0xc49833);
  gfx.fillRect(3, 2, 10, 12);

  // Lighter sand highlights
  gfx.fillStyle(0xe4c060);
  gfx.fillRect(4, 3, 4, 3);
  gfx.fillRect(5, 2, 3, 1);
  gfx.fillRect(9, 4, 3, 2);

  // Darker rocky cracks
  gfx.fillStyle(0x8a7020);
  gfx.fillRect(5, 6, 1, 3);
  gfx.fillRect(7, 8, 2, 1);
  gfx.fillRect(10, 5, 1, 4);
  gfx.fillRect(4, 10, 3, 1);
  gfx.fillRect(8, 11, 2, 1);
  gfx.fillRect(11, 9, 1, 3);
  gfx.fillRect(3, 7, 1, 2);

  // Deep shadow cracks
  gfx.fillStyle(0x6a5518);
  gfx.fillRect(6, 7, 1, 1);
  gfx.fillRect(9, 9, 1, 1);
  gfx.fillRect(4, 12, 1, 1);

  // === Broad shoulders / arms ===
  gfx.fillStyle(0xc49833);
  gfx.fillRect(1, 5, 2, 5);
  gfx.fillRect(13, 6, 2, 4);

  gfx.fillStyle(0xe4c060);
  gfx.fillRect(1, 6, 1, 2);
  gfx.fillRect(14, 7, 1, 2);

  gfx.fillStyle(0x8a7020);
  gfx.fillRect(1, 8, 1, 1);
  gfx.fillRect(14, 8, 1, 1);

  // === Glowing red eyes ===
  gfx.fillStyle(0xff2222);
  gfx.fillRect(5, 4, 2, 2);
  gfx.fillRect(9, 4, 2, 2);

  // Eye pupils
  gfx.fillStyle(0x000000);
  gfx.fillRect(6, 5, 1, 1);
  gfx.fillRect(10, 5, 1, 1);

  // Angry brow
  gfx.fillStyle(0x6a5518);
  gfx.fillRect(4, 3, 3, 1);
  gfx.fillRect(9, 3, 3, 1);

  // === Mouth ===
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(6, 8, 4, 1);

  // === Feet ===
  gfx.fillStyle(0xb08828);
  gfx.fillRect(3, 14, 4, 2);
  gfx.fillRect(9, 14, 4, 2);

  gfx.generateTexture('sandGolem', 16, 16);
  gfx.destroy();
}

function generateBossMummyKing(scene) {
  const gfx = scene.make.graphics({ add: false });
  // 16x16 pharaoh mummy boss — elaborate headdress, gold trim, red eyes

  // === Dark outline ===
  gfx.fillStyle(0x1a1a1a);
  gfx.fillRect(3, 0, 10, 1);
  gfx.fillRect(2, 1, 1, 5);
  gfx.fillRect(13, 1, 1, 5);
  gfx.fillRect(3, 6, 1, 8);
  gfx.fillRect(12, 6, 1, 8);
  gfx.fillRect(4, 14, 3, 2);
  gfx.fillRect(9, 14, 3, 2);

  // === Pharaoh headdress (gold) ===
  gfx.fillStyle(0xffcc00);
  gfx.fillRect(3, 0, 10, 3);
  gfx.fillRect(2, 1, 12, 2);

  // Headdress stripes
  gfx.fillStyle(0x2244cc);
  gfx.fillRect(4, 1, 2, 1);
  gfx.fillRect(8, 1, 2, 1);
  gfx.fillRect(12, 1, 1, 1);

  // Headdress highlight
  gfx.fillStyle(0xffdd44);
  gfx.fillRect(5, 0, 6, 1);

  // Crown point / cobra ornament
  gfx.fillStyle(0xff2222);
  gfx.fillRect(7, 0, 2, 1);

  // Headdress side flaps
  gfx.fillStyle(0xffcc00);
  gfx.fillRect(2, 3, 2, 3);
  gfx.fillRect(12, 3, 2, 3);
  gfx.fillStyle(0x2244cc);
  gfx.fillRect(2, 4, 2, 1);
  gfx.fillRect(12, 4, 2, 1);

  // === Face bandages ===
  gfx.fillStyle(0xccbb88);
  gfx.fillRect(4, 3, 8, 3);

  gfx.fillStyle(0x998866);
  gfx.fillRect(4, 4, 8, 1);

  // === Glowing red eyes ===
  gfx.fillStyle(0xff2222);
  gfx.fillRect(5, 3, 2, 1);
  gfx.fillRect(9, 3, 2, 1);

  // Eye glow
  gfx.fillStyle(0xff6644);
  gfx.fillRect(6, 3, 1, 1);
  gfx.fillRect(10, 3, 1, 1);

  // === Body with gold-trimmed bandages ===
  gfx.fillStyle(0xccbb88);
  gfx.fillRect(4, 6, 8, 8);

  // Gold trim on body
  gfx.fillStyle(0xffcc00);
  gfx.fillRect(4, 6, 8, 1);
  gfx.fillRect(4, 10, 8, 1);

  // Wrapping lines
  gfx.fillStyle(0x998866);
  gfx.fillRect(4, 8, 8, 1);
  gfx.fillRect(4, 12, 8, 1);

  // Body highlights
  gfx.fillStyle(0xddccaa);
  gfx.fillRect(5, 7, 6, 1);
  gfx.fillRect(5, 9, 5, 1);
  gfx.fillRect(5, 11, 4, 1);

  // Blue gem on chest
  gfx.fillStyle(0x44aaff);
  gfx.fillRect(7, 7, 2, 2);

  // Dark gaps
  gfx.fillStyle(0x332211);
  gfx.fillRect(11, 8, 1, 2);
  gfx.fillRect(4, 11, 1, 2);

  // === Arms ===
  gfx.fillStyle(0xccbb88);
  gfx.fillRect(2, 7, 2, 3);
  gfx.fillRect(12, 7, 2, 3);
  gfx.fillStyle(0xffcc00);
  gfx.fillRect(2, 7, 2, 1);
  gfx.fillRect(12, 7, 2, 1);

  // === Feet ===
  gfx.fillStyle(0x998866);
  gfx.fillRect(4, 14, 3, 2);
  gfx.fillRect(9, 14, 3, 2);

  gfx.generateTexture('bossMummyKing', 16, 16);
  gfx.destroy();
}
