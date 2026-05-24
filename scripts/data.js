(() => {
window.WizardData = {
  STORAGE_KEY: "wizard-duel-save-v1",
  XP_TO_LEVEL: 100,
  MANA_RECOVERY_PER_TURN: 5,
  TRAINING_COST: 15,
  TRAINING_SCHOOL_XP: 3,
  POTION_RESTORE_AMOUNT: 20,
  shopItems: [
    {
      id: "manaPotion",
      name: "Mana Potion",
      cost: 20,
      inventoryKey: "manaPotion"
    },
    {
      id: "shieldPotion",
      name: "Shield Potion",
      cost: 20,
      inventoryKey: "shieldPotion"
    }
  ],
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
    id: "ignite",
    name: "Ignite",
    school: "fire",
    manaCost: 5,
    damage: 11,
    unlock: {
      school: "fire",
      level: 3
    },
    description: "Costs 5 mana and deals 11 damage."
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
    id: "manaFlow",
    name: "Mana Flow",
    school: "water",
    manaCost: 4,
    shieldRestore: 8,
    unlock: {
      school: "water",
      level: 3
    },
    description: "Costs 4 mana and restores 8 shield."
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
  },
  {
    id: "confuse",
    name: "Confuse",
    school: "mind",
    manaCost: 5,
    attackReduction: 9,
    unlock: {
      school: "mind",
      level: 3
    },
    description: "Costs 5 mana and weakens the next enemy attack by 9."
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
    inventory: {
      manaPotion: 0,
      shieldPotion: 0
    },
    schools: {
      fire: { xp: 0 },
      water: { xp: 0 },
      mind: { xp: 0 }
    },
    spellMastery: {
      fireBolt: { xp: 0 },
      ignite: { xp: 0 },
      waterShield: { xp: 0 },
      manaFlow: { xp: 0 },
      mindSpike: { xp: 0 },
      confuse: { xp: 0 }
    }
  }
};
})();
