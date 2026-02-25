import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getIdeas, createIdea } from "@/lib/db"
import type { IdeaFilters } from "@/types"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const filters: IdeaFilters = {}

  const category = searchParams.get("category")
  const status = searchParams.get("status")
  const priority = searchParams.get("priority")
  const sort = searchParams.get("sort")

  if (category) filters.category = category
  if (status) filters.status = status as IdeaFilters["status"]
  if (priority) filters.priority = priority as IdeaFilters["priority"]
  if (sort) filters.sort = sort as IdeaFilters["sort"]

  const ideas = await getIdeas(filters)
  return NextResponse.json(ideas)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { raw_input, title, summary, category, tags, priority } = body

  if (!raw_input || !title || !summary || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const idea = await createIdea({
    raw_input,
    title,
    summary,
    category,
    tags: tags ?? [],
    priority: priority ?? "normal",
    status: "active",
    notes: null,
  })

  return NextResponse.json(idea, { status: 201 })
}
