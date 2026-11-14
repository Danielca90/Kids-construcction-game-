// ================== JUEGO: estado y sobres ==================
const board=$('#board'),plate=$('#plate'),stage=$('#stage'),tray=$('#tray'),model=$('#model'),wrap=$('#boardWrap');
const nBags=()=>fig().bags.length;
const hasBags=()=>nBags()>1;
function bagIdx(i){const B=fig().bags;let b=0;while(b+1<B.length&&B[b+1]<=i)b++;return b}
function bagEnd(b){const F=fig();return b+1<F.bags.length?F.bags[b+1]:F.steps.length}
const curBag=()=>bagIdx(Math.min(st.placed,fig().steps.length-1));
function newState(){
  const F=fig(),extra=[];
  if(F.lvl>=4){const need=new Set(F.steps.map(key)),ks=['b1','b2','b3','p2','sI','qI','rd'],cs=Object.keys(COL).filter(c=>c!=='x');
    let guard=0;while(extra.length<(hasBags()?2:3)&&guard++<300){const p=P(ks[Math.random()*ks.length|0],cs[Math.random()*cs.length|0],0,0);
      if(!need.has(key(p))&&!extra.some(e=>key(e)===key(p)))extra.push(p)}}
  st={v:5,sig:sigOf(F),fig:F.id,placed:0,extra,opened:-1,order:[],score:0,streak:0};
  if(!hasBags())openBag(0,true);
  return st;
}
// bolsitas: la bandeja trae como mucho 4 tipos de ficha (+1 de más) para que se vean grandes;
// cuando se acaban, llega la siguiente bolsita
const MINI_KEYS=4;
function newMini(){
  const F=fig(),end0=bagEnd(curBag()),ks=[];let e=st.placed;
  while(e<end0){const k=key(F.steps[e]);if(!ks.includes(k)){if(ks.length>=MINI_KEYS)break;ks.push(k)}e++}
  st.miniEnd=e;
  const ex=st.extra.length?[key(st.extra[Math.random()*st.extra.length|0])]:[];
  st.order=shuffle([...ks,...ex]);
}
function openBag(b,silent){
  st.opened=b;newMini();
  if(!silent){keep();render()}
}
const sampleOf=(k,F,S)=>(F||fig()).steps.find(s=>key(s)===k)||((S||st).extra||[]).find(s=>key(s)===k);
const isExtra=k=>st.extra.some(s=>key(s)===k);
function remaining(k){if(isExtra(k))return 2;const F=fig(),end=st.miniEnd;let n=0;for(let i=st.placed;i<end;i++)if(key(F.steps[i])===k)n++;return n}
function keep(){save.prog[st.fig]=st;persist()}
function checkBag(){
  if(!hasBags()||st.placed>=fig().steps.length)return;
  const b=curBag();if(st.opened>=b)return;
  busy=true;say('Open the bag!');$('#bagN').textContent=`Sobre ${b+1}`;$('#bagS').textContent=`de ${nBags()} · ${bagEnd(b)-fig().bags[b]} fichas`;
  $('#bag').classList.remove('open');$('#bag').classList.add('show');
}
$('#bagBtn').addEventListener('pointerdown',()=>{
  ac();if($('#bag').classList.contains('open'))return;sRip();buzz(25);$('#bag').classList.add('open');
  setTimeout(()=>{$('#bag').classList.remove('show','open');busy=false;openBag(curBag())},450);
});
const bbox=ss=>({x0:Math.min(...ss.map(s=>s.x)),x1:Math.max(...ss.map(s=>s.x+s.w)),y0:Math.min(...ss.map(s=>s.y)),y1:Math.max(...ss.map(s=>s.y+s.h))});

