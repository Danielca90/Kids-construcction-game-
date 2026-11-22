// =====================================================================
//  MUNDO — minijuego tipo "mundo de bloques" pero con ladrillos tipo Lego, visto de lado.
//  Tocar un lugar: el personaje camina hasta allá (sube escalones de 1–2 ladrillos y baja solo).
//  Tocar un ladrillo: lo saca (va a la bandeja). Con un color escogido en la bandeja: tocar un hueco lo pone.
//  Bloques especiales: cofre (regala fichas y monedas), trampolín (salta alto), flor y estrellas.
//  El personaje es el títere que el niño armó en Personajes.
// =====================================================================
const MW_W=64,MW_H=22;
const MW_COL={g:['#4cb54a','#2d8a2c'],n:['#8a5a33','#5c3a1f'],k:['#a0a5a9','#6f7478'],x:['#3a3d40','#1c1d1f'],G:['#7fd35b','#4f9a36'],
  r:['#e63b2e','#a82015'],y:['#fac80a','#c99a00'],a:['#2f6fdb','#1d4a9e'],o:['#ff8a1f','#c96200'],m:['#ff6fae','#d63d82'],w:['#f4f4f4','#c8ccd0'],
  C:['#c8873a','#7a4a1a'],T:['#ff6fae','#d63d82']};
const MW_EN={g:'Green brick',n:'Brown brick',k:'Gray brick',G:'Leaf brick',r:'Red brick',y:'Yellow brick',a:'Blue brick',o:'Orange brick',m:'Pink brick',w:'White brick',C:'Treasure!',T:'Jump!'};
const MW_SOLID=c=>c&&c!=='.'&&c!=='F'&&c!=='S';
let mw=null;          // estado del mundo en juego
// ---------- crear un mundo nuevo ----------
function mwGen(){
  const H=[],cells=[];let h=13;
  for(let x=0;x<MW_W;x++){h+=Math.random()<.35?(Math.random()<.5?-1:1):0;h=Math.max(9,Math.min(15,h));H.push(h)}
  for(let i=1;i<MW_W-1;i++)H[i]=Math.round((H[i-1]+H[i]+H[i+1])/3);
  for(let y=0;y<MW_H;y++){let row='';for(let x=0;x<MW_W;x++){const t=H[x];
    row+=y===MW_H-1?'x':y<t?'.':y===t?'g':y<t+3?'n':(Math.random()<.07?'ryaom'[Math.random()*5|0]:'k')}cells.push(row.split(''))}
  const set=(x,y,c)=>{if(x>=0&&x<MW_W&&y>=0&&y<MW_H)cells[y][x]=c};
  for(let x=4;x<MW_W-4;x++){const t=H[x];
    if(Math.random()<.09&&x%3===0){for(let k=1;k<=3;k++)set(x,t-k,'n');for(let dx=-2;dx<=2;dx++)for(let dy=-6;dy<=-4;dy++)if(Math.abs(dx)+Math.abs(dy+5)<4)set(x+dx,t+dy,'G')}
    else if(Math.random()<.08)set(x,t-1,'F');
    else if(Math.random()<.035)set(x,t-1,'C');
    else if(Math.random()<.03)set(x,t-1,'T');
    if(Math.random()<.06)set(x,t-4-(Math.random()*2|0),'S')}
  const px=6;return{cells:cells.map(r=>r.join('')),px,pf:H[px]-1,inv:{r:3,y:3,a:3}}
}
function mwLoad(){if(!save.world||!save.world.cells||save.world.cells.length!==MW_H)save.world=mwGen();
  const W=save.world;return{grid:W.cells.map(r=>r.split('')),x:W.px,f:W.pf,dir:1,path:[],anim:null,inv:W.inv||{},sel:null,cam:{x:W.px,y:W.pf},act:null,t:0,img:null,parts:[],last:0}}
