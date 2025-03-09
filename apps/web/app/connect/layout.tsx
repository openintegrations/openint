// tailwind.css file will be built separately
// eslint-disable-next-line import/no-unresolved
import './tailwind-v3.css'
import {ConnectClientLayout} from './ConnectClientLayout'
import {OrgThemeWrapper} from './OrgThemeWrapper'

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <OrgThemeWrapper>
      <ConnectClientLayout>{children}</ConnectClientLayout>
    </OrgThemeWrapper>
  )
}
