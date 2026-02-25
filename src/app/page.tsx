export const dynamic = "force-dynamic"

import { getIdeas, getCategories } from "@/lib/db"
import HomeClient from "@/components/HomeClient"

export default async function HomePage() {
  const [ideas, categories] = await Promise.all([getIdeas(), getCategories()])

  return <HomeClient initialIdeas={ideas} initialCategories={categories} />
}
