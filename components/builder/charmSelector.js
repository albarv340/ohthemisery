import styles from '../../styles/CharmSelector.module.css';
import TranslatableText from '../translatableText';
import CharmTile from '../items/charmTile';
import SelectInput from '../items/selectInput';
import React from 'react';

export default function CharmSelector({ update, translatableName, urlCharms, updateLoaded, itemData }) {
    const [entries, setEntries] = React.useState([]);
    const [usedPower, setUsedPower] = React.useState(0);
    const inputRef = React.useRef();

    const maxPower = 12;
    console.log("Got charms", urlCharms);
    React.useEffect(() => {
        if (updateLoaded && urlCharms) {
            let powerCount = 0;
            let nonOverflowEntries = [];
            urlCharms.forEach(name => {
                if (powerCount + itemData[name].power <= maxPower) {
                    powerCount += itemData[name].power;
                    nonOverflowEntries.push(name);
                }
            });
            setEntries(nonOverflowEntries);
            setUsedPower(powerCount);
        }
    }, [updateLoaded]);


    function processUpdate(updatedEntries) {
        setEntries(updatedEntries);
        update(updatedEntries);
    }

    function addEntry() {
        let input = inputRef.current.getValue()[0].value;
        
        let actualName = Object.keys(itemData).find(name => name.toLowerCase() == input.toLowerCase());

        if (actualName && itemData[actualName].type == "Charm"
            && !entries.find(name => name.toLowerCase() == input.toLowerCase())
            && usedPower + itemData[actualName].power <= maxPower) {
            setUsedPower(usedPower + itemData[actualName].power);
            processUpdate([...entries, actualName]);
        }
    }

    function deleteEntry(i, power) {
        setUsedPower(usedPower - power);
        processUpdate(entries.filter((_, index) => index != i));
    }

    return (
        <div className={`${styles.listSelectorContainer} p-2`}>
            <p className={`${styles.name} m-0 mb-2`}><TranslatableText identifier={translatableName}></TranslatableText></p>
            <div className={`${styles.listSelectorInputs} justify-content-center`}>
                <span className={`${styles.entryInput} me-1`}><SelectInput reference={inputRef} name="charm" noneOption={true} sortableStats={Object.keys(itemData).filter(name => itemData[name].type == "Charm")}></SelectInput></span>
                <button className={styles.button} onClick={addEntry}>+</button>
            </div>
            <div className={`${styles.powerStars} justify-content-center`}>
                <span>{`${usedPower}/${maxPower} [`}</span>
                <span className={styles.activeStars}>{"★".repeat(usedPower)}</span>
                <span>{`${"☆".repeat(maxPower - usedPower)}]`}</span>
            </div>
            <div className={styles.listSelectorList}>
                {
                    entries.map((entry, index) => <span key={index} className={styles.entry} onClick={() => deleteEntry(index, itemData[entry].power)}>
                        <CharmTile key={entry} name={itemData[entry].name} item={itemData[entry]}></CharmTile>
                    </span>)
                }
            </div>
        </div>
    )
    
}