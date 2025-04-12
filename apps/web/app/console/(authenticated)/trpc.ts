'use client'

import type {AppRouter} from '@openint/api-v1'

import {createTRPCContext} from '@openint/ui-v1/trpc'

// MARK: - Move me into client common

export const {TRPCProvider, useTRPC, useTRPCClient} =
  createTRPCContext<AppRouter>()
