import { calculateBonus } from "../bonus.js";
import { univareRoll } from "../roll.js";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class UnivareItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
   prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  prepareDerivedData(){
    let item = this;
    const id = this.data.data;                // Item system data
    if (this.actor && "data" in this.actor){
      const actor = this.actor;
      const ad = actor.data.data;
      if (item.type === 'skill') {
        if (id.isSaving){
          id.level = calculateBonus('l', id.proficiency, ad.level.chara, ad.level.train);
        }
        else {
          id.level = calculateBonus(id.proficiency, id.proficiency, ad.level.chara, ad.level.train);
        }
        if (ad.abilities.hasOwnProperty(id.attribute))
          id.basicBonus = ad.abilities[id.attribute].mod + id.level;
        else 
        id.basicBonus = id.level;
      }
      else if (item.type === "weapon"){
        let pre = actor.items.get(id.hit.pre);
        let proficiency = "";
        if (id.hit.lat === "ut" || id.hit.lat === "t" || id.hit.lat === "e" || id.hit.lat === "m" || id.hit.lat === "l" ){
          proficiency = id.hit.lat;
        }else {
          let lat = actor.items.get(id.hit.lat);
          if (lat) proficiency = lat.data.data.proficiency;
          else proficiency = "ut";
        }
        let attr = ad.abilities[id.hit.attr];
        if (pre){
          id.hit.bab = calculateBonus(pre.data.data.proficiency, proficiency, ad.level.chara, ad.level.train);
        }
        else id.hit.bab = 0;
        id.hit.ab = id.hit.bab + attr.mod;
      }
      else if (item.type === "tradition"){
        let skill = actor.items.get(id.skill);
        if (skill){
          id.level = skill.data.data.level;
        }
        else {
          id.level = 0;
        }
      }
    }
  }

  static chatListeners(html) {
    html.on('click', '.card-buttons button', this._onChatCardAction.bind(this));
    html.on('click', '.item-name', this._onChatCardToggleContent.bind(this));
  }

  
  /* -------------------------------------------- */

  /**
   * Handle execution of a chat card action via a click event on one of the card buttons
   * @param {Event} event       The originating click event
   * @returns {Promise}         A promise which resolves once the handler workflow is complete
   * @private
   */
   static async _onChatCardAction(event) {
    event.preventDefault();

    // Extract card data
    const button = event.currentTarget;
    button.disabled = true;
    const card = button.closest(".chat-card");
    const messageId = card.closest(".message").dataset.messageId;
    const message =  game.messages.get(messageId);
    const action = button.dataset.action;

    // Recover the actor for the chat card
    const actor = await this._getChatCardActor(card);
    if ( !actor ) return;

    // Get the Item from stored flag data or by the item ID on the Actor
    const storedData = message.getFlag("univare", "itemData");
    const item = storedData ? new this(storedData, {parent: actor}) : actor.items.get(card.dataset.itemId);
    if ( !item ) {
      return ui.notifications.error()
    }
    const spellLevel = parseInt(card.dataset.spellLevel) || null;

    // Handle different actions
    switch ( action ) {
      case "attack":
        await item.rollAttack({event}); break;
      case "damage":
        await item.rollDamage({event});
        break;
      case "check":
        await item.rollCheck({event}); break;
    }

    // Re-enable the button
    button.disabled = false;
  }

  /* -------------------------------------------- */

  /**
   * Handle toggling the visibility of chat card content when the name is clicked
   * @param {Event} event   The originating click event
   * @private
   */
  static _onChatCardToggleContent(event) {
    event.preventDefault();
    const header = event.currentTarget;
    const card = header.closest(".chat-card");
    const content = card.querySelector(".card-content");
    content.style.display = content.style.display === "none" ? "block" : "none";
  }

  /* -------------------------------------------- */

  /**
   * Get the Actor which is the author of a chat card
   * @param {HTMLElement} card    The chat card being used
   * @return {Actor|null}         The Actor entity or null
   * @private
   */
  static async _getChatCardActor(card) {

    // Case 1 - a synthetic actor from a Token
    if ( card.dataset.tokenId ) {
      const token = await fromUuid(card.dataset.tokenId);
      if ( !token ) return null;
      return token.actor;
    }

    // Case 2 - use Actor ID directory
    const actorId = card.dataset.actorId;
    return game.actors.get(actorId) || null;
  }

  async rollCheck(options={}) {
    const itemData = this.data.data;
    let title = `${this.name}`;

    // get the parts and rollData for this item's attack
    const rollData = this.getRollData();

    // Define Roll bonuses
    const parts = ["d20", "@basicBonus"];
    rollData["basicBonus"] = itemData.basicBonus;

    // Compose roll options
    const rollConfig = mergeObject({
      parts: parts,
      actor: this.actor,
      data: rollData,
      title: title,
      flavor: title,
      speaker: ChatMessage.getSpeaker({actor: this.actor}),
      dialogOptions: {
        width: 400,
        top: options.event ? options.event.clientY - 80 : null,
        left: window.innerWidth - 710
      }
    }, options);
    rollConfig.event = options.event;

    // Invoke the d20 roll helper
    const roll = await univareRoll(rollConfig);
    if ( roll === false ) return null;

    return roll;
  }

  async rollAttack(options={}) {
    const itemData = this.data.data;
    let title = `${this.name}`;

    // get the parts and rollData for this item's attack
    const rollData = this.getRollData();

    // Define Roll bonuses
    const parts = ["d20", "@ab"];
    rollData["ab"] = itemData.hit.ab;

    // Compose roll options
    const rollConfig = mergeObject({
      parts: parts,
      actor: this.actor,
      data: rollData,
      title: title,
      flavor: title,
      speaker: ChatMessage.getSpeaker({actor: this.actor}),
      dialogOptions: {
        width: 400,
        top: options.event ? options.event.clientY - 80 : null,
        left: window.innerWidth - 710
      }
    }, options);
    rollConfig.event = options.event;

    // Invoke the d20 roll helper
    const roll = await univareRoll(rollConfig);
    if ( roll === false ) return null;

    return roll;
  }

  /* -------------------------------------------- */

  /**
   * Place a damage roll using an item (weapon, feat, spell, or equipment)
   * Rely upon the damageRoll logic for the core implementation.
   * @param {MouseEvent} [event]    An event which triggered this roll, if any
   * @param {boolean} [critical]    Should damage be rolled as a critical hit?
   * @param {number} [spellLevel]   If the item is a spell, override the level for damage scaling
   * @param {boolean} [versatile]   If the item is a weapon, roll damage using the versatile formula
   * @param {object} [options]      Additional options passed to the damageRoll function
   * @return {Promise<Roll>}        A Promise which resolves to the created Roll instance
   */
  rollDamage(options={}) {
    if ( !this.data.data.hasDamage ) throw new Error("You may not make a Damage Roll with this Item.");
    const itemData = this.data.data;
    const actorData = this.actor.data.data;

    // Get roll data
    const parts = itemData.damage.parts.map(d => `${d[0]}`.replace(/([^+d]*d[^+d]+)/g, `$1[${d[1]}]`));
    const rollData = this.getRollData();
    const damageTypes = itemData.damage.parts.map(d => d[1]);
    // Configure the damage roll
    const title = `${this.name}`;
    const rollConfig = {
      actor: this.actor,
      data: rollData,
      event: options.event,
      fastForward: options.event ? options.event.shiftKey || options.event.altKey || options.event.ctrlKey || options.event.metaKey : false,
      parts: parts,
      title: title,
      flavor: damageTypes.length ? `${title} (${damageTypes})` : title,
      speaker: ChatMessage.getSpeaker({actor: this.actor}),
      dialogOptions: {
        width: 400,
        top: options.event ? options.event.clientY - 80 : null,
        left: window.innerWidth - 710
      }
    };

    // Call the roll helper utility
    return univareRoll(mergeObject(rollConfig));
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
   getRollData() {
    // If present, return the actor's roll data.
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.data.data);

    return rollData;
  }

  getChatData(htmlOptions={}) {
    const data = foundry.utils.deepClone(this.data.data);
    const labels = this.labels;

    // Rich text description
    data.description = TextEditor.enrichHTML(data.description, htmlOptions);

    // Item type specific properties
    const props = [];
    const fn = this[`_${this.data.type}ChatData`];
    if ( fn ) fn.bind(this)(data, labels, props);

    // Filter properties and return
    data.properties = props.filter(p => !!p);
    return data;
  }

  async roll({configureDialog=true, rollMode, createMessage=true}={}) {
    let item = this;
    const id = this.data.data;                // Item system data
    const actor = this.actor;
    const ad = actor.data.data;               // Actor system data

    // Create or return the Chat Message data
    return item.displayCard({rollMode, createMessage});
  }

  async displayCard({rollMode, createMessage=true}={}) {

    // Render the chat card template
    const token = this.actor.token;
    let type = "";
    if (this.data.type === "feat"){
      type = this.data.data.featType;
      if (type === "talent") type ="天赋"
      else if (type === "rPower") type ="族裔专长"
      else if (type === "feat") type ="职业专长"
      else if (type === "race") type ="种族"
      else if (type === "heritage") type ="遗传"
      else if (type === "origin") type ="起源"
    } else if (this.data.type === "weapon"){
      type = "武器";
    } else if (this.data.type === "spell"){
      type = "法术" + this.data.data.level;
    } else if (this.data.type === "armor"){
      type = "护甲";
    } else if (this.data.type === "equipment"){
      type = "穿戴品";
    } else if (this.data.type === "gear"){
      type = "物品";
    } else if (this.data.type === "soulment"){
      type = "源纱";
    } else if (this.data.type === "maneuver"){
      type = "武技";
    } else if (this.data.type === "package" || this.data.type === "skill"){
      type = this.data.data.proficiency;
      if (type === "ut") type ="未受训"
      else if (type === "t") type ="受训"
      else if (type === "e") type ="专家"
      else if (type === "l") type ="传奇"
      else if (type === "m") type ="大师"
    }
    
    const templateData = {
      actor: this.actor,
      tokenId: token?.uuid || null,
      item: this.data,
      data: this.getChatData(),
      hasAttack: this.data.data.hasAttack,
      hasCheck: "basicBonus" in this.data.data,
      isSkill: this.data.type === "skill",
      hasDamage: this.data.data.hasDamage,
      type: type
    };
    const html = await renderTemplate("systems/univare/templates/chat/item-card.html", templateData);

    // Create the ChatMessage data object
    const chatData = {
      user: game.user._id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      flavor: this.data.data.chatFlavor || this.name,
      speaker: ChatMessage.getSpeaker({actor: this.actor, token})
    };

    // Apply the roll mode to adjust message visibility
    ChatMessage.applyRollMode(chatData, rollMode || game.settings.get("core", "rollMode"));

    // Create the Chat Message or return its data
    return createMessage ? ChatMessage.create(chatData) : chatData;
  }
}

