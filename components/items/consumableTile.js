import CustomImage from './customImage';
import styles from '../../styles/Items.module.css';
import ConsumableFormatter from '../../utils/items/consumableFormatter';
import TranslatableText from '../translatableText';

function camelCase(str) {
    if (!str) return "";
    return str.replaceAll('\'', '').replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

function getItemType(item) {
    if (item.type != undefined) {
        return camelCase(item.type);
    }
    return "misc";
}

export default function ConsumableTile(data) {
    const item = data.item
    let formattedEffects = ConsumableFormatter.formatEffects(item.effects);
    return (
        <div className={`${styles.itemTile} ${data.hidden ? styles.hidden : ""}`}>
            <div className={styles.imageIcon}>
                <CustomImage key={data.name}
                    alt={data.name}
                    src={`/items/monumenta_icons/items/${item.name.replace(/\(.*\)/g, '').replaceAll(" ", "_").replaceAll("-", "_").replaceAll("'", "").trim()}.png`}
                    width={64}
                    height={64}
                    altsrc={`/items/vanilla_icons/${item['base_item'].replaceAll(" ", "_").toLowerCase()}.png`}
                />
            </div>
            <span className={`${styles[camelCase(item.location)]} ${(item.tier == "Tier 3" && item.region == "Ring") ? styles["tier5"] : styles[camelCase(item.tier)]} ${styles.name}`}>
                <a href={`https://monumenta.wiki.gg/wiki/${item.name.replace(/\(.*\)/g, '').trim().replaceAll(" ", "_",)}`} target="_blank" rel="noreferrer">{item.name}</a>
            </span>
            <span className={styles.infoText}><TranslatableText identifier={`items.type.${getItemType(item)}`}></TranslatableText>{` - ${item['base_item']} `}</span>
            {item['original_item'] ? <span className={styles.infoText}>{`Skin for ${item['original_item']} `}</span> : ""}
            <span>
                <span className={styles.infoText}>{`${(item.region) ? item.region : ""} `}</span>
                <span className={styles[camelCase(item.tier)]}>{(item.tier) ? item.tier : "Consumable"}</span>
            </span>
            <span className={styles[camelCase(item.location)]}>{item.location}</span>
            {formattedEffects}
            {item.lore ? <span className={styles.infoText}>{item.lore}</span> : ""}
            {item.extras?.poi ? <p className={`${styles.infoText} m-0`}>{`Found in ${item.extras.poi}`}</p> : ""}
            {item.extras?.notes ? <p className={`${styles.infoText} m-0`}>{item.extras.notes}</p> : ""}
        </div>
    )
}