(() => {
const {
  castSpell,
  buyShopItem,
  findDuel,
  restAfterBattle,
  restAtHub,
  returnToHubActivity,
  surrenderBattle,
  trainSchool,
  trainMagic,
  usePotion,
  visitShop,
  waitTurn
} = window.WizardCombat;
const { createInitialState, loadState, saveState } = window.WizardState;
const { render } = window.WizardRender;

let gameState = loadState() ?? createInitialState();

const handlers = {
  onCast(spell) {
    gameState = castSpell(gameState, spell);
    saveState(gameState);
    draw();
  },
  onContinue() {
    gameState = restAfterBattle(gameState);
    saveState(gameState);
    draw();
  },
  onFindDuel() {
    gameState = findDuel(gameState);
    saveState(gameState);
    draw();
  },
  onBuyShopItem(itemId) {
    gameState = buyShopItem(gameState, itemId);
    saveState(gameState);
    draw();
  },
  onRest() {
    gameState = restAtHub(gameState);
    saveState(gameState);
    draw();
  },
  onReturnToHubActivity() {
    gameState = returnToHubActivity(gameState);
    saveState(gameState);
    draw();
  },
  onSurrender() {
    gameState = surrenderBattle(gameState);
    saveState(gameState);
    draw();
  },
  onTrainMagic() {
    gameState = trainMagic(gameState);
    saveState(gameState);
    draw();
  },
  onTrainSchool(school) {
    gameState = trainSchool(gameState, school);
    saveState(gameState);
    draw();
  },
  onUsePotion(potionType) {
    gameState = usePotion(gameState, potionType);
    saveState(gameState);
    draw();
  },
  onVisitShop() {
    gameState = visitShop(gameState);
    saveState(gameState);
    draw();
  },
  onWait() {
    gameState = waitTurn(gameState);
    saveState(gameState);
    draw();
  }
};

document.querySelector("#save-button").addEventListener("click", () => {
  gameState.log.unshift("Game saved.");
  saveState(gameState);
  draw();
});

document.querySelector("#load-button").addEventListener("click", () => {
  const loadedState = loadState();
  gameState = loadedState ?? gameState;
  gameState.log.unshift(loadedState ? "Game loaded." : "No saved game found.");
  draw();
});

document.querySelector("#new-game-button").addEventListener("click", () => {
  gameState = createInitialState();
  saveState(gameState);
  draw();
});

function draw() {
  render(gameState, handlers);
}

draw();
})();
