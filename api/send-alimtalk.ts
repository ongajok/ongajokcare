
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (!body || typeof body !== 'object') {
      let rawData = '';
      for await (const chunk of req) {
        rawData += chunk;
      }
      try {
        body = JSON.parse(rawData);
      } catch (e) {
        body = {};
      }
    }

    const receiver = body.receiver || body.phone || '';
    const message = body.message || '';
    const templateCode = process.env.ALIGO_TEMPLATE_CODE || body.tpl_code || 'UJ_7390';

    const apiKey = process.env.ALIGO_API_KEY;
    const userId = process.env.ALIGO_USER_ID;
    const senderKey = process.env.ALIGO_SENDER_KEY;
    const sender = process.env.ALIGO_SENDER_PHONE;

    if (!apiKey || !userId || !senderKey || !sender) {
      return res.status(400).json({ 
        error: 'Vercel Environment Variables Missing', 
        details: { hasApiKey: !!apiKey, hasUserId: !!userId, hasSenderKey: !!senderKey, hasSender: !!sender } 
      });
    }

    const formData = new URLSearchParams();
    formData.append('apikey', apiKey);
    formData.append('userid', userId);
    formData.append('senderkey', senderKey);
    formData.append('tpl_code', templateCode);
    formData.append('sender', sender);
    formData.append('receiver', receiver);
    formData.append('message', message);

    for (const [key, value] of Object.entries(body)) {
      if (!['receiver', 'phone', 'message', 'tpl_code'].includes(key)) {
        formData.append(key, String(value));
      }
    }

    // ★ 헤더(Content-Type)를 추가하여 알리고가 정상 인식하도록 수정
    const aligoRes = await fetch('https://kakaoapi.aligo.in/akv1/alimtalk/send/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const responseText = await aligoRes.text();
    
    try {
      const jsonResult = JSON.parse(responseText);
      return res.status(200).json({ result: jsonResult });
    } catch (e) {
      return res.status(500).json({ 
        error: 'Aligo Rejected Request (HTML Response)', 
        rawHtml: responseText 
      });
    }
  } catch (error: any) {
    return res.status(500).json({ error: { code: '500', message: error.message } });
  }
}
