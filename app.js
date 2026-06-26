import { useState, useEffect } from "react";

// ========== HELPERS ==========
const getLS = (key, def) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; } };
const setLS = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };
const uid = () => Math.random().toString(36).slice(2, 8);

const DAYS_ORDER = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];
const REST_DAYS_DEFAULT = ["الثلاثاء","الجمعة"];

const todayName = () => {
const map = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
return map[new Date().getDay()];
};

const DAY_COLORS = {
السبت:"#e74c3c", الأحد:"#3498db", الاثنين:"#9b59b6",
الثلاثاء:"#95a5a6", الأربعاء:"#27ae60", الخميس:"#e67e22", الجمعة:"#95a5a6"
};

// ========== DEFAULT DATA ==========
const DEFAULT_PROFILE = {
name:"بطل", weight:90, height:185, goal:"تضخيم مع تنشيف",
targetCalories:2800, targetProtein:180, targetCarbs:300, targetFat:80,
};

const DEFAULT_WORKOUT = {
السبت:{ muscle:"صدر + ترايسبس", exercises:[
{ id:"1", name:"بنش بريس بار", sets:4, reps:"10-12", rest:"90 ث", notes:"ركز على اللف الكامل", weights:{} },
{ id:"2", name:"انكلاين دمبل بريس", sets:3, reps:"10-12", rest:"90 ث", notes:"زاوية 45 درجة", weights:{} },
{ id:"3", name:"بترفلاي ماكينة", sets:3, reps:"12-15", rest:"60 ث", notes:"احسس بالعضلة", weights:{} },
{ id:"4", name:"ترايسبس بوش داون", sets:3, reps:"12-15", rest:"60 ث", notes:"ثبت كوعك", weights:{} },
{ id:"5", name:"سكل كراشر", sets:3, reps:"10-12", rest:"60 ث", notes:"بطيء في النزول", weights:{} },
 ]},
الأحد:{ muscle:"ظهر + بايسبس", exercises:[
{ id:"6", name:"لات بوش داون", sets:4, reps:"10-12", rest:"90 ث", notes:"اسحب للصدر", weights:{} },
{ id:"7", name:"روينج بار", sets:4, reps:"10-12", rest:"90 ث", notes:"ثبت الظهر", weights:{} },
{ id:"8", name:"كيبل روينج", sets:3, reps:"12-15", rest:"60 ث", notes:"اسحب للبطن", weights:{} },
{ id:"9", name:"كيرل بار", sets:3, reps:"10-12", rest:"60 ث", notes:"مكمل في الأعلى", weights:{} },
{ id:"10", name:"هامر كيرل", sets:3, reps:"12", rest:"60 ث", notes:"ببطء", weights:{} },
 ]},
الاثنين:{ muscle:"أكتاف", exercises:[
{ id:"11", name:"شولدر بريس بار", sets:4, reps:"10-12", rest:"90 ث", notes:"لا تفرط في الانحناء", weights:{} },
{ id:"12", name:"لاتيرال ريز", sets:4, reps:"12-15", rest:"60 ث", notes:"مرفق بسيط", weights:{} },
{ id:"13", name:"فرونت ريز", sets:3, reps:"12", rest:"60 ث", notes:"تبادل الإيدين", weights:{} },
{ id:"14", name:"فيس بول", sets:3, reps:"15", rest:"60 ث", notes:"للكتف الخلفي", weights:{} },
{ id:"15", name:"شراق", sets:3, reps:"15", rest:"60 ث", notes:"للتراس", weights:{} },
 ]},
الثلاثاء:{ muscle:"راحة 💤", exercises:[] },
الأربعاء:{ muscle:"أرجل", exercises:[
{ id:"16", name:"سكوات بار", sets:4, reps:"10-12", rest:"120 ث", notes:"ظهر مستقيم", weights:{} },
{ id:"17", name:"ليج بريس", sets:4, reps:"12-15", rest:"90 ث", notes:"عميق", weights:{} },
{ id:"18", name:"ليج اكستنشن", sets:3, reps:"15", rest:"60 ث", notes:"للكواد", weights:{} },
{ id:"19", name:"ليج كيرل", sets:3, reps:"12-15", rest:"60 ث", notes:"للهامسترنج", weights:{} },
{ id:"20", name:"ستاندينج كاف ريز", sets:4, reps:"20", rest:"45 ث", notes:"تمام في الأعلى", weights:{} },
 ]},
الخميس:{ muscle:"صدر + ترايسبس (B)", exercises:[
{ id:"21", name:"دمبل فلات بريس", sets:4, reps:"10-12", rest:"90 ث", notes:"تبديل الدمبل", weights:{} },
{ id:"22", name:"ديكلاين بريس", sets:3, reps:"10-12", rest:"90 ث", notes:"لأسفل الصدر", weights:{} },
{ id:"23", name:"كيبل فلاي", sets:3, reps:"15", rest:"60 ث", notes:"ابسط الذراعين", weights:{} },
{ id:"24", name:"ترايسبس ديبس", sets:3, reps:"12", rest:"60 ث", notes:"وزن جسمك", weights:{} },
{ id:"25", name:"اوفرهيد ترايسبس", sets:3, reps:"12", rest:"60 ث", notes:"كوع فوق الرأس", weights:{} },
 ]},
الجمعة:{ muscle:"راحة 💤", exercises:[] },
};

