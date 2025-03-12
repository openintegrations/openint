'use client'

import {Loader2} from 'lucide-react'
import {zId, zRaw} from '@openint/cdk'
import {_trpcReact} from '@openint/engine-frontend'
import {useToast} from '@openint/shadcn/ui'
import type {ConnectorMeta, SchemaFormElement} from '@openint/ui'
import {SchemaForm} from '@openint/ui/components'
import {z} from '@openint/util'
// TODO(@snrondina): Fix this, breaks package and dependency boundaries
import {useCurrengOrg} from '../../../../components/viewer-context'
import type {ConnectorConfig} from './ConnectorConfigPage'

interface ConnectorConfigFormProps {
  connectorName: string
  ccfg?: Omit<ConnectorConfig, 'connectorName'>
  connectorMeta: ConnectorMeta
  setOpen: (open: boolean) => void
  formRef: React.RefObject<SchemaFormElement | null>
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
  const {toast} = useToast()

  const zConnId = connectionsRes.data?.length
    ? z.union(
        connectionsRes.data
          .filter((r) => r.connectorName === 'postgres')
          .map((r) =>
            z.literal(r.id).openapi({
              title: r.displayName ? `${r.displayName} <${r.id}>` : r.id,
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
    .pick({displayName: true, disabled: true})
    .extend({
      config: z.object({}),
      ...(connectorMeta?.supportedModes.includes('source') && {
        defaultPipeOut: z
          .union([
            z.null().openapi({title: 'Disabled'}),
            z
              .object({
                ...(connectorMeta?.sourceStreams?.length && {
                  streams: z
                    .object(
                      Object.fromEntries(
                        (connectorMeta.sourceStreams as [string]).map((s) => [
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
                links: zRaw.connector_config.shape.defaultPipeOut
                  .unwrap()
                  .unwrap().shape.links,
                // destination_id: zConnId.optional().openapi({
                //   description: 'Defaults to the org-wide postgres',
                // }),
              })
              .openapi({title: 'Enabled'}),
          ])
          .openapi({
            title: 'Sync settings',
            description: zRaw.connector_config.shape.defaultPipeOut.description,
          }),
      }),
      ...(connectorMeta?.supportedModes.includes('destination') && {
        defaultPipeIn: z
          .union([
            z.null().openapi({title: 'Disabled'}),
            z
              .object({
                links: zRaw.connector_config.shape.defaultPipeIn
                  .unwrap()
                  .unwrap().shape.links,
                source_id: zConnId,
              })
              .openapi({title: 'Enabled'}),
          ])
          .openapi({
            title: 'Reverse sync settings',
            description: zRaw.connector_config.shape.defaultPipeIn.description,
          }),
      }),
    })
  connectorMeta?.__typename

  const {orgId} = useCurrengOrg()

  const upsertConnectorConfig =
    _trpcReact.adminUpsertConnectorConfig.useMutation({
      onSuccess: () => {
        setOpen(false)
        toast.success('connector config saved')
        void trpcUtils.adminListConnectorConfigs.invalidate()
        void trpcUtils.listConnectorConfigInfos.invalidate()
      },
      onError: (err) => {
        toast.error(`Failed to save connector config: ${err}`)
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
                  displayName: ccfg.displayName,
                  disabled: ccfg.disabled,
                  config: ccfg.config ?? {},
                  defaultPipeOut: ccfg.defaultPipeOut ?? null,
                  defaultPipeIn: ccfg.defaultPipeIn ?? null,
                } // {} because required
              : undefined
          }
          // formData should be non-null at this point, we should fix the typing
          loading={upsertConnectorConfig.isLoading}
          onSubmit={({formData}) => {
            console.log('formData submitted', formData)
            upsertConnectorConfig.mutate({
              ...formData,
              ...(ccfg ? {id: ccfg.id} : {connectorName}),
              orgId,
            })
          }}
          hideSubmitButton
        />
      )}
      {!ccfgSchema && <p>No configuration needed</p>}
    </div>
  )
}
