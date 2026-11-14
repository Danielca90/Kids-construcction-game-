// =====================================================================
//  MODELOS — armados ficha por ficha, como un set real.
//  x en botones, y en placas (1 ladrillo = 3 placas). Siempre la ficha más grande que sirva;
//  la cantidad de fichas sale del detalle (ventanas, luces, tejas, arcos, ruedas...), no de rellenar.
// =====================================================================
function makeBuilder(){
  const a=[];
  const seamsAt=y=>{const s=new Set();a.forEach(p=>{if(p.y+p.h===y){s.add(p.x);s.add(p.x+p.w)}});return s};
  const add=(k,c,x,y)=>{a.push(P(k,c,x,y))};
  // relleno con fichas grandes, evitando que las uniones queden alineadas con la fila de abajo (muro trabado)
  const run=(sizes,pre,x,y,w,c)=>{const seams=seamsAt(y);let p=x;const end=x+w;
    while(p<end){const r=end-p;let pick=null;
      for(const s of sizes){if(s>r)continue;const e=p+s;if(e===end||!seams.has(e)){pick=s;break}}
      if(pick===null)pick=sizes.find(s=>s<=r);add(pre+pick,c,p,y);p+=pick}};
  return {pieces:a,
    b:(x,y,w,c)=>add('b'+w,c,x,y), p:(x,y,w,c)=>add('p'+w,c,x,y), t:(x,y,w,c)=>add('t'+w,c,x,y),
    k:(k,x,y,c)=>add(k,c,x,y), wheel:(x,y)=>add('ru','x',x,y),
    wall:(x,y,w,c)=>run([8,6,4,3,2,1],'b',x,y,w,c),
    plates:(x,y,w,c)=>run([6,4,3,2,1],'p',x,y,w,c),
    tiles:(x,y,w,c)=>run([4,2,1],'t',x,y,w,c)};
}
// piezas de escena reutilizables
function tree(B,x,y){B.b(x+2,y,2,'n');B.b(x+2,y+3,2,'n');B.k('sI',x,y+6,'g');B.b(x+2,y+6,2,'g');B.k('sD',x+4,y+6,'g');
  B.k('sI',x+1,y+9,'g');B.k('sD',x+3,y+9,'g');B.k('ri',x+2,y+12,'g')}
function hut(B,x,y,wc,rc){B.b(x,y,2,wc);B.b(x+2,y,2,'n');B.b(x+4,y,2,wc);B.b(x,y+3,2,'b');B.b(x+2,y+3,2,'n');B.b(x+4,y+3,2,'b');
  B.b(x,y+6,6,wc);B.k('sI',x,y+9,rc);B.b(x+2,y+9,2,rc);B.k('sD',x+4,y+9,rc);B.k('sI',x+1,y+12,rc);B.k('sD',x+3,y+12,rc)}
function minicar(B,x,y,c){B.wheel(x,y);B.wheel(x+4,y);B.b(x,y+3,1,'o');B.b(x+1,y+3,4,c);B.b(x+5,y+3,1,'y');
  B.b(x,y+6,2,c);B.k('sD',x+2,y+6,'b');B.p(x+4,y+6,2,c);B.p(x,y+9,3,c)}
