import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CodeSnippet } from './CodeSnippet'

const meta = {
  title: 'UI/CodeSnippet',
  component: CodeSnippet,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A code snippet component with copy-to-clipboard functionality. Click anywhere on the component to copy the code.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    code: {
      control: 'text',
      description: 'The code or text to display in the snippet',
    },
    className: {
      control: 'text',
      description: 'Optional CSS class name',
    },
    placeholder: {
      control: 'text',
      description: 'Optional placeholder text to show when code is empty',
    },
    maxWidth: {
      control: 'text',
      description: 'Optional max width for the snippet',
    },
  },
} satisfies Meta<typeof CodeSnippet>

export default meta
type Story = StoryObj<typeof CodeSnippet>

export const Default = () => (
  <CodeSnippet code="ccfg_plaid_m7z5neihAHHSKZD801" />
)

export const WithPlaceholder = () => (
  <CodeSnippet code="" placeholder="sf_ykhiar" />
)

export const CustomStyling = () => (
  <CodeSnippet 
    code="api_key_12345abcdef" 
    className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200" 
  />
)

export const LongCode = () => (
  <div className="w-full space-y-4">
    <h3 className="text-sm font-medium">Full width (container-constrained)</h3>
    <CodeSnippet 
      code="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ" 
    />
    
    <h3 className="text-sm font-medium mt-4">Fixed width (300px)</h3>
    <CodeSnippet 
      code="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ" 
      maxWidth="300px"
    />
    
    <h3 className="text-sm font-medium mt-4">Percentage width (50%)</h3>
    <CodeSnippet 
      code="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ" 
      maxWidth="50%"
    />
  </div>
)

export const ResponsiveExample = () => (
  <div className="space-y-4">
    <div className="w-full">
      <CodeSnippet code="Full width container example" />
    </div>
    <div className="w-3/4">
      <CodeSnippet code="75% width container example" />
    </div>
    <div className="w-1/2">
      <CodeSnippet code="50% width container example" />
    </div>
    <div className="w-1/4">
      <CodeSnippet code="25% width container example" />
    </div>
  </div>
) 