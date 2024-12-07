import JsonURL from '@jsonurl/jsonurl'
import {z} from '@opensdks/util-zod'

interface CursorParser<T> {
  stringToCursor: (cursor: string | undefined | null) => T
  cursorToString: (value: T) => string | null
}

const zLastUpdatedAtId = z.object({
  last_updated_at: z.string(),
  last_id: z.string(),
})

export const LastUpdatedAtId = {
  fromCursor: (cursor?: string | null) => {
    if (!cursor) {
      return undefined
    }
    const ret = zLastUpdatedAtId.safeParse(JsonURL.parse(cursor))
    // TODO: Return indication to caller that the cursor is invalid so that they can dynamically
    // switch to a full sync rather than incremental sync
    if (!ret.success) {
      console.warn('Failed to parse LastUpdatedAtId cursor', cursor, ret.error)
      return undefined
    }
    return ret.data
  },
  toCursor: (params?: z.infer<typeof zLastUpdatedAtId>) => {
    if (!params) {
      return null
    }
    return JsonURL.stringify(params)
  },
}

const zLastUpdatedAtNextOffset = z.object({
  last_updated_at: z.string(),
  // TODO: Rename to next_cursor from next_offset
  next_offset: z.string().nullish(),
})

export const LastUpdatedAtNextOffset = {
  fromCursor: (cursor?: string | null) => {
    if (!cursor) {
      return undefined
    }
    const ret = zLastUpdatedAtNextOffset.safeParse(JsonURL.parse(cursor))
    // TODO: Return indication to caller that the cursor is invalid so that they can dynamically
    // switch to a full sync rather than incremental sync
    if (!ret.success) {
      console.warn('Failed to parse LastUpdatedAtId cursor', cursor, ret.error)
      return undefined
    }
    return ret.data
  },
  toCursor: (params?: z.infer<typeof zLastUpdatedAtNextOffset>) => {
    if (!params) {
      return null
    }
    return JsonURL.stringify(params)
  },
}

export const NextPageCursor: CursorParser<{next_page: number}> = {
  stringToCursor(cursor) {
    try {
      return z
        .object({next_page: z.number().positive()})
        .parse(JsonURL.parse(cursor ?? ''))
    } catch {
      return {next_page: 1}
    }
  },
  cursorToString(value) {
    return JsonURL.stringify(value) ?? ''
  },
}
