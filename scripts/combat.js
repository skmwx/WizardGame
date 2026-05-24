(() => {
const {
  MANA_RECOVERY_PER_TURN,
  POTION_RESTORE_AMOUNT,
  TRAINING_COST,
  TRAINING_SCHOOL_XP,
  XP_TO_LEVEL,
  explorationLocations,
  magicSchools,
  shopItems,
  specialEnemies
} = window.WizardData;
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

function exploreOldForest(state) {
  const nextState = structuredClone(state);

  nextState.mode = "hub";
  nextState.hubActivity = "explore";
  addLog(nextState, "You follow a mossy path into the Old Forest.");

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

function visitShop(state) {
  const nextState = structuredClone(state);

  nextState.mode = "hub";
  nextState.hubActivity = "shop";

  return nextState;
}

function returnToHubActivity(state) {
  const nextState = structuredClone(state);

  nextState.mode = "hub";
  nextState.hubActivity = "main";

  return nextState;
}

function resolveExplorationChoice(state, choiceId) {
  const nextState = structuredClone(state);
  const location = getOldForestLocation();
  const choice = location?.choices.find((candidate) => candidate.id === choiceId);

  if (nextState.mode !== "hub" || nextState.hubActivity !== "explore") {
    addLog(nextState, "Return to the Old Forest before making that choice.");
    return nextState;
  }

  if (!choice) {
    addLog(nextState, "Unknown forest path.");
    return nextState;
  }

  if (choice.returnToHub) {
    nextState.hubActivity = "main";
    addLog(nextState, "You return to the hub from the Old Forest.");
    return nextState;
  }

  addLog(nextState, choice.log);

  if (choice.inventoryReward) {
    grantInventoryReward(nextState, choice.inventoryReward);
  }

  if (choice.schoolXpReward) {
    grantExplorationSchoolXp(nextState, choice.schoolXpReward);
  }

  if (choice.enemyId) {
    startSpecialEnemyDuel(nextState, choice.enemyId);
  }

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

function grantInventoryReward(state, reward) {
  state.player.inventory[reward.key] ??= 0;
  state.player.inventory[reward.key] += reward.amount;
}

function grantExplorationSchoolXp(state, reward) {
  const messages = grantSchoolXp(state.player, reward.school, reward.amount);

  addLog(
    state,
    `${formatLabel(reward.school)} school gains ${reward.amount} XP.`
  );

  for (const message of messages) {
    addLog(state, message);
  }
}

function startSpecialEnemyDuel(state, enemyId) {
  const enemy = specialEnemies[enemyId];

  if (!enemy) {
    addLog(state, "No spirit answers.");
    return;
  }

  state.mode = "duel";
  state.hubActivity = "main";
  state.battleOver = false;
  state.enemyNextAttackPenalty = 0;
  state.enemy = createEnemyFromTemplate(enemy);
}

function buyShopItem(state, itemId) {
  const nextState = structuredClone(state);
  const item = shopItems.find((candidate) => candidate.id === itemId);

  if (nextState.mode !== "hub") {
    addLog(nextState, "Return to the hub before visiting the shop.");
    return nextState;
  }

  if (!item) {
    addLog(nextState, "Unknown shop item.");
    return nextState;
  }

  if (nextState.player.gold < item.cost) {
    addLog(nextState, `${item.name} costs ${item.cost} gold.`);
    return nextState;
  }

  nextState.player.gold -= item.cost;
  nextState.player.inventory[item.inventoryKey] ??= 0;
  nextState.player.inventory[item.inventoryKey] += 1;
  addLog(nextState, `Bought ${item.name} for ${item.cost} gold.`);

  return nextState;
}

function usePotion(state, potionType) {
  const nextState = structuredClone(state);
  let used = false;

  if (nextState.mode !== "duel" || nextState.battleOver) {
    addLog(nextState, "Potions can only be used during an active duel.");
    return nextState;
  }

  if (potionType === "manaPotion") {
    used = useManaPotion(nextState);
  } else if (potionType === "shieldPotion") {
    used = useShieldPotion(nextState);
  } else {
    addLog(nextState, "Unknown potion.");
    return nextState;
  }

  if (!used) {
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

function useManaPotion(state) {
  if (state.player.inventory.manaPotion <= 0) {
    addLog(state, "No Mana Potions available.");
    return false;
  }

  const restored = Math.min(POTION_RESTORE_AMOUNT, state.player.maxMana - state.player.currentMana);
  if (restored === 0) {
    addLog(state, "Mana is already full.");
    return false;
  }

  state.player.inventory.manaPotion -= 1;
  state.player.currentMana += restored;
  addLog(state, `Used Mana Potion and restored ${restored} mana.`);
  return true;
}

function useShieldPotion(state) {
  if (state.player.inventory.shieldPotion <= 0) {
    addLog(state, "No Shield Potions available.");
    return false;
  }

  const restored = Math.min(POTION_RESTORE_AMOUNT, state.player.maxShield - state.player.currentShield);
  if (restored === 0) {
    addLog(state, "Shield is already full.");
    return false;
  }

  state.player.inventory.shieldPotion -= 1;
  state.player.currentShield += restored;
  addLog(state, `Used Shield Potion and restored ${restored} shield.`);
  return true;
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
  if (!isSpecialEnemy(state.enemy)) {
    state.enemyIndex = getNextEnemyIndex(state.enemyIndex);
  }

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

function createEnemyFromTemplate(template) {
  return {
    ...structuredClone(template),
    currentHealth: template.maxHealth
  };
}

function getOldForestLocation() {
  return explorationLocations.find((location) => location.id === "oldForest");
}

function isSpecialEnemy(enemy) {
  return Boolean(enemy && specialEnemies[enemy.id]);
}

function formatLabel(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

window.WizardCombat = {
  castSpell,
  buyShopItem,
  exploreOldForest,
  findDuel,
  returnToHubActivity,
  restAfterBattle,
  restAtHub,
  resolveExplorationChoice,
  surrenderBattle,
  trainSchool,
  trainMagic,
  usePotion,
  visitShop,
  waitTurn
};
})();
