UPDATE connector_config
SET default_pipe_out = jsonb_set(
  default_pipe_out,
  '{links}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN value::text = '"ag_column_rename"' THEN '"custom_link_ag"'::jsonb
        ELSE value
      END
    )
    FROM jsonb_array_elements(default_pipe_out->'links')
  )
)
WHERE default_pipe_out->'links' ? 'ag_column_rename';
