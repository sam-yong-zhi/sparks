import Anthropic from "@anthropic-ai/sdk"
import type { AIResult, Priority } from "@/types"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// claude-haiku-4-5-20251001 — verify against Anthropic docs if errors occur
const MODEL = "claude-haiku-4-5-20251001"

export async function processIdea(
  rawInput: string,
  categories: string[]
): Promise<AIResult> {
  const categoryList = categories.join(", ")

  const systemPrompt = `You are a personal idea organizer. Your job is to extract and structure raw thoughts into clean, organized entries.

Available categories: ${categoryList}

Rules:
- Pick the most appropriate category from the list above
- If none fit well, suggest a new category name (short, title-case, 1-3 words)
- Return ONLY valid JSON, no other text
- title: max 8 words, punchy and specific
- summary: 1-2 clean sentences capturing the core idea
- tags: up to 3 lowercase keyword strings
- priority: "normal", "important", or "urgent" based on time-sensitivity or importance signals in the text`

  const userMessage = `Here is the raw input to process:\n\n${rawInput}`

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    messages: [{ role: "user", content: userMessage }],
    system: systemPrompt,
  })

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("")

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim()

  let parsed: {
    title: string
    summary: string
    category: string
    tags: string[]
    priority: string
  }

  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(`AI returned invalid JSON: ${cleaned.slice(0, 200)}`)
  }

  const validPriorities: Priority[] = ["normal", "important", "urgent"]
  const priority: Priority = validPriorities.includes(parsed.priority as Priority)
    ? (parsed.priority as Priority)
    : "normal"

  const isNewCategory = !categories
    .map((c) => c.toLowerCase())
    .includes(parsed.category?.toLowerCase())

  return {
    title: parsed.title ?? "",
    summary: parsed.summary ?? "",
    category: parsed.category ?? categories[0],
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 3) : [],
    priority,
    isNewCategory,
  }
}