function mwStore(){if(!mw)return;save.world={cells:mw.grid.map(r=>r.join('')),px:Math.round(mw.x),pf:Math.round(mw.f),inv:mw.inv};persist()}
const mwAt=(x,y)=>x<0||x>=MW_W||y<0?'.':y>=MW_H?'x':mw.grid[y][x];
// ¿dónde quedan los pies si el personaje pasa a la columna x? (sube hasta 2 ladrillos, baja lo que sea)
function mwStand(x,f){if(x<0||x>=MW_W)return null;
  for(let ff=f;ff>=f-2;ff--){if(MW_SOLID(mwAt(x,ff))||MW_SOLID(mwAt(x,ff-1)))continue;
    if(ff<f&&(MW_SOLID(mwAt(Math.round(mw.x),ff))||MW_SOLID(mwAt(Math.round(mw.x),ff-1))))return null;   // no hay espacio para subir
    let g=ff;while(g<MW_H-1&&!MW_SOLID(mwAt(x,g+1)))g++;return g}
  return null}
function mwPathTo(tx){const path=[];let x=Math.round(mw.x),f=Math.round(mw.f);const d=Math.sign(tx-x);
  while(x!==tx){const nf=mwStand(x+d,f);if(nf===null)break;x+=d;f=nf;path.push([x,f])}return path}
// ---------- dibujo ----------
function mwSize(){const c=$('#mwCv'),r=$('#mwStage').getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);c.width=Math.max(10,r.width*d);c.height=Math.max(10,r.height*d);c.style.width=r.width+'px';c.style.height=r.height+'px';
  mw.s=Math.max(26,Math.min(c.height/11/1.2,c.width/9))}   // tamaño de un ladrillo (ancho); alto = 1,2 × ancho, como un Lego
function mwBrick(g,c,X,Y,s,h,top){const [col,dk]=MW_COL[c];
  if(c==='C'){g.fillStyle=col;g.fillRect(X+1,Y+h*.25,s-2,h*.75-1);g.fillStyle=dk;g.fillRect(X+1,Y+h*.5,s-2,h*.08);g.fillStyle='#ffd84d';g.fillRect(X+s*.42,Y+h*.45,s*.16,h*.2);
    g.fillStyle=col;g.beginPath();g.moveTo(X+1,Y+h*.3);g.quadraticCurveTo(X+s/2,Y-h*.05,X+s-1,Y+h*.3);g.fill();return}
  if(c==='T'){g.fillStyle='#7d8489';g.fillRect(X+s*.15,Y+h*.6,s*.7,h*.4);g.strokeStyle='#3a3d40';g.lineWidth=s*.06;g.beginPath();for(let i=0;i<4;i++){g.moveTo(X+s*.2,Y+h*(.62+i*.08));g.lineTo(X+s*.8,Y+h*(.66+i*.08))}g.stroke();
    g.fillStyle=col;g.fillRect(X+s*.05,Y+h*.45,s*.9,h*.18);g.fillStyle=dk;g.fillRect(X+s*.05,Y+h*.58,s*.9,h*.05);return}
  g.fillStyle=col;g.fillRect(X,Y,s,h);g.fillStyle=dk;g.fillRect(X,Y+h*.86,s,h*.14);g.fillStyle='rgba(255,255,255,.28)';g.fillRect(X,Y,s,h*.07);
  g.fillStyle='rgba(0,0,0,.12)';g.fillRect(X+s-1,Y,1,h);
  if(top){g.fillStyle=col;g.fillRect(X+s*.25,Y-h*.16,s*.5,h*.17);g.fillStyle='rgba(255,255,255,.3)';g.fillRect(X+s*.3,Y-h*.15,s*.12,h*.15);g.fillStyle=dk;g.fillRect(X+s*.25,Y-h*.02,s*.5,h*.03)}}
