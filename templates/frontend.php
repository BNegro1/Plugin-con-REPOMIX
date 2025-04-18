<?php
/**
 * Template para el frontend del plugin Vibebook Flip
 * Versión 1.0.6 - Corregido posicionamiento de áreas, numeración de páginas y añadido zoom
 */
?>
<div id="vibebook-flipbook-<?php echo esc_attr($id); ?>" class="vibebook-flipbook flipbook-container" data-id="<?php echo esc_attr($id); ?>">
    <!-- Controles de navegación -->
    <div class="vibebook-controls">
        <div class="vibebook-nav-buttons">
            <button class="vibebook-prev" title="Página anterior">← Anterior</button>
            <button class="vibebook-next" title="Página siguiente">Siguiente →</button>
        </div>
        
        <div class="vibebook-page-info">Página 1 de <?php echo esc_html($total_pages); ?></div>
        
        <!-- Los controles de zoom se añadirán dinámicamente mediante JavaScript -->
        
        <!-- Controles de audio (inicialmente ocultos) -->
        <div class="vibebook-audio-controls">
            <button class="vibebook-audio-toggle" title="Reproducir/Pausar audio">
                <span class="dashicons dashicons-controls-play"></span>
            </button>
        </div>
    </div>
    
    <!-- Contenedor de páginas -->
    <div class="vibebook-pages">
        <!-- Las páginas se renderizarán dinámicamente mediante JavaScript -->
    </div>
    
    <!-- Indicador de carga -->
    <div class="vibebook-loading">
        <div class="vibebook-loading-spinner"></div>
    </div>
</div>

<!-- Datos para JavaScript -->
<script type="text/javascript">
    var vibeBookFlipData_<?php echo esc_attr($id); ?> = <?php echo wp_json_encode($data); ?>;
</script>
