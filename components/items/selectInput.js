import Select from 'react-select';
import React from 'react';

export default function SelectInput(data) {
    const options = data.sortableStats.map(item => { return (typeof item == "object") ? item : { "value": item, "label": item } });
    
    if (data.noneOption) {
        options.unshift({ "value": "None", "label": "None" });
    }

    return (
        <div>
            <Select
                ref={data.reference}
                instanceId={data.name}
                name={data.name}
                options={options}
                defaultValue={data.default ? data.default : options[0]}
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