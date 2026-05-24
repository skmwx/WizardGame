(() => {
const { STORAGE_KEY, enemyWizards, startingPlayer } = window.WizardData;

function createInitialState() {
  const player = structuredClone(startingPlayer);
  const enemyIndex = 0;

  return {
    player,
    enemyIndex,
    enemy: createEnemy(enemyIndex),
    enemyNextAttackPenalty: 0,
    battleOver: false,
    log: [
      "A rival wizard steps forward. Choose a spell to begin."
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  const player = {
    ...fallback.player,
    ...savedState.player
  };
  const enemyIndex = Number.isInteger(savedState.enemyIndex)
    ? savedState.enemyIndex
    : fallback.enemyIndex;
  const enemy = savedState.enemy
    ? { ...createEnemy(enemyIndex), ...savedState.enemy }
    : createEnemy(enemyIndex);

  return {
    ...fallback,
    ...savedState,
    player,
    enemyIndex,
    enemy,
    log: Array.isArray(savedState.log) ? savedState.log.slice(0, 40) : fallback.log
  };
}

window.WizardState = {
  createEnemy,
  createInitialState,
  getNextEnemyIndex,
  loadState,
  saveState
};
})();
