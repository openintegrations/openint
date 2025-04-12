// Copied from apps/web/.next/types/link.d.ts after running pnpm generate:typed-routes
// --- generated begin ---

type SearchOrHash = `?${string}` | `#${string}`
type WithProtocol = `${string}:${string}`

type Suffix = '' | SearchOrHash

// type SafeSlug<S extends string> = S extends `${string}/${string}`
//   ? never
//   : S extends `${string}${SearchOrHash}`
//     ? never
//     : S extends ''
//       ? never
//       : S

// type CatchAllSlug<S extends string> = S extends `${string}${SearchOrHash}`
//   ? never
//   : S extends ''
//     ? never
//     : S

type OptionalCatchAllSlug<S extends string> =
  S extends `${string}${SearchOrHash}` ? never : S

type StaticRoutes =
  | `/`
  | `/console`
  | `/console/connections`
  | `/console/connector-config`
  | `/console/customers`
  | `/console/events`
  | `/console/settings`
  | `/console/connect`
  | `/debug`
  | `/connect`
  | `/connect/callback`
  | `/api/debug`
  | `/sign-in`
  | `/sign-up`
  | `/sign-out`
type DynamicRoutes<T extends string = string> =
  | `/console/sign-in/${OptionalCatchAllSlug<T>}`
  | `/console/sign-out/${OptionalCatchAllSlug<T>}`
  | `/console/sign-up/${OptionalCatchAllSlug<T>}`
  | `/api/${OptionalCatchAllSlug<T>}`
  | `/_posthog/${OptionalCatchAllSlug<T>}`
  | `/v0/${OptionalCatchAllSlug<T>}`
  | `/storybook/${OptionalCatchAllSlug<T>}`
  | `/chromatic/${OptionalCatchAllSlug<T>}`
  | `/preview/${OptionalCatchAllSlug<T>}`

export type RouteImpl<T> =
  | StaticRoutes
  | SearchOrHash
  | WithProtocol
  | `${StaticRoutes}${SearchOrHash}`
  | (T extends `${DynamicRoutes<infer _>}${Suffix}` ? T : never)

// --- generated end ---
