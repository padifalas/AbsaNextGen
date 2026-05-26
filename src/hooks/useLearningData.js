/**
 * useLearningData.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Custom hook that owns ALL data-fetching for the Learn page.
 *
 * CURRENT BEHAVIOUR (Assignment submission):
 *   Fetches from /data/learningData.json — a static local file in /public/data/.
 *   This gives us real async/loading/error state, real useEffect architecture,
 *   and clean separation between data and UI — without requiring a live backend.
 *
 * PRODUCTION SWAP (one change, clearly marked below):
 *   Replace the fetch URL with your CMS or backend endpoint, e.g.:
 *     GET https://api.wealthstudio.absa.co.za/v1/learn/content?locale=en-ZA&taxYear=2024
 *   The hook's interface (loading, error, data shape) stays identical —
 *   no changes needed in Learn.jsx.
 *
 * WHY NOT CALL A LIVE API NOW:
 *   1. ABSA has no public developer API for financial education content.
 *   2. SARS publishes tax data as PDFs/HTML — no REST endpoint exists.
 *      Production would use a scheduled scraper that writes to this file/CMS.
 *   3. SARB exchange-control figures update annually; same pattern applies.
 *   A note on each hardcoded value is in learningData.json → "_architecture".
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';

/**
 * Shape of the resolved data object (matches learningData.json schema):
 *
 * {
 *   meta:                 { taxYear, primeRate, tfsaAnnualLimit, ... }
 *   categories:           [{ id, label, colorVar }]
 *   modules:              [{ id, title, category, level, readTime, summary,
 *                            absaLink, externalLink, content[], quiz[], didYouKnow }]
 *   glossary:             [{ term, def }]
 *   absaDeepLinks:        { homeLoan, retirementAnnuity, tfsa, ... }
 *   externalLinks:        { sarsIndividualRates, sarbExchangeControl, ... }
 *   trackRecommendations: { property[], balanced[], aggressive[] }
 * }
 */

const CACHE_KEY = 'ws_learn_data_cache';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours — re-fetch daily in production

export function useLearningData() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      // ── Check session cache to avoid re-fetching on every navigation ──────
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const { timestamp, payload } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL_MS) {
            if (!cancelled) {
              setData(payload);
              setLoading(false);
            }
            return;
          }
        }
      } catch {
        // Corrupt cache — fall through to fetch
      }

      try {
        // ────────────────────────────────────────────────────────────────────
        // DATA SOURCE — swap this URL for a real API in production:
        //
        //   CURRENT  : '/data/learningData.json'   (static local asset)
        //   PRODUCTION: `${import.meta.env.VITE_API_BASE}/learn/content`
        //
        // The response shape must match the schema described above.
        // ────────────────────────────────────────────────────────────────────
        const response = await fetch('/data/learningData.json');

        if (!response.ok) {
          throw new Error(
            `Failed to load learning content (HTTP ${response.status}). ` +
            `Check that /public/data/learningData.json exists.`
          );
        }

        const json = await response.json();

        // Strip internal _architecture/_comment keys before storing
        const payload = sanitisePayload(json);

        if (!cancelled) {
          setData(payload);
          setLoading(false);
          // Cache for subsequent navigations within the session
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), payload }));
          } catch {
            // sessionStorage quota exceeded — non-fatal
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unknown error loading learning data.');
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

/**
 * Strip JSON-comment keys (_architecture, _comment_*) from the raw payload.
 * These are documentation annotations — not needed at runtime.
 */
function sanitisePayload(raw) {
  if (Array.isArray(raw)) return raw.map(sanitisePayload);
  if (raw && typeof raw === 'object') {
    return Object.fromEntries(
      Object.entries(raw)
        .filter(([k]) => !k.startsWith('_'))
        .map(([k, v]) => [k, sanitisePayload(v)])
    );
  }
  return raw;
}
