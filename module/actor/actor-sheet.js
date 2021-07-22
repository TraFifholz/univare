/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class UnivareActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  get template() {
    if ( !game.user.isGM && this.actor.limited ) return "systems/univare/templates/actors/limited-sheet.html";
    return `systems/univare/templates/actor/${this.actor.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    let isOwner = this.actor.isOwner;
    console.log(this.actor);
    const data = super.getData();

    // Redefine the template data references to the actor.
    const actorData = this.actor.data.toObject(false);
    data.actor = actorData;
    data.data = actorData.data;
    data.rollData = this.actor.getRollData.bind(this.actor);

    // Owned items.
    data.items = actorData.items;
    data.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));

    // Prepare items.
    if (this.actor.data.type == 'character') {
      this._prepareCharacterItems(data);
    }

    return data;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const gear = [];
    const feats = [];
    console.log(sheetData.actor);

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of sheetData.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'feat') {
        feats.push(i);
      }
    }
    for (let s in actorData.data.stages) {
      actorData.data.stages[s].feats = [];
      actorData.data.stages[s].numtalent = 0;
      actorData.data.stages[s].numfeat = 0;
      actorData.data.stages[s].numrpower = 0;
      let new_featlist = [];
      for (let i of feats){
        if (actorData.data.stages[s].featlist.indexOf(i._id) > -1){
          actorData.data.stages[s].feats.push(i);
          if (i.data.featType === "feat") actorData.data.stages[s].numfeat += 1;
          else if (i.data.featType === "talent") actorData.data.stages[s].numtalent += 1;
          else if (i.data.featType === "rPower") actorData.data.stages[s].numrpower += 1;
          new_featlist.push(i._id);
        }
      }
      actorData.data.stages[s].featlist = new_featlist;
    }
    // Assign and return
    sheetData.gear = gear;
    sheetData.feats = feats;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isowner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
    html.find('.stage-create-cha').on('click', () => {
      this.actor.update({
          _id: this.actor.id,
          ['data.stages.' + randomID()]: {
              name: `人物阶级${this.actor.data.data.level.chara + 1}`,
              type: "chara",
              hit_dice: 8,
              featlist: [],
              numfeat: 0,
              numtalent: 0,
              numrpower: 0
          },
      }, {});
    });
    html.find('.stage-create-cla').on('click', () => {
      this.actor.update({
          _id: this.actor.id,
          ['data.stages.' + randomID()]: {
              name: `职业阶级${this.actor.data.data.level.train + 1}`,
              type: "train",
              hit_dice: 8,
              featlist: [],
              numfeat: 0,
              numtalent: 0,
              numrpower: 0
          },
      }, {});
    });
    html.find('.add-feat').on('click', (ev) => {
      const key = ev.currentTarget.dataset.actionKey;
    });
    html.find('.stage-delete').on('click', (ev) => {
      const key = ev.currentTarget.dataset.actionKey;
      for (let featid of this.actor.data.data.stages[key].featlist){
        const item = this.actor.items.get(featid);
        item.delete();
      }
      this.actor.update({
          _id: this.actor.id,
          'data.stages': {
              [`-=${key}`]: null,
          },
      }, {});
    });
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    let item = await Item.create(itemData, {parent: this.actor});
    
    if (typeof(event.currentTarget.dataset.actionKey)!="undefined" && event.currentTarget.dataset.type === "feat"){
      const featlist = this.actor.data.data.stages[event.currentTarget.dataset.actionKey].featlist;
      this.actor.update({
        _id: this.actor.id,
        [`data.stages.${event.currentTarget.dataset.actionKey}.featlist`]: featlist.concat(item._id)
      }, {});
    }
    return item;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

}
