CREATE TABLE IF NOT EXISTS event (
    id                    CHARACTER VARYING NOT NULL DEFAULT generate_ulid(),
    name                  TEXT NOT NULL,
    organization_id       CHARACTER VARYING NOT NULL,
    customer_id           CHARACTER VARYING NOT NULL,
    data                  JSONB,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_event PRIMARY KEY (id)
);

-- Policy controls access to events table based on organization and customer context
-- Two valid scenarios:
--   1. Org-only access: User has organization_id but no customer_id in JWT
--   2. Customer access: User has both organization_id and customer_id in JWT
CREATE POLICY customer_member_access_events ON public.event TO authenticated
USING (
    -- Always require organization to match
    organization_id = public.jwt_org_id()
    AND (
        -- Allow org-wide access if no customer_id in JWT
        public.jwt_customer_id() IS NULL 
        -- Otherwise require exact customer match
        OR customer_id = public.jwt_customer_id()
    )
) WITH CHECK (
    -- Same rules apply for both reading (USING) and writing (WITH CHECK)
    organization_id = public.jwt_org_id()
    AND (
        public.jwt_customer_id() IS NULL 
        OR customer_id = public.jwt_customer_id()
    )
);
