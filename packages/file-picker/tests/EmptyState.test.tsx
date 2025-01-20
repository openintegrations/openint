import '@testing-library/jest-dom/extend-expect'

import * as React from 'react'

import { render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { FilePicker } from '../src/components/FilePicker'

const token = 'xxx'

async function mockFetch() {
  return {
    ok: true,
    status: 200,
    json: async () => ({ data: [] })
  }
}

describe('FilePicker - Empty state', () => {
  beforeEach(() => jest.spyOn(window, 'fetch'))
  beforeEach(() => (window.fetch as any).mockImplementation(mockFetch))

  it('should render the FilePicker with a custom title', async () => {
    let screen: any
    await act(async () => {
      screen = render(
        <FilePicker token={token} title="Custom Title" open showAttribution={false} />
      )
    })
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })

  it('should render the FilePicker without connectors', async () => {
    let screen: any
    await act(async () => {
      screen = render(<FilePicker token={token} open showAttribution={false} />)
    })

    expect(screen.getByText('No integrations')).toBeInTheDocument()
  })
})
