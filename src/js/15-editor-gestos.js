document.addEventListener('pointercancel',()=>{
  if(drag){if(drag.el)drag.el.remove();drag=null}
  if(pmove){if(pmove.el)pmove.el.remove();pmove=null;drawEditorBoard()}
  if(preview){preview.remove();preview=null}});
let drag=null;
$('#eShapes').addEventListener('pointerdown',ev=>{const b=ev.target.closest('.tile');if(!b)return;
  drag={k:b.dataset.k,x0:ev.clientX,y0:ev.clientY,moved:false,el:null};});
document.addEventListener('pointermove',ev=>{if(!drag)return;
  if(!drag.moved&&Math.hypot(ev.clientX-drag.x0,ev.clientY-drag.y0)<10)return;
  if(!drag.moved){drag.moved=true;ac();ed.k=drag.k;ed.rm=false;
    const s=P(drag.k,pcCol(drag.k,ed.c),0,0);drag.el=pieceEl(s,ed.C);drag.el.classList.add('dragging');document.body.appendChild(drag.el);
    drag.w=CAT[drag.k].w*ed.C;drag.h=CAT[drag.k].h*ed.C*PL}
  drag.el.style.left=(ev.clientX-drag.w/2)+'px';drag.el.style.top=(ev.clientY-drag.h-30)+'px';
  showPreview(drag.k,snapSpot(drag.k,ev.clientX,ev.clientY-30-drag.h/2));
},{passive:true});
document.addEventListener('pointerup',ev=>{if(!drag)return;const d=drag;drag=null;
  if(!d.moved){selShape(d.k);return}   // toque simple: elegir la ficha (no depender del click, que a veces se pierde)
  d.el.remove();const spot=snapSpot(d.k,ev.clientX,ev.clientY-30-d.h/2);showPreview(null,null);
  if(spot){placeAt(d.k,spot);const nm=(FIXCOL[d.k]?'':colName(ed.c)+' ')+enShape(d.k);say(cap(nm))}else placementBlocked();
  renderEditor();
});
let lastSel=0;
$('#eShapes').addEventListener('click',ev=>{const b=ev.target.closest('.tile');if(!b||(ev.detail>0&&Date.now()-lastSel<600))return;selShape(b.dataset.k)});
function selShape(k){lastSel=Date.now();ac();sTap();ed.k=k;ed.rm=false;ed.sel=-1;renderEditor();
  const nm=(FIXCOL[ed.k]?'':colName(ed.c)+' ')+enShape(ed.k);say(cap(nm));word(cap(nm),FIXCOL[ed.k]?'#fff':COL[ed.c][0],$('#eStage'))}
