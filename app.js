import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal, SafeAreaView, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications'; // 1. للمنبهات

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false }) });

// ========== HELPERS ==========
const getLS = async (key, def) => { try { const v = await AsyncStorage.getItem(key); return v? JSON.parse(v) : def; } catch { return def; } };
const setLS = async (key, val) => { try { await AsyncStorage.setItem(key, JSON.stringify(val)); } catch {} };
const uid = () => Math.random().toString(36).slice(2, 8);
const DAYS_ORDER = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];
const todayName = () => { const map = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"]; return map[new Date().getDay()]; };
const DAY_COLORS = { السبت:"#e74c3c", الأحد:"#3498db", الاثنين:"#9b59b6", الثلاثاء:"#95a5a6", الأربعاء:"#27ae60", الخميس:"#e67e22", الجمعة:"#95a5a6" };

// ========== 1. قاعدة بيانات الاكل - تعديل 1 ==========
const FOOD_DB = {
  "بيض مسلوق": { cal:78, pro:6, carbs:0.5, fat:5, unit:"حبة" },
  "صدور فراخ": { cal:165, pro:31, carbs:0, fat:3.6, unit:"100جم" },
  "رز ابيض مطبوخ": { cal:130, pro:2.7, carbs:28, fat:0.3, unit:"100جم" },
  "شوفان": { cal:389, pro:16.9, carbs:66, fat:6.9, unit:"100جم" },
  "جبنة قريش": { cal:98, pro:12, carbs:3, fat:4, unit:"100جم" },
  "موز": { cal:89, pro:1.1, carbs:23, fat:0.3, unit:"حبة" },
  "بطاطس مسلوقة": { cal:87, pro:1.9, carbs:20, fat:0.1, unit:"100جم" },
  "تونة": { cal:132, pro:28, carbs:0, fat:1, unit:"100جم" },
};

// ========== DATA ==========
const DEFAULT_PROFILE = { name:"بطل", weight:90, height:185, goal:"تضخيم", targetCalories:2800, targetProtein:180, targetCarbs:300, targetFat:80 };
const DEFAULT_WORKOUT = { السبت:{ muscle:"صدر + ترايسبس", exercises:[{ id:"1", name:"بنش بريس بار", sets:4, reps:"10-12", rest:"90 ث", notes:"", weights:{} }]}, الأحد:{ muscle:"ظهر + باي", exercises:[]}, الاثنين:{ muscle:"أكتاف", exercises:[]}, الثلاثاء:{ muscle:"راحة 💤", exercises:[]}, الأربعاء:{ muscle:"أرجل", exercises:[]}, الخميس:{ muscle:"صدر B", exercises:[]}, الجمعة:{ muscle:"راحة 💤", exercises:[]} };

// ========== UI COMPONENTS ==========
const NavBar = ({ active, setActive }) => {
  const tabs = [{ id:"home", icon:"🏠", label:"الرئيسية" },{ id:"workout", icon:"💪", label:"تمرين" },{ id:"food", icon:"➕", label:"اضافة اكل" },{ id:"nutrition", icon:"🥗", label:"تغذية" },{ id:"settings", icon:"⚙️", label:"إعدادات" }];
  return <View style={styles.navBar}>{tabs.map(t=><TouchableOpacity key={t.id} onPress={()=>setActive(t.id)} style={styles.navBtn}><Text style={{fontSize:20}}>{t.icon}</Text><Text style={[styles.navTxt,{color:active===t.id?"#00d084":"#6b7280"}]}>{t.label}</Text></TouchableOpacity>)}</View>
};
const MacroBar = ({label,current,target,color}) => { const pct = Math.min(100,target>0?Math.round(current/target*100):0); return <View style={{marginBottom:12}}><View style={{flexDirection:"row",justifyContent:"space-between"}}><Text style={styles.txt13}>{label}</Text><Text style={[styles.txt13,{color,fontWeight:"700"}]}>{current}/{target}</Text></View><View style={styles.progressBg}><View style={[styles.progressFill,{backgroundColor:color,width:`${pct}%`}]}/></View></View>};
const StatCard = ({label,value,unit,color,icon}) => <View style={styles.statCard}><Text style={{fontSize:20}}>{icon}</Text><Text style={[styles.statVal,{color}]}>{value}<Text style={styles.statUnit}>{unit}</Text></Text><Text style={styles.statLabel}>{label}</Text></View>;

// ========== MODALS ==========
const ExerciseModal = ({ex,onSave,onClose}) => {
  const [f,setF] = useState(ex||{name:"",sets:3,reps:"10-12",rest:"60 ث",notes:"",weights:{}});
  return <Modal visible transparent animationType="slide"><TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}><View style={styles.modal}>
    <Text style={styles.h2}>{ex?"تعديل":"اضافة"} تمرين</Text>
    <TextInput placeholder="اسم التمرين" value={f.name} onChangeText={t=>setF({...f,name:t})} style={styles.inp} placeholderTextColor="#9ca3af"/>
    <TextInput placeholder="تكرارات 10-12" value={f.reps} onChangeText={t=>setF({...f,reps:t})} style={styles.inp} placeholderTextColor="#9ca3af"/>
    <View style={{flexDirection:"row",gap:10}}><TouchableOpacity style={[styles.btn,{flex:1,backgroundColor:"#374151"}]} onPress={onClose}><Text style={styles.btnTxt2}>الغاء</Text></TouchableOpacity><TouchableOpacity style={[styles.btn,{flex:2}]} onPress={()=>f.name.trim()&&onSave({...f,id:f.id||uid()})}><Text style={styles.btnTxt}>حفظ</Text></TouchableOpacity></View>
  </View></TouchableOpacity></Modal>
};

