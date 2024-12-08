ALTER ROLE end_user RENAME TO customer;


ALTER POLICY end_user_access ON public.connector_config RENAME TO customer_access;
ALTER POLICY end_user_access ON public.pipeline RENAME TO customer_access;
ALTER POLICY end_user_access ON public.resource RENAME TO customer_access;


-- 2. Rename the function
ALTER FUNCTION public.jwt_end_user_id RENAME TO jwt_customer_id;

-- 3. Rename column in resource table
ALTER TABLE public.resource RENAME COLUMN end_user_id TO customer_id;

-- 4. Rename index
ALTER INDEX resource_end_user_id RENAME TO resource_customer_id;


CREATE OR REPLACE FUNCTION jwt_customer_id() RETURNS varchar LANGUAGE sql STABLE
AS $function$
  select coalesce(
    nullif(current_setting('request.jwt.claim.customer_id', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'customer_id')
  )
$function$;

DROP POLICY IF EXISTS customer_access ON public.resource;
CREATE POLICY customer_access ON public.resource TO customer
  USING (
    connector_config_id = ANY(
      select id from connector_config
      where org_id = jwt_org_id()
    )
    AND customer_id = (select jwt_customer_id())
  );

DROP POLICY IF EXISTS customer_access ON public.pipeline;
CREATE POLICY customer_access ON public.pipeline TO customer
  USING ((
    select array(
      select id
      from resource
      where connector_config_id = ANY(
        select id from connector_config
        where org_id = jwt_org_id()
      )
        AND customer_id = (select jwt_customer_id())
    ) && array[source_id, destination_id]
  -- User can see any pipeline that they their resource is connected to for the moment
  ));