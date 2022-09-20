import Head from 'next/head'
import styles from '../styles/Items.module.css'
import itemData from '../public/items/itemData.json'
import ItemTile from '../components/items/itemTile'
import SearchForm from '../components/items/searchForm'
import HomeButton from '../components/homeButton'
import React from 'react';
import InfiniteScroll from "react-infinite-scroll-component";


function getRelevantItems(data) {
    let items = Object.keys(itemData)
    if (data.search) {
        items = items.filter(name => name.toLowerCase().includes(data.search.toLowerCase()))
    }
    if (data.regionSelect != "Any") {
        items = items.filter(name => itemData[name].Region == data.regionSelect)
    }
    if (data.sortSelect != "-") {
        items = items.filter(name => typeof (itemData[name][data.sortSelect]) != "undefined")
        items = items.sort((item1, item2) => (itemData[item2][data.sortSelect] || 0) - (itemData[item1][data.sortSelect] || 0))
    }
    let includedTypes = []
    for (const key in data) {
        if (data[key] == "on") {
            includedTypes.push(key)
        }
    }
    items = items.filter(name => includedTypes.includes(itemData[name].Type.toLowerCase().replace(/<.*>/, "").trim()))

    return items
}

export default function Items() {
    const [relevantItems, setRelevantItems] = React.useState(Object.keys(itemData));
    const [itemsToShow, setItemsToShow] = React.useState(20)
    const itemsToLoad = 20;

    function handleChange(data) {
        console.log(data)
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
                        return (
                            <ItemTile key={name} name={name} item={itemData[name]}></ItemTile>
                        )
                    })}
                </InfiniteScroll>
            </main>
        </div>
    )
}