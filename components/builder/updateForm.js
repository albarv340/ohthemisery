import SelectInput from '../items/selectInput';
import CheckboxWithLabel from '../items/checkboxWithLabel';
import itemData from '../../public/items/itemData.json';
import React from 'react';
import { useRouter } from 'next/router';

import Stats from '../../utils/builder/stats';

let initialized = false;

const emptyBuild = {mainhand: "None", offhand: "None", helmet: "None", chestplate: "None", leggings: "None", boots: "None"};

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
    return items.filter(name => types.includes(itemData[name].Type.toLowerCase().replace(/<.*>/, "").trim()));
}

// TO BE REMOVED AS EVERYTHING MOVES TO STATS CLASS
function sumNumberStat(itemStats, statName, defaultIncrement) {
    if (!itemStats) return 0;
    return (itemStats[statName]) ? Number(itemStats[statName]) : (defaultIncrement) ? defaultIncrement : 0;
}

function calculateDamageTaken(noArmor, prot, protmodifier, earmor, eagility, secondwind, tenacity) {
    let damageTaken = {};
    damageTaken.base = ((noArmor) ? 100 * Math.pow(0.96, (prot * protmodifier)) :
    100 * Math.pow(0.96, ((prot * protmodifier) + earmor + eagility) - (0.5 * earmor * eagility / (earmor + eagility))));

    damageTaken.secondwind = ((noArmor) ? 100 * Math.pow(0.96, (prot * protmodifier)) :
    100 * Math.pow(0.96, ((prot * protmodifier) + earmor + eagility) - (0.5 * earmor * eagility / (earmor + eagility))));
    damageTaken.secondwind *= Math.pow(0.9, secondwind);
    
    damageTaken.base = damageTaken.base
        * (1 - (tenacity * 0.005))
        * ((enabledBoxes.resistance) ? 0.9 : 1);
    damageTaken.secondwind = damageTaken.secondwind
        * (1 - (tenacity * 0.005))
        * ((enabledBoxes.resistance) ? 0.9 : 1);

    return damageTaken;
}

