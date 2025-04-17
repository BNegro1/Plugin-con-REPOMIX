<?php
/**
 * La clase principal del plugin.
 *
 * Define la funcionalidad principal del plugin, incluyendo la carga de recursos,
 * registro de shortcodes y creación de las páginas de administración.
 *
 * @package    FlipbookContraplanoVibe
 * @subpackage FlipbookContraplanoVibe/includes
 */

/**
 * La clase principal del plugin.
 *
 * @package    FlipbookContraplanoVibe
 * @subpackage FlipbookContraplanoVibe/includes
 */
class FlipbookCVB {

    /**
     * El cargador que mantiene todos los hooks que están registrados en el plugin.
     *
     * @var array $hooks
     */
    protected array $hooks;

    /**
     * Constructor de la clase.
     *
     * Inicializa las propiedades y define los hooks necesarios.
     */
    public function __construct() {
        $this->hooks = [];
        $this->define_admin_hooks();
        $this->define_public_hooks();
        $this->define_shortcodes();
    }

    /**
     * Define los hooks relacionados con el área de administración.
     *
     * @return void
     */
    private function define_admin_hooks(): void {
        // Agregar menú de administración
        add_action('admin_menu', [$this, 'add_admin_menu']);
        
        // Registrar scripts y estilos para el admin
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_styles']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);
        
        // Registrar AJAX handlers para el editor
        add_action('wp_ajax_flipbook_upload_pdf', [$this, 'handle_pdf_upload']);
        add_action('wp_ajax_flipbook_save_areas', [$this, 'handle_save_areas']);
        add_action('wp_ajax_flipbook_upload_audio', [$this, 'handle_audio_upload']);
        
        // Guardar hooks para limpiar más tarde
        $this->hooks[] = 'admin_menu';
        $this->hooks[] = 'admin_enqueue_scripts';
        $this->hooks[] = 'wp_ajax_flipbook_upload_pdf';
        $this->hooks[] = 'wp_ajax_flipbook_save_areas';
        $this->hooks[] = 'wp_ajax_flipbook_upload_audio';
    }

