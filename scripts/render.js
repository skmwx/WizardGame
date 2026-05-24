(() => {
const { TRAINING_COST, TRAINING_SCHOOL_XP, XP_TO_LEVEL, magicSchools, spells } = window.WizardData;
const { getSchoolLevel, getSpellMasteryLevel } = window.WizardState;
const { describeSpell, describeUnlockRequirement, isSpellUnlocked } = window.WizardProgression;

function render(state, handlers) {
  renderPlayer(state);
  renderEnemy(state);
  renderActivityPanel(state, handlers);
  renderProgression(state);
  renderLog(state);
}

function renderPlayer(state) {
  const { player } = state;
  const stats = [
    ["Level", player.level],
    ["XP", `${player.xp} / ${XP_TO_LEVEL}`],
    ["Gold", player.gold],
    ["Mana", `${player.currentMana} / ${player.maxMana}`],
    ["Shield", `${player.currentShield} / ${player.maxShield}`]
  ];

  renderStats(document.querySelector("#player-stats"), stats);
}

function renderEnemy(state) {
  const panel = document.querySelector("#enemy-panel");
  panel.hidden = state.mode !== "duel";

  if (state.mode !== "duel") {
    return;
  }

  const { enemy } = state;
  const stats = [
    ["Name", enemy.name],
    ["Health", `${enemy.currentHealth} / ${enemy.maxHealth}`],
    ["Attack", `${enemy.attackMin}-${enemy.attackMax}`],
    ["Next Attack Penalty", state.enemyNextAttackPenalty]
  ];

  renderStats(document.querySelector("#enemy-stats"), stats);
}

function renderActivityPanel(state, handlers) {
  const title = document.querySelector("#activity-title");
  const container = document.querySelector("#spell-buttons");
  const actions = document.querySelector("#combat-actions");
  container.innerHTML = "";
  actions.innerHTML = "";

  if (state.mode === "hub") {
    renderHubPanel(title, container, state, handlers);
    return;
  }

  title.textContent = "Spells";

  if (state.battleOver) {
    const button = document.createElement("button");
    button.className = "spell-button";
    button.type = "button";
    button.textContent = "Return to hub";
    button.addEventListener("click", handlers.onContinue);
    container.append(button);
    return;
  }

  for (const spell of spells) {
    const unlocked = isSpellUnlocked(spell, state.player);
    const button = document.createElement("button");
    button.className = unlocked ? "spell-button" : "spell-button locked";
    button.type = "button";
    button.disabled = !unlocked || state.player.currentMana < spell.manaCost;
    button.innerHTML = `
      <strong>${spell.name}</strong>
      <span>${unlocked ? describeSpell(spell, state.player) : describeUnlockRequirement(spell)}</span>
    `;
    button.addEventListener("click", () => handlers.onCast(spell));
    container.append(button);
  }

  renderCombatActions(actions, handlers);
}

function renderHubPanel(title, container, state, handlers) {
  if (state.hubActivity === "training") {
    title.textContent = "Train Magic";
    renderTrainingActions(container, state, handlers);
    return;
  }

  title.textContent = "Hub";
  renderHubActions(container, handlers);
}

function renderHubActions(container, handlers) {
  const actions = [
    ["Find Duel", handlers.onFindDuel],
    ["Train Magic", handlers.onTrainMagic],
    ["Rest", handlers.onRest]
  ];

  for (const [label, handler] of actions) {
    const button = document.createElement("button");
    button.className = "spell-button";
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", handler);
    container.append(button);
  }
}

function renderTrainingActions(container, state, handlers) {
  for (const school of magicSchools) {
    const button = document.createElement("button");
    button.className = "spell-button";
    button.type = "button";
    button.innerHTML = `
      <strong>${formatLabel(school)}</strong>
      <span>Costs ${TRAINING_COST} gold and grants ${TRAINING_SCHOOL_XP} school XP.</span>
    `;
    button.addEventListener("click", () => handlers.onTrainSchool(school));
    container.append(button);
  }

  const backButton = document.createElement("button");
  backButton.className = "spell-button";
  backButton.type = "button";
  backButton.textContent = "Back to hub";
  backButton.addEventListener("click", handlers.onReturnToHubActivity);
  container.append(backButton);
}

function renderCombatActions(container, handlers) {
  const waitButton = document.createElement("button");
  waitButton.type = "button";
  waitButton.textContent = "Wait";
  waitButton.addEventListener("click", handlers.onWait);

  const surrenderButton = document.createElement("button");
  surrenderButton.type = "button";
  surrenderButton.textContent = "Surrender";
  surrenderButton.addEventListener("click", handlers.onSurrender);

  container.append(waitButton, surrenderButton);
}

function renderProgression(state) {
  const schoolStats = Object.entries(state.player.schools).map(([school, progress]) => [
    formatLabel(school),
    `Level ${getSchoolLevel(progress.xp)} (${progress.xp} XP)`
  ]);
  const masteryStats = spells.map((spell) => {
    const progress = state.player.spellMastery[spell.id] ?? { xp: 0 };

    return [
      spell.name,
      `Level ${getSpellMasteryLevel(progress.xp)} (${progress.xp} XP)`
    ];
  });

  renderStats(document.querySelector("#school-progress"), schoolStats);
  renderStats(document.querySelector("#spell-mastery"), masteryStats);
}

function formatLabel(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function renderLog(state) {
  const list = document.querySelector("#battle-log");
  list.innerHTML = "";

  for (const entry of state.log) {
    const item = document.createElement("li");
    item.textContent = entry;
    list.append(item);
  }
}

function renderStats(container, stats) {
  container.innerHTML = "";

  for (const [label, value] of stats) {
    const term = document.createElement("dt");
    const detail = document.createElement("dd");
    term.textContent = label;
    detail.textContent = value;
    container.append(term, detail);
  }
}

window.WizardRender = {
  render
};
})();
