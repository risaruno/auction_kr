import { chromium } from 'playwright';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Received request:', req.method, req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cortOfcCd, csNo } = req.body;

  if (!cortOfcCd || !csNo) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const url = 'https://www.courtauction.go.kr/pgj/pgj15A/selectAuctnCsSrchRslt.on';

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'ko-KR,ko;q=0.9',
    'Origin': 'https://www.courtauction.go.kr',
    'Referer': 'https://www.courtauction.go.kr/pgj/PGJ15A.jsp',
    'X-Requested-With': 'XMLHttpRequest',
  };

  const payload = {
    dma_srchCsDtlInf: {
      cortOfcCd,
      csNo,
    },
  };

  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const response = await page.request.post(url, {
      headers,
      data: JSON.stringify(payload),
    });

    const responseBody = await response.text();
    const jsonResponse = JSON.parse(responseBody);
    console.log('Response from court auction API:', jsonResponse.data);
    const data = {
      courtName: jsonResponse.data.dma_csBasInf.cortOfcNm,
      caseNumber: jsonResponse.data.dma_csBasInf.csNo,
      evaluationAmt: jsonResponse.data.dlt_dspslGdsDspslObjctLst[0].aeeEvlAmt,
      lowestBidAmt: jsonResponse.data.dlt_dspslGdsDspslObjctLst[0].fstPbancLwsDspslPrc,
      bidDate: jsonResponse.data.dlt_dspslGdsDspslObjctLst[0].dspslDxdyYmd,
    }
    console.log('Parsed data:', data);
    await browser.close();

    res.status(response.status()).json({ data: data });
  } catch (error) {
    console.error('Playwright error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
