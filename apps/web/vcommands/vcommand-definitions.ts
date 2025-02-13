// import {useTheme} from 'next-themes';
import type {CommandDefinitionInput, CommandDefinitionMap} from '@openint/ui';
import {cmdInit} from '@openint/ui';
import {z} from '@openint/util';
// import {delay} from '@openint/util';
import {__DEBUG__} from '@/../app-config/constants';
import {zClient} from '@/lib-common/schemas';
import {copyToClipboard} from '../lib-client/copyToClipboard';
import type {CommandContext} from './vcommand-context';

const cmd = cmdInit<CommandContext>();

const _pipelineCommand = {
  group: 'pipeline',
  params: z.object({ pipeline: zClient.pipeline }),
} satisfies CommandDefinitionInput<CommandContext>;

export const pipelineCommands = {
  // 'pipeline:create': cmd.identity({
  //   ..._pipelineCommand,
  //   params: undefined,
  //   icon: 'Plus',
  //   execute: ({ ctx }) =>
  //     ctx.setPipelineSheetState({ pipeline: undefined, open: true }),
  // }),
  'pipeline:edit': cmd.identity({
    ..._pipelineCommand,
    icon: 'Pencil',
    execute: ({ params: { pipeline }, ctx }) => {
      ctx.setPipelineSheetState({ pipeline, open: true });
    },
  }),
  'pipeline:sync': cmd.identity({
    ..._pipelineCommand,
    icon: 'RefreshCw',
    execute: ({ params: { pipeline }, ctx }) => {
      void ctx.withToast(() =>
        ctx.trpcCtx.client.syncPipeline.mutate({ id: pipeline.id })
      );
    },
  }),
  'pipeline:delete': cmd.identity({
    icon: 'Trash',
    ..._pipelineCommand,
    execute: ({ ctx, params }) =>
      ctx.setAlertDialogState({
        title: `Confirm deleting pipeline ${params.pipeline.id}`,
        destructive: true,
        // 1) i18n this string so it's shorter and 2) support markdown syntax 3) make user confirm by typing id
        description:
          'Already synchronized data will be untouched. However this will delete any incremental sync state so when a new pipeline is created you will have to sync from scratch.',
        onConfirm: () =>
          ctx.trpcCtx.client.deletePipeline.mutate({ id: params.pipeline.id }),
      }),
  }),
} satisfies CommandDefinitionMap<CommandContext>;

const _connectionCommand = {
  group: 'connection',
  params: z.object({ connection: zClient.connection }),
} satisfies CommandDefinitionInput<CommandContext>;

const debugConnectionCommands = {
  'connection:edit': cmd.identity({
    ..._connectionCommand,
    icon: 'Pencil',
    title: 'Edit Connection',
    execute: ({ ctx, params }) =>
      ctx.setConnectionSheetState({ connection: params.connection, open: true }),
  }),
  'connection:navigate_sql': cmd.identity({
    ..._connectionCommand,
    icon: 'Database',
    title: 'Run sql',
    execute: ({ params: { connection }, ctx }) => {
      ctx.router.push(`/dashboard/connections/${connection.id}/sql`);
    },
  }),
  'connection:navigate_playground': cmd.identity({
    ..._connectionCommand,
    icon: 'Database',
    title: 'Playground',
    execute: ({ params: { connection }, ctx }) => {
      ctx.router.push(`/dashboard/connections/${connection.id}/playground`);
    },
  }),
};

export const connectionCommands = {
  'connection:delete': cmd.identity({
    icon: 'Trash',
    ..._connectionCommand,
    execute: ({ ctx, params }) =>
      ctx.setAlertDialogState({
        title: `Confirm deleting connection ${params.connection.id}`,
        destructive: true,
        description:
          'Already synchronized data will be untouched. However this will delete any incremental sync state so when a new connection is created you will have to sync from scratch.',
        onConfirm: () =>
          ctx.trpcCtx.client.deleteConnection.mutate({ id: params.connection.id }),
      }),
  }),
  'connection:sync': cmd.identity({
    ..._connectionCommand,
    icon: 'RefreshCw',
    execute: ({ params: { connection }, ctx }) => {
      void ctx.withToast(() =>
        ctx.trpcCtx.client.syncConnection.mutate({ id: connection.id })
      );
    },
  }),
  ...(__DEBUG__ && debugConnectionCommands),
} satisfies CommandDefinitionMap<CommandContext>;

/** Generic command that should apply to ANY entity... */
export const entityCommands = {
  copy_id: cmd.identity({
    icon: 'Copy',
    params: z.object({
      pipeline: z.object({ id: z.string() }).optional(),
      connection: z.object({ id: z.string() }).optional(),
    }),
    useCommand: (initial) => ({
      subtitle: initial.connection?.id ?? initial.pipeline?.id,
      execute: ({ params, ctx }) =>
        ctx.withToast(
          () =>
            copyToClipboard(
              initial.connection?.id ?? params.pipeline?.id ?? ''
            ),
          {
            title: 'Copied to clipboard',
          }
        ),
    }),
  }),
} satisfies CommandDefinitionMap<CommandContext>;

// const _debugCommand = {
//   group: 'debug',
// } satisfies CommandDefinitionInput<CommandContext>;

// export const debugCommands = {} satisfies CommandDefinitionMap<CommandContext>;

const _navCommand = {
  group: 'navigation',
} satisfies CommandDefinitionInput<CommandContext>;

// TODO: Dedupe with the links from the navigation sidebar
export const navCommands = {
  go_to_magic_link: {
    ..._navCommand,
    icon: 'Wand',
    title: 'Magic Link',
    execute: ({ ctx }) => ctx.router.push('/dashboard/magic-link'),
  },
  go_to_connector_configs: {
    ..._navCommand,
    icon: 'Boxes',
    title: 'Connector Configs',
    execute: ({ ctx }) => ctx.router.push('/dashboard/connector-configs'),
  },
  go_to_connections: {
    ..._navCommand,
    icon: 'Box',
    title: 'Connections',
    execute: ({ ctx }) => ctx.router.push('/dashboard/connections'),
  },
  go_to_api_key: {
    ..._navCommand,
    icon: 'Key',
    title: 'API Key',
    execute: ({ ctx }) => ctx.router.push('/dashboard/api-access'),
  },
  go_to_api_docs: {
    ..._navCommand,
    icon: 'FileText',
    title: 'API Docs',
    execute: ({ ctx }) => ctx.router.push('https://docs.openint.dev'),
  },
  go_to_settings: {
    ..._navCommand,
    icon: 'Settings',
    execute: ({ ctx }) => ctx.router.push('/dashboard/settings'),
  },
} satisfies CommandDefinitionMap<CommandContext>;

export const miscCommands = {} satisfies CommandDefinitionMap<CommandContext>;

export const vDefinitions = {
  ...pipelineCommands,
  ...connectionCommands,
  ...entityCommands,
  ...navCommands,
  ...miscCommands,
  // ...debugCommands,
} satisfies CommandDefinitionMap<CommandContext>;