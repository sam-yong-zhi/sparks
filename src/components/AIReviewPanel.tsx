"use client"

import { useState } from "react"
import type { AIResult, Category, Idea, Priority } from "@/types"

interface Props {
  result: AIResult
  rawInput: string
  categories: Category[]
  onSaved: (idea: Idea) => void
  onCancel: () => void
  onCategoryCreated: (category: Category) => void
}

export default function AIReviewPanel({
  result,
  rawInput,
  categories,
  onSaved,
  onCancel,
  onCategoryCreated,
}: Props) {
  const [title, setTitle] = useState(result.title)
  const [summary, setSummary] = useState(result.summary)
  const [category, setCategory] = useState(result.category)
  const [tagsInput, setTagsInput] = useState(result.tags.join(", "))
  const [priority, setPriority] = useState<Priority>(result.priority)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // New category prompt
  const [newCatName, setNewCatName] = useState(result.isNewCategory ? result.category : "")
  const [newCatMode, setNewCatMode] = useState(result.isNewCategory)
  const [newCatSaving, setNewCatSaving] = useState(false)

  const categoryNames = categories.map((c) => c.name)

  async function acceptNewCategory() {
    setNewCatSaving(true)
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName }),
      })
      if (!res.ok) throw new Error("Failed to create category")
      const created: Category = await res.json()
      onCategoryCreated(created)
      setCategory(created.name)
      setNewCatMode(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category")
    } finally {
      setNewCatSaving(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError("")
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 3)

      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_input: rawInput, title, summary, category, tags, priority }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Failed to save idea")
      }

      const idea: Idea = await res.json()
      onSaved(idea)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"

  return (
    <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Review & confirm</h2>
        <button onClick={onCancel} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm">
          Cancel
        </button>
      </div>

      {/* New category prompt */}
      {newCatMode && (
        <div className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 rounded-lg p-3 text-sm">
          <p className="text-amber-800 dark:text-amber-300 font-medium mb-2">
            AI suggested a new category: &ldquo;{result.category}&rdquo;
          </p>
          <div className="flex gap-2 mb-2">
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={acceptNewCategory}
              disabled={newCatSaving || !newCatName.trim()}
              className="bg-amber-500 text-white px-3 py-1 rounded text-sm hover:bg-amber-600 disabled:opacity-50"
            >
              {newCatSaving ? "Saving..." : "Add"}
            </button>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-xs mb-1">Or remap to an existing category:</p>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                setCategory(e.target.value)
                setNewCatMode(false)
              }
            }}
            className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
          >
            <option value="">— pick existing —</option>
            {categoryNames.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Summary</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {categoryNames.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
            {!categoryNames.includes(category) && (
              <option value={category}>{category} (new)</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={inputCls}>
            <option value="normal">Normal</option>
            <option value="important">Important</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Tags (comma-separated, up to 3)
        </label>
        <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className={inputCls} />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving || !title.trim() || !summary.trim() || !category}
        className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {saving ? "Saving..." : "Save idea"}
      </button>
    </div>
  )
}
