// ================== INICIO ==================
const DIFF=[null,
  {emo:'🐣',bg:'#4cbf4a',sh:'#2d8a2c'},{emo:'🙂',bg:'#33b6e8',sh:'#1f86b0'},
  {emo:'😃',bg:'#2f6fdb',sh:'#1d4a9e'},{emo:'💪',bg:'#a46ae8',sh:'#6f3cb5'},
  {emo:'📦',bg:'#ff8a1f',sh:'#c95d00'},{emo:'🚀',bg:'#e63b2e',sh:'#a82015'},
  {emo:'🏆',bg:'#24506b',sh:'#122c3d'}];
function totalStars(){return Object.values(save.stars).reduce((a,b)=>a+b,0)}
// ---- monedas: se ganan al terminar modelos y se gastan para abrir niveles (en orden) ----
const LEVEL_COST=[0,0,15,40,90,160,300,500];
if(!Array.isArray(save.lvlOwned)){   // respeta lo que ya estaba abierto con la regla anterior
  save.lvlOwned=[1];for(let n=2;n<8;n++)if(FIGURES.some(G=>!G.set&&G.lvl===n-1&&save.stars[G.id]>0)||FIGURES.some(G=>!G.set&&G.lvl===n&&save.stars[G.id]>0))save.lvlOwned.push(n);
  save.coins=save.coins||0;persist()}
const lvlUnlocked=n=>save.unlockAll||save.lvlOwned.includes(n);
const canBuy=n=>!lvlUnlocked(n)&&lvlUnlocked(n-1)&&(save.coins||0)>=LEVEL_COST[n];
function toast(t){document.querySelectorAll('.toast').forEach(x=>x.remove());const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2700)}
const sCoin=()=>{tone(988,0,.08,'square',.06);tone(1319,.07,.25,'triangle',.18)};
const unlocked=i=>{const F=FIGS[i];return F.custom||F.set||lvlUnlocked(F.lvl)||save.stars[F.id]>0};
const progOf=F=>{const pr=save.prog[F.id];return pr&&pr.v===5&&pr.placed>0&&pr.placed<F.steps.length?pr:null};
function renderHome(){
  $('#total').textContent='⭐ '+totalStars();$('#coins').textContent='🪙 '+(save.coins||0);
  const last=save.last?FIGS.findIndex(F=>F.id===save.last):-1,cont=$('#cont');
  if(last>=0&&progOf(FIGS[last])){const F=FIGS[last];
    cont.innerHTML=`▶ Seguir ${escH(F.emo)} ${escH(F.name)} <span style="opacity:.7">${Math.round(progOf(F).placed/F.steps.length*100)}%</span>`;
    cont.dataset.i=last;cont.classList.remove('hidden')}else cont.classList.add('hidden');
  const nc=FIGS.filter(F=>F.custom).length;
  $('#goPapa').classList.toggle('hidden',!nc);$('#goPapa').textContent=`👨 De papá (${nc})`;
  const D=$('#diffs');D.innerHTML='';
  for(let n=1;n<LEVELS.length;n++){
    const d=DIFF[n],figs=FIGURES.filter(F=>F.lvl===n&&!F.set),done=figs.filter(F=>save.stars[F.id]>0).length;
    const b=document.createElement('button');b.className='diff'+(lvlUnlocked(n)?'':' locked')+(canBuy(n)?' can':'');b.dataset.n=n;
    b.style.background=d.bg;b.style.boxShadow=`0 6px 0 ${d.sh}`;
    b.innerHTML=`<span class="emo">${d.emo}</span><span class="num">${n}</span><span class="rng">${LEVELS[n].range} fichas</span>${lvlUnlocked(n)?`<span class="ds">⭐ ${done}/${figs.length}</span>`:`<span class="price">🪙 ${LEVEL_COST[n]}</span>`}`;
    D.appendChild(b);
  }
}
$('#diffs').addEventListener('click',ev=>{
  ac();const b=ev.target.closest('.diff');if(!b)return;const n=+b.dataset.n;
  if(!lvlUnlocked(n)){
    if(canBuy(n)){buyLvl=n;$('#buyT').textContent=`Abrir nivel ${n}`;$('#buyP').textContent=`🪙 ${LEVEL_COST[n]}`;$('#buy').classList.add('show');sTap();return}
    b.classList.remove('nope');void b.offsetWidth;b.classList.add('nope');sPop();
    toast(!lvlUnlocked(n-1)?`Primero abre el nivel ${n-1}`:`Te faltan 🪙 ${LEVEL_COST[n]-(save.coins||0)}`);return}
  sTap();curLvl=n;show('menu');
});
let buyLvl=0;
$('#buyNo').addEventListener('click',()=>$('#buy').classList.remove('show'));
$('#buyOk').addEventListener('click',()=>{const n=buyLvl;if(!canBuy(n))return;save.coins-=LEVEL_COST[n];save.lvlOwned.push(n);persist();
  $('#buy').classList.remove('show');sFan();sCoin();say('Level '+n+' unlocked!');confetti();renderHome();if($('#win').classList.contains('show'))updWinNext()});
$('#cont').addEventListener('click',()=>{ac();sTap();openFig(+$('#cont').dataset.i)});
try{if(window.top===window&&/^https?:$/.test(location.protocol))$('#go3d').classList.remove('hidden')}catch(e){}
$('#goRescue').addEventListener('click',()=>{ac();sTap();curLvl='rescate';show('menu')});
$('#goPapa').addEventListener('click',()=>{ac();sTap();curLvl='papa';show('menu')});
$('#goFree').addEventListener('click',()=>{ac();sTap();openEditor('free')});
$('#back').addEventListener('pointerdown',()=>{ac();show('home')});

