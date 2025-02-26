--- filename: 2025-02-26_0000_neon_authorize_support.sql ---

-- Install the pg_session_jwt extension if not already installed
DO $
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_available_extensions WHERE name = 'pg_session_jwt'
  ) THEN
    -- If available, install it
    EXECUTE 'CREATE EXTENSION IF NOT EXISTS pg_session_jwt';
  ELSE
    -- If not available, raise a notice but continue with fallback
    RAISE NOTICE 'pg_session_jwt extension is not available. Using fallback implementation.';
  END IF;
END
$;
-- Step 1: Update database roles to ensure they have LOGIN privilege
-- And ensure they have secure defaults without a valid JWT

-- Ensure the 'org' role has LOGIN privilege but no direct password authentication
DO
$do$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'org') THEN
    ALTER ROLE "org" WITH LOGIN PASSWORD NULL;
  ELSE
    CREATE ROLE "org" WITH LOGIN PASSWORD NULL;
    GRANT USAGE ON SCHEMA public TO "org";
  END IF;
END
$do$;

-- Ensure the 'authenticated' role has LOGIN privilege but no direct password authentication
DO
$do$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
    ALTER ROLE "authenticated" WITH LOGIN PASSWORD NULL;
  ELSE
    CREATE ROLE "authenticated" WITH LOGIN PASSWORD NULL;
    GRANT USAGE ON SCHEMA public TO "authenticated";
  END IF;
END
$do$;

-- Ensure the 'customer' role has LOGIN privilege but no direct password authentication (renamed from 'end_user')
DO
$do$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'customer') THEN
    ALTER ROLE "customer" WITH LOGIN PASSWORD NULL;
  ELSE
    CREATE ROLE "customer" WITH LOGIN PASSWORD NULL;
    GRANT USAGE ON SCHEMA public TO "customer";
  END IF;
END
$do$;

-- Ensure the 'anon' role has LOGIN privilege but no direct password authentication
DO
$do$
BEGIN
  IF EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
    ALTER ROLE "anon" WITH LOGIN PASSWORD NULL;
  ELSE 
    CREATE ROLE "anon" WITH LOGIN PASSWORD NULL;
    GRANT USAGE ON SCHEMA public TO "anon";
  END IF;
END
$do$;

-- Step 2: Create wrapper functions to get JWT claims from auth.session() but fallback to current methods
-- This ensures compatibility with existing code

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Create or replace the JWT-related functions to use auth.session()
CREATE OR REPLACE FUNCTION public.jwt_claim(claim text) RETURNS text
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  session_data jsonb;
  claim_value text;
BEGIN
  -- First try to get the claim from auth.session()
  BEGIN
    session_data := auth.session();
    
    IF session_data IS NOT NULL AND session_data ? claim THEN
      claim_value := session_data->>claim;
      
      IF claim_value IS NOT NULL THEN
        RETURN claim_value;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Silently continue to fallback if auth.session() fails
  END;
  
  -- Fall back to the legacy method
  RETURN coalesce(
    nullif(current_setting('request.jwt.claim.' || claim, true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> claim)
  );
END;
$$;

-- Replace the existing jwt_sub function to use auth.user_id() with fallback
CREATE OR REPLACE FUNCTION public.jwt_sub() RETURNS text
LANGUAGE plpgsql STABLE
AS $$
DECLARE
  user_id text;
BEGIN
  -- First try to use auth.user_id() from pg_session_jwt
  BEGIN
    user_id := auth.user_id();
    IF user_id IS NOT NULL AND user_id != '' THEN
      RETURN user_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Silently continue to fallback
  END;
  
  -- Fallback to the jwt_claim function
  RETURN public.jwt_claim('sub');
END;
$$;

-- Replace jwt_org_id to use auth.session()
CREATE OR REPLACE FUNCTION public.jwt_org_id() RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT public.jwt_claim('org_id');
$$;

-- Replace jwt_customer_id to use auth.session()
CREATE OR REPLACE FUNCTION public.jwt_customer_id() RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT public.jwt_claim('customer_id');
$$;

-- Step 3: Create helper procedures for initializing sessions

-- Helper procedure to initialize a JWT session
CREATE OR REPLACE PROCEDURE auth.init_session(jwt text)
LANGUAGE plpgsql
AS $$
BEGIN
  -- First initialize the JWT session system
  PERFORM auth.init();
  
  -- Then set the JWT for this session
  BEGIN
    PERFORM auth.jwt_session_init(jwt);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Failed to initialize JWT session: %', SQLERRM;
  END;
END;
$$;

-- Step 4: Add comments to explain the functions and how to use them

COMMENT ON FUNCTION public.jwt_claim IS 'Gets a JWT claim value from auth.session() with fallback to request.jwt.claims';
COMMENT ON FUNCTION public.jwt_sub IS 'Gets the JWT subject (user ID) with priority for auth.user_id()';
COMMENT ON FUNCTION public.jwt_org_id IS 'Gets the organization ID from JWT claims';
COMMENT ON FUNCTION public.jwt_customer_id IS 'Gets the customer ID from JWT claims';
COMMENT ON PROCEDURE auth.init_session IS 'Initializes a JWT session with the given JWT token';

COMMENT ON EXTENSION pg_session_jwt IS 'Extension for JWT authentication with Neon Authorize';