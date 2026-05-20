import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { AboutSection } from '../components/AboutSection';
import { PhasesSection } from '../components/PhasesSection';
import { AgendaSection } from '../components/AgendaSection';
import { RouteMapSection } from '../components/RouteMapSection';
import { VenueMapSection } from '../components/VenueMapSection';
import { PetWallSection } from '../components/PetWallSection';
import { TicketsSection } from '../components/TicketsSection';
import { SponsorsSection } from '../components/SponsorsSection';
import { ActivitiesSection } from '../components/ActivitiesSection';
import { LocationSection } from '../components/LocationSection';
import { CauseSection } from '../components/CauseSection';
import { ContactSection } from '../components/ContactSection';
import { SponsorsBannerSection } from '../components/SponsorsBannerSection';
export function HomePage() {
  return <>
      <HeroSection />
      <ActivitiesSection />
      <AboutSection />
      <TicketsSection />
      <CauseSection />
      <SponsorsBannerSection />
      <SponsorsSection />
      <AgendaSection />
      <RouteMapSection />
      <VenueMapSection />
      <PetWallSection />
      <LocationSection />
      <PhasesSection />
      <ContactSection />
    </>;
}