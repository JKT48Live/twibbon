$(document).ready(() => {
    const $canvas = $('#canvas');
    const canvas = $canvas[0]; 

    const getBestContext = (targetCanvas) => (
        targetCanvas.getContext('2d', {
            alpha: true,
            willReadFrequently: true
        })
    );

    const ctx = getBestContext(canvas);

    const $zoomControl = $('#zoomControl');
    const $left = $('#left');
    const $right = $('#right');
    const $up = $('#up');
    const $down = $('#down');
    const $saveImage = $('#saveImage');
    const $imageUpload = $('#imageUpload');
    const $twibbonGrid = $('#twibbonGrid');
    const $canvasContainer = $('#canvasContainer');

    // === STATE VARIABLES ===
    let image = new Image();
    let twibbon = new Image();
    let imageObjectUrl = null;

    let scale = 1;
    let pos = { x: 0, y: 0 };
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    const MOVE = 10;
    const EXPORT_SCALE = 1;

    // ====== TWIBBON LIST ======
    const twibbonList = [
        { name: "Hagavi JKT48V", file: "twibbon/Hagavi_JKT48V.png" },
        { name: "First Snow Concert", file: "twibbon/first-snow.png" },
        { name: "Wonderland Concert", file: "twibbon/Twibbon-Wonderland.png" },
        { name: "Flowerful Concert", file: "twibbon/flowerful.png" },
        { name: "Kabesha Frame (web)", file: "twibbon/memberFrame.png" },
        { name: "Team Passion", file: "twibbon/passion.png" },
        { name: "Team Dream", file: "twibbon/TeamDream.png" },
    ];

    // === CORE FUNCTIONS ===

    const reset = () => {
        scale = 1;
        pos = { x: 0, y: 0 };
        $zoomControl.val(1); 
        draw();
    };

    const renderComposite = (targetCtx, targetCanvasWidth, targetCanvasHeight) => {
        if (!twibbon.complete) return;
        targetCtx.clearRect(0, 0, targetCanvasWidth, targetCanvasHeight);
        targetCtx.imageSmoothingEnabled = true;
        targetCtx.imageSmoothingQuality = 'high';
        targetCtx.globalCompositeOperation = 'source-over';
        targetCtx.filter = 'none';
        
        if (image.complete && image.src) {
            const widthRatio = targetCanvasWidth / canvas.width;
            const heightRatio = targetCanvasHeight / canvas.height;
            const baseSf = Math.max(
                targetCanvasWidth / image.width,
                targetCanvasHeight / image.height
            );
            
            const finalSf = baseSf * scale;
            const scaledWidth = image.width * finalSf;
            const scaledHeight = image.height * finalSf;
            const offsetX = (targetCanvasWidth - scaledWidth) / 2 + (pos.x * widthRatio);
            const offsetY = (targetCanvasHeight - scaledHeight) / 2 + (pos.y * heightRatio);

            targetCtx.drawImage(
                image, 
                offsetX, 
                offsetY, 
                scaledWidth, 
                scaledHeight
            );
        }

        targetCtx.drawImage(twibbon, 0, 0, targetCanvasWidth, targetCanvasHeight);
    };

    const draw = () => {
        if (!twibbon.complete) return;
        renderComposite(ctx, canvas.width, canvas.height);
    };

    const loadTwibbon = (src) => {
        twibbon = new Image();
        twibbon.onload = () => {
            canvas.width = twibbon.width;
            canvas.height = twibbon.height;
            reset();
        };
        twibbon.src = src;

        $('.twibbon-item').removeClass('active');
        $(`[data-src="${src}"]`).addClass('active');
    };


    // ====== RENDER GRID ======
    const renderGrid = () => {
        const gridHtml = twibbonList.map((t, i) => `
            <div class="p-1">
                <div 
                    class="twibbon-item rounded-2xl p-2 cursor-pointer ${i === 0 ? 'active' : ''}" 
                    data-src="${t.file}"
                >
                    <img 
                        src="${t.file}" 
                        class="w-full h-auto rounded-xl"
                        loading="${i === 0 ? 'eager' : 'lazy'}"  
                        alt="${t.name}"
                    >
                    <small class="mt-2 block text-center text-xs font-medium text-textMuted">${t.name}</small>
                </div>
            </div>
        `).join('');
        
        $twibbonGrid.html(gridHtml);
        
        loadTwibbon(twibbonList[0].file);
    };

    // === EVENT LISTENERS ===
    $twibbonGrid.on('click', '.twibbon-item', function() {
        const src = $(this).data('src'); 
        loadTwibbon(src);
    });

    const revokeImageObjectUrl = () => {
        if (imageObjectUrl) {
            URL.revokeObjectURL(imageObjectUrl);
            imageObjectUrl = null;
        }
    };

    const loadUserImage = (file) => {
        revokeImageObjectUrl();
        image = new Image();
        image.decoding = 'async';
        image.crossOrigin = 'anonymous';

        const objectUrl = URL.createObjectURL(file);
        imageObjectUrl = objectUrl;

        image.onload = reset;
        image.src = objectUrl;
    };

    $imageUpload.on('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        $('#file-name').text(file.name);

        loadUserImage(file);
    });

    const getCanvasPointer = (event) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY,
        };
    };

    $canvas.on('mousedown', (e) => {
        const pointer = getCanvasPointer(e);
        isDragging = true;
        dragStart = {
            x: pointer.x - pos.x,
            y: pointer.y - pos.y
        };
    });

    $canvas.on('mousemove', (e) => {
        if (!isDragging) return;
        const pointer = getCanvasPointer(e);
        pos.x = pointer.x - dragStart.x;
        pos.y = pointer.y - dragStart.y;
        draw();
    });

    const stopDragging = () => {
        isDragging = false;
    };

    $canvas.on('mouseup', stopDragging);
    $canvas.on('mouseleave', stopDragging);


    $zoomControl.on('input', function() {
        scale = parseFloat($(this).val()); 
        draw();
    });

    const moveImage = (dx, dy) => {
        pos.x += dx;
        pos.y += dy;
        draw();
    };

    $left.on('click', () => moveImage(-MOVE, 0));
    $right.on('click', () => moveImage(MOVE, 0));
    $up.on('click', () => moveImage(0, -MOVE));
    $down.on('click', () => moveImage(0, MOVE));


    // 5. Download Gambar 
    $saveImage.on('click', () => {
        if (!canvas) {
            console.error("Canvas element not found.");
            return;
        }

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = Math.round(canvas.width * EXPORT_SCALE);
        exportCanvas.height = Math.round(canvas.height * EXPORT_SCALE);
        const exportCtx = getBestContext(exportCanvas);

        if (!exportCtx) {
            alert('Gagal menyiapkan canvas export.');
            return;
        }

        renderComposite(exportCtx, exportCanvas.width, exportCanvas.height);

        exportCanvas.toBlob((blob) => {
            if (!blob) {
                alert('Gagal membuat gambar untuk diunduh.');
                return;
            }

            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.download = 'jkt48twibbon.png';
            link.href = url;

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        }, 'image/png', 1.0);
    });

    // === INITIATION ===
    renderGrid();
});
