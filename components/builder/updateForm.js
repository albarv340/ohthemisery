import SelectInput from '../items/selectInput';
import CheckboxWithLabel from '../items/checkboxWithLabel';
import ItemTile from '../../components/items/itemTile';
import MasterworkableItemTile from '../../components/items/masterworkableItemTile';
import itemData from '../../public/items/itemData.json';
import React from 'react';
import { useRouter } from 'next/router';

import Stats from '../../utils/builder/stats';

const emptyBuild = { mainhand: "None", offhand: "None", helmet: "None", chestplate: "None", leggings: "None", boots: "None" };

const enabledBoxes = {
    // Situationals
    shielding: false,
    poise: false,
    inure: false,
    steadfast: false,
    ethereal: false,
    reflexes: false,
    evasion: false,
    tempo: false,
    secondwind: false,
    // Patron Buffs
    speed: false,
    resistance: false,
    strength: false,
    // Other Buffs
    scout: false,
    fol: false, // Fruit of Life
    clericblessing: false
};

function groupMasterwork(items) {
    // Group up masterwork tiers by their name using an object, removing them from items.
    let masterworkItems = {};
    // Go through the array in reverse order to have the splice work properly
    // (items will go down in position if not removed from the end)
    for (let i = items.length - 1; i >= 0; i--) {
        let name = items[i];
        if (itemData[name].masterwork != undefined) {
            let itemName = itemData[name].name;
            if (!masterworkItems[itemName]) {
                masterworkItems[itemName] = [];
            }
            masterworkItems[itemName].push(itemData[name]);
            items.splice(i, 1);
        }
    }
    
    // Re-insert the groups as arrays into the items array.
    Object.keys(masterworkItems).forEach(item => {
        items.push({ value: `${item}-${masterworkItems[item][0].masterwork}`, label: item });
    });

    return items;
}

function getRelevantItems(types) {
    let items = Object.keys(itemData);
    return groupMasterwork(items.filter(name => types.includes(itemData[name].type.toLowerCase().replace(/<.*>/, "").trim())));
}

function recalcBuild(data) {
    let tempStats = new Stats(itemData, data, enabledBoxes);
    return tempStats
}

function createMasterworkData(name) {
    return Object.keys(itemData).filter(itemName => itemData[itemName].name == name).map(itemName => itemData[itemName]);
}

function removeMasterworkFromName(name) {
    return name.replace(/-\d$/g, "");
}

function checkExists(type, itemsToDisplay) {
    let retVal = false;
    if (itemsToDisplay.itemStats) {
        retVal = itemsToDisplay.itemStats[type] !== undefined;
    }
    if (itemsToDisplay.itemNames && itemsToDisplay.itemNames[type] && createMasterworkData(removeMasterworkFromName(itemsToDisplay.itemNames[type]))[0]?.masterwork != undefined) {
        retVal = true;
    }
    return retVal;
}

