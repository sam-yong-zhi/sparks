export type Priority = 'normal' | 'important' | 'urgent'
export type Status = 'active' | 'actioned' | 'archived'

export interface Idea {
  id: string
  raw_input: string
  title: string
  summary: string
  category: string
  tags: string[]
  priority: Priority
  status: Status
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  created_at: string
}

export interface AIResult {
  title: string
  summary: string
  category: string
  tags: string[]
  priority: Priority
  isNewCategory: boolean
}

export interface IdeaFilters {
  category?: string
  status?: Status
  priority?: Priority
  search?: string
  sort?: 'newest' | 'oldest' | 'priority'
}
