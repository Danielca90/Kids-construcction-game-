// ================== INGLÉS: palabras en pantalla y voz ==================
// Usa la voz en inglés que trae el iPad/iPhone (funciona sin internet).
const EN_COL={r:'red',y:'yellow',b:'light blue',o:'orange',g:'green',n:'brown',w:'white',p:'purple',k:'gray',m:'pink',a:'blue',x:'black',
  L:'lime',D:'dark green',C:'tan',M:'magenta',B:'dark blue',R:'dark red',T:'clear',U:'clear blue',V:'clear red',Y:'clear yellow'};
const colName=c=>EN_COL[c]||'my color';
const EN_SH={ve:'window',pu:'door',va:'fence',fl:'flower',mt:'bush',do:'dome',cn:'cone',cara:'happy face',ba:'flag',rg:'big wheel',ar6:'big arch',cI:'curve',cD:'curve'};
function enShape(k){if(EN_SH[k])return EN_SH[k];if(k[0]==='b')return'brick';if(k[0]==='p')return'plate';if(k[0]==='t')return'tile';if(k==='ri')return'roof';
  if(k[0]==='s'||k[0]==='q')return'slope';if(k==='rd')return'round brick';if(k==='ojo')return'eye';if(k==='ar')return'arch';if(k==='ru')return'wheel';return'brick'}
const PRAISE=['Good job!','Great!','Awesome!','Well done!','Super!','Nice!'];
let enVoice=null;
function pickVoice(){try{const vs=speechSynthesis.getVoices();
  enVoice=vs.find(v=>/en[-_]US/i.test(v.lang)&&/Samantha|Ava|Allison|Google US English|Karen/i.test(v.name))||vs.find(v=>/en[-_]US/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null}catch(e){}}
try{pickVoice();speechSynthesis.onvoiceschanged=pickVoice}catch(e){}
function say(text,queue){if(save.muted||save.noEnglish)return;
  try{const u=new SpeechSynthesisUtterance(text);u.lang='en-US';if(enVoice)u.voice=enVoice;u.rate=.85;u.pitch=1.15;
    if(!queue)speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
function word(text,color,where){if(save.noEnglish)return;const host=where||$('#stage');host.querySelectorAll('.word').forEach(w=>w.remove());const d=document.createElement('div');d.className='word';
  d.textContent=text;d.style.color=color||'#fff';host.appendChild(d);setTimeout(()=>d.remove(),1800)}
const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);

// La voz siempre arranca activada al abrir el juego (se puede quitar en el panel, pero vuelve al abrir).
save.noEnglish=false;
// iPad/iPhone solo dejan hablar si la primera voz sale de un toque: al primer toque se "despierta" la voz en silencio.
let voiceReady=false;
function wakeVoice(){if(voiceReady)return;voiceReady=true;
  try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;u.lang='en-US';speechSynthesis.speak(u);pickVoice()}catch(e){}}
document.addEventListener('pointerdown',wakeVoice,{capture:true});
document.addEventListener('touchend',wakeVoice,{capture:true,once:true});
