# Arma el juego en un solo archivo:   python3 src/build.py            -> index.html (lo que publica Netlify)
#                                     python3 src/build.py --artifact RUTA  -> además una copia para la versión de Claude
#
# El código está repartido por secciones para que cambiar una no rompa otra:
#   src/page.html      estructura de pantallas (HTML)
#   src/css/*.css      estilos, en el orden de su número
#   src/js/*.js        lógica, en el orden de JS_ORDER (cada archivo es una sección del juego)
#   src/js/models.js   los modelos para armar
import pathlib, sys

root = pathlib.Path(__file__).resolve().parent

JS_ORDER = [
    '01-fichas.js',                    # catálogo de piezas y colores
    '02-niveles.js',                   # niveles por cantidad de fichas
    'models.js',                       # modelos (constructor + lista)
    '03-figuras.js',                   # arma los modelos, bolsas
    '04-guardado.js',                  # guardado en el aparato
    '05-sonido-musica-vibracion.js',
    '06-puntaje-efectos.js',
    '07-ingles.js',                    # voz y palabras en inglés
    '08-dibujo-fichas.js',             # cómo se dibuja cada pieza
    '09-inicio.js',                    # pantalla de inicio, monedas
    '10-menu-modelos.js',
    '11-navegacion.js',
    '12-juego.js',                     # armar modelos guiados
    '13-editor.js',                    # modo libre y modo papá: estado, dibujo, imán
    '14-mezclador.js',                 # mezclador de colores
    '15-editor-gestos.js',             # tocar, arrastrar, flechas, guardar
    '16-panel-papas.js',               # panel de papás, copias de seguridad
    '17-personajes.js',                # minijuego: armar personajes
    '18-trazos.js',                    # trazos con dedo/Apple Pencil y presión
    '99-arranque.js',                  # arranque (siempre al final)
]

def read(p):
    return p.read_text(encoding='utf-8')

def build():
    page = read(root / 'page.html')
    css = ''.join(read(p) for p in sorted((root / 'css').glob('*.css')))
    js = ''
    for name in JS_ORDER:
        t = read(root / 'js' / name)
        js += t if t.endswith('\n') else t + '\n'
    missing = sorted(p.name for p in (root / 'js').glob('*.js') if p.name not in JS_ORDER)
    if missing:
        sys.exit('⚠️ Archivos JS sin agregar a JS_ORDER en build.py: ' + ', '.join(missing))
    return page.replace('/*@CSS*/\n', css, 1).replace('/*@JS*/\n', js, 1)

def for_netlify(html):
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
    assert "show('home');\n</script>" in html
    html = html.replace("show('home');\n</script>", "show('home');\n" + REG + "</script>", 1)
    html = html.replace("</style>", """.offok{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:95;background:#24506b;color:#fff;font-weight:800;font-size:17px;padding:10px 18px;border-radius:999px;box-shadow:0 4px 12px rgba(0,0,0,.25);animation:offok 4s ease forwards}
@keyframes offok{0%{opacity:0;transform:translate(-50%,20px)}10%,85%{opacity:1;transform:translate(-50%,0)}100%{opacity:0}}
</style>""", 1)
    return html

if __name__ == '__main__':
    html = build()
    (root.parent / 'index.html').write_text(for_netlify(html), encoding='utf-8')
    print('index.html listo')
    if '--artifact' in sys.argv:
        out = pathlib.Path(sys.argv[sys.argv.index('--artifact') + 1])
        out.write_text(html, encoding='utf-8')
        print('copia para Claude lista:', out)
