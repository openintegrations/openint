import {Loader2} from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../shadcn'

export function DeleteConfirmation({
  isDeleting,
  isOpen,
  onDelete,
  setIsOpen,
  title,
  description,
  confirmText,
}: {
  isDeleting: boolean
  isOpen: boolean
  onDelete: () => void
  setIsOpen: (open: boolean) => void
  title?: string
  description?: string
  confirmText?: string
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={isDeleting}
            variant="outline"
            onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={isDeleting}
            onClick={onDelete}
            variant="destructive">
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText ?? 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