const MODELS=[
// ---------------- pequeños ----------------
{id:'torre',name:'Torre',emo:'🗼',anim:'jump',build(B){
  B.b(0,0,2,'r');B.b(0,3,2,'y');B.b(0,6,2,'a');B.k('rd',0,9,'w')}},
{id:'hongo',name:'Hongo',emo:'🍄',anim:'jump',build(B){
  B.b(1,0,2,'w');B.k('sI',0,3,'r');B.k('sD',2,3,'r')}},
{id:'barquito',name:'Barquito',emo:'⛵',anim:'sail',build(B){
  B.b(0,0,4,'a');B.b(1,3,1,'n');B.k('sD',2,3,'w');B.p(1,6,1,'r')}},
{id:'casita',name:'Casita',emo:'🏡',anim:'jump',build(B){
  B.b(0,0,2,'y');B.b(2,0,2,'n');B.b(4,0,2,'y');
  B.b(0,3,2,'b');B.b(2,3,2,'n');B.b(4,3,2,'b');
  B.b(0,6,6,'y');
  B.k('sI',0,9,'r');B.b(2,9,2,'r');B.k('sD',4,9,'r');
  B.k('sI',1,12,'r');B.k('sD',3,12,'r')}},
{id:'pollito',name:'Pollito',emo:'🐥',anim:'jump',build(B){
  B.p(1,0,1,'o');B.p(3,0,1,'o');
  B.b(0,1,4,'y');
  B.k('qI',0,4,'y');B.b(1,4,3,'y');
  B.b(2,7,1,'y');B.k('ojo',3,7,'y');B.k('qD',4,7,'o');
  B.p(2,10,2,'y')}},
{id:'arbol',name:'Árbol',emo:'🌳',anim:'sway',build(B){
  B.b(2,0,2,'n');B.b(2,3,2,'n');
  B.k('sI',0,6,'g');B.b(2,6,2,'g');B.k('sD',4,6,'g');
  B.k('sI',1,9,'g');B.k('sD',3,9,'g');
  B.k('ri',2,12,'g')}},
{id:'carrito',name:'Carrito',emo:'🚙',anim:'drive',build(B){
  B.wheel(0,0);B.wheel(4,0);
  B.b(0,3,1,'o');B.b(1,3,4,'r');B.b(5,3,1,'y');
  B.b(0,6,2,'r');B.k('sD',2,6,'b');B.p(4,6,2,'r');
  B.p(0,9,3,'r')}},
{id:'helado',name:'Helado',emo:'🍦',anim:'jump',build(B){
  B.b(1,0,1,'n');B.b(0,3,3,'m');B.k('rd',1,6,'w')}},
{id:'semaforo',name:'Semáforo',emo:'🚦',anim:'jump',build(B){
  B.b(0,0,1,'k');B.k('rd',0,3,'g');B.k('rd',0,6,'y');B.k('rd',0,9,'r')}},
{id:'puente',name:'Puente',emo:'🌉',anim:'jump',build(B){
  B.b(0,0,1,'a');B.b(3,0,1,'a');B.b(0,3,4,'r')}},
{id:'florecita',name:'Florecita',emo:'🌼',anim:'sway',build(B){
  B.b(0,0,3,'o');B.b(1,3,1,'g');B.k('rd',1,6,'y')}},
{id:'carritomini',name:'Carrito mini',emo:'🚗',anim:'drive',build(B){
  B.wheel(0,0);B.wheel(3,0);B.b(0,3,4,'a');B.b(4,3,1,'y')}},
{id:'muneco',name:'Muñeco de nieve',emo:'⛄',anim:'jump',build(B){
  B.b(0,0,3,'w');B.b(0,3,1,'w');B.k('ojo',1,3,'w');B.b(2,3,1,'w');B.p(0,6,3,'x');B.b(1,7,1,'x')}},
{id:'barquitovela',name:'Barquito de vela',emo:'⛵',anim:'sail',build(B){
  B.b(0,0,6,'n');B.b(2,3,1,'n');B.k('sD',3,3,'w');B.b(2,6,1,'n');B.b(3,6,1,'w');B.p(2,9,1,'r')}},
{id:'camioncito',name:'Camioncito',emo:'🚚',anim:'drive',build(B){
  B.wheel(0,0);B.wheel(5,0);B.b(0,3,6,'y');B.b(0,6,4,'o');B.b(4,6,1,'y');B.b(5,6,1,'b');B.p(4,9,2,'y')}},
{id:'trencito',name:'Trencito',emo:'🚂',anim:'drive',build(B){
  B.wheel(0,0);B.wheel(2,0);B.wheel(4,0);B.wheel(6,0);
  B.b(0,3,4,'r');B.b(4,3,4,'a');B.b(1,6,1,'x');B.b(2,6,2,'r');B.k('rd',5,6,'y');B.k('rd',6,6,'g')}},
// ---------------- medianos ----------------
{id:'flor',name:'Flores en maceta',emo:'🌸',anim:'sway',build(B){
  B.wall(1,0,5,'o');B.wall(0,3,7,'o');B.plates(0,6,7,'R');
  // flor grande
  B.b(2,7,1,'g');B.k('qI',1,10,'g');B.b(2,10,1,'g');B.k('qD',3,10,'g');
  B.k('rd',2,13,'m');B.k('rd',1,16,'m');B.k('rd',2,16,'y');B.k('rd',3,16,'m');B.k('rd',2,19,'m');
  // flor chica
  B.b(5,7,1,'g');B.k('rd',4,10,'a');B.k('rd',5,10,'w');B.k('rd',6,10,'a');B.k('rd',5,13,'a')}},
{id:'cohete',name:'Cohete',emo:'🚀',anim:'launch',build(B){
  B.t(3,0,2,'y');B.p(3,1,2,'o');B.p(2,2,4,'k');
  B.k('sI',0,3,'r');B.b(2,3,4,'w');B.k('sD',6,3,'r');
  B.b(1,6,1,'k');B.b(2,6,1,'w');B.k('rd',3,6,'b');B.k('rd',4,6,'b');B.b(5,6,1,'w');B.b(6,6,1,'k');
  B.b(2,9,4,'r');B.b(2,12,4,'w');
  B.k('sI',2,15,'r');B.k('sD',4,15,'r');B.k('ri',3,18,'r')}},
{id:'monstruo',name:'Monstruo',emo:'👾',anim:'jump',build(B){
  B.p(1,0,2,'p');B.p(5,0,2,'p');B.b(1,1,2,'p');B.b(5,1,2,'p');
  B.b(1,4,6,'p');
  B.b(0,7,1,'p');B.b(1,7,1,'p');B.b(2,7,4,'L');B.b(6,7,1,'p');B.b(7,7,1,'p');
  B.k('rd',0,10,'p');B.b(1,10,1,'p');B.b(2,10,1,'w');B.b(3,10,2,'x');B.b(5,10,1,'w');B.b(6,10,1,'p');B.k('rd',7,10,'p');
  B.b(1,13,1,'p');B.k('ojo',2,13,'p');B.b(3,13,2,'p');B.k('ojo',5,13,'p');B.b(6,13,1,'p');
  B.b(1,16,6,'p');B.k('qI',1,19,'y');B.k('qD',6,19,'y')}},
{id:'invento',name:'Invento',emo:'🛠️',anim:'jump',build(B){
  // inspirado en un invento de verdad: muchos colores y una ventana en el medio
  B.b(0,0,4,'y');B.b(4,0,6,'y');
  B.b(1,3,2,'g');B.b(3,3,4,'n');B.b(7,3,2,'R');
  B.b(2,6,6,'B');
  B.b(0,9,6,'k');B.b(6,9,4,'k');
  B.b(0,12,2,'b');B.b(2,12,2,'C');B.b(4,12,4,'a');B.b(8,12,2,'b');
  B.b(0,15,1,'p');B.b(2,15,4,'o');B.b(8,15,2,'D');
  B.b(0,18,1,'k');B.b(2,18,4,'o');B.b(8,18,2,'L');
  B.b(0,21,8,'r');B.b(8,21,2,'k')}},
{id:'casa',name:'Casa',emo:'🏠',anim:'jump',build(B){
  B.plates(0,0,10,'g');
  B.b(0,1,4,'y');B.b(4,1,2,'n');B.b(6,1,4,'y');
  B.b(0,4,1,'y');B.b(1,4,2,'b');B.b(3,4,1,'y');B.b(4,4,2,'n');B.b(6,4,1,'y');B.b(7,4,2,'b');B.b(9,4,1,'y');
  B.wall(0,7,10,'y');
  B.k('sI',0,10,'r');B.wall(2,10,6,'r');B.k('sD',8,10,'r');
  B.k('sI',1,13,'r');B.wall(3,13,4,'r');B.k('sD',7,13,'r');
  B.k('sI',2,16,'r');B.b(4,16,2,'r');B.k('sD',6,16,'r');
  B.k('sI',3,19,'r');B.k('sD',5,19,'r');
  B.b(8,16,1,'R');B.p(8,19,1,'k')}},
// ---------------- grandes ----------------
{id:'carro',name:'Carro deportivo',emo:'🚗',anim:'drive',build(B){
  B.wheel(2,0);B.wheel(11,0);
  B.plates(5,2,5,'k');                                         // estribo
  B.b(0,3,1,'k');B.k('ar',1,3,'r');B.wall(5,3,5,'r');B.k('ar',10,3,'r');B.b(14,3,2,'k');   // guardabarros
  B.b(0,6,1,'R');B.wall(1,6,13,'r');B.b(14,6,1,'r');B.b(15,6,1,'y');                     // faroles
  B.tiles(0,9,16,'w');                                         // franja de carreras
  B.b(0,10,3,'r');B.k('sI',3,10,'b');B.b(5,10,1,'r');B.b(6,10,2,'b');B.b(8,10,1,'r');B.k('sD',9,10,'b');B.plates(11,10,5,'r');
  B.p(11,11,1,'x');                                            // espejo
  B.p(0,13,1,'x');B.p(2,13,1,'x');B.p(0,14,3,'x');             // alerón
  B.p(4,13,6,'r');B.b(5,14,3,'n');B.p(5,17,3,'k');B.k('rd',9,14,'k')}},  // techo, maleta, antena
{id:'robot',name:'Robot',emo:'🤖',anim:'jump',build(B){
  B.p(1,0,3,'k');B.p(6,0,3,'k');
  B.b(2,1,1,'k');B.b(7,1,1,'k');B.k('rd',2,4,'x');B.k('rd',7,4,'x');B.b(2,7,1,'k');B.b(7,7,1,'k');
  B.plates(1,10,8,'x');
  B.k('rd',0,11,'k');B.wall(1,11,8,'a');B.k('rd',9,11,'k');
  B.b(0,14,1,'k');B.b(1,14,2,'a');B.k('rd',3,14,'r');B.k('rd',4,14,'y');B.k('rd',5,14,'g');B.b(6,14,3,'a');B.b(9,14,1,'k');
  B.b(0,17,1,'k');B.wall(1,17,8,'a');B.b(9,17,1,'k');
  B.p(4,20,2,'x');
  B.b(2,21,1,'k');B.b(3,21,4,'x');B.b(7,21,1,'k');
  B.k('rd',1,24,'r');B.b(2,24,1,'k');B.k('ojo',3,24,'k');B.b(4,24,2,'k');B.k('ojo',6,24,'k');B.b(7,24,1,'k');B.k('rd',8,24,'r');
  B.wall(2,27,6,'k');B.b(4,30,1,'k');B.k('rd',4,33,'r')}},
{id:'castillo',name:'Castillo',emo:'🏰',anim:'jump',build(B){
  B.plates(0,0,16,'g');
  for(const y of [1,4]){B.wall(0,y,4,'k');B.b(4,y,2,'k');B.b(6,y,4,'n');B.b(10,y,2,'k');B.wall(12,y,4,'k')}
  B.b(0,7,1,'k');B.b(1,7,2,'x');B.b(3,7,1,'k');B.b(4,7,2,'k');B.k('ar',6,7,'k');B.b(10,7,2,'k');B.b(12,7,1,'k');B.b(13,7,2,'x');B.b(15,7,1,'k');
  B.wall(0,10,4,'k');B.wall(4,10,8,'k');B.wall(12,10,4,'k');
  for(const x of [4,6,8,10])B.b(x,13,1,'k');                   // almenas
  B.wall(0,13,4,'k');B.wall(12,13,4,'k');
  B.b(0,16,1,'k');B.b(1,16,2,'x');B.b(3,16,1,'k');B.b(12,16,1,'k');B.b(13,16,2,'x');B.b(15,16,1,'k');
  for(const x of [0,12]){B.k('sI',x,19,'r');B.k('sD',x+2,19,'r');B.k('ri',x+1,22,'r');B.b(x+1,25,1,'n');B.p(x+2,27,2,'y')}}},
{id:'tren',name:'Tren',emo:'🚂',anim:'drive',build(B){
  B.plates(0,0,35,'k');                                        // rieles
  // locomotora
  B.wheel(1,1);B.wheel(4,1);B.wheel(8,1);
  B.wall(0,4,12,'x');B.b(12,4,1,'r');
  B.b(0,7,4,'r');B.wall(4,7,8,'a');B.k('rd',12,7,'y');
  B.b(0,10,1,'r');B.b(1,10,2,'b');B.b(3,10,1,'r');B.plates(4,10,8,'y');B.wall(4,11,8,'a');
  B.b(0,13,4,'r');B.k('ri',5,14,'y');B.k('rd',7,14,'y');B.b(9,14,2,'x');
  B.plates(0,16,5,'x');B.b(9,17,2,'x');B.p(8,20,4,'x');
  B.k('rd',9,23,'w');B.k('rd',10,26,'w');B.k('rd',11,29,'w');   // humo
  B.p(13,4,1,'k');
  // vagón de pasajeros
  B.wheel(15,1);B.wheel(20,1);
  B.wall(14,4,10,'x');B.wall(14,7,10,'g');
  B.b(14,10,1,'g');B.b(15,10,2,'b');B.b(17,10,1,'g');B.b(18,10,2,'b');B.b(20,10,1,'g');B.b(21,10,2,'b');B.b(23,10,1,'g');
  B.wall(14,13,10,'g');B.plates(13,16,12,'w');
  B.p(24,4,2,'k');
  // vagón de carga
  B.wheel(27,1);B.wheel(31,1);
  B.wall(26,4,9,'x');B.wall(26,7,9,'n');
  B.b(26,10,1,'n');B.b(27,10,3,'o');B.b(30,10,4,'y');B.b(34,10,1,'n');
  B.b(28,13,2,'m');B.k('rd',30,13,'a');B.b(31,13,2,'L')}},
{id:'dino',name:'Dinosaurio',emo:'🦖',anim:'jump',build(B){
  B.plates(4,0,4,'D');B.plates(10,0,4,'D');
  B.b(5,1,2,'g');B.b(11,1,2,'g');B.b(5,4,2,'g');B.b(11,4,2,'g');
  B.b(4,7,3,'g');B.b(10,7,3,'g');
  B.k('sI',0,10,'g');B.b(2,10,3,'g');B.wall(5,10,8,'L');B.b(13,10,2,'g');
  B.k('sI',2,13,'g');B.wall(4,13,11,'g');
  B.k('qI',3,16,'D');B.k('qD',4,16,'D');B.k('sI',5,16,'g');B.wall(7,16,8,'g');B.k('qD',15,16,'g');B.p(16,16,1,'w');
  B.k('qI',8,19,'D');B.k('qD',9,19,'D');B.k('qI',10,19,'D');B.k('qD',11,19,'D');
  B.wall(12,19,3,'g');B.b(15,19,3,'g');
  B.b(12,22,3,'g');B.b(15,22,1,'w');B.b(16,22,1,'x');B.b(17,22,1,'w');
  B.b(12,25,2,'g');B.k('ojo',14,25,'g');B.b(15,25,3,'g');
  B.wall(12,28,5,'g');B.k('qI',12,31,'D');B.k('qD',13,31,'D');
  // volcán con lava
  const V=22;B.plates(V,0,14,'n');B.wall(V,1,14,'n');B.k('sI',V,4,'n');B.wall(V+2,4,10,'n');B.k('sD',V+12,4,'n');
  B.k('sI',V+2,7,'n');B.b(V+4,7,2,'n');B.b(V+6,7,2,'o');B.b(V+8,7,2,'n');B.k('sD',V+10,7,'n');
  B.k('sI',V+4,10,'n');B.b(V+6,10,2,'r');B.k('sD',V+8,10,'n');
  B.k('rd',V+6,13,'o');B.k('rd',V+7,13,'r');B.k('rd',V+5,16,'y');B.k('rd',V+8,17,'o');
  B.p(19,0,2,'n');B.k('rd',19,1,'C');B.k('rd',20,1,'C')}},
// ---------------- enormes (en sobres) ----------------
{id:'bomberos',name:'Bomberos',emo:'🚒',anim:'drive',build(B){
  B.wheel(2,0);B.wheel(6,0);B.wheel(20,0);B.wheel(25,0);
  B.plates(0,2,1,'k');B.plates(9,2,10,'k');
  B.b(0,3,1,'k');B.k('ar',1,3,'r');B.k('ar',5,3,'r');B.wall(9,3,10,'r');B.k('ar',19,3,'r');B.k('ar',24,3,'r');B.b(28,3,2,'k');
  B.b(0,6,1,'R');B.wall(1,6,27,'r');B.b(28,6,1,'r');B.b(29,6,1,'y');
  B.tiles(0,9,30,'w');                                         // franja reflectiva
  // cajones de mangueras con puertas
  for(const x of [1,6,11,16]){B.b(x-1,10,1,'r');B.b(x,10,4,'k')}B.b(20,10,1,'r');
  B.wall(0,13,21,'r');
  // cabina
  B.b(21,10,1,'r');B.b(22,10,4,'b');B.b(26,10,1,'r');B.k('sD',27,10,'b');
  B.b(21,13,1,'r');B.b(22,13,4,'b');B.b(26,13,1,'r');
  B.plates(21,16,7,'r');B.k('rd',22,17,'a');B.k('rd',23,17,'r');B.k('rd',24,17,'a');B.k('rd',25,17,'r');   // sirenas
  // escalera
  for(const x of [1,4,7,10,13,16,19])B.b(x,16,1,'k');
  B.tiles(0,19,20,'w');for(const x of [0,3,6,9,12,15,18])B.k('rd',x,20,'k');B.tiles(0,23,20,'w');B.k('rd',19,24,'k');B.b(18,27,2,'k');
  // manguera enrollada
  B.k('rd',2,24,'y');B.k('rd',3,24,'y');B.k('rd',4,24,'y');
  // hidrante, conos y bombero
  B.b(32,0,1,'r');B.k('rd',32,3,'r');B.p(31,6,3,'r');
  for(const x of [35,37]){B.p(x,0,1,'o');B.k('qI',x,1,'o')}
  B.p(39,0,2,'x');B.b(39,1,1,'x');B.b(40,1,1,'x');B.wall(39,4,2,'r');B.b(39,7,2,'y');B.k('rd',39,10,'y');B.p(39,13,2,'r');
  B.k('rd',20,30,'b');B.k('rd',21,33,'b');B.k('rd',22,36,'b')}},
{id:'casa2',name:'Casa con jardín',emo:'🏡',anim:'jump',build(B){
  B.plates(0,0,46,'g');
  const X=8;
  // casa de 2 pisos con balcón
  B.b(X,1,4,'C');B.b(X+4,1,2,'n');B.b(X+6,1,4,'C');
  B.b(X,4,1,'C');B.b(X+1,4,2,'b');B.b(X+3,4,1,'C');B.b(X+4,4,2,'n');B.b(X+6,4,1,'C');B.b(X+7,4,2,'b');B.b(X+9,4,1,'C');
  B.wall(X,7,3,'C');B.k('ar',X+3,7,'C');B.wall(X+7,7,3,'C');
  B.plates(X-1,10,12,'w');
  B.wall(X,11,10,'C');
  B.b(X,14,1,'C');B.b(X+1,14,2,'b');B.b(X+3,14,1,'C');B.b(X+4,14,2,'b');B.b(X+6,14,1,'C');B.b(X+7,14,2,'b');B.b(X+9,14,1,'C');
  B.wall(X,17,10,'C');
  B.k('sI',X-1,20,'R');B.wall(X+1,20,8,'R');B.k('sD',X+9,20,'R');
  B.k('sI',X,23,'R');B.wall(X+2,23,6,'R');B.k('sD',X+8,23,'R');
  B.k('sI',X+1,26,'R');B.wall(X+3,26,4,'R');B.k('sD',X+7,26,'R');
  B.k('sI',X+2,29,'R');B.b(X+4,29,2,'R');B.k('sD',X+6,29,'R');
  B.k('sI',X+3,32,'R');B.k('sD',X+5,32,'R');
  B.b(X+10,23,1,'k');B.b(X+10,26,1,'k');B.p(X+10,29,1,'x');B.k('rd',X+11,32,'w');B.k('rd',X+12,35,'w');
  tree(B,0,1);
  // flores, cerca y buzón
  for(const [x,c] of [[19,'m'],[20,'y'],[21,'r']]){B.p(x,1,1,'g');B.k('rd',x,2,c)}
  for(const x of [23,26,29])B.b(x,1,1,'w');B.tiles(23,4,7,'w');
  B.b(31,1,1,'n');B.b(31,4,1,'n');B.b(30,7,3,'a');B.p(30,10,3,'a');
  // carro en la entrada y perro con su casita
  minicar(B,34,1,'a');
  B.wall(41,1,4,'r');B.b(41,4,1,'r');B.b(44,4,1,'r');B.b(42,4,2,'x');B.k('sI',41,7,'R');B.k('sD',43,7,'R');
  B.p(40,1,1,'n');B.k('rd',40,2,'C');
  // sol y nube
  B.k('rd',38,26,'y');B.k('rd',39,26,'y');B.k('rd',38,29,'y');B.k('rd',39,29,'y');
  B.plates(25,28,4,'w');B.plates(24,29,6,'w');B.plates(25,30,4,'w')}},
{id:'barco',name:'Barco pirata',emo:'🏴‍☠️',anim:'sail',build(B){
  const W=64;
  B.plates(0,0,W,'B');
  for(let x=0;x<W;x+=4){if(x>=48&&x<62)continue;B.k('sI',x,1,'a');B.k('sD',x+2,1,'a')}            // olas
  B.wall(8,4,30,'n');
  B.wall(6,7,6,'n');for(let i=0;i<5;i++){B.k('rd',12+i*5,7,'x');B.wall(13+i*5,7,4,'n')}B.b(37,7,3,'n');   // cañones
  B.plates(5,10,36,'y');                                       // franja dorada
  B.wall(4,11,38,'R');
  B.wall(3,14,40,'n');
  // castillo de popa
  B.wall(2,17,9,'n');B.b(3,20,1,'n');B.b(4,20,2,'y');B.b(6,20,1,'n');B.b(7,20,2,'y');B.b(9,20,2,'n');B.wall(2,23,9,'R');
  // baranda
  for(let x=12;x<38;x+=3)B.b(x,17,1,'n');B.tiles(11,20,27,'n');
  // proa
  B.wall(38,17,5,'n');B.k('sI',38,20,'R');B.wall(40,20,3,'R');B.k('sI',43,17,'n');B.p(44,20,3,'n');
  // mástiles y velas (la vela tapa el mástil, como en un barco de verdad)
  const masts=[[16,7,4],[26,9,5],[35,7,4]];
  for(const [mx,sw,rows] of masts){
    const x0=mx-Math.floor(sw/2);
    B.b(mx,21,1,'n');B.b(mx,24,1,'n');
    for(let r=0;r<rows;r++)B.wall(x0,27+r*3,sw,r%2?'r':'w');
    const mid=27+rows*3;
    if(mx===26)B.wall(mx-2,mid,5,'n');else B.b(mx,mid,1,'n');   // cofa en el mástil mayor
    const y2=mid+3;
    for(let r=0;r<rows-1;r++)B.wall(x0+1,y2+r*3,sw-2,r%2?'w':'r');
    const top=y2+(rows-1)*3;B.b(mx,top,1,'n');
    if(mx===26){B.b(mx,top+3,1,'x');B.k('ojo',mx+1,top+3,'w');B.b(mx+2,top+3,1,'x')}   // bandera pirata
    else B.p(mx,top+3,2,'r');
  }
  B.k('rd',2,26,'y');B.k('rd',10,26,'y');
  // isla del tesoro
  const I=50;B.k('sI',I-2,4,'C');B.plates(I,4,12,'C');B.wall(I+1,5,10,'C');
  for(let r=0;r<4;r++)B.b(I+3,8+r*3,1,'n');                     // palmera
  B.k('sI',I,20,'g');B.b(I+2,20,3,'g');B.k('sD',I+5,20,'g');B.p(I+2,23,3,'g');B.k('rd',I+2,24,'n');B.k('rd',I+4,24,'n');
  B.b(I+6,8,3,'n');B.p(I+6,11,3,'y');B.k('rd',I+7,12,'y');B.k('rd',I+5,8,'y');   // cofre del tesoro
  B.k('rd',I+9,8,'x');B.k('rd',I+10,8,'x');B.k('rd',I+9,11,'x');               // balas de cañón
  B.b(43,5,4,'n');B.p(42,8,1,'n');B.p(47,8,1,'n');                              // bote de remos
  B.k('rd',20,62,'w');B.k('rd',40,58,'w');B.k('rd',8,50,'w')
  B.p(45,17,1,'k');B.b(45,14,1,'k');B.b(45,11,1,'k');B.k('qI',44,10,'k');B.k('qD',46,10,'k')}},   // gaviotas y ancla
{id:'castillo_gigante',name:'Castillo gigante',emo:'🏰',anim:'jump',build(B){
  const W=44;
  B.plates(0,0,W,'g');
  // foso con agua y puente
  B.plates(14,1,4,'a');B.plates(26,1,4,'a');B.plates(18,1,8,'n');
  // torres (6 de ancho, 5 ladrillos) y muralla
  const towers=[0,38],Y=2;
  for(const tx of towers){
    for(let r=0;r<9;r++){const y=Y+r*3;
      if(r===3||r===6){B.b(tx,y,2,'k');B.b(tx+2,y,2,'x');B.b(tx+4,y,2,'k')}else B.wall(tx,y,6,'k')}
    for(const dx of [0,2,4])B.b(tx+dx,Y+27,1,'k');B.b(tx+5,Y+27,1,'k');
    B.k('sI',tx,Y+30,'r');B.b(tx+2,Y+30,2,'r');B.k('sD',tx+4,Y+30,'r');
    B.k('sI',tx+1,Y+33,'r');B.k('sD',tx+3,Y+33,'r');
    B.b(tx+2,Y+36,1,'n');B.b(tx+2,Y+39,1,'n');B.p(tx+3,Y+40,2,'y');
  }
  // muralla con ventanas y la puerta en el medio
  for(let r=0;r<6;r++){const y=Y+r*3;
    if(r<3){B.wall(6,y,12,'k');B.wall(26,y,12,'k')}
    else if(r===3){for(const x of [6,26]){B.b(x,y,2,'k');B.b(x+2,y,2,'x');B.b(x+4,y,2,'k');B.b(x+6,y,2,'x');B.b(x+8,y,4,'k')}B.b(18,y,8,'x')}
    else B.wall(6,y,32,'k');}
  B.b(18,Y,1,'k');B.b(25,Y,1,'k');for(const x of [19,21,23])B.b(x,Y,2,'n');
  B.b(18,Y+3,1,'k');B.b(25,Y+3,1,'k');B.b(19,Y+3,6,'n');
  B.b(18,Y+6,1,'k');B.b(19,Y+6,1,'k');B.k('ar',20,Y+6,'k');B.b(24,Y+6,1,'k');B.b(25,Y+6,1,'k');
  for(let x=6;x<38;x+=2)B.b(x,Y+18,1,'k');                      // almenas
  // torre del homenaje
  for(let r=0;r<5;r++){const y=Y+21+r*3;
    if(r===2){B.b(16,y,3,'k');B.b(19,y,2,'x');B.b(21,y,2,'k');B.b(23,y,2,'x');B.b(25,y,3,'k')}else B.wall(16,y,12,'k')}
  for(let x=16;x<28;x+=2)B.b(x,Y+36,1,'k');
  B.b(21,Y+39,1,'n');B.b(21,Y+42,1,'n');B.b(22,Y+42,3,'r');B.b(22,Y+45,2,'r');
  // estandartes sobre la muralla
  for(const x of [9,13,31,35]){B.p(x,Y+21,1,'k');B.p(x,Y+22,1,'k');B.p(x+1,Y+22,2,'R')}
  // pueblo alrededor
  B.plates(-24,0,24,'g');B.plates(W,0,24,'g');
  hut(B,-23,1,'y','r');tree(B,-15,1);hut(B,-8,1,'w','a');
  tree(B,W+1,1);hut(B,W+8,1,'C','R');tree(B,W+15,1)}}
];

