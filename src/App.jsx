import { useState, useRef, useEffect } from "react";
import "./app.css";

const PHASES_MAP = {
  villa: ["أعمال تحضيرية","حفر وردم","هيكل إنشائي","بناء (مباني)","عزل مائي وحراري","لياسة","كهرباء","سباكة","تكييف","بلاط وأرضيات","دهان وتشطيبات","أعمال خارجية ولاندسكيب"],
  road: ["أعمال تحضيرية","أعمال ترابية","طبقة تأسيس Subgrade","طبقة أساس Sub-base","طبقة أساس Base Course","رشات تأسيسية MC/RC","طبقة أسفلتية","أرصفة وبردورات","علامات وإشارات مرورية","إنارة طرق"],
  humanization: ["أعمال تحضيرية","أعمال ترابية","ممرات مشاة","أرصفة وبردورات","إنارة ديكورية","تنسيق مواقع","أنظمة ري","عناصر تأثيث حضري","لوحات إرشادية"],
  commercial: ["أعمال تحضيرية","حفر وردم","هيكل إنشائي","بناء","عزل","لياسة","كهرباء","سباكة","تكييف مركزي","مصاعد","تشطيبات","واجهات","أعمال خارجية"]
};

const PROJECT_TYPES = [
  { id: "villa", label: "فيلا سكنية", icon: "🏠", desc: "فلل ومنازل سكنية" },
  { id: "road", label: "مشروع طرق", icon: "🛣️", desc: "طرق وبنية تحتية" },
  { id: "humanization", label: "أنسنة مدن", icon: "🌳", desc: "تنسيق مواقع وممرات" },
  { id: "commercial", label: "مبنى تجاري", icon: "🏢", desc: "مباني تجارية وإدارية" }
];

const CITIES = ["مكة المكرمة","جدة","الرياض","المدينة المنورة","الدمام","الخبر","الطائف","أبها","تبوك","حائل","نجران","جازان","ينبع","القصيم"];

