// =====================================================================
//  TRAZOS — como la hoja del libro: seguir la línea punteada con el dedo o el Apple Pencil.
//  Con el Pencil se mide la PRESIÓN (PointerEvent.pressure, 0..1): si el niño aprieta demasiado
//  la línea se pone roja y un amigo le pide "¡más suave!", para que aprenda a modular la fuerza.
//  Con el dedo no hay presión (el iPad no la mide): se puede trazar igual, sin el medidor.
// =====================================================================
// trazos en un espacio lógico de 100 x 70 (se escala al tamaño de la pantalla)
const TR_SHEETS=[
  {id:'arco',emo:'🌈',name:'Arcos',en:'Arches',path:t=>[20+60*t,58-46*Math.sin(Math.PI*t)]},
  {id:'puente',emo:'🌉',name:'Puentes',en:'Bridges',path:t=>[20+60*t,12+46*Math.sin(Math.PI*t)]},
  {id:'ola',emo:'🌊',name:'Olas',en:'Waves',path:t=>[10+80*t,35-12*Math.sin(4*Math.PI*t)]},
  {id:'montana',emo:'⛰️',name:'Montañas',en:'Mountains',path:t=>{const k=t*4,i=Math.floor(Math.min(k,3.999)),f=k-i;return[10+80*t,i%2?14+42*f:56-42*f]}},
  {id:'recta',emo:'📏',name:'Rectas',en:'Lines',path:t=>[14+72*t,35]},
  {id:'circulo',emo:'⭕',name:'Círculo',en:'Circle',path:t=>[50+26*Math.sin(2*Math.PI*t),35-26*Math.cos(2*Math.PI*t)]},
  {id:'espiral',emo:'🌀',name:'Espiral',en:'Spiral',path:t=>{const a=t*Math.PI*4.5,r=3+26*t;return[50+r*Math.cos(a),35+r*Math.sin(a)]}},
  {id:'colorear',emo:'🖍️',name:'Colorear',en:'Coloring',color:true}
];
const TR_REPS=3,TR_N=160;                       // repeticiones por hoja y puntos de muestra del trazo
const TR_COLS=['#e63b2e','#2f6fdb','#4cb54a','#fac80a','#ff8a1f','#8a4fc7','#7c4e2a'];
// niveles de fuerza máxima permitida (padres pueden cambiarlo con el botón 🔧)
const TR_LIMITS=[{n:'suave',max:.55},{n:'normal',max:.7},{n:'fuerte',max:.85}];
let tr={sheet:0,rep:0,ink:[],cur:null,hits:null,pen:false,col:0,strong:0,samples:0,strongMs:0,warnT:0,done:false};
function trSave(){save.trace=save.trace||{};return save.trace}
// variación de cada repetición (tamaño y lugar) para que no sean idénticas
function trXf(rep){const s=[1,.8,.9][rep%3],dx=[0,-6,6][rep%3],dy=[0,4,-3][rep%3];return p=>[50+(p[0]-50)*s+dx,35+(p[1]-35)*s+dy]}
function trGuide(){const S=TR_SHEETS[tr.sheet],xf=trXf(tr.rep),pts=[];
  if(S.id==='recta'){const kind=tr.rep%3;for(let i=0;i<=TR_N;i++){const t=i/TR_N;pts.push(kind===0?[14+72*t,35]:kind===1?[50,8+54*t]:[20+60*t,58-46*t])}return pts}
  for(let i=0;i<=TR_N;i++)pts.push(xf(S.path(i/TR_N)));return pts}
// escala del espacio lógico 100x70 al lienzo
function trMap(){const c=$('#trInk'),w=c.width,h=c.height,s=Math.min(w/100,h/70)*.94;return{s,ox:(w-100*s)/2,oy:(h-70*s)/2}}
function trSize(){const st=$('#trStage').getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);
  for(const id of ['trGuide','trInk']){const c=$('#'+id);c.width=Math.max(10,st.width*d);c.height=Math.max(10,st.height*d);c.style.width=st.width+'px';c.style.height=st.height+'px'}}
