// =====================================================================
//  FICHAS — basadas en piezas reales de Lego, vistas de frente.
//  Medidas reales: botón (stud) cada 8 mm · ladrillo 9,6 mm de alto · placa 3,2 mm (3 placas = 1 ladrillo)
//  botón de 4,8 mm de diámetro y 1,7 mm de alto.  Unidad horizontal = 1 botón, unidad vertical = 1 placa.
// =====================================================================
const PL=3.2/8;            // alto de una placa en "botones"
const STUD_W=4.8/8, STUD_H=1.7/8;
const CAT={
  // ladrillos (Brick 1xN)
  b1:{w:1,h:3,kind:'brick',name:'Ladrillo 1x1'}, b2:{w:2,h:3,kind:'brick',name:'Ladrillo 1x2'},
  b3:{w:3,h:3,kind:'brick',name:'Ladrillo 1x3'}, b4:{w:4,h:3,kind:'brick',name:'Ladrillo 1x4'},
  b6:{w:6,h:3,kind:'brick',name:'Ladrillo 1x6'}, b8:{w:8,h:3,kind:'brick',name:'Ladrillo 1x8'},
  // placas (Plate 1xN)
  p1:{w:1,h:1,kind:'brick',name:'Placa 1x1'}, p2:{w:2,h:1,kind:'brick',name:'Placa 1x2'},
  p3:{w:3,h:1,kind:'brick',name:'Placa 1x3'}, p4:{w:4,h:1,kind:'brick',name:'Placa 1x4'},
  p6:{w:6,h:1,kind:'brick',name:'Placa 1x6'},
  // lisos sin botones (Tile 1xN)
  t1:{w:1,h:1,kind:'tile',name:'Liso 1x1'}, t2:{w:2,h:1,kind:'tile',name:'Liso 1x2'}, t4:{w:4,h:1,kind:'tile',name:'Liso 1x4'},
  // tejas (Slope 45° 2x1), cumbrera (Slope 45° 2x2 doble) y teja queso (Slope 30° 1x1x2/3)
  sI:{w:2,h:3,kind:'slopeI',name:'Teja 45° 2x1'}, sD:{w:2,h:3,kind:'slopeD',name:'Teja 45° 2x1'},
  ri:{w:2,h:3,kind:'ridge',name:'Cumbrera 45°'},
  qI:{w:1,h:2,kind:'cheeseI',name:'Teja queso 1x1'}, qD:{w:1,h:2,kind:'cheeseD',name:'Teja queso 1x1'},
  // especiales
  rd:{w:1,h:3,kind:'round',name:'Ladrillo redondo 1x1'}, ojo:{w:1,h:3,kind:'eye',name:'Ladrillo 1x1 con ojo'},
  ar:{w:4,h:3,kind:'arch',name:'Arco 1x4'}, ru:{w:2,h:5,kind:'wheel',name:'Rueda'},
  // nuevas para el modo libre
  b10:{w:10,h:3,kind:'brick',name:'Ladrillo 1x10'}, p8:{w:8,h:1,kind:'brick',name:'Placa 1x8'}, t3:{w:3,h:1,kind:'tile',name:'Liso 1x3'},
  vI:{w:2,h:3,kind:'invI',name:'Teja invertida 2x1'}, vD:{w:2,h:3,kind:'invD',name:'Teja invertida 2x1'},
  cI:{w:2,h:2,kind:'curveI',name:'Teja curva 2x1'}, cD:{w:2,h:2,kind:'curveD',name:'Teja curva 2x1'},
  ar6:{w:6,h:6,kind:'arch',name:'Arco 1x6x2'}, do:{w:2,h:3,kind:'dome',name:'Ladrillo cúpula 1x2'},
  cn:{w:1,h:3,kind:'cone',name:'Cono 1x1'}, ve:{w:2,h:6,kind:'window',name:'Ventana 1x2x2'},
  pu:{w:4,h:15,kind:'door',name:'Puerta 1x4x5'}, va:{w:4,h:3,kind:'fence',name:'Cerca 1x4'},
  cara:{w:2,h:3,kind:'face',name:'Ladrillo con carita'}, fl:{w:1,h:3,kind:'flower',name:'Flor'},
  mt:{w:2,h:3,kind:'bush',name:'Arbusto'}, ba:{w:1,h:6,kind:'flag',name:'Bandera'},
  rg:{w:3,h:8,kind:'wheel',name:'Rueda grande'}
};
const FIXCOL={ru:'x',rg:'x'};const pcCol=(k,c)=>FIXCOL[k]||c;
const COL={r:['#d9281c','#a01a10'],y:['#fac80a','#c99a00'],b:['#9fd8f2','#5aaed4'],o:['#fe8a18','#c96200'],
  g:['#00a33a','#007428'],n:['#7c4e2a','#56331a'],w:['#f4f4f4','#c8ccd0'],p:['#8a4fc7','#5f3191'],
  k:['#a0a5a9','#6f7478'],m:['#ff8ec6','#d95a9b'],a:['#0055bf','#003b87'],x:['#272a2d','#0d0e10'],
  L:['#a5ca18','#77940c'],D:['#184632','#0c2b1d'],C:['#e4cd9e','#b9a172'],M:['#c9208e','#911465'],B:['#0a3463','#041f3d'],R:['#7b1a14','#52100c'],
  T:['#e6f4ffb0','#9fbdd0b0'],U:['#4aa8ffa8','#1f6fc0b0'],V:['#ff4a3aa8','#b81e12b0'],Y:['#ffe64aa8','#c9a800b0']};
const darkHex=h=>'#'+[1,3,5].map(i=>Math.round(parseInt(h.substr(i,2),16)*.72).toString(16).padStart(2,'0')).join('');
function applyMix(){(save.mix||[]).forEach(m=>{COL[m.k]=[m.h,darkHex(m.h)]})}
const P=(k,c,x,y)=>({k,c,x,y,w:CAT[k].w,h:CAT[k].h});
const key=s=>s.k+s.c;

