import styles from '../../styles/Items.module.css'
import enchantmentsData from '../../public/items/enchantmentsData.json'

const otherCurses = ["Shrapnel", "Crippling", "Anemia", "Irreparability"]

function camelCase(str) {
    if (!str) return "";
    return str.replaceAll('\'', '').replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

function enchantStyle(ench, type) {
    if (ench[0] == "-" || otherCurses.includes(ench.replaceAll(/[^A-Za-z ]/g, "").trim())) {
        return "negativeStat"
    }
    if (ench[0] == "+") {
        return "positiveStat"
    }
    return camelCase(type)
}

function enchantTitle(ench, type) {
    return `${enchantmentsData[(type == "Curses" || otherCurses.includes(ench.replaceAll(/[^A-Za-z ]/g, "").trim()) ? "Curse of " : "") + ench.replaceAll(/[^A-Za-z ]/g, "").replaceAll("Prot", "Protection").replaceAll("Regen", "Regeneration").trim()] || ""}`
}

export default function Enchants(data) {
    const enchantmentTypes = ["Specialist Enchants", "Protection", "Melee Enchants", "Ranged Enchants", "Tool Enchants", "Water", "Misc.", "Epic Enchants", "Durability", "Curses", "Speed Enchants", "Health", "Weapon Base Stats", "Armor Attribrutes"]
    const item = data.item
    let enchants = []
    for (const type of enchantmentTypes) {
        const enchant = item[type]
        if (enchant == "" || typeof (enchant) == "undefined") continue;
        if (enchant.constructor === Array) {
            for (const ench of enchant) {
                enchants.push(<span title={enchantTitle(ench, type)} className={styles[enchantStyle(ench, type)]} key={ench}>{ench}</span>)
            }
        } else {
            enchants.push(<span title={enchantTitle(enchant, type)} className={styles[enchantStyle(enchant, type)]} key={enchant}>{enchant}</span>)
        }
    }
    if (item["Void Tether"]) {
        enchants.push(<span title={enchantTitle("Void Tether", "Misc.")} key={"Void Tether"}>Void Tether</span>)
    }
    if (item["Resurrection"]) {
        enchants.push(<span title={enchantTitle("Resurrection", "Misc.")} key={"Resurrection"}>Resurrection</span>)
    }
    return (
        <div className={styles.enchants}>
            {enchants}
        </div>
    )
}