// ================== NAVEGACIÓN ==================
function show(name){screen=name;['home','menu','game','editor','chars'].forEach(n=>$('#'+n).classList.toggle('hidden',n!==name));
  requestAnimationFrame(()=>{if(name==='home')renderHome();else if(name==='menu')renderMenu();else if(name==='game'){render();checkBag()}else if(name==='chars')renderChars();else renderEditor()})}
function openFig(i){figIdx=i;const F=fig();curLvl=F.custom?'papa':F.set?F.set:F.lvl;save.last=F.id;
  const pr=save.prog[F.id];st=(pr&&pr.v===5&&pr.placed<F.steps.length&&progOk(F,pr))?pr:newState();
  clearTimeout(winT);clearTimeout(bagT);wrong=0;tray.classList.remove('wait');keep();busy=false;show('game')}
const sigOf=F=>F.steps.length+':'+F.steps.map(key).join(',').length;
function progOk(F,pr){if(pr.sig)return pr.sig===sigOf(F);
  return (pr.order||[]).every(k=>sampleOf.call(null,k,F,pr))}
let winT=0,bagT=0;
function goModels(){clearTimeout(winT);clearTimeout(bagT);$('#win').classList.remove('show');$('#bag').classList.remove('show');busy=false;show('menu')}
$('#homeBtn').addEventListener('pointerdown',()=>{ac();goModels()});
$('#home2').addEventListener('click',()=>{ac();goModels()});

