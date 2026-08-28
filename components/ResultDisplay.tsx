import React, { useState } from 'react';
import { GeneratedBlog, AppStatus, Platform, BlogPostParams } from '../types';
import { 
  Copy, 
  Check, 
  Sparkles, 
  MapPin, 
  Hash, 
  ShieldCheck, 
  Heart, 
  RefreshCw, 
  Cpu, 
  Image as ImageIcon, 
  Smile, 
  FileText, 
  Layers, 
  CalendarCheck, 
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { copyDualFormattedContent, convertToCleanPlainText, convertToNaverSmartEditorHtml } from '../utils/formatConverter';

interface ResultDisplayProps {
  data: Record<string, GeneratedBlog>;
  activePlatform: Platform;
  setActivePlatform: (platform: Platform) => void;
  onGeneratePlatform: (platform: Platform) => void;
  status: AppStatus;
  params: BlogPostParams;
  onOpenSidebar?: () => void;
}

const platformConfig: Record<Platform, { label: string; icon: string; activeClass: string; badge: string; isCore?: boolean }> = {
  naver: { 
    label: '네이버 블로그', 
    icon: 'N', 
    activeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/10',
    badge: '스마트블록 · DIA+',
    isCore: true,
  },
  instagram: { 
    label: '인스타그램', 
    icon: 'IG', 
    activeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-pink-500/10',
    badge: '피드 · 릴스 캡션',
    isCore: true,
  },
  threads: { 
    label: '스레드 (Threads)', 
    icon: '@', 
    activeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-purple-500/10',
    badge: '공감 일상 바이럴',
    isCore: true,
  },
  daangn: {
    label: '당근마켓',
    icon: '🥕',
    activeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-orange-500/10',
    badge: '동네생활 · 단골 모객',
    isCore: true,
  },
  wordpress: { 
    label: '워드프레스', 
    icon: 'W', 
    activeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-blue-500/10',
    badge: '구글 검색 SEO'
  },
  tistory: { 
    label: '티스토리', 
    icon: 'T', 
    activeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/10',
    badge: '다음 · 구글'
  },
  blogspot: { 
    label: '구글 블로거', 
    icon: 'B', 
    activeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-500/10',
    badge: '글로벌 SEO'
  },
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  data, 
  activePlatform, 
  setActivePlatform, 
  onGeneratePlatform, 
  status, 
  params,
  onOpenSidebar
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const currentData = data[activePlatform];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 1. Pure text copy (e.g. for single fields, titles, hashtags, or plain markdown)
  const handleCopyText = (text: string, fieldId: string, customToast?: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    triggerToast(customToast || '클립보드에 복사되었습니다.');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 2. Naver SmartEditor ONE optimized Rich HTML copy
  // Ensures #111111 dark text so it is NEVER invisible white-on-white when pasted into white themes
  const handleCopySmartEditorHtml = async (fieldId: string) => {
    if (!currentData?.content) return;
    
    const success = await copyDualFormattedContent(currentData.content, {
      isHtmlPreferred: true,
      plainTextOverride: convertToCleanPlainText(currentData.content),
    });

    if (success) {
      setCopiedField(fieldId);
      triggerToast('✨ 네이버 블로그 서식 복사 완료! (검정 글씨 & 박스 서식 100% 유지)');
      setTimeout(() => setCopiedField(null), 2500);
    } else {
      // Fallback
      handleCopyText(convertToCleanPlainText(currentData.content), fieldId, '텍스트로 복사되었습니다.');
    }
  };

  // 3. Clean plain text copy (without markdown symbols, perfect for Instagram, Threads, KakaoTalk)
  const handleCopyCleanPlainText = (fieldId: string) => {
    if (!currentData?.content) return;
    const cleanText = convertToCleanPlainText(currentData.content);
    handleCopyText(cleanText, fieldId, '📋 텍스트 복사 완료! (인스타·스레드에 바로 붙여넣으세요)');
  };

  // 4. Copy all hashtags
  const handleCopyAllHashtags = () => {
    if (!currentData?.hashtags) return;
    const formatted = currentData.hashtags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ');
    handleCopyText(formatted, 'all-hashtags', '#️⃣ 해시태그 전체 복사 완료!');
  };

  // 5. Copy Photo Guide
  const handleCopyPhotoGuide = () => {
    if (!currentData?.instagramPhotoGuide) return;
    const guideText = `[📸 네일 시술 피드 사진/영상 4컷 가이드]\n` + currentData.instagramPhotoGuide.join('\n');
    handleCopyText(guideText, 'photo-guide', '📸 4컷 사진 구성 가이드가 복사되었습니다!');
  };

  // 6. Copy Booking CTA
  const handleCopyCtaTemplate = () => {
    const ctaText = currentData?.ctaTemplate || `💖 [${params.shopName || '네일샵'} 예약 및 문의 안내]
📍 위치: ${params.location || '상세 주소 예약 확정 시 안내'}
✨ 혜택: ${params.priceOrOffer || '첫방문 이벤트 진행 중'}
🔗 예약: ${params.callToAction || '네이버 플레이스 예약 또는 프로필 링크'}`;
    handleCopyText(ctaText, 'cta-template', '💌 예약 & 방문 안내 템플릿이 복사되었습니다!');
  };

  const handleTabClick = (platform: Platform) => {
    setActivePlatform(platform);
  };

  const handleGenerateClick = () => {
    if (!params.mainKeyword || !params.mainKeyword.trim()) {
      triggerToast('⚠️ 좌측 입력창에서 [대표 검색 키워드]를 먼저 입력해주세요!');
      if (onOpenSidebar) {
        onOpenSidebar();
      }
      return;
    }
    onGeneratePlatform(activePlatform);
  };

  const formatContentForDisplay = (rawContent: string) => {
    if (!rawContent) return '';
    return rawContent
      .replace(/\\n/g, '\n')
      .replace(/\r\n/g, '\n');
  };

  const isGenerating = status === AppStatus.GENERATING_CONTENT || status === AppStatus.FETCHING_TRENDS;

  return (
    <div className="space-y-4 relative">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 border border-pink-500/50 text-white shadow-2xl shadow-pink-500/20 backdrop-blur-xl flex items-center gap-3 text-xs font-bold"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-white/10">
        {(Object.keys(platformConfig) as Platform[]).map((key) => {
          const cfg = platformConfig[key];
          const isSelected = activePlatform === key;
          const hasData = !!data[key];

          return (
            <button
              key={key}
              onClick={() => handleTabClick(key)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border whitespace-nowrap ${
                isSelected
                  ? `${cfg.activeClass} border-current shadow-md`
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[11px] font-black ${
                isSelected ? 'bg-white/20' : 'bg-slate-800'
              }`}>
                {cfg.icon}
              </span>
              <span>{cfg.label}</span>
              {cfg.isCore && (
                <span className="text-[9px] px-1.5 py-0.2 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded font-semibold hidden sm:inline-block">
                  추천
                </span>
              )}
              {hasData && <Check className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />}
            </button>
          );
        })}
        <div className="flex-1" />
        {currentData && (
          <button
            onClick={handleGenerateClick}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/80 hover:bg-pink-500/20 border border-slate-700/60 hover:border-pink-500/40 text-slate-300 hover:text-pink-300 rounded-xl font-bold text-xs transition-all active:scale-95 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            다시 생성
          </button>
        )}
      </div>

      {/* Target Info Summary */}
      {(status === AppStatus.SUCCESS || Object.keys(data).length > 0) && (
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex flex-wrap items-center gap-2 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              타겟:
            </span>
            <span className="bg-pink-500/15 text-pink-300 px-2 py-0.5 rounded-md border border-pink-500/25 font-semibold">
              {params.shopName ? `${params.shopName} · ` : ''}{params.mainKeyword}
            </span>
            {params.location && (
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                📍 {params.location}
              </span>
            )}
            <span className="bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-md border border-purple-500/25">
              {params.authorType === 'customer' ? '💖 찐단골 후기 시점' : params.authorType === 'reviewer' ? '✨ 뷰티 에디터 시점' : '💅 원장님 시술일지 시점'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">네일 전문 마케팅 서식 엔진 탑재</span>
        </div>
      )}

      {/* Loading State with 2-Step Progression */}
      {isGenerating ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center text-slate-400 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-pink-500/20 shadow-2xl p-10 min-h-[420px] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-indigo-500/5" />
          
          <div className="w-16 h-16 mb-5 relative">
            <div className="absolute inset-0 border-3 border-pink-500/20 rounded-full" />
            <div className="absolute inset-0 border-3 border-pink-500 rounded-full border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 text-[11px] font-bold mb-2.5">
            {status === AppStatus.FETCHING_TRENDS ? '1단계: 최신 노출 알고리즘 분석' : '2단계: 매체별 맞춤 원고 생성'}
          </div>
          
          <h3 className="text-base font-bold text-white mb-1.5 tracking-tight text-center">
            {status === AppStatus.FETCHING_TRENDS
              ? `최신 ${platformConfig[activePlatform].label} 노출 알고리즘 검색 중...`
              : `${platformConfig[activePlatform].label} 맞춤 원고 작성 중...`}
          </h3>
          <p className="text-xs text-slate-400 text-center max-w-sm mb-5 leading-relaxed">
            {status === AppStatus.FETCHING_TRENDS
              ? '실시간 검색을 통해 상위노출 가이드라인을 먼저 분석하고 있습니다.'
              : '자연스러운 문맥과 최적의 사진 배치 마커를 구성하고 있습니다.'}
          </p>
          
          <div className="w-56 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-500" 
              style={{ width: status === AppStatus.FETCHING_TRENDS ? '45%' : '90%' }} 
            />
          </div>
        </motion.div>
      ) : !currentData ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl p-10 min-h-[420px] text-center"
        >
          <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-pink-400 shadow-inner">
            <span className="font-black text-2xl">{platformConfig[activePlatform].icon}</span>
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">{platformConfig[activePlatform].label} 원고 생성 대기</h3>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            [원고 생성하기]를 누르면 최신 {platformConfig[activePlatform].label} 노출 가이드라인을 먼저 분석한 뒤 실전 맞춤 원고를 생성합니다.
          </p>
          <button 
            onClick={handleGenerateClick}
            className="px-5 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md shadow-pink-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Cpu className="w-4 h-4" />
            {platformConfig[activePlatform].label} 원고 생성하기
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4 relative z-10">
          {/* Strategy & Nail Tip Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-900/70 rounded-xl p-3.5 border border-slate-800 flex items-start gap-2.5">
              <div className="p-1.5 bg-pink-500/10 text-pink-400 rounded-lg mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-pink-300 text-xs mb-0.5">
                  {platformConfig[activePlatform].label} 노출 포인트
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentData.seoStrategy}
                </p>
              </div>
            </div>

            {currentData.nailTip && (
              <div className="bg-slate-900/70 rounded-xl p-3.5 border border-slate-800 flex items-start gap-2.5">
                <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg mt-0.5">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-300 text-xs mb-0.5">
                    원장님의 유지력 & 홈케어 팁
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentData.nailTip}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Titles Matrix */}
          {currentData.titles && typeof currentData.titles === 'object' && (
            <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800 shadow-lg overflow-hidden">
              <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  추천 제목 3종
                </span>
                <span className="text-[10px] text-slate-400 font-medium">클릭 시 복사</span>
              </div>
              <div className="divide-y divide-slate-800/80">
                {[
                  { key: 'standard', label: '기본 표준형', val: currentData.titles.standard, tag: '검색 노출' },
                  { key: 'emotional', label: '감성 스토리형', val: currentData.titles.emotional, tag: '고객 공감' },
                  { key: 'clickbait', label: '호기심 유발형', val: currentData.titles.clickbait, tag: '클릭률 UP' },
                ].map((t) => (
                  <div 
                    key={t.key} 
                    onClick={() => handleCopyText(t.val, `title-${t.key}`, `제목이 복사되었습니다: "${t.val}"`)}
                    className="p-3 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 flex-1 pr-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold shrink-0">
                        {t.label}
                      </span>
                      <span className="text-xs font-semibold text-white group-hover:text-pink-300 transition-colors line-clamp-1">
                        {t.val}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 font-medium">
                        {t.tag}
                      </span>
                      <div className="w-6 h-6 rounded flex items-center justify-center text-slate-400 group-hover:text-white">
                        {copiedField === `title-${t.key}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instagram 4-Cut Photo Guide (Specialized for Nail Salons) */}
          {currentData.instagramPhotoGuide && currentData.instagramPhotoGuide.length > 0 && (
            <div className="bg-gradient-to-r from-pink-950/30 via-slate-900 to-purple-950/30 rounded-xl border border-pink-500/30 p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-pink-500/20 text-pink-300 rounded-lg">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      📸 피드 사진/영상 4컷 구성 가이드
                      <span className="text-[10px] font-medium text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded">
                        슬라이드 넘김 유도
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      이 순서대로 촬영해 올리시면 저장률과 문의 전환율이 극대화됩니다.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCopyPhotoGuide}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-pink-300 text-xs font-semibold rounded-lg flex items-center gap-1 border border-slate-700 transition-all shrink-0"
                >
                  {copiedField === 'photo-guide' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>가이드 복사</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentData.instagramPhotoGuide.map((item, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-white/5 rounded-lg p-2.5 flex items-start gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-300 leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content Viewer */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl overflow-hidden">
            {/* Top Toolbar */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-pink-400" />
                  {platformConfig[activePlatform].label} 원고 본문
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                  {currentData.content?.length || 0}자
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium hidden sm:inline-block">
                  검정 글씨 최적화
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button 
                  onClick={() => handleCopyCleanPlainText('plain-content')}
                  className="text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all active:scale-95"
                  title="마크다운 문법 없이 깔끔한 줄글로 복사 (인스타/스레드용)"
                >
                  {copiedField === 'plain-content' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>텍스트만 복사</span>
                </button>
                
                <button 
                  onClick={() => handleCopySmartEditorHtml('smart-content')}
                  className="text-xs font-bold flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-sm shadow-pink-500/25 transition-all active:scale-95"
                  title="네이버 블로그 스마트에디터에 서식과 사진박스 그대로 복사 (다크모드 흰색글씨 버그 완벽 차단)"
                >
                  {copiedField === 'smart-content' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>✨ 블로그 서식 복사</span>
                </button>
              </div>
            </div>

            {/* Smart Paste Security Notice */}
            <div className="px-4 py-2 bg-emerald-500/5 border-b border-emerald-500/15 flex items-center justify-between text-[11px] text-emerald-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>네이버 스마트에디터 ONE 붙여넣기 시 <strong>검정 글씨(#111111)와 핑크 소제목/사진박스 서식</strong>이 완벽하게 유지됩니다.</span>
              </span>
            </div>
            
            {/* The Markdown Render Area (Dark Theme UI View) */}
            <div className="p-5 md:p-7 text-slate-200 leading-relaxed text-sm whitespace-pre-line select-text" id="markdown-content">
              <ReactMarkdown 
                components={{
                  blockquote: ({ children }) => (
                    <blockquote className="my-4 border-l-4 border-pink-500 bg-pink-500/10 px-4 py-3 text-pink-200 text-xs rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-bold text-white mt-6 mb-3 flex items-center gap-1.5 border-l-4 border-pink-500 pl-2.5">
                      <span className="text-pink-400">✨</span> {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-bold text-pink-200 mt-4 mb-2 pl-2 border-l-2 border-pink-400">
                      {children}
                    </h3>
                  ),
                  hr: () => (
                    <hr className="my-6 border-t border-dashed border-pink-500/30" />
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-white bg-pink-500/25 px-1.5 py-0.5 rounded text-xs">
                      {children}
                    </strong>
                  ),
                  p: ({ children }) => {
                    const text = String(children);
                    if (text.includes('[✨ 3초 실물 광택') || text.includes('[🎬 영상 GIF') || text.includes('[움짤') || text.includes('[🎬 영상')) { 
                       return (
                         <div className="my-4 bg-slate-950 border border-purple-500/40 rounded-xl p-4 text-center flex flex-col items-center justify-center gap-1.5 shadow-inner">
                           <div className="p-1.5 bg-purple-500/20 text-purple-300 rounded-full">
                             <Sparkles className="w-4 h-4" />
                           </div>
                           <span className="text-xs font-bold text-purple-300">움짤 / 3초 동영상 배치 자리</span>
                           <span className="text-[11px] text-slate-400">자석젤이나 글리터의 빛 반사, 손끝 움직임을 보여주는 3초 짧은 영상을 삽입하세요.</span>
                         </div>
                       );
                    }
                    if (text.includes('[📸 사진:')) { 
                       const contentStr = text.replace('[📸 사진:', '').replace(']', '');
                       return (
                         <div className="my-4 bg-slate-950 border-2 border-dashed border-pink-500/40 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 text-center shadow-inner">
                           <div className="p-1.5 bg-pink-500/15 rounded-full text-pink-400">
                             <ImageIcon className="w-4 h-4" />
                           </div>
                           <span className="text-xs font-bold text-pink-300">📸 사진 들어갈 자리</span>
                           <span className="text-xs text-slate-200 font-medium">{contentStr}</span>
                         </div>
                       );
                    }
                    if (text.includes('[😊 스티커:')) {
                      const contentStr = text.replace('[😊 스티커:', '').replace(']', '');
                      return (
                        <div className="my-3 flex justify-center">
                          <div className="px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full flex items-center gap-1.5 text-pink-400 text-xs font-medium">
                            <Smile className="w-3 h-3" />
                            <span>스티커 배치: {contentStr}</span>
                          </div>
                        </div>
                      );
                    }
                    if (text.includes('[📍 지도:')) {
                      const contentStr = text.replace('[📍 지도:', '').replace(']', '');
                      return (
                        <div className="my-4 p-3.5 bg-slate-950 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-lg">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-emerald-400 font-bold uppercase">네이버 플레이스 지도 첨부</span>
                            <span className="text-xs font-bold text-white">{contentStr}</span>
                          </div>
                        </div>
                      );
                    }
                    return <p className="mb-4 leading-relaxed text-slate-200">{children}</p>;
                  }
                }}
              >
                {formatContentForDisplay(currentData.content)}
              </ReactMarkdown>
            </div>
          </div>

          {/* Booking & Call to Action (CTA) Template Box */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800 shadow-md p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-pink-400" />
                예약 & 방문 안내 템플릿 (본문 하단 / 카톡용)
              </span>
              <button
                onClick={handleCopyCtaTemplate}
                className="text-xs text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1"
              >
                {copiedField === 'cta-template' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'cta-template' ? '복사 완료' : '템플릿 복사'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed">
              {currentData.ctaTemplate || `💖 [${params.shopName || '네일샵'} 예약 및 문의 안내]\n📍 위치: ${params.location || '상세 주소 예약 확정 시 안내'}\n✨ 혜택: ${params.priceOrOffer || '첫방문 이벤트 진행 중'}\n🔗 예약: ${params.callToAction || '네이버 플레이스 예약 또는 프로필 링크'}`}
            </div>
          </div>
          
          {/* Hashtags Section */}
          {currentData.hashtags && currentData.hashtags.length > 0 && (
            <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-800 shadow-md p-4">
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-pink-400" />
                  해시태그 ({currentData.hashtags.length}개)
                </span>
                <button
                  onClick={handleCopyAllHashtags}
                  className="text-xs text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1 px-2.5 py-1 bg-pink-500/10 rounded-lg border border-pink-500/20"
                >
                  {copiedField === 'all-hashtags' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'all-hashtags' ? '복사 완료' : '해시태그 30개 전체 복사'}</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentData.hashtags.map((tag, index) => (
                  <span 
                    key={index}
                    onClick={() => handleCopyText(tag.startsWith('#') ? tag : `#${tag}`, `tag-${index}`, `해시태그 복사: ${tag}`)}
                    className="text-xs font-medium text-slate-300 bg-slate-950 border border-slate-800 hover:border-pink-500 hover:text-pink-300 transition-colors px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sticky Quick-Action Bar for Mobile & Tablet */}
          <div className="sticky bottom-4 z-20 flex items-center justify-between gap-2 p-3 bg-slate-950/95 backdrop-blur-xl border border-pink-500/30 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
              <span className="hidden sm:inline">원클릭 실전 복사:</span>
            </div>

            <div className="flex items-center gap-2 flex-1 justify-end">
              <button
                onClick={() => handleCopyCleanPlainText('bottom-plain')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 active:scale-95"
              >
                {copiedField === 'bottom-plain' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>텍스트 복사</span>
              </button>

              <button
                onClick={() => handleCopySmartEditorHtml('bottom-smart')}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-pink-500/25 transition-all flex items-center gap-1.5 active:scale-95"
              >
                {copiedField === 'bottom-smart' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>✨ 블로그 서식 복사</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
