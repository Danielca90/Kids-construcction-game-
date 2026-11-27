// =====================================================================
//  EDITOR: modo libre (niño) y modo papá (crear modelos)
//  Las fichas caen y se apoyan sobre lo que haya debajo, como al apilar Lego de verdad.
// =====================================================================
// modo libre: pocas fichas y base más chica (fichas grandes en pantalla); modo papá: catálogo completo
const E_FULL=['b1','b2','b3','b4','b6','b8','b10','p1','p2','p4','p6','p8','t1','t2','t3','sI','sD','vI','vD','cI','cD','ri','qI','qD','ar','ar6','ve','pu','va','rd','do','cn','ojo','cara','fl','mt','ba','ru','rg'];
const E_SIMPLE=['b1','b2','b4','b6','b8','p2','p4','t2','sI','sD','vI','vD','cI','cD','ri','ar','ve','pu','va','rd','do','cn','ojo','cara','fl','mt','ba','ru','rg'];
const C_SIMPLE=['r','y','a','g','o','w','x','m','n','b','p','k','L','D','C','M','B','R','T','U','V','Y'];
let E_COLS=14,E_ROWS=30,E_SHAPES=E_SIMPLE;
function edDims(){const papa=ed.mode==='papa';E_COLS=papa?20:14;E_ROWS=papa?45:30;E_SHAPES=papa?E_FULL:E_SIMPLE}
const E_EMOS=['🚗','🏠','🤖','🦖','🚀','🏰','⛵','🐶','🌳','✈️','🚜','⭐'];
const QUICK_SHAPES=E_SIMPLE.slice(0,4),QUICK_COLORS=C_SIMPLE.slice(0,6);
let ed={mode:'free',k:'b2',c:'r',rm:false,hist:[],C:30,sel:-1,expanded:false};
const edPieces=()=>ed.mode==='free'?save.free:save.draft.pieces;
function setPieces(a){if(ed.mode==='free'){save.free=a;save.freeUndo=ed.hist}else save.draft.pieces=a;
  $('#eSaveError').classList.toggle('hidden',persist())}
function openEditor(mode){ed.mode=mode;ed.sel=-1;ed.rm=false;ed.hist=mode==='free'?freeHistory():[];ed.expanded=false;edDims();if(!COL[ed.c]||(mode==='free'&&!QUICK_COLORS.includes(ed.c)))ed.c='r';
  if(!E_SHAPES.includes(ed.k)||(mode==='free'&&!QUICK_SHAPES.includes(ed.k)))ed.k='b2';show('editor')}
// flechas 👈 👉 de la bandeja: solo cuando hay fichas escondidas a un lado
function updMore(){const sh=$('#eShapes'),h=sh.scrollWidth>sh.clientWidth+4;
  $('#moreR').classList.toggle('hidden',!h||sh.scrollLeft+sh.clientWidth>=sh.scrollWidth-4);
  $('#moreL').classList.toggle('hidden',!h||sh.scrollLeft<=4)}
