// =====================================================================
//  PERSONAJES — minijuego: armar un muñequito arrastrando partes con el dedo
//  (cabeza, pelo/sombrero, cuerpo/ropa, brazos, piernas y una cosa en la mano).
//  Todo se dibuja en SVG (lienzo 240 x 430). Cada parte cae sola en su lugar (imán).
// =====================================================================
const SKINS=['#f6d2b5','#e8b08a','#c98a5e','#8d5a3b','#5c3a24'];
const HAND_N={x:194,y:268},HAND_UP={x:206,y:142};
const CH_TORSO='M64 292 L70 180 Q72 166 88 165 L152 165 Q168 166 170 180 L176 292 Z';
const chEye=(x,y,r=7)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#222"/><circle cx="${x+2}" cy="${y-2}" r="${r*.3}" fill="#fff"/>`;
const chHead=(c,inner)=>`<rect x="106" y="146" width="28" height="24" fill="${c}"/><rect x="65" y="48" width="110" height="104" rx="30" fill="${c}" stroke="rgba(0,0,0,.12)" stroke-width="2"/>${inner}`;
const chCheeks='<circle cx="84" cy="116" r="8" fill="#ff8fa3" opacity=".55"/><circle cx="156" cy="116" r="8" fill="#ff8fa3" opacity=".55"/>';
// ---------- catálogo de partes ----------
const PARTS={
  head:[
    {id:'feliz',en:'Happy',c:null,draw:c=>chHead(c,chEye(98,95)+chEye(142,95)+chCheeks+'<path d="M95 118 Q120 142 145 118" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/>')},
    {id:'sorpresa',en:'Surprised',c:null,draw:c=>chHead(c,chEye(98,92,8)+chEye(142,92,8)+'<ellipse cx="120" cy="125" rx="9" ry="12" fill="#7a2a2a"/>')},
    {id:'risa',en:'Laughing',c:null,draw:c=>chHead(c,'<path d="M88 96 Q98 84 108 96 M132 96 Q142 84 152 96" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/>'+chCheeks+'<path d="M94 112 Q120 112 146 112 Q140 140 120 140 Q100 140 94 112 Z" fill="#7a2a2a"/><path d="M104 130 Q120 124 136 130 Q128 140 120 140 Q112 140 104 130Z" fill="#ff7a90"/>')},
    {id:'dormido',en:'Sleepy',c:null,draw:c=>chHead(c,'<path d="M88 94 Q98 104 108 94 M132 94 Q142 104 152 94" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M110 122 Q120 130 130 122" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/><text x="158" y="62" font-size="20" font-weight="900" fill="#5d86a0">z</text>')},
    {id:'travieso',en:'Silly',c:null,draw:c=>chHead(c,chEye(98,95)+'<path d="M132 96 Q142 88 152 96" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/>'+chCheeks+'<path d="M95 116 Q120 140 145 116" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M114 126 Q120 146 128 126" fill="#ff7a90" stroke="#d94a64" stroke-width="2"/>')},
    {id:'robot',en:'Robot',c:'#b6bcc1',draw:c=>`<line x1="120" y1="48" x2="120" y2="22" stroke="#7d8489" stroke-width="5"/><circle cx="120" cy="18" r="8" fill="#e63b2e"/>`+chHead(c,'<rect x="84" y="82" width="26" height="22" rx="4" fill="#3fd0ff" stroke="#24506b" stroke-width="3"/><rect x="130" y="82" width="26" height="22" rx="4" fill="#3fd0ff" stroke="#24506b" stroke-width="3"/><rect x="92" y="118" width="56" height="18" rx="4" fill="#fff" stroke="#24506b" stroke-width="3"/><path d="M106 118 V136 M120 118 V136 M134 118 V136" stroke="#24506b" stroke-width="3"/>')},
    {id:'gato',en:'Cat',c:'#f6a04d',draw:c=>`<path d="M68 70 L72 26 L104 52 Z M172 70 L168 26 L136 52 Z" fill="${c}" stroke="rgba(0,0,0,.12)" stroke-width="2"/><path d="M76 58 L78 38 L94 52 Z M164 58 L162 38 L146 52 Z" fill="#ffb3c1"/>`+chHead(c,'<ellipse cx="98" cy="94" rx="8" ry="10" fill="#3a9a3a"/><ellipse cx="142" cy="94" rx="8" ry="10" fill="#3a9a3a"/><ellipse cx="98" cy="94" rx="3" ry="8" fill="#111"/><ellipse cx="142" cy="94" rx="3" ry="8" fill="#111"/><path d="M114 112 L126 112 L120 120 Z" fill="#ff7a90"/><path d="M120 120 Q112 130 104 124 M120 120 Q128 130 136 124" stroke="#222" stroke-width="3" fill="none"/><path d="M70 112 L96 116 M70 124 L96 120 M170 112 L144 116 M170 124 L144 120" stroke="#222" stroke-width="2"/>')},
    {id:'monstruo',en:'Monster',c:'#7cc75b',draw:c=>`<path d="M80 54 L86 30 L96 52 Z M144 52 L154 30 L160 54 Z" fill="#fff6c9" stroke="#c9b23a" stroke-width="2"/>`+chHead(c,'<circle cx="120" cy="92" r="20" fill="#fff"/><circle cx="124" cy="94" r="9" fill="#5b2a86"/><circle cx="127" cy="91" r="3" fill="#fff"/><path d="M92 122 Q120 146 148 122 Z" fill="#5a1e1e"/><path d="M100 124 L106 132 L112 126 L120 134 L128 126 L134 132 L140 124" fill="#fff"/>')}
  ],
  hat:[
    {id:'corto',en:'Hair',draw:()=>'<path d="M62 94 Q58 38 120 36 Q182 38 178 94 Q172 66 150 62 Q120 76 90 62 Q70 66 62 94 Z" fill="#6b3e1f"/>'},
    {id:'largo',en:'Long hair',draw:()=>'<path d="M58 160 L58 86 Q58 34 120 34 Q182 34 182 86 L182 160 Q166 140 166 96 Q150 66 120 70 Q90 66 74 96 Q74 140 58 160 Z" fill="#f2c94c"/>'},
    {id:'coletas',en:'Pigtails',draw:()=>'<circle cx="50" cy="96" r="22" fill="#2b2b2b"/><circle cx="190" cy="96" r="22" fill="#2b2b2b"/><path d="M62 92 Q60 38 120 36 Q180 38 178 92 Q160 60 120 64 Q80 60 62 92 Z" fill="#2b2b2b"/><circle cx="64" cy="82" r="7" fill="#ff6fae"/><circle cx="176" cy="82" r="7" fill="#ff6fae"/>'},
    {id:'gorra',en:'Cap',draw:()=>'<path d="M62 82 Q62 30 120 30 Q178 30 178 82 Z" fill="#e63b2e"/><ellipse cx="154" cy="82" rx="50" ry="10" fill="#a82015"/><circle cx="120" cy="30" r="6" fill="#a82015"/>'},
    {id:'corona',en:'Crown',draw:()=>'<path d="M72 64 L72 22 L92 42 L106 14 L120 40 L134 14 L148 42 L168 22 L168 64 Z" fill="#ffd84d" stroke="#c99a00" stroke-width="3"/><circle cx="96" cy="54" r="5" fill="#e63b2e"/><circle cx="120" cy="52" r="6" fill="#2f6fdb"/><circle cx="144" cy="54" r="5" fill="#4cb54a"/>'},
    {id:'bombero',en:'Helmet',draw:()=>'<ellipse cx="120" cy="74" rx="76" ry="13" fill="#a82015"/><path d="M66 76 Q66 22 120 22 Q174 22 174 76 Z" fill="#e63b2e"/><path d="M120 24 V74" stroke="#a82015" stroke-width="6"/><circle cx="120" cy="52" r="11" fill="#ffd84d" stroke="#c99a00" stroke-width="2"/>'},
    {id:'chef',en:'Chef hat',draw:()=>'<circle cx="90" cy="38" r="24" fill="#fff" stroke="#d6dade" stroke-width="2"/><circle cx="150" cy="38" r="24" fill="#fff" stroke="#d6dade" stroke-width="2"/><circle cx="120" cy="26" r="28" fill="#fff" stroke="#d6dade" stroke-width="2"/><rect x="76" y="44" width="88" height="26" rx="6" fill="#fff" stroke="#d6dade" stroke-width="2"/>'},
    {id:'astronauta',en:'Space helmet',draw:()=>'<circle cx="120" cy="100" r="80" fill="rgba(170,215,255,.28)" stroke="#e8edf1" stroke-width="9"/><path d="M76 64 Q92 40 120 36" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>'}
  ],
  body:[
    {id:'estrella',en:'Red shirt',draw:()=>`<path d="${CH_TORSO}" fill="#e63b2e"/><path d="M120 200 L128 222 L151 222 L132 236 L139 258 L120 244 L101 258 L108 236 L89 222 L112 222 Z" fill="#ffd84d"/>`},
    {id:'rayas',en:'Striped shirt',draw:()=>`<defs><clipPath id="CHC"><path d="${CH_TORSO}"/></clipPath></defs><path d="${CH_TORSO}" fill="#2f6fdb"/><g clip-path="url(#CHC)" fill="#fff"><rect x="60" y="190" width="120" height="13"/><rect x="60" y="220" width="120" height="13"/><rect x="60" y="250" width="120" height="13"/></g>`},
    {id:'vestido',en:'Dress',draw:()=>'<path d="M54 312 L74 178 Q76 166 90 165 L150 165 Q164 166 166 178 L186 312 Z" fill="#ff6fae"/><circle cx="96" cy="230" r="6" fill="#fff"/><circle cx="140" cy="214" r="6" fill="#fff"/><circle cx="120" cy="270" r="6" fill="#fff"/><circle cx="82" cy="290" r="6" fill="#fff"/><circle cx="158" cy="282" r="6" fill="#fff"/><path d="M88 165 Q120 190 152 165" stroke="#d63d82" stroke-width="5" fill="none"/>'},
    {id:'heroe',en:'Superhero',draw:()=>`<path d="M80 170 L40 340 L200 340 L160 170 Z" fill="#e63b2e"/><path d="${CH_TORSO}" fill="#2f6fdb"/><circle cx="120" cy="218" r="24" fill="#ffd84d"/><path d="M124 200 L108 222 L120 222 L114 238 L132 214 L120 214 Z" fill="#e63b2e"/><rect x="66" y="270" width="108" height="12" fill="#ffd84d"/>`},
    {id:'bombero',en:'Firefighter',draw:()=>`<path d="${CH_TORSO}" fill="#e0a526"/><rect x="66" y="226" width="108" height="10" fill="#c9ccce"/><rect x="66" y="260" width="110" height="10" fill="#c9ccce"/><path d="M120 166 V292" stroke="#7a5a10" stroke-width="4"/><circle cx="110" cy="196" r="4" fill="#7a5a10"/><circle cx="110" cy="248" r="4" fill="#7a5a10"/>`},
    {id:'doctor',en:'Doctor',draw:()=>`<path d="${CH_TORSO}" fill="#fff" stroke="#d6dade" stroke-width="3"/><path d="M104 166 L120 200 L136 166 Z" fill="#9fd8f2"/><path d="M104 166 L112 230 M136 166 L128 230" stroke="#c9ccce" stroke-width="4"/><rect x="138" y="214" width="26" height="26" rx="4" fill="#fff" stroke="#d6dade" stroke-width="2"/><path d="M151 219 V235 M143 227 H159" stroke="#e63b2e" stroke-width="5"/>`},
    {id:'astronauta',en:'Space suit',draw:()=>`<path d="${CH_TORSO}" fill="#f4f4f4" stroke="#c9ccce" stroke-width="3"/><rect x="94" y="196" width="52" height="40" rx="6" fill="#7d8489"/><circle cx="108" cy="212" r="6" fill="#e63b2e"/><circle cx="124" cy="212" r="6" fill="#ffd84d"/><circle cx="138" cy="224" r="5" fill="#4cb54a"/><rect x="104" y="224" width="22" height="6" rx="3" fill="#3fd0ff"/>`},
    {id:'overol',en:'Overalls',draw:()=>`<path d="${CH_TORSO}" fill="#ffd84d"/><rect x="88" y="206" width="64" height="86" rx="6" fill="#3a6fb5"/><path d="M92 210 L80 168 M148 210 L160 168" stroke="#3a6fb5" stroke-width="10" stroke-linecap="round"/><circle cx="96" cy="216" r="5" fill="#ffd84d"/><circle cx="144" cy="216" r="5" fill="#ffd84d"/><rect x="104" y="236" width="32" height="22" rx="4" fill="#2d5a96"/>`}
  ],
  arms:[
    {id:'rojo',en:'Red arms',col:'#e63b2e'},{id:'azul',en:'Blue arms',col:'#2f6fdb'},{id:'verde',en:'Green arms',col:'#4cb54a'},
    {id:'amarillo',en:'Yellow arms',col:'#fac80a'},{id:'saludo',en:'Waving',col:'#ff8a1f',up:true},{id:'robot',en:'Robot arms',col:'#9aa1a6',robot:true}
  ],
  legs:[
    {id:'azul',en:'Blue pants',draw:s=>'<rect x="78" y="286" width="40" height="112" rx="8" fill="#2f6fdb"/><rect x="122" y="286" width="40" height="112" rx="8" fill="#2f6fdb"/><rect x="78" y="286" width="84" height="22" rx="6" fill="#2f6fdb"/>'+chShoes('#272a2d')},
    {id:'cafe',en:'Brown pants',draw:s=>'<rect x="78" y="286" width="40" height="112" rx="8" fill="#7c4e2a"/><rect x="122" y="286" width="40" height="112" rx="8" fill="#7c4e2a"/><rect x="78" y="286" width="84" height="22" rx="6" fill="#7c4e2a"/>'+chShoes('#e63b2e')},
    {id:'shorts',en:'Shorts',draw:s=>`<rect x="84" y="320" width="28" height="80" fill="${s}"/><rect x="128" y="320" width="28" height="80" fill="${s}"/><path d="M76 286 H164 L166 334 H124 L120 312 L116 334 H74 Z" fill="#4cb54a"/>`+chShoes('#2f6fdb')},
    {id:'falda',en:'Skirt',draw:s=>`<rect x="86" y="320" width="26" height="80" fill="${s}"/><rect x="128" y="320" width="26" height="80" fill="${s}"/><path d="M80 286 H160 L176 340 H64 Z" fill="#8a4fc7"/><path d="M72 330 H168" stroke="#b07fe8" stroke-width="5"/>`+chShoes('#ff6fae')},
    {id:'botas',en:'Rain boots',draw:s=>'<rect x="78" y="286" width="40" height="80" rx="8" fill="#3a6fb5"/><rect x="122" y="286" width="40" height="80" rx="8" fill="#3a6fb5"/><rect x="78" y="286" width="84" height="22" rx="6" fill="#3a6fb5"/><path d="M76 356 H120 V398 Q120 410 108 410 H70 Q66 410 66 402 Q66 392 76 390 Z M124 356 H168 V390 Q178 392 178 402 Q178 410 172 410 H136 Q124 410 124 398 Z" fill="#ffd84d" stroke="#c99a00" stroke-width="2"/>'},
    {id:'robot',en:'Robot legs',draw:s=>'<rect x="84" y="286" width="30" height="110" rx="4" fill="#9aa1a6"/><rect x="126" y="286" width="30" height="110" rx="4" fill="#9aa1a6"/><circle cx="99" cy="340" r="9" fill="#6f7478"/><circle cx="141" cy="340" r="9" fill="#6f7478"/><rect x="74" y="392" width="46" height="18" rx="4" fill="#6f7478"/><rect x="120" y="392" width="46" height="18" rx="4" fill="#6f7478"/>'}
  ],
  acc:[
    {id:'globo',en:'Balloon',draw:(h)=>`<path d="M${h.x} ${h.y} Q${h.x+30} ${h.y-70} ${h.x+14} ${h.y-120}" stroke="#555" stroke-width="2" fill="none"/><ellipse cx="${h.x+14}" cy="${h.y-150}" rx="26" ry="32" fill="#e63b2e"/><ellipse cx="${h.x+5}" cy="${h.y-160}" rx="7" ry="10" fill="#fff" opacity=".5"/>`},
    {id:'varita',en:'Magic wand',draw:(h)=>`<path d="M${h.x} ${h.y} L${h.x+26} ${h.y-70}" stroke="#5c3a1f" stroke-width="6" stroke-linecap="round"/><path transform="translate(${h.x+28} ${h.y-82})" d="M0 -20 L6 -6 L21 -6 L9 3 L13 18 L0 9 L-13 18 L-9 3 L-21 -6 L-6 -6 Z" fill="#ffd84d" stroke="#c99a00" stroke-width="2"/>`},
    {id:'flor',en:'Flower',draw:(h)=>`<path d="M${h.x} ${h.y+6} Q${h.x+6} ${h.y-30} ${h.x+4} ${h.y-60}" stroke="#2d9a3a" stroke-width="5" fill="none"/><g transform="translate(${h.x+4} ${h.y-70})"><circle cx="0" cy="-14" r="10" fill="#ff6fae"/><circle cx="13" cy="-4" r="10" fill="#ff6fae"/><circle cx="8" cy="12" r="10" fill="#ff6fae"/><circle cx="-8" cy="12" r="10" fill="#ff6fae"/><circle cx="-13" cy="-4" r="10" fill="#ff6fae"/><circle r="8" fill="#ffd84d"/></g>`},
    {id:'helado',en:'Ice cream',draw:(h)=>`<path d="M${h.x-14} ${h.y-30} L${h.x+14} ${h.y-30} L${h.x} ${h.y+8} Z" fill="#e4b46c" stroke="#b07b30" stroke-width="2"/><circle cx="${h.x}" cy="${h.y-40}" r="16" fill="#ff9ec4"/><circle cx="${h.x}" cy="${h.y-62}" r="14" fill="#9ce0c0"/><circle cx="${h.x+2}" cy="${h.y-80}" r="5" fill="#e63b2e"/>`},
    {id:'bandera',en:'Flag',draw:(h)=>`<path d="M${h.x} ${h.y+10} V${h.y-110}" stroke="#7d8489" stroke-width="5" stroke-linecap="round"/><path d="M${h.x+2} ${h.y-108} L${h.x+52} ${h.y-90} L${h.x+2} ${h.y-72} Z" fill="#4cb54a"/>`},
    {id:'pelota',en:'Ball',draw:(h)=>`<circle cx="${h.x+6}" cy="${h.y-18}" r="24" fill="#fff" stroke="#e63b2e" stroke-width="3"/><path d="M${h.x-18} ${h.y-18} Q${h.x+6} ${h.y-4} ${h.x+30} ${h.y-18}" stroke="#2f6fdb" stroke-width="5" fill="none"/><path d="M${h.x+6} ${h.y-42} Q${h.x-6} ${h.y-18} ${h.x+6} ${h.y+6}" stroke="#ffd84d" stroke-width="5" fill="none"/>`}
  ]
};
function chShoes(c){return `<ellipse cx="96" cy="402" rx="24" ry="10" fill="${c}"/><ellipse cx="144" cy="402" rx="24" ry="10" fill="${c}"/>`}
function chArms(o,hand){
  const one=(right,up)=>{const x=right?174:40,rot=right?(up?-150:-8):8,px=right?174:66;
    const sleeve=`<rect x="${x}" y="170" width="26" height="70" rx="13" fill="${o.col}"/>`;
    const fore=o.robot?`<rect x="${x+4}" y="232" width="18" height="28" fill="#7d8489"/><circle cx="${x+13}" cy="236" r="7" fill="#6f7478"/><path d="M${x+3} 262 h20 l-4 14 h-12 Z" fill="#6f7478"/>`
      :`<circle cx="${x+13}" cy="252" r="14" fill="${hand}"/>`;
    return `<g transform="rotate(${rot} ${px} 172)">${sleeve}${fore}</g>`};
  return one(false,false)+one(true,!!o.up);
}
const CH_SLOTS=['legs','body','arms','head','hat','acc'];
const CH_TABS=[['head','🙂','Cara'],['hat','🎩','Pelo'],['body','👕','Ropa'],['arms','💪','Brazos'],['legs','👖','Piernas'],['acc','🎈','Cosas']];
const CH_VIEW={head:'40 10 160 170',hat:'30 0 180 190',body:'30 155 180 190',arms:'25 150 190 140',legs:'55 280 130 135',acc:'70 10 120 200'};
const chFind=(slot,id)=>PARTS[slot].find(p=>p.id===id);
function chSkin(ch){const h=ch.head&&chFind('head',ch.head);return h&&h.c?h.c:SKINS[ch.skin||0]}
// dibuja el personaje completo (o una sola parte para la bandeja)
function chSVG(ch,opts={}){
  const skin=chSkin(ch),hand=(ch.arms&&chFind('arms',ch.arms)&&chFind('arms',ch.arms).up)?HAND_UP:HAND_N;let g='';
  if(opts.template){g+='<g class="tpl" fill="none" stroke="#9ccde6" stroke-width="4" stroke-dasharray="10 8">';
    if(!ch.head)g+='<rect x="65" y="48" width="110" height="104" rx="30"/>';
    if(!ch.body)g+=`<path d="${CH_TORSO}"/>`;
    if(!ch.legs)g+='<rect x="78" y="290" width="40" height="110" rx="8"/><rect x="122" y="290" width="40" height="110" rx="8"/>';
    if(!ch.arms)g+='<rect x="40" y="172" width="26" height="92" rx="13" transform="rotate(8 66 172)"/><rect x="174" y="172" width="26" height="92" rx="13" transform="rotate(-8 174 172)"/>';
    g+='</g>'}
  for(const s of (opts.only?[opts.only]:CH_SLOTS)){const id=ch[s];if(!id)continue;const p=chFind(s,id);if(!p)continue;
    let inner=s==='arms'?chArms(p,skin):s==='head'?p.draw(p.c||skin):s==='legs'?p.draw(skin):s==='acc'?p.draw(opts.only?{x:120,y:190}:hand):p.draw();
    g+=`<g class="part" data-slot="${s}">${inner}</g>`}
  const vb=opts.only?CH_VIEW[opts.only]:'-10 -75 260 505';   // espacio arriba para el globo
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
// ---------- pantalla ----------
let chTab='head',chDrag=null,chSure=false;
function chCur(){if(!save.char)save.char={skin:0};return save.char}
function renderChars(){
  const ch=chCur();
  $('#chFig').innerHTML=chSVG(ch,{template:true});
  $('#chTabs').innerHTML=CH_TABS.map(([s,e,n])=>`<button class="chtab${s===chTab?' on':''}" data-t="${s}">${e}<span>${n}</span></button>`).join('');
  const sk=chTab==='head'?`<div id="chSkins">${SKINS.map((c,i)=>`<button class="chsk${(ch.skin||0)===i?' on':''}" data-sk="${i}" style="background:${c}"></button>`).join('')}</div>`:'';
  $('#chOpts').innerHTML=sk+'<div id="chGrid">'+PARTS[chTab].map(p=>`<button class="chopt${ch[chTab]===p.id?' on':''}" data-id="${p.id}">${chSVG(Object.assign({},ch,{[chTab]:p.id}),{only:chTab})}</button>`).join('')+'</div>';
  $('#chClear').textContent=chSure?'❓':'🗑️';
  $('#chGalN').textContent=(save.chars||[]).length||'';
}
function chPlace(slot,id,from){
  const ch=chCur(),was=!!(ch.head&&ch.body&&ch.legs);ch[slot]=id;persist();renderChars();sSnap();buzz(12);
  const g=$('#chFig').querySelector(`.part[data-slot="${slot}"]`);
  if(g){g.classList.add('chpop');const r=g.getBoundingClientRect();sparks(r.left+r.width/2,r.top+r.height/2,'#ffd84d',10)}
  const p=chFind(slot,id);say(p.en);word(p.en,'#fff',$('#chStage'));
  if(!was&&ch.head&&ch.body&&ch.legs)setTimeout(()=>{confetti();sFan();say('You made a friend!',true)},450);
}
$('#goChars').addEventListener('click',()=>{ac();sTap();chSure=false;show('chars')});
$('#chBack').addEventListener('pointerdown',()=>{ac();show('home')});
$('#chTabs').addEventListener('click',e=>{const b=e.target.closest('.chtab');if(!b)return;ac();sTap();chTab=b.dataset.t;renderChars();
  const t=CH_TABS.find(x=>x[0]===chTab);say(PARTS[chTab][0]&&{head:'Faces',hat:'Hats',body:'Clothes',arms:'Arms',legs:'Legs',acc:'Toys'}[chTab])});
$('#chOpts').addEventListener('click',e=>{const k=e.target.closest('.chsk');if(!k)return;ac();chCur().skin=+k.dataset.sk;persist();sTap();renderChars()});
// arrastrar una parte desde la bandeja (tocar también la pone)
$('#chOpts').addEventListener('pointerdown',e=>{const b=e.target.closest('.chopt');if(!b)return;ac();
  chDrag={id:b.dataset.id,slot:chTab,x0:e.clientX,y0:e.clientY,moved:false,el:null,src:b}});
document.addEventListener('pointermove',e=>{if(!chDrag)return;
  if(!chDrag.moved&&Math.hypot(e.clientX-chDrag.x0,e.clientY-chDrag.y0)<10)return;
  if(!chDrag.moved){chDrag.moved=true;const d=document.createElement('div');d.className='chghost';d.innerHTML=chDrag.src.innerHTML;document.body.appendChild(d);chDrag.el=d;sTap()}
  chDrag.el.style.left=e.clientX+'px';chDrag.el.style.top=e.clientY+'px';
  const r=$('#chStage').getBoundingClientRect(),inS=e.clientX>r.left&&e.clientX<r.right&&e.clientY>r.top&&e.clientY<r.bottom;
  $('#chStage').classList.toggle('chover',inS)},{passive:true});
document.addEventListener('pointerup',e=>{if(!chDrag)return;const d=chDrag;chDrag=null;$('#chStage').classList.remove('chover');
  if(!d.moved){chPlace(d.slot,d.id);return}
  d.el.remove();const r=$('#chStage').getBoundingClientRect();
  if(e.clientX>r.left&&e.clientX<r.right&&e.clientY>r.top&&e.clientY<r.bottom)chPlace(d.slot,d.id);else sPop()});
document.addEventListener('pointercancel',()=>{if(chDrag){if(chDrag.el)chDrag.el.remove();chDrag=null;$('#chStage').classList.remove('chover')}});
// tocar una parte del muñeco la cambia por la siguiente
$('#chFig').addEventListener('click',e=>{const g=e.target.closest('.part');if(!g)return;ac();const s=g.dataset.slot,L=PARTS[s],ch=chCur();
  const i=L.findIndex(p=>p.id===ch[s]);chTab=s;chPlace(s,L[(i+1)%L.length].id)});
$('#chRand').addEventListener('click',()=>{ac();const ch=chCur();for(const s of CH_SLOTS)ch[s]=PARTS[s][Math.random()*PARTS[s].length|0].id;
  if(Math.random()<.25)ch.acc=null;ch.skin=Math.random()*SKINS.length|0;persist();renderChars();sFan();
  $('#chFig').querySelectorAll('.part').forEach((g,i)=>{g.style.animationDelay=i*60+'ms';g.classList.add('chpop')});say('Surprise!')});
$('#chClear').addEventListener('click',()=>{ac();if(!chSure){chSure=true;renderChars();setTimeout(()=>{chSure=false;if(screen==='chars')renderChars()},2500);return}
  chSure=false;save.char={skin:chCur().skin||0};persist();sPop();renderChars()});
// galería: guardar y volver a cargar muñecos
$('#chSave').addEventListener('click',()=>{ac();const ch=chCur();if(!ch.head&&!ch.body&&!ch.legs){sPop();toast('Primero arma tu personaje');return}
  save.chars=save.chars||[];save.chars.unshift(JSON.parse(JSON.stringify(ch)));if(save.chars.length>12)save.chars.length=12;persist();sCoin();say('Saved!');toast('💾 Guardado en la galería');renderChars()});
$('#chGal').addEventListener('click',()=>{ac();sTap();chGallery()});
function chGallery(){const L=save.chars||[];
  $('#chGalGrid').innerHTML=L.length?L.map((c,i)=>`<div class="chg"><button class="chgl" data-i="${i}">${chSVG(c)}</button><button class="chgx" data-x="${i}">✕</button></div>`).join(''):'<p style="font-weight:800;color:#5d86a0">Todavía no hay personajes guardados.</p>';
  $('#chGalOv').classList.add('show')}
$('#chGalGrid').addEventListener('click',e=>{const x=e.target.closest('.chgx');if(x){save.chars.splice(+x.dataset.x,1);persist();sPop();chGallery();renderChars();return}
  const b=e.target.closest('.chgl');if(!b)return;save.char=JSON.parse(JSON.stringify(save.chars[+b.dataset.i]));persist();$('#chGalOv').classList.remove('show');sFan();renderChars()});
$('#chGalClose').addEventListener('click',()=>$('#chGalOv').classList.remove('show'));
