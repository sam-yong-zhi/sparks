import Groq from "groq-sdk"
import type { AIResult, Priority } from "@/types"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// llama-3.1-8b-instant: 14,400 RPD free — more than enough for personal use
const MODEL = "llama-3.1-8b-instant"

export async function processIdea(
  rawInput: string,
  categories: string[]
): Promise<AIResult> {
  const categoryList = categories.join(", ")

  const response = await groq.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a personal idea organizer. Extract and structure raw thoughts into clean entries.

Available categories: ${categoryList}

Rules:
- Pick the most appropriate category from the list above
- If none fit well, suggest a new category name (short, title-case, 1-3 words)
- title: max 8 words, punchy and specific
- summary: 1-2 clean sentences capturing the core idea
- tags: up to 3 lowercase keyword strings
- priority: "normal", "important", or "urgent" based on urgency signals in the text

Return a JSON object with keys: title, summary, category, tags (array of strings), priority`,
      },
      {
        role: "user",
        content: rawInput,
      },
    ],
  })

  const text = response.choices[0]?.message?.content ?? ""

  let parsed: {
    title: string
    summary: string
    category: string
    tags: string[]
    priority: string
  }

  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error(`AI returned invalid JSON: ${text.slice(0, 200)}`)
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
