/**
 * Script para el frontend del plugin Vibebook Flip
 * Versión 1.0.6 - Corregido posicionamiento de áreas, numeración de páginas y añadido zoom
 */
(function($) {
    'use strict';

    // Modos de visualización
    var viewMode = {
        SINGLE_PAGE: 'single',
        DOUBLE_PAGE: 'double'
    };

    // Objeto principal
    var VibeBookFlipFrontend = {
        // Propiedades
        instances: {},
        
        // Inicialización
        init: function() {
            // Configurar PDF.js
            pdfjsLib.GlobalWorkerOptions.workerSrc = vibeBookFlip.pdfJsWorkerSrc;
            
            // Inicializar todos los flipbooks en la página
            $('.vibebook-flipbook').each(function() {
                var id = $(this).data('id');
                var dataVar = 'vibeBookFlipData_' + id;
                
                if (window[dataVar]) {
                    var instance = Object.create(VibeBookFlipInstance);
                    instance.init(id, window[dataVar]);
                    VibeBookFlipFrontend.instances[id] = instance;
                }
            });
        }
    };
    
    // Objeto de instancia de flipbook
    var VibeBookFlipInstance = {
        // Propiedades
        id: null,
        container: null,
        data: null,
        pdfDoc: null,
        currentPage: 1,
        totalPages: 0,
        scale: 1.5,
        currentZoom: 1.0,
        maxZoom: 3.0,
        minZoom: 0.5,
        zoomStep: 0.25,
        pdfRendering: false,
        pageNumPending: null,
        pdfCanvas: null,
        pdfContext: null,
        areas: [],
        currentAudio: null,
        currentViewMode: viewMode.SINGLE_PAGE,
        pdfOriginalWidth: 0,
        pdfOriginalHeight: 0,
        
        // Inicialización
        init: function(id, data) {
            this.id = id;
            this.container = $('#vibebook-flipbook-' + id);
            this.data = data;
            this.areas = data.areas || [];
            
            // Inicializar eventos
            this.initEvents();
            
            // Cargar PDF
            this.loadPDF(data.pdf_url);
            
            // Añadir controles de zoom
            this.addZoomControls();
        },
        
        // Añadir controles de zoom
        addZoomControls: function() {
            var self = this;
            
            // Crear contenedor de controles de zoom
            var zoomControls = $('<div class="vibebook-zoom-controls"></div>');
            
            // Botón de zoom in
            var zoomInBtn = $('<button class="vibebook-zoom-in" title="Aumentar zoom">+</button>');
            zoomInBtn.on('click', function() {
                self.zoomIn();
            });
            
            // Botón de zoom out
            var zoomOutBtn = $('<button class="vibebook-zoom-out" title="Reducir zoom">-</button>');
            zoomOutBtn.on('click', function() {
                self.zoomOut();
            });
            
            // Botón de reset zoom
            var zoomResetBtn = $('<button class="vibebook-zoom-reset" title="Restablecer zoom">100%</button>');
            zoomResetBtn.on('click', function() {
                self.resetZoom();
            });
            
            // Añadir botones al contenedor
            zoomControls.append(zoomOutBtn);
            zoomControls.append(zoomResetBtn);
            zoomControls.append(zoomInBtn);
            
            // Añadir controles al contenedor principal
            this.container.find('.vibebook-controls').append(zoomControls);
        },
        
        // Zoom in
        zoomIn: function() {
            if (this.currentZoom < this.maxZoom) {
                this.currentZoom += this.zoomStep;
                this.applyZoom();
            }
        },
        
        // Zoom out
        zoomOut: function() {
            if (this.currentZoom > this.minZoom) {
                this.currentZoom -= this.zoomStep;
                this.applyZoom();
            }
        },
        
        // Reset zoom
        resetZoom: function() {
            this.currentZoom = 1.0;
            this.applyZoom();
        },
        
        // Aplicar zoom
        applyZoom: function() {
            var self = this;
            
            // Actualizar texto del botón de reset
            this.container.find('.vibebook-zoom-reset').text(Math.round(this.currentZoom * 100) + '%');
            
            // Aplicar zoom a los canvas
            this.container.find('.vibebook-page').each(function() {
                var $canvas = $(this);
                var originalWidth = $canvas.data('original-width');
                var originalHeight = $canvas.data('original-height');
                
                if (!originalWidth) {
                    // Guardar dimensiones originales si no existen
                    originalWidth = $canvas.width();
                    originalHeight = $canvas.height();
                    $canvas.data('original-width', originalWidth);
                    $canvas.data('original-height', originalHeight);
                }
                
                // Aplicar zoom
                $canvas.css({
                    width: originalWidth * self.currentZoom,
                    height: originalHeight * self.currentZoom
                });
            });
            
            // Reposicionar áreas interactivas
            this.renderAreas();
        },
        
        // Inicializar eventos
        initEvents: function() {
            var self = this;
            
            // Botones de navegación
            this.container.find('.vibebook-prev').on('click', function(e) {
                e.preventDefault();
                self.prevPage();
            });
            
            this.container.find('.vibebook-next').on('click', function(e) {
                e.preventDefault();
                self.nextPage();
            });
            
            // Teclas de navegación
            $(document).on('keydown', function(e) {
                // Solo si el flipbook está en el viewport
                if (self.isInViewport()) {
                    if (e.keyCode === 37) { // Flecha izquierda
                        self.prevPage();
                    } else if (e.keyCode === 39) { // Flecha derecha
                        self.nextPage();
                    } else if (e.keyCode === 107 || e.keyCode === 187) { // + o =
                        self.zoomIn();
                    } else if (e.keyCode === 109 || e.keyCode === 189) { // - o _
                        self.zoomOut();
                    } else if (e.keyCode === 48 || e.keyCode === 96) { // 0
                        self.resetZoom();
                    }
                }
            });
            
            // Control de audio
            this.container.find('.vibebook-audio-toggle').on('click', function(e) {
                e.preventDefault();
                self.toggleAudio();
            });
            
            // Eventos para áreas interactivas (delegación de eventos)
            this.container.on('click', '.vibebook-area', function(e) {
                e.preventDefault();
                var areaId = $(this).data('id');
                var area = self.findAreaById(areaId);
                
                if (area) {
                    self.handleAreaClick(area);
                }
            });
            
            // Evento de redimensionamiento de ventana
            $(window).on('resize', function() {
                // Reposicionar áreas cuando cambia el tamaño de la ventana
                if (self.currentPage > 0) {
                    self.renderAreas();
                }
            });
        },
        
        // Encontrar área por ID
        findAreaById: function(id) {
            for (var i = 0; i < this.areas.length; i++) {
                if (this.areas[i].id === id) {
                    return this.areas[i];
                }
            }
            return null;
        },
        
        // Manejar clic en área
        handleAreaClick: function(area) {
            switch (area.type) {
                case 'url':
                    window.open(area.target_url, '_blank');
                    break;
                    
                case 'youtube':
                    window.open(area.target_url, '_blank');
                    break;
                    
                case 'internal':
                    this.renderPage(parseInt(area.target_page));
                    break;
                    
                case 'audio':
                    if (area.audio_id) {
                        this.playAudio(area.audio_id);
                    }
                    break;
            }
        },
        
        // Verificar si el flipbook está en el viewport
        isInViewport: function() {
            var rect = this.container[0].getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },
        
        // Determinar el modo de visualización adecuado
        determineViewMode: function(pageNum) {
            // Portada (primera página)
            if (pageNum === 1) return viewMode.SINGLE_PAGE;
            
            // Contraportada (última página si es impar)
            if (pageNum === this.totalPages && this.totalPages % 2 === 1) return viewMode.SINGLE_PAGE;
            
            // Modo predeterminado para páginas interiores
            return viewMode.DOUBLE_PAGE;
        },
        
        // Ajustar layout según el modo
        adjustLayout: function(mode) {
            if (mode === viewMode.SINGLE_PAGE) {
                // Centrar una sola página
                this.container.find('.vibebook-pages').addClass('single-page-view').removeClass('double-page-view');
            } else {
                // Mostrar dos páginas lado a lado
                this.container.find('.vibebook-pages').addClass('double-page-view').removeClass('single-page-view');
            }
            
            this.currentViewMode = mode;
        },
        
        // Cargar PDF
        loadPDF: function(url) {
            var self = this;
            
            // Mostrar carga
            this.container.find('.vibebook-loading').show();
            
            // Cargar PDF
            var loadingTask = pdfjsLib.getDocument(url);
            loadingTask.promise.then(function(pdf) {
                self.pdfDoc = pdf;
                self.totalPages = pdf.numPages;
                
                // Obtener dimensiones originales del PDF (primera página)
                pdf.getPage(1).then(function(page) {
                    var viewport = page.getViewport({ scale: 1.0 });
                    self.pdfOriginalWidth = viewport.width;
                    self.pdfOriginalHeight = viewport.height;
                    
                    // Actualizar información de páginas
                    self.updatePageInfo();
                    
                    // Renderizar primera página
                    self.renderPage(1);
                    
                    // Ocultar carga
                    self.container.find('.vibebook-loading').hide();
                    
                    // Reproducir audio con autoplay
                    self.playAutoplayAudio();
                });
            }).catch(function(error) {
                console.error('Error al cargar el PDF:', error);
                self.container.find('.vibebook-pages').html('<div class="vibebook-error">Error al cargar el PDF: ' + error.message + '</div>');
                self.container.find('.vibebook-loading').hide();
            });
        },
        
        // Actualizar información de páginas
        updatePageInfo: function() {
            var pageInfo = '';
            
            if (this.currentViewMode === viewMode.SINGLE_PAGE) {
                // Modo de una página
                pageInfo = 'Página ' + this.currentPage + ' de ' + this.totalPages;
            } else {
                // Modo de dos páginas
                var leftPage = this.currentPage % 2 === 0 ? this.currentPage : this.currentPage - 1;
                var rightPage = this.currentPage % 2 === 0 ? this.currentPage + 1 : this.currentPage;
                
                // Verificar que las páginas existan
                if (leftPage < 1) leftPage = 1;
                if (rightPage > this.totalPages) rightPage = this.totalPages;
                
                // Si las páginas son diferentes, mostrar ambas
                if (leftPage !== rightPage) {
                    pageInfo = 'Páginas ' + leftPage + ' y ' + rightPage + ' de ' + this.totalPages;
                } else {
                    pageInfo = 'Página ' + leftPage + ' de ' + this.totalPages;
                }
            }
            
            this.container.find('.vibebook-page-info').text(pageInfo);
        },
        
        // Renderizar página
        renderPage: function(pageNum) {
            var self = this;
            
            if (self.pdfRendering) {
                self.pageNumPending = pageNum;
                return;
            }
            
            self.pdfRendering = true;
            
            // Actualizar página actual
            self.currentPage = pageNum;
            
            // Determinar modo de visualización
            var mode = self.determineViewMode(pageNum);
            
            // Ajustar layout
            self.adjustLayout(mode);
            
            // Actualizar información de páginas
            self.updatePageInfo();
            
            // Limpiar contenedor
            self.container.find('.vibebook-pages').empty();
            
            // Crear contenedor para la(s) página(s)
            var pagesContainer = $('<div class="vibebook-pages-container"></div>');
            self.container.find('.vibebook-pages').append(pagesContainer);
            
            // Función para renderizar una página individual
            function renderSinglePage(pageNumber, position) {
                return self.pdfDoc.getPage(pageNumber).then(function(page) {
                    // Crear canvas
                    var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    
                    // Calcular escala para ajustar al contenedor
                    var containerWidth = self.container.find('.vibebook-pages').width();
                    var containerHeight = self.container.find('.vibebook-pages').height();
                    
                    var viewport = page.getViewport({ scale: 1 });
                    
                    // Calcular escala según el modo
                    var scale;
                    if (mode === viewMode.SINGLE_PAGE) {
                        // Escala para una sola página
                        var scaleX = containerWidth / viewport.width;
                        var scaleY = containerHeight / viewport.height;
                        scale = Math.min(scaleX, scaleY) * 0.95; // 95% para dejar un pequeño margen
                    } else {
                        // Escala para dos páginas
                        var scaleX = (containerWidth / 2) / viewport.width;
                        var scaleY = containerHeight / viewport.height;
                        scale = Math.min(scaleX, scaleY) * 0.95;
                    }
                    
                    // Aplicar escala
                    viewport = page.getViewport({ scale: scale });
                    
                    // Ajustar tamaño del canvas
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    
                    // Aplicar clase según posición
                    $(canvas).addClass('vibebook-page');
                    if (position === 'left') {
                        $(canvas).addClass('vibebook-page-left');
                        $(canvas).attr('data-page', pageNumber);
                    } else if (position === 'right') {
                        $(canvas).addClass('vibebook-page-right');
                        $(canvas).attr('data-page', pageNumber);
                    } else {
                        $(canvas).attr('data-page', pageNumber);
                    }
                    
                    // Guardar dimensiones originales para zoom
                    $(canvas).data('original-width', viewport.width);
                    $(canvas).data('original-height', viewport.height);
                    
                    // Agregar al contenedor
                    pagesContainer.append(canvas);
                    
                    // Renderizar PDF
                    var renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    
                    return page.render(renderContext).promise;
                });
            }
            
            // Renderizar según el modo
            if (mode === viewMode.SINGLE_PAGE) {
                // Renderizar una sola página
                renderSinglePage(pageNum, 'center').then(function() {
                    self.pdfRendering = false;
                    self.renderAreas();
                    
                    // Procesar página pendiente
                    if (self.pageNumPending !== null) {
                        self.renderPage(self.pageNumPending);
                        self.pageNumPending = null;
                    }
                });
            } else {
                // Renderizar dos páginas
                var leftPage = pageNum % 2 === 0 ? pageNum : pageNum - 1;
                var rightPage = pageNum % 2 === 0 ? pageNum + 1 : pageNum;
                
                // Verificar que las páginas existan
                if (leftPage < 1) leftPage = 1;
                if (rightPage > self.totalPages) rightPage = self.totalPages;
                
                // Renderizar página izquierda
                var leftPromise = leftPage >= 1 ? renderSinglePage(leftPage, 'left') : Promise.resolve();
                
                // Renderizar página derecha
                var rightPromise = rightPage <= self.totalPages ? renderSinglePage(rightPage, 'right') : Promise.resolve();
                
                // Cuando ambas páginas estén renderizadas
                Promise.all([leftPromise, rightPromise]).then(function() {
                    self.pdfRendering = false;
                    self.renderAreas();
                    
                    // Procesar página pendiente
                    if (self.pageNumPending !== null) {
                        self.renderPage(self.pageNumPending);
                        self.pageNumPending = null;
                    }
                });
            }
        },
        
        // Calcular posición de área según el modo y la página
        calculateAreaPosition: function(area) {
            var position = { left: 0, top: 0, width: 0, height: 0 };
            
            // Obtener coordenadas
            var x = parseFloat(area.coords[0]);
            var y = parseFloat(area.coords[1]);
            var width = parseFloat(area.coords[2]);
            var height = parseFloat(area.coords[3]);
            
            // Calcular porcentajes si no existen
            if (!area.coords_percent) {
                area.coords_percent = [
                    (x / this.pdfOriginalWidth) * 100,
                    (y / this.pdfOriginalHeight) * 100,
                    (width / this.pdfOriginalWidth) * 100,
                    (height / this.pdfOriginalHeight) * 100
                ];
            }
            
            // Obtener porcentajes
            var xPercent = parseFloat(area.coords_percent[0]);
            var yPercent = parseFloat(area.coords_percent[1]);
            var widthPercent = parseFloat(area.coords_percent[2]);
            var heightPercent = parseFloat(area.coords_percent[3]);
            
            // Obtener el canvas de la página correspondiente
            var pageCanvas;
            
            if (this.currentViewMode === viewMode.SINGLE_PAGE) {
                // En modo de una página, solo hay un canvas
                pageCanvas = this.container.find('.vibebook-page[data-page="' + area.page + '"]');
                if (pageCanvas.length === 0) {
                    // Si no se encuentra el canvas específico, usar el único disponible
                    pageCanvas = this.container.find('.vibebook-page');
                }
            } else {
                // En modo de dos páginas, buscar el canvas correspondiente por número de página
                pageCanvas = this.container.find('.vibebook-page[data-page="' + area.page + '"]');
                if (pageCanvas.length === 0) {
                    // Fallback: buscar por posición par/impar
                    if (area.page % 2 === 0) {
                        // Página par (izquierda)
                        pageCanvas = this.container.find('.vibebook-page-left');
                    } else {
                        // Página impar (derecha)
                        pageCanvas = this.container.find('.vibebook-page-right');
                    }
                }
            }
            
            // Si no se encuentra el canvas, retornar posición vacía
            if (pageCanvas.length === 0) {
                return position;
            }
            
            // Calcular posición basada en el canvas
            var canvasWidth = pageCanvas.width();
            var canvasHeight = pageCanvas.height();
            var canvasOffset = pageCanvas.offset();
            var containerOffset = this.container.find('.vibebook-pages').offset();
            
            // Calcular posición relativa al contenedor
            position.width = (widthPercent * canvasWidth) / 100;
            position.height = (heightPercent * canvasHeight) / 100;
            
            // Posición absoluta dentro del canvas
            var absoluteX = (xPercent * canvasWidth) / 100;
            var absoluteY = (yPercent * canvasHeight) / 100;
            
            // Posición relativa al contenedor
            position.left = canvasOffset.left - containerOffset.left + absoluteX;
            position.top = canvasOffset.top - containerOffset.top + absoluteY;
            
            return position;
        },
        
        // Renderizar áreas interactivas
        renderAreas: function() {
            var self = this;
            
            // Limpiar áreas existentes
            self.container.find('.vibebook-area').remove();
            
            // Filtrar áreas para la página actual
            var currentAreas = [];
            
            if (self.currentViewMode === viewMode.SINGLE_PAGE) {
                // En modo de una página, solo mostrar áreas de la página actual
                currentAreas = self.areas.filter(function(area) {
                    return area.page === self.currentPage;
                });
            } else {
                // En modo de dos páginas, mostrar áreas de ambas páginas
                var leftPage = self.currentPage % 2 === 0 ? self.currentPage : self.currentPage - 1;
                var rightPage = self.currentPage % 2 === 0 ? self.currentPage + 1 : self.currentPage;
                
                // Verificar que las páginas existan
                if (leftPage < 1) leftPage = 1;
                if (rightPage > self.totalPages) rightPage = self.totalPages;
                
                currentAreas = self.areas.filter(function(area) {
                    return area.page === leftPage || area.page === rightPage;
                });
            }
            
            // Crear elementos para cada área
            $.each(currentAreas, function(index, area) {
                var areaDiv = $('<div class="vibebook-area"></div>');
                areaDiv.attr('data-id', area.id);
                areaDiv.attr('data-page', area.page);
                areaDiv.attr('data-type', area.type);
                
                // Añadir clase según el tipo
                switch (area.type) {
                    case 'url':
                        areaDiv.addClass('url-area');
                        break;
                    case 'youtube':
                        areaDiv.addClass('youtube-area');
                        break;
                    case 'internal':
                        areaDiv.addClass('internal-area');
                        break;
                    case 'audio':
                        areaDiv.addClass('audio-area');
                        // Añadir icono de audio (inicialmente invisible)
                        areaDiv.html('<span class="dashicons dashicons-controls-play area-icon"></span>');
                        break;
                }
                
                // Calcular posición
                var position = self.calculateAreaPosition(area);
                
                // Aplicar posición
                areaDiv.css({
                    position: 'absolute',
                    left: position.left + 'px',
                    top: position.top + 'px',
                    width: position.width + 'px',
                    height: position.height + 'px',
                    cursor: 'pointer',
                    zIndex: 50
                });
                
                // Agregar al contenedor
                self.container.find('.vibebook-pages').append(areaDiv);
            });
        },
        
        // Reproducir audio con autoplay
        playAutoplayAudio: function() {
            var self = this;
            
            // Filtrar áreas de audio con autoplay para la página actual
            var autoplayAreas = self.areas.filter(function(area) {
                return area.page === self.currentPage && area.type === 'audio' && area.autoplay;
            });
            
            // Reproducir el primer audio con autoplay
            if (autoplayAreas.length > 0) {
                var area = autoplayAreas[0];
                if (area.audio_id) {
                    self.playAudio(area.audio_id);
                }
            }
        },
        
        // Reproducir audio
        playAudio: function(audioId) {
            var self = this;
            
            // Detener audio actual
            if (self.currentAudio) {
                self.currentAudio.pause();
                self.currentAudio = null;
            }
            
            // Buscar URL del audio
            var audioUrl = '';
            for (var i = 0; i < self.data.audio_files.length; i++) {
                if (self.data.audio_files[i].id === audioId) {
                    audioUrl = self.data.audio_files[i].url;
                    break;
                }
            }
            
            if (audioUrl) {
                // Crear elemento de audio
                var audio = new Audio(audioUrl);
                audio.play();
                
                // Guardar referencia
                self.currentAudio = audio;
                
                // Mostrar controles de audio
                self.container.find('.vibebook-audio-controls').show();
                self.container.find('.vibebook-audio-toggle').removeClass('playing').addClass('playing');
            }
        },
        
        // Alternar reproducción de audio
        toggleAudio: function() {
            var self = this;
            
            if (self.currentAudio) {
                if (self.currentAudio.paused) {
                    self.currentAudio.play();
                    self.container.find('.vibebook-audio-toggle').addClass('playing');
                } else {
                    self.currentAudio.pause();
                    self.container.find('.vibebook-audio-toggle').removeClass('playing');
                }
            }
        },
        
        // Ir a la página anterior
        prevPage: function() {
            if (this.currentPage <= 1) return;
            
            var prevPage;
            if (this.currentViewMode === viewMode.SINGLE_PAGE) {
                prevPage = this.currentPage - 1;
            } else {
                // En modo de dos páginas, retroceder dos páginas
                prevPage = this.currentPage % 2 === 0 ? this.currentPage - 2 : this.currentPage - 1;
                if (prevPage < 1) prevPage = 1;
            }
            
            this.renderPage(prevPage);
        },
        
        // Ir a la página siguiente
        nextPage: function() {
            if (this.currentPage >= this.totalPages) return;
            
            var nextPage;
            if (this.currentViewMode === viewMode.SINGLE_PAGE) {
                nextPage = this.currentPage + 1;
            } else {
                // En modo de dos páginas, avanzar dos páginas
                nextPage = this.currentPage % 2 === 0 ? this.currentPage + 2 : this.currentPage + 2;
                if (nextPage > this.totalPages) nextPage = this.totalPages;
            }
            
            this.renderPage(nextPage);
        }
    };
    
    // Inicializar cuando el documento esté listo
    $(document).ready(function() {
        VibeBookFlipFrontend.init();
    });
    
})(jQuery);
