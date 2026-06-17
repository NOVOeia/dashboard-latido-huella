import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

export function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/contrato/:token" element={<ContratoPage />} />
      <Route path="*" element={
        <div className="min-h-screen bg-white overflow-x-hidden">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/caminata-5k" element={<Caminata5KPage />} />
              <Route path="/deportes" element={<DeportesPage />} />
              <Route path="/expositores" element={<ExpositoresPage />} />
              <Route path="/patrocinadores" element={<PatrocinadoresPage />} />
              <Route path="/gracias" element={<GraciasPage />} />
              <Route path="/subir-documento" element={<SubirDocumentoPage />} />
              <Route path="/terminos" element={<TerminosPage />} />
            </Routes>
          </main>
          <Footer />
          <WhatsAppButton />
          <NovoeiaModal />
          <DiverxoModal />
        </div>
      } />
    </Routes>
  );
}