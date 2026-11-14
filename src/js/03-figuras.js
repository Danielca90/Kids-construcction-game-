function finishFigure(F){
  const steps=F.steps;
  F.rows=Math.max(...steps.map(s=>s.y+s.h))+1;
  F.cols=Math.max(F.cols||0,Math.ceil(Math.max(...steps.map(s=>s.x+s.w))));
  F.bags=[0];
  if(steps.length>BAG_FROM){
    let i=0;
    while(steps.length-i>15){
      const rem=steps.length-i;
      if(rem<=25){F.bags.push(i+Math.ceil(rem/2));break}
      let cut=i+12;
      for(let d=0;d<=3;d++){for(const j of [i+12+d,i+12-d]){if(j>i+9&&j<=i+15&&steps[j].y!==steps[j-1].y){cut=j;d=9;break}}}
      F.bags.push(cut);i=cut;
    }
  }
}
// arma cada modelo con su constructor, ordena de abajo hacia arriba y le asigna nivel por cantidad de fichas
const FIGURES=MODELS.concat(RESCUE).map(m=>{
  const B=makeBuilder();m.build(B);
  const steps=B.pieces.slice().sort((p,q)=>p.y-q.y);
  const minX=Math.min(...steps.map(s=>s.x));steps.forEach(s=>s.x-=minX);
  const F={id:m.id,name:m.name,emo:m.emo,anim:m.anim,steps,set:m.set||null};F.lvl=lvlFor(steps.length);finishFigure(F);return F;
}).sort((a,b)=>a.steps.length-b.steps.length);

