import SelectInput from './selectInput'
import CheckboxWithLabel from './checkboxWithLabel'
import styles from '../../styles/Items.module.css'
import React from 'react'
import TranslatableText from '../translatableText'

const sortableStats = ["-", "Abyssal", "Adaptability", "Adrenaline", "Agility", "Anemia", "Aptitude", "Aqua Affinity", "Arcane Thrust", "Armor",
    "Ashes of Eternity", "Attack Damage Percent", "Attack Speed Flat", "Attack Speed Percent", "Attack Damage Base", "Attack Speed Base",
    "Projectile Damage Base", "Projectile Speed Base", "Spell Power Base", "Throw Rate Base", "Throw Rate Percent", "Blast Prot", "Bleeding",
    "Chaotic", "Corruption", "Crippling", "Darksight", "Decay", "Depth Strider", "Duelist", "Efficiency", "Eruption", "Ethereal", "Evasion",
    "Feather Falling", "Fire Aspect M", "Fire Aspect P", "Fire Prot", "Fortune", "Gills", "Hex Eater", "Ice Aspect M", "Ice Aspect P", "Ineptitude",
    "Inferno", "Infinity Bow", "Infinity Tool", "Intuition", "Inure", "Irreparability", "Knockback", "Knockback Resistance Flat", "Life Drain",
    "Looting", "Lure", "Magic Damage Percent", "Magic Prot", "Max Health Flat", "Max Health Percent", "Melee Prot", "Mending", "Multishot",
    "Multitool", "Piercing", "Point Blank", "Poise", "Projectile Damage Percent", "Projectile Speed Percent", "Projectile Prot",
    "Worldly Protection", "Punch", "Quake", "Quick Charge", "Radiant", "Rage of the Keter", "Recoil", "Reflexes", "Regen", "Regicide",
    "Respiration", "Resurrection", "Retrieval", "Riptide", "Sapper", "Second Wind", "Shielding", "Shrapnel", "Silk Touch", "Slayer", "Smite",
    "Sniper", "Soul Speed", "Speed Flat", "Speed Percent", "Steadfast", "Sustenance", "Sweeping Edge", "Tempo", "Thorns Flat", "Thorns Percent",
    "Thunder Aspect M", "Thunder Aspect P", "Triage", "Two Handed", "Unbreakable", "Unbreaking", "Vanishing", "Weightless", "Excavator",
    "Explosive", "Multiload", "Stamina", "Trivium", "First Strike", "Wind Aspect M", "Wind Aspect P", "Earth Aspect M", "Earth Aspect P",
    "Melee Fragility", "Projectile Fragility", "Fire Fragility", "Magic Fragility", "Blast Fragility", "Cloaked", "Guard", "First Strike"]
const regions = ["Any Region", "Isles", "Valley", "Ring"]
const tiers = ['Any Tier', 'Epic', 'Artifact', 'Uncommon', 'Rare', 'Unique', 'Patron', 'Event', 'Tier 5', 'Tier 4', 'Tier 3',
    'Tier 2', 'Tier 1', 'Tier 0']
const locations = ["Any Location", "Isles Delves", "Hekawt", "Eldrask", "Depths", "Remorse", "Mist", "Horseman", "Rush", "Delves",
    "Carnival", "Docks", "TOV", "Forum", "Shifting", "Teal", "Purple", "Cyan", "Light Gray", "Gray", "Pink", "Lime", "Isles Casino",
    "Isles Overworld", "Celsian Isles", "Valley Delves", "Armory", "Kaul", "Azacor", "Verdant", "Sanctum", "Corridors", "Reverie",
    "Lowtide Smuggler", "Willows", "Yellow", "Light Blue", "Magenta", "Orange", "White", "Labs", "Valley Casino", "Valley Overworld",
    "King's Valley", "Architect's Ring", "The Wolfswood", "Pelias' Keep", "Blue", "SKT", "Sanguine Halls", "PORTAL", "Ruin",
    "Quest Reward", "Transmogrifier", "Brown"]
