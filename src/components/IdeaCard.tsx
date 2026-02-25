"use client"

import type { Idea } from "@/types"

const priorityBorder = {
  urgent: "border-l-red-500",
  important: "border-l-amber-400",
  normal: "border-l-gray-200",
}

const priorityLabel = {
  urgent: { text: "Urgent", className: "bg-red-50 text-red-700" },
  important: { text: "Important", className: "bg-amber-50 text-amber-700" },
  normal: { text: "", className: "" },
}

const statusLabel = {
  active: { text: "Active", className: "bg-gray-100 text-gray-600" },
  actioned: { text: "Actioned", className: "bg-green-50 text-green-700" },
  archived: { text: "Archived", className: "bg-gray-50 text-gray-400" },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000

  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

interface Props {
  idea: Idea
  onClick: (idea: Idea) => void
}

export default function IdeaCard({ idea, onClick }: Props) {
  const border = priorityBorder[idea.priority]
  const pLabel = priorityLabel[idea.priority]
  const sLabel = statusLabel[idea.status]

  return (
    <button
      onClick={() => onClick(idea)}
      className={`w-full text-left bg-white rounded-xl border border-gray-100 border-l-4 ${border} p-4 hover:shadow-md transition-shadow duration-150`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-gray-900 text-sm leading-snug flex-1">
          {idea.title}
        </h3>
        <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
          {formatDate(idea.created_at)}
        </span>
      </div>

      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{idea.summary}</p>

      <div className="flex flex-wrap items-center gap-1.5 mt-3">
        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
          {idea.category}
        </span>

        {idea.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}

        {pLabel.text && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pLabel.className}`}>
            {pLabel.text}
          </span>
        )}

        <span className={`text-xs px-2 py-0.5 rounded-full ${sLabel.className}`}>
          {sLabel.text}
        </span>
      </div>
    </button>
  )
}
