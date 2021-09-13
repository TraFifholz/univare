
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class UnivareActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["univare", "sheet", "actor"],
      width: 690,
      height: 710,
      scrollY: [".items-list"],
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
    const feats = [];
    const saving = [];
    const skill = [];
    const packages = [];
    const weapons = [];
    const armors = [];
    const equipments = [];
    const gears = [];
    const soulments = [];
    const spells = [];
    const traditions = [];
    const maneuvers = [];

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of sheetData.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to features.
      if (i.type === 'feat') {
        feats.push(i);
      }
      else if (i.type === 'skill') {
        if (i.data.isSaving){
          saving.push(i);
        }
        else {
          skill.push(i);
        }
      }
      else if (i.type === 'package') {
        packages.push(i);
      }
      else if (i.type === "weapon") {
        weapons.push(i);
      }
      else if (i.type === "armor") {
        armors.push(i);
      }
      else if (i.type === "equipment"){
        equipments.push(i);
      }
      else if (i.type === "gear"){
        gears.push(i);
      }
      else if (i.type === "soulment"){
        soulments.push(i);
      }
      else if (i.type === "spell"){
        spells.push(i);
      }
      else if (i.type === "tradition"){
        traditions.push(i);
      }
      else if (i.type === "maneuver"){
        maneuvers.push(i);
      }
    }

    packages.sort((a, b) => (a.data.type.localeCompare(b.data.type,'zh-CN')))

    for (let s in actorData.data.stages) {
      actorData.data.stages[s].feats = [];
    }
    const noneStageFeats = [];
    for (let i of feats){
      if (i.data.stage && (i.data.stage in actorData.data.stages)){
        actorData.data.stages[i.data.stage].feats.push(i);
      }
      else {
        noneStageFeats.push(i);
      }
    }

    // Assign and return
    sheetData.gears = gears;
    sheetData.weapons = weapons;
    sheetData.armors = armors;
    sheetData.equipments = equipments;
    sheetData.skills = skill;
    sheetData.savings = saving;
    sheetData.packages = packages;
    sheetData.soulments = soulments;
    sheetData.spells = spells;
    sheetData.traditions = traditions;
    sheetData.maneuvers = maneuvers;
    sheetData.noneStageFeats = noneStageFeats;
    actorData.data.attributes.ac.total = actorData.data.attributes.ac.refAC.total + actorData.data.attributes.ac.armorAC.total + actorData.data.attributes.ac.base;
    actorData.data.attributes.ac.touch = actorData.data.attributes.ac.refAC.total + actorData.data.attributes.ac.base;
    actorData.data.attributes.ac.ff = actorData.data.attributes.ac.armorAC.total + actorData.data.attributes.ac.base;
    console.log(sheetData);
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
    html.find('.rollSkill').click(ev => {
      const element = ev.currentTarget;
      const skill = element.parentElement.dataset.itemId;
    });
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
    html.find('.stage-delete').on('click', (ev) => {
      const key = ev.currentTarget.dataset.actionKey;
      for (let featid of this.actor.data.data.stages[key].featlist){
        const item = this.actor.items.get(featid);
        if (item) item.delete();
      }
      this.actor.update({
          _id: this.actor.id,
          'data.stages': {
              [`-=${key}`]: null,
          },
      }, {});
    });
    html.find('.item .item-name.rollable h4').click(event => this._onItemSummary(event));
    html.find('.resource-create').on('click', (ev) => {
      this.actor.update({
        _id: this.actor.id,
        ['data.resources.' + randomID()]: {
            name: `资源`,
            max: 0,
            value: 0
        },
    }, {});
    });
    html.find('.resource_delete').on('click', (ev) => {
      const key = ev.currentTarget.dataset.actionKey;
      this.actor.update({
          _id: this.actor.id,
          'data.resources': {
              [`-=${key}`]: null,
          },
      }, {});
    });
    html.find('.item .item-image').click(event => this._onItemRoll(event));
  }

  _onItemRoll(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    return item.roll();
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
      item.update({
        _id: item.id,
        [`data.stage`]: event.currentTarget.dataset.actionKey
      }, {});
    }
    if (header.dataset.itemId === "saving"){
      item.update({
        _id: item.id,
        [`data.isSaving`]: true
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
      let label = dataset.label ? `${dataset.label}检定` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  _onItemSummary(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".item"),
        item = this.actor.items.get(li.data("item-id")),
        chatData = item.getChatData({secrets: this.actor.isOwner});

    // Toggle summary
    if ( li.hasClass("expanded") ) {
      let summary = li.children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    } else {
      let div = $(`<div class="item-summary">${chatData.description}</div>`);
      let props = $(`<div class="item-properties"></div>`);
      chatData.tags.forEach(p => props.append(`<span class="tag">${p}</span>`));
      div.append(props);
      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass("expanded");
  }
}
