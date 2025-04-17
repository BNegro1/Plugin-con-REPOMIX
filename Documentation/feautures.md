# Descripción Detallada de Funcionalidades

## 1. Gestión de Ediciones  
- **Subida & Sobrescritura:** cada edición nueva reemplaza la anterior.  
- **Tipos de Edición:**  
  - **Especial:** contiene audio; activa iconos y autoplay.  
  - **Normal:** sin audio; limpia iconos de la edición previa.  

## 2. Flipbook Interactivo  
- **Animación de Páginas:** efecto realista, con “curl” o volteo.  
- **Navegación:** flechas L/R, teclado ← →.  
- **Lazy Loading:** solo carga páginas cercanas al viewport.

## 3. Interactividad In‑PDF  
- **Áreas Enlazables:**  
  - Selección de rectángulo en editor.  
  - Área resaltada en azul cuando está activa.  
  - Click → abre URL en pestaña nueva.  
- **YouTube:**  
  - Inserción de link → al hacer clic abre YouTube en pestaña nueva.  
- **Audio:**  
  - Icono SVG configurable (color, tamaño).  
  - Sube `.mp3` desde panel.  
  - Opción “Autoplay” (si activa, reproduce al cargar página).  

### Casos Especiales / Validaciones  
- Validar formato PDF; rechazar >100 MB.  
- Comprobar URLs (https://).  