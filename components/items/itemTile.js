import CustomImage from './customImage'
import Enchants from './enchants'
import styles from '../../styles/Items.module.css'
import TranslatableText from '../translatableText';

function camelCase(str) {
    if (!str) return "";
    return str.replaceAll('\'', '').replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

export default function ItemTile(data) {
    const item = data.item
    return (
        <div className={`${styles.itemTile} ${data.hidden ? styles.hidden : ""}`}>
            <div className={styles.imageIcon}>
                <CustomImage key={data.name}
                    alt={data.name}
                    src={`/items/monumenta_icons/items/${item.name.replace(/\(.*\)/g, '').trim().replaceAll(" ", "_")}.png`}
                    width={64}
                    height={64}
                    altsrc={`/items/vanilla_icons/${item['base_item'].replaceAll(" ", "_").toLowerCase()}.png`}
                />
            </div>
            <span className={`${styles[camelCase(item.location)]} ${(item.tier == "Tier 3" && item.region == "Ring") ? styles["tier5"] : styles[camelCase(item.tier)]} ${styles.name}`}>
                <a href={`https://monumentammo.fandom.com/wiki/${item.name.replace(/\(.*\)/g, '').trim().replaceAll(" ", "_",)}`} target="_blank" rel="noreferrer">{item.name}</a>
            </span>
            <span className={styles.infoText}><TranslatableText identifier={`items.type.${camelCase(item.type.replace("<M>", ""))}`}></TranslatableText>{` - ${item['base_item']} `}</span>
            {item['original_item'] ? <span className={styles.infoText}>{`Skin for ${item['original_item']} `}</span> : ""}
            <Enchants item={item}></Enchants>
            <span>
                <span className={styles.infoText}>{`${item.region} `}</span>
                <span className={styles[camelCase(item.tier)]}>{item.tier}</span>
            </span>
            <span className={styles[camelCase(item.location)]}>{item.location}</span>
            {item.notes ? <span className={styles.infoText}>{`${item.notes} `}</span> : ""}
        </div>
    )
}