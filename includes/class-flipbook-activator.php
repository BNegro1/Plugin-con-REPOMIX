<?php
/**
 * Clase para manejar la activación del plugin
 *
 * @package    FlipbookContraplanoVibe
 * @subpackage FlipbookContraplanoVibe/includes
 */

/**
 * Clase para manejar la activación del plugin.
 *
 * Define todo lo necesario para crear las tablas en la base de datos
 * y configurar el entorno para el funcionamiento del plugin.
 *
 * @package    FlipbookContraplanoVibe
 * @subpackage FlipbookContraplanoVibe/includes
 */
class FlipbookCVB_Activator {

    /**
     * Método que se ejecuta durante la activación del plugin.
     *
     * Crea las tablas necesarias en la base de datos para almacenar las ediciones,
     * áreas interactivas y audios del flipbook.
     *
     * @return void
     */
    public static function activate(): void {
        global $wpdb;
        
        // Charset y collate de la base de datos
        $charset_collate = $wpdb->get_charset_collate();
        
        // Nombre de las tablas con prefijo
        $table_editions = $wpdb->prefix . 'flipbook_editions';
        $table_areas = $wpdb->prefix . 'flipbook_areas';
        $table_audio = $wpdb->prefix . 'flipbook_audio';
        
        // SQL para tabla de ediciones
        $sql_editions = "CREATE TABLE $table_editions (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            post_id bigint(20) NOT NULL,
            type varchar(50) NOT NULL,
            pdf_path text NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        
        // SQL para tabla de áreas interactivas
        $sql_areas = "CREATE TABLE $table_areas (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            edition_id mediumint(9) NOT NULL,
            page_num int(11) NOT NULL,
            x_coord float NOT NULL,
            y_coord float NOT NULL,
            width float NOT NULL,
            height float NOT NULL,
            link_type varchar(50) NOT NULL,
            link_target text NOT NULL,
            PRIMARY KEY  (id),
            KEY edition_id (edition_id)
        ) $charset_collate;";
        
        // SQL para tabla de audio
        $sql_audio = "CREATE TABLE $table_audio (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            edition_id mediumint(9) NOT NULL,
            page_num int(11) NOT NULL,
            file_path text NOT NULL,
            x_coord float NOT NULL,
            y_coord float NOT NULL,
            autoplay tinyint(1) DEFAULT 0 NOT NULL,
            PRIMARY KEY  (id),
            KEY edition_id (edition_id)
        ) $charset_collate;";
        
        // Incluir archivo para dbDelta
        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        
        // Crear las tablas
        dbDelta( $sql_editions );
        dbDelta( $sql_areas );
        dbDelta( $sql_audio );
        
        // Crear carpeta uploads si no existe
        $upload_dir = wp_upload_dir();
        $flipbook_dir = $upload_dir['basedir'] . '/flipbook-vibe';
        
        if ( ! file_exists( $flipbook_dir ) ) {
            wp_mkdir_p( $flipbook_dir );
            wp_mkdir_p( $flipbook_dir . '/pdfs' );
            wp_mkdir_p( $flipbook_dir . '/audio' );
        }
        
        // Agregar capacidades al administrador
        $admin_role = get_role( 'administrator' );
        if ( $admin_role ) {
            $admin_role->add_cap( 'manage_flipbook' );
        }
    }
} 