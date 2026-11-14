# Fichitas

Juego de armar con fichas tipo bloques para niños pequeños (iPad / iPhone).

- `index.html` — el juego completo (2D), **generado** desde `src/` (no editarlo a mano).
- `3d/` — sección de armado en 3D isométrico.
- `sw.js` + `manifest.webmanifest` — permiten instalarlo en la pantalla de inicio y jugar sin internet.

## Cómo está organizado el código
Cada parte del juego vive en su propio archivo, para que cambiar una no rompa otra:

| Archivo | Qué contiene |
|---|---|
| `src/page.html` | estructura de pantallas (inicio, menú, juego, editor, ventanas) |
| `src/css/01…07-*.css` | estilos por sección (base, inicio, menú, juego/editor, fichas, ventanas, pantallas chicas) |
| `src/js/01-fichas.js` | catálogo de piezas y colores |
| `src/js/02-niveles.js`, `03-figuras.js` | niveles y armado de modelos/bolsas |
| `src/js/models.js` | los modelos para armar |
| `src/js/04-guardado.js` | guardado en el aparato |
| `src/js/05…07` | sonido, música, vibración, puntaje, inglés |
| `src/js/08-dibujo-fichas.js` | cómo se dibuja cada pieza |
| `src/js/09…12` | inicio y monedas, menú, navegación, juego guiado |
| `src/js/13-editor.js`, `14-mezclador.js`, `15-editor-gestos.js` | modo libre / modo papá |
| `src/js/16-panel-papas.js` | panel de papás y copias de seguridad |
| `src/js/99-arranque.js` | arranque (siempre al final) |

El orden de los JS está en `JS_ORDER` dentro de `src/build.py`; si se crea un archivo nuevo hay que agregarlo ahí (el build avisa si falta).

## Antes de publicar
```
python3 src/build.py      # arma index.html
bash tests/run.sh         # pruebas rápidas (editor, recorridos, arreglos, 3D) en tamaño iPad y iPhone
bash tests/run.sh full    # además juega todos los modelos completos
```
Si sale ❌, no se publica. Después de publicar, subir `VERSION` en `sw.js` para que los aparatos tomen la versión nueva.

## Publicar en Netlify
Cada cambio que se sube a `main` se publica solo (Publish directory: `.`).

## Instalar en el iPad
Abrir el enlace de Netlify en Safari → Compartir → **Agregar a pantalla de inicio**.
