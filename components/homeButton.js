import styles from '../styles/HomeButton.module.css'
import Link from 'next/link'
import Home from '@mui/icons-material/Home'


export default function HomeButton() {
    return (
        <div className={styles.homebutton} title="Go to homepage">
            <Link href="/" className={styles.button}>
                <Home style={{ fontSize: 50 }} />
            </Link>
        </div>
    )
} 