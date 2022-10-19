class Stats {
    constructor(itemData, formData, enabledBoxes) {
        this.enabledBoxes = enabledBoxes;
        this.itemNames = {
            "mainhand": formData.mainhand,
            "offhand": formData.offhand,
            "helmet": formData.helmet,
            "chestplate": formData.chestplate,
            "leggings": formData.leggings,
            "boots": formData.boots
        };
        this.itemStats = {
            "mainhand": (formData.mainhand != "None") ? itemData[formData.mainhand] : undefined,
            "offhand": (formData.offhand != "None") ? itemData[formData.offhand] : undefined,
            "helmet": (formData.helmet != "None") ? itemData[formData.helmet] : undefined,
            "chestplate": (formData.chestplate != "None") ? itemData[formData.chestplate] : undefined,
            "leggings": (formData.leggings != "None") ? itemData[formData.leggings] : undefined,
            "boots": (formData.boots != "None") ? itemData[formData.boots] : undefined
        };
        this.situationals = {
            shielding: {enabled: enabledBoxes.shielding, level: 0},
            poise: {enabled: enabledBoxes.poise, level: 0},
            inure: {enabled: enabledBoxes.inure, level: 0},
            steadfast: {enabled: enabledBoxes.steadfast, level: 0},
            ethereal: {enabled: enabledBoxes.ethereal, level: 0},
            reflexes: {enabled: enabledBoxes.reflexes, level: 0},
            evasion: {enabled: enabledBoxes.evasion, level: 0},
            tempo: {enabled: enabledBoxes.tempo, level: 0},
            secondwind: {enabled: enabledBoxes.secondwind, level: 0},
            adaptability: {enabled: true, level: 0}
        };
        this.tenacity = (formData.tenacity) ? formData.tenacity : 0;
        this.vitality = (formData.vitality) ? formData.vitality : 0;
        this.vigor = (formData.vigor) ? formData.vigor : 0;
        this.focus = (formData.focus) ? formData.focus : 0;
        this.perspicacity = (formData.perspicacity) ? formData.perspicacity : 0;

        this.currentHealthPercent = (formData.health) ? formData.health : 100;

        this.setDefaultValues();
        this.sumAllStats();
        this.adjustStats();
        this.calculateDefenseStats();
        this.calculateOffenseStats();
    }

    calculateOffenseStats() {
        if (this.enabledBoxes.scout) {
            let extraAttackDamagePercent = (this.projectileDamagePercent - 100) * 0.5;
            let extraProjectileDamagePercent = (this.attackDamagePercent - 100) * 0.4;
            this.attackDamagePercent += extraAttackDamagePercent;
            this.projectileDamagePercent += extraProjectileDamagePercent;
        }
    
        // Melee Stats
        let attackDamage = this.sumNumberStat(this.itemStats.mainhand, "Base Attack Damage", this.attackDamage)
            * (this.attackDamagePercent / 100)
            * ((this.enabledBoxes.strength) ? 1.1 : 1)
            * ((this.enabledBoxes.fol) ? 1.15 : 1)
            * ((this.enabledBoxes.clericblessing) ? 1.35 : 1)
            * (1 + 0.01 * Number(this.vigor))
            * ((this.currentHealthPercent <= 50) ? 1 - 0.1 * this.crippling : 1);
        this.attackDamage = attackDamage.toFixed(2);
        let attackSpeed = (this.sumNumberStat(this.itemStats.mainhand, "Base Attack Speed", this.attackSpeed) + this.attackSpeedFlatBonus) * (this.attackSpeedPercent / 100);
        this.attackSpeed = attackSpeed.toFixed(2);
        let attackDamageCrit = (attackDamage * 1.5)
        this.attackDamageCrit = attackDamageCrit.toFixed(2);
        this.iframeDPS = ((attackSpeed >= 2) ? attackDamage * 2 : attackDamage * attackSpeed).toFixed(2);
        this.iframeCritDPS = ((attackSpeed >= 2) ? attackDamageCrit * 2 : attackDamageCrit * attackSpeed).toFixed(2);
    
        // Projectile Stats
        let projectileDamage = this.sumNumberStat(this.itemStats.mainhand, "Base Proj Damage", this.projectileDamage)
            * (this.projectileDamagePercent / 100)
            * ((this.enabledBoxes.strength) ? 1.1 : 1)
            * ((this.enabledBoxes.fol) ? 1.15 : 1)
            * ((this.enabledBoxes.clericblessing) ? 1.35 : 1)
            * (1 + 0.01 * Number(this.focus));
        this.projectileDamage = projectileDamage.toFixed(2);
        let projectileSpeed = this.sumNumberStat(this.itemStats.mainhand, "Base Proj Speed", this.projectileSpeed) * (this.projectileSpeedPercent / 100);
        this.projectileSpeed = projectileSpeed.toFixed(2);
        let throwRate = this.sumNumberStat(this.itemStats.mainhand, "Base Throw Rate", this.throwRate) * (this.throwRatePercent / 100);
        this.throwRate = throwRate.toFixed(2);
    
        // Magic Stats
        this.spellPowerPercent = 100 + this.sumNumberStat(this.itemStats.mainhand, "Base Spell Power", 0);
        this.spellDamage = ((this.spellPowerPercent / 100)
            * (this.magicDamagePercent / 100)
            * ((this.enabledBoxes.strength) ? 1.1 : 1)
            * ((this.enabledBoxes.fol) ? 1.15 : 1)
            * (1 + 0.01 * Number(this.perspicacity)))
            * 100;
        this.spellDamage = this.spellDamage.toFixed(2);
        this.spellCooldownPercent = (100 * Math.pow(0.95, this.aptitude + this.ineptitude)).toFixed(2);
    }

    calculateDefenseStats() {
        let drs = this.calculateDamageReductions();

        // Select to show either the regular dr, or dr with second wind currently active based on hp remaining
        let drType = (this.situationals.secondwind.enabled) ? "secondwind" : "base";
        
        // Regular Damage Reductions
        this.meleeDR = drs.melee[drType].toFixed(2);
        this.projectileDR = drs.projectile[drType].toFixed(2);
        this.magicDR = drs.magic[drType].toFixed(2);
        this.blastDR = drs.blast[drType].toFixed(2);
        this.fireDR = drs.fire[drType].toFixed(2);
        this.fallDR = drs.fall[drType].toFixed(2);
        this.ailmentDR = drs.ailment[drType].toFixed(2);

        // Effective HP
        if (this.situationals.secondwind.level == 0 || drType == "base") {
            this.meleeEHP = (this.healthFinal * (this.currentHealthPercent / 100) / (1 - drs.melee.base / 100)).toFixed(2);
            this.projectileEHP = (this.healthFinal * (this.currentHealthPercent / 100) / (1 - drs.projectile.base / 100)).toFixed(2);
            this.magicEHP = (this.healthFinal * (this.currentHealthPercent / 100) / (1 - drs.magic.base / 100)).toFixed(2);
            this.blastEHP = (this.healthFinal * (this.currentHealthPercent / 100) / (1 - drs.blast.base / 100)).toFixed(2);
            this.fireEHP = (this.healthFinal * (this.currentHealthPercent / 100) / (1 - drs.fire.base / 100)).toFixed(2);
            this.fallEHP = (this.healthFinal * (this.currentHealthPercent / 100) / (1 - drs.fall.base / 100)).toFixed(2);
            this.ailmentEHP = (this.healthFinal * (this.currentHealthPercent / 100) / (1 - drs.ailment.base / 100)).toFixed(2);
        } else {
            let hpNoSecondWind = Math.max(0, (this.currentHealth - this.healthFinal * 0.5));
            let hpSecondWind = Math.min(this.currentHealth, this.healthFinal * 0.5);
            this.meleeEHP = (hpNoSecondWind / (1 - drs.melee.base / 100) + hpSecondWind / (1 - drs.melee.secondwind / 100)).toFixed(2);
            this.projectileEHP = (hpNoSecondWind / (1 - drs.projectile.base / 100) + hpSecondWind / (1 - drs.projectile.secondwind / 100)).toFixed(2);
            this.magicEHP = (hpNoSecondWind / (1 - drs.magic.base / 100) + hpSecondWind / (1 - drs.magic.secondwind / 100)).toFixed(2);
            this.blastEHP = (hpNoSecondWind / (1 - drs.blast.base / 100) + hpSecondWind / (1 - drs.blast.secondwind / 100)).toFixed(2);
            this.fireEHP = (hpNoSecondWind / (1 - drs.fire.base / 100) + hpSecondWind / (1 - drs.fire.secondwind / 100)).toFixed(2);
            this.fallEHP = (hpNoSecondWind / (1 - drs.fall.base / 100) + hpSecondWind / (1 - drs.fall.secondwind / 100)).toFixed(2);
            this.ailmentEHP = (hpNoSecondWind / (1 - drs.ailment.base / 100) + hpSecondWind / (1 - drs.ailment.secondwind / 100)).toFixed(2);
        }

        // Health Normalized Damage Reductions
        this.meleeHNDR = ((1 - ((1 - (drs.melee[drType] / 100)) / (this.healthFinal / 20))) * 100).toFixed(2);
        this.projectileHNDR = ((1 - ((1 - (drs.projectile[drType] / 100)) / (this.healthFinal / 20))) * 100).toFixed(2);
        this.magicHNDR = ((1 - ((1 - (drs.magic[drType] / 100)) / (this.healthFinal / 20))) * 100).toFixed(2);
        this.blastHNDR = ((1 - ((1 - (drs.blast[drType] / 100)) / (this.healthFinal / 20))) * 100).toFixed(2);
        this.fireHNDR = ((1 - ((1 - (drs.fire[drType] / 100)) / (this.healthFinal / 20))) * 100).toFixed(2);
        this.fallHNDR = ((1 - ((1 - (drs.fall[drType] / 100)) / (this.healthFinal / 20))) * 100).toFixed(2);
        this.ailmentHNDR = ((1 - ((1 - (drs.ailment[drType] / 100)) / (this.healthFinal / 20))) * 100).toFixed(2);
    }

    calculateDamageTaken(noArmor, prot, protmodifier, earmor, eagility) {
        let damageTaken = {};
        damageTaken.base = ((noArmor) ? 100 * Math.pow(0.96, (prot * protmodifier)) :
        100 * Math.pow(0.96, ((prot * protmodifier) + earmor + eagility) - (0.5 * earmor * eagility / (earmor + eagility))));

        damageTaken.secondwind = ((noArmor) ? 100 * Math.pow(0.96, (prot * protmodifier)) :
        100 * Math.pow(0.96, ((prot * protmodifier) + earmor + eagility) - (0.5 * earmor * eagility / (earmor + eagility))));
        damageTaken.secondwind *= Math.pow(0.9, this.situationals.secondwind.level);
        
        damageTaken.base = damageTaken.base
            * (1 - (this.tenacity * 0.005))
            * ((this.enabledBoxes.resistance) ? 0.9 : 1);
        damageTaken.secondwind = damageTaken.secondwind
            * (1 - (this.tenacity * 0.005))
            * ((this.enabledBoxes.resistance) ? 0.9 : 1);

        return damageTaken;
    }

    calculateDamageReductions() {
        /*
        Calculates all things damage reduction related.
        */

        // Prevents things like Auric Tiara from breaking the DR calculations
        // since having negative armor/agility doesn't mean you will take
        // additional damage from enemy attacks.
        let armor = (this.armor < 0) ? 0 : this.armor;
        let agility = (this.agility < 0) ? 0 : this.agility;
        
        let moreAgility = false;
        let moreArmor = false;
        let hasEqual = false;
        (agility > armor) ? moreAgility = true : (armor > agility) ? moreArmor = true : hasEqual = true;
        let hasNothing = (hasEqual && armor == 0);

        // For situationals with 20% in mind.
        // Capped at a total of 30 armor/agility effectiveness for r2.
        let situationalArmor = (this.situationals.adaptability.level > 0) ? Math.min(Math.max(agility, armor), 30) * 0.2 : Math.min(armor, 30) * 0.2;
        let situationalAgility = (this.situationals.adaptability.level > 0) ? Math.min(Math.max(agility, armor), 30) * 0.2 : Math.min(agility, 30) * 0.2;
        
        let etherealSit = (this.situationals.ethereal.enabled) ? situationalAgility * this.situationals.ethereal.level : 0;
        let tempoSit = (this.situationals.tempo.enabled) ? situationalAgility * this.situationals.tempo.level : 0;
        let evasionSit = (this.situationals.evasion.enabled) ? situationalAgility * this.situationals.evasion.level : 0;
        let reflexesSit = (this.situationals.reflexes.enabled) ? situationalAgility * this.situationals.reflexes.level : 0;
        let shieldingSit = (this.situationals.shielding.enabled) ? situationalArmor * this.situationals.shielding.level : 0;
        let poiseSit = (this.situationals.poise.enabled) ? ((health.current / health.final >= 0.9) ? situationalArmor * this.situationals.poise.level : 0) : 0;
        let inureSit = (this.situationals.inure.enabled) ? situationalArmor * this.situationals.inure.level : 0;

        let steadfastArmor = (1 - Math.max(0.2, this.currentHealthPercent / 100)) * 0.25 *
            Math.min(((this.situationals.adaptability.level > 0 && moreAgility) ? agility : (moreArmor) ? armor : (this.situationals.adaptability.level == 0) ? armor : 0), 30);
        
        let steadfastSit = (this.situationals.steadfast.enabled) ? steadfastArmor * this.situationals.steadfast.level : 0;

        let sumSits = etherealSit + tempoSit + evasionSit + reflexesSit + shieldingSit + poiseSit + inureSit;
        let sumArmorSits = shieldingSit + poiseSit + inureSit;
        let sumAgiSits = etherealSit + tempoSit + evasionSit + reflexesSit;
        
        let armorPlusSits = armor + ((this.situationals.adaptability.level > 0 && moreArmor) ?
            sumSits : (this.situationals.adaptability.level > 0 && moreAgility) ?
                armor : (this.situationals.adaptability.level == 0) ? sumArmorSits : 0);

        let armorPlusSitsSteadfast = armorPlusSits + steadfastSit;
        
        let agilityPlusSits = agility + ((this.situationals.adaptability.level > 0 && moreAgility) ?
            sumSits : (this.situationals.adaptability.level > 0 && moreArmor) ?
                agility : (this.situationals.adaptability.level == 0) ? sumAgiSits : 0);
        let halfArmor = armorPlusSitsSteadfast / 2;
        let halfAgility = agilityPlusSits / 2;

        // there is something weird going on with fall damage. check out: khrosmos/prophetic moonbeam/crest of the tundra/windborn cape/lyrata/mist's wake

        let meleeDamage = this.calculateDamageTaken(hasNothing, this.meleeProt, 2, armorPlusSitsSteadfast, agilityPlusSits);
        let projectileDamage = this.calculateDamageTaken(hasNothing, this.projectileProt, 2, armorPlusSitsSteadfast, agilityPlusSits);
        let magicDamage = this.calculateDamageTaken(hasNothing, this.magicProt, 2, armorPlusSitsSteadfast, agilityPlusSits);
        let blastDamage = this.calculateDamageTaken(hasNothing, this.blastProt, 2, armorPlusSitsSteadfast, agilityPlusSits);
        let fireDamage = this.calculateDamageTaken(hasNothing, this.fireProt, 2, halfArmor, halfAgility);
        let fallDamage = this.calculateDamageTaken(hasNothing, this.fallProt, 3, halfArmor, halfAgility);
        let ailmentDamage = this.calculateDamageTaken(true, 0, 0, 0, 0);

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

    sumNumberStat(itemStats, statName, defaultIncrement) {
        if (!itemStats) return 0;
        return (itemStats[statName]) ? Number(itemStats[statName]) : (defaultIncrement) ? defaultIncrement : 0;
    }
    
    sumEnchantmentStat(itemStats, enchName, perLevelMultiplier) {
        if (!itemStats) return (perLevelMultiplier) ? perLevelMultiplier : 0;
        return (itemStats[enchName]) ? Number(itemStats[enchName]) * perLevelMultiplier : 0;
    }

    adjustStats() {
        /*
        Minor calculations to adjust the stat values
        */
        // Calculate final health
        this.healthFinal = this.healthFlat * (this.healthPercent / 100) * (1 + 0.01 * Number(this.vitality));
        // Current health (percentage of max health based on player input)
        this.currentHealth = this.healthFinal * (this.currentHealthPercent / 100);
        // Fix speed percentage to account for base speed
        this.speedPercent = this.speedPercent
            * (this.speedFlat) / 0.1
            * ((this.enabledBoxes.speed) ? 1.1 : 1)
            * ((this.enabledBoxes.fol) ? 1.15 : 1)
            * ((this.enabledBoxes.clericblessing) ? 1.2 : 1)
            * ((this.currentHealthPercent <= 50) ? 1 - 0.1 * this.crippling : 1);
        this.speedPercent = this.speedPercent.toFixed(2);
        // Fix knockback resistance to be percentage and cap at 100
        this.knockbackRes = (this.knockbackRes > 10) ? 100 : this.knockbackRes * 10;
        // Calculate effective healing rate
        let effHealingNonRounded = (((20 / this.healthFinal) * (this.healingRate / 100)) * 100);
        this.effHealingRate = effHealingNonRounded.toFixed(2);
        // Fix regen to the actual value per second
        let regenPerSecNonRounded = 0.33 * Math.sqrt(this.regenPerSec) * (this.healingRate / 100);
        this.regenPerSec = regenPerSecNonRounded.toFixed(2);
        // Calculate %hp regen per sec
        this.regenPerSecPercent = ((regenPerSecNonRounded / this.healthFinal) * 100).toFixed(2);
        // Fix life drain on crit
        let lifeDrainOnCritFixedNonRounded = (Math.sqrt(this.lifeDrainOnCrit)) * (effHealingNonRounded / 100);
        this.lifeDrainOnCrit = lifeDrainOnCritFixedNonRounded.toFixed(2);
        // Calculate %hp regained from life drain on crit
        this.lifeDrainOnCritPercent = ((lifeDrainOnCritFixedNonRounded / this.healthFinal) * 100).toFixed(2);
        // Add to thorns damage
        this.thorns = (this.thorns * (this.thornsPercent / 100)).toFixed(2);
    }

    sumAllStats() {
        /*
        Add up all the stats from the items
        */
        Object.keys(this.itemStats).forEach(type => {
            let itemStats = this.itemStats[type];
            if (itemStats !== undefined) {
                if (itemStats["Health"]) {
                    let healthString = (typeof (itemStats["Health"]) === "string") ?
                        itemStats["Health"] : itemStats["Health"].join(", ");
        
                    // Try matching for % health
                    let result = healthString.match(/([-+]\d+)% Max Health/);
                    this.healthPercent += (result) ? Number(result[1]) : 0;
                    // Try matching for regular health
                    result = healthString.match(/([-+]\d+) Max Health/);
                    this.healthFlat += (result) ? Number(result[1]) : 0;
                }
                this.agility += this.sumNumberStat(itemStats, "Agility");
                this.armor += this.sumNumberStat(itemStats, "Armor");
                this.speedPercent += this.sumNumberStat(itemStats, "Speed %");
                this.speedFlat += this.sumNumberStat(itemStats, "Speed");
                this.knockbackRes += this.sumNumberStat(itemStats, "Knockback Res.");
                this.thorns += this.sumNumberStat(itemStats, "Thorns");
                this.thornsPercent += this.sumNumberStat(itemStats, "Thorns Damage");
        
                this.healingRate += this.sumEnchantmentStat(itemStats, "Anemia", -10) + this.sumEnchantmentStat(itemStats, "Sustenance", 10);
                this.regenPerSec += this.sumEnchantmentStat(itemStats, "Regen", 1);
                this.lifeDrainOnCrit += this.sumEnchantmentStat(itemStats, "Life Drain", 1);
    
                this.meleeProt += this.sumNumberStat(itemStats, "Melee Prot.");
                this.projectileProt += this.sumNumberStat(itemStats, "Projectile Prot.");
                this.magicProt += this.sumNumberStat(itemStats, "Magic Prot.");
                this.blastProt += this.sumNumberStat(itemStats, "Blast Prot.");
                this.fireProt += this.sumNumberStat(itemStats, "Fire Prot.");
                this.fallProt += this.sumNumberStat(itemStats, "Feather Falling");
    
                this.attackDamagePercent += this.sumNumberStat(itemStats, "Attack Damage");
                this.attackSpeedPercent += this.sumNumberStat(itemStats, "Attack Speed %");
                this.attackSpeedFlatBonus += this.sumNumberStat(itemStats, "Attack Speed");
    
                this.projectileDamagePercent += this.sumNumberStat(itemStats, "Proj Damage");
                this.projectileSpeedPercent += this.sumNumberStat(itemStats, "Proj Speed");
    
                this.magicDamagePercent += this.sumNumberStat(itemStats, "Magic Damage");
    
                this.aptitude += this.sumEnchantmentStat(itemStats, "Aptitude", 1);
                this.ineptitude += this.sumEnchantmentStat(itemStats, "Ineptitude", -1);
    
                this.situationals.shielding.level += this.sumNumberStat(itemStats, "Shielding");
                this.situationals.poise.level += this.sumNumberStat(itemStats, "Poise");
                this.situationals.inure.level += this.sumNumberStat(itemStats, "Inure");
                this.situationals.steadfast.level += this.sumNumberStat(itemStats, "Steadfast");
                this.situationals.ethereal.level += this.sumNumberStat(itemStats, "Ethereal ");
                this.situationals.reflexes.level += this.sumNumberStat(itemStats, "Reflexes ");
                this.situationals.evasion.level += this.sumNumberStat(itemStats, "Evasion");
                this.situationals.tempo.level += this.sumNumberStat(itemStats, "Tempo ");
                this.situationals.adaptability.level += this.sumNumberStat(itemStats, "Adaptability");
                this.situationals.secondwind.level += this.sumNumberStat(itemStats, "Second Wind");
    
                this.crippling += this.sumNumberStat(itemStats, "Crippling");
                this.corruption += this.sumNumberStat(itemStats, "Corruption");
            }
        });
    }
    
    setDefaultValues() {
        this.agility = 0,
        this.armor = 0,
        this.speedPercent = 100,
        this.speedFlat = 0.1,
        this.knockbackRes = 0,
        this.thorns = 0,
        this.thornsPercent = 100,
    
        this.healthPercent = 100,
        this.healthFlat = 20,
        this.healthFinal = 20,
        this.currentHealth = 20,
        this.healingRate = 100,
        this.effHealingRate = 100,
        this.regenPerSec = 0,
        this.regenPerSecPercent = 0,
        this.lifeDrainOnCrit = 0,
        this.lifeDrainOnCritPercent = 0,
    
        this.meleeProt = 0,
        this.projectileProt = 0,
        this.magicProt = 0,
        this.blastProt = 0,
        this.fireProt = 0,
        this.fallProt = 0,
        this.ailmentProt = 0,
    
        this.meleeHNDR = 0,
        this.projectileHNDR = 0,
        this.magicHNDR = 0,
        this.blastHNDR = 0,
        this.fireHNDR = 0,
        this.fallHNDR = 0,
        this.ailmentHNDR = 0,
    
        this.meleeDR = 0,
        this.projectileDR = 0,
        this.magicDR = 0,
        this.blastDR = 0,
        this.fireDR = 0,
        this.fallDR = 0,
        this.ailmentDR = 0,
    
        this.meleeEHP = 0,
        this.projectileEHP = 0,
        this.magicEHP = 0,
        this.blastEHP = 0,
        this.fireEHP = 0,
        this.fallEHP = 0,
        this.ailmentEHP = 0,
    
        this.hasMoreArmor = false,
        this.hasMoreAgility = false,
        this.hasEqualDefenses = false,
    
        this.attackDamagePercent = 100,
        this.attackSpeedPercent = 100,
        this.attackSpeed = 4,
        this.attackSpeedFlatBonus = 0,
        this.attackDamage = 1,
        this.attackDamageCrit = 1.5,
        this.iframeDPS = 2,
        this.iframeCritDPS = 3,
    
        this.projectileDamagePercent = 100,
        this.projectileDamage = 0,
        this.projectileSpeedPercent = 100,
        this.projectileSpeed = 0,
        this.throwRatePercent = 100,
        this.throwRate = 0,
    
        this.magicDamagePercent = 100,
        this.spellPowerPercent = 100,
        this.spellDamage = 100,
        this.spellCooldownPercent = 100,
    
        this.aptitude = 0,
        this.ineptitude = 0,
        this.crippling = 0,
        this.corruption = 0
    }
}

module.exports = Stats;