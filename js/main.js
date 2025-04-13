
import Simulation from "./simulation.js";

const settings = {
  rockCount: document.getElementById("rockCount"),
  paperCount: document.getElementById("paperCount"),
  scissorsCount: document.getElementById("scissorsCount"),
  speedFactor: document.getElementById("speedFactor"),
  attractionFactor: document.getElementById("attractionFactor"),
  avoidanceFactor: document.getElementById("avoidanceFactor"),
  globalAwareness: document.getElementById("globalAwareness"),
  entitySize: document.getElementById("entitySize"),
  spawnMode: document.getElementById("spawnMode"),
  movementMode: document.getElementById("movementMode"),
  debugMode: document.getElementById("debugMode"),
  
  rockStat: document.getElementById("rockStat"),
  paperStat: document.getElementById("paperStat"),
  scissorsStat: document.getElementById("scissorsStat"),
  statusStat: document.getElementById("statusStat"),
  
  canvas: document.getElementById("simulationCanvas"),
  winnerOverlay: document.getElementById("winnerOverlay"),
  winnerEmoji: document.getElementById("winnerEmoji"),
  winnerText: document.getElementById("winnerText")
};

const simulation = new Simulation(settings);

window.addEventListener("load", () => {
  simulation.initialize();
});

document.getElementById("startBtn").addEventListener("click", () => {
  if (simulation.entities.length === 0) {
    simulation.initialize();
  }
  simulation.start();
});
document.getElementById("pauseBtn").addEventListener("click", () => {
  simulation.pause();
});
document.getElementById("resetBtn").addEventListener("click", () => {
  simulation.reset();
});

settings.debugMode.addEventListener("change", () => {
  simulation.updateDebugMode();
});
