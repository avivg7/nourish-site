/* ==========================================================================
   ויקטוריה גרמן – דיאטנית קלינית · סקריפט האתר
   שכבת אינטראקציה: GSAP (אופציונלי, עם fallback מלא) · נגישות · ניווט ·
   "מה מתאים לי?" · שאלות נפוצות · מתכונים (סינון, מחשבון מנות, סימון מצרכים)
   ========================================================================== */
(function () {
    'use strict';

    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
    const html = document.documentElement;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const hasGsap = !reduceMotion && typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

    if (reduceMotion) html.classList.add('motion-off');
    if (hasGsap) {
        html.classList.add('has-gsap');
        window.gsap.registerPlugin(window.ScrollTrigger);
    }
    const gsap = hasGsap ? window.gsap : null;

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

    /* ---------- פס התקדמות גלילה ---------- */
    (function progressBar() {
        const bar = $('.progress');
        if (!bar) return;
        let ticking = false;
        const update = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
            bar.style.transform = `scaleX(${p})`;
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
        }, { passive: true });
        update();
    })();

    /* ---------- תפריט נגישות ---------- */
    (function accessibilityMenu() {
        const toggle = $('#a11y-toggle');
        const panel = $('#a11y-panel');
        if (!toggle || !panel) return;

        const STORAGE_KEY = 'nourish-a11y';
        const state = { fontScale: 1, highContrast: false, underlineLinks: false };

        function apply() {
            html.style.setProperty('--font-size-scale', state.fontScale.toFixed(2));
            document.body.classList.toggle('high-contrast', state.highContrast);
            document.body.classList.toggle('underline-links', state.underlineLinks);
            const hc = $('[data-action="high-contrast"]', panel);
            const ul = $('[data-action="underline-links"]', panel);
            if (hc) hc.setAttribute('aria-pressed', String(state.highContrast));
            if (ul) ul.setAttribute('aria-pressed', String(state.underlineLinks));
            if (hasGsap) window.ScrollTrigger.refresh();
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
            } catch (e) { /* נתונים פגומים */ }
            apply();
        }
        function setOpen(open) {
            panel.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', String(open));
            if (open) { const first = $('.a11y-btn', panel); if (first) first.focus(); }
        }

        toggle.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#a11y') && panel.classList.contains('is-open')) setOpen(false);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panel.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
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
        nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
        });
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('is-open') && !e.target.closest('.site-header')) setOpen(false);
        });
        const mq = window.matchMedia('(min-width: 1024px)');
        const onChange = () => { if (mq.matches) setOpen(false); };
        if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);
    })();

    /* ---------- סימון הסקשן הנוכחי בתפריט ---------- */
    (function scrollSpy() {
        const links = $$('.nav-list a[data-spy]');
        if (!links.length || !('IntersectionObserver' in window)) return;
        const map = new Map();
        links.forEach((link) => { const s = document.getElementById(link.dataset.spy); if (s) map.set(s, link); });
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
        window.addEventListener('scroll', () => {
            if (window.scrollY < 120 && current) { current.removeAttribute('aria-current'); current = null; }
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
                if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        items.forEach((el) => observer.observe(el));
    })();

    /* ---------- Hero: כניסה מתוזמנת + פרלקסה ---------- */
    (function hero() {
        const heroEl = $('.hero');
        if (!heroEl) return;
        const h1 = $('#hero-title', heroEl);

        // פיצול הכותרת למילים (שומר על ה-<em>)
        function splitWords(node) {
            Array.from(node.childNodes).forEach((child) => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const frag = document.createDocumentFragment();
                    child.textContent.split(/(\s+)/).forEach((part) => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
                        const w = document.createElement('span'); w.className = 'w';
                        const wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = part;
                        w.appendChild(wi); frag.appendChild(w);
                    });
                    node.replaceChild(frag, child);
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    splitWords(child);
                }
            });
        }

        if (!hasGsap) return;

        if (h1) splitWords(h1);
        const words = $$('.wi', h1);
        const photo = $('.hero-photo', heroEl);
        const blob = $('.blob-bg', heroEl);

        const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 0.9 } });
        tl.set('.hero-anim', { opacity: 1 });
        if (h1) tl.set(h1, { opacity: 1 });
        tl.fromTo($('.hero-copy .eyebrow'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 }, 0.1)
          .fromTo(words, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.055 }, 0.2)
          .fromTo($('.hero-copy .lead'), { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, 0.55)
          .fromTo($('.hero-actions'), { opacity: 0, y: 18 }, { opacity: 1, y: 0 }, 0.68)
          .fromTo($('.trust-row'), { opacity: 0, y: 12 }, { opacity: 1, y: 0 }, 0.8);
        if (blob) tl.fromTo(blob, { opacity: 0, scale: 0.8, rotation: -14 }, { opacity: 1, scale: 1, rotation: -6, duration: 1.2 }, 0.15);
        if (photo) tl.fromTo(photo, { opacity: 0, y: 36, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1.1 }, 0.3);

        // פרלקסה עדינה לפי תנועת העכבר (דסקטופ בלבד)
        if (finePointer && photo) {
            const qx = gsap.quickTo(photo, 'x', { duration: 0.8, ease: 'power3.out' });
            const qy = gsap.quickTo(photo, 'y', { duration: 0.8, ease: 'power3.out' });
            const bx = blob ? gsap.quickTo(blob, 'x', { duration: 1.1, ease: 'power3.out' }) : null;
            const by = blob ? gsap.quickTo(blob, 'y', { duration: 1.1, ease: 'power3.out' }) : null;
            let active = false;
            heroEl.addEventListener('pointermove', (e) => {
                if (!active) { if (tl.progress() < 0.9) return; active = true; }
                const r = heroEl.getBoundingClientRect();
                const dx = ((e.clientX - r.left) / r.width - 0.5) * 2;
                const dy = ((e.clientY - r.top) / r.height - 0.5) * 2;
                qx(dx * 10); qy(dy * 8);
                if (bx) { bx(dx * -16); by(dy * -12); }
            });
            heroEl.addEventListener('pointerleave', () => { qx(0); qy(0); if (bx) { bx(0); by(0); } });
        }
    })();

    /* ---------- איך זה עובד: שלבים שנדלקים + קו שנמשך ---------- */
    (function process() {
        const steps = $('.steps');
        if (!steps) return;
        const items = $$('.step', steps);

        if ('IntersectionObserver' in window && !reduceMotion) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) { entry.target.classList.add('is-active'); io.unobserve(entry.target); }
                });
            }, { rootMargin: '-25% 0px -35% 0px', threshold: 0 });
            items.forEach((el) => io.observe(el));
        } else {
            items.forEach((el) => el.classList.add('is-active'));
        }

        if (!hasGsap) return;
        window.ScrollTrigger.create({
            trigger: steps,
            start: 'top 75%',
            end: 'bottom 45%',
            scrub: 0.6,
            onUpdate: (self) => steps.style.setProperty('--line-progress', self.progress.toFixed(3))
        });
    })();

    /* ---------- כפתורים מגנטיים ---------- */
    (function magnetic() {
        if (!hasGsap || !finePointer) return;
        $$('.btn-primary, .btn-whatsapp').forEach((btn) => {
            if (btn.closest('.cta-bar')) return;
            btn.classList.add('magnetic');
            const qx = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
            const qy = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
            btn.addEventListener('pointermove', (e) => {
                const r = btn.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width / 2);
                const dy = e.clientY - (r.top + r.height / 2);
                qx(Math.max(-10, Math.min(10, dx * 0.22)));
                qy(Math.max(-8, Math.min(8, dy * 0.22)));
            });
            btn.addEventListener('pointerleave', () => { qx(0); qy(0); });
        });
    })();

    /* ---------- הטיה תלת-ממדית עדינה לכרטיסים ---------- */
    (function tilt() {
        if (!hasGsap || !finePointer) return;
        $$('.tilt').forEach((card) => {
            const rx = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' });
            const ry = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' });
            const yy = gsap.quickTo(card, 'y', { duration: 0.5, ease: 'power3.out' });
            gsap.set(card, { transformPerspective: 900 });
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                const dx = (e.clientX - r.left) / r.width - 0.5;
                const dy = (e.clientY - r.top) / r.height - 0.5;
                rx(-dy * 6); ry(dx * 6); yy(-4);
            });
            card.addEventListener('pointerleave', () => { rx(0); ry(0); yy(0); });
        });
    })();

    /* ---------- "מה מתאים לי?" ---------- */
    const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
    const WA = (text) => 'https://wa.me/972542141321?text=' + encodeURIComponent(text);
    const MATCH = {
        weight: {
            label: 'ירידה במשקל',
            title: 'ירידה במשקל שנשארת',
            text: 'לא עוד "מתחילים ביום ראשון". תוכנית שמתאימה לשגרה האמיתית שלך, מדדים שנמדדים לאורך זמן, ומעקב צמוד שמחזיק גם בשבועות הפחות טובים.',
            items: ['אבחון ומדדים במפגש הראשון, ותוכנית שנבנית מהם', 'תפריט גמיש – בלי לספור קלוריות, עם מקום לאוכל שאוהבים', 'מפגשי מעקב ומענה בוואטסאפ בין לבין'],
            cta: 'לדבר על זה בוואטסאפ',
            wa: 'היי ויקי, אשמח לשמוע על ליווי לירידה במשקל'
        },
        emotional: {
            label: 'אכילה רגשית',
            title: 'להבין מה קורה לפני שהיד נשלחת למטבח',
            text: 'אכילה רגשית היא לא חוסר שליטה, היא מנגנון. בליווי לומדים לזהות את הטריגרים, לבנות שגרה שמחזיקה גם בערבים קשים, ולהוריד את האשמה מהשולחן.',
            items: ['זיהוי דפוסים: מתי, איפה ולמה זה קורה', 'כלים פרקטיים לרגע עצמו, לא רק "תשתי מים"', 'בניית יחס בריא לאוכל, בלי איסורים שמייצרים התקפים'],
            cta: 'לדבר על זה בוואטסאפ',
            wa: 'היי ויקי, אשמח לשמוע על ליווי סביב אכילה רגשית'
        },
        routine: {
            label: 'אנרגיה ושגרה',
            title: 'לאכול מסודר גם כשהיום לא מסודר',
            text: 'עבודה, ילדים, נסיעות, ואין רגע. הליווי בונה תכנון פשוט לשבוע עמוס: ארוחות שמכינים בעשר דקות, פתרונות לדרך, ואנרגיה שלא קורסת בארבע אחר הצהריים.',
            items: ['תכנון שבועי ריאלי, לא תפריט של שף', 'ארוחות מהירות ומשביעות שמתאימות למקרר שלך', 'שמירה על אנרגיה יציבה לאורך היום'],
            cta: 'לדבר על זה בוואטסאפ',
            wa: 'היי ויקי, אשמח לשמוע על ליווי לשגרה עמוסה ואנרגיה'
        },
        teen: {
            label: 'ליווי מתבגר/ת',
            title: 'ליווי רגיש לגיל ההתבגרות',
            text: 'בגיל הזה הגוף משתנה, והיחס אליו נבנה לשנים קדימה. הליווי עובד יחד עם המתבגר/ת וההורים – בלי דיאטות, בלי ספירות, עם הרבה כבוד וקשב.',
            items: ['מפגש היכרות עם ההורים ועם המתבגר/ת', 'הרגלים ואוכל שמתאימים לצרכים של גוף מתפתח', 'בניית ביטחון ויחס בריא לאוכל ולגוף'],
            cta: 'לדבר על זה בוואטסאפ',
            wa: 'היי ויקי, אשמח לשמוע על ליווי למתבגר/ת'
        }
    };

    (function matcher() {
        const group = $('.match-options');
        const content = $('#match-content');
        if (!group || !content) return;
        const options = $$('.match-option', group);

        function render(goal) {
            const d = MATCH[goal];
            if (!d) return;
            content.innerHTML = `
                <p class="eyebrow">${d.label}</p>
                <h3>${d.title}</h3>
                <p>${d.text}</p>
                <ul>${d.items.map((i) => `<li>${CHECK}<span>${i}</span></li>`).join('')}</ul>
                <a href="${WA(d.wa)}" class="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">${d.cta}</a>`;
        }

        function select(btn) {
            options.forEach((o) => { o.setAttribute('aria-checked', String(o === btn)); o.tabIndex = o === btn ? 0 : -1; });
            const goal = btn.dataset.goal;
            if (reduceMotion) { render(goal); return; }
            content.classList.add('is-switching');
            window.setTimeout(() => {
                render(goal);
                content.classList.remove('is-switching');
                if (hasGsap) gsap.fromTo($$('li, h3, p, .btn', content), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out' });
            }, 200);
        }

        options.forEach((btn, i) => {
            btn.tabIndex = btn.getAttribute('aria-checked') === 'true' ? 0 : -1;
            btn.addEventListener('click', () => { if (btn.getAttribute('aria-checked') !== 'true') select(btn); });
            btn.addEventListener('keydown', (e) => {
                const dir = { ArrowDown: 1, ArrowRight: -1, ArrowUp: -1, ArrowLeft: 1 }[e.key];
                if (dir === undefined) return;
                e.preventDefault();
                const next = options[(i + dir + options.length) % options.length];
                next.focus(); select(next);
            });
        });
    })();

    /* ---------- שאלות נפוצות ---------- */
    (function faq() {
        const items = $$('.faq-item');
        if (!items.length) return;
        items.forEach((item) => {
            const q = $('.faq-q', item);
            const a = $('.faq-a', item);
            if (!q || !a) return;
            q.addEventListener('click', () => {
                const open = q.getAttribute('aria-expanded') === 'true';
                q.setAttribute('aria-expanded', String(!open));
                a.classList.toggle('is-open', !open);
            });
        });
    })();

    /* ---------- מתכונים: סינון ---------- */
    (function filters() {
        const bar = $('.filters');
        const grid = $('.recipes-grid');
        if (!bar || !grid) return;
        const buttons = $$('.filter-btn', bar);
        const cards = $$('.recipe-card', grid);
        let empty = null;

        bar.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn || btn.getAttribute('aria-pressed') === 'true') return;
            buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
            const f = btn.dataset.filter;
            const visible = [];
            cards.forEach((card) => {
                const show = f === 'all' || card.dataset.category === f;
                card.classList.toggle('is-hidden', !show);
                if (show) visible.push(card);
            });
            if (!visible.length) {
                if (!empty) { empty = document.createElement('p'); empty.className = 'recipes-empty'; empty.textContent = 'אין עדיין מתכונים בקטגוריה הזו – בקרוב.'; }
                grid.appendChild(empty);
            } else if (empty && empty.parentNode) {
                empty.remove();
            }
            announce(`${visible.length} מתכונים מוצגים`);
            if (hasGsap && visible.length) {
                gsap.fromTo(visible, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'power2.out', clearProps: 'opacity,transform' });
            }
        });
    })();

    /* ---------- מתכונים: מודאל עם מחשבון מנות וסימון מצרכים ---------- */
    (function recipes() {
        const modal = $('#recipe-modal');
        const cards = $$('.recipe-card[data-recipe]');
        if (!modal || !cards.length) return;

        const body = $('#modal-body', modal);
        const closeBtn = $('.modal-close', modal);
        const overlay = $('.modal-overlay', modal);
        const dialog = $('.modal-dialog', modal);
        let lastFocused = null;
        let current = null;
        let servings = 0;

        const ICON = {
            clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
            users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
            gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15l3.5-3.5"/><path d="M20.3 18a9 9 0 1 0-16.6 0"/></svg>'
        };
        const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

        /* --- כמויות --- */
        const FRACTIONS = [[0.25, '¼'], [0.5, '½'], [0.75, '¾'], [1 / 3, '⅓'], [2 / 3, '⅔']];
        function parseQty(str) {
            return str.trim().split(/\s+/).reduce((sum, part) => {
                if (part.includes('/')) { const [a, b] = part.split('/').map(Number); return sum + (b ? a / b : 0); }
                return sum + Number(part.replace(',', '.'));
            }, 0);
        }
        function formatQty(n) {
            if (n <= 0) return '0';
            const whole = Math.floor(n + 1e-6);
            const frac = n - whole;
            let fracStr = '';
            for (const [v, ch] of FRACTIONS) { if (Math.abs(frac - v) < 0.04) { fracStr = ch; break; } }
            if (!fracStr && frac > 0.04) return String(Math.round(n * 10) / 10);
            return (whole ? String(whole) : '') + (fracStr ? (whole ? ' ' : '') + fracStr : '') || '0';
        }
        const QTY_RE = /^(\d+(?:[.,]\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+)\s+(.+)$/;
        function ingredientHtml(text, factor) {
            const m = text.match(QTY_RE);
            if (!m) return esc(text);
            return `<span class="qty">${esc(formatQty(parseQty(m[1]) * factor))}</span> ${esc(m[2])}`;
        }
        function servingsLabel(n, recipe) {
            const unit = n === 1 && recipe.servingsSingular ? recipe.servingsSingular : recipe.servingsUnit;
            return `${n} ${unit}`;
        }

        function renderIngredients() {
            const list = $('.ingredients', body);
            if (!list || !current) return;
            const factor = servings / current.servingsCount;
            const checked = $$('input', list).map((i) => i.checked);
            list.innerHTML = current.ingredients.map((ing, i) =>
                `<li><label><input type="checkbox" ${checked[i] ? 'checked' : ''}><span>${ingredientHtml(ing, factor)}</span></label></li>`).join('');
            const out = $('.servings output', body);
            if (out) out.textContent = servingsLabel(servings, current);
            const minus = $('.servings [data-step="-1"]', body);
            if (minus) minus.disabled = servings <= 1;
        }

        function render(recipe) {
            const n = recipe.nutrition;
            return `
                <div class="modal-head">
                    <h2 id="modal-title">${esc(recipe.title)}</h2>
                    <div class="modal-meta">
                        <span>${ICON.clock}<span>${esc(recipe.time)}</span></span>
                        <span>${ICON.users}<span>${esc(servingsLabel(recipe.servingsCount, recipe))}</span></span>
                        <span>${ICON.gauge}<span>רמת קושי: ${esc(recipe.difficulty)}</span></span>
                    </div>
                </div>
                <p class="modal-intro">${esc(recipe.intro)}</p>
                <section class="modal-section" aria-labelledby="modal-ingredients">
                    <div class="modal-section-head">
                        <h3 id="modal-ingredients">מצרכים</h3>
                        <div class="servings" role="group" aria-label="מספר מנות">
                            <button type="button" data-step="-1" aria-label="פחות מנות">−</button>
                            <output aria-live="polite">${esc(servingsLabel(recipe.servingsCount, recipe))}</output>
                            <button type="button" data-step="1" aria-label="יותר מנות">+</button>
                        </div>
                    </div>
                    <ul class="ingredients"></ul>
                </section>
                <section class="modal-section" aria-labelledby="modal-steps">
                    <h3 id="modal-steps">אופן ההכנה</h3>
                    <ol class="instructions">${recipe.instructions.map((i) => `<li>${esc(i)}</li>`).join('')}</ol>
                </section>
                <section class="nutrition" aria-labelledby="modal-nutrition">
                    <h3 id="modal-nutrition">ערכים תזונתיים למנה</h3>
                    <div class="nutrition-grid">
                        <div class="nutrition-item"><span class="nutrition-value">${esc(n.calories)}</span><span class="nutrition-label">קלוריות</span></div>
                        <div class="nutrition-item"><span class="nutrition-value">${esc(n.protein)}</span><span class="nutrition-label">חלבון</span></div>
                        <div class="nutrition-item"><span class="nutrition-value">${esc(n.carbs)}</span><span class="nutrition-label">פחמימות</span></div>
                        <div class="nutrition-item"><span class="nutrition-value">${esc(n.fat)}</span><span class="nutrition-label">שומן</span></div>
                        <div class="nutrition-item"><span class="nutrition-value">${esc(n.fiber)}</span><span class="nutrition-label">סיבים</span></div>
                    </div>
                </section>`;
        }

        function open(id) {
            const recipe = RECIPES[id];
            if (!recipe) return;
            current = recipe;
            servings = recipe.servingsCount;
            lastFocused = document.activeElement;
            body.innerHTML = render(recipe);
            renderIngredients();
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

        body.addEventListener('click', (e) => {
            const step = e.target.closest('.servings button');
            if (!step || !current) return;
            const next = servings + Number(step.dataset.step);
            if (next < 1 || next > 48) return;
            servings = next;
            renderIngredients();
            announce(`הכמויות עודכנו ל-${servingsLabel(servings, current)}`);
        });

        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('is-open')) return;
            if (e.key === 'Escape') { close(); return; }
            if (e.key === 'Tab') {
                const focusable = $$('button, [href], input, [tabindex]:not([tabindex="-1"])', dialog).filter((el) => !el.hasAttribute('disabled'));
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
            time: '10 דקות', servingsCount: 2, servingsUnit: 'מנות', servingsSingular: 'מנה', difficulty: 'קל',
            intro: 'קערת שיבולת שועל קלאסית ומזינה, עשירה בסיבים תזונתיים ובחלבון. מושלמת להתחלת יום אנרגטית.',
            ingredients: ['1 כוס שיבולת שועל', '2 כוסות חלב או משקה צמחי', '1 בננה בשלה', '2 כפות אגוזי מלך קצוצים', '1 כפית קינמון', '1 כף דבש או סילאן', 'פירות עונה לקישוט', '1 כף זרעי צ\'יה (אופציונלי)'],
            instructions: ['בסיר בינוני מביאים את החלב לרתיחה על אש בינונית', 'מוסיפים את שיבולת השועל ומנמיכים את האש', 'מבשלים תוך ערבוב מדי פעם כ-5 דקות', 'מועכים את הבננה ומוסיפים לסיר', 'מוסיפים קינמון ודבש ומערבבים היטב', 'מחלקים לשתי קערות', 'מקשטים באגוזים, בפירות ובזרעי צ\'יה', 'מגישים חם'],
            nutrition: { calories: '320', protein: '12 גר\'', carbs: '45 גר\'', fat: '10 גר\'', fiber: '8 גר\'' }
        },
        2: {
            title: 'סלט קינואה צבעוני',
            time: '25 דקות', servingsCount: 4, servingsUnit: 'מנות', servingsSingular: 'מנה', difficulty: 'בינוני',
            intro: 'סלט קינואה טרי ומרענן, עשיר בחלבון צמחי ובירקות צבעוניים. ארוחה שלמה ומאוזנת.',
            ingredients: ['1 כוס קינואה', '2 כוסות מים', '1 מלפפון חתוך לקוביות', '2 כוסות עגבניות שרי חצויות', '1 פלפל אדום קצוץ', '1 גזר מגורד', '1/2 בצל סגול קצוץ דק', '2 כפות פטרוזיליה טרייה', '2 לימונים (המיץ שלהם)', '3 כפות שמן זית', 'מלח ופלפל שחור לפי הטעם'],
            instructions: ['שוטפים את הקינואה במים קרים', 'מבשלים את הקינואה במים רותחים עם קורט מלח כ-15 דקות', 'מסננים ומצננים', 'חותכים את כל הירקות לגדלים אחידים', 'בקערה גדולה מערבבים את הקינואה המקוררת עם הירקות', 'מכינים רוטב: מיץ לימון, שמן זית, מלח ופלפל', 'שופכים את הרוטב על הסלט ומערבבים היטב', 'מצננים במקרר לפחות 30 דקות לפני ההגשה', 'מגישים קר'],
            nutrition: { calories: '285', protein: '9 גר\'', carbs: '38 גר\'', fat: '11 גר\'', fiber: '6 גר\'' }
        },
        3: {
            title: 'חביתת ירקות בתנור',
            time: '35 דקות', servingsCount: 6, servingsUnit: 'מנות', servingsSingular: 'מנה', difficulty: 'קל',
            intro: 'חביתה אפויה עשירה בחלבון ובירקות. מנה מושלמת לארוחת צהריים או ערב משפחתית.',
            ingredients: ['8 ביצים גדולות', '1/2 כוס חלב', '2 כוסות תרד קפוא (מופשר)', '1 בצל גדול קצוץ', '2 פלפלים צבעוניים קצוצים', '3 עגבניות חתוכות לפרוסות', '1 כוס גבינה לבנה 5%', '2 שיני שום כתושות', 'מלח, פלפל ופלפל חריף', '2 כפות שמן זית'],
            instructions: ['מחממים תנור ל-180 מעלות', 'במחבת מחממים שמן ומטגנים בצל עד הזהבה', 'מוסיפים פלפלים ושום ומטגנים 3 דקות', 'מוסיפים תרד ומבשלים עד שהנוזלים מתאדים', 'בקערה טורפים ביצים עם חלב, מלח ופלפל', 'משמנים תבנית ושופכים את תערובת הביצים', 'מוסיפים את הירקות ומערבבים קלות', 'מפזרים פרוסות עגבנייה וגבינה לבנה מעל', 'אופים 25–30 דקות עד שהחביתה מתייצבת', 'מצננים 5 דקות, חותכים ומגישים'],
            nutrition: { calories: '195', protein: '16 גר\'', carbs: '8 גר\'', fat: '11 גר\'', fiber: '2 גר\'' }
        },
        4: {
            title: 'כדורי אנרגיה טבעיים',
            time: '15 דקות', servingsCount: 12, servingsUnit: 'כדורים', servingsSingular: 'כדור', difficulty: 'קל',
            intro: 'חטיף בריא ומתוק באופן טבעי, עשיר באנרגיה ובחומרים מזינים. מושלם לפני פעילות גופנית.',
            ingredients: ['1 כוס תמרים מגולענים', '1 כוס שקדים טבעיים', '2 כפות קקאו', '2 כפות קוקוס מגורד', '1 כפית תמצית וניל', 'קורט מלח', '2 כפות מים (אם נדרש)', 'שקדים שלמים לקישוט'],
            instructions: ['במעבד מזון טוחנים את השקדים לפירורים גסים', 'מוסיפים את התמרים וממשיכים לעבד', 'מוסיפים קקאו, קוקוס, וניל ומלח', 'מעבדים עד לקבלת בצק דביק', 'אם הבצק יבש מדי, מוסיפים מעט מים', 'לוקחים כפית מהתערובת ומגלגלים לכדור', 'לוחצים שקד שלם במרכז כל כדור', 'מגלגלים בקוקוס מגורד (אופציונלי)', 'מצננים במקרר לפחות שעה', 'שומרים במקרר עד שבוע'],
            nutrition: { calories: '110', protein: '3 גר\'', carbs: '14 גר\'', fat: '6 גר\'', fiber: '3 גר\'' }
        },
        5: {
            title: 'מרק ירקות חורפי',
            time: '45 דקות', servingsCount: 6, servingsUnit: 'מנות', servingsSingular: 'מנה', difficulty: 'בינוני',
            intro: 'מרק עשיר ומחמם, מלא בירקות עונתיים ובעדשים. מושלם לערב חורף קר.',
            ingredients: ['2 בצלים גדולים קצוצים', '3 גזרים חתוכים לקוביות', '2 בטטות חתוכות לקוביות', '1 כוס עדשים כתומות', '2 עגבניות גדולות קצוצות', '4 שיני שום כתושות', '2 ליטר מרק ירקות', '1 כפית כורכום', '1 כפית כמון', 'מלח ופלפל שחור', '3 כפות שמן זית', 'פטרוזיליה טרייה לקישוט'],
            instructions: ['בסיר גדול מחממים שמן זית על אש בינונית', 'מוסיפים בצל ומטגנים 5 דקות עד הזהבה', 'מוסיפים שום ותבלינים ומטגנים דקה נוספת', 'מוסיפים גזר ובטטה ומערבבים', 'שופכים את מרק הירקות ומביאים לרתיחה', 'מוסיפים עדשים ועגבניות', 'מנמיכים לאש נמוכה ומבשלים 30 דקות', 'טועמים ומתקנים תיבול', 'אפשר לטחון חלק מהמרק לקבלת מרקם סמיך יותר', 'מגישים חם עם פטרוזיליה טרייה'],
            nutrition: { calories: '245', protein: '11 גר\'', carbs: '42 גר\'', fat: '4 גר\'', fiber: '10 גר\'' }
        },
        6: {
            title: 'סמוזי ירוק מרענן',
            time: '5 דקות', servingsCount: 2, servingsUnit: 'מנות', servingsSingular: 'מנה', difficulty: 'קל',
            intro: 'משקה ירוק מזין ומרענן, עשיר בוויטמינים ובמינרלים. התחלה מושלמת ליום.',
            ingredients: ['2 כוסות תרד טרי', '1 בננה בשלה קפואה', '1/2 אבוקדו', '1 כוס משקה שקדים', '1/2 לימון (המיץ שלו)', '1 כף דבש או סילאן', '1/2 כוס קוביות קרח', '1 כף זרעי פשתן (אופציונלי)'],
            instructions: ['שוטפים היטב את התרד', 'שמים את כל המרכיבים בבלנדר', 'מערבלים במהירות גבוהה כדקה', 'בודקים את המרקם ומוסיפים נוזלים אם צריך', 'טועמים ומתקנים מתיקות', 'מוזגים לכוסות', 'מגישים מיד, קר'],
            nutrition: { calories: '185', protein: '4 גר\'', carbs: '28 גר\'', fat: '8 גר\'', fiber: '6 גר\'' }
        }
    };
})();
