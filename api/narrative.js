const STYLE_DEFS = {
  Organisational: "Brings order to chaos. Strong at structuring information, building systems, applying logic, and creating clarity from complexity.",
  Strategic: "Thinks with purpose. Applies logic and theory to solve complex problems, harmonises conflicting inputs, and builds systems oriented toward a clear goal.",
  Storytelling: "Composes and connects. Writes with imagination and flow, engages audiences, plans content, and finds the most compelling way to express an idea.",
  Conceptual: "Makes unexpected connections. Uses associative and inventive thinking to solve problems — expansive when exploring, precise when distilling.",
  Discovery: "Digs until they find it. Researches with rigour and creativity, gathers intelligence through workshops, interviews and unlikely sources.",
  Design: "Builds for humans. User-centred thinking that reduces friction, improves outcomes, and makes information and systems feel intuitive and right.",
  Editorial: "Raises the bar. Precise, quality-driven, and deeply respectful of the author's voice. Improves everything they touch.",
  Relational: "Reads the room. Innately understands people, relationships, and what needs to be said and when. Brings empathy, motivation and energy to every interaction.",
};

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { name, top3, bottom2 } = req.body;
  if (!name || !top3 || !bottom2) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const topDescs = top3.map(s => STYLE_DEFS[s] || '').join(' ');

  const prompt = `Write three things for a work style profile at XXVI, Australia's leading brand voice and language agency.

1. A profile title starting with "The" — 2-4 words. An evocative synthesis of these three strengths: ${top3.join(', ')}. Not just the names concatenated — find a phrase capturing what this combination means as a working identity. Like "The Curious Narrator" or "The Insight Architect". Make it specific.

2. A strengths summary — 2 sentences max in second person. Based on: ${top3.join(', ')}. Definitions: ${topDescs}. Warm and specific.

3. A support sentence — 1 sentence in second person. Honest but constructive about: ${bottom2.join(' and ')}.

Return ONLY valid JSON, no markdown: {"archetype": "...", "strengths": "...", "support": "..."}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      res.status(500).json({ error: 'Anthropic API error', detail: err });
      return;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '{}';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    res.status(200).json(parsed);

  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ error: err.message });
  }
};
