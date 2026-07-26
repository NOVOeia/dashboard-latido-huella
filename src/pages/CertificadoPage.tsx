import React, { useRef, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export function CertificadoPage() {
  const { nombre } = useParams<{ nombre: string }>()
  const decodedName = decodeURIComponent(nombre || '').replace(/-/g, ' ')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const img = new window.Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      // Dynamic font size
      const availableWidth = img.width * 0.52
      let fontSize = Math.floor(availableWidth / (decodedName.length * 0.55))
      fontSize = Math.min(fontSize, 130)
      fontSize = Math.max(fontSize, 50)
      ctx.font = `900 ${fontSize}px Arial`
      ctx.fillStyle = '#0D1B6E'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(decodedName, img.width / 2, img.height * 0.54)
      setReady(true)
    }
    // Load from same domain - no CORS issues
    img.src = '/Certificado_LyH.png'
  }, [decodedName])

  const handleDownload = async () => {
    const canvas = canvasRef.current
    if (!canvas || !ready) return
    setDownloading(true)
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return
        const file = new File([blob], `Certificado-Latido-y-Huella-${decodedName.replace(/ /g, '-')}.png`, { type: 'image/png' })
        // Try Web Share API first (works on mobile)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'Mi Certificado Latido y Huella 2026' })
        } else {
          // Fallback for desktop
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = file.name
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
        setDownloading(false)
      }, 'image/png')
    } catch (e) {
      console.error(e)
      setDownloading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B6E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style={{ height: 52, marginBottom: 20 }} alt="Latido y Huella"/>
      <h1 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 6px', textAlign: 'center' }}>Tu Certificado de Participacion</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 20px', textAlign: 'center' }}>Caminata Pet Lovers · Latido y Huella 2026</p>

      <div style={{ maxWidth: 700, width: '100%', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', marginBottom: 20 }}>
        <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }} />
      </div>

      {ready && (
        <button onClick={handleDownload} disabled={downloading}
          style={{ background: '#00BCD4', color: '#0D1B6E', border: 'none', borderRadius: 50, padding: '16px 40px', fontSize: 17, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,188,212,0.3)', marginBottom: 10, opacity: downloading ? 0.7 : 1 }}>
          {downloading ? 'Procesando...' : 'Descargar certificado'}
        </button>
      )}
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 10, textAlign: 'center' }}>eventos@latidoyhuella.co · WhatsApp +57 333 277 7912</p>
    </div>
  )
}