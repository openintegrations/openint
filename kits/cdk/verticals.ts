import {objectKeys} from '@openint/util/object-utils'
import {R} from '@openint/util/remeda'
import {titleCase} from '@openint/util/string-utils'
import {z} from '@openint/util/zod-utils'

interface VerticalInfo {
  name?: string
  description?: string
  objects?: string[]
}

// TODO: Should this correspond to the list of unified apis we have actually implemented?
// Doesn't seem quite right otherwise...
// Also maybe should be distributed in a metadata file associated with each unified api
// impl.
const _VERTICAL_BY_KEY = {
  accounting: {},
  ats: {
    name: 'ATS',
    description: `Our secure API identifies employees and compensation by
                integrating with your payroll. Only users who are invited to the
                platform can access this information, and the integration is
                one-way with no impact on original data.`,
    objects: ['job', 'offer', 'candidate', 'opening'],
  },
  banking: {},
  calendar: {},
  commerce: {},
  communication: {},
  crm: {
    name: 'CRM',
    objects: ['account', 'contact', 'opportunity', 'lead', 'user'],
  },
  database: {},
  'developer-tools': {},
  email: {},
  engagement: {}, // TODO: merge me
  enrichment: {},
  'expense-management': {},
  'file-storage': {},
  'flat-files-and-spreadsheets': {},
  hris: {},
  messaging: {},
  other: {},
  payroll: {},
  'personal-finance': {},
  'sales-enablement': {},
  'sales-engagement': {},
  'social-media': {},
  streaming: {},
  ticketing: {},
  wiki: {},
} satisfies Record<string, VerticalInfo>

// MARK: -

export const zVerticalKey = z.enum(objectKeys(_VERTICAL_BY_KEY))

export type VerticalKey = keyof typeof _VERTICAL_BY_KEY

export const VERTICAL_BY_KEY = R.mapValues(
  _VERTICAL_BY_KEY,
  (c: VerticalInfo, key) => ({
    ...c,
    key,
    name: c.name ?? titleCase(key),
  }),
)

export type Vertical = (typeof VERTICAL_BY_KEY)[keyof typeof VERTICAL_BY_KEY]
