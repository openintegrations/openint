import '@testing-library/jest-dom/extend-expect'
import 'jest-location-mock'
import {fireEvent, render} from '@testing-library/react'
import * as React from 'react'
import {act} from 'react-dom/test-utils'
import {FilePicker} from '../src/components/FilePicker'
import {mockConnectionsResponse} from './mock'

const token = 'xxx'

async function mockFetch(url: any) {
  if (url === 'https://todo.com') {
    return {
      ok: true,
      status: 200,
      json: async () => ({data: mockConnectionsResponse}),
    }
  }

  return {
    ok: true,
    status: 200,
    json: async () => ({data: []}),
  }
}

describe('FilePicker - With connections', () => {
  beforeEach(() => jest.spyOn(window, 'fetch'))

  beforeEach(() =>
    (window.fetch as any).mockImplementation((url: any) => mockFetch(url)),
  )

  it('should show the select a file message', async () => {
    let screen: any
    await act(async () => {
      screen = render(<FilePicker token={token} open />)
    })

    expect(screen.getByText('Select a file')).toBeInTheDocument()
  })

  it('should have the Google Drive connector', async () => {
    let screen: any
    await act(async () => {
      screen = render(<FilePicker token={token} open />)
    })

    expect(screen.getByText('Google Drive')).toBeInTheDocument()
  })

  it('should show the subTitle if given', async () => {
    let screen: any
    await act(async () => {
      screen = render(
        <FilePicker token={token} open subTitle="Cool subtitle" />,
      )
    })

    expect(screen.getByText('Cool subtitle')).toBeInTheDocument()
  })

  it('should show the subTitle if given', async () => {
    let screen: any
    await act(async () => {
      screen = render(
        <FilePicker token={token} open subTitle="Cool subtitle" />,
      )
    })

    expect(screen.getByText('Cool subtitle')).toBeInTheDocument()
  })

  it('should show attribution if showAttribution is true', async () => {
    let screen: any
    await act(async () => {
      screen = render(
        <FilePicker
          token={token}
          open
          subTitle="Cool subtitle"
          showAttribution={true}
        />,
      )
    })

    expect(screen.getByText('Powered by')).toBeInTheDocument()
  })

  it('should hide attribution if showAttribution is false', async () => {
    let screen: any
    await act(async () => {
      screen = render(
        <FilePicker
          token={token}
          open
          subTitle="Cool subtitle"
          showAttribution={false}
        />,
      )
    })

    expect(screen.queryByText('Powered by')).not.toBeInTheDocument()
  })

  it('should show attribution if showAttribution is true', async () => {
    let screen: any
    await act(async () => {
      screen = render(
        <FilePicker
          token={token}
          open
          subTitle="Cool subtitle"
          showAttribution={true}
        />,
      )
    })

    expect(screen.getByText('Powered by')).toBeInTheDocument()
  })

  it('should trigger an onClose event when closing the modal', async () => {
    let screen: any
    const mockFunction = jest.fn()

    await act(async () => {
      screen = render(
        <FilePicker
          token={token}
          open
          subTitle="Cool subtitle"
          showAttribution={true}
          onClose={mockFunction}
        />,
      )
    })

    const selectButton = screen.getByTestId('backdrop')
    fireEvent.click(selectButton)

    expect(mockFunction).toBeCalled()
  })

  it('should trigger an onConnectionSelect event when selecting a connection', async () => {
    let screen: any
    const mockFunction = jest.fn()

    await act(async () => {
      screen = render(
        <FilePicker
          token={token}
          open
          subTitle="Cool subtitle"
          showAttribution={true}
          onConnectionSelect={mockFunction}
        />,
      )
    })

    const selectButton = screen.getByTestId('select-connection-button')
    fireEvent.click(selectButton)

    const googleDriveSelection = screen.getByTestId('select-connection-2')
    fireEvent.click(googleDriveSelection)

    expect(mockFunction).toBeCalled()
  })

  it('should show the selected connection after selecting a connection', async () => {
    let screen: any

    await act(async () => {
      screen = render(
        <FilePicker
          token={token}
          open
          subTitle="Cool subtitle"
          showAttribution={true}
        />,
      )
    })

    const selectButton = screen.getByTestId('select-connection-button')
    fireEvent.click(selectButton)

    const googleDriveSelection = screen.getByTestId('select-connection-2')
    fireEvent.click(googleDriveSelection)

    expect(selectButton).toHaveTextContent('Google Drive')
  })

  it('should show the files container after selecting a connection', async () => {
    let screen: any

    await act(async () => {
      screen = render(<FilePicker token={token} open showAttribution={false} />)
    })

    const selectButton = screen.getByTestId('select-connection-button')
    fireEvent.click(selectButton)

    const googleDriveSelection = screen.getByTestId('select-connection-2')
    fireEvent.click(googleDriveSelection)

    const contentContainer = screen.getByTestId('files-container')

    expect(contentContainer).toBeInTheDocument()
  })

  it('should show the fileToSave form if file is provided', async () => {
    let screen: any

    await act(async () => {
      screen = render(
        <FilePicker
          token={token}
          open
          showAttribution={false}
          fileToSave="fileToSave"
        />,
      )
    })

    const selectButton = screen.getByTestId('file-to-save-form')

    expect(selectButton).toBeInTheDocument()
  })

  // it('should show the file details and trigger a onSelect event when selecting a file', async () => {
  //   let screen: any
  //   const mockFunction = jest.fn()

  //   await act(async () => {
  //     screen = render(<FilePicker token={token} open />)
  //   })

  //   const selectButton = screen.getByTestId('select-connection-button')
  //   fireEvent.click(selectButton)

  //   const googleDriveSelection = screen.getByTestId('select-connection-2')
  //   fireEvent.click(googleDriveSelection)

  //   let screenAfterLoading: any

  //   waitForElementToBeRemoved(document.querySelector('div.empty')).then(() => {
  //     const row = screen.getByTestId('row-0')
  //     fireEvent.click(row)

  //     const details = screenAfterLoading.getByTestId('file-details')
  //     const selectFileButton = screen.getByTestId('select-file-button')

  //     expect(details).toBeInTheDocument()
  //     expect(selectFileButton).toBeInTheDocument()

  //     fireEvent.click(selectFileButton)

  //     expect(mockFunction).toBeCalled()
  //   })
  // })
})