function returnArmorAgilityReduction(armor, agility, prots, situationals, health, tenacity) {
    // Prevents things like Auric Tiara from breaking the DR calculations
    // since having negative armor/agility doesn't mean you will take
    // additional damage from enemy attacks.
    armor = (armor < 0) ? 0 : armor;
    agility = (agility < 0) ? 0 : agility;
    
    let moreAgility = false;
    let moreArmor = false;
    let hasEqual = false;
    (agility > armor) ? moreAgility = true : (armor > agility) ? moreArmor = true : hasEqual = true;
    let hasNothing = (hasEqual && armor == 0);

    // For situationals with 20% in mind.
    // Capped at a total of 30 armor/agility effectiveness for r2.
    let situationalArmor = (situationals.adaptability.level > 0) ? Math.min(Math.max(agility, armor), 30) * 0.2 : Math.min(armor, 30) * 0.2;
    let situationalAgility = (situationals.adaptability.level > 0) ? Math.min(Math.max(agility, armor), 30) * 0.2 : Math.min(agility, 30) * 0.2;
    
    let etherealSit = (situationals.ethereal.enabled) ? situationalAgility * situationals.ethereal.level : 0;
    let tempoSit = (situationals.tempo.enabled) ? situationalAgility * situationals.tempo.level : 0;
    let evasionSit = (situationals.evasion.enabled) ? situationalAgility * situationals.evasion.level : 0;
    let reflexesSit = (situationals.reflexes.enabled) ? situationalAgility * situationals.reflexes.level : 0;
    let shieldingSit = (situationals.shielding.enabled) ? situationalArmor * situationals.shielding.level : 0;
    let poiseSit = (situationals.poise.enabled) ? ((health.current / health.final >= 0.9) ? situationalArmor * situationals.poise.level : 0) : 0;
    let inureSit = (situationals.inure.enabled) ? situationalArmor * situationals.inure.level : 0;

    let steadfastArmor = (1 - Math.max(0.2, health.current / health.final)) * 0.25 *
        Math.min(((situationals.adaptability.level > 0 && moreAgility) ? agility : (moreArmor) ? armor : (situationals.adaptability.level == 0) ? armor : 0), 30);
    
    let steadfastSit = (situationals.steadfast.enabled) ? steadfastArmor * situationals.steadfast.level : 0;

    let sumSits = etherealSit + tempoSit + evasionSit + reflexesSit + shieldingSit + poiseSit + inureSit;
    let sumArmorSits = shieldingSit + poiseSit + inureSit;
    let sumAgiSits = etherealSit + tempoSit + evasionSit + reflexesSit;
    
    let armorPlusSits = armor + ((situationals.adaptability.level > 0 && moreArmor) ?
        sumSits : (situationals.adaptability.level > 0 && moreAgility) ?
            armor : (situationals.adaptability.level == 0) ? sumArmorSits : 0);

    let armorPlusSitsSteadfast = armorPlusSits + steadfastSit;
    
    let agilityPlusSits = agility + ((situationals.adaptability.level > 0 && moreAgility) ?
        sumSits : (situationals.adaptability.level > 0 && moreArmor) ?
            agility : (situationals.adaptability.level == 0) ? sumAgiSits : 0);
    let halfArmor = armorPlusSitsSteadfast / 2;
    let halfAgility = agilityPlusSits / 2;

    // there is something weird going on with fall damage. check out: khrosmos/prophetic moonbeam/crest of the tundra/windborn cape/lyrata/mist's wake

    let secondwind = situationals.secondwind.level;

    let meleeDamage = calculateDamageTaken(hasNothing, prots.melee, 2, armorPlusSitsSteadfast, agilityPlusSits, secondwind, tenacity);
    let projectileDamage = calculateDamageTaken(hasNothing, prots.projectile, 2, armorPlusSitsSteadfast, agilityPlusSits, secondwind, tenacity);
    let magicDamage = calculateDamageTaken(hasNothing, prots.magic, 2, armorPlusSitsSteadfast, agilityPlusSits, secondwind, tenacity);
    let blastDamage = calculateDamageTaken(hasNothing, prots.blast, 2, armorPlusSitsSteadfast, agilityPlusSits, secondwind, tenacity);
    let fireDamage = calculateDamageTaken(hasNothing, prots.fire, 2, halfArmor, halfAgility, secondwind, tenacity);
    let fallDamage = calculateDamageTaken(hasNothing, prots.fall, 3, halfArmor, halfAgility, secondwind, tenacity);
    let ailmentDamage = calculateDamageTaken(true, 0, 0, 0, 0, secondwind, tenacity);

    let reductions = {
        melee: {base: 100 - meleeDamage.base, secondwind: 100 - meleeDamage.secondwind},
        projectile: {base: 100 - projectileDamage.base, secondwind: 100 - projectileDamage.secondwind},
        magic: {base: 100 - magicDamage.base, secondwind: 100 - magicDamage.secondwind},
        blast: {base: 100 - blastDamage.base, secondwind: 100 - blastDamage.secondwind},
        fire: {base: 100 - fireDamage.base, secondwind: 100 - fireDamage.secondwind},
        fall: {base: 100 - fallDamage.base, secondwind: 100 - fallDamage.secondwind},
        ailment: {base: 100 - ailmentDamage.base, secondwind: 100 - ailmentDamage.secondwind}
    }

    return reductions;
}

function checkboxChanged(event) {
    let name = event.target.name;
    enabledBoxes[name] = event.target.checked;
    let itemNames = Object.fromEntries(new FormData(refs.formRef.current).entries());
    let stats = recalcBuild(itemNames);
    refs.updateFunction(stats);
}

