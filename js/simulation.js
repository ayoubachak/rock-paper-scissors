import { Entity, TYPES } from "./entity.js";

export default class Simulation {
  constructor(settings) {
    this.settings = settings; // Contains DOM elements and other settings
    this.canvas = settings.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.canvasDimensions = { width: this.canvas.width, height: this.canvas.height };

    this.entities = [];
    this.isRunning = false;
    this.animationFrameId = null;
    this.winner = null;
    this.lastTime = 0;
  }

  // Helper function to check non-overlap
  isOverlapping(x, y, newEntityRadius, entities, minDistance) {
    for (const e of entities) {
      const dx = e.x - x;
      const dy = e.y - y;
      if (Math.hypot(dx, dy) < minDistance) return true;
    }
    return false;
  }

  initialize() {
    this.entities = [];
    this.winner = null;
    this.settings.winnerOverlay.classList.remove("show");

    const rockCount = parseInt(this.settings.rockCount.value) || 0;
    const paperCount = parseInt(this.settings.paperCount.value) || 0;
    const scissorsCount = parseInt(this.settings.scissorsCount.value) || 0;
    
    const spawnMode = this.settings.spawnMode.value; // "corners" or "random"

    const canvasW = this.canvasDimensions.width;
    const canvasH = this.canvasDimensions.height;

    // For random mode, we want to avoid overlapping entities.
    // We assume each entity has a hitRadius of 12. Use a buffer of around 30 pixels.
    const minDistance = 30;

    if (spawnMode === "corners") {
      // Position rocks in the top-left corner
      for (let i = 0; i < rockCount; i++) {
        this.entities.push(new Entity(
          TYPES.ROCK,
          Math.random() * canvasW * 0.25,
          Math.random() * canvasH * 0.25
        ));
      }
      // Position papers in the top-right corner
      for (let i = 0; i < paperCount; i++) {
        this.entities.push(new Entity(
          TYPES.PAPER,
          canvasW * 0.75 + Math.random() * canvasW * 0.25,
          Math.random() * canvasH * 0.25
        ));
      }
      // Position scissors in the bottom-left corner
      for (let i = 0; i < scissorsCount; i++) {
        this.entities.push(new Entity(
          TYPES.SCISSORS,
          Math.random() * canvasW * 0.25,
          canvasH * 0.75 + Math.random() * canvasH * 0.25
        ));
      }
    } else if (spawnMode === "random") {
      // For each type, spawn them randomly in the canvas without overlapping.
      const spawnEntity = (type, count) => {
        for (let i = 0; i < count; i++) {
          let placed = false;
          let attempts = 0;
          while (!placed && attempts < 100) {
            // Generate a random x,y ensuring the entity stays within the canvas boundaries.
            const x = 12 + Math.random() * (canvasW - 24); // 12 is the hitRadius; adjust margins accordingly
            const y = 12 + Math.random() * (canvasH - 24);

            // Check overlap with previously placed entities
            if (!this.isOverlapping(x, y, 12, this.entities, minDistance)) {
              this.entities.push(new Entity(type, x, y));
              placed = true;
            }
            attempts++;
          }
          if (!placed) {
            // In case a valid position wasn't found after many attempts, simply place it.
            this.entities.push(new Entity(type, Math.random() * canvasW, Math.random() * canvasH));
          }
        }
      };

      spawnEntity(TYPES.ROCK, rockCount);
      spawnEntity(TYPES.PAPER, paperCount);
      spawnEntity(TYPES.SCISSORS, scissorsCount);
    }

    this.updateStats();
  }

  animate(timestamp) {
    if (!this.isRunning) return;
    
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.ctx.clearRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
    
    for (const entity of this.entities) {
      entity.update(this.entities, timestamp, this.canvasDimensions, this.settings);
      entity.draw(this.ctx, this.settings);
    }
    
    this.updateStats();
    this.checkWinner();
    
    this.animationFrameId = requestAnimationFrame((t) => this.animate(t));
  }

  updateStats() {
    const rockCount = this.entities.filter(e => e.type === TYPES.ROCK).length;
    const paperCount = this.entities.filter(e => e.type === TYPES.PAPER).length;
    const scissorsCount = this.entities.filter(e => e.type === TYPES.SCISSORS).length;
    
    this.settings.rockStat.textContent = rockCount;
    this.settings.paperStat.textContent = paperCount;
    this.settings.scissorsStat.textContent = scissorsCount;
    
    let status = "Running";
    if (this.winner !== null) {
      switch (this.winner) {
        case TYPES.ROCK: status = "🪨 Rocks Win!"; break;
        case TYPES.PAPER: status = "📄 Papers Win!"; break;
        case TYPES.SCISSORS: status = "✂️ Scissors Win!"; break;
      }
    } else if (!this.isRunning) {
      status = "Paused";
    }
    this.settings.statusStat.textContent = status;
  }

  checkWinner() {
    const rockCount = this.entities.filter(e => e.type === TYPES.ROCK).length;
    const paperCount = this.entities.filter(e => e.type === TYPES.PAPER).length;
    const scissorsCount = this.entities.filter(e => e.type === TYPES.SCISSORS).length;
    
    if (this.entities.length > 0 &&
      (rockCount === this.entities.length || paperCount === this.entities.length || scissorsCount === this.entities.length)) {
      if (rockCount === this.entities.length) {
        this.winner = TYPES.ROCK;
      } else if (paperCount === this.entities.length) {
        this.winner = TYPES.PAPER;
      } else if (scissorsCount === this.entities.length) {
        this.winner = TYPES.SCISSORS;
      }
    
      this.settings.winnerEmoji.textContent = ["🪨", "📄", "✂️"][this.winner];
      this.settings.winnerText.textContent = ["Rock", "Paper", "Scissors"][this.winner] + " Wins!";
      this.settings.winnerOverlay.classList.add("show");
      this.pause();
    }
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.animate(this.lastTime);
    }
  }

  pause() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.updateStats();
  }

  reset() {
    this.pause();
    this.initialize();
    this.settings.statusStat.textContent = "Ready";
  }
}
