import { redirect } from 'next/navigation'
import { fallbackLng } from './settings'

export default function RootPage() {
  redirect(`/${fallbackLng}`)
}