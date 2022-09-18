import SelectInput from './selectInput'
import CheckboxWithLabel from './checkboxWithLabel'
import styles from '../../styles/Items.module.css'

const sortableStats = ["-", "Abyssal", "Adaptability", "Adrenaline", "Agility", "Anemia", "Aptitude", "Aqua Affinity", "Arcane Thrust", "Armor", "Ashes of Eternity", "Attack Damage", "Attack Speed", "Attack Speed %", "Base Attack Damage", "Base Attack Speed", "Base Proj Damage", "Base Proj Speed", "Base Spell Power", "Base Throw Rate", "Blast Prot.", "Bleeding", "Chaotic", "Corruption", "Crippling", "Darksight", "Decay", "Depth Strider", "Duelist", "Efficiency", "Eruption", "Ethereal ", "Evasion", "Feather Falling", "Fire Aspect (M)", "Fire Aspect (P)", "Fire Prot.", "Fortune", "Gills", "Hex Eater", "Ice Aspect (M)", "Ice Aspect (P)", "Ineptitude", "Inferno", "Infinity (bow)", "Infinity (tool)", "Intuition", "Inure", "Irreparability", "Knockback", "Knockback Res.", "Life Drain", "Looting", "Lure", "Magic Damage", "Magic Prot.", "Max Health", "Max Health %", "Melee Prot.", "Mending", "Multishot", "Multitool", "Persistence", "Piercing", "Point Blank", "Poise", "Proj Damage", "Proj Speed", "Projectile Prot.", "Protection of the Depths", "Punch", "Quake", "Quick Charge", "Radiant", "Rage of the Keter", "Recoil", "Reflexes ", "Regen", "Regicide", "Respiration", "Resurrection", "Retrieval", "Riptide", "Sapper", "Second Wind", "Shielding", "Shrapnel", "Silk Touch", "Slayer", "Smite", "Sniper", "Soul Speed", "Speed", "Speed %", "Steadfast", "Sustenance", "Sweeping Edge", "Tempo ", "Thorns", "Thorns Damage", "Thunder Aspect (M)", "Thunder Aspect (P)", "Triage", "Two Handed", "Unbreakable", "Unbreaking", "Vanishing", "Void Tether", "Weightless"]

export default function SearchForm({ update }) {
    function sendUpdate(event) {
        event.preventDefault()
        update(Object.fromEntries(new FormData(event.target).entries()));
    }

    return (
        <form onSubmit={sendUpdate} className={styles.searchForm}>
            <div className={styles.checkboxes}>
                <div className={styles.checkboxSubgroup}>
                    <CheckboxWithLabel name="Helmet" checked={true} />
                    <CheckboxWithLabel name="Chestplate" checked={true} />
                    <CheckboxWithLabel name="Leggings" checked={true} />
                    <CheckboxWithLabel name="Boots" checked={true} />
                </div>
                <div className={styles.checkboxSubgroup}>
                    <CheckboxWithLabel name="Axe" checked={true} />
                    <CheckboxWithLabel name="Wand" checked={true} />
                    <CheckboxWithLabel name="Sword" checked={true} />
                    <CheckboxWithLabel name="Scythe" checked={true} />
                    <CheckboxWithLabel name="Pickaxe" checked={true} />
                    <CheckboxWithLabel name="Shovel" checked={true} />
                </div>
                <div className={styles.checkboxSubgroup}>
                    <CheckboxWithLabel name="Bow" checked={true} />
                    <CheckboxWithLabel name="Crossbow" checked={true} />
                    <CheckboxWithLabel name="Throwable" checked={true} />
                    <CheckboxWithLabel name="Trident" checked={true} />
                </div>
                <div className={styles.checkboxSubgroup}>
                    <CheckboxWithLabel name="Offhand Shield" checked={true} />
                    <CheckboxWithLabel name="Offhand" checked={true} />
                    <CheckboxWithLabel name="Offhand Sword" checked={true} />
                </div>
                <div className={styles.checkboxSubgroup}>
                    <CheckboxWithLabel name="Mainhand" checked={true} />
                    <CheckboxWithLabel name="Consumable" checked={true} />
                    <CheckboxWithLabel name="Misc" checked={true} />
                </div>
            </div>
            <span>Sort By:</span>
            <SelectInput name="sortSelect" sortableStats={sortableStats} />
            <input type="text" name="search" placeholder="Search" />
            <div>
                <input className={styles.submitButton} type="submit" />
                <input className={styles.warningButton} type="reset" />
            </div>
        </form>
    )
}