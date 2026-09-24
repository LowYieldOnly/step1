/* C60 · Minimal / Comprehensive content depth.
 *
 * Minimal drops a whole layer of material from a plan, which makes it the most
 * dangerous feature in the app: a classification mistake doesn't crash anything, it
 * quietly removes something a student needed and they find out at the exam.
 *
 * So the checks are weighted towards what must NEVER be dropped:
 *
 *   1. pathology, pharmacology and clinical material survive Minimal, always. The
 *      specific trap is Bootcamp's "Autonomic System" — five physiology videos and
 *      FIFTEEN drug videos filed under one heading. A category rule there would
 *      delete fifteen pharmacology videos, which is the exact opposite of the point.
 *   2. the design is inclusive by default: an unclassified video is KEPT. The
 *      failure direction has to be "showed you too much".
 *   3. Comprehensive is byte-for-byte the old behaviour, so every plan that existed
 *      before this feature is untouched.
 */
import { openApp, checker } from '../harness.mjs';

const { page: p, errors, mobilePage, close } = await openApp();
const { chk, report } = checker('Content depth — Minimal / Comprehensive');

await p.evaluate(()=>{
  window.__mk=(opts)=>{
    opts=opts||{};
    const blk=brodyBlockById(opts.block||'neuro-sensory');
    AUTHED=true;todayISO=()=>(opts.today||blk.weeks[0].start);
    S.settings={seenBrodyHelp:true,seenUpdate:LATEST_UPDATE};
    PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
    Object.assign(S,{vdone:{},vdoneDate:{},vdoneAt:{},vundone:{},vskip:{},vshaky:{},akdone:{},
      notes:{},streak:{days:{}},assessments:{},_resetAt:0});
    S.cfgs.nbme={examType:'nbme',brody:blk.id,examLabel:blk.name,examISO:blk.shelf,
      startISO:blk.weeks[0].start,restDays:[0],
      resources:{bnb:true,pathoma:true,sketchy:true,bootcamp:true,uwlib:opts.arts!==false},
      systems:blk.systems.slice(),brodyReviewDays:3,brodyJoinWk:1,brodyJoinDate:blk.weeks[0].start};
    if(opts.off)S.cfgs.nbme.contentOff=opts.off;
    if(opts.free)S.cfgs.nbme.brodyFree=true;
    normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';VIEW='today';
    delete S.cfg.brodyPace;delete S.cfg.artPerDay;
    reflow();
  };
  window.__shape=()=>({
    items:SCHED.stats.totalItems, min:SCHED.stats.totalMin, pace:SCHED.brodyPace,
    arts:SCHED.stats.totalArts, artPace:SCHED.artPace||0,
    ids:SCHED.planItems.map(v=>v.id).sort(),
    names:SCHED.planItems.map(v=>v.name),
    heavy:SCHED.weekLoad.filter(w=>w.heavy).map(w=>w.n),
    tail:SCHED.days.filter(d=>d.todo>0||(d.artsTodo||0)>0).map(d=>d.iso).pop()||null,
    cutoff:SCHED.reviewCutoff,
    scheduled:SCHED.days.reduce((a,d)=>a+d.items.length,0),
  });
  window.ALLOFF={anat:true,hist:true,embryo:true,physio:true};
});

const FULL = await p.evaluate(()=>{window.__mk({});                 return window.__shape();});
const MIN  = await p.evaluate(()=>{window.__mk({off:window.ALLOFF});return window.__shape();});

// ---------- 1. the classification itself ----------
const cls=await p.evaluate(()=>{
  const SYS=['Neurology','Psychiatry','Ophthalmology'];
  const v=catVideos().filter(x=>SYS.includes(x.sys));
  const tagged=v.filter(x=>contentTag(x));
  const byTag={};tagged.forEach(x=>{const t=contentTag(x);byTag[t]=(byTag[t]||0)+1;});
  const bad=tagged.filter(x=>CONTENT_TYPES.every(t=>t.k!==contentTag(x))).map(x=>x.name);
  return {total:v.length,tagged:tagged.length,byTag,bad,
    types:CONTENT_TYPES.map(t=>t.k),
    rules:CONTENT_RULES.length,items:Object.keys(CONTENT_TAGS).length};
});
chk('C60-1 four content types, each classification using one of them',
    cls.types.join(',')==='anat,hist,embryo,physio'&&cls.bad.length===0,
    'types '+JSON.stringify(cls.types)+' bad '+JSON.stringify(cls.bad.slice(0,3)));
