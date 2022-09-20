import SelectInput from '../items/selectInput';
import itemData from '../../public/items/itemData.json';
import React from 'react';

function getRelevantItems(types) {
    let items = Object.keys(itemData);
    return items.filter(name => types.includes(itemData[name].Type.toLowerCase().replace(/<.*>/, "").trim()));
}

function recalcBuild(data) {
    let stats = {
        itemNames: {
            "mainhand": data.mainhand,
            "offhand": data.offhand,
            "helmet": data.helmet,
            "chestplate": data.chestplate,
            "leggings": data.leggings,
            "boots": data.boots
        },
        itemStats: {
            "mainhand": itemData[data.mainhand],
            "offhand": itemData[data.offhand],
            "helmet": itemData[data.helmet],
            "chestplate": itemData[data.chestplate],
            "leggings": itemData[data.leggings],
            "boots": itemData[data.boots]
        },
        agility: 0,
        armor: 0,
        healthPercent: 100,
        healthFlat: 20,
        healthFinal: 20
    }

    //console.log(stats);

    // Example: find total agility and armor
    Object.keys(stats.itemStats).forEach(type => {
        let itemStats = stats.itemStats[type];
        //console.log(itemStats);
        if (itemStats["Health"]) {
            let healthString = (typeof (itemStats["Health"]) === "string") ?
                itemStats["Health"] : itemStats["Health"].join(", ");

            // Try matching for % health
            let result = healthString.match(/([-+]\d+)% Max Health/);
            stats.healthPercent += (result) ? Number(result[1]) : 0;
            // Try matching for regular health
            result = healthString.match(/([-+]\d+) Max Health/);
            stats.healthFlat += (result) ? Number(result[1]) : 0;
        }
        stats.agility += (itemStats["Agility"]) ? Number(itemStats["Agility"]) : 0;
        stats.armor += (itemStats["Armor"]) ? Number(itemStats["Armor"]) : 0;
        stats.healthFinal = stats.healthFlat * (stats.healthPercent / 100);
    });

    return stats;
}

export default function SearchForm({ update, build }) {
    function sendUpdate(event) {
        event.preventDefault()
        let itemNames = Object.fromEntries(new FormData(event.target).entries());
        //console.log(itemNames);
        let stats = recalcBuild(itemNames);
        update(stats);
    }

    const mainhandRef = React.useRef();

    if (build) {
        let buildParts = build.split("&");
        console.log(buildParts);
        let itemNames = {
            mainhand: (buildParts.find(str => str.includes("m="))?.split("m=")[1]),
            offhand: (buildParts.find(str => str.includes("o="))?.split("o=")[1]),
            helmet: (buildParts.find(str => str.includes("h="))?.split("h=")[1]),
            chestplate: (buildParts.find(str => str.includes("c="))?.split("c=")[1]),
            leggings: (buildParts.find(str => str.includes("l="))?.split("l=")[1]),
            boots: (buildParts.find(str => str.includes("b="))?.split("b=")[1])
        }
        Object.keys(itemNames).forEach(name => {
            if (itemNames[name] === undefined) {
                itemNames[name] = "None";
            }
        })

        //document.getElementsByName("mainhand")[0].value = itemNames.mainhand;

        
        //mainhandRef.value = itemNames.mainhand;

        console.log(mainhandRef);

        console.log(itemNames);
    }

    return (
        <form onSubmit={sendUpdate}>
            <div className="row justify-content-center">
                <div className="col-2 text-center">
                    <span>Mainhand</span>
                </div>
                <div className="col-2 text-center">
                    <span>Offhand</span>
                </div>
            </div>
            <div className="row justify-content-center mb-3">
                <div className="col-2 text-center">
                    <SelectInput ref={mainhandRef} name="mainhand" noneOption={true} sortableStats={getRelevantItems(["mainhand", "sword", "axe", "wand", "scythe", "bow", "crossbow", "throwable", "trident"])}></SelectInput>
                </div>
                <div className="col-2 text-center">
                    <SelectInput name="offhand" noneOption={true} sortableStats={getRelevantItems(["offhand", "offhand shield", "offhand sword"])}></SelectInput>
                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col-2 text-center">
                    <span>Helmet</span>
                </div>
                <div className="col-2 text-center">
                    <span>Chestplate</span>
                </div>
                <div className="col-2 text-center">
                    <span>Leggings</span>
                </div>
                <div className="col-2 text-center">
                    <span>Boots</span>
                </div>
            </div>
            <div className="row justify-content-center mb-4">
                <div className="col-2 text-center">
                    <SelectInput noneOption={true} name="helmet" sortableStats={getRelevantItems(["helmet"])}></SelectInput>
                </div>
                <div className="col-2 text-center">
                    <SelectInput noneOption={true} name="chestplate" sortableStats={getRelevantItems(["chestplate"])}></SelectInput>
                </div>
                <div className="col-2 text-center">
                    <SelectInput noneOption={true} name="leggings" sortableStats={getRelevantItems(["leggings"])}></SelectInput>
                </div>
                <div className="col-2 text-center">
                    <SelectInput noneOption={true} name="boots" sortableStats={getRelevantItems(["boots"])}></SelectInput>
                </div>
            </div>
            <div className="row justify-content-center mb-3">
                <div className="col-2 text-center">
                    <input type="submit" className="btn btn-dark w-50" value="Recalculate" />
                </div>
                <div className="col-2 text-center">
                    <button className="btn btn-dark w-50" id="share">Share</button>
                </div>
            </div>
        </form>
    )
}