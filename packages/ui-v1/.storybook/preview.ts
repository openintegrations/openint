import '../dist/tailwind.css'
// definePreview causes crash and does not work yet
// import {definePreview} from '@storybook/experimental-nextjs-vite'
import type {Preview} from '@storybook/react'

export const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
} satisfies Preview

export default preview