function renderEditor(){
  const papa=ed.mode==='papa';
  $('#eTitle').textContent=papa?(save.draft.id?'👨‍🔧 Editando: '+(save.custom.find(c=>c.id===save.draft.id)||{}).name:'👨‍🔧 Modelo nuevo'):'🎨 Modo libre';
  document.querySelectorAll('.papaOnly').forEach(b=>b.classList.toggle('hidden',!papa));
  $('#eRm').classList.toggle('on',ed.rm);
  $('#eRm').setAttribute('aria-pressed',ed.rm);
  $('#eAside').classList.toggle('quick',!papa&&!ed.expanded);
  $('#ePalette').classList.toggle('hidden',papa);
  $('#ePalette').setAttribute('aria-expanded',ed.expanded);
  $('#ePalette').innerHTML=ed.expanded?'➖ <span>Menos piezas y colores</span>':'➕ <span>Más piezas y colores</span>';
  // colores
  const cs=$('#eColors'),sh=$('#eShapes');
  const colorFocus=cs.contains(document.activeElement)?document.activeElement.dataset.c:null;
  const shapeFocus=sh.contains(document.activeElement)?document.activeElement.dataset.k:null;
  cs.innerHTML='';
  const base=ed.mode==='papa'?Object.keys(COL).filter(c=>c!=='x'||true).filter(c=>!/^c\d/.test(c)):C_SIMPLE;
  base.concat(save.mix.map(m=>m.k)).forEach(c=>{const b=document.createElement('button');b.className='sw'+(c===ed.c?' sel':'')+(/^[TUVY]$/.test(c)?' trans':'')+(/^c\d/.test(c)?' mixd':'');b.dataset.c=c;b.classList.toggle('quickChoice',QUICK_COLORS.includes(c));b.setAttribute('aria-label',cap(colName(c)));b.setAttribute('aria-pressed',c===ed.c);b.style.background=COL[c][0];cs.appendChild(b)});
  {const b=document.createElement('button');b.className='sw mixb';b.id='mixOpen';b.setAttribute('aria-label','Mezclar colores');b.textContent='🎨';cs.appendChild(b)}
  // formas (en el color elegido)
  sh.innerHTML='';
  E_SHAPES.forEach(k=>{const b=document.createElement('button');b.className='tile'+(k===ed.k&&!ed.rm?' sel':'');b.dataset.k=k;b.classList.toggle('quickChoice',QUICK_SHAPES.includes(k));b.setAttribute('aria-label',cap(enShape(k)));b.setAttribute('aria-pressed',k===ed.k&&!ed.rm);sh.appendChild(b)});
  const t0=sh.firstChild,tw=t0.clientWidth,th=t0.clientHeight;
  let uc=40;E_SHAPES.forEach(k=>{const T=CAT[k];if(T.h>6||T.w>8)return;uc=Math.min(uc,tw*.82/Math.min(T.w,4),th*.62/(T.h*PL+.25))});
  sh.querySelectorAll('.tile').forEach(b=>{const k=b.dataset.k,T=CAT[k],c=Math.min(uc*Math.min(1,4/T.w),uc,th*.8/(T.h*PL+.25),tw*.9/T.w);
    const s=P(k,pcCol(k,ed.c),0,0),pw=document.createElement('div');pw.className='pw';pw.style.width=T.w*c+'px';pw.style.height=T.h*c*PL+'px';
    const p=pieceEl(s,c);p.style.left='0';p.style.top='0';pw.appendChild(p);b.appendChild(pw)});
  if(colorFocus)cs.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
  if(shapeFocus)sh.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
  drawEditorBoard();requestAnimationFrame(updMore);
}
function drawEditorBoard(){
  const r=$('#eStage').getBoundingClientRect(),RS=E_ROWS*PL;
  const c=ed.C=Math.max(10,Math.min(r.width*.94/E_COLS,(r.height-30)*.94/RS));
  const B=$('#eBoard'),W=$('#eWrap');
  B.style.width=E_COLS*c+'px';B.style.height=RS*c+'px';
  $('#ePlate').style.width=E_COLS*c+'px';$('#ePlate').style.height=Math.max(8,Math.min(c*.5,30))+'px';
  W.style.left=(r.width-E_COLS*c)/2+'px';W.style.top=Math.max(4,(r.height-RS*c-parseFloat($('#ePlate').style.height))/2)+'px';
  B.className='board'+(ed.rm?' rm':'');B.innerHTML='';
  // cuadrícula suave: columnas de botón y filas de ladrillo
  const g=document.createElement('div');g.className='grid';
  g.style.backgroundImage=`linear-gradient(90deg,rgba(36,80,107,.07) 1px,transparent 1px),linear-gradient(rgba(36,80,107,.07) 1px,transparent 1px)`;
  g.style.backgroundSize=`${c}px ${3*PL*c}px`;g.style.backgroundPosition=`0 ${RS*c%(3*PL*c)}px`;B.appendChild(g);
  const fr=document.createDocumentFragment();
  edPieces().forEach((p,i)=>{const s=P(p.k,p.c,p.x,p.y),el=at(pieceEl(s,c),s,c,E_ROWS);el.dataset.i=i;if(i===ed.sel)el.classList.add('sel-pc');fr.appendChild(el)});
  $('#arrows').classList.toggle('hidden',!(ed.sel>=0&&ed.sel<edPieces().length));
  B.appendChild(fr);
  $('#eUndo').disabled=!ed.hist.length;
  $('#eClear').disabled=!edPieces().length;
  $('#eCount').textContent='🧱 '+edPieces().length;
}
// ¿cabe la ficha ahí sin chocar?
function freeAt(pcs,k,x,y,skip){const T=CAT[k];return !pcs.some((p,j)=>{if(j===skip)return false;const q=CAT[p.k];return p.x<x+T.w&&p.x+q.w>x&&p.y<y+T.h&&p.y+q.h>y})}
// Encaja la ficha en el lugar apoyado más cercano al dedo (sobre la base o sobre otra ficha), como un Lego real
function snapSpot(k,clientX,clientY,skip){
  // imán: busca el hueco libre y apoyado más cercano al dedo, y prefiere los que quedan pegaditos a otra ficha
  const B=$('#eBoard'),br=B.getBoundingClientRect(),c=ed.C,T=CAT[k],pcs=edPieces().map((p,j)=>j===skip?{k:p.k,x:-99,y:-99}:p);
  const fx=(clientX-br.left)/c-T.w/2,fy=(br.bottom-clientY)/(c*PL)-T.h/2;
  if(fx<-T.w-1.5||fx>E_COLS+1.5||clientY<br.top-c*2||clientY>br.bottom+c*3)return null;
  const x0=Math.round(fx);let best=null,bs=1e9;
  for(let x=x0-3;x<=x0+3;x++){
    if(x<0||x+T.w>E_COLS)continue;
    const cand=new Set([0]);pcs.forEach(p=>{const q=CAT[p.k];if(p.x<x+T.w&&p.x+q.w>x)cand.add(p.y+q.h);
      if(p.x+q.w===x||p.x===x+T.w){cand.add(p.y);cand.add(p.y+q.h-T.h)}});
    cand.forEach(y=>{
      if(y<0||y+T.h>E_ROWS||!freeAt(pcs,k,x,y))return;
      let sc=Math.abs(x-fx)+Math.abs(y-fy)*PL;
      // pegadita de lado: otra ficha justo a la izquierda o derecha en la misma altura
      const side=pcs.some(p=>{const q=CAT[p.k];return p.y<y+T.h&&p.y+q.h>y&&(p.x+q.w===x||p.x===x+T.w)});
      // hueco de un botón al lado (queda "casi pegada"): se castiga
      const gap=pcs.some(p=>{const q=CAT[p.k];return p.y<y+T.h&&p.y+q.h>y&&(p.x+q.w===x-1||p.x===x+T.w+1)});
      // apoyada encima de otra ficha
      const onTop=y>0&&pcs.some(p=>{const q=CAT[p.k];return p.y+q.h===y&&p.x<x+T.w&&p.x+q.w>x});
      const held=y===0||onTop;               // apoyada en el suelo o sobre otra ficha
      if(side&&held)sc-=1.2;if(gap&&!side)sc+=.8;if(onTop)sc-=.4;
      if(!held)sc+=side?.3:9;                // flotando solo si queda alineada al lado de otra y el dedo está ahí
      if(sc<bs){bs=sc;best={x,y}}
    });
  }
  return bs>4.5?null:best;
}
function placeAt(k,spot){buzz(12);const pcs=edPieces();snapshot();pcs.push({k,c:pcCol(k,ed.c),x:spot.x,y:spot.y});setPieces(pcs);sSnap();drawEditorBoard();
  const last=$('#eBoard').querySelector(`[data-i="${pcs.length-1}"]`);if(last){last.classList.add('pop');const r=last.getBoundingClientRect();sparks(r.left+r.width/2,r.bottom,COL[pcCol(k,ed.c)][0],8)}
  if(pcs.length%10===0)say(PRAISE[Math.random()*PRAISE.length|0],true)}
