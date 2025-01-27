import {z} from '@openint/vdk'

export const account = z
  .object({
    id: z.string(),
    number: z.string().nullish(),
    name: z.string(),
    type: z.string(), //  z.enum(['asset', 'liability', 'equity', 'income', 'expense']),
    sub_account: z.boolean().optional(),
    account_type: z.string().optional(),
    account_subtype: z.string().optional(),
    current_balance: z.number().optional(),
    currency_ref: z
      .object({
        value: z.string(),
        name: z.string(),
      })
      .optional(),
    metadata: z
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
export const vendor = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
})
// .openapi({format: 'prefix:ven'}),

// TODO: expand
export const balanceSheet = z.object({
  start_period: z.string().openapi({format: 'date'}),
  end_period: z.string().openapi({format: 'date'}),
  currency: z.string(),
  accounting_standard: z.string(),
  total_current_assets: z.number().nullable(),
  total_fixed_assets: z.number().nullable(),
  total_assets: z.number().nullable(),
  total_current_liabilities: z.number().nullable(),
  total_long_term_liabilities: z.number().nullable(),
  total_liabilities: z.number().nullable(),
  opening_balance_equity: z.number().nullable(),
  net_income: z.number().nullable(),
  total_equity: z.number().nullable(),
  total_liabilities_and_equity: z.number().nullable(),
})

// TODO: expand
export const profitAndLoss = z.object({
  report_name: z.string(),
  start_period: z.string().openapi({format: 'date'}),
  end_period: z.string().openapi({format: 'date'}),
  currency: z.string(),
  accounting_standard: z.string(),
  total_income: z.number().nullable(),
  gross_profit: z.number().nullable(),
  total_expenses: z.number().nullable(),
  net_operating_income: z.number().nullable(),
  net_income: z.number().nullable(),
})

export const cashFlow = z.object({
  report_name: z.string(),
  start_period: z.string().openapi({format: 'date'}),
  end_period: z.string().openapi({format: 'date'}),
  currency: z.string(),
  net_income: z.number().nullable(),
  total_operating_adjustments: z.number().nullable(),
  net_cash_from_operating_activities: z.number().nullable(),
  net_cash_from_financing_activities: z.number().nullable(),
  net_cash_increase: z.number().nullable(),
  ending_cash: z.number().nullable(),
})

export const transactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  transaction_type: z.string(),
  document_number: z.string().optional(),
  posting: z.string().optional(),
  name: z.string().optional(),
  department: z.string().optional(),
  memo: z.string().optional(),
  account: z.string().optional(),
  split: z.string().optional(),
  amount: z.number(),
  raw_data: z.any(),
})

export const transactionList = z.object({
  report_name: z.string(),
  start_period: z.string(),
  end_period: z.string(),
  currency: z.string(),
  transactions: z.array(transactionSchema),
})

export const customerBalanceEntrySchema = z.object({
  customer_id: z.string(),
  customer_name: z.string(),
  balance: z.number(),
})

export const customerBalance = z.object({
  report_name: z.string(),
  report_date: z.string(),
  currency: z.string(),
  entries: z.array(customerBalanceEntrySchema),
  total_balance: z.number(),
})

export const customerIncomeEntrySchema = z.object({
  customer_id: z.string(),
  customer_name: z.string(),
  total_income: z.number(),
  total_expenses: z.number(),
  net_income: z.number(),
})

export const customerIncome = z.object({
  report_name: z.string(),
  start_period: z.string(),
  end_period: z.string(),
  currency: z.string(),
  entries: z.array(customerIncomeEntrySchema),
  total_income: z.number(),
  total_expenses: z.number(),
  net_income: z.number(),
})

export const usBankAccount = z.object({
  updated: z.string(),
  name: z.string(),
  account_number: z.string(),
  default: z.boolean(),
  created: z.string(),
  input_type: z.string(),
  phone: z.string(),
  account_type: z.string(),
  routing_number: z.string(),
  id: z.string(),
})
