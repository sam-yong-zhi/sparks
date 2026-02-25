import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { processIdea } from "@/lib/ai"
import { getCategories } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { rawInput } = await req.json()
  if (!rawInput?.trim()) {
    return NextResponse.json({ error: "rawInput is required" }, { status: 400 })
  }

  const categories = await getCategories()
  const categoryNames = categories.map((c) => c.name)

  try {
    const result = await processIdea(rawInput.trim(), categoryNames)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI processing failed"
    const isRateLimit = message.includes("429") || message.includes("quota")
    return NextResponse.json(
      { error: isRateLimit ? "AI is rate-limited — wait a minute and try again." : message },
      { status: isRateLimit ? 429 : 500 }
    )
  }
}
