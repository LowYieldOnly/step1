/* Build the Pharm section of rapidref.json from the standalone "Cardio Pharm
   Compartments" page. Same discipline as mk_rapidref.js: the content is copied
   verbatim, then checked — every drug key referenced anywhere must exist, every
   drug must be reachable from at least one view, and the hazard lists must agree
   with the per-drug tags. It fails loudly rather than writing something half-right. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const RR=path.join(path.dirname(fileURLToPath(import.meta.url)),'..','..','rapidref.json');

const DRUGS={
 nitro:{n:"Nitrates",c:"Nitroglycerin, isosorbide di/mononitrate",m:"↑NO → ↑cGMP; veins ≫ arteries, so mainly ↓preload",u:"Angina, ACS, pulmonary edema",f:"Reflex tachycardia; contraindicated in RV infarct, HOCM, and with PDE-5 inhibitors. Methemoglobinemia.",t:["reflex","combo"]},
 amlo:{n:"Amlodipine",c:"Dihydropyridine CCB",m:"Blocks L-type Ca channels in vascular smooth muscle",u:"Routine chronic hypertension, angina incl. vasospastic, Raynaud",f:"Peripheral edema, flushing, reflex tachycardia, gingival hyperplasia",t:["reflex"]},
 nife:{n:"Nifedipine",c:"Dihydropyridine CCB",m:"Vascular-selective L-type Ca blockade (= amlodipine potency)",u:"Hypertension, angina, Raynaud",f:"Most reflex tachycardia of the group; peripheral edema",t:["reflex"]},
 nicar:{n:"Nicardipine",c:"Dihydropyridine CCB, IV",m:"Vascular L-type Ca blockade, titratable",u:"Hypertensive urgency or emergency",f:"Reflex tachycardia, flushing",t:["reflex"]},
 clev:{n:"Clevidipine",c:"Dihydropyridine CCB, IV",m:"Ultra-short-acting vascular Ca blockade",u:"Hypertensive emergency — off in minutes if BP overshoots",f:"Reflex tachycardia",t:["reflex"]},
 nimo:{n:"Nimodipine",c:"Dihydropyridine CCB",m:"Vascular Ca blockade with cerebral selectivity",u:"Subarachnoid hemorrhage only — prevents delayed ischemia",f:"The trap: structurally a DHP but not a BP drug. If the stem says SAH, nothing else fits.",t:[]},
 dilt:{n:"Diltiazem",c:"Non-DHP CCB · Class IV",m:"L-type Ca blockade at heart > vessel; ↓conduction velocity, ↑ERP, ↑PR",u:"Rate control in AFib/flutter, nodal arrhythmias, HTN with angina",f:"Negative inotrope — avoid in HFrEF. Additive AV block with β-blockers.",t:["inotrope","combo"]},
 vera:{n:"Verapamil",c:"Non-DHP CCB · Class IV",m:"Most cardioselective Ca blockade; ↓conduction velocity, ↑ERP, ↑PR",u:"Rate control in AFib/flutter, nodal arrhythmia prevention",f:"Negative inotrope, constipation, hyperprolactinemia. Raises digoxin levels.",t:["inotrope","combo"]},
 hydral:{n:"Hydralazine",c:"Direct arteriolar vasodilator",m:"↑cGMP → relaxation; arterioles > veins, so ↓afterload",u:"Severe/acute HTN, HF with a nitrate — and the pregnancy-safe answer",f:"Compensatory tachycardia (avoid in angina/CAD), drug-induced lupus",t:["reflex","safe"]},
 nipride:{n:"Nitroprusside",c:"IV vasodilator",m:"Direct NO release → ↑cGMP; arteries = veins",u:"Hypertensive emergency when you need reversibility in minutes",f:"Cyanide toxicity",t:["reflex"]},
 feno:{n:"Fenoldopam",c:"D1 agonist",m:"Coronary, peripheral, renal, splanchnic vasodilation",u:"Hypertensive emergency, especially with renal concern; post-op HTN",f:"Hypotension, tachycardia, flushing",t:["reflex"]},
 labet:{n:"Labetalol",c:"Nonselective α + β blocker",m:"Combined α1 and β blockade",u:"Hypertensive emergency; safe where unopposed α-agonism is the worry",f:"Bradycardia, bronchospasm",t:[]},
 ranol:{n:"Ranolazine",c:"Late Na-current inhibitor",m:"Blocks late inward Na → ↓diastolic wall tension and O₂ use",u:"Refractory angina already on nitrate + β-blocker + CCB",f:"QT prolongation. Notably does NOT change HR or BP — that's why it's the add-on.",t:["qt"]},
 digox:{n:"Digoxin",c:"Cardiac glycoside",m:"Inhibits Na/K-ATPase → ↑intracellular Ca → inotropy; vagal tone → ↓HR",u:"HFrEF symptom control, especially with concurrent AFib",f:"Yellow vision, arrhythmia. Hypokalemia and renal failure predispose; verapamil/amiodarone/quinidine raise levels.",t:["combo"]},
 sacu:{n:"Sacubitril / valsartan",c:"ARNI",m:"Neprilysin inhibition spares natriuretic peptides + ARB",u:"HFrEF, replacing an ACEi or ARB",f:"Angioedema if combined with an ACEi — both raise bradykinin, so wash out first. Hyperkalemia.",t:["combo"]},
 ivab:{n:"Ivabradine",c:"Funny-current inhibitor",m:"Blocks I_f → prolongs phase 4 → ↓HR with no inotropic effect",u:"Chronic HFrEF, sinus rhythm, HR still high on maximal β-blocker",f:"Luminous visual phenomena, bradycardia",t:[]},
 miln:{n:"Milrinone",c:"PDE-3 inhibitor",m:"↑cAMP → inotropy plus vasodilation",u:"Acute decompensated HF needing inotropic support",f:"Arrhythmia, hypotension",t:[]},
 sild:{n:"Sildenafil",c:"PDE-5 inhibitor",m:"Blocks cGMP breakdown → sustained smooth muscle relaxation",u:"Pulmonary hypertension, erectile dysfunction",f:"Fatal hypotension with nitrates — same pathway, two steps",t:["combo"]},
 quin:{n:"Quinidine",c:"Class IA",m:"Moderate Na blockade; ↑AP duration, ↑ERP, ↑QT",u:"Atrial and ventricular arrhythmias, reentrant/ectopic SVT and VT",f:"Cinchonism (headache, tinnitus), torsades, thrombocytopenia",t:["qt","combo"]},
 proca:{n:"Procainamide",c:"Class IA",m:"Moderate Na blockade; ↑AP duration, ↑ERP, ↑QT",u:"Atrial and ventricular arrhythmias",f:"Reversible lupus-like syndrome, torsades",t:["qt"]},
 diso:{n:"Disopyramide",c:"Class IA",m:"Moderate Na blockade; ↑AP duration and ERP",u:"Atrial and ventricular arrhythmias",f:"Heart failure — the negative inotrope of the IA group. Torsades.",t:["qt","inotrope"]},
 lido:{n:"Lidocaine",c:"Class IB",m:"Weak Na blockade, ↓AP duration; prefers ischemic/depolarized tissue",u:"Acute ventricular arrhythmia post-MI, digitalis-induced arrhythmia",f:"CNS stimulation or depression. IB is Best post-MI.",t:[]},
 mexi:{n:"Mexiletine",c:"Class IB",m:"Weak Na blockade, ↓AP duration",u:"Ventricular arrhythmias, post-MI",f:"CNS effects, cardiovascular depression",t:[]},
 flec:{n:"Flecainide",c:"Class IC",m:"Strong Na blockade; ↑ERP in AV node and bypass tracts, minimal AP-duration change",u:"SVT and AFib in a structurally normal heart; refractory VT as last resort",f:"Proarrhythmic post-MI — contraindicated in structural or ischemic heart disease",t:["combo"]},
 propaf:{n:"Propafenone",c:"Class IC",m:"Strong Na blockade",u:"SVT/AFib in structurally normal hearts",f:"Proarrhythmic; contraindicated post-MI and in structural disease",t:["combo"]},
 metop:{n:"Metoprolol",c:"Class II β-blocker",m:"↓cAMP, ↓Ca currents; ↓slope of phase 4, ↑PR interval",u:"Rate control, SVT, post-MI arrhythmia prevention, angina",f:"Bradycardia, AV block, masks hypoglycemia, dyslipidemia",t:["inotrope"]},
 esmo:{n:"Esmolol",c:"Class II β-blocker",m:"Very short-acting β1 blockade",u:"When you want β-blockade you can stop fast — periprocedural, unstable patients",f:"Bradycardia, hypotension",t:["inotrope"]},
 propran:{n:"Propranolol",c:"Class II β-blocker, nonselective",m:"Nonselective β blockade",u:"SVT, rate control, thyroid storm, migraine prophylaxis",f:"Exacerbates vasospastic angina — unopposed vasoconstriction. Avoid in asthma/COPD.",t:["inotrope","combo"]},
 carve:{n:"Carvedilol",c:"β-blocker with α1 blockade",m:"Combined α and β blockade",u:"HFrEF, hypertension",f:"Bradycardia, hypotension",t:["inotrope"]},
 amio:{n:"Amiodarone",c:"Class III",m:"K blockade → ↑AP duration, ↑ERP, ↑QT; also has class I, II and IV effects",u:"AFib/flutter and VT — the broadest-spectrum option here",f:"Pulmonary fibrosis, thyroid (40% iodine), hepatotoxicity, blue-gray skin, corneal deposits. Check PFTs, LFTs, TFTs.",t:["qt","combo"]},
 sota:{n:"Sotalol",c:"Class III (+ β blockade)",m:"K blockade plus β blockade → ↑AP duration, ↑ERP, ↑QT",u:"AFib/flutter, VT",f:"Torsades, excessive β blockade",t:["qt","inotrope"]},
 ibut:{n:"Ibutilide",c:"Class III",m:"K blockade → ↑AP duration and QT",u:"Chemical cardioversion of AFib/flutter",f:"Torsades — the headline risk",t:["qt"]},
 dofe:{n:"Dofetilide",c:"Class III",m:"K blockade → ↑AP duration and QT",u:"AFib/flutter",f:"QT prolongation, torsades",t:["qt"]},
 aden:{n:"Adenosine",c:"Nodal blocker",m:"↑K efflux → hyperpolarization, ↓I_Ca → AV block for ~15 seconds",u:"Diagnosing or terminating SVT at the bedside",f:"Flushing, chest pain, sense of impending doom, bronchospasm. Blunted by caffeine and theophylline.",t:[]},
 mag:{n:"Magnesium",c:"Electrolyte",m:"Membrane stabilization",u:"Torsades de pointes and digoxin toxicity — reflexive answer for both",f:"Hypotension with rapid infusion",t:[]},
 statin:{n:"Statins",c:"Atorvastatin, rosuvastatin, simvastatin…",m:"HMG-CoA reductase inhibition → ↑LDL receptor recycling",u:"First-line for essentially every lipid problem — the only class here with a mortality benefit in CAD",f:"Hepatotoxicity, myopathy (worse with fibrates or niacin)",t:["combo"]},
 fibr:{n:"Fibrates",c:"Fenofibrate, gemfibrozil",m:"PPAR-α activation → ↑LPL → triglyceride clearance",u:"Triglycerides are the outlier — best TG-lowering in the set",f:"Myopathy risk rises sharply with a statin; cholesterol gallstones",t:["combo"]},
 niac:{n:"Niacin",c:"Nicotinic acid",m:"Inhibits hormone-sensitive lipase; ↓hepatic VLDL synthesis",u:"Best HDL raiser — second-line add-on",f:"Flushing (prostaglandin-mediated, blunted by NSAIDs), hyperglycemia, hyperuricemia",t:[]},
 pcsk:{n:"PCSK9 inhibitors",c:"Alirocumab, evolocumab",m:"Block LDL-receptor degradation → more LDL cleared",u:"Not at goal on statin + ezetimibe, or statin-intolerant",f:"Myalgias, neurocognitive effects",t:[]},
 ezet:{n:"Ezetimibe",c:"Cholesterol absorption inhibitor",m:"Blocks absorption at the intestinal brush border",u:"Incremental LDL lowering on top of a statin",f:"Rare ↑LFTs, diarrhea",t:[]},
 resin:{n:"Bile acid resins",c:"Cholestyramine, colesevelam, colestipol",m:"Disrupt enterohepatic circulation → ↑LDL receptor recycling",u:"LDL add-on when you want to avoid more myopathy risk",f:"GI upset, impaired absorption of other drugs and fat-soluble vitamins",t:[]},
 fish:{n:"Fish oil / omega-3",c:"Marine fatty acids",m:"↓VLDL production and ApoB synthesis",u:"High triglycerides",f:"Can nudge LDL slightly UP — the common distractor",t:[]}
};

const TAGS=[
 {k:"qt",label:"QT / torsades risk"},
 {k:"reflex",label:"Causes reflex tachycardia"},
 {k:"inotrope",label:"Negative inotrope — caution in HFrEF"},
 {k:"combo",label:"Dangerous combination or contraindication"},
 {k:"safe",label:"Pregnancy-safe"}
];

const INDICATION=[
 {h:"Hypertension",s:"The fork: chronic control vs. something you can switch off in minutes.",b:[
  {t:"Routine chronic",n:"arterial-selective, once daily",d:["amlo","nife"]},
  {t:"HTN + angina or AFib",n:"you also want the rate effect",d:["dilt","vera"]},
  {t:"Urgency / emergency",n:"all titratable — reversible fast",d:["labet","clev","nicar","feno","nipride"]},
  {t:"Pregnancy",n:"the explicitly safe one",d:["hydral"]},
  {t:"Subarachnoid hemorrhage",n:"not a BP indication at all",d:["nimo"]}]},
 {h:"Angina",s:"Three different problems sharing one name — the subtype picks the drug.",b:[
  {t:"Stable (demand ischemia)",n:"",d:["nitro","metop","amlo","dilt"]},
  {t:"Vasospastic / Prinzmetal",n:"nonselective β-blockers make it worse",d:["amlo","dilt","nitro"]},
  {t:"Refractory on all three classes",n:"no HR or BP effect — that's the point",d:["ranol"]}]},
 {h:"Heart failure (HFrEF)",s:"Note what's absent: verapamil and diltiazem are negative inotropes here.",b:[
  {t:"Symptoms, especially with AFib",n:"dual benefit",d:["digox"]},
  {t:"Guideline-directed, replacing ACEi/ARB",n:"wash out first",d:["sacu"]},
  {t:"HR still high on max β-blocker",n:"sinus rhythm only",d:["ivab"]},
  {t:"ACEi/ARB not tolerated",n:"combined pre- and afterload",d:["hydral","nitro"]},
  {t:"Acute decompensation needing inotropy",n:"",d:["miln"]},
  {t:"Chronic background therapy",n:"",d:["carve","metop"]}]},
 {h:"Arrhythmia",s:"Decide rate vs. rhythm first; the two one-off agents don't fit the class system.",b:[
  {t:"Rate control in AFib/flutter",n:"digoxin if EF is low too",d:["metop","dilt","vera","digox"]},
  {t:"Rhythm control",n:"structural disease changes the answer",d:["amio","sota","flec","dofe","ibut"]},
  {t:"Ventricular, post-MI",n:"never a IC agent here",d:["lido","mexi","amio"]},
  {t:"Terminate or diagnose SVT now",n:"~15 seconds of action",d:["aden"]},
  {t:"Torsades or dig toxicity",n:"reflexive",d:["mag"]}]},
 {h:"Lipids",s:"Statins first for everything; the others answer a specific outlier.",b:[
  {t:"Any lipid problem, first line",n:"only mortality benefit in CAD",d:["statin"]},
  {t:"Triglycerides are the problem",n:"",d:["fibr","fish"]},
  {t:"HDL is the problem",n:"",d:["niac"]},
  {t:"LDL still above goal on a statin",n:"",d:["ezet","pcsk","resin"]}]},
 {h:"Pulmonary hypertension",s:"The cGMP arm again, approached from the other end.",b:[
  {t:"PDE-5 inhibition",n:"same pathway the nitrates use",d:["sild"]}]}
];

const HAZARD=[
 {k:"qt",h:"QT prolongation and torsades",p:"New arrhythmia after starting one of these? Think torsades before drug failure. Amiodarone prolongs QT but carries lower real-world torsades risk than the others.",d:["quin","proca","diso","sota","ibut","dofe","amio","ranol"]},
 {k:"reflex",h:"Reflex tachycardia (arterial dilators)",p:"This is why so many of these get paired with a β-blocker — damage control for a predictable side effect, not a habit.",d:["hydral","amlo","nife","nicar","clev","nipride","feno","nitro"]},
 {k:"inotrope",h:"Negative inotropes — caution in HFrEF",p:"Perfectly reasonable rate-control drugs that become the wrong answer the moment the stem mentions reduced EF.",d:["dilt","vera","diso","metop","propran","carve","esmo","sota"]},
 {k:"combo",h:"Combination and context landmines",p:"Nitrate + PDE-5 → fatal hypotension (same pathway, two steps). Sacubitril + ACEi → angioedema (both raise bradykinin). Verapamil or diltiazem + β-blocker → additive AV block. IC agents post-MI → proarrhythmic. Propranolol in vasospastic angina → unopposed vasoconstriction. Statin + fibrate → myopathy.",d:["nitro","sild","sacu","dilt","vera","flec","propaf","propran","statin","fibr","digox","amio","quin"]},
 {k:"safe",h:"Pregnancy-safe",p:"The one drug in this set explicitly called out. If a stem specifies pregnancy, it's usually pointing here.",d:["hydral"]}
];

const FINDINGS=[
 ["Cinchonism — headache, tinnitus","Quinidine","quin"],
 ["Reversible lupus-like syndrome","Procainamide","proca"],
 ["Yellow-tinged vision","Digoxin","digox"],
 ["Gingival hyperplasia","CCBs, class-wide","amlo"],
 ["Hyperprolactinemia","Verapamil","vera"],
 ["Blue-gray skin, corneal deposits, thyroid dysfunction","Amiodarone","amio"],
 ["Cyanide toxicity","Nitroprusside","nipride"],
 ["Flushing, prostaglandin-mediated","Niacin","niac"],
 ["Luminous visual phenomena","Ivabradine","ivab"],
 ["Impending doom, bronchospasm","Adenosine","aden"],
 ["Drug-induced lupus","Hydralazine","hydral"],
 ["Fishlike taste","Fish oil","fish"]
];

const CLASSES=[
 {cl:"IA",dr:["quin","proca","diso"],na:"Moderate",ap:"↑ AP duration",use:"Broad — atrial and ventricular"},
 {cl:"IB",dr:["lido","mexi"],na:"Weak",ap:"↓ AP duration",use:"Acute ventricular, especially post-MI, and digitalis-induced",hl:true},
 {cl:"IC",dr:["flec","propaf"],na:"Strong",ap:"Minimal change",use:"SVT/AFib in structurally normal hearts only — contraindicated post-MI",hl:true},
 {cl:"II",dr:["metop","propran","esmo","carve"],na:"—",ap:"—",use:"SVT, rate control, post-MI arrhythmia prevention"},
 {cl:"III",dr:["amio","ibut","dofe","sota"],na:"— (K blockade)",ap:"↑ AP duration",use:"AFib/flutter; VT for amiodarone and sotalol"},
 {cl:"IV",dr:["dilt","vera"],na:"— (Ca blockade)",ap:"—",use:"AV-nodal arrhythmias, rate control"}
];

const PATHWAYS=[
 {h:"cGMP arm",s:"Vasodilators that converge on guanylate cyclase or block cGMP breakdown.",d:["nitro","nipride","hydral","sild"]},
 {h:"cAMP arm",s:"Gs agonists and PDE-3 inhibition — relaxation plus inotropy.",d:["feno","miln"]},
 {h:"Calcium entry",s:"L-type channel blockade, split by where it acts.",d:["amlo","nife","nicar","clev","nimo","dilt","vera"]}
];

const NOTES=[
 {h:"Why nitrate + β-blocker is the default pairing",
  s:"Nitrates drop preload and BP but trigger reflex tachycardia and ↑contractility, which raise oxygen demand and fight the drug's own benefit. β-blockers do the opposite — no preload effect, but they blunt HR and contractility. Together the reflex effects cancel and MVO₂ falls twice as hard. Verapamil and diltiazem substitute for the β-blocker.",
  cols:["","Nitrate","β-blocker","Both"],
  rows:[["End-diastolic volume","↓","none or ↑","none or ↓"],
        ["Contractility","↑ reflex","↓","little / none"],
        ["Heart rate","↑ reflex","↓","none or ↓"],
        ["MVO₂","↓","↓","↓↓"]]}
];

const DRILL=[
 ["Subarachnoid hemorrhage","Nimodipine","Structurally a dihydropyridine, but this is a neuroprotective indication, not a BP one.","nimo"],
 ["Angina still limiting on a nitrate, β-blocker and CCB","Ranolazine","Late Na current. Doesn't touch HR or BP, which is exactly why it stacks on top.","ranol"],
 ["Severe hypertension in pregnancy","Hydralazine","The one explicitly pregnancy-safe drug in this set.","hydral"],
 ["Ventricular arrhythmia two days after an MI","Lidocaine","IB is Best post-MI. Flecainide and propafenone are contraindicated — proarrhythmic in ischemic tissue.","lido"],
 ["Need to terminate or unmask an SVT at the bedside","Adenosine","~15 seconds of action, so no lingering effect if it doesn't work. Ask about caffeine first.","aden"],
 ["Torsades de pointes, or digoxin toxicity","Magnesium","Same answer for both. Not really a drug-selection decision.","mag"],
 ["HFrEF, being switched off an ACE inhibitor","Sacubitril / valsartan","36-hour washout — both drugs raise bradykinin, and overlap means angioedema.","sacu"],
 ["HFrEF, sinus rhythm, HR still 80 on maximal β-blockade","Ivabradine","Blocks the funny current: lowers HR without any inotropic cost.","ivab"],
 ["Hypertensive emergency, want it reversible within minutes","Clevidipine or nitroprusside","Titratability is the whole selection criterion here.","clev"],
 ["Vasospastic (Prinzmetal) angina","A calcium channel blocker","And specifically not propranolol — nonselective β blockade worsens the vasospasm.","amlo"],
 ["Triglycerides 800, LDL already at goal","A fibrate","PPAR-α → LPL upregulation → TG clearance. Watch myopathy if a statin is on board.","fibr"],
 ["AFib with rapid rate and reduced ejection fraction","Digoxin (with a β-blocker)","Rate control plus inotropy. Verapamil and diltiazem are negative inotropes — wrong direction here.","digox"],
 ["New AFib in a structurally normal heart, rhythm control wanted","Flecainide or propafenone","IC is fine here and only here — structural or ischemic disease flips it to contraindicated.","flec"],
 ["Chest pain relieved by nitroglycerin, took sildenafil last night","Do not give the nitrate","Both raise cGMP at different steps; the combination causes severe hypotension.","sild"],
 ["Amiodarone started — what gets monitored","PFTs, LFTs, TFTs","Pulmonary fibrosis, hepatotoxicity, and thyroid disease (it's 40% iodine by weight).","amio"],
 ["Hypertensive emergency with renal impairment","Fenoldopam","D1 agonism gives renal and splanchnic vasodilation plus natriuresis.","feno"]
];

/* ---------- validate ---------- */
const errs=[];
const keys=new Set(Object.keys(DRUGS));
const tagKeys=new Set(TAGS.map(t=>t.k));
const seen=new Set();
const use=(list,where)=>list.forEach(k=>{if(!keys.has(k))errs.push("unknown drug '"+k+"' in "+where);else seen.add(k);});
INDICATION.forEach(s=>s.b.forEach(b=>use(b.d,"indication/"+s.h+"/"+b.t)));
HAZARD.forEach(h=>use(h.d,"hazard/"+h.k));
FINDINGS.forEach(([f,,k])=>use([k],"findings/"+f));
CLASSES.forEach(c=>use(c.dr,"classes/"+c.cl));
PATHWAYS.forEach(p=>use(p.d,"pathways/"+p.h));
DRILL.forEach(([s,,,k])=>use([k],"drill/"+s.slice(0,30)));
Object.keys(DRUGS).forEach(k=>{
  (DRUGS[k].t||[]).forEach(t=>{if(!tagKeys.has(t))errs.push("unknown tag '"+t+"' on "+k);});
  ["n","c","m","u","f"].forEach(f=>{if(!DRUGS[k][f])errs.push("drug "+k+" missing field "+f);});
});
const unreachable=[...keys].filter(k=>!seen.has(k));
if(unreachable.length)errs.push("drugs reachable from no view: "+unreachable.join(", "));
// the hazard lists and the per-drug tags are two hand-maintained copies of the
// same fact — if they disagree, one of them is stale
HAZARD.forEach(h=>{
  const tagged=[...keys].filter(k=>(DRUGS[k].t||[]).indexOf(h.k)>=0).sort();
  const listed=h.d.slice().sort();
  const missing=tagged.filter(k=>listed.indexOf(k)<0);
  const extra=listed.filter(k=>tagged.indexOf(k)<0);
  if(missing.length)errs.push("hazard '"+h.k+"' — tagged but not listed: "+missing.join(", "));
  if(extra.length)errs.push("hazard '"+h.k+"' — listed but not tagged: "+extra.join(", "));
});
if(errs.length){console.error("VALIDATION FAILED:");errs.forEach(e=>console.error("  "+e));process.exit(1);}

