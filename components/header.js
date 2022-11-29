import styles from '../styles/Home.module.css'
import HomeButton from './homeButton'
import LanguageSelector from './languageSelector'
import TranslatableText from './translatableText'

export default function Header() {
    return (
        <header className={styles.header}>
            <div className="row py-2 w-100">
                <div className="col-2 col-md-1 col-lg-1">
                    <HomeButton />
                </div>
                <div className="col-8 col-md-4 col-lg-4 d-inline-flex align-items-center">
                    <TranslatableText identifier="header.selector.language" className="me-3"></TranslatableText>
                    <LanguageSelector />
                </div>
            </div>
        </header>
    )
}