export default function UpdateForm({ update, build, parentLoaded }) {
    const [stats, setStats] = React.useState({});

    function sendUpdate(event) {
        event.preventDefault();
        const itemNames = Object.fromEntries(new FormData(event.target).entries());
        const tempStats = recalcBuild(itemNames);
        setStats(tempStats);
        update(tempStats);
        router.push(`/builder?${makeBuildString()}`, `/builder/${makeBuildString()}`, { shallow: true });
    }

    React.useEffect(() => {
        if (parentLoaded && build) {
            let buildParts = decodeURI(build).split("&");
            let itemNames = {
                mainhand: (buildParts.find(str => str.includes("m="))?.split("m=")[1]),
                offhand: (buildParts.find(str => str.includes("o="))?.split("o=")[1]),
                helmet: (buildParts.find(str => str.includes("h="))?.split("h=")[1]),
                chestplate: (buildParts.find(str => str.includes("c="))?.split("c=")[1]),
                leggings: (buildParts.find(str => str.includes("l="))?.split("l=")[1]),
                boots: (buildParts.find(str => str.includes("b="))?.split("b=")[1])
            };
            Object.keys(itemNames).forEach(type => {
                if (itemNames[type] === undefined || !Object.keys(itemData).includes(itemNames[type])) {
                    itemNames[type] = "None";
                }
            });
            const tempStats = recalcBuild(itemNames);
            setStats(tempStats);
            update(tempStats);
        }
    }, [parentLoaded]);

    const itemTypes = ["mainhand", "offhand", "helmet", "chestplate", "leggings", "boots"];

    const formRef = React.useRef();
    const router = useRouter();
    const itemRefs = {
        mainhand: React.useRef(),
        offhand: React.useRef(),
        helmet: React.useRef(),
        chestplate: React.useRef(),
        leggings: React.useRef(),
        boots: React.useRef()
    }

    function resetForm(event) {
        for (let ref in itemRefs) {
            itemRefs[ref].current.setValue({ value: "None", label: "None" });
        }
        const tempStats = recalcBuild(emptyBuild)
        setStats(tempStats);
        update(tempStats);
        router.push('/builder', `/builder/`, { shallow: true });
    }

    function receiveMasterworkUpdate(newActiveItem, itemType) {
        let newBuild = {};
        for (let ref in itemRefs) {
            newBuild[ref] = itemRefs[ref].current.getValue()[0].value;
        }
        let mainhands = ["mainhand", "sword", "axe", "wand", "scythe", "bow", "crossbow", "throwable", "trident"];
        let offhands = ["offhand", "offhand shield", "offhand sword"];
        let actualItemType = (mainhands.includes(itemType.toLowerCase())) ? "mainhand" : (offhands.includes(itemType.toLowerCase())) ? "offhand" : itemType.toLowerCase();
        console.log(newActiveItem);
        
        const manualBuildString = encodeURI(decodeURI(makeBuildString()).replace(newBuild[actualItemType.toLowerCase()], `${newActiveItem.name}-${newActiveItem.masterwork}`));
        newBuild[actualItemType.toLowerCase()] = `${newActiveItem.name}-${newActiveItem.masterwork}`;
        itemRefs[actualItemType.toLowerCase()].current.setValue({ "value": `${newActiveItem.name}-${newActiveItem.masterwork}`, "label": newActiveItem.name });
        router.push(`/builder?${manualBuildString}`, `/builder/${manualBuildString}`, { shallow: true });

        const tempStats = recalcBuild(newBuild)
        setStats(tempStats);
        update(tempStats);
    }

    function copyBuild(event) {
        let baseUrl = `${window.location.origin}/builder/`;
        event.target.value = "Copied!";
        event.target.classList.add("fw-bold");
        setTimeout(() => { event.target.value = "Share"; event.target.classList.remove("fw-bold") }, 3000);

        if (!navigator.clipboard) {
            window.alert("Couldn't copy build to clipboard. Sadness. :(");
            return;
        }
        navigator.clipboard.writeText(`${baseUrl}${makeBuildString()}`).then(function () {
            console.log('Copying to clipboard was successful!');
        }, function (err) {
            console.error('Could not copy text: ', err);
        });
    }

    function getEquipName(type) {
        if (!build) return undefined
        let buildParts = decodeURI(build).split("&");
        let allowedTypes = ["mainhand", "offhand", "helmet", "chestplate", "leggings", "boots"]
        let name = (allowedTypes.includes(type)) ? buildParts.find(str => str.includes(`${type[0]}=`))?.split(`${type[0]}=`)[1] : "None";
        if (!Object.keys(itemData).includes(name)) {
            return { "value": "None", "label": "None" };
        }
        return { "value": name, "label": removeMasterworkFromName(name) };
    }

    function makeBuildString() {
        let data = new FormData(formRef.current).entries();
        let buildString = "";
        let keysToShare = ["mainhand", "offhand", "helmet", "chestplate", "leggings", "boots"];
        for (const [key, value] of data) {
            buildString += (keysToShare.includes(key)) ? `${key[0]}=${value.replaceAll(" ", "%20")}&` : "";
        }
        buildString = buildString.substring(0, buildString.length - 1);
        return buildString;
    }

    function checkboxChanged(event) {
        const name = event.target.name;
        enabledBoxes[name] = event.target.checked;
        const itemNames = Object.fromEntries(new FormData(formRef.current).entries());
        const tempStats = recalcBuild(itemNames)
        setStats(tempStats);
        updateFunction(tempStats);
    }

    return (
        <form ref={formRef} onSubmit={sendUpdate} onReset={resetForm}>
            <div className="row justify-content-center mb-3">
                <div className="col-12 col-md-5 col-lg-2 text-center">
                    <p className="mb-1">Mainhand</p>
                    <SelectInput reference={itemRefs.mainhand} name="mainhand" default={getEquipName("mainhand")} noneOption={true} sortableStats={getRelevantItems(["mainhand", "sword", "axe", "wand", "scythe", "bow", "crossbow", "throwable", "trident"])}></SelectInput>
                </div>
                <div className="col-12 col-md-5 col-lg-2 text-center">
                    <p className="mb-1">Offhand</p>
                    <SelectInput reference={itemRefs.offhand} name="offhand" default={getEquipName("offhand")} noneOption={true} sortableStats={getRelevantItems(["offhand", "offhand shield", "offhand sword"])}></SelectInput>
                </div>
            </div>
            <div className="row justify-content-center mb-4 pt-2">
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <p className="mb-1">Helmet</p>
                    <SelectInput reference={itemRefs.helmet} noneOption={true} name="helmet" default={getEquipName("helmet")} sortableStats={getRelevantItems(["helmet"])}></SelectInput>
                </div>
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <p className="mb-1">Chestplate</p>
                    <SelectInput reference={itemRefs.chestplate} noneOption={true} name="chestplate" default={getEquipName("chestplate")} sortableStats={getRelevantItems(["chestplate"])}></SelectInput>
                </div>
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <p className="mb-1">Leggings</p>
                    <SelectInput reference={itemRefs.leggings} noneOption={true} name="leggings" default={getEquipName("leggings")} sortableStats={getRelevantItems(["leggings"])}></SelectInput>
                </div>
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <p className="mb-1">Boots</p>
                    <SelectInput reference={itemRefs.boots} noneOption={true} name="boots" default={getEquipName("boots")} sortableStats={getRelevantItems(["boots"])}></SelectInput>
                </div>
            </div>
            <div className="row justify-content-center mb-3">
                <div className="col-4 col-md-3 col-lg-1 text-center">
                    <input type="submit" className="btn btn-dark" value="Recalculate" />
                </div>
                <div className="col-4 col-md-3 col-lg-1 text-center">
                    <input type="button" className="btn btn-dark" id="share" onClick={copyBuild} value="Share" />
                </div>
                <div className="col-4 col-md-3 col-lg-1 text-center">
                    <input type="reset" className="btn btn-danger" />
                </div>
            </div>
            <div className="row justify-content-center pt-2">
                <CheckboxWithLabel name="Shielding" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Poise" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Inure" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Steadfast" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="SecondWind" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Ethereal" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Reflexes" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Evasion" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Tempo" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Scout" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="ClericBlessing" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="FOL" checked={false} onChange={checkboxChanged} />
            </div>
            <div className="row justify-content-center pt-2">
                <p className="text-center mb-1">Patron Buffs</p>
                <CheckboxWithLabel name="Speed" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Resistance" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Strength" checked={false} onChange={checkboxChanged} />
            </div>
            <div className="row justify-content-center mb-3 pt-2">
                <div className="col text-center">
                    <p className="mb-1">Health%</p>
                    <input type="number" name="health" min="1" max="100" defaultValue="100" className="" />
                </div>
                <div className="col text-center">
                    <p className="mb-1">Tenacity</p>
                    <input type="number" name="tenacity" min="0" max="24" defaultValue="0" className="" />
                </div>
                <div className="col text-center">
                    <p className="mb-1">Vitality</p>
                    <input type="number" name="vitality" min="0" max="24" defaultValue="0" className="" />
                </div>
                <div className="col text-center">
                    <p className="mb-1">Vigor</p>
                    <input type="number" name="vigor" min="0" max="24" defaultValue="0" className="" />
                </div>
                <div className="col text-center">
                    <p className="mb-1">Focus</p>
                    <input type="number" name="focus" min="0" max="24" defaultValue="0" className="" />
                </div>
                <div className="col text-center">
                    <p className="mb-1">Perspicacity</p>
                    <input type="number" name="perspicacity" min="0" max="24" defaultValue="0" className="" />
                </div>
            </div>
            <div className="row mb-2 pt-2">
                <span className="text-center text-danger fs-2 fw-bold">{(stats.corruption > 1) ? "YOU HAVE MORE THAN ONE CURSE OF CORRUPTION ITEM" : ""}</span>
            </div>
            <div className="row mb-2 pt-2">
                <span className="text-center text-danger fs-2 fw-bold">{(stats.twoHanded && !stats.weightless && stats.itemNames.offhand != "None") ? "YOU ARE USING A TWO HANDED MAINHAND WITH A NON WEIGHTLESS OFFHAND" : ""}</span>
            </div>
            <div className="row justify-content-center mb-2">
                {
                    itemTypes.map(type =>
                        (checkExists(type, stats)) ?
                            (stats.fullItemData[type].masterwork != undefined) ?
                                <MasterworkableItemTile update={receiveMasterworkUpdate} key={stats.itemNames[type]} name={removeMasterworkFromName(stats.itemNames[type])} item={createMasterworkData(removeMasterworkFromName(stats.itemNames[type]))} default={Number(stats.itemNames[type].split("-")[1])}></MasterworkableItemTile> :
                                <ItemTile key={type} name={stats.itemNames[type]} item={stats.fullItemData[type]}></ItemTile> : ""
                    )
                }
            </div>
        </form>
    )
}