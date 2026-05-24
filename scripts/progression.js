(() => {
const { getSpellMasteryLevel: getLevelFromXp } = window.WizardState;
const { getSchoolLevel } = window.WizardState;

function getPlayerSchoolLevel(player, school) {
  const xp = player.schools?.[school]?.xp ?? 0;

  return getSchoolLevel(xp);
}

function getSpellMasteryLevel(player, spellId) {
  const xp = player.spellMastery?.[spellId]?.xp ?? 0;

  return getLevelFromXp(xp);
}

function describeSpell(spell, player) {
  const effect = getMasteredSpellEffect(spell, player);

  if (effect.damage && effect.attackReduction) {
    return `Costs ${spell.manaCost} mana, deals ${effect.damage} damage, and weakens the next enemy attack by ${effect.attackReduction}.`;
  }

  if (effect.damage) {
    return `Costs ${spell.manaCost} mana and deals ${effect.damage} damage.`;
  }

  if (effect.shieldRestore) {
    return `Costs ${spell.manaCost} mana and restores ${effect.shieldRestore} shield.`;
  }

  if (effect.attackReduction) {
    return `Costs ${spell.manaCost} mana and weakens the next enemy attack by ${effect.attackReduction}.`;
  }

  return spell.description;
}

function describeUnlockRequirement(spell) {
  if (!spell.unlock || spell.unlock.unlocked) {
    return "";
  }

  return `Unlocks at ${formatLabel(spell.unlock.school)} school level ${spell.unlock.level}.`;
}

function isSpellUnlocked(spell, player) {
  if (!spell.unlock || spell.unlock.unlocked) {
    return true;
  }

  return getPlayerSchoolLevel(player, spell.unlock.school) >= spell.unlock.level;
}

function getMasteredSpellEffect(spell, player) {
  const masteryLevel = getSpellMasteryLevel(player, spell.id);
  const bonus = masteryLevel - 1;

  return {
    damage: spell.damage ? spell.damage + bonus : 0,
    shieldRestore: spell.shieldRestore ? spell.shieldRestore + bonus : 0,
    attackReduction: spell.attackReduction ? spell.attackReduction + bonus : 0
  };
}

function grantSpellProgression(player, spell) {
  const messages = [];
  player.schools[spell.school] ??= { xp: 0 };
  player.spellMastery[spell.id] ??= { xp: 0 };

  const schoolProgress = player.schools[spell.school];
  const masteryProgress = player.spellMastery[spell.id];
  const previousSchoolLevel = getSchoolLevel(schoolProgress.xp);
  const previousMasteryLevel = getSpellMasteryLevel(player, spell.id);

  schoolProgress.xp += 1;
  masteryProgress.xp += 1;

  const nextSchoolLevel = getSchoolLevel(schoolProgress.xp);
  const nextMasteryLevel = getSpellMasteryLevel(player, spell.id);

  if (nextSchoolLevel > previousSchoolLevel) {
    messages.push(`${formatLabel(spell.school)} school increased to level ${nextSchoolLevel}.`);
  }

  if (nextMasteryLevel > previousMasteryLevel) {
    messages.push(`${spell.name} mastery increased to level ${nextMasteryLevel}.`);
  }

  return messages;
}

function formatLabel(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

window.WizardProgression = {
  describeSpell,
  describeUnlockRequirement,
  getMasteredSpellEffect,
  getPlayerSchoolLevel,
  getSpellMasteryLevel,
  grantSpellProgression,
  isSpellUnlocked
};
})();