// =====================================================================
//  SET "BRIGADA DE RESCATE" (original)
// =====================================================================
function ambulance(B,X,Y){
  B.wheel(X+1,Y);B.wheel(X+7,Y);
  B.b(X,Y+3,1,'k');B.wall(X+1,Y+3,8,'w');B.b(X+9,Y+3,1,'k');
  B.b(X,Y+6,2,'w');B.b(X+2,Y+6,1,'r');B.b(X+3,Y+6,4,'w');B.b(X+7,Y+6,2,'w');B.b(X+9,Y+6,1,'y');
  B.b(X,Y+9,1,'w');B.b(X+1,Y+9,3,'r');B.b(X+4,Y+9,3,'w');B.b(X+7,Y+9,1,'w');B.k('sD',X+8,Y+9,'b');
  B.b(X,Y+12,2,'w');B.b(X+2,Y+12,1,'r');B.b(X+3,Y+12,4,'w');B.p(X+7,Y+12,2,'w');
  B.k('rd',X+1,Y+15,'r');B.k('rd',X+2,Y+15,'a');B.tiles(X+3,Y+15,4,'w')}
function towTruck(B,X,Y){
  B.wheel(X+4,Y);B.wheel(X+11,Y);
  B.b(X+3,Y+3,1,'k');B.wall(X+4,Y+3,10,'o');B.b(X+14,Y+3,1,'k');
  B.wall(X+3,Y+6,7,'o');B.b(X+10,Y+6,4,'o');B.b(X+14,Y+6,1,'y');
  B.b(X+5,Y+9,2,'k');B.k('rd',X+8,Y+9,'o');B.b(X+10,Y+9,1,'o');B.b(X+11,Y+9,2,'b');B.k('sD',X+13,Y+9,'b');
  B.b(X+5,Y+12,2,'k');B.p(X+10,Y+12,4,'o');B.k('rd',X+11,Y+13,'y');B.k('rd',X+12,Y+13,'y');
  B.b(X+1,Y+15,6,'y');B.p(X+1,Y+14,1,'k');B.p(X+1,Y+13,1,'k');B.k('qD',X+1,Y+11,'x')}
