export default function DebugEnvPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Environment Variables Debug</h1>
      <pre>
        {JSON.stringify({
          NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
          NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
          VERCEL_URL: process.env.VERCEL_URL,
        }, null, 2)}
      </pre>
    </div>
  )
}
