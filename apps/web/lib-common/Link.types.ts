// Copied from apps/web/.next/types/link.d.ts after running pnpm generate-typed-routes

type SearchOrHash = `?${string}` | `#${string}`
type WithProtocol = `${string}:${string}`

type Suffix = '' | SearchOrHash

type SafeSlug<S extends string> = S extends `${string}/${string}`
  ? never
  : S extends `${string}${SearchOrHash}`
    ? never
    : S extends ''
      ? never
      : S

type CatchAllSlug<S extends string> = S extends `${string}${SearchOrHash}`
  ? never
  : S extends ''
    ? never
    : S

type OptionalCatchAllSlug<S extends string> =
  S extends `${string}${SearchOrHash}` ? never : S

type StaticRoutes =
  | `/`
  | `/api/debug`
  | `/connect`
  | `/connect/callback`
  | `/console`
  | `/console/connect`
  | `/console/connections`
  | `/console/connector-config`
  | `/console/events`
  | `/console/customers`
  | `/console/settings`
  | `/debug`
  | `/sign-in`
  | `/sign-up`
  | `/sign-out`
type DynamicRoutes<T extends string = string> =
  | `/api/${OptionalCatchAllSlug<T>}`
  | `/console/sign-in/${OptionalCatchAllSlug<T>}`
  | `/console/sign-out/${OptionalCatchAllSlug<T>}`
  | `/console/sign-up/${OptionalCatchAllSlug<T>}`
  | `/_posthog/${OptionalCatchAllSlug<T>}`
  | `/v0/${OptionalCatchAllSlug<T>}`
  | `/v1/${OptionalCatchAllSlug<T>}`
  | `/storybook/${OptionalCatchAllSlug<T>}`
  | `/chromatic/${OptionalCatchAllSlug<T>}`
  | `/preview/${OptionalCatchAllSlug<T>}`
  | `/api/v0/verticals/${OptionalCatchAllSlug<T>}`

export type RouteImpl<T> =
  | StaticRoutes
  | SearchOrHash
  | WithProtocol
  | `${StaticRoutes}${SearchOrHash}`
  | (T extends `${DynamicRoutes<infer _>}${Suffix}` ? T : never)


