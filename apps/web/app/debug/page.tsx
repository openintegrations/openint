import type {PageProps} from '@/lib-common/next-utils'

import DebugClientPage from './page.client'

export default async function DebugPage(props: PageProps) {
  const searchParams = await props.searchParams
  if (searchParams['crash']) {
    throw new Error('Crash requested')
  }

  return <DebugClientPage />
}
