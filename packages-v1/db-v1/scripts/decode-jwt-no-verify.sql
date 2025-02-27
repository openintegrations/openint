-- Via https://github.com/leandropls/pgsqljwt/blob/main/decode_jwt.sql
-- Workaround for neon rls authorize issues on local for now...
/**
 * Decodes a JWT without verifying its signature
 *
 * @param {text} token - The JWT to be decoded and verified.
 * @returns {jsonb} - The decoded JWT claims in JSONB format if the signature is valid, null otherwise.
 */
create or replace function jwt.decode_jwt_no_verify(token text)
    returns jsonb as
$$
declare
    -- Variables to store JWT segments.
    segments               text[];  -- The segments of the JWT (header, claims, signature).
    claims_segment         text;    -- The claims segment of the JWT.
    claims                 jsonb;   -- JSONB decoded from the claims segment.
begin
    -- Check if the token or keys are null; if so, return null (indicating validation failure).
    if token is null then
        return null;
    end if;

    -- Split the token into its segments (header, claims, signature)
    segments := string_to_array(token, '.');
    assert segments is not null;

    if array_length(segments, 1) <> 3 then
        return null;
    end if;

    claims_segment := segments[2];

    -- Check if any of the segments are null; if so, return null (indicating validation failure).
    if claims_segment is null then
        return null;
    end if;

    -- Attempt to decode and parse the claims segment into JSONB; return null on failure.
    begin
        claims := convert_from(urlsafe_b64decode(claims_segment), 'UTF-8')::jsonb;
    exception
        when others then
            return null;
    end;

    assert claims is not null;
    return claims;
end;
$$ language plpgsql
   immutable
   set search_path = jwt, public, pg_temp;
