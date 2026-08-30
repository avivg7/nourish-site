/* ==========================================================================
   בלוג נושם – פוסטים מאינסטגרם
   --------------------------------------------------------------------------
   איך מוסיפים פוסט:
   1. פותחים את הפוסט באינסטגרם ומעתיקים את הקישור שלו
      (לדוגמה: https://www.instagram.com/p/XXXXXXXXXXX/ או .../reel/XXXXXXXXXXX/)
   2. מדביקים אותו כשורה חדשה ברשימה INSTAGRAM_POSTS למטה – החדש ביותר ראשון.
   3. שומרים ומעלים את הקובץ. זהו – בלי טוקנים ובלי הגדרות.

   הפוסטים מוצגים דרך ה-embed הרשמי של אינסטגרם, ולכן חייבים להיות ציבוריים.
   ========================================================================== */

const INSTAGRAM_POSTS = [
    // 'https://www.instagram.com/p/XXXXXXXXXXX/',
];

(function () {
    'use strict';

    const feed = document.getElementById('instagram-feed');
    if (!feed) return;

    const PROFILE_URL = 'https://www.instagram.com/nourish.viktoria/';
    const IG_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/></svg>';

    function isValidPostUrl(url) {
        return /^https:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?/.test(url);
    }

    function renderEmpty() {
        feed.innerHTML = `
            <div class="ig-empty">
                <div class="ig-empty-icon">${IG_ICON}</div>
                <h2>התכנים החדשים מתפרסמים באינסטגרם</h2>
                <p>טיפים, מתכונים ומחשבות על אוכל ועל הגוף – בקצב של יום־יום. עקבו כדי לא לפספס.</p>
                <a href="${PROFILE_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-lg">${IG_ICON}<span>לעמוד האינסטגרם</span></a>
            </div>`;
    }

    function renderPosts(urls) {
        feed.innerHTML = urls.map((url) => {
            const clean = url.split('?')[0].replace(/\/?$/, '/');
            return `
                <blockquote class="instagram-media" data-instgrm-permalink="${clean}" data-instgrm-version="14">
                    <a href="${clean}" target="_blank" rel="noopener noreferrer">צפייה בפוסט באינסטגרם</a>
                </blockquote>`;
        }).join('');

        const script = document.createElement('script');
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        script.onload = () => { if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process(); };
        document.body.appendChild(script);
    }

    const posts = (Array.isArray(INSTAGRAM_POSTS) ? INSTAGRAM_POSTS : []).filter(isValidPostUrl);
    if (posts.length) renderPosts(posts);
    else renderEmpty();
})();
