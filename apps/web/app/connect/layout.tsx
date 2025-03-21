import '@openint/ui-v1/global.css'
import {ConnectClientLayout} from './ConnectClientLayout'
import {OrgThemeWrapper} from './OrgThemeWrapper'

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <OrgThemeWrapper>
      <ConnectClientLayout>{children}</ConnectClientLayout>
    </OrgThemeWrapper>
  )
}
