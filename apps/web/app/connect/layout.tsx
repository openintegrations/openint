// tailwind.css file will be built separately
// eslint-disable-next-line import/no-unresolved
import '@openint/ui-v1/dist/tailwind.css'

import {ConnectClientLayout} from './ConnectClientLayout'
import {OrgThemeWrapper} from './OrgThemeWrapper'

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <OrgThemeWrapper>
      <ConnectClientLayout>{children}</ConnectClientLayout>
    </OrgThemeWrapper>
  )
}
