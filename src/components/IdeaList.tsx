"use client"

import { useState, useMemo } from "react"
import type { Idea, Category, IdeaFilters } from "@/types"
import IdeaCard from "./IdeaCard"

interface Props {
  initialIdeas: Idea[]
  categories: Category[]
  onSelectIdea: (idea: Idea) => void
}

export default function IdeaList({ initialIdeas, categories, onSelectIdea }: Props) {
  const [filters, setFilters] = useState<IdeaFilters>({ status: "active", sort: "newest" })
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    let list = initialIdeas

    if (filters.category) {
      list = list.filter((i) => i.category === filters.category)
    }
    if (filters.status) {
      list = list.filter((i) => i.status === filters.status)
    }
    if (filters.priority) {
      list = list.filter((i) => i.priority === filters.priority)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.summary.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    if (filters.sort === "oldest") {
      list = [...list].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    } else if (filters.sort === "priority") {
      const rank = { urgent: 3, important: 2, normal: 1 }
      list = [...list].sort((a, b) => rank[b.priority] - rank[a.priority])
    } else {
      list = [...list].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }

    return list
  }, [initialIdeas, filters, search])

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[160px] text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={filters.category ?? ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, category: e.target.value || undefined }))
          }
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              status: (e.target.value as IdeaFilters["status"]) || undefined,
            }))
          }
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="active">Active</option>
          <option value="actioned">Actioned</option>
          <option value="archived">Archived</option>
          <option value="">All statuses</option>
        </select>

        <select
          value={filters.priority ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              priority: (e.target.value as IdeaFilters["priority"]) || undefined,
            }))
          }
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="important">Important</option>
          <option value="normal">Normal</option>
        </select>

        <select
          value={filters.sort ?? "newest"}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              sort: e.target.value as IdeaFilters["sort"],
            }))
          }
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      {/* Idea cards */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {search || filters.category || filters.priority
              ? "No ideas match your filters."
              : "No ideas yet. Capture your first spark above!"}
          </div>
        ) : (
          filtered.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} onClick={onSelectIdea} />
          ))
        )}
      </div>
    </div>
  )
}
