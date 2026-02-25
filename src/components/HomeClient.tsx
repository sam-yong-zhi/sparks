"use client"

import { useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import type { Idea, Category, AIResult } from "@/types"
import { useDarkMode } from "@/hooks/useDarkMode"
import CaptureForm from "./CaptureForm"
import AIReviewPanel from "./AIReviewPanel"
import IdeaList from "./IdeaList"
import IdeaDetail from "./IdeaDetail"

interface Props {
  initialIdeas: Idea[]
  initialCategories: Category[]
}

export default function HomeClient({ initialIdeas, initialCategories }: Props) {
  const { dark, toggle } = useDarkMode()
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [aiResult, setAiResult] = useState<AIResult | null>(null)
  const [rawInput, setRawInput] = useState("")
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [showCapture, setShowCapture] = useState(false)

  function handleAIResult(result: AIResult, raw: string) {
    setAiResult(result)
    setRawInput(raw)
    setShowCapture(false)
  }

  function handleIdeaSaved(idea: Idea) {
    setIdeas((prev) => [idea, ...prev])
    setAiResult(null)
    setRawInput("")
  }

  function handleIdeaUpdated(idea: Idea) {
    setIdeas((prev) => prev.map((i) => (i.id === idea.id ? idea : i)))
    setSelectedIdea(null)
  }

  function handleIdeaDeleted(id: string) {
    setIdeas((prev) => prev.filter((i) => i.id !== id))
    setSelectedIdea(null)
  }

  function handleCategoryCreated(category: Category) {
    setCategories((prev) =>
      [...prev, category].sort((a, b) => a.name.localeCompare(b.name))
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top nav */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Sparks</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            >
              {dark ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link
              href="/settings"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Capture area */}
        {!aiResult && (showCapture || ideas.length === 0) && (
          <div className="mb-6">
            <CaptureForm onResult={handleAIResult} />
          </div>
        )}

        {/* AI review panel */}
        {aiResult && (
          <div className="mb-6">
            <AIReviewPanel
              result={aiResult}
              rawInput={rawInput}
              categories={categories}
              onSaved={handleIdeaSaved}
              onCancel={() => { setAiResult(null); setRawInput("") }}
              onCategoryCreated={handleCategoryCreated}
            />
          </div>
        )}

        {/* Idea list */}
        {!aiResult && (
          <IdeaList
            initialIdeas={ideas}
            categories={categories}
            onSelectIdea={setSelectedIdea}
          />
        )}
      </main>

      {/* Floating capture button (mobile) */}
      {!aiResult && !showCapture && (
        <button
          onClick={() => setShowCapture(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors z-30"
          aria-label="New idea"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Idea detail slide-over */}
      {selectedIdea && (
        <IdeaDetail
          idea={selectedIdea}
          categories={categories}
          onClose={() => setSelectedIdea(null)}
          onUpdated={handleIdeaUpdated}
          onDeleted={handleIdeaDeleted}
        />
      )}
    </div>
  )
}
