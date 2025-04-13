import Simulation from "./simulation.js";

const settings = {
  rockCount: document.getElementById("rockCount"),
  paperCount: document.getElementById("paperCount"),
  scissorsCount: document.getElementById("scissorsCount"),
  speedFactor: document.getElementById("speedFactor"),
  attractionFactor: document.getElementById("attractionFactor"),
  avoidanceFactor: document.getElementById("avoidanceFactor"),
  globalAwareness: document.getElementById("globalAwareness"),
  tickTimer: document.getElementById("tickTimer"),
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
  if (simulation.winner !== null || simulation.needsReset) {
    simulation.reset();
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

const settingsToMonitor = [
  "rockCount", "paperCount", "scissorsCount", 
  "spawnMode", "movementMode"
];

settingsToMonitor.forEach(settingId => {
  settings[settingId].addEventListener("change", () => {
    // Mark simulation as needing reinitialization
    simulation.needsReset = true;
  });
});

settings.tickTimer.addEventListener("input", () => {
  if (simulation.isRunning) {
    simulation.pause();
    simulation.start();
  }
});

["rockCount", "paperCount", "scissorsCount"].forEach(settingId => {
  settings[settingId].addEventListener("input", () => {
    simulation.needsReset = true;
  });
});

settings.debugMode.addEventListener("change", () => {
  simulation.updateDebugMode();
});
