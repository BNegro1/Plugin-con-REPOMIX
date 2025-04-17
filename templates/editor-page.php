<?php
/**
 * Plantilla para la página de editor de flipbook
 *
 * @package FlipbookContraplanoVibe
 */

// Si este archivo es llamado directamente, abortar
if ( ! defined( 'WPINC' ) ) {
    die;
}

// Verificar si estamos editando una edición existente
$edition_id = isset( $_GET['edition_id'] ) ? intval( $_GET['edition_id'] ) : 0;
$editing_mode = $edition_id > 0;

// Si estamos en modo edición, obtener datos de la edición
$edition = null;
$pdf_url = '';

if ( $editing_mode ) {
    global $wpdb;
    $table_editions = $wpdb->prefix . 'flipbook_editions';
    $edition = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM $table_editions WHERE id = %d",
            $edition_id
        )
    );
    
    if ( $edition ) {
        $upload_dir = wp_upload_dir();
        $pdf_url = $upload_dir['baseurl'] . '/' . $edition->pdf_path;
    } else {
        $editing_mode = false;
    }
}

// Obtener posts para el selector
$posts_args = [
    'post_type' => ['post', 'page'],
    'posts_per_page' => -1,
    'orderby' => 'title',
    'order' => 'ASC',
];
$posts = get_posts( $posts_args );
?>

