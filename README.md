# Vibebook Flip - Plugin de WordPress

## Versión 1.0.2

Plugin para visualizar PDFs como flipbooks interactivos con áreas interactivas.

## Descripción

Vibebook Flip es un plugin de WordPress que permite convertir archivos PDF en flipbooks interactivos con capacidades avanzadas. Los usuarios pueden agregar áreas interactivas como enlaces, videos de YouTube, navegación interna y audio a las páginas del PDF.

## Características principales

- Visualización de PDFs como flipbooks interactivos
- Navegación tipo libro con flechas y teclado
- Áreas interactivas dentro del PDF:
  - Enlaces a URLs externas
  - Videos de YouTube
  - Navegación interna entre páginas
  - Reproducción de audio
- Panel de administración para gestionar el contenido
- Integración mediante shortcodes en posts/páginas de WordPress

## Requisitos

- WordPress 5.0 o superior
- PHP 7.0 o superior
- Navegador moderno con soporte para JavaScript

## Instalación

1. Sube la carpeta `vibebook-flip` al directorio `/wp-content/plugins/`
2. Activa el plugin a través del menú 'Plugins' en WordPress
3. Ve al menú '📚Flipbooks📚' para comenzar a crear tus flipbooks

## Uso

### Crear un nuevo flipbook

1. Ve al menú '📚Flipbooks📚' en el panel de administración
2. Haz clic en la pestaña 'Subir/Seleccionar PDF'
3. Ingresa un título para tu flipbook
4. Haz clic en 'Seleccionar PDF' y elige un archivo PDF de la biblioteca de medios
5. Haz clic en 'Guardar Flipbook'

### Editar un flipbook

1. Ve al menú '📚Flipbooks📚' en el panel de administración
2. Haz clic en la pestaña 'Editar Flipbook' o en 'Gestionar Ediciones' y luego en 'Editar' junto al flipbook que deseas modificar
3. Utiliza las herramientas para agregar áreas interactivas:
   - Enlace URL: Crea un área que enlaza a una URL externa
   - YouTube: Crea un área que abre un video de YouTube
   - Navegación interna: Crea un área que navega a otra página del PDF
   - Audio: Crea un área que reproduce un archivo de audio

### Insertar un flipbook en una página o post

1. Edita la página o post donde deseas insertar el flipbook
2. Haz clic en el botón '📚 Insertar Flipbook' en el editor
3. Selecciona el flipbook que deseas insertar
4. Haz clic en 'Insertar'

También puedes insertar manualmente el shortcode: `[flipbook id="ID_DEL_FLIPBOOK"]`

## Novedades en la versión 1.0.2

- Implementado nuevo contenedor con CSS mejorado
- Los rectángulos de áreas interactivas ahora solo son visibles al pasar el cursor por encima
- Mejorada la funcionalidad del editor para permitir seleccionar, mover y eliminar rectángulos
- Optimizado el sistema de almacenamiento para asegurar que todas las gestiones se guarden correctamente
- Corregidos problemas con el renderizado de PDFs

## Soporte

Para soporte técnico, por favor contacta a través de [soporte@vibebook.com](mailto:soporte@vibebook.com)

## Licencia

Este plugin está licenciado bajo GPL v2 o posterior.
