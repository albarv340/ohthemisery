
export default function SelectInput(data) {
    return (
        <select name={data.name}>
            {data.sortableStats.map(e => {
                return (
                    <option value={e} key={e}>{e}</option>
                )
            })}
        </select>
    )
}