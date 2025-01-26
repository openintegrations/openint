'use client'

import {OTPInput, OTPInputContext} from 'input-otp'
import * as React from 'react'
import {cn} from '../../utils'

interface InputOTPSlot {
  char: string | null
  hasFakeCaret: boolean
  isActive: boolean
}

interface InputOTPContext {
  slots: InputOTPSlot[]
}

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({className, ...props}, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn('flex items-center gap-2', className)}
    {...props}
  />
))
InputOTP.displayName = 'InputOTP'

const InputOTPGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({className, ...props}, ref) => (
  <div ref={ref} className={cn('flex items-center', className)} {...props} />
))
InputOTPGroup.displayName = 'InputOTPGroup'

const InputOTPSlot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {index: number}
>(({index, className, ...props}, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext) as InputOTPContext
  const {char, hasFakeCaret, isActive} = inputOTPContext.slots[index] || {}

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
        isActive && 'z-10 ring-2 ring-ring ring-offset-background',
        className,
      )}
      {...props}>
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink h-4 w-px bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = 'InputOTPSlot'

const InputOTPSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({...props}, ref) => (
  <div ref={ref} role="separator" {...props}>
    <div className="h-6 w-px bg-muted" />
  </div>
))
InputOTPSeparator.displayName = 'InputOTPSeparator'

export {InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator}
