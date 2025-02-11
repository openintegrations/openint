import {Loader2} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
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
  return isOpen ? (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            onClick={() => setIsOpen(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              disabled={isDeleting}
              className="mr-auto"
              onClick={(e) => {
                onDelete()
                e.preventDefault()
              }}
              variant="destructive">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText ?? 'Confirm'}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : null
}
