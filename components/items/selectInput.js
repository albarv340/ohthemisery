import Select from 'react-select';
import React from 'react';

export default function SelectInput(data) {
    const options = data.sortableStats.map(item => { return { "value": item, "label": item } })

    return (
        <div>
            <Select
                name={data.name}
                options={options}
                defaultValue={options[0]}
                theme={theme => ({
                    ...theme,
                    borderRadius: 0,
                    colors: {
                        ...theme.colors,
                        primary: "#bbbbbb",
                        primary25: "#2a2a2a",
                        neutral0: "black",
                        neutral80: "white"
                    },
                })}
            />
        </div>
    )
}