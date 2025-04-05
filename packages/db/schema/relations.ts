import {relations} from 'drizzle-orm/relations'
import {connection, connector_config, integration, pipeline} from './schema'

export const connectionRelations = relations(connection, ({one, many}) => ({
  connector_config: one(connector_config, {
    fields: [connection.connector_config_id],
    references: [connector_config.id],
    relationName: 'connection_connector_config_id_connector_config_id',
  }),
  integration: one(integration, {
    fields: [connection.integration_id],
    references: [integration.id],
  }),
  pipelines_destination_id: many(pipeline, {
    relationName: 'pipeline_destination_id_connection_id',
  }),
  pipelines_source_id: many(pipeline, {
    relationName: 'pipeline_source_id_connection_id',
  }),
  connector_configs_default_pipe_in_source_id: many(connector_config, {
    relationName: 'connector_config_default_pipe_in_source_id_connection_id',
  }),
  connector_configs_default_pipe_out_destination_id: many(connector_config, {
    relationName:
      'connector_config_default_pipe_out_destination_id_connection_id',
  }),
}))

export const connector_configRelations = relations(
  connector_config,
  ({one, many}) => ({
    connections: many(connection, {
      relationName: 'connection_connector_config_id_connector_config_id',
    }),
    // TODO: Add integrations based on connector_name
    // integrations: many(integration, {
    //   relationName: 'integration_connector_config_id_connector_config_id',
    // }),
    connection_default_pipe_in_source_id: one(connection, {
      fields: [connector_config.default_pipe_in_source_id],
      references: [connection.id],
      relationName: 'connector_config_default_pipe_in_source_id_connection_id',
    }),
    connection_default_pipe_out_destination_id: one(connection, {
      fields: [connector_config.default_pipe_out_destination_id],
      references: [connection.id],
      relationName:
        'connector_config_default_pipe_out_destination_id_connection_id',
    }),
  }),
)

export const integrationRelations = relations(integration, ({many}) => ({
  connections: many(connection),
  // Connector, but connector is alas not a model
  // Though integrations could possibly have to do with connector configs
}))

export const pipelineRelations = relations(pipeline, ({one}) => ({
  connection_destination_id: one(connection, {
    fields: [pipeline.destination_id],
    references: [connection.id],
    relationName: 'pipeline_destination_id_connection_id',
  }),
  connection_source_id: one(connection, {
    fields: [pipeline.source_id],
    references: [connection.id],
    relationName: 'pipeline_source_id_connection_id',
  }),
}))
