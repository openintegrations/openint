import type {Meta, StoryObj} from '@storybook/react'
import {type FC} from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {Alert, AlertDescription, AlertTitle} from '@openint/shadcn/ui/alert'
import {Button} from '@openint/shadcn/ui/button'
import {Card, CardContent, CardHeader} from '@openint/shadcn/ui/card'
import {Input} from '@openint/shadcn/ui/input'

interface ThemeOverrideProps {
  className?: string
  themeVariables?: {
    '--primary'?: string
    '--background'?: string
    '--foreground'?: string
    '--card'?: string
    '--card-foreground'?: string
  }
}

const ThemeOverrideDemo: FC<ThemeOverrideProps> = ({
  className,
  themeVariables = {},
  // eslint-disable-next-line arrow-body-style
}) => {
  // Parse theme variables from URL params
  const urlParams = new URLSearchParams(window.location.search)
  const urlThemeVariables: Record<string, string> = {}

  // Extract any theme variables from URL params
  urlParams.forEach((value, key) => {
    if (key.startsWith('--')) {
      urlThemeVariables[key] = value
    }
  })

  // Merge explicit theme variables with URL params, giving URL params precedence
  const mergedThemeVariables = {
    ...themeVariables,
    ...urlThemeVariables,
  }
  return (
    <div className={cn('space-y-8 p-8', className)}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          :root {
            ${Object.entries(mergedThemeVariables)
              .map(([key, value]) => `${key}: ${value};`)
              .join('\n')}
          }
          .org-theme-wrapper {

          }
        `,
        }}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Buttons</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="destructive">Destructive Button</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Inputs</h3>
        <div className="flex flex-col gap-4">
          <Input placeholder="Default input" />
          <Input placeholder="Disabled input" disabled />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cards</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <h4 className="font-medium">Card Title</h4>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                This is a card component with some sample content to demonstrate
                theming.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h4 className="font-medium">Another Card</h4>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Cards can be used to group related content and actions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Alerts</h3>
        <div className="space-y-4">
          <Alert>
            <AlertTitle>Primary Alert</AlertTitle>
            <AlertDescription>
              This is a primary alert message.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Destructive Alert</AlertTitle>
            <AlertDescription>
              This is a destructive alert message.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'ThemeOverride',
  component: ThemeOverrideDemo,
} satisfies Meta<typeof ThemeOverrideDemo>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Light: Story = {
  args: {
    themeVariables: {
      '--primary': 'hsl(330, 81%, 60%)', // Pink primary
      '--background': 'hsl(280, 65%, 95%)', // Light purple background
      '--foreground': 'hsl(280, 75%, 25%)', // Dark purple text
    },
  },
}

export const Dark: Story = {}