const charmClasses = ["Any Class", "Alchemist", "Mage", "Warlock", "Rogue", "Warrior", "Cleric", "Scout", "Generalist"]
const baseItems = ["Any Item", "Blaze Rod", "Shield", "Chainmail Boots", "Cyan Shulker Box", "Iron Axe", "Chorus Fruit", "Golden Leggings", "Golden Hoe", "Diamond Sword", "Crossbow", "Chainmail Helmet", "Bow", "Leather Chestplate", "Iron Leggings", "Iron Chestplate", "Player Head", "Leather Leggings", "Iron Hoe", "Iron Sword", "Bone", "Stone Sword", "Iron Pickaxe", "Leather Helmet", "Iron Boots", "Book", "Snowball", "Music Disc", "Jukebox", "Soul Lantern", "Chainmail Leggings", "Wooden Sword", "Trident", "Chainmail Chestplate", "Nether Brick", "Bell", "Iron Helmet", "Dragon Breath", "Flower Banner Pattern", "Diamond Boots", "Leather Boots", "Nether Star", "Golden Helmet", "Golden Pickaxe", "Golden Boots", "Heart of the Sea", "Gold Nugget", "Potion", "Flint and Steel", "Red Shulker Box", "Stone Hoe", "Golden Axe", "Dead Bush", "Totem of Undying", "Golden Sword", "Stick", "Turtle Helmet", "Ghast Tear", "Wooden Axe", "Flint", "Stone Axe", "Spruce Sapling", "Golden Chestplate", "Clock", "Stone Pickaxe", "Lantern", "White Tulip", "Scute", "Wooden Pickaxe", "Emerald", "Iron Axe/Iron Shovel", "Tropical Fish", "Shears", "Torch", "Compass", "Orange Tulip", "Red Dye", "Iron Nugget", "Light Blue Dye", "Blue Dye", "Pink Stained Glass", "Lime Stained Glass", "Light Gray Stained Glass", "Light Blue Stained Glass", "Magneta Stained Glass", "Orange Stained Glass", "Cyan Stained Glass", "White Stained Glass", "Sugar", "Cornflower", "Bamboo", "Crimson Fungus", "Gold Ingot", "Dried Kelp", "Wooden Hoe", "Bowl", "Paper", "Cooked Mutton", "Bread", "Firework Rocket", "Diamond Axe", "Fishing Rod", "Sea Pickle", "Kelp", "Gray Stained Glass", "Purple Stained Glass", "Magenta Stained Glass", "Yellow Stained Glass", "Ender Eye", "Iron Shovel", "Golden Shovel", "Blue Orchid", "Quartz", "Wooden Shovel", "Yellow Shulker Box", "Blaze Powder", "Cooked Beef", "Iron Pickaxe / Iron Axe / Iron Shovel", "Apple", "Fermented Spider Eye", "Black Shulker Box", "Rabbit Hide", "Clay Ball", "Spruce Leaves", "Rabbit Foot", "Jungle Sapling", "Green Dye", "Yellow Dye", "Light Gray Shulker Box", "Pink Tulip", "Leather", "Pumpkin Pie", "Green Shulker Box", "Allium", "Carrot", "Pufferfish", "Cookie", "End Rod", "Zombie Head", "Prismarine Shard", "Rotten Flesh", "Feather", "Stone Shovel", "Music Disc Cat", "Banner Pattern", "Brewing Stand", "Wet Sponge", "Creeper Head", "Conduit", "Charcoal", "Baked Potato", "Carved Pumpkin", "Magma Cream"]

const checkboxLongTouch = {
    timer: 0,
    duration: 500
}

function getResetKey(name) {
    return name + new Date()
}

