// ================== MODELOS DE UN NIVEL ==================
function groupFigs(){return FIGS.map((F,i)=>[F,i]).filter(([F])=>curLvl==='papa'?F.custom:curLvl==='rescate'?F.set==='rescate':(!F.custom&&!F.set&&F.lvl===curLvl))}
function renderMenu(){
  const figs=groupFigs();
  if(curLvl==='papa')$('#lvlName').textContent='👨 Modelos de papá';
  else if(curLvl==='rescate')$('#lvlName').textContent='🚨 Brigada de Rescate';
  else $('#lvlName').textContent=`${DIFF[curLvl].emo} Nivel ${curLvl} · ${LEVELS[curLvl].range} fichas`;
  $('#lvlStars').textContent='⭐ '+figs.reduce((a,[F])=>a+(save.stars[F.id]||0),0);
  const L=$('#levels');L.innerHTML='';
  if(!figs.length){L.innerHTML='<div class="empty">Todavía no hay modelos aquí.</div>';return}
  const cards=document.createElement('div');cards.className='cards';
  const portrait=innerHeight>innerWidth,n=figs.length;
  const cols=portrait?(n>2?2:1):(n===4?2:Math.min(n,n>6?4:3));
  cards.style.gridTemplateColumns=`repeat(${cols},1fr)`;
  figs.forEach(([F,i])=>{
    const b=document.createElement('button');b.className='card'+(unlocked(i)?'':' locked');b.dataset.i=i;
    const s=save.stars[F.id]||0,pr=progOf(F);
    b.innerHTML=`${pr?`<span class="prog">${Math.round(pr.placed/F.steps.length*100)}%</span>`:''}<div class="mini"><div></div></div><div class="foot">${escH(F.emo)} ${escH(F.name)} · 🧱 ${F.steps.length}${F.bags.length>1?' · 📦 '+F.bags.length:''}${s?' · ⭐ '+s:''}</div>`;
    cards.appendChild(b)});
  L.appendChild(cards);
  L.querySelectorAll('.card').forEach(b=>{
    const F=FIGS[+b.dataset.i],m=b.querySelector('.mini');
    drawFigure(m.firstChild,F,Math.min(m.clientWidth*.85/F.cols,m.clientHeight*.82/(F.rows*PL)))});
}
$('#levels').addEventListener('click',ev=>{
  ac();const b=ev.target.closest('.card');if(!b)return;const i=+b.dataset.i;
  if(!unlocked(i)){b.classList.remove('nope');void b.offsetWidth;b.classList.add('nope');return}
  sTap();openFig(i);
});

