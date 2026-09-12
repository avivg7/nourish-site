/* ==========================================================================
   כתבות ופרסומים
   --------------------------------------------------------------------------
   איך מוסיפים כתבה: מוסיפים רשומה לרשימה ARTICLES (החדשה ראשונה) ושומרים.
   שדות: title (חובה), url (חובה), outlet – שם האתר/המגזין, date – שנה או
   תאריך כטקסט, excerpt – משפט קצר על הכתבה. outlet/date/excerpt אופציונליים.

   דוגמה:
   { title: 'איך מפסיקים לאכול רגשית?', outlet: 'ישראל היום', date: '2026',
     url: 'https://...', excerpt: 'ריאיון על ההבדל בין רעב פיזי לרעב רגשי.' },
   ========================================================================== */

const ARTICLES = [
    // { title: '', outlet: '', date: '', url: '', excerpt: '' },
];

(function () {
    'use strict';

    const feed = document.getElementById('articles-feed');
    if (!feed) return;

    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>';
    const NEWSPAPER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V9"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>';

    const items = (Array.isArray(ARTICLES) ? ARTICLES : []).filter((a) => a && a.title && a.url);

    if (!items.length) {
        feed.innerHTML = `
            <div class="ig-empty">
                <div class="ig-empty-icon">${NEWSPAPER}</div>
                <h2>הכתבות בדרך לכאן</h2>
                <p>כאן ירוכזו כתבות, ראיונות ופרסומים מהתקשורת ומהמגזינים המקצועיים. בינתיים אפשר לקרוא את התכנים היומיומיים באינסטגרם.</p>
                <a href="https://www.instagram.com/nourish_vik/" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg">לעמוד האינסטגרם</a>
            </div>`;
        return;
    }

    feed.innerHTML = items.map((a) => `
        <a class="article-card reveal" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">
            ${a.outlet || a.date ? `<span class="article-meta">${a.outlet ? `<span class="article-outlet">${esc(a.outlet)}</span>` : ''}${a.date ? `<span class="article-date">${esc(a.date)}</span>` : ''}</span>` : ''}
            <h2>${esc(a.title)}</h2>
            ${a.excerpt ? `<p class="article-excerpt">${esc(a.excerpt)}</p>` : ''}
            <span class="article-more">לקריאת הכתבה ${ARROW}</span>
        </a>`).join('');

    // חשיפה בגלילה לכרטיסים שנוצרו אחרי שהסקריפט הראשי כבר רץ
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
        Array.from(feed.children).forEach((el) => el.classList.add('is-visible'));
    } else {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        Array.from(feed.children).forEach((el) => io.observe(el));
    }
})();
