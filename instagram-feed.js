// ===============================================
// Instagram Feed Integration
// ===============================================

document.addEventListener('DOMContentLoaded', function() {
    // הגדרות Instagram API
    const INSTAGRAM_CONFIG = {
        // יש להחליף את הערכים הבאים בערכים אמיתיים לאחר הגדרת Instagram API
        accessToken: 'YOUR_INSTAGRAM_ACCESS_TOKEN',
        userId: 'YOUR_INSTAGRAM_USER_ID',
        limit: 5 // מספר הפוסטים להצגה
    };

    const instagramFeed = document.getElementById('instagram-feed');
    const instagramError = document.getElementById('instagram-error');

    // פונקציה לטעינת פוסטים מ-Instagram
    async function loadInstagramPosts() {
        // בדיקה אם הוגדר Access Token
        if (INSTAGRAM_CONFIG.accessToken === 'YOUR_INSTAGRAM_ACCESS_TOKEN') {
            showConfigurationMessage();
            return;
        }

        try {
            // שליפת פוסטים באמצעות Instagram Basic Display API
            const response = await fetch(
                `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${INSTAGRAM_CONFIG.accessToken}&limit=${INSTAGRAM_CONFIG.limit}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch Instagram posts');
            }

            const data = await response.json();

            if (data.data && data.data.length > 0) {
                displayPosts(data.data);
            } else {
                showError('לא נמצאו פוסטים להצגה');
            }
        } catch (error) {
            console.error('Instagram API Error:', error);
            showError();
        }
    }

    // פונקציה להצגת הפוסטים
    function displayPosts(posts) {
        instagramFeed.innerHTML = '';

        posts.forEach(post => {
            // רק פוסטים עם תמונה או קרוסלה
            if (post.media_type === 'IMAGE' || post.media_type === 'CAROUSEL_ALBUM') {
                const postElement = createPostElement(post);
                instagramFeed.appendChild(postElement);
            }
        });
    }

    // פונקציה ליצירת אלמנט פוסט
    function createPostElement(post) {
        const article = document.createElement('article');
        article.className = 'instagram-post';
        article.style.opacity = '0';
        article.style.transform = 'translateY(20px)';
        article.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        // תמונה
        const img = document.createElement('img');
        img.src = post.media_url;
        img.alt = post.caption ? truncateText(post.caption, 50) : 'פוסט אינסטגרם';
        img.className = 'instagram-post-image';
        img.loading = 'lazy';

        // תוכן
        const content = document.createElement('div');
        content.className = 'instagram-post-content';

        // כיתוב
        if (post.caption) {
            const caption = document.createElement('p');
            caption.className = 'instagram-post-caption';
            caption.textContent = post.caption;
            content.appendChild(caption);
        }

        // מטא-דאטה
        const meta = document.createElement('div');
        meta.className = 'instagram-post-meta';

        // תאריך
        const date = document.createElement('span');
        date.className = 'instagram-post-date';
        date.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${formatDate(post.timestamp)}
        `;

        // קישור לפוסט
        const link = document.createElement('a');
        link.href = post.permalink;
        link.className = 'instagram-post-link';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = `
            צפו בפוסט המלא
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
        `;

        meta.appendChild(date);
        meta.appendChild(link);
        content.appendChild(meta);

        article.appendChild(img);
        article.appendChild(content);

        // אנימציית כניסה
        setTimeout(() => {
            article.style.opacity = '1';
            article.style.transform = 'translateY(0)';
        }, 100);

        return article;
    }

    // פונקציה לקיצור טקסט
    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // פונקציה לעיצוב תאריך
    function formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'היום';
        } else if (diffDays === 1) {
            return 'אתמול';
        } else if (diffDays < 7) {
            return `לפני ${diffDays} ימים`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `לפני ${weeks} ${weeks === 1 ? 'שבוע' : 'שבועות'}`;
        } else {
            return date.toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    // הצגת הודעת שגיאה
    function showError(message = null) {
        instagramFeed.innerHTML = '';
        instagramError.style.display = 'block';

        if (message) {
            const errorText = instagramError.querySelector('p');
            if (errorText) {
                errorText.textContent = message;
            }
        }
    }

    // הצגת הודעת הגדרה
    function showConfigurationMessage() {
        instagramFeed.innerHTML = `
            <div class="instagram-error" style="display: block;">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <h3>נדרשת הגדרת Instagram API</h3>
                <p>כדי להציג פוסטים מאינסטגרם, יש להגדיר את ה-Access Token.<br>
                עיינו בקובץ <strong>INSTAGRAM_SETUP.md</strong> להוראות מפורטות.</p>
                <a href="https://www.instagram.com/nourish.viktoria/" target="_blank" rel="noopener noreferrer" class="instagram-link-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    בקרו אותנו באינסטגרם
                </a>
            </div>
        `;
    }

    // טעינת הפוסטים בטעינת הדף
    if (instagramFeed) {
        loadInstagramPosts();
    }
});
