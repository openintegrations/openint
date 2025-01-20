import { OpenIntSDKTypes } from '@opensdks/sdk-openint'

export interface RawJSON {
  [key: string]: string | string[] | number | boolean | undefined
}

export interface Settings extends RawJSON {
  instance_url?: string
  base_url?: string
}

export type Connection = OpenIntSDKTypes['oas']['components']['schemas']['Connection'] & {
  // TODO: check why SDK doesn't have these fields
  integration?: {
    id: string
    name: string
    logoUrl: string
  }
  connector?: {
    id: string
    name: string
    logoUrl: string
  }
}
