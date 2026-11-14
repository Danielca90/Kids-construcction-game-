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
html = html.replace("show('home');\n</script>", """show('home');
// funciona sin internet cuando está publicado (Netlify); dentro de Claude no aplica
try{if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js')}catch(e){}
</script>""", 1)
(root.parent / 'index.html').write_text(html, encoding='utf-8')
print('index.html listo')
