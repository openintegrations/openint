import type {QBO_ENTITY_NAME} from '@openint/connector-qbo'
import {type QBOSDKTypes} from '@openint/connector-qbo'
import {R, snakeCase, type z} from '@openint/util'
import {mapper, zCast} from '@openint/vdk'
import * as unified from '../../unifiedModels'

type QBO = QBOSDKTypes['oas']['components']['schemas']

/** QBO Ids are unique per data type per realm, whereas we need id to be unique per realm */
function makeQboId(type: keyof typeof QBO_ENTITY_NAME, id: string) {
  return `${type}_${id}`
}

const tranactionMappers = {
  Purchase: mapper(zCast<QBO['Purchase']>(), unified.transaction, {
    id: (t) => makeQboId('Purchase', t.Id),
    date: 'TxnDate',
    account_id: (t) => makeQboId('Account', t.AccountRef.value),
    currency: 'CurrencyRef.value',
    memo: 'PrivateNote',
    amount: (p) => {
      const sign = p.Credit ? 1 : -1
      return sign * p.TotalAmt
    },
    lines: (p) => {
      const sign = p.Credit ? 1 : -1
      return p.Line.map((line) => ({
        id: line.Id,
        memo: line.Description,
        amount: -1 * sign * line.Amount,
        currency: p.CurrencyRef.value,
        account_id: makeQboId(
          'Account',
          line.AccountBasedExpenseLineDetail?.AccountRef.value ?? '',
        ),
      }))
    },
    bank_category: () => 'Purchase',
    vendor_id: (t) =>
      t.EntityRef?.type === 'Vendor' && t.EntityRef?.value
        ? makeQboId('Vendor', t.EntityRef.value)
        : '', // for some reason `null` causes vendor_id to be quoted, probably encoded as json, does not add up but...
    created_at: 'MetaData.CreateTime',
    updated_at: 'MetaData.LastUpdatedTime',
  }),
  Deposit: mapper(zCast<QBO['Deposit']>(), unified.transaction, {
    id: (t) => makeQboId('Deposit', t.Id),
    date: 'TxnDate',
    account_id: (t) => makeQboId('Account', t.DepositToAccountRef.value),
    currency: 'CurrencyRef.value',
    memo: 'PrivateNote',
    amount: 'TotalAmt',
    lines: (_t) => {
      const t = _t as typeof _t & {
        CashBack?: {
          Amount: number
          Memo: string
          AccountRef: {value: string; name: string}
        }
      }
      return R.compact([
        ...t.Line.map((line) => ({
          id: line.Id,
          memo: line.Description,
          amount: -1 * line.Amount,
          currency: t.CurrencyRef.value,
          account_id: makeQboId(
            'Account',
            line.DepositLineDetail?.AccountRef?.value ?? '',
          ),
        })),
        t.CashBack && {
          amount: t.CashBack.Amount,
          currency: t.CurrencyRef.value,
          memo: t.CashBack.Memo,
          account_id: makeQboId('Account', t.CashBack.AccountRef.value),
        },
      ])
    },
    bank_category: () => 'Deposit',
    created_at: 'MetaData.CreateTime',
    updated_at: 'MetaData.LastUpdatedTime',
  }),
  JournalEntry: mapper(zCast<QBO['JournalEntry']>(), unified.transaction, {
    id: (t) => makeQboId('JournalEntry', t.Id),
    date: 'TxnDate',
    account_id: () => null,
    amount: () => null,
    currency: () => null,
    memo: 'PrivateNote',
    lines: (record) =>
      record.Line.filter((l) => l.DetailType !== 'DescriptionOnly').map(
        (l) => ({
          id: l.Id,
          amount:
            (l.JournalEntryLineDetail.PostingType === 'Credit' ? -1 : 1) *
            l.Amount,
          currency: record.CurrencyRef.value,
          account_id: makeQboId(
            'Account',
            l.JournalEntryLineDetail.AccountRef.value,
          ),
          memo: l.Description,
        }),
      ),
    bank_category: () => 'JournalEntry',
    created_at: 'MetaData.CreateTime',
    updated_at: 'MetaData.LastUpdatedTime',
  }),
  Payment: mapper(zCast<QBO['Payment']>(), unified.transaction, {
    id: (t) => makeQboId('Payment', t.Id),
    date: 'TxnDate',
    account_id: (t) => makeQboId('Account', t.DepositToAccountRef?.value ?? ''),
    amount: 'TotalAmt',
    currency: 'CurrencyRef.value',
    memo: 'PrivateNote',
    lines: () => [], // TODO: Figure out how to map these properly
    // lines: (record) =>
    //   record.Line.map((line, i) => ({
    //     id: `${i}`,
    //     memo: null,
    //     amount: line.Amount,
    //     currency: record.CurrencyRef.value,
    //     account_id: line.Amoun
    //   })),
    bank_category: () => 'Payment',
    created_at: 'MetaData.CreateTime',
    updated_at: 'MetaData.LastUpdatedTime',
  }),
  Invoice: mapper(zCast<QBO['Invoice']>(), unified.transaction, {
    id: (t) => makeQboId('Invoice', t.Id),
    date: 'TxnDate',
    account_id: () => null,
    amount: 'TotalAmt',
    currency: 'CurrencyRef.value',
    memo: 'PrivateNote',
    lines: () => [], // TODO: Figure out how to map these properly
    // lines: (record) =>
    //   record.Line.map((line, i) => ({
    //     id: line.Id,
    //     memo: line.Description,
    //     currency: record.CurrencyRef.value,
    //     ...(line.SalesItemLineDetail && {
    //       amount: -1 * line.Amount, // income is negative
    //       account_id: makeQboId('Account', line.SalesItemLineDetail.ItemRef.value),
    //     }),
    //     ...(line.DiscountLineDetail && {
    //       amount: line.Amount, // discount is positive
    //       account_id: makeQboId('Account', line.DiscountLineDetail.DiscountAccountRef.value),
    //     }),
    //   })),
    bank_category: () => 'Invoice',
    created_at: 'MetaData.CreateTime',
    updated_at: 'MetaData.LastUpdatedTime',
  }),
}

