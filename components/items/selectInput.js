import styles from '../../styles/Items.module.css'

export default function SelectInput(data) {
    return (
        <select className={styles.select} name={data.name}>
            {data.sortableStats.map(e => {
                return (
                    <option value={e} key={e}>{e}</option>
                )
            })}
        </select>
    )
}