// ========== 2. مودال تسجيل الوزن - تعديل 2 ==========
const WeightModal = ({ex,onSave,onClose}) => {
  const [week,setWeek] = useState(""); const [w,setW] = useState("");
  return <Modal visible transparent animationType="slide"><TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}><View style={styles.modal}>
    <Text style={styles.h2}>تسجيل وزن: {ex.name}</Text>
    <TextInput placeholder="رقم الاسبوع: 1" value={week} onChangeText={setWeek} style={styles.inp} keyboardType="numeric" placeholderTextColor="#9ca3af"/>
    <TextInput placeholder="الوزن بالكجم: 70" value={w} onChangeText={setW} style={styles.inp} keyboardType="numeric" placeholderTextColor="#9ca3af"/>
    <View style={{flexDirection:"row",gap:10}}><TouchableOpacity style={[styles.btn,{flex:1,backgroundColor:"#374151"}]} onPress={onClose}><Text style={styles.btnTxt2}>الغاء</Text></TouchableOpacity><TouchableOpacity style={[styles.btn,{flex:2}]} onPress={()=>{if(week&&w)onSave(ex,week,parseFloat(w))}}><Text style={styles.btnTxt}>حفظ الوزن</Text></TouchableOpacity></View>
  </View></TouchableOpacity></Modal>
};

// ========== PAGES ==========
const HomePage = ({profile,nutrition}) => {
  const todayStr = new Date().toDateString(); const nut = nutrition[todayStr]||{cal:0,pro:0,carbs:0,fat:0}; const bmi = (profile.weight/(profile.height/100)**2).toFixed(1);
  return <ScrollView style={{padding:16,paddingBottom:100}}>
    <Text style={styles.h1}>داشبورد البطل</Text>
    <View style={{flexDirection:"row",gap:8,marginVertical:14}}><StatCard label="الوزن" value={profile.weight} unit="كجم" color="#00d084" icon="⚖️"/><StatCard label="BMI" value={bmi} unit="" color="#a78bfa" icon="💡"/></View>
    <View style={styles.card}><Text style={styles.h3}>سعرات النهارده</Text><MacroBar label="سعرات" current={nut.cal} target={profile.targetCalories} color="#f59e0b"/><MacroBar label="بروتين" current={nut.pro} target={profile.targetProtein} color="#3b82f6"/></View>
  </ScrollView>
};

