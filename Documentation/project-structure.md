# Estructura del Proyecto y Flujo de Datos

```
flipbook-contraplano-vibe/
├── css/
│   └── flipbook.css             # Estilos generales y de animación
├── js/
│   ├── flipbook-core.js         # Lógica de renderizado y animación
│   └── editor-ui.js             # Herramientas interactivas en el admin
├── templates/
│   ├── frontend.php             # Plantilla de salida del shortcode
│   └── admin-page.php           # Plantilla del panel de configuración
├── includes/
│   ├── class-flipbook.php       # Lógica principal de plugin (CPT, hooks)
│   └── class-editor.php         # Funciones de edición y guardado
├── flipbook-plugin.php          # Archivo principal (header, registro)
```

## Base de Datos
- **wp_flipbook_editions**  
  - `id` (PK), `post_id`, `type` (normal/especial), `pdf_path`, `created_at`
- **wp_flipbook_audio**  
  - `id` (PK), `edition_id` (FK), `file_path`, `autoplay` (bool), `icon_coords`

## Flujo de Datos
1. **Admin → Subida de PDF**  
   - Usuario envía PDF → `class-editor.php` procesa ruta → registro en `wp_flipbook_editions`.
2. **Definición de capas interactivas**  
   - UI en JS/HTML permite dibujar rectángulos y asignar enlace/video/audio → AJAX guarda en tablas (`areas`, `audio`).
3. **Front‑end Rendering**  
   - Shortcode invoca `frontend.php` → encola `flipbook-core.js` y `flipbook.css` → JS carga imágenes/páginas y añade listeners.
4. **Interacción**  
   - Click en área → JS detecta tipo (URL/YouTube/Audio) → abre pestaña o reproduce audio.
