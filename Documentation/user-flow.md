# Mapa de Flujo de Usuarios y Datos

## 1. Administrador
1. Accede a “Flipbook Vibe” en el menú WP.  
2. Sube nuevo PDF → guarda como edición especial o normal.  
3. Edita capas:
   - Dibuja rectángulos para enlaces/YouTube/audio.  
   - Configura URL, video o sube `.mp3`.  
   - Selecciona “Autoplay” si aplica.  
4. Publica cambios.

## 2. Usuario Final
1. En post/página con shortcode, carga flipbook.  
2. Navega con flechas o teclado.  
3. Interactúa:
   - Click en áreas azules → abre enlaces/video.  
   - Click en icono de audio → reproduce/pausa sonido.  

## 3. Flujo de Datos
- **Subida PDF** → almacenamiento en `/uploads` → registro en DB.  
- **Definición de áreas** → AJAX a `class-editor.php` → guarda en tablas `areas`/`audio`.  
- **Front‑end** → shortcode renderiza HTML base → JS carga páginas (imágenes/canvas).  
- **Evento Click** → JS detecta tipo y ejecuta acción (openTab, playAudio).  
- **Registro de Uso** (futuro): opcional hook para analytics.