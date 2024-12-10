-- Rename the table
ALTER TABLE public.resource RENAME TO connection;

-- Rename the primary key constraint
ALTER INDEX public.pk_resource RENAME TO pk_connection;

-- Rename the id prefix check constraint
-- Update the default value for the id column to use 'conn' prefix instead of 'reso'
ALTER TABLE public.connection ALTER COLUMN id SET DEFAULT concat('conn_', public.generate_ulid());
ALTER TABLE public.connection DROP CONSTRAINT resource_id_prefix_check;
ALTER TABLE public.connector_config DROP CONSTRAINT fk_default_pipe_in_source_id;
ALTER TABLE public.connector_config DROP CONSTRAINT fk_default_pipe_out_destination_id;

-- Update existing IDs - only replace prefix
UPDATE public.connection SET id = 'conn_' || substring(id from 6) WHERE id LIKE 'reso_%';
-- Manually cascading the changes to the related tables because automatic cascading is not supported for generated columns
UPDATE public.connector_config
SET
  default_pipe_out = CASE
    WHEN default_pipe_out->>'destination_id' LIKE 'reso_%'
    THEN jsonb_set(
      default_pipe_out,
      '{destination_id}',
      to_jsonb(
        REPLACE(
          default_pipe_out->>'destination_id',
          'reso_',
          'conn_'
        )
      )
    )
    ELSE default_pipe_out
  END,
  default_pipe_in = CASE
    WHEN default_pipe_in->>'source_id' LIKE 'reso_%'
    THEN jsonb_set(
      default_pipe_in,
      '{source_id}',
      to_jsonb(
        REPLACE(
          default_pipe_in->>'source_id',
          'reso_',
          'conn_'
        )
      )
    )
    ELSE default_pipe_in
  END
WHERE
  default_pipe_out->>'destination_id' LIKE 'reso_%'
  OR default_pipe_in->>'source_id' LIKE 'reso_%';
ALTER TABLE public.connection ADD CONSTRAINT connection_id_prefix_check CHECK (starts_with((id)::text, 'conn_'::text));
ALTER TABLE public.connector_config
  ADD CONSTRAINT fk_default_pipe_in_source_id
  FOREIGN KEY (default_pipe_in_source_id)
  REFERENCES public.connection(id)
  ON UPDATE RESTRICT
  ON DELETE RESTRICT;

ALTER TABLE public.connector_config
  ADD CONSTRAINT fk_default_pipe_out_destination_id
  FOREIGN KEY (default_pipe_out_destination_id)
  REFERENCES public.connection(id)
  ON UPDATE RESTRICT
  ON DELETE RESTRICT;

-- Rename indexes
ALTER INDEX public.resource_created_at RENAME TO connection_created_at;
ALTER INDEX public.resource_customer_id RENAME TO connection_customer_id;
ALTER INDEX public.resource_provider_name RENAME TO connection_provider_name;
ALTER INDEX public.resource_updated_at RENAME TO connection_updated_at;

-- Drop existing policies
DROP POLICY IF EXISTS customer_access ON public.connection;
DROP POLICY IF EXISTS org_access ON public.connection;
DROP POLICY IF EXISTS org_member_access ON public.connection;

-- Recreate policies with new table name
CREATE POLICY customer_access ON public.connection TO customer
USING (
  connector_config_id IN (
    SELECT connector_config.id
    FROM public.connector_config
    WHERE connector_config.org_id = public.jwt_org_id()
  )
  AND customer_id = (SELECT public.jwt_customer_id())
);

CREATE POLICY org_access ON public.connection TO org
USING (
  connector_config_id IN (
    SELECT connector_config.id
    FROM public.connector_config
    WHERE connector_config.org_id = public.jwt_org_id()
  )
) WITH CHECK (
  connector_config_id IN (
    SELECT connector_config.id
    FROM public.connector_config
    WHERE connector_config.org_id = public.jwt_org_id()
  )
);

CREATE POLICY org_member_access ON public.connection TO authenticated
USING (
  connector_config_id IN (
    SELECT connector_config.id
    FROM public.connector_config
    WHERE connector_config.org_id = public.jwt_org_id()
  )
) WITH CHECK (
  connector_config_id IN (
    SELECT connector_config.id
    FROM public.connector_config
    WHERE connector_config.org_id = public.jwt_org_id()
  )
);


