export const preloadTemplates = async function () {
    const templatePaths = [
        //Character Partial
        'systems/univare/templates/actor/partial/abilities.html',
        'systems/univare/templates/actor/partial/description.html',
        'systems/univare/templates/actor/partial/features.html',
        'systems/univare/templates/actor/partial/items.html',
        'systems/univare/templates/actor/partial/package.html',
        'systems/univare/templates/actor/partial/packages.html',
    ];
    return loadTemplates(templatePaths);
};
