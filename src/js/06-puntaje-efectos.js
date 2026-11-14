// ================== PUNTAJE EN RACHA (estilo baile) ==================
// acierto: 10 pts × multiplicador (×2 desde 3 seguidos, ×3 desde 6, ×4 desde 10); error: -15 y se corta la racha
const multOf=k=>k>=10?4:k>=6?3:k>=3?2:1;
function ptsPop(txt,x,y,bad){const d=document.createElement('div');d.className='pts'+(bad?' bad':'');d.textContent=txt;d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),1050)}
function updScore(bump){
  $('#scorePill').textContent='🎯 '+(st.score||0);
  let c=$('#stage').querySelector('.combo');
  const k=st.streak||0;
  if(k>=3){if(!c){c=document.createElement('div');c.className='combo';$('#stage').appendChild(c)}
    c.textContent=`🔥 ×${multOf(k)} · ${k}`;if(bump){c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump')}}
  else if(c)c.remove();
}
function scoreHit(el){
  st.streak=(st.streak||0)+1;const m=multOf(st.streak),pts=10*m;st.score=(st.score||0)+pts;
  const r=el?el.getBoundingClientRect():stage.getBoundingClientRect();ptsPop('+'+pts,r.left+r.width/2,r.top-10);
  const mile={3:'Great!',6:'Awesome!',10:'Perfect!',15:'Super star!',20:'Amazing!'}[st.streak];
  if(mile){setTimeout(()=>{say(mile,true)},200);setTimeout(()=>word(mile.toUpperCase(),'#ffd84d'),650);sFan()}
  updScore(true);
}
function scoreMiss(t){
  const lost=Math.min(15,st.score||0);st.score=(st.score||0)-lost;st.streak=0;
  const r=t.getBoundingClientRect();ptsPop(lost?'-'+lost:'Miss',r.left+r.width/2,r.top,true);updScore(false);
}

// ================== EFECTOS DE ENCAJE ==================
function sparks(x,y,color,n=10){
  for(let i=0;i<n;i++){const d=document.createElement('div');d.className='spark';d.style.background=i%3?color:'#fff';
    d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);
    const ang=Math.PI+Math.random()*Math.PI,dist=30+Math.random()*50;
    const an=d.animate([{transform:'translate(0,0) scale(1) rotate(0)',opacity:1},
      {transform:`translate(${Math.cos(ang)*dist}px,${Math.sin(ang)*dist}px) scale(.3) rotate(${Math.random()*360}deg)`,opacity:0}],
      {duration:450+Math.random()*250,easing:'cubic-bezier(.2,.7,.4,1)'});
    an.onfinish=()=>d.remove()}}
function shakeBoard(){board.classList.remove('shake');void board.offsetWidth;board.classList.add('shake')}