const WorkoutPage = ({workoutPlan,setWorkoutPlan}) => {
  const [day,setDay] = useState(todayName()); const [done,setDone] = useState({}); const [modal,setModal] = useState(null); const [weightModal,setWeightModal] = useState(null); // تعديل 2
  useEffect(()=>{getLS("done_exercises",{}).then(setDone)},[]); useEffect(()=>{setLS("done_exercises",done)},[done]);
  const plan = workoutPlan[day]; const isRest = plan.exercises.length===0;
  const toggle = id => setDone({...done,[`${day}_${id}`]:!done[`${day}_${id}`]});
  const save = ex => { const exs = modal?.mode==="edit"?plan.exercises.map(e=>e.id===ex.id?ex:e):[...plan.exercises,ex]; const np = {...workoutPlan,[day]:{...plan,exercises:exs}}; setWorkoutPlan(np); setLS("workout_plan",np); setModal(null); };
  const del = id => { const np = {...workoutPlan,[day]:{...plan,exercises:plan.exercises.filter(e=>e.id!==id)}}; setWorkoutPlan(np); setLS("workout_plan",np); };

  // تعديل 2: حفظ الوزن
  const saveWeight = (ex, week, w) => { const updatedEx = {...ex, weights:{...ex.weights,[week]:w}}; const exs = plan.exercises.map(e=>e.id===ex.id?updatedEx:e); const np = {...workoutPlan,[day]:{...plan,exercises:exs}}; setWorkoutPlan(np); setLS("workout_plan",np); setWeightModal(null); };

  return <ScrollView style={{padding:16,paddingBottom:100}}>
    <Text style={styles.h1}>التمرين 💪</Text>
    <ScrollView horizontal><View style={{flexDirection:"row",gap:7}}>{DAYS_ORDER.map(d=><TouchableOpacity key={d} onPress={()=>setDay(d)} style={[styles.dayBtn,{backgroundColor:day===d?DAY_COLORS[d]:"#1f2937"}]}><Text style={{color:"#fff"}}>{d}</Text></TouchableOpacity>)}</View></ScrollView>
    <View style={[styles.card,{padding:0,marginTop:14}]}><View style={{backgroundColor:DAY_COLORS[day],padding:14,flexDirection:"row",justifyContent:"space-between"}}><Text style={{color:"#fff",fontWeight:"800"}}>{plan.muscle}</Text><TouchableOpacity disabled={isRest} onPress={()=>setModal({mode:"add"})}><Text style={{color:"#fff",fontSize:22}}>+</Text></TouchableOpacity></View>
    {isRest?<Text style={{textAlign:"center",padding:20,color:"#6b7280"}}>راحة 💤</Text>:plan.exercises.map(ex=>
      <View key={ex.id} style={{padding:14,borderBottomWidth:1,borderColor:"#374151"}}>
        <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
          <TouchableOpacity onPress={()=>toggle(ex.id)} style={{flexDirection:"row",gap:10,flex:1}}>
            <View style={[styles.check,{backgroundColor:done[`${day}_${ex.id}`]?"#00d084":"#374151"}]}>{done[`${day}_${ex.id}`]&&<Text style={{color:"#fff"}}>✓</Text>}</View>
            <View><Text style={{color:done[`${day}_${id}`]?"#6b7280":"#fff",fontWeight:"700"}}>{ex.name}</Text><Text style={{color:"#9ca3af",fontSize:12}}>{ex.sets}×{ex.reps}</Text></View>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>setWeightModal(ex)}><Text style={{color:"#60a5fa",fontSize:12,marginRight:8}}>وزن</Text></TouchableOpacity>
          <TouchableOpacity onPress={()=>del(ex.id)}><Text style={{color:"#f87171"}}>حذف</Text></TouchableOpacity>
        </View>
        {Object.keys(ex.weights).length>0&&<Text style={{color:"#a7f3d0",fontSize:11,marginTop:5}}>اخر وزن: اسبوع {Object.keys(ex.weights).pop()} = {ex.weights[Object.keys(ex.weights).pop()]} كجم</Text>}
      </View>
    )}</View>
    {modal&&<ExerciseModal ex={modal.mode==="edit"?modal:null} onSave={save} onClose={()=>setModal(null)}/>}
    {weightModal&&<WeightModal ex={weightModal} onSave={saveWeight} onClose={()=>setWeightModal(null)}/>}
  </ScrollView>
};

