export function generateSprites(scene) {
  generatePlayer(scene);
  generateSlime(scene);
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
