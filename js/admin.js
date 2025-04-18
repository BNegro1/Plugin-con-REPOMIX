/**
 * Script para el panel de administración del plugin Vibebook Flip
 * Versión 1.0.4 - Corregido problema de enrutamiento en la edición
 */
(function($) {
    'use strict';

    // Objeto principal
    var VibeBookFlipAdmin = {
        // Propiedades
        mediaFrame: null,
        pdfDoc: null,
        currentPage: 1,
        totalPages: 0,
        scale: 1.5,
        pdfRendering: false,
        pageNumPending: null,
        pdfCanvas: null,
        pdfContext: null,
        currentTool: null,
        drawingArea: false,
        startX: 0,
        startY: 0,
        areas: [],
        selectedArea: null,
        pdfOriginalWidth: 0,
        pdfOriginalHeight: 0,
        
        // Inicialización
        init: function() {
            // Configurar PDF.js
            pdfjsLib.GlobalWorkerOptions.workerSrc = vibeBookFlip.pdfJsWorkerSrc;
            
            // Inicializar eventos
            this.initEvents();
            
            // Inicializar pestañas
            this.initTabs();
            
            // Verificar si estamos editando
            var urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('action') === 'edit' && urlParams.get('id')) {
                // Estamos en modo edición
                var flipbookId = urlParams.get('id');
                this.loadFlipbookData(flipbookId);
            }
        },
        
        // Inicializar pestañas
        initTabs: function() {
            var self = this;
            
            // Ocultar todas las pestañas excepto la primera
            $('.vibebook-tab-content').not(':first').hide();
            
            // Marcar primera pestaña como activa
            $('.vibebook-tab-link').first().addClass('active');
            
            // Evento de clic en pestañas
            $('.vibebook-tab-link').on('click', function(e) {
                e.preventDefault();
                
                var target = $(this).attr('href');
                
                // Ocultar todas las pestañas
                $('.vibebook-tab-content').hide();
                
                // Mostrar pestaña seleccionada
                $(target).show();
                
                // Actualizar clase activa
                $('.vibebook-tab-link').removeClass('active');
                $(this).addClass('active');
            });
            
            // Si estamos editando, mostrar pestaña de edición
            var urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('action') === 'edit') {
                $('.vibebook-tab-link[href="#vibebook-tab-edit"]').trigger('click');
            }
        },
        
        // Cargar datos del flipbook para edición
        loadFlipbookData: function(flipbookId) {
            var self = this;
            
            // Mostrar cargando
            $('#vibebook-editor-loading').show();
            $('#vibebook-editor-content').hide();
            
            // Solicitar datos del flipbook
            $.ajax({
                url: vibeBookFlip.ajaxUrl,
                type: 'GET',
                data: {
                    action: 'vibebook_get_flipbook',
                    nonce: vibeBookFlip.nonce,
                    post_id: flipbookId
                },
                success: function(response) {
                    if (response.success) {
                        // Guardar datos
                        self.flipbookId = response.data.post_id;
                        self.flipbookTitle = response.data.title;
                        self.pdfId = response.data.pdf_id;
                        self.pdfUrl = response.data.pdf_url;
                        self.areas = response.data.areas || [];
                        
                        // Actualizar título
                        $('#vibebook-editor-title').text('Editando: ' + self.flipbookTitle);
                        
                        // Cargar PDF
                        self.loadPDF(self.pdfUrl);
                        
                        // Ocultar cargando
                        $('#vibebook-editor-loading').hide();
                        $('#vibebook-editor-content').show();
                    } else {
                        alert('Error al cargar el flipbook: ' + response.data);
                    }
                },
                error: function() {
                    alert('Error de conexión al cargar el flipbook.');
                }
            });
        },
        
        // Inicializar eventos
        initEvents: function() {
            var self = this;
            
            // Seleccionar PDF
            $('#vibebook-select-pdf').on('click', function(e) {
                e.preventDefault();
                self.openMediaLibrary('pdf');
            });
            
            // Guardar flipbook
            $('#vibebook-save-flipbook').on('click', function(e) {
                e.preventDefault();
                self.saveFlipbook();
            });
            
            // Botones de navegación
            $('#vibebook-prev-page').on('click', function(e) {
                e.preventDefault();
                self.prevPage();
            });
            
            $('#vibebook-next-page').on('click', function(e) {
                e.preventDefault();
                self.nextPage();
            });
            
            // Selector de página
            $('#vibebook-page-select').on('change', function() {
                var pageNum = parseInt($(this).val());
                if (pageNum > 0 && pageNum <= self.totalPages) {
                    self.renderPage(pageNum);
                }
            });
            
            // Herramientas
            $('.vibebook-tool-button').on('click', function(e) {
                e.preventDefault();
                
                var tool = $(this).data('tool');
                
                // Ocultar todas las opciones
                $('.vibebook-tool-options').hide();
                
                // Mostrar opciones de la herramienta seleccionada
                $('#vibebook-option-' + tool).show();
                
                // Actualizar herramienta actual
                self.currentTool = tool;
                
                // Actualizar clase activa
                $('.vibebook-tool-button').removeClass('active');
                $(this).addClass('active');
            });
            
            // Seleccionar audio
            $('#vibebook-select-audio').on('click', function(e) {
                e.preventDefault();
                self.openMediaLibrary('audio');
            });
            
            // Guardar URL
            $('#vibebook-save-url').on('click', function(e) {
                e.preventDefault();
                
                var url = $('#vibebook-url-target').val();
                if (url) {
                    if (self.selectedArea) {
                        // Actualizar área existente
                        self.selectedArea.type = 'url';
                        self.selectedArea.target_url = url;
                        self.updateAreasList();
                        self.saveAreas();
                    } else if (self.drawingArea) {
                        // Crear nueva área
                        self.createArea('url', { target_url: url });
                    } else {
                        alert('Por favor, dibuja un área en el PDF primero.');
                    }
                } else {
                    alert('Por favor, ingresa una URL.');
                }
            });
            
            // Guardar YouTube
            $('#vibebook-save-youtube').on('click', function(e) {
                e.preventDefault();
                
                var url = $('#vibebook-youtube-url').val();
                if (url) {
                    if (self.selectedArea) {
                        // Actualizar área existente
                        self.selectedArea.type = 'youtube';
                        self.selectedArea.target_url = url;
                        self.updateAreasList();
                        self.saveAreas();
                    } else if (self.drawingArea) {
                        // Crear nueva área
                        self.createArea('youtube', { target_url: url });
                    } else {
                        alert('Por favor, dibuja un área en el PDF primero.');
                    }
                } else {
                    alert('Por favor, ingresa una URL de YouTube.');
                }
            });
            
            // Guardar navegación interna
            $('#vibebook-save-internal').on('click', function(e) {
                e.preventDefault();
                
                var page = $('#vibebook-internal-page').val();
                var color = $('#vibebook-internal-color').val();
                
                if (page) {
                    if (self.selectedArea) {
                        // Actualizar área existente
                        self.selectedArea.type = 'internal';
                        self.selectedArea.target_page = page;
                        self.selectedArea.color = color;
                        self.updateAreasList();
                        self.saveAreas();
                    } else if (self.drawingArea) {
                        // Crear nueva área
                        self.createArea('internal', { 
                            target_page: page,
                            color: color
                        });
                    } else {
                        alert('Por favor, dibuja un área en el PDF primero.');
                    }
                } else {
                    alert('Por favor, selecciona una página de destino.');
                }
            });
            
            // Guardar audio
            $('#vibebook-save-audio').on('click', function(e) {
                e.preventDefault();
                
                if (self.selectedAudioId) {
                    var autoplay = $('#vibebook-audio-autoplay').is(':checked');
                    
                    if (self.selectedArea) {
                        // Actualizar área existente
                        self.selectedArea.type = 'audio';
                        self.selectedArea.audio_id = self.selectedAudioId;
                        self.selectedArea.autoplay = autoplay;
                        self.updateAreasList();
                        self.saveAreas();
                    } else if (self.drawingArea) {
                        // Crear nueva área
                        self.createArea('audio', { 
                            audio_id: self.selectedAudioId,
                            autoplay: autoplay
                        });
                    } else {
                        alert('Por favor, dibuja un área en el PDF primero.');
                    }
                } else {
                    alert('Por favor, selecciona un archivo de audio.');
                }
            });
            
            // Editar flipbook desde la lista
            $('.vibebook-edit-flipbook').on('click', function(e) {
                e.preventDefault();
                
                var id = $(this).data('id');
                if (id) {
                    window.location.href = vibeBookFlip.adminUrl + '?page=vibebook-flip&action=edit&id=' + id;
                }
            });
            
            // Eventos para el canvas del PDF
            $('#vibebook-pdf-container').on('mousedown', function(e) {
                if (!self.pdfDoc || self.selectedArea) {
                    return;
                }
                
                var offset = $(this).offset();
                self.startX = e.pageX - offset.left;
                self.startY = e.pageY - offset.top;
                self.drawingArea = true;
                
                // Crear div temporal para dibujar
                $('<div id="vibebook-temp-area"></div>')
                    .css({
                        position: 'absolute',
                        left: self.startX + 'px',
                        top: self.startY + 'px',
                        width: '0',
                        height: '0',
                        border: '2px dashed #0073aa',
                        backgroundColor: 'rgba(0, 115, 170, 0.2)',
                        zIndex: 100
                    })
                    .appendTo('#vibebook-pdf-container');
            });
            
            $('#vibebook-pdf-container').on('mousemove', function(e) {
                if (!self.drawingArea) {
                    return;
                }
                
                var offset = $(this).offset();
                var currentX = e.pageX - offset.left;
                var currentY = e.pageY - offset.top;
                
                var width = currentX - self.startX;
                var height = currentY - self.startY;
                
                var left = width > 0 ? self.startX : currentX;
                var top = height > 0 ? self.startY : currentY;
                
                width = Math.abs(width);
                height = Math.abs(height);
                
                $('#vibebook-temp-area').css({
                    left: left + 'px',
                    top: top + 'px',
                    width: width + 'px',
                    height: height + 'px'
                });
            });
            
            $('#vibebook-pdf-container').on('mouseup', function(e) {
                if (!self.drawingArea) {
                    return;
                }
                
                var offset = $(this).offset();
                var currentX = e.pageX - offset.left;
                var currentY = e.pageY - offset.top;
                
                var width = currentX - self.startX;
                var height = currentY - self.startY;
                
                var left = width > 0 ? self.startX : currentX;
                var top = height > 0 ? self.startY : currentY;
                
                width = Math.abs(width);
                height = Math.abs(height);
                
                // Eliminar div temporal
                $('#vibebook-temp-area').remove();
                
                // Si el área es demasiado pequeña, cancelar
                if (width < 10 || height < 10) {
                    self.drawingArea = false;
                    return;
                }
                
                // Guardar coordenadas
                self.drawingArea = {
                    left: left,
                    top: top,
                    width: width,
                    height: height
                };
                
                // Mostrar opciones según la herramienta seleccionada
                if (self.currentTool) {
                    $('#vibebook-option-' + self.currentTool).show();
                } else {
                    alert('Por favor, selecciona una herramienta primero.');
                    self.drawingArea = false;
                }
            });
            
            // Delegación de eventos para áreas existentes
            $('#vibebook-areas-list').on('click', '.vibebook-area-select', function(e) {
                e.preventDefault();
                
                var id = $(this).data('id');
                self.selectArea(id);
            });
            
            $('#vibebook-areas-list').on('click', '.vibebook-area-delete', function(e) {
                e.preventDefault();
                
                var id = $(this).data('id');
                self.deleteArea(id);
            });
            
            // Hacer áreas arrastrables
            $('#vibebook-pdf-container').on('mousedown', '.vibebook-area', function(e) {
                e.stopPropagation();
                
                var $area = $(this);
                var areaId = $area.data('id');
                
                // Seleccionar área
                self.selectArea(areaId);
                
                var startX = e.pageX;
                var startY = e.pageY;
                var startLeft = parseInt($area.css('left'));
                var startTop = parseInt($area.css('top'));
                
                // Mover área
                $(document).on('mousemove.dragArea', function(e) {
                    var newLeft = startLeft + (e.pageX - startX);
                    var newTop = startTop + (e.pageY - startY);
                    
                    $area.css({
                        left: newLeft + 'px',
                        top: newTop + 'px'
                    });
                });
                
                // Detener movimiento
                $(document).on('mouseup.dragArea', function() {
                    $(document).off('mousemove.dragArea mouseup.dragArea');
                    
                    // Actualizar coordenadas
                    var newLeft = parseInt($area.css('left'));
                    var newTop = parseInt($area.css('top'));
                    
                    // Encontrar área en el array
                    var area = self.findAreaById(areaId);
                    if (area) {
                        // Actualizar coordenadas
                        area.coords[0] = newLeft;
                        area.coords[1] = newTop;
                        
                        // Calcular porcentajes
                        self.updateAreaPercentages(area);
                        
                        // Guardar áreas
                        self.saveAreas();
                    }
                });
            });
        },
        
        // Abrir biblioteca de medios
        openMediaLibrary: function(type) {
            var self = this;
            
            // Configurar frame según el tipo
            var frameConfig = {
                title: type === 'pdf' ? 'Seleccionar PDF' : 'Seleccionar Audio',
                button: {
                    text: 'Seleccionar'
                },
                multiple: false
            };
            
            // Filtrar por tipo
            if (type === 'pdf') {
                frameConfig.library = {
                    type: 'application/pdf'
                };
            } else if (type === 'audio') {
                frameConfig.library = {
                    type: 'audio'
                };
            }
            
            // Crear frame
            self.mediaFrame = wp.media(frameConfig);
            
            // Evento de selección
            self.mediaFrame.on('select', function() {
                var attachment = self.mediaFrame.state().get('selection').first().toJSON();
                
                if (type === 'pdf') {
                    // Guardar ID del PDF
                    self.pdfId = attachment.id;
                    
                    // Mostrar nombre
                    $('#vibebook-pdf-name').text(attachment.filename);
                    $('#vibebook-pdf-info').show();
                    
                    // Cargar PDF
                    self.loadPDF(attachment.url);
                } else if (type === 'audio') {
                    // Guardar ID del audio
                    self.selectedAudioId = attachment.id;
                    
                    // Mostrar nombre
                    $('#vibebook-audio-name').text(attachment.filename);
                }
            });
            
            // Abrir frame
            self.mediaFrame.open();
        },
        
        // Cargar PDF
        loadPDF: function(url) {
            var self = this;
            
            // Mostrar cargando
            $('#vibebook-pdf-loading').show();
            
            // Cargar PDF
            var loadingTask = pdfjsLib.getDocument(url);
            loadingTask.promise.then(function(pdf) {
                self.pdfDoc = pdf;
                self.totalPages = pdf.numPages;
                
                // Actualizar selector de páginas
                self.updatePageSelect();
                
                // Renderizar primera página
                self.renderPage(1);
                
                // Actualizar selector de páginas para navegación interna
                self.updateInternalPageSelect();
            }, function(reason) {
                console.error(reason);
                alert('Error al cargar el PDF: ' + reason);
            });
        },
        
        // Actualizar selector de páginas
        updatePageSelect: function() {
            var self = this;
            var $select = $('#vibebook-page-select');
            
            // Limpiar selector
            $select.empty();
            
            // Agregar opciones
            for (var i = 1; i <= self.totalPages; i++) {
                $select.append($('<option></option>').val(i).text('Página ' + i));
            }
        },
        
        // Actualizar selector de páginas para navegación interna
        updateInternalPageSelect: function() {
            var self = this;
            var $select = $('#vibebook-internal-page');
            
            // Limpiar selector
            $select.empty();
            
            // Agregar opciones
            for (var i = 1; i <= self.totalPages; i++) {
                $select.append($('<option></option>').val(i).text('Página ' + i));
            }
        },
        
        // Renderizar página
        renderPage: function(num) {
            var self = this;
            
            // Verificar número de página
            if (num < 1 || num > self.totalPages) {
                return;
            }
            
            self.currentPage = num;
            
            // Actualizar selector
            $('#vibebook-page-select').val(num);
            
            // Si ya hay una renderización en progreso, encolar
            if (self.pdfRendering) {
                self.pageNumPending = num;
                return;
            }
            
            // Marcar como renderizando
            self.pdfRendering = true;
            
            // Obtener página
            self.pdfDoc.getPage(num).then(function(page) {
                // Crear canvas si no existe
                if (!self.pdfCanvas) {
                    self.pdfCanvas = document.createElement('canvas');
                    self.pdfContext = self.pdfCanvas.getContext('2d');
                    $('#vibebook-pdf-container').append(self.pdfCanvas);
                }
                
                // Calcular escala para ajustar al contenedor
                var viewport = page.getViewport({ scale: self.scale });
                
                // Guardar dimensiones originales
                self.pdfOriginalWidth = viewport.width;
                self.pdfOriginalHeight = viewport.height;
                
                // Ajustar canvas
                self.pdfCanvas.width = viewport.width;
                self.pdfCanvas.height = viewport.height;
                
                // Renderizar
                var renderContext = {
                    canvasContext: self.pdfContext,
                    viewport: viewport
                };
                
                var renderTask = page.render(renderContext);
                renderTask.promise.then(function() {
                    // Marcar como no renderizando
                    self.pdfRendering = false;
                    
                    // Ocultar cargando
                    $('#vibebook-pdf-loading').hide();
                    
                    // Renderizar áreas
                    self.renderAreas();
                    
                    // Si hay una página pendiente, renderizarla
                    if (self.pageNumPending !== null) {
                        self.renderPage(self.pageNumPending);
                        self.pageNumPending = null;
                    }
                });
            });
        },
        
        // Página anterior
        prevPage: function() {
            var self = this;
            
            if (self.currentPage > 1) {
                self.renderPage(self.currentPage - 1);
            }
        },
        
        // Página siguiente
        nextPage: function() {
            var self = this;
            
            if (self.currentPage < self.totalPages) {
                self.renderPage(self.currentPage + 1);
            }
        },
        
        // Renderizar áreas
        renderAreas: function() {
            var self = this;
            
            // Limpiar áreas existentes
            $('.vibebook-area').remove();
            
            // Actualizar lista de áreas
            self.updateAreasList();
            
            // Renderizar áreas de la página actual
            $.each(self.areas, function(index, area) {
                if (area.page === self.currentPage) {
                    self.renderArea(area);
                }
            });
        },
        
        // Renderizar área
        renderArea: function(area) {
            var self = this;
            
            // Crear div
            var $area = $('<div></div>')
                .addClass('vibebook-area')
                .addClass('vibebook-area-' + area.type)
                .attr('data-id', area.id)
                .css({
                    position: 'absolute',
                    left: area.coords[0] + 'px',
                    top: area.coords[1] + 'px',
                    width: area.coords[2] + 'px',
                    height: area.coords[3] + 'px',
                    border: '2px solid',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    zIndex: 10
                });
            
            // Color según tipo
            switch (area.type) {
                case 'url':
                    $area.css('borderColor', '#0073aa');
                    break;
                    
                case 'youtube':
                    $area.css('borderColor', '#ff0000');
                    break;
                    
                case 'internal':
                    var color = area.color || 'blue';
                    var colorMap = {
                        blue: '#0073aa',
                        red: '#ff0000',
                        green: '#00aa00',
                        orange: '#ff9900'
                    };
                    $area.css('borderColor', colorMap[color] || '#0073aa');
                    break;
                    
                case 'audio':
                    $area.css('borderColor', '#ffcc00');
                    break;
            }
            
            // Agregar al contenedor
            $('#vibebook-pdf-container').append($area);
        },
        
        // Actualizar lista de áreas
        updateAreasList: function() {
            var self = this;
            var $list = $('#vibebook-areas-list');
            
            // Limpiar lista
            $list.empty();
            
            // Filtrar áreas de la página actual
            var pageAreas = $.grep(self.areas, function(area) {
                return area.page === self.currentPage;
            });
            
            // Si no hay áreas, mostrar mensaje
            if (pageAreas.length === 0) {
                $list.append('<li>No hay áreas en esta página.</li>');
                return;
            }
            
            // Agregar áreas a la lista
            $.each(pageAreas, function(index, area) {
                var $item = $('<li></li>');
                var $select = $('<a href="#" class="vibebook-area-select"></a>').data('id', area.id);
                var $delete = $('<a href="#" class="vibebook-area-delete">×</a>').data('id', area.id);
                
                // Texto según tipo
                switch (area.type) {
                    case 'url':
                        $select.text('URL: ' + area.target_url);
                        break;
                        
                    case 'youtube':
                        $select.text('YouTube: ' + area.target_url);
                        break;
                        
                    case 'internal':
                        $select.text('Navegación: Página ' + area.target_page);
                        break;
                        
                    case 'audio':
                        $select.text('Audio: ' + (area.autoplay ? 'Autoplay' : 'Manual'));
                        break;
                }
                
                // Agregar a item
                $item.append($select).append($delete);
                
                // Agregar a lista
                $list.append($item);
            });
        },
        
        // Crear área
        createArea: function(type, data) {
            var self = this;
            
            // Verificar datos
            if (!self.drawingArea || !self.flipbookId) {
                return;
            }
            
            // Crear objeto de área
            var area = {
                type: type,
                page: self.currentPage,
                coords: [
                    self.drawingArea.left,
                    self.drawingArea.top,
                    self.drawingArea.width,
                    self.drawingArea.height
                ]
            };
            
            // Calcular porcentajes
            self.updateAreaPercentages(area);
            
            // Datos específicos según tipo
            switch (type) {
                case 'url':
                    area.target_url = data.target_url;
                    break;
                    
                case 'youtube':
                    area.target_url = data.target_url;
                    break;
                    
                case 'internal':
                    area.target_page = data.target_page;
                    area.color = data.color;
                    break;
                    
                case 'audio':
                    area.audio_id = data.audio_id;
                    area.autoplay = data.autoplay;
                    break;
            }
            
            // Guardar área
            $.ajax({
                url: vibeBookFlip.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'vibebook_save_area',
                    nonce: vibeBookFlip.nonce,
                    post_id: self.flipbookId,
                    page: area.page,
                    type: area.type,
                    coords: area.coords.join(','),
                    target_url: area.target_url,
                    target_page: area.target_page,
                    color: area.color,
                    audio_id: area.audio_id,
                    autoplay: area.autoplay ? 'true' : 'false'
                },
                success: function(response) {
                    if (response.success) {
                        // Recargar áreas
                        self.loadFlipbookData(self.flipbookId);
                        
                        // Limpiar
                        self.drawingArea = false;
                        self.currentTool = null;
                        
                        // Ocultar opciones
                        $('.vibebook-tool-options').hide();
                        $('.vibebook-tool-button').removeClass('active');
                    } else {
                        alert('Error al guardar el área: ' + response.data);
                    }
                },
                error: function() {
                    alert('Error de conexión al guardar el área.');
                }
            });
        },
        
        // Actualizar porcentajes de área
        updateAreaPercentages: function(area) {
            var self = this;
            
            // Verificar dimensiones
            if (!self.pdfOriginalWidth || !self.pdfOriginalHeight) {
                return;
            }
            
            // Calcular porcentajes
            area.percentages = [
                (area.coords[0] / self.pdfOriginalWidth) * 100,
                (area.coords[1] / self.pdfOriginalHeight) * 100,
                (area.coords[2] / self.pdfOriginalWidth) * 100,
                (area.coords[3] / self.pdfOriginalHeight) * 100
            ];
        },
        
        // Guardar áreas
        saveAreas: function() {
            var self = this;
            
            // Verificar ID
            if (!self.flipbookId) {
                return;
            }
            
            // Actualizar áreas en servidor
            $.ajax({
                url: vibeBookFlip.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'vibebook_update_areas',
                    nonce: vibeBookFlip.nonce,
                    post_id: self.flipbookId,
                    areas: JSON.stringify(self.areas)
                },
                success: function(response) {
                    if (!response.success) {
                        alert('Error al guardar las áreas: ' + response.data);
                    }
                },
                error: function() {
                    alert('Error de conexión al guardar las áreas.');
                }
            });
        },
        
        // Seleccionar área
        selectArea: function(id) {
            var self = this;
            
            // Buscar área
            var area = self.findAreaById(id);
            if (!area) {
                return;
            }
            
            // Guardar área seleccionada
            self.selectedArea = area;
            
            // Resaltar área
            $('.vibebook-area').removeClass('selected');
            $('.vibebook-area[data-id="' + id + '"]').addClass('selected');
            
            // Mostrar opciones según tipo
            $('.vibebook-tool-options').hide();
            $('#vibebook-option-' + area.type).show();
            
            // Actualizar herramienta actual
            self.currentTool = area.type;
            
            // Actualizar clase activa
            $('.vibebook-tool-button').removeClass('active');
            $('.vibebook-tool-button[data-tool="' + area.type + '"]').addClass('active');
            
            // Actualizar campos según tipo
            switch (area.type) {
                case 'url':
                    $('#vibebook-url-target').val(area.target_url);
                    break;
                    
                case 'youtube':
                    $('#vibebook-youtube-url').val(area.target_url);
                    break;
                    
                case 'internal':
                    $('#vibebook-internal-page').val(area.target_page);
                    $('#vibebook-internal-color').val(area.color || 'blue');
                    break;
                    
                case 'audio':
                    self.selectedAudioId = area.audio_id;
                    $('#vibebook-audio-autoplay').prop('checked', area.autoplay);
                    break;
            }
        },
        
        // Encontrar área por ID
        findAreaById: function(id) {
            var self = this;
            
            for (var i = 0; i < self.areas.length; i++) {
                if (self.areas[i].id === id) {
                    return self.areas[i];
                }
            }
            
            return null;
        },
        
        // Eliminar área
        deleteArea: function(id) {
            var self = this;
            
            // Verificar ID
            if (!self.flipbookId) {
                return;
            }
            
            // Confirmar
            if (!confirm('¿Estás seguro de que deseas eliminar esta área?')) {
                return;
            }
            
            // Eliminar área
            $.ajax({
                url: vibeBookFlip.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'vibebook_delete_area',
                    nonce: vibeBookFlip.nonce,
                    post_id: self.flipbookId,
                    area_id: id
                },
                success: function(response) {
                    if (response.success) {
                        // Recargar áreas
                        self.loadFlipbookData(self.flipbookId);
                        
                        // Limpiar selección
                        self.selectedArea = null;
                    } else {
                        alert('Error al eliminar el área: ' + response.data);
                    }
                },
                error: function() {
                    alert('Error de conexión al eliminar el área.');
                }
            });
        },
        
        // Guardar flipbook
        saveFlipbook: function() {
            var self = this;
            
            // Verificar datos
            var title = $('#vibebook-title').val();
            if (!title) {
                alert('Por favor, ingresa un título para el flipbook.');
                return;
            }
            
            if (!self.pdfId) {
                alert('Por favor, selecciona un PDF.');
                return;
            }
            
            // Guardar flipbook
            $.ajax({
                url: vibeBookFlip.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'vibebook_save_flipbook',
                    nonce: vibeBookFlip.nonce,
                    post_id: self.flipbookId || 0,
                    title: title,
                    pdf_id: self.pdfId
                },
                success: function(response) {
                    if (response.success) {
                        // Guardar ID
                        self.flipbookId = response.data.post_id;
                        
                        // Mostrar mensaje
                        alert('Flipbook guardado correctamente.');
                        
                        // Redireccionar a edición
                        window.location.href = vibeBookFlip.adminUrl + '?page=vibebook-flip&action=edit&id=' + self.flipbookId;
                    } else {
                        alert('Error al guardar el flipbook: ' + response.data);
                    }
                },
                error: function() {
                    alert('Error de conexión al guardar el flipbook.');
                }
            });
        }
    };
    
    // Inicializar cuando el DOM esté listo
    $(document).ready(function() {
        VibeBookFlipAdmin.init();
    });
    
})(jQuery);
