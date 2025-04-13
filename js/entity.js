// js/Entity.js

export const TYPES = {
    ROCK: 0,
    PAPER: 1,
    SCISSORS: 2
  };
  
  export const EMOJIS = ['🪨', '📄', '✂️'];
  export const TYPE_NAMES = ['Rock', 'Paper', 'Scissors'];
  
  export class Entity {
    constructor(type, x, y) {
      this.type = type;
      this.x = x;
      this.y = y;
      this.vx = Math.random() * 2 - 1;
      this.vy = Math.random() * 2 - 1;
      this.hitRadius = 12;
      this.targetEntity = null;
      this.targetTime = 0;
      this.debug = false;
    }
  
    draw(ctx, settings) {
      const size = parseInt(settings.entitySize.value);
      ctx.font = `${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(EMOJIS[this.type], this.x, this.y);
      if (this.debug) {
        this.drawDebug(ctx);
      }
      
    }

    drawDebug(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.hitRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.stroke();
        if (this.targetEntity) {
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.targetEntity.x, this.targetEntity.y);
          ctx.strokeStyle = 'rgba(0,0,0,0.1)';
          ctx.stroke();
        }
    }
  
    update(entities, timestamp, canvasDimensions, settings) {
      const speedFactor = parseFloat(settings.speedFactor.value);
      const attractionFactor = parseFloat(settings.attractionFactor.value) * 0.02;
      const avoidanceFactor = parseFloat(settings.avoidanceFactor.value) * 0.01;
      const globalAwareness = parseFloat(settings.globalAwareness.value);
      const width = canvasDimensions.width;
      const height = canvasDimensions.height;
  
      // Determine target and avoidance types
      let targetType, avoidType;
      switch (this.type) {
        case TYPES.ROCK:
          targetType = TYPES.SCISSORS;
          avoidType = TYPES.PAPER;
          break;
        case TYPES.PAPER:
          targetType = TYPES.ROCK;
          avoidType = TYPES.SCISSORS;
          break;
        case TYPES.SCISSORS:
          targetType = TYPES.PAPER;
          avoidType = TYPES.ROCK;
          break;
      }
  
      // Re-evaluate target every 2000 ms or when current target is invalid.
      if (timestamp - this.targetTime > 2000 ||
          !this.targetEntity ||
          this.targetEntity.type !== targetType) {
        const possibleTargets = entities.filter(e => e !== this && e.type === targetType);
        if (possibleTargets.length > 0) {
          possibleTargets.sort((a, b) => {
            const distA = Math.hypot(a.x - this.x, a.y - this.y);
            const distB = Math.hypot(b.x - this.x, b.y - this.y);
            return distA - distB;
          });
          const targetIndex = Math.floor(Math.random() * possibleTargets.length * (1 - globalAwareness));
          this.targetEntity = possibleTargets[targetIndex];
          this.targetTime = timestamp;
        } else {
          this.targetEntity = null;
        }
      }
  
      let forceX = 0, forceY = 0;
  
      // Compute forces from local interactions (avoidance/collisions)
      for (const other of entities) {
        if (other === this) continue;
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.hypot(dx, dy);
  
        // Collision/conversion detection
        if (distance < this.hitRadius + other.hitRadius) {
          if ((this.type === TYPES.ROCK && other.type === TYPES.SCISSORS) ||
              (this.type === TYPES.PAPER && other.type === TYPES.ROCK) ||
              (this.type === TYPES.SCISSORS && other.type === TYPES.PAPER)) {
            other.type = this.type;
            other.targetEntity = null;
            other.targetTime = 0;
          }
          continue;
        }
  
        // Apply avoidance force for predator type
        if (other.type === avoidType) {
          const avoidStrength = avoidanceFactor / Math.max(0.1, distance * 0.1);
          forceX -= (dx / distance) * avoidStrength;
          forceY -= (dy / distance) * avoidStrength;
        }
      }
  
      // Check movement mode from settings
      if (settings.movementMode.value === "randomBias") {
        // New random-based movement: add a bigger random factor,
        // but with a slight bias if a target exists.
        forceX = (Math.random() - 0.5) * 0.2;
        forceY = (Math.random() - 0.5) * 0.2;
        if (this.targetEntity) {
          const dx = this.targetEntity.x - this.x;
          const dy = this.targetEntity.y - this.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 0) {
            const biasFactor = 0.05; // slight enemy attraction
            forceX += (dx / distance) * biasFactor;
            forceY += (dy / distance) * biasFactor;
          }
        }
      } else {
        // Default behavior:
        if (this.targetEntity) {
          const dx = this.targetEntity.x - this.x;
          const dy = this.targetEntity.y - this.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 0) {
            const attractStrength = attractionFactor * (1 + globalAwareness * 5);
            forceX += (dx / distance) * attractStrength;
            forceY += (dy / distance) * attractStrength;
          }
        } else {
          // Wandering when no target.
          forceX += (Math.random() - 0.5) * 0.05;
          forceY += (Math.random() - 0.5) * 0.05;
        }
      }
  
      // Update velocity with computed forces.
      this.vx += forceX;
      this.vy += forceY;
      const speed = Math.hypot(this.vx, this.vy);
      if (speed > 2) {
        this.vx = (this.vx / speed) * 2;
        this.vy = (this.vy / speed) * 2;
      }
      // Small jitter to break stalemates.
      this.vx += (Math.random() - 0.5) * 0.01;
      this.vy += (Math.random() - 0.5) * 0.01;
  
      // Update position and check canvas boundaries.
      this.x += this.vx * speedFactor;
      this.y += this.vy * speedFactor;
      if (this.x < this.hitRadius) {
        this.x = this.hitRadius;
        this.vx *= -0.8;
      }
      if (this.x > width - this.hitRadius) {
        this.x = width - this.hitRadius;
        this.vx *= -0.8;
      }
      if (this.y < this.hitRadius) {
        this.y = this.hitRadius;
        this.vy *= -0.8;
      }
      if (this.y > height - this.hitRadius) {
        this.y = height - this.hitRadius;
        this.vy *= -0.8;
      }
    }
  }
  