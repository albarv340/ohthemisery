import SelectInput from './selectInput'
import CheckboxWithLabel from './checkboxWithLabel'
import styles from '../../styles/Items.module.css'
import React from 'react'

const sortableStats = ["-", "Abyssal", "Adaptability", "Adrenaline", "Agility", "Anemia", "Aptitude", "Aqua Affinity", "Arcane Thrust", "Armor", "Ashes of Eternity", "Attack Damage", "Attack Speed", "Attack Speed %", "Base Attack Damage", "Base Attack Speed", "Base Proj Damage", "Base Proj Speed", "Base Spell Power", "Base Throw Rate", "Blast Prot.", "Bleeding", "Chaotic", "Corruption", "Crippling", "Darksight", "Decay", "Depth Strider", "Duelist", "Efficiency", "Eruption", "Ethereal ", "Evasion", "Feather Falling", "Fire Aspect (M)", "Fire Aspect (P)", "Fire Prot.", "Fortune", "Gills", "Hex Eater", "Ice Aspect (M)", "Ice Aspect (P)", "Ineptitude", "Inferno", "Infinity (bow)", "Infinity (tool)", "Intuition", "Inure", "Irreparability", "Knockback", "Knockback Res.", "Life Drain", "Looting", "Lure", "Magic Damage", "Magic Prot.", "Max Health", "Max Health %", "Melee Prot.", "Mending", "Multishot", "Multitool", "Persistence", "Piercing", "Point Blank", "Poise", "Proj Damage", "Proj Speed", "Projectile Prot.", "Protection of the Depths", "Punch", "Quake", "Quick Charge", "Radiant", "Rage of the Keter", "Recoil", "Reflexes ", "Regen", "Regicide", "Respiration", "Resurrection", "Retrieval", "Riptide", "Sapper", "Second Wind", "Shielding", "Shrapnel", "Silk Touch", "Slayer", "Smite", "Sniper", "Soul Speed", "Speed", "Speed %", "Steadfast", "Sustenance", "Sweeping Edge", "Tempo ", "Thorns", "Thorns Damage", "Thunder Aspect (M)", "Thunder Aspect (P)", "Triage", "Two Handed", "Unbreakable", "Unbreaking", "Vanishing", "Void Tether", "Weightless"]
const regions = ["Any Region", "Isles", "Valley"]
const tiers = ['Any Tier', 'Epic', 'Artifact', 'Uncommon', 'Rare', 'Unique', 'Patron', 'Event', 'Tier 5', 'Tier 4', 'Tier 3', 'Tier 2', 'Tier 1', 'Tier 0']
const locations = ["Any Location", "Isles Delves", "Hekawt", "Eldrask", "Depths", "Remorse", "Mist", "Horseman", "Rush", "Delves", "Carnival", "Docks", "TOV", "Forum", "Shifting", "Teal", "Purple", "Cyan", "Light Gray", "Gray", "Pink", "Lime", "Isles Casino", "Isles Overworld", "Celsian Isles", "Valley Delves", "Armory", "Kaul", "Azacor", "Verdant", "Sanctum", "Corridors", "Reverie", "Lowtide Smuggler", "Willows", "Yellow", "Light Blue", "Magenta", "Orange", "White", "Labs", "Valley Casino", "Valley Overworld", "King's Valley"]

function getResetKey(name) {
    return name + new Date()
}

export default function SearchForm({ update }) {
    const [searchKey, setSearchKey] = React.useState(getResetKey("search"))
    const [regionKey, setRegionKey] = React.useState(getResetKey("region"))
    const [tierKey, setTierKey] = React.useState(getResetKey("tier"))
    const [locationKey, setLocationKey] = React.useState(getResetKey("location"))
    const form = React.useRef()

    function sendUpdate(event = {}) {
        if (event.type === "submit") {
            event.preventDefault()
        }
        update(Object.fromEntries(new FormData(form.current).entries()));
    }

    function resetForm() {
        // Giving a new key to an element recreates it from scratch. It is used as a workaround to reset a component that doesn't reset on its own
        setSearchKey(getResetKey("search"))
        setRegionKey(getResetKey("region"))
        setTierKey(getResetKey("tier"))
        setLocationKey(getResetKey("location"))
    }

    function disableRightClick(event) {
        event.preventDefault()
    }

    function uncheckOthers(event) {
        if (event.button == 2) {
            // Selects the checkbox given that you clicked the label or checkbox
            let interestingElement = event.target.parentElement.firstChild;
            if (interestingElement.type != "checkbox") {
                interestingElement = event.target.firstChild;
            }
            if (interestingElement && interestingElement.type == "checkbox") {
                event.preventDefault()
                interestingElement.checked = true;
                for (const group of interestingElement.parentElement.parentElement.parentElement.children) {
                    for (const checkboxHolder of group.children) {
                        if (checkboxHolder.firstChild.id != interestingElement.id) {
                            checkboxHolder.firstChild.checked = false;
                        }
                    }
                }
            }
        }
    }

    return (
        <form onSubmit={sendUpdate} onReset={resetForm} onMouseDown={uncheckOthers} onContextMenu={disableRightClick} ref={form} className={styles.searchForm}>
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
            <div className={styles.flex}>
                <span>Sort By:</span>
                <SelectInput key={searchKey} name="sortSelect" sortableStats={sortableStats} />
            </div>
            <div className={styles.flex}>
                <span>Region:</span>
                <SelectInput key={regionKey} name="regionSelect" sortableStats={regions} />
            </div>
            <div className={styles.flex}>
                <span>Tier:</span>
                <SelectInput key={tierKey} name="tierSelect" sortableStats={tiers} />
            </div>
            <div className={styles.flex}>
                <span>Location:</span>
                <SelectInput key={locationKey} name="locationSelect" sortableStats={locations} />
            </div>
            <span>Search:</span>
            <input type="text" name="search" placeholder="Search" />
            <div>
                <input className={styles.submitButton} type="submit" />
                <input className={styles.warningButton} type="reset" />
            </div>
        </form>
    )
}