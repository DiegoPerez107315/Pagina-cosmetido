# Instrucciones del proyecto — NicValia Make up

Tienda estática (HTML + CSS + JS) que se despliega en Vercel desde GitHub.
Archivos principales: `index.html`, `nicvalia.css`, `nicvalia.js`.

## Reglas de trabajo (importantes)

### Git
- **Nunca ejecutes `git push`.** El usuario hace el push manualmente cada
  vez que termina un cambio. Puedes hacer `git add` y `git commit` cuando
  el cambio esté listo, pero deja el push para el usuario.
- Después de commitear, recuérdale al usuario que el cambio está listo para
  que él lo suba con `git push`.

### Verificación visual de cambios
- **No tomes screenshots ni automatices el navegador** (no lances ventanas
  de Edge/Chrome, no muevas el mouse, no captures la pantalla). Esa forma de
  verificar es molesta para el usuario.
- En su lugar: si hace falta un servidor local, déjalo corriendo
  (`python -m http.server 8080`) y dile al usuario **qué debe mirar** en
  `http://localhost:8080`. Él refresca la página en su propio navegador y
  revisa el resultado.
- Describe con claridad qué cambiaste y qué debería verse distinto, para que
  el usuario pueda confirmarlo de un vistazo.

## Notas
- El idioma de trabajo es español.
- El sitio se sirve como estático; `index.html` es la página de inicio que
  Vercel detecta automáticamente.
