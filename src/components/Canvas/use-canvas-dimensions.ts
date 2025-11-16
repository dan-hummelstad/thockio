import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

export function useCanvasDimensions(opts: {
  aspectRatio?: number
  containerRef?: React.RefObject<HTMLDivElement>
}) {
  const { aspectRatio, containerRef } = opts
  const internalContainerRef = useRef<HTMLDivElement>(null)
  const containerElement = containerRef || internalContainerRef

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isInitialized, setIsInitialized] = useState(false)

  // Calculate dimensions (memoized)
  const calculateDimensions = useMemo(() => {
    return (container: HTMLDivElement | null): {
      width: number
      height: number
    } => {
      if (!container) {
        const width = window.innerWidth
        let height = window.innerHeight

        if (aspectRatio) {
          height = width / aspectRatio
          if (height > window.innerHeight) {
            height = window.innerHeight
            const calculatedWidth = height * aspectRatio
            if (calculatedWidth <= window.innerWidth) {
              return { width: calculatedWidth, height }
            }
          }
        }

        return { width, height: Math.max(height, 1) }
      }

      const rect = container.getBoundingClientRect()
      const containerWidth = rect.width
      const containerHeight = rect.height

      let width = containerWidth
      let height = containerHeight

      if (aspectRatio && containerWidth > 0) {
        height = width / aspectRatio
        if (height > containerHeight) {
          height = containerHeight
          width = height * aspectRatio
        }
      }

      return {
        width: Math.max(width, 1),
        height: Math.max(height, 1)
      }
    }
  }, [aspectRatio])

  // Debounced resize
  // eslint-disable-next-line local-rules/no-bare-use-memo-callback
  const debounce = useCallback((fn: (...args: unknown[]) => void, wait = 50) => {
    let timeout: ReturnType<typeof setTimeout> | null = null
    return (...args: unknown[]) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => fn(...args), wait)
    }
  }, [])

  const handleResize = useCallback(() => {
    const el = containerElement.current
    if (el) {
      const newDimensions = calculateDimensions(el)
      setDimensions(newDimensions)
    }
  }, [calculateDimensions, containerElement])

  useEffect(() => {
    const el = containerElement.current
    if (!el) return

    const initial = calculateDimensions(el)
    setDimensions(initial)
    setIsInitialized(true)

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(debounce(handleResize, 50))
      resizeObserver.observe(el)
    } else {
      const debounced = debounce(handleResize, 50)
      window.addEventListener("resize", debounced)
      // cleanup handles removal of event listener
      return () => window.removeEventListener("resize", debounced)
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [calculateDimensions, containerElement, handleResize, debounce])

  return {
    internalContainerRef,
    containerElement,
    dimensions,
    isInitialized
  }
}
