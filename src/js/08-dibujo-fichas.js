// ================== DIBUJO DE FICHAS ==================
function studAt(e,i,c,col,dk){
  const d=document.createElement('i');d.className='stud';
  Object.assign(d.style,{left:(i*c+c*(1-STUD_W)/2)+'px',width:c*STUD_W+'px',height:c*STUD_H+'px',top:(-c*STUD_H+.5)+'px',
    background:`linear-gradient(90deg,${dk},${col} 30%,#ffffff55 45%,${col} 60%,${dk})`,borderRadius:`${c*.05}px ${c*.05}px 0 0`});
  e.appendChild(d);
}
function pieceEl(s,c){
  const T=CAT[s.k],[col,dk]=COL[s.c],e=document.createElement('div'),W=s.w*c,H=s.h*c*PL;
  e.className='pc k-'+s.k;e.style.width=W+'px';e.style.height=H+'px';
  const bd=document.createElement('div');bd.className='bd';e.appendChild(bd);
  const seam=`inset 1px 0 0 rgba(0,0,0,.18), inset -1px 0 0 rgba(0,0,0,.18)`;
  const shade=`inset 0 ${-Math.max(1,c*.08)}px 0 ${dk}, inset 0 ${Math.max(1,c*.05)}px 0 rgba(255,255,255,.35), ${seam}`;
  const small=c<7;
  switch(T.kind){
    case 'brick':bd.style.background=col;bd.style.borderRadius=c*.03+'px';bd.style.boxShadow=shade;
      if(!small)for(let i=0;i<s.w;i++)studAt(e,i,c,col,dk);break;
    case 'tile':bd.style.background=`linear-gradient(${'#ffffff66'},${col} 35%)`;bd.style.backgroundColor=col;bd.style.borderRadius=c*.03+'px';bd.style.boxShadow=shade;break;
    case 'slopeI':bd.style.background=`linear-gradient(135deg,${col} 40%,${dk})`;bd.style.clipPath='polygon(0 100%,0 67%,50% 0,100% 0,100% 100%)';if(!small)studAt(e,1,c,col,dk);break;
    case 'slopeD':bd.style.background=`linear-gradient(225deg,${col} 40%,${dk})`;bd.style.clipPath='polygon(0 0,50% 0,100% 67%,100% 100%,0 100%)';if(!small)studAt(e,0,c,col,dk);break;
    case 'ridge':bd.style.background=`linear-gradient(${col} 50%,${dk})`;bd.style.clipPath='polygon(0 100%,0 67%,45% 0,55% 0,100% 67%,100% 100%)';break;
    case 'cheeseI':bd.style.background=`linear-gradient(135deg,${col} 50%,${dk})`;bd.style.clipPath='polygon(0 100%,0 75%,100% 0,100% 100%)';break;
    case 'cheeseD':bd.style.background=`linear-gradient(225deg,${col} 50%,${dk})`;bd.style.clipPath='polygon(0 0,100% 75%,100% 100%,0 100%)';break;
    case 'round':bd.style.left='6%';bd.style.right='6%';bd.style.borderRadius=`${c*.12}px`;
      bd.style.background=`linear-gradient(90deg,${dk},${col} 30%,#ffffff70 48%,${col} 65%,${dk})`;if(!small)studAt(e,0,c,col,dk);break;
    case 'eye':bd.style.background=col;bd.style.borderRadius=c*.03+'px';bd.style.boxShadow=shade;if(!small)studAt(e,0,c,col,dk);
      {const ey=document.createElement('i');ey.className='eyeP';ey.style.height=W*.72+'px';ey.style.top=(H-W*.72)/2+'px';ey.innerHTML='<i></i>';e.appendChild(ey)}break;
    case 'arch':bd.style.background=col;bd.style.boxShadow=shade;
      bd.style.webkitMaskImage=bd.style.maskImage='radial-gradient(ellipse 25% 67% at 50% 100%,transparent 97%,#000 100%)';
      if(!small)for(let i=0;i<4;i++)studAt(e,i,c,col,dk);break;
    case 'invI':bd.style.background=`linear-gradient(45deg,${dk},${col} 55%)`;bd.style.clipPath='polygon(0 0,100% 0,100% 100%,50% 100%,0 33%)';if(!small)for(let i=0;i<2;i++)studAt(e,i,c,col,dk);break;
    case 'invD':bd.style.background=`linear-gradient(-45deg,${dk},${col} 55%)`;bd.style.clipPath='polygon(0 0,100% 0,100% 33%,50% 100%,0 100%)';if(!small)for(let i=0;i<2;i++)studAt(e,i,c,col,dk);break;
    case 'curveI':bd.style.background=`linear-gradient(160deg,#ffffff55,${col} 40%,${dk})`;bd.style.borderRadius='100% 0 0 0 / 100% 0 0 0';break;
    case 'curveD':bd.style.background=`linear-gradient(200deg,#ffffff55,${col} 40%,${dk})`;bd.style.borderRadius='0 100% 0 0 / 0 100% 0 0';break;
    case 'dome':bd.style.background=`radial-gradient(circle at 35% 30%,#ffffff88,${col} 35%,${dk})`;bd.style.borderRadius='50% 50% 4% 4% / 90% 90% 4% 4%';break;
    case 'cone':bd.style.background=`linear-gradient(90deg,${dk},${col} 35%,#ffffff70 50%,${col} 65%,${dk})`;bd.style.clipPath='polygon(30% 0,70% 0,100% 100%,0 100%)';break;
    case 'window':case 'door':{bd.style.background=col;bd.style.borderRadius=c*.03+'px';bd.style.boxShadow=shade;if(!small)for(let i=0;i<s.w;i++)studAt(e,i,c,col,dk);
      const g=document.createElement('i');g.className='inner';
      if(T.kind==='window')Object.assign(g.style,{left:'14%',right:'14%',top:'10%',bottom:'10%',background:'linear-gradient(135deg,#d8f0ffe0,#8cc8f0d0 60%,#bfe4ff)',
        backgroundImage:`linear-gradient(90deg,transparent 47%,${col} 47% 53%,transparent 53%),linear-gradient(transparent 47%,${col} 47% 53%,transparent 53%),linear-gradient(135deg,#e8f6ff,#8cc8f0 60%,#bfe4ff)`});
      else Object.assign(g.style,{left:'12%',right:'12%',top:'5%',bottom:'0',background:`linear-gradient(90deg,${dk},${col} 20%,${col} 80%,${dk})`,
        backgroundImage:`radial-gradient(circle at 80% 55%,#ffd84d 0 ${c*.18}px,transparent ${c*.2}px),linear-gradient(${dk},${dk}) 50% 12%/70% 2px no-repeat,linear-gradient(${dk},${dk}) 50% 42%/70% 2px no-repeat,linear-gradient(90deg,${dk},${col} 20%,${col} 80%,${dk})`,borderRadius:`${c*.25}px ${c*.25}px 0 0`});
      e.appendChild(g)}break;
    case 'fence':bd.style.background=`linear-gradient(${col},${col}) 0 0/100% 30% no-repeat,linear-gradient(${col},${col}) 0 70%/100% 18% no-repeat,repeating-linear-gradient(90deg,transparent 0 ${c*.32}px,${col} ${c*.32}px ${c*.68}px,transparent ${c*.68}px ${c}px)`;
      if(!small)for(let i=0;i<s.w;i++)studAt(e,i,c,col,dk);break;
    case 'face':bd.style.background=col;bd.style.borderRadius=c*.03+'px';bd.style.boxShadow=shade;if(!small)for(let i=0;i<s.w;i++)studAt(e,i,c,col,dk);
      {const f=document.createElement('i');f.className='inner';Object.assign(f.style,{left:'0',right:'0',top:'0',bottom:'0'});
       f.innerHTML='<svg viewBox="0 0 40 24" width="100%" height="100%" preserveAspectRatio="none"><circle cx="13" cy="9" r="2.6" fill="#1b1b1b"/><circle cx="27" cy="9" r="2.6" fill="#1b1b1b"/><path d="M11 14 Q20 22 29 14" stroke="#1b1b1b" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>';e.appendChild(f)}break;
    case 'flower':bd.style.background=`linear-gradient(90deg,transparent 42%,#2d9a3a 42% 58%,transparent 58%) 0 0/100% 100% no-repeat`;
      {const f=document.createElement('i');f.className='inner';const r=W*.95;Object.assign(f.style,{left:(W-r)/2+'px',top:'0',width:r+'px',height:r+'px',borderRadius:'50%',
        background:`radial-gradient(circle,#ffd84d 0 22%,transparent 24%),radial-gradient(circle at 50% 12%,${col} 0 26%,transparent 28%),radial-gradient(circle at 88% 40%,${col} 0 26%,transparent 28%),radial-gradient(circle at 74% 85%,${col} 0 26%,transparent 28%),radial-gradient(circle at 26% 85%,${col} 0 26%,transparent 28%),radial-gradient(circle at 12% 40%,${col} 0 26%,transparent 28%)`});
       const lf=document.createElement('i');lf.className='inner';Object.assign(lf.style,{left:'50%',width:W*.45+'px',height:H*.18+'px',bottom:H*.15+'px',background:'#2d9a3a',borderRadius:'0 100% 0 100%'});e.appendChild(lf);e.appendChild(f)}break;
    case 'bush':bd.style.background=`radial-gradient(circle at 25% 62%,${col} 0 30%,transparent 31%),radial-gradient(circle at 75% 62%,${col} 0 30%,transparent 31%),radial-gradient(circle at 50% 34%,${col} 0 34%,transparent 35%),radial-gradient(circle at 40% 30%,#ffffff40 0 10%,transparent 12%),linear-gradient(transparent 60%,${dk} 60%)`;break;
    case 'flag':bd.style.background=`linear-gradient(90deg,transparent 12%,#9a9ea2 12% 26%,transparent 26%)`;
      {const f=document.createElement('i');f.className='inner';Object.assign(f.style,{left:'26%',top:'4%',width:W*1.6+'px',height:H*.42+'px',background:`linear-gradient(${col},${dk})`,clipPath:'polygon(0 0,100% 50%,0 100%)'});e.appendChild(f)}break;
    case 'wheel':{
      // soporte de rueda (como la placa con eje de Lego): bloque gris con botones arriba y un eje donde entra la rueda
      const hc='#6f7478',hd='#4b4f53',hh=H*.42,D=Math.min(W*.94,H*.9);
      const hold=document.createElement('i');hold.className='inner';
      Object.assign(hold.style,{left:'4%',right:'4%',top:'0',height:hh+'px',background:hc,borderRadius:c*.03+'px',
        boxShadow:`inset 0 ${-Math.max(1,c*.08)}px 0 ${hd}, inset 0 ${Math.max(1,c*.05)}px 0 rgba(255,255,255,.3)`});
      const ax=document.createElement('i');ax.className='inner';
      Object.assign(ax.style,{left:(W/2-c*.18)+'px',width:c*.36+'px',top:hh*.5+'px',height:(H-D)/2+D/2-hh*.5+'px',background:`linear-gradient(90deg,${hd},#9a9ea2,${hd})`});
      e.insertBefore(ax,bd);e.insertBefore(hold,ax);
      if(!small)for(let i=0;i<s.w;i++)studAt(e,i,c,hc,hd);
      Object.assign(bd.style,{inset:'auto',left:(W-D)/2+'px',top:(H-D)+'px',width:D+'px',height:D+'px',borderRadius:'50%',
        background:`radial-gradient(circle,#5c6064 0 9%,#d8dadc 10% 20%,#9a9ea2 21% 31%,#d8dadc 32% 41%,#1c1d1f 43% 100%)`,boxShadow:'inset 0 0 0 2px #000'})}break;
  }
  return e;
}
function at(el,s,c,rows){el.style.left=s.x*c+'px';el.style.top=(rows-s.y-s.h)*c*PL+'px';return el}
function drawFigure(box,F,c){box.innerHTML='';box.style.width=F.cols*c+'px';box.style.height=F.rows*c*PL+'px';
  const fr=document.createDocumentFragment();F.steps.forEach(s=>fr.appendChild(at(pieceEl(s,c),s,c,F.rows)));box.appendChild(fr)}

