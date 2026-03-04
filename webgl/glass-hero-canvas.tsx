'use client'

import { useEffect, useRef } from 'react'

type UniformLocationMap = {
  time: WebGLUniformLocation | null
  resolution: WebGLUniformLocation | null
  cursor: WebGLUniformLocation | null
}

const vertex = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`

const fragment = `
precision mediump float;
uniform vec2 resolution;
uniform float time;
uniform vec2 cursor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec2 centered = (uv - 0.5) * vec2(resolution.x / resolution.y, 1.0);

  float wave = sin(centered.x * 5.0 + time * 0.45) * 0.06 + cos(centered.y * 6.0 - time * 0.3) * 0.05;
  float spotlight = 0.3 / (length(centered - (cursor - 0.5) * vec2(resolution.x / resolution.y, 1.0)) * 7.5 + 0.45);
  float noise = hash(gl_FragCoord.xy + time) * 0.015;

  vec3 c1 = vec3(0.89, 0.94, 1.0);
  vec3 c2 = vec3(0.59, 0.73, 0.99);
  vec3 c3 = vec3(0.79, 0.86, 1.0);

  float blend = smoothstep(-0.7, 0.9, centered.y + wave + spotlight);
  vec3 color = mix(c1, c2, blend);
  color = mix(color, c3, smoothstep(-0.5, 0.9, centered.x - wave));
  color += spotlight * vec3(0.5, 0.62, 0.95);
  color += noise;

  gl_FragColor = vec4(color, 1.0);
}`

function compileShader(gl: WebGLRenderingContext, source: string, type: number) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function GlassHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { antialias: true, alpha: false })
    if (!gl) return

    const vShader = compileShader(gl, vertex, gl.VERTEX_SHADER)
    const fShader = compileShader(gl, fragment, gl.FRAGMENT_SHADER)
    if (!vShader || !fShader) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vShader)
    gl.attachShader(program, fShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const position = gl.getAttribLocation(program, 'position')
    const uniforms: UniformLocationMap = {
      time: gl.getUniformLocation(program, 'time'),
      resolution: gl.getUniformLocation(program, 'resolution'),
      cursor: gl.getUniformLocation(program, 'cursor'),
    }

    let frame = 0
    const start = performance.now()
    const cursor = { x: 0.5, y: 0.5 }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = Math.floor(canvas.clientWidth * dpr)
      canvas.height = Math.floor(canvas.clientHeight * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      cursor.x = (event.clientX - rect.left) / rect.width
      cursor.y = 1 - (event.clientY - rect.top) / rect.height
    }

    const render = () => {
      frame = requestAnimationFrame(render)
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.enableVertexAttribArray(position)
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)
      gl.uniform1f(uniforms.time, (performance.now() - start) * 0.001)
      gl.uniform2f(uniforms.cursor, cursor.x, cursor.y)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    resize()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', onMove)
    render()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', onMove)
      gl.deleteProgram(program)
      gl.deleteShader(vShader)
      gl.deleteShader(fShader)
      gl.deleteBuffer(buffer)
    }
  }, [])

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
}