<div class="wrap flipbook-editor">
    <h1><?php echo $editing_mode ? esc_html__( 'Editar Flipbook', 'flipbook-contraplano-vibe' ) : esc_html__( 'Crear Nuevo Flipbook', 'flipbook-contraplano-vibe' ); ?></h1>
    
    <div class="flipbook-editor-container">
        <?php if ( $editing_mode && !$edition ) : ?>
            <div class="notice notice-error">
                <p><?php esc_html_e( 'No se encontró la edición solicitada.', 'flipbook-contraplano-vibe' ); ?></p>
            </div>
            <p>
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=flipbook-vibe' ) ); ?>" class="button">
                    <?php esc_html_e( 'Volver a la lista', 'flipbook-contraplano-vibe' ); ?>
                </a>
            </p>
        <?php else : ?>
            <div class="flipbook-editor-sidebar">
                <div class="flipbook-editor-upload-section">
                    <h2><?php esc_html_e( 'Subir PDF', 'flipbook-contraplano-vibe' ); ?></h2>
                    
                    <form id="flipbook-upload-form" class="flipbook-upload-form">
                        <?php if ( !$editing_mode ) : ?>
                            <div class="form-field">
                                <label for="post_id"><?php esc_html_e( 'Asociar a:', 'flipbook-contraplano-vibe' ); ?></label>
                                <select name="post_id" id="post_id" class="widefat" required>
                                    <option value=""><?php esc_html_e( '-- Selecciona un post --', 'flipbook-contraplano-vibe' ); ?></option>
                                    <?php foreach ( $posts as $post ) : ?>
                                        <option value="<?php echo esc_attr( $post->ID ); ?>">
                                            <?php echo esc_html( $post->post_title ); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                        <?php else : ?>
                            <input type="hidden" name="post_id" value="<?php echo esc_attr( $edition->post_id ); ?>">
                        <?php endif; ?>
                        
                        <div class="form-field">
                            <label for="edition_type"><?php esc_html_e( 'Tipo de edición:', 'flipbook-contraplano-vibe' ); ?></label>
                            <select name="edition_type" id="edition_type" class="widefat" required>
                                <option value="normal" <?php selected( $editing_mode && $edition->type === 'normal' ); ?>>
                                    <?php esc_html_e( 'Normal', 'flipbook-contraplano-vibe' ); ?>
                                </option>
                                <option value="especial" <?php selected( $editing_mode && $edition->type === 'especial' ); ?>>
                                    <?php esc_html_e( 'Especial (con audio)', 'flipbook-contraplano-vibe' ); ?>
                                </option>
                            </select>
                        </div>
                        
                        <div class="form-field">
                            <label for="pdf_file"><?php esc_html_e( 'Archivo PDF:', 'flipbook-contraplano-vibe' ); ?></label>
                            <input type="file" name="pdf_file" id="pdf_file" accept=".pdf" <?php echo $editing_mode ? '' : 'required'; ?>>
                            <p class="description">
                                <?php echo $editing_mode 
                                    ? esc_html__( 'Deja en blanco para mantener el PDF actual. Máximo 100MB.', 'flipbook-contraplano-vibe' )
                                    : esc_html__( 'Máximo 100MB.', 'flipbook-contraplano-vibe' ); 
                                ?>
                            </p>
                        </div>
                        
                        <div class="form-field">
                            <button type="submit" class="button button-primary" id="upload-pdf-button">
                                <?php echo $editing_mode 
                                    ? esc_html__( 'Actualizar PDF', 'flipbook-contraplano-vibe' )
                                    : esc_html__( 'Subir PDF', 'flipbook-contraplano-vibe' ); 
                                ?>
                            </button>
                            
                            <div class="flipbook-upload-progress" style="display: none;">
                                <div class="progress-bar"></div>
                                <span class="progress-text">0%</span>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="flipbook-editor-tools-section" <?php echo $editing_mode ? '' : 'style="display: none;"'; ?>>
                    <h2><?php esc_html_e( 'Herramientas', 'flipbook-contraplano-vibe' ); ?></h2>
                    
                    <div class="form-field">
                        <label for="tool-selector"><?php esc_html_e( 'Seleccionar herramienta:', 'flipbook-contraplano-vibe' ); ?></label>
                        <select id="tool-selector" class="widefat">
                            <option value="none"><?php esc_html_e( 'Ninguna (navegación)', 'flipbook-contraplano-vibe' ); ?></option>
                            <option value="link"><?php esc_html_e( 'Crear enlace', 'flipbook-contraplano-vibe' ); ?></option>
                            <option value="youtube"><?php esc_html_e( 'Insertar YouTube', 'flipbook-contraplano-vibe' ); ?></option>
                            <option value="audio" <?php echo $editing_mode && $edition->type !== 'especial' ? 'disabled' : ''; ?>>
                                <?php esc_html_e( 'Insertar audio', 'flipbook-contraplano-vibe' ); ?>
                            </option>
                        </select>
                    </div>
                    
                    <!-- Formulario para enlaces -->
                    <div id="link-form" class="tool-form" style="display: none;">
                        <h3><?php esc_html_e( 'Configurar enlace', 'flipbook-contraplano-vibe' ); ?></h3>
                        
                        <div class="form-field">
                            <label for="link-url"><?php esc_html_e( 'URL del enlace:', 'flipbook-contraplano-vibe' ); ?></label>
                            <input type="url" id="link-url" class="widefat" placeholder="https://" required>
                        </div>
                        
                        <div class="form-field">
                            <button type="button" id="save-link" class="button button-primary" disabled>
                                <?php esc_html_e( 'Guardar enlace', 'flipbook-contraplano-vibe' ); ?>
                            </button>
                            <button type="button" id="cancel-link" class="button">
                                <?php esc_html_e( 'Cancelar', 'flipbook-contraplano-vibe' ); ?>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Formulario para YouTube -->
                    <div id="youtube-form" class="tool-form" style="display: none;">
                        <h3><?php esc_html_e( 'Configurar video de YouTube', 'flipbook-contraplano-vibe' ); ?></h3>
                        
                        <div class="form-field">
                            <label for="youtube-url"><?php esc_html_e( 'URL del video:', 'flipbook-contraplano-vibe' ); ?></label>
                            <input type="url" id="youtube-url" class="widefat" placeholder="https://youtube.com/watch?v=..." required>
                        </div>
                        
                        <div class="form-field">
                            <button type="button" id="save-youtube" class="button button-primary" disabled>
                                <?php esc_html_e( 'Guardar video', 'flipbook-contraplano-vibe' ); ?>
                            </button>
                            <button type="button" id="cancel-youtube" class="button">
                                <?php esc_html_e( 'Cancelar', 'flipbook-contraplano-vibe' ); ?>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Formulario para audio -->
                    <div id="audio-form" class="tool-form" style="display: none;">
                        <h3><?php esc_html_e( 'Configurar audio', 'flipbook-contraplano-vibe' ); ?></h3>
                        
                        <div class="form-field">
                            <label for="audio-file"><?php esc_html_e( 'Archivo de audio (MP3):', 'flipbook-contraplano-vibe' ); ?></label>
                            <input type="file" id="audio-file" accept=".mp3" required>
                        </div>
                        
                        <div class="form-field">
                            <label>
                                <input type="checkbox" id="audio-autoplay">
                                <?php esc_html_e( 'Reproducir automáticamente', 'flipbook-contraplano-vibe' ); ?>
                            </label>
                        </div>
                        
                        <div class="form-field">
                            <button type="button" id="save-audio" class="button button-primary" disabled>
                                <?php esc_html_e( 'Guardar audio', 'flipbook-contraplano-vibe' ); ?>
                            </button>
                            <button type="button" id="cancel-audio" class="button">
                                <?php esc_html_e( 'Cancelar', 'flipbook-contraplano-vibe' ); ?>
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-field save-all-container">
                        <button type="button" id="save-all-areas" class="button button-primary">
                            <?php esc_html_e( 'Guardar todos los cambios', 'flipbook-contraplano-vibe' ); ?>
                        </button>
                    </div>
                    
                    <div class="form-field">
                        <p class="current-page-info">
                            <?php esc_html_e( 'Página actual:', 'flipbook-contraplano-vibe' ); ?> <span id="current-page-num">0</span> / <span id="total-pages">0</span>
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="flipbook-editor-preview">
                <?php if ( $editing_mode ) : ?>
                    <div id="pdf-editor-container" class="pdf-editor-container" data-edition-id="<?php echo esc_attr( $edition_id ); ?>" data-pdf-url="<?php echo esc_url( $pdf_url ); ?>">
                        <div class="flipbook-loading">
                            <div class="spinner"></div>
                            <p><?php esc_html_e( 'Cargando PDF...', 'flipbook-contraplano-vibe' ); ?></p>
                        </div>
                        
                        <div class="pdf-canvas-container">
                            <canvas id="pdf-canvas"></canvas>
                            <div id="interactive-layer" class="interactive-layer"></div>
                        </div>
                        
                        <div class="editor-controls">
                            <button id="prev-page" class="button">
                                <span class="dashicons dashicons-arrow-left-alt"></span>
                            </button>
                            <span id="page-num">1</span> / <span id="page-count">0</span>
                            <button id="next-page" class="button">
                                <span class="dashicons dashicons-arrow-right-alt"></span>
                            </button>
                        </div>
                    </div>
                <?php else : ?>
                    <div class="pdf-upload-placeholder">
                        <div class="placeholder-content">
                            <span class="dashicons dashicons-upload"></span>
                            <p><?php esc_html_e( 'Sube un archivo PDF para comenzar a editarlo', 'flipbook-contraplano-vibe' ); ?></p>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>
</div> 