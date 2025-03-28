import * as React from 'react'

interface ResultBox<T> {
  v: T
}

export function useConstant<T>(fn: () => T): T {
  const ref = React.useRef<ResultBox<T>>(undefined)

  if (!ref.current) {
    ref.current = {v: fn()}
  }

  return ref.current.v
}
