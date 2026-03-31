export class TimerSystem {
  constructor(scene, duration) {
    this.scene = scene;
    this.duration = duration;
    this.elapsed = 0;
    this.running = true;
    this.bossTriggered = false;
  }

  get elapsedSeconds() {
    return this.elapsed;
  }

  get elapsedMinutes() {
    return this.elapsed / 60;
  }

  get timeString() {
    const mins = Math.floor(this.elapsed / 60);
    const secs = Math.floor(this.elapsed % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  update(delta) {
    if (!this.running) return;

    this.elapsed += delta / 1000;

    // Trigger boss spawn when duration is reached
    if (!this.bossTriggered && this.elapsed >= this.duration) {
      this.bossTriggered = true;
      this.scene.events.emit('bossTime');
    }
  }

  pause() {
    this.running = false;
  }

  resume() {
    this.running = true;
  }
}
