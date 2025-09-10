'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useAuth } from '../../contexts/AuthContext';
import { fetchStockData } from '../../lib/api';

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
      <div
        style={{
          width: 32,
          height: 32,
          border: '4px solid rgba(255,255,255,0.08)',
          borderTop: '4px solid var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
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
  const [plotType, setPlotType] = useState<'line' | 'bar' | 'area' | 'heikin' | 'candlestick'>('line');
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const handleFetch = async () => {
    setError('');
    setFetching(true);
    setChartData(null);
    try {
      const data = await fetchStockData(tickers, timeframe, timeframe === 'CUSTOM' ? customRange : undefined);
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
    const createHeikinAshi = (ohlc: any) => {
      const open = ohlc.open;
      const high = ohlc.high;
      const low = ohlc.low;
      const close = ohlc.close;
      const ha: [number, number, number, number][] = [];
      let prevO: number | null = null;
      let prevC: number | null = null;
      for (let i = 0; i < close.length; i++) {
        if (open[i] == null || high[i] == null || low[i] == null || close[i] == null) {
          ha.push([NaN, NaN, NaN, NaN]);
          continue;
        }
        const haClose = (open[i] + high[i] + low[i] + close[i]) / 4;
        const haOpen = prevO != null && prevC != null ? (prevO + prevC) / 2 : (open[i] + close[i]) / 2;
        const haHigh = Math.max(high[i], haOpen, haClose);
        const haLow = Math.min(low[i], haOpen, haClose);
        ha.push([haOpen, haClose, haLow, haHigh]);
        prevO = haOpen;
        prevC = haClose;
      }
      return ha;
    };

    if (compareMode === 'separate') {
      const grids: any[] = [];
      const xAxes: any[] = [];
      const yAxes: any[] = [];
      const series: any[] = [];
      const topStart = 40;
      const panelHeight = 180;

      chartData.series.forEach((s: any, idx: number) => {
        const top = topStart + idx * (panelHeight + 20);
        grids.push({ left: 40, right: 20, top, height: panelHeight });
        xAxes.push({ type: 'category', gridIndex: idx, data: chartData.dates, axisLabel: { color: '#e5e7eb' }, axisLine: { lineStyle: { color: '#374151' } } });
        yAxes.push({ type: 'value', gridIndex: idx, axisLabel: { color: '#e5e7eb' }, axisLine: { lineStyle: { color: '#374151' } }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.18)' } } });

        if ((plotType === 'heikin' || plotType === 'candlestick') && s.ohlc) {
          const data = plotType === 'heikin' ? createHeikinAshi(s.ohlc) : s.ohlc.open.map((_: any, i: number) => [s.ohlc.open[i], s.ohlc.close[i], s.ohlc.low[i], s.ohlc.high[i]]);
          series.push({ name: `${s.ticker} (${plotType === 'heikin' ? 'HA' : 'Candle'})`, type: 'candlestick', xAxisIndex: idx, yAxisIndex: idx, data, itemStyle: { color: '#10b981', color0: '#ef4444', borderColor: '#10b981', borderColor0: '#ef4444' } });
        } else {
          series.push({ name: s.ticker, type: plotType === 'area' ? 'line' : plotType, xAxisIndex: idx, yAxisIndex: idx, data: s.closes, smooth: true, symbol: 'circle', areaStyle: plotType === 'area' ? { opacity: 0.15 } : undefined });
        }
      });

      chartHeight = topStart + chartData.series.length * (panelHeight + 20) + 40;
      chartOption = { grid: grids, xAxis: xAxes, yAxis: yAxes, series, tooltip: { trigger: 'axis' }, color: ['#60a5fa', '#10b981', '#f59e0b', '#ef4444', '#a78bfa', '#22d3ee'], backgroundColor: 'transparent' };
    } else {
      const series = chartData.series.map((s: any) => {
        if ((plotType === 'heikin' || plotType === 'candlestick') && s.ohlc) {
          const data = plotType === 'heikin' ? createHeikinAshi(s.ohlc) : s.ohlc.open.map((_: any, i: number) => [s.ohlc.open[i], s.ohlc.close[i], s.ohlc.low[i], s.ohlc.high[i]]);
          return { name: `${s.ticker} (${plotType === 'heikin' ? 'HA' : 'Candle'})`, type: 'candlestick', data, itemStyle: { color: '#10b981', color0: '#ef4444', borderColor: '#10b981', borderColor0: '#ef4444' } };
        }
        return { name: s.ticker, type: plotType === 'area' ? 'line' : plotType, data: s.closes, smooth: true, symbol: 'circle', areaStyle: plotType === 'area' ? { opacity: 0.15 } : undefined };
      });

      chartOption = {
        tooltip: { trigger: 'axis' },
        legend: { data: chartData.series.map((s: any) => s.ticker), textStyle: { color: 'var(--color-muted)' } },
        xAxis: { type: 'category', data: chartData.dates, axisLabel: { color: '#e5e7eb' }, axisLine: { lineStyle: { color: '#374151' } } },
        yAxis: { type: 'value', axisLabel: { color: '#e5e7eb' }, axisLine: { lineStyle: { color: '#374151' } }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.18)' } } },
        series,
        grid: { left: 40, right: 20, top: 40, bottom: 40 },
        color: ['#60a5fa', '#10b981', '#f59e0b', '#ef4444', '#a78bfa', '#22d3ee'],
        backgroundColor: 'transparent',
      };
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
              onChange={(e) => {
                const raw = e.target.value;
                setTickersInput(raw);
                const parsed = raw.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean);
                setTickers(parsed);
              }}
              placeholder="e.g. AAPL, MSFT, GOOGL"
              style={{ marginTop: 6 }}
            />
            <div className="help" style={{ marginTop: 4 }}>Enter one or more stock symbols, separated by commas.</div>
          </div>
          <div>
            <label style={{ fontWeight: 600 }}>Timeframe</label>
            <Select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} style={{ marginTop: 6 }}>
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
                <option value="candlestick">Candlestick + Volume</option>
              </Select>
            </div>
          </div>
        </div>
        <Button onClick={handleFetch} disabled={fetching || tickers.length === 0} style={{ marginTop: 4, marginBottom: 16 }}>
          {fetching ? 'Fetching…' : 'Fetch Data'}
        </Button>
        {error && <div style={{ color: '#ef4444', marginBottom: 12, fontWeight: 600 }}>{error}</div>}
        <div className="card" style={{ padding: 12 }}>
          {fetching ? <Spinner /> : chartOption ? <ECharts option={chartOption} style={{ height: chartHeight, width: '100%' }} /> : <span className="help">No data to display</span>}
        </div>
      </div>
    </main>
  );
}
