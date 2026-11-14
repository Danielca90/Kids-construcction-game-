// ================== PANEL DE PAPÁS (clave: 1234) ==================
const PARENT_CODE='1234';
let pin='';
function pRender(){
  $('#pdots').innerHTML=[0,1,2,3].map(i=>`<i class="${i<pin.length?'on':''}"></i>`).join('');
  $('#pEnglish').textContent=save.noEnglish?'🇺🇸 Activar inglés (palabras y voz)':'🇺🇸 Inglés activado — tocar para quitar';
  $('#pHaptic').textContent=save.noHaptic?'📳 Activar vibración':'📳 Vibración activada — tocar para quitar';
  $('#pUnlock').textContent=save.unlockAll?'🔒 Volver a bloquear niveles':'🔓 Desbloquear todo';
  $('#pList').innerHTML=save.custom.map(c=>`<div class="crow"><span>${escH(c.emo)} ${escH(c.name)} · 🧱 ${c.pieces.length}</span><button data-ed="${c.id}">✏️</button><button data-del="${c.id}">🗑️</button></div>`).join('');
}
$('#pkeys').innerHTML=['1','2','3','4','5','6','7','8','9','⌫','0',''].map(k=>`<button data-k="${k}" ${k?'':'style="visibility:hidden"'}>${k}</button>`).join('');
$('#gear').addEventListener('click',()=>{ac();pin='';$('#pcode').classList.remove('hidden');$('#popts').classList.add('hidden');
  $('#pReset').dataset.sure='';$('#pReset').textContent='🗑️ Borrar avance y estrellas';pRender();$('#parents').classList.add('show')});
$('#pkeys').addEventListener('click',ev=>{
  const b=ev.target.closest('button');if(!b||!b.dataset.k)return;const k=b.dataset.k;
  if(k==='⌫')pin=pin.slice(0,-1);else if(pin.length<4)pin+=k;
  pRender();
  if(pin.length===4){
    if(pin===PARENT_CODE){sTap();$('#pcode').classList.add('hidden');$('#popts').classList.remove('hidden')}
    else{const d=$('#pdots');d.classList.remove('bad');void d.offsetWidth;d.classList.add('bad');setTimeout(()=>{pin='';pRender()},450)}
  }
});
$('#pBuild').addEventListener('click',()=>{$('#parents').classList.remove('show');
  if(save.draft.id)save.draft={id:null,pieces:[]};persist();openEditor('papa')});
$('#pList').addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;
  if(b.dataset.ed){const c=save.custom.find(x=>x.id===b.dataset.ed);save.draft={id:c.id,pieces:JSON.parse(JSON.stringify(c.pieces))};persist();
    $('#parents').classList.remove('show');openEditor('papa')}
  if(b.dataset.del){if(b.dataset.sure!=='1'){b.dataset.sure='1';b.textContent='❓';return}
    save.custom=save.custom.filter(x=>x.id!==b.dataset.del);delete save.prog[b.dataset.del];delete save.stars[b.dataset.del];
    if(save.draft.id===b.dataset.del)save.draft={id:null,pieces:[]};persist();rebuildFigs();pRender();renderHome()}
});
$('#pEnglish').addEventListener('click',()=>{save.noEnglish=!save.noEnglish;persist();pRender();if(!save.noEnglish)say('Hello! Let\'s build!')});
$('#pHaptic').addEventListener('click',()=>{save.noHaptic=!save.noHaptic;persist();pRender();buzz(20)});
$('#pUnlock').addEventListener('click',()=>{save.unlockAll=!save.unlockAll;persist();sFan();pRender();renderHome()});
$('#pReset').addEventListener('click',()=>{const b=$('#pReset');
  if(!b.dataset.sure){b.dataset.sure='1';b.textContent='¿Seguro? Toca otra vez para borrar';return}
  save.stars={};save.prog={};save.last=null;save.coins=0;save.lvlOwned=[1];persist();b.dataset.sure='';b.textContent='✅ Borrado';renderHome()});
$('#pClose').addEventListener('click',()=>{$('#parents').classList.remove('show');$('#pMsg').textContent=''});
// ---- copia de seguridad: todo el progreso (2D y 3D) en un archivo ----
$('#pBackup').addEventListener('click',async()=>{
  let s3=null;try{s3=JSON.parse(localStorage.getItem('fichitas3d'))}catch(e){}
  const data={app:'fichitas',fecha:new Date().toISOString(),save,save3d:s3};
  const txt=JSON.stringify(data),name='fichitas-copia-'+new Date().toISOString().slice(0,10)+'.json';
  try{
    const file=new File([txt],name,{type:'application/json'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Copia de Fichitas'});$('#pMsg').textContent='✅ Copia lista';return}
  }catch(e){if(e&&e.name==='AbortError')return}
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();a.remove();
    $('#pMsg').textContent='✅ Copia descargada'}catch(e){$('#pMsg').textContent='No se pudo guardar la copia aquí'}
});
$('#pRestore').addEventListener('change',async ev=>{
  const f=ev.target.files&&ev.target.files[0];if(!f)return;
  try{const d=JSON.parse(await f.text());if(d.app!=='fichitas'||!d.save)throw 0;
    const ns=Object.assign({stars:{},prog:{},custom:[],free:[],draft:{id:null,pieces:[]},mix:[],coins:0},d.save);
    if(typeof ns.stars!=='object'||!Array.isArray(ns.custom))throw 0;
    ns.mix=Array.isArray(ns.mix)?ns.mix:[];ns.free=Array.isArray(ns.free)?ns.free:[];ns.draft=ns.draft||{id:null,pieces:[]};
    if(!Array.isArray(ns.lvlOwned)){ns.lvlOwned=[1];for(let n=2;n<8;n++)if(FIGURES.some(G=>!G.set&&(G.lvl===n-1||G.lvl===n)&&ns.stars[G.id]>0))ns.lvlOwned.push(n)}
    save=ns;applyMix();persist();
    if(d.save3d)try{localStorage.setItem('fichitas3d',JSON.stringify(d.save3d))}catch(e){}
    rebuildFigs();renderHome();pRender();sFan();$('#pMsg').textContent='✅ Progreso recuperado ('+(d.fecha||'').slice(0,10)+')'}
  catch(e){$('#pMsg').textContent='⚠️ Ese archivo no es una copia de Fichitas'}
  ev.target.value='';
});
