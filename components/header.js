import HomeButton from './homeButton'
import LanguageSelector from './languageSelector'
import TranslatableText from './translatableText'

export default function Header() {
    return (
        <header className="py-2 border-bottom border-light mb-2">
            <div className="row mx-0">
                <div className="col-2 col-md-1 col-lg-1">
                    <HomeButton />
                </div>
                <div className="col-8 col-md-4 col-lg-4 d-inline-flex align-items-center">
                    <TranslatableText identifier="header.selector.language" className="me-3"></TranslatableText>
                    <LanguageSelector />
                </div>
                <div className="col d-inline-flex justify-content-end align-items-center">
                    <span className="py-1">Message <b>FlamingoBike#6228</b> if you wish to translate!</span>
                </div>
            </div>
        </header>
    )
}