/**
 * Script JavaScript para el flipbook en el frontend
 *
 * @package FlipbookContraplanoVibe
 */

(function($) {
    'use strict';

    // Variables globales
    let pdfDoc = null;
    let currentPage = 1;
    let numPages = 0;
    let pdfScale = 1.0;
    let isAnimating = false;
    let audioElements = {};
    let config = {};
    
    /**
     * Inicializa el flipbook
     *
     * @param {Object} options Opciones de configuración
     */
    window.initFlipbook = function(options) {
        config = options;
        
        const $container = $('#' + config.containerId);
        
        if (!$container.length) {
            console.error('Contenedor del flipbook no encontrado:', config.containerId);
            return;
        }
        
        // Cargar el PDF
        loadPdf(config.pdfUrl);
        
        // Configurar botones de navegación
        $container.find('.flipbook-prev').on('click', goToPrevPage);
        $container.find('.flipbook-next').on('click', goToNextPage);
        
        // Configurar navegación por teclado
        $(document).on('keydown', handleKeyNavigation);
    };
    
    /**
     * Carga el archivo PDF
     *
     * @param {string} url URL del PDF
     */
    function loadPdf(url) {
        const loadingTask = pdfjsLib.getDocument(url);
        
        loadingTask.promise.then(function(pdf) {
            pdfDoc = pdf;
            numPages = pdf.numPages;
            
            $('.flipbook-total-pages').text(numPages);
            
            // Inicializar el visor
            initViewer();
            
        }).catch(function(error) {
            console.error('Error al cargar el PDF:', error);
            $('.flipbook-loading').html('<p>Error al cargar el PDF. Por favor, intenta de nuevo.</p>');
        });
    }
    
    /**
     * Inicializa el visor de flipbook
     */
    function initViewer() {
        const $container = $('#' + config.containerId);
        const $book = $container.find('.flipbook-book');
        
        // Limpiar el contenedor
        $book.empty();
        
        // Crear páginas vacías para la maquetación inicial
        for (let i = 1; i <= numPages; i++) {
            const $page = $('<div class="flipbook-page' + (i % 2 === 0 ? ' even' : ' odd') + '" data-page="' + i + '"></div>');
            $book.append($page);
        }
        
        // Renderizar las páginas iniciales
        renderVisiblePages();
        
        // Ocultar loading
        $container.find('.flipbook-loading').fadeOut();
    }
    
    /**
     * Renderiza las páginas visibles actualmente
     */
    function renderVisiblePages() {
        // En modo escritorio, renderizar página actual y siguiente
        if (window.innerWidth > 768) {
            // Si estamos en una página par, renderizar también la siguiente
            if (currentPage % 2 === 0) {
                renderPage(currentPage - 1);
                renderPage(currentPage);
            } else {
                renderPage(currentPage);
                if (currentPage < numPages) {
                    renderPage(currentPage + 1);
                }
            }
        } else {
            // En móvil, solo renderizar la página actual
            renderPage(currentPage);
        }
        
        // Actualizar contador de página
        $('.flipbook-current-page').text(currentPage);
        
        // Cargar audios si es una edición especial
        if (config.editionType === 'especial') {
            loadPageAudio();
        }
    }
    
    /**
     * Renderiza una página específica
     *
     * @param {number} pageNumber Número de página a renderizar
     */
    function renderPage(pageNumber) {
        if (pageNumber < 1 || pageNumber > numPages) return;
        
        const $container = $('#' + config.containerId);
        const $page = $container.find('.flipbook-page[data-page="' + pageNumber + '"]');
        
        // Si ya está renderizada, no hacer nada
        if ($page.hasClass('rendered')) return;
        
        // Marcar como renderizada
        $page.addClass('rendered');
        
        // Obtener la página del PDF
        pdfDoc.getPage(pageNumber).then(function(page) {
            const viewport = page.getViewport({ scale: pdfScale });
            
            // Crear canvas para la página
            const $canvas = $('<canvas></canvas>');
            const canvasContext = $canvas[0].getContext('2d');
            $canvas[0].width = viewport.width;
            $canvas[0].height = viewport.height;
            
            // Renderizar el PDF en el canvas
            const renderContext = {
                canvasContext: canvasContext,
                viewport: viewport
            };
            
            // Crear contenedor para la página
            const $content = $('<div class="flipbook-page-content"></div>');
            $content.append($canvas);
            $page.append($content);
            
            // Renderizar PDF
            page.render(renderContext).promise.then(function() {
                // Una vez renderizado, añadir áreas interactivas
                addInteractiveAreas(pageNumber, $page, viewport.width, viewport.height);
            });
        });
    }
    
    /**
     * Añade áreas interactivas a una página
     *
     * @param {number} pageNumber Número de página
     * @param {Object} $page Elemento jQuery de la página
     * @param {number} width Ancho de la página
     * @param {number} height Alto de la página
     */
    function addInteractiveAreas(pageNumber, $page, width, height) {
        if (!config.areas || !config.areas.length) return;
        
        // Filtrar áreas para esta página
        const pageAreas = config.areas.filter(area => parseInt(area.page_num) === pageNumber);
        
        pageAreas.forEach(function(area) {
            // Crear área interactiva
            const $area = $('<div class="flipbook-interactive-area"></div>');
            
            // Posicionar según coordenadas relativas
            $area.css({
                left: (area.x_coord * width) + 'px',
                top: (area.y_coord * height) + 'px',
                width: (area.width * width) + 'px',
                height: (area.height * height) + 'px'
            });
            
            // Añadir evento click según el tipo
            $area.on('click', function(e) {
                e.preventDefault();
                handleAreaClick(area);
            });
            
            $page.append($area);
        });
    }
    
    /**
     * Maneja el clic en un área interactiva
     *
     * @param {Object} area Datos del área interactiva
     */
    function handleAreaClick(area) {
        if (area.link_type === 'link') {
            // Abrir enlace en nueva pestaña
            window.open(area.link_target, '_blank');
        } else if (area.link_type === 'youtube') {
            // Mostrar video de YouTube en modal
            showYouTubeModal(area.link_target);
        }
    }
    
    /**
     * Muestra un video de YouTube en un modal
     *
     * @param {string} url URL del video de YouTube
     */
    function showYouTubeModal(url) {
        // Convertir URL a ID de video
        const videoId = getYouTubeVideoId(url);
        if (!videoId) return;
        
        // Crear modal
        const $modal = $('<div class="flipbook-youtube-modal"></div>');
        const $container = $('<div class="flipbook-youtube-container"></div>');
        const $close = $('<button class="flipbook-close-modal">&times;</button>');
        const $iframe = $('<iframe src="https://www.youtube.com/embed/' + videoId + '?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>');
        
        $container.append($close);
        $container.append($iframe);
        $modal.append($container);
        $('body').append($modal);
        
        // Eventos de cierre
        $close.on('click', function() {
            $modal.remove();
        });
        
        $modal.on('click', function(e) {
            if (e.target === this) {
                $modal.remove();
            }
        });
        
        $(document).on('keydown.youtube-modal', function(e) {
            if (e.key === 'Escape') {
                $modal.remove();
                $(document).off('keydown.youtube-modal');
            }
        });
    }
    
    /**
     * Extrae el ID de video de una URL de YouTube
     *
     * @param {string} url URL del video de YouTube
     * @return {string|null} ID del video o null si no es válida
     */
    function getYouTubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
    
    /**
     * Carga los audios para la página actual
     */
    function loadPageAudio() {
        if (!config.audio || !config.audio.length) return;
        
        // Detener audios activos
        stopAllAudio();
        
        // Filtrar audios para esta página
        const pageAudio = config.audio.filter(audio => parseInt(audio.page_num) === currentPage);
        
        pageAudio.forEach(function(audio, index) {
            createAudioElement(audio, index);
        });
    }
    
    /**
     * Crea un elemento de audio en la página
     *
     * @param {Object} audio Datos del audio
     * @param {number} index Índice del audio
     */
    function createAudioElement(audio, index) {
        const $container = $('#' + config.containerId);
        const $page = $container.find('.flipbook-page[data-page="' + audio.page_num + '"]');
        
        if (!$page.length) return;
        
        // Crear icono de audio
        const $icon = $('<div class="flipbook-audio-icon"></div>');
        
        // Posicionar según coordenadas
        $icon.css({
            left: (audio.x_coord * $page.width()) + 'px',
            top: (audio.y_coord * $page.height()) + 'px'
        });
        
        // Crear elemento de audio
        const $audio = $('<audio preload="auto"></audio>');
        $audio.attr('src', flipbookData.pluginUrl + '../uploads/' + audio.file_path);
        
        // Configurar autoplay si está habilitado
        if (parseInt(audio.autoplay) === 1) {
            $audio[0].autoplay = true;
        }
        
        // Guardar referencia al audio
        const audioId = 'audio-' + audio.page_num + '-' + index;
        audioElements[audioId] = {
            element: $audio[0],
            icon: $icon,
            isPlaying: parseInt(audio.autoplay) === 1
        };
        
        // Evento al hacer clic en el icono
        $icon.on('click', function() {
            toggleAudio(audioId);
        });
        
        // Eventos de audio
        $audio.on('play', function() {
            $icon.addClass('playing');
            audioElements[audioId].isPlaying = true;
        });
        
        $audio.on('pause', function() {
            $icon.removeClass('playing');
            audioElements[audioId].isPlaying = false;
        });
        
        $audio.on('ended', function() {
            $icon.removeClass('playing');
            audioElements[audioId].isPlaying = false;
        });
        
        // Añadir elementos a la página
        $page.append($icon);
        $page.append($audio);
        
        // Autoplay si está habilitado
        if (parseInt(audio.autoplay) === 1) {
            $audio[0].play().catch(function(error) {
                console.warn('Autoplay no permitido:', error);
            });
        }
    }
    
    /**
     * Reproduce o pausa un audio
     *
     * @param {string} audioId ID del audio
     */
    function toggleAudio(audioId) {
        const audio = audioElements[audioId];
        
        if (!audio) return;
        
        if (audio.isPlaying) {
            audio.element.pause();
        } else {
            // Pausar todos los demás audios
            stopAllAudio();
            audio.element.play().catch(function(error) {
                console.error('Error al reproducir audio:', error);
            });
        }
    }
    
    /**
     * Detiene todos los audios activos
     */
    function stopAllAudio() {
        for (const id in audioElements) {
            audioElements[id].element.pause();
            audioElements[id].element.currentTime = 0;
            audioElements[id].icon.removeClass('playing');
            audioElements[id].isPlaying = false;
        }
    }
    
    /**
     * Va a la página anterior
     */
    function goToPrevPage() {
        if (currentPage <= 1 || isAnimating) return;
        
        isAnimating = true;
        
        // Actualizar página actual
        currentPage = Math.max(1, currentPage - 1);
        
        // Aplicar efecto visual según el dispositivo
        if (window.innerWidth > 768) {
            // En escritorio, animar volteo de página
            animatePageTurn('prev');
        } else {
            // En móvil, simplemente cambiar la página visible
            updateMobileView();
        }
    }
    
    /**
     * Va a la página siguiente
     */
    function goToNextPage() {
        if (currentPage >= numPages || isAnimating) return;
        
        isAnimating = true;
        
        // Actualizar página actual
        currentPage = Math.min(numPages, currentPage + 1);
        
        // Aplicar efecto visual según el dispositivo
        if (window.innerWidth > 768) {
            // En escritorio, animar volteo de página
            animatePageTurn('next');
        } else {
            // En móvil, simplemente cambiar la página visible
            updateMobileView();
        }
    }
    
    /**
     * Anima el volteo de página
     *
     * @param {string} direction Dirección ('prev' o 'next')
     */
    function animatePageTurn(direction) {
        const $container = $('#' + config.containerId);
        const $pages = $container.find('.flipbook-page');
        
        // Asegurar que las páginas relevantes están renderizadas
        if (direction === 'prev') {
            renderPage(currentPage);
            renderPage(currentPage + 1);
        } else {
            renderPage(currentPage);
            renderPage(currentPage - 1);
        }
        
        // Aplicar clases para animación
        $pages.removeClass('turning flipped');
        
        setTimeout(function() {
            // Actualizar contador de página
            $('.flipbook-current-page').text(currentPage);
            
            // Renderizar páginas visibles
            renderVisiblePages();
            
            // Finalizar animación
            isAnimating = false;
        }, 500); // Tiempo de la animación
    }
    
    /**
     * Actualiza la vista en dispositivos móviles
     */
    function updateMobileView() {
        const $container = $('#' + config.containerId);
        const $pages = $container.find('.flipbook-page');
        
        // Ocultar todas las páginas
        $pages.removeClass('active');
        
        // Mostrar la página actual
        $container.find('.flipbook-page[data-page="' + currentPage + '"]').addClass('active');
        
        // Actualizar contador
        $('.flipbook-current-page').text(currentPage);
        
        // Renderizar la página actual
        renderVisiblePages();
        
        // Finalizar animación
        isAnimating = false;
    }
    
    /**
     * Maneja la navegación por teclado
     *
     * @param {Object} e Evento keydown
     */
    function handleKeyNavigation(e) {
        // Solo responder si el flipbook está en foco
        if (!$('#' + config.containerId).is(':focus-within') && !$('#' + config.containerId).is(':hover')) {
            return;
        }
        
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            goToPrevPage();
            e.preventDefault();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            goToNextPage();
            e.preventDefault();
        }
    }
    
})(jQuery); 