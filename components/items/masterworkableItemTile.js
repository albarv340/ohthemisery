import CustomImage from './customImage'
import Enchants from './enchants'
import styles from '../../styles/Items.module.css'
import React from 'react'

function camelCase(str) {
    if (!str) return "";
    return str.replaceAll('\'', '').replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

const maxMasterwork = {
    "Rare": 3,
    "Epic": 6
}

const undiscovered = {
    UNDISCOVERED: 1,
    DOES_NOT_EXIST: 2
}

function getLowestMasterworkItem(items) {
    let min = items[0];
    for (let i = 1; i < items.length; i++) {
        if (items[i].masterwork < min.masterwork) {
            min = items[i];
        }
    }
    return min;
}

function getItemWithMasterwork(items, masterwork) {
    let minMasterwork = getLowestMasterworkItem(items).masterwork;
    if (masterwork >= minMasterwork) {
        for (let item of items) {
            if (Number(item.masterwork) === masterwork) {
                return item;
            }
        }
    }
    let undiscoveredItem = {};
    // Need to create a copy of the object or it will modify the original object if I simply equal them.
    for (let key of Object.keys(items[0])) {
        switch (key) {
            case "stats": {
                undiscoveredItem.stats = {};
                break;
            }
            case "masterwork": {
                undiscoveredItem.masterwork = masterwork;
                break;
            }
            default: {
                undiscoveredItem[key] = items[0][key];
                break;
            }
        }
    }
    (masterwork < minMasterwork) ? undiscoveredItem.undiscovered = undiscovered.DOES_NOT_EXIST : undiscoveredItem.undiscovered = undiscovered.UNDISCOVERED;
    return undiscoveredItem;
}

export default function MasterworkableItemTile(data) {
    // This is an array
    const item = data.item;
    if (item[0].name == "Mycelian Crescent") {
        console.log(getLowestMasterworkItem(item));
    }
    let defaultItem;
    if (data.default) {
        defaultItem = getItemWithMasterwork(item, data.default);
    } else {
        defaultItem = getLowestMasterworkItem(item);
    }
    const [activeItem, setActiveItem] = React.useState(defaultItem);

    function spanClicked(event) {
        let masterworkClicked = Number(event.target.id.split("-")[1]);
        const tempActiveItem = getItemWithMasterwork(item, masterworkClicked)
        setActiveItem(tempActiveItem);
        if (data.update) {
            data.update(tempActiveItem, tempActiveItem.type);
        }
    }
    
    return (
        <div className={`${styles.itemTile} ${data.hidden ? styles.hidden : ""}`}>
            <div className={styles.imageIcon}>
                <CustomImage key={data.name}
                    alt={data.name}
                    src={`/items/monumenta_icons/items/${activeItem.name.replace(/\(.*\)/g, '').trim().replaceAll(" ", "_").replaceAll("'", "").replaceAll(".","")}.png`}//.substring(0, activeItem.name)
                    width={64}
                    height={64}
                    altsrc={`/items/vanilla_icons/${activeItem['base_item'].replaceAll(" ", "_").toLowerCase()}.png`}
                />
            </div>
            <span className={`${styles[camelCase(activeItem.location)]} ${styles[camelCase(activeItem.tier)]} ${styles.name}`}>
                <a href={`https://monumentammo.fandom.com/wiki/${activeItem.name.replace(/\(.*\)/g, '').trim().replaceAll(" ", "_",)}`} target="_blank" rel="noreferrer">{activeItem.name}</a>
            </span>
            <span className={styles.infoText}>{`${activeItem.type} - ${activeItem['base_item']} `}</span>
            {activeItem['original_item'] ? <span className={styles.infoText}>{`Skin for ${activeItem['original_item']} `}</span> : ""}
            <span className={styles.infoText}>
                <span onClick={spanClicked} id="mw-0" className={styles["starSpan"]}>Masterwork</span>: <span>
                    {
                        [...Array(maxMasterwork[activeItem.tier]).keys()].map(num => num + 1).map(num => {
                            if (num <= activeItem.masterwork) {
                                return <span key={`mw-${num}`} onClick={spanClicked} id={`mw-${num}`} className={[styles["starSpan"], styles["masterworkStar"]].join(" ")}>★</span>
                            } else {
                                return <span key={`mw-${num}`} onClick={spanClicked} id={`mw-${num}`} className={styles["starSpan"]}>☆</span>
                            }
                        })
                    }
                </span>
            </span>
            {
                (activeItem.undiscovered) ? (
                    (activeItem.undiscovered == undiscovered.UNDISCOVERED) ? <span className={styles["undiscovered"]}>This item has not yet been discovered! Tag FlamingoBike#6228 on discord with a screenshot of the item.</span> :
                        (activeItem.undiscovered == undiscovered.DOES_NOT_EXIST) ? <span className={styles["undiscovered"]}>This item does not appear ingame with this level of masterwork, or this level of masterwork does not have the desired stat.</span> : ""
                ) :
                    <div>
                        <Enchants item={activeItem}></Enchants>
                        <span>
                            <span className={styles.infoText}>{`${activeItem.region} `}</span>
                            <span className={styles[camelCase(activeItem.tier)]}>{activeItem.tier}</span>
                        </span>
                    </div>
            }
            <span className={styles[camelCase(activeItem.location)]}>{activeItem.location}</span>
            {
                (!activeItem.undiscovered) ?
                <div>
                    {activeItem.notes ? <span className={styles.infoText}>{`${activeItem.notes} `}</span> : ""}
                </div> : ""
            }
        </div>
    )
}