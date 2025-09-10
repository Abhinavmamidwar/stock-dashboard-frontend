import Link from 'next/link';

export default function Home() {
  return (
    <main className="container" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <h1 style={{ margin: 0, fontSize: 38, fontWeight: 900 }}>Visualize Markets Like a Pro</h1>
            <p style={{ color: 'var(--color-muted)', marginTop: 12, maxWidth: 560 }}>
              Compare performance across tickers, analyze trends, and explore ranges with a fast, elegant dashboard.
            </p>
            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              <Link className="btn btn-primary" href="/login">Get Started</Link>
              <Link className="btn" href="/signup" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>Create Account</Link>
            </div>
          </div>
          <div className="card" style={{ flex: 1, minWidth: 300, padding: 20 }}>
            <div style={{ height: 220, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4 }}>
              {Array.from({ length: 12 * 6 }).map((_, i) => (
                <div key={i} style={{ height: 28, background: 'rgba(59,130,246,0.12)', borderRadius: 4 }} />
              ))}
            </div>
            <div style={{ marginTop: 12, color: 'var(--color-muted)', fontSize: 13 }}>Secure, fast, and responsive.</div>
          </div>
        </div>
      </div>
    </main>
  );
}
