// pide al aparato no borrar los datos del juego
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
if(location.hash==='#desbloquear'){save.unlockAll=true;persist()}

let rt;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(busy&&!$('#bag').classList.contains('show'))return;
  screen==='home'?renderHome():screen==='menu'?renderMenu():screen==='game'?render():screen==='chars'?renderChars():screen==='trace'?renderTrace():screen==='world'?renderWorld():renderEditor()},120)});
updSnd();updMus();
show('home');