chk('C60-2 the unit is classified by rules AND per-item tags, not one or the other',
    cls.rules>0&&cls.items>0, cls.rules+' rules, '+cls.items+' per-item tags');
chk('C60-3 every type actually matches something in this unit',
    cls.types.every(t=>(cls.byTag[t]||0)>0), JSON.stringify(cls.byTag));
/* Inclusive by default is the safety property, so it gets asserted directly: most of
   the unit carries no tag at all and is therefore immune to Minimal. */
chk('C60-4 most of the unit is unclassified, and unclassified means kept',
    cls.tagged<cls.total/2&&cls.tagged>0,
    cls.tagged+' tagged of '+cls.total+' — the rest are core and always kept');

// ---------- 2. THE trap: pharmacology must survive ----------
const pharm=await p.evaluate(()=>{
  window.__mk({off:window.ALLOFF});
  const have=new Set(SCHED.planItems.map(v=>v.name));
  const auto=catVideos().filter(v=>v.res==='bootcamp'&&v.cat==='Autonomic System');
  const drugs=auto.filter(v=>!/Overview|Signaling|Secondary Messengers|Summary|Other Involuntary/.test(v.name));
  const physio=auto.filter(v=>/Overview|Signaling|Secondary Messengers|Summary|Other Involuntary/.test(v.name));
  return {
    nDrugs:drugs.length, drugsKept:drugs.filter(v=>have.has(v.name)).length,
    nPhysio:physio.length, physioDropped:physio.filter(v=>!have.has(v.name)).length,
    // every Sketchy sketch and every Pathoma chapter is pharm/path by definition
    skAll:catVideos().filter(v=>v.res==='skpharm'&&v.sys!=='Cardiology'&&v.sys!=='Pulmonary').length,
    skKept:SCHED.planItems.filter(v=>v.res==='skpharm').length,
    paKept:SCHED.planItems.filter(v=>v.res==='pathoma').length,
    // B&B's own drug videos sitting inside an otherwise-physiology section
    bnbDrugs:['Adrenergic Drugs I','Adrenergic Drugs II','Cholinergic Drugs','Cholinergic Toxidromes',
              'Anticonvulsants I','Anticonvulsants II','Antidepressants','Lithium','Antipsychotics']
             .filter(n=>have.has(n)).length,
    // and the pathology that shares a heading with anatomy
    keptPath:['Disorders of the Basal Ganglia','Myasthenia Gravis','Cerebellar Pathology',
              'Cavernous Sinus Thrombosis','Spinal Cord Syndromes','Optic Chiasm Lesion']
             .filter(n=>have.has(n)).length,
  };
});
chk('C60-5 Minimal keeps all 15 autonomic DRUG videos Bootcamp files under a physiology heading',
    pharm.nDrugs===15&&pharm.drugsKept===15, pharm.drugsKept+' of '+pharm.nDrugs+' kept');
chk('C60-6 …while dropping the 5 autonomic physiology videos beside them',
    pharm.nPhysio===5&&pharm.physioDropped===5, pharm.physioDropped+' of '+pharm.nPhysio+' dropped');
chk('C60-7 Minimal keeps every Sketchy Pharm sketch and every Pathoma chapter',
    pharm.skKept===23&&pharm.paKept===7, 'sketchy '+pharm.skKept+', pathoma '+pharm.paKept);
chk('C60-8 …and B&B’s drug videos, including those inside physiology sections',
    pharm.bnbDrugs===9, pharm.bnbDrugs+' of 9 kept');
chk('C60-9 …and pathology that shares a heading with anatomy',
    pharm.keptPath===6, pharm.keptPath+' of 6 kept');

// ---------- 3. Minimal is a strict subset, and nothing else moves ----------
chk('C60-10 Minimal is a strict subset of Comprehensive — it only ever removes',
    MIN.ids.every(id=>FULL.ids.indexOf(id)>=0)&&MIN.ids.length<FULL.ids.length,
    MIN.ids.length+' of '+FULL.ids.length);
