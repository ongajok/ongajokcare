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

    const formData = new URLSearchParams();
    formData.append('apikey', apiKey || '');
    formData.append('userid', userId || '');
    formData.append('senderkey', senderKey || '');
    formData.append('tpl_code', templateCode);
    formData.append('sender', sender || '');
    formData.append('receiver', receiver);
    formData.append('message', message);

    // 전달받은 추가 데이터가 있다면 함께 전송
    for (const [key, value] of Object.entries(body)) {
      if (!['receiver', 'phone', 'message', 'tpl_code'].includes(key)) {
        formData.append(key, String(value));
      }
    }

    const aligoRes = await fetch('https://kakaoapi.aligo.in/akv1/alimtalk/send/', {
      method: 'POST',
      body: formData,
    });

    const result = await aligoRes.json();
    return res.status(200).json({ result });
  } catch (error: any) {
    return res.status(500).json({ error: { code: '500', message: error.message } });
  }
}
