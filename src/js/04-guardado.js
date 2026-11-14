// ================== GUARDADO EN EL DISPOSITIVO ==================
const KEY='fichitas_v1';
let save={stars:{},prog:{},muted:false,unlockAll:false,custom:[],free:[],draft:{id:null,pieces:[]}};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s)save=Object.assign(save,s)}catch(e){}
save.mix=save.mix||[];applyMix();save.prog=save.prog||{};save.custom=save.custom||[];save.free=save.free||[];save.draft=save.draft||{id:null,pieces:[]};
function persist(){try{localStorage.setItem(KEY,JSON.stringify(save))}catch(e){}}

// modelos creados por papá
const escH=t=>String(t==null?'':t).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function customFigure(c){
  const pcs=c.pieces.slice().sort((a,b)=>a.y-b.y||a.x-b.x);
  const minX=Math.min(...pcs.map(p=>p.x));
  const F={id:c.id,name:c.name,emo:c.emo,custom:true,anim:'jump',steps:pcs.map(p=>P(p.k,p.c,p.x-minX,p.y))};
  F.lvl=lvlFor(F.steps.length);finishFigure(F);return F;
}
let FIGS=[];
function rebuildFigs(){FIGS=FIGURES.concat(save.custom.filter(c=>c.pieces.length).map(customFigure))}
rebuildFigs();

const $=s=>document.querySelector(s);
let figIdx=0,st=null,C=40,busy=false,screen='home',curLvl=1,cam={L0:0,T0:0,tx:0,ty:0,z:1};
const fig=()=>FIGS[figIdx];
const HELP_STEPS=2;                                // ayuda solo en las 2 primeras fichas
const helped=()=>!!st&&st.placed<HELP_STEPS;
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}

