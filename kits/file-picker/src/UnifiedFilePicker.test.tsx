import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import type {AuthObject, FilePickerOptions} from './types'
import {UnifiedFilePicker} from './UnifiedFilePicker'

// Add the mock declarations
jest.mock('./sharepoint-picker', () => ({
  SharePointPicker: () => (
    <div data-testid="sharepoint-picker">SharePoint Picker</div>
  ),
}))

jest.mock('./google-drive-picker', () => ({
  GoogleDrivePicker: () => (
    <div data-testid="google-drive-picker">Google Drive Picker</div>
  ),
}))

describe('UnifiedFilePicker', () => {
  const mockAuth: AuthObject = {
    openIntFilePickerMagicLink:
      'https://local.openint.dev/connect/portal?connection_id=mockConnectionId&token=mockToken&theme=dark&multi_select=true&folder_select=true',
  }

  const mockOptions: FilePickerOptions = {
    isOpen: true,
    onClose: jest.fn(),
    onSelect: jest.fn(),
    theme: 'light',
    multiselect: true,
    folderSelect: false,
  }

  it('renders without crashing', () => {
    render(<UnifiedFilePicker auth={mockAuth} options={mockOptions} />)
  })

  it('calls onClose when close button is clicked', async () => {
    render(<UnifiedFilePicker auth={mockAuth} options={mockOptions} />)
    await waitFor(() => {
      const closeButton = screen.getByRole('button', {name: '×'})
      fireEvent.click(closeButton)
      expect(mockOptions.onClose).toHaveBeenCalled()
    })
  })
})
