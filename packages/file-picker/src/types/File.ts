// TODO: make dynamic based on SDK types
export interface File {
  created_at: string
  created_by: string
  downloadable: boolean
  id: string
  mime_type: string
  name: string
  owner: Owner
  parent_folders: ParentFolder[]
  parent_folders_complete: boolean
  size: number
  type: string
  updated_at: string
  updated_by: string
}

interface Owner {
  id: string
  email: string
  name: string
}

interface ParentFolder {
  id?: string
  name?: string
}
