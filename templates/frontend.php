<?php
/**
 * Plantilla para el frontend del plugin Vibebook Flip
 * Versión 1.0.2 - Actualizada con soporte para visualización de una o dos páginas
 */
?>
<div id="vibebook-flipbook-<?php echo esc_attr($id); ?>" class="vibebook-flipbook flipbook-container" data-id="<?php echo esc_attr($id); ?>">
    <!-- Navegación -->
    <div class="vibebook-navigation">
        <a href="#" class="vibebook-nav-button vibebook-prev">← <?php _e('Anterior', 'vibebook-flip'); ?></a>
        <div class="vibebook-page-info">
            <?php _e('Página', 'vibebook-flip'); ?> <span class="vibebook-current-page">1</span> <?php _e('de', 'vibebook-flip'); ?> <span class="vibebook-total-pages">0</span>
        </div>
        <a href="#" class="vibebook-nav-button vibebook-next"><?php _e('Siguiente', 'vibebook-flip'); ?> →</a>
    </div>
    
    <!-- Visor de PDF -->
    <div class="vibebook-pages">
        <div class="vibebook-loading">
            <div class="vibebook-loading-spinner"></div>
            <p><?php _e('Cargando...', 'vibebook-flip'); ?></p>
        </div>
    </div>
    
    <!-- Controles de audio (inicialmente ocultos) -->
    <div class="vibebook-audio-controls" style="display: none;">
        <a href="#" class="vibebook-audio-toggle">
            <span class="dashicons dashicons-controls-play"></span>
            <span class="vibebook-audio-status"><?php _e('Reproducir audio', 'vibebook-flip'); ?></span>
        </a>
    </div>
</div>

<!-- Datos del flipbook -->
<script type="text/javascript">
    var vibeBookFlipData_<?php echo esc_attr($id); ?> = <?php echo json_encode($data); ?>;
</script>
