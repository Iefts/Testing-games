# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

2D roguelike survival game (Vampire Survivors-style) built with Phaser 3. Browser-based, works on desktop and mobile.

## Tech Stack

- **Phaser 3** — game framework (arcade physics, 480x270 base resolution, pixelArt mode)
- **Vite** — bundler and dev server
- **JavaScript** (ES modules)

## Commands

- `npm run dev` — start dev server with hot reload
- `npm run build` — production build to `dist/`
- `npm run preview` — preview production build

## Architecture

- `src/main.js` — Phaser game config, scene registration
- `src/config/` — data-driven definitions (Characters, Enemies, Upgrades, Levels, GameConfig). Add new content here.
- `src/scenes/` — Phaser scenes: Boot → Menu → CharacterSelect → LevelSelect → Game → GameOver. LevelUpScene is an overlay.
- `src/entities/` — Player and Enemy classes (extend Phaser.Physics.Arcade.Sprite)
- `src/weapons/` — Weapon base class + Revolver, DamageAura, UnicornRider, PiercingDart
- `src/systems/` — InputManager, SpawnSystem, XPSystem, TimerSystem, UpgradeManager
- `src/ui/` — HUD, VirtualJoystick (mobile), UpgradeCard
- `src/utils/SpriteGenerator.js` — runtime pixel art generation (all sprites created here, no external image files)

## Key Patterns

- **Data-driven content**: new characters, enemies, levels, and upgrades are added by editing config files in `src/config/` and creating corresponding classes.
- **Object pooling**: enemies and bullets use Phaser Groups with maxSize for performance.
- **Scene overlays**: LevelUpScene launches on top of GameScene (pauses physics, doesn't destroy GameScene).
- **Unified input**: InputManager handles keyboard, mouse, and touch joystick with priority ordering.

## Repository

- **GitHub:** https://github.com/Iefts/Testing-games
- **Branch:** main

## Workflow

- **Commit early and often.** After every meaningful piece of work (new feature, bug fix, refactor, config change), create a commit with a clean, descriptive message and push to GitHub. Never leave work uncommitted — we must always be able to revert to any prior state.
- Commit messages should clearly describe *what* changed and *why*.
- Use the `.gitignore` already in place to avoid committing OS files, editor config, env secrets, or build artifacts.
