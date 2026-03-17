/**
 * api/geo.mjs
 * Vercel Edge/Serverless function — GEO detection via Vercel headers
 * Returns: { locale, country, region, city }
 *
 * Mapping:
 *   FR         → fr
 *   DE, AT     → de
 *   CH         → fr | de | en (based on Accept-Language)
 *   GB, AU, NL, NO, NZ, CA, US → en
 *   fallback   → en
 */

export const config = { runtime: 'edge' };

const GEO_MAP = {
  FR: 'fr',
  DE: 'de',
  AT: 'de',
  GB: 'en', UK: 'en',
  AU: 'en',
  NL: 'en',
  NO: 'en',
  NZ: 'en',
  CA: 'en',
  US: 'en',
};

export default function handler(req) {
  const country  = (req.headers.get('x-vercel-ip-country')        || '').toUpperCase();
  const region   =  req.headers.get('x-vercel-ip-country-region') || '';
  const city     =  req.headers.get('x-vercel-ip-city')           || '';
  const acceptLang = (req.headers.get('accept-language')          || 'en').toLowerCase();

  let locale = 'en';

  if (country === 'CH') {
    // Switzerland: pick by browser language
    if (acceptLang.startsWith('fr')) locale = 'fr';
    else if (acceptLang.startsWith('de')) locale = 'de';
    else locale = 'en';
  } else if (GEO_MAP[country] !== undefined) {
    locale = GEO_MAP[country];
  } else if (country) {
    // Unknown country: fallback to Accept-Language
    if (acceptLang.startsWith('fr')) locale = 'fr';
    else if (acceptLang.startsWith('de')) locale = 'de';
    else locale = 'en';
  }

  return new Response(
    JSON.stringify({ locale, country, region, city }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
