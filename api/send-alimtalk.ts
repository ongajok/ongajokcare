export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};

    const guardianName = body.guardian || '보호자';
    const guardianPhone = body.receiver || body.phone || body.guardianPhone || '';
    const caregiverName = body.caregiver || '간병인';
    const caregiverPhone = body.caregiverPhone || '';
    const patientName = body.patient || '';
    const hospital = body.hospital || '';

    // 협회 관리자 번호
    const adminPhone = '01095207839';

    // 수신자 번호들 모으기 (중복 제거 및 하이픈 제거)
    const receiversSet = new Set<string>();
    if (guardianPhone) receiversSet.add(guardianPhone.replace(/-/g, ''));
    if (caregiverPhone) receiversSet.add(caregiverPhone.replace(/-/g, ''));
    receiversSet.add(adminPhone);

    const receivers = Array.from(receiversSet).join(',');

    if (!receivers) {
      return res.status(400).json({ error: '수신자 번호가 없습니다.' });
    }

    // 문자 내용 작성 (전화번호와 상세 정보 포함)
    let message = `[온가족간병협회] 가족간병 접수 및 매칭 안내\n\n`;
    message += `■ 환자명: ${patientName || '미입력'}\n`;
    message += `■ 입원병원: ${hospital || '미입력'}\n`;
    message += `■ 보호자: ${guardianName} (${guardianPhone || '번호없음'})\n`;
    message += `■ 간병인: ${caregiverName} (${caregiverPhone || '번호없음'})\n\n`;
    message += `서로 연락하셔서 일정 및 조율을 진행해 주시기 바랍니다.\n`;
    message += `문의: 010-9520-7839`;

    for (const [key, value] of Object.entries(body)) {
      if (!['receiver', 'phone', 'message', 'tpl_code', 'guardian', 'caregiver', 'patient', 'hospital'].includes(key) && value != null) {
        message += `\n• ${key}: ${value}`;
      }
    }

    const apiKey = process.env.ALIGO_API_KEY;
    const userId = process.env.ALIGO_USER_ID;
    const sender = process.env.ALIGO_SENDER_PHONE;

    if (!apiKey || !userId || !sender) {
      return res.status(400).json({ error: 'Vercel Environment Variables Missing' });
    }

    const params = new URLSearchParams();
    params.append('apikey', apiKey);
    params.append('userid', userId);
    params.append('sender', sender);
    params.append('receiver', receivers);
    params.append('msg', message);
    params.append('title', '[온가족간병] 접수 및 매칭 안내');
    params.append('msg_type', 'LMS'); // 장문 문자

    // 알리고 일반 문자/LMS 전송 API 호출
    const aligoRes = await fetch('https://apis.aligo.in/send/', {
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
