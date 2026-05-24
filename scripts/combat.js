(() => {
const { MANA_RECOVERY_PER_TURN, XP_TO_LEVEL } = window.WizardData;
const { createEnemy, getNextEnemyIndex } = window.WizardState;

function castSpell(state, spell) {
  const nextState = structuredClone(state);

  if (nextState.battleOver) {
    startNextBattle(nextState);
    return nextState;
  }

  if (nextState.player.currentMana < spell.manaCost) {
    addLog(nextState, `Not enough mana to cast ${spell.name}.`);
    return nextState;
  }

  nextState.player.currentMana -= spell.manaCost;
  applySpellEffect(nextState, spell);

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
  startNextBattle(nextState);
  return nextState;
}

function applySpellEffect(state, spell) {
  if (spell.damage) {
    state.enemy.currentHealth = Math.max(0, state.enemy.currentHealth - spell.damage);
    addLog(state, `${spell.name} hits ${state.enemy.name} for ${spell.damage} damage.`);
  }

  if (spell.shieldRestore) {
    const restored = Math.min(
      spell.shieldRestore,
      state.player.maxShield - state.player.currentShield
    );
    state.player.currentShield += restored;
    addLog(state, `${spell.name} restores ${restored} shield.`);
  }

  if (spell.attackReduction) {
    state.enemyNextAttackPenalty += spell.attackReduction;
    addLog(state, `${state.enemy.name}'s next attack is reduced by ${spell.attackReduction}.`);
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

function loseBattle(state) {
  state.battleOver = true;
  const consolationXp = Math.max(8, Math.floor(state.enemy.xpReward * 0.25));
  gainXp(state, consolationXp);
  addLog(state, `Defeat. You keep your progress and gain ${consolationXp} XP.`);
}

function startNextBattle(state) {
  state.enemyIndex = getNextEnemyIndex(state.enemyIndex);
  state.enemy = createEnemy(state.enemyIndex);
  state.enemyNextAttackPenalty = 0;
  state.battleOver = false;
  state.player.currentMana = state.player.maxMana;
  state.player.currentShield = state.player.maxShield;
  addLog(state, `${state.enemy.name} arrives for the next duel.`);
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

window.WizardCombat = {
  castSpell,
  restAfterBattle
};
})();