export default function SearchForm({ update }) {
    const [searchKey, setSearchKey] = React.useState(getResetKey("search"))
    const [regionKey, setRegionKey] = React.useState(getResetKey("region"))
    const [tierKey, setTierKey] = React.useState(getResetKey("tier"))
    const [locationKey, setLocationKey] = React.useState(getResetKey("location"))
    const [classKey, setClassKey] = React.useState(getResetKey("class"))
    const [baseItemKey, setBaseItemKey] = React.useState(getResetKey("baseItem"))
    const form = React.useRef()

    function sendUpdate(event = {}) {
        if (event.type === "submit") {
            event.preventDefault()
        }
        update(Object.fromEntries(new FormData(form.current).entries()));
    }

    function disableRightClick(event) {
        event.preventDefault()
    }

    function resetForm() {
        // Giving a new key to an element recreates it from scratch. It is used as a workaround to reset a component that doesn't reset on its own
        setSearchKey(getResetKey("search"))
        setRegionKey(getResetKey("region"))
        setTierKey(getResetKey("tier"))
        setLocationKey(getResetKey("location"))
        setClassKey(getResetKey("class"))
        setBaseItemKey(getResetKey("baseItem"))
    }

    function uncheckOthers(event) {
        // Selects the checkbox given that you clicked the label or checkbox
        let interestingElement = event.target.parentElement.firstChild;
        if (interestingElement.type != "checkbox") {
            interestingElement = event.target.firstChild;
        }
        if (interestingElement && interestingElement.type == "checkbox") {
            if (event.button == 2) {
                event.preventDefault()
                interestingElement.checked = true;
                for (const group of interestingElement.parentElement.parentElement.parentElement.children) {
                    for (const checkboxHolder of group.children) {
                        if (checkboxHolder.firstChild.id != interestingElement.id) {
                            checkboxHolder.firstChild.checked = false;
                        }
                    }
                }
            } else if (event.button == 0 && event.target.localName == "div") {
                // Makes it so that you check/uncheck the checkbox even if you click the div that the checkbox is in and not directly on the checkbox
                interestingElement.checked = !interestingElement.checked;
            }
        }
    }

    function uncheckOthersLongTouch(event) {
        // Selects the checkbox given that you clicked the label or checkbox
        let interestingElement = event.target.parentElement.firstChild;
        if (interestingElement.type != "checkbox") {
            interestingElement = event.target.firstChild;
        }
        console.log(event.target.localName);
        if (interestingElement && (interestingElement.type == "checkbox" || event.target.localName == "div")) {
            checkboxLongTouch.timer = setTimeout(() => {
                interestingElement.checked = true;
                for (const group of interestingElement.parentElement.parentElement.parentElement.children) {
                    for (const checkboxHolder of group.children) {
                        if (checkboxHolder.firstChild.id != interestingElement.id) {
                            checkboxHolder.firstChild.checked = false;
                        }
                    }
                }
            }, checkboxLongTouch.duration);
        } else if (event.target.localName == "div") {
            interestingElement.checked = !interestingElement.checked;
        }
    }

    function clearLongTouch() {
        if (checkboxLongTouch.timer) {
            clearTimeout(checkboxLongTouch.timer);
        }
    }

    return (
        <form onSubmit={sendUpdate} onReset={resetForm} onContextMenu={disableRightClick} onMouseDown={uncheckOthers} onTouchStart={uncheckOthersLongTouch} onTouchEnd={clearLongTouch} ref={form} className={styles.searchForm}>
            <div className={styles.inputs}>
                <div className={styles.checkboxes} title="Right-click a checkbox to deselect all others">
                    <TranslatableText identifier="items.searchForm.displayItems"></TranslatableText>
                    <div className={styles.checkboxSubgroup}>
                        <CheckboxWithLabel name="Helmet" translatableName="items.type.helmet" checked={true} />
                        <CheckboxWithLabel name="Chestplate" translatableName="items.type.chestplate" checked={true} />
                        <CheckboxWithLabel name="Leggings" translatableName="items.type.leggings" checked={true} />
                        <CheckboxWithLabel name="Boots" translatableName="items.type.boots" checked={true} />
                    </div>
                    <div className={styles.checkboxSubgroup}>
                        <CheckboxWithLabel name="Axe" translatableName="items.type.axe" checked={true} />
                        <CheckboxWithLabel name="Wand" translatableName="items.type.wand" checked={true} />
                        <CheckboxWithLabel name="Sword" translatableName="items.type.sword" checked={true} />
                        <CheckboxWithLabel name="Scythe" translatableName="items.type.scythe" checked={true} />
                        <CheckboxWithLabel name="Pickaxe" translatableName="items.type.pickaxe" checked={true} />
                        <CheckboxWithLabel name="Shovel" translatableName="items.type.shovel" checked={true} />
                    </div>
                    <div className={styles.checkboxSubgroup}>
                        <CheckboxWithLabel name="Bow" translatableName="items.type.bow" checked={true} />
                        <CheckboxWithLabel name="Crossbow" translatableName="items.type.crossbow" checked={true} />
                        <CheckboxWithLabel name="Throwable" translatableName="items.type.throwable" checked={true} />
                        <CheckboxWithLabel name="Trident" translatableName="items.type.trident" checked={true} />
                    </div>
                    <div className={styles.checkboxSubgroup}>
                        <CheckboxWithLabel name="Offhand Shield" translatableName="items.type.offhandShield" checked={true} />
                        <CheckboxWithLabel name="Offhand" translatableName="items.type.offhand" checked={true} />
                        <CheckboxWithLabel name="Offhand Sword" translatableName="items.type.offhandSword" checked={true} />
                    </div>
                    <div className={styles.checkboxSubgroup}>
                        <CheckboxWithLabel name="Mainhand" translatableName="items.type.mainhand" checked={true} />
                        <CheckboxWithLabel name="Consumable" translatableName="items.type.consumable" checked={true} />
                        <CheckboxWithLabel name="Misc" translatableName="items.type.misc" checked={true} />
                        <CheckboxWithLabel name="Charm" translatableName="items.type.charm" checked={true} />
                    </div>
                    <TranslatableText identifier="items.searchForm.tip"></TranslatableText>
                </div>
                <div>
                    <div className={styles.selects}>
                        <TranslatableText identifier="items.searchForm.sortBy"></TranslatableText>
                        <SelectInput key={searchKey} name="sortSelect" sortableStats={sortableStats} />
                    </div>
                    <div className={styles.selects}>
                        <TranslatableText identifier="items.searchForm.region"></TranslatableText>
                        <SelectInput key={regionKey} name="regionSelect" sortableStats={regions} />
                    </div>
                    <div className={styles.selects}>
                        <TranslatableText identifier="items.searchForm.tier"></TranslatableText>
                        <SelectInput key={tierKey} name="tierSelect" sortableStats={tiers} />
                    </div>
                    <div className={styles.selects}>
                        <TranslatableText identifier="items.searchForm.location"></TranslatableText>
                        <SelectInput key={locationKey} name="locationSelect" sortableStats={locations} />
                    </div>
                    <div className={styles.selects}>
                        <TranslatableText identifier="items.searchForm.charmClass"></TranslatableText>
                        <SelectInput key={classKey} name="classSelect" sortableStats={charmClasses} />
                    </div>
                    <div className={styles.selects}>
                        <TranslatableText identifier="items.searchForm.baseItem"></TranslatableText>
                        <SelectInput key={baseItemKey} name="baseItemSelect" sortableStats={baseItems} />
                    </div>
                </div>

            </div>
            <TranslatableText identifier="items.searchForm.search"></TranslatableText>
            <input type="text" name="search" placeholder="Search" />
            <div>
                <input className={styles.submitButton} type="submit" />
                <input className={styles.warningButton} type="reset" />
            </div>
        </form>
    )
}