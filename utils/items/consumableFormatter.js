import styles from '../../styles/Items.module.css';

class ConsumableFormatter {
    static convertTime(ticks) {
        let seconds = (ticks / 20) % 60;
        let minutes = Math.floor(ticks / (20 * 60));
        return `${minutes}:${(seconds < 10) ? `0${seconds}` : seconds}`;
    }

    static toHumanReadable(effect) {
        let splitName = effect.EffectType.split(/(?=[A-Z])/).join(" ");
        splitName = splitName.replace("Percent", "").replace("Increase", "").replace(/Resist$/, "Resistance").trim();

        if (splitName == "Vanilla Fire Res") return `Fire Immunity`;
        if (splitName == "Regeneration") return `Regeneration ${effect.EffectStrength}`;
        if (splitName == "Haste") return `Haste ${effect.EffectStrength}`;

        return `${(effect.EffectStrength < 0) ? "-" : "+"}${effect.EffectStrength * 100}% ${splitName}`;
    }

    static statStyle(effect) {
        return (effect.EffectStrength < 0) ? "negativeCharm" : "positiveCharm";
    }

    static shouldTimeBeVisible(effectType) {
        return !(effectType.toLowerCase().includes("instant"));
    }

    static formatEffects(consumableEffects) {
        let formattedEffects = [];

        for (const effect of consumableEffects) {
            formattedEffects.push(<span className={styles[this.statStyle(effect)]}
                key={effect.EffectType}>{this.toHumanReadable(effect)} {(this.shouldTimeBeVisible(effect.EffectType)) ? <span className={styles.infoText}>{`(${this.convertTime(effect.EffectDuration)})`}</span> : ""}</span>);
        }

        return formattedEffects;
    }
}

module.exports = ConsumableFormatter;