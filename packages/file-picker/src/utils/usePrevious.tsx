import { MutableRefObject, useEffect, useRef } from 'react'

export const usePrevious = (value: any): MutableRefObject<undefined>['current'] => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}
