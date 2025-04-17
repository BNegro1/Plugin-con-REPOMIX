/**
 * Script JavaScript para el editor de flipbook
 *
 * @package FlipbookContraplanoVibe
 */

(function($) {
    'use strict';

    // Variables globales
    let pdfDoc = null;
    let currentPage = 1;
    let currentTool = 'none';
    let editionId = 0;
    let isPdfLoaded = false;
    let drawingRect = null;
    let interactiveAreas = [];
    let startX, startY;
    let isDrawing = false;
    let canvasWidth, canvasHeight;
    let pdfScale = 1.0;
    
    // Elementos DOM
    const $canvas = $('#pdf-canvas');
    const $interactiveLayer = $('#interactive-layer');
    const $toolSelector = $('#tool-selector');
    const $prevPage = $('#prev-page');
    const $nextPage = $('#next-page');
    const $pageNum = $('#page-num');
    const $pageCount = $('#page-count');
    const $currentPageNum = $('#current-page-num');
    const $totalPages = $('#total-pages');
    const $pdfEditorContainer = $('#pdf-editor-container');
    const $uploadForm = $('#flipbook-upload-form');
    
    // Inicialización
    function init() {
        // Configurar el worker de PDF.js
        if (typeof pdfjsLib !== 'undefined') {
            // Usar la versión del CDN para el worker
            const workerSrcBase = flipbookData.pdfJSUrl.substring(0, flipbookData.pdfJSUrl.lastIndexOf('/') + 1);
            const workerSrc = workerSrcBase + 'pdf.worker.min.js';
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
        }
        
        registerEventListeners();
        loadExistingPdf();
    }
    
    // Registrar los event listeners
    function registerEventListeners() {
        // Selección de herramienta
        $toolSelector.on('change', handleToolChange);
        
        // Navegación de páginas
        $prevPage.on('click', goToPrevPage);
        $nextPage.on('click', goToNextPage);
        
        // Subida de PDF
        $uploadForm.on('submit', handlePdfUpload);
        
        // Herramienta de enlace
        $('#save-link').on('click', saveLink);
        $('#cancel-link').on('click', cancelTool);
        
        // Herramienta de YouTube
        $('#save-youtube').on('click', saveYouTube);
        $('#cancel-youtube').on('click', cancelTool);
        
        // Herramienta de audio
        $('#save-audio').on('click', saveAudio);
        $('#cancel-audio').on('click', cancelTool);
        
        // Guardar todas las áreas
        $('#save-all-areas').on('click', saveAllAreas);
        
        // Eventos de dibujo de área
        $interactiveLayer.on('mousedown', startDrawing);
        $interactiveLayer.on('mousemove', updateDrawing);
        $interactiveLayer.on('mouseup', finishDrawing);
        $interactiveLayer.on('mouseleave', cancelDrawing);
        
        // Eventos para áreas interactivas existentes
        $interactiveLayer.on('click', '.interactive-area', selectArea);
    }
    
    // Cargar PDF existente si estamos en modo edición
    function loadExistingPdf() {
        if ($pdfEditorContainer.length) {
            editionId = $pdfEditorContainer.data('edition-id');
            const pdfUrl = $pdfEditorContainer.data('pdf-url');
            
            if (editionId && pdfUrl) {
                loadPdf(pdfUrl);
                loadExistingAreas();
            }
        }
    }
    
    // Cargar áreas interactivas existentes
    function loadExistingAreas() {
        $.ajax({
            url: flipbookData.ajaxurl,
            type: 'GET',
            dataType: 'json',
            data: {
                action: 'flipbook_get_areas',
                edition_id: editionId,
                nonce: flipbookData.nonce
            },
            success: function(response) {
                if (response.success && response.data) {
                    interactiveAreas = response.data.areas || [];
                    renderAreas();
                }
            }
        });
    }
    
    // Renderizar áreas interactivas
    function renderAreas() {
        $interactiveLayer.find('.interactive-area').remove();
        $interactiveLayer.find('.audio-icon').remove();
        
        const currentAreas = interactiveAreas.filter(area => area.page_num === currentPage);
        
        currentAreas.forEach(function(area, index) {
            if (area.link_type === 'audio') {
                createAudioIcon(area, index);
            } else {
                createInteractiveArea(area, index);
            }
        });
    }
    
    // Crear un área interactiva en el canvas
    function createInteractiveArea(area, index) {
        const $area = $('<div>')
            .addClass('interactive-area')
            .addClass(area.link_type)
            .data('index', index)
            .data('area', area)
            .css({
                left: area.x_coord * canvasWidth + 'px',
                top: area.y_coord * canvasHeight + 'px',
                width: area.width * canvasWidth + 'px',
                height: area.height * canvasHeight + 'px'
            });
        
        $interactiveLayer.append($area);
    }
    
    // Crear un icono de audio
    function createAudioIcon(area, index) {
        const $icon = $('<div>')
            .addClass('audio-icon')
            .data('index', index)
            .data('area', area)
            .css({
                left: area.x_coord * canvasWidth + 'px',
                top: area.y_coord * canvasHeight + 'px'
            });
        
        $interactiveLayer.append($icon);
    }
    
    // Cargar PDF
    function loadPdf(url) {
        const loadingTask = pdfjsLib.getDocument(url);
        
        loadingTask.promise.then(function(pdf) {
            pdfDoc = pdf;
            $pageCount.text(pdf.numPages);
            $totalPages.text(pdf.numPages);
            isPdfLoaded = true;
            renderPage(currentPage);
        }).catch(function(error) {
            console.error('Error al cargar el PDF:', error);
            alert('Error al cargar el PDF. Por favor, intenta de nuevo.');
        });
    }
    
    // Renderizar página actual
    function renderPage(pageNumber) {
        pdfDoc.getPage(pageNumber).then(function(page) {
            const viewport = page.getViewport({ scale: pdfScale });
            canvasWidth = viewport.width;
            canvasHeight = viewport.height;
            
            $canvas[0].width = canvasWidth;
            $canvas[0].height = canvasHeight;
            
            $interactiveLayer.css({
                width: canvasWidth + 'px',
                height: canvasHeight + 'px'
            });
            
            const renderContext = {
                canvasContext: $canvas[0].getContext('2d'),
                viewport: viewport
            };
            
            page.render(renderContext).promise.then(function() {
                $('.flipbook-loading').hide();
                $pageNum.text(pageNumber);
                $currentPageNum.text(pageNumber);
                renderAreas();
            });
        });
    }
    
    // Ir a la página anterior
    function goToPrevPage() {
        if (currentPage <= 1 || !isPdfLoaded) return;
        
        currentPage--;
        renderPage(currentPage);
    }
    
    // Ir a la página siguiente
    function goToNextPage() {
        if (currentPage >= pdfDoc.numPages || !isPdfLoaded) return;
        
        currentPage++;
        renderPage(currentPage);
    }
    
    // Manejar el cambio de herramienta
    function handleToolChange() {
        currentTool = $toolSelector.val();
        
        // Ocultar todos los formularios de herramientas
        $('.tool-form').hide();
        
        // Mostrar el formulario de la herramienta seleccionada
        if (currentTool !== 'none') {
            $('#' + currentTool + '-form').show();
        }
        
        // Activar o desactivar el modo de dibujo
        if (currentTool !== 'none') {
            $interactiveLayer.addClass('drawing');
        } else {
            $interactiveLayer.removeClass('drawing');
        }
    }
    
    // Iniciar el dibujo de un área
    function startDrawing(e) {
        if (currentTool === 'none' || !isPdfLoaded) return;
        
        const offset = $interactiveLayer.offset();
        startX = e.pageX - offset.left;
        startY = e.pageY - offset.top;
        
        drawingRect = $('<div>')
            .addClass('interactive-area')
            .addClass(currentTool)
            .css({
                left: startX + 'px',
                top: startY + 'px',
                width: '0px',
                height: '0px'
            });
        
        $interactiveLayer.append(drawingRect);
        isDrawing = true;
        
        e.preventDefault();
    }
    
    // Actualizar el dibujo mientras se arrastra
    function updateDrawing(e) {
        if (!isDrawing || !drawingRect) return;
        
        const offset = $interactiveLayer.offset();
        const currentX = e.pageX - offset.left;
        const currentY = e.pageY - offset.top;
        
        let width = currentX - startX;
        let height = currentY - startY;
        
        // Ajustar coordenadas para dibujo en cualquier dirección
        let newX = startX;
        let newY = startY;
        
        if (width < 0) {
            width = Math.abs(width);
            newX = startX - width;
        }
        
        if (height < 0) {
            height = Math.abs(height);
            newY = startY - height;
        }
        
        drawingRect.css({
            left: newX + 'px',
            top: newY + 'px',
            width: width + 'px',
            height: height + 'px'
        });
        
        e.preventDefault();
    }
    
    // Finalizar el dibujo
    function finishDrawing(e) {
        if (!isDrawing || !drawingRect) return;
        
        isDrawing = false;
        
        // Verificar que el área tenga un tamaño mínimo
        const width = parseFloat(drawingRect.css('width'));
        const height = parseFloat(drawingRect.css('height'));
        
        if (width < 20 || height < 20) {
            drawingRect.remove();
            drawingRect = null;
            return;
        }
        
        // Habilitar botones de guardar según la herramienta
        if (currentTool === 'link') {
            $('#save-link').prop('disabled', false);
        } else if (currentTool === 'youtube') {
            $('#save-youtube').prop('disabled', false);
        } else if (currentTool === 'audio') {
            $('#save-audio').prop('disabled', false);
        }
        
        e.preventDefault();
    }
    
    // Cancelar el dibujo
    function cancelDrawing() {
        if (isDrawing && drawingRect) {
            drawingRect.remove();
            drawingRect = null;
            isDrawing = false;
        }
    }
    
    // Seleccionar un área existente
    function selectArea() {
        const areaIndex = $(this).data('index');
        const area = interactiveAreas[areaIndex];
        
        // Destacar el área seleccionada
        $('.interactive-area').removeClass('selected');
        $(this).addClass('selected');
        
        // Configurar herramienta y formulario según el tipo de área
        $toolSelector.val(area.link_type).trigger('change');
        
        if (area.link_type === 'link') {
            $('#link-url').val(area.link_target);
            $('#save-link').prop('disabled', false).data('editing-index', areaIndex);
        } else if (area.link_type === 'youtube') {
            $('#youtube-url').val(area.link_target);
            $('#save-youtube').prop('disabled', false).data('editing-index', areaIndex);
        }
    }
    
    // Guardar enlace
    function saveLink() {
        const editingIndex = $('#save-link').data('editing-index');
        const url = $('#link-url').val();
        
        if (!url) {
            alert('Por favor, ingresa una URL válida.');
            return;
        }
        
        if (editingIndex !== undefined) {
            // Editar área existente
            interactiveAreas[editingIndex].link_target = url;
        } else if (drawingRect) {
            // Crear nueva área
            const left = parseFloat(drawingRect.css('left'));
            const top = parseFloat(drawingRect.css('top'));
            const width = parseFloat(drawingRect.css('width'));
            const height = parseFloat(drawingRect.css('height'));
            
            interactiveAreas.push({
                page_num: currentPage,
                x_coord: left / canvasWidth,
                y_coord: top / canvasHeight,
                width: width / canvasWidth,
                height: height / canvasHeight,
                link_type: 'link',
                link_target: url
            });
            
            drawingRect.remove();
            drawingRect = null;
        }
        
        $('#link-url').val('');
        $('#save-link').prop('disabled', true).removeData('editing-index');
        $('#link-form').hide();
        $toolSelector.val('none').trigger('change');
        
        renderAreas();
    }
    
    // Guardar YouTube
    function saveYouTube() {
        const editingIndex = $('#save-youtube').data('editing-index');
        const url = $('#youtube-url').val();
        
        if (!url || !isValidYouTubeUrl(url)) {
            alert('Por favor, ingresa una URL de YouTube válida.');
            return;
        }
        
        if (editingIndex !== undefined) {
            // Editar área existente
            interactiveAreas[editingIndex].link_target = url;
        } else if (drawingRect) {
            // Crear nueva área
            const left = parseFloat(drawingRect.css('left'));
            const top = parseFloat(drawingRect.css('top'));
            const width = parseFloat(drawingRect.css('width'));
            const height = parseFloat(drawingRect.css('height'));
            
            interactiveAreas.push({
                page_num: currentPage,
                x_coord: left / canvasWidth,
                y_coord: top / canvasHeight,
                width: width / canvasWidth,
                height: height / canvasHeight,
                link_type: 'youtube',
                link_target: url
            });
            
            drawingRect.remove();
            drawingRect = null;
        }
        
        $('#youtube-url').val('');
        $('#save-youtube').prop('disabled', true).removeData('editing-index');
        $('#youtube-form').hide();
        $toolSelector.val('none').trigger('change');
        
        renderAreas();
    }
    
    // Validar URL de YouTube
    function isValidYouTubeUrl(url) {
        const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
        return pattern.test(url);
    }
    
    // Guardar audio
    function saveAudio() {
        const audioFile = $('#audio-file')[0].files[0];
        const autoplay = $('#audio-autoplay').is(':checked');
        
        if (!audioFile) {
            alert('Por favor, selecciona un archivo de audio.');
            return;
        }
        
        if (!drawingRect) {
            alert('Error al crear el icono de audio.');
            return;
        }
        
        const left = parseFloat(drawingRect.css('left'));
        const top = parseFloat(drawingRect.css('top'));
        
        // Crear FormData para la subida
        const formData = new FormData();
        formData.append('action', 'flipbook_upload_audio');
        formData.append('nonce', flipbookData.nonce);
        formData.append('edition_id', editionId);
        formData.append('page_num', currentPage);
        formData.append('x_coord', left / canvasWidth);
        formData.append('y_coord', top / canvasHeight);
        formData.append('autoplay', autoplay);
        formData.append('audio_file', audioFile);
        
        $.ajax({
            url: flipbookData.ajaxurl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                if (response.success) {
                    // Limpiar y recargar
                    $('#audio-file').val('');
                    $('#audio-autoplay').prop('checked', false);
                    $('#save-audio').prop('disabled', true);
                    $('#audio-form').hide();
                    
                    if (drawingRect) {
                        drawingRect.remove();
                        drawingRect = null;
                    }
                    
                    $toolSelector.val('none').trigger('change');
                    loadExistingAreas();
                } else {
                    alert(response.data.message || 'Error al subir el audio.');
                }
            },
            error: function() {
                alert('Error de conexión al subir el audio.');
            }
        });
    }
    
    // Cancelar herramienta actual
    function cancelTool() {
        if (drawingRect) {
            drawingRect.remove();
            drawingRect = null;
        }
        
        // Limpiar formularios
        $('#link-url').val('');
        $('#youtube-url').val('');
        $('#audio-file').val('');
        $('#audio-autoplay').prop('checked', false);
        
        // Deshabilitar botones
        $('#save-link').prop('disabled', true).removeData('editing-index');
        $('#save-youtube').prop('disabled', true).removeData('editing-index');
        $('#save-audio').prop('disabled', true);
        
        // Ocultar formularios
        $('.tool-form').hide();
        
        // Resetear herramienta
        $toolSelector.val('none').trigger('change');
        
        // Quitar selección
        $('.interactive-area').removeClass('selected');
    }
    
    // Guardar todas las áreas interactivas
    function saveAllAreas() {
        // Filtrar áreas de audio, que se guardan por separado
        const areas = interactiveAreas.filter(area => area.link_type !== 'audio');
        
        if (areas.length === 0) {
            alert('No hay áreas interactivas para guardar.');
            return;
        }
        
        $.ajax({
            url: flipbookData.ajaxurl,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'flipbook_save_areas',
                nonce: flipbookData.nonce,
                edition_id: editionId,
                areas: areas
            },
            success: function(response) {
                if (response.success) {
                    alert('Áreas guardadas correctamente.');
                } else {
                    alert(response.data.message || 'Error al guardar las áreas.');
                }
            },
            error: function() {
                alert('Error de conexión al guardar las áreas.');
            }
        });
    }
    
    // Manejar la subida de PDF
    function handlePdfUpload(e) {
        e.preventDefault();
        
        const $form = $(this);
        const formData = new FormData($form[0]);
        
        // Añadir acción AJAX
        formData.append('action', 'flipbook_upload_pdf');
        formData.append('nonce', flipbookData.nonce);
        
        // Mostrar progreso
        const $progressBar = $form.find('.flipbook-upload-progress');
        const $progressText = $progressBar.find('.progress-text');
        const $progressFill = $progressBar.find('.progress-bar');
        
        $progressBar.show();
        $progressFill.css('width', '0%');
        $progressText.text('0%');
        
        $.ajax({
            url: flipbookData.ajaxurl,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            xhr: function() {
                const xhr = new window.XMLHttpRequest();
                
                xhr.upload.addEventListener('progress', function(evt) {
                    if (evt.lengthComputable) {
                        const percentComplete = evt.loaded / evt.total * 100;
                        $progressFill.css('width', percentComplete + '%');
                        $progressText.text(Math.round(percentComplete) + '%');
                    }
                }, false);
                
                return xhr;
            },
            success: function(response) {
                if (response.success) {
                    editionId = response.data.edition_id;
                    
                    // Recargar la página con el nuevo ID de edición
                    window.location.href = flipbookData.ajaxurl.replace('admin-ajax.php', 'admin.php') + 
                        '?page=flipbook-vibe-editor&edition_id=' + editionId;
                } else {
                    $progressBar.hide();
                    alert(response.data.message || 'Error al subir el PDF.');
                }
            },
            error: function() {
                $progressBar.hide();
                alert('Error de conexión al subir el PDF.');
            }
        });
    }
    
    // Iniciar cuando el DOM esté listo
    $(document).ready(init);
    
})(jQuery); 