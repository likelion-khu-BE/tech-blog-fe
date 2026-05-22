export type EventType = 'hackathon' | 'ideathon' | 'workshop' | 'project' | 'meetup'
export type SessionStatus = 'SCHEDULED' | 'ONGOING' | 'DONE'
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
  weekLabel: string
  title: string
  speakers: { id: number; name: string; role: string }[]
  status: SessionStatus
  rating: number
  noteCount: number
  resourceCount: number
}

export interface NoteLink {
  label: string
  url: string
  order: number
}

export interface NoteAuthor {
  id: number
  name: string
  initial: string
}

export interface NoteItem {
  id: number
  author: NoteAuthor
  body: string
  links: NoteLink[]
  createdAt: string
}

export interface ResourceItem {
  id: number
  type: ResourceKind
  name: string
  uploader: { id: number; name: string; initial: string }
  sizeLabel?: string
  url: string
}

export interface RetroItem {
  id: number
  author: NoteAuthor
  rating: number
  body: string
}
