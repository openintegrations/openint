import type {ReactElement} from 'react'

import {cn} from '@openint/shadcn/lib/utils'
import {
  Tabs as ShadcnTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@openint/shadcn/ui/tabs'

interface TabConfig {
  key: string
  title: string
  content: ReactElement
}

interface TabsProps {
  tabConfig: TabConfig[]
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
      className={cn('flex-1', className)}>
      <TabsList className="w-full">
        {tabConfig.map((config) => (
          <TabsTrigger key={config.key} value={config.key}>
            {config.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabConfig.map((config) => (
        <TabsContent
          key={config.key}
          value={config.key}
          className="flex-1 overflow-auto">
          {config.content}
        </TabsContent>
      ))}
    </ShadcnTabs>
  )
}
