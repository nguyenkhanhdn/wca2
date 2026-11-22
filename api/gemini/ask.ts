import { askCitizenAssistant, type AskCitizenRequest } from '../../server/geminiService.ts';

interface VercelRequestLike {
  method?: string;
  body?: unknown;
}

interface VercelResponseLike {
  status: (code: number) => VercelResponseLike;
  json: (payload: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ status: 405, code: 'METHOD_NOT_ALLOWED', error: 'Phương thức không được hỗ trợ.' });
    return;
  }

  let body: AskCitizenRequest = { question: '' };
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body) as AskCitizenRequest;
    } catch {
      res.status(400).json({ status: 400, code: 'INVALID_JSON', error: 'Dữ liệu gửi lên không đúng định dạng.' });
      return;
    }
  } else if (req.body && typeof req.body === 'object') {
    body = req.body as AskCitizenRequest;
  }

  const result = await askCitizenAssistant(body);

  if (!result.ok) {
    res.status(result.error.status).json(result.error);
    return;
  }

  res.status(200).json(result.data);
}
