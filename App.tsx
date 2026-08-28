import React, { useState, useEffect } from 'react';
import { InputSection } from './components/InputSection';
import { ResultDisplay } from './components/ResultDisplay';
import { TrendWidget } from './components/TrendWidget';
import { BlogPostParams, GeneratedBlog, AppStatus, SeoTrend, Platform } from './types';
import { fetchLatestSeoTrends, generateBlogPost } from './services/geminiService';
import { Menu, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  // State
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [params, setParams] = useState<BlogPostParams>(() => {
    const saved = localStorage.getItem('NAIL_BLOG_PARAMS_CACHE');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cached params');
      }
    }
    return {
      shopName: '',
      location: '',
      mainKeyword: '',
      subKeywords: '',
      priceOrOffer: '',
      draft: '',
      authorType: 'owner',
    };
  });
  const [generatedData, setGeneratedData] = useState<Partial<Record<Platform, GeneratedBlog>>>({});
  const [seoTrends, setSeoTrends] = useState<Partial<Record<Platform, SeoTrend>>>({});
  const [activePlatform, setActivePlatform] = useState<Platform>('naver');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isGenerating = status === AppStatus.GENERATING_CONTENT || status === AppStatus.FETCHING_TRENDS;

  const CACHE_KEY = 'NAIL_SEO_TREND_CACHE';
  const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  // Auto-save params to localStorage
  useEffect(() => {
    localStorage.setItem('NAIL_BLOG_PARAMS_CACHE', JSON.stringify(params));
  }, [params]);

  // Handlers
  const handleInputChange = (field: keyof BlogPostParams, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const getCachedTrend = (platform: Platform): SeoTrend | null => {
    const cached = localStorage.getItem(`${CACHE_KEY}_${platform}`);
    if (cached) {
      try {
        const { trend, savedAt } = JSON.parse(cached);
        if (Date.now() - savedAt < CACHE_EXPIRY_MS) {
          return trend;
        }
      } catch (e) {
        console.error("Cache parsing error", e);
      }
    }
    return null;
  };

  const fetchTrends = async (platform: Platform, forceRefresh = false) => {
    setStatus(AppStatus.FETCHING_TRENDS);
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
    }
  };

  const handleSubmit = async (platform: Platform = activePlatform) => {
    if (!params.mainKeyword) return;
    
    try {
      setActivePlatform(platform);
      setIsSidebarOpen(false); // Close sidebar on mobile
      
      // Step 1: Fetch/Refresh latest SEO trend guideline first
      setStatus(AppStatus.FETCHING_TRENDS);
      let currentTrend = seoTrends[platform] || getCachedTrend(platform);
      
      if (!currentTrend) {
        currentTrend = await fetchTrends(platform) || undefined;
      } else {
        setSeoTrends(prev => ({ ...prev, [platform]: currentTrend }));
      }

      // Step 2: Generate Nail Marketing Content using the SEO guide
      setStatus(AppStatus.GENERATING_CONTENT);
      const result = await generateBlogPost(params, currentTrend, platform);
      setGeneratedData(prev => ({ ...prev, [platform]: result }));
      setStatus(AppStatus.SUCCESS);

    } catch (error) {
      console.error("Content generation failed", error);
      setStatus(AppStatus.ERROR);
    }
  };

  const handleGenerateForPlatform = async (platform: Platform) => {
    await handleSubmit(platform);
  };

  // Initial load: Only read local storage cache, DO NOT trigger network API calls
  useEffect(() => {
    const cached = getCachedTrend('naver');
    if (cached) {
      setSeoTrends(prev => ({ ...prev, naver: cached }));
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
              isLoading={status === AppStatus.FETCHING_TRENDS} 
              onRefresh={() => fetchTrends(activePlatform, true)}
            />

            {/* Error Message */}
            {status === AppStatus.ERROR && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-300 text-xs flex items-center justify-between">
                <span>네일 원고 생성 중 문제가 발생했습니다. 키워드를 확인하신 후 다시 시도해주세요.</span>
                <button 
                  onClick={() => handleSubmit(activePlatform)}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg font-bold"
                >
                  재시도
                </button>
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
