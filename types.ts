export type AuthorType = 'owner' | 'customer' | 'reviewer';

export interface NailPhotos {
  before?: string;   // Data URL or description
  process?: string;  // Data URL or description
  after?: string;    // Data URL or description
  detail?: string;   // Data URL or description
}

export interface BlogPostParams {
  shopName?: string;
  location?: string;
  category?: string;
  authorType?: AuthorType;
  nailShape?: string;
  nailCondition?: string;
  mainKeyword: string;
  subKeywords: string;
  priceOrOffer?: string;
  callToAction?: string;
  draft: string;
  photos?: NailPhotos;
}

export interface GeneratedBlog {
  titles: {
    standard: string;
    emotional: string;
    clickbait: string;
  };
  content: string;
  hashtags: string[];
  seoStrategy: string;
  nailTip?: string;
  instagramPhotoGuide?: string[];
  ctaTemplate?: string;
}

export type Platform = 'naver' | 'instagram' | 'threads' | 'daangn' | 'wordpress' | 'tistory' | 'blogspot';

export interface SeoTrend {
  summary: string;
  sources: { title: string; uri: string }[];
  timestamp: string;
  changes?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  FETCHING_TRENDS = 'FETCHING_TRENDS',
  GENERATING_CONTENT = 'GENERATING_CONTENT',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