chk('C60-11 …dropping 228 items and 33 of the 82 hours',
    FULL.items-MIN.items===228&&Math.round((FULL.min-MIN.min)/60)===33,
    'items '+FULL.items+'→'+MIN.items+', h '+Math.round(FULL.min/60)+'→'+Math.round(MIN.min/60));
chk('C60-12 …which is what takes this unit from 7 h/day to 4.5',
    FULL.pace===7&&MIN.pace===4.5, FULL.pace+' → '+MIN.pace);
chk('C60-13 …and everything still lands before the review buffer',
    MIN.tail!==null&&MIN.tail<MIN.cutoff&&MIN.scheduled===MIN.items,
    'tail '+MIN.tail+' cutoff '+MIN.cutoff+', scheduled '+MIN.scheduled+' of '+MIN.items);
chk('C60-14 Minimal drops the foundational UWorld articles but keeps the clinical ones',
    MIN.arts===99&&FULL.arts===108, FULL.arts+' → '+MIN.arts);

// ---------- 4. the switches are independent, and the presets set them ----------
const each=await p.evaluate(()=>{
  const out={};
  CONTENT_TYPES.forEach(t=>{
    window.__mk({off:{[t.k]:true}});
    out[t.k]={items:SCHED.stats.totalItems,h:Math.round(SCHED.stats.totalMin/60)};
  });
  window.__mk({});const full=SCHED.stats.totalItems;
  window.__mk({off:window.ALLOFF});const min=SCHED.stats.totalItems;
  return {out,full,min,sum:CONTENT_TYPES.reduce((a,t)=>a+(full-out[t.k].items),0)};
});
chk('C60-15 each type can be switched off on its own',
    CONTENT_TYPES_OK(each), JSON.stringify(each.out));
function CONTENT_TYPES_OK(e){return Object.keys(e.out).every(k=>e.out[k].items<e.full&&e.out[k].items>e.min);}
/* The four types partition the tagged set, so switching all four off must remove
   exactly as much as switching them off one at a time removes in total. If they
   overlapped, a video would be double-counted and this would not add up. */
chk('C60-16 …and the four types do not overlap',
    each.sum===each.full-each.min, 'sum of individual drops '+each.sum+' vs Minimal drop '+(each.full-each.min));
const preset=await p.evaluate(()=>{
  window.__mk({});
  const c=S.cfg;
  const a={full:contentIsComprehensive(c),min:contentIsMinimal(c),key:'contentOff' in c};
  setContentPreset(c,true);
  const b={full:contentIsComprehensive(c),min:contentIsMinimal(c)};
  setContentOff(c,'anat',false);                      // one back on → neither preset
  const mid={full:contentIsComprehensive(c),min:contentIsMinimal(c)};
  setContentPreset(c,false);
  const d={full:contentIsComprehensive(c),min:contentIsMinimal(c),key:Object.prototype.hasOwnProperty.call(c,'contentOff')};
  return {a,b,mid,d};
});
chk('C60-17 a plan starts Comprehensive, with no stored setting at all',
    preset.a.full&&!preset.a.min&&preset.a.key===false, JSON.stringify(preset.a));
chk('C60-18 the Minimal preset sets all four, and Comprehensive clears the key',
    preset.b.min&&!preset.b.full&&preset.d.full&&preset.d.key===false, JSON.stringify(preset));
chk('C60-19 turning one type back on is neither preset, and says so',
    !preset.mid.min&&!preset.mid.full, JSON.stringify(preset.mid));

// ---------- 5. Comprehensive is the old behaviour, exactly ----------
const back=await p.evaluate(()=>{
  window.__mk({});const a=SCHED.planItems.map(v=>v.id).join('\u0001');
  window.__mk({off:window.ALLOFF});
  window.__mk({});const b=SCHED.planItems.map(v=>v.id).join('\u0001');
  // a plan saved before this feature existed has no contentOff key at all
  const c=S.cfg;delete c.contentOff;reflow();
  const legacy=SCHED.planItems.map(v=>v.id).join('\u0001');
  return {same:a===b,legacy:legacy===a};
});
chk('C60-20 switching to Minimal and back restores the plan exactly',
    back.same, 'the item list differed after a round trip');
