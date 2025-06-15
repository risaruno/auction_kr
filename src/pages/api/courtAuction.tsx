import { chromium } from 'playwright';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cortOfcCd, csNo } = req.body;

  if (!cortOfcCd || !csNo) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // --- Step 1: First fetch for auction base info ---
    const url1 = 'https://www.courtauction.go.kr/pgj/pgj15A/selectAuctnCsSrchRslt.on';
    const headers1 = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json',
      'Accept-Language': 'ko-KR,ko;q=0.9',
      'Origin': 'https://www.courtauction.go.kr',
      'Referer': 'https://www.courtauction.go.kr/pgj/PGJ15A.jsp',
      'X-Requested-With': 'XMLHttpRequest',
    };

    const payload1 = {
      dma_srchCsDtlInf: {
        cortOfcCd,
        csNo,
      },
    };

    const response1 = await page.request.post(url1, {
      headers: headers1,
      data: JSON.stringify(payload1),
    });

    const json1 = await response1.json();

    if (!json1.data || !json1.data.dlt_dspslGdsDspslObjctLst?.[0]) {
      throw new Error('No auction item found in first response');
    }

    const item = json1.data.dlt_dspslGdsDspslObjctLst[0];

    const auctionData = {
      courtName: json1.data.dma_csBasInf.cortOfcNm,
      caseNumber: json1.data.dma_csBasInf.csNo,
      printCaseNumber: json1.data.dma_csBasInf.userCsNo,
      evaluationAmt: item.aeeEvlAmt,
      lowestBidAmt: item.fstPbancLwsDspslPrc,
      depositAmt: item.fstPbancLwsDspslPrc/10,
      bidDate: item.dspslDxdyYmd,
    };

    // --- Step 2: Now second fetch for picture data ---
    const url2 = 'https://www.courtauction.go.kr/pgj/pgj15B/selectAuctnCsSrchRslt.on';
    const payload2 = {
      dma_srchGdsDtlSrch: {
        csNo: auctionData.caseNumber,
        cortOfcCd,
        dspslGdsSeq: 1,
        pgmId: 'PGJ15AF01',
        srchInfo: {
          menuNm: '경매사건검색',
          sideDvsCd: '2',
        },
      },
    };

    const response2 = await page.request.post(url2, {
      headers: headers1,
      data: JSON.stringify(payload2),
    });

    const json2 = await response2.json();
    const picFile = json2?.data?.dma_result?.csPicLst?.[0]?.picFile || null;

    await browser.close();

    return res.status(200).json({
      data: {
        ...auctionData,
        picFile,
      },
    });

  } catch (error) {
    console.error('Playwright error:', error);
    await browser.close();
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
