import {createInngestHandler} from '@/inngest'

// https://vercel.com/docs/functions/configuring-functions/duration
// https://vercel.com/docs/functions/runtimes#max-duration
export const maxDuration = 300 // Pro plan maximum

export const {GET, POST, PUT} = createInngestHandler()
