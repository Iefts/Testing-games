export function generateSounds(scene) {
  const audioCtx = scene.sound.context;

  createSound(scene, audioCtx, 'sfx_shoot', (ctx, buf) => {
    // Short snap/pop for revolver
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * 60);
      data[i] = env * (Math.random() * 2 - 1) * 0.4;
      data[i] += env * Math.sin(t * 800) * 0.3;
    }
  }, 0.1);

  createSound(scene, audioCtx, 'sfx_hit', (ctx, buf) => {
    // Soft thud
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * 40);
      data[i] = env * Math.sin(t * 200 * (1 - t * 5)) * 0.3;
      data[i] += env * (Math.random() * 2 - 1) * 0.1;
    }
  }, 0.08);

  createSound(scene, audioCtx, 'sfx_enemyDeath', (ctx, buf) => {
    // Squelch
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * 20);
      const freq = 300 - t * 1500;
      data[i] = env * Math.sin(t * freq) * 0.3;
      data[i] += env * (Math.random() * 2 - 1) * 0.2;
    }
  }, 0.15);

  createSound(scene, audioCtx, 'sfx_playerHit', (ctx, buf) => {
    // Crunch/impact
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * 25);
      data[i] = env * (Math.random() * 2 - 1) * 0.5;
      data[i] += env * Math.sin(t * 150) * 0.3;
    }
  }, 0.15);

  createSound(scene, audioCtx, 'sfx_xpPickup', (ctx, buf) => {
    // Bright chime
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * 15);
      data[i] = env * Math.sin(t * 1200) * 0.15;
      data[i] += env * Math.sin(t * 1800) * 0.1;
    }
  }, 0.12);

  createSound(scene, audioCtx, 'sfx_levelUp', (ctx, buf) => {
    // Ascending tone
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * 4);
      const freq = 400 + t * 600;
      data[i] = env * Math.sin(t * freq * Math.PI * 2) * 0.25;
      data[i] += env * Math.sin(t * freq * 1.5 * Math.PI * 2) * 0.12;
    }
  }, 0.5);

  createSound(scene, audioCtx, 'sfx_upgradeSelect', (ctx, buf) => {
    // Confirmation ding
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * 8);
      data[i] = env * Math.sin(t * 880 * Math.PI * 2) * 0.2;
      data[i] += env * Math.sin(t * 1320 * Math.PI * 2) * 0.1;
    }
  }, 0.3);

  createSound(scene, audioCtx, 'sfx_dartFire', (ctx, buf) => {
    // Whoosh
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * 20);
      data[i] = env * (Math.random() * 2 - 1) * 0.2;
      data[i] *= Math.sin(t * 30); // modulate for whoosh effect
    }
  }, 0.12);

  createSound(scene, audioCtx, 'sfx_unicornCharge', (ctx, buf) => {
    // Galloping swoosh
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.min(t * 8, 1) * Math.exp(-t * 3);
      const gallop = Math.sin(t * 12) * 0.5 + 0.5; // rhythmic gallop
      data[i] = env * gallop * (Math.random() * 2 - 1) * 0.3;
      data[i] += env * Math.sin(t * 200) * 0.15;
    }
  }, 0.4);

  createSound(scene, audioCtx, 'sfx_auraPulse', (ctx, buf) => {
    // Low hum
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * 15);
      data[i] = env * Math.sin(t * 120 * Math.PI * 2) * 0.1;
    }
  }, 0.1);

  createSound(scene, audioCtx, 'sfx_buttonClick', (ctx, buf) => {
    // UI click
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * 80);
      data[i] = env * Math.sin(t * 1000 * Math.PI * 2) * 0.2;
    }
  }, 0.05);

  createSound(scene, audioCtx, 'sfx_victory', (ctx, buf) => {
    // Triumphant ascending fanfare
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * 2);
      const note = t < 0.2 ? 523 : t < 0.4 ? 659 : t < 0.6 ? 784 : 1047;
      data[i] = env * Math.sin(t * note * Math.PI * 2) * 0.2;
      data[i] += env * Math.sin(t * note * 2 * Math.PI * 2) * 0.08;
    }
  }, 0.8);

  createSound(scene, audioCtx, 'sfx_gameOver', (ctx, buf) => {
    // Descending sad tone
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * 2);
      const freq = 400 - t * 200;
      data[i] = env * Math.sin(t * freq * Math.PI * 2) * 0.25;
      data[i] += env * Math.sin(t * freq * 0.5 * Math.PI * 2) * 0.15;
    }
  }, 0.8);
}

function createSound(scene, audioCtx, key, fillFn, duration) {
  const sampleRate = audioCtx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, length, sampleRate);

  fillFn(audioCtx, buffer);

  scene.cache.audio.add(key, { data: buffer, sampleRate });
  scene.sound.decodeAudio(key, buffer);
}
