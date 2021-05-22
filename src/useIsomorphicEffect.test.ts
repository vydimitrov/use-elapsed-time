/**
 * @jest-environment node
 */

import { useEffect } from 'react'
import { useIsomorphicEffect } from './useIsomorphicEffect'

describe('useIsomorphicLayoutEffect', () => {
  it('uses useEffect when the environment is node', () => {
    expect(useIsomorphicEffect).toBe(useEffect)
  })
})
