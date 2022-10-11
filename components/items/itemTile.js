import CustomImage from './customImage'
import Enchants from './enchants'
import styles from '../../styles/Items.module.css'

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
            <Enchants item={item}></Enchants>
            <span>
                <span className={styles.infoText}>{`${item.Region} `}</span>
                <span className={styles[camelCase(item.Tier)]}>{item.Tier}</span>
            </span>
            <span className={styles[camelCase(item.Location)]}>{item.Location}</span>
            {item.Notes ? <span className={styles.infoText}>{`${item.Notes} `}</span> : ""}
        </div>
    )
}