    /**
     * Define los hooks relacionados con la parte pública.
     *
     * @return void
     */
    private function define_public_hooks(): void {
        // Registrar scripts y estilos para el front-end
        add_action('wp_enqueue_scripts', [$this, 'enqueue_public_styles']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_public_scripts']);
        
        // Guardar hooks para limpiar más tarde
        $this->hooks[] = 'wp_enqueue_scripts';
    }

    /**
     * Define los shortcodes del plugin.
     *
     * @return void
     */
    private function define_shortcodes(): void {
        add_shortcode('flipbook', [$this, 'render_flipbook']);
    }

    /**
     * Agrega el menú de administración.
     *
     * @return void
     */
    public function add_admin_menu(): void {
        add_menu_page(
            __('Flipbook Vibe', 'flipbook-contraplano-vibe'),
            __('Flipbook Vibe', 'flipbook-contraplano-vibe'),
            'manage_flipbook',
            'flipbook-vibe',
            [$this, 'display_admin_page'],
            'dashicons-book',
            26
        );
        
        add_submenu_page(
            'flipbook-vibe',
            __('Editar Flipbook', 'flipbook-contraplano-vibe'),
            __('Editar Flipbook', 'flipbook-contraplano-vibe'),
            'manage_flipbook',
            'flipbook-vibe-editor',
            [$this, 'display_editor_page']
        );
    }

    /**
     * Registra los estilos para el área de administración.
     *
     * @param string $hook_suffix El sufijo del hook actual.
     * @return void
     */
    public function enqueue_admin_styles(string $hook_suffix): void {
        if (!$this->is_flipbook_admin_page($hook_suffix)) {
            return;
        }
        
        wp_enqueue_style(
            'flipbook-admin-css',
            FLIPBOOK_CVB_PLUGIN_URL . 'css/flipbook-admin.css',
            [],
            FLIPBOOK_CVB_VERSION,
            'all'
        );
    }

    /**
     * Registra los scripts para el área de administración.
     *
     * @param string $hook_suffix El sufijo del hook actual.
     * @return void
     */
    public function enqueue_admin_scripts(string $hook_suffix): void {
        if (!$this->is_flipbook_admin_page($hook_suffix)) {
            return;
        }
        
        // PDF.js para renderizar PDF
        wp_enqueue_script(
            'pdfjs',
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
            [],
            '3.4.120',
            true
        );
        
        // Script principal del editor
        wp_enqueue_script(
            'flipbook-editor-js',
            FLIPBOOK_CVB_PLUGIN_URL . 'js/editor-ui.js',
            ['jquery', 'pdfjs'],
            FLIPBOOK_CVB_VERSION,
            true
        );
        
        // Localizar script con nonce y ajaxurl
        wp_localize_script(
            'flipbook-editor-js',
            'flipbookData',
            [
                'ajaxurl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('flipbook_ajax_nonce'),
                'pluginUrl' => FLIPBOOK_CVB_PLUGIN_URL,
            ]
        );
    }

    /**
     * Registra los estilos para el front-end.
     *
     * @return void
     */
    public function enqueue_public_styles(): void {
        // Solo cargar cuando se usa el shortcode
        if (!$this->is_flipbook_used()) {
            return;
        }
        
        wp_enqueue_style(
            'flipbook-css',
            FLIPBOOK_CVB_PLUGIN_URL . 'css/flipbook.css',
            [],
            FLIPBOOK_CVB_VERSION,
            'all'
        );
    }

    /**
     * Registra los scripts para el front-end.
     *
     * @return void
     */
    public function enqueue_public_scripts(): void {
        // Solo cargar cuando se usa el shortcode
        if (!$this->is_flipbook_used()) {
            return;
        }
        
        // PDF.js para renderizar PDF
        wp_enqueue_script(
            'pdfjs',
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
            [],
            '3.4.120',
            true
        );
        
        // Script principal del flipbook
        wp_enqueue_script(
            'flipbook-core-js',
            FLIPBOOK_CVB_PLUGIN_URL . 'js/flipbook-core.js',
            ['jquery', 'pdfjs'],
            FLIPBOOK_CVB_VERSION,
            true
        );
        
        // Localizar script con datos necesarios
        wp_localize_script(
            'flipbook-core-js',
            'flipbookData',
            [
                'ajaxurl' => admin_url('admin-ajax.php'),
                'pluginUrl' => FLIPBOOK_CVB_PLUGIN_URL,
            ]
        );
    }

    /**
     * Renderiza el flipbook en el front-end mediante shortcode.
     *
     * @param array $atts Atributos del shortcode.
     * @return string HTML del flipbook.
     */
    public function render_flipbook(array $atts = []): string {
        $atts = shortcode_atts(
            [
                'id' => 0,
                'width' => '100%',
                'height' => '600px',
                'background' => '#f1f1f1',
            ],
            $atts,
            'flipbook'
        );
        
        // Buscar la edición más reciente para este post si no se especifica ID
        global $wpdb;
        $edition_id = (int) $atts['id'];
        $table_editions = $wpdb->prefix . 'flipbook_editions';
        
        if ($edition_id === 0) {
            $post_id = get_the_ID();
            if (!$post_id) {
                return '<p>' . __('Error: No se pudo determinar el ID del post.', 'flipbook-contraplano-vibe') . '</p>';
            }
            
            $edition = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT * FROM $table_editions WHERE post_id = %d ORDER BY created_at DESC LIMIT 1",
                    $post_id
                )
            );
            
            if (!$edition) {
                return '<p>' . __('No hay ningún flipbook asociado a este post.', 'flipbook-contraplano-vibe') . '</p>';
            }
            
            $edition_id = $edition->id;
        } else {
            $edition = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT * FROM $table_editions WHERE id = %d",
                    $edition_id
                )
            );
            
            if (!$edition) {
                return '<p>' . __('No se encontró el flipbook solicitado.', 'flipbook-contraplano-vibe') . '</p>';
            }
        }
        
        // Cargar la plantilla del frontend
        ob_start();
        include FLIPBOOK_CVB_PLUGIN_DIR . 'templates/frontend.php';
        return ob_get_clean();
    }

    /**
     * Verifica si la página actual es una página de administración del plugin.
     *
     * @param string $hook_suffix El sufijo del hook actual.
     * @return bool Verdadero si es una página de administración del plugin.
     */
    private function is_flipbook_admin_page(string $hook_suffix): bool {
        return in_array($hook_suffix, ['toplevel_page_flipbook-vibe', 'flipbook-vibe_page_flipbook-vibe-editor'], true);
    }

    /**
     * Verifica si el shortcode de flipbook está siendo utilizado en la página actual.
     *
     * @return bool Verdadero si el shortcode está siendo utilizado.
     */
    private function is_flipbook_used(): bool {
        global $post;
        return is_singular() && $post && has_shortcode($post->post_content, 'flipbook');
    }

    /**
     * Muestra la página principal de administración.
     *
     * @return void
     */
    public function display_admin_page(): void {
        include FLIPBOOK_CVB_PLUGIN_DIR . 'templates/admin-page.php';
    }

    /**
     * Muestra la página de editor del flipbook.
     *
     * @return void
     */
    public function display_editor_page(): void {
        include FLIPBOOK_CVB_PLUGIN_DIR . 'templates/editor-page.php';
    }

    /**
     * Maneja la subida de archivos PDF.
     *
     * @return void
     */
    public function handle_pdf_upload(): void {
        // Verificar nonce
        check_ajax_referer('flipbook_ajax_nonce', 'nonce');
        
        // Verificar permisos
        if (!current_user_can('manage_flipbook')) {
            wp_send_json_error(['message' => __('No tienes permiso para realizar esta acción.', 'flipbook-contraplano-vibe')]);
            return;
        }
        
        // Verificar archivo y post_id
        if (!isset($_FILES['pdf_file']) || !isset($_POST['post_id']) || !isset($_POST['edition_type'])) {
            wp_send_json_error(['message' => __('Datos incompletos.', 'flipbook-contraplano-vibe')]);
            return;
        }
        
        $post_id = (int) $_POST['post_id'];
        $edition_type = sanitize_text_field($_POST['edition_type']);
        
        // Validar que el tipo de edición sea correcto
        if (!in_array($edition_type, ['normal', 'especial'], true)) {
            wp_send_json_error(['message' => __('Tipo de edición no válido.', 'flipbook-contraplano-vibe')]);
            return;
        }
        
        // Configurar la carpeta de destino
        $upload_dir = wp_upload_dir();
        $flipbook_dir = $upload_dir['basedir'] . '/flipbook-vibe/pdfs';
        
        // Asegurarse de que la carpeta existe
        if (!file_exists($flipbook_dir)) {
            wp_mkdir_p($flipbook_dir);
        }
        
        // Procesar el archivo
        $file = $_FILES['pdf_file'];
        
        // Validar el tipo de archivo
        $filetype = wp_check_filetype($file['name'], ['pdf' => 'application/pdf']);
        if ($filetype['ext'] !== 'pdf') {
            wp_send_json_error(['message' => __('Solo se permiten archivos PDF.', 'flipbook-contraplano-vibe')]);
            return;
        }
        
        // Validar tamaño (máximo 100MB)
        if ($file['size'] > 100 * 1024 * 1024) {
            wp_send_json_error(['message' => __('El archivo es demasiado grande. El tamaño máximo es 100MB.', 'flipbook-contraplano-vibe')]);
            return;
        }
        
        // Generar nombre de archivo único basado en post_id y timestamp
        $filename = 'flipbook-' . $post_id . '-' . time() . '.pdf';
        $file_path = $flipbook_dir . '/' . $filename;
        
        // Mover el archivo
        if (!move_uploaded_file($file['tmp_name'], $file_path)) {
            wp_send_json_error(['message' => __('Error al subir el archivo.', 'flipbook-contraplano-vibe')]);
            return;
        }
        
        // Si hay una edición especial anterior y estamos subiendo una nueva especial, mover la anterior a normal
        global $wpdb;
        $table_editions = $wpdb->prefix . 'flipbook_editions';
        $table_audio = $wpdb->prefix . 'flipbook_audio';
        
        if ($edition_type === 'especial') {
            $wpdb->query(
                $wpdb->prepare(
                    "UPDATE $table_editions SET type = 'normal' WHERE post_id = %d AND type = 'especial'",
                    $post_id
                )
            );
        }
        
        // Registrar la nueva edición en la base de datos
        $result = $wpdb->insert(
            $table_editions,
            [
                'post_id' => $post_id,
                'type' => $edition_type,
                'pdf_path' => 'flipbook-vibe/pdfs/' . $filename,
                'created_at' => current_time('mysql'),
            ],
            ['%d', '%s', '%s', '%s']
        );
        
        if (!$result) {
            wp_send_json_error(['message' => __('Error al guardar la información en la base de datos.', 'flipbook-contraplano-vibe')]);
            return;
        }
        
        $edition_id = $wpdb->insert_id;
        
        // Devolver éxito con detalles
        wp_send_json_success([
            'message' => __('Archivo subido correctamente.', 'flipbook-contraplano-vibe'),
            'edition_id' => $edition_id,
            'pdf_url' => $upload_dir['baseurl'] . '/flipbook-vibe/pdfs/' . $filename,
        ]);
    }

    /**
     * Maneja el guardado de áreas interactivas.
     *
     * @return void
     */
    public function handle_save_areas(): void {
        // Verificar nonce
        check_ajax_referer('flipbook_ajax_nonce', 'nonce');
        
        // Verificar permisos
        if (!current_user_can('manage_flipbook')) {
            wp_send_json_error(['message' => __('No tienes permiso para realizar esta acción.', 'flipbook-contraplano-vibe')]);
            return;
        }
        
        // Verificar datos
        if (!isset($_POST['edition_id']) || !isset($_POST['areas']) || !is_array($_POST['areas'])) {
            wp_send_json_error(['message' => __('Datos incompletos.', 'flipbook-contraplano-vibe')]);
            return;
        }
        
        $edition_id = (int) $_POST['edition_id'];
        $areas = $_POST['areas'];
        
        global $wpdb;
        $table_areas = $wpdb->prefix . 'flipbook_areas';
        
        // Eliminar áreas anteriores
        $wpdb->delete($table_areas, ['edition_id' => $edition_id], ['%d']);
        
        // Insertar nuevas áreas
        foreach ($areas as $area) {
            if (
                !isset($area['page_num']) || 
                !isset($area['x']) || 
                !isset($area['y']) || 
                !isset($area['width']) || 
                !isset($area['height']) || 
                !isset($area['link_type']) || 
                !isset($area['link_target'])
            ) {
                continue;
            }
            
            $wpdb->insert(
                $table_areas,
                [
                    'edition_id' => $edition_id,
                    'page_num' => (int) $area['page_num'],
                    'x_coord' => (float) $area['x'],
                    'y_coord' => (float) $area['y'],
                    'width' => (float) $area['width'],
                    'height' => (float) $area['height'],
                    'link_type' => sanitize_text_field($area['link_type']),
                    'link_target' => sanitize_text_field($area['link_target']),
                ],
                ['%d', '%d', '%f', '%f', '%f', '%f', '%s', '%s']
            );
        }
        
        wp_send_json_success(['message' => __('Áreas guardadas correctamente.', 'flipbook-contraplano-vibe')]);
    }

    /**
     * Maneja la subida de archivos de audio.
     *
     * @return void
     */
    public function handle_audio_upload(): void {
        // Verificar nonce
        check_ajax_referer('flipbook_ajax_nonce', 'nonce');
        
        // Verificar permisos
        if (!current_user_can('manage_flipbook')) {
            wp_send_json_error(['message' => __('No tienes permiso para realizar esta acción.', 'flipbook-contraplano-vibe')]);
            return;
        }
        
        // Verificar datos
        if (
            !isset($_FILES['audio_file']) || 
            !isset($_POST['edition_id']) || 
            !isset($_POST['page_num']) || 
            !isset($_POST['x_coord']) || 
            !isset($_POST['y_coord']) || 
            !isset($_POST['autoplay'])
        ) {
            wp_send_json_error(['message' => __('Datos incompletos.', 'flipbook-contraplano-vibe')]);
            return;
        }
        
        $edition_id = (int) $_POST['edition_id'];
        $page_num = (int) $_POST['page_num'];
        $x_coord = (float) $_POST['x_coord'];
        $y_coord = (float) $_POST['y_coord'];
        $autoplay = isset($_POST['autoplay']) && $_POST['autoplay'] === 'true' ? 1 : 0;
        
        // Verificar que la edición existe y es de tipo especial
        global $wpdb;
        $table_editions = $wpdb->prefix . 'flipbook_editions';
        
        $edition = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM $table_editions WHERE id = %d",
                $edition_id
            )
        );
        
        if (!$edition || $edition->type !== 'especial') {
            wp_send_json_error(['message' => __('Esta edición no permite audio o no existe.', 'flipbook-contraplano-vibe')]);
            return;
        }
        
        // Configurar la carpeta de destino
        $upload_dir = wp_upload_dir();
        $audio_dir = $upload_dir['basedir'] . '/flipbook-vibe/audio';
        
        // Asegurarse de que la carpeta existe
        if (!file_exists($audio_dir)) {
            wp_mkdir_p($audio_dir);
        }
        
        // Procesar el archivo
        $file = $_FILES['audio_file'];
        
        // Validar el tipo de archivo
        $filetype = wp_check_filetype($file['name'], ['mp3' => 'audio/mpeg']);
        if ($filetype['ext'] !== 'mp3') {
            wp_send_json_error(['message' => __('Solo se permiten archivos MP3.', 'flipbook-contraplano-vibe')]);
            return;
        }
        
        // Generar nombre de archivo único
        $filename = 'audio-' . $edition_id . '-' . $page_num . '-' . time() . '.mp3';
        $file_path = $audio_dir . '/' . $filename;
        
        // Mover el archivo
        if (!move_uploaded_file($file['tmp_name'], $file_path)) {
            wp_send_json_error(['message' => __('Error al subir el archivo de audio.', 'flipbook-contraplano-vibe')]);
            return;
        }
        
        // Eliminar audio anterior para esta página si existe
        $table_audio = $wpdb->prefix . 'flipbook_audio';
        $wpdb->delete(
            $table_audio, 
            [
                'edition_id' => $edition_id,
                'page_num' => $page_num
            ],
            ['%d', '%d']
        );
        
        // Registrar el nuevo audio en la base de datos
        $result = $wpdb->insert(
            $table_audio,
            [
                'edition_id' => $edition_id,
                'page_num' => $page_num,
                'file_path' => 'flipbook-vibe/audio/' . $filename,
                'x_coord' => $x_coord,
                'y_coord' => $y_coord,
                'autoplay' => $autoplay,
            ],
            ['%d', '%d', '%s', '%f', '%f', '%d']
        );
        
        if (!$result) {
            wp_send_json_error(['message' => __('Error al guardar la información del audio en la base de datos.', 'flipbook-contraplano-vibe')]);
            return;
        }
        
        wp_send_json_success([
            'message' => __('Audio subido correctamente.', 'flipbook-contraplano-vibe'),
            'audio_url' => $upload_dir['baseurl'] . '/flipbook-vibe/audio/' . $filename,
        ]);
    }

    /**
     * Ejecuta el plugin.
     *
     * @return void
     */
    public function run(): void {
        // El plugin ya está en ejecución gracias a los hooks definidos en el constructor
    }
} 