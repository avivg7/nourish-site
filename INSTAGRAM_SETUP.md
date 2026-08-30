# הוראות הגדרת Instagram API לעמוד "בלוג נושם"

מדריך זה יעזור לכם להגדיר את ה-Instagram Basic Display API כדי להציג את הפוסטים האחרונים שלכם בעמוד "בלוג נושם" באתר.

## תוכן עניינים
1. [דרישות מוקדמות](#דרישות-מוקדמות)
2. [שלב 1: יצירת אפליקציית Facebook](#שלב-1-יצירת-אפליקציית-facebook)
3. [שלב 2: הוספת Instagram Basic Display](#שלב-2-הוספת-instagram-basic-display)
4. [שלב 3: קבלת Access Token](#שלב-3-קבלת-access-token)
5. [שלב 4: הגדרת האתר](#שלב-4-הגדרת-האתר)
6. [שלב 5: חידוש Access Token](#שלב-5-חידוש-access-token)
7. [פתרון בעיות נפוצות](#פתרון-בעיות-נפוצות)

---

## דרישות מוקדמות

לפני שמתחילים, וודאו שיש לכם:
- ✅ חשבון Instagram עסקי או יוצר תוכן (Creator Account)
- ✅ חשבון Facebook Developer
- ✅ הפוסטים באינסטגרם מוגדרים כציבוריים

---

## שלב 1: יצירת אפליקציית Facebook

1. **היכנסו ל-Facebook Developers**
   - גשו לאתר: https://developers.facebook.com/
   - התחברו עם חשבון הFacebook שלכם

2. **יצירת אפליקציה חדשה**
   - לחצו על "My Apps" בתפריט העליון
   - לחצו על "Create App"
   - בחרו "Consumer" או "None" כסוג האפליקציה
   - מלאו את הפרטים:
     - **Display Name**: "אתר ויקי תזונאית" (או שם אחר לבחירתכם)
     - **App Contact Email**: כתובת המייל שלכם
   - לחצו על "Create App"

3. **שמירת App ID ו-App Secret**
   - בדף הראשי של האפליקציה, תמצאו:
     - **App ID**: מזהה האפליקציה
     - **App Secret**: לחצו על "Show" כדי לראות אותו
   - **חשוב**: שמרו את הערכים האלה במקום בטוח!

---

## שלב 2: הוספת Instagram Basic Display

1. **הוספת המוצר**
   - בדשבורד של האפליקציה, גללו למטה לקטגוריה "Add Products"
   - מצאו "Instagram Basic Display"
   - לחצו על "Set Up"

2. **הגדרת Basic Display**
   - לחצו על "Create New App"
   - מלאו את הפרטים:
     - **Valid OAuth Redirect URIs**:
       ```
       https://localhost/
       ```
       (אם יש לכם דומיין ספציפי, הוסיפו אותו)
     - **Deauthorize Callback URL**:
       ```
       https://localhost/
       ```
     - **Data Deletion Request URL**:
       ```
       https://localhost/
       ```
   - לחצו על "Save Changes"

3. **הוספת Instagram Tester**
   - גללו למטה לסקציה "User Token Generator"
   - לחצו על "Add or Remove Instagram Testers"
   - זה יפתח חלון חדש של Instagram
   - הזינו את שם המשתמש באינסטגרם שלכם (@nourish.viktoria)
   - שלחו בקשה

4. **אישור הבקשה**
   - היכנסו לחשבון האינסטגרם שלכם
   - עברו להגדרות (Settings)
   - לחצו על "Apps and Websites"
   - תראו בקשה ממתינה - אשרו אותה

---

## שלב 3: קבלת Access Token

### שיטה 1: דרך User Token Generator (הכי פשוטה)

1. **יצירת Token**
   - חזרו לדשבורד של האפליקציה ב-Facebook Developers
   - תחת "Instagram Basic Display" > "User Token Generator"
   - לחצו על "Generate Token" ליד חשבון האינסטגרם שלכם
   - תתבקשו להתחבר ולתת הרשאות - אשרו
   - **Access Token** יופיע - העתיקו אותו!

2. **שימור Access Token**
   - ה-Token שקיבלתם תקף ל-60 יום
   - כדי לקבל Long-Lived Token (תקף ל-60 יום, ניתן לחידוש):

   גשו לכתובת הבאה בדפדפן (החליפו את הערכים):
   ```
   https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=YOUR_APP_SECRET&access_token=YOUR_SHORT_LIVED_TOKEN
   ```

   תקבלו תשובה JSON עם `access_token` חדש - זהו ה-Long-Lived Token שלכם!

### שיטה 2: דרך OAuth Flow (מתקדמים)

אם אתם רוצים ליישם OAuth Flow מלא, עקבו אחרי ההוראות המפורטות בתיעוד הרשמי:
https://developers.facebook.com/docs/instagram-basic-display-api/getting-started

---

## שלב 4: הגדרת האתר

1. **פתיחת קובץ instagram-feed.js**
   - פתחו את הקובץ `/instagram-feed.js`

2. **עדכון הגדרות ה-API**
   - מצאו את השורות:
   ```javascript
   const INSTAGRAM_CONFIG = {
       accessToken: 'YOUR_INSTAGRAM_ACCESS_TOKEN',
       userId: 'YOUR_INSTAGRAM_USER_ID',
       limit: 5
   };
   ```

   - החליפו את הערכים:
     - `YOUR_INSTAGRAM_ACCESS_TOKEN`: הדביקו את ה-Access Token שקיבלתם
     - `YOUR_INSTAGRAM_USER_ID`: מזהה המשתמש שלכם (ניתן למצוא אותו בתשובת ה-API)
     - `limit`: מספר הפוסטים להצגה (ברירת מחדל: 5)

3. **שמירה והעלאה**
   - שמרו את הקובץ
   - העלו את הקובץ המעודכן לשרת

4. **בדיקה**
   - פתחו את העמוד `blog.html` בדפדפן
   - הפוסטים האחרונים מאינסטגרם אמורים להופיע!

---

## שלב 5: חידוש Access Token

ה-Long-Lived Access Token תקף ל-60 יום. לפני שהוא פג תוקף, יש לחדש אותו:

### חידוש אוטומטי (מומלץ)

כדי לחדש את ה-Token לפני שהוא פג תוקף, גשו לכתובת:

```
https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=YOUR_CURRENT_TOKEN
```

תקבלו תשובה עם `access_token` חדש ותוקף מעודכן.

### טיפים לחידוש:
- חדשו את ה-Token כל 50 יום (לפני שהוא פג תוקף)
- שמרו תזכורת ביומן או השתמשו בשירות אוטומטי
- אפשר ליצור סקריפט שרת שמחדש אוטומטית

---

## פתרון בעיות נפוצות

### הפוסטים לא מוצגים

**בעיה**: לא מופיעים פוסטים, רואים רק הודעת טעינה.

**פתרונות**:
1. בדקו שה-Access Token מעודכן ותקף
2. פתחו את Console בדפדפן (F12) ובדקו שגיאות
3. וודאו שחשבון האינסטגרם ציבורי
4. בדקו שהפוסטים מסוג IMAGE או CAROUSEL_ALBUM (לא VIDEO)

### שגיאת CORS

**בעיה**: שגיאה "Access to fetch has been blocked by CORS policy"

**פתרון**:
- בדיקת הדף צריכה להתבצע דרך שרת אמיתי (לא דרך `file://`)
- השתמשו בשרת מקומי כמו Live Server ב-VS Code

### Access Token פג תוקף

**בעיה**: הפוסטים הפסיקו להופיע לאחר 60 יום

**פתרון**:
1. חדשו את ה-Token כמתואר בשלב 5
2. עדכנו את הקובץ `instagram-feed.js` עם ה-Token החדש

### הפוסטים מוצגים באנגלית

**בעיה**: התאריכים או הטקסטים מוצגים באנגלית

**פתרון**:
- הקוד כבר מוגדר לעברית
- בדקו את הגדרות הדפדפן (שפה ואזור)

---

## אבטחה וצנעת הפרטים

⚠️ **חשוב מאוד!**

1. **לעולם אל תשתפו את ה-Access Token בפומבי**
   - אל תעלו אותו ל-GitHub או למאגר קוד פתוח
   - שמרו אותו במקום מאובטח

2. **הגנה מומלצת**:
   - השתמשו במשתני סביבה (Environment Variables)
   - או שמרו את ה-Token בקובץ נפרד שלא מועלה לגיט:
     - צרו קובץ `instagram-config.js`
     - הוסיפו אותו ל-`.gitignore`
     - ייבאו אותו ב-`instagram-feed.js`

3. **הרשאות מינימליות**
   - ה-Instagram Basic Display API דורש רק הרשאות קריאה בסיסיות
   - לא מעניק גישה לעריכת תוכן

---

## קישורים שימושיים

- 📚 [תיעוד רשמי - Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- 🔧 [Facebook Developers Dashboard](https://developers.facebook.com/apps/)
- 🧪 [Instagram Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- 📖 [הוראות Access Token](https://developers.facebook.com/docs/instagram-basic-display-api/guides/getting-access-tokens-and-permissions)

---

## תמיכה ועזרה

אם נתקלתם בבעיות:
1. בדקו את קונסולת הדפדפן לשגיאות מפורטות
2. עיינו בתיעוד הרשמי של Facebook
3. פנו לתמיכה הטכנית של Facebook Developers

---

**עודכן לאחרונה**: פברואר 2026
**גרסת API**: Instagram Basic Display API v18.0

בהצלחה! 🎉
