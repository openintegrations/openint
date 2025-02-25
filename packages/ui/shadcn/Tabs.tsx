import * as TabsPrimitive from '@radix-ui/react-tabs'
import React from 'react'
import {cn} from '../utils'

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({className, ...props}, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'rounded-md bg-tab p-1 px-4 pb-0 text-muted-foreground',
      'flex h-10 flex-row',
      'sticky top-0 z-10 border-b border-b-border',
      className,
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({className, ...props}, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-base font-medium ring-offset-background transition-all disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:border-b-2 data-[state=active]:border-button data-[state=active]:bg-background data-[state=active]:text-button',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'data-[state=active]:focus-visible:ring-0 data-[state=active]:focus-visible:ring-offset-0',
      'w-full sm:w-auto',
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({className, ...props}, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'overflow-auto',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export {Tabs, TabsList, TabsTrigger, TabsContent}