function trDrawGuide(){const c=$('#trGuide'),g=c.getContext('2d'),m=trMap(),S=TR_SHEETS[tr.sheet];g.clearRect(0,0,c.width,c.height);
  if(S.color){trDrawColoring(g,m);return}
  const P=trGuide().map(p=>[m.ox+p[0]*m.s,m.oy+p[1]*m.s]);
  g.lineCap='round';g.lineJoin='round';
  // camino ancho y suave (zona permitida), luego la línea punteada verde como en el libro
  g.strokeStyle='rgba(124,207,91,.18)';g.lineWidth=m.s*9;g.beginPath();P.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke();
  g.setLineDash([m.s*2.2,m.s*1.8]);g.strokeStyle='#5fbf6a';g.lineWidth=m.s*1.3;g.beginPath();P.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke();g.setLineDash([]);
  // punto de inicio con flecha y punto final
  const a=P[0],b=P[Math.min(8,P.length-1)],ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
  g.fillStyle='#2d9a3a';g.beginPath();g.arc(a[0],a[1],m.s*2.6,0,7);g.fill();
  g.save();g.translate(a[0],a[1]);g.rotate(ang);g.fillStyle='#fff';g.beginPath();g.moveTo(m.s*1.6,0);g.lineTo(-m.s*1,-m.s*1.3);g.lineTo(-m.s*1,m.s*1.3);g.fill();g.restore();
  const z=P[P.length-1];g.fillStyle='#ffd84d';g.strokeStyle='#c99a00';g.lineWidth=m.s*.5;g.beginPath();g.arc(z[0],z[1],m.s*2.2,0,7);g.fill();g.stroke();
  // dibujos de la hoja del libro: el pasamanos y la pelota pequeños en la esquina (solo en arcos)
  if(S.id==='arco'){g.globalAlpha=.25;trPasamanos(g,m,78,8,.22);g.globalAlpha=1}
}
function trPasamanos(g,m,x0,y0,k){const X=v=>m.ox+(x0+v*k)*m.s,Y=v=>m.oy+(y0+v*k)*m.s;g.lineCap='round';
  for(const [r,col] of [[44,'#4cb54a'],[34,'#4cb54a']]){g.strokeStyle=col;g.lineWidth=m.s*k*7;g.beginPath();for(let i=0;i<=40;i++){const a=Math.PI*i/40;const x=X(50-r*Math.cos(a)),y=Y(60-r*Math.sin(a)*1.05);i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
  g.strokeStyle='#a5dca0';g.lineWidth=m.s*k*4;for(let i=1;i<8;i++){const a=Math.PI*i/8;g.beginPath();g.moveTo(X(50-34*Math.cos(a)),Y(60-34*Math.sin(a)*1.05));g.lineTo(X(50-44*Math.cos(a)),Y(60-44*Math.sin(a)*1.05));g.stroke()}}
// hoja para colorear: el pasamanos del libro en línea negra, para pintar con crayón
function trDrawColoring(g,m){g.lineCap='round';g.lineJoin='round';g.strokeStyle='#333';g.lineWidth=m.s*.7;
  const X=v=>m.ox+v*m.s,Y=v=>m.oy+v*m.s;
  g.beginPath();g.moveTo(X(4),Y(58));g.lineTo(X(96),Y(58));g.stroke();                                   // piso
  for(const r of [40,32,24]){g.beginPath();for(let i=0;i<=60;i++){const a=Math.PI*i/60,x=X(50-r*Math.cos(a)),y=Y(58-r*Math.sin(a));i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
  for(let i=1;i<10;i++){const a=Math.PI*i/10;g.beginPath();g.moveTo(X(50-24*Math.cos(a)),Y(58-24*Math.sin(a)));g.lineTo(X(50-32*Math.cos(a)),Y(58-32*Math.sin(a)));g.stroke()}
  g.beginPath();g.arc(X(50),Y(51),m.s*6,0,7);g.stroke();                                                  // pelota
  for(const dx of [-2.5,0,2.5]){g.beginPath();g.arc(X(50+dx),Y(49.5),m.s*.9,0,7);g.stroke()}
  g.beginPath();g.arc(X(50),Y(55.5),m.s*2.5,Math.PI*1.15,Math.PI*1.85);g.stroke();
  g.beginPath();g.arc(X(12),Y(12),m.s*5,0,7);g.stroke();                                                  // sol
  for(let i=0;i<8;i++){const a=i*Math.PI/4;g.beginPath();g.moveTo(X(12+7*Math.cos(a)),Y(12+7*Math.sin(a)));g.lineTo(X(12+10*Math.cos(a)),Y(12+10*Math.sin(a)));g.stroke()}
  for(const x of [10,22,74,86]){g.beginPath();g.moveTo(X(x),Y(58));g.lineTo(X(x+1.5),Y(54));g.lineTo(X(x+3),Y(58));g.lineTo(X(x+4.5),Y(54.5));g.lineTo(X(x+6),Y(58));g.stroke()}  // pasto
}
function trRedrawInk(){const c=$('#trInk'),g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);for(const s of tr.ink)trStroke(g,s,0)}
// pinta un trazo (crayón): grosor según la presión y rojo cuando se aprieta demasiado
function trStroke(g,s,from){const m=trMap();g.lineCap='round';g.lineJoin='round';
  for(let i=Math.max(1,from);i<s.p.length;i++){const a=s.p[i-1],b=s.p[i],pr=b[2];
    g.strokeStyle=b[3]?'#ff2d55':s.c;g.globalAlpha=.88;g.lineWidth=m.s*(s.pen?(.8+pr*2.6):1.9);
    g.beginPath();g.moveTo(m.ox+a[0]*m.s,m.oy+a[1]*m.s);g.lineTo(m.ox+b[0]*m.s,m.oy+b[1]*m.s);g.stroke()}g.globalAlpha=1}
function trLimit(){return TR_LIMITS[save.traceLimit==null?1:save.traceLimit].max}
function trToLogic(e){const r=$('#trInk').getBoundingClientRect(),d=$('#trInk').width/r.width,m=trMap();return[((e.clientX-r.left)*d-m.ox)/m.s,((e.clientY-r.top)*d-m.oy)/m.s]}
function trCover(){if(TR_SHEETS[tr.sheet].color)return 0;const G=trGuide(),tol=6.5;let n=0;
  if(!tr.hits||tr.hits.length!==G.length)tr.hits=new Array(G.length).fill(false);
  for(const s of tr.ink)for(const p of s.p)for(let i=0;i<G.length;i++){if(tr.hits[i])continue;const dx=G[i][0]-p[0],dy=G[i][1]-p[1];if(dx*dx+dy*dy<tol*tol)tr.hits[i]=true}
  for(const h of tr.hits)if(h)n++;return n/G.length}
function trMeter(pr,strong){const M=$('#trMeter');if(!tr.pen){M.classList.add('hidden');return}M.classList.remove('hidden');
  const lim=trLimit();$('#trNeedle').style.left=Math.min(100,pr*100)+'%';$('#trZone').style.left=lim*100+'%';
  M.classList.toggle('strong',strong);$('#trBuddy').textContent=strong?'😣':pr>.05?'😊':'🙂'}
function trWarn(){const now=performance.now();if(now-tr.warnT<2200)return;tr.warnT=now;
  const w=$('#trWarn');w.classList.remove('show');void w.offsetWidth;w.classList.add('show');say('Gently! Soft hands.');tone(330,0,.18,'sine',.12)}
function renderTrace(){
  const S=TR_SHEETS[tr.sheet],ts=trSave();
  $('#trTitle').textContent=S.emo+' '+S.name;
  $('#trSheets').innerHTML=TR_SHEETS.map((s,i)=>`<button class="trsh${i===tr.sheet?' on':''}" data-i="${i}">${s.emo}<span>${s.name}</span>${ts[s.id]?`<b>${'⭐'.repeat(Math.min(3,ts[s.id]))}</b>`:''}</button>`).join('');
  $('#trDots').innerHTML=S.color?'':Array.from({length:TR_REPS},(_,i)=>`<i class="${i<tr.rep?'ok':i===tr.rep?'now':''}"></i>`).join('');
  $('#trCols').classList.toggle('hidden',!S.color);
  $('#trCols').innerHTML=TR_COLS.map((c,i)=>`<button class="trc${i===tr.col?' on':''}" data-c="${i}" style="background:${c}"></button>`).join('');
  $('#trLim').textContent='🔧 '+TR_LIMITS[save.traceLimit==null?1:save.traceLimit].n;
  trSize();trDrawGuide();trRedrawInk();trMeter(0,false);
}
function trOpen(i){tr.sheet=i;tr.rep=0;tr.ink=[];tr.hits=null;tr.strongMs=0;tr.samples=0;tr.strong=0;tr.done=false;renderTrace();
  const S=TR_SHEETS[i];say(S.en);word(S.en,'#fff',$('#trStage'))}
function trNextRep(){const S=TR_SHEETS[tr.sheet];
  sFan();confetti();say(PRAISE[Math.random()*PRAISE.length|0]);
  if(tr.rep+1>=TR_REPS){   // hoja terminada: estrellas según la fuerza (si hubo Pencil) y monedas
    const soft=tr.samples?1-tr.strong/tr.samples:1,stars=!tr.pen?3:soft>.9?3:soft>.7?2:1,ts=trSave();
    ts[S.id]=Math.max(ts[S.id]||0,stars);save.coins=(save.coins||0)+2;persist();
    setTimeout(()=>{toast(`${'⭐'.repeat(stars)}  +2 🪙`+(tr.pen?`  · Fuerza suave ${Math.round(soft*100)}%`:''));tr.rep=0;tr.ink=[];tr.hits=null;tr.samples=0;tr.strong=0;renderTrace()},900);
    return}
  setTimeout(()=>{tr.rep++;tr.ink=[];tr.hits=null;renderTrace()},900)}
// ---------- dibujar con el dedo o el Pencil ----------
$('#trInk').addEventListener('pointerdown',e=>{ac();
  if(e.pointerType==='pen')tr.pen=true;
  if(tr.pen&&e.pointerType==='touch')return;          // con Pencil, la palma no pinta
  const S=TR_SHEETS[tr.sheet];if(tr.done)return;
  tr.cur={c:S.color?TR_COLS[tr.col]:'#e63b2e',pen:e.pointerType==='pen',p:[],id:e.pointerId,strongT:0};tr.ink.push(tr.cur);
  try{$('#trInk').setPointerCapture(e.pointerId)}catch(_){}
  trAdd(e);e.preventDefault()});
function trAdd(e){const s=tr.cur;if(!s)return;const evs=e.getCoalescedEvents?e.getCoalescedEvents():[e],g=$('#trInk').getContext('2d');
  for(const ev of (evs.length?evs:[e])){const [x,y]=trToLogic(ev),pr=s.pen?(ev.pressure||0):0,lim=trLimit(),strong=s.pen&&pr>lim;
    s.p.push([x,y,pr,strong]);if(s.pen){tr.samples++;if(strong)tr.strong++}
    if(strong){if(!s.strongT)s.strongT=performance.now();else if(performance.now()-s.strongT>350)trWarn()}else s.strongT=0;
    trMeter(pr,strong)}
  trStroke(g,s,s.p.length-evs.length)}
$('#trInk').addEventListener('pointermove',e=>{if(!tr.cur||e.pointerId!==tr.cur.id)return;trAdd(e)});
function trEnd(e){if(!tr.cur||(e&&e.pointerId!==tr.cur.id))return;tr.cur=null;trMeter(0,false);
  const S=TR_SHEETS[tr.sheet];if(S.color){persist();return}
  const cv=trCover();if(cv>=.82&&!tr.done){tr.done=true;sSnap();setTimeout(()=>{tr.done=false;trNextRep()},250)}
  else if(cv>.2)tone(520+cv*300,0,.08,'sine',.1)}
$('#trInk').addEventListener('pointerup',trEnd);$('#trInk').addEventListener('pointercancel',trEnd);
// ---------- botones ----------
$('#goTrace').addEventListener('click',()=>{ac();sTap();show('trace');setTimeout(()=>trOpen(tr.sheet),60)});
$('#trBack').addEventListener('pointerdown',()=>{ac();show('home')});
$('#trSheets').addEventListener('click',e=>{const b=e.target.closest('.trsh');if(!b)return;ac();sTap();trOpen(+b.dataset.i)});
$('#trCols').addEventListener('click',e=>{const b=e.target.closest('.trc');if(!b)return;ac();sTap();tr.col=+b.dataset.c;renderTrace()});
$('#trClear').addEventListener('click',()=>{ac();sPop();tr.ink=[];tr.hits=null;trRedrawInk()});
$('#trUndo').addEventListener('click',()=>{ac();sTap();tr.ink.pop();tr.hits=null;trRedrawInk()});
$('#trLim').addEventListener('click',()=>{ac();sTap();save.traceLimit=((save.traceLimit==null?1:save.traceLimit)+1)%TR_LIMITS.length;persist();renderTrace();
  toast('Fuerza máxima: '+TR_LIMITS[save.traceLimit].n)});