// ================== JUEGO: dibujo ==================
function render(){
  const F=fig(),N=F.steps.length,done=st.placed>=N,cb=curBag(),bs=F.bags[cb],be=bagEnd(cb);
  $('#figName').textContent=F.emo+' '+F.name;
  $('#bagPill').classList.toggle('hidden',!hasBags());
  if(hasBags())$('#bagPill').textContent=`📦 ${Math.min(cb+1,nBags())}/${nBags()}`;
  $('#stars').textContent=done?'⭐ '+(save.stars[F.id]||0):'🧱 '+(N-st.placed);
  updScore(false);
  // ---- cámara: el tablero se dibuja entero y la cámara hace zoom/paneo suave hacia donde se está armando ----
  const r=stage.getBoundingClientRect(),RS=F.rows*PL;
  C=Math.max(6,Math.min(r.width*.9/F.cols,r.height*.8/(RS+.6),110));             // escala que muestra todo
  board.style.width=F.cols*C+'px';board.style.height=RS*C+'px';
  plate.style.width=(F.cols+.8)*C+'px';plate.style.height=Math.max(6,Math.min(C*.5,40))+'px';
  const plateH=parseFloat(plate.style.height);
  wrap.style.width=(F.cols+.8)*C+'px';
  const L0=(r.width-(F.cols+.8)*C)/2,T0=(r.height-RS*C-plateH)/2+r.height*.04;
  wrap.style.left=L0+'px';wrap.style.top=T0+'px';
  let z=1,tx=0,ty=0;
  const waitingBag=hasBags()&&st.opened<cb;
  if(!done&&!waitingBag&&C<34){
    if(st.miniEnd===undefined||st.placed>=st.miniEnd)newMini();
    const b=bbox(F.steps.slice(st.placed,Math.max(st.placed+1,st.miniEnd)));
    const vw=Math.max(b.x1-b.x0+5,12),vh=Math.max((b.y1-b.y0)*PL+4,8);
    z=Math.max(1,Math.min(r.width*.9/(vw*C),r.height*.8/(vh*C),4));
    const cx=(.4+(b.x0+b.x1)/2)*C,cy=(RS-(b.y0+b.y1)/2*PL)*C;                    // centro de la zona, en px del tablero
    tx=r.width/2-L0-cx*z;ty=r.height/2-T0-cy*z;
    // no mostrar mucho vacío fuera del modelo
    const W=(F.cols+.8)*C*z,H=(RS*C+plateH)*z;
    if(W>r.width)tx=Math.min(-L0+20,Math.max(r.width-L0-W-20,tx));else tx=(r.width-W)/2-L0;
    if(H>r.height)ty=Math.min(-T0+20,Math.max(r.height-T0-H-20,ty));
  }
  cam={L0,T0,tx,ty,z};
  wrap.style.transform=`translate(${tx}px,${ty}px) scale(${z})`;
  board.className='board';board.innerHTML='';
  const car=document.createElement('div');car.className='layer car';board.appendChild(car);
  const fr=document.createDocumentFragment();
  F.steps.forEach((s,i)=>{
    const el=at(pieceEl(s,C),s,C,F.rows);el.dataset.step=i;
    if(i>=st.placed){el.classList.add('ghost');if(i>=be)el.classList.add('far');
      if(i===st.placed&&st.opened>=cb)el.classList.add(helped()?'now':'shade')}
    fr.appendChild(el)});
  car.appendChild(fr);
  const mb=$('#modelBox').getBoundingClientRect(),mc=Math.min(mb.width*.84/F.cols,mb.height*.8/RS);
  drawFigure(model,F,mc);
  if(cam.z>1){const b=bbox(F.steps.slice(st.placed,Math.max(st.placed+1,st.miniEnd))),bx=document.createElement('div');bx.className='bagbox';
    Object.assign(bx.style,{left:b.x0*mc-3+'px',top:(F.rows-b.y1)*mc*PL-3+'px',width:(b.x1-b.x0)*mc+6+'px',height:(b.y1-b.y0)*mc*PL+6+'px'});model.appendChild(bx)}
  tray.innerHTML='';
  if(st.opened<cb||done)return;
  if(st.miniEnd===undefined||st.placed>=st.miniEnd)newMini();
  let nextK=key(F.steps[st.placed]);
  if(!st.order.includes(nextK)||st.order.some(k=>!sampleOf(k))){newMini();keep()}
  tray.style.gridTemplateRows='';tray.style.gridTemplateColumns='1fr';
  const tiles=st.order.map(k=>{const t=document.createElement('div');t.className='tile';t.dataset.k=k;tray.appendChild(t);return t});
  const t0=tiles[0];let uc=90;
  st.order.forEach(k=>{const q=sampleOf(k);uc=Math.min(uc,t0.clientWidth*.8/q.w,t0.clientHeight*.62/(q.h*PL+.25))});
  tiles.forEach(t=>{
    const k=t.dataset.k,s=sampleOf(k),n=remaining(k);
    if(!n){t.classList.add('used');return}
    if(k===nextK&&helped())t.classList.add('next');
    const pw=document.createElement('div');pw.className='pw';pw.style.width=s.w*uc+'px';pw.style.height=s.h*uc*PL+'px';
    const p=pieceEl(s,uc);p.style.left='0';p.style.top='0';pw.appendChild(p);t.appendChild(pw);
    if(n>1&&!isExtra(k))t.insertAdjacentHTML('beforeend',`<span class="cnt">×${n}</span>`);
  });
}
let wrong=0;
tray.addEventListener('pointerdown',ev=>{
  ac();const t=ev.target.closest('.tile');if(!t||busy||t.classList.contains('used'))return;
  const F=fig();if(st.placed>=F.steps.length)return;
  t.classList.add('press');setTimeout(()=>t.classList.remove('press'),120);
  const target=F.steps[st.placed];
  if(t.dataset.k!==key(target)){
    // equivocarse bloquea la bandeja un rato (cada vez más) y la ficha que sigue brinca para que la mire
    t.classList.remove('nope');void t.offsetWidth;t.classList.add('nope');sPop();say('Oops! Try again.');word('Oops!','#ff8a1f');
    combo=0;buzz([30,60,30]);scoreMiss(t);keep();wrong=Math.min(wrong+1,3);const ms=[0,1500,3000,5000][wrong];
    busy=true;tray.classList.add('wait');
    const g=board.querySelector(`[data-step="${st.placed}"]`);if(g){g.classList.remove('look');void g.offsetWidth;g.classList.add('look')}
    setTimeout(()=>{tray.classList.remove('wait');busy=false;if(g)g.classList.remove('look')},ms);
    return}
  wrong=0;buzz(12);
  fly(t,target);
});
function fly(t,target){
  busy=true;const F=fig();
  const src=t.querySelector('.pc').getBoundingClientRect(),sr=stage.getBoundingClientRect(),Z=cam.z;
  const bl=sr.left+cam.L0+cam.tx,bt=sr.top+cam.T0+cam.ty;
  const tl=bl+target.x*C*Z,tt=bt+(F.rows-target.y-target.h)*C*PL*Z;
  const clone=pieceEl(target,C*Z);clone.classList.add('fly');
  clone.style.left=tl+'px';clone.style.top=tt+'px';document.body.appendChild(clone);
  t.querySelector('.pw').style.visibility='hidden';sWhoosh();
  const s0=src.width/(target.w*C*Z),dx=src.left-tl,dy=src.top-tt,lift=Math.min(140,Math.abs(dx)*.35+60);
  const mx=dx*.45,my=Math.min(dy,0)*.5-lift;
  let done=false;
  const finish=()=>{if(done)return;done=true;clone.remove();
    const placedAt=st.placed,wasBag=curBag();st.placed++;keep();sSnap();combo++;
    {const nm=EN_COL[target.c]+' '+enShape(target.k);word(cap(nm),COL[target.c][0]);say(cap(nm)+'!');
     if(st.placed<F.steps.length&&st.placed%5===0)setTimeout(()=>say(PRAISE[Math.random()*PRAISE.length|0],true),150)}
    const N=F.steps.length,bagDone=hasBags()&&st.placed<N&&bagIdx(st.placed)!==wasBag;
    const fresh=!bagDone&&st.placed<N&&st.placed>=st.miniEnd;
    if(fresh){newMini();keep();sBag();say('New bag!',true)}
    render();
    if(fresh){tray.classList.remove('fresh');void tray.offsetWidth;tray.classList.add('fresh')}
    const el=board.querySelector(`[data-step="${placedAt}"]`);
    if(el){el.classList.add('pop');const r=el.getBoundingClientRect();sparks(r.left+r.width/2,r.bottom,COL[target.c][0],8+Math.min(combo,8))}
    scoreHit(el);keep();
    shakeBoard();
    busy=false;
    if(st.placed===N)celebrate();
    else if(bagDone){busy=true;sBag();bagT=setTimeout(()=>{busy=false;if(screen==='game'){render();checkBag()}},700)}
  };
  const an=clone.animate([
    {transform:`translate(${dx}px,${dy}px) scale(${s0}) rotate(0deg)`,offset:0},
    {transform:`translate(${mx}px,${my}px) scale(${Math.max(s0,1)*1.12}) rotate(-8deg)`,offset:.45},
    {transform:'translate(0,-14px) scale(1.05) rotate(2deg)',offset:.82},
    {transform:'translate(0,0) scale(1) rotate(0deg)',offset:1}],
    {duration:620,easing:'cubic-bezier(.35,.1,.3,1)',fill:'forwards'});
  an.onfinish=finish;setTimeout(finish,800);
}
function nextIdx(){const f=fig();const g=FIGS.map((F,i)=>[F,i]).filter(([F])=>f.set?F.set===f.set:(F.custom===f.custom&&!F.set&&(F.custom||F.lvl>=f.lvl)));
  const pos=g.findIndex(([,i])=>i===figIdx);if(pos<0)return -1;
  for(let j=pos+1;j<g.length;j++)if(unlocked(g[j][1]))return g[j][1];   // nunca salta a un nivel sin pagar
  return -1}
