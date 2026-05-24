(() => {
const { STORAGE_KEY, enemyWizards, magicSchools, spells, startingPlayer } = window.WizardData;
const CURRENT_SAVE_VERSION = 2;

function createInitialState() {
  const player = structuredClone(startingPlayer);
  const enemyIndex = 0;

  return {
    saveVersion: CURRENT_SAVE_VERSION,
    mode: "hub",
    hubActivity: "main",
    player,
    enemyIndex,
    enemy: createEnemy(enemyIndex),
    enemyNextAttackPenalty: 0,
    battleOver: false,
    log: [
      "You arrive at the hub. Choose an activity."
    ]
  };
}

function createEnemy(index) {
  const template = enemyWizards[index % enemyWizards.length];

  return {
    ...structuredClone(template),
    currentHealth: template.maxHealth
  };
}

function getNextEnemyIndex(currentIndex) {
  return (currentIndex + 1) % enemyWizards.length;
}

function saveState(state) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      saveVersion: CURRENT_SAVE_VERSION
    })
  );
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return null;
  }

  try {
    return normalizeState(JSON.parse(saved));
  } catch {
    return null;
  }
}

function normalizeState(savedState) {
  const fallback = createInitialState();
  const sourceSaveVersion = Number.isInteger(savedState.saveVersion)
    ? savedState.saveVersion
    : 1;
  const migratedState = migrateSaveState(savedState, sourceSaveVersion);
  const player = {
    ...fallback.player,
    ...migratedState.player,
    inventory: normalizeInventory(migratedState.player?.inventory),
    schools: normalizeSchools(migratedState.player?.schools),
    spellMastery: normalizeSpellMastery(migratedState.player?.spellMastery)
  };
  const enemyIndex = Number.isInteger(migratedState.enemyIndex)
    ? migratedState.enemyIndex
    : fallback.enemyIndex;
  const enemy = migratedState.enemy
    ? { ...createEnemy(enemyIndex), ...migratedState.enemy }
    : createEnemy(enemyIndex);

  return {
    ...fallback,
    ...migratedState,
    saveVersion: CURRENT_SAVE_VERSION,
    player,
    enemyIndex,
    enemy,
    mode: normalizeMode(migratedState.mode),
    hubActivity: normalizeHubActivity(migratedState.hubActivity),
    log: Array.isArray(migratedState.log) ? migratedState.log.slice(0, 40) : fallback.log
  };
}

function normalizeMode(mode) {
  return mode === "hub" || mode === "duel" ? mode : "duel";
}

function normalizeHubActivity(activity) {
  const validActivities = ["main", "training", "shop", "explore"];

  return validActivities.includes(activity) ? activity : "main";
}

function migrateSaveState(savedState, sourceSaveVersion) {
  if (sourceSaveVersion === 1) {
    return savedState;
  }

  return savedState;
}

function normalizeSchools(savedSchools = {}) {
  return Object.fromEntries(
    magicSchools.map((school) => [
      school,
      {
        xp: Number.isFinite(savedSchools[school]?.xp) ? savedSchools[school].xp : 0
      }
    ])
  );
}

function normalizeInventory(savedInventory = {}) {
  return {
    manaPotion: Number.isInteger(savedInventory.manaPotion) ? savedInventory.manaPotion : 0,
    shieldPotion: Number.isInteger(savedInventory.shieldPotion) ? savedInventory.shieldPotion : 0
  };
}

function normalizeSpellMastery(savedMastery = {}) {
  return Object.fromEntries(
    spells.map((spell) => [
      spell.id,
      {
        xp: Number.isFinite(savedMastery[spell.id]?.xp) ? savedMastery[spell.id].xp : 0
      }
    ])
  );
}

function getSchoolLevel(xp) {
  return 1 + Math.floor(xp / 10);
}

function getSpellMasteryLevel(xp) {
  return 1 + Math.floor(xp / 5);
}

window.WizardState = {
  createEnemy,
  createInitialState,
  getSchoolLevel,
  getNextEnemyIndex,
  getSpellMasteryLevel,
  loadState,
  saveState
};
})();
