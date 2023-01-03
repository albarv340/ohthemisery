import Head from 'next/head'
import Footer from '../components/footer'
import styles from '../styles/Home.module.css'
import Link from 'next/link'
import TranslatableText from '../components/translatableText'


export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Monumenta Team-only internal items index, based on ohthemisery.tk</title>
        <meta property="og:image" content="/favicon.ico" />
        <meta name="description" content="Monumenta fork of [ENEMY] Guild's Oh the Misery Item Website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Monumenta Team-only internal items index, based on ohthemisery.tk
        </h1>
        <div className={styles.grid}>
          <Link href="/items">
            <a className={styles.card}>
              <h2><TranslatableText identifier="index.pages.items.title"></TranslatableText></h2>
              <p><TranslatableText identifier="index.pages.items.description"></TranslatableText></p>
            </a>
          </Link>
        </div>

        <div className={styles.grid}>
          <Link href="/builder">
            <a className={styles.card}>
              <h2><TranslatableText identifier="index.pages.builder.title"></TranslatableText></h2>
              <p><TranslatableText identifier="index.pages.builder.description"></TranslatableText></p>
            </a>
          </Link>
        </div>
      </main>
    </div>
  )
}
