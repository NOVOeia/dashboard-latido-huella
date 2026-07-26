import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { HomePage } from './pages/HomePage';
import { Caminata5KPage } from './pages/Caminata5KPage';
import { DeportesPage } from './pages/DeportesPage';
import { ExpositoresPage } from './pages/ExpositoresPage';
import { PatrocinadoresPage } from './pages/PatrocinadoresPage';
import { GraciasPage } from './pages/GraciasPage';
import { SubirDocumentoPage } from './pages/SubirDocumentoPage';
import { TerminosPage } from './pages/TerminosPage';
import { NovoeiaModal } from './components/NovoeiaModal';
import { DiverxoModal } from './components/DiverxoModal';
import { Dashboard } from './pages/Dashboard';
import { ContratoPage } from './pages/ContratoPage';
import { ECardPage } from './pages/ECardPage';
import { KitPage } from './pages/KitPage';
import { StaffRegisterPage } from './pages/StaffRegisterPage';
import { DejaTuHuellaPage } from './pages/DejaTuHuellaPage'
import { TaquillaPage } from './pages/TaquillaPage'
import { MuroPage } from './pages/MuroPage'
import { WebANavbar } from './web-a/components/WebANavbar'
import { WebAFooter } from './web-a/components/WebAFooter'
import { MovementHomePage } from './web-a/pages/MovementHomePage'
import { LivedExperiencePage } from './web-a/pages/LivedExperiencePage'
import { GalleryPage } from './web-a/pages/GalleryPage'
import { AliasPage } from './web-a/pages/AliasPage'
import { CertificadoPage } from './pages/CertificadoPage'

export function App() {
  const location = useLocation()
  const immersive = ['/deja-tu-huella','/comparte','/taquilla'].includes(location.pathname)
    || location.pathname.startsWith('/admin')
    || location.pathname.startsWith('/contrato')
    || location.pathname.startsWith('/ecard')
    || location.pathname.startsWith('/kit')
    || location.pathname.startsWith('/registro-staff')
  const webA = location.pathname === '/'
    || location.pathname.startsWith('/movimiento')
    || location.pathname === '/muro'

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {!immersive && (webA ? <WebANavbar /> : <Navbar />)}
      <main>
        <Routes>
          {/* ADMIN */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/*" element={<Dashboard />} />
          <Route path="/contrato/:token" element={<ContratoPage />} />
          <Route path="/ecard/:id" element={<ECardPage />} />
          <Route path="/kit/:id/:location" element={<KitPage />} />
          <Route path="/registro-staff" element={<StaffRegisterPage />} />
          <Route path="/registro-staff/:id" element={<StaffRegisterPage />} />
          <Route path="/taquilla" element={<TaquillaPage />} />
          <Route path="/deja-tu-huella" element={<DejaTuHuellaPage />} />
          <Route path="/comparte" element={<Navigate to="/deja-tu-huella" replace />} />

          {/* WEB A */}
          <Route path="/" element={<MovementHomePage />} />
          <Route path="/movimiento" element={<Navigate to="/" replace />} />
          <Route path="/movimiento/lo-que-vivimos" element={<LivedExperiencePage />} />
          <Route path="/movimiento/galeria" element={<GalleryPage />} />
          <Route path="/movimiento/aliados" element={<AliasPage />} />
          <Route path="/muro" element={<MuroPage />} />

          {/* WEB B */}
          <Route path="/evento" element={<HomePage />} />
          <Route path="/caminata-canina" element={<Caminata5KPage />} />
          <Route path="/caminata-5k" element={<Navigate to="/caminata-canina" replace />} />
          <Route path="/deportes" element={<DeportesPage />} />
          <Route path="/expositores" element={<ExpositoresPage />} />
          <Route path="/patrocinadores" element={<PatrocinadoresPage />} />
          <Route path="/gracias" element={<GraciasPage />} />
          <Route path="/subir-documento" element={<SubirDocumentoPage />} />
          <Route path="/terminos" element={<TerminosPage />} />
          <Route path="/certificado/:nombre" element={<CertificadoPage />} />
        </Routes>
      </main>
      {!immersive && (webA ? <WebAFooter /> : <Footer />)}
      {!immersive && !webA && <WhatsAppButton />}
      {!immersive && !webA && <NovoeiaModal />}
      {!immersive && !webA && <DiverxoModal />}
    </div>
  )
}