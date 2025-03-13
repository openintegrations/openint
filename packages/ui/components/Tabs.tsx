import {Circle} from 'lucide-react'
import {type ReactElement} from 'react'
import {
  Tabs as ShadcnTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@openint/shadcn/ui/tabs'

interface TabsProps {
  tabConfig: Array<{
    key: string
    title: string
    content: ReactElement
    status?: boolean
    statusFill?: string
  }>
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

export function Tabs({
  tabConfig,
  defaultValue,
  value,
  onValueChange,
  className,
}: TabsProps) {
  return (
    <ShadcnTabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={className}>
      <TabsList>
        {tabConfig.map((config) => (
          <TabsTrigger key={config.key} value={config.key}>
            {config.title}{' '}
            {config.status ? (
              <Circle
                className="ml-2 size-2 self-start"
                fill={config.statusFill ?? 'var(--button)'}
              />
            ) : null}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabConfig.map((config) => (
        <TabsContent
          key={config.key}
          value={config.key}
          defaultValue={defaultValue}>
          {config.content}
        </TabsContent>
      ))}
    </ShadcnTabs>
  )
}
