<?php
/**
 * Plantilla para la página de administración del plugin Vibebook Flip
 */
?>
<div class="wrap">
    <div class="vibebook-admin-container">
        <div class="vibebook-admin-header">
            <h2>📚 Vibebook Flipbook 📚</h2>
        </div>
        
        <div class="vibebook-tabs">
            <a href="#vibebook-tab-upload" class="vibebook-tab-link"><?php _e('Subir/Seleccionar PDF', 'vibebook-flip'); ?></a>
            <a href="#vibebook-tab-edit" class="vibebook-tab-link"><?php _e('Editar Flipbook', 'vibebook-flip'); ?></a>
            <a href="#vibebook-tab-manage" class="vibebook-tab-link"><?php _e('Gestionar Ediciones', 'vibebook-flip'); ?></a>
        </div>
        
        <div id="vibebook-tab-upload" class="vibebook-tab-content">
            <div class="vibebook-form-group">
                <label for="vibebook-title"><?php _e('Título del Flipbook', 'vibebook-flip'); ?></label>
                <input type="text" id="vibebook-title" placeholder="<?php _e('Ingresa un título', 'vibebook-flip'); ?>">
            </div>
            
            <div class="vibebook-form-group">
                <button id="vibebook-select-pdf" class="vibebook-button"><?php _e('Seleccionar PDF', 'vibebook-flip'); ?></button>
                <div id="vibebook-pdf-info" style="display: none; margin-top: 10px;">
                    <strong><?php _e('PDF seleccionado:', 'vibebook-flip'); ?></strong> <span id="vibebook-pdf-name"></span>
                </div>
            </div>
            
            <div class="vibebook-form-group">
                <button id="vibebook-save-flipbook" class="vibebook-button"><?php _e('Guardar Flipbook', 'vibebook-flip'); ?></button>
            </div>
        </div>
        
        <div id="vibebook-tab-edit" class="vibebook-tab-content">
            <div id="vibebook-editor-loading" style="display: none;">
                <div class="vibebook-loading">
                    <div class="vibebook-loading-spinner"></div>
                </div>
                <p><?php _e('Cargando editor...', 'vibebook-flip'); ?></p>
            </div>
            
            <div id="vibebook-editor-content">
                <h3 id="vibebook-editor-title"><?php _e('Editar Flipbook', 'vibebook-flip'); ?></h3>
                
                <div class="vibebook-editor">
                    <div class="vibebook-editor-pdf">
                        <div class="vibebook-pdf-toolbar">
                            <button id="vibebook-prev-page" class="vibebook-button secondary">← <?php _e('Anterior', 'vibebook-flip'); ?></button>
                            <select id="vibebook-page-select"></select>
                            <button id="vibebook-next-page" class="vibebook-button secondary"><?php _e('Siguiente', 'vibebook-flip'); ?> →</button>
                        </div>
                        
                        <div id="vibebook-pdf-container">
                            <div id="vibebook-pdf-loading" class="vibebook-loading">
                                <div class="vibebook-loading-spinner"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="vibebook-editor-tools">
                        <div class="vibebook-tools">
                            <h4 class="vibebook-tools-title"><?php _e('Herramientas', 'vibebook-flip'); ?></h4>
                            
                            <div class="vibebook-tools-buttons">
                                <button class="vibebook-tool-button" data-tool="url"><?php _e('Enlace URL', 'vibebook-flip'); ?></button>
                                <button class="vibebook-tool-button" data-tool="youtube"><?php _e('YouTube', 'vibebook-flip'); ?></button>
                                <button class="vibebook-tool-button" data-tool="internal"><?php _e('Navegación interna', 'vibebook-flip'); ?></button>
                                <button class="vibebook-tool-button" data-tool="audio"><?php _e('Audio', 'vibebook-flip'); ?></button>
                            </div>
                            
                            <div id="vibebook-option-url" class="vibebook-tool-options">
                                <div class="vibebook-form-group">
                                    <label for="vibebook-url-target"><?php _e('URL de destino:', 'vibebook-flip'); ?></label>
                                    <input type="text" id="vibebook-url-target" placeholder="https://">
                                </div>
                                
                                <button id="vibebook-save-url" class="vibebook-button"><?php _e('Guardar enlace', 'vibebook-flip'); ?></button>
                            </div>
                            
                            <div id="vibebook-option-youtube" class="vibebook-tool-options">
                                <div class="vibebook-form-group">
                                    <label for="vibebook-youtube-url"><?php _e('URL de YouTube:', 'vibebook-flip'); ?></label>
                                    <input type="text" id="vibebook-youtube-url" placeholder="https://www.youtube.com/watch?v=...">
                                </div>
                                
                                <button id="vibebook-save-youtube" class="vibebook-button"><?php _e('Guardar YouTube', 'vibebook-flip'); ?></button>
                            </div>
                            
                            <div id="vibebook-option-internal" class="vibebook-tool-options">
                                <div class="vibebook-form-group">
                                    <label for="vibebook-internal-page"><?php _e('Página de destino:', 'vibebook-flip'); ?></label>
                                    <select id="vibebook-internal-page"></select>
                                </div>
                                
                                <div class="vibebook-form-group">
                                    <label for="vibebook-internal-color"><?php _e('Color:', 'vibebook-flip'); ?></label>
                                    <select id="vibebook-internal-color">
                                        <option value="blue"><?php _e('Azul', 'vibebook-flip'); ?></option>
                                        <option value="red"><?php _e('Rojo', 'vibebook-flip'); ?></option>
                                        <option value="green"><?php _e('Verde', 'vibebook-flip'); ?></option>
                                        <option value="orange"><?php _e('Naranja', 'vibebook-flip'); ?></option>
                                    </select>
                                </div>
                                
                                <button id="vibebook-save-internal" class="vibebook-button"><?php _e('Guardar navegación', 'vibebook-flip'); ?></button>
                            </div>
                            
                            <div id="vibebook-option-audio" class="vibebook-tool-options">
                                <div class="vibebook-form-group">
                                    <label><?php _e('Archivo de audio:', 'vibebook-flip'); ?></label>
                                    <p id="vibebook-audio-name"><?php _e('Ninguno', 'vibebook-flip'); ?></p>
                                    <button id="vibebook-select-audio" class="vibebook-button secondary"><?php _e('Seleccionar audio', 'vibebook-flip'); ?></button>
                                </div>
                                
                                <div class="vibebook-form-group">
                                    <label>
                                        <input type="checkbox" id="vibebook-audio-autoplay">
                                        <?php _e('Reproducir automáticamente', 'vibebook-flip'); ?>
                                    </label>
                                </div>
                                
                                <button id="vibebook-save-audio" class="vibebook-button"><?php _e('Guardar audio', 'vibebook-flip'); ?></button>
                            </div>
                        </div>
                        
                        <div class="vibebook-areas">
                            <h4 class="vibebook-areas-title"><?php _e('Áreas en esta página', 'vibebook-flip'); ?></h4>
                            <ul id="vibebook-areas-list" class="vibebook-areas-list"></ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="vibebook-tab-manage" class="vibebook-tab-content">
            <h3><?php _e('Gestionar Ediciones', 'vibebook-flip'); ?></h3>
            
            <?php
            // Obtener todos los flipbooks
            $flipbooks = get_posts(array(
                'post_type' => 'vibebook_flipbook',
                'posts_per_page' => -1,
                'orderby' => 'title',
                'order' => 'ASC',
            ));
            ?>
            
            <?php if (empty($flipbooks)) : ?>
                <p><?php _e('No hay flipbooks disponibles. Por favor, crea uno primero.', 'vibebook-flip'); ?></p>
            <?php else : ?>
                <table class="vibebook-editions-table">
                    <thead>
                        <tr>
                            <th><?php _e('Título', 'vibebook-flip'); ?></th>
                            <th><?php _e('Shortcode', 'vibebook-flip'); ?></th>
                            <th><?php _e('Acciones', 'vibebook-flip'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($flipbooks as $flipbook) : ?>
                            <tr>
                                <td><?php echo esc_html($flipbook->post_title); ?></td>
                                <td><code>[flipbook id="<?php echo esc_attr($flipbook->ID); ?>"]</code></td>
                                <td class="actions">
                                    <a href="#" class="vibebook-edit-flipbook" data-id="<?php echo esc_attr($flipbook->ID); ?>"><?php _e('Editar', 'vibebook-flip'); ?></a>
                                    <a href="<?php echo esc_url(admin_url('admin-post.php?action=vibebook_delete_flipbook&id=' . $flipbook->ID . '&nonce=' . wp_create_nonce('vibebook_delete_flipbook'))); ?>" class="vibebook-delete-flipbook" onclick="return confirm('<?php esc_attr_e('¿Estás seguro de que deseas eliminar este flipbook?', 'vibebook-flip'); ?>');"><?php _e('Eliminar', 'vibebook-flip'); ?></a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
    </div>
</div>
