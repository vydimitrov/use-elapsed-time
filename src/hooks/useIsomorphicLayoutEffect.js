import { useLayoutEffect, useEffect } from 'react'

export const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect
