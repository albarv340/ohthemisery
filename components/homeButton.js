import styles from '../styles/HomeButton.module.css'
import Link from 'next/link'
import Home from '@material-ui/icons/Home'


export default function HomeButton() {
    return (
        <div className={styles.homebutton} title="Go to homepage">
            <Link href="/">
                <a className={styles.button}>
                    <Home style={{ fontSize: 50 }} />
                </a>
            </Link>
        </div>
    )
} 