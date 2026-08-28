import express from "express";
import path from "path";
import { GoogleGenAI, Schema, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory 24-hour cache for SEO trends
const trendCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Route: Get Real-time SEO Guidelines (Short & Crisp)
app.post('/api/trends', async (req, res) => {
  try {
    const { platform = 'naver', force = false, oldTrend = null } = req.body;
    const cacheKey = platform;

    if (!force && trendCache[cacheKey] && (Date.now() - trendCache[cacheKey].timestamp < CACHE_DURATION)) {
      return res.json(trendCache[cacheKey].data);
    }

    const ai = getGenAI();
    const model = 'gemini-2.5-flash';

    const platformPrompts: Record<string, string> = {
      naver: '네이버 블로그 네일샵 젤네일 스마트블록 DIA+ 상위노출 알고리즘 핵심 요약',
      instagram: '인스타그램 릴스 피드 네일샵 탐색탭 노출 및 저장률 알고리즘 핵심 요약',
      threads: '스레드 Threads 자영업 뷰티 네일 일상 바이럴 알고리즘 핵심 요약',
      daangn: '당근마켓 동네생활 비즈프로필 네일샵 첫방문 이벤트 단골 모객 노출 팁 요약',
      wordpress: '구글 검색 SEO 네일샵 E-E-A-T 전문성 가이드 랭킹 요약',
      tistory: '티스토리 뷰티 네일 다음 구글 검색 노출 알고리즘 요약',
      blogspot: '구글 블로거 Blogger 네일 케어 SEO 랭킹 최적화 요약',
    };

    const targetTopic = platformPrompts[platform] || platformPrompts.naver;
    const prompt = `
      당신은 뷰티 & 네일 전문 마케팅 분석가입니다.
      최신 구글 검색을 활용하여 "${targetTopic}"에 대한 최신 핵심 노출 공식을 2~3줄로 매우 명확하고 압축적으로 요약해주세요.

      [작성 규칙 - 절대 장황하게 쓰지 말 것]
      - 불필요한 서론/수식어 금지
      - [SUMMARY]: 핵심 공식 2줄 요약 (체류시간, 사진배치, 키워드 밀도 등)
      - ### CHANGES: 최근 주요 변화 또는 주의점 1줄
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const fullText = response.text || '최신 네일샵 노출 알고리즘 분석 완료';
    let summary = fullText;
    let changes = '체류시간 증대와 맞춤형 시술 스토리텔링 중심';

    if (fullText.includes('### CHANGES:')) {
      const parts = fullText.split('### CHANGES:');
      summary = parts[0].replace('[SUMMARY]', '').replace(/\[.*?\]/g, '').trim();
      changes = parts[1].trim();
    } else {
      summary = summary.replace('[SUMMARY]', '').trim();
    }

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .filter((c: any) => c.web)
      .map((c: any) => ({
        title: c.web.title,
        uri: c.web.uri,
      }))
      .slice(0, 3);

    const trendData = {
      summary,
      sources,
      timestamp: new Date().toLocaleString('ko-KR', { hour12: false }),
      changes: changes || '최신 알고리즘 기준 적용 중',
    };

    trendCache[cacheKey] = {
      data: trendData,
      timestamp: Date.now(),
    };

    return res.json(trendData);
  } catch (error: any) {
    console.error('Error in /api/trends:', error);
    return res.json({
      summary: '키워드 단순 반복을 피하고, 1:1 손톱 상태 진단과 드릴케어·오버레이 시술 디테일을 사진 마커와 함께 자연스럽게 서술할 때 최상단 노출과 예약 전환이 극대화됩니다.',
      sources: [],
      timestamp: new Date().toLocaleString('ko-KR', { hour12: false }),
      changes: '실제 경험 중심의 체류시간 확보 최우선',
    });
  }
});

// Route: Generate Clean & Channel-Optimized Nail Salon Marketing Content
app.post('/api/generate', async (req, res) => {
  try {
    const { params, seoTrend, platform = 'naver' } = req.body;
    if (!params || !params.mainKeyword || !params.mainKeyword.trim()) {
      return res.status(400).json({ error: '대표 검색 키워드(예: 강남역 네일샵)를 입력해주세요.' });
    }

    const ai = getGenAI();
    const model = 'gemini-2.5-flash';

    const shopName = params.shopName ? params.shopName.trim() : '우리 샵';
    const location = params.location ? params.location.trim() : '역세권 위치';
    const category = params.category ? params.category.trim() : '이달의 아트';
    const authorType = params.authorType || 'owner';
    const priceOrOffer = params.priceOrOffer ? params.priceOrOffer.trim() : '첫방문 혜택 및 이달의 아트 진행 중';
    const callToAction = params.callToAction ? params.callToAction.trim() : '네이버 예약 및 상담 문의';
    const draftStory = params.draft ? params.draft.trim() : '';

    let personaContext = '';
    if (authorType === 'owner') {
      personaContext = `
        - **화자 시점**: 1:1 맞춤 케어 전문 샵 원장님.
        - **말투/분위기**: 친절하고 전문적이며 꼼꼼한 진정성 있는 어조.
        - **강조 포인트**: 큐티클 케어, 쉐입 교정, 굴곡 보강 오버레이, 5주 이상 튼튼한 유지력.
      `;
    } else if (authorType === 'customer') {
      personaContext = `
        - **화자 시점**: 얇고 찢어지는 손톱 고민으로 방문한 찐단골 고객의 내돈내산 솔직 후기.
        - **말투/분위기**: 감탄과 만족이 넘치는 생생한 리얼 리뷰 어조.
        - **강조 포인트**: 편안한 샵 분위기, 아프지 않은 드릴케어, 실물 깡패 아트, 파츠 걸림 없는 마감.
      `;
    } else {
      personaContext = `
        - **화자 시점**: 트렌디한 뷰티 & 네일 에디터.
        - **말투/분위기**: 신뢰감 있는 정보 전달형 어조.
        - **강조 포인트**: 위치 및 접근성, 가격 혜택, 위생 관리, 단계별 시술 완성도.
      `;
    }

    let systemInstruction = '';

    if (platform === 'naver') {
      systemInstruction = `
        당신은 네일샵 전문 마케팅 원고 작가입니다.
        네이버 블로그 스마트블록 및 DIA+ 검색에 최적화된, 실제 예약으로 이어지는 원고를 작성합니다.

        [화자 설정]
        ${personaContext}

        [원고 작성 필수 지침]
        1. 기계적인 서두 금지 ("안녕하세요 오늘은 ~에 대해 알아보겠습니다" 등 사용 금지). 자연스러운 손톱 고민 공감이나 시술 비하인드로 시작.
        2. 사용자가 제공한 시술 상세 메모(${draftStory || '맞춤 쉐입 교정 및 오버레이 보강 케어'})를 기반으로 1:1 맞춤 케어 과정을 생생하게 서술.
        3. 자연스러운 문단 구분: 문단 사이에 빈 줄(두 번 엔터)을 넣어 모바일에서 읽기 편하게 배치.
        4. 시각적 안내 마커를 적재적소에 배치:
           - [📸 사진: 시술 전 손톱 상태 컷]
           - [📸 사진: 드릴 케어 및 쉐입 정돈 컷]
           - [📸 사진: 컬러 및 파츠 디테일 컷]
           - [📸 사진: 영롱한 완성 자연광 컷]
           - [✨ 3초 실물 광택 움짤]
           - [📍 지도: ${shopName} (${location})]
        5. 메인 키워드("${params.mainKeyword}")와 서브 키워드("${params.subKeywords || ''}")를 자연스럽게 5~7회 분산.
        6. 마지막에 예약 CTA(${priceOrOffer}, ${callToAction}) 안내.
        7. 트렌드 가이드: ${seoTrend?.summary || ''}
      `;
    } else if (platform === 'instagram') {
      systemInstruction = `
        당신은 인스타그램 뷰티/네일 전문 SNS 마케터입니다.
        인스타그램 피드 및 릴스에 최적화된 캡션과 카드뉴스 슬라이드 구성을 작성합니다.

        [인스타그램 포맷 규칙 - 가독성 극대화]
        - 이모지를 센스있게 활용하고, 줄바꿈을 깔끔하게 적용.
        - [1] 0.5초 시선 사로잡는 첫 줄 후킹
        - [2] 슬라이드/사진 넘김 가이드 (1장~5장 구성)
        - [3] 시술 포인트 요약 (시술명: ${category}, 상세: ${draftStory || '1:1 맞춤 쉐입 & 유지력 오버레이'}, 특징)
        - [4] 이벤트 및 예약 안내 (${callToAction}, ${priceOrOffer})
        - [5] 본문 끝부분에 복사하기 좋은 해시태그 목록 30개 제공.
        - 트렌드: ${seoTrend?.summary || ''}
      `;
    } else if (platform === 'threads') {
      systemInstruction = `
        당신은 스레드(Threads)에서 활발히 소통하는 네일샵 원장님입니다.
        광고 느낌 없는 솔직하고 유쾌한 시술 일상 썰, 손톱 관리 꿀팁을 작성합니다.

        [스레드 포맷 규칙]
        - 2~3줄씩 짧고 경쾌한 호흡으로 줄바꿈.
        - 마크다운 복잡한 서식 쓰지 말고, 자연스러운 줄글과 여백으로 가독성 확보.
        - 시술 스토리(${draftStory || '손톱 고민 해결과 5주 유지력 케어'})를 기반으로 한 원장님의 현실적인 이야기.
        - 마지막 줄에 독자의 의견이나 공감을 묻는 질문 추가.
        - 트렌드: ${seoTrend?.summary || ''}
      `;
    } else if (platform === 'daangn') {
      systemInstruction = `
        당신은 당근마켓 동네생활 및 비즈프로필 전문 로컬 마케팅 전문가입니다.
        근처 동네 주민들이 친근하게 방문하고 단골이 될 수 있는 따뜻한 이웃 어조로 작성합니다.

        [당근마켓 포맷 규칙]
        - "안녕하세요 ${location ? location + ' 근처 ' : ''}이웃님들!" 같은 다정하고 친근한 동네 인사로 시작.
        - 편안한 1:1 예약제 샵, 손톱 손상 없는 프리미엄 드릴케어, 위생적인 시술 도구 소독 관리 강조.
        - 혜택 안내: ${priceOrOffer || '당근 단골 맺기 시 첫방문 10% 할인 or 젤제거 무료 혜택'}.
        - 문의/예약 안내: 당근 채팅 또는 전화 문의 환영 (${callToAction}).
        - 트렌드: ${seoTrend?.summary || ''}
      `;
    } else {
      // wordpress, tistory, blogspot
      systemInstruction = `
        당신은 구글 및 포털 검색엔진 최적화(SEO) 네일 전문 칼럼니스트입니다.
        체계적인 소제목(H2, H3)과 명확한 정보를 갖춘 글을 작성합니다.

        [웹/블로그 SEO 작성 규칙]
        - H2 (##), H3 (###) 소제목을 체계적으로 구조화.
        - 손톱 손상 방지 팁, 젤 유지력 관리법, ${shopName}의 1:1 맞춤 케어 장점 정리 (${draftStory}).
        - 핵심 포인트는 불렛(-)과 볼드(**)로 깔끔하게 정리.
        - 이스케이프 문자나 이상한 깨짐 없이 완벽한 마크다운 문법 준수.
        - 트렌드: ${seoTrend?.summary || ''}
      `;
    }

    const promptText = `
      [네일샵 시술 정보]
      - 샵 이름: ${shopName}
      - 샵 위치: ${location}
      - 시술 카테고리: ${category}
      - 작성 시점: ${authorType}
      - 대표 메인 키워드: ${params.mainKeyword}
      - 세부 연관 키워드: ${params.subKeywords || '없음'}
      - 이벤트/혜택: ${priceOrOffer}
      - 문의/예약: ${callToAction}
      - 시술 상세 스토리 및 메모: ${draftStory || '1:1 맞춤 케어 및 유지력 오버레이 시술'}

      [출력 요구사항 - 반드시 순수 JSON 반환]
      - "titles": standard(기본 표준형), emotional(감성 스토리형), clickbait(호기심 유발형) 3가지 제목
      - "content": 각 플랫폼에 최적화된 마크다운 원고 (깨끗한 줄바꿈과 여백 유지, 특수기호 깨짐 방지)
      - "hashtags": 해당 플랫폼에 적합한 해시태그 목록 20~30개 (배열 형태)
      - "seoStrategy": 이 원고의 노출 포인트 및 예약 전환 전략 1~2줄 핵심 요약
      - "nailTip": 원장님의 유지력 & 홈케어 꿀팁 1줄
      - "instagramPhotoGuide": 인스타 및 피드 업로드용 4컷 사진/영상 구성 가이드 (1장: 전체 아트 클로즈업 자연광 컷, 2장: C커브 하이포인트 단면, 3장: 루즈스킨 정돈 큐티클 라인, 4장: 3초 광택 무빙 영상)
      - "ctaTemplate": 샵 위치, 이벤트, 네이버 예약 및 카톡 예약 양식이 정리된 복붙용 안내 텍스트 박스
    `;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        titles: {
          type: Type.OBJECT,
          properties: {
            standard: { type: Type.STRING },
            emotional: { type: Type.STRING },
            clickbait: { type: Type.STRING },
          },
          required: ['standard', 'emotional', 'clickbait'],
        },
        content: { type: Type.STRING },
        hashtags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        seoStrategy: { type: Type.STRING },
        nailTip: { type: Type.STRING },
        instagramPhotoGuide: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        ctaTemplate: { type: Type.STRING },
      },
      required: ['titles', 'content', 'hashtags', 'seoStrategy', 'nailTip'],
    };

    const response = await ai.models.generateContent({
      model,
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    const parsedData = JSON.parse(response.text || '{}');

    // Ensure fallback for photo guide and cta template if omitted
    if (!parsedData.instagramPhotoGuide || parsedData.instagramPhotoGuide.length === 0) {
      parsedData.instagramPhotoGuide = [
        '1장 (썸네일): 자연광 아래 전체 네일 아트 45도 손끝 클로즈업',
        '2장 (오버레이): 굴곡 없는 매끈한 하이포인트 C커브 입체 단면',
        '3장 (케어/디테일): 손상 없이 정돈된 큐티클 라인 및 파츠 마감 줌인',
        '4장 (무빙/릴스): 각도에 따라 영롱하게 빛나는 자석젤/글리터 3초 영상',
      ];
    }

    if (!parsedData.ctaTemplate) {
      parsedData.ctaTemplate = `💖 [${shopName} 예약 및 문의 안내]
📍 위치: ${location || '상세 주소 예약 확정 시 안내'}
✨ 혜택: ${priceOrOffer || '첫방문 이벤트 진행 중'}
🔗 예약: ${callToAction || '네이버 플레이스 예약 또는 프로필 링크'}`;
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error in /api/generate:', error);
    return res.status(500).json({ error: error.message || '원고 생성 중 오류가 발생했습니다.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
