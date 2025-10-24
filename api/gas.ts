// /api/gas.ts  (Vercel Edge)
export const config = { runtime: 'edge' };

const GAS_URL = 'https://script.google.com/macros/s/AKfycbw2u_ytJk9NlkOKlY-5nNTnfIsrNodfPq9X-DKIGDdxoNtw68OXd-c86NpAgZ5TnOERRw/exec';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return cors(new Response(null, { status: 204 }));

  const body = await req.text();
  const upstream = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body
  });

  const text = await upstream.text();
  return cors(new Response(text, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' }
  }));
}

function cors(r: Response) {
  const h = new Headers(r.headers);
  h.set('Access-Control-Allow-Origin', '*');
  h.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  h.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  return new Response(r.body, { status: r.status, headers: h });
}
