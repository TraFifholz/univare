export const preloadTemplates = async function () {
    const templatePaths = [
        //Character Sheets
        'systems/univare/templates/actor/character-sheet.html',
        'systems/univare/templates/actor/npc-sheet.html',
        'systems/univare/templates/actor/compaion-sheet.html',
        //Character Partial
        'systems/univare/templates/actor/partial/abilities.html',
        'systems/univare/templates/actor/partial/description.html',
        'systems/univare/templates/actor/partial/features.html',
        'systems/univare/templates/actor/partial/items.html',
    ];
    return loadTemplates(templatePaths);
};
