// =====================================================================
//  PERSONAJES — títere de cartón articulado
//  Se arma arrastrando piezas (cabeza, cara, pelo, cuerpo, ropa, brazos, piernas, cosas).
//  Cada pieza va unida por un huequito con hilo: con el dedo se giran cabeza, hombros, codos,
//  caderas y rodillas. El cordón de abajo hace saltar al títere (como el muñeco de madera).
//  Lienzo SVG: viewBox -10 -75 260 505. Brazos y piernas se dibujan "colgando" desde su eje (0,0).
// =====================================================================
const CH_COLORS=['#f6d2b5','#e8b08a','#c98a5e','#8d5a3b','#5c3a24','#e63b2e','#ff8a1f','#fac80a','#4cb54a','#2fb3a8','#2f6fdb','#8a4fc7','#ff6fae','#f4f4f4','#7d8489'];
const CH_DEF_COL={head:'#f6d2b5',body:'#e63b2e',arms:'#2f6fdb',legs:'#2f6fdb'};
const CH_REST={h:0,al:[18,0],ar:[-18,0],ll:[5,0],lr:[-5,0]};
const CH_STROKE='stroke="rgba(60,35,10,.35)" stroke-width="2.5"';
let chUid=0;
const chDark=c=>{const n=parseInt(c.slice(1),16),f=v=>Math.max(0,Math.round(v*.72));return'#'+[n>>16,(n>>8)&255,n&255].map(v=>f(v).toString(16).padStart(2,'0')).join('')};
const chStar=(cx,cy,ro,ri,n=5)=>{let d='';for(let i=0;i<n*2;i++){const r=i%2?ri:ro,a=Math.PI/n*i-Math.PI/2;d+=(i?'L':'M')+(cx+r*Math.cos(a)).toFixed(1)+' '+(cy+r*Math.sin(a)).toFixed(1)}return d+'Z'};
// ---------- cuerpos (coordenadas absolutas; cada uno trae sus huequitos: cuello, hombros y caderas) ----------
const CH_BODIES=[
  {id:'rect',en:'Square body',d:'M65 183 Q65 165 83 165 H157 Q175 165 175 183 V277 Q175 295 157 295 H83 Q65 295 65 277 Z',j:{n:[120,172],sl:[78,182],sr:[162,182],hl:[96,284],hr:[144,284]}},
  {id:'ovalo',en:'Oval body',d:'M120 162 C158 162 180 196 180 230 C180 268 158 300 120 300 C82 300 60 268 60 230 C60 196 82 162 120 162 Z',j:{n:[120,170],sl:[78,190],sr:[162,190],hl:[98,286],hr:[142,286]}},
  {id:'vestido',en:'Triangle body',d:'M120 160 Q128 160 132 168 L186 290 Q190 302 176 302 H64 Q50 302 54 290 L108 168 Q112 160 120 160 Z',j:{n:[120,170],sl:[104,190],sr:[136,190],hl:[96,290],hr:[144,290]}},
  {id:'gordito',en:'Round body',d:'M120 160 C168 160 190 196 190 234 C190 276 162 302 120 302 C78 302 50 276 50 234 C50 196 72 160 120 160 Z',j:{n:[120,168],sl:[70,200],sr:[170,200],hl:[96,288],hr:[144,288]}},
  {id:'estrella',en:'Star body',d:chStar(120,236,82,40),j:{n:[120,172],sl:[76,212],sr:[164,212],hl:[90,292],hr:[150,292]}},
  {id:'corazon',en:'Heart body',d:'M120 196 C112 170 66 160 62 200 C58 236 96 266 120 298 C144 266 182 236 178 200 C174 160 128 170 120 196 Z',j:{n:[120,190],sl:[78,186],sr:[162,186],hl:[106,282],hr:[134,282]}},
  {id:'robot',en:'Robot body',d:'M62 166 H178 V296 H62 Z',j:{n:[120,172],sl:[72,180],sr:[168,180],hl:[96,286],hr:[144,286]},extra:'<circle cx="72" cy="176" r="4" fill="#555"/><circle cx="168" cy="176" r="4" fill="#555"/><circle cx="72" cy="286" r="4" fill="#555"/><circle cx="168" cy="286" r="4" fill="#555"/>'},
  {id:'pera',en:'Pear body',d:'M120 162 C142 162 150 180 152 200 C156 222 186 238 186 266 C186 292 160 302 120 302 C80 302 54 292 54 266 C54 238 84 222 88 200 C90 180 98 162 120 162 Z',j:{n:[120,170],sl:[98,192],sr:[142,192],hl:[94,290],hr:[146,290]}}
];
// ---------- ropa / decoración del cuerpo (se recorta a la forma del cuerpo) ----------
const CH_ROPA=[
  {id:'rayas',en:'Stripes',draw:()=>'<g fill="#fff" opacity=".85"><rect x="40" y="186" width="160" height="12"/><rect x="40" y="214" width="160" height="12"/><rect x="40" y="242" width="160" height="12"/><rect x="40" y="270" width="160" height="12"/></g>'},
  {id:'puntos',en:'Dots',draw:()=>'<g fill="#fff" opacity=".9"><circle cx="92" cy="200" r="8"/><circle cx="140" cy="194" r="8"/><circle cx="116" cy="230" r="8"/><circle cx="84" cy="258" r="8"/><circle cx="150" cy="250" r="8"/><circle cx="118" cy="280" r="8"/></g>'},
  {id:'estrella',en:'Star',draw:()=>`<path d="${chStar(120,228,30,13)}" fill="#ffd84d" stroke="#c99a00" stroke-width="2"/>`},
  {id:'botones',en:'Buttons',draw:()=>'<path d="M120 168 V300" stroke="rgba(0,0,0,.25)" stroke-width="3"/><g fill="#ffd84d" stroke="#c99a00" stroke-width="2"><circle cx="120" cy="196" r="7"/><circle cx="120" cy="226" r="7"/><circle cx="120" cy="256" r="7"/></g>'},
  {id:'corbata',en:'Tie',draw:()=>'<path d="M104 166 L120 184 L136 166 Z" fill="#fff"/><path d="M114 184 H126 L132 250 L120 266 L108 250 Z" fill="#2f6fdb" stroke="#123f7d" stroke-width="2"/>'},
  {id:'heroe',en:'Super',draw:()=>'<circle cx="120" cy="220" r="26" fill="#ffd84d" stroke="#c99a00" stroke-width="2"/><path d="M125 200 L108 224 L120 224 L114 242 L133 216 L121 216 Z" fill="#e63b2e"/><rect x="40" y="268" width="160" height="12" fill="#ffd84d"/>'},
  {id:'corazon',en:'Heart',draw:()=>'<path d="M120 238 C114 222 92 220 92 236 C92 250 110 260 120 270 C130 260 148 250 148 236 C148 220 126 222 120 238 Z" fill="#ff6fae" stroke="#d63d82" stroke-width="2"/>'},
  {id:'panel',en:'Robot panel',draw:()=>'<rect x="92" y="196" width="56" height="44" rx="6" fill="#3a3d40"/><circle cx="106" cy="212" r="6" fill="#e63b2e"/><circle cx="122" cy="212" r="6" fill="#fac80a"/><circle cx="138" cy="212" r="6" fill="#4cb54a"/><rect x="100" y="226" width="40" height="7" rx="3" fill="#3fd0ff"/>'}
];
// ---------- cabezas (coordenadas locales: eje del cuello en 0,0; centro de la cara en 0,-58) ----------
const CH_HEADS=[
  {id:'circulo',en:'Round head',draw:c=>`<circle cx="0" cy="-58" r="50" fill="${c}" ${CH_STROKE}/>`},
  {id:'ovalo',en:'Oval head',draw:c=>`<ellipse cx="0" cy="-60" rx="42" ry="56" fill="${c}" ${CH_STROKE}/>`},
  {id:'cuadrado',en:'Square head',draw:c=>`<rect x="-52" y="-108" width="104" height="98" rx="24" fill="${c}" ${CH_STROKE}/>`},
  {id:'triangulo',en:'Triangle head',draw:c=>`<path d="M0 -122 Q8 -122 12 -114 L58 -22 Q62 -10 48 -10 H-48 Q-62 -10 -58 -22 L-12 -114 Q-8 -122 0 -122 Z" fill="${c}" ${CH_STROKE}/>`},
  {id:'gato',en:'Cat',draw:c=>`<path d="M-44 -78 L-40 -122 L-10 -100 Z M44 -78 L40 -122 L10 -100 Z" fill="${c}" ${CH_STROKE}/><path d="M-36 -88 L-35 -110 L-20 -98 Z M36 -88 L35 -110 L20 -98 Z" fill="#ffb3c1"/><circle cx="0" cy="-58" r="50" fill="${c}" ${CH_STROKE}/><path d="M-46 -48 L-22 -44 M-46 -36 L-22 -40 M46 -48 L22 -44 M46 -36 L22 -40" stroke="#333" stroke-width="2"/>`},
  {id:'oso',en:'Bear',draw:c=>`<circle cx="-38" cy="-98" r="17" fill="${c}" ${CH_STROKE}/><circle cx="38" cy="-98" r="17" fill="${c}" ${CH_STROKE}/><circle cx="-38" cy="-98" r="8" fill="${chDark(c)}"/><circle cx="38" cy="-98" r="8" fill="${chDark(c)}"/><circle cx="0" cy="-58" r="50" fill="${c}" ${CH_STROKE}/><ellipse cx="0" cy="-38" rx="20" ry="14" fill="#fff" opacity=".55"/>`},
  {id:'conejo',en:'Bunny',draw:c=>`<ellipse cx="-20" cy="-130" rx="13" ry="38" fill="${c}" ${CH_STROKE}/><ellipse cx="20" cy="-130" rx="13" ry="38" fill="${c}" ${CH_STROKE}/><ellipse cx="-20" cy="-130" rx="6" ry="28" fill="#ffb3c1"/><ellipse cx="20" cy="-130" rx="6" ry="28" fill="#ffb3c1"/><ellipse cx="0" cy="-56" rx="46" ry="50" fill="${c}" ${CH_STROKE}/>`},
  {id:'robot',en:'Robot head',draw:c=>`<path d="M0 -108 V-128" stroke="#7d8489" stroke-width="5"/><circle cx="0" cy="-132" r="8" fill="#e63b2e"/><rect x="-62" y="-72" width="12" height="26" rx="4" fill="#7d8489"/><rect x="50" y="-72" width="12" height="26" rx="4" fill="#7d8489"/><rect x="-52" y="-108" width="104" height="96" rx="8" fill="${c}" ${CH_STROKE}/>`},
  {id:'pajaro',en:'Bird',draw:c=>`<path d="M-6 -106 Q0 -132 12 -112 Q18 -130 22 -104" fill="${c}" ${CH_STROKE}/><circle cx="0" cy="-58" r="48" fill="${c}" ${CH_STROKE}/><path d="M-14 -44 L14 -44 L0 -24 Z" fill="#ff8a1f" stroke="#c96200" stroke-width="2"/>`},
  {id:'monstruo',en:'Monster',draw:c=>`<path d="M-40 -96 L-50 -128 L-22 -104 Z M40 -96 L50 -128 L22 -104 Z" fill="#fff6c9" stroke="#c9b23a" stroke-width="2"/><path d="M-50 -58 Q-56 -112 0 -112 Q56 -112 50 -58 Q52 -10 30 -10 Q24 -18 16 -10 Q8 -18 0 -10 Q-8 -18 -16 -10 Q-24 -18 -30 -10 Q-52 -10 -50 -58 Z" fill="${c}" ${CH_STROKE}/>`}
];
const chEye=(x,y,r=7)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#222"/><circle cx="${x+2}" cy="${y-2}" r="${r*.32}" fill="#fff"/>`;
const chCheeks='<circle cx="-28" cy="-46" r="7" fill="#ff8fa3" opacity=".55"/><circle cx="28" cy="-46" r="7" fill="#ff8fa3" opacity=".55"/>';
const CH_FACES=[
  {id:'feliz',en:'Happy',draw:()=>chEye(-20,-66)+chEye(20,-66)+chCheeks+'<path d="M-22 -44 Q0 -24 22 -44" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/>'},
  {id:'sorpresa',en:'Surprised',draw:()=>chEye(-20,-68,8)+chEye(20,-68,8)+'<ellipse cx="0" cy="-38" rx="9" ry="11" fill="#7a2a2a"/>'},
  {id:'risa',en:'Laughing',draw:()=>'<path d="M-30 -64 Q-20 -76 -10 -64 M10 -64 Q20 -76 30 -64" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/>'+chCheeks+'<path d="M-24 -48 H24 Q20 -22 0 -22 Q-20 -22 -24 -48 Z" fill="#7a2a2a"/><path d="M-12 -30 Q0 -36 12 -30 Q6 -22 0 -22 Q-6 -22 -12 -30Z" fill="#ff7a90"/>'},
  {id:'dormido',en:'Sleepy',draw:()=>'<path d="M-30 -66 Q-20 -56 -10 -66 M10 -66 Q20 -56 30 -66" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-8 -40 Q0 -34 8 -40" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/><text x="30" y="-96" font-size="20" font-weight="900" fill="#5d86a0">z</text>'},
  {id:'travieso',en:'Silly',draw:()=>chEye(-20,-66)+'<path d="M10 -66 Q20 -74 30 -66" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/>'+chCheeks+'<path d="M-22 -46 Q0 -24 22 -46" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-6 -36 Q0 -16 8 -36" fill="#ff7a90" stroke="#d94a64" stroke-width="2"/>'},
  {id:'gafas',en:'Cool',draw:()=>'<rect x="-36" y="-76" width="30" height="20" rx="6" fill="#222"/><rect x="6" y="-76" width="30" height="20" rx="6" fill="#222"/><path d="M-6 -68 H6" stroke="#222" stroke-width="4"/><path d="M-16 -42 Q0 -32 18 -46" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/>'},
  {id:'robot',en:'Robot face',draw:()=>'<rect x="-34" y="-78" width="26" height="22" rx="4" fill="#3fd0ff" stroke="#24506b" stroke-width="3"/><rect x="8" y="-78" width="26" height="22" rx="4" fill="#3fd0ff" stroke="#24506b" stroke-width="3"/><rect x="-26" y="-44" width="52" height="16" rx="4" fill="#fff" stroke="#24506b" stroke-width="3"/><path d="M-12 -44 V-28 M0 -44 V-28 M12 -44 V-28" stroke="#24506b" stroke-width="3"/>'},
  {id:'ciclope',en:'One eye',draw:()=>'<circle cx="0" cy="-68" r="20" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="4" cy="-66" r="9" fill="#5b2a86"/><circle cx="7" cy="-69" r="3" fill="#fff"/><path d="M-20 -36 Q0 -22 20 -36" stroke="#222" stroke-width="5" fill="none" stroke-linecap="round"/>'}
];
// sombreros y pelo: dibujados para una cabeza con centro en (120,100) → se corren a (0,-58)
const CH_HATS=[
  {id:'corto',en:'Hair',draw:()=>'<path d="M66 96 Q62 44 120 42 Q178 44 174 96 Q168 70 148 66 Q120 78 92 66 Q72 70 66 96 Z" fill="#6b3e1f"/>'},
  {id:'largo',en:'Long hair',draw:()=>'<path d="M62 158 L62 90 Q62 40 120 40 Q178 40 178 90 L178 158 Q164 140 164 98 Q150 70 120 74 Q90 70 76 98 Q76 140 62 158 Z" fill="#f2c94c"/>'},
  {id:'coletas',en:'Pigtails',draw:()=>'<circle cx="60" cy="98" r="20" fill="#2b2b2b"/><circle cx="180" cy="98" r="20" fill="#2b2b2b"/><path d="M68 92 Q66 42 120 40 Q174 42 172 92 Q156 62 120 66 Q84 62 68 92 Z" fill="#2b2b2b"/><circle cx="72" cy="84" r="7" fill="#ff6fae"/><circle cx="168" cy="84" r="7" fill="#ff6fae"/>'},
  {id:'gorra',en:'Cap',draw:()=>'<path d="M68 82 Q68 38 120 38 Q172 38 172 82 Z" fill="#e63b2e"/><ellipse cx="150" cy="82" rx="46" ry="9" fill="#a82015"/><circle cx="120" cy="38" r="6" fill="#a82015"/>'},
  {id:'corona',en:'Crown',draw:()=>'<path d="M78 64 L78 24 L96 42 L108 16 L120 40 L132 16 L144 42 L162 24 L162 64 Z" fill="#ffd84d" stroke="#c99a00" stroke-width="3"/><circle cx="98" cy="54" r="5" fill="#e63b2e"/><circle cx="120" cy="52" r="6" fill="#2f6fdb"/><circle cx="142" cy="54" r="5" fill="#4cb54a"/>'},
  {id:'mago',en:'Wizard hat',draw:()=>'<path d="M74 70 L118 -10 Q124 -18 128 -8 L166 70 Z" fill="#5b2a86"/><ellipse cx="120" cy="70" rx="56" ry="10" fill="#3f1c63"/><path d="'+chStar(116,30,10,4)+'" fill="#ffd84d"/><circle cx="138" cy="52" r="4" fill="#ffd84d"/>'},
  {id:'chef',en:'Chef hat',draw:()=>'<circle cx="94" cy="34" r="22" fill="#fff" stroke="#d6dade" stroke-width="2"/><circle cx="146" cy="34" r="22" fill="#fff" stroke="#d6dade" stroke-width="2"/><circle cx="120" cy="22" r="26" fill="#fff" stroke="#d6dade" stroke-width="2"/><rect x="80" y="40" width="80" height="26" rx="6" fill="#fff" stroke="#d6dade" stroke-width="2"/>'},
  {id:'astronauta',en:'Space helmet',draw:()=>'<circle cx="120" cy="100" r="74" fill="rgba(170,215,255,.28)" stroke="#e8edf1" stroke-width="9"/><path d="M78 66 Q92 44 120 40" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>'},
  {id:'mono',en:'Bow',draw:()=>'<path d="M120 52 L92 36 Q84 52 92 68 Z M120 52 L148 36 Q156 52 148 68 Z" fill="#ff6fae" stroke="#d63d82" stroke-width="2"/><circle cx="120" cy="52" r="8" fill="#d63d82"/>'}
];
// brazos: segmento de arriba (0→56), codo en (0,56), antebrazo (0→50), mano en (0,56)
const CH_ARMS=[
  {id:'recto',en:'Arms',up:(c)=>`<rect x="-12" y="-10" width="24" height="70" rx="12" fill="${c}" ${CH_STROKE}/>`,lo:(c,s)=>`<rect x="-11" y="-8" width="22" height="58" rx="11" fill="${c}" ${CH_STROKE}/><circle cx="0" cy="56" r="13" fill="${s}" ${CH_STROKE}/>`},
  {id:'grueso',en:'Strong arms',up:(c)=>`<rect x="-17" y="-12" width="34" height="74" rx="17" fill="${c}" ${CH_STROKE}/>`,lo:(c,s)=>`<rect x="-15" y="-10" width="30" height="60" rx="15" fill="${c}" ${CH_STROKE}/><circle cx="0" cy="58" r="17" fill="${s}" ${CH_STROKE}/>`},
  {id:'palito',en:'Stick arms',up:(c)=>`<rect x="-6" y="-6" width="12" height="66" rx="6" fill="${c}" ${CH_STROKE}/>`,lo:(c,s)=>`<rect x="-6" y="-4" width="12" height="54" rx="6" fill="${c}" ${CH_STROKE}/><path d="M0 50 L-10 64 M0 50 L0 66 M0 50 L10 64" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`},
  {id:'tentaculo',en:'Tentacles',up:(c)=>`<path d="M-14 -6 Q-18 30 -10 62 L10 62 Q16 30 14 -6 Z" fill="${c}" ${CH_STROKE}/>`,lo:(c,s)=>`<path d="M-10 -4 Q-14 30 -2 52 Q8 66 18 58 Q8 54 8 40 Q8 20 10 -4 Z" fill="${c}" ${CH_STROKE}/><circle cx="-2" cy="14" r="3" fill="#fff" opacity=".7"/><circle cx="0" cy="30" r="3" fill="#fff" opacity=".7"/>`},
  {id:'robot',en:'Robot arms',up:(c)=>`<rect x="-12" y="-8" width="24" height="66" rx="3" fill="${c}" ${CH_STROKE}/><path d="M-12 20 H12 M-12 38 H12" stroke="rgba(0,0,0,.25)" stroke-width="3"/>`,lo:(c,s)=>`<rect x="-10" y="-6" width="20" height="54" rx="3" fill="${c}" ${CH_STROKE}/><path d="M-12 48 h24 l-5 18 h-4 v-8 h-6 v8 h-4 Z" fill="#6f7478"/>`},
  {id:'ala',en:'Wings',up:(c)=>`<path d="M-8 -8 Q-34 20 -26 62 L14 62 Q16 20 10 -8 Z" fill="${c}" ${CH_STROKE}/><path d="M-20 24 Q-4 30 10 22 M-22 44 Q-4 50 12 42" stroke="rgba(255,255,255,.6)" stroke-width="3" fill="none"/>`,lo:(c,s)=>`<path d="M-22 -4 Q-30 40 -8 70 Q0 56 4 70 Q12 52 14 66 Q20 30 12 -4 Z" fill="${c}" ${CH_STROKE}/>`},
  {id:'garra',en:'Claws',up:(c)=>`<rect x="-15" y="-10" width="30" height="72" rx="15" fill="${c}" ${CH_STROKE}/>`,lo:(c,s)=>`<rect x="-13" y="-8" width="26" height="58" rx="13" fill="${c}" ${CH_STROKE}/><circle cx="0" cy="56" r="15" fill="${c}" ${CH_STROKE}/><path d="M-10 66 L-14 78 L-4 68 M0 70 L0 82 L4 70 M10 66 L14 78 L6 68" fill="#fff" stroke="#c9ccce" stroke-width="2"/>`}
];
// piernas: muslo (0→60), rodilla en (0,60), pantorrilla (0→54), pie abajo
const CH_LEGS=[
  {id:'recto',en:'Legs',up:(c)=>`<rect x="-15" y="-10" width="30" height="76" rx="14" fill="${c}" ${CH_STROKE}/>`,lo:(c)=>`<rect x="-14" y="-8" width="28" height="60" rx="13" fill="${c}" ${CH_STROKE}/><path d="M-16 50 H14 Q30 50 30 62 Q30 68 22 68 H-16 Q-20 68 -20 60 Q-20 50 -16 50 Z" fill="#272a2d"/>`},
  {id:'grueso',en:'Big legs',up:(c)=>`<rect x="-21" y="-12" width="42" height="78" rx="20" fill="${c}" ${CH_STROKE}/>`,lo:(c)=>`<rect x="-19" y="-10" width="38" height="62" rx="18" fill="${c}" ${CH_STROKE}/><ellipse cx="4" cy="60" rx="28" ry="12" fill="#e63b2e" ${CH_STROKE}/>`},
  {id:'palito',en:'Stick legs',up:(c)=>`<rect x="-6" y="-6" width="12" height="72" rx="6" fill="${c}" ${CH_STROKE}/>`,lo:(c)=>`<rect x="-6" y="-4" width="12" height="58" rx="6" fill="${c}" ${CH_STROKE}/><ellipse cx="8" cy="58" rx="18" ry="7" fill="#ff6fae" ${CH_STROKE}/>`},
  {id:'botas',en:'Boots',up:(c)=>`<rect x="-15" y="-10" width="30" height="76" rx="14" fill="${c}" ${CH_STROKE}/>`,lo:(c)=>`<rect x="-14" y="-8" width="28" height="30" rx="10" fill="${c}" ${CH_STROKE}/><path d="M-17 16 H17 V52 Q34 52 34 64 Q34 70 26 70 H-17 Z" fill="#ffd84d" stroke="#c99a00" stroke-width="2.5"/>`},
  {id:'robot',en:'Robot legs',up:(c)=>`<rect x="-14" y="-8" width="28" height="72" rx="3" fill="${c}" ${CH_STROKE}/><path d="M-14 22 H14 M-14 44 H14" stroke="rgba(0,0,0,.25)" stroke-width="3"/>`,lo:(c)=>`<rect x="-12" y="-6" width="24" height="56" rx="3" fill="${c}" ${CH_STROKE}/><rect x="-22" y="48" width="46" height="18" rx="4" fill="#6f7478"/>`},
  {id:'pata',en:'Paws',up:(c)=>`<path d="M-18 -10 Q-22 30 -14 66 H14 Q22 30 18 -10 Z" fill="${c}" ${CH_STROKE}/>`,lo:(c)=>`<rect x="-14" y="-8" width="28" height="54" rx="13" fill="${c}" ${CH_STROKE}/><ellipse cx="2" cy="56" rx="22" ry="14" fill="${c}" ${CH_STROKE}/><circle cx="-8" cy="54" r="4" fill="${chDark(c)}"/><circle cx="2" cy="51" r="4" fill="${chDark(c)}"/><circle cx="12" cy="54" r="4" fill="${chDark(c)}"/>`},
  {id:'aleta',en:'Flippers',up:(c)=>`<rect x="-15" y="-10" width="30" height="76" rx="14" fill="${c}" ${CH_STROKE}/>`,lo:(c)=>`<rect x="-13" y="-8" width="26" height="46" rx="12" fill="${c}" ${CH_STROKE}/><path d="M-12 36 L-30 74 Q0 64 30 74 L12 36 Z" fill="#2fb3a8" stroke="#1d7f77" stroke-width="2.5"/>`}
];
// cosas en la mano (se dibujan con la mano en h, siempre derechas)
const CH_ACC=[
  {id:'globo',en:'Balloon',draw:h=>`<path d="M${h.x} ${h.y} Q${h.x+26} ${h.y-60} ${h.x+12} ${h.y-104}" stroke="#555" stroke-width="2" fill="none"/><ellipse cx="${h.x+12}" cy="${h.y-132}" rx="24" ry="30" fill="#e63b2e"/><ellipse cx="${h.x+4}" cy="${h.y-142}" rx="6" ry="9" fill="#fff" opacity=".5"/>`},
  {id:'varita',en:'Magic wand',draw:h=>`<path d="M${h.x} ${h.y} L${h.x+22} ${h.y-62}" stroke="#5c3a1f" stroke-width="6" stroke-linecap="round"/><path d="${chStar(h.x+24,h.y-74,20,8)}" fill="#ffd84d" stroke="#c99a00" stroke-width="2"/>`},
  {id:'flor',en:'Flower',draw:h=>`<path d="M${h.x} ${h.y+4} Q${h.x+6} ${h.y-30} ${h.x+4} ${h.y-56}" stroke="#2d9a3a" stroke-width="5" fill="none"/><g transform="translate(${h.x+4} ${h.y-66})"><circle cx="0" cy="-13" r="10" fill="#ff6fae"/><circle cx="12" cy="-4" r="10" fill="#ff6fae"/><circle cx="8" cy="11" r="10" fill="#ff6fae"/><circle cx="-8" cy="11" r="10" fill="#ff6fae"/><circle cx="-12" cy="-4" r="10" fill="#ff6fae"/><circle r="8" fill="#ffd84d"/></g>`},
  {id:'helado',en:'Ice cream',draw:h=>`<path d="M${h.x-13} ${h.y-26} L${h.x+13} ${h.y-26} L${h.x} ${h.y+8} Z" fill="#e4b46c" stroke="#b07b30" stroke-width="2"/><circle cx="${h.x}" cy="${h.y-36}" r="15" fill="#ff9ec4"/><circle cx="${h.x}" cy="${h.y-56}" r="13" fill="#9ce0c0"/><circle cx="${h.x+2}" cy="${h.y-72}" r="5" fill="#e63b2e"/>`},
  {id:'bandera',en:'Flag',draw:h=>`<path d="M${h.x} ${h.y+10} V${h.y-100}" stroke="#7d8489" stroke-width="5" stroke-linecap="round"/><path d="M${h.x+2} ${h.y-98} L${h.x+48} ${h.y-82} L${h.x+2} ${h.y-66} Z" fill="#4cb54a"/>`},
  {id:'pelota',en:'Ball',draw:h=>`<circle cx="${h.x+4}" cy="${h.y-16}" r="22" fill="#fff" stroke="#e63b2e" stroke-width="3"/><path d="M${h.x-18} ${h.y-16} Q${h.x+4} ${h.y-2} ${h.x+26} ${h.y-16}" stroke="#2f6fdb" stroke-width="5" fill="none"/>`},
  {id:'osito',en:'Teddy',draw:h=>`<g transform="translate(${h.x} ${h.y-30})"><circle cx="-12" cy="-22" r="8" fill="#a0673a"/><circle cx="12" cy="-22" r="8" fill="#a0673a"/><circle cx="0" cy="-10" r="17" fill="#a0673a"/><ellipse cx="0" cy="18" rx="16" ry="18" fill="#a0673a"/><circle cx="-6" cy="-12" r="2.5" fill="#222"/><circle cx="6" cy="-12" r="2.5" fill="#222"/><ellipse cx="0" cy="-4" rx="5" ry="4" fill="#e8c9a8"/></g>`}
];
const PARTS={head:CH_HEADS,face:CH_FACES,hat:CH_HATS,body:CH_BODIES,ropa:CH_ROPA,arms:CH_ARMS,legs:CH_LEGS,acc:CH_ACC};
const CH_TABS=[['head','🙂','Cabeza'],['face','😀','Cara'],['hat','🎩','Pelo'],['body','🟦','Cuerpo'],['ropa','👕','Ropa'],['arms','💪','Brazos'],['legs','👖','Piernas'],['acc','🎈','Cosas']];
const CH_COLORABLE={head:1,body:1,arms:1,legs:1};
const chFind=(slot,id)=>PARTS[slot].find(p=>p.id===id);
function chCur(){if(!save.char||save.char.v!==2)save.char={v:2,col:Object.assign({},CH_DEF_COL),pose:JSON.parse(JSON.stringify(CH_REST))};return save.char}
const chCol=(ch,s)=>(ch.col&&ch.col[s])||CH_DEF_COL[s];
// huequito con hilo (unión del títere)
const chPin=(x,y)=>`<g class="pin"><circle cx="${x}" cy="${y}" r="7.5" fill="#f3e3c3" stroke="rgba(60,35,10,.45)" stroke-width="2"/><circle cx="${x}" cy="${y}" r="3.2" fill="#5a3b1c"/><path d="M${x-6} ${y-6} L${x+6} ${y+6} M${x+6} ${y-6} L${x-6} ${y+6}" stroke="#d94a3a" stroke-width="2.4" stroke-linecap="round"/></g>`;
// ---------- dibujo del títere completo ----------
function chLimb(slot,side,def,col,skin,ang,joint,acc){
  const [a,b]=ang,L=slot==='arms'?56:60;
  const accSvg=acc?`<g transform="translate(0 56) rotate(${-(a+b)})">${acc.draw({x:0,y:0})}</g>`:'';
  return `<g class="limb" data-j="${side}" data-seg="0" transform="translate(${joint[0]} ${joint[1]}) rotate(${a})">${def.up(col)}`+
    `<g class="limb" data-j="${side}" data-seg="1" transform="translate(0 ${L}) rotate(${b})">${def.lo(col,skin)}${accSvg}${chPin(0,0)}</g></g>`;
}
function chSVG(ch,opts={}){
  const p=ch.pose||CH_REST,body=ch.body&&chFind('body',ch.body),J=(body||CH_BODIES[0]).j;
  const cH=chCol(ch,'head'),cB=chCol(ch,'body'),cA=chCol(ch,'arms'),cL=chCol(ch,'legs');
  let g='';
  if(opts.template){g+='<g class="tpl" fill="none" stroke="#c9a46a" stroke-width="4" stroke-dasharray="10 8">';
    if(!ch.head)g+='<circle cx="120" cy="114" r="50"/>';
    if(!ch.body)g+=`<path d="${CH_BODIES[0].d}"/>`;
    if(!ch.arms)g+=`<rect x="58" y="176" width="24" height="122" rx="12" transform="rotate(18 78 182)"/><rect x="158" y="176" width="24" height="122" rx="12" transform="rotate(-18 162 182)"/>`;
    if(!ch.legs)g+='<rect x="81" y="280" width="30" height="128" rx="14"/><rect x="129" y="280" width="30" height="128" rx="14"/>';
    g+='</g>'}
  const legs=ch.legs&&chFind('legs',ch.legs),arms=ch.arms&&chFind('arms',ch.arms),acc=ch.acc&&chFind('acc',ch.acc);
  if(legs)g+=`<g class="part" data-slot="legs">${chLimb('legs','ll',legs,cL,cH,p.ll,J.hl)}${chLimb('legs','lr',legs,cL,cH,p.lr,J.hr)}</g>`;
  if(arms)g+=`<g class="part" data-slot="arms">${chLimb('arms','al',arms,cA,cH,p.al,J.sl)}${chLimb('arms','ar',arms,cA,cH,p.ar,J.sr,acc)}</g>`;
  if(body){const id='chc'+(++chUid),r=ch.ropa&&chFind('ropa',ch.ropa);
    g+=`<g class="part" data-slot="body"><defs><clipPath id="${id}"><path d="${body.d}"/></clipPath></defs><path d="${body.d}" fill="${cB}" ${CH_STROKE}/>`+
      (r?`<g class="ropa" data-slot="ropa" clip-path="url(#${id})">${r.draw()}</g>`:'')+(body.extra||'')+`</g>`}
  if(body&&legs)g+=chPin(...J.hl)+chPin(...J.hr);
  if(body&&arms)g+=chPin(...J.sl)+chPin(...J.sr);
  if(ch.head){const h=chFind('head',ch.head),f=ch.face&&chFind('face',ch.face),hat=ch.hat&&chFind('hat',ch.hat);
    g+=`<g class="part head" data-slot="head" data-j="h" transform="translate(${J.n[0]} ${J.n[1]}) rotate(${p.h||0})">${h.draw(cH)}`+
      (f?`<g data-slot="face">${f.draw()}</g>`:'')+(hat?`<g data-slot="hat" transform="translate(-120 -158)">${hat.draw()}</g>`:'')+(body?chPin(0,0):'')+'</g>'}
  if(opts.pull&&body&&(arms||legs)){const pl=ch.pull||0,by=Math.max(J.hl[1],J.hr[1])+4;
    const ry=402+pl*.2;   // el aro baja un poquito; el resto lo hace el dedo
    g+=`<g class="pull"><path d="M120 ${by} V${ry-15}" stroke="#d94a3a" stroke-width="3" stroke-dasharray="6 4"/><circle class="ring" cx="120" cy="${ry}" r="15" fill="none" stroke="#d94a3a" stroke-width="7"/><circle class="ringhit" cx="120" cy="${ry}" r="30" fill="transparent"/></g>`}
  return `<svg viewBox="${opts.vb||'-10 -75 260 505'}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
// miniatura de una sola pieza para la bandeja
function chThumb(ch,slot,id){
  let inner='',vb='';
  if(slot==='head'||slot==='face'||slot==='hat'){const h=chFind('head',slot==='head'?id:(ch.head||'circulo')),hc=chCol(ch,'head');
    inner=(slot==='hat'?`<g opacity=".35">${h.draw(hc)}</g>`:h.draw(hc))+(slot==='face'?chFind('face',id).draw():slot==='head'&&ch.face?chFind('face',ch.face).draw():'')+(slot==='hat'?`<g transform="translate(-120 -158)">${chFind('hat',id).draw()}</g>`:'');vb='-75 -175 150 175'}
  else if(slot==='body'||slot==='ropa'){const b=chFind('body',slot==='body'?id:(ch.body||'rect')),u='cht'+(++chUid),r=slot==='ropa'?chFind('ropa',id):(ch.ropa&&chFind('ropa',ch.ropa));
    inner=`<defs><clipPath id="${u}"><path d="${b.d}"/></clipPath></defs><path d="${b.d}" fill="${chCol(ch,'body')}" ${CH_STROKE}/>`+(r?`<g clip-path="url(#${u})">${r.draw()}</g>`:'')+(b.extra||'');vb='40 150 160 160'}
  else if(slot==='arms'||slot==='legs'){const d=chFind(slot,id),L=slot==='arms'?56:60,c=chCol(ch,slot);
    inner=`<g transform="rotate(-12)">${d.up(c)}<g transform="translate(0 ${L}) rotate(24)">${d.lo(c,chCol(ch,'head'))}${chPin(0,0)}</g>${chPin(0,0)}</g>`;vb='-50 -20 100 160'}
  else{inner=chFind('acc',id).draw({x:0,y:0});vb='-50 -170 110 190'}
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}
// ---------- pantalla ----------
let chTab='head',chDrag=null,chSure=false,chMove=null,chAnim=0;
function renderChars(){
  const ch=chCur();
  $('#chFig').innerHTML=chSVG(ch,{template:true,pull:true});
  $('#chTabs').innerHTML=CH_TABS.map(([s,e,n])=>`<button class="chtab${s===chTab?' on':''}" data-t="${s}">${e}<span>${n}</span></button>`).join('');
  const colSlot=CH_COLORABLE[chTab]?chTab:chTab==='ropa'?'body':null;
  const sw=colSlot?`<div id="chSkins">${CH_COLORS.map(c=>`<button class="chsk${chCol(ch,colSlot)===c?' on':''}" data-c="${c}" data-s="${colSlot}" style="background:${c}"></button>`).join('')}</div>`:'';
  $('#chOpts').innerHTML=sw+'<div id="chGrid">'+PARTS[chTab].map(p=>`<button class="chopt${ch[chTab]===p.id?' on':''}" data-id="${p.id}">${chThumb(ch,chTab,p.id)}</button>`).join('')+'</div>';
  $('#chClear').textContent=chSure?'❓':'🗑️';
  $('#chGalN').textContent=(save.chars||[]).length||'';
}
function chPlace(slot,id){
  const ch=chCur(),was=!!(ch.head&&ch.body&&ch.legs&&ch.arms);ch[slot]=id;persist();renderChars();sSnap();buzz(12);
  const g=$('#chFig').querySelector(`[data-slot="${slot}"]`);
  if(g){g.classList.add('chpop');const r=g.getBoundingClientRect();sparks(r.left+r.width/2,r.top+r.height/2,'#ffd84d',10)}
  const p=chFind(slot,id);say(p.en);word(p.en,'#fff',$('#chStage'));
  if(!was&&ch.head&&ch.body&&ch.legs&&ch.arms)setTimeout(()=>{confetti();sFan();say('You made a friend! Move it!',true);chDance(2)},450);
}
$('#goChars').addEventListener('click',()=>{ac();sTap();chSure=false;show('chars')});
$('#chBack').addEventListener('pointerdown',()=>{ac();cancelAnimationFrame(chAnim);show('home')});
$('#chTabs').addEventListener('click',e=>{const b=e.target.closest('.chtab');if(!b)return;ac();sTap();chTab=b.dataset.t;renderChars();
  say({head:'Heads',face:'Faces',hat:'Hats',body:'Bodies',ropa:'Clothes',arms:'Arms',legs:'Legs',acc:'Toys'}[chTab])});
$('#chOpts').addEventListener('click',e=>{const k=e.target.closest('.chsk');if(!k)return;ac();const ch=chCur();ch.col[k.dataset.s]=k.dataset.c;persist();sTap();renderChars()});
// arrastrar una pieza desde la bandeja (tocar también la pone)
$('#chOpts').addEventListener('pointerdown',e=>{const b=e.target.closest('.chopt');if(!b)return;ac();
  chDrag={id:b.dataset.id,slot:chTab,x0:e.clientX,y0:e.clientY,moved:false,el:null,src:b}});
document.addEventListener('pointermove',e=>{
  if(chMove){chMoveTo(e);return}
  if(!chDrag)return;
  if(!chDrag.moved&&Math.hypot(e.clientX-chDrag.x0,e.clientY-chDrag.y0)<10)return;
  if(!chDrag.moved){chDrag.moved=true;const d=document.createElement('div');d.className='chghost';d.innerHTML=chDrag.src.innerHTML;document.body.appendChild(d);chDrag.el=d;sTap()}
  chDrag.el.style.left=e.clientX+'px';chDrag.el.style.top=e.clientY+'px';
  const r=$('#chStage').getBoundingClientRect();$('#chStage').classList.toggle('chover',e.clientX>r.left&&e.clientX<r.right&&e.clientY>r.top&&e.clientY<r.bottom)},{passive:true});
document.addEventListener('pointerup',e=>{
  if(chMove){chMoveEnd();return}
  if(!chDrag)return;const d=chDrag;chDrag=null;$('#chStage').classList.remove('chover');
  if(!d.moved){chPlace(d.slot,d.id);return}
  d.el.remove();const r=$('#chStage').getBoundingClientRect();
  if(e.clientX>r.left&&e.clientX<r.right&&e.clientY>r.top&&e.clientY<r.bottom)chPlace(d.slot,d.id);else sPop()});
document.addEventListener('pointercancel',()=>{if(chDrag){if(chDrag.el)chDrag.el.remove();chDrag=null;$('#chStage').classList.remove('chover')}if(chMove)chMoveEnd()});
// ---------- mover el títere con el dedo ----------
// tocar una pieza la cambia por la siguiente; arrastrarla la gira en su huequito; el cordón lo hace saltar
const chAng=(e,g)=>{const s=g.ownerSVGElement,pt=s.createSVGPoint();pt.x=0;pt.y=0;const c=pt.matrixTransform(g.getScreenCTM());return Math.atan2(e.clientY-c.y,e.clientX-c.x)*180/Math.PI};
$('#chFig').addEventListener('pointerdown',e=>{
  const ch=chCur();cancelAnimationFrame(chAnim);
  if(e.target.closest('.ringhit')){chMove={kind:'pull',y0:e.clientY,moved:true,scale:505/$('#chFig').getBoundingClientRect().height};e.preventDefault();return}
  const limb=e.target.closest('.limb'),head=e.target.closest('.head'),part=e.target.closest('[data-slot]');
  if(!part)return;
  if(limb){const j=limb.dataset.j,seg=+limb.dataset.seg;chMove={kind:'rot',j,seg,g:limb,a0:chAng(e,limb),v0:ch.pose[j][seg],x0:e.clientX,y0:e.clientY,moved:false,slot:part.dataset.slot}}
  else if(head)chMove={kind:'head',g:head,a0:chAng(e,head),v0:ch.pose.h||0,x0:e.clientX,y0:e.clientY,moved:false,slot:e.target.closest('[data-slot="hat"]')?'hat':e.target.closest('[data-slot="face"]')?'face':'head'};
  else chMove={kind:'tap',x0:e.clientX,y0:e.clientY,moved:false,slot:e.target.closest('[data-slot="ropa"]')?'ropa':part.dataset.slot};
  e.preventDefault();
});
const chLim={al:[[-200,200],[-150,150]],ar:[[-200,200],[-150,150]],ll:[[-110,110],[-130,130]],lr:[[-110,110],[-130,130]]};
function chMoveTo(e){const m=chMove,ch=chCur();
  if(!m.moved&&Math.hypot(e.clientX-m.x0,e.clientY-m.y0)<7)return;m.moved=true;
  if(m.kind==='pull'){ch.pull=Math.max(0,Math.min(70,(e.clientY-m.y0)*m.scale));chPullPose(ch.pull/70);chRedraw();return}
  if(m.kind==='tap')return;
  let d=chAng(e,m.g)-m.a0;while(d>180)d-=360;while(d<-180)d+=360;
  if(m.kind==='head')ch.pose.h=Math.max(-35,Math.min(35,m.v0+d));
  else{const lim=chLim[m.j][m.seg];ch.pose[m.j][m.seg]=Math.max(lim[0],Math.min(lim[1],m.v0+d))}
  chRedraw();m.g=$('#chFig').querySelector(m.kind==='head'?'.head':`.limb[data-j="${m.j}"][data-seg="${m.seg}"]`)||m.g;
  if(Math.random()<.08)tone(500+Math.random()*300,0,.05,'sine',.05)}
function chMoveEnd(){const m=chMove;chMove=null;const ch=chCur();
  if(m.kind==='pull'){chSpringBack();return}
  if(!m.moved){const L=PARTS[m.slot],i=L.findIndex(p=>p.id===ch[m.slot]);chTab=m.slot;chPlace(m.slot,L[(i+1)%L.length].id);return}
  persist();click()}
function chRedraw(){$('#chFig').innerHTML=chSVG(chCur(),{template:true,pull:true})}
// cordón: jala y brazos y piernas suben (muñeco saltarín)
function chPullPose(t){const ch=chCur(),R=CH_REST;ch.pose.al=[R.al[0]+150*t,R.al[1]+20*t];ch.pose.ar=[R.ar[0]-150*t,R.ar[1]-20*t];ch.pose.ll=[R.ll[0]+55*t,R.ll[1]-40*t];ch.pose.lr=[R.lr[0]-55*t,R.lr[1]+40*t]}
function chSpringBack(){const ch=chCur(),p0=ch.pull||0;let v=0,x=p0;tone(660,0,.1,'triangle',.12);buzz(10);
  const step=()=>{v=(v-x*.25)*.72;x+=v;ch.pull=Math.max(0,x);chPullPose(Math.max(0,x)/70);chRedraw();
    if(Math.abs(x)>.6||Math.abs(v)>.6)chAnim=requestAnimationFrame(step);else{ch.pull=0;ch.pose=JSON.parse(JSON.stringify(CH_REST));chRedraw();persist()}};
  chAnim=requestAnimationFrame(step)}
function chDance(n=3){const ch=chCur();if(!(ch.arms||ch.legs))return;let t0=null,beat=0;const T=650;
  const step=ts=>{if(t0===null)t0=ts;const k=(ts-t0)/T;if(k>=n||screen!=='chars'){ch.pull=0;ch.pose=JSON.parse(JSON.stringify(CH_REST));chRedraw();persist();return}
    const s=Math.sin(k*Math.PI*2-Math.PI/2)*.5+.5;ch.pull=s*70;chPullPose(s);ch.pose.h=Math.sin(k*Math.PI*2)*12;chRedraw();
    if(s>.92&&!beat){beat=1;tone(784,0,.1,'triangle',.12)}if(s<.5)beat=0;chAnim=requestAnimationFrame(step)};
  cancelAnimationFrame(chAnim);chAnim=requestAnimationFrame(step)}
$('#chDance').addEventListener('click',()=>{ac();say('Dance!');chDance(4)});
$('#chRand').addEventListener('click',()=>{ac();const ch=chCur();for(const s of Object.keys(PARTS))ch[s]=PARTS[s][Math.random()*PARTS[s].length|0].id;
  if(Math.random()<.3)ch.acc=null;if(Math.random()<.3)ch.hat=null;if(Math.random()<.25)ch.ropa=null;
  for(const s of Object.keys(CH_COLORABLE))ch.col[s]=CH_COLORS[Math.random()*CH_COLORS.length|0];
  if(Math.random()<.6)ch.col.head=CH_COLORS[Math.random()*5|0];
  ch.pose=JSON.parse(JSON.stringify(CH_REST));persist();renderChars();sFan();
  $('#chFig').querySelectorAll('.part').forEach((g,i)=>{g.style.animationDelay=i*60+'ms';g.classList.add('chpop')});say('Surprise!')});
$('#chClear').addEventListener('click',()=>{ac();if(!chSure){chSure=true;renderChars();setTimeout(()=>{chSure=false;if(screen==='chars')renderChars()},2500);return}
  chSure=false;save.char=null;chCur();persist();sPop();renderChars()});
// galería
$('#chSave').addEventListener('click',()=>{ac();const ch=chCur();if(!ch.head&&!ch.body&&!ch.legs){sPop();toast('Primero arma tu personaje');return}
  save.chars=save.chars||[];save.chars.unshift(JSON.parse(JSON.stringify(ch)));if(save.chars.length>12)save.chars.length=12;persist();sCoin();say('Saved!');toast('💾 Guardado en la galería');renderChars()});
$('#chGal').addEventListener('click',()=>{ac();sTap();chGallery()});
function chGallery(){const L=(save.chars||[]).filter(c=>c.v===2);save.chars=L;
  $('#chGalGrid').innerHTML=L.length?L.map((c,i)=>`<div class="chg"><button class="chgl" data-i="${i}">${chSVG(c)}</button><button class="chgx" data-x="${i}">✕</button></div>`).join(''):'<p style="font-weight:800;color:#5d86a0">Todavía no hay personajes guardados.</p>';
  $('#chGalOv').classList.add('show')}
$('#chGalGrid').addEventListener('click',e=>{const x=e.target.closest('.chgx');if(x){save.chars.splice(+x.dataset.x,1);persist();sPop();chGallery();renderChars();return}
  const b=e.target.closest('.chgl');if(!b)return;save.char=JSON.parse(JSON.stringify(save.chars[+b.dataset.i]));persist();$('#chGalOv').classList.remove('show');sFan();renderChars()});
$('#chGalClose').addEventListener('click',()=>$('#chGalOv').classList.remove('show'));