export const mappers = {
  ...tranactionMappers,
  Account: mapper(
    zCast<QBO['Account'] & {AcctNum?: string}>(),
    unified.account,
    {
      id: (t) => makeQboId('Account', t.Id),
      name: 'Name',
      number: 'AcctNum',
      // Classification is actually nullable
      classification: (a) =>
        ({
          Asset: 'asset' as const,
          Equity: 'equity' as const,
          Expense: 'expense' as const,
          Liability: 'liability' as const,
          Revenue: 'income' as const,
        })[a.Classification] ?? null,
      currency: 'CurrencyRef.value',
      created_at: 'MetaData.CreateTime',
      updated_at: 'MetaData.LastUpdatedTime',
    },
  ),

  Vendor: mapper(zCast<QBO['Vendor']>(), unified.vendor, {
    id: (t) => makeQboId('Vendor', t.Id),
    name: 'DisplayName',
    url: 'domain',
    created_at: 'MetaData.CreateTime',
    updated_at: 'MetaData.LastUpdatedTime',
  }),
  // Missing types in opensdk for them..
  Customer: mapper(
    zCast<Pick<QBO['Vendor'], 'Id' | 'DisplayName' | 'MetaData'>>(),
    unified.customer,
    {
      id: (t) => makeQboId('Customer', t.Id),
      name: 'DisplayName',
      created_at: 'MetaData.CreateTime',
      updated_at: 'MetaData.LastUpdatedTime',
    },
  ),
  Attachable: mapper(
    zCast<
      Pick<QBO['Vendor'], 'Id' | 'MetaData'> & {
        TempDownloadUri: string
        FileName: string
      }
    >(),
    unified.attachment,
    {
      id: (t) => makeQboId('Attachable', t.Id),
      file_name: 'FileName',
      file_url: 'TempDownloadUri',
      created_at: 'MetaData.CreateTime',
      updated_at: 'MetaData.LastUpdatedTime',
    },
  ),

  // MARK: -
  qboAccount: mapper(zCast<QBO['Account']>(), unified.qboAccount, {
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
