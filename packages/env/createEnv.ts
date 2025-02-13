// @ts-expect-error ts(2307)
import {createEnv as _createEnv} from '@t3-oss/env-nextjs'
import type {createEnv as createEnvType} from '@t3-oss/env-nextjs/dist'

export const createEnv: typeof createEnvType = _createEnv
