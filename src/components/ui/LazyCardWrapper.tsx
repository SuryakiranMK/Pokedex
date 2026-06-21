import React from 'react'
import { useInView } from 'react-intersection-observer'

interface LazyCardWrapperProps {
  children: React.ReactNode
  height?: number
  className?: string
}

export const LazyCardWrapper: React.FC<LazyCardWrapperProps> = ({
  children,
  height = 320,
  className = '',
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px', // Pre-render when the card is within 200px of the viewport
  })

  return (
    <div ref={ref} className={className} style={{ minHeight: inView ? undefined : height }}>
      {inView ? children : null}
    </div>
  )
}

export default LazyCardWrapper
