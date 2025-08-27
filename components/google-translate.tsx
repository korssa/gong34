"use client";

import { useEffect } from 'react';

// Google Translate 타입 정의
interface GoogleTranslateOptions {
  pageLanguage: string;
  layout: string;
  multilanguagePage: boolean;
  autoDisplay: boolean;
}

interface GoogleTranslateElement {
  // Google Translate Element의 기본 구조
  translate?: () => void;
  restore?: () => void;
  getDisplayLanguage?: () => string;
  getOriginalLanguage?: () => string;
  isVisible?: () => boolean;
  showBanner?: () => void;
  hideBanner?: () => void;
  [key: string]: unknown; // 인덱스 시그니처로 모든 속성 허용
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: {
          new (options: GoogleTranslateOptions, element: string): GoogleTranslateElement;
          InlineLayout?: {
            HORIZONTAL?: string;
          };
        };
      };
    };
    adminModeChange?: (enabled: boolean) => void;
  }
}

export function GoogleTranslate() {
  useEffect(() => {
    // Google Translate 스크립트 동적 로드
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.head.appendChild(script);

    // Google Translate 초기화 함수 정의
    window.googleTranslateElementInit = function() {
      // 구글 번역 위젯 초기화 시작
      
      try {
        const targetElement = document.getElementById('google_translate_element');
        if (!targetElement) {
          // google_translate_element를 찾을 수 없습니다
          return;
        }
        
        // 타겟 요소 찾음
        
        if (typeof window.google === 'undefined' || !window.google?.translate) {
          // Google Translate API가 로드되지 않았습니다
          return;
        }
        
        // Google Translate API 확인됨
        
        new window.google!.translate!.TranslateElement!({
          pageLanguage: 'ko',
          layout: window.google!.translate!.TranslateElement!.InlineLayout!.HORIZONTAL!,
          multilanguagePage: true,
          autoDisplay: false
        }, 'google_translate_element');
        
        // 구글 번역 위젯 생성 요청 완료
      } catch {
    // 번역 위젯 생성 실패
      }
    };

  // NOTE: admin mode is no longer checked automatically on load. Admin
  // toggles should be triggered explicitly via window.adminModeChange.

    // 번역기 완전 비활성화 함수
    function disableTranslateWidget() {
      try {
        // 번역기 완전 비활성화 시작
        
        // body에 admin-mode 클래스 추가
        document.body.classList.add('admin-mode');
        
        // 1단계: 번역 상태를 원래 언어로 강제 리셋
        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (combo) {
          try {
            // 현재 번역 상태
            combo.value = '';
            combo.selectedIndex = 0;
            
            const event = new Event('change', { bubbles: true });
            combo.dispatchEvent(event);
            
            // 번역 상태 리셋 완료
          } catch {
            // 번역 리셋 에러
          }
        }
        
        // 2단계: 즉시 모든 Google Translate DOM 요소 완전 제거/숨김
        try {
          const allTranslateElements = document.querySelectorAll([
            '#google_translate_element',
            '.goog-te-gadget',
            '.skiptranslate', 
            '.goog-te-ftab',
            '.goog-te-balloon-frame',
            '.goog-tooltip',
            '.goog-te-spinner-pos',
            '.goog-te-banner-frame',
            '.goog-te-menu-frame',
            '.goog-te-menu2',
            'iframe[src*="translate.googleapis.com"]'
          ].join(','));
          
          // 즉시 제거할 번역 요소 개수
          
          allTranslateElements.forEach(function(el) {
            if (el && el.parentNode) {
              try {
                (el as HTMLElement).style.setProperty('display', 'none', 'important');
                (el as HTMLElement).style.setProperty('visibility', 'hidden', 'important');
                (el as HTMLElement).style.setProperty('opacity', '0', 'important');
                (el as HTMLElement).style.setProperty('pointer-events', 'none', 'important');
                (el as HTMLElement).style.setProperty('position', 'absolute', 'important');
                (el as HTMLElement).style.setProperty('top', '-9999px', 'important');
                (el as HTMLElement).style.setProperty('left', '-9999px', 'important');
                (el as HTMLElement).style.setProperty('width', '0', 'important');
                (el as HTMLElement).style.setProperty('height', '0', 'important');
              } catch {
                // 스타일 설정 실패는 무시
              }
            }
          });
          
          // 번역기 즉시 숨김 완료
        } catch {
          // 번역기 정리 에러
        }
        
        // 3단계: Google Translate API 완전 무력화
        try {
          if (typeof window.google !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window.google as any).translate = {
              TranslateElement: function() {
                // 번역 엔진 차단됨 (관리자 모드)
                return null;
              },
              translate: function() { return null; },
              translatePage: function() { return null; }
            };
          }
          
          window.googleTranslateElementInit = function() {
            // 번역 초기화 차단됨 (관리자 모드)
          };
          
          document.documentElement.lang = 'ko';
          document.documentElement.setAttribute('translate', 'no');
          document.body.setAttribute('translate', 'no');
          
          // Google Translate API 완전 무력화 완료
        } catch {
          // Google Translate API 무력화 에러
        }
        
      } catch {
        // 번역기 비활성화 전체 에러
      }
    }

    // 번역기 안전 활성화 함수  
    function enableTranslateWidget() {
      try {
        // console.log('🟢 번역기 활성화 시작...');
        
        document.body.classList.remove('admin-mode');
        // console.log('🟢 admin-mode 클래스 제거됨');
        
        // 번역 차단 속성 제거
        try {
          document.documentElement.className = document.documentElement.className.replace(' notranslate', '');
          document.documentElement.removeAttribute('translate');
          document.body.className = document.body.className.replace(' notranslate', '');
          document.body.removeAttribute('translate');
          
          const mainContainers = document.querySelectorAll('.notranslate');
          mainContainers.forEach(function(container) {
            try {
              if (!container.textContent || 
                  (!container.textContent.includes('GPT X GONGMYUNG.COM') && 
                   !container.textContent.includes('PRESENT') && 
                   !container.textContent.includes('© 2025 gongmyung.com') &&
                   !container.classList.contains('app-name-fixed') &&
                   !container.classList.contains('app-developer-fixed'))) {
                container.className = container.className.replace(' notranslate', '');
                container.removeAttribute('translate');
              }
            } catch {
              // 개별 제거 실패 무시
            }
          });
          
          // console.log('🟢 번역 차단 속성 제거 완료');
          } catch {
            // 번역 차단 해제 에러
          }
        
        // Google Translate API 복원
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window.google !== 'undefined' && (window.google as any).translate) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window.google as any).translate.TranslateElement;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window.google as any).translate.translate;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (window.google as any).translate.translatePage;
            // console.log('🔄 Google Translate API 복원됨');
          } catch {
            // Google Translate API 복원 에러
          }
        }
        
        // 위젯이 제거되었다면 재생성
        let widget = document.getElementById('google_translate_element');
        if (!widget) {
          // console.log('📱 번역 위젯이 제거됨. 재생성 중...');
          
          const headerWidgetContainer = document.querySelector('header .translate-widget-horizontal');
          if (headerWidgetContainer) {
            headerWidgetContainer.id = 'google_translate_element';
            widget = headerWidgetContainer as HTMLElement;
            // console.log('✅ 위젯 컨테이너 재설정됨');
          }
        }
        
        if (widget) {
          widget.style.display = '';
          widget.style.visibility = '';
          widget.style.opacity = '';
          widget.style.pointerEvents = '';
          widget.style.position = '';
          widget.style.top = '';
          widget.style.left = '';
          widget.style.width = '';
          widget.style.height = '';
          
          // console.log('🟢 위젯 스타일 복원됨');
          
          if (!widget.innerHTML.trim()) {
            // console.log('🔄 빈 위젯 감지. 재초기화 시도...');
            setTimeout(function() {
              if (typeof window.googleTranslateElementInit === 'function') {
                window.googleTranslateElementInit();
              }
            }, 500);
          }
        }
        
        // 안전한 번역 요소들 복원 (피드백 요소 제외)
        setTimeout(function() {
          try {
            const coreTranslateElements = document.querySelectorAll([
              '.goog-te-gadget:not(.goog-te-ftab)',
              '.skiptranslate:not(.goog-te-balloon-frame)'
            ].join(','));
            
            // console.log('🟢 복원할 핵심 번역 요소들:', coreTranslateElements.length);
            
            coreTranslateElements.forEach(function(el) {
              try {
                if (el && document.contains(el)) {
                  (el as HTMLElement).style.display = '';
                  (el as HTMLElement).style.visibility = '';
                  (el as HTMLElement).style.opacity = '';
                  (el as HTMLElement).style.pointerEvents = '';
                }
              } catch {
                  // 개별 복원 실패는 무시
                }
            });
          } catch {
            // 번역 요소 복원 에러
          }
        }, 200);
        
        // console.log('✅ 번역기 활성화 완료 (일반 모드)');
      } catch {
        // 번역기 활성화 전체 에러
      }
    }

    // 관리자 모드 이벤트 핸들러
    function handleAdminModeChange(isAdminMode: boolean) {
      // 관리자 모드 변경 이벤트
      
      if (isAdminMode) {
        // console.log('🚫 관리자 모드 진입 - 즉시 번역 차단');
        disableTranslateWidget();
        
        // Select 컴포넌트 정상 작동 보장
        setTimeout(function() {
          try {
            const selectElements = document.querySelectorAll([
              '[role="combobox"]',
              '[role="listbox"]',
              '[role="option"]',
              '[data-radix-select-content]',
              '[data-radix-select-item]',
              '[data-radix-select-trigger]',
              '[data-radix-select-viewport]',
              'select'
            ].join(','));
            
            selectElements.forEach(function(el) {
              try {
                (el as HTMLElement).style.setProperty('pointer-events', 'auto', 'important');
                (el as HTMLElement).style.setProperty('user-select', 'auto', 'important');
                (el as HTMLElement).style.setProperty('cursor', 'pointer', 'important');
                (el as HTMLElement).style.setProperty('transform', 'none', 'important');
                el.removeAttribute('translate');
                el.className = el.className.replace(' notranslate', '');
              } catch {
                  // 개별 복원 실패 무시
                }
            });
            
            // console.log('✅ Select 컴포넌트', selectElements.length, '개 정상 작동 보장');
          } catch {
            // Select 복원 에러
          }
        }, 100);
        
        // 선택적 번역 차단 속성 설정 (Select 컴포넌트 제외)
        try {
          document.documentElement.setAttribute('translate', 'no');
          document.body.setAttribute('translate', 'no');
          
          const textContainers = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, li, td, th');
          textContainers.forEach(function(container) {
            try {
              if (!container.closest('[role="combobox"]') && 
                  !container.closest('[role="listbox"]') && 
                  !container.closest('[role="option"]') &&
                  !container.closest('[data-radix-select-content]') &&
                  !container.closest('[data-radix-select-item]') &&
                  !container.closest('[data-radix-select-trigger]')) {
                container.className += ' notranslate';
                container.setAttribute('translate', 'no');
              }
            } catch {
              // 개별 설정 실패 무시
            }
          });
          
          // console.log('🚫 선택적 번역 차단 속성 설정 완료 (Select 제외)');
        } catch {
          // 번역 차단 설정 에러
        }
        
        // 번역된 텍스트 즉시 복원
        setTimeout(function() {
          try {
            const translatedElements = document.querySelectorAll([
              'font[color="#444444"]',
              'font[style*="color: rgb(68, 68, 68)"]',
              'font[style*="background-color: rgb(255, 255, 255)"]',
              'span[style*="background-color: rgb(255, 255, 255)"]',
              '*[style*="background-color: rgb(255, 255, 255)"]'
            ].join(','));
            
            if (translatedElements.length > 0) {
              // console.log('🔄 번역된 요소', translatedElements.length, '개 즉시 복원');
              translatedElements.forEach(function(el) {
                try {
                  (el as HTMLElement).style.setProperty('color', '', 'important');
                  (el as HTMLElement).style.setProperty('background-color', '', 'important');
                  (el as HTMLElement).style.setProperty('font-size', '', 'important');
                  (el as HTMLElement).style.setProperty('font-family', '', 'important');
                  el.removeAttribute('color');
                } catch {
                  // 개별 리셋 실패는 무시
                }
              });
            }
          } catch {
            // 텍스트 복원 에러
          }
        }, 50);
        
      } else {
        // console.log('✅ 일반 모드 진입 - 번역 활성화');
        enableTranslateWidget();
      }
    }

    // 전역 이벤트 리스너 등록
    window.adminModeChange = handleAdminModeChange;

    // 언어 매핑 및 피드백 차단 함수
    function startLanguageMapping() {
      try {
        const languageMap: { [key: string]: string } = {
          'Korean': 'Korea - 한국어',
          'English': 'USA - English',
          'Spanish': 'Spain - Español',
          'French': 'France - Français',
          'German': 'Germany - Deutsch',
          'Italian': 'Italy - Italiano',
          'Portuguese': 'Portugal - Português',
          'Russian': 'Russia - Русский',
          'Japanese': 'Japan - 日本語',
          'Chinese (Simplified)': 'China - 中文(简体)',
          'Chinese (Traditional)': 'Taiwan - 中文(繁體)',
          'Arabic': 'Saudi Arabia - العربية',
          'Hindi': 'India - हिन्दी',
          'Turkish': 'Turkey - Türkçe',
          'Dutch': 'Netherlands - Nederlands',
          'Polish': 'Poland - Polski',
          'Swedish': 'Sweden - Svenska',
          'Norwegian': 'Norway - Norsk',
          'Danish': 'Denmark - Dansk',
          'Finnish': 'Finland - Suomi',
          'Greek': 'Greece - Ελληνικά',
          'Czech': 'Czech Republic - Čeština',
          'Hungarian': 'Hungary - Magyar',
          'Romanian': 'Romania - Română',
          'Bulgarian': 'Bulgaria - Български',
          'Croatian': 'Croatia - Hrvatski',
          'Slovak': 'Slovakia - Slovenčina',
          'Slovenian': 'Slovenia - Slovenščina',
          'Estonian': 'Estonia - Eesti',
          'Latvian': 'Latvia - Latviešu',
          'Lithuanian': 'Lithuania - Lietuvių',
          'Ukrainian': 'Ukraine - Українська',
          'Vietnamese': 'Vietnam - Tiếng Việt',
          'Thai': 'Thailand - ไทย',
          'Indonesian': 'Indonesia - Bahasa Indonesia',
          'Malay': 'Malaysia - Bahasa Melayu',
          'Filipino': 'Philippines - Filipino',
          'Hebrew': 'Israel - עברית',
          'Persian': 'Iran - فارسی',
          'Urdu': 'Pakistan - اردو',
          'Bengali': 'Bangladesh - বাংলা',
          'Tamil': 'Tamil Nadu - தமிழ்',
          'Telugu': 'Andhra Pradesh - తెలుగు',
          'Gujarati': 'Gujarat - ગુજરાતી',
          'Kannada': 'Karnataka - ಕನ್ನಡ',
          'Malayalam': 'Kerala - മലയാളം',
          'Marathi': 'Maharashtra - मराठी',
          'Punjabi': 'Punjab - ਪੰਜਾਬੀ',
          'Nepali': 'Nepal - नेपाली',
          'Sinhala': 'Sri Lanka - සිංහල',
          'Myanmar (Burmese)': 'Myanmar - မြန်မာ',
          'Khmer': 'Cambodia - ខ្មែរ',
          'Lao': 'Laos - ລາວ',
          'Georgian': 'Georgia - ქართული',
          'Armenian': 'Armenia - Հայերեն',
          'Azerbaijani': 'Azerbaijan - Azərbaycan',
          'Kazakh': 'Kazakhstan - Қазақ',
          'Kyrgyz': 'Kyrgyzstan - Кыргыз',
          'Tajik': 'Tajikistan - Тоҷикӣ',
          'Turkmen': 'Turkmenistan - Türkmen',
          'Uzbek': 'Uzbekistan - O\'zbek',
          'Mongolian': 'Mongolia - Монгол',
          'Albanian': 'Albania - Shqip',
          'Basque': 'Basque Country - Euskera',
          'Catalan': 'Catalonia - Català',
          'Galician': 'Galicia - Galego',
          'Icelandic': 'Iceland - Íslenska',
          'Irish': 'Ireland - Gaeilge',
          'Welsh': 'Wales - Cymraeg',
          'Maltese': 'Malta - Malti',
          'Afrikaans': 'South Africa - Afrikaans',
          'Swahili': 'Kenya - Kiswahili',
          'Yoruba': 'Nigeria - Yorùbá',
          'Zulu': 'South Africa - isiZulu',
          'Xhosa': 'South Africa - isiXhosa',
          'Amharic': 'Ethiopia - አማርኛ',
          'Hausa': 'Nigeria - Hausa',
          'Igbo': 'Nigeria - Igbo',
          'Somali': 'Somalia - Soomaali',
          'Malagasy': 'Madagascar - Malagasy'
        };
        
        // 안전한 피드백 차단 함수
        function hideFeedbackElements() {
          try {
            const feedbackSelectors = [
              '.goog-te-balloon-frame',
              '.goog-te-ftab',
              '.goog-te-ftab-float',
              '.goog-tooltip',
              '.goog-tooltip-popup',
              '.goog-te-banner-frame',
              '.goog-te-spinner-pos'
            ];
            
            feedbackSelectors.forEach(function(selector) {
              try {
                document.querySelectorAll(selector).forEach(function(el) {
                  if (el && document.contains(el)) {
                    (el as HTMLElement).style.display = 'none';
                    (el as HTMLElement).style.visibility = 'hidden';
                    (el as HTMLElement).style.opacity = '0';
                  }
                });
              } catch {
                // 개별 선택자 에러 무시
              }
            });
          } catch {
            // 전체 함수 에러 무시
          }
        }
        
        // 언어 옵션 업데이트
        function updateLanguageOptions() {
          try {
            const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            if (combo && combo.options) {
              Array.from(combo.options).forEach(function(option) {
                const text = option.text;
                if (text && languageMap[text] && !(option as HTMLOptionElement).dataset.updated) {
                  option.text = languageMap[text];
                  (option as HTMLOptionElement).dataset.updated = 'true';
                }
              });
            }
          } catch {
            // 에러 무시
          }
        }
        
        // 초기 업데이트
        setTimeout(() => {
          updateLanguageOptions();
          hideFeedbackElements();
        }, 1000);
        
        // 주기적 피드백 차단
        setInterval(hideFeedbackElements, 2000);
        
        // 클릭 이벤트 시 피드백 차단
        document.addEventListener('click', function(e) {
          if (e.target && (e.target as Element).closest('.goog-te-combo, .goog-te-menu2')) {
            setTimeout(hideFeedbackElements, 200);
          }
        });
        
          } catch {
        // 언어 매핑 에러
      }
    }

    // 페이지 로드 후 위젯 확인 및 언어 매핑 시작
    window.addEventListener('load', function() {
      // NOTE: Do NOT auto-toggle admin mode on page load from localStorage.
      // Previously we called isAdminMode() here and automatically disabled
      // the translate widget for persisted admin sessions. That allowed
      // admin UI to appear for regular users if admin-storage persisted.
      // Now, we only register the handler and start language mapping; actual
      // admin toggles happen only via explicit calls to window.adminModeChange().

      setTimeout(function() {
        const combo = document.querySelector('.goog-te-combo');
        if (combo && (combo as HTMLSelectElement).options && (combo as HTMLSelectElement).options.length > 1) {
          startLanguageMapping();
          // ensure translate widget is ready (do not force admin behavior)
          enableTranslateWidget();
        } else {
          setTimeout(arguments.callee, 3000);
        }
      }, 2000);
    });

    return () => {
      // 클린업: 스크립트 제거
      const existingScript = document.querySelector('script[src*="translate.google.com"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
}
