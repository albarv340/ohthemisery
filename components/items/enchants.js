import styles from '../../styles/Items.module.css'
import enchantmentsData from '../../public/items/enchantmentsData.json'
import StatFormatter from '../../utils/items/statFormatter'

const otherCurses = ["Shrapnel", "Crippling", "Anemia", "Irreparability"]



export default function Enchants(data) {
    const enchantmentTypes = ["Specialist Enchants", "Protection", "Melee Enchants", "Ranged Enchants", "Tool Enchants", "Water", "Misc.", "Epic Enchants", "Durability", "Curses", "Speed Enchants", "Health", "Weapon Base Stats", "Armor Attribrutes"]
    let formattedStats = StatFormatter.formatStats(data.item.stats);

    return (
        <div className={styles.enchants}>
            {formattedStats}
        </div>
    )
}