import {type QBOSDK} from '@openint/connector-qbo'
import {makeUlid} from '@openint/util'
import type {AccountingAdapter} from '../../router'
import {mappers} from './mapper'

export const qboAdapter = {
  listAccounts: async ({instance}) => {
    const res = await instance.getAll('Account').next()
    return {
      has_next_page: true,
      items: res.value?.entities?.map(mappers.qboAccount) ?? [],
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
      items: res.value?.entities?.map(mappers.Vendor) ?? [],
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
