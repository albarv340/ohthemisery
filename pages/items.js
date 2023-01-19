import Head from 'next/head';
import styles from '../styles/Items.module.css';
import ItemTile from '../components/items/itemTile';
import MasterworkableItemTile from '../components/items/masterworkableItemTile';
import CharmTile from '../components/items/charmTile';
import SearchForm from '../components/items/searchForm';
import React from 'react';
import InfiniteScroll from "react-infinite-scroll-component";
import TranslatableText from '../components/translatableText';
import Axios from 'axios';
import AuthProvider from '../utils/authProvider';
import Fs from 'fs/promises';
import extras from '../public/items/extras.json';

function getRelevantItems(data, itemData) {
    let items = Object.keys(itemData);

    if (data.searchName) {
        // Check if the user inputted any "|" to search for multiple item names at once.
        let names = data.searchName.split("|").map(name => name.toLowerCase().trim());
        items = items.filter(name => {
            let result = false;
            names.forEach(term => {
                if (name.toLowerCase().includes(term)) {
                    result = true;
                    return;
                }
            })
            return result;
        });
    }
    if (data.searchLore) {
        items = items.filter(name => itemData[name].lore?.toLowerCase().includes(data.searchLore.toLowerCase()))
    }
    if (data.regionSelect != "Any Region") {
        items = items.filter(name => itemData[name].region == data.regionSelect)
    }
    if (data.tierSelect != "Any Tier") {
        items = items.filter(name => itemData[name].tier == data.tierSelect)
    }
    if (data.locationSelect != "Any Location") {
        items = items.filter(name => itemData[name].location == data.locationSelect)
    }
    if (data.poiSelect != "Any POI") {
        items = items.filter(name => itemData[name].extras?.poi && itemData[name].extras.poi == data.poiSelect)
    }
    if (data.classSelect != "Any Class") {
        items = items.filter(name => itemData[name].class_name == data.classSelect)
    }
    if (data.charmStatSelect != "Any Stat") {
        let attributeName = data.charmStatSelect.split(" ").map(part => part.toLowerCase()).join("_");
        attributeName = (attributeName.includes("_%")) ? attributeName.replace("_%", "_percent") : attributeName += "_flat";
        items = items.filter(name => (itemData[name].type == "Charm" && itemData[name].stats[attributeName] != undefined));
        items = items.sort((item1, item2) => ((itemData[item2].stats[attributeName] || 0)  - (itemData[item1].stats[attributeName] || 0)))
    }
    if (data.baseItemSelect != "Any Item") {
        items = items.filter(name => itemData[name]["base_item"] == data.baseItemSelect)
    }
    if (data.sortSelect != "-") {
        items = items.filter(name => (itemData[name]["stats"] != undefined && typeof (itemData[name]["stats"][data.sortSelect.toLowerCase().replaceAll(" ", "_")]) != "undefined"))
        items = items.sort((item1, item2) => (itemData[item2]["stats"][data.sortSelect.toLowerCase().replaceAll(" ", "_")]) - (itemData[item1]["stats"][data.sortSelect.toLowerCase().replaceAll(" ", "_")]))
    }
    let includedTypes = []
    for (const key in data) {
        if (data[key] == "on") {
            includedTypes.push(key)
        }
    }

    items = items.filter(name => includedTypes.includes(itemData[name].type.toLowerCase().replace(/<.*>/, "").trim()))

    // Group up masterwork tiers by their name using an object, removing them from items.
    let masterworkItems = {};
    let otherPositionsToRemove = [];
    // Go through the array in reverse order to have the splice work properly
    // (items will go down in position if not removed from the end)
    for (let i = items.length - 1; i >= 0; i--) {
        let name = items[i];
        if (itemData[name].masterwork != undefined) {
            let itemName = itemData[name].name;
            if (!masterworkItems[itemName]) {
                masterworkItems[itemName] = {items:[],lowestPosition:9999999,lowestPositionName:null};
            }
            masterworkItems[itemName].items.push(itemData[name]);
            if (i < masterworkItems[itemName].lowestPosition) {
                // Remove the old lowest position item
                if (masterworkItems[itemName].lowestPosition < 9999999) {
                    otherPositionsToRemove.push(masterworkItems[itemName].lowestPosition);
                }
                // Set the new lowest position
                masterworkItems[itemName].lowestPosition = i;
                masterworkItems[itemName].lowestPositionName = name;
            } else {
                otherPositionsToRemove.push(i);
            }
        }
    }

    // Remove all the excess items that need to be grouped up
    otherPositionsToRemove = otherPositionsToRemove.sort((pos1, pos2) => pos2 - pos1);
    for (const pos of otherPositionsToRemove) {
        items.splice(pos, 1);
    }

    // Re-insert the groups as arrays into the items array, IN THE CORRECT POSITION.
    let masterworkGroups = Object.keys(masterworkItems).sort((item1, item2) => masterworkItems[item2].lowestPosition - masterworkItems[item1].lowestPosition);
    for (const masterworkGroup of masterworkGroups) {
        items.splice(items.indexOf(masterworkItems[masterworkGroup].lowestPositionName), 1, masterworkItems[masterworkGroup].items);
    }

    return items;
}

