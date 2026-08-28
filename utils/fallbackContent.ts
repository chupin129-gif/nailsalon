import { BlogPostParams, GeneratedBlog, Platform, SeoTrend } from '../types';

export function createFallbackBlogContent(
  params: BlogPostParams,
  seoTrend?: SeoTrend,
  platform: Platform = 'naver'
): GeneratedBlog {
  const shopName = params.shopName?.trim() || '우리 샵';
  const location = params.location?.trim() || '역세권 위치';
  const category = params.category?.trim() || '이달의 아트';
  const mainKeyword = params.mainKeyword.trim();
  const subKeyword = params.subKeywords?.split(',')[0]?.trim() || '네일맛집';
  const subKeywordsList = params.subKeywords ? params.subKeywords.split(',').map(k => k.trim()).filter(Boolean) : [];
  const priceOrOffer = params.priceOrOffer?.trim() || '첫방문 20% 할인 & 젤제거 무료 이벤트';
  const callToAction = params.callToAction?.trim() || '네이버 예약 및 1:1 상담';
  const draftStory = params.draft?.trim() || '손톱 손상 없이 꼼꼼한 드릴케어와 5주 이상 유지력의 오버레이 시술';
  const authorType = params.authorType || 'owner';

  // Base hashtags
  const defaultTags = [
    `#${mainKeyword.replace(/\s+/g, '')}`,
    `#${subKeyword.replace(/\s+/g, '')}`,
    '#네일아트',
    '#젤네일',
    '#이달의아트',
    '#유지력좋은네일샵',
    '#드릴케어',
    '#오버레이네일',
    '#1대1맞춤케어',
    '#네일맛집',
    '#꼼꼼한시술',
    '#가을네일',
    '#웨딩네일',
    '#자석젤',
    '#그라데이션네일',
    '#네일추천',
  ];
  subKeywordsList.forEach(k => {
    const tag = `#${k.replace(/\s+/g, '')}`;
    if (!defaultTags.includes(tag)) defaultTags.push(tag);
  });

  const photoGuide = [
    '1장 (썸네일): 자연광 아래 전체 네일 아트 45도 손끝 클로즈업 (디테일과 영롱한 광택 부각)',
    '2장 (오버레이): 굴곡 없는 매끈한 하이포인트 C커브 입체 단면 (5주 유지력의 핵심)',
    '3장 (케어/디테일): 손상 없이 정돈된 루즈스킨 큐티클 라인 및 파츠 마감 줌인',
    '4장 (무빙/릴스): 각도에 따라 영롱하게 빛나는 자석젤/글리터 3초 영상',
  ];

  const ctaTemplate = `⭐ [${shopName} 예약 및 안내] ⭐
📍 위치: ${location}
🎁 이벤트: ${priceOrOffer}
🔗 간편 예약: ${callToAction}

💡 1인 맞춤 케어 특성상 100% 예약제로 운영되니 여유 있게 문의주세요 :)`;

  // Naver Blog
  if (platform === 'naver') {
    let titles = {
      standard: `${mainKeyword}, 1회 방문만으로 손톱 교정과 유지력까지 잡은 ${category} 후기!`,
      emotional: `손톱 관리 고민이셨죠? ${mainKeyword}에서 찾은 꼼꼼한 1:1 맞춤 케어의 감동`,
      clickbait: `단 한 번 방문으로 인생 네일샵 등극? ${mainKeyword} ${subKeyword} 비포&애프터 솔직 공개!`,
    };

    let content = '';
    if (authorType === 'owner') {
      content = `안녕하세요, 고객님의 손톱 건강과 아름다움을 최우선으로 생각하는 ${shopName} 원장입니다. 😊

오늘은 ${draftStory} 이야기를 들려드리려 해요. 평소 손톱 관리에 고민이 많으셨던 고객님께서 ${mainKeyword} 검색 후 믿고 찾아주셨는데요. 

한 번의 시술만으로도 눈에 띄게 달라진 비포&애프터를 경험하시고 너무나 기뻐하셨던 순간을 기록해봅니다.

[📸 사진: 시술 전 손톱 상태 컷]

처음 샵에 들어오셨을 때 손톱 상태를 꼼꼼히 진단해 드렸습니다.
손톱 주변의 굳은살과 불규칙한 큐티클 라인 때문에 전체적인 쉐입의 균형이 무너져 있었어요. 손톱 바디가 얇아 쉽게 찢어질까 봐 늘 불안하셨다고 하셨는데요.

저희 ${shopName}에서는 무리하게 잘라내기만 하는 시술 대신, 자극을 최소화하는 저자극 프리미엄 드릴케어로 루즈스킨만을 부드럽게 정돈해 드렸습니다.

[📸 사진: 드릴 케어 및 쉐입 정돈 컷]

드릴 케어가 끝난 뒤 고객님의 손가락 길이와 손톱 바디 비율에 가장 이상적인 맞춤 쉐입을 잡아드렸어요.
밋밋하고 거칠었던 손톱 라인이 반듯하게 정돈되는 과정만으로도 고객님께서 연신 감탄하셨답니다.

여기에 ${mainKeyword}만의 자랑인 탄탄한 굴곡 보강 오버레이 시술이 들어갔습니다. 손톱 중앙의 하이포인트를 완벽한 C커브로 살려주어, 일상생활에서도 들뜸이나 꺾임 없이 5주 이상 튼튼하게 유지되도록 설계했어요.

[📸 사진: 컬러 및 파츠 디테일 컷]

이어서 고객님의 피부 톤에 자연스럽게 녹아드는 ${category} 컬러를 섬세하게 레이어링했습니다.
파츠 역시 머리카락 걸림이나 탈락이 전혀 없도록 특수 빌더젤로 꼼꼼하게 실링 처리해 드렸어요. 많은 분들이 저희를 ${subKeyword}이라고 불러주시는 이유가 바로 이런 한 끗 차이의 디테일 덕분이죠.

[✨ 3초 실물 광택 움짤]

완성된 손톱의 영롱한 실물 광택 보이시나요?
조명 아래서뿐만 아니라 자연광에서도 매끈한 유리알 광택이 그대로 살아있습니다. 시술이 끝나고 손을 거울에 비춰보시며 활짝 웃으시던 고객님의 모습에 저 역시 큰 보람을 느꼈습니다.

[📸 사진: 영롱한 완성 자연광 컷]

손톱이 얇거나 손상이 걱정되셨던 분들도 안심하고 시술받으실 수 있도록 언제나 1:1 맞춤 진심 케어를 약속드립니다. 건강하고 오래가는 네일을 경험하고 싶으시다면 언제든 편하게 문의주세요!

[📍 지도: ${shopName} (${location})]`;
    } else {
      content = `손톱이 워낙 얇고 관리가 잘 안 돼서 스트레스받다가, 지인 추천이랑 ${mainKeyword} 검색으로 알게 된 ${shopName}에 다녀왔어요! 솔직하게 남겨보는 내돈내산 찐후기 시작합니다. ✨

[📸 사진: 시술 전 손톱 상태 컷]

원래 제 손톱 상태는 큐티클도 지저분하고 쉐입도 제각각이라 손을 내밀 때마다 신경 쓰였는데요. 
원장님께서 제 손톱 상태를 보시더니 문제점을 딱 짚어주시고, 아프지 않게 드릴케어로 한 땀 한 땀 정돈해 주셨어요.

[📸 사진: 드릴 케어 및 쉐입 정돈 컷]

케어만 받았는데도 손가락이 길어 보이고 손톱 모양이 너무 단정해져서 1차 감동!
무엇보다 손톱 표면의 굴곡을 완벽하게 채워주는 오버레이를 얹어주시는데 두께감도 딱 적당하고 탄탄해서 손톱이 단단해진 게 바로 느껴졌어요. 왜 여기가 ${subKeyword}으로 유명한지 바로 알겠더라고요.

[📸 사진: 컬러 및 파츠 디테일 컷]

이번에 선택한 ${category}도 제 손가락 톤에 찰떡으로 맞춰주셨고, 반짝이는 파츠도 걸림 없이 매끈하게 마감해주셔서 일상생활할 때 정말 편해요!

[✨ 3초 실물 광택 움짤]

실물 광택감이 진짜 미쳤습니다... 사진에 다 안 담기는 게 아쉬울 정도예요. 움직일 때마다 각도에 따라 반짝이는 게 너무 예뻐서 하루 종일 손톱만 쳐다보고 있어요. 🥰

[📸 사진: 영롱한 완성 자연광 컷]

한 번 방문으로 이렇게 인생 손톱 만들어주셔서 완전 단골 예약입니다! ${priceOrOffer}도 진행 중이니 손톱 고민 있으신 분들은 꼭 가보세요!

[📍 지도: ${shopName} (${location})]`;
    }

    return {
      titles,
      content,
      hashtags: defaultTags,
      seoStrategy: `'${mainKeyword}' 및 '${subKeyword}' 키워드를 본문 문맥과 사진 캡션에 고르게 분산 배치하고, 실제 1:1 시술 과정 비포&애프터를 상세히 묘사하여 체류시간을 극대화했습니다.`,
      nailTip: `젤 시술 후 큐티클 오일을 하루 1~2회 꾸준히 발라주시면 유수분 밸런스가 유지되어 5주 이상 들뜸 없이 튼튼하게 유지됩니다.`,
      instagramPhotoGuide: photoGuide,
      ctaTemplate,
    };
  }

  // Instagram
  if (platform === 'instagram') {
    const titles = {
      standard: `${mainKeyword} | 5주 유지력 보장 1:1 맞춤 ${category} ✨`,
      emotional: `손끝에 감성을 담다 🌸 ${mainKeyword} ${shopName}`,
      clickbait: `이게 정말 1회 관리 전후 맞나요? 😲 역대급 비포&애프터`,
    };

    const content = `한 번의 터치로 완성되는 완벽한 손끝 라인 ✨

${draftStory}

손톱 고민으로 방문해주신 고객님께
자극 없는 프리미엄 드릴케어 & 굴곡 보강 오버레이로
매끈한 유리알 광택을 선물해 드렸어요 🤍

✔ 5주 이상 끄떡없는 탄탄한 유지력
✔ 손톱 손상 최소화 1:1 맞춤 케어
✔ 파츠 걸림 없는 꼼꼼한 마감

🎁 ${priceOrOffer}
📍 ${location} (${shopName})
💌 예약 및 문의: 프로필 상단 링크 (${callToAction})`;

    return {
      titles,
      content,
      hashtags: defaultTags,
      seoStrategy: '핵심 키워드를 상단 3줄에 배치하고, 저장 및 공유를 유도하는 혜택 정보와 릴스 무빙 가이드를 적용했습니다.',
      nailTip: '손톱깎이 사용을 자제하고 네일 파일로 부드럽게 길이 조절을 해주시면 리프팅을 방지할 수 있습니다.',
      instagramPhotoGuide: photoGuide,
      ctaTemplate,
    };
  }

  // Threads
  if (platform === 'threads') {
    const titles = {
      standard: `${mainKeyword} 원장님이 직접 털어놓는 네일 유지력의 비밀`,
      emotional: `오늘 손톱 관리받고 울컥하셨다는 고객님 이야기`,
      clickbait: `아직도 네일 2주 만에 떨어지시나요? 딱 1분만 읽어보세요.`,
    };

    const content = `네일샵 유목민 분들이 가장 많이 하시는 말씀이 있어요.
"원장님, 저는 손톱이 얇아서 2주만 지나면 젤이 다 떠요 ㅠㅠ"

오늘 오신 고객님도 ${draftStory} 상황이셨는데요.
원인은 손톱 탓이 아니라 '케어와 오버레이 설계'에 있습니다.

무리한 큐티클 제거 대신 드릴케어로 숨은 루즈스킨만 걷어내고,
손톱 중심의 하이포인트를 맞춰주는 오버레이를 제대로 얹으면
손톱이 얇아도 5주 동안 끄떡없이 유지됩니다.

시술 끝나고 "내 손톱이 이렇게 튼튼해질 수 있었냐"며 활짝 웃으시는데 제가 다 뭉클했네요. 😊

위치는 ${location}, 현재 ${priceOrOffer} 중이니
손톱 고민 있으신 분들은 편하게 댓글이나 DM 남겨주세요!`;

    return {
      titles,
      content,
      hashtags: defaultTags.slice(0, 10),
      seoStrategy: '공감형 스토리텔링과 Q&A 형식을 적용하여 스레드 알고리즘의 댓글 및 리포스트 유입을 유도했습니다.',
      nailTip: '뜨거운 온수 샤워 직후 손톱에 강한 충격을 주지 않도록 주의해주세요.',
      instagramPhotoGuide: photoGuide,
      ctaTemplate,
    };
  }

  // Daangn
  if (platform === 'daangn') {
    const titles = {
      standard: `[우리동네 네일맛집] ${location} ${shopName} 첫방문 혜택 안내 💅`,
      emotional: `동네 이웃분들의 손톱 건강을 책임지는 ${shopName}입니다 😊`,
      clickbait: `우리 동네에 이런 꼼꼼한 네일샵이? 5주 유지력 젤네일 체험해보세요!`,
    };

    const content = `안녕하세요 이웃님들!
${location}에 위치한 1인 맞춤 네일 전문샵 ${shopName}입니다. 🌸

손톱이 얇아 쉽게 찢어지거나, 큐티클 정돈이 어려워 고민이셨던 동네 이웃분들을 위해
정성 가득한 드릴케어와 탄탄한 오버레이 시술을 준비했습니다.

[이런 분들께 추천드려요!]
✔ 손톱이 얇아 젤이 금방 뜨시는 분
✔ 아프지 않고 꼼꼼한 드릴케어를 원하시는 분
✔ 머리카락 걸림 없는 완벽한 파츠 마감을 원하시는 분

🎁 당근 이웃 특별 혜택: ${priceOrOffer}
📍 위치: ${location}
📞 문의/예약: 채팅하기 또는 ${callToAction}

따뜻한 차 한 잔과 함께 편안하게 힐링하고 가세요! ☕`;

    return {
      titles,
      content,
      hashtags: defaultTags.slice(0, 8),
      seoStrategy: '지역 기반 동네생활 키워드와 첫방문 혜택을 명시하여 로컬 단골 고객 전환율을 높였습니다.',
      nailTip: '건조한 계절에는 핸드크림을 손톱 끝까지 꼼꼼히 흡수시켜주세요.',
      instagramPhotoGuide: photoGuide,
      ctaTemplate,
    };
  }

  // Blogs / SEO (Wordpress, Tistory, Blogspot)
  const titles = {
    standard: `${mainKeyword} 완벽 가이드: 5주 유지력과 손톱 교정 비결`,
    emotional: `건강한 아름다움의 시작, ${mainKeyword} 1:1 케어 솔루션`,
    clickbait: `${mainKeyword} 실패 없는 네일샵 선택 3가지 기준과 시술 후기`,
  };

  const content = `# ${mainKeyword} 완벽 가이드: 손톱 손상 없는 1:1 맞춤 케어와 5주 유지력

아름다운 네일 아트를 오래도록 건강하게 유지하기 위해서는 올바른 케어와 정교한 오버레이 시술이 필수적입니다. 본 포스팅에서는 ${draftStory} 사례를 통해 전문 네일샵의 체계적인 시술 프로세스를 안내해 드립니다.

## 1. 사전 진단 및 저자극 드릴 케어
- **손톱 상태 분석**: 바디 두께와 큐티클 라인의 불균형 요인을 사전에 정밀 진단합니다.
- **루즈스킨 정돈**: 피부 자극을 최소화하는 프리미엄 드릴 비트를 사용하여 깨끗하고 안전하게 라인을 정돈합니다.

## 2. 하이포인트 굴곡 보강 오버레이
손톱 중심의 C커브 밸런스를 잡아주는 오버레이는 젤의 밀착력을 높이고 생활 충격으로부터 자연 손톱을 보호합니다. 
이는 5주 이상의 뛰어난 유지력을 완성하는 핵심 단계입니다.

## 3. ${category} 디자인 및 꼼꼼한 마감
- 고객의 퍼스널 컬러에 최적화된 조색 및 배색
- 머리카락 걸림 없는 클리어 실링 마감 처리

---
### 📍 샵 정보 및 예약 안내
- **상호명**: ${shopName}
- **위치**: ${location}
- **프로모션**: ${priceOrOffer}
- **예약**: ${callToAction}`;

  return {
    titles,
    content,
    hashtags: defaultTags,
    seoStrategy: 'H2, H3 헤딩 태그 구조화와 검색엔진 E-E-A-T 전문성 가이드라인을 충족하도록 작성되었습니다.',
    nailTip: '손톱 주변 각질을 손으로 뜯지 마시고 전용 오일 펜을 수시로 덧발라주세요.',
    instagramPhotoGuide: photoGuide,
    ctaTemplate,
  };
}
