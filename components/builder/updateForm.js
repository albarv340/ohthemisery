import SelectInput from '../items/selectInput';
import CheckboxWithLabel from '../items/checkboxWithLabel';
import itemData from '../../public/items/condensedItemData.json';
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

const refs = {
    formRef: undefined,
    mainhandReference: undefined,
    offhandReference: undefined,
    helmetReference: undefined,
    chestplateReference: undefined,
    leggingsReference: undefined,
    bootsReference: undefined,
    updateFunction: undefined
};

function getRelevantItems(types) {
    let items = Object.keys(itemData);
    return items.filter(name => types.includes(itemData[name].type.toLowerCase().replace(/<.*>/, "").trim()));
}

function checkboxChanged(event) {
    let name = event.target.name;
    enabledBoxes[name] = event.target.checked;
    let itemNames = Object.fromEntries(new FormData(refs.formRef.current).entries());
    let stats = recalcBuild(itemNames);
    refs.updateFunction(stats);
}

function recalcBuild(data) {
    return new Stats(itemData, data, enabledBoxes);
}

function makeBuildString() {
    let data = new FormData(refs.formRef.current).entries();
    let buildString = "";
    let keysToShare = ["mainhand", "offhand", "helmet", "chestplate", "leggings", "boots"];
    for (const [key, value] of data) {
        buildString += (keysToShare.includes(key)) ? `${key[0]}=${value.replaceAll(" ", "%20")}&` : "";
    }
    buildString = buildString.substring(0, buildString.length - 1);
    return buildString;
}


export default function UpdateForm({ update, build, parentLoaded }) {
    function sendUpdate(event) {
        event.preventDefault();
        let itemNames = Object.fromEntries(new FormData(event.target).entries());
        let stats = recalcBuild(itemNames);
        update(stats);
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
            Object.keys(itemNames).forEach(name => {
                if (itemNames[name] === undefined) {
                    itemNames[name] = "None";
                }
            });

            let stats = recalcBuild(itemNames);
            update(stats);
        }
    }, [parentLoaded]);

    const formRef = React.useRef();
    const mainhandReference = React.useRef();
    const offhandReference = React.useRef();
    const helmetReference = React.useRef();
    const chestplateReference = React.useRef();
    const leggingsReference = React.useRef();
    const bootsReference = React.useRef();

    const router = useRouter();

    function resetForm(event) {
        mainhandReference?.current?.setValue({ value: "None", label: "None" });
        offhandReference?.current?.setValue({ value: "None", label: "None" });
        helmetReference?.current?.setValue({ value: "None", label: "None" });
        chestplateReference?.current?.setValue({ value: "None", label: "None" });
        leggingsReference?.current?.setValue({ value: "None", label: "None" });
        bootsReference?.current?.setValue({ value: "None", label: "None" });
        let stats = recalcBuild(emptyBuild);
        update(stats);
        router.push('/builder', `/builder/`, { shallow: true });
    }

    refs["formRef"] = formRef;
    refs["mainhandReference"] = mainhandReference;
    refs["offhandReference"] = offhandReference;
    refs["helmetReference"] = helmetReference;
    refs["chestplateReference"] = chestplateReference;
    refs["leggingsReference"] = leggingsReference;
    refs["bootsReference"] = bootsReference;
    refs["updateFunction"] = update;

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
        return { "value": name, "label": name };
    }

    return (
        <form ref={formRef} onSubmit={sendUpdate} onReset={resetForm}>
            <div className="row justify-content-center mb-3">
                <div className="col-12 col-md-5 col-lg-2 text-center">
                    <p className="mb-1">Mainhand</p>
                    <SelectInput reference={mainhandReference} name="mainhand" default={getEquipName("mainhand")} noneOption={true} sortableStats={getRelevantItems(["mainhand", "sword", "axe", "wand", "scythe", "bow", "crossbow", "throwable", "trident"])}></SelectInput>
                </div>
                <div className="col-12 col-md-5 col-lg-2 text-center">
                    <p className="mb-1">Offhand</p>
                    <SelectInput reference={offhandReference} name="offhand" default={getEquipName("offhand")} noneOption={true} sortableStats={getRelevantItems(["offhand", "offhand shield", "offhand sword"])}></SelectInput>
                </div>
            </div>
            <div className="row justify-content-center mb-4 pt-2">
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <p className="mb-1">Helmet</p>
                    <SelectInput reference={helmetReference} noneOption={true} name="helmet" default={getEquipName("helmet")} sortableStats={getRelevantItems(["helmet"])}></SelectInput>
                </div>
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <p className="mb-1">Chestplate</p>
                    <SelectInput reference={chestplateReference} noneOption={true} name="chestplate" default={getEquipName("chestplate")} sortableStats={getRelevantItems(["chestplate"])}></SelectInput>
                </div>
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <p className="mb-1">Leggings</p>
                    <SelectInput reference={leggingsReference} noneOption={true} name="leggings" default={getEquipName("leggings")} sortableStats={getRelevantItems(["leggings"])}></SelectInput>
                </div>
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <p className="mb-1">Boots</p>
                    <SelectInput reference={bootsReference} noneOption={true} name="boots" default={getEquipName("boots")} sortableStats={getRelevantItems(["boots"])}></SelectInput>
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
        </form>
    )
}