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
      summary: "Could not fetch real-time data. Using Fallback Logic: Focus on authentic personal experience (D.I.A.+), high dwell time, and mobile-friendly formatting with frequent images.",
      sources: [],
      timestamp: new Date().toLocaleString(),
      changes: "에러로 인한 기본값 사용",
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
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to generate blog post: ${response.statusText}`);
    }

    const result: GeneratedBlog = await response.json();
    return result;
  } catch (error: any) {
    console.error("Error generating blog post:", error);
    throw new Error(error.message || "Failed to generate blog post.");
  }
};
