(() => {
const { MANA_RECOVERY_PER_TURN, TRAINING_COST, TRAINING_SCHOOL_XP, XP_TO_LEVEL, magicSchools } = window.WizardData;
const { createEnemy, getNextEnemyIndex } = window.WizardState;
const { getMasteredSpellEffect, grantSchoolXp, grantSpellProgression, isSpellUnlocked } = window.WizardProgression;

function castSpell(state, spell) {
  const nextState = structuredClone(state);

  if (nextState.mode !== "duel") {
    addLog(nextState, "Find a duel before casting combat spells.");
    return nextState;
  }

  if (nextState.battleOver) {
    returnToHub(nextState);
    return nextState;
  }

  if (!isSpellUnlocked(spell, nextState.player)) {
    addLog(nextState, `${spell.name} is still locked.`);
    return nextState;
  }

  if (nextState.player.currentMana < spell.manaCost) {
    addLog(nextState, `Not enough mana to cast ${spell.name}.`);
    return nextState;
  }

  nextState.player.currentMana -= spell.manaCost;
  applySpellEffect(nextState, spell);
  grantProgression(nextState, spell);

  if (nextState.enemy.currentHealth <= 0) {
    winBattle(nextState);
    return nextState;
  }

  enemyTurn(nextState);

  if (nextState.player.currentShield <= 0) {
    loseBattle(nextState);
  } else {
    recoverMana(nextState);
  }

  return nextState;
}

function restAfterBattle(state) {
  const nextState = structuredClone(state);
  returnToHub(nextState);
  return nextState;
}

function findDuel(state) {
  const nextState = structuredClone(state);

  nextState.mode = "duel";
  nextState.hubActivity = "main";
  nextState.battleOver = false;
  nextState.enemyNextAttackPenalty = 0;
  nextState.enemy = createEnemy(nextState.enemyIndex);
  addLog(nextState, `${nextState.enemy.name} steps forward for a duel.`);

  return nextState;
}

function restAtHub(state) {
  const nextState = structuredClone(state);

  nextState.player.currentMana = nextState.player.maxMana;
  nextState.player.currentShield = nextState.player.maxShield;
  addLog(nextState, "You rest and fully restore mana and shield.");

  return nextState;
}

function trainMagic(state) {
  const nextState = structuredClone(state);

  nextState.mode = "hub";
  nextState.hubActivity = "training";

  return nextState;
}

function returnToHubActivity(state) {
  const nextState = structuredClone(state);

  nextState.mode = "hub";
  nextState.hubActivity = "main";

  return nextState;
}

function trainSchool(state, school) {
  const nextState = structuredClone(state);

  if (nextState.mode !== "hub") {
    addLog(nextState, "Return to the hub before training.");
    return nextState;
  }

  if (!magicSchools.includes(school)) {
    addLog(nextState, "Unknown magic school.");
    return nextState;
  }

  if (nextState.player.gold < TRAINING_COST) {
    addLog(nextState, `Training costs ${TRAINING_COST} gold.`);
    return nextState;
  }

  nextState.player.gold -= TRAINING_COST;
  const messages = grantSchoolXp(nextState.player, school, TRAINING_SCHOOL_XP);
  addLog(
    nextState,
    `Trained ${formatLabel(school)} magic for ${TRAINING_COST} gold. ${formatLabel(school)} school gains ${TRAINING_SCHOOL_XP} XP.`
  );

  for (const message of messages) {
    addLog(nextState, message);
  }

  return nextState;
}

function waitTurn(state) {
  const nextState = structuredClone(state);

  if (nextState.mode !== "duel") {
    addLog(nextState, "Find a duel before waiting on an enemy turn.");
    return nextState;
  }

  if (nextState.battleOver) {
    return nextState;
  }

  const recovered = recoverMana(nextState);

  if (recovered === 0) {
    addLog(nextState, "You wait for an opening.");
  }

  enemyTurn(nextState);

  if (nextState.player.currentShield <= 0) {
    loseBattle(nextState);
  }

  return nextState;
}

function surrenderBattle(state) {
  const nextState = structuredClone(state);

  if (nextState.mode === "duel" && !nextState.battleOver) {
    loseBattle(nextState, "You surrender the duel.");
  }

  return nextState;
}

function applySpellEffect(state, spell) {
  const effect = getMasteredSpellEffect(spell, state.player);

  if (effect.damage) {
    state.enemy.currentHealth = Math.max(0, state.enemy.currentHealth - effect.damage);
    addLog(state, `${spell.name} hits ${state.enemy.name} for ${effect.damage} damage.`);
  }

  if (effect.shieldRestore) {
    const restored = Math.min(
      effect.shieldRestore,
      state.player.maxShield - state.player.currentShield
    );
    state.player.currentShield += restored;
    addLog(state, `${spell.name} restores ${restored} shield.`);
  }

  if (effect.attackReduction) {
    state.enemyNextAttackPenalty += effect.attackReduction;
    addLog(state, `${state.enemy.name}'s next attack is reduced by ${effect.attackReduction}.`);
  }
}

function grantProgression(state, spell) {
  const messages = grantSpellProgression(state.player, spell);

  for (const message of messages) {
    addLog(state, message);
  }
}

function enemyTurn(state) {
  const baseDamage = randomInt(state.enemy.attackMin, state.enemy.attackMax);
  const reducedDamage = Math.max(0, baseDamage - state.enemyNextAttackPenalty);
  state.enemyNextAttackPenalty = 0;
  state.player.currentShield = Math.max(0, state.player.currentShield - reducedDamage);
  addLog(state, `${state.enemy.name} attacks for ${reducedDamage} shield damage.`);
}

function recoverMana(state) {
  const recovered = Math.min(
    MANA_RECOVERY_PER_TURN,
    state.player.maxMana - state.player.currentMana
  );

  if (recovered > 0) {
    state.player.currentMana += recovered;
    addLog(state, `You recover ${recovered} mana.`);
  }

  return recovered;
}

function winBattle(state) {
  state.battleOver = true;
  state.player.gold += state.enemy.goldReward;
  gainXp(state, state.enemy.xpReward);
  addLog(
    state,
    `Victory! You gain ${state.enemy.xpReward} XP and ${state.enemy.goldReward} gold.`
  );
}

function loseBattle(state, message = "Defeat.") {
  state.battleOver = true;
  const consolationXp = Math.max(8, Math.floor(state.enemy.xpReward * 0.25));
  gainXp(state, consolationXp);
  addLog(state, `${message} You keep your progress and gain ${consolationXp} XP.`);
}

function returnToHub(state) {
  state.enemyIndex = getNextEnemyIndex(state.enemyIndex);
  state.enemy = createEnemy(state.enemyIndex);
  state.enemyNextAttackPenalty = 0;
  state.battleOver = false;
  state.mode = "hub";
  state.hubActivity = "main";
  addLog(state, "You return to the hub.");
}

function gainXp(state, amount) {
  state.player.xp += amount;

  while (state.player.xp >= XP_TO_LEVEL) {
    state.player.xp -= XP_TO_LEVEL;
    state.player.level += 1;
    state.player.maxMana += 6;
    state.player.maxShield += 7;
    state.player.currentMana = state.player.maxMana;
    state.player.currentShield = state.player.maxShield;
    addLog(
      state,
      `Level up! You are now level ${state.player.level}. Max mana and shield increased.`
    );
  }
}

function addLog(state, message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 40);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatLabel(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

window.WizardCombat = {
  castSpell,
  findDuel,
  returnToHubActivity,
  restAfterBattle,
  restAtHub,
  surrenderBattle,
  trainSchool,
  trainMagic,
  waitTurn
};
})();
