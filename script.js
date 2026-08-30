/* ==========================================================================
   ויקטוריה גרמן – דיאטנית קלינית · סקריפט האתר
   תפריט נגישות · ניווט · חשיפה בגלילה · מודאל מתכונים
   ========================================================================== */
(function () {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

    /* ---------- הודעות לקוראי מסך ---------- */
    let liveRegion = null;
    function announce(message) {
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('role', 'status');
            liveRegion.setAttribute('aria-live', 'polite');
            document.body.appendChild(liveRegion);
        }
        liveRegion.textContent = '';
        window.setTimeout(() => { liveRegion.textContent = message; }, 50);
    }

    /* ---------- תפריט נגישות ---------- */
    (function accessibilityMenu() {
        const toggle = $('#a11y-toggle');
        const panel = $('#a11y-panel');
        if (!toggle || !panel) return;

        const root = document.documentElement;
        const STORAGE_KEY = 'nourish-a11y';
        const state = { fontScale: 1, highContrast: false, underlineLinks: false };

        function apply() {
            root.style.setProperty('--font-size-scale', state.fontScale.toFixed(2));
            document.body.classList.toggle('high-contrast', state.highContrast);
            document.body.classList.toggle('underline-links', state.underlineLinks);
            const hc = $('[data-action="high-contrast"]', panel);
            const ul = $('[data-action="underline-links"]', panel);
            if (hc) hc.setAttribute('aria-pressed', String(state.highContrast));
            if (ul) ul.setAttribute('aria-pressed', String(state.underlineLinks));
        }

        function save() {
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* אחסון לא זמין */ }
        }

        function load() {
            try {
                const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
                if (saved && typeof saved === 'object') {
                    state.fontScale = Math.min(1.5, Math.max(0.8, Number(saved.fontScale) || 1));
                    state.highContrast = Boolean(saved.highContrast);
                    state.underlineLinks = Boolean(saved.underlineLinks);
                }
            } catch (e) { /* התעלמות מנתונים פגומים */ }
            apply();
        }

        function setOpen(open) {
            panel.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            if (open) {
                const first = $('.a11y-btn', panel);
                if (first) first.focus();
            }
        }

        toggle.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));

        document.addEventListener('click', (e) => {
            if (!e.target.closest('#a11y') && panel.classList.contains('is-open')) setOpen(false);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panel.classList.contains('is-open')) {
                setOpen(false);
                toggle.focus();
            }
        });

        panel.addEventListener('click', (e) => {
            const btn = e.target.closest('.a11y-btn');
            if (!btn) return;
            switch (btn.dataset.action) {
                case 'increase-font':
                    if (state.fontScale < 1.5) { state.fontScale = Math.round((state.fontScale + 0.1) * 10) / 10; announce('הטקסט הוגדל'); }
                    else announce('הגעת לגודל הטקסט המקסימלי');
                    break;
                case 'decrease-font':
                    if (state.fontScale > 0.8) { state.fontScale = Math.round((state.fontScale - 0.1) * 10) / 10; announce('הטקסט הוקטן'); }
                    else announce('הגעת לגודל הטקסט המינימלי');
                    break;
                case 'high-contrast':
                    state.highContrast = !state.highContrast;
                    announce(state.highContrast ? 'ניגודיות גבוהה הופעלה' : 'ניגודיות גבוהה בוטלה');
                    break;
                case 'underline-links':
                    state.underlineLinks = !state.underlineLinks;
                    announce(state.underlineLinks ? 'הדגשת קישורים הופעלה' : 'הדגשת קישורים בוטלה');
                    break;
                case 'reset':
                    state.fontScale = 1; state.highContrast = false; state.underlineLinks = false;
                    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* noop */ }
                    apply();
                    announce('הגדרות הנגישות אופסו');
                    return;
                default:
                    return;
            }
            apply();
            save();
        });

        load();
    })();

    /* ---------- ניווט ראשי ---------- */
    (function navigation() {
        const toggle = $('.nav-toggle');
        const nav = $('#site-nav');
        if (!toggle || !nav) return;

        function setOpen(open) {
            nav.classList.toggle('is-open', open);
            document.body.classList.toggle('nav-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'סגירת תפריט' : 'פתיחת תפריט');
        }

        toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));

        nav.addEventListener('click', (e) => {
            if (e.target.closest('a')) setOpen(false);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('is-open')) {
                setOpen(false);
                toggle.focus();
            }
        });

        document.addEventListener('click', (e) => {
            if (nav.classList.contains('is-open') && !e.target.closest('.site-header')) setOpen(false);
        });

        // סגירה אוטומטית כשעוברים לדסקטופ
        const mq = window.matchMedia('(min-width: 1024px)');
        const onChange = () => { if (mq.matches) setOpen(false); };
        if (mq.addEventListener) mq.addEventListener('change', onChange);
        else mq.addListener(onChange);
    })();

    /* ---------- סימון הסקשן הנוכחי בתפריט (דף הבית) ---------- */
    (function scrollSpy() {
        const links = $$('.nav-list a[data-spy]');
        if (!links.length || !('IntersectionObserver' in window)) return;

        const map = new Map();
        links.forEach((link) => {
            const section = document.getElementById(link.dataset.spy);
            if (section) map.set(section, link);
        });
        if (!map.size) return;

        let current = null;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const link = map.get(entry.target);
                if (link === current) return;
                links.forEach((l) => l.removeAttribute('aria-current'));
                link.setAttribute('aria-current', 'true');
                current = link;
            });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

        map.forEach((_, section) => observer.observe(section));

        // מעל ה-hero: אין סקשן פעיל
        window.addEventListener('scroll', () => {
            if (window.scrollY < 120 && current) {
                current.removeAttribute('aria-current');
                current = null;
            }
        }, { passive: true });
    })();

    /* ---------- חשיפה בגלילה ---------- */
    (function reveal() {
        const items = $$('.reveal');
        if (!items.length) return;
        if (reduceMotion || !('IntersectionObserver' in window)) {
            items.forEach((el) => el.classList.add('is-visible'));
            return;
        }
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        items.forEach((el) => observer.observe(el));
    })();

    /* ---------- מודאל מתכונים ---------- */
    (function recipes() {
        const modal = $('#recipe-modal');
        const cards = $$('.recipe-card[data-recipe]');
        if (!modal || !cards.length) return;

        const body = $('#modal-body', modal);
        const closeBtn = $('.modal-close', modal);
        const overlay = $('.modal-overlay', modal);
        const dialog = $('.modal-dialog', modal);
        let lastFocused = null;

        const ICON = {
            clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
            users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
            gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15l3.5-3.5"/><path d="M20.3 18a9 9 0 1 0-16.6 0"/></svg>'
        };

        const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

        function render(recipe) {
            const list = (items) => items.map((i) => `<li>${escapeHtml(i)}</li>`).join('');
            const n = recipe.nutrition;
            return `
                <div class="modal-head">
                    <h2 id="modal-title">${escapeHtml(recipe.title)}</h2>
                    <div class="modal-meta">
                        <span>${ICON.clock}<span>${escapeHtml(recipe.time)}</span></span>
                        <span>${ICON.users}<span>${escapeHtml(recipe.servings)}</span></span>
                        <span>${ICON.gauge}<span>רמת קושי: ${escapeHtml(recipe.difficulty)}</span></span>
                    </div>
                </div>
                <p class="modal-intro">${escapeHtml(recipe.intro)}</p>
                <section class="modal-section" aria-labelledby="modal-ingredients">
                    <h3 id="modal-ingredients">מצרכים</h3>
                    <ul class="ingredients">${list(recipe.ingredients)}</ul>
                </section>
                <section class="modal-section" aria-labelledby="modal-steps">
                    <h3 id="modal-steps">אופן ההכנה</h3>
                    <ol class="instructions">${list(recipe.instructions)}</ol>
                </section>
                <section class="nutrition" aria-labelledby="modal-nutrition">
                    <h3 id="modal-nutrition">ערכים תזונתיים למנה</h3>
                    <div class="nutrition-grid">
                        <div class="nutrition-item"><span class="nutrition-value">${escapeHtml(n.calories)}</span><span class="nutrition-label">קלוריות</span></div>
                        <div class="nutrition-item"><span class="nutrition-value">${escapeHtml(n.protein)}</span><span class="nutrition-label">חלבון</span></div>
                        <div class="nutrition-item"><span class="nutrition-value">${escapeHtml(n.carbs)}</span><span class="nutrition-label">פחמימות</span></div>
                        <div class="nutrition-item"><span class="nutrition-value">${escapeHtml(n.fat)}</span><span class="nutrition-label">שומן</span></div>
                        <div class="nutrition-item"><span class="nutrition-value">${escapeHtml(n.fiber)}</span><span class="nutrition-label">סיבים</span></div>
                    </div>
                </section>`;
        }

        function open(id) {
            const recipe = RECIPES[id];
            if (!recipe) return;
            lastFocused = document.activeElement;
            body.innerHTML = render(recipe);
            modal.classList.add('is-open');
            modal.removeAttribute('aria-hidden');
            document.body.style.overflow = 'hidden';
            dialog.scrollTop = 0;
            closeBtn.focus();
        }

        function close() {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
        }

        cards.forEach((card) => {
            const btn = $('.recipe-cta', card);
            if (btn) btn.addEventListener('click', () => open(card.dataset.recipe));
        });
        closeBtn.addEventListener('click', close);
        overlay.addEventListener('click', close);

        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('is-open')) return;
            if (e.key === 'Escape') { close(); return; }
            if (e.key === 'Tab') {
                // לכידת פוקוס בתוך הדיאלוג
                const focusable = $$('button, [href], input, [tabindex]:not([tabindex="-1"])', dialog)
                    .filter((el) => !el.hasAttribute('disabled'));
                if (!focusable.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });
    })();

    /* ---------- נתוני המתכונים ---------- */
    const RECIPES = {
        1: {
            title: 'קערת בוקר מזינה',
            time: '10 דקות', servings: '2 מנות', difficulty: 'קל',
            intro: 'קערת שיבולת שועל קלאסית ומזינה, עשירה בסיבים תזונתיים ובחלבון. מושלמת להתחלת יום אנרגטית.',
            ingredients: ['1 כוס שיבולת שועל', '2 כוסות חלב או משקה צמחי', '1 בננה בשלה', '2 כפות אגוזי מלך קצוצים', '1 כפית קינמון', '1 כף דבש או סילאן', 'פירות עונה לקישוט', '1 כף זרעי צ\'יה (אופציונלי)'],
            instructions: ['בסיר בינוני מביאים את החלב לרתיחה על אש בינונית', 'מוסיפים את שיבולת השועל ומנמיכים את האש', 'מבשלים תוך ערבוב מדי פעם כ-5 דקות', 'מועכים את הבננה ומוסיפים לסיר', 'מוסיפים קינמון ודבש ומערבבים היטב', 'מחלקים לשתי קערות', 'מקשטים באגוזים, בפירות ובזרעי צ\'יה', 'מגישים חם'],
            nutrition: { calories: '320', protein: '12 גר\'', carbs: '45 גר\'', fat: '10 גר\'', fiber: '8 גר\'' }
        },
        2: {
            title: 'סלט קינואה צבעוני',
            time: '25 דקות', servings: '4 מנות', difficulty: 'בינוני',
            intro: 'סלט קינואה טרי ומרענן, עשיר בחלבון צמחי ובירקות צבעוניים. ארוחה שלמה ומאוזנת.',
            ingredients: ['1 כוס קינואה', '2 כוסות מים', '1 מלפפון חתוך לקוביות', '2 כוסות עגבניות שרי חצויות', '1 פלפל אדום קצוץ', '1 גזר מגורד', '1/2 בצל סגול קצוץ דק', '2 כפות פטרוזיליה טרייה', 'מיץ מ-2 לימונים', '3 כפות שמן זית', 'מלח ופלפל שחור לפי הטעם'],
            instructions: ['שוטפים את הקינואה במים קרים', 'מבשלים את הקינואה במים רותחים עם קורט מלח כ-15 דקות', 'מסננים ומצננים', 'חותכים את כל הירקות לגדלים אחידים', 'בקערה גדולה מערבבים את הקינואה המקוררת עם הירקות', 'מכינים רוטב: מיץ לימון, שמן זית, מלח ופלפל', 'שופכים את הרוטב על הסלט ומערבבים היטב', 'מצננים במקרר לפחות 30 דקות לפני ההגשה', 'מגישים קר'],
            nutrition: { calories: '285', protein: '9 גר\'', carbs: '38 גר\'', fat: '11 גר\'', fiber: '6 גר\'' }
        },
        3: {
            title: 'חביתת ירקות בתנור',
            time: '35 דקות', servings: '6 מנות', difficulty: 'קל',
            intro: 'חביתה אפויה עשירה בחלבון ובירקות. מנה מושלמת לארוחת צהריים או ערב משפחתית.',
            ingredients: ['8 ביצים גדולות', '1/2 כוס חלב', '2 כוסות תרד קפוא (מופשר)', '1 בצל גדול קצוץ', '2 פלפלים צבעוניים קצוצים', '3 עגבניות חתוכות לפרוסות', '1 כוס גבינה לבנה 5%', '2 שיני שום כתושות', 'מלח, פלפל ופלפל חריף', '2 כפות שמן זית'],
            instructions: ['מחממים תנור ל-180 מעלות', 'במחבת מחממים שמן ומטגנים בצל עד הזהבה', 'מוסיפים פלפלים ושום ומטגנים 3 דקות', 'מוסיפים תרד ומבשלים עד שהנוזלים מתאדים', 'בקערה טורפים ביצים עם חלב, מלח ופלפל', 'משמנים תבנית ושופכים את תערובת הביצים', 'מוסיפים את הירקות ומערבבים קלות', 'מפזרים פרוסות עגבנייה וגבינה לבנה מעל', 'אופים 25–30 דקות עד שהחביתה מתייצבת', 'מצננים 5 דקות, חותכים ומגישים'],
            nutrition: { calories: '195', protein: '16 גר\'', carbs: '8 גר\'', fat: '11 גר\'', fiber: '2 גר\'' }
        },
        4: {
            title: 'כדורי אנרגיה טבעיים',
            time: '15 דקות', servings: '12 כדורים', difficulty: 'קל',
            intro: 'חטיף בריא ומתוק באופן טבעי, עשיר באנרגיה ובחומרים מזינים. מושלם לפני פעילות גופנית.',
            ingredients: ['1 כוס תמרים מגולענים', '1 כוס שקדים טבעיים', '2 כפות קקאו', '2 כפות קוקוס מגורד', '1 כפית תמצית וניל', 'קורט מלח', '2 כפות מים (אם נדרש)', 'שקדים שלמים לקישוט'],
            instructions: ['במעבד מזון טוחנים את השקדים לפירורים גסים', 'מוסיפים את התמרים וממשיכים לעבד', 'מוסיפים קקאו, קוקוס, וניל ומלח', 'מעבדים עד לקבלת בצק דביק', 'אם הבצק יבש מדי, מוסיפים מעט מים', 'לוקחים כפית מהתערובת ומגלגלים לכדור', 'לוחצים שקד שלם במרכז כל כדור', 'מגלגלים בקוקוס מגורד (אופציונלי)', 'מצננים במקרר לפחות שעה', 'שומרים במקרר עד שבוע'],
            nutrition: { calories: '110', protein: '3 גר\'', carbs: '14 גר\'', fat: '6 גר\'', fiber: '3 גר\'' }
        },
        5: {
            title: 'מרק ירקות חורפי',
            time: '45 דקות', servings: '6 מנות', difficulty: 'בינוני',
            intro: 'מרק עשיר ומחמם, מלא בירקות עונתיים ובעדשים. מושלם לערב חורף קר.',
            ingredients: ['2 בצלים גדולים קצוצים', '3 גזרים חתוכים לקוביות', '2 בטטות חתוכות לקוביות', '1 כוס עדשים כתומות', '2 עגבניות גדולות קצוצות', '4 שיני שום כתושות', '2 ליטר מרק ירקות', '1 כפית כורכום', '1 כפית כמון', 'מלח ופלפל שחור', '3 כפות שמן זית', 'פטרוזיליה טרייה לקישוט'],
            instructions: ['בסיר גדול מחממים שמן זית על אש בינונית', 'מוסיפים בצל ומטגנים 5 דקות עד הזהבה', 'מוסיפים שום ותבלינים ומטגנים דקה נוספת', 'מוסיפים גזר ובטטה ומערבבים', 'שופכים את מרק הירקות ומביאים לרתיחה', 'מוסיפים עדשים ועגבניות', 'מנמיכים לאש נמוכה ומבשלים 30 דקות', 'טועמים ומתקנים תיבול', 'אפשר לטחון חלק מהמרק לקבלת מרקם סמיך יותר', 'מגישים חם עם פטרוזיליה טרייה'],
            nutrition: { calories: '245', protein: '11 גר\'', carbs: '42 גר\'', fat: '4 גר\'', fiber: '10 גר\'' }
        },
        6: {
            title: 'סמוזי ירוק מרענן',
            time: '5 דקות', servings: '2 מנות', difficulty: 'קל',
            intro: 'משקה ירוק מזין ומרענן, עשיר בוויטמינים ובמינרלים. התחלה מושלמת ליום.',
            ingredients: ['2 כוסות תרד טרי', '1 בננה בשלה קפואה', '1/2 אבוקדו', '1 כוס משקה שקדים', 'מיץ מ-1/2 לימון', '1 כף דבש או סילאן', '1/2 כוס קוביות קרח', '1 כף זרעי פשתן (אופציונלי)'],
            instructions: ['שוטפים היטב את התרד', 'שמים את כל המרכיבים בבלנדר', 'מערבלים במהירות גבוהה כדקה', 'בודקים את המרקם ומוסיפים נוזלים אם צריך', 'טועמים ומתקנים מתיקות', 'מוזגים לכוסות', 'מגישים מיד, קר'],
            nutrition: { calories: '185', protein: '4 גר\'', carbs: '28 גר\'', fat: '8 גר\'', fiber: '6 גר\'' }
        }
    };
})();
