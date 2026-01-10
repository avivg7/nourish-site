// ===============================================
// תפריט נגישות
// ===============================================
document.addEventListener('DOMContentLoaded', function() {
    // אתחול משתנים
    const accessibilityToggle = document.getElementById('accessibility-toggle');
    const accessibilityOptions = document.getElementById('accessibility-options');
    const accessibilityButtons = document.querySelectorAll('.accessibility-btn');
    const root = document.documentElement;
    let currentFontScale = 1;

    // טעינת הגדרות נגישות שמורות מ-localStorage
    loadAccessibilitySettings();

    // פתיחה/סגירה של תפריט הנגישות
    accessibilityToggle.addEventListener('click', function() {
        const isExpanded = accessibilityToggle.getAttribute('aria-expanded') === 'true';
        accessibilityToggle.setAttribute('aria-expanded', !isExpanded);
        accessibilityOptions.classList.toggle('active');
        accessibilityOptions.setAttribute('aria-hidden', isExpanded);
    });

    // סגירת תפריט הנגישות בלחיצה מחוץ לתפריט
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.accessibility-menu')) {
            accessibilityOptions.classList.remove('active');
            accessibilityToggle.setAttribute('aria-expanded', 'false');
            accessibilityOptions.setAttribute('aria-hidden', 'true');
        }
    });

    // פעולות הנגישות
    accessibilityButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');

            switch(action) {
                case 'increase-font':
                    increaseFontSize();
                    break;
                case 'decrease-font':
                    decreaseFontSize();
                    break;
                case 'high-contrast':
                    toggleHighContrast();
                    break;
                case 'reset':
                    resetAccessibility();
                    break;
            }
        });
    });

    // הגדלת גופן
    function increaseFontSize() {
        if (currentFontScale < 1.5) {
            currentFontScale += 0.1;
            root.style.setProperty('--font-size-scale', currentFontScale);
            saveAccessibilitySettings();
            announceToScreenReader('גופן הוגדל');
        }
    }

    // הקטנת גופן
    function decreaseFontSize() {
        if (currentFontScale > 0.8) {
            currentFontScale -= 0.1;
            root.style.setProperty('--font-size-scale', currentFontScale);
            saveAccessibilitySettings();
            announceToScreenReader('גופן הוקטן');
        }
    }

    // החלפת מצב ניגודיות גבוהה
    function toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
        const isHighContrast = document.body.classList.contains('high-contrast');
        saveAccessibilitySettings();
        announceToScreenReader(isHighContrast ? 'ניגודיות גבוהה הופעלה' : 'ניגודיות גבוהה בוטלה');
    }

    // איפוס הגדרות נגישות
    function resetAccessibility() {
        currentFontScale = 1;
        root.style.setProperty('--font-size-scale', 1);
        document.body.classList.remove('high-contrast');
        localStorage.removeItem('accessibilitySettings');
        announceToScreenReader('הגדרות נגישות אופסו');
    }

    // שמירת הגדרות נגישות ב-localStorage
    function saveAccessibilitySettings() {
        const settings = {
            fontScale: currentFontScale,
            highContrast: document.body.classList.contains('high-contrast')
        };
        localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    }

    // טעינת הגדרות נגישות מ-localStorage
    function loadAccessibilitySettings() {
        const savedSettings = localStorage.getItem('accessibilitySettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            currentFontScale = settings.fontScale || 1;
            root.style.setProperty('--font-size-scale', currentFontScale);
            if (settings.highContrast) {
                document.body.classList.add('high-contrast');
            }
        }
    }

    // הודעה לקוראי מסך
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // ===============================================
    // תפריט ניווט נייד
    // ===============================================
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            navLinks.classList.toggle('active');

            // אנימציית המבורגר
            const hamburgers = mobileMenuToggle.querySelectorAll('.hamburger');
            if (navLinks.classList.contains('active')) {
                hamburgers[0].style.transform = 'rotate(45deg) translateY(8px)';
                hamburgers[1].style.opacity = '0';
                hamburgers[2].style.transform = 'rotate(-45deg) translateY(-8px)';
            } else {
                hamburgers[0].style.transform = 'none';
                hamburgers[1].style.opacity = '1';
                hamburgers[2].style.transform = 'none';
            }
        });

        // סגירת התפריט בלחיצה על קישור
        const navLinksItems = navLinks.querySelectorAll('a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                const hamburgers = mobileMenuToggle.querySelectorAll('.hamburger');
                hamburgers[0].style.transform = 'none';
                hamburgers[1].style.opacity = '1';
                hamburgers[2].style.transform = 'none';
            });
        });
    }

    // ===============================================
    // גלילה חלקה לעוגנים
    // ===============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = target.offsetTop - navbarHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ===============================================
    // צמצום navbar והסתרת/הצגת כפתור וואטסאפ צף בגלילה
    // ===============================================
    const whatsappFloat = document.querySelector('.whatsapp-float');
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // צמצום ה-navbar כשגוללים למטה
        if (navbar) {
            if (scrollTop > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        }

        // התצוגה של כפתור הוואטסאפ
        if (whatsappFloat) {
            if (scrollTop > 300) {
                whatsappFloat.style.opacity = '1';
                whatsappFloat.style.visibility = 'visible';
            } else {
                whatsappFloat.style.opacity = '0.7';
            }
        }
    });

    // ===============================================
    // אנימציית כניסה לאלמנטים בגלילה
    // ===============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // צפייה באלמנטים שצריכים אנימציה
    const animatedElements = document.querySelectorAll('.service-card, .about-content, .contact-content');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(element);
    });

    // ===============================================
    // תמיכה במקלדת לניווט
    // ===============================================
    document.addEventListener('keydown', function(e) {
        // Escape לסגירת תפריטים
        if (e.key === 'Escape') {
            if (accessibilityOptions.classList.contains('active')) {
                accessibilityOptions.classList.remove('active');
                accessibilityToggle.setAttribute('aria-expanded', 'false');
                accessibilityOptions.setAttribute('aria-hidden', 'true');
                accessibilityToggle.focus();
            }
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                const hamburgers = mobileMenuToggle.querySelectorAll('.hamburger');
                hamburgers[0].style.transform = 'none';
                hamburgers[1].style.opacity = '1';
                hamburgers[2].style.transform = 'none';
            }
        }
    });

    // ===============================================
    // הגנה על מספרי טלפון מבוטים
    // ===============================================
    // הערה: בפרודקשן, עדיף להחליף את מספרי הטלפון בפונקציה דינמית
    // כדי למנוע סריקה אוטומטית על ידי בוטים

    // ===============================================
    // CSS נוסף עבור קוראי מסך
    // ===============================================
    const srOnlyStyle = document.createElement('style');
    srOnlyStyle.textContent = `
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        }
    `;
    document.head.appendChild(srOnlyStyle);

    // ===============================================
    // טעינה של תמונות בצורה עצלה (Lazy Loading)
    // ===============================================
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback לדפדפנים ישנים
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }

    // ===============================================
    // הודעת עוגיות (אופציונלי)
    // ===============================================
    // אם תרצי להוסיף הודעת עוגיות בעתיד, כאן המקום

    console.log('אתר התזונאית נטען בהצלחה! 🌱');
});
