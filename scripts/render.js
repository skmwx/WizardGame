(() => {
const { XP_TO_LEVEL, spells } = window.WizardData;

function render(state, handlers) {
  renderPlayer(state);
  renderEnemy(state);
  renderSpells(state, handlers);
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
  const { enemy } = state;
  const stats = [
    ["Name", enemy.name],
    ["Health", `${enemy.currentHealth} / ${enemy.maxHealth}`],
    ["Attack", `${enemy.attackMin}-${enemy.attackMax}`],
    ["Next Attack Penalty", state.enemyNextAttackPenalty]
  ];

  renderStats(document.querySelector("#enemy-stats"), stats);
}

function renderSpells(state, handlers) {
  const container = document.querySelector("#spell-buttons");
  container.innerHTML = "";

  if (state.battleOver) {
    const button = document.createElement("button");
    button.className = "spell-button";
    button.type = "button";
    button.textContent = "Continue to next duel";
    button.addEventListener("click", handlers.onContinue);
    container.append(button);
    return;
  }

  for (const spell of spells) {
    const button = document.createElement("button");
    button.className = "spell-button";
    button.type = "button";
    button.disabled = state.player.currentMana < spell.manaCost;
    button.innerHTML = `
      <strong>${spell.name}</strong>
      <span>${spell.description}</span>
    `;
    button.addEventListener("click", () => handlers.onCast(spell));
    container.append(button);
  }
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
