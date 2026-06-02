export default function GlobalNotFound() {
  return (
    <html lang="ua">
      <body style={{ margin: 0, padding: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f9fafb' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: '900', color: '#111827', margin: 0 }}>404</h1>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', marginBottom: '1rem' }}>
            Сторінку не знайдено / Page Not Found
          </h2>
          <a href="/ua" style={{ marginTop: '20px', padding: '12px 24px', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: '9999px', fontWeight: 'bold' }}>
            На головну / Go Home
          </a>
        </div>
      </body>
    </html>
  );
}
