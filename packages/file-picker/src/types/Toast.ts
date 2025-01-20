export interface Toast {
  title: string
  description?: string
  type?: 'success' | 'warning' | 'error' | 'info'
  id?: number
  autoClose?: boolean
  closeAfter?: number
  closeText?: string
  image?: string
}
