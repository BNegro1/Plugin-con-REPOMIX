<?php
/**
 * Plugin Name: Flipbook Contraplano Vibe
 * Description: Plugin para visualizar PDFs como flipbooks interactivos con capacidades avanzadas de audio, vídeo y enlaces.
 * Version: 1.0.0
 * Author: Contraplano Vibe
 * Author URI: https://contraplano.com
 * Text Domain: flipbook-contraplano-vibe
 * Domain Path: /languages
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 *
 * @package FlipbookContraplanoVibe
 */

// Si este archivo es llamado directamente, abortar.
if ( ! defined( 'WPINC' ) ) {
    die;
}

// Definir constantes del plugin
define( 'FLIPBOOK_CVB_VERSION', '1.0.0' );
define( 'FLIPBOOK_CVB_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'FLIPBOOK_CVB_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'FLIPBOOK_CVB_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Función que se ejecuta durante la activación del plugin
 *
 * @return void
 */
function flipbook_cvb_activate() {
    // Crear las tablas necesarias en la base de datos
    require_once FLIPBOOK_CVB_PLUGIN_DIR . 'includes/class-flipbook-activator.php';
    FlipbookCVB_Activator::activate();
}

/**
 * Función que se ejecuta durante la desactivación del plugin
 *
 * @return void
 */
function flipbook_cvb_deactivate() {
    // Limpieza al desactivar
    require_once FLIPBOOK_CVB_PLUGIN_DIR . 'includes/class-flipbook-deactivator.php';
    FlipbookCVB_Deactivator::deactivate();
}

// Registrar hooks de activación y desactivación
register_activation_hook( __FILE__, 'flipbook_cvb_activate' );
register_deactivation_hook( __FILE__, 'flipbook_cvb_deactivate' );

/**
 * Incluir las clases necesarias para el funcionamiento del plugin
 */
require_once FLIPBOOK_CVB_PLUGIN_DIR . 'includes/class-flipbook.php';

/**
 * Iniciar el plugin
 */
function flipbook_cvb_init() {
    $plugin = new FlipbookCVB();
    $plugin->run();
}

// Iniciar el plugin
flipbook_cvb_init(); 