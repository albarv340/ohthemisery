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
    ];
    const healthStats = [
        {type: "healthFinal", name: "Health", percent: false},
        {type: "healingRate", name: "Healing Rate", percent: true},
        {type: "effHealingRate", name: "Eff. Healing Rate", percent: true},
        {type: "regenPerSec", name: "Regen/sec", percent: false},
        {type: "regenPerSecPercent", name: "%HP regen/sec", percent: true},
        {type: "lifeDrainOnCrit", name: "Life Drain Crit", percent: false},
        {type: "lifeDrainOnCritPercent", name: "Life Drain %HP Crit", percent: true}
    ];
    const healthNormalizedDRStats = [
        {type: "meleeHNDR", name: "Melee", percent: true},
        {type: "projectileHNDR", name: "Projectile", percent: true},
        {type: "magicHNDR", name: "Magic", percent: true},
        {type: "blastHNDR", name: "Blast", percent: true},
        {type: "fireHNDR", name: "Fire", percent: true},
        {type: "fallHNDR", name: "Fall", percent: true},
        {type: "ailmentHNDR", name: "Ailment", percent: true}
    ];
    const DRStats = [
        {type: "meleeDR", name: "Melee", percent: true},
        {type: "projectileDR", name: "Projectile", percent: true},
        {type: "magicDR", name: "Magic", percent: true},
        {type: "blastDR", name: "Blast", percent: true},
        {type: "fireDR", name: "Fire", percent: true},
        {type: "fallDR", name: "Fall", percent: true},
        {type: "ailmentDR", name: "Ailment", percent: true}
    ];
    const EHPStats = [
        {type: "meleeEHP", name: "Melee", percent: false},
        {type: "projectileEHP", name: "Projectile", percent: false},
        {type: "magicEHP", name: "Magic", percent: false},
        {type: "blastEHP", name: "Blast", percent: false},
        {type: "fireEHP", name: "Fire", percent: false},
        {type: "fallEHP", name: "Fall", percent: false},
        {type: "ailmentEHP", name: "Ailment", percent: false}
    ];
    const meleeStats = [
        {type: "attackSpeedPercent", name: "Attack Speed", percent: true},
        {type: "attackSpeed", name: "Weapon Attack Speed", percent: false},
        {type: "attackDamagePercent", name: "Damage", percent: true},
        {type: "attackDamage", name: "Weapon Damage", percent: false},
        {type: "attackDamageCrit", name: "Weapon Crit Damage", percent: false},
        {type: "iframeDPS", name: "IFrame-Capped DPS", percent: false},
        {type: "iframeCritDPS", name: "IFrame-Capped Crit DPS", percent: false}
    ];
    const projectileStats = [
        {type: "projectileDamagePercent", name: "Proj Damage", percent: true},
        {type: "projectileDamage", name: "Weapon Proj Damage", percent: false},
        {type: "projectileSpeedPercent", name: "Proj Speed", percent: true},
        {type: "projectileSpeed", name: "Weapon Proj Speed", percent: false},
        {type: "throwRatePercent", name: "Throw Rate", percent: true},
        {type: "throwRate", name: "Weapon Throw Rate", percent: false}
    ];
    const magicStats = [

    ];

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
                    <div className="col-auto text-center border border-dark mx-2 py-2">
                        <h5 className="text-center fw-bold mb-0">Misc</h5>
                        <h6 className="text-center fw-bold">&nbsp;</h6>
                        {
                            miscStats.map(stat => 
                                (itemsToDisplay[stat.type] !== undefined) ?
                                    <div key={stat.type}>
                                        <p className="mb-1 mt-1"><b>{stat.name}: </b>{itemsToDisplay[stat.type]}{stat.percent ? "%" : ""}</p>
                                    </div> : ""
                            )
                        }
                    </div>
                    <div className="col-auto text-center border border-dark mx-2 py-2">
                        <h5 className="text-center fw-bold mb-0">Health</h5>
                        <h6 className="text-center fw-bold">&nbsp;</h6>
                        {
                            healthStats.map(stat => 
                                (itemsToDisplay[stat.type] !== undefined) ?
                                    <div key={stat.type}>
                                        <p className="mb-1 mt-1"><b>{stat.name}: </b>{itemsToDisplay[stat.type]}{stat.percent ? "%" : ""}</p>
                                    </div> : ""
                            )
                        }
                    </div>
                    <div className="col-auto text-center border border-dark mx-2 py-2">
                        <h5 className="text-center fw-bold mb-0">Damage Reduction</h5>
                        <h6 className="text-center fw-bold">(Health Normalized)</h6>
                        {
                            healthNormalizedDRStats.map(stat => 
                                (itemsToDisplay[stat.type] !== undefined) ?
                                    <div key={stat.type}>
                                        <p className="mb-1 mt-1"><b>{stat.name}: </b>{itemsToDisplay[stat.type]}{stat.percent ? "%" : ""}</p>
                                    </div> : ""
                            )
                        }
                    </div>
                    <div className="col-auto text-center border border-dark mx-2 py-2">
                        <h5 className="text-center fw-bold mb-0">Damage Reduction</h5>
                        <h6 className="text-center fw-bold">(Regular)</h6>
                        {
                            DRStats.map(stat => 
                                (itemsToDisplay[stat.type] !== undefined) ?
                                    <div key={stat.type}>
                                        <p className="mb-1 mt-1"><b>{stat.name}: </b>{itemsToDisplay[stat.type]}{stat.percent ? "%" : ""}</p>
                                    </div> : ""
                            )
                        }
                    </div>
                    <div className="col-auto text-center border border-dark mx-2 py-2">
                        <h5 className="text-center fw-bold mb-0">Effective Health</h5>
                        <h6 className="text-center fw-bold">&nbsp;</h6>
                        {
                            EHPStats.map(stat => 
                                (itemsToDisplay[stat.type] !== undefined) ?
                                    <div key={stat.type}>
                                        <p className="mb-1 mt-1"><b>{stat.name}: </b>{itemsToDisplay[stat.type]}{stat.percent ? "%" : ""}</p>
                                    </div> : ""
                            )
                        }
                    </div>
                    <div className="col-auto text-center border border-dark mx-2 py-2">
                        <h5 className="text-center fw-bold mb-0">Melee</h5>
                        <h6 className="text-center fw-bold">&nbsp;</h6>
                        {
                            meleeStats.map(stat => 
                                (itemsToDisplay[stat.type] !== undefined) ?
                                    <div key={stat.type}>
                                        <p className="mb-1 mt-1"><b>{stat.name}: </b>{itemsToDisplay[stat.type]}{stat.percent ? "%" : ""}</p>
                                    </div> : ""
                            )
                        }
                    </div>
                    <div className="col-auto text-center border border-dark mx-2 py-2">
                        <h5 className="text-center fw-bold mb-0">Projectile</h5>
                        <h6 className="text-center fw-bold">&nbsp;</h6>
                        {
                            projectileStats.map(stat => 
                                (itemsToDisplay[stat.type] !== undefined) ?
                                    <div key={stat.type}>
                                        <p className="mb-1 mt-1"><b>{stat.name}: </b>{itemsToDisplay[stat.type]}{stat.percent ? "%" : ""}</p>
                                    </div> : ""
                            )
                        }
                    </div>
                    <div className="col-auto text-center border border-dark mx-2 py-2">
                        <h5 className="text-center fw-bold mb-0">Magic</h5>
                        <h6 className="text-center fw-bold">&nbsp;</h6>
                        {
                            magicStats.map(stat => 
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