(() => {
const { STORAGE_KEY, enemyWizards, magicSchools, spells, startingPlayer } = window.WizardData;

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
    ...savedState.player,
    schools: normalizeSchools(savedState.player?.schools),
    spellMastery: normalizeSpellMastery(savedState.player?.spellMastery)
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
