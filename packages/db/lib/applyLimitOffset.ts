import type {SQL} from 'drizzle-orm'

import {sql} from 'drizzle-orm'

export function applyLimitOffset<T>(
  query: SQL<T>,
  opts: {limit?: number; offset?: number; orderBy?: string; order?: string},
) {
  const limit = opts.limit
    ? // prettier-ignore
      sql` LIMIT ${opts.limit}`
    : sql``
  const offset = opts.offset
    ? // prettier-ignore
      sql` OFFSET ${opts.offset}`
    : sql``
  const orderBy = opts.orderBy
    ? // prettier-ignore
      sql` ORDER BY ${opts.orderBy}`
    : sql``
  const order = opts.order ? sql` ${opts.order}` : sql``
  return sql<T>`${query}${limit}${offset}${orderBy}${order}`
}
