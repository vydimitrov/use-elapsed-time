import { useLayoutEffect } from 'react'
import { useIsomorphicLayoutEffect } from '../src/hooks'

describe('when the environment is browser', () => {
  it('should use useLayoutEffect', () => {
    expect(useIsomorphicLayoutEffect).toBe(useLayoutEffect)
  })
})