function mwDraw(){const c=$('#mwCv'),g=c.getContext('2d'),s=mw.s,h=s*1.2,W=c.width,Hh=c.height;
  mw.cam.x+=(mw.x-mw.cam.x)*.15;mw.cam.y+=(mw.f-2-mw.cam.y)*.12;
  const ox=W/2-(mw.cam.x+.5)*s,oy=Hh*.55-(mw.cam.y)*h;mw.ox=ox;mw.oy=oy;
  const sky=g.createLinearGradient(0,0,0,Hh);sky.addColorStop(0,'#8fd3ff');sky.addColorStop(1,'#e8f8ff');g.fillStyle=sky;g.fillRect(0,0,W,Hh);
  // nubes
  g.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<6;i++){const cx=((i*230-mw.cam.x*s*.3)%(W+300)+W+300)%(W+300)-150,cy=Hh*(.1+(i%3)*.08);g.beginPath();g.ellipse(cx,cy,s*1.6,s*.6,0,0,7);g.ellipse(cx+s,cy-s*.3,s,s*.6,0,0,7);g.fill()}
  const x0=Math.max(0,Math.floor(-ox/s)-1),x1=Math.min(MW_W-1,Math.ceil((W-ox)/s)+1),y0=Math.max(0,Math.floor(-oy/h)-1),y1=Math.min(MW_H-1,Math.ceil((Hh-oy)/h)+1);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const cc=mw.grid[y][x];const X=ox+x*s,Y=oy+y*h;
    if(cc==='F'){g.strokeStyle='#2d9a3a';g.lineWidth=s*.08;g.beginPath();g.moveTo(X+s/2,Y+h);g.lineTo(X+s/2,Y+h*.45);g.stroke();
      const sw=Math.sin(mw.t*3+x)*s*.05;g.fillStyle='#ff6fae';for(let k=0;k<5;k++){const a=k*1.256;g.beginPath();g.arc(X+s/2+sw+Math.cos(a)*s*.14,Y+h*.38+Math.sin(a)*s*.14,s*.11,0,7);g.fill()}
      g.fillStyle='#ffd84d';g.beginPath();g.arc(X+s/2+sw,Y+h*.38,s*.09,0,7);g.fill();continue}
    if(cc==='S'){const b=Math.sin(mw.t*4+x)*h*.06;g.save();g.translate(X+s/2,Y+h/2+b);g.rotate(Math.sin(mw.t*2+x)*.2);g.fillStyle='#ffd84d';g.strokeStyle='#c99a00';g.lineWidth=s*.05;g.beginPath();
      for(let k=0;k<10;k++){const r=k%2?s*.16:s*.36,a=Math.PI/5*k-Math.PI/2;k?g.lineTo(Math.cos(a)*r,Math.sin(a)*r):g.moveTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.stroke();g.restore();continue}
    if(!MW_SOLID(cc))continue;
    mwBrick(g,cc,X,Y,s,h,!MW_SOLID(mwAt(x,y-1)))}
  // selección: hueco donde se pondría el ladrillo
  if(mw.hover){const [hx,hy]=mw.hover;g.strokeStyle='rgba(255,255,255,.9)';g.setLineDash([s*.15,s*.1]);g.lineWidth=s*.06;g.strokeRect(ox+hx*s+2,oy+hy*h+2,s-4,h-4);g.setLineDash([])}
  // personaje
  const a=mw.anim;let px=mw.x,pf=mw.f,hop=0;
  if(a){const k=Math.min(1,(performance.now()-a.t0)/a.dur);px=a.x0+(a.x1-a.x0)*k;pf=a.f0+(a.f1-a.f0)*k;hop=a.big?Math.sin(k*Math.PI)*a.big:(a.f1<a.f0?Math.sin(k*Math.PI)*.6:Math.abs(Math.sin(k*Math.PI))*.12)}
  if(mw.img&&mw.img.complete){const ih=h*2.35,iw=ih*260/505,cx=ox+(px+.5)*s,feet=oy+(pf+1)*h-hop*h;
    g.save();g.translate(cx,feet);g.scale(mw.dir,1);g.rotate(a&&!a.big?Math.sin(performance.now()/70)*.06:0);
    g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.ellipse(0,hop*h,iw*.32,h*.08,0,0,7);g.fill();
    g.drawImage(mw.img,-iw/2,-ih*0.985,iw,ih);g.restore()}
  // chispitas
  mw.parts=mw.parts.filter(p=>{p.vy+=.5;p.x+=p.vx;p.y+=p.vy;p.l--;g.fillStyle=p.c;g.fillRect(p.x,p.y,s*.18,s*.12);return p.l>0});
}
function mwBurst(x,y,col){const s=mw.s,h=s*1.2;for(let i=0;i<14;i++)mw.parts.push({x:mw.ox+(x+.5)*s,y:mw.oy+(y+.5)*h,vx:(Math.random()-.5)*s*.4,vy:-Math.random()*s*.35,c:col,l:30})}
// ---------- bucle ----------
function mwLoop(ts){if(screen!=='world'){mw.running=false;return}
  mw.t=ts/1000;
  if(mw.anim&&performance.now()-mw.anim.t0>=mw.anim.dur){const a=mw.anim;mw.anim=null;mw.x=a.x1;mw.f=a.f1;mwLanded()}
  if(!mw.anim&&mw.path.length){const [nx,nf]=mw.path.shift();mw.dir=nx>mw.x?1:nx<mw.x?-1:mw.dir;
    mw.anim={x0:mw.x,f0:mw.f,x1:nx,f1:nf,t0:performance.now(),dur:nf<mw.f?260:170+Math.max(0,nf-mw.f)*40};if(nf<mw.f)tone(600,0,.06,'sine',.05)}
  if(!mw.anim&&!mw.path.length&&mw.act){const A=mw.act;mw.act=null;A()}
  mwDraw();requestAnimationFrame(mwLoop)}
