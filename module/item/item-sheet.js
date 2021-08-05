/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class UnivareItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["univare", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", 
      contentSelector: ".sheet-body", 
      initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/univare/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/${this.item.data.type}.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();
    const skills = [];
    // Use a safe clone of the item data for further operations.
    const itemData = context.item.data;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
      context.hasActor = true;
    } else {
      context.hasActor = false;
    }

    for (let i of actor.items){
      if (i.type === "skill"){
        skills.push(i);
      }
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.data = itemData.data;
    context.flags = itemData.flags;
    context.skills = skills;
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
    
    // Roll handlers, click handlers, etc. would go here.
    html.find('.tag-create').on('click', () => {
      this.item.update({
          _id: this.item.id,
          ['data.tag.additional.' + randomID()]: {
              name: '标签',
          },
      }, {});
    });
    html.find('.tag-delete').on('click', (ev) => {
      const key = ev.currentTarget.dataset.actionKey;
      this.item.update({
          _id: this.item.id,
          'data.tag.additional': {
              [`-=${key}`]: null,
          },
      }, {});
    });
  }
  
}