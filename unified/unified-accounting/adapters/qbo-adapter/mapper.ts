import {type QBOSDKTypes} from '@openint/connector-qbo'
import {snakeCase, type z} from '@openint/util'
import {mapper, zCast} from '@openint/vdk'
import * as unified from '../../unifiedModels'

type QBO = QBOSDKTypes['oas']['components']['schemas']

export const mappers = {
  account: mapper(zCast<QBO['Account']>(), unified.qboAccount, {
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
    reportName: (e) => e?.data?.Header?.ReportName ?? '',
    startPeriod: (e) => e?.data?.Header?.StartPeriod ?? '',
    endPeriod: (e) => e?.data?.Header?.EndPeriod ?? '',
    currency: (e) => e?.data?.Header?.Currency ?? 'USD',
    accountingStandard: (e) =>
      e?.data?.Header?.Option?.find((opt) => opt.Name === 'AccountingStandard')
        ?.Value ?? '',
    totalCurrentAssets: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[0]?.Rows?.Row[0]?.Summary?.ColData[1]?.value || '0',
      ),
    totalFixedAssets: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[0]?.Rows?.Row[1]?.Summary?.ColData[1]?.value || '0',
      ),
    totalAssets: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[0]?.Summary?.ColData[1]?.value || '0',
      ),
    totalCurrentLiabilities: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[1]?.Rows?.Row[0]?.Summary?.ColData[1]?.value || '0',
      ),
    totalLongTermLiabilities: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[1]?.Rows?.Row[1]?.Summary?.ColData[1]?.value || '0',
      ),
    totalLiabilities: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[1]?.Summary?.ColData[1]?.value || '0',
      ),
    openingBalanceEquity: (e) =>
      Number.parseFloat(
        // @ts-expect-error fix the `Row: Record<string, never>[]` typing inside opensdks
        e?.data?.Rows?.Row[1]?.Rows?.Row[1]?.Rows?.Row[0]?.ColData[1]?.value ||
          '0',
      ),
    netIncome: (e) =>
      Number.parseFloat(
        // @ts-expect-error fix the `Row: Record<string, never>[]` typing inside opensdks
        e?.data?.Rows?.Row[1]?.Rows?.Row[1]?.Rows?.Row[2]?.ColData[1]?.value ||
          '0',
      ),
    totalEquity: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[1]?.Rows?.Row[1]?.Summary?.ColData[1]?.value || '0',
      ),
    totalLiabilitiesAndEquity: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[1]?.Summary?.ColData[1]?.value || '0',
      ),
  }),

  profitAndLoss: mapper(zCast<{data: QBO['Report']}>(), unified.profitAndLoss, {
    reportName: (e) => e?.data?.Header?.ReportName ?? '',
    startPeriod: (e) => e?.data?.Header?.StartPeriod ?? '',
    endPeriod: (e) => e?.data?.Header?.EndPeriod ?? '',
    currency: (e) => e?.data?.Header?.Currency ?? 'USD',
    accountingStandard: (e) =>
      e?.data?.Header?.Option?.find((opt) => opt.Name === 'AccountingStandard')
        ?.Value ?? '',
    totalIncome: (e) => {
      return getReportValue(e.data, 'Income')
    },
    grossProfit: (e) => getReportValue(e.data, 'GrossProfit'),
    totalExpenses: (e) => getReportValue(e.data, 'Expenses'),
    netOperatingIncome: (e) => getReportValue(e.data, 'NetOperatingIncome'),
    netIncome: (e) => getReportValue(e.data, 'NetIncome'),
  }),

  cashFlow: mapper(zCast<{data: QBO['Report']}>(), unified.cashFlow, {
    reportName: (e) => e?.data?.Header?.ReportName ?? '',
    startPeriod: (e) => e?.data?.Header?.StartPeriod ?? '',
    endPeriod: (e) => e?.data?.Header?.EndPeriod ?? '',
    currency: (e) => e?.data?.Header?.Currency ?? 'USD',
    netIncome: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row?.[0]?.Rows?.Row?.[0]?.ColData?.[1]?.value || '0',
      ),
    totalOperatingAdjustments: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row?.[0]?.Summary?.ColData?.[1]?.value || '0',
      ),
    netCashFromOperatingActivities: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[0]?.Summary?.ColData[1]?.value || '0',
      ),
    netCashFromFinancingActivities: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[1]?.Summary?.ColData[1]?.value || '0',
      ),
    netCashIncrease: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[2]?.Summary?.ColData[1]?.value || '0',
      ),
    endingCash: (e) =>
      Number.parseFloat(
        e?.data?.Rows?.Row[3]?.Summary?.ColData[1]?.value || '0',
      ),
  }),

  transactionList: mapper(
    zCast<{data: QBO['Report']}>(),
    unified.transactionList,
    {
      reportName: (e) => e?.data?.Header?.ReportName ?? '',
      startPeriod: (e) => e?.data?.Header?.StartPeriod ?? '',
      endPeriod: (e) => e?.data?.Header?.EndPeriod ?? '',
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
            (row): z.infer<typeof unified.transactionListItemSchema> => {
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
                transactionType: raw['Transaction Type'].value,
                documentNumber: raw['Num'],
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
      reportName: (e) => e?.data?.Header?.ReportName ?? '',
      reportDate: (e) =>
        e?.data?.Header?.Option?.find((opt) => opt.Name === 'report_date')
          ?.Value ?? '',
      currency: (e) => e?.data?.Header?.Currency ?? 'USD',
      entries: (e) =>
        e?.data?.Rows?.Row?.filter((row) => !row.group)?.map((row) => ({
          customerId: row?.ColData?.[0]?.id ?? '',
          customerName: row?.ColData?.[0]?.value ?? '',
          balance: parseFloat(row?.ColData?.[1]?.value ?? '0'),
        })) ?? [],
      totalBalance: (e) =>
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
      reportName: (e) => e?.data?.Header?.ReportName ?? '',
      startPeriod: (e) => e?.data?.Header?.StartPeriod ?? '',
      endPeriod: (e) => e?.data?.Header?.EndPeriod ?? '',
      currency: (e) => e?.data?.Header?.Currency ?? 'USD',
      entries: (e) => {
        const columnMap = createColumnMap(e?.data?.Columns?.Column ?? [])

        return (
          e?.data?.Rows?.Row?.filter((row) => !row.group)?.map((row) => ({
            customerId: row?.ColData?.[columnMap[''] as number]?.id ?? '',
            customerName: row?.ColData?.[columnMap[''] as number]?.value ?? '',
            totalIncome: parseFloat(
              row?.ColData?.[columnMap['Income'] as number]?.value || '0',
            ),
            totalExpenses: parseFloat(
              row?.ColData?.[columnMap['Expenses'] as number]?.value || '0',
            ),
            netIncome: parseFloat(
              row?.ColData?.[columnMap['Net Income'] as number]?.value || '0',
            ),
          })) ?? []
        )
      },
      totalIncome: (e) => {
        const columnMap = createColumnMap(e?.data?.Columns?.Column ?? [])

        return (
          parseFloat(
            e?.data?.Rows?.Row?.find((row) => row.group === 'GrandTotal')
              ?.Summary?.ColData?.[columnMap['Income'] as number]?.value || '0',
          ) || 0
        )
      },
      totalExpenses: (e) => {
        const columnMap = createColumnMap(e?.data?.Columns?.Column ?? [])
        return (
          parseFloat(
            e?.data?.Rows?.Row?.find((row) => row.group === 'GrandTotal')
              ?.Summary?.ColData?.[columnMap['Expenses'] as number]?.value ||
              '0',
          ) || 0
        )
      },
      netIncome: (e) => {
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
