import {z} from '@openint/vdk'

// MARK: - Fields

const currency_code = z.string().describe('ISO 4217 currency code')

const account_classification = z.enum([
  'asset',
  'liability',
  'equity',
  'income',
  'expense',
])

const transaction_line = z.object({
  id: z.string().optional(),
  memo: z.string().nullable().optional().describe('Private line note'),
  amount: z.number().describe('(positive) debit or (negative) credit'),
  currency: currency_code,
  account_id: z.string(),
})

// MARK: - Models

const commonFields = {
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  raw: z.record(z.string(), z.unknown()).optional(),
  id: z.string(),
}

export const transaction = z
  .object({
    ...commonFields,
    date: z.string().openapi({
      format: 'date',
      description:
        'Posted date for accounting purpose, may not be the same as transaction date',
    }),
    account_id: z.string().nullish(),
    amount: z.number().nullish(),
    currency: currency_code.nullish(),
    memo: z.string().nullish(),
    lines: z
      .array(transaction_line)
      .describe(
        'null value for data that came from a single-entry system. Min 1 line is needed to balance the implicit line from parent transaction itself. 2 lines or more for split transactions',
      )
      .nullish(),
    bank_category: z
      .string()
      .optional()
      .describe('Categorization from bank or upstream provider'),
  })
  .openapi({ref: 'accounting.transaction'})

export const account = z
  .object({
    ...commonFields,
    name: z.string(),
    classification: account_classification
      .nullish()
      .describe(
        'null for non-posting accounts such as those used to track payroll',
      ),
    number: z
      .string()
      .nullish()
      .describe(
        'Account number. User defined. Typically 3-5 digits to help organize the Chart of Accounts',
      ),

    currency: currency_code.nullish(),
  })
  .openapi({ref: 'accounting.account'})

export const vendor = z
  .object({
    ...commonFields,
    name: z.string(),
    url: z.string(),
  })
  .openapi({ref: 'accounting.vendor'})

export const customer = z
  .object({
    ...commonFields,
    name: z.string(),
  })
  .openapi({ref: 'accounting.customer'})

export const attachment = z
  .object({
    ...commonFields,
    file_name: z.string().nullish(),
    file_url: z.string().nullish(),
    transaction_id: z.string().nullish(),
  })
  .openapi({ref: 'accounting.attachment'})

// MARK: -

export const qboAccount = z
  .object({
    id: z.string(),
    number: z.string().nullish(),
    name: z.string(),
    type: z.string(), //  z.enum(['asset', 'liability', 'equity', 'income', 'expense']),
    subAccount: z.boolean().optional(),
    accountType: z.string().optional(),
    accountSubType: z.string().optional(),
    currentBalance: z.number().optional(),
    currencyRef: z
      .object({
        value: z.string(),
        name: z.string(),
      })
      .optional(),
    metaData: z
      .object({
        createTime: z.string(),
        lastUpdatedTime: z.string(),
      })
      .optional(),
  })
  .passthrough()
// .openapi({format: 'prefix:acct'}),
export const expense = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  payment_account: z.string(),
})
// .openapi({format: 'prefix:exp'}),

// .openapi({format: 'prefix:ven'}),

// TODO: expand
export const balanceSheet = z.object({
  startPeriod: z.string().openapi({format: 'date'}),
  endPeriod: z.string().openapi({format: 'date'}),
  currency: z.string(),
  accountingStandard: z.string(),
  totalCurrentAssets: z.number().nullable(),
  totalFixedAssets: z.number().nullable(),
  totalAssets: z.number().nullable(),
  totalCurrentLiabilities: z.number().nullable(),
  totalLongTermLiabilities: z.number().nullable(),
  totalLiabilities: z.number().nullable(),
  openingBalanceEquity: z.number().nullable(),
  netIncome: z.number().nullable(),
  totalEquity: z.number().nullable(),
  totalLiabilitiesAndEquity: z.number().nullable(),
})

// TODO: expand
export const profitAndLoss = z.object({
  reportName: z.string(),
  startPeriod: z.string().openapi({format: 'date'}),
  endPeriod: z.string().openapi({format: 'date'}),
  currency: z.string(),
  accountingStandard: z.string(),
  totalIncome: z.number().nullable(),
  grossProfit: z.number().nullable(),
  totalExpenses: z.number().nullable(),
  netOperatingIncome: z.number().nullable(),
  netIncome: z.number().nullable(),
})

export const cashFlow = z.object({
  reportName: z.string(),
  startPeriod: z.string().openapi({format: 'date'}),
  endPeriod: z.string().openapi({format: 'date'}),
  currency: z.string(),
  netIncome: z.number().nullable(),
  totalOperatingAdjustments: z.number().nullable(),
  netCashFromOperatingActivities: z.number().nullable(),
  netCashFromFinancingActivities: z.number().nullable(),
  netCashIncrease: z.number().nullable(),
  endingCash: z.number().nullable(),
})

export const transactionListItemSchema = z.object({
  id: z.string(),
  date: z.string(),
  transactionType: z.string(),
  documentNumber: z.string().nullish(),
  posting: z.string().nullish(),
  name: z.string().nullish(),
  department: z.string().nullish(),
  memo: z.string().nullish(),
  account: z.string().nullish(),
  split: z.string().nullish(),
  amount: z.number().nullable(),
  raw_data: z.any(),
})

export const transactionList = z.object({
  reportName: z.string(),
  startPeriod: z.string(),
  endPeriod: z.string(),
  currency: z.string(),
  transactions: z.array(transactionListItemSchema),
})

const customerBalanceEntrySchema = z.object({
  customerId: z.string(),
  customerName: z.string(),
  balance: z.number(),
})

export const customerBalance = z.object({
  reportName: z.string(),
  reportDate: z.string(),
  currency: z.string(),
  entries: z.array(customerBalanceEntrySchema),
  totalBalance: z.number(),
})

const customerIncomeEntrySchema = z.object({
  customerId: z.string(),
  customerName: z.string(),
  totalIncome: z.number(),
  totalExpenses: z.number(),
  netIncome: z.number(),
})

export const customerIncome = z.object({
  reportName: z.string(),
  startPeriod: z.string(),
  endPeriod: z.string(),
  currency: z.string(),
  entries: z.array(customerIncomeEntrySchema),
  totalIncome: z.number(),
  totalExpenses: z.number(),
  netIncome: z.number(),
})

export const usBankAccount = z.object({
  updated: z.string(),
  name: z.string(),
  accountNumber: z.string(),
  default: z.boolean(),
  created: z.string(),
  inputType: z.string(),
  phone: z.string(),
  accountType: z.string(),
  routingNumber: z.string(),
  id: z.string(),
})