// ========== 1. صفحة اضافة اكل - تعديل 1 ==========
const FoodAddPage = ({nutrition,setNutrition,profile}) => {
  const [search,setSearch] = useState(""); const [qty,setQty] = useState("100"); const [selected,setSelected] = useState(null);
  const todayStr = new Date().toDateString();
  const addFood = () => {
    if(!selected||!qty) return;
    const food = FOOD_DB[selected]; const factor = parseFloat(qty)/100;
    const added = { cal:Math.round(food.cal*factor), pro:Math.round(food.pro*factor), carbs:Math.round(food.carbs*factor), fat:Math.round(food.fat*factor) };
    const today = nutrition[todayStr]||{cal:0,pro:0,carbs:0,fat:0};
    const updated = {...nutrition,[todayStr]:{cal:today.cal+added.cal, pro:today.pro+added.pro, carbs:today.carbs+added.carbs, fat:today.fat+added.fat}};
    setNutrition(updated); setLS("nutrition",updated); Alert.alert("تم","تم اضافة "+selected);
    setSelected(null); setQty("100");
  };
  return <ScrollView style={{padding:16,paddingBottom:100}}>
    <Text style={styles.h1}>اضافة اكل ➕</Text>
    <View style={styles.card}>
      <TextInput placeholder="ابحث عن اكلة: رز، بيض..." value={search} onChangeText={setSearch} style={styles.inp} placeholderTextColor="#9ca3af"/>
      {Object.keys(FOOD_DB).filter(f=>f.includes(search)).map(f=>
        <TouchableOpacity key={f} onPress={()=>setSelected(f)} style={[styles.foodItem,{backgroundColor:selected===f?"#065f46":"#374151"}]}>
          <Text style={{color:"#fff"}}>{f} - {FOOD_DB[f].cal} سعرة/{FOOD_DB[f].unit}</Text>
        </TouchableOpacity>
      )}
      {selected&&<><TextInput placeholder="الكمية بالجرام" value={qty} onChangeText={setQty} style={styles.inp} keyboardType="numeric" placeholderTextColor="#9ca3af"/>
      <Text style={{color:"#a7f3d0",marginBottom:10}}>الاجمالي: {Math.round(FOOD_DB[selected].cal*qty/100)} سعرة</Text>
      <TouchableOpacity style={styles.btn} onPress={addFood}><Text style={styles.btnTxt}>اضافة لليوم</Text></TouchableOpacity></>}
    </View>
  </ScrollView>
};

const NutritionPage = ({nutrition,profile}) => {
  const todayStr = new Date().toDateString(); const todayNut = nutrition[todayStr]||{cal:0,pro:0,carbs:0,fat:0};
  return <ScrollView style={{padding:16,paddingBottom:100}}><Text style={styles.h1}>التغذية 🥗</Text><View style={styles.card}><MacroBar label="سعرات" current={todayNut.cal} target={profile.targetCalories} color="#f59e0b"/><MacroBar label="بروتين" current={todayNut.pro} target={profile.targetProtein} color="#3b82f6"/></View></ScrollView>
};

const SettingsPage = ({profile,setProfile}) => {
  const [p,setP] = useState(profile);
  // تعديل 3: المنبهات
  const setWaterReminder = async () => {
    await Notifications.requestPermissionsAsync();
    await Notifications.scheduleNotificationAsync({ content:{title:"اشرب ميه يا وحش 💧"}, trigger:{hour:2, repeats:true} });
    Alert.alert("تم","منبه الميه كل ساعتين اتفعل");
  };
  const save = () => { setProfile(p); setLS("profile",p); Alert.alert("تم الحفظ"); };

  return <ScrollView style={{padding:16,paddingBottom:100}}><Text style={styles.h1}>الإعدادات ⚙️</Text>
    <View style={styles.card}>
      <TextInput placeholder="الوزن" keyboardType="numeric" value={String(p.weight)} onChangeText={t=>setP({...p,weight:Number(t)})} style={styles.inp} placeholderTextColor="#9ca3af"/>
      <TextInput placeholder="الطول" keyboardType="numeric" value={String(p.height)} onChangeText={t=>setP({...p,height:Number(t)})} style={styles.inp} placeholderTextColor="#9ca3af"/>
      <TouchableOpacity style={styles.btn} onPress={save}><Text style={styles.btnTxt}>حفظ البيانات</Text></TouchableOpacity>
    </View>
    <View style={styles.card}>
      <Text style={styles.h3}>المنبهات 💧</Text>
      <TouchableOpacity style={[styles.btn,{backgroundColor:"#3b82f6"}]} onPress={setWaterReminder}><Text style={styles.btnTxt}>تفعيل منبه الميه كل ساعتين</Text></TouchableOpacity>
    </View>
  </ScrollView>
};

