'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchStockData } from '../../lib/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const ECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

const TIMEFRAMES = [
  { label: '1 Day', value: '1D' },
  { label: '1 Week', value: '1W' },
  { label: '1 Month', value: '1M' },
  { label: '3 Months', value: '3M' },
  { label: '1 Year', value: '1Y' },
  { label: 'YTD', value: 'YTD' },
  { label: 'MTD', value: 'MTD' },
  { label: 'Custom', value: 'CUSTOM' },
];

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 60 }}>
      <div style={{
        width: 32, height: 32, border: '4px solid rgba(255,255,255,0.08)', borderTop: '4px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite'
      }} />
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tickers, setTickers] = useState<string[]>([]);
  const [tickersInput, setTickersInput] = useState('');
  const [timeframe, setTimeframe] = useState('1M');
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [chartData, setChartData] = useState<any>(null);
  const [compareMode, setCompareMode] = useState<'overlay' | 'separate'>('overlay');
  const [plotType, setPlotType] = useState<'line' | 'bar' | 'area' | 'heikin'>('line');
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleFetch = async () => {
    setError('');
    setFetching(true);
    setChartData(null);
    try {
      const data = await fetchStockData(
        tickers,
        timeframe,
        timeframe === 'CUSTOM' ? customRange : undefined
      );
      setChartData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setFetching(false);
    }
  };

  // Prepare ECharts option
  let chartOption: any = null;
  let chartHeight = 420;
  if (chartData && chartData.dates && chartData.series && chartData.series.length > 0) {
    const baseOption: any = {
      tooltip: { trigger: 'axis' },
      legend: { data: chartData.series.map((s: any) => s.ticker), textStyle: { color: 'var(--color-muted)' } },
      xAxis: {
        type: 'category',
        data: chartData.dates,
        axisLabel: { color: '#e5e7eb' },
        axisLine: { lineStyle: { color: '#374151' } },
      },
      yAxis: { type: 'value', axisLabel: { color: '#e5e7eb' }, axisLine: { lineStyle: { color: '#374151' } }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.18)' } } },
      series: chartData.series.map((s: any) => {
        if (plotType === 'heikin' && s.ohlc) {
          // compute Heikin Ashi values
          const open = s.ohlc.open as (number | null)[];
          const high = s.ohlc.high as (number | null)[];
          const low = s.ohlc.low as (number | null)[];
          const close = s.ohlc.close as (number | null)[];
          const ha: [number, number, number, number][] = [];
          let prevHaOpen: number | null = null;
          let prevHaClose: number | null = null;
          for (let i = 0; i < close.length; i++) {
            const o = open[i], h = high[i], l = low[i], c = close[i];
            if (o == null || h == null || l == null || c == null) { ha.push([NaN, NaN, NaN, NaN]); continue; }
            const haClose = (o + h + l + c) / 4;
            const haOpen = prevHaOpen != null && prevHaClose != null ? (prevHaOpen + prevHaClose) / 2 : (o + c) / 2;
            const haHigh = Math.max(h, haOpen, haClose);
            const haLow = Math.min(l, haOpen, haClose);
            ha.push([haOpen, haClose, haLow, haHigh]);
            prevHaOpen = haOpen; prevHaClose = haClose;
          }
          return {
            name: `${s.ticker} (HA)`,
            type: 'candlestick',
            data: ha,
            itemStyle: { color: '#10b981', color0: '#ef4444', borderColor: '#10b981', borderColor0: '#ef4444' },
          };
        }
        return {
          name: s.ticker,
          type: plotType === 'area' ? 'line' : plotType,
          data: s.closes,
          smooth: true,
          symbol: 'circle',
          lineStyle: { width: 2 },
          areaStyle: plotType === 'area' ? { opacity: 0.15 } : undefined,
          emphasis: { focus: 'series' },
        };
      }),
      color: ['#60a5fa', '#10b981', '#f59e0b', '#ef4444', '#a78bfa', '#22d3ee'],
      grid: { left: 40, right: 20, top: 40, bottom: 40 },
      backgroundColor: 'transparent',
    };

    if (plotType === 'candles') {
      // overlay mode: main candlestick + volume sub-chart
      const first = chartData.series[0];
      if (first?.ohlc) {
        chartOption = {
          tooltip: { trigger: 'axis' },
          legend: { data: [first.ticker, 'Volume'], textStyle: { color: 'var(--color-muted)' } },
          grid: [
            { left: 40, right: 20, top: 40, height: 260 },
            { left: 40, right: 20, top: 340, height: 120 },
          ],
          xAxis: [
            { type: 'category', data: chartData.dates, axisLabel: { color: '#e5e7eb' }, axisLine: { lineStyle: { color: '#374151' } } },
            { type: 'category', gridIndex: 1, data: chartData.dates, axisLabel: { color: '#e5e7eb' }, axisLine: { lineStyle: { color: '#374151' } } },
          ],
          yAxis: [
            { type: 'value', axisLabel: { color: '#e5e7eb' }, axisLine: { lineStyle: { color: '#374151' } }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.18)' } } },
            { type: 'value', gridIndex: 1, axisLabel: { color: '#e5e7eb' } },
          ],
          series: [
            {
              name: `${first.ticker} (Candle)`,
              type: 'candlestick',
              data: first.ohlc.open.map((_: any, i: number) => {
                const o = first.ohlc.open[i]; const h = first.ohlc.high[i]; const l = first.ohlc.low[i]; const c = first.ohlc.close[i];
                if (o==null||h==null||l==null||c==null) return [NaN,NaN,NaN,NaN];
                return [o, c, l, h];
              }),
              itemStyle: { color: '#10b981', color0: '#ef4444', borderColor: '#10b981', borderColor0: '#ef4444' },
            },
            {
              name: 'Volume',
              type: 'bar',
              xAxisIndex: 1,
              yAxisIndex: 1,
              data: first.volume,
              itemStyle: { color: 'rgba(96,165,250,0.6)' },
            },
          ],
          color: ['#60a5fa'],
          backgroundColor: 'transparent',
        };
      }
    }

    if (compareMode === 'separate') {
      // Create one grid / axis set per series dynamically
      const grids: any[] = [];
      const xAxes: any[] = [];
      const yAxes: any[] = [];
      const series: any[] = [];
      const topStart = 40;
      const panelHeight = 180; // fixed panel height for clarity
      chartData.series.forEach((s: any, idx: number) => {
        const top = topStart + idx * (panelHeight + 20);
        grids.push({ left: 40, right: 20, top, height: panelHeight });
        xAxes.push({ type: 'category', gridIndex: idx, data: chartData.dates, axisLabel: { color: '#e5e7eb' }, axisLine: { lineStyle: { color: '#374151' } } });
        yAxes.push({ type: 'value', gridIndex: idx, axisLabel: { color: '#e5e7eb' }, axisLine: { lineStyle: { color: '#374151' } }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.18)' } } });
        if (plotType === 'heikin' && s.ohlc) {
          const o = s.ohlc.open as (number | null)[];
          const h = s.ohlc.high as (number | null)[];
          const l = s.ohlc.low as (number | null)[];
          const c = s.ohlc.close as (number | null)[];
          const ha: [number, number, number, number][] = [];
          let prevO: number | null = null, prevC: number | null = null;
          for (let i = 0; i < c.length; i++) {
            if (o[i]==null||h[i]==null||l[i]==null||c[i]==null) { ha.push([NaN,NaN,NaN,NaN]); continue; }
            const haClose = ((o[i] as number) + (h[i] as number) + (l[i] as number) + (c[i] as number)) / 4;
            const haOpen = prevO != null && prevC != null ? (prevO + prevC) / 2 : (((o[i] as number) + (c[i] as number)) / 2);
            const haHigh = Math.max(h[i] as number, haOpen, haClose);
            const haLow = Math.min(l[i] as number, haOpen, haClose);
            ha.push([haOpen, haClose, haLow, haHigh]);
            prevO = haOpen; prevC = haClose;
          }
          series.push({ name: `${s.ticker} (HA)`, type: 'candlestick', xAxisIndex: idx, yAxisIndex: idx, data: ha, itemStyle: { color: '#10b981', color0: '#ef4444', borderColor: '#10b981', borderColor0: '#ef4444' } });
        } else if (plotType === 'candles' && s.ohlc) {
          const data = s.ohlc.open.map((_: any, i: number) => {
            const o = s.ohlc.open[i]; const hi = s.ohlc.high[i]; const lo = s.ohlc.low[i]; const cl = s.ohlc.close[i];
            if (o==null||hi==null||lo==null||cl==null) return [NaN,NaN,NaN,NaN];
            return [o, cl, lo, hi];
          });
          series.push({ name: `${s.ticker} (Candle)`, type: 'candlestick', xAxisIndex: idx, yAxisIndex: idx, data, itemStyle: { color: '#10b981', color0: '#ef4444', borderColor: '#10b981', borderColor0: '#ef4444' } });
        } else {
          series.push({ name: s.ticker, type: plotType === 'area' ? 'line' : plotType, xAxisIndex: idx, yAxisIndex: idx, data: s.closes, smooth: true, symbol: 'circle', areaStyle: plotType === 'area' ? { opacity: 0.15 } : undefined });
        }
      });
      chartHeight = topStart + chartData.series.length * (panelHeight + 20) + 40; // compute full height
      chartOption = { grid: grids, tooltip: { trigger: 'axis' }, xAxis: xAxes, yAxis: yAxes, series, color: ['#60a5fa', '#10b981', '#f59e0b', '#ef4444', '#a78bfa', '#22d3ee'], backgroundColor: 'transparent' };
    } else {
      chartOption = baseOption;
    }
  }

  if (loading || !user) return <Spinner />;

  return (
    <main className="container" style={{ margin: '32px auto' }}>
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0, marginBottom: 18, fontWeight: 800 }}>Dashboard</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontWeight: 600 }}>Stock Tickers</label>
            <Input
              type="text"
              value={tickersInput}
              onChange={e => {
                const raw = e.target.value;
                setTickersInput(raw);
                const parsed = raw
                  .split(',')
                  .map(t => t.trim().toUpperCase())
                  .filter(Boolean);
                setTickers(parsed);
              }}
              placeholder="e.g. AAPL, MSFT, GOOGL"
              style={{ marginTop: 6 }}
            />
            <div className="help" style={{ marginTop: 4 }}>Enter one or more stock symbols, separated by commas.</div>
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>Timeframe</label>
            <Select value={timeframe} onChange={e => setTimeframe(e.target.value)} style={{ marginTop: 6 }}>
              {TIMEFRAMES.map(tf => (
                <option key={tf.value} value={tf.value}>{tf.label}</option>
              ))}
            </Select>
            {timeframe === 'CUSTOM' && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Input type="date" value={customRange.start} onChange={e => setCustomRange(r => ({ ...r, start: e.target.value }))} />
                <span className="help">to</span>
                <Input type="date" value={customRange.end} onChange={e => setCustomRange(r => ({ ...r, end: e.target.value }))} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10 }}>
              <label className="help">Compare Mode</label>
              <Select value={compareMode} onChange={e => setCompareMode(e.target.value as any)} style={{ width: 180 }}>
                <option value="overlay">Overlay (single chart)</option>
                <option value="separate">Separate panels</option>
              </Select>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10 }}>
              <label className="help">Plot Type</label>
              <Select value={plotType} onChange={e => setPlotType(e.target.value as any)} style={{ width: 200 }}>
                <option value="line">Line</option>
                <option value="area">Area</option>
                <option value="bar">Bar</option>
                <option value="heikin">Heikin Ashi</option>
                <option value="candles">Candlestick + Volume</option>
              </Select>
            </div>
          </div>
        </div>
        <Button onClick={handleFetch} disabled={fetching || tickers.length === 0} style={{ marginTop: 4, marginBottom: 16 }}>
          {fetching ? 'Fetching…' : 'Fetch Data'}
        </Button>
        {error && <div style={{ color: '#ef4444', marginBottom: 12, fontWeight: 600 }}>{error}</div>}
        <div className="card" style={{ padding: 12 }}>
          {fetching ? (
            <Spinner />
          ) : chartOption ? (
            <ECharts option={chartOption} style={{ height: chartHeight, width: '100%' }} />
          ) : (
            <span className="help">No data to display</span>
          )}
        </div>
      </div>
    </main>
  );
}
