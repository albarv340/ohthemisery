import Head from 'next/head'
import React from 'react';
import UpdateForm from '../components/builder/updateForm'
import HomeButton from '../components/homeButton';
import ItemTile from '../components/items/itemTile';

function checkExists(type, itemsToDisplay) {
    return (itemsToDisplay.itemStats) ? itemsToDisplay.itemStats[type] !== undefined : false;
}

export default function Builder({ build }) {
    const [itemsToDisplay, setItemsToDisplay] = React.useState({});
    function change(itemData) {
        setItemsToDisplay(itemData);
    }

    const itemTypes = ["mainhand", "offhand", "helmet", "chestplate", "leggings", "boots"];
    const miscStats = [
        {type: "armor", name: "Armor", percent: false},
        {type: "agility", name: "Agility", percent: false},
        {type: "speedPercent", name: "Speed", percent: true},
        {type: "knockbackRes", name: "KB Resistance", percent: true},
        {type: "thorns", name: "Thorns Damage", percent: false}
    ]
    const healthStats = [
        {type: "healthFinal", name: "Health", percent: false},
        {type: "healingRate", name: "Healing Rate", percent: true},
        {type: "effHealingRate", name: "Eff. Healing Rate", percent: true},
        {type: "regenPerSec", name: "Regen/sec", percent: false},
        {type: "regenPerSecPercent", name: "%HP regen/sec", percent: true},
        {type: "lifeDrainOnCrit", name: "Life Drain Crit", percent: false},
        {type: "lifeDrainOnCritPercent", name: "Life Drain %HP Crit", percent: true}
    ]

    return (
        <div className="container-fluid">
            <Head>
                <title>Monumenta Builder</title>
                <meta name="description" content="Monumenta builder." />
                <meta name="keywords" content="Monumenta, Minecraft, MMORPG, Items, Builder" />
            </Head>
            <HomeButton />
            <main>
                <div className="row mb-5">
                    <div className="col-12">
                        <h1 className="text-center">Monumenta Builder</h1>
                    </div>
                </div>
                <UpdateForm update={change} build={build}></UpdateForm>
                <div className="row justify-content-center mb-2">
                    {
                        itemTypes.map(type =>
                            (checkExists(type, itemsToDisplay)) ?
                                <ItemTile key={type} name={itemsToDisplay.itemNames[type]} item={itemsToDisplay.itemStats[type]}></ItemTile> : ""
                        )
                    }
                </div>
                <div className="row justify-content-center mb-2">
                    <div className="col-auto text-center border border-dark me-3">
                        <h5 className="text-center fw-bold">Misc</h5>
                        {
                            miscStats.map(stat => 
                                (itemsToDisplay[stat.type] !== undefined) ?
                                    <div key={stat.type}>
                                        <p className="mb-1 mt-1"><b>{stat.name}: </b>{itemsToDisplay[stat.type]}{stat.percent ? "%" : ""}</p>
                                    </div> : ""
                            )
                        }
                    </div>
                    <div className="col-auto text-center border border-dark">
                        <h5 className="text-center fw-bold">Health</h5>
                        {
                            healthStats.map(stat => 
                                (itemsToDisplay[stat.type] !== undefined) ?
                                    <div key={stat.type}>
                                        <p className="mb-1 mt-1"><b>{stat.name}: </b>{itemsToDisplay[stat.type]}{stat.percent ? "%" : ""}</p>
                                    </div> : ""
                            )
                        }
                    </div>
                </div>
            </main>
        </div>
    )
}