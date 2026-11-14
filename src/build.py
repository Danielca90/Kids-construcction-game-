# Arma index.html a partir de la plantilla y los modelos:  python3 src/build.py
import pathlib
root = pathlib.Path(__file__).resolve().parent
t = (root / 'template.html').read_text(encoding='utf-8')
m = (root / 'models.js').read_text(encoding='utf-8')
html = t.replace('/*MODELS*/', m)
head_extra = '''<meta name="apple-mobile-web-app-title" content="Fichitas">
<meta name="theme-color" content="#cdeefd">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="apple-touch-icon.png">'''
anchor = '<meta name="apple-mobile-web-app-capable" content="yes">'
html = html.replace(anchor, anchor + '\n' + head_extra, 1)
REG = """// sin internet: guarda el juego en el aparato y avisa una vez cuando quedó listo
try{if('serviceWorker' in navigator&&location.protocol==='https:'){
  navigator.serviceWorker.register('sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{
    try{if(!localStorage.getItem('fichitas_offline_ok')){localStorage.setItem('fichitas_offline_ok','1');
      const d=document.createElement('div');d.className='offok';d.textContent='✅ Listo para jugar sin internet';document.body.appendChild(d);setTimeout(()=>d.remove(),4200)}}catch(e){}
  }).catch(()=>{})}}catch(e){}
"""
html = html.replace("show('home');\n</script>", "show('home');\n" + REG + "</script>", 1)
html = html.replace("</style>", """.offok{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:95;background:#24506b;color:#fff;font-weight:800;font-size:17px;padding:10px 18px;border-radius:999px;box-shadow:0 4px 12px rgba(0,0,0,.25);animation:offok 4s ease forwards}
@keyframes offok{0%{opacity:0;transform:translate(-50%,20px)}10%,85%{opacity:1;transform:translate(-50%,0)}100%{opacity:0}}
</style>""", 1)
(root.parent / 'index.html').write_text(html, encoding='utf-8')
print('index.html listo')
