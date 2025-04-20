'use client'

// Credit to: BoilerplateHQ.com
// Import Types
// Import External Packages
import {useEffect, useRef} from 'react'

// Import Components
// Import Functions & Actions & Hooks & State
// Import Data
// Import Assets & Icons

interface ConfettiParticle {
  color: string // RGB color string
  x: number // x-position
  y: number // y-position
  diameter: number // Size of the particle
  tilt: number // Tilt angle
  tiltAngleIncrement: number // Tilt angle increment per frame
  tiltAngle: number // Current tilt angle
  particleSpeed: number // Speed of the particle
  waveAngle: number // Angle for the wave movement
  waveAngleIncrement: number // Wave angle increment per frame
  opacity: number // Opacity of the particle
}

const generateConfettiParticles = (count: number): ConfettiParticle[] => {
  const particles: ConfettiParticle[] = []
  for (let i = 0; i < count; i++) {
    particles.push({
      color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight - window.innerHeight,
      diameter: Math.random() * 10 + 1,
      tilt: Math.random() * 10 - 10,
      tiltAngleIncrement: Math.random() * 0.07 + 0.05,
      tiltAngle: 0,
      particleSpeed: Math.random() * 10 + 1,
      waveAngle: 0,
      waveAngleIncrement: Math.random() * 0.1 + 0.05,
      opacity: 1,
    })
  }
  return particles
}

const updateConfettiParticles = (
  particles: ConfettiParticle[],
  duration: number,
): ConfettiParticle[] => {
  const opacityDecrement = 1 / (60 * (duration / 1000))
  return particles
    .map((particle) => ({
      ...particle,
      x: particle.x + Math.sin(particle.waveAngle) * 2, // Horizontal movement
      y: particle.y + particle.particleSpeed, // Vertical movement due to gravity
      tiltAngle: particle.tiltAngle + particle.tiltAngleIncrement,
      tilt: particle.tilt + Math.sin(particle.tiltAngle) * 12, // Tilt
      waveAngle: particle.waveAngle + particle.waveAngleIncrement, // Wave movement
      opacity: Math.max(0, particle.opacity - opacityDecrement),
    }))
    .filter((particle) => particle.y < window.innerHeight) // Keep particles within the canvas
}

/**
 * Renders a confetti animation on a canvas element.
 * @param isActive - Determines whether the confetti animation is active.
 * @param duration - The duration of the confetti animation in milliseconds.
 * @returns The Confetti component.
 */
export function Confetti({
  isActive,
  duration,
}: {
  isActive: boolean
  duration: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!isActive || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let particles = generateConfettiParticles(1000)
    let animationFrameId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles = updateConfettiParticles(particles, duration)

      // Draw particles
      particles.forEach((particle) => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.diameter / 2, 0, 2 * Math.PI)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        ctx.fill()
      })
      ctx.globalAlpha = 1

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    const timeoutId = setTimeout(() => {
      cancelAnimationFrame(animationFrameId)
    }, duration)

    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isActive, duration])

  return (
    <canvas
      ref={canvasRef}
      className="absolute h-lvh w-full"
      style={{
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