/************************************************\
*************** BUILD CALCULATIONS ***************
\************************************************/
function recalcBuild(data) {
    // Could even move the calc functions to said class.
    // Or maybe make a static class with methods that accept a stats object and extracts information.
    let stats = new Stats(itemData, data, enabledBoxes);

    // TO BE REMOVED AS IT MOVES TO STATS
    let currHpPercent = (data.health) ? data.health : 100;
    // DR
    let prots = {melee: stats.meleeProt, projectile: stats.projectileProt, magic: stats.magicProt, blast: stats.blastProt, fire: stats.fireProt, fall: stats.fallProt};
    let drs = returnArmorAgilityReduction(stats.armor, stats.agility, prots, stats.situationals, {final: stats.healthFinal, current: stats.currentHealth}, Number(stats.tenacity));

    // Select to show either the regular dr, or dr with second wind currently active based on hp remaining
    let drType = (stats.situationals.secondwind.enabled) ? "secondwind" : "base";
    stats.meleeDR = drs.melee[drType].toFixed(2);
    stats.projectileDR = drs.projectile[drType].toFixed(2);
    stats.magicDR = drs.magic[drType].toFixed(2);
    stats.blastDR = drs.blast[drType].toFixed(2);
    stats.fireDR = drs.fire[drType].toFixed(2);
    stats.fallDR = drs.fall[drType].toFixed(2);
    stats.ailmentDR = drs.ailment[drType].toFixed(2);

    // EHP
    if (stats.situationals.secondwind.level == 0 || drType == "base") {
        stats.meleeEHP = (stats.healthFinal * (currHpPercent / 100) / (1 - drs.melee.base / 100)).toFixed(2);
        stats.projectileEHP = (stats.healthFinal * (currHpPercent / 100) / (1 - drs.projectile.base / 100)).toFixed(2);
        stats.magicEHP = (stats.healthFinal * (currHpPercent / 100) / (1 - drs.magic.base / 100)).toFixed(2);
        stats.blastEHP = (stats.healthFinal * (currHpPercent / 100) / (1 - drs.blast.base / 100)).toFixed(2);
        stats.fireEHP = (stats.healthFinal * (currHpPercent / 100) / (1 - drs.fire.base / 100)).toFixed(2);
        stats.fallEHP = (stats.healthFinal * (currHpPercent / 100) / (1 - drs.fall.base / 100)).toFixed(2);
        stats.ailmentEHP = (stats.healthFinal * (currHpPercent / 100) / (1 - drs.ailment.base / 100)).toFixed(2);
    } else {
        let hpNoSecondWind = Math.max(0, (stats.currentHealth - stats.healthFinal * 0.5));
        let hpSecondWind = Math.min(stats.currentHealth, stats.healthFinal * 0.5);
        stats.meleeEHP = (hpNoSecondWind / (1 - drs.melee.base / 100) + hpSecondWind / (1 - drs.melee.secondwind / 100)).toFixed(2);
        stats.projectileEHP = (hpNoSecondWind / (1 - drs.projectile.base / 100) + hpSecondWind / (1 - drs.projectile.secondwind / 100)).toFixed(2);
        stats.magicEHP = (hpNoSecondWind / (1 - drs.magic.base / 100) + hpSecondWind / (1 - drs.magic.secondwind / 100)).toFixed(2);
        stats.blastEHP = (hpNoSecondWind / (1 - drs.blast.base / 100) + hpSecondWind / (1 - drs.blast.secondwind / 100)).toFixed(2);
        stats.fireEHP = (hpNoSecondWind / (1 - drs.fire.base / 100) + hpSecondWind / (1 - drs.fire.secondwind / 100)).toFixed(2);
        stats.fallEHP = (hpNoSecondWind / (1 - drs.fall.base / 100) + hpSecondWind / (1 - drs.fall.secondwind / 100)).toFixed(2);
        stats.ailmentEHP = (hpNoSecondWind / (1 - drs.ailment.base / 100) + hpSecondWind / (1 - drs.ailment.secondwind / 100)).toFixed(2);
    }

    // Health Normalized DR
    stats.meleeHNDR = ((1 - ((1 - (drs.melee[drType] / 100)) / (stats.healthFinal / 20))) * 100).toFixed(2);
    stats.projectileHNDR = ((1 - ((1 - (drs.projectile[drType] / 100)) / (stats.healthFinal / 20))) * 100).toFixed(2);
    stats.magicHNDR = ((1 - ((1 - (drs.magic[drType] / 100)) / (stats.healthFinal / 20))) * 100).toFixed(2);
    stats.blastHNDR = ((1 - ((1 - (drs.blast[drType] / 100)) / (stats.healthFinal / 20))) * 100).toFixed(2);
    stats.fireHNDR = ((1 - ((1 - (drs.fire[drType] / 100)) / (stats.healthFinal / 20))) * 100).toFixed(2);
    stats.fallHNDR = ((1 - ((1 - (drs.fall[drType] / 100)) / (stats.healthFinal / 20))) * 100).toFixed(2);
    stats.ailmentHNDR = ((1 - ((1 - (drs.ailment[drType] / 100)) / (stats.healthFinal / 20))) * 100).toFixed(2);

    if (enabledBoxes.scout) {
        let extraAttackDamagePercent = (stats.projectileDamagePercent - 100) * 0.5;
        let extraProjectileDamagePercent = (stats.attackDamagePercent - 100) * 0.4;
        stats.attackDamagePercent += extraAttackDamagePercent;
        stats.projectileDamagePercent += extraProjectileDamagePercent;
    }

    // Melee Stats
    let attackDamage = sumNumberStat(stats.itemStats.mainhand, "Base Attack Damage", stats.attackDamage)
        * (stats.attackDamagePercent / 100)
        * ((enabledBoxes.strength) ? 1.1 : 1)
        * ((enabledBoxes.fol) ? 1.15 : 1)
        * ((enabledBoxes.clericblessing) ? 1.35 : 1)
        * (1 + 0.01 * Number(stats.vigor))
        * ((currHpPercent <= 50) ? 1 - 0.1 * stats.crippling : 1);
    stats.attackDamage = attackDamage.toFixed(2);
    let attackSpeed = (sumNumberStat(stats.itemStats.mainhand, "Base Attack Speed", stats.attackSpeed) + stats.attackSpeedFlatBonus) * (stats.attackSpeedPercent / 100);
    stats.attackSpeed = attackSpeed.toFixed(2);
    let attackDamageCrit = (attackDamage * 1.5)
    stats.attackDamageCrit = attackDamageCrit.toFixed(2);
    stats.iframeDPS = ((attackSpeed >= 2) ? attackDamage * 2 : attackDamage * attackSpeed).toFixed(2);
    stats.iframeCritDPS = ((attackSpeed >= 2) ? attackDamageCrit * 2 : attackDamageCrit * attackSpeed).toFixed(2);

    // Projectile Stats
    let projectileDamage = sumNumberStat(stats.itemStats.mainhand, "Base Proj Damage", stats.projectileDamage)
        * (stats.projectileDamagePercent / 100)
        * ((enabledBoxes.strength) ? 1.1 : 1)
        * ((enabledBoxes.fol) ? 1.15 : 1)
        * ((enabledBoxes.clericblessing) ? 1.35 : 1)
        * (1 + 0.01 * Number(stats.focus));
    stats.projectileDamage = projectileDamage.toFixed(2);
    let projectileSpeed = sumNumberStat(stats.itemStats.mainhand, "Base Proj Speed", stats.projectileSpeed) * (stats.projectileSpeedPercent / 100);
    stats.projectileSpeed = projectileSpeed.toFixed(2);
    let throwRate = sumNumberStat(stats.itemStats.mainhand, "Base Throw Rate", stats.throwRate) * (stats.throwRatePercent / 100);
    stats.throwRate = throwRate.toFixed(2);

    // Magic Stats
    stats.spellPowerPercent = 100 + sumNumberStat(stats.itemStats.mainhand, "Base Spell Power", 0);
    stats.spellDamage = ((stats.spellPowerPercent / 100)
        * (stats.magicDamagePercent / 100)
        * ((enabledBoxes.strength) ? 1.1 : 1)
        * ((enabledBoxes.fol) ? 1.15 : 1)
        * (1 + 0.01 * Number(stats.perspicacity)))
        * 100;
    stats.spellDamage = stats.spellDamage.toFixed(2);
    stats.spellCooldownPercent = (100 * Math.pow(0.95, stats.aptitude + stats.ineptitude)).toFixed(2);

    return stats;
}

