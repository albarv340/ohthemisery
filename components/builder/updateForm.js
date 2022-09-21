import SelectInput from '../items/selectInput';
import itemData from '../../public/items/itemData.json';
import React from 'react';

let initialized = false;

function getRelevantItems(types) {
    let items = Object.keys(itemData);
    return items.filter(name => types.includes(itemData[name].Type.toLowerCase().replace(/<.*>/, "").trim()));
}

function sumNumberStat(itemStats, statName, defaultIncrement) {
    return (itemStats[statName]) ? Number(itemStats[statName]) : (defaultIncrement) ? defaultIncrement : 0;
}

function sumEnchantmentStat(itemStats, enchName, perLevelMultiplier) {
    return (itemStats[enchName]) ? Number(itemStats[enchName]) * perLevelMultiplier : 0;
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
            "mainhand": (data.mainhand != "None") ? itemData[data.mainhand] : undefined,
            "offhand": (data.offhand != "None") ? itemData[data.offhand] : undefined,
            "helmet": (data.helmet != "None") ? itemData[data.helmet] : undefined,
            "chestplate": (data.chestplate != "None") ? itemData[data.chestplate] : undefined,
            "leggings": (data.leggings != "None") ? itemData[data.leggings] : undefined,
            "boots": (data.boots != "None") ? itemData[data.boots] : undefined
        },
        agility: 0,
        armor: 0,
        speedPercent: 100,
        speedFlat: 0.1,
        knockbackRes: 0,
        thorns: 0,

        healthPercent: 100,
        healthFlat: 20,
        healthFinal: 20,
        healingRate: 100,
        effHealingRate: 100,
        regenPerSec: 0,
        regenPerSecPercent: 0,
        lifeDrainOnCrit: 0,
        lifeDrainOnCritPercent: 0
    }

    // Main loop to add up stats from items
    Object.keys(stats.itemStats).forEach(type => {
        let itemStats = stats.itemStats[type];
        if (itemStats !== undefined) {
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
            stats.agility += sumNumberStat(itemStats, "Agility");
            stats.armor += sumNumberStat(itemStats, "Armor");
            stats.speedPercent += sumNumberStat(itemStats, "Speed %");
            stats.speedFlat += sumNumberStat(itemStats, "Speed");
            stats.knockbackRes += sumNumberStat(itemStats, "Knockback Res.");
            stats.thorns += sumNumberStat(itemStats, "Thorns");
    
            stats.healingRate += sumEnchantmentStat(itemStats, "Anemia", -10) + sumEnchantmentStat(itemStats, "Sustenance", 10);
            stats.regenPerSec += sumEnchantmentStat(itemStats, "Regen", 1);
            stats.lifeDrainOnCrit += sumEnchantmentStat(itemStats, "Life Drain", 1);
        }
    });

    // Calculate final health
    stats.healthFinal = stats.healthFlat * (stats.healthPercent / 100);
    // Fix speed percentage to account for base speed
    stats.speedPercent = (stats.speedPercent * (stats.speedFlat)/0.1).toFixed(2);
    // Fix knockback resistance to be percentage and cap at 100
    stats.knockbackRes = (stats.knockbackRes > 10) ? 100 : stats.knockbackRes * 10;
    // Calculate effective healing rate
    let effHealingNonRounded = (((20 / stats.healthFinal) * (stats.healingRate / 100)) * 100);
    stats.effHealingRate = effHealingNonRounded.toFixed(2);
    // Fix regen to the actual value per second
    let regenPerSecNonRounded = 0.33 * Math.sqrt(stats.regenPerSec) * (stats.healingRate / 100);
    stats.regenPerSec = regenPerSecNonRounded.toFixed(2);
    // Calculate %hp regen per sec
    stats.regenPerSecPercent = ((regenPerSecNonRounded / stats.healthFinal) * 100).toFixed(2);
    // Fix life drain on crit
    let lifeDrainOnCritFixedNonRounded = (Math.sqrt(stats.lifeDrainOnCrit)) * (effHealingNonRounded / 100);
    stats.lifeDrainOnCrit = lifeDrainOnCritFixedNonRounded.toFixed(2);
    // Calculate %hp regained from life drain on crit
    stats.lifeDrainOnCritPercent = ((lifeDrainOnCritFixedNonRounded / stats.healthFinal) * 100).toFixed(2);

    console.log(stats);

    return stats;
}