let preview=null;
function showPreview(k,spot){if(preview){preview.remove();preview=null}if(!spot)return;
  preview=at(pieceEl(P(k,pcCol(k,ed.c),spot.x,spot.y),ed.C),P(k,'x',spot.x,spot.y),ed.C,E_ROWS);preview.classList.add('preview');$('#eBoard').appendChild(preview)}
const UNDO_LIMIT=80,UNDO_BYTES=600000;
function freeHistory(){
  if(!Array.isArray(save.freeUndo))return [];
  return save.freeUndo.slice(-UNDO_LIMIT).filter(entry=>{
    if(typeof entry!=='string'||entry.length>UNDO_BYTES)return false;
    try{
      const pieces=JSON.parse(entry);
      return Array.isArray(pieces)&&pieces.every(p=>p&&CAT[p.k]&&COL[p.c]&&Number.isInteger(p.x)&&Number.isInteger(p.y));
    }catch(e){return false}
  });
}
function snapshot(){
  ed.hist.push(JSON.stringify(edPieces()));
  if(ed.hist.length>UNDO_LIMIT)ed.hist.shift();
  if(ed.mode==='free'){
    let size=ed.hist.reduce((sum,entry)=>sum+entry.length,0);
    while(size>UNDO_BYTES&&ed.hist.length>1)size-=ed.hist.shift().length;
  }
}
let editorFeedbackTimer;
function placementBlocked(){
  sPop();
  const el=$('#eFeedback');el.textContent='✋ No cabe aquí';
  clearTimeout(editorFeedbackTimer);
  editorFeedbackTimer=setTimeout(()=>el.textContent='',1100);
}
$('#eColors').addEventListener('click',ev=>{const b=ev.target.closest('.sw');if(!b)return;if(b.id==='mixOpen'){ac();sTap();openMixer();return}ac();sTap();ed.c=b.dataset.c;ed.rm=false;renderEditor();
  say(cap(colName(ed.c)));word(cap(colName(ed.c)),COL[ed.c][0],$('#eStage'))});
