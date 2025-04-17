<?php
/**
 * Plantilla para la página principal de administración del plugin
 *
 * @package FlipbookContraplanoVibe
 */

// Si este archivo es llamado directamente, abortar
if ( ! defined( 'WPINC' ) ) {
    die;
}

// Obtener lista de ediciones
global $wpdb;
$table_editions = $wpdb->prefix . 'flipbook_editions';
$editions = $wpdb->get_results(
    "SELECT e.*, p.post_title 
    FROM $table_editions e 
    INNER JOIN {$wpdb->posts} p ON e.post_id = p.ID 
    ORDER BY e.created_at DESC",
    ARRAY_A
);
?>

<div class="wrap flipbook-admin">
    <h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
    
    <div class="flipbook-admin-welcome">
        <div class="flipbook-admin-welcome-content">
            <h2><?php esc_html_e( 'Bienvenido a Flipbook Contraplano Vibe', 'flipbook-contraplano-vibe' ); ?></h2>
            <p><?php esc_html_e( 'Este plugin te permite crear flipbooks interactivos a partir de archivos PDF, con capacidades avanzadas como enlaces, videos de YouTube y audio incrustado.', 'flipbook-contraplano-vibe' ); ?></p>
            
            <div class="flipbook-admin-welcome-buttons">
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=flipbook-vibe-editor' ) ); ?>" class="button button-primary">
                    <?php esc_html_e( 'Crear nuevo flipbook', 'flipbook-contraplano-vibe' ); ?>
                </a>
                
                <a href="https://contraplano.com/docs/flipbook-vibe" target="_blank" class="button">
                    <?php esc_html_e( 'Ver documentación', 'flipbook-contraplano-vibe' ); ?>
                </a>
            </div>
        </div>
    </div>
    
    <div class="flipbook-admin-tabs">
        <nav class="nav-tab-wrapper">
            <a href="#editions" class="nav-tab nav-tab-active"><?php esc_html_e( 'Ediciones', 'flipbook-contraplano-vibe' ); ?></a>
            <a href="#info" class="nav-tab"><?php esc_html_e( 'Información', 'flipbook-contraplano-vibe' ); ?></a>
        </nav>
        
        <div id="editions" class="tab-content active">
            <h2><?php esc_html_e( 'Ediciones existentes', 'flipbook-contraplano-vibe' ); ?></h2>
            
            <?php if ( empty( $editions ) ) : ?>
                <p><?php esc_html_e( 'No hay ediciones creadas aún.', 'flipbook-contraplano-vibe' ); ?></p>
            <?php else : ?>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th><?php esc_html_e( 'ID', 'flipbook-contraplano-vibe' ); ?></th>
                            <th><?php esc_html_e( 'Post', 'flipbook-contraplano-vibe' ); ?></th>
                            <th><?php esc_html_e( 'Tipo', 'flipbook-contraplano-vibe' ); ?></th>
                            <th><?php esc_html_e( 'Fecha', 'flipbook-contraplano-vibe' ); ?></th>
                            <th><?php esc_html_e( 'Shortcode', 'flipbook-contraplano-vibe' ); ?></th>
                            <th><?php esc_html_e( 'Acciones', 'flipbook-contraplano-vibe' ); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ( $editions as $edition ) : ?>
                            <tr>
                                <td><?php echo esc_html( $edition['id'] ); ?></td>
                                <td>
                                    <a href="<?php echo esc_url( get_edit_post_link( $edition['post_id'] ) ); ?>">
                                        <?php echo esc_html( $edition['post_title'] ); ?>
                                    </a>
                                </td>
                                <td>
                                    <?php if ( $edition['type'] === 'especial' ) : ?>
                                        <span class="flipbook-edition-type special"><?php esc_html_e( 'Especial', 'flipbook-contraplano-vibe' ); ?></span>
                                    <?php else : ?>
                                        <span class="flipbook-edition-type normal"><?php esc_html_e( 'Normal', 'flipbook-contraplano-vibe' ); ?></span>
                                    <?php endif; ?>
                                </td>
                                <td><?php echo esc_html( date_i18n( get_option( 'date_format' ), strtotime( $edition['created_at'] ) ) ); ?></td>
                                <td>
                                    <code>[flipbook id="<?php echo esc_attr( $edition['id'] ); ?>"]</code>
                                    <button class="copy-shortcode button-link" data-shortcode='[flipbook id="<?php echo esc_attr( $edition['id'] ); ?>"]'>
                                        <span class="dashicons dashicons-clipboard"></span>
                                    </button>
                                </td>
                                <td>
                                    <a href="<?php echo esc_url( admin_url( 'admin.php?page=flipbook-vibe-editor&edition_id=' . $edition['id'] ) ); ?>" class="button button-small">
                                        <?php esc_html_e( 'Editar', 'flipbook-contraplano-vibe' ); ?>
                                    </a>
                                    
                                    <a href="<?php echo esc_url( get_permalink( $edition['post_id'] ) ); ?>" target="_blank" class="button button-small">
                                        <?php esc_html_e( 'Ver', 'flipbook-contraplano-vibe' ); ?>
                                    </a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
        
        <div id="info" class="tab-content">
            <h2><?php esc_html_e( 'Información del plugin', 'flipbook-contraplano-vibe' ); ?></h2>
            
            <div class="flipbook-info-content">
                <h3><?php esc_html_e( 'Cómo usar el plugin', 'flipbook-contraplano-vibe' ); ?></h3>
                <ol>
                    <li><?php esc_html_e( 'Crea un nuevo flipbook desde la pestaña "Editar Flipbook".', 'flipbook-contraplano-vibe' ); ?></li>
                    <li><?php esc_html_e( 'Sube un archivo PDF y selecciona si es una edición normal o especial (con audio).', 'flipbook-contraplano-vibe' ); ?></li>
                    <li><?php esc_html_e( 'Configura áreas interactivas (enlaces, YouTube) y audio si es una edición especial.', 'flipbook-contraplano-vibe' ); ?></li>
                    <li><?php esc_html_e( 'Copia el shortcode generado y pégalo en cualquier página o post.', 'flipbook-contraplano-vibe' ); ?></li>
                </ol>
                
                <h3><?php esc_html_e( 'Shortcode', 'flipbook-contraplano-vibe' ); ?></h3>
                <p><?php esc_html_e( 'Puedes personalizar el flipbook con los siguientes atributos:', 'flipbook-contraplano-vibe' ); ?></p>
                <code>[flipbook id="123" width="100%" height="600px" background="#f1f1f1"]</code>
                
                <h3><?php esc_html_e( 'Soporte', 'flipbook-contraplano-vibe' ); ?></h3>
                <p>
                    <?php
                    printf(
                        esc_html__( 'Si necesitas ayuda, visita la %1$spágina de soporte%2$s.', 'flipbook-contraplano-vibe' ),
                        '<a href="https://contraplano.com/soporte" target="_blank">',
                        '</a>'
                    );
                    ?>
                </p>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript">
    document.addEventListener('DOMContentLoaded', function() {
        // Tabs de navegación
        var tabs = document.querySelectorAll('.nav-tab');
        var tabContents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(function(tab) {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Quitar clase activa de todas las pestañas
                tabs.forEach(function(t) {
                    t.classList.remove('nav-tab-active');
                });
                
                // Ocultar todos los contenidos
                tabContents.forEach(function(content) {
                    content.classList.remove('active');
                });
                
                // Activar pestaña y contenido
                this.classList.add('nav-tab-active');
                var target = this.getAttribute('href').substring(1);
                document.getElementById(target).classList.add('active');
            });
        });
        
        // Copiar shortcode al portapapeles
        var copyButtons = document.querySelectorAll('.copy-shortcode');
        copyButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                var shortcode = this.getAttribute('data-shortcode');
                navigator.clipboard.writeText(shortcode).then(function() {
                    // Feedback visual
                    var icon = button.querySelector('.dashicons');
                    icon.classList.remove('dashicons-clipboard');
                    icon.classList.add('dashicons-yes');
                    
                    setTimeout(function() {
                        icon.classList.remove('dashicons-yes');
                        icon.classList.add('dashicons-clipboard');
                    }, 1000);
                });
            });
        });
    });
</script> 