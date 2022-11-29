import React from 'react';
import { useLanguageContext } from "../pages/_app";
import SupportedLanguages from '../utils/translation/languages';

export default function TranslatableText({identifier, className}) {
    const { lang } = useLanguageContext();
    return (
        <span className={className} key={`${lang}-${identifier}`}>{(SupportedLanguages[lang][identifier] == undefined) ? identifier : SupportedLanguages[lang][identifier]}</span>
    )
}