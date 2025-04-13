'use client'

import type {AppRouter} from '@openint/api-v1'

import {createTRPCContext} from '@trpc/tanstack-react-query'

export * from '@tanstack/react-query'
export * from '@trpc/client'

// MARK: - Move me into client common

export const {TRPCProvider, useTRPC, useTRPCClient} =
  createTRPCContext<AppRouter>()
