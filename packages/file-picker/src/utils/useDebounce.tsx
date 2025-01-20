import { useEffect, useRef, useState } from 'react'

export const useDebounce = (value: string, delay: number = 500) => {
  const [currentValue, setCurrentValue] = useState(value)
  const interval = useRef<any>(null)

  const clean = () => {
    if (interval.current !== null) {
      clearInterval(interval.current)
    }
  }

  useEffect(() => {
    interval.current = setTimeout(() => {
      setCurrentValue(value)
    }, delay)
    return clean
  }, [value, delay])

  useEffect(() => clean, [])

  return currentValue
}
