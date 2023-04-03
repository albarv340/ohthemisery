import CustomImage from './customImage'
import styles from '../../styles/Items.module.css'
import CharmFormatter from '../../utils/items/charmFormatter'
import TranslatableText from '../translatableText';

function camelCase(str) {
    if (!str) return "";
    return str.replaceAll('\'', '').replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

function makePowerString(power) {
    return <span>Charm Power: <span className={styles.masterworkStar}>{"★".repeat(power)}</span></span>;
}

function makeClassString(className) {
    return <span className={styles[className.toLowerCase()]}>{className}</span>
}

function getImageName(charmTier, charmClass, charmPower) {
    if (charmTier == "Epic") {
        return `Epic_Charm_${charmPower}`;
    }
    return `${(charmClass == "Alchemist") ? "Alch" : (charmClass == "Generalist") ? "Gen" : charmClass}_Charm${(charmTier == "Base") ? "" : `_${charmTier}`}_${charmPower}`;
}

export default function CharmTile(data) {
    const item = data.item;
    let formattedCharm = CharmFormatter.formatCharm(item.stats);
    return (
        <div className={`${styles.itemTile} ${data.hidden ? styles.hidden : ""}`}>
            <div className={styles.imageIcon}>
                <CustomImage key={data.name}
                    alt={data.name}
                    src={`/items/monumenta_icons/charms/${item.name.toLowerCase().replaceAll(" ", "_").replaceAll("-", "_").replaceAll("'", "").trim()}.png`}
                    width={64}
                    height={64}
                    altsrc={`/items/monumenta_icons/charms/${getImageName(item.tier, item.class_name, item.power)}.png`}
                />
            </div>
            <span className={`${styles[camelCase(item.location)]} ${styles[camelCase(item.tier)]} ${styles.name}`}>
                <a href={`https://monumenta.wiki.gg/wiki/${item.name.replace(/\(.*\)/g, '').trim().replaceAll(" ", "_",)}`} target="_blank" rel="noreferrer">{item.name}</a>
            </span>
            <span className={styles.infoText}><TranslatableText identifier="items.type.charm"></TranslatableText>{` - ${item['base_item']} `}</span>
            {item['original_item'] ? <span className={styles.infoText}>{`Skin for ${item['original_item']} `}</span> : ""}
            <span className={styles.infoText}>{makePowerString(item.power)} - {makeClassString(item.class_name)}</span>
            {formattedCharm}
            <span>
                <span className={styles.infoText}>{`${item.region} `}</span>
                <span className={styles[camelCase(item.tier)]}>{(item.tier != "Base") ? `${item.tier} ` : ""}Charm</span>
            </span>
            <span className={styles[camelCase(item.location)]}>{item.location}</span>
            {item.extras?.poi ? <p className={`${styles.infoText} m-0`}>{`Found in ${item.extras.poi}`}</p> : ""}
            {item.extras?.notes ? <p className={`${styles.infoText} m-0`}>{`${item.extras.notes}`}</p> : ""}
        </div>
    )
}