import Form from '@rjsf/core'
import {RJSFSchema} from '@rjsf/utils'
import {ForwardedRef} from 'react'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {cn} from '@openint/shadcn/lib/utils'
import {ZodSchemaForm} from '../components/SchemaForm'

export interface ConnectorConfigFormProps<
  T extends keyof typeof defConnectors,
> {
  /**
   * The name of the connector to display the config form for
   */
  connectorName: T

  /**
   * The connector config data to display the config form for. Initial state of the form.
   * If data is passed in, it is expected to come in the schema for the connectorConfig.config
   **/
  connectorConfig: any

  /**
   * Callback for form submission
   */
  onSubmit: (data: any) => void

  /**
   * Ref for the form element to be able to submit it.
   * Can be created with const formRef = createRef<Form>()
   * and submitted with formRef.current.submit();
   * onSubmit is then called with the form data
   */
  ref: ForwardedRef<Form<any, RJSFSchema, any>>

  /**
   * Optional class name for styling the form container
   */
  className?: string
  /**
   * Flag to indicate if the form is in a loading state
   */
  loading?: boolean
}

/**
 * ConnectorConfigForm component that displays the configuration form for a specific connector
 */
export function ConnectorConfigForm<T extends keyof typeof defConnectors>({
  connectorName,
  connectorConfig,
  className,
  loading = false,
  onSubmit,
  ref,
}: ConnectorConfigFormProps<T>) {
  const connector = defConnectors[connectorName as keyof typeof defConnectors]
  const ccfgSchema =
    connector.schemas?.['connectorConfig' as keyof typeof connector.schemas]

  if (!ccfgSchema) {
    return (
      <div className={cn('rounded border', className)}>
        Nothing to configure for connector: {connectorName}
      </div>
    )
  }

  const handleSubmit = (data: any) => {
    // NOTE: this may be unnecessary if the rjsf/core already handles it. We also validate on the server.
    // TODO: check if validation is occurring already client side already and if so remove this.
    const parsed = ccfgSchema.safeParse(data)
    if (!parsed.success) {
      console.error(parsed.error)
      return
    }
    if (onSubmit) {
      onSubmit(parsed.data)
    }
  }

  return (
    <div className="relative">
      {/* TODO: Add a consistent loading indicator */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded bg-white/50 dark:bg-black/50">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      )}
      <ZodSchemaForm
        ref={ref}
        schema={ccfgSchema}
        formData={connectorConfig}
        className={className}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default ConnectorConfigForm
