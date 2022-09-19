import Head from 'next/head'
import styles from '../styles/Items.module.css'
import itemData from '../public/items/itemData.json'
import React from 'react';
import SelectInput from '../components/items/selectInput'

function getRelevantItems(types) {
    let items = Object.keys(itemData);
    return items.filter(name => types.includes(itemData[name].Type.toLowerCase().replace(/<.*>/, "").trim()));
}

function recalcBuild() {
    let mainhand = document.getElementsByName("Mainhand")[0].value;
    let offhand = document.getElementsByName("Offhand")[0].value;
    let helmet = document.getElementsByName("Helmet")[0].value;
    let chestplate = document.getElementsByName("Chestplate")[0].value;
    let leggings = document.getElementsByName("Leggings")[0].value;
    let boots = document.getElementsByName("Boots")[0].value;

    let stats = {
        items: [mainhand, offhand, helmet, chestplate, leggings, boots],
        itemStats: {
            mainhand: itemData[mainhand],
            offhand: itemData[offhand],
            helmet: itemData[helmet],
            chestplate: itemData[chestplate],
            leggings: itemData[leggings],
            boots: itemData[boots]
        },
        totalAgility: 0,
        totalArmor: 0
    }

    document.getElementById("output").innerHTML = `<b>Items Selected:</b> ${stats.items.join(", ")}`;

    // Example: find total agility and armor
    Object.keys(stats.itemStats).forEach(type => {
        let itemStats = stats.itemStats[type];
        stats.totalAgility += (itemStats["Agility"]) ? Number(itemStats["Agility"]) : 0;
        stats.totalArmor += (itemStats["Armor"]) ? Number(itemStats["Armor"]) : 0;
    });

    document.getElementById("agility").innerHTML = `<b>Total Agility:</b> ${stats.totalAgility}`;
    document.getElementById("armor").innerHTML = `<b>Total Armor:</b> ${stats.totalArmor}`;
}

export default function Builder() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Monumenta Builder</title>
                <meta name="description" content="Monumenta builder." />
                <meta name="keywords" content="Monumenta, Minecraft, MMORPG, Items, Builder" />
            </Head>
            <main className={styles.main}>
                <h1>Monumenta Builder</h1>
                <div>
                    Mainhand:
                    <SelectInput name="Mainhand" sortableStats={getRelevantItems(["mainhand", "sword", "axe", "wand", "scythe", "bow", "crossbow", "throwable", "trident"])}></SelectInput>            
                </div>
                <div>
                    Offhand:
                    <SelectInput name="Offhand" sortableStats={getRelevantItems(["offhand", "offhand shield", "offhand sword"])}></SelectInput>
                </div>
                <div>
                    Helmet:
                    <SelectInput name="Helmet" sortableStats={getRelevantItems(["helmet"])}></SelectInput>
                </div>
                <div>
                    Chestplate:
                    <SelectInput name="Chestplate" sortableStats={getRelevantItems(["chestplate"])}></SelectInput>
                </div>
                <div>
                    Leggings:
                    <SelectInput name="Leggings" sortableStats={getRelevantItems(["leggings"])}></SelectInput>
                </div>
                <div>
                    Boots:
                    <SelectInput name="Boots" sortableStats={getRelevantItems(["boots"])}></SelectInput>
                </div>
                <button id="recalc" onClick={recalcBuild}>Recalculate</button>
                <div>
                    <p id="output"></p>
                    <p id="agility"></p>
                    <p id="armor"></p>
                </div>
            </main>
        </div>
    )
}