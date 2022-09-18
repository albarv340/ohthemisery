import Head from 'next/head'
import styles from '../styles/Items.module.css'
import itemData from '../public/items/itemData.json'
import enchantmentsData from '../public/items/enchantmentsData.json'
import Image from 'next/image';
import React from 'react';

function camelCase(str) {
    if (!str) return "";
    return str.replaceAll('\'', '').replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

function enchantStyle(ench, type) {
    if (ench[0] == "-") {
        return "negativeStat"
    }
    if (ench[0] == "+") {
        return "positiveStat"
    }
    return camelCase(type)
}

function enchantTitle(ench, type) {
    return `${enchantmentsData[(type == "Curses" ? "Curse of " : "") + ench.replaceAll(/\d*/g, "").replaceAll("Prot.", "Protection").trim()] || ""}`
}

function Enchants(data) {
    const enchantmentTypes = ["Specialist Enchants", "Protection", "Melee Enchants", "Ranged Enchants", "Tool Enchants", "Water", "Misc.", "Epic Enchants", "Durability", "Curses", "Speed", "Health", "Weapon Base Stats", "Armor Attribrutes"]
    const item = itemData[data.name]
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
    return (
        <div className={styles.enchants}>
            {enchants}
        </div>
    )
}


function CustomImage({ ...props }) {
    const [src, setSrc] = React.useState(props.src);
    try {
        return (
            <Image
                width={props.width}
                height={props.height}
                src={src}
                alt={props.alt}
                onError={() => setSrc(props.altsrc)}
            />
        );
    } catch (e) {
        return null
    }
}

function ItemTile(data) {
    const item = itemData[data.name]
    // console.log(item)
    return (
        <div className={`${styles.itemTile} ${data.hidden ? styles.hidden : ""}`}>
            <div className={styles.imageIcon}>
                <CustomImage
                    alt={data.Name}
                    src={`/items/monumenta_icons/${item.Name.replace(/\(.*\)/g, '').trim().replaceAll(" ", "_")}.png`}
                    width={64}
                    height={64}
                    altsrc={`/items/vanilla_icons/${item['Base Item'].replaceAll(" ", "_").toLowerCase()}.png`}
                />
            </div>
            <span className={`${styles[camelCase(item.Location)]} ${styles[camelCase(item.Tier)]} ${styles.name}`}>
                <a href={`https://monumentammo.fandom.com/wiki/${item.Name.replace(/\(.*\)/g, '').trim().replaceAll(" ", "_",)}`} target="_blank" rel="noreferrer">{item.Name}</a>
            </span>
            <span className={styles.infoText}>{`${item.Type} - ${item['Base Item']} `}</span>
            {item['Original Item'] ? <span className={styles.infoText}>{`Skin for ${item['Original Item']} `}</span> : ""}
            <Enchants name={data.name}></Enchants>
            {item.Agility ? <span className={styles.agility}>{item.Agility[0] == "-" ? "" : "+"}{item.Agility} Agility</span> : ""}
            {item.Armor ? <span className={styles.armor}>{item.Armor[0] == "-" ? "" : "+"}{item.Armor} Armor</span> : ""}
            <span>
                <span className={styles.infoText}>{`${item.Region} `}</span>
                <span className={styles[camelCase(item.Tier)]}>{item.Tier}</span>
            </span>
            <span className={styles[camelCase(item.Location)]}>{item.Location}</span>
            {item.Notes ? <span className={styles.infoText}>{`${item.Notes} `}</span> : ""}
        </div>
    )
}

function CheckboxWithLabel(data) {
    return (
        <div className={styles.checkboxWithLabel}>
            <input type="checkbox" id={data.name.toLowerCase()} name={data.name.toLowerCase()} defaultChecked={data.checked} />
            <label for={data.name.toLowerCase()}>{data.name}</label>
        </div>
    )
}

function SelectInput(data) {
    return (
        <select name={data.name}>
            {data.sortableStats.map(e => {
                return (
                    <option value={e} key={e}>{e}</option>
                )
            })}
        </select>
    )
}

const sortableStats = ["-", "Abyssal", "Adaptability", "Adrenaline", "Agility", "Anemia", "Aptitude", "Aqua Affinity", "Arcane Thrust", "Armor", "Ashes of Eternity", "Attack Damage", "Attack Speed", "Attack Speed %", "Base Attack Damage", "Base Attack Speed", "Base Proj Damage", "Base Proj Speed", "Base Spell Power", "Base Throw Rate", "Blast Prot.", "Bleeding", "Chaotic", "Corruption", "Crippling", "Darksight", "Decay", "Depth Strider", "Duelist", "Efficiency", "Eruption", "Ethereal ", "Evasion", "Feather Falling", "Fire Aspect (M)", "Fire Aspect (P)", "Fire Prot.", "Fortune", "Gills", "Hex Eater", "Ice Aspect (M)", "Ice Aspect (P)", "Ineptitude", "Inferno", "Infinity (bow)", "Infinity (tool)", "Intuition", "Inure", "Irreparability", "Knockback", "Knockback Res.", "Life Drain", "Looting", "Lure", "Magic Damage", "Magic Prot.", "Max Health", "Max Health %", "Melee Prot.", "Mending", "Multishot", "Multitool", "Persistence", "Piercing", "Point Blank", "Poise", "Proj Damage", "Proj Speed", "Projectile Prot.", "Protection of the Depths", "Punch", "Quake", "Quick Charge", "Radiant", "Rage of the Keter", "Recoil", "Reflexes ", "Regen", "Regicide", "Respiration", "Resurrection", "Retrieval", "Riptide", "Sapper", "Second Wind", "Shielding", "Shrapnel", "Silk Touch", "Slayer", "Smite", "Sniper", "Soul Speed", "Speed", "Speed %", "Steadfast", "Sustenance", "Sweeping Edge", "Tempo ", "Thorns", "Thorns Damage", "Thunder Aspect (M)", "Thunder Aspect (P)", "Triage", "Two Handed", "Unbreakable", "Unbreaking", "Vanishing", "Void Tether", "Weightless"]
function SearchForm({ update }) {
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

function getRelevantItems(data) {
    let items = Object.keys(itemData)
    if (data.search) {
        items = items.filter(e => e.toLowerCase().includes(data.search.toLowerCase()))
    }
    if (data.sortSelect != "-") {
        items = items.filter(e => typeof (itemData[e][data.sortSelect]) != "undefined")
        items = items.sort((a, b) => (itemData[b][data.sortSelect] || 0) - (itemData[a][data.sortSelect] || 0))
    }
    let includedTypes = []
    for (const key in data) {
        if (data[key] == "on") {
            includedTypes.push(key)
        }
    }
    items = items.filter(e => includedTypes.includes(itemData[e].Type.toLowerCase().replace(/<.*>/, "").trim()))



    return items
}

export default function Items() {
    const [relevantItems, setRelevantItems] = React.useState(Object.keys(itemData));
    function handleChange(data) {
        setRelevantItems(getRelevantItems(data))
    }
    return (
        <div className={styles.container}>
            <Head>
                <title>Monumenta Items</title>
            </Head>
            <main className={styles.main}>
                <h1>Monumenta Items</h1>
                <SearchForm update={handleChange} />
                <div className={styles.itemsContainer}>
                    {[...new Set(relevantItems, Object.keys(itemData))].map(name => {
                        return (
                            <ItemTile key={name} name={name} hidden={!relevantItems.includes(name)}></ItemTile>
                        )
                    })}
                </div>

            </main>
        </div>
    )
}