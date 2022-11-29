import SupportedLanguages from '../utils/translation/languages';
import Select from 'react-select';
import { setCookie, getCookie } from 'cookies-next';
import { useLanguageContext } from "../pages/_app";
import React from 'react';

function LanguageSelector() {
    const options = Object.keys(SupportedLanguages).map(lang => { return { "value": lang, "label": lang } });
    const { lang, setLang } = useLanguageContext();

    function langSelected(lang) {
        setCookie("lang", lang.value);
        setLang(lang.value);
    };

    React.useEffect(() => {
        let cookieLang = getCookie("lang");
        cookieLang = (cookieLang) ? cookieLang : 'en';
        setLang(cookieLang);
    }, []);
    
    return (
        <div>
            <Select key={lang} instanceId={lang} name="sortSelect" options={options} onChange={langSelected}
            defaultValue={options.find(opt => opt.value == lang)}
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
            })}/>
        </div>
    )
}

/*LanguageSelector.getInitialProps = async({ req }) => {
    console.log("Cookie:", req.rawHeaders);
    return {};
}*/

export default LanguageSelector;