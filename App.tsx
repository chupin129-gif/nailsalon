import React, { useState, useEffect } from 'react';
import { InputSection } from './components/InputSection';
import { ResultDisplay } from './components/ResultDisplay';
import { TrendWidget } from './components/TrendWidget';
import { BlogPostParams, GeneratedBlog, AppStatus, SeoTrend, Platform } from './types';
import { fetchLatestSeoTrends, generateBlogPost } from './services/geminiService';
import { Menu, X, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const EMPTY_PARAMS: BlogPostParams = {
  shopName: '',
  location: '',
  category: '이달의 아트',
  authorType: 'owner',
  mainKeyword: '',
  subKeywords: '',
  priceOrOffer: '',
  callToAction: '',
  draft: '',
};

const DEFAULT_SEO_GUIDELINES: Record<Platform, SeoTrend> = {
  naver: {
    summary: '키워드 단순 반복 금지, 1:1 진단과 맞춤 드릴케어·오버레이 과정을 사진/움짤과 함께 생생히 서술할 때 스마트블록 DIA+ 상위 노출 및 예약 전환 극대화',
    sources: [],
    timestamp: '최적화 가이드',
    changes: '체류시간 증대 및 1:1 고객 경험 스토리텔링 중점',
  },
  instagram: {
    summary: '첫 0.5초 시선을 끄는 훅 문장, 4컷 슬라이드(전체아트→C커브 단면→큐티클 디테일→3초 광택 무빙), 댓글 저장 유도 CTA',
    sources: [],
    timestamp: '최적화 가이드',
    changes: '저장률 및 릴스 무빙 뷰 시청 완료율 중점',
  },
  threads: {
    summary: '과장된 광고 톤 배제, 자영업 원장님의 진솔한 손톱 시술 일상 썰과 공감 질문으로 댓글 인터랙션 유도',
    sources: [],
    timestamp: '최적화 가이드',
    changes: '댓글 티키타카 및 자연스러운 피드 확산',
  },
  daangn: {
    summary: '이웃 주민을 향한 다정한 인사말, 철저한 도구 소독 위생, 1:1 맞춤 예약 편의성 및 단골 맺기 혜택 강조',
    sources: [],
    timestamp: '최적화 가이드',
    changes: '지역 주민 대상 신뢰도 및 당근 채팅 문의 전환',
  },
  wordpress: {
    summary: 'H2/H3 계층 구조, 젤네일 손상 예방법과 유지력 관리 전문 칼럼 구성 (Google E-E-A-T 기준 최적화)',
    sources: [],
    timestamp: '최적화 가이드',
    changes: '구글 검색엔진 정보성 검색어 상위 랭킹',
  },
  tistory: {
    summary: '다양한 시술 과정 고화질 사진 배치, 단계별 시술 팁 및 다음/카카오 검색 최적화',
    sources: [],
    timestamp: '최적화 가이드',
    changes: '다음 모바일 뷰탭 및 구글 유입 최적화',
  },
  blogspot: {
    summary: '명확한 키워드 배치, 모바일 최적화 레이아웃 및 글로벌 뷰티 트렌드 연계 구조화',
    sources: [],
    timestamp: '최적화 가이드',
    changes: '구글 글로벌 봇 크롤링 최적화',
  },
};

const App: React.FC = () => {
  // State
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isFetchingTrend, setIsFetchingTrend] = useState(false);
  const [params, setParams] = useState<BlogPostParams>(() => {
    const saved = localStorage.getItem('NAIL_BLOG_PARAMS_CACHE');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.shopName !== '네일드블랑 강남본점' && typeof parsed.mainKeyword === 'string' && parsed.mainKeyword.trim()) {
          return parsed;
        }
        localStorage.removeItem('NAIL_BLOG_PARAMS_CACHE');
      } catch (e) {
        console.error('Failed to parse cached params');
      }
    }
    return EMPTY_PARAMS;
  });
  const [generatedData, setGeneratedData] = useState<Partial<Record<Platform, GeneratedBlog>>>({});
  const [seoTrends, setSeoTrends] = useState<Partial<Record<Platform, SeoTrend>>>({});
  const [activePlatform, setActivePlatform] = useState<Platform>('naver');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isGenerating = status === AppStatus.GENERATING_CONTENT;

  const CACHE_KEY = 'NAIL_SEO_TREND_CACHE';
  const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  // Auto-save params to localStorage
  useEffect(() => {
    localStorage.setItem('NAIL_BLOG_PARAMS_CACHE', JSON.stringify(params));
  }, [params]);

  // Handlers
  const handleInputChange = (field: keyof BlogPostParams, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
    if (field === 'mainKeyword' && value?.trim() && status === AppStatus.ERROR) {
      setStatus(AppStatus.IDLE);
      setErrorMessage('');
    }
  };

  const getCachedTrend = (platform: Platform): SeoTrend | null => {
    const cached = localStorage.getItem(`${CACHE_KEY}_${platform}`);
    if (cached) {
      try {
        const { trend, savedAt } = JSON.parse(cached);
        if (
          trend &&
          !trend.summary?.includes('Could not fetch') &&
          !trend.summary?.includes('Fallback Logic') &&
          !trend.changes?.includes('에러로 인한') &&
          Date.now() - savedAt < CACHE_EXPIRY_MS
        ) {
          return trend;
        }
        localStorage.removeItem(`${CACHE_KEY}_${platform}`);
      } catch (e) {
        console.error("Cache parsing error", e);
      }
    }
    return null;
  };

  const fetchTrends = async (platform: Platform, forceRefresh = false) => {
    setIsFetchingTrend(true);
    try {
      const oldTrend = getCachedTrend(platform) || undefined;
      const trend = await fetchLatestSeoTrends(forceRefresh ? oldTrend : undefined, platform);
      
      localStorage.setItem(`${CACHE_KEY}_${platform}`, JSON.stringify({
        trend,
        savedAt: Date.now()
      }));
      
      setSeoTrends(prev => ({ ...prev, [platform]: trend }));
      return trend;
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setIsFetchingTrend(false);
    }
  };

  const handleSubmit = async (platform: Platform = activePlatform) => {
    if (!params.mainKeyword || !params.mainKeyword.trim()) {
      setErrorMessage('대표 검색 키워드(예: 강남역 네일샵)를 먼저 입력해주세요.');
      setStatus(AppStatus.ERROR);
      setIsSidebarOpen(true);
      return;
    }
    
    setErrorMessage('');
    try {
      setActivePlatform(platform);
      setIsSidebarOpen(false); // Close sidebar on mobile
      
      const currentTrend = seoTrends[platform] || getCachedTrend(platform) || DEFAULT_SEO_GUIDELINES[platform];
      setSeoTrends(prev => ({ ...prev, [platform]: currentTrend }));

      // Generate Nail Marketing Content
      setStatus(AppStatus.GENERATING_CONTENT);
      const result = await generateBlogPost(params, currentTrend, platform);
      setGeneratedData(prev => ({ ...prev, [platform]: result }));
      setStatus(AppStatus.SUCCESS);
      setErrorMessage('');

    } catch (error: any) {
      console.error("Content generation failed", error);
      const msg = error?.message || '네일 원고 생성 중 문제가 발생했습니다.';
      setErrorMessage(
        msg.includes('Failed to fetch') || msg.includes('NetworkError')
          ? '서버 통신 중 일시적인 지연이 발생했습니다. [재시도]를 눌러주세요.'
          : msg
      );
      setStatus(AppStatus.ERROR);
    }
  };

  const handleGenerateForPlatform = async (platform: Platform) => {
    await handleSubmit(platform);
  };

  // Initial load: Clean legacy trend caches and load initial guideline
  useEffect(() => {
    ['naver', 'instagram', 'threads', 'daangn', 'wordpress', 'tistory', 'blogspot'].forEach(p => {
      const item = localStorage.getItem(`${CACHE_KEY}_${p}`);
      if (item && (item.includes('Could not fetch') || item.includes('Fallback Logic') || item.includes('에러로 인한'))) {
        localStorage.removeItem(`${CACHE_KEY}_${p}`);
      }
    });

    const cached = getCachedTrend('naver');
    if (cached) {
      setSeoTrends(prev => ({ ...prev, naver: cached }));
    } else {
      setSeoTrends(prev => ({ ...prev, naver: DEFAULT_SEO_GUIDELINES.naver }));
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#07090e] text-slate-200">
      {/* Header */}
      <header className="flex-shrink-0 h-14 bg-slate-950/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-5 z-20 relative overflow-hidden">
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 rounded-xl text-white flex items-center justify-center font-bold shadow-md shadow-pink-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-white tracking-tight">
              Nail Salon AI
            </span>
            <span className="px-2 py-0.5 bg-pink-500/15 border border-pink-500/30 text-pink-300 font-bold rounded-full text-[10px] tracking-wider uppercase">
              PRO
            </span>
          </div>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors relative z-10"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar (Input Form) */}
        <aside 
          className={`
            fixed md:relative z-10 w-full md:w-[420px] h-[calc(100vh-64px)] bg-slate-950 transition-transform duration-300 ease-in-out border-r border-white/10
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <InputSection 
            params={params}
            onChange={handleInputChange}
            onSubmit={() => {
              handleSubmit(activePlatform);
              setIsSidebarOpen(false);
            }}
            isGenerating={isGenerating}
          />
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/70 z-0 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Workspace / Preview Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative bg-[#07090e]">
          <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Real-time SEO Trend Widget */}
            <TrendWidget 
              activePlatform={activePlatform}
              trend={seoTrends[activePlatform] || null} 
              isLoading={isFetchingTrend} 
              onRefresh={() => fetchTrends(activePlatform, true)}
            />

            {/* Error Message Notification */}
            {status === AppStatus.ERROR && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-red-500/5">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <div>
                    <span className="font-bold block text-red-200 text-sm">
                      {errorMessage || '네일 원고 생성 중 문제가 발생했습니다.'}
                    </span>
                    <span className="text-[11px] text-red-300/80 mt-0.5 block">
                      {!params.mainKeyword?.trim() 
                        ? '좌측 입력창에서 [대표 검색 키워드]를 입력하신 후 원고를 생성해주세요.' 
                        : '키워드 및 입력 정보를 확인하신 후 [재시도]를 누르시면 다시 생성됩니다.'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => {
                      if (!params.mainKeyword?.trim()) {
                        setIsSidebarOpen(true);
                      } else {
                        handleSubmit(activePlatform);
                      }
                    }}
                    className="px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg font-bold transition-all whitespace-nowrap"
                  >
                    {!params.mainKeyword?.trim() ? '키워드 입력창 열기' : '재시도'}
                  </button>
                </div>
              </div>
            )}

            {/* Result Display */}
            <AnimatePresence mode="wait">
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ResultDisplay 
                  data={generatedData} 
                  activePlatform={activePlatform}
                  setActivePlatform={setActivePlatform}
                  onGeneratePlatform={handleGenerateForPlatform}
                  status={status} 
                  params={params}
                  onOpenSidebar={() => setIsSidebarOpen(true)}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
