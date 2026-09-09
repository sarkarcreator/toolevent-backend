const BASE_URL = process.env.PUBLICAI_BASE_URL || 'https://api.publicai.co/v1';
const MODEL = process.env.PUBLICAI_MODEL || 'swiss-ai/apertus-v1.5-8b';

export async function generatePublicAIJson<T>(system: string, prompt: string): Promise<T> {
  const apiKey = process.env.PUBLICAI_API_KEY;
  if (!apiKey) throw new Error('PUBLICAI_API_KEY is not configured');

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Toolbox.Events/1.0',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`PublicAI request failed (${response.status})${details ? `: ${details.slice(0, 300)}` : ''}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('PublicAI returned an empty response');
  }

  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1)) as T;
    throw new Error('PublicAI returned invalid JSON');
  }
}
