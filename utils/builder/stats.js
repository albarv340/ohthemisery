class Stats {


    constructor(itemData, formData, enabledBoxes) {
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

        this.setDefaultValues();
        this.sumAllStats();
    }

    sumNumberStat(itemStats, statName, defaultIncrement) {
        if (!itemStats) return 0;
        return (itemStats[statName]) ? Number(itemStats[statName]) : (defaultIncrement) ? defaultIncrement : 0;
    }
    
    sumEnchantmentStat(itemStats, enchName, perLevelMultiplier) {
        if (!itemStats) return (perLevelMultiplier) ? perLevelMultiplier : 0;
        return (itemStats[enchName]) ? Number(itemStats[enchName]) * perLevelMultiplier : 0;
    }

    sumAllStats() {
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