chk('C60-21 a plan with no content setting behaves as Comprehensive',
    back.legacy, 'legacy plans do not match Comprehensive');

// ---------- 6. it composes with everything else ----------
const combo=await p.evaluate(()=>{
  window.__mk({off:window.ALLOFF,free:true});
  const free={pace:SCHED.brodyPace,heavy:SCHED.weekLoad.filter(w=>w.heavy).length,
              feasible:SCHED.stats.feasible,items:SCHED.stats.totalItems};
  window.__mk({off:window.ALLOFF,arts:false});
  const noArts={items:SCHED.stats.totalItems,arts:SCHED.stats.totalArts};
  // opting a video out on top of Minimal
  window.__mk({off:window.ALLOFF});
  const c=S.cfg,before=SCHED.stats.totalItems;
  // guarded: a regression that empties a Minimal plan should fail here legibly
  // rather than throwing on an undefined item three lines down
  if(!SCHED.planItems.length)return {empty:true,free,noArts};
  c.skip={};c.skip[SCHED.planItems[3].id]=true;reflow();
  const skipped=SCHED.stats.totalItems;
  // and the opt-out picker must not offer what Minimal already removed
  const picker=planVideosFor(c).length,plan=SCHED.stats.totalItems;
  return {free,noArts,before,skipped,picker,plan};
});
chk('C60-22 Minimal + even pace compose, and together make this unit feasible',
    !combo.empty&&combo.free.pace<=4.5&&combo.free.heavy===0&&combo.free.feasible===true,
    'pace '+combo.free.pace+', flagged weeks '+combo.free.heavy+', feasible '+combo.free.feasible);
chk('C60-23 Minimal composes with the reading toggle',
    !combo.empty&&combo.noArts.arts===0&&combo.noArts.items===MIN.items-MIN.arts,
    'items '+combo.noArts.items+' arts '+combo.noArts.arts);
chk('C60-24 an individual video can still be opted out on top of Minimal',
    !combo.empty&&combo.skipped===combo.before-1, combo.before+' → '+combo.skipped);
chk('C60-25 the opt-out picker does not offer what Minimal already removed',
    !combo.empty&&combo.picker<=combo.plan+1, 'picker offers '+combo.picker+', plan holds '+combo.plan);

// ---------- 7. the audit still shows the whole mapping ----------
const audit=await p.evaluate(()=>{
  window.__mk({off:window.ALLOFF});
  const a=auditBlock(brodyBlockById('neuro-sensory'));
  return {total:a.total,unmapped:a.unmapped.length,orphans:a.orphans.length};
});
chk('C60-26 the content audit is unaffected — it audits the map, not your switches',
    audit.total===655&&audit.unmapped===0&&audit.orphans===0, JSON.stringify(audit));

// ---------- 8. persistence ----------
const sync=await p.evaluate(()=>{
  const out=[];
  [null,{hist:true},{anat:true,hist:true,embryo:true,physio:true}].forEach((off,i)=>{
    window.__mk(off?{off}:{});
    const a=JSON.stringify(persistObj());
    const b=JSON.stringify(mergeState(JSON.parse(a),JSON.parse(a)));
    out.push({i,same:a===b,has:/"contentOff"/.test(a)});
  });
  return out;
});
sync.forEach(s=>chk('C60-27 mergeState(x,x) is byte-identical — config '+s.i, s.same, 'differs after self-merge'));
chk('C60-28 the setting persists, and Comprehensive stores nothing',
    sync[0].has===false&&sync[1].has&&sync[2].has, JSON.stringify(sync.map(s=>s.has)));

