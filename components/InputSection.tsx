import React from 'react';
import { BlogPostParams, AuthorType } from '../types';
import { Edit3, Hash, FileText, MapPin, Store, Gift, Tag, UserCheck, MessageSquare, Check, Sparkles } from 'lucide-react';

interface InputSectionProps {
  params: BlogPostParams;
  onChange: (field: keyof BlogPostParams, value: any) => void;
  onSubmit?: () => void;
  isGenerating?: boolean;
}

const PERSONA_DETAILS: Record<AuthorType, {
  label: string;
  badge: string;
  tone: string;
  focus: string;
  sampleSentence: string;
  color: string;
  activeBorder: string;
}> = {
  owner: {
    label: '원장님 시술일지',
    badge: '전문성 · 1:1 맞춤',
    tone: '친절하고 전문적인 1인칭 원장님 어조',
    focus: '손톱 상태 1:1 진단, 손상 없는 꼼꼼 케어, 5주 이상 튼튼한 오버레이 유지력',
    sampleSentence: '"바디가 짧고 잘 찢어지는 손톱으로 고민이셨던 고객님! 아프지 않은 드릴케어로 라인을 정돈하고 맞춤 아몬드 쉐입으로 자연스럽게 교정해 드렸어요 💅"',
    color: 'from-pink-500/20 to-rose-500/10 text-pink-300',
    activeBorder: 'border-pink-500 bg-pink-500/15',
  },
  customer: {
    label: '내돈내산 찐후기',
    badge: '고객 공감 · 리얼 리뷰',
    tone: '감탄과 만족이 넘치는 솔직한 고객 어조',
    focus: '편안한 샵 분위기, 아프지 않은 케어, 실물 깡패 아트 퀄리티, 파츠 걸림 없는 마감',
    sampleSentence: '"손톱이 너무 얇아져서 젤 쉴까 하다가 인스타 보고 찾아간 곳인데.. 유지력 실화인가요?! 케어도 너무 꼼꼼하고 실물이 백배 영롱해요 💖"',
    color: 'from-purple-500/20 to-pink-500/10 text-purple-300',
    activeBorder: 'border-purple-500 bg-purple-500/15',
  },
  reviewer: {
    label: '뷰티 에디터 / 매체',
    badge: '정보 전달 · 분석형',
    tone: '신뢰감 있는 깔끔한 3인칭 정보 안내 어조',
    focus: '역세권 접근성, 첫방문 할인 혜택, 위생 관리 시스템, 단계별 시술 완성도',
    sampleSentence: '"역세권 도보 3분 거리의 1:1 맞춤 네일 전문샵! 합리적인 첫방문 이벤트 혜택부터 위생적인 프리미엄 케어 과정까지 핵심 포인트를 총정리해 드립니다 ✨"',
    color: 'from-blue-500/20 to-cyan-500/10 text-blue-300',
    activeBorder: 'border-blue-500 bg-blue-500/15',
  },
};

