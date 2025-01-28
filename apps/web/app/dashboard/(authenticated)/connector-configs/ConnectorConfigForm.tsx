'use client'

import {Loader2} from 'lucide-react'
import {zId, zRaw} from '@openint/cdk'
import {_trpcReact} from '@openint/engine-frontend'
import {SchemaForm, toast} from '@openint/ui'
import type {ConnectorMeta, SchemaFormElement} from '@openint/ui'
import {z} from '@openint/util'
import {useCurrengOrg} from '@/components/viewer-context'
import type {ConnectorConfig} from './ConnectorConfigPage'

interface ConnectorConfigFormProps {
  connectorName: string
  ccfg?: Omit<ConnectorConfig, 'connector_name'>
  connectorMeta: ConnectorMeta
  setOpen: (open: boolean) => void
  formRef: React.RefObject<SchemaFormElement>
  isLoading: boolean
}

export function ConnectorConfigForm({
  connectorName,
  ccfg,
  connectorMeta,
  setOpen,
  formRef,
  isLoading,
}: ConnectorConfigFormProps) {
  const trpcUtils = _trpcReact.useContext()
  const connectionsRes = _trpcReact.listConnections.useQuery()

  const zConnId = connectionsRes.data?.length
    ? z.union(
        connectionsRes.data
          .filter((r) => r.connector_name === 'postgres')
          .map((r) =>
            z.literal(r.id).openapi({
              title: r.display_name ? `${r.display_name} <${r.id}>` : r.id,
            }),
          ) as [z.ZodLiteral<string>, z.ZodLiteral<string>],
      )
    : zId('conn')

  const ccfgSchema = (
    connectorMeta?.schemas.connectorConfig
      ? // Sometimes we have extra data inside the config due to extra data, so workaround for now

        // as we have no way of displaying such information / allow user to fix it
        {...connectorMeta?.schemas.connectorConfig, additionalProperties: true}
      : undefined
  ) as {type: 'object'; properties?: {}; additionalProperties: boolean}


  // Consider calling this provider, actually seem to make more sense...
  // given that we call the code itself connector config
  const formSchema = zRaw.connector_config
    .pick({display_name: true, disabled: true})
    .extend({
      config: z.object({}),
      ...(connectorMeta?.supported_modes?.includes('source') && {
        default_pipe_out: z
          .union([
            z.null().openapi({title: 'Disabled'}),
            z
              .object({
                ...(connectorMeta?.source_streams?.length && {
                  streams: z
                    .object(
                      Object.fromEntries(
                        (connectorMeta.source_streams as [string]).map((s) => [
                          s,
                          z.boolean().optional(),
                        ]),
                      ),
                      // z.enum(connectorMeta.sourceStreams as [string]),
                      // z.boolean(),
                    )
                    .passthrough()
                    .openapi({description: 'Entities to sync'}),
                }),
                links: zRaw.connector_config.shape.default_pipe_out
                  .unwrap()
                  .unwrap().shape.links,
                // removing for now as not core feature to specify custom destination Ids
                // destination_id: zConnId.optional().openapi({
                //   description: 'Defaults to the org-wide postgres',
                // }),
              })
              .openapi({title: 'Enabled'}),
          ])
          .openapi({
            title: 'Sync settings',
            description:
              zRaw.connector_config.shape.default_pipe_out.description,
          }),
      }),
      ...(connectorMeta?.supported_modes?.includes('destination') && {
        default_pipe_in: z
          .union([
            z.null().openapi({title: 'Disabled'}),
            z
              .object({
                links: zRaw.connector_config.shape.default_pipe_in
                  .unwrap()
                  .unwrap().shape.links,
                source_id: zConnId,
              })
              .openapi({title: 'Enabled'}),
          ])
          .openapi({
            title: 'Reverse sync settings',
            description:
              zRaw.connector_config.shape.default_pipe_in.description,
          }),
      }),
    })
  connectorMeta?.__typename

  const {orgId} = useCurrengOrg()

  const upsertConnectorConfig =
    _trpcReact.adminUpsertConnectorConfig.useMutation({
      onSuccess: () => {
        setOpen(false)
        toast({title: 'connector config saved', variant: 'success'})
        void trpcUtils.adminListConnectorConfigs.invalidate()
        void trpcUtils.listConnectorConfigInfos.invalidate()
      },
      onError: (err) => {
        toast({
          title: 'Failed to save connector config',
          description: `${err}`,
          variant: 'destructive',
        })
      },
    })

  return (
    <div className="grow overflow-scroll">
      {isLoading ? (
        <Loader2 className="size-6 animate-spin" />
      ) : (
        <SchemaForm
          ref={formRef}
          schema={formSchema}
          jsonSchemaTransform={(schema) => ({
            ...schema,
            properties: {
              ...schema.properties,
              ...(ccfgSchema && {config: ccfgSchema}),
            },
          })}
          formData={
            ccfg
              ? {
                  display_name: ccfg.display_name,
                  disabled: ccfg.disabled,
                  config: ccfg.config ?? {},
                  default_pipe_out: ccfg.default_pipe_out ?? null,
                  default_pipe_in: ccfg.default_pipe_in ?? null,
                } // {} because required
              : undefined
          }
          // formData should be non-null at this point, we should fix the typing
          loading={upsertConnectorConfig.isLoading}
          onSubmit={({formData}) => {
            upsertConnectorConfig.mutate({
              ...(formData as {}),
              ...(ccfg ? {id: ccfg.id} : {connector_name: connectorName}),
              org_id: orgId,
            })
          }}
          hideSubmitButton
        />
      )}
      {!ccfgSchema && <p>No configuration needed</p>}
    </div>
  )
}
