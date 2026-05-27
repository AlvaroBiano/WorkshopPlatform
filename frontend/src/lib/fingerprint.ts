async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function getCanvasFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'canvas-no-ctx'

    canvas.width = 200
    canvas.height = 50

    ctx.textBaseline = 'alphabetic'
    ctx.font = "14px 'Arial'"
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('Workshop Platform', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('Workshop Platform', 4, 17)

    return await sha256(canvas.toDataURL())
  } catch {
    return 'canvas-error'
  }
}

function getWebGLRenderer(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return 'webgl-not-available'

    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return 'webgl-debug-not-available'

    const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)

    return `${vendor}~${renderer}`.slice(0, 100)
  } catch {
    return 'webgl-error'
  }
}

function getFonts(): string {
  const baseFonts = ['monospace', 'sans-serif', 'serif']
  const testFonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 'Comic Sans MS']

  const detected: string[] = []

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return 'fonts-detection-failed'

  ctx.font = '72px monospace'
  const baseWidths: Record<string, number> = {}
  baseFonts.forEach(font => {
    baseWidths[font] = ctx.measureText('mmmmmmmmmmlli').width
  })

  testFonts.forEach(font => {
    const detected_font = baseFonts.find(baseFont => {
      ctx.font = `72px '${font}', ${baseFont}`
      const width = ctx.measureText('mmmmmmmmmmlli').width
      return width !== baseWidths[baseFont]
    })
    if (detected_font) {
      detected.push(font)
    }
  })

  return detected.join(',')
}

function getScreenInfo(): string {
  return [
    screen.width,
    screen.height,
    screen.colorDepth,
    window.devicePixelRatio || 1,
  ].join('x')
}

function getTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

function getLanguage(): string {
  return navigator.language || 'unknown'
}

function getPlatform(): string {
  return navigator.platform || 'unknown'
}

function parseUserAgent(ua: string): { browser: string; os: string } {
  let browser = 'Unknown'
  let os = 'Unknown'

  if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Chrome') && !ua.includes('Chromium')) browser = 'Chrome'
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'
  else if (ua.includes('Edge')) browser = 'Edge'
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera'

  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac OS') || ua.includes('Macintosh')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

  return { browser, os }
}

async function generateFingerprint(): Promise<string> {
  const components = await Promise.all([
    getCanvasFingerprint(),
    Promise.resolve(getWebGLRenderer()),
    Promise.resolve(getFonts()),
    Promise.resolve(getScreenInfo()),
    Promise.resolve(getTimezone()),
    Promise.resolve(getLanguage()),
    Promise.resolve(getPlatform()),
    Promise.resolve(navigator.hardwareConcurrency || 'unknown'),
    Promise.resolve(JSON.stringify(navigator.mediaDevices || {})),
  ])

  const data = components.join('|')
  return await sha256(data)
}

export interface DeviceFingerprint {
  fingerprint: string
  browser: string
  os: string
  device_name: string
}

export async function getDeviceFingerprint(): Promise<DeviceFingerprint> {
  const ua = navigator.userAgent
  const { browser, os } = parseUserAgent(ua)
  const fingerprint = await generateFingerprint()

  return {
    fingerprint,
    browser,
    os,
    device_name: `${browser} - ${os}`,
  }
}
