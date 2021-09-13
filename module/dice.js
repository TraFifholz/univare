export default class UnivareRoll extends Roll {
    constructor(formula, data, options) {
      super(formula, data, options);
      // For backwards compatibility, skip rolls which do not have the "critical" option defined
      if ( this.options.critical !== undefined ) this.configureDamage();
    }
  
    /**
     * The HTML template path used to configure evaluation of this Roll
     * @type {string}
     */
    static EVALUATION_TEMPLATE = "systems/univare/templates/chat/roll-dialog.html";
  
    /* -------------------------------------------- */
  
    /**
     * A convenience reference for whether this DamageRoll is a critical hit
     * @type {boolean}
     */
    get isCritical() {
      return this.options.critical;
    }
  
    /* -------------------------------------------- */
    /*  Damage Roll Methods                         */
    /* -------------------------------------------- */
  
    /**
     * Apply optional modifiers which customize the behavior of the d20term
     * @private
     */
    configureDamage() {
      let flatBonus = 0;
  
      // Re-compile the underlying formula
      this._formula = this.constructor.getFormula(this.terms);
    }
  
    /* -------------------------------------------- */
  
    /* -------------------------------------------- */
    /*  Configuration Dialog                        */
    /* -------------------------------------------- */
  
    /**
     * Create a Dialog prompt used to configure evaluation of an existing D20Roll instance.
     * @param {object} data                     Dialog configuration data
     * @param {string} [data.title]               The title of the shown dialog window
     * @param {number} [data.defaultRollMode]     The roll mode that the roll mode select element should default to
     * @param {string} [data.defaultCritical]     Should critical be selected as default
     * @param {string} [data.template]            A custom path to an HTML template to use instead of the default
     * @param {boolean} [data.allowCritical=true] Allow critical hit to be chosen as a possible damage mode
     * @param {object} options                  Additional Dialog customization options
     * @returns {Promise<D20Roll|null>}         A resulting D20Roll object constructed with the dialog, or null if the dialog was closed
     */
    async configureDialog({title, defaultRollMode, defaultCritical=false, template, allowCritical=true}={}, options={}) {
  
      // Render the Dialog inner HTML
      const content = await renderTemplate(template ?? this.constructor.EVALUATION_TEMPLATE, {
        formula: `${this.formula} + @bonus`,
        defaultRollMode,
        rollModes: CONFIG.Dice.rollModes,
      });
  
      // Create the Dialog window and await submission of the form
      return new Promise(resolve => {
        new Dialog({
          title,
          content,
          buttons: {
            normal: {
              label: game.i18n.localize("检定"),
              callback: html => resolve(this._onDialogSubmit(html, false))
            }
          },
          default: defaultCritical ? "critical" : "normal",
          close: () => resolve(null)
        }, options).render(true);
      });
    }
  
    /* -------------------------------------------- */
  
    /**
     * Handle submission of the Roll evaluation configuration Dialog
     * @param {jQuery} html             The submitted dialog content
     * @param {boolean} isCritical      Is the damage a critical hit?
     * @private
     */
    _onDialogSubmit(html, isCritical) {
      const form = html[0].querySelector("form");
  
      // Append a situational bonus term
      if ( form.bonus.value ) {
        const bonus = new Roll(form.bonus.value, this.data);
        if ( !(bonus.terms[0] instanceof OperatorTerm) ) this.terms.push(new OperatorTerm({operator: "+"}));
        this.terms = this.terms.concat(bonus.terms);
      }
  
      // Apply advantage or disadvantage
      this.options.critical = isCritical;
      this.options.rollMode = form.rollMode.value;
      this.configureDamage();
      return this;
    }

    toMessage(messageData={}, options={}) {
        messageData.flavor = messageData.flavor || this.options.flavor;
        options.rollMode = options.rollMode ?? this.options.rollMode;
        return super.toMessage(messageData, options);
      }
    /* -------------------------------------------- */
  
    /** @inheritdoc */
    static fromData(data) {
      const roll = super.fromData(data);
      roll._formula = this.getFormula(roll.terms);
      return roll;
    }
  }