// ========== APP ==========
export default function App() {
  const [tab,setTab] = useState("home"); const [profile,setProfile] = useState(DEFAULT_PROFILE); const [workoutPlan,setWorkoutPlan] = useState(DEFAULT_WORKOUT); const [nutrition,setNutrition] = useState({});
  useEffect(()=>{getLS("profile",DEFAULT_PROFILE).then(setProfile)},[]); useEffect(()=>{setLS("profile",profile)},[profile]);
  useEffect(()=>{getLS("workout_plan",DEFAULT_WORKOUT).then(setWorkoutPlan)},[]); useEffect(()=>{setLS("workout_plan",workoutPlan)},[workoutPlan]);
  useEffect(()=>{getLS("nutrition",{}).then(setNutrition)},[]); useEffect(()=>{setLS("nutrition",nutrition)},[nutrition]);

  return <SafeAreaView style={styles.container}><StatusBar style="light"/>
    {tab==="home"&&<HomePage profile={profile} nutrition={nutrition}/>}
    {tab==="workout"&&<WorkoutPage workoutPlan={workoutPlan} setWorkoutPlan={setWorkoutPlan}/>}
    {tab==="food"&&<FoodAddPage nutrition={nutrition} setNutrition={setNutrition} profile={profile}/>}
    {tab==="nutrition"&&<NutritionPage nutrition={nutrition} profile={profile}/>}
    {tab==="settings"&&<SettingsPage profile={profile} setProfile={setProfile}/>}
    <NavBar active={tab} setActive={setTab}/>
  </SafeAreaView>
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:"#111827"}, h1:{color:"#fff",fontSize:24,fontWeight:"800",marginBottom:10}, h2:{color:"#fff",fontSize:18,fontWeight:"800",marginBottom:14}, h3:{color:"#fff",fontWeight:"700",marginBottom:10}, txt13:{color:"#e5e7eb",fontSize:13},
  navBar:{position:"absolute",bottom:0,left:0,right:0,backgroundColor:"#111827",borderTopWidth:1,borderColor:"#1f2937",flexDirection:"row",paddingBottom:Platform.OS==='ios'?10:0}, navBtn:{flex:1,padding:10,alignItems:"center"}, navTxt:{fontSize:10},
  card:{backgroundColor:"#1f2937",borderRadius:18,padding:16,marginBottom:14}, statCard:{backgroundColor:"#1f2937",borderRadius:16,padding:14,flex:1}, statVal:{fontSize:20,fontWeight:"800"}, statUnit:{fontSize:11,color:"#9ca3af"}, statLabel:{color:"#9ca3af",fontSize:11},
  progressBg:{backgroundColor:"#374151",borderRadius:99,height:7}, progressFill:{height:7,borderRadius:99},
  overlay:{flex:1,backgroundColor:"rgba(0,0,0,0.7)",justifyContent:"flex-end"}, modal:{backgroundColor:"#1f2937",borderTopLeftRadius:20,borderTopRightRadius:20,padding:20},
  inp:{backgroundColor:"#374151",borderRadius:10,padding:12,color:"#fff",marginBottom:12}, btn:{backgroundColor:"#00d084",padding:13,borderRadius:12,alignItems:"center"}, btnTxt:{color:"#064e3b",fontWeight:"800"}, btnTxt2:{color:"#9ca3af",fontWeight:"700"},
  dayBtn:{borderRadius:99,paddingHorizontal:12,paddingVertical:7}, check:{width:22,height:22,borderRadius:11,alignItems:"center",justifyContent:"center"},
  foodItem:{padding:12,borderRadius:10,marginBottom:8}
});
