import styles from '../../styles/Items.module.css'
import enchantmentsData from '../../public/items/enchantmentsData.json'

const Formats = {
    "ENCHANT": 0,
    "SINGLE_ENCHANT": 1,
    "ATTRIBUTE": 2,
    "CURSE": 3,
    "SINGLE_CURSE": 4,
    "BASE_STAT": 5
}

const categories = {
    "speed": [
        ...["adrenaline", "soul_speed"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["speed_flat", "speed_percent"]
            .map(entry => ({ name: entry, format: Formats.ATTRIBUTE })),
        ...["crippling"]
            .map(entry => ({ name: entry, format: Formats.CURSE }))
    ],
    "melee": [
        ...["ice_aspect_m", "fire_aspect_m", "thunder_aspect_m", "sweeping_edge",
            "knockback", "quake", "smite", "slayer", "duelist", "chaotic", "hex_eater",
            "decay", "bleeding"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT }))
    ],
    "misc": [
        ...["second_wind", "inferno", "regicide", "aptitude", "triage"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["intuition", "weightless", "radiant", "darksight", "void_tether", "resurrection"]
            .map(entry => ({ name: entry, format: Formats.SINGLE_ENCHANT }))
    ],
    "prot": [
        ...["projectile_prot", "blast_prot", "fire_prot", "melee_prot", "magic_prot",
            "feather_falling"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT }))
    ],
    "attributes": [
        ...["knockback_resistance_flat", "attack_damage_percent", "attack_speed_flat",
            "attack_speed_percent", "magic_damage_percent", "projectile_damage_percent",
            "projectile_speed_percent", "thorns_flat", "thorns_percent", "throw_rate_percent"]
            .map(entry => ({ name: entry, format: Formats.ATTRIBUTE }))
    ],
    "health": [
        ...["regen", "life_drain", "sustenance"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["max_health_flat", "max_health_percent"]
            .map(entry => ({ name: entry, format: Formats.ATTRIBUTE })),
        ...["anemia"]
            .map(entry => ({ name: entry, format: Formats.CURSE }))
    ],
    "tool": [
        ...["efficiency", "eruption", "sapper", "multitool", "fortune", "lure"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["silk_touch", "infinity_tool", "jungle_s_nourishment"]
            .map(entry => ({ name: entry, format: Formats.SINGLE_ENCHANT }))
    ],
    "epic": [
        ...["arcane_thrust"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["ashes_of_eternity", "rage_of_the_keter", "protection_of_the_depths"]
            .map(entry => ({ name: entry, format: Formats.SINGLE_ENCHANT }))
    ],
    "ranged": [
        ...["quick_charge", "point_blank", "sniper", "multishot", "piercing", "retrieval",
            "punch", "ice_aspect_p", "fire_aspect_p", "thunder_aspect_p", "recoil"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["infinity_bow"]
            .map(entry => ({ name: entry, format: Formats.SINGLE_ENCHANT }))
    ],
    "specialist": [
        ...["shielding", "poise", "inure", "steadfast", "ethereal", "reflexes", "evasion", "tempo"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["adaptability"]
            .map(entry => ({ name: entry, format: Formats.SINGLE_ENCHANT }))
    ],
    "other_curse": [
        ...["ineptitude", "shrapnel", "vanishing"]
            .map(entry => ({ name: entry, format: Formats.CURSE })),
        ...["two_handed", "corruption", "irreparability"]
            .map(entry => ({ name: entry, format: Formats.SINGLE_CURSE }))
    ],
    "water": [
        ...["depth_strider", "abyssal", "respiration", "riptide"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["gills", "aqua_affinity"]
            .map(entry => ({ name: entry, format: Formats.SINGLE_ENCHANT }))
    ],
    "durability": [
        ...["unbreaking"]
            .map(entry => ({ name: entry, format: Formats.ENCHANT })),
        ...["unbreakable", "mending"]
            .map(entry => ({ name: entry, format: Formats.SINGLE_ENCHANT }))
    ],
    "defense": [
        { name: "armor", format: Formats.ATTRIBUTE },
        { name: "agility", format: Formats.ATTRIBUTE }
    ],
    "base_stats": [
        ...["spell_power_base"]
            .map(entry => ({ name: entry, format: Formats.ATTRIBUTE })),
        ...["attack_damage_base", "attack_speed_base", "projectile_damage_base", "projectile_speed_base", "throw_rate_base"]
            .map(entry => ({ name: entry, format: Formats.BASE_STAT }))
    ]
}

class StatFormatter {
    static camelCase(str) {
        if (!str) return "";
        return str.replaceAll("_", " ").replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index == 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/[\s+ ]/g, '');
    }

    static toHumanReadable(stat, value) {
        let humanStr = stat.name.split("_")
            .filter(part => (part != "m" && part != "p" && part != "bow" && part != "tool"))
            .map(part => part[0].toUpperCase() + part.substring(1))
            .join(" ")
            .replaceAll("Prot", "Protection")
            .replaceAll("Protectionection", "Protection")
            .replaceAll("Regen", "Regeneration")
            .replace("Jungle S Nourishment", "Jungle's Nourishment");
        switch (stat.format) {
            case Formats.ENCHANT: {
                humanStr = `${humanStr} ${value}`;
                break;
            }
            case Formats.SINGLE_ENCHANT: {
                // The level should not be displayed. humanStr is already good to go.
                break;
            }
            case Formats.ATTRIBUTE: {
                humanStr = `${(value > 0) ? "+" : ""}${value}${(humanStr.includes(" Percent") || humanStr == "Spell Power Base") ? "%" : ""} ${humanStr.replace(" Percent", "").replace(" Base", "").replace(" Flat", "")}`;
                break;
            }
            case Formats.CURSE: {
                humanStr = `Curse of ${humanStr} ${value}`;
                break;
            }
            case Formats.SINGLE_CURSE: {
                humanStr = (humanStr != "Two Handed") ? `Curse of ${humanStr}` : humanStr;
                break;
            }
            case Formats.BASE_STAT: {
                humanStr = `${value} ${humanStr.replace(" Base", "")}`;
                break;
            }
        }
        return humanStr;
    }

    static statStyle(stat, value, type) {
        switch (stat.format) {
            case Formats.ATTRIBUTE: {
                return (value < 0) ? "negativeStat" : (stat.name == "armor" || stat.name == "agility") ? "positiveDefence" : "positiveStat";
            }
            case Formats.CURSE:
            case Formats.SINGLE_CURSE: {
                return "negativeStat";
            }
            case Formats.BASE_STAT: {
                return "baseStats";
            }
            default: {
                return "none";
            }
        }
    }

    static formatStats(stats) {
        let formattedStats = [];

        for (const category in categories) {
            for (const stat of categories[category]) {
                if (stats[stat.name]) {
                    formattedStats.push(<span className={styles[this.statStyle(stat, stats[stat.name], category)]} title={enchantmentsData[stat.name]} key={stat.name}>{this.toHumanReadable(stat, stats[stat.name])}</span>);
                }
            }
        }

        return formattedStats;
    }
}

module.exports = StatFormatter;