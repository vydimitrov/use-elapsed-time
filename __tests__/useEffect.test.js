/**
 * @jest-environment node
 */

import { useEffect } from 'react'
import { useIsomorphicLayoutEffect } from '../src/hooks'

describe('when the environment is node', () => {
  it('should use useEffect', () => {
    expect(useIsomorphicLayoutEffect).toBe(useEffect)
  })
})
