<?php
/**
 * Plantilla para mostrar el flipbook en el frontend
 *
 * @package FlipbookContraplanoVibe
 */

// Si este archivo es llamado directamente, abortar
if ( ! defined( 'WPINC' ) ) {
    die;
}

// Obtener datos del flipbook
global $wpdb;
$table_areas = $wpdb->prefix . 'flipbook_areas';
$table_audio = $wpdb->prefix . 'flipbook_audio';

// Obtener áreas interactivas
$areas = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM $table_areas WHERE edition_id = %d ORDER BY page_num ASC",
        $edition_id
    ),
    ARRAY_A
);

// Obtener audio
$audio_files = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM $table_audio WHERE edition_id = %d ORDER BY page_num ASC",
        $edition_id
    ),
    ARRAY_A
);

// Convertir áreas y audio a formato JSON para JavaScript
$areas_json = json_encode($areas ?: []);
$audio_json = json_encode($audio_files ?: []);

// Obtener la URL del PDF
$upload_dir = wp_upload_dir();
$pdf_url = $upload_dir['baseurl'] . '/' . $edition->pdf_path;

// Configuración del contenedor
$container_id = 'flipbook-container-' . $edition_id;
$container_style = 'width: ' . esc_attr($atts['width']) . '; height: ' . esc_attr($atts['height']) . '; background-color: ' . esc_attr($atts['background']) . ';';
?>

<div class="flipbook-wrapper">
    <div id="<?php echo esc_attr($container_id); ?>" class="flipbook-container" style="<?php echo $container_style; ?>">
        <div class="flipbook-loading">
            <div class="spinner"></div>
            <p><?php esc_html_e('Cargando flipbook...', 'flipbook-contraplano-vibe'); ?></p>
        </div>
    
        <div class="flipbook-viewport">
            <div class="flipbook-book">
                <!-- Las páginas se cargarán dinámicamente con JavaScript -->
            </div>
        </div>
        
        <div class="flipbook-controls">
            <button class="flipbook-prev" aria-label="<?php esc_attr_e('Página anterior', 'flipbook-contraplano-vibe'); ?>">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
            </button>
            
            <div class="flipbook-pagination">
                <span class="flipbook-current-page">1</span> / <span class="flipbook-total-pages">0</span>
            </div>
            
            <button class="flipbook-next" aria-label="<?php esc_attr_e('Página siguiente', 'flipbook-contraplano-vibe'); ?>">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
            </button>
        </div>
    </div>
</div>

<script type="text/javascript">
    document.addEventListener('DOMContentLoaded', function() {
        // Inicializar flipbook cuando el DOM esté listo
        if (typeof initFlipbook === 'function') {
            initFlipbook({
                containerId: '<?php echo esc_js($container_id); ?>',
                pdfUrl: '<?php echo esc_js($pdf_url); ?>',
                editionId: <?php echo (int) $edition_id; ?>,
                editionType: '<?php echo esc_js($edition->type); ?>',
                areas: <?php echo $areas_json; ?>,
                audio: <?php echo $audio_json; ?>
            });
        } else {
            console.error('La función initFlipbook no está disponible. Verifica que el archivo JS esté cargado correctamente.');
        }
    });
</script> 