# Requisitos Funcionales y Técnicos

## Requisitos Funcionales
1. **Gestión de Ediciones**  
   - Subida de nueva edición que sobreescribe la anterior.  
   - Dos tipos de edición:
     - Normal (sin audio).  
     - Especial (con audio).  
   - Al subir una edición especial:
     - La anterior pasa a normal y se eliminan sus audios e iconos.

2. **Visualización Flipbook**  
   - Subida de PDFs compatibles con redirecciones internas entre páginas o bloques de las páginas del pdf
   - Animación realista de paso de páginas (CSS3 / canvas).  
   - Flechas de navegación izquierda/derecha.

3. **Interactividad In‑PDF**  
   - **Vinculación a URL:**  
     - Selección de áreas (rectángulos) en el PDF.  
     - Área marcada en azul al definir el enlace.  
     - Al hacer clic, abre en pestaña nueva.  
   - **YouTube Redirect:**  
     - Insertar enlace de YouTube; abre en nueva pestaña.  
   - **Audio Embedding:**  
     - Colocar icono SVG (“botón de play”) en cualquier página.  
     - Subida de archivos `.mp3`.  
     - Opción de “Autoplay” en checklist.

4. **Panel de Administración**  
   - UI para subir PDF y gestionar ediciones.  
   - Herramientas de edición visual (areas, enlaces, vídeo, audio).  
   - Gestión de archivos de audio.

5. **Inserción en Front‑end**  
   - Shortcode o widget para incrustar en posts/páginas.  
   - Carga asíncrona de assets (JS/CSS) sólo donde se use.

## Requisitos Técnicos
- Tiempo de carga de flipbook ≤ 3 s.  
- Compatible con navegadores modernos (Chrome, Firefox, Safari, Edge).  
- Cumplir estándares de WordPress Coding Standards (PHP, JS).  
- Seguridad: saneamiento de entradas (PDF, URLs, nombres de archivo).  
- Responsive: adaptarse a dispositivos móviles y escritorio.  