function mwLanded(){const x=Math.round(mw.x),f=Math.round(mw.f);
  for(const yy of [f,f-1])if(mwAt(x,yy)==='S'){mw.grid[yy][x]='.';save.coins=(save.coins||0)+1;sCoin();mwBurst(x,yy,'#ffd84d');say('Star!');mwHud();mwStore()}
  if(mwAt(x,f+1)==='T'&&!mw.path.length){let top=f;for(let k=1;k<=4;k++){if(MW_SOLID(mwAt(x,f-k-1)))break;top=f-k}
    if(top<f){tone(300,0,.1,'square',.08);tone(700,.08,.2,'triangle',.12);say('Boing!');mw.anim={x0:x,f0:f,x1:x,f1:f,t0:performance.now(),dur:650,big:f-top+.5}}}}
// ---------- tocar ----------
function mwCell(e){const r=$('#mwCv').getBoundingClientRect(),d=$('#mwCv').width/r.width,s=mw.s,h=s*1.2;return[Math.floor(((e.clientX-r.left)*d-mw.ox)/s),Math.floor(((e.clientY-r.top)*d-mw.oy)/h)]}
const mwNear=(x,y)=>Math.abs(x-Math.round(mw.x))<=2&&y>=Math.round(mw.f)-3&&y<=Math.round(mw.f)+2;
function mwGoNear(x,then){let best=null;for(const dx of [-1,1,-2,2,0]){const tx=x+dx;if(tx<0||tx>=MW_W)continue;const p=mwPathTo(tx),end=p.length?p[p.length-1][0]:Math.round(mw.x);
    if(end===tx&&(best===null||p.length<best.length))best=p}
  if(best===null)best=mwPathTo(x);mw.path=best;mw.act=then}