export default function App() {
  const [step, setStep] = useState("input");
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    projectName: "",
    projectType: "",
    area: "",
    floors: "2",
    hasBasement: false,
    city: "مكة المكرمة",
    finishLevel: "standard",
    notes: ""
  });
  const [phases, setPhases] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [expandedPhases, setExpandedPhases] = useState({});
  const resultRef = useRef(null);

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const togglePhase = (idx) => {
    setExpandedPhases(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const collapseAll = () => {
    const all = {};
    phases.forEach((_, i) => { all[i] = false; });
    setExpandedPhases(all);
  };
  const expandAll = () => {
    const all = {};
    phases.forEach((_, i) => { all[i] = true; });
    setExpandedPhases(all);
  };

  const buildPrompt = (phaseName) => {
    const typeLabel = PROJECT_TYPES.find(t => t.id === form.projectType)?.label || "فيلا سكنية";
    const finishLabel = form.finishLevel === "economy" ? "اقتصادي" : form.finishLevel === "standard" ? "متوسط (ستاندرد)" : "فاخر (لوكس)";
    return `أنت مهندس مقايسات سعودي خبير في الكود السعودي SBC ومعايير وزارة البلديات والإسكان. أنشئ بنود تنفيذية لمرحلة "${phaseName}" فقط.

معطيات المشروع:
- النوع: ${typeLabel}
- المساحة: ${form.area} م²
- عدد الأدوار: ${form.floors}
- قبو: ${form.hasBasement ? "نعم" : "لا"}
- المدينة: ${form.city}
- مستوى التشطيب: ${finishLabel}
${form.notes ? `- ملاحظات إضافية: ${form.notes}` : ""}

أرجع JSON فقط بدون أي نص آخر أو backticks بالشكل التالي:
[{"code":"XX-01","desc":"وصف البند الفني الدقيق بالعربي","unit":"م2 أو م3 أو م.ط أو عدد أو طن أو مقطوعية أو نقطة أو طقم","qty":100,"price":50,"notes":"ملاحظة تنفيذية قصيرة"}]

القواعد:
- استخدم مصطلحات هندسية دقيقة (مثلاً: توريد وصب خرسانة مسلحة، توريد وفرد ورص...)
- الأسعار بالريال السعودي وفق متوسط أسعار سوق ${form.city} لعام 2025/2026
- عدد البنود من 3 إلى 8 حسب أهمية المرحلة
- احسب الكميات التقديرية بناءً على المساحة ${form.area} م² وعدد الأدوار ${form.floors}
- رمز البند: حرفين إنجليز كبيرة + رقم تسلسلي (مثل: RC-01, EW-02)`;
  };

  const generateBOQ = async () => {
    if (!form.projectName || !form.projectType || !form.area) return;
    setLoading(true);
    setStep("loading");
    setProgress(0);
    setPhases([]);
    setError("");

    const phaseNames = PHASES_MAP[form.projectType] || PHASES_MAP.villa;
    const allPhases = [];

    for (let i = 0; i < phaseNames.length; i++) {
      const phaseName = phaseNames[i];
      setLoadingPhase(phaseName);
      setProgress(Math.round(((i) / phaseNames.length) * 100));

      const prompt = buildPrompt(phaseName);

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const text = (data.content || []).map(c => c.text || "").join("");
        const clean = text.replace(/```json|```/g, "").trim();

        let items = [];
        try { items = JSON.parse(clean); } catch { items = []; }

        allPhases.push({
          name: phaseName,
          items: items.map(item => ({
            code: item.code || "—",
            desc: item.desc || "",
            unit: item.unit || "",
            qty: Number(item.qty) || 0,
            price: Number(item.price) || 0,
            notes: item.notes || ""
          }))
        });
      } catch (err) {
        if (err.message.includes("ANTHROPIC_API_KEY")) {
          setError("لم يتم تعيين مفتاح API. أضف ANTHROPIC_API_KEY في إعدادات Vercel Environment Variables.");
          setStep("input");
          setLoading(false);
          return;
        }
        allPhases.push({ name: phaseName, items: [] });
      }
    }

    setPhases(allPhases);
    setProgress(100);
    const expanded = {};
    allPhases.forEach((_, i) => { expanded[i] = true; });
    setExpandedPhases(expanded);

    setTimeout(() => {
      setLoading(false);
      setStep("result");
    }, 400);
  };

  const deleteItem = (pi, ii) => {
    setPhases(prev => prev.map((p, i) => i === pi ? { ...p, items: p.items.filter((_, j) => j !== ii) } : p));
  };

  const updateItem = (pi, ii, field, value) => {
    setPhases(prev => prev.map((p, pidx) => pidx === pi ? {
      ...p,
      items: p.items.map((item, iidx) => iidx === ii ? { ...item, [field]: (field === "qty" || field === "price") ? Number(value) || 0 : value } : item)
    } : p));
    setEditingCell(null);
  };

  const getPhaseTotal = (p) => p.items.reduce((s, i) => s + i.qty * i.price, 0);
  const getGrandTotal = () => phases.reduce((s, p) => s + getPhaseTotal(p), 0);
  const getTotalItems = () => phases.reduce((s, p) => s + p.items.length, 0);

  const exportCSV = () => {
    let csv = "\uFEFF" + "رمز البند,وصف البند,الوحدة,الكمية,سعر الوحدة,الإجمالي,المرحلة,ملاحظات\n";
    phases.forEach(p => {
      p.items.forEach(item => {
        csv += `"${item.code}","${item.desc}","${item.unit}",${item.qty},${item.price},${item.qty * item.price},"${p.name}","${item.notes}"\n`;
      });
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BOQ_${form.projectName}.csv`;
    a.click();
  };

  const exportJSON = () => {
    const data = {
      project: form,
      generatedAt: new Date().toISOString(),
      phases,
      summary: {
        totalItems: getTotalItems(),
        grandTotal: getGrandTotal(),
        vat: Math.round(getGrandTotal() * 0.15),
        totalWithVat: Math.round(getGrandTotal() * 1.15)
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BOQ_${form.projectName}.json`;
    a.click();
  };

  const printTable = () => window.print();

  useEffect(() => {
    if (step === "result" && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [step]);

  const isFormValid = form.projectName && form.projectType && form.area;

  return (
    <div className="app-root">
      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <div className="logo-group">
            <div className="logo-icon">⚙️</div>
            <div>
              <h1 className="logo-title">منصة المقايسات الذكية</h1>
              <p className="logo-sub">مولّد بنود تنفيذي بالذكاء الاصطناعي — وفق الكود السعودي SBC</p>
            </div>
          </div>
          {step === "result" && (
            <div className="header-actions">
              <button className="btn-ghost" onClick={() => { setStep("input"); setPhases([]); }}>← مشروع جديد</button>
              <button className="btn-ghost" onClick={exportCSV}>📊 CSV</button>
              <button className="btn-ghost" onClick={exportJSON}>📁 JSON</button>
              <button className="btn-ghost" onClick={printTable}>🖨️ طباعة</button>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        {/* ERROR */}
        {error && (
          <div className="error-banner">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={() => setError("")}>✕</button>
          </div>
        )}

        {/* ───── INPUT STEP ───── */}
        {step === "input" && (
          <div className="fade-up">
            <div className="card input-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">أدخل معطيات مشروعك</h2>
                  <p className="card-subtitle">سيقوم الذكاء الاصطناعي بتحليل المشروع وتوليد جدول بنود تنفيذي مسعّر</p>
                </div>
              </div>

              {/* Project Type */}
              <div className="section">
                <label className="field-label">نوع المشروع <span className="required">*</span></label>
                <div className="type-grid">
                  {PROJECT_TYPES.map(t => (
                    <button key={t.id} className={`type-card ${form.projectType === t.id ? "active" : ""}`} onClick={() => updateForm("projectType", t.id)}>
                      <span className="type-icon">{t.icon}</span>
                      <span className="type-label">{t.label}</span>
                      <span className="type-desc">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fields Grid */}
              <div className="fields-grid">
                <div className="field">
                  <label className="field-label">اسم المشروع <span className="required">*</span></label>
                  <input className="input-field" placeholder="مثال: فيلا الياسمين" value={form.projectName} onChange={e => updateForm("projectName", e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">المساحة (م²) <span className="required">*</span></label>
                  <input className="input-field" type="number" placeholder="400" value={form.area} onChange={e => updateForm("area", e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">عدد الأدوار</label>
                  <select className="input-field select" value={form.floors} onChange={e => updateForm("floors", e.target.value)}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n === 1 ? "دور واحد" : `${n} أدوار`}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">المدينة</label>
                  <select className="input-field select" value={form.city} onChange={e => updateForm("city", e.target.value)}>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">مستوى التشطيب</label>
                  <select className="input-field select" value={form.finishLevel} onChange={e => updateForm("finishLevel", e.target.value)}>
                    <option value="economy">اقتصادي 💰</option>
                    <option value="standard">متوسط (ستاندرد) ⭐</option>
                    <option value="luxury">فاخر (لوكس) 👑</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">خيارات</label>
                  <label className="checkbox-wrap">
                    <input type="checkbox" checked={form.hasBasement} onChange={e => updateForm("hasBasement", e.target.checked)} />
                    <span>يوجد قبو (بدروم)</span>
                  </label>
                </div>
              </div>

              <div className="field" style={{ marginTop: 16 }}>
                <label className="field-label">ملاحظات إضافية</label>
                <textarea className="input-field textarea" rows={3} placeholder="أي تفاصيل إضافية عن المشروع..." value={form.notes} onChange={e => updateForm("notes", e.target.value)} />
              </div>

              <div className="submit-row">
                <button className="btn-primary" disabled={!isFormValid} onClick={generateBOQ}>
                  <span className="btn-icon">⚡</span>
                  توليد جدول البنود بالذكاء الاصطناعي
                </button>
                {!isFormValid && <p className="hint">يرجى تعبئة الحقول المطلوبة (*)</p>}
              </div>
            </div>
          </div>
        )}

        {/* ───── LOADING STEP ───── */}
        {step === "loading" && (
          <div className="fade-up loading-container">
            <div className="card loading-card">
              <div className="loading-icon">🤖</div>
              <h2 className="loading-title">جارٍ توليد البنود...</h2>
              <p className="loading-desc">الذكاء الاصطناعي يحلل مشروعك ويولّد البنود مرحلة بمرحلة</p>
              <div className="progress-box">
                <div className="progress-info">
                  <span className="progress-phase">{loadingPhase}</span>
                  <span className="progress-pct">{progress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <p className="loading-hint">يرجى الانتظار... قد تستغرق العملية 1-2 دقيقة</p>
            </div>
          </div>
        )}

        {/* ───── RESULT STEP ───── */}
        {step === "result" && (
          <div ref={resultRef} className="fade-up">
            {/* Summary Bar */}
            <div className="card summary-bar">
              <div className="summary-info">
                <h2 className="project-title">{form.projectName}</h2>
                <p className="project-meta">
                  {PROJECT_TYPES.find(t => t.id === form.projectType)?.icon}{" "}
                  {PROJECT_TYPES.find(t => t.id === form.projectType)?.label} • {form.area} م² • {form.floors} أدوار • {form.city}
                </p>
              </div>
              <div className="stats-row">
                <div className="stat">
                  <span className="stat-label">البنود</span>
                  <span className="stat-value amber">{getTotalItems()}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">المراحل</span>
                  <span className="stat-value blue">{phases.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">قبل الضريبة</span>
                  <span className="stat-value green">{getGrandTotal().toLocaleString()}<small> ر.س</small></span>
                </div>
                <div className="stat highlight">
                  <span className="stat-label">شامل 15%</span>
                  <span className="stat-value amber">{Math.round(getGrandTotal() * 1.15).toLocaleString()}<small> ر.س</small></span>
                </div>
              </div>
            </div>

            {/* Collapse/Expand Controls */}
            <div className="controls-row">
              <button className="btn-ghost small" onClick={expandAll}>فتح الكل ▼</button>
              <button className="btn-ghost small" onClick={collapseAll}>إغلاق الكل ▲</button>
            </div>

            {/* Phases */}
            {phases.map((phase, pi) => (
              <div key={pi} className="card phase-card">
                <div className="phase-header" onClick={() => togglePhase(pi)}>
                  <div className="phase-title-group">
                    <span className={`phase-arrow ${expandedPhases[pi] ? "open" : ""}`}>◀</span>
                    <span className="phase-num">{pi + 1}</span>
                    <span className="phase-name">{phase.name}</span>
                    <span className="phase-badge">{phase.items.length} بنود</span>
                  </div>
                  <span className="phase-total">{getPhaseTotal(phase).toLocaleString()} ر.س</span>
                </div>

                {expandedPhases[pi] && phase.items.length > 0 && (
                  <div className="phase-body">
                    <div className="t-row t-header">
                      <span>الرمز</span>
                      <span>وصف البند الفني</span>
                      <span>الوحدة</span>
                      <span>الكمية</span>
                      <span>السعر</span>
                      <span>الإجمالي</span>
                      <span>ملاحظات</span>
                      <span></span>
                    </div>
                    {phase.items.map((item, ii) => (
                      <div key={ii} className="t-row">
                        <span className="cell-code">{item.code}</span>
                        <span className="cell-desc">{item.desc}</span>
                        <span className="cell-unit">{item.unit}</span>

                        {editingCell === `${pi}-${ii}-qty` ? (
                          <input className="cell-edit" type="number" defaultValue={item.qty} autoFocus
                            onBlur={e => updateItem(pi, ii, "qty", e.target.value)}
                            onKeyDown={e => e.key === "Enter" && updateItem(pi, ii, "qty", e.target.value)} />
                        ) : (
                          <span className="cell-editable" onClick={() => setEditingCell(`${pi}-${ii}-qty`)}>{item.qty.toLocaleString()}</span>
                        )}

                        {editingCell === `${pi}-${ii}-price` ? (
                          <input className="cell-edit" type="number" defaultValue={item.price} autoFocus
                            onBlur={e => updateItem(pi, ii, "price", e.target.value)}
                            onKeyDown={e => e.key === "Enter" && updateItem(pi, ii, "price", e.target.value)} />
                        ) : (
                          <span className="cell-editable cell-price" onClick={() => setEditingCell(`${pi}-${ii}-price`)}>{item.price.toLocaleString()}</span>
                        )}

                        <span className="cell-total">{(item.qty * item.price).toLocaleString()}</span>
                        <span className="cell-notes">{item.notes}</span>
                        <button className="del-btn" onClick={() => deleteItem(pi, ii)} title="حذف">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                {expandedPhases[pi] && phase.items.length === 0 && (
                  <div className="phase-empty">لم يتم توليد بنود لهذه المرحلة</div>
                )}
              </div>
            ))}

            {/* Grand Total */}
            <div className="card grand-total-card">
              <div className="grand-grid">
                <div className="grand-item">
                  <span className="grand-label">الإجمالي قبل الضريبة</span>
                  <span className="grand-value">{getGrandTotal().toLocaleString()} <small>ر.س</small></span>
                </div>
                <div className="grand-item red">
                  <span className="grand-label">ضريبة القيمة المضافة (15%)</span>
                  <span className="grand-value">{Math.round(getGrandTotal() * 0.15).toLocaleString()} <small>ر.س</small></span>
                </div>
                <div className="grand-item gold">
                  <span className="grand-label">الإجمالي شاملاً الضريبة</span>
                  <span className="grand-value big">{Math.round(getGrandTotal() * 1.15).toLocaleString()} <small>ر.س</small></span>
                </div>
              </div>
            </div>

            <footer className="result-footer">
              <p className="disclaimer">تنبيه: الأسعار تقديرية وفق متوسط سوق {form.city} 2025/2026 — يمكنك تعديل أي كمية أو سعر بالنقر عليه مباشرة</p>
              <p className="credit">بواسطة المهندس جاسر العتيبي</p>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}