// después de ganar: si lo que sigue está en un nivel cerrado, muestra cuánto cuesta y deja abrirlo con monedas
function updWinNext(){const f=fig(),ni=nextIdx();$('#next').classList.toggle('hidden',ni<0);const L=$('#lockInfo');
  const n=(!f.custom&&!f.set)?f.lvl+1:0;
  if(ni>=0||!n||n>=LEVELS.length||lvlUnlocked(n)){L.classList.add('hidden');return}
  const c=save.coins||0,cost=LEVEL_COST[n];
  L.innerHTML=`<span>🔒 Nivel ${n} cuesta 🪙 ${cost}</span><span>Tienes 🪙 ${c}</span>`+(canBuy(n)?`<button id="winBuy">🔓 Abrir nivel ${n}</button>`:`<span style="font-size:15px">Te faltan 🪙 ${cost-c} — ¡arma más modelos!</span>`);
  L.classList.remove('hidden');
  const b=$('#winBuy');if(b)b.addEventListener('click',()=>{buyLvl=n;$('#buyT').textContent=`Abrir nivel ${n}`;$('#buyP').textContent=`🪙 ${cost}`;$('#buy').classList.add('show');sTap()})}
function celebrate(){
  busy=true;const F=fig();
  const first=!(save.stars[F.id]>0),N0=F.steps.length,base=first?Math.max(3,N0):Math.max(1,Math.ceil(N0/3));
  const sc=st.score||0,bonus=Math.floor(sc/50),earned=base+bonus;save.best=save.best||{};
  const record=sc>(save.best[F.id]||0);if(record)save.best[F.id]=sc;
  save.coins=(save.coins||0)+earned;
  $('#scoreLine').textContent=`🎯 ${sc} puntos`+(record?' · 🏆 ¡Récord!':` · Récord ${save.best[F.id]}`);
  save.stars[F.id]=(save.stars[F.id]||0)+1;delete save.prog[F.id];persist();
  $('#earn').textContent=`+${earned} 🪙`+(bonus?` (incluye +${bonus} por puntos)`:'');
  render();combo=0;
  {const sh=document.createElement('div');sh.className='shine';board.appendChild(sh);setTimeout(()=>sh.remove(),1000);
   const r=board.getBoundingClientRect();for(let i=0;i<5;i++)setTimeout(()=>sparks(r.left+Math.random()*r.width,r.top+Math.random()*r.height,'#ffd84d',8),i*90)}
  setTimeout(()=>{sFan();confetti();say('Good job! You did it!');word('GOOD JOB!','#ffd84d');
    if(F.anim==='launch'){const f=document.createElement('div');f.className='fx';const w=Math.min(F.cols*.35,3)*C;
      Object.assign(f.style,{width:w+'px',height:w*1.2+'px',left:(F.cols*C-w)/2+'px',top:F.rows*PL*C-.25*C+'px'});board.querySelector('.car').appendChild(f)}
    board.classList.add('go-'+F.anim)},400);
  updWinNext();
  winT=setTimeout(()=>{if(screen!=='game'||fig()!==F)return;$('#stars').textContent='⭐ '+save.stars[F.id];$('#win').classList.add('show');sCoin()},3400);
}
function confetti(){
  const cols=['#e63b2e','#ffc92a','#7fd3f7','#ff8a1f','#4cb54a','#b06cf0'];
  for(let i=0;i<50;i++){const d=document.createElement('div');d.className='conf';
    d.style.left=Math.random()*100+'vw';d.style.background=cols[i%cols.length];
    d.style.animationDuration=(1.8+Math.random()*1.6)+'s';d.style.animationDelay=Math.random()*.6+'s';
    document.body.appendChild(d);setTimeout(()=>d.remove(),4200)}
}
$('#again').addEventListener('pointerdown',()=>{ac();$('#win').classList.remove('show');newState();keep();busy=false;render();checkBag()});
$('#next').addEventListener('pointerdown',()=>{ac();$('#win').classList.remove('show');const n=nextIdx();if(n>=0)openFig(n)});

