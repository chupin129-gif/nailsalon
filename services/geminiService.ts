import { BlogPostParams, GeneratedBlog, SeoTrend, Platform } from "../types";

/**
 * Step 1: Fetch the latest SEO trends from the server backend.
 */
export const fetchLatestSeoTrends = async (oldTrend?: SeoTrend, platform: Platform = 'naver'): Promise<SeoTrend> => {
  try {
    const response = await fetch('/api/trends', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oldTrend, platform }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch SEO trends: ${response.statusText}`);
    }

    const data: SeoTrend = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching SEO trends:", error);
    return {
      summary: "키워드 단순 반복을 피하고, 1:1 손톱 맞춤 진단과 드릴케어·오버레이 과정을 단계별 사진과 함께 서술할 때 스마트블록 DIA+ 상위 노출 및 예약 전환이 극대화됩니다.",
      sources: [],
      timestamp: new Date().toLocaleString('ko-KR', { hour12: false }),
      changes: "실제 고객 경험 및 체류시간 확보 최우선",
    };
  }
};

/**
 * Step 2: Generate the blog post using the found trends and user input via the server backend.
 */
export const generateBlogPost = async (
  params: BlogPostParams,
  seoTrend: SeoTrend,
  platform: Platform
): Promise<GeneratedBlog> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ params, seoTrend, platform }),
    });

    if (!response.ok) {
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
    console.error("Error generating blog post:", error);
    throw new Error(error.message || "원고 생성 중 문제가 발생했습니다.");
  }
};

