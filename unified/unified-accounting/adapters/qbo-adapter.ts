import {type QBOSDK, type QBOSDKTypes} from '@openint/connector-qbo'
import type {z} from '@openint/util'
import {makeUlid} from '@openint/util'
import {mapper, zCast} from '@openint/vdk'
import type {AccountingAdapter} from '../router'
import * as unified from '../unifiedModels'

type QBO = QBOSDKTypes['oas']['components']['schemas']

const mappers = {
  account: mapper(zCast<QBO['Account']>(), unified.account, {
    id: 'Id',
    name: 'Name',
    type: 'Classification',
    // number: 'AccountType'
  }),
  expense: mapper(zCast<QBO['Purchase']>(), unified.expense, {
    id: 'Id',
    amount: 'TotalAmt',
    currency: 'CurrencyRef.value',
    payment_account: 'AccountRef.value',
  }),
  vendor: mapper(zCast<QBO['Vendor']>(), unified.vendor, {
    id: 'Id',
    name: 'DisplayName',
    url: 'domain',
  }),
  balanceSheet: mapper(zCast<{data: QBO['Report']}>(), unified.balanceSheet, {
    report_name: (e) => e?.data?.Header?.ReportName ?? '',
    start_period: (e) => e?.data?.Header?.StartPeriod ?? '',
    end_period: (e) => e?.data?.Header?.EndPeriod ?? '',
    currency: (e) => e?.data?.Header?.Currency ?? 'USD',
    accounting_standard: (e) =>
      e?.data?.Header?.Option?.find((opt) => opt.Name === 'AccountingStandard')
        ?.Value ?? '',
    total_current_assets: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[0]?.Rows?.Row[0]?.Summary?.ColData[1]?.value || '0',
      ),
    total_fixed_assets: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[0]?.Rows?.Row[1]?.Summary?.ColData[1]?.value || '0',
      ),
    total_assets: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[0]?.Summary?.ColData[1]?.value || '0',
      ),
    total_current_liabilities: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[1]?.Rows?.Row[0]?.Summary?.ColData[1]?.value || '0',
      ),
    total_long_term_liabilities: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[1]?.Rows?.Row[1]?.Summary?.ColData[1]?.value || '0',
      ),
    total_liabilities: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[1]?.Summary?.ColData[1]?.value || '0',
      ),
    opening_balance_equity: (e) =>
      Number.parseFloat(
        // @ts-expect-error fix the `Row: Record<string, never>[]` typing inside opensdks
        e?.data?.Rows?.Row[1]?.Rows?.Row[1]?.Rows?.Row[0]?.ColData[1]?.value ||
          '0',
      ),
    net_income: (e) =>
      Number.parseFloat(
        // @ts-expect-error fix the `Row: Record<string, never>[]` typing inside opensdks
        e?.data?.Rows?.Row[1]?.Rows?.Row[1]?.Rows?.Row[2]?.ColData[1]?.value ||
          '0',
      ),
    total_equity: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[1]?.Rows?.Row[1]?.Summary?.ColData[1]?.value || '0',
      ),
    total_liabilities_and_equity: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[1]?.Summary?.ColData[1]?.value || '0',
      ),
  }),

  profitAndLoss: mapper(zCast<{data: QBO['Report']}>(), unified.profitAndLoss, {
    report_name: (e) => e?.data?.Header?.ReportName ?? '',
    start_period: (e) => e?.data?.Header?.StartPeriod ?? '',
    end_period: (e) => e?.data?.Header?.EndPeriod ?? '',
    currency: (e) => e?.data?.Header?.Currency ?? 'USD',
    accounting_standard: (e) =>
      e?.data?.Header?.Option?.find((opt) => opt.Name === 'AccountingStandard')
        ?.Value ?? '',
    total_income: (e) => {
      return getReportValue(e.data, 'Income')
    },
    gross_profit: (e) => getReportValue(e.data, 'GrossProfit'),
    total_expenses: (e) => getReportValue(e.data, 'Expenses'),
    net_operating_income: (e) => getReportValue(e.data, 'NetOperatingIncome'),
    net_income: (e) => getReportValue(e.data, 'NetIncome'),
  }),

  cashFlow: mapper(zCast<{data: QBO['Report']}>(), unified.cashFlow, {
    report_name: (e) => e?.data?.Header?.ReportName ?? '',
    start_period: (e) => e?.data?.Header?.StartPeriod ?? '',
    end_period: (e) => e?.data?.Header?.EndPeriod ?? '',
    currency: (e) => e?.data?.Header?.Currency ?? 'USD',
    net_income: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row?.[0]?.Rows?.Row?.[0]?.ColData?.[1]?.value || '0',
      ),
    total_operating_adjustments: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row?.[0]?.Summary?.ColData?.[1]?.value || '0',
      ),
    net_cash_from_operating_activities: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[0]?.Summary?.ColData[1]?.value || '0',
      ),
    net_cash_from_financing_activities: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[1]?.Summary?.ColData[1]?.value || '0',
      ),
    net_cash_increase: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[2]?.Summary?.ColData[1]?.value || '0',
      ),
    ending_cash: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[3]?.Summary?.ColData[1]?.value || '0',
      ),
  }),

  transactionList: mapper(
    zCast<{data: QBO['Report']}>(),
    unified.transactionList,
    {
      report_name: (e) => e?.data?.Header?.ReportName ?? '',
      start_period: (e) => e?.data?.Header?.StartPeriod ?? '',
      end_period: (e) => e?.data?.Header?.EndPeriod ?? '',
      currency: (e) => e?.data?.Header?.Currency ?? 'USD',
      transactions: (e) => {
        const columnMap = createColumnMap(e?.data?.Columns?.Column ?? [])

        return (
          e?.data?.Rows?.Row?.map(
            (row): z.infer<typeof unified.transactionSchema> => ({
              id:
                row?.ColData?.[
                  columnMap['Transaction Type'] as number
                ]?.value?.toLowerCase() +
                '_' +
                row?.ColData?.[columnMap['Transaction Type'] as number]?.id,
              date: row?.ColData?.[columnMap['Date'] as number]?.value ?? '',
              transaction_type:
                row?.ColData?.[columnMap['Transaction Type'] as number]
                  ?.value ?? '',
              document_number:
                row?.ColData?.[columnMap['Num'] as number]?.value ?? '',
              posting:
                row?.ColData?.[columnMap['Posting'] as number]?.value ?? '',
              name: row?.ColData?.[columnMap['Name'] as number]?.value ?? '',
              memo:
                row?.ColData?.[columnMap['Memo/Description'] as number]
                  ?.value ?? '',
              account:
                row?.ColData?.[columnMap['Account'] as number]?.value ?? '',
              split: row?.ColData?.[columnMap['Split'] as number]?.value ?? '',
              amount: parseFloat(
                row?.ColData?.[columnMap['Amount'] as number]?.value ?? '0',
              ),
              raw_data: {Column: e?.data?.Columns?.Column, Row: row},
            }),
          ) ?? []
        )
      },
    },
  ),
  customerBalance: mapper(
    zCast<{data: QBO['Report']}>(),
    unified.customerBalance,
    {
      report_name: (e) => e?.data?.Header?.ReportName ?? '',
      report_date: (e) =>
        e?.data?.Header?.Option?.find((opt) => opt.Name === 'report_date')
          ?.Value ?? '',
      currency: (e) => e?.data?.Header?.Currency ?? 'USD',
      entries: (e) =>
        e?.data?.Rows?.Row?.filter((row) => !row.group)?.map(
          (row): z.infer<typeof unified.customerBalanceEntrySchema> => ({
            customer_id: row?.ColData?.[0]?.id ?? '',
            customer_name: row?.ColData?.[0]?.value ?? '',
            balance: parseFloat(row?.ColData?.[1]?.value ?? '0'),
          }),
        ) ?? [],
      total_balance: (e) =>
        parseFloat(
          e?.data?.Rows?.Row?.find((row) => row.group === 'GrandTotal')?.Summary
            ?.ColData?.[1]?.value ?? '0',
        ),
    },
  ),
  customerIncome: mapper(
    zCast<{data: QBO['Report']}>(),
    unified.customerIncome,
    {
      report_name: (e) => e?.data?.Header?.ReportName ?? '',
      start_period: (e) => e?.data?.Header?.StartPeriod ?? '',
      end_period: (e) => e?.data?.Header?.EndPeriod ?? '',
      currency: (e) => e?.data?.Header?.Currency ?? 'USD',
      entries: (e) => {
        const columnMap = createColumnMap(e?.data?.Columns?.Column ?? [])

        return (
          e?.data?.Rows?.Row?.filter((row) => !row.group)?.map(
            (row): z.infer<typeof unified.customerIncomeEntrySchema> => ({
              customer_id: row?.ColData?.[columnMap[''] as number]?.id ?? '',
              customer_name:
                row?.ColData?.[columnMap[''] as number]?.value ?? '',
              total_income: parseFloat(
                row?.ColData?.[columnMap['Income'] as number]?.value || '0',
              ),
              total_expenses: parseFloat(
                row?.ColData?.[columnMap['Expenses'] as number]?.value || '0',
              ),
              net_income: parseFloat(
                row?.ColData?.[columnMap['Net Income'] as number]?.value || '0',
              ),
            }),
          ) ?? []
        )
      },
      total_income: (e) => {
        const columnMap = createColumnMap(e?.data?.Columns?.Column ?? [])

        return (
          parseFloat(
            e?.data?.Rows?.Row?.find((row) => row.group === 'GrandTotal')
              ?.Summary?.ColData?.[columnMap['Income'] as number]?.value || '0',
          ) || 0
        )
      },
      total_expenses: (e) => {
        const columnMap = createColumnMap(e?.data?.Columns?.Column ?? [])
        return (
          parseFloat(
            e?.data?.Rows?.Row?.find((row) => row.group === 'GrandTotal')
              ?.Summary?.ColData?.[columnMap['Expenses'] as number]?.value ||
              '0',
          ) || 0
        )
      },
      net_income: (e) => {
        const columnMap = createColumnMap(e?.data?.Columns?.Column ?? [])

        return (
          parseFloat(
            e?.data?.Rows?.Row?.find((row) => row.group === 'GrandTotal')
              ?.Summary?.ColData?.[columnMap['Net Income'] as number]?.value ||
              '0',
          ) || 0
        )
      },
    },
  ),
}

function createColumnMap(columns: {ColTitle: string}[]): {
  [key: string]: number
} {
  return columns.reduce(
    (acc: {[key: string]: number}, col: {ColTitle: string}, index: number) => {
      acc[col.ColTitle] = index
      return acc
    },
    {} as {[key: string]: number},
  )
}

// TODO: migrate other report adapters to use this type of abstraction (just using in pnl ATM)
function getReportValue(e: QBO['Report'], group: string) {
  const columnMap = createColumnMap(e?.Columns?.Column ?? [])

  const row = e?.Rows?.Row?.find((row) => row.group === group)
  // Get the last column's value, falling back to 'Total' or 'TOTAL' if available
  const totalColIndex =
    columnMap['TOTAL'] ??
    columnMap['Total'] ??
    (row?.Summary?.ColData?.length ?? 1) - 1
  return Number.parseFloat(row?.Summary?.ColData?.[totalColIndex]?.value || '0')
}

export const qboAdapter = {
  listAccounts: async ({instance}) => {
    const res = await instance.getAll('Account').next()
    return {
      has_next_page: true,
      items: res.value?.entities?.map(mappers.account) ?? [],
    }
  },
  listExpenses: async ({instance}) => {
    const res = await instance.getAll('Purchase').next()
    return {
      has_next_page: true,
      items: res.value?.entities?.map(mappers.expense) ?? [],
    }
  },
  listVendors: async ({instance}) => {
    const res = await instance.getAll('Vendor').next()
    return {
      has_next_page: true,
      items: res.value?.entities?.map(mappers.vendor) ?? [],
    }
  },
  getBalanceSheet: async ({instance, input}) => {
    const res = await instance.GET('/reports/BalanceSheet', {
      params: {
        query: input,
      },
    })
    return mappers.balanceSheet(res)
  },
  getProfitAndLoss: async ({instance, input}) => {
    const res = await instance.GET('/reports/ProfitAndLoss', {
      params: {
        query: input,
      },
    })
    return mappers.profitAndLoss(res)
  },
  getCashFlow: async ({instance, input}) => {
    const res = await instance.GET('/reports/CashFlow', {
      params: {
        query: input,
      },
    })
    return mappers.cashFlow(res)
  },
  getTransactionList: async ({instance, input}) => {
    const res = await instance.GET('/reports/TransactionList', {
      params: {
        query: input,
      },
    })
    return mappers.transactionList(res)
  },
  getCustomerBalance: async ({instance, input}) => {
    const res = await instance.GET('/reports/CustomerBalance', {
      params: {
        query: input,
      },
    })
    return mappers.customerBalance(res)
  },
  getCustomerIncome: async ({instance, input}) => {
    const res = await instance.GET('/reports/CustomerIncome', {
      params: {
        query: input,
      },
    })
    return mappers.customerIncome(res)
  },
  // @ts-expect-error we can tighten up the types here after opensdks support qbo v4
  getBankAccounts: async ({instance, input, env}) => {
    // https://developer.intuit.com/app/developer/qbpayments/docs/api/resources/all-entities/bankaccounts#get-a-list-of-bank-accounts
    const res = await instance.request(
      'GET',
      `/bank-accounts/${input.customer}`,
      {
        headers: {
          Accept: 'application/json',
          'request-Id': makeUlid(),
        },
      },
    )
    return res.data
  },
  // @ts-expect-error we can tighten up the types here after opensdks support qbo v4
  getPaymentReceipt: async ({instance, input}) => {
    // https://developer.intuit.com/app/developer/qbpayments/docs/api/resources/all-entities/paymentreceipt
    const res = await instance.request(
      'GET',
      `/payment-receipts/${input.customer_transaction_id}`,
      {
        headers: {
          Accept: 'application/pdf, application/json',
          'request-Id': makeUlid(),
        },
      },
    )
    return res.data
  },
} satisfies AccountingAdapter<QBOSDK>
