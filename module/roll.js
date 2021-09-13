export {default as UnivareRoll} from "./dice.js";

export async function univareRoll({
    parts=[], data, // Roll creation
    critical=false, criticalBonusDice, criticalMultiplier, multiplyNumeric, powerfulCritical, // Damage customization
    fastForward=false, event, allowCritical=true, template, title, dialogOptions, // Dialog configuration
    chatMessage=true, messageData={}, rollMode, speaker, flavor, // Chat Message customization
    }={}) {
  
    // Handle input arguments
    const defaultRollMode = rollMode || game.settings.get("core", "rollMode");
  
    // Construct the DamageRoll instance
    const formula = parts.join(" + ");
    const {isCritical, isFF} = _determineCriticalMode({critical, fastForward, event});
    const roll = new CONFIG.Dice.UnivareRoll(formula, data, {
      flavor: flavor || title,
      critical: isCritical,
      criticalBonusDice,
      criticalMultiplier,
      multiplyNumeric,
      powerfulCritical
    });
  
    // Prompt a Dialog to further configure the DamageRoll
    if ( !isFF ) {
      const configured = await roll.configureDialog({
        title,
        defaultRollMode: defaultRollMode,
        defaultCritical: isCritical,
        template,
        allowCritical
      }, dialogOptions);
      if ( configured === null ) return null;
    }
  
    // Evaluate the configured roll
    await roll.evaluate({async: true});
  
    // Create a Chat Message
    if ( speaker ) {
      console.warn(`You are passing the speaker argument to the damageRoll function directly which should instead be passed as an internal key of messageData`);
      messageData.speaker = speaker;
    }
    if ( roll && chatMessage ) await roll.toMessage(messageData);
    return roll;
  }
  
  /* -------------------------------------------- */
  
  /**
   * Determines whether this d20 roll should be fast-forwarded, and whether advantage or disadvantage should be applied
   * @returns {{isFF: boolean, isCritical: boolean}}  Whether the roll is fast-forward, and whether it is a critical hit
   */
  function _determineCriticalMode({event, critical=false, fastForward=false}={}) {
    const isFF = fastForward || (event && (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey));
    if ( event?.altKey ) critical = true;
    return {isFF, isCritical: critical};
  }

