import React, {
  createContext,
  forwardRef,
  Fragment,
  useEffect,
  useState,
} from 'react'
import {File} from '../types'
import {Modal} from './Modal'
import {ModalContent} from './ModalContent'

export interface Props {
  /**
   * The JSON Web Token returned from the Create Session call
   */
  token: string
  /**
   * The function that gets called when files are selected
   */
  onSelect?: (file: File[]) => any
  /**
   * Title shown in the modal
   */
  title?: string
  /**
   * Subtitle shown in the modal
   */
  subTitle?: string
  /**
   * Show powered by OpenInt in the modal backdrop
   */
  showAttribution?: boolean
  /**
   * Opens the file picker if set to true
   */
  open?: boolean
  /**
   * Callback function that gets called when the modal is closed
   */
  onClose?: () => any
}

export const EventsContext = createContext({onSelect: undefined})

const NO_TOKEN_MESSAGE = `No token provided`

export const FilePicker = forwardRef<HTMLElement, Props>(function FilePicker(
  {
    token,
    onSelect,
    title,
    subTitle,
    showAttribution = true,
    open = false,
    onClose,
  },
  ref,
) {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const handleFileSelect = (file: File[]) => {
    let fileToReturn = file
    if (onSelect) onSelect(fileToReturn)
    onCloseModal()
  }

  const onCloseModal = () => {
    setIsOpen(false)
    if (onClose) {
      onClose()
    }
  }

  useEffect(() => {
    if (open) {
      setIsOpen(true)
      if (!token) console.error(NO_TOKEN_MESSAGE)
    }
  }, [open])

  return (
    <Fragment>
      <Modal
        isOpen={isOpen}
        onClose={() => onCloseModal()}
        showAttribution={showAttribution}>
        <ModalContent
          connectToken={token}
          onSelect={handleFileSelect}
          title={title ? title : 'File Picker'}
          subTitle={subTitle ? subTitle : 'Select a file'}
        />
      </Modal>
    </Fragment>
  )
})