const RESCUE=[
{id:'r_osito',set:'rescate',name:'Osito rescatista',emo:'🐻',anim:'jump',build(B){
  B.p(1,0,1,'n');B.p(4,0,1,'n');B.wall(0,1,6,'n');B.p(1,4,4,'o');          // patas, cuerpo y chaleco
  B.wall(1,5,4,'n');B.b(1,8,1,'n');B.k('ojo',2,8,'n');B.k('ojo',3,8,'n');B.b(4,8,1,'n');
  B.b(1,11,1,'n');B.b(2,11,2,'C');B.b(4,11,1,'n');B.p(2,14,2,'x');
  B.k('rd',0,11,'n');B.k('rd',5,11,'n');                                    // orejas
  B.p(1,15,4,'o');B.k('rd',2,16,'w');B.k('rd',3,16,'r')}},                  // casco con luz
{id:'r_cono',set:'rescate',name:'Conos y señal',emo:'🚧',anim:'jump',build(B){
  for(const x of [0,6]){B.p(x,0,2,'o');B.k('sI',x,1,'o');B.p(x,4,2,'w')}
  B.b(3,0,1,'k');B.b(3,3,1,'k');B.b(2,6,3,'y');B.tiles(2,9,3,'x')}},
{id:'r_ambulancia',set:'rescate',name:'Ambulancia',emo:'🚑',anim:'drive',build(B){ambulance(B,0,0)}},
{id:'r_lancha',set:'rescate',name:'Lancha de rescate',emo:'🛥️',anim:'sail',build(B){
  B.plates(0,0,20,'B');for(let x=0;x<20;x+=4){B.k('sI',x,1,'a');B.k('sD',x+2,1,'a')}
  B.k('sI',2,4,'r');B.wall(4,4,10,'r');B.k('sD',14,4,'r');                    // casco
  B.tiles(3,7,12,'w');
  B.wall(5,8,6,'y');B.b(5,11,1,'y');B.b(6,11,3,'b');B.b(9,11,2,'y');B.p(5,14,6,'y');
  B.k('rd',6,15,'r');B.k('rd',9,15,'a');                                      // luces
  B.k('rd',13,8,'o');B.k('rd',13,11,'w');B.p(12,8,1,'w')}},                    // salvavidas
{id:'r_helicoptero',set:'rescate',name:'Helicóptero de rescate',emo:'🚁',anim:'launch',build(B){
  const X=6;
  B.plates(X+1,0,6,'k');B.b(X+2,1,1,'k');B.b(X+5,1,1,'k');
  B.wall(X,4,8,'r');B.k('sD',X+8,4,'r');
  B.b(X,7,2,'r');B.b(X+2,7,2,'b');B.b(X+4,7,2,'r');B.k('sD',X+6,7,'b');B.b(X+8,7,1,'r');
  B.wall(X,10,6,'r');B.b(X+6,10,2,'w');
  B.wall(0,7,X,'w');B.k('qI',0,10,'r');B.k('rd',0,4,'k');                     // cola, aleta y hélice trasera
  B.b(X+3,13,1,'k');B.plates(1,16,14,'k');B.k('rd',X+3,17,'r');
  B.p(X+1,3,1,'y');B.p(X+6,3,1,'y')}},
{id:'r_grua',set:'rescate',name:'Grúa',emo:'🛻',anim:'drive',build(B){towTruck(B,0,0)}},
{id:'r_estacion',set:'rescate',name:'Estación de rescate',emo:'🚨',anim:'jump',build(B){
  const W=40;B.plates(0,0,W,'k');
  // edificio con 2 garajes
  const X=10;
  // columnas y portones enrollables
  for(const y of [1,4]){B.b(X,y,2,'R');B.b(X+2,y,4,'w');B.b(X+6,y,4,'R');B.b(X+10,y,4,'w');B.b(X+14,y,2,'R')}
  B.b(X,7,2,'R');B.k('ar',X+2,7,'R');B.b(X+6,7,4,'R');B.k('ar',X+10,7,'R');B.b(X+14,7,2,'R');
  B.tiles(X,10,16,'y');                                                       // franja
  B.wall(X,11,16,'R');
  B.b(X,14,1,'R');B.b(X+1,14,2,'b');B.b(X+3,14,2,'R');B.b(X+5,14,2,'b');B.b(X+7,14,2,'R');B.b(X+9,14,2,'b');B.b(X+11,14,2,'R');B.b(X+13,14,2,'b');B.b(X+15,14,1,'R');
  B.wall(X,17,16,'R');
  B.k('sI',X-1,20,'a');B.wall(X+1,20,14,'a');B.k('sD',X+15,20,'a');
  B.k('sI',X+2,23,'a');B.wall(X+4,23,8,'a');B.k('sD',X+12,23,'a');
  B.k('rd',X+6,26,'r');B.k('rd',X+7,26,'y');B.k('rd',X+8,26,'a');B.k('rd',X+9,26,'r');   // sirenas
  B.b(X+14,26,1,'k');B.b(X+14,29,1,'k');B.k('rd',X+14,32,'r');                         // antena
  // vehículos estacionados
  ambulance(B,0,1);
  B.wheel(29,1);B.wheel(35,1);B.b(28,4,1,'k');B.wall(29,4,8,'a');B.b(37,4,1,'k');    // patrulla
  B.b(28,7,1,'a');B.b(29,7,2,'w');B.b(31,7,2,'a');B.b(33,7,2,'w');B.b(35,7,2,'a');B.b(37,7,1,'y');
  B.k('sI',30,10,'b');B.b(32,10,2,'a');B.k('sD',34,10,'b');B.k('rd',32,13,'r');B.k('rd',33,13,'a')}}
];
