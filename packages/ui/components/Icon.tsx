import * as lucide from 'lucide-react'

export type IconName = Exclude<
  keyof typeof lucide,
  | 'default'
  | 'IconNode'
  | 'Icon'
  | 'createLucideIcon'
  | 'LucideIcon'
  | 'LucideProps'
  | `Lucide${string}`
  | `${string}Icon`
  | 'icons'
>

export function Icon(props: {name: IconName} & lucide.LucideProps) {
  const LucideIcon = lucide[props.name]
  return <LucideIcon {...props} />
}

export function Ellipsis(props: lucide.LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}
