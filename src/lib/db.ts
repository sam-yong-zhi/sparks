import { supabaseServer } from "./supabase"
import type { Idea, Category, IdeaFilters, Priority, Status } from "@/types"

export async function getCategories(): Promise<Category[]> {
  const db = supabaseServer()
  const { data, error } = await db
    .from("categories")
    .select("*")
    .order("name")
  if (error) throw new Error(error.message)
  return data
}

export async function createCategory(name: string): Promise<Category> {
  const db = supabaseServer()
  const { data, error } = await db
    .from("categories")
    .insert({ name })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function getIdeas(filters: IdeaFilters = {}): Promise<Idea[]> {
  const db = supabaseServer()
  let query = db.from("ideas").select("*")

  if (filters.category) {
    query = query.eq("category", filters.category)
  }
  if (filters.status) {
    query = query.eq("status", filters.status)
  }
  if (filters.priority) {
    query = query.eq("priority", filters.priority)
  }

  if (filters.sort === "oldest") {
    query = query.order("created_at", { ascending: true })
  } else if (filters.sort === "priority") {
    // urgent > important > normal
    query = query
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function createIdea(
  payload: Omit<Idea, "id" | "created_at" | "updated_at">
): Promise<Idea> {
  const db = supabaseServer()
  const { data, error } = await db
    .from("ideas")
    .insert(payload)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateIdea(
  id: string,
  payload: Partial<Omit<Idea, "id" | "created_at" | "updated_at" | "raw_input">>
): Promise<Idea> {
  const db = supabaseServer()
  const { data, error } = await db
    .from("ideas")
    .update(payload)
    .eq("id", id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteIdea(id: string): Promise<void> {
  const db = supabaseServer()
  const { error } = await db.from("ideas").delete().eq("id", id)
  if (error) throw new Error(error.message)
}
