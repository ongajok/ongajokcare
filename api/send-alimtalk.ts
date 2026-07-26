export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};

    const receiver = body.receiver || body.phone || '';
    const message = body.message || '';
    const templateCode = process.env.ALIGO_TEMPLATE_CODE || body.tpl_code || 'UJ_7390';

    const apiKey = process.env.ALIGO_API_KEY;
    const userId = process.env.ALIGO_USER_ID;
    const senderKey = process.env.ALIGO_SENDER_KEY;
    const sender = process.env.ALIGO_SENDER_PHONE;

    if (!apiKey || !userId || !senderKey || !sender) {
      return res.status(400).json({ error: 'Vercel Environment Variables Missing' });
    }

    const params = new URLSearchParams();
    params.append('apikey', apiKey);
    params.append('userid', userId);
    params.append('senderkey', senderKey);
    params.append('tpl_code', templateCode);
    params.append('sender', sender);
    params.append('receiver', receiver);
    params.append('message', message);

    for (const [key, value] of Object.entries(body)) {
      if (!['receiver', 'phone', 'message', 'tpl_code'].includes(key) && value != null) {
        params.append(key, String(value));
      }
    }

    const aligoRes = await fetch('https://kakaoapi.aligo.in/akv1/alimtalk/send/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await aligoRes.json();
    return res.status(200).json({ result: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
