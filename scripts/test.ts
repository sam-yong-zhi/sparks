/**
 * End-to-end test script for Sparks
 * Tests AI processing, DB operations, and full idea lifecycle
 * Run with: npx tsx --env-file=.env.local scripts/test.ts
 */

import { processIdea } from "../src/lib/ai"
import {
  getCategories,
  createIdea,
  getIdeas,
  updateIdea,
  deleteIdea,
  createCategory,
} from "../src/lib/db"

let passed = 0
let failed = 0

function pass(label: string) {
  console.log(`  ✓ ${label}`)
  passed++
}

function fail(label: string, err: unknown) {
  console.error(`  ✗ ${label}`)
  console.error(`    ${err instanceof Error ? err.message : err}`)
  failed++
}

async function run() {
  console.log("\n=== Sparks Test Suite ===\n")

  // ─── 1. Supabase: fetch seeded categories ───────────────────────────────
  console.log("1. Supabase — categories")
  let categories: Awaited<ReturnType<typeof getCategories>> = []
  try {
    categories = await getCategories()
    if (categories.length < 8) throw new Error(`Expected 8 categories, got ${categories.length}`)
    pass(`Fetched ${categories.length} categories: ${categories.map(c => c.name).join(", ")}`)
  } catch (err) {
    fail("Fetch categories", err)
  }

  const categoryNames = categories.map(c => c.name)

  // ─── 2. AI: simple idea ─────────────────────────────────────────────────
  console.log("\n2. Gemini AI — simple idea")
  try {
    const result = await processIdea("turn my blog to include chinese language", categoryNames)
    if (!result.title) throw new Error("Missing title")
    if (!result.summary) throw new Error("Missing summary")
    if (!result.category) throw new Error("Missing category")
    if (!Array.isArray(result.tags)) throw new Error("Tags not an array")
    if (!["normal","important","urgent"].includes(result.priority)) throw new Error(`Invalid priority: ${result.priority}`)
    pass(`title: "${result.title}"`)
    pass(`summary: "${result.summary}"`)
    pass(`category: "${result.category}" | priority: ${result.priority} | tags: [${result.tags.join(", ")}]`)
  } catch (err) {
    fail("Simple idea", err)
  }

  // ─── 3. AI: urgent idea ─────────────────────────────────────────────────
  await new Promise(r => setTimeout(r, 5000))
  console.log("\n3. Gemini AI — urgent idea")
  try {
    const result = await processIdea(
      "URGENT need to renew my passport before our family trip next month",
      categoryNames
    )
    if (result.priority !== "urgent" && result.priority !== "important")
      throw new Error(`Expected urgent/important, got: ${result.priority}`)
    pass(`Correctly flagged as "${result.priority}"`)
    pass(`title: "${result.title}"`)
  } catch (err) {
    fail("Urgent idea", err)
  }

  // ─── 4. AI: bullet points ───────────────────────────────────────────────
  await new Promise(r => setTimeout(r, 5000))
  console.log("\n4. Gemini AI — bullet point input")
  try {
    const raw = `content ideas for next month:
- write about my HDB journey
- video on teaching kids about money
- compare CPF vs private investment`
    const result = await processIdea(raw, categoryNames)
    pass(`title: "${result.title}"`)
    pass(`category: "${result.category}"`)
  } catch (err) {
    fail("Bullet point input", err)
  }

  // ─── 5. AI: new category suggestion ─────────────────────────────────────
  await new Promise(r => setTimeout(r, 5000))
  console.log("\n5. Gemini AI — new category suggestion")
  try {
    const result = await processIdea(
      "looking into getting a second passport through investment programs like Malta or Portugal golden visa",
      categoryNames
    )
    pass(`isNewCategory: ${result.isNewCategory} | category: "${result.category}"`)
  } catch (err) {
    fail("New category suggestion", err)
  }

  // ─── 6. DB: full idea lifecycle ──────────────────────────────────────────
  console.log("\n6. Supabase — full idea lifecycle (create → read → update → delete)")
  let ideaId: string | null = null
  try {
    // Create
    const idea = await createIdea({
      raw_input: "test idea from automated test",
      title: "Test Idea",
      summary: "This is a test idea created by the test suite.",
      category: categoryNames[0] ?? "Random",
      tags: ["test", "automated"],
      priority: "normal",
      status: "active",
      notes: null,
    })
    ideaId = idea.id
    if (!idea.id) throw new Error("No ID returned")
    pass(`Created idea: ${idea.id}`)

    // Read
    const ideas = await getIdeas()
    const found = ideas.find(i => i.id === idea.id)
    if (!found) throw new Error("Created idea not found in list")
    pass(`Read idea from list (${ideas.length} total)`)

    // Update
    const updated = await updateIdea(idea.id, { priority: "important", notes: "Updated by test" })
    if (updated.priority !== "important") throw new Error("Priority not updated")
    if (updated.notes !== "Updated by test") throw new Error("Notes not updated")
    pass(`Updated priority to "important" and added notes`)

    // Delete
    await deleteIdea(idea.id)
    const afterDelete = await getIdeas()
    const stillExists = afterDelete.find(i => i.id === idea.id)
    if (stillExists) throw new Error("Idea still exists after delete")
    pass(`Deleted idea successfully`)
    ideaId = null
  } catch (err) {
    fail("Idea lifecycle", err)
    // Cleanup if something left behind
    if (ideaId) {
      await deleteIdea(ideaId).catch(() => {})
    }
  }

  // ─── 7. DB: create custom category ──────────────────────────────────────
  console.log("\n7. Supabase — create custom category")
  let testCatId: string | null = null
  try {
    const cat = await createCategory("Test Category XYZ")
    testCatId = cat.id
    pass(`Created category: "${cat.name}" (${cat.id})`)

    // Verify it appears in list
    const cats = await getCategories()
    const found = cats.find(c => c.id === cat.id)
    if (!found) throw new Error("Category not found after creation")
    pass(`Confirmed in categories list`)

    // Cleanup — delete from DB directly
    const { supabaseServer } = await import("../src/lib/supabase")
    await supabaseServer().from("categories").delete().eq("id", cat.id)
    pass(`Cleaned up test category`)
  } catch (err) {
    fail("Custom category", err)
  }

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(40)}`)
  console.log(`Results: ${passed} passed, ${failed} failed`)
  if (failed === 0) {
    console.log("All tests passed ✓ App is ready.\n")
  } else {
    console.log("Some tests failed — see errors above.\n")
    process.exit(1)
  }
}

run().catch(err => {
  console.error("Fatal error:", err)
  process.exit(1)
})
