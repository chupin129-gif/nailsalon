import { BlogPostParams, GeneratedBlog, SeoTrend, Platform } from "../types";
import { createFallbackBlogContent } from "../utils/fallbackContent";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const FALLBACK_TREND: SeoTrend = {
  summary: "키워드 단순 반복을 피하고, 1:1 손톱 맞춤 진단과 드릴케어·오버레이 과정을 단계별 사진과 함께 서술할 때 스마트블록 DIA+ 상위 노출 및 예약 전환이 극대화됩니다.",
  sources: [],
  timestamp: new Date().toLocaleString('ko-KR', { hour12: false }),
  changes: "실제 고객 경험 및 체류시간 확보 최우선",
};

/**
 * Step 1: Fetch the latest SEO trends from the server backend.
 */
export const fetchLatestSeoTrends = async (oldTrend?: SeoTrend, platform: Platform = 'naver'): Promise<SeoTrend> => {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch('/api/trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ oldTrend, platform }),
      });

      if (!response.ok) {
        if ((response.status === 404 || response.status >= 500) && attempt < 2) {
          await sleep(800);
          continue;
        }
        throw new Error(`Failed to fetch SEO trends: ${response.statusText}`);
      }

      const data: SeoTrend = await response.json();
      return data;
    } catch (error) {
      if (attempt < 2) {
        await sleep(800);
        continue;
      }
      console.warn("Using fallback SEO trend due to network/server delay:", error);
      return FALLBACK_TREND;
    }
  }
  return FALLBACK_TREND;
};

/**
 * Step 2: Generate the blog post using the found trends and user input via the server backend.
 */
export const generateBlogPost = async (
  params: BlogPostParams,
  seoTrend: SeoTrend,
  platform: Platform
): Promise<GeneratedBlog> => {
  const maxAttempts = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ params, seoTrend, platform }),
      });

      if (!response.ok) {
        // If 404 or 5xx and we have attempts remaining, retry after delay
        if ((response.status === 404 || response.status >= 500) && attempt < maxAttempts) {
          console.warn(`Generate attempt ${attempt} returned status ${response.status}. Retrying in 1s...`);
          await sleep(1000 * attempt);
          continue;
        }

        let errMsg = '';
        try {
          const errData = await response.json();
          errMsg = errData.error || '';
        } catch {
          errMsg = response.statusText || '';
        }
        throw new Error(errMsg || `원고 생성 서버 통신 오류 (${response.status})`);
      }

      const result: GeneratedBlog = await response.json();
      return result;
    } catch (error: any) {
      lastError = error;
      if (attempt < maxAttempts) {
        console.warn(`Generate attempt ${attempt} failed: ${error.message}. Retrying in 1s...`);
        await sleep(1000 * attempt);
        continue;
      }
    }
  }

  console.error("Error generating blog post:", lastError);
  throw new Error(lastError?.message || "원고 생성 서버 통신에 일시적인 지연이 발생했습니다. [재시도]를 눌러주세요.");
};

