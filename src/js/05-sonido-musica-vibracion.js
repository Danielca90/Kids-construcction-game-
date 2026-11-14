// ================== SONIDO ==================
let AC;
function ac(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state!=='running')AC.resume()}catch(e){}return AC}
function tone(f,t0,d,type='triangle',v=.22){if(save.muted)return;const a=ac();if(!a)return;const t=a.currentTime+t0,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.05)}
let noiseBuf=null;
function click(v=.35){const a=ac();if(!a||save.muted)return;try{
  if(!noiseBuf){noiseBuf=a.createBuffer(1,a.sampleRate*.05,a.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,6)}
  const src=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();src.buffer=noiseBuf;f.type='bandpass';f.frequency.value=2600;f.Q.value=1.2;g.gain.value=v;
  src.connect(f).connect(g).connect(a.destination);src.start()}catch(e){}}
const SCALE=[523,587,659,784,880,1047,1175,1319,1568,1760];
let combo=0;
const sSnap=()=>{click();tone(SCALE[Math.min(combo,SCALE.length-1)],.02,.22,'triangle',.2);tone(SCALE[Math.min(combo,SCALE.length-1)]*1.5,.06,.18,'sine',.06)};
const sWhoosh=()=>tone(400,0,.25,'sine',.08);
const sTap=()=>tone(880,0,.08,'sine',.12);
const sBag=()=>{tone(523,0,.15);tone(784,.12,.25)};
const sRip=()=>{tone(300,0,.12,'sawtooth',.06);tone(900,.08,.2,'triangle',.15)};
const sPop=()=>tone(260,0,.12,'sine',.15);
const sFan=()=>{[523,659,784,1047].forEach((f,i)=>tone(f,i*.13,.3));tone(1319,.6,.7)};
function updSnd(){document.querySelectorAll('.snd').forEach(b=>b.textContent=save.muted?'🔇':'🔊')}
document.querySelectorAll('.snd').forEach(b=>b.addEventListener('pointerdown',()=>{save.muted=!save.muted;persist();updSnd();ac()}));

// ================== MÚSICA DE FONDO (caja musical, hecha con el navegador) ==================
const NOTE={G4:392,A4:440,C5:523.25,D5:587.33,E5:659.25,G5:783.99,A5:880,C3:130.81,F3:174.61,G2:98,A2:110,G3:196};
const MEL=['C5','E5','G5','E5','D5','E5','C5',0,'A4','C5','D5','C5','G4','A4','C5',0,
           'C5','E5','G5','A5','G5','E5','D5',0,'E5','D5','C5','A4','C5',0,0,0];
const BASS=['C3','C3','A2','G2','C3','F3','G3','C3'];
let mTimer=null,mStep=0;
function musicTick(){
  if(save.muted||save.music===false||document.hidden)return;
  const a=ac();if(!a)return;
  const n=MEL[mStep%MEL.length];
  if(n){tone(NOTE[n],0,.45,'sine',.05);tone(NOTE[n]*2,0,.25,'sine',.012)}
  if(mStep%4===0)tone(NOTE[BASS[(mStep/4|0)%BASS.length]],0,1.1,'triangle',.04);
  mStep++;
}
function startMusic(){if(!mTimer)mTimer=setInterval(musicTick,320)}
function updMus(){document.querySelectorAll('.mus').forEach(b=>b.classList.toggle('off',save.music===false))}
document.addEventListener('pointerdown',()=>{ac();startMusic()},{passive:true});
document.querySelectorAll('.mus').forEach(b=>b.addEventListener('pointerdown',ev=>{ev.stopPropagation();ac();startMusic();
  save.music=save.music===false;persist();updMus()}));

// ================== VIBRACIÓN ==================
// Android: navigator.vibrate. iPhone con iOS 18+: truco del interruptor (input switch) que da un toque háptico.
// Los iPad no tienen motor de vibración.
let hapLabel=null;
function buzz(ms=15){
  if(save.noHaptic)return;
  try{if(navigator.vibrate){navigator.vibrate(ms);return}}catch(e){}
  try{if(!hapLabel){const i=document.createElement('input');i.type='checkbox';i.setAttribute('switch','');i.id='hap';
      hapLabel=document.createElement('label');hapLabel.htmlFor='hap';
      const box=document.createElement('div');box.style.cssText='position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none';
      box.append(i,hapLabel);document.body.appendChild(box)}
    hapLabel.click()}catch(e){}
}