export default function SearchForm({ update, build }) {
    function sendUpdate(event) {
        event.preventDefault()
        let itemNames = Object.fromEntries(new FormData(event.target).entries());
        let stats = recalcBuild(itemNames);
        update(stats);
    }

    const formRef = React.useRef();
    const mainhandReference = React.useRef();
    const offhandReference = React.useRef();
    const helmetReference = React.useRef();
    const chestplateReference = React.useRef();
    const leggingsReference = React.useRef();
    const bootsReference = React.useRef();
    
    function copyBuild() {
        let data = new FormData(formRef.current).entries();
        let url = `https://${window.location.host}/builder/`;
        for (const [ key, value ] of data) {
            url += `${key[0]}=${value.replaceAll(" ", "%20")}&`;
        }
        url = url.substring(0, url.length - 1);
    
        if (!navigator.clipboard) {
            window.alert("Couldn't copy build to clipboard. Sadness. :(");
            return;
        }
        navigator.clipboard.writeText(url).then(function() {
            console.log('Copying to clipboard was successful!');
        }, function(err) {
            console.error('Could not copy text: ', err);
        });
    }

    if (build && !initialized) {
        let buildParts = build.split("&");
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

        //m=Intellect Incarnate&o=Aurora Mirror (offhand)&h=Consumption&c=Heart of the Hero&l=Salazar's Greed&b=Chains of Entropy

        mainhandReference?.current?.setValue({ "value": itemNames.mainhand, "label": itemNames.mainhand });
        offhandReference?.current?.setValue({ "value": itemNames.offhand, "label": itemNames.offhand });
        helmetReference?.current?.setValue({ "value": itemNames.helmet, "label": itemNames.helmet });
        chestplateReference?.current?.setValue({ "value": itemNames.chestplate, "label": itemNames.chestplate });
        leggingsReference?.current?.setValue({ "value": itemNames.leggings, "label": itemNames.leggings });
        bootsReference?.current?.setValue({ "value": itemNames.boots, "label": itemNames.boots });

        let stats = recalcBuild(itemNames);
        update(stats);
        initialized = true;
    }

    return (
        <form ref={formRef} onSubmit={sendUpdate}>
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
                    <SelectInput reference={mainhandReference} name="mainhand" noneOption={true} sortableStats={getRelevantItems(["mainhand", "sword", "axe", "wand", "scythe", "bow", "crossbow", "throwable", "trident"])}></SelectInput>
                </div>
                <div className="col-2 text-center">
                    <SelectInput reference={offhandReference} name="offhand" noneOption={true} sortableStats={getRelevantItems(["offhand", "offhand shield", "offhand sword"])}></SelectInput>
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
                    <SelectInput reference={helmetReference} noneOption={true} name="helmet" sortableStats={getRelevantItems(["helmet"])}></SelectInput>
                </div>
                <div className="col-2 text-center">
                    <SelectInput reference={chestplateReference} noneOption={true} name="chestplate" sortableStats={getRelevantItems(["chestplate"])}></SelectInput>
                </div>
                <div className="col-2 text-center">
                    <SelectInput reference={leggingsReference} noneOption={true} name="leggings" sortableStats={getRelevantItems(["leggings"])}></SelectInput>
                </div>
                <div className="col-2 text-center">
                    <SelectInput reference={bootsReference} noneOption={true} name="boots" sortableStats={getRelevantItems(["boots"])}></SelectInput>
                </div>
            </div>
            <div className="row justify-content-center mb-3">
                <div className="col-2 text-center">
                    <input type="submit" className="btn btn-dark w-50" value="Recalculate" />
                </div>
                <div className="col-2 text-center">
                    <button className="btn btn-dark w-50" id="share" onClick={copyBuild}>Share</button>
                </div>
            </div>
        </form>
    )
}