export type EventType = 'hackathon' | 'ideathon' | 'workshop' | 'project' | 'meetup'
export type SessionState = 'draft' | 'open' | 'progress' | 'done' | 'archive'
export type BoardView = 'events' | 'sessions' | 'notes' | 'resources' | 'dashboard'
export type ResourceKind = 'SLIDE' | 'CODE' | 'LINK' | 'DOCUMENT'
export type ViewMode = 'blog' | 'photo' | 'card'

export interface PostComment {
  author: string
  initial: string
  color: string
  date: string
  text: string
}

export interface Post {
  id: number
  type: EventType
  title: string
  author: string
  initial: string
  color: string
  date: string
  excerpt: string
  tags: string[]
  likes: number
  commentCount: number
  hasThumb: boolean
  thumbGradient: string
  thumbAccent: string
  body: string
  comments: PostComment[]
}

export interface SessionItem {
  id: number
  week: string
  title: string
  content: string
  speaker: string
  rating: number
  noteCount: number
  resourceCount: number
}

export interface NoteItem {
  id: number
  author: string
  initial: string
  color: string
  date: string
  topic: string
  body: string
  code?: string
  codeLang?: string
  links?: string[]
}

export interface ResourceItem {
  id: number
  kind: ResourceKind
  name: string
  author: string
  meta: string
  size?: string
}

export interface RetroItem {
  id: number
  author: string
  initial: string
  color: string
  rating: number
  body: string
}
