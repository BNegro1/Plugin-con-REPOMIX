<?php
/**
 * Clase para manejar la desactivación del plugin
 *
 * @package    FlipbookContraplanoVibe
 * @subpackage FlipbookContraplanoVibe/includes
 */

/**
 * Clase para manejar la desactivación del plugin.
 *
 * Define todas las acciones necesarias durante la desactivación del plugin.
 *
 * @package    FlipbookContraplanoVibe
 * @subpackage FlipbookContraplanoVibe/includes
 */
class FlipbookCVB_Deactivator {

    /**
     * Método que se ejecuta durante la desactivación del plugin.
     *
     * Realiza tareas de limpieza, como eliminar capacidades de usuario,
     * pero mantiene los datos en la base de datos para no perder la configuración.
     *
     * @return void
     */
    public static function deactivate(): void {
        // Eliminar capacidades de usuario
        $admin_role = get_role( 'administrator' );
        if ( $admin_role ) {
            $admin_role->remove_cap( 'manage_flipbook' );
        }
        
        // Limpiar hooks registrados
        wp_clear_scheduled_hook( 'flipbook_cvb_cleanup' );
    }
} 