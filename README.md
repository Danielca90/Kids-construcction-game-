# Fichitas

Juego de armar con fichas tipo bloques para niños pequeños (iPad / iPhone).

- `index.html` — el juego completo (2D): niveles, sobres, modo libre, modo papá, set de rescate, voz en inglés.
- `3d/` — prueba de armado en 3D isométrico (árbol).
- `sw.js` + `manifest.webmanifest` — permiten instalarlo en la pantalla de inicio y jugar sin internet.

## Publicar en Netlify
1. Netlify → **Add new site → Import an existing project → GitHub** → elegir este repositorio.
2. Branch: `main`. Build command: *(vacío)*. Publish directory: `.`
3. Deploy. Cada cambio que se suba a `main` se publica solo.

## Instalar en el iPad
Abrir el enlace de Netlify en Safari → Compartir → **Agregar a pantalla de inicio**.
