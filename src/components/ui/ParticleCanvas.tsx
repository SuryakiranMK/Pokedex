import React, { useRef, useEffect } from 'react'

interface Particle {
  x: number; y: number; vx: number; vy: number
  size: number; alpha: number; color: string; life: number
}

interface ParticleCanvasProps {
  colors?: string[]
  count?: number
  className?: string
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  colors = ['#6366f1', '#ec4899', '#06b6d4', '#f59e0b'],
  count = 60,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight
    let animId: number

    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    window.addEventListener('resize', resize)

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.6 - 0.2,
      size: Math.random() * 3 + 1,
      alpha: Math.random() * 0.6 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: Math.random(),
    }))

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.life += 0.003
        p.alpha = Math.sin(p.life * Math.PI) * 0.5
        if (p.y < -10 || p.life >= 1) {
          p.x = Math.random() * W
          p.y = H + 10
          p.life = 0
          p.vx = (Math.random() - 0.5) * 0.4
          p.vy = -Math.random() * 0.6 - 0.2
        }
        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.shadowBlur = 8
        ctx.shadowColor = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId) }
  }, [colors, count])

  return (
    <canvas
      ref={canvasRef}
      id="particle-canvas"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.5 }}
      aria-hidden="true"
    />
  )
}

export default ParticleCanvas
