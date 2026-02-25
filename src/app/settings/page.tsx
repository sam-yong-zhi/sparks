export const dynamic = "force-dynamic"

import { getCategories } from "@/lib/db"
import SettingsClient from "@/components/SettingsClient"

export default async function SettingsPage() {
  const categories = await getCategories()
  return <SettingsClient initialCategories={categories} />
}
