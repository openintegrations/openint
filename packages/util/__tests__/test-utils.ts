// eslint-disable-next-line jest/no-export
export const $test = <T>(name: string, fn: () => T | Promise<T>) => {
  const ref = {current: undefined as T}

  // eslint-disable-next-line jest/valid-title
  test(name, async () => {
    ref.current = await fn()
  })

  return ref
}
