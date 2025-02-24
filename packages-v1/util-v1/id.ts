import {ulid} from 'ulid'
import {z} from 'zod'

// MARK: - Brand

declare const brand: unique symbol
type Brand<T, B> = T & {[brand]: B}

// MARK: - Ulid

type Ulid = Brand<string, 'ulid'>

export function makeUlid(): Ulid {
  return ulid() as Ulid
}

// MARK: - Id

export enum IdMap {
  organization = 'org',
  connector_config = 'ccfg',
  integration = 'int',
  connection = 'conn',
  customer = 'cus',
}

export const id_prefix = z.nativeEnum(IdMap)

export type IdPrefix = `${z.infer<typeof id_prefix>}`

export type Id = {[k in IdPrefix]: `${k}_${string}`}

export function makeId<T extends IdPrefix>(prefix: T) {
  return `${prefix}_${makeUlid()}` as Id[T]
}

// TODO: Get branded id working properly with drizzle $type() method
// also add typebox validator for branded id