function mwTap(e){if(!mw)return;ac();const [x,y]=mwCell(e);if(x<0||x>=MW_W||y<0||y>=MW_H)return;const c=mwAt(x,y);
  const doIt=()=>{
    if(!mwNear(x,y)){sPop();return}
    const cc=mwAt(x,y);
    if(cc==='C'){mw.grid[y][x]='.';const ks='ryaomw';for(let i=0;i<3;i++){const k=ks[Math.random()*ks.length|0];mw.inv[k]=(mw.inv[k]||0)+1}save.coins=(save.coins||0)+2;
      sFan();confetti();mwBurst(x,y,'#ffd84d');say('Treasure!');mwHud();mwStore();return}
    if(cc==='F'){tone(880,0,.15,'sine',.1);tone(1175,.1,.2,'sine',.1);mwBurst(x,y,'#ff6fae');say('Flower!');return}
    if(MW_SOLID(cc)){if(cc==='x'){shakeBoard&&0;sPop();return}
      mw.grid[y][x]='.';const k=cc==='T'?null:cc;if(k){mw.inv[k]=(mw.inv[k]||0)+1}click();tone(420+Math.random()*120,0,.08,'triangle',.12);buzz(10);mwBurst(x,y,MW_COL[cc][0]);
      word(MW_EN[cc]||'Brick','#fff',$('#mwStage'));if(Math.random()<.5)say(MW_EN[cc]||'Brick');mwHud();mwStore();return}
    // poner un ladrillo en el hueco (que no tape al personaje)
    if(mw.sel&&(mw.inv[mw.sel]||0)>0){const px=Math.round(mw.x),pf=Math.round(mw.f);if(x===px&&(y===pf||y===pf-1)){sPop();return}
      mw.grid[y][x]=mw.sel;mw.inv[mw.sel]--;sSnap();buzz(12);mwBurst(x,y,MW_COL[mw.sel][0]);mwHud();mwStore()}};
  const solid=MW_SOLID(c)||c==='F';
  if(solid||(mw.sel&&(mw.inv[mw.sel]||0)>0)){if(mwNear(x,y)){mw.path=[];mw.act=doIt}else mwGoNear(x,doIt);return}
  // tocar un hueco con la mano: caminar hasta allá
  mw.act=null;mw.path=mwPathTo(x);if(!mw.path.length)sPop();else sTap()}
function mwHud(){const H=$('#mwBar');const ks=['g','n','k','G','r','y','a','o','m','w'];
  H.innerHTML=`<button class="mwb${mw.sel?'':' on'}" data-k="">✋</button>`+ks.filter(k=>(mw.inv[k]||0)>0||mw.sel===k).map(k=>`<button class="mwb${mw.sel===k?' on':''}" data-k="${k}" style="background:${MW_COL[k][0]}"><i>${mw.inv[k]||0}</i></button>`).join('');
  $('#mwCoins').textContent='🪙 '+(save.coins||0)}
function mwCharImg(){const ch=(save.char&&save.char.v===2&&save.char.head)?save.char:{v:2,head:'circulo',face:'feliz',hat:'gorra',body:'rect',ropa:'estrella',arms:'recto',legs:'recto',col:{head:'#f6d2b5',body:'#e63b2e',arms:'#2f6fdb',legs:'#2f6fdb'},pose:CH_REST};
  const c2=Object.assign({},ch,{acc:null,pose:CH_REST}),img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(chSVG(c2));return img}
function renderWorld(){if(!mw)mw=mwLoad();mw.img=mwCharImg();mwSize();mwHud();if(!mw.running){mw.running=true;requestAnimationFrame(mwLoop)}}
$('#goWorld').addEventListener('click',()=>{ac();sTap();show('world');say("Let's build!")});
$('#mwBack').addEventListener('pointerdown',()=>{ac();mwStore();show('home')});
$('#mwCv').addEventListener('pointerdown',e=>{e.preventDefault();mwTap(e)});
$('#mwBar').addEventListener('click',e=>{const b=e.target.closest('.mwb');if(!b)return;ac();sTap();mw.sel=b.dataset.k||null;if(mw.sel)say(MW_EN[mw.sel]);mwHud()});
let mwSure=false;
$('#mwNew').addEventListener('click',()=>{ac();if(!mwSure){mwSure=true;$('#mwNew').textContent='❓';setTimeout(()=>{mwSure=false;$('#mwNew').textContent='🌍'},2500);return}
  mwSure=false;$('#mwNew').textContent='🌍';save.world=mwGen();const run=mw&&mw.running;mw=mwLoad();mw.running=run;renderWorld();sFan();say('New world!')});
