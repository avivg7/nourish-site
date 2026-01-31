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

    // ===============================================
    // מתכונים - מודל אינטראקטיבי
    // ===============================================

    // נתוני מתכונים
    const recipesData = {
        1: {
            title: "קערת בוקר מזינה",
            time: "10 דקות",
            servings: "2 מנות",
            difficulty: "קל",
            intro: "קערת שיבולת שועל קלאסית ומזינה, עשירה בסיבים תזונתיים וחלבון. מושלמת להתחלת יום אנרגטית.",
            ingredients: [
                "1 כוס שיבולת שועל",
                "2 כוסות חלב/משקה צמחי",
                "1 בננה בשלה",
                "2 כפות אגוזי מלך קצוצים",
                "1 כפית קינמון",
                "1 כף דבש/סילאן",
                "פירות עונה לקישוט",
                "1 כף זרעי צ'יה (אופציונלי)"
            ],
            instructions: [
                "בסיר בינוני, הביאו את החלב לרתיחה על אש בינונית",
                "הוסיפו את שיבולת השועל והקטינו את האש",
                "בשלו תוך כדי ערבוב מדי פעם למשך 5 דקות",
                "מרסקו את הבננה והוסיפו לקערה",
                "הוסיפו קינמון ודבש וערבבו היטב",
                "מחלקים לשתי קערות",
                "מקשטים באגוזים, פירות וזרעי צ'יה",
                "הגישו חם ותיהנו!"
            ],
            nutrition: {
                calories: "320",
                protein: "12g",
                carbs: "45g",
                fat: "10g",
                fiber: "8g"
            }
        },
        2: {
            title: "סלט קינואה צבעוני",
            time: "25 דקות",
            servings: "4 מנות",
            difficulty: "בינוני",
            intro: "סלט קינואה טרי ומרענן, עשיר בחלבון צמחי וירקות צבעוניים. ארוחה שלמה ומאוזנת.",
            ingredients: [
                "1 כוס קינואה לא מבושלת",
                "2 כוסות מים",
                "1 מלפפון קצוץ לקוביות",
                "2 עגבניות שרי חתוכות לרבעים",
                "1 פלפל אדום קצוץ",
                "1 גזר מגורד",
                "1/2 בצל סגול קצוץ דק",
                "2 כפות פטרוזיליה טרייה",
                "מיץ מ-2 לימונים",
                "3 כפות שמן זית",
                "מלח ופלפל שחור לפי הטעם"
            ],
            instructions: [
                "שוטפים את הקינואה במים קרים",
                "מבשלים את הקינואה במים רותחים עם קורט מלח למשך 15 דקות",
                "מסננים ומצננים את הקינואה",
                "חותכים את כל הירקות לגדלים אחידים",
                "בקערה גדולה, מערבבים את הקינואה המקוררת עם הירקות",
                "מכינים רוטב: מערבבים מיץ לימון, שמן זית, מלח ופלפל",
                "שופכים את הרוטב על הסלט ומערבבים היטב",
                "מצננים במקרר לפחות 30 דקות לפני ההגשה",
                "מגישים קר ותיהנו!"
            ],
            nutrition: {
                calories: "285",
                protein: "9g",
                carbs: "38g",
                fat: "11g",
                fiber: "6g"
            }
        },
        3: {
            title: "חביתת ירקות בתנור",
            time: "35 דקות",
            servings: "6 מנות",
            difficulty: "קל",
            intro: "חביתה אפויה עשירה בחלבון וירקות. מנה מושלמת לארוחת צהריים או ערב משפחתית.",
            ingredients: [
                "8 ביצים גדולות",
                "1/2 כוס חלב",
                "2 כוסות תרד קפוא (מופשר)",
                "1 בצל גדול קצוץ",
                "2 פלפלים צבעוניים קצוצים",
                "3 עגבניות חתוכות לפרוסות",
                "1 כוס גבינה לבנה 5%",
                "2 שיני שום כתושות",
                "מלח, פלפל ופלפל אדום חריף",
                "2 כפות שמן זית"
            ],
            instructions: [
                "מחממים תנור ל-180 מעלות",
                "בפלנצ'ה, מחממים שמן ומטגנים בצל עד הזהבה",
                "מוסיפים פלפלים ושום ומטגנים 3 דקות",
                "מוסיפים תרד ומבשלים עד שהנוזלים מתאדים",
                "בקערה, טורפים ביצים עם חלב, מלח ופלפל",
                "משמנים תבנית אפייה ושופכים את תערובת הביצים",
                "מוסיפים את הירקות המטוגנים ומערבבים קלות",
                "מפזרים פרוסות עגבניות וגבינה לבנה מעל",
                "אופים 25-30 דקות עד שהחביתה מוצקה",
                "מצננים 5 דקות, חותכים למנות ומגישים"
            ],
            nutrition: {
                calories: "195",
                protein: "16g",
                carbs: "8g",
                fat: "11g",
                fiber: "2g"
            }
        },
        4: {
            title: "כדורי אנרגיה טבעיים",
            time: "15 דקות",
            servings: "12 כדורים",
            difficulty: "קל",
            intro: "חטיף בריא ומתוק טבעי, עשיר באנרגיה ובחומרים מזינים. מושלם לפני פעילות גופנית.",
            ingredients: [
                "1 כוס תמרים ללא גלעין",
                "1 כוס שקדים נאים",
                "2 כפות קקאו",
                "2 כפות קוקוס מגורד",
                "1 כפית תמצית וניל",
                "קורט מלח",
                "2 כפות מים (אם נדרש)",
                "שקדים שלמים לקישוט"
            ],
            instructions: [
                "במעבד מזון, טוחנים את השקדים לפירורים גסים",
                "מוסיפים את התמרים וממשיכים לעבד",
                "מוסיפים קקאו, קוקוס, וניל ומלח",
                "מעבדים עד לקבלת בצק דביק",
                "אם הבצק יבש מדי, מוסיפים מעט מים",
                "לוקחים כפית מהתערובת ומגלגלים לכדור",
                "לוחצים שקד שלם במרכז כל כדור",
                "מגלגלים בקוקוס מגורד לקישוט (אופציונלי)",
                "מצננים במקרר לפחות שעה",
                "שומרים במקרר עד שבוע"
            ],
            nutrition: {
                calories: "110",
                protein: "3g",
                carbs: "14g",
                fat: "6g",
                fiber: "3g"
            }
        },
        5: {
            title: "מרק ירקות חורפי",
            time: "45 דקות",
            servings: "6 מנות",
            difficulty: "בינוני",
            intro: "מרק עשיר ומחמם, מלא בירקות עונתיים ועדשים. מושלם לערב חורף קר.",
            ingredients: [
                "2 בצלים גדולים קצוצים",
                "3 גזרים חתוכים לקוביות",
                "2 בטטות חתוכות לקוביות",
                "1 כוס עדשים כתומות",
                "2 עגבניות גדולות קצוצות",
                "4 שיני שום כתושות",
                "2 ליטר מרק ירקות",
                "1 כפית כורכום",
                "1 כפית כמון",
                "מלח ופלפל שחור",
                "3 כפות שמן זית",
                "פטרוזיליה טרייה לקישוט"
            ],
            instructions: [
                "בסיר גדול, מחממים שמן זית על אש בינונית",
                "מוסיפים בצל ומטגנים 5 דקות עד הזהבה",
                "מוסיפים שום ותבלינים ומטגנים דקה נוספת",
                "מוסיפים גזר ובטטה ומערבבים",
                "שופכים את מרק הירקות ומביאים לרתיחה",
                "מוסיפים עדשים ועגבניות",
                "מורידים לאש נמוכה ומבשלים 30 דקות",
                "טועמים ומתבלים במלח ופלפל",
                "אפשר לטחון חלק מהמרק לקבלת מרק סמיך יותר",
                "מגישים חם עם פטרוזיליה טרייה"
            ],
            nutrition: {
                calories: "245",
                protein: "11g",
                carbs: "42g",
                fat: "4g",
                fiber: "10g"
            }
        },
        6: {
            title: "סמוזי ירוק מרענן",
            time: "5 דקות",
            servings: "2 מנות",
            difficulty: "קל",
            intro: "משקה ירוק מזין ומרענן, עשיר בוויטמינים ומינרלים. התחלה מושלמת ליום.",
            ingredients: [
                "2 כוסות תרד טרי",
                "1 בננה בשלה קפואה",
                "1/2 אבוקדו",
                "1 כוס משקה שקדים",
                "מיץ מ-1/2 לימון",
                "1 כף דבש או סילאן",
                "1/2 כוס קוביות קרח",
                "1 כף זרעי פשתן (אופציונלי)"
            ],
            instructions: [
                "שוטפים היטב את התרד",
                "שמים את כל המרכיבים בבלנדר",
                "מערבלים במהירות גבוהה למשך דקה",
                "בודקים את העקביות ומוסיפים נוזלים אם נדרש",
                "טועמים ומתקנים מתיקות אם צריך",
                "שופכים לכוסות",
                "מגישים מיד וקרים"
            ],
            nutrition: {
                calories: "185",
                protein: "4g",
                carbs: "28g",
                fat: "8g",
                fiber: "6g"
            }
        }
    };

    // פונקציה ליצירת תוכן המודל
    function createModalContent(recipeId) {
        const recipe = recipesData[recipeId];
        if (!recipe) return '';

        return `
            <div class="modal-recipe-header">
                <h2 id="modal-title">${recipe.title}</h2>
                <div class="modal-recipe-meta">
                    <span>⏱️ ${recipe.time}</span>
                    <span>👥 ${recipe.servings}</span>
                    <span>📊 ${recipe.difficulty}</span>
                </div>
            </div>

            <p class="modal-recipe-intro">${recipe.intro}</p>

            <div class="modal-recipe-section">
                <h3>מצרכים</h3>
                <ul class="modal-ingredients-list">
                    ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
            </div>

            <div class="modal-recipe-section">
                <h3>אופן ההכנה</h3>
                <ol class="modal-instructions-list">
                    ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                </ol>
            </div>

            <div class="modal-nutrition-info">
                <h3 style="text-align: center; margin-bottom: 16px;">ערכים תזונתיים למנה</h3>
                <div class="modal-nutrition-grid">
                    <div class="modal-nutrition-item">
                        <span class="modal-nutrition-value">${recipe.nutrition.calories}</span>
                        <span class="modal-nutrition-label">קלוריות</span>
                    </div>
                    <div class="modal-nutrition-item">
                        <span class="modal-nutrition-value">${recipe.nutrition.protein}</span>
                        <span class="modal-nutrition-label">חלבון</span>
                    </div>
                    <div class="modal-nutrition-item">
                        <span class="modal-nutrition-value">${recipe.nutrition.carbs}</span>
                        <span class="modal-nutrition-label">פחמימות</span>
                    </div>
                    <div class="modal-nutrition-item">
                        <span class="modal-nutrition-value">${recipe.nutrition.fat}</span>
                        <span class="modal-nutrition-label">שומן</span>
                    </div>
                    <div class="modal-nutrition-item">
                        <span class="modal-nutrition-value">${recipe.nutrition.fiber}</span>
                        <span class="modal-nutrition-label">סיבים</span>
                    </div>
                </div>
            </div>
        `;
    }

    // פתיחת מודל
    function openRecipeModal(recipeId) {
        const modal = document.getElementById('recipe-modal');
        const modalBody = document.getElementById('modal-body');

        if (!modal || !modalBody) return;

        // יצירת תוכן המודל
        modalBody.innerHTML = createModalContent(recipeId);

        // פתיחת המודל עם אנימציה
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // מיקוד על המודל
        modal.querySelector('.recipe-modal-close').focus();
    }

    // סגירת מודל
    function closeRecipeModal() {
        const modal = document.getElementById('recipe-modal');
        if (!modal) return;

        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // האזנה ללחיצות על כרטיסי מתכונים
    const recipeCards = document.querySelectorAll('.recipe-card');
    recipeCards.forEach(card => {
        const viewBtn = card.querySelector('.recipe-view-btn');
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const recipeId = card.getAttribute('data-recipe');
                openRecipeModal(recipeId);
            });
        }
    });

    // סגירת מודל בלחיצה על כפתור הסגירה
    const modalCloseBtn = document.querySelector('.recipe-modal-close');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeRecipeModal);
    }

    // סגירת מודל בלחיצה על הרקע
    const modalOverlay = document.querySelector('.recipe-modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeRecipeModal);
    }

    // סגירת מודל עם מקש Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('recipe-modal');
            if (modal && modal.classList.contains('active')) {
                closeRecipeModal();
            }
        }
    });
});
