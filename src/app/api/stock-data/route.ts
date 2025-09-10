import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y' | 'YTD' | 'MTD' | 'CUSTOM';

function getStartDateForTimeframe(timeframe: Timeframe, custom?: { start?: string; end?: string }) {
  const end = custom?.end ? new Date(custom.end) : new Date();
  const start = new Date(end);
  switch (timeframe) {
    case '1D':
      start.setDate(end.getDate() - 1);
      break;
    case '1W':
      start.setDate(end.getDate() - 7);
      break;
    case '1M':
      start.setMonth(end.getMonth() - 1);
      break;
    case '3M':
      start.setMonth(end.getMonth() - 3);
      break;
    case '1Y':
      start.setFullYear(end.getFullYear() - 1);
      break;
    case 'YTD':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'MTD':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'CUSTOM':
      if (custom?.start) return { start: new Date(custom.start), end };
      break;
    default:
      start.setMonth(end.getMonth() - 1);
  }
  return { start, end };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log('API Route called with headers:', Object.fromEntries(req.headers.entries()));
    const body = await req.json();
    console.log('API Route body:', body);
    
    const tickers: string[] = Array.isArray(body?.tickers)
      ? body.tickers.map((t: any) => String(t || '').toUpperCase().trim()).filter(Boolean)
      : [];
    const timeframe: Timeframe = body?.timeframe || '1M';
    const customRange: { start?: string; end?: string } | undefined = body?.customRange;
    if (!tickers.length) {
      return NextResponse.json({ message: 'tickers required' }, { status: 400 });
    }

    const { start, end } = getStartDateForTimeframe(timeframe, customRange);

    // Fetch historical data for each ticker
    const results = await Promise.all(
      tickers.map(async (symbol) => {
        try {
          const queryOptions: any = {
            period1: start,
            period2: end,
            interval: '1d',
          };
          const data = await yahooFinance.historical(symbol, queryOptions);
          // Ensure ascending by date
          data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
          return { symbol, data };
        } catch (symbolErr: any) {
          console.error(`Failed to fetch ${symbol}:`, symbolErr?.message);
          return { symbol, data: [] };
        }
      })
    );

    // Build a unified date axis (intersection of available dates)
    const dateSets = results.map(r => new Set(r.data.map((d: any) => new Date(d.date).toISOString().slice(0, 10))));
    let commonDates: string[] = Array.from(dateSets.reduce((acc, set) => {
      if (!acc) return new Set(set);
      const next = new Set<string>();
      for (const d of acc) if (set.has(d)) next.add(d);
      return next;
    }, null as any as Set<string> | null) || new Set<string>());
    commonDates.sort();

    if (commonDates.length === 0) {
      // fallback to union if intersection empty
      const union = new Set<string>();
      dateSets.forEach(s => s.forEach(d => union.add(d)));
      commonDates = Array.from(union).sort();
    }

    const series = results.map(r => {
      const dateTo = {
        open: new Map<string, number>(),
        high: new Map<string, number>(),
        low: new Map<string, number>(),
        close: new Map<string, number>()
      };
      r.data.forEach((d: any) => {
        const key = new Date(d.date).toISOString().slice(0, 10);
        dateTo.open.set(key, Number(d.open));
        dateTo.high.set(key, Number(d.high));
        dateTo.low.set(key, Number(d.low));
        dateTo.close.set(key, Number(d.close));
      });
      const opens = commonDates.map(d => (dateTo.open.has(d) ? dateTo.open.get(d)! : null));
      const highs = commonDates.map(d => (dateTo.high.has(d) ? dateTo.high.get(d)! : null));
      const lows = commonDates.map(d => (dateTo.low.has(d) ? dateTo.low.get(d)! : null));
      const closes = commonDates.map(d => (dateTo.close.has(d) ? dateTo.close.get(d)! : null));
      const volumes = r.data.map((d: any) => {
        const key = new Date(d.date).toISOString().slice(0, 10);
        return { key, v: Number(d.volume ?? d.volume === 0 ? 0 : NaN) };
      });
      const volMap = new Map<string, number>();
      volumes.forEach(x => volMap.set(x.key, x.v));
      const volume = commonDates.map(d => (volMap.has(d) ? volMap.get(d)! : null));
      return { ticker: r.symbol.toUpperCase(), closes, ohlc: { open: opens, high: highs, low: lows, close: closes }, volume };
    });

    return NextResponse.json({ dates: commonDates, series }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (err: any) {
    console.error('Route /api/stock-data error:', err?.message, err?.stack);
    return NextResponse.json({ message: err?.message || 'Unexpected error' }, { status: 500 });
  }
}


