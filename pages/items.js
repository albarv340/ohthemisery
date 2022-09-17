import Head from 'next/head'
import styles from '../styles/Items.module.css'
import itemData from '../public/items/itemData.json'
import Image from 'next/image';
import React from 'react';

function camelCase(str) {
    if (!str) return "";
    return str.replaceAll('\'', '').replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

function Enchants(data) {
    const enchantmentTypes = ["Specialist Enchants", "Protection", "Melee Enchants", "Ranged Enchants", "Tool Enchants", "Water", "Misc.", "Epic Enchants", "Durability", "Curses", "Speed", "Health", "Armor Attribrutes", "Weapon Base Stats"]
    const item = itemData[data.name]
    let enchants = []
    for (const type of enchantmentTypes) {
        const enchant = item[type]
        if (enchant == "") continue;
        if (enchant.constructor === Array) {
            for (const ench of enchant) {
                enchants.push(<span className={styles[ench[0] == "-" ? "negativeStat" : ench[0] == "+" ? "positiveStat" : camelCase(type)]} key={ench}>{ench}</span>)
            }
        } else {
            enchants.push(<span className={styles[camelCase(type)]} key={enchant}>{enchant}</span>)
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
            <Enchants name={data.name}></Enchants>
            {item.Agility ? <span className={styles.agility}>{item.Agility[0] == "-" ? "" : "+"}{item.Agility} Agility</span> : ""}
            {item.Armor ? <span className={styles.armor}>{item.Armor[0] == "-" ? "" : "+"}{item.Armor} Armor</span> : ""}
            <span>
                <span className={styles.infoText}>{`${item.Region} `}</span>
                <span className={styles[camelCase(item.Tier)]}>{item.Tier}</span>
            </span>
            <span className={styles[camelCase(item.Location)]}>{item.Location}</span>
            <span className={styles.infoText}>{`${item.Notes} `}</span>
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
                    {Object.keys(itemData).map(name => {
                        return (
                            <ItemTile key={name} name={name} hidden={!relevantItems.includes(name)}></ItemTile>
                        )
                    })}
                </div>

            </main>
        </div>
    )
}