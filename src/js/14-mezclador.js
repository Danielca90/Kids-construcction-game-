// ---------- mezclador de colores ----------
const hexRGB=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
const rgbHex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
function rgb2ryb([r,g,b]){const w=Math.min(r,g,b);r-=w;g-=w;b-=w;const mg=Math.max(r,g,b);let y=Math.min(r,g);r-=y;g-=y;if(b&&g){b/=2;g/=2}y+=g;b+=g;
  const my=Math.max(r,y,b);if(my){const n=mg/my;r*=n;y*=n;b*=n}return[r+w,y+w,b+w]}
function ryb2rgb([r,y,b]){const w=Math.min(r,y,b);r-=w;y-=w;b-=w;const my=Math.max(r,y,b);let g=Math.min(y,b);y-=g;b-=g;if(b&&g){b*=2;g*=2}r+=y;g+=y;
  const mg=Math.max(r,g,b);if(mg){const n=my/mg;r*=n;g*=n;b*=n}return[r+w,g+w,b+w]}
let mixDrops=[];
function mixResult(){if(!mixDrops.length)return null;const acc=[0,0,0];mixDrops.forEach(c=>{rgb2ryb(hexRGB(COL[c][0].slice(0,7))).forEach((v,i)=>acc[i]+=v)});
  return rgbHex(ryb2rgb(acc.map(v=>v/mixDrops.length)))}
function drawMixer(){const h=mixResult();$('#mixPot').style.background=h||'#f1f6f9';
  $('#mixDrops').innerHTML=mixDrops.map(c=>`<i style="background:${COL[c][0]}"></i>`).join('');$('#mixOk').disabled=!h}
function openMixer(){mixDrops=[];const P=$('#mixPal');P.innerHTML='';
  ['r','y','a','b','g','o','w','x','m','n','p','k','L','C'].forEach(c=>{const b=document.createElement('button');b.className='sw';b.dataset.c=c;b.style.background=COL[c][0];P.appendChild(b)});
  drawMixer();$('#mixer').classList.add('show')}
$('#mixPal').addEventListener('click',ev=>{const b=ev.target.closest('.sw');if(!b)return;ac();if(mixDrops.length>=10)mixDrops.shift();mixDrops.push(b.dataset.c);
  tone(520+mixDrops.length*60,0,.12,'sine',.12);buzz(6);drawMixer()});
$('#mixEmpty').addEventListener('click',()=>{mixDrops=[];sPop();drawMixer()});
$('#mixClose').addEventListener('click',()=>$('#mixer').classList.remove('show'));
$('#mixPick').addEventListener('input',ev=>{mixDrops=[];$('#mixPot').style.background=ev.target.value;$('#mixOk').disabled=false;$('#mixPot').dataset.pick=ev.target.value});
function usedCols(){const u=new Set();[save.free,save.draft.pieces,...freeHistory().map(entry=>JSON.parse(entry))].concat(save.custom.map(c=>c.pieces||[])).forEach(a=>(a||[]).forEach(p=>u.add(p.c)));return u}
$('#mixOk').addEventListener('click',()=>{const h=mixResult()||$('#mixPot').dataset.pick;if(!h)return;
  const ex=save.mix.find(m=>m.h===h);let k;
  if(ex)k=ex.k;else{
    if(save.mix.length>=12){const u=usedCols(),i=save.mix.findIndex(m=>!u.has(m.k));if(i<0){toast('Ya hay 12 colores mezclados en uso');return}save.mix.splice(i,1)}
    let n=0;while(save.mix.some(m=>m.k==='c'+n))n++;k='c'+n;save.mix.push({k,h});applyMix()}
  delete $('#mixPot').dataset.pick;persist();ed.c=k;ed.rm=false;$('#mixer').classList.remove('show');sFan();say('My color!');renderEditor()});
