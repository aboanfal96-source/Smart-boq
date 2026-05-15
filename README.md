# ⚙️ منصة المقايسات الذكية | Smart BOQ Platform

منصة ذكية لتوليد جداول البنود التنفيذية المسعّرة بالذكاء الاصطناعي وفق الكود السعودي للبناء (SBC).

بواسطة **المهندس جاسر العتيبي**

---

## 🚀 خطوات النشر على Vercel (3 دقائق فقط)

### الخطوة 1: ارفع المشروع على GitHub
1. أنشئ حساب على [github.com](https://github.com) (إذا لم يكن لديك)
2. اضغط **New Repository** وسمّه `smart-boq`
3. ارفع جميع ملفات هذا المجلد للمستودع

### الخطوة 2: انشر على Vercel
1. افتح [vercel.com](https://vercel.com) وسجّل دخول بحساب GitHub
2. اضغط **Add New → Project**
3. اختر مستودع `smart-boq`
4. Vercel سيكتشف الإعدادات تلقائياً — اضغط **Deploy**

### الخطوة 3: أضف مفتاح API (مهم!)
1. بعد النشر، اذهب لـ **Settings → Environment Variables**
2. أضف متغير جديد:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** مفتاح API الخاص بك من [console.anthropic.com](https://console.anthropic.com)
3. اضغط **Save**
4. اذهب لـ **Deployments** واضغط **Redeploy** على آخر نشر

### ✅ جاهز!
موقعك الآن يعمل على رابط مثل: `https://smart-boq.vercel.app`

---

## 🔑 الحصول على مفتاح Anthropic API

1. اذهب إلى [console.anthropic.com](https://console.anthropic.com)
2. سجّل حساب جديد أو ادخل بحسابك
3. اذهب لـ **API Keys** → **Create Key**
4. انسخ المفتاح واستخدمه في Vercel

---

## 📦 هيكل المشروع

```
smart-boq/
├── api/
│   └── generate.js        ← Serverless function (يتصل بـ Anthropic API)
├── src/
│   ├── App.jsx             ← المكون الرئيسي
│   ├── app.css             ← الأنماط
│   └── main.jsx            ← نقطة الدخول
├── index.html
├── vite.config.js
├── vercel.json
├── package.json
└── README.md
```

---

## 🛠️ تشغيل محلي (للمطورين)

```bash
npm install
npm run dev
```

> ملاحظة: للتشغيل المحلي مع API، استخدم Vercel CLI:
```bash
npm i -g vercel
vercel env pull    # لسحب المتغيرات
vercel dev         # تشغيل مع serverless functions
```

---

## 📋 المميزات

- ✅ توليد بنود تنفيذية بالذكاء الاصطناعي (Claude)
- ✅ دعم 4 أنواع مشاريع (فلل، طرق، أنسنة، تجاري)
- ✅ أسعار تقديرية وفق السوق السعودي
- ✅ تعديل الكميات والأسعار مباشرة
- ✅ حذف وإضافة بنود
- ✅ حساب ضريبة القيمة المضافة 15%
- ✅ تصدير CSV و JSON
- ✅ طباعة مباشرة
- ✅ تصميم متجاوب (موبايل + ديسكتوب)
- ✅ واجهة عربية كاملة RTL
