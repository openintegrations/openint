// Is this the right way to import css?
import '../../../apps/web/app/tailwind.css'

import {definePreview} from '@storybook/experimental-nextjs-vite'
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

// Should be noop, identical
export default definePreview(preview)