export default function Items({ itemData }) {
    const [relevantItems, setRelevantItems] = React.useState(Object.keys(itemData));
    const [itemsToShow, setItemsToShow] = React.useState(20)
    const itemsToLoad = 20;

    function handleChange(data) {
        setRelevantItems(getRelevantItems(data, itemData))
        setItemsToShow(itemsToLoad)
    }

    function showMoreItems() {
        setItemsToShow(itemsToShow + itemsToLoad)
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Monumenta Items</title>
                <meta property="og:image" content="/favicon.ico" />
                <meta name="description" content="Monumenta item guide to make it easier to find items." />
                <meta name="keywords" content="Monumenta, Minecraft, MMORPG, Items, Item Guide" />
            </Head>
            <main className={styles.main}>
                <h1>Monumenta Items</h1>
                <SearchForm update={handleChange} itemData={itemData} />
                {
                    (relevantItems.length > 0) ?
                    <h4 className="mt-1">
                        <TranslatableText identifier="items.searchForm.itemsFound"></TranslatableText> {relevantItems.length}
                    </h4> : ""
                }
                
                <InfiniteScroll
                    className={styles.itemsContainer}
                    dataLength={itemsToShow}
                    next={showMoreItems}
                    hasMore={true}
                    loader={<h4>No items found</h4>}
                >
                    {relevantItems.slice(0, itemsToShow).map(name => {
                        if (typeof name == "object") {
                            return (
                                <MasterworkableItemTile key={name[0].name} name={name[0].name} item={name}></MasterworkableItemTile>
                            )
                        }
                        if (itemData[name].type == "Charm") {
                            return (
                                <CharmTile key={name} name={itemData[name].name} item={itemData[name]}></CharmTile>
                            )
                        }
                        return (
                            <ItemTile key={name} name={name} item={itemData[name]}></ItemTile>
                        )
                    })}
                </InfiniteScroll>
            </main>
        </div>
    )
}

export async function getServerSideProps(context) {
    let itemData = null;
    if (AuthProvider.isUsingApi()) {
        const response = await Axios.get(AuthProvider.getApiPath(), {headers: {'Authorization': AuthProvider.getAuthorizationData()}});
        itemData = response.data;
    } else {
        itemData = JSON.parse(await Fs.readFile('public/items/itemData.json'));
    }

    // Add OTM extra info based on item's name
    // (so that it gets copied the same to each masterwork level)
    for (const item in itemData) {
        if (extras[itemData[item].name]) {
            itemData[item].extras = extras[itemData[item].name];
        }
    }

    return {
        props: {
            itemData
        }
    };
}