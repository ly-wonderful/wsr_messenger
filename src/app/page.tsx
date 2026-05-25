import MessengerForm from './components/MessengerForm';

export default function Home() {
  return (
    <main style={{ 
      minHeight: '100vh', 
      padding: '4rem 1rem',
      background: 'linear-gradient(135deg, var(--color-bg) 0%, #e2e8f0 100%)'
    }}>
      <div className="container">
        <header className="text-center mb-4">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Windsong Ranch</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-light)' }}>
            HOA Board Communication Portal
          </p>
        </header>

        <div style={{
          backgroundColor: '#f8fafc', // slate-50
          border: '1px solid #e2e8f0', // slate-200
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#64748b', // slate-500
          fontStyle: 'italic'
        }}>
          Disclaimer: This website is an independent tool provided by a resident for non-profit purposes and is not officially affiliated with, managed by, or endorsed by the Windsong Ranch HOA.
        </div>

        <div style={{
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: 'var(--color-secondary)', margin: 0, paddingBottom: '0.5rem' }}>Welcome Residents</h2>
          <p style={{ opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            Use this secure portal to send messages directly to all members of the Windsong Ranch HOA Board. 
            Select a topic to get started with a pre-formatted template, or create your own.
          </p>
        </div>

        <MessengerForm />
      </div>
    </main>
  );
}