// ---------- 9. the screen ----------
const ui=await p.evaluate(()=>{
  const out={};
  [['full',{}],['min',{off:window.ALLOFF}]].forEach(([k,o])=>{
    window.__mk(o);VIEW='adjust';ADJ_VIEW='edit';render();
    const lit=[...document.querySelectorAll('.tog.on[data-ctype]')].map(b=>b.dataset.ctype).sort();
    const pre=[...document.querySelectorAll('.tog.on[data-cpreset]')].map(b=>b.dataset.cpreset);
    out[k]={lit,pre,nums:[...document.querySelectorAll('[data-ctype] .tognum')].map(e=>+e.textContent),
            txt:document.body.innerText.replace(/\s+/g,' ')};
  });
  return out;
});
chk('C60-29 Comprehensive lights all four type switches and the Comprehensive preset',
    ui.full.lit.length===4&&ui.full.pre.join()==='full', JSON.stringify(ui.full.lit)+' / '+ui.full.pre);
chk('C60-30 Minimal lights none of them, and the Minimal preset',
    ui.min.lit.length===0&&ui.min.pre.join()==='min', JSON.stringify(ui.min.lit)+' / '+ui.min.pre);
/* The counts have to stay put when a type is switched off, or you could never see
   what turning it back on would cost. */
chk('C60-31 each switch carries its item count, and the counts survive being switched off',
    ui.full.nums.length===4&&ui.full.nums.every(n=>n>0)
      &&JSON.stringify(ui.full.nums)===JSON.stringify(ui.min.nums),
    JSON.stringify(ui.full.nums)+' vs '+JSON.stringify(ui.min.nums));
chk('C60-32 …and the screen says what Minimal never drops',
    /Patholog/i.test(ui.min.txt)&&/pharmacolog/i.test(ui.min.txt), ui.min.txt.slice(0,200));

const m=await mobilePage();
const mob=await m.evaluate(()=>{
  const blk=brodyBlockById('neuro-sensory');
  AUTHED=true;todayISO=()=>blk.weeks[0].start;S.settings={seenBrodyHelp:true,seenUpdate:LATEST_UPDATE};
  PRACTICE_KEYS.forEach(k=>{S[k]={total:null,blocks:{}};});
  S.cfgs.nbme={examType:'nbme',brody:blk.id,examLabel:blk.name,examISO:blk.shelf,
    startISO:blk.weeks[0].start,restDays:[0],
    resources:{bnb:true,pathoma:true,sketchy:true,bootcamp:true,uwlib:true},
    systems:blk.systems.slice(),brodyReviewDays:3,brodyJoinWk:1,brodyJoinDate:blk.weeks[0].start,
    contentOff:{anat:true,hist:true,embryo:true,physio:true}};
  normalizeCfg(S.cfgs.nbme,'nbme');activate('nbme');S.active='nbme';
  VIEW='adjust';ADJ_VIEW='edit';reflow();render();
  return {sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth};
});
chk('C60-33 the Plan editor does not overflow sideways on a phone',
    mob.sw<=mob.cw+1, 'scrollWidth '+mob.sw+' vs '+mob.cw);

/* Changelog items are escaped before rendering (updatesHTML), so an entry written
   with markup shows the raw tags to the reader. Two entries shipped that way before
   this check existed. */
const chlog=await p.evaluate(()=>{
  const bad=CHANGELOG.filter(e=>e.items.some(it=>/<\/?[a-z]/i.test(it))||/<\/?[a-z]/i.test(e.title));
  const mine=CHANGELOG.find(e=>e.id==='2026-09-24');
  return {bad:bad.map(e=>e.id),found:!!mine,title:mine&&mine.title,
          body:mine?mine.items.join(' '):'',rank:CHANGELOG.indexOf(mine)};
});
chk('C60-35 no changelog entry contains markup, which would render as literal tags',
    chlog.bad.length===0, 'entries with markup: '+JSON.stringify(chlog.bad));
chk('C60-36 content depth has a changelog entry naming both modes and where they live',
    chlog.found&&chlog.rank>=0&&chlog.rank<2
      &&/Minimal/.test(chlog.title)&&/Content depth/.test(chlog.body)
      &&/Comprehensive/.test(chlog.body), (chlog.title||'missing')+' @'+chlog.rank);
chk('C60-37 …and says what Minimal never drops',
    /[Pp]atholog/.test(chlog.body)&&/pharmacolog/.test(chlog.body), chlog.body.slice(0,180));

chk('C60-38 no page errors anywhere in this run', errors.length===0, errors.join(' | '));

await close();
process.exit(report());
