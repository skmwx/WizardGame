(() => {
window.WizardData = {
  STORAGE_KEY: "wizard-duel-save-v1",
  XP_TO_LEVEL: 100,
  MANA_RECOVERY_PER_TURN: 5,
  magicSchools: ["fire", "water", "mind"],
  spells: [
  {
    id: "fireBolt",
    name: "Fire Bolt",
    school: "fire",
    manaCost: 8,
    damage: 18,
    unlock: {
      unlocked: true,
      requirement: null
    },
    description: "Costs 8 mana and deals 18 damage."
  },
  {
    id: "waterShield",
    name: "Water Shield",
    school: "water",
    manaCost: 7,
    shieldRestore: 16,
    unlock: {
      unlocked: true,
      requirement: null
    },
    description: "Costs 7 mana and restores 16 shield."
  },
  {
    id: "mindSpike",
    name: "Mind Spike",
    school: "mind",
    manaCost: 6,
    damage: 10,
    attackReduction: 8,
    unlock: {
      unlocked: true,
      requirement: null
    },
    description: "Costs 6 mana, deals 10 damage, and weakens the next enemy attack by 8."
  }
],

  enemyWizards: [
  {
    id: "emberAcolyte",
    name: "Ember Acolyte",
    maxHealth: 46,
    attackMin: 7,
    attackMax: 12,
    xpReward: 42,
    goldReward: 18
  },
  {
    id: "tideSeer",
    name: "Tide Seer",
    maxHealth: 62,
    attackMin: 9,
    attackMax: 15,
    xpReward: 58,
    goldReward: 27
  },
  {
    id: "nightSage",
    name: "Night Sage",
    maxHealth: 82,
    attackMin: 12,
    attackMax: 19,
    xpReward: 78,
    goldReward: 40
  }
],

  startingPlayer: {
    level: 1,
    xp: 0,
    gold: 0,
    maxMana: 32,
    currentMana: 32,
    maxShield: 38,
    currentShield: 38,
    schools: {
      fire: { xp: 0 },
      water: { xp: 0 },
      mind: { xp: 0 }
    },
    spellMastery: {
      fireBolt: { xp: 0 },
      waterShield: { xp: 0 },
      mindSpike: { xp: 0 }
    }
  }
};
})();
