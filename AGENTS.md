# WizardGame Agent Notes

## Project Overview

WizardGame is a single-player, turn-based browser RPG about a wizard growing in power.

Technology constraints:
- Plain HTML, CSS, and JavaScript.
- No framework, backend, build step, bundler, accounts, or external dependencies.
- Runs directly in the browser as static files.
- Uses `localStorage` for save/load.

Core design goals:
- Multiple paths to power, so progression is not a single linear corridor.
- Steady, frequent rewards without harsh diminishing returns.
- Forgiving gameplay: no permanent death or irreversible failure. Losing a duel preserves progress and grants consolation XP.
- Solo-developer scope control: keep features small, incremental, and data-driven.

## Current Implementation Summary

Phase 1 added the basic duel loop:
- Player stats: level, XP, gold, mana, shield.
- Enemy wizard stats.
- Turn-based spell casting.
- Mana recovery.
- Win/loss outcomes.
- XP and gold rewards.
- Level-ups.
- Save/load/new game.
- Battle log.

Phase 2 added magic progression:
- Magic schools: `fire`, `water`, `mind`.
- Spell mastery.
- Spell unlocks based on school level.
- Current spells: Fire Bolt, Ignite, Water Shield, Mana Flow, Mind Spike, Confuse.
- Casting grants school XP and spell mastery XP.
- Spell mastery improves spell effects.
- Unlock messages appear when new spells become available.
- Wait and surrender actions exist.

Phase 3 added hub and preparation systems:
- `state.mode`: `"hub"` or `"duel"`.
- `state.hubActivity`: `"main"`, `"training"`, or `"shop"`.
- New games start in the hub.
- Hub actions: Find Duel, Train Magic, Visit Shop, Rest.
- Training costs gold and grants school XP.
- Shop sells Mana Potions and Shield Potions.
- Inventory tracks `manaPotion` and `shieldPotion`.
- Potions are usable during active duels, restore mana/shield, and are not consumed at full resource.
- Unaffordable training/shop buttons and unusable potion buttons are disabled.
- After battle, the player returns to the hub.
- Save/load works in both hub and duel.

## Manual Smoke Test Status

The following checks have passed:
1. New game starts in hub.
2. Find Duel shows enemy panel.
3. Winning a duel allows returning to hub.
4. Losing or surrendering allows returning to hub.
5. Training with enough gold increases school XP.
6. Training without enough gold is prevented by disabled buttons.
7. Buying potion with enough gold increases inventory.
8. Buying potion without enough gold is prevented by disabled buttons.
9. Using potion in combat decreases inventory and restores resource.
10. Trying potion at full resource does not consume potion.
11. Save/load works in hub.
12. Save/load works in duel.
13. New Game resets to hub.

## Architecture

`index.html` loads scripts in this order:
1. `scripts/data.js`
2. `scripts/state.js`
3. `scripts/progression.js`
4. `scripts/combat.js`
5. `scripts/render.js`
6. `scripts/app.js`

File responsibilities:
- `scripts/data.js`: Static game data and constants, including spells, enemies, shop items, starting player state, training costs, potion values, magic schools, and storage key.
- `scripts/state.js`: Initial state creation, enemy creation, save/load, `saveVersion`, state normalization, save migration hooks, and level calculation helpers.
- `scripts/progression.js`: School level wrappers, spell mastery, spell unlock checks, spell descriptions, school XP grants, and spell mastery XP grants.
- `scripts/combat.js`: Combat plus current activity systems: casting, enemy turns, win/loss, hub transitions, training, shop purchases, potion usage, resting, surrendering, waiting, XP gain, and logging.
- `scripts/render.js`: Player stats, enemy panel, hub/training/shop/combat panels, spell buttons, potion buttons, progression, and battle log.
- `scripts/app.js`: UI handlers, game state transitions, save/load, and render wiring.

Important save note:
- `STORAGE_KEY` is still `"wizard-duel-save-v1"` for continuity with existing saves.
- The actual schema version is tracked by `saveVersion` in `state.js`.
- Do not change `STORAGE_KEY` casually unless old saves are deliberately migrated.

## Coding Guidelines

- Keep the project dependency-free and runnable as static browser files.
- Prefer data-driven additions over hardcoded special cases.
- Preserve existing saves through normalization/migration.
- Make small incremental changes.
- Do not combine broad refactoring with major new gameplay.
- Keep functions simple and readable.
- Avoid clever abstractions unless they clearly reduce duplication.
- Do not add frameworks, bundlers, animations, asset pipelines, or backend services.
- Every new game state field must be included in `startingPlayer` or `createInitialState` and normalized in `loadState` when needed.
- Every player-facing feature should be represented clearly enough in the UI or battle log for manual testing.

## Known Architecture Concern

`combat.js` is becoming too broad. It currently contains combat, hub navigation, training, shop, potions, resting, and logging. This is acceptable for the prototype, but consider splitting later:
- `hub.js` for hub navigation, resting, training/shop mode transitions.
- `inventory.js` for shop purchases and potion usage.

Do not perform this refactor at the same time as adding a large feature unless specifically asked.

## Recommended Next Phase

Phase 4 should add a very small exploration feature.

Suggested scope:
- Add hub action: Explore.
- Add one location only: Old Forest.
- Text/choice based; no map, animation, or images required.
- Choices may include: Search for herbs, Investigate magical lights, Challenge a lurking spirit, Return to hub.
- Rewards may include small gold, school XP, potion, optional duel encounter, or flavor-only results.
- Keep exploration forgiving with no permanent failure.
- Avoid complex procedural generation.
- No equipment, crafting, alchemy, quest system, or multiple locations yet.

Explicitly out of scope until later:
- Equipment, rings, robes, staves, enchantment.
- Artificing, alchemy, scroll crafting.
- Multiple locations.
- Quest system or story campaign.
- Enemy spellcasting AI.
- More magic schools.
- Large spell expansion.
- Images, animation, backend, or accounts.
