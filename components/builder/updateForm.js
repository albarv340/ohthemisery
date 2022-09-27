import SelectInput from '../items/selectInput';
import CheckboxWithLabel from '../items/checkboxWithLabel';
import itemData from '../../public/items/itemData.json';
import React from 'react';
import { useRouter } from 'next/router';

let initialized = false;

const emptyBuild = {mainhand: "None", offhand: "None", helmet: "None", chestplate: "None", leggings: "None", boots: "None"};

const enabledSituationals = {
    shielding: false,
    poise: false,
    inure: false,
    steadfast: false,
    ethereal: false,
    reflexes: false,
    evasion: false,
    tempo: false
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

function sumNumberStat(itemStats, statName, defaultIncrement) {
    if (!itemStats) return 0;
    return (itemStats[statName]) ? Number(itemStats[statName]) : (defaultIncrement) ? defaultIncrement : 0;
}

function sumEnchantmentStat(itemStats, enchName, perLevelMultiplier) {
    if (!itemStats) return (perLevelMultiplier) ? perLevelMultiplier : 0;
    return (itemStats[enchName]) ? Number(itemStats[enchName]) * perLevelMultiplier : 0;
}

function calculateDamageTaken(noArmor, prot, protmodifier, earmor, eagility) {
    return ((noArmor) ? 100 * Math.pow(0.96, prot * protmodifier) :
        100 * Math.pow(0.96, ((prot * protmodifier) + earmor + eagility) - (0.5 * earmor * eagility / (earmor + eagility))));
    
}

function returnArmorAgilityReduction(armor, agility, prots, situationals) {
    let hasMoreAgility = false;
    let hasMoreArmor = false;
    let hasEqual = false;
    (agility > armor) ? hasMoreAgility = true : (armor > agility) ? hasMoreArmor = true : hasEqual = true;

    let situationalArmor = (situationals.adaptability.level > 0) ? Math.min(Math.max(agility, armor), 30) * 0.2 : Math.min(armor, 30) * 0.2;
    let situationalAgility = (situationals.adaptability.level > 0) ? Math.min(Math.max(agility, armor), 30) * 0.2 : Math.min(agility, 30) * 0.2;
    
    let etherealSit = (situationals.ethereal.enabled) ? situationalAgility * situationals.ethereal.level : 0;
    let tempoSit = (situationals.tempo.enabled) ? situationalAgility * situationals.tempo.level : 0;
    let evasionSit = (situationals.evasion.enabled) ? situationalAgility * situationals.evasion.level : 0;
    let reflexesSit = (situationals.reflexes.enabled) ? situationalAgility * situationals.reflexes.level : 0;
    let shieldingSit = (situationals.shielding.enabled) ? situationalArmor * situationals.shielding.level : 0;
    let poiseSit = (situationals.poise.enabled) ? situationalArmor * situationals.poise.level * 1 : 0; // * 1 can change to * 0 if hp < 90% maxhp if added in the future
    let inureSit = (situationals.inure.enabled) ? situationalArmor * situationals.inure.level : 0;

    let steadfastArmor = (1 - Math.max(0.2, 1/*= currHp / maxHp */)) * 0.25 *
        Math.min(((situationals.adaptability.level > 0 && agility > armor) ? agility : (agility < armor) ? armor : (situationals.adaptability.level == 0) ? armor : 0), 30);
    
    let steadfastSit = (situationals.steadfast.enabled) ? steadfastArmor * situationals.steadfast.level : 0;

    let sumSits = etherealSit + tempoSit + evasionSit + reflexesSit + shieldingSit + poiseSit + inureSit;
    let sumArmorSits = shieldingSit + poiseSit + inureSit;
    let sumAgiSits = etherealSit + tempoSit + evasionSit + reflexesSit;
    
    let armorPlusSits = armor + ((situationals.adaptability.level > 0 && armor > agility) ?
         sumSits : (situationals.adaptability.level > 0 && armor < agility) ?
            armor : (situationals.adaptability.level == 0) ? sumArmorSits : 0);

            
    let armorPlusSitsSteadfast = armorPlusSits + (steadfastArmor * situationals.steadfast.level * (situationals.steadfast.enabled) ? 1 : 0);
    
    let agilityPlusSits = agility + ((situationals.adaptability.level > 0 && armor < agility) ? sumSits : (situationals.adaptability.level > 0 && armor > agility) ? agility : (situationals.adaptability.level == 0) ? sumAgiSits : 0);
    let halfArmor = armorPlusSits / 2;
    let halfAgility = agilityPlusSits / 2;

    // second wind: half total ehp + half total ehp with second wind added onto it
    // there is something weird going on with fall damage. check out: khrosmos/prophetic moonbeam/crest of the tundra/windborn cape/lyrata/mist's wake
    
    let meleeDamage = calculateDamageTaken(hasEqual && armor == 0, prots.melee, 2, armorPlusSitsSteadfast, agilityPlusSits);
    let projectileDamage = calculateDamageTaken(hasEqual && armor == 0, prots.projectile, 2, armorPlusSitsSteadfast, agilityPlusSits);
    let magicDamage = calculateDamageTaken(hasEqual && armor == 0, prots.magic, 2, armorPlusSitsSteadfast, agilityPlusSits);
    let blastDamage = calculateDamageTaken(hasEqual && armor == 0, prots.blast, 2, armorPlusSitsSteadfast, agilityPlusSits);
    let fireDamage = calculateDamageTaken(hasEqual && armor == 0, prots.fire, 2, halfArmor, halfAgility);
    let fallDamage = calculateDamageTaken(hasEqual && armor == 0, prots.fall, 3, halfArmor, halfAgility);

    let reductions = {
        melee: 100 - meleeDamage,
        projectile: 100 - projectileDamage,
        magic: 100 - magicDamage,
        blast: 100 - blastDamage,
        fire: 100 - fireDamage,
        fall: 100 - fallDamage
    }

    return reductions;
}

function checkboxChanged(event) {
    enabledSituationals[event.target.name] = event.target.checked;
    let itemNames = Object.fromEntries(new FormData(refs.formRef.current).entries());
    let stats = recalcBuild(itemNames);
    refs.updateFunction(stats);
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
        situationals: {
            shielding: {enabled: enabledSituationals.shielding, level: 0},
            poise: {enabled: enabledSituationals.poise, level: 0},
            inure: {enabled: enabledSituationals.inure, level: 0},
            steadfast: {enabled: enabledSituationals.steadfast, level: 0},
            ethereal: {enabled: enabledSituationals.ethereal, level: 0},
            reflexes: {enabled: enabledSituationals.reflexes, level: 0},
            evasion: {enabled: enabledSituationals.evasion, level: 0},
            tempo: {enabled: enabledSituationals.tempo, level: 0},
            adaptability: {enabled: true, level: 0}
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
        lifeDrainOnCritPercent: 0,

        meleeProt: 0,
        projectileProt: 0,
        magicProt: 0,
        blastProt: 0,
        fireProt: 0,
        fallProt: 0,
        ailmentProt: 0,

        meleeHNDR: 0,
        projectileHNDR: 0,
        magicHNDR: 0,
        blastHNDR: 0,
        fireHNDR: 0,
        fallHNDR: 0,
        ailmentHNDR: 0,

        meleeDR: 0,
        projectileDR: 0,
        magicDR: 0,
        blastDR: 0,
        fireDR: 0,
        fallDR: 0,
        ailmentDR: 0,

        meleeEHP: 0,
        projectileEHP: 0,
        magicEHP: 0,
        blastEHP: 0,
        fireEHP: 0,
        fallEHP: 0,
        ailmentEHP: 0,

        hasMoreArmor: false,
        hasMoreAgility: false,
        hasEqualDefenses: false,

        attackDamagePercent: 100,
        attackSpeedPercent: 100,
        attackSpeed: 4,
        attackSpeedFlatBonus: 0,
        attackDamage: 1,
        attackDamageCrit: 1.5,
        iframeDPS: 2,
        iframeCritDPS: 3,

        projectileDamagePercent: 100,
        projectileDamage: 0,
        projectileSpeedPercent: 100,
        projectileSpeed: 0,
        throwRatePercent: 100,
        throwRate: 0,

        magicDamagePercent: 100,
        spellPowerPercent: 100,
        spellDamage: 100,
        spellCooldownPercent: 100,

        aptitude: 0,
        ineptitude: 0

    };

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

            stats.meleeProt += sumNumberStat(itemStats, "Melee Prot.");
            stats.projectileProt += sumNumberStat(itemStats, "Projectile Prot.");
            stats.magicProt += sumNumberStat(itemStats, "Magic Prot.");
            stats.blastProt += sumNumberStat(itemStats, "Blast Prot.");
            stats.fireProt += sumNumberStat(itemStats, "Fire Prot.");
            stats.fallProt += sumNumberStat(itemStats, "Feather Falling");

            stats.attackDamagePercent += sumNumberStat(itemStats, "Attack Damage");
            stats.attackSpeedPercent += sumNumberStat(itemStats, "Attack Speed %");
            stats.attackSpeedFlatBonus += sumNumberStat(itemStats, "Attack Speed");

            stats.projectileDamagePercent += sumNumberStat(itemStats, "Proj Damage");
            stats.projectileSpeedPercent += sumNumberStat(itemStats, "Proj Speed");

            stats.magicDamagePercent += sumNumberStat(itemStats, "Magic Damage");

            stats.aptitude += sumEnchantmentStat(itemStats, "Aptitude", 1);
            stats.ineptitude += sumEnchantmentStat(itemStats, "Ineptitude", -1);

            stats.situationals.shielding.level += sumNumberStat(itemStats, "Shielding");
            stats.situationals.poise.level += sumNumberStat(itemStats, "Poise");
            stats.situationals.inure.level += sumNumberStat(itemStats, "Inure");
            stats.situationals.steadfast.level += sumNumberStat(itemStats, "Steadfast");
            stats.situationals.ethereal.level += sumNumberStat(itemStats, "Ethereal ");
            stats.situationals.reflexes.level += sumNumberStat(itemStats, "Reflexes ");
            stats.situationals.evasion.level += sumNumberStat(itemStats, "Evasion");
            stats.situationals.tempo.level += sumNumberStat(itemStats, "Tempo ");
            stats.situationals.adaptability.level += sumNumberStat(itemStats, "Adaptability");
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

    // DR
    let prots = {melee: stats.meleeProt, projectile: stats.projectileProt, magic: stats.magicProt, blast: stats.blastProt, fire: stats.fireProt, fall: stats.fallProt};
    let drs = returnArmorAgilityReduction(stats.armor, stats.agility, prots, stats.situationals);

    stats.meleeDR = drs.melee.toFixed(2);
    stats.projectileDR = drs.projectile.toFixed(2);
    stats.magicDR = drs.magic.toFixed(2);
    stats.blastDR = drs.blast.toFixed(2);
    stats.fireDR = drs.fire.toFixed(2);
    stats.fallDR = drs.fall.toFixed(2);

    // EHP
    stats.meleeEHP = (stats.healthFinal / (1 - drs.melee / 100)).toFixed(2);
    stats.projectileEHP = (stats.healthFinal / (1 - drs.projectile / 100)).toFixed(2);
    stats.magicEHP = (stats.healthFinal / (1 - drs.magic / 100)).toFixed(2);
    stats.blastEHP = (stats.healthFinal / (1 - drs.blast / 100)).toFixed(2);
    stats.fireEHP = (stats.healthFinal / (1 - drs.fire / 100)).toFixed(2);
    stats.fallEHP = (stats.healthFinal / (1 - drs.fall / 100)).toFixed(2);
    stats.ailmentEHP = stats.healthFinal;

    // Health Normalized DR
    stats.meleeHNDR = ((1 - ((1 - (drs.melee / 100)) / (stats.healthFinal / 20))) * 100).toFixed(2);
    stats.projectileHNDR = ((1 - ((1 - (drs.projectile / 100)) / (stats.healthFinal / 20))) * 100).toFixed(2);
    stats.magicHNDR = ((1 - ((1 - (drs.magic / 100)) / (stats.healthFinal / 20))) * 100).toFixed(2);
    stats.blastHNDR = ((1 - ((1 - (drs.blast / 100)) / (stats.healthFinal / 20))) * 100).toFixed(2);
    stats.fireHNDR = ((1 - ((1 - (drs.fire / 100)) / (stats.healthFinal / 20))) * 100).toFixed(2);
    stats.fallHNDR = ((1 - ((1 - (drs.fall / 100)) / (stats.healthFinal / 20))) * 100).toFixed(2);
    stats.ailmentHNDR = ((1 - (1 / (stats.healthFinal / 20))) * 100).toFixed(2);

    // Melee Stats
    let attackDamage = sumNumberStat(stats.itemStats.mainhand, "Base Attack Damage", stats.attackDamage) * (stats.attackDamagePercent / 100);
    stats.attackDamage = attackDamage.toFixed(2);
    let attackSpeed = (sumNumberStat(stats.itemStats.mainhand, "Base Attack Speed", stats.attackSpeed) + stats.attackSpeedFlatBonus) * (stats.attackSpeedPercent / 100);
    stats.attackSpeed = attackSpeed.toFixed(2);
    let attackDamageCrit = (attackDamage * 1.5)
    stats.attackDamageCrit = attackDamageCrit.toFixed(2);
    stats.iframeDPS = ((attackSpeed >= 2) ? attackDamage * 2 : attackDamage * attackSpeed).toFixed(2);
    stats.iframeCritDPS = ((attackSpeed >= 2) ? attackDamageCrit * 2 : attackDamageCrit * attackSpeed).toFixed(2);

    // Projectile Stats
    let projectileDamage = sumNumberStat(stats.itemStats.mainhand, "Base Proj Damage", stats.projectileDamage) * (stats.projectileDamagePercent / 100);
    stats.projectileDamage = projectileDamage.toFixed(2);
    let projectileSpeed = sumNumberStat(stats.itemStats.mainhand, "Base Proj Speed", stats.projectileSpeed) * (stats.projectileSpeedPercent / 100);
    stats.projectileSpeed = projectileSpeed.toFixed(2);
    let throwRate = sumNumberStat(stats.itemStats.mainhand, "Base Throw Rate", stats.throwRate) * (stats.throwRatePercent / 100);
    stats.throwRate = throwRate.toFixed(2);

    // Magic Stats
    stats.spellPowerPercent = 100 + sumNumberStat(stats.itemStats.mainhand, "Base Spell Power", 0);
    stats.spellDamage = (((stats.spellPowerPercent / 100) * (stats.magicDamagePercent / 100)) * 100).toFixed(2);
    stats.spellCooldownPercent = (100 * Math.pow(0.95, stats.aptitude + stats.ineptitude)).toFixed(2);

    return stats;
}

function makeBuildString() {
    let data = new FormData(refs.formRef.current).entries();
    let buildString = "";
    for (const [ key, value ] of data) {
        buildString += `${key[0]}=${value.replaceAll(" ", "%20")}&`;
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
        router.push('/builder', `/builder/${makeBuildString()}`, { shallow: true });
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
                    <input type="button" className="btn btn-dark w-50" id="share" onClick={copyBuild} value="Share" />
                </div>
                <div className="col-2 text-center">
                    <input type="reset" className="btn btn-danger w-50" />
                </div>
            </div>
            <div className="row justify-content-center mb-3">
                <CheckboxWithLabel name="Shielding" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Poise" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Inure" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Steadfast" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Ethereal" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Reflexes" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Evasion" checked={false} onChange={checkboxChanged} />
                <CheckboxWithLabel name="Tempo" checked={false} onChange={checkboxChanged} />
            </div>
        </form>
    )
}