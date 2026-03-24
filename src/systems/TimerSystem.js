import { GAME_DURATION } from '../config/GameConfig.js';

export class TimerSystem {
  constructor(scene) {
    this.scene = scene;
    this.remainingSeconds = GAME_DURATION;
    this.elapsed = 0;
    this.running = true;
  }

  get elapsedSeconds() {
    return GAME_DURATION - this.remainingSeconds;
  }

  get elapsedMinutes() {
    return this.elapsedSeconds / 60;
  }

  get timeString() {
    const mins = Math.floor(this.remainingSeconds / 60);
    const secs = Math.floor(this.remainingSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  update(delta) {
    if (!this.running) return;

    this.remainingSeconds -= delta / 1000;

    if (this.remainingSeconds <= 0) {
      this.remainingSeconds = 0;
      this.running = false;
      this.scene.events.emit('victory');
    }
  }

  pause() {
    this.running = false;
  }

  resume() {
    this.running = true;
  }
}
