import { useState, useRef, useEffect } from "react";
import "./app.css";

const PROJECT_TYPES = [
  { id: "villa", label: "فيلا سكنية", icon: "🏠", desc: "فلل ومنازل" },
  { id: "road", label: "طرق وسفلتة", icon: "🛣️", desc: "طرق وبنية تحتية" },
  { id: "humanization", label: "أنسنة وتجميل", icon: "🌳", desc: "تنسيق وممرات" },
  { id: "commercial", label: "مبنى تجاري/إداري", icon: "🏢", desc: "مكاتب ومعارض" },
  { id: "flood", label: "درء سيول", icon: "🌊", desc: "قنوات وتصريف" },
  { id: "landscape", label: "تنسيق حدائق", icon: "🌺", desc: "حدائق ومتنزهات" },
  { id: "infrastructure", label: "بنية تحتية", icon: "🔧", desc: "مياه وصرف وكهرباء" },
  { id: "renovation", label: "ترميم وتأهيل", icon: "🔨", desc: "ترميم مباني قائمة" },
];

const PHASES_MAP = {
  villa: ["أعمال تحضيرية وموقع عام","حفر وردم وأعمال ترابية","خرسانة عادية ومسلحة (هيكل إنشائي)","أعمال البناء بالبلوك","عزل مائي وحراري","لياسة داخلية وخارجية","تمديدات كهربائية","تمديدات صحية (سباكة)","تكييف","بلاط وأرضيات","دهان وتشطيبات نهائية","أبواب ونوافذ","أعمال خارجية وسور ولاندسكيب"],
  road: ["أعمال تحضيرية ومساحية","إزالات وأعمال ترابية","تسوية وتحضير طبقة التأسيس Subgrade","طبقة ما تحت الأساس Sub-base","طبقة الأساس الحصوية Base Course","رشات تأسيسية (Prime Coat MC-1)","طبقة الأسفلت الرابطة Binder Course","طبقة الأسفلت السطحية Wearing Course","بردورات وأرصفة خرسانية","أعمال تصريف مياه الأمطار","علامات أرضية وإشارات مرورية","إنارة الطرق","اختبارات ومراقبة الجودة"],
  humanization: ["أعمال تحضيرية وإزالات","أعمال ترابية وتسوية","ممرات مشاة وأرصفة","بردورات ومحددات خرسانية وجرانيت","إنارة ديكورية وأعمدة زينة","تنسيق مواقع وزراعة أشجار ونخيل","شبكات ري أوتوماتيك","عناصر تأثيث حضري (مقاعد، مظلات، سلال)","نوافير ومسطحات مائية","لوحات إرشادية وتعريفية","أعمال تصريف مياه أمطار"],
  commercial: ["أعمال تحضيرية وموقع عام","حفر وردم وأعمال ترابية","خرسانة مسلحة (أساسات وهيكل إنشائي)","أعمال بناء بالبلوك والطوب","عزل مائي وحراري وصوتي","لياسة داخلية وخارجية","تمديدات كهربائية وتيار خفيف","تمديدات صحية ومكافحة حريق","تكييف مركزي وتهوية HVAC","مصاعد وسلالم كهربائية","تشطيبات داخلية","واجهات خارجية (كلادينق/زجاج)","أعمال خارجية ومواقف"],
  flood: ["أعمال تحضيرية ومساحية","أعمال ترابية وحفر قنوات","قنوات تصريف خرسانية مسلحة","مجاري سيول ومعابر صندوقية Box Culvert","عبّارات أنبوبية Pipe Culvert","أعمال حماية جوانب وقاع Riprap","سدود ترابية وحواجز إعاقة","أحواض تهدئة وتجميع","منشآت تحكم وبوابات","أعمال طرق خدمة","اختبارات ومراقبة جودة"],
  landscape: ["أعمال تحضيرية وإزالات","أعمال ترابية وتسوية وتربة زراعية","ممرات ومسارات مشاة","زراعة أشجار ونخيل وشجيرات وأغطية أرضية","شبكة ري أوتوماتيك","إنارة حدائق وديكورية","ملاعب أطفال ومناطق ترفيهية","مظلات ومقاعد وعناصر تأثيث","نوافير ومسطحات مائية","سور وبوابات","نظام تصريف مياه"],
  infrastructure: ["أعمال تحضيرية ومساحية","أعمال ترابية وحفر خنادق","شبكة مياه شرب أنابيب HDPE/DI","شبكة صرف صحي أنابيب PVC/GRP","غرف تفتيش ومحطات ضخ","شبكة تصريف أمطار","تمديدات كهربائية أرضية","غرف محولات ولوحات توزيع","شبكة اتصالات وألياف بصرية","إعادة ردم وإصلاح أسطح","اختبارات ضغط وتشغيل"],
  renovation: ["أعمال حماية وسلامة الموقع","إزالة وهدم جزئي","معالجة إنشائية وتقوية خرسانية","معالجة صدأ وحماية حديد","إصلاح عزل مائي وحراري","ترميم لياسة وأسطح","تجديد تمديدات كهربائية","تجديد تمديدات صحية","تشطيبات داخلية وأرضيات ودهان","تجديد واجهات خارجية","أعمال خارجية وتنسيق"],
};

const CITIES = ["مكة المكرمة","جدة","الرياض","المدينة المنورة","الدمام","الخبر","الظهران","الجبيل","الطائف","أبها","خميس مشيط","تبوك","حائل","نجران","جازان","ينبع","القصيم","بريدة","عرعر","سكاكا","الباحة"];
const UNITS = ["م2","م3","م.ط","عدد","طن","مقطوعية","نقطة","طقم","كجم","لتر","كم","حبة","شهر","يوم"];

const uid = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [step, setStep] = useState("input");
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    projectName:"", projectType:"", area:"", buildingArea:"", floors:"2",
    hasBasement:false, city:"مكة المكرمة", finishLevel:"standard",
    roadLength:"", roadWidth:"", channelLength:"", notes:""
  });
  const [phases, setPhases] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [expandedPhases, setExpandedPhases] = useState({});
  const [showAddItem, setShowAddItem] = useState(null);
  const [newItem, setNewItem] = useState({code:"",desc:"",unit:"م2",qty:"",price:"",notes:""});
  const [editingRow, setEditingRow] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  const resultRef = useRef(null);

  const uf = (k,v) => setForm(p=>({...p,[k]:v}));
  const togglePhase = i => setExpandedPhases(p=>({...p,[i]:!p[i]}));
  const collapseAll = () => { const a={}; phases.forEach((_,i)=>a[i]=false); setExpandedPhases(a); };
  const expandAll = () => { const a={}; phases.forEach((_,i)=>a[i]=true); setExpandedPhases(a); };

  /* ─── CRUD ─── */
  const deleteItem = (pi,ii) => setPhases(p=>p.map((ph,i)=>i===pi?{...ph,items:ph.items.filter((_,j)=>j!==ii)}:ph));

  const deletePhase = pi => {
    if(!confirm("حذف المرحلة «"+phases[pi].name+"» بالكامل؟")) return;
    setPhases(p=>p.filter((_,i)=>i!==pi));
  };

  const startEdit = (pi,ii,field,val) => { setEditingCell(`${pi}-${ii}-${field}`); setEditValue(String(val)); };
  const saveEdit = (pi,ii,field) => {
    setPhases(p=>p.map((ph,pidx)=>pidx===pi?{...ph,items:ph.items.map((it,iidx)=>iidx===ii?{...it,[field]:(field==="qty"||field==="price")?(Number(editValue)||0):editValue}:it)}:ph));
    setEditingCell(null); setEditValue("");
  };

  const startEditRow = (pi,ii) => { setEditingRow(`${pi}-${ii}`); setEditRowData({...phases[pi].items[ii]}); };
  const saveEditRow = (pi,ii) => {
    setPhases(p=>p.map((ph,pidx)=>pidx===pi?{...ph,items:ph.items.map((it,iidx)=>iidx===ii?{...editRowData,qty:Number(editRowData.qty)||0,price:Number(editRowData.price)||0}:it)}:ph));
    setEditingRow(null); setEditRowData({});
  };
  const cancelEditRow = () => { setEditingRow(null); setEditRowData({}); };

  const addItem = pi => {
    if(!newItem.desc||!newItem.qty||!newItem.price) return;
    const item = { id:uid(), code:newItem.code||`NEW-${phases[pi].items.length+1}`, desc:newItem.desc, unit:newItem.unit, qty:Number(newItem.qty)||0, price:Number(newItem.price)||0, notes:newItem.notes };
    setPhases(p=>p.map((ph,i)=>i===pi?{...ph,items:[...ph.items,item]}:ph));
    setNewItem({code:"",desc:"",unit:"م2",qty:"",price:"",notes:""}); setShowAddItem(null);
  };

  const duplicateItem = (pi,ii) => {
    const orig = phases[pi].items[ii];
    const copy = {...orig, id:uid(), code:orig.code+"-نسخة"};
    setPhases(p=>p.map((ph,i)=>i===pi?{...ph,items:[...ph.items.slice(0,ii+1),copy,...ph.items.slice(ii+1)]}:ph));
  };

  const moveItem = (pi,ii,dir) => {
    const items=[...phases[pi].items]; const t=ii+dir;
    if(t<0||t>=items.length) return;
    [items[ii],items[t]]=[items[t],items[ii]];
    setPhases(p=>p.map((ph,i)=>i===pi?{...ph,items}:ph));
  };

  const addNewPhase = () => {
    const name = prompt("اسم المرحلة الجديدة:");
    if(!name) return;
    setPhases(p=>[...p,{name,items:[]}]);
    setExpandedPhases(p=>({...p,[phases.length]:true}));
  };

  /* ─── Calcs ─── */
  const phaseTotal = p => p.items.reduce((s,i)=>s+i.qty*i.price,0);
  const grandTotal = () => phases.reduce((s,p)=>s+phaseTotal(p),0);
  const totalItems = () => phases.reduce((s,p)=>s+p.items.length,0);

  /* ─── Prompt Builder ─── */
  const buildPrompt = phaseName => {
    const t = PROJECT_TYPES.find(x=>x.id===form.projectType);
    const fl = form.finishLevel==="economy"?"اقتصادي":form.finishLevel==="standard"?"متوسط":"فاخر";
    let d = `- النوع: ${t?.label}\n- المدينة: ${form.city}`;
    if(["villa","commercial","renovation"].includes(form.projectType)){
      const bArea = form.buildingArea || Math.round(Number(form.area)*0.6);
      const totalBuilt = bArea * Number(form.floors);
      d+=`\n- مساحة الأرض: ${form.area} م²\n- مساحة البناء (البصمة): ${bArea} م²\n- إجمالي المسطحات: ${totalBuilt} م² (${form.floors} أدوار)\n- عدد الأدوار: ${form.floors}\n- قبو: ${form.hasBasement?"نعم":"لا"}\n- مستوى التشطيب: ${fl}`;
    } else if(form.projectType==="road"){
      d+=`\n- طول الطريق: ${form.roadLength||form.area} م.ط\n- عرض الطريق: ${form.roadWidth||"12"} م\n- المساحة: ${form.area} م²`;
    } else if(form.projectType==="flood"){
      d+=`\n- طول القناة: ${form.channelLength||form.area} م.ط\n- المساحة: ${form.area} م²`;
    } else if(form.projectType==="infrastructure"){
      d+=`\n- طول الشبكة: ${form.roadLength||form.area} م.ط\n- المساحة: ${form.area} م²`;
    } else { d+=`\n- المساحة: ${form.area} م²`; }
    if(form.notes) d+=`\n- ملاحظات: ${form.notes}`;

    return `أنت مهندس مقايسات سعودي خبير بالكود السعودي SBC ومعايير وزارة البلديات ووزارة النقل. أنشئ بنود تنفيذية دقيقة لمرحلة "${phaseName}" فقط.

معطيات المشروع:
${d}

أرجع JSON فقط بدون أي نص أو backticks:
[{"code":"XX-01","desc":"وصف البند الفني الدقيق بالعربي","unit":"م2","qty":100,"price":50,"notes":"ملاحظة تنفيذية"}]

القواعد:
- مصطلحات هندسية دقيقة (توريد وصب، توريد وفرد ورص، توريد وتركيب...)
- الأسعار بالريال السعودي وفق سوق ${form.city} 2025/2026
- 4 إلى 8 بنود حسب المرحلة
- كميات تقديرية دقيقة بناءً على المعطيات
- رمز البند: حرفين + رقم (RC-01, EW-02, RD-03)
- لا تضف أي نص خارج JSON`;
  };

  /* ─── Generate ─── */
  const generateBOQ = async () => {
    if(!form.projectName||!form.projectType||!form.area) return;
    setLoading(true); setStep("loading"); setProgress(0); setPhases([]); setError("");
    const pNames = PHASES_MAP[form.projectType]||[];
    const all = [];
    for(let i=0;i<pNames.length;i++){
      setLoadingPhase(pNames[i]);
      setProgress(Math.round((i/pNames.length)*100));
      try {
        const res = await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:buildPrompt(pNames[i])})});
        if(!res.ok){ const e=await res.json().catch(()=>({})); if(e.error?.includes("API_KEY")){setError("أضف ANTHROPIC_API_KEY في Vercel Environment Variables");setStep("input");setLoading(false);return;} throw new Error(e.error); }
        const data = await res.json();
        const text = (data.content||[]).map(c=>c.text||"").join("");
        let items=[]; try{items=JSON.parse(text.replace(/```json|```/g,"").trim());}catch{items=[];}
        all.push({name:pNames[i],items:items.map(x=>({id:uid(),code:x.code||"—",desc:x.desc||"",unit:x.unit||"م2",qty:Number(x.qty)||0,price:Number(x.price)||0,notes:x.notes||""}))});
      } catch(e){ all.push({name:pNames[i],items:[]}); }
    }
    setPhases(all); setProgress(100);
    const exp={}; all.forEach((_,i)=>exp[i]=true); setExpandedPhases(exp);
    setTimeout(()=>{setLoading(false);setStep("result");},400);
  };

  /* ─── Exports ─── */
  const exportCSV = () => {
    let csv="\uFEFF"+"المرحلة,رمز البند,وصف البند,الوحدة,الكمية,سعر الوحدة,الإجمالي,ملاحظات\n";
    phases.forEach(p=>p.items.forEach(i=>{csv+=`"${p.name}","${i.code}","${i.desc}","${i.unit}",${i.qty},${i.price},${i.qty*i.price},"${i.notes}"\n`;}));
    csv+=`\n"","","","إجمالي","","",${grandTotal()},""\n"","","","ضريبة 15%","","",${Math.round(grandTotal()*0.15)},""\n"","","","شامل الضريبة","","",${Math.round(grandTotal()*1.15)},""\n`;
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));a.download=`BOQ_${form.projectName}.csv`;a.click();
  };
  const exportJSON = () => {
    const d={project:form,date:new Date().toISOString(),phases,summary:{items:totalItems(),total:grandTotal(),vat:Math.round(grandTotal()*0.15),withVat:Math.round(grandTotal()*1.15)}};
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:"application/json"}));a.download=`BOQ_${form.projectName}.json`;a.click();
  };

  useEffect(()=>{if(step==="result"&&resultRef.current) resultRef.current.scrollIntoView({behavior:"smooth"});},[step]);

  const valid = form.projectName&&form.projectType&&form.area;
  const isBld = ["villa","commercial","renovation"].includes(form.projectType);
  const isRoad = ["road","infrastructure"].includes(form.projectType);
  const isFlood = form.projectType==="flood";

  /* ─── Editable Cell ─── */
  const eCell = (pi,ii,field,val,num=false,cls="") => {
    const k=`${pi}-${ii}-${field}`;
    if(editingCell===k) return (
      <input className="cell-edit" type={num?"number":"text"} value={editValue} autoFocus
        onChange={e=>setEditValue(e.target.value)}
        onBlur={()=>saveEdit(pi,ii,field)}
        onKeyDown={e=>{if(e.key==="Enter")saveEdit(pi,ii,field);if(e.key==="Escape"){setEditingCell(null);setEditValue("");}}} />
    );
    return <span className={`cell-click ${cls}`} onClick={()=>startEdit(pi,ii,field,val)} title="انقر للتعديل">{num?Number(val).toLocaleString():val}</span>;
  };

  return (
    <div className="app-root">
      <header className="header">
        <div className="header-inner">
          <div className="logo-grp">
            <div className="logo-icon">⚙️</div>
            <div><h1 className="logo-t">منصة المقايسات الذكية</h1><p className="logo-s">مولّد بنود تنفيذي بالذكاء الاصطناعي — وفق الكود السعودي SBC</p></div>
          </div>
          {step==="result"&&(
            <div className="hdr-acts">
              <button className="btn-g" onClick={()=>{setStep("input");setPhases([]);}}>← مشروع جديد</button>
              <button className="btn-g" onClick={exportCSV}>📊 CSV</button>
              <button className="btn-g" onClick={exportJSON}>📁 JSON</button>
              <button className="btn-g" onClick={()=>window.print()}>🖨️ طباعة</button>
            </div>
          )}
        </div>
      </header>

      <main className="mc">
        {error&&<div className="err-ban"><span>⚠️</span><p>{error}</p><button onClick={()=>setError("")}>✕</button></div>}

        {/* ═══ INPUT ═══ */}
        {step==="input"&&(
          <div className="fu">
            <div className="card icard">
              <div className="chdr"><h2 className="ct">🔧 أدخل معطيات مشروعك</h2><p className="cs">اختر نوع المشروع وأدخل البيانات — الذكاء الاصطناعي يولّد جدول بنود تنفيذي مسعّر كامل</p></div>
              <div className="sec"><label className="fl">نوع المشروع <span className="rq">*</span></label>
                <div className="tgrid">{PROJECT_TYPES.map(t=>(
                  <button key={t.id} className={`tc ${form.projectType===t.id?"ac":""}`} onClick={()=>uf("projectType",t.id)}>
                    <span className="ti">{t.icon}</span><span className="tn">{t.label}</span><span className="td">{t.desc}</span>
                  </button>
                ))}</div>
              </div>
              <div className="fg">
                <div className="f"><label className="fl">اسم المشروع <span className="rq">*</span></label><input className="inp" placeholder="مثال: فيلا الياسمين" value={form.projectName} onChange={e=>uf("projectName",e.target.value)}/></div>
                {isBld?<>
                  <div className="f"><label className="fl">مساحة الأرض (م²) <span className="rq">*</span></label><input className="inp" type="number" placeholder="مثال: 450" value={form.area} onChange={e=>uf("area",e.target.value)}/><span className="fhint">المساحة الإجمالية لقطعة الأرض حسب الصك</span></div>
                  <div className="f"><label className="fl">مساحة البناء - البصمة (م²)</label><input className="inp" type="number" placeholder={form.area?Math.round(Number(form.area)*0.6):"مثال: 270"} value={form.buildingArea} onChange={e=>uf("buildingArea",e.target.value)}/><span className="fhint">المساحة المبنية فعلياً من الدور الأرضي (إن تُركت فارغة = 60% من الأرض)</span></div>
                </>:
                  <div className="f"><label className="fl">{isRoad?"مساحة الطريق الإجمالية (م²)":isFlood?"مساحة المشروع الإجمالية (م²)":"المساحة الإجمالية (م²)"} <span className="rq">*</span></label><input className="inp" type="number" placeholder="400" value={form.area} onChange={e=>uf("area",e.target.value)}/></div>
                }
                {isBld&&<><div className="f"><label className="fl">عدد الأدوار</label><select className="inp sl" value={form.floors} onChange={e=>uf("floors",e.target.value)}>{[1,2,3,4,5,6,7,8,10,12,15].map(n=><option key={n} value={n}>{n===1?"دور واحد":`${n} أدوار`}</option>)}</select></div>
                <div className="f"><label className="fl">مستوى التشطيب</label><select className="inp sl" value={form.finishLevel} onChange={e=>uf("finishLevel",e.target.value)}><option value="economy">اقتصادي 💰</option><option value="standard">متوسط ⭐</option><option value="luxury">فاخر 👑</option></select></div></>}
                {isRoad&&<><div className="f"><label className="fl">طول الطريق/الشبكة (م.ط)</label><input className="inp" type="number" placeholder="1000" value={form.roadLength} onChange={e=>uf("roadLength",e.target.value)}/></div>
                <div className="f"><label className="fl">عرض الطريق (م)</label><input className="inp" type="number" placeholder="12" value={form.roadWidth} onChange={e=>uf("roadWidth",e.target.value)}/></div></>}
                {isFlood&&<div className="f"><label className="fl">طول القناة (م.ط)</label><input className="inp" type="number" placeholder="2000" value={form.channelLength} onChange={e=>uf("channelLength",e.target.value)}/></div>}
                <div className="f"><label className="fl">المدينة</label><select className="inp sl" value={form.city} onChange={e=>uf("city",e.target.value)}>{CITIES.map(c=><option key={c}>{c}</option>)}</select></div>
                {isBld&&<div className="f"><label className="fl">خيارات</label><label className="ckw"><input type="checkbox" checked={form.hasBasement} onChange={e=>uf("hasBasement",e.target.checked)}/><span>يوجد قبو (بدروم)</span></label></div>}
              </div>
              <div className="f" style={{marginTop:16}}><label className="fl">ملاحظات إضافية</label><textarea className="inp txta" rows={3} placeholder="تفاصيل إضافية (نوع التربة، متطلبات خاصة...)" value={form.notes} onChange={e=>uf("notes",e.target.value)}/></div>
              <div className="subr"><button className="btn-p" disabled={!valid} onClick={generateBOQ}>⚡ توليد جدول البنود بالذكاء الاصطناعي</button>{!valid&&<p className="hint">أكمل الحقول المطلوبة (*)</p>}</div>
            </div>
          </div>
        )}

        {/* ═══ LOADING ═══ */}
        {step==="loading"&&(
          <div className="fu lc">
            <div className="card lcard">
              <div className="licon">🤖</div>
              <h2 className="lt">جارٍ توليد البنود...</h2>
              <p className="ld">يحلل مشروعك «{form.projectName}» ويولّد البنود مرحلة بمرحلة</p>
              <div className="pbox"><div className="pinfo"><span className="pphs">{loadingPhase}</span><span className="ppct">{progress}%</span></div><div className="ptrk"><div className="pbar" style={{width:`${progress}%`}}/></div></div>
              <p className="lhint">يرجى الانتظار... قد تستغرق 1-2 دقيقة</p>
            </div>
          </div>
        )}

        {/* ═══ RESULT ═══ */}
        {step==="result"&&(
          <div ref={resultRef} className="fu">
            <div className="card sbar">
              <div className="sinfo"><h2 className="ptitle">{form.projectName}</h2>
                <p className="pmeta">{PROJECT_TYPES.find(t=>t.id===form.projectType)?.icon} {PROJECT_TYPES.find(t=>t.id===form.projectType)?.label} • أرض: {form.area} م²{isBld?` • بناء: ${form.buildingArea||Math.round(Number(form.area)*0.6)} م² • ${form.floors} أدوار`:""}{isRoad&&form.roadLength?` • ${form.roadLength} م.ط`:""} • {form.city}</p>
              </div>
              <div className="srow">
                <div className="st"><span className="stl">البنود</span><span className="stv am">{totalItems()}</span></div>
                <div className="st"><span className="stl">المراحل</span><span className="stv bl">{phases.length}</span></div>
                <div className="st"><span className="stl">قبل الضريبة</span><span className="stv gr">{grandTotal().toLocaleString()}<small> ر.س</small></span></div>
                <div className="st hl"><span className="stl">شامل 15%</span><span className="stv am">{Math.round(grandTotal()*1.15).toLocaleString()}<small> ر.س</small></span></div>
              </div>
            </div>

            <div className="ctrls">
              <button className="btn-g sm" onClick={expandAll}>▼ فتح الكل</button>
              <button className="btn-g sm" onClick={collapseAll}>▲ إغلاق الكل</button>
              <button className="btn-ap" onClick={addNewPhase}>+ إضافة مرحلة</button>
            </div>

            {phases.map((phase,pi)=>(
              <div key={pi} className="card pcard">
                <div className="phdr" onClick={()=>togglePhase(pi)}>
                  <div className="ptg">
                    <span className={`parr ${expandedPhases[pi]?"op":""}`}>◀</span>
                    <span className="pnum">{pi+1}</span>
                    <span className="pname">{phase.name}</span>
                    <span className="pbdg">{phase.items.length} بنود</span>
                  </div>
                  <div className="pright">
                    <span className="ptot">{phaseTotal(phase).toLocaleString()} ر.س</span>
                    <button className="pdel" onClick={e=>{e.stopPropagation();deletePhase(pi);}} title="حذف المرحلة">🗑️</button>
                  </div>
                </div>

                {expandedPhases[pi]&&(
                  <div className="pbody">
                    {phase.items.length>0&&<>
                      <div className="tr th"><span>الرمز</span><span>وصف البند</span><span>الوحدة</span><span>الكمية</span><span>السعر</span><span>الإجمالي</span><span className="notes-h">ملاحظات</span><span>إجراءات</span></div>
                      {phase.items.map((item,ii)=>{
                        if(editingRow===`${pi}-${ii}`) return (
                          <div key={item.id||ii} className="tr tedit">
                            <input className="cell-edit" value={editRowData.code} onChange={e=>setEditRowData(p=>({...p,code:e.target.value}))}/>
                            <input className="cell-edit w" value={editRowData.desc} onChange={e=>setEditRowData(p=>({...p,desc:e.target.value}))}/>
                            <select className="cell-edit" value={editRowData.unit} onChange={e=>setEditRowData(p=>({...p,unit:e.target.value}))}>{UNITS.map(u=><option key={u}>{u}</option>)}</select>
                            <input className="cell-edit" type="number" value={editRowData.qty} onChange={e=>setEditRowData(p=>({...p,qty:e.target.value}))}/>
                            <input className="cell-edit" type="number" value={editRowData.price} onChange={e=>setEditRowData(p=>({...p,price:e.target.value}))}/>
                            <span className="ctot">{((Number(editRowData.qty)||0)*(Number(editRowData.price)||0)).toLocaleString()}</span>
                            <input className="cell-edit" value={editRowData.notes||""} onChange={e=>setEditRowData(p=>({...p,notes:e.target.value}))}/>
                            <div className="acts"><button className="ab sv" onClick={()=>saveEditRow(pi,ii)}>✓</button><button className="ab cn" onClick={cancelEditRow}>✕</button></div>
                          </div>
                        );
                        return (
                          <div key={item.id||ii} className="tr">
                            <span className="ccode">{item.code}</span>
                            {eCell(pi,ii,"desc",item.desc,false,"cdesc")}
                            {eCell(pi,ii,"unit",item.unit,false,"cunit")}
                            {eCell(pi,ii,"qty",item.qty,true,"")}
                            {eCell(pi,ii,"price",item.price,true,"cprice")}
                            <span className="ctot">{(item.qty*item.price).toLocaleString()}</span>
                            <span className="cnotes" title={item.notes}>{item.notes}</span>
                            <div className="acts">
                              <button className="ab ed" onClick={()=>startEditRow(pi,ii)} title="تعديل الكل">✏️</button>
                              <button className="ab dp" onClick={()=>duplicateItem(pi,ii)} title="نسخ">📋</button>
                              <button className="ab" onClick={()=>moveItem(pi,ii,-1)} title="↑">↑</button>
                              <button className="ab" onClick={()=>moveItem(pi,ii,1)} title="↓">↓</button>
                              <button className="ab dl" onClick={()=>deleteItem(pi,ii)} title="حذف">✕</button>
                            </div>
                          </div>
                        );
                      })}
                    </>}
                    {phase.items.length===0&&<div className="pempty">لا توجد بنود — أضف بند جديد</div>}

                    {showAddItem===pi?(
                      <div className="aiform">
                        <h4 className="ait">➕ إضافة بند جديد</h4>
                        <div className="aigrid">
                          <input className="inp sm" placeholder="الرمز" value={newItem.code} onChange={e=>setNewItem(p=>({...p,code:e.target.value}))}/>
                          <input className="inp sm w2" placeholder="وصف البند الفني *" value={newItem.desc} onChange={e=>setNewItem(p=>({...p,desc:e.target.value}))}/>
                          <select className="inp sm" value={newItem.unit} onChange={e=>setNewItem(p=>({...p,unit:e.target.value}))}>{UNITS.map(u=><option key={u}>{u}</option>)}</select>
                          <input className="inp sm" type="number" placeholder="الكمية *" value={newItem.qty} onChange={e=>setNewItem(p=>({...p,qty:e.target.value}))}/>
                          <input className="inp sm" type="number" placeholder="السعر *" value={newItem.price} onChange={e=>setNewItem(p=>({...p,price:e.target.value}))}/>
                          <input className="inp sm" placeholder="ملاحظات" value={newItem.notes} onChange={e=>setNewItem(p=>({...p,notes:e.target.value}))}/>
                        </div>
                        <div className="aiacts"><button className="btn-p sm" onClick={()=>addItem(pi)} disabled={!newItem.desc||!newItem.qty||!newItem.price}>✓ إضافة</button><button className="btn-g sm" onClick={()=>setShowAddItem(null)}>إلغاء</button></div>
                      </div>
                    ):(
                      <button className="btn-ai" onClick={()=>{setShowAddItem(pi);setNewItem({code:"",desc:"",unit:"م2",qty:"",price:"",notes:""});}}>+ إضافة بند جديد</button>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="card gcard">
              <div className="ggrid">
                <div className="gi"><span className="gl">الإجمالي قبل الضريبة</span><span className="gv">{grandTotal().toLocaleString()} <small>ر.س</small></span></div>
                <div className="gi rd"><span className="gl">ضريبة القيمة المضافة (15%)</span><span className="gv">{Math.round(grandTotal()*0.15).toLocaleString()} <small>ر.س</small></span></div>
                <div className="gi gd"><span className="gl">الإجمالي شاملاً الضريبة</span><span className="gv bg">{Math.round(grandTotal()*1.15).toLocaleString()} <small>ر.س</small></span></div>
              </div>
            </div>

            <footer className="rftr"><p className="disc">تنبيه: الأسعار تقديرية وفق متوسط سوق {form.city} 2025/2026 — انقر على أي خلية لتعديلها • استخدم أزرار الإجراءات لتعديل/نسخ/حذف/ترتيب البنود</p><p className="cred">بواسطة المهندس جاسر العتيبي</p></footer>
          </div>
        )}
      </main>
    </div>
  );
}
