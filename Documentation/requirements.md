# Requisitos Funcionales y Técnicos

## Requisitos Funcionales

1. **Gestión de Ediciones**

   - Subida de nueva edición cada edición neuva se sube y se guarda dentro de los datos de Media de WordPress.
   - Dos tipos de edición:

     - Normal (sin audio).
     - Especial (con audio).
2. **Visualización Flipbook**

   - Subida de PDFs compatibles con redirecciones internas entre páginas o bloques de las páginas del pdf.
   - Flechas de navegación izquierda/derecha.
3. **Interactividad In‑PDF**

   - **Vinculación a URL:**

     - Selección de áreas (rectángulos) en el PDF.
     - Área marcada en azul al definir el enlace.
     - Al hacer clic, abre en pestaña nueva.

     **Vinculación con el contenido del PDF.:**

     Selección de áreas (rectángulos) en el PDF .

     - Área marcada en un rectangulo Rojo (indicando el primer rectangulo rojo) para luego definir otro rectangulo Verde para redirigir entre las mismas páginas o lugares del PDF, también puede ser muchas formas de navegación con los rectangulos.
     - Se debe tener **claramente** cuál es el primero y segundo o múltiples.
     - Al hacer clic, dentro del primer Rectangulo rojo debe rederigir a la parte especifica del PDF con el segundo Rectangulo verde y con más rectangulos de navegación que se hayan realizado.
   - **YouTube Redirect:**

     - Insertar enlace de YouTube; abre en nueva pestaña.
   - **Audio Embedding:**

     - Icono de PLAY.
     - Escoger  `.mp3` desde los datos de media de WordPress.
     - Opción “Autoplay” en el frontend.
4. **Panel de Administración**

   - UI para subir PDF y gestionar ediciones.
   - Herramientas de edición visual (areas, enlaces, vídeo, audio).
5. **Inserción en Front‑end**

   - Shortcode (Forma: [flipbook id= [NUMERO]) widget para incrustar en posts/páginas, se puede hacer directamente al crear el post/entrada/pagina/serie y aplicar de una vez el Shortcode o sino agregar como un botón dentro de cada post/entrada/pagina/serie y seleccionar el que se desee.

## Requisitos Técnicos

- Cumplir estándares de WordPress Coding Standards (PHP, JS, etc).
- Seguridad: saneamiento de entradas (PDF, URLs, nombres de archivo).
- Tecnologías: USAR PHP, JS y CUALQUEIR OTRA COSA TECNOGLOÍA NECESARIA PARA EL PLUGIN, HTML, ETC. ETC. ETC.
