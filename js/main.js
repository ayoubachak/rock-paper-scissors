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
  // Check if a winner was declared or settings were changed
  if (simulation.winner !== null || simulation.needsReset) {
    simulation.reset();
  }
  
  simulation.start();
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  simulation.pause();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  simulation.reset();
});

// Monitor for changes in entity counts and spawn/movement settings
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

// Monitor changes to numeric inputs with input event (captures typing)
["rockCount", "paperCount", "scissorsCount"].forEach(settingId => {
  settings[settingId].addEventListener("input", () => {
    simulation.needsReset = true;
  });
});

settings.debugMode.addEventListener("change", () => {
  simulation.updateDebugMode();
});
