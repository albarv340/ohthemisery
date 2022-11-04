import Head from 'next/head'
import styles from '../styles/Items.module.css'
import itemData from '../public/items/itemData.json'
import ItemTile from '../components/items/itemTile'
import MasterworkableItemTile from '../components/items/masterworkableItemTile'
import CharmTile from '../components/items/charmTile'
import SearchForm from '../components/items/searchForm'
import HomeButton from '../components/homeButton'
import React from 'react';
import InfiniteScroll from "react-infinite-scroll-component";
import Footer from '../components/footer'


function getRelevantItems(data) {
    let items = Object.keys(itemData);
    
    if (data.search) {
        items = items.filter(name => name.toLowerCase().includes(data.search.toLowerCase()))
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
    if (data.classSelect != "Any Class") {
        items = items.filter(name => itemData[name].class_name == data.classSelect)
    }
    if (data.baseItemSelect != "Any Item") {
        items = items.filter(name => itemData[name]["base_item"] == data.baseItemSelect)
    }
    if (data.sortSelect != "-") {
        items = items.filter(name => typeof (itemData[name]["stats"][data.sortSelect.toLowerCase().replaceAll(" ", "_")]) != "undefined")
        items = items.sort((item1, item2) => (itemData[item2]["stats"][data.sortSelect.toLowerCase().replaceAll(" ", "_")] || 0) - (itemData[item1]["stats"][data.sortSelect.toLowerCase().replaceAll(" ", "_")] || 0))
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
        items.push(masterworkItems[item]);
    });

    return items;
}

export default function Items() {
    const [relevantItems, setRelevantItems] = React.useState(Object.keys(itemData));
    const [itemsToShow, setItemsToShow] = React.useState(20)
    const itemsToLoad = 20;

    function handleChange(data) {
        setRelevantItems(getRelevantItems(data))
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
            <HomeButton />
            <main className={styles.main}>
                <h1>Monumenta Items</h1>
                <SearchForm update={handleChange} />
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
            <Footer />
        </div>
    )
}