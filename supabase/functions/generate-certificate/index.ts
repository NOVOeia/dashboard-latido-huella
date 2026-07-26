// supabase/functions/generate-certificate/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CERT_URL = 'https://admin-latidoyhuella.netlify.app/Certificado_LyH.png'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const url = new URL(req.url)
  const nombre = decodeURIComponent(url.searchParams.get('nombre') || '')

  if (!nombre) {
    return new Response('Missing nombre param', { status: 400, headers: cors })
  }

  // Fetch the base certificate image
  const imgRes = await fetch(CERT_URL)
  const imgBuffer = await imgRes.arrayBuffer()
  const imgBase64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)))
  const mimeType = 'image/png'

  // Calculate font size based on name length
  const certWidth = 4023
  const certHeight = 3017
  const availableWidth = certWidth * 0.52
  let fontSize = Math.floor(availableWidth / (nombre.length * 0.55))
  fontSize = Math.min(fontSize, 130)
  fontSize = Math.max(fontSize, 50)

  // Y position at 54% of height
  const yPos = Math.floor(certHeight * 0.54)
  const xPos = Math.floor(certWidth / 2)

  // Generate SVG with certificate as background and name as text
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${certWidth}" height="${certHeight}">
  <image href="data:${mimeType};base64,${imgBase64}" width="${certWidth}" height="${certHeight}"/>
  <text
    x="${xPos}"
    y="${yPos}"
    font-family="Arial, sans-serif"
    font-weight="900"
    font-size="${fontSize}"
    fill="#0D1B6E"
    text-anchor="middle"
    dominant-baseline="middle"
  >${nombre}</text>
</svg>`

  // Convert SVG to PNG using resvg-wasm
  try {
    const { Resvg, initWasm } = await import('npm:@resvg/resvg-wasm@2.6.2')
    
    const wasmRes = await fetch('https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/index_bg.wasm')
    const wasmBuf = await wasmRes.arrayBuffer()
    await initWasm(wasmBuf)

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: certWidth },
    })
    const pngData = resvg.render()
    const pngBuffer = pngData.asPng()

    return new Response(pngBuffer, {
      status: 200,
      headers: {
        ...cors,
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="Certificado-Latido-y-Huella-${nombre.replace(/ /g, '-')}.png"`,
        'Cache-Control': 'public, max-age=3600',
      }
    })
  } catch (err) {
    console.error('Error generating PNG:', err)
    // Fallback: return SVG
    return new Response(svg, {
      status: 200,
      headers: {
        ...cors,
        'Content-Type': 'image/svg+xml',
        'Content-Disposition': `attachment; filename="Certificado-Latido-y-Huella-${nombre.replace(/ /g, '-')}.svg"`,
      }
    })
  }
})