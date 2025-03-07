import {routerContextFromViewer} from '@openint/api-v1/trpc/context'
import {eventRouter} from '@openint/api-v1/trpc/routers/event'
import {schema} from '@openint/db'
import {initDbPGLite} from '@openint/db/db.pglite'
import type {Meta, StoryObj} from '@storybook/react'
import React from 'react'

export function ApiV1App({className}: {className: string}) {
  const [text, setText] = React.useState('')
  React.useEffect(() => {
    void (async () => {
      const db = initDbPGLite()
      // const res = await db.$exec('SELECT 1+1 as count')

      // Migrate does not work well in in browser today, so probably too much
      // https://github.com/drizzle-team/drizzle-orm/issues/1009
      // await db.$migrate()
      await db.$exec(`
        CREATE TABLE public.event (
          id character varying DEFAULT 'concat(''evt_'', generate_ulid())'::character varying NOT NULL,
          name character varying NOT NULL,
          data jsonb NOT NULL,
          "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
          "user" jsonb,
          v character varying,
          org_id character varying GENERATED ALWAYS AS (("user" ->> 'org_id'::text)) STORED,
          user_id character varying GENERATED ALWAYS AS (("user" ->> 'user_id'::text)) STORED,
          customer_id character varying GENERATED ALWAYS AS (("user" ->> 'customer_id'::text)) STORED,
          CONSTRAINT event_id_prefix_check CHECK (starts_with((id)::text, 'evt_'::text))
        );
      `)
      await db.insert(schema.event).values({
        id: 'evt_123',
        name: 'test',
        data: {foo: 'bar'},
      })
      const caller = eventRouter.createCaller(
        routerContextFromViewer({db, viewer: {role: 'system'}}),
      )
      const events = await caller.listEvents({limit: 10, offset: 0})

      setText(JSON.stringify(events, null, 2))
    })()
  }, [])
  return <pre className={className}>Hello World {text}</pre>
}

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'ApiV1App',
  component: ApiV1App,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    // layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  // tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  // argTypes: {
  //   backgroundColor: {control: 'color'},
  // },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  // args: {onClick: fn()},
} satisfies Meta<typeof ApiV1App>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    className: 'bg-blue-100 text-white p-4',
  },
}
