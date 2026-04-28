const COMPANY_CONTEXT = `
You are the official support assistant for The Vajra.

Facts you can use:
- Company/product brand: The Vajra
- Company entity: The VajraCognixia Technologies Private Limited
- Founder: Devanshu Dhyanu
- Founder role: Founder of The Vajra Campus Delivery
- Founder email: founder-thevajra@vajracognixia.in
- Support email: support@vajracognixia.in
- Website: https://www.vajracognixia.in/
- Product vision: The Vajra is building a cleaner and smarter campus delivery platform with a long-term drone-first logistics roadmap.
- Launch timing shown on the login page: 15 August 2026, 10:00 AM IST
- Current product themes: campus food delivery, marketplace access, campus services, support flows, wallet/payment flows, and future logistics expansion.

Career and role information:
- Operations Associate: field coordination, dispatch support, daily execution.
- Frontend Developer: React interfaces, customer flows, Supabase-backed features.
- Backend Developer: APIs, data flows, platform reliability.
- Growth & Partnerships: outreach, campaigns, local market growth.
- Customer Support Executive: customer queries, issue tracking, service quality.
- Research Associate: delivery trends, customer needs, market signals, operational improvements.

Instructions:
- Answer only questions related to The Vajra, VajraCognixia, the founder, careers, roles, launch, support, or product vision.
- If the answer is not known from the context above, say that the information is not available yet rather than inventing.
- If the user asks something unrelated, politely explain that you can only help with The Vajra-related questions.
- Keep answers concise, clear, and friendly.
`;

const fallbackReply = (question) => {
  const normalized = question.toLowerCase();

  if (normalized.includes('founder')) {
    return 'The Vajra ke founder Devanshu Dhyanu hain. Founder page par unka role The Vajra Campus Delivery ke founder ke roop mein dikhaya gaya hai.';
  }

  if (
    normalized.includes('establish') ||
    normalized.includes('founded') ||
    normalized.includes('kab bani') ||
    normalized.includes('kab establish')
  ) {
    return 'Mere paas exact establishment date available nahi hai. Public login page par launch timing 15 August 2026, 10:00 AM IST dikhayi gayi hai.';
  }

  if (normalized.includes('launch')) {
    return 'Login page ke hisaab se The Vajra launch 15 August 2026 ko 10:00 AM IST par scheduled hai.';
  }

  if (normalized.includes('job') || normalized.includes('role') || normalized.includes('career')) {
    return 'Current open role examples mein Operations Associate, Frontend Developer, Backend Developer, Growth & Partnerships, Customer Support Executive, aur Research Associate shamil hain.';
  }

  if (
    normalized.includes('what') ||
    normalized.includes('kya hai') ||
    normalized.includes('kya karta') ||
    normalized.includes('company')
  ) {
    return 'The Vajra ek campus-focused delivery platform build kar raha hai jo food delivery, marketplace access, campus services, aur future drone-first logistics roadmap par kaam kar raha hai.';
  }

  if (normalized.includes('support') || normalized.includes('contact') || normalized.includes('email')) {
    return 'Aap support@vajracognixia.in par support ke liye contact kar sakte ho. Founder-specific reachout ke liye founder-thevajra@vajracognixia.in bhi available hai.';
  }

  return 'Main The Vajra se related questions ka jawab de sakta hoon, jaise founder, company vision, launch, support email, ya job roles. Aap wahi poochho aur main help karunga.';
};

const parseGeminiText = (payload) => {
  const parts = payload?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts)) {
    return '';
  }

  return parts
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .join('\n')
    .trim();
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const message =
    typeof req.body?.message === 'string'
      ? req.body.message.trim()
      : '';
  const history = Array.isArray(req.body?.history) ? req.body.history : [];

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      reply: fallbackReply(message),
      provider: 'fallback',
    });
  }

  try {
    const contents = history
      .filter(
        (entry) =>
          entry &&
          typeof entry.content === 'string' &&
          (entry.role === 'user' || entry.role === 'assistant')
      )
      .slice(-8)
      .map((entry) => ({
        role: entry.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: entry.content }],
      }));

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: COMPANY_CONTEXT }],
          },
          contents:
            contents.length > 0
              ? contents
              : [
                  {
                    role: 'user',
                    parts: [{ text: message }],
                  },
                ],
        }),
      }
    );

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return res.status(response.status).json({
        error: payload?.error?.message || 'Gemini request failed.',
      });
    }

    const reply = parseGeminiText(payload) || fallbackReply(message);

    return res.status(200).json({
      reply,
      provider: 'gemini',
    });
  } catch (error) {
    return res.status(200).json({
      reply: fallbackReply(message),
      provider: 'fallback',
      warning: error instanceof Error ? error.message : 'Request failed',
    });
  }
}