$('#eStage').addEventListener('pointerdown',ev=>{
  ac();const B=$('#eBoard'),br=B.getBoundingClientRect(),c=ed.C,pcs=edPieces();
  if(ed.rm){
    const el=ev.target.closest('.pc');if(!el||el.dataset.i===undefined)return;
    const i=+el.dataset.i;
    snapshot();pcs.splice(i,1);setPieces(pcs);sPop();drawEditorBoard();return;
  }
  if(ev.target.closest('#arrows'))return;
  const el=ev.target.closest('.pc');
  if(el&&el.dataset.i!==undefined){pmove={i:+el.dataset.i,x0:ev.clientX,y0:ev.clientY,moved:false,el:null};return}
  if(ed.sel>=0){ed.sel=-1;drawEditorBoard();return}            // tocar vacío: suelta la selección
  const spot=snapSpot(ed.k,ev.clientX,ev.clientY);
  if(!spot){placementBlocked();return}
  placeAt(ed.k,spot);
});
// mover una ficha ya puesta: tocar = seleccionar (flechas), arrastrar = llevarla a otro lugar
let pmove=null;
document.addEventListener('pointermove',ev=>{if(!pmove)return;
  if(!pmove.moved&&Math.hypot(ev.clientX-pmove.x0,ev.clientY-pmove.y0)<10)return;
  const p=edPieces()[pmove.i];if(!p)return;
  if(!pmove.moved){pmove.moved=true;ed.sel=-1;const s=P(p.k,p.c,0,0);pmove.el=pieceEl(s,ed.C);pmove.el.classList.add('dragging');document.body.appendChild(pmove.el);
    pmove.w=CAT[p.k].w*ed.C;pmove.h=CAT[p.k].h*ed.C*PL;const src=$('#eBoard').querySelector(`[data-i="${pmove.i}"]`);if(src)src.style.opacity='.25'}
  pmove.el.style.left=(ev.clientX-pmove.w/2)+'px';pmove.el.style.top=(ev.clientY-pmove.h-30)+'px';
  const spot=snapSpot(p.k,ev.clientX,ev.clientY-30-pmove.h/2,pmove.i);
  if(preview){preview.remove();preview=null}
  if(spot){preview=at(pieceEl(P(p.k,p.c,spot.x,spot.y),ed.C),P(p.k,'x',spot.x,spot.y),ed.C,E_ROWS);preview.classList.add('preview');$('#eBoard').appendChild(preview)}
},{passive:true});
document.addEventListener('pointerup',ev=>{if(!pmove)return;const m=pmove;pmove=null;
  if(!m.moved){ed.sel=ed.sel===m.i?-1:m.i;sTap();drawEditorBoard();if(ed.sel>=0){const p=edPieces()[ed.sel];say(cap((FIXCOL[p.k]?'':colName(p.c)+' ')+enShape(p.k)))}return}
  m.el.remove();if(preview){preview.remove();preview=null}
  const pcs=edPieces(),p=pcs[m.i],spot=snapSpot(p.k,ev.clientX,ev.clientY-30-m.h/2,m.i);
  if(spot){snapshot();p.x=spot.x;p.y=spot.y;setPieces(pcs);sSnap();buzz(12)}else placementBlocked();
  drawEditorBoard();
});
// flechas: ◀ ▶ de a un botón, ▲ ▼ de a un ladrillo (o una placa si la ficha es plana)
$('#arrows').addEventListener('click',ev=>{
  ev.stopPropagation();const b=ev.target.closest('button');if(!b)return;ac();
  const pcs=edPieces(),i=ed.sel,p=pcs[i];if(!p)return;
  const mv=b.dataset.mv;
  if(mv==='OK'){ed.sel=-1;sTap();drawEditorBoard();return}
  if(mv==='X'){snapshot();pcs.splice(i,1);setPieces(pcs);ed.sel=-1;sPop();drawEditorBoard();return}
  const T=CAT[p.k],vs=T.h<=1?1:3,dx=mv==='L'?-1:mv==='R'?1:0,dy=mv==='U'?vs:mv==='D'?-vs:0;
  let nx=p.x+dx,ny=p.y+dy;
  if(mv==='D'&&ny<0)ny=0;
  if(dy){ // imán vertical: niveles de fichas cercanas (base y techo, alineando abajo o arriba)
    const lv=new Set([0]);pcs.forEach((q,j)=>{if(j===i)return;const Q=CAT[q.k];if(q.x+Q.w<p.x-1||q.x>p.x+T.w+1)return;
      [q.y,q.y+Q.h,q.y+Q.h-T.h,q.y-T.h].forEach(v=>lv.add(v))});
    const L=[...lv].filter(v=>v>=0&&(dy>0?v>p.y&&v<=p.y+dy:v<p.y&&v>=p.y+dy));
    if(L.length)ny=dy>0?Math.min(...L):Math.max(...L);
  }
  const ok=nx>=0&&nx+T.w<=E_COLS&&ny>=0&&ny+T.h<=E_ROWS&&(nx!==p.x||ny!==p.y)&&freeAt(pcs,p.k,nx,ny,i);
  if(!ok){const el=$('#eBoard').querySelector(`[data-i="${i}"]`);if(el){el.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:250})}placementBlocked();return}
  snapshot();p.x=nx;p.y=ny;setPieces(pcs);sTap();buzz(8);drawEditorBoard();
});
$('#eUndo').addEventListener('click',()=>{ac();ed.sel=-1;if(!ed.hist.length)return;setPieces(JSON.parse(ed.hist.pop()));sPop();drawEditorBoard()});
$('#eRm').addEventListener('click',()=>{ac();ed.sel=-1;ed.rm=!ed.rm;renderEditor()});
$('#ePalette').addEventListener('click',()=>{
  ac();ed.expanded=!ed.expanded;
  if(!ed.expanded){
    if(!QUICK_SHAPES.includes(ed.k))ed.k='b2';
    if(!QUICK_COLORS.includes(ed.c))ed.c='r';
  }
  renderEditor();$('#eShapes').scrollTo(0,0);$('#eColors').scrollTo(0,0);
});
$('#eClear').addEventListener('click',()=>{
  ac();const n=edPieces().length;if(!n)return;
  $('#eClearCount').textContent=`🧱 ${n} ${n===1?'ficha':'fichas'}`;
  $('#eClearDlg').showModal();
});
$('#eClearNo').addEventListener('click',()=>$('#eClearDlg').close());
$('#eClearYes').addEventListener('click',()=>{
  ac();$('#eClearDlg').close();ed.sel=-1;ed.rm=false;
  snapshot();setPieces([]);sPop();renderEditor();$('#eUndo').focus();
});
$('#eBack').addEventListener('click',()=>{ac();show('home')});
$('#eImport').addEventListener('pointerdown',()=>{ac();if(!save.free.length)return;snapshot();setPieces(JSON.parse(JSON.stringify(save.free)));sSnap();drawEditorBoard()});
// ---- guardar como modelo (papá) ----
let sEmo='🚗';
$('#eSave').addEventListener('pointerdown',()=>{ac();const n=edPieces().length;if(!n)return;
  const cur=save.custom.find(c=>c.id===save.draft.id);
  $('#sName').value=cur?cur.name:'';sEmo=cur?cur.emo:'🚗';
  $('#sInfo').textContent=`🧱 ${n} fichas · Nivel ${lvlFor(n)}${n>BAG_FROM?' · 📦 en sobres':''}`;
  $('#sEmos').innerHTML=E_EMOS.map(e=>`<button class="${e===sEmo?'sel':''}">${e}</button>`).join('');
  $('#saveDlg').classList.add('show');setTimeout(()=>$('#sName').focus(),50)});
$('#sEmos').addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;sEmo=b.textContent;
  $('#sEmos').querySelectorAll('button').forEach(x=>x.classList.toggle('sel',x===b))});
$('#sCancel').addEventListener('click',()=>$('#saveDlg').classList.remove('show'));
$('#sOk').addEventListener('click',()=>{
  const name=$('#sName').value.trim()||'Modelo de papá';
  let cur=save.custom.find(c=>c.id===save.draft.id);
  if(!cur){cur={id:'c'+Date.now()};save.custom.push(cur)}
  cur.name=name;cur.emo=sEmo;cur.pieces=JSON.parse(JSON.stringify(edPieces()));
  delete save.prog[cur.id];save.draft={id:cur.id,pieces:JSON.parse(JSON.stringify(cur.pieces))};persist();rebuildFigs();
  $('#saveDlg').classList.remove('show');sFan();renderEditor();
});

$('#eShapes').addEventListener('scroll',updMore,{passive:true});
$('#moreR').addEventListener('click',()=>{ac();sTap();const sh=$('#eShapes');sh.scrollLeft+=sh.clientWidth*.9});
$('#moreL').addEventListener('click',()=>{ac();sTap();const sh=$('#eShapes');sh.scrollLeft-=sh.clientWidth*.9});
