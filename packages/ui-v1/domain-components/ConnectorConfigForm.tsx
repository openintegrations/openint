import type Form from '@rjsf/core'
import type {RJSFSchema} from '@rjsf/utils'
import type {ForwardedRef} from 'react'
import type {defConnectors} from '@openint/all-connectors/connectors.def'

import {JSONSchemaForm} from '../components/schema-form'

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

  jsonSchema: RJSFSchema

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
  ref: ForwardedRef<Form>

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
  // connectorName, // TODO: Handling the loading of the right connector config
  connectorConfig,
  jsonSchema,
  className,
  loading = false,
  onSubmit,
  ref,
}: ConnectorConfigFormProps<T>) {
  return (
    <div className="relative">
      {/* TODO: Add a consistent loading indicator */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded bg-white/50 dark:bg-black/50">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      )}
      <JSONSchemaForm
        ref={ref}
        jsonSchema={jsonSchema}
        formData={connectorConfig}
        className={className}
        loading={loading}
        onSubmit={onSubmit}
      />
    </div>
  )
}

export default ConnectorConfigForm
