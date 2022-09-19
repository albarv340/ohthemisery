import Head from 'next/head'
import React from 'react';
import UpdateForm from '../components/builder/updateForm'
import HomeButton from '../components/homeButton';
import ItemTile from '../components/items/itemTile';

function checkExists(type, itemsToDisplay) {
    return (itemsToDisplay.itemStats) ? itemsToDisplay.itemStats[type] !== undefined : false;
}

export default function Builder() {
    const [itemsToDisplay, setItemsToDisplay] = React.useState({});
    function change(itemData) {
        setItemsToDisplay(itemData);
    }

    const itemTypes = ["mainhand", "offhand", "helmet", "chestplate", "leggings", "boots"];
    const ehpStats = [
        {type: "armor", name: "Armor"},
        {type: "agility", name: "Agility"},
        {type: "healthFinal", name: "Health"}
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
                <UpdateForm update={change}></UpdateForm>
                <div className="row justify-content-center mb-2">
                    {
                        itemTypes.map(type =>
                            (checkExists(type, itemsToDisplay)) ?
                                <ItemTile key={type} name={itemsToDisplay.itemNames[type]} item={itemsToDisplay.itemStats[type]}></ItemTile> : ""
                        )
                    }
                </div>
                <div className="row justify-content-center mb-2">
                    <div className="col-auto text-center border border-dark">
                        {
                            ehpStats.map(stat => 
                                (itemsToDisplay[stat.type] !== undefined) ?
                                    <div>
                                        <p className="mb-1 mt-1"><b>{stat.name}: </b>{itemsToDisplay[stat.type]}</p>
                                    </div> : ""
                            )
                        }
                    </div>
                </div>
            </main>
        </div>
    )
}