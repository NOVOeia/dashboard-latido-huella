import React, { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'

const CERT_IMG = 'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/expositor-documents/Certificado%20LyH.png'

export function CertificadoPage() {
  const { nombre } = useParams<{ nombre: string }>()
  const decodedName = decodeURIComponent(nombre || '').replace(/-/g, ' ')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imgReady, setImgReady] = React.useState(false)

  useEffect(() => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const y = img.height * 0.565
      const maxWidth = img.width * 0.55
      let fontSize = 120
      ctx.font = `900 ${fontSize}px Arial`
      while (ctx.measureText(decodedName).width > maxWidth && fontSize > 40) {
        fontSize -= 4
        ctx.font = `900 ${fontSize}px Arial`
      }
      ctx.fillStyle = '#0D1B6E'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(decodedName, img.width / 2, y)
      setImgReady(true)
    }
    img.src = CERT_IMG
  }, [decodedName])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `Certificado-Latido-y-Huella-${decodedName.replace(/ /g, '-')}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B6E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style={{ height: 52, marginBottom: 24 }} alt="Latido y Huella"/>
      <h1 style={{ color: 'white', fontSize: 22, fontWeight: 800, margin: '0 0 8px', textAlign: 'center' }}>Tu Certificado de Participacion</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, margin: '0 0 24px', textAlign: 'center' }}>Caminata Pet Lovers · Latido y Huella 2026</p>
      <div style={{ maxWidth: 700, width: '100%', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', marginBottom: 24 }}>
        <canvas ref={canvasRef} style={{ width: '100%', display: 'block' }} />
      </div>
      {imgReady && (
        <>
          <button onClick={handleDownload}
            style={{ background: '#00BCD4', color: '#0D1B6E', border: 'none', borderRadius: 50, padding: '16px 40px', fontSize: 17, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,188,212,0.3)', marginBottom: 12 }}>
            Descargar certificado
          </button>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', margin: 0 }}>
            En celular: manten presionada la imagen para guardarla
          </p>
        </>
      )}
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 20, textAlign: 'center' }}>eventos@latidoyhuella.co · WhatsApp +57 333 277 7912</p>
    </div>
  )
}

