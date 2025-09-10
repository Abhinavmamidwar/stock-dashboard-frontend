import axios from 'axios';
import { auth } from './firebase';

export async function fetchStockData(tickers: string[], timeframe: string, customRange?: { start: string; end: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  // If backend base URL is provided, call FastAPI directly. Otherwise, call Next.js route.
  const url = baseUrl ? `${baseUrl}/api/stocks/fetch` : '/api/stock-data';
  
  console.log('Making request to:', url);
  console.log('Request payload:', { tickers, timeframe, customRange });

  try {
    // Include Firebase ID token when calling backend directly
    const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;

    // Map payload to backend schema when calling FastAPI directly
    const payload = baseUrl
      ? {
          tickers,
          timeframe,
          start_date: customRange?.start ?? undefined,
          end_date: customRange?.end ?? undefined,
        }
      : { tickers, timeframe, customRange };

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (baseUrl && idToken) headers['Authorization'] = `Bearer ${idToken}`;

    const res = await axios.post(url, payload, { headers });
    console.log('API Response:', res.data);
    return res.data;
  } catch (err: any) {
    const isNetworkFailure = !err?.response || err?.message === 'Network Error';

    // If calling backend directly failed at network layer, fallback to Next.js API route
    if (baseUrl && isNetworkFailure) {
      try {
        const fallbackUrl = '/api/stock-data';
        console.warn(`Direct backend call unreachable. Falling back to: ${fallbackUrl}`);
        const fallbackRes = await axios.post(
          fallbackUrl,
          { tickers, timeframe, customRange },
          { headers: { 'Content-Type': 'application/json' } }
        );
        return fallbackRes.data;
      } catch (fallbackErr: any) {
        console.error('Fallback request failed:', fallbackErr);
      }
    }

    if (err.response) {
      const status = err.response.status;
      const detail = err.response.data?.message || err.response.statusText || 'Request failed';
      throw new Error(`${status}: ${detail}`);
    }
    throw new Error(err.message || 'Network error');
  }
}
