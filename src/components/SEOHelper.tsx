import React from 'react';
import SEOMetadataManager, { PageType } from './SEOMetadataManager';
import { Excursion } from '../types';

interface SEOHelperProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  activeExcursion?: Excursion | null;
  pageType?: 'home' | 'excursions' | 'map' | 'itinerary' | 'cartouche' | 'admin' | PageType;
}

export default function SEOHelper({
  title,
  description,
  image,
  url,
  activeExcursion,
  pageType = 'home'
}: SEOHelperProps) {
  let mappedPageType: PageType = 'tours';

  if (pageType === 'map') mappedPageType = 'map';
  else if (pageType === 'itinerary' || pageType === 'scribe') mappedPageType = 'scribe';
  else if (pageType === 'gallery') mappedPageType = 'gallery';
  else if (pageType === 'cartouche') mappedPageType = 'cartouche';
  else if (pageType === 'faq') mappedPageType = 'faq';
  else if (pageType === 'bookings') mappedPageType = 'bookings';
  else if (pageType === 'admin') mappedPageType = 'admin';
  else if (pageType === 'login') mappedPageType = 'login';
  else if (pageType === 'register') mappedPageType = 'register';
  else if (pageType === 'reset-password') mappedPageType = 'reset-password';
  else if (pageType === 'profile') mappedPageType = 'profile';

  return (
    <SEOMetadataManager
      activePage={mappedPageType}
      activeExcursion={activeExcursion}
      customTitle={title}
      customDescription={description}
      customImage={image}
      customUrl={url}
    />
  );
}

export { SEOMetadataManager };
