import React, { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

const CERT_IMG = 'https://adkqijensfxzzftylktm.supabase.co/storage/v1/object/public/expositor-documents/Certificado%20LyH.png'

export function CertificadoPage() {
  const { nombre } = useParams<{ nombre: string }>()
  const decodedName = decodeURIComponent(nombre || '').replace(/-/g, ' ')
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  // Dynamic font size based on name length
  const fontSize = decodedName.length > 30 ? 18 : decodedName.length > 20 ? 22 : 28

  const handleDownload = async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('https://esm.sh/html2canvas@1.4.1' as any)
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `Certificado-Latido-y-Huella-${decodedName.replace(/ /g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) {
      console.error(e)
    }
    setDownloading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D1B6E', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <img src="https://assets.cdn.filesafe.space/fSGKFAskjzH7pBxfOSIj/media/6a0b45bdc474827cc4087698.png" style={{ height: 52, marginBottom: 20 }} alt="Latido y Huella"/>
      <h1 style={{ color: 'white', fontSize: 20, fontWeight: 800, margin: '0 0 6px', textAlign: 'center' }}>Tu Certificado de Participacion</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '0 0 20px', textAlign: 'center' }}>Caminata Pet Lovers · Latido y Huella 2026</p>

      {/* Certificate card - captured by html2canvas */}
      <div ref={cardRef} style={{ maxWidth: 700, width: '100%', position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', marginBottom: 20 }}>
        <img src={CERT_IMG} style={{ width: '100%', display: 'block' }} alt="Certificado" crossOrigin="anonymous"/>
        {/* Name overlay positioned at the line */}
        <div style={{
          position: 'absolute',
          top: '54%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '55%',
          textAlign: 'center',
          fontSize: `${fontSize}px`,
          fontWeight: 900,
          color: '#0D1B6E',
          fontFamily: 'Arial, sans-serif',
          lineHeight: 1.2,
          whiteSpace: 'normal',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {decodedName}
        </div>
      </div>

      <button onClick={handleDownload} disabled={downloading}
        style={{ background: '#00BCD4', color: '#0D1B6E', border: 'none', borderRadius: 50, padding: '14px 36px', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,188,212,0.3)', marginBottom: 10, opacity: downloading ? 0.7 : 1 }}>
        {downloading ? 'Descargando...' : 'Descargar certificado'}
      </button>

      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 10, textAlign: 'center' }}>eventos@latidoyhuella.co · WhatsApp +57 333 277 7912</p>
    </div>
  )
}

