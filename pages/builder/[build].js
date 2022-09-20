import { useRouter } from 'next/router'
import Builder from '../builder'

export default function Post() {
  const router = useRouter()

  return (
    <Builder build={router.query.build}></Builder>
  )
}