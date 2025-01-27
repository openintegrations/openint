import {type QBOSDKTypes} from '@openint/connector-qbo'
import {snakeCase, type z} from '@openint/util'
import {mapper, zCast} from '@openint/vdk'
import * as unified from '../../unifiedModels'

type QBO = QBOSDKTypes['oas']['components']['schemas']

export const mappers = {
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
        // const columnMap = createColumnMap(e?.data?.Columns?.Column ?? [])
        // TODO: maybe make use of the transaction type also?

        const toKeyValueMap = rowKeyValueMapper<{
          Date: string
          'Transaction Type': {id: string; value: string}
          Num: string
          Posting: string
          Name: {id: string; value: string}
          'Memo/Description': string
          Account: {id: string; value: string}
          Split: {id: string; value: string}
          Amount: string
        }>(e.data)

        return (
          e?.data?.Rows?.Row?.map(
            (row): z.infer<typeof unified.transactionSchema> => {
              const raw = toKeyValueMap(row)

              const amount =
                typeof raw['Amount'] === 'string'
                  ? Number.parseFloat(raw['Amount'])
                  : null
              const standard = {
                id:
                  snakeCase(raw['Transaction Type'].value) +
                  '_' +
                  raw['Transaction Type'].id,
                date: raw['Date'],
                transaction_type: raw['Transaction Type'].value,
                document_number: raw['Num'],
                posting: raw['Posting'],
                name: raw['Name'].value,
                memo: raw['Memo/Description'],
                account: raw['Account'].value,
                split: raw['Split'].value,
                amount,
                raw_data: raw,
              }
              return standard
            },
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

function rowKeyValueMapper<
  T = Record<string, string | {id: string; value: string}>,
>(report: QBO['Report']) {
  return function toKeyValueMap(row: QBO['Report']['Rows']['Row'][number]): T {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Object.fromEntries(
      (row.ColData ?? []).map((item, index) => [
        report.Columns?.Column[index]?.ColTitle,
        'id' in item
          ? {id: item.id || null, value: item.value}
          : item.value || null,
      ]),
    )
  }
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