export const InputSection: React.FC<InputSectionProps> = ({ 
  params,
  onChange,
  onSubmit,
  isGenerating
}) => {
  const currentAuthorType: AuthorType = params.authorType || 'owner';
  const currentPersona = PERSONA_DETAILS[currentAuthorType];

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-white/10 overflow-y-auto text-slate-300 shadow-2xl">
      <div className="p-5 space-y-4 flex-1">
        {/* Author Perspective Selection with Tone Previews */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-pink-400" /> 원고 작성 시점 (화자 선택)
            </label>
            <span className="text-[10px] text-slate-400">클릭 시 톤 & 예시 확인</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(PERSONA_DETAILS) as AuthorType[]).map((typeKey) => {
              const p = PERSONA_DETAILS[typeKey];
              const isSelected = currentAuthorType === typeKey;
              return (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => onChange('authorType', typeKey)}
                  className={`p-2.5 rounded-xl text-left border transition-all relative ${
                    isSelected 
                      ? `${p.activeBorder} text-white shadow-md` 
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold truncate">{p.label}</div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-pink-400 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">{p.badge}</div>
                </button>
              );
            })}
          </div>

          {/* Persona Detail & Example Sentence Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 text-[10px] font-bold border border-pink-500/30">
                {currentPersona.label} 톤앤매너
              </span>
              <span className="text-[11px] text-slate-300 font-medium">
                {currentPersona.tone}
              </span>
            </div>
            
            <div className="bg-slate-950/80 rounded-lg p-2.5 border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                <MessageSquare className="w-3 h-3 text-pink-400" />
                <span>원고 도입부 예시 문장</span>
              </div>
              <p className="text-xs text-slate-200 italic leading-relaxed pl-1">
                {currentPersona.sampleSentence}
              </p>
            </div>
          </div>
        </div>

        {/* Shop Info Group */}
        <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-pink-400" /> 샵 이름
            </label>
            <input
              type="text"
              placeholder="예: 르네일, 네일블랑"
              value={params.shopName || ''}
              onChange={(e) => onChange('shopName', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/60 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-pink-400" /> 역세권 / 위치
            </label>
            <input
              type="text"
              placeholder="예: 강남역 11번 출구 도보 3분"
              value={params.location || ''}
              onChange={(e) => onChange('location', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700/60 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>

        {/* Main Keyword */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-pink-400" /> 대표 검색 키워드 (필수)
            </span>
            <span className="text-[10px] text-pink-400 font-normal">검색 노출 핵심 타겟</span>
          </label>
          <input
            type="text"
            placeholder="예: 강남역 네일샵, 봄 이달의아트, 웨딩네일"
            value={params.mainKeyword}
            onChange={(e) => onChange('mainKeyword', e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700/70 rounded-xl focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-white outline-none transition-all placeholder:text-slate-600 shadow-inner"
          />
        </div>

        {/* Sub Keywords */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-purple-400" /> 세부 연관 키워드 (쉼표 구분)
            </span>
            <span className="text-[10px] text-slate-500">선택 사항</span>
          </label>
          <input
            type="text"
            placeholder="예: 5주유지력, 드릴케어, 오버레이 보강, 자석젤"
            value={params.subKeywords}
            onChange={(e) => onChange('subKeywords', e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-700/70 rounded-xl focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 text-white outline-none transition-all placeholder:text-slate-600 shadow-inner"
          />
        </div>

        {/* Event & Offer */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-amber-400" /> 이벤트 / 가격 혜택 / 예약 안내 (선택)
          </label>
          <input
            type="text"
            placeholder="예: 첫방문 20% 할인, 타샵 쏙오프 무료, 네이버 예약 가능"
            value={params.priceOrOffer || ''}
            onChange={(e) => onChange('priceOrOffer', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700/60 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Draft / Custom Story Notes */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-pink-400" /> 시술 상세 스토리 & 메모 (선택)
            </label>
            <span className="text-[10px] text-slate-500">손톱 고민, 쉐입, 디자인 등 자유 기재</span>
          </div>
          <textarea
            placeholder="예: 얇아서 찢어지는 손톱이라 오버레이 보강 후 아몬드 쉐입 교정. 봄 신상 자석젤에 물방울 파츠 포인트. 5주 동안 들뜸 없이 유지되도록 꼼꼼 시술."
            value={params.draft}
            onChange={(e) => onChange('draft', e.target.value)}
            className="w-full h-24 px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-700/60 rounded-xl focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 text-white outline-none transition-all placeholder:text-slate-600 shadow-inner resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Sticky Bottom Action Button for Left Form */}
      {onSubmit && (
        <div className="sticky bottom-0 p-4 bg-slate-950/95 backdrop-blur-md border-t border-white/10 mt-auto">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isGenerating || !params.mainKeyword}
            className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? '원고 생성 진행 중...' : '마케팅 맞춤 원고 생성하기'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
