import type { VercelRequest, VercelResponse } from '@vercel/node';

const GO_API_URL = 'https://opencode.ai/zen/go/v1/chat/completions';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://braindrop.vercel.app',
];

function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GO_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GO_API_KEY not configured on server' });
    return;
  }

  try {
    const response = await fetch(GO_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({ error: `OpenCode Go API error: ${errorText}` });
      return;
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch {
    res.status(502).json({ error: 'Failed to reach OpenCode Go API' });
  }
}