/* ---------- merge into rapidref.json ---------- */
const pharm={
  id:"cardio-pharm",title:"Cardiovascular",sys:"Cardiology",
  blurb:"The same drug set regrouped four ways. Tap any drug for its one-liner.",
  tags:TAGS,drugs:DRUGS,
  indication:INDICATION,hazard:HAZARD,findings:FINDINGS,
  classes:CLASSES,pathways:PATHWAYS,notes:NOTES,drill:DRILL
};
const cur=JSON.parse(fs.readFileSync(RR,"utf8"));
const out={version:2,refs:cur.refs||[],pharm:[pharm]};
const txt=JSON.stringify(out);
fs.writeFileSync(RR,txt);
console.log("wrote rapidref.json");
console.log("  video-outline references kept: "+out.refs.length+" ("+out.refs.map(r=>r.title).join(", ")+")");
console.log("  pharm references: "+out.pharm.length+" — "+pharm.title);
console.log("    drugs "+Object.keys(DRUGS).length+", tags "+TAGS.length
  +", indication groups "+INDICATION.reduce((a,s)=>a+s.b.length,0)+" in "+INDICATION.length+" sections");
console.log("    hazards "+HAZARD.length+", findings "+FINDINGS.length+", classes "+CLASSES.length
  +", pathways "+PATHWAYS.length+", notes "+NOTES.length+", drill "+DRILL.length);
console.log("  every drug reachable, every reference resolves, hazard lists agree with drug tags");
console.log("  bytes: "+txt.length);
