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
import { ECardPage } from './pages/ECardPage';
import { KitPage } from './pages/KitPage';
import { StaffRegisterPage } from './pages/StaffRegisterPage';

export function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/admin/*" element={<Dashboard />} />
      <Route path="/contrato/:token" element={<ContratoPage />} />
      <Route path="/ecard/:id" element={<ECardPage />} />
      <Route path="/kit/:id/:location" element={<KitPage />} />
      <Route path="/registro-staff/:id" element={<StaffRegisterPage />} />
      <Route path="/" element={<div className="min-h-screen bg-white overflow-x-hidden"><Navbar /><main><HomePage /></main><Footer /><WhatsAppButton /><NovoeiaModal /><DiverxoModal /></div>} />
      <Route path="/caminata-5k" element={<div className="min-h-screen bg-white overflow-x-hidden"><Navbar /><main><Caminata5KPage /></main><Footer /><WhatsAppButton /></div>} />
      <Route path="/deportes" element={<div className="min-h-screen bg-white overflow-x-hidden"><Navbar /><main><DeportesPage /></main><Footer /><WhatsAppButton /></div>} />
      <Route path="/expositores" element={<div className="min-h-screen bg-white overflow-x-hidden"><Navbar /><main><ExpositoresPage /></main><Footer /><WhatsAppButton /></div>} />
      <Route path="/patrocinadores" element={<div className="min-h-screen bg-white overflow-x-hidden"><Navbar /><main><PatrocinadoresPage /></main><Footer /><WhatsAppButton /></div>} />
      <Route path="/gracias" element={<div className="min-h-screen bg-white overflow-x-hidden"><Navbar /><main><GraciasPage /></main><Footer /><WhatsAppButton /></div>} />
      <Route path="/subir-documento" element={<div className="min-h-screen bg-white overflow-x-hidden"><Navbar /><main><SubirDocumentoPage /></main><Footer /><WhatsAppButton /></div>} />
      <Route path="/terminos" element={<div className="min-h-screen bg-white overflow-x-hidden"><Navbar /><main><TerminosPage /></main><Footer /><WhatsAppButton /></div>} />
    </Routes>
  );
}