// Generate meals from calorie target
function generateMeals(targetCal, targetPro, targetCarbs, targetFat) {
const scale = targetCal / 2800;
return [
{
id:"m1", name:"وجبة 1 - فطار (7 ص)",
items:[
{ id:"i1", name:"بيض مسلوق أو مقلي", amount: Math.round(3scale+1), unit:"حبة" },
{ id:"i2", name:"جبنة قريش", amount: Math.round(100scale), unit:"جم" },
{ id:"i3", name:"توست أسمر", amount: Math.round(2*scale), unit:"شريحة" },
{ id:"i4", name:"موزة", amount:1, unit:"حبة" },
 ],
calories: Math.round(650scale), protein: Math.round(45scale), carbs: Math.round(65scale), fat: Math.round(20scale)
},
{
id:"m2", name:"وجبة 2 - سناك (10 ص)",
items:[
{ id:"i5", name:"بيض مسلوق", amount: Math.round(2*scale), unit:"حبة" },
{ id:"i6", name:"فاكهة (تفاح أو برتقال)", amount:1, unit:"حبة" },
 ],
calories: Math.round(220scale), protein: Math.round(14scale), carbs: Math.round(25scale), fat: Math.round(10scale)
},
{
id:"m3", name:"وجبة 3 - غداء (1 ظ)",
items:[
{ id:"i7", name:"وراك فراخ مشوي (بدون جلد)", amount: Math.round(300scale), unit:"جم" },
{ id:"i8", name:"أرز أبيض أو بني", amount: Math.round(1.5scale*100)/100, unit:"كوب" },
{ id:"i9", name:"سلطة خضرا", amount:1, unit:"طبق" },
 ],
calories: Math.round(700scale), protein: Math.round(60scale), carbs: Math.round(80scale), fat: Math.round(15scale)
},
{
id:"m4", name:"وجبة 4 - قبل التمرين (4 م)",
items:[
{ id:"i10", name:"جبنة قريش", amount: Math.round(150*scale), unit:"جم" },
{ id:"i11", name:"موزة", amount:1, unit:"حبة" },
{ id:"i12", name:"عسل", amount:1, unit:"ملعقة" },
 ],
calories: Math.round(350scale), protein: Math.round(20scale), carbs: Math.round(55scale), fat: Math.round(5scale)
},
{
id:"m5", name:"وجبة 5 - بعد التمرين (7 م)",
items:[
{ id:"i13", name:"وراك فراخ مشوي", amount: Math.round(250scale), unit:"جم" },
{ id:"i14", name:"بيض كامل + بياض", amount: ${Math.round(2scale)} كامل + ${Math.round(2*scale)} بياض, unit:"" },
{ id:"i15", name:"أرز أو بطاطس مسلوقة", amount:1, unit:"كوب" },
 ],
calories: Math.round(620scale), protein: Math.round(55scale), carbs: Math.round(60scale), fat: Math.round(18scale)
},
{
id:"m6", name:"وجبة 6 - عشاء (10 م)",
items:[
{ id:"i16", name:"جبنة قريش", amount: Math.round(200*scale), unit:"جم" },
{ id:"i17", name:"خيارة أو طماطمة", amount:1, unit:"حبة" },
{ id:"i18", name:"زيت زيتون", amount:1, unit:"ملعقة" },
 ],
calories: Math.round(260scale), protein: Math.round(24scale), carbs: Math.round(12scale), fat: Math.round(12scale)
},
];
}

// ========== SHARED UI ==========
function NavBar({ active, setActive }) {
const tabs = [
{ id:"home", icon:"🏠", label:"الرئيسية" },
{ id:"workout", icon:"💪", label:"تمرين" },
{ id:"nutrition", icon:"🥗", label:"تغذية" },
{ id:"progress", icon:"📈", label:"تقدمي" },
{ id:"settings", icon:"⚙️", label:"الإعدادات" },
 ];
return (
<nav style={{ position:"fixed", bottom:0, left:0, right:0, background:"#111827", borderTop:"1px solid #1f2937", display:"flex", zIndex:100 }}>
{tabs.map(t => (
<button key={t.id} onClick={() => setActive(t.id)} style={{ flex:1, padding:"10px 4px 8px", background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, color: active===t.id?"#00d084":"#6b7280" }}>
<span style={{ fontSize:20 }}>{t.icon}</span>
<span style={{ fontSize:10, fontFamily:"Cairo, sans-serif", fontWeight: active===t.id?700:400 }}>{t.label}</span>
</button>
))}
</nav>
);
}

function MacroBar({ label, current, target, color }) {
const pct = Math.min(100, target>0 ? Math.round((current/target)*100) : 0);
return (
<div style={{ marginBottom:12 }}>
<div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
<span style={{ color:"#e5e7eb", fontFamily:"Cairo, sans-serif", fontSize:13 }}>{label}</span>
<span style={{ color, fontFamily:"Cairo, sans-serif", fontSize:13, fontWeight:700 }}>{current} / {target}</span>
</div>
<div style={{ background:"#374151", borderRadius:99, height:7, overflow:"hidden" }}>
<div style={{ background:color, width:${pct}%`, height:"100%", borderRadius:99, transition:"width .4s" }} />
</div>
</div>
);
}

function StatCard({ label, value, unit, color, icon }) {
return (
<div style={{ background:"#1f2937", borderRadius:16, padding:"14px 12px", flex:1, minWidth:0 }}>
<div style={{ fontSize:20, marginBottom:5 }}>{icon}</div>
<div style={{ color, fontSize:20, fontWeight:800, fontFamily:"Cairo, sans-serif" }}>{value}<span style={{ fontSize:11, fontWeight:400, color:"#9ca3af", marginRight:2 }}>{unit}</span></div>
<div style={{ color:"#9ca3af", fontSize:11, fontFamily:"Cairo, sans-serif", marginTop:2 }}>{label}</div>
</div>
);
}

// ========== EXERCISE MODAL ==========
function ExerciseModal({ exercise, onSave, onClose }) {
const [form, setForm] = useState(exercise ? { ...exercise } : { name:"", sets:3, reps:"10-12", rest:"60 ث", notes:"", weights:{} });
const set = (k,v) => setForm(f=>({...f,[k]:v}));
return (
<div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={onClose}>
<div style={{ background:"#1f2937", borderRadius:"20px 20px 0 0", padding:22, width:"100%", maxWidth:480, margin:"0 auto" }} onClick={e=>e.stopPropagation()}>
<div style={{ color:"#fff", fontWeight:800, fontSize:17, marginBottom:16, fontFamily:"Cairo, sans-serif" }}>{exercise?"✏️ تعديل التمرين":"➕ تمرين جديد"}</div>
{[{label:"اسم التمرين",key:"name",ph:"مثلاً: بنش بريس"},{label:"الرابطات",key:"reps",ph:"مثلاً: 10-12"},{label:"وقت الراحة",key:"rest",ph:"مثلاً: 90 ث"},{label:"ملاحظة",key:"notes",ph:"اختياري"}].map(f=>(
<div key={f.key} style={{ marginBottom:12 }}>
<div style={{ color:"#9ca3af", fontSize:12, fontFamily:"Cairo, sans-serif", marginBottom:5 }}>{f.label}</div>
<input value={form[f.key]||""} onChange={e=>set(f.key,e.target.value)} placeholder={f.ph}
style={{ width:"100%", background:"#374151", border:"none", borderRadius:10, padding:"11px 14px", color:"#fff", fontSize:15, fontFamily:"Cairo, sans-serif", outline:"none", boxSizing:"border-box" }} />
</div>
))}
<div style={{ marginBottom:16 }}>
<div style={{ color:"#9ca3af", fontSize:12, fontFamily:"Cairo, sans-serif", marginBottom:5 }}>عدد السيتات</div>
<div style={{ display:"flex", gap:8 }}>
{[2,3,4,5,6].map(n=>(
<button key={n} onClick={()=>set("sets",n)} style={{ flex:1, padding:"10px 0", background:form.sets===n?"#00d084":"#374151", color:form.sets===n?"#064e3b":"#9ca3af", border:"none", borderRadius:10, fontFamily:"Cairo, sans-serif", fontWeight:700, cursor:"pointer", fontSize:15 }}>{n}</button>
))}
</div>
</div>
<div style={{ display:"flex", gap:10 }}>
<button onClick={onClose} style={{ flex:1, padding:13, background:"#374151", color:"#9ca3af", border:"none", borderRadius:12, fontFamily:"Cairo, sans-serif", fontWeight:700, cursor:"pointer" }}>إلغاء</button>
<button onClick={()=>{ if(form.name.trim()) onSave({...form, id:form.id||uid()}); }} style={{ flex:2, padding:13, background:"#00d084", color:"#064e3b", border:"none", borderRadius:12, fontFamily:"Cairo, sans-serif", fontWeight:800, cursor:"pointer", fontSize:15 }}>حفظ ✓</button>
</div>
</div>
</div>
);
}

// ========== MEAL ITEM EDITOR ==========
function MealItemModal({ item, onSave, onClose }) {
const [form, setForm] = useState({ ...item });
const s = (k,v) => setForm(f=>({...f,[k]:v}));
return (
<div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.75)", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={onClose}>
<div style={{ background:"#1f2937", borderRadius:"20px 20px 0 0", padding:22, width:"100%", maxWidth:480, margin:"0 auto" }} onClick={e=>e.stopPropagation()}>
<div style={{ color:"#fff", fontWeight:800, fontSize:17, marginBottom:16, fontFamily:"Cairo, sans-serif" }}>✏️ تعديل الأكلة</div>
{[{label:"اسم الأكلة",key:"name",ph:"مثلاً: بيض مسلوق"},{label:"الكمية",key:"amount",ph:"مثلاً: 3"},{label:"الوحدة",key:"unit",ph:"مثلاً: حبة / جم / كوب"}].map(f=>(
<div key={f.key} style={{ marginBottom:12 }}>
<div style={{ color:"#9ca3af", fontSize:12, fontFamily:"Cairo, sans-serif", marginBottom:5 }}>{f.label}</div>
<input value={form[f.key]||""} onChange={e=>s(f.key,e.target.value)} placeholder={f.ph}
style={{ width:"100%", background:"#374151", border:"none", borderRadius:10, padding:"11px 14px", color:"#fff", fontSize:15, fontFamily:"Cairo, sans-serif", outline:"none", boxSizing:"border-box" }} />
</div>
))}
<div style={{ display:"flex", gap:10 }}>
<button onClick={onClose} style={{ flex:1, padding:13, background:"#374151", color:"#9ca3af", border:"none", borderRadius:12, fontFamily:"Cairo, sans-serif", fontWeight:700, cursor:"pointer" }}>إلغاء</button>
<button onClick={()=>{ if(form.name.trim()) onSave(form); }} style={{ flex:2, padding:13, background:"#00d084", color:"#064e3b", border:"none", borderRadius:12, fontFamily:"Cairo, sans-serif", fontWeight:800, cursor:"pointer" }}>حفظ ✓</button>
</div>
</div>
</div>
);
}

// ========== HOME ==========
function HomePage({ profile, workoutPlan, nutrition }) {
const today = todayName();
const plan = workoutPlan[today];
const todayNut = nutrition[new Date().toDateString()] || { cal:0, pro:0, carbs:0, fat:0 };
const bmi = (profile.weight/((profile.height/100)**2)).toFixed(1);

return (
<div style={{ padding:"24px 16px 100px", fontFamily:"Cairo, sans-serif" }}>
<div style={{ marginBottom:22 }}>
<div style={{ color:"#9ca3af", fontSize:13 }}>أهلاً بك 💚</div>
<div style={{ color:"#fff", fontSize:25, fontWeight:800 }}>داشبورد البطل</div>
<div style={{ color:"#00d084", fontSize:13, marginTop:3 }}>{today} — {plan.muscle}</div>
</div>

<div style={{ display:"flex", gap:8, marginBottom:14 }}>
<StatCard label="الوزن" value={profile.weight} unit="كجم" color="#00d084" icon="⚖️" />
<StatCard label="الطول" value={profile.height} unit="سم" color="#3b82f6" icon="📏" />
<StatCard label="BMI" value={bmi} unit="" color="#a78bfa" icon="💡" />
</div>

<div style={{ background:"#1f2937", borderRadius:18, padding:16, marginBottom:14 }}>
<div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
<span style={{ color:"#fff", fontWeight:700 }}>تمرين النهارده</span>
<span style={{ background: DAY_COLORS[today], color:"#fff", borderRadius:99, padding:"3px 11px", fontSize:12, fontWeight:700 }}>{plan.muscle}</span>
</div>
{plan.exercises.length===0
? <div style={{ color:"#6b7280", textAlign:"center", padding:"16px 0" }}>يوم راحة 💤</div>
: plan.exercises.slice(0,3).map(ex=>(
<div key={ex.id} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid #374151" }}>
<span style={{ color:"#e5e7eb", fontSize:14 }}>{ex.name}</span>
<span style={{ color:"#9ca3af", fontSize:13 }}>{ex.sets}×{ex.reps}</span>
</div>
))
}
{plan.exercises.length>3 && <div style={{ color:"#00d084", fontSize:13, marginTop:8, textAlign:"center" }}>+ {plan.exercises.length-3} تمرين تاني</div>}
</div>

<div style={{ background:"#1f2937", borderRadius:18, padding:16, marginBottom:14 }}>
<div style={{ color:"#fff", fontWeight:700, marginBottom:12 }}>سعرات النهارده</div>
<MacroBar label="سعرات" current={todayNut.cal} target={profile.targetCalories} color="#f59e0b" />
<MacroBar label="بروتين جم" current={todayNut.pro} target={profile.targetProtein} color="#3b82f6" />
<MacroBar label="كارب جم" current={todayNut.carbs} target={profile.targetCarbs} color="#a78bfa" />
<MacroBar label="دهون جم" current={todayNut.fat} target={profile.targetFat} color="#f87171" />
</div>

<div style={{ background:"linear-gradient(135deg,#064e3b,#065f46)", borderRadius:18, padding:16, border:"1px solid #059669" }}>
<div style={{ color:"#6ee7b7", fontWeight:700, marginBottom:6 }}>💡 نصيحة اليوم</div>
<div style={{ color:"#a7f3d0", fontSize:13, lineHeight:1.7 }}>
هدفك {profile.goal}. ركز على التدرج في الأوزان كل أسبوع وسجل وزن كل تمرينة. {profile.targetProtein}جم بروتين يوميًا هو مفتاحك!
</div>
</div>
</div>
);
}

// ========== WORKOUT ==========
function WorkoutPage({ workoutPlan, setWorkoutPlan }) {
const [selectedDay, setSelectedDay] = useState(todayName());
const [done, setDone] = useState(getLS("done_exercises",{}));
const [modal, setModal] = useState(null);
const [weightModal, setWeightModal] = useState(null); // { exercise }
const [weekInput, setWeekInput] = useState("");
const [weightVal, setWeightVal] = useState("");

const plan = workoutPlan[selectedDay];
const isRest = REST_DAYS_DEFAULT.includes(selectedDay) || plan.exercises.length===0;

const toggleDone = (exId) => {
const key = ``${selectedDay}_${exId};
const u = {...done,[key]:!done[key]};
setDone(u); setLS("done_exercises",u);
};

const saveEx = (ex) => {
const exs = plan.exercises;
const updated = modal.mode==="edit" ? exs.map(e=>e.id===ex.id?ex:e) : [...exs,ex];
const np = {...workoutPlan,[selectedDay]:{...plan,exercises:updated}};
setWorkoutPlan(np); setLS("workout_plan",np); setModal(null);
};

const deleteEx = (exId) => {
const updated = plan.exercises.filter(e=>e.id!==exId);
const np = {...workoutPlan,[selectedDay]:{...plan,exercises:updated}};
setWorkoutPlan(np); setLS("workout_plan",np);
};

const saveWeight = () => {
const w = parseFloat(weightVal);
const wk = weekInput.trim();
if (!wk || isNaN(w)) return;
const ex = weightModal.exercise;
const updatedEx = {...ex, weights:{...ex.weights,[wk]:w}};
const exs = plan.exercises.map(e=>e.id===ex.id?updatedEx:e);
const np = {...workoutPlan,[selectedDay]:{...plan,exercises:exs}};
setWorkoutPlan(np); setLS("workout_plan",np);
setWeightModal(null); setWeekInput(""); setWeightVal("");
};

const doneCount = plan.exercises.filter(ex=>done[``${selectedDay}_${ex.id}`]).length;

return (
<div style={{ padding:"24px 16px 100px", fontFamily:"Cairo, sans-serif" }}>
<div style={{ color:"#fff", fontSize:22, fontWeight:800, marginBottom:16 }}>برنامج التمرين 💪</div>

<div style={{ display:"flex", gap:7, overflowX:"auto", marginBottom:18, paddingBottom:4 }}>
{DAYS_ORDER.map(day=>(
<button key={day} onClick={()=>setSelectedDay(day)} style={{
background: selectedDay===day ? DAY_COLORS[day]:"#1f2937",
color:"#fff", border:"none", borderRadius:99, padding:"7px 13px",
fontSize:12, fontFamily:"Cairo, sans-serif", cursor:"pointer", whiteSpace:"nowrap",
fontWeight:selectedDay===day?700:400, opacity:REST_DAYS_DEFAULT.includes(day)?.7:1
}}>{day}{REST_DAYS_DEFAULT.includes(day)?" 💤":""}</button>
))}
</div>

<div style={{ background:"#1f2937", borderRadius:18, overflow:"hidden" }}>
<div style={{ background: DAY_COLORS[selectedDay], padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
<div>
<div st

  
