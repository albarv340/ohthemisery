import SelectInput from '../items/selectInput';
import ItemTile from '../items/itemTile';
import itemData from '../../public/items/itemData.json';

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

    console.log(stats);

    // Example: find total agility and armor
    Object.keys(stats.itemStats).forEach(type => {
        let itemStats = stats.itemStats[type];
        console.log(itemStats);
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

    /*document.getElementById("agility").innerHTML = `<b>Agility:</b> ${stats.totalAgility}`;
    document.getElementById("armor").innerHTML = `<b>Armor:</b> ${stats.totalArmor}`;
    document.getElementById("health").innerHTML = `<b>HP:</b> ${stats.healthFlat * (stats.healthPercent / 100)}`;*/

    return stats;
}

export default function SearchForm({ update }) {
    function sendUpdate(event) {
        event.preventDefault()
        let itemNames = Object.fromEntries(new FormData(event.target).entries());
        console.log(itemNames);
        let stats = recalcBuild(itemNames);
        update(stats);
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
                    <SelectInput name="mainhand" sortableStats={getRelevantItems(["mainhand", "sword", "axe", "wand", "scythe", "bow", "crossbow", "throwable", "trident"])}></SelectInput>
                </div>
                <div className="col-2 text-center">
                    <SelectInput name="offhand" sortableStats={getRelevantItems(["offhand", "offhand shield", "offhand sword"])}></SelectInput>
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
                    <SelectInput name="helmet" sortableStats={getRelevantItems(["helmet"])}></SelectInput>
                </div>
                <div className="col-2 text-center">
                    <SelectInput name="chestplate" sortableStats={getRelevantItems(["chestplate"])}></SelectInput>
                </div>
                <div className="col-2 text-center">
                    <SelectInput name="leggings" sortableStats={getRelevantItems(["leggings"])}></SelectInput>
                </div>
                <div className="col-2 text-center">
                    <SelectInput name="boots" sortableStats={getRelevantItems(["boots"])}></SelectInput>
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
            <div className="row justify-content-center">
                <div class="col">
                    
                </div>
                <div class="col">
                    <div id="output"></div>
                    <p id="agility"></p>
                    <p id="armor"></p>
                    <p id="health"></p>
                </div>
            </div>
        </form>
    )
}