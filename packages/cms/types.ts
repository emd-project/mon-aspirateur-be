export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'date'
  | 'select'
  | 'slug'
  | 'tags'
  | 'list'
  | 'repeater'
  | 'relation'
  | 'image'

export interface SelectOption {
  label: string
  value: string
}

export interface FieldDef {
  type: FieldType
  label: string
  required?: boolean
  options?: SelectOption[]           // select
  fields?: Record<string, FieldDef>  // repeater
  collection?: string                // relation
}

export interface CollectionDef {
  label: string
  path: string
  format: 'mdx' | 'yaml' | 'json'
  singleton?: boolean
  slug?: string
  /** No locale/category subdirectory — path is {collection.path}/{slug}.ext */
  flatPath?: boolean
  /** Hide "New" button and delete actions — for fixed-slug collections like pages */
  readOnly?: boolean
  fields: Record<string, FieldDef>
}

export interface MediaConfig {
  path: string
  allowedTypes: string[]
  maxSizeMB: number
}

export interface CmsConfig {
  siteName: string
  repo: string
  branch: string
  collections: Record<string, CollectionDef>
  media: MediaConfig
}

export type UserRole = 'admin' | 'editor'

export interface CmsUser {
  id: string
  name: string
  email: string
  role: UserRole
  passwordHash: string
  salt: string
}

export interface CmsSession {
  userId: string
  role: UserRole
  loginMethod: 'github' | 'password'
  githubToken?: string
  expiresAt: number
}

export interface ContentEntry {
  slug: string
  filePath: string
  frontmatter: Record<string, unknown>
  body: string
  sha?: string
}

export interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  type: 'file' | 'dir'
  download_url: string | null
}

export interface GitHubFileContent extends GitHubFile {
  content: string
  encoding: 'base64'
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}
