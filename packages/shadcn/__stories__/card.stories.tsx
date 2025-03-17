// packages/shadcn/__stories__/card.stories.tsx
import type {Meta, StoryObj} from '@storybook/react'
import {Input, Label} from '../ui'
import {Button} from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Shadcn/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  // tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

// Basic Card
export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  ),
}

// Card with form
export const WithForm: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Enter your information to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col gap-4">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div className="flex flex-col gap-4">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Your email" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Submit</Button>
      </CardFooter>
    </Card>
  ),
}

// Card with no footer
export const NoFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="bg-muted rounded-md p-2">
            <p className="text-sm font-medium">New message from John</p>
            <p className="text-muted-foreground text-xs">2 minutes ago</p>
          </div>
          <div className="bg-muted rounded-md p-2">
            <p className="text-sm font-medium">New message from Sarah</p>
            <p className="text-muted-foreground text-xs">5 minutes ago</p>
          </div>
          <div className="bg-muted rounded-md p-2">
            <p className="text-sm font-medium">New message from Alex</p>
            <p className="text-muted-foreground text-xs">10 minutes ago</p>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
}