function makeBuildString() {
    let data = new FormData(refs.formRef.current).entries();
    let buildString = "";
    let keysToShare = ["mainhand", "offhand", "helmet", "chestplate", "leggings", "boots"];
    for (const [ key, value ] of data) {
        buildString += (keysToShare.includes(key)) ? `${key[0]}=${value.replaceAll(" ", "%20")}&` : "";
    }
    buildString = buildString.substring(0, buildString.length - 1);
    return buildString;
}

export default function UpdateForm({ update, build }) {
    function sendUpdate(event) {
        event.preventDefault();
        let itemNames = Object.fromEntries(new FormData(event.target).entries());
        let stats = recalcBuild(itemNames);
        update(stats);
        if (!build) {
            router.push('/builder', `/builder/${makeBuildString()}`, { shallow: true });
        }
    }

    const formRef = React.useRef();
    const mainhandReference = React.useRef();
    const offhandReference = React.useRef();
    const helmetReference = React.useRef();
    const chestplateReference = React.useRef();
    const leggingsReference = React.useRef();
    const bootsReference = React.useRef();
    
    const router = useRouter();

    function resetForm(event) {
        mainhandReference?.current?.setValue({value: "None", label: "None"});
        offhandReference?.current?.setValue({value: "None", label: "None"});
        helmetReference?.current?.setValue({value: "None", label: "None"});
        chestplateReference?.current?.setValue({value: "None", label: "None"});
        leggingsReference?.current?.setValue({value: "None", label: "None"});
        bootsReference?.current?.setValue({value: "None", label: "None"});
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
        setTimeout(() => {event.target.value = "Share"; event.target.classList.remove("fw-bold")}, 3000);
    
        if (!navigator.clipboard) {
            window.alert("Couldn't copy build to clipboard. Sadness. :(");
            return;
        }
        navigator.clipboard.writeText(`${baseUrl}${makeBuildString()}`).then(function() {
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
        };

        Object.keys(itemNames).forEach(name => {
            if (itemNames[name] === undefined) {
                itemNames[name] = "None";
            }
        });

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
        <form ref={formRef} onSubmit={sendUpdate} onReset={resetForm}>
            <div className="row justify-content-center mb-3">
                <div className="col-12 col-md-5 col-lg-2 text-center">
                    <p className="mb-1">Mainhand</p>
                    <SelectInput reference={mainhandReference} name="mainhand" noneOption={true} sortableStats={getRelevantItems(["mainhand", "sword", "axe", "wand", "scythe", "bow", "crossbow", "throwable", "trident"])}></SelectInput>
                </div>
                <div className="col-12 col-md-5 col-lg-2 text-center">
                    <p className="mb-1">Offhand</p>
                    <SelectInput reference={offhandReference} name="offhand" noneOption={true} sortableStats={getRelevantItems(["offhand", "offhand shield", "offhand sword"])}></SelectInput>
                </div>
            </div>
            <div className="row justify-content-center mb-4 pt-2">
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <p className="mb-1">Helmet</p>
                    <SelectInput reference={helmetReference} noneOption={true} name="helmet" sortableStats={getRelevantItems(["helmet"])}></SelectInput>
                </div>
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <p className="mb-1">Chestplate</p>
                    <SelectInput reference={chestplateReference} noneOption={true} name="chestplate" sortableStats={getRelevantItems(["chestplate"])}></SelectInput>
                </div>
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <p className="mb-1">Leggings</p>
                    <SelectInput reference={leggingsReference} noneOption={true} name="leggings" sortableStats={getRelevantItems(["leggings"])}></SelectInput>
                </div>
                <div className="col-12 col-md-3 col-lg-2 text-center">
                    <p className="mb-1">Boots</p>
                    <SelectInput reference={bootsReference} noneOption={true} name="boots" sortableStats={getRelevantItems(["boots"])}></SelectInput>
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