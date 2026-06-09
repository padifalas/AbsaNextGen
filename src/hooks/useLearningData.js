/**
owns ALL data-fetching for the Learn page.
 *

 *   Fetches from /data/learningData.json
 *without requiring a live backend.... wanted to be ambitious and call a real API, but no public CMS or REST endpoints exist lol.
 */

import { useState, useEffect } from 'react';


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

      // Check session cache to avoid re-fetching on every navigation
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
        const response = await fetch('/data/learningData.json');

        if (!response.ok) {
          throw new Error(
            `Failed to load learning content (HTTP ${response.status}). ` +
            `Check that /public/data/learningData.json exists.`
          );
        }

        const json = await response.json();


        const payload = sanitisePayload(json);

        if (!cancelled) {
          setData(payload);
          setLoading(false);

          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), payload }));
          } catch {

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
