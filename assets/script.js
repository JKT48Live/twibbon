$(document).ready(() => {
    const $canvas = $('#canvas');
    const canvas = $canvas[0]; 
    
    const ctx = canvas.getContext('2d', { 
        alpha: true,
        willReadFrequently: true
    });

    const $zoomControl = $('#zoomControl');
    const $left = $('#left');
    const $right = $('#right');
    const $up = $('#up');
    const $down = $('#down');
    const $saveImage = $('#saveImage');
    const $imageUpload = $('#imageUpload');
    const $twibbonGrid = $('#twibbonGrid');

    // === STATE VARIABLES ===
    let image = new Image();
    let twibbon = new Image();

    let scale = 1;
    let pos = { x: 0, y: 0 };
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    const MOVE = 10;

    // ====== TWIBBON LIST ======
    const twibbonList = [
        { name: "First Snow", file: "twibbon/first-snow.png" },
        { name: "Wonderland", file: "twibbon/Twibbon-Wonderland.png" },
        { name: "Hagavi JKT48V", file: "twibbon/Hagavi_JKT48V.png" },
        { name: "Flowerful", file: "twibbon/flowerful.png" },
    ];

    // === CORE FUNCTIONS ===

    const reset = () => {
        scale = 1;
        pos = { x: 0, y: 0 };
        $zoomControl.val(1); 
        draw();
    };

    const draw = () => {
        if (!twibbon.complete) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (image.complete && image.src) {
            const baseSf = Math.max(
                canvas.width / image.width,
                canvas.height / image.height
            );
            
            const finalSf = baseSf * scale;
            const scaledWidth = image.width * finalSf;
            const scaledHeight = image.height * finalSf;
            const offsetX = (canvas.width - scaledWidth) / 2 + pos.x;
            const offsetY = (canvas.height - scaledHeight) / 2 + pos.y;

            ctx.drawImage(
                image, 
                offsetX, 
                offsetY, 
                scaledWidth, 
                scaledHeight
            );
        }

        ctx.drawImage(twibbon, 0, 0, canvas.width, canvas.height);
    };

    const loadTwibbon = (src) => {
        twibbon = new Image();
        twibbon.onload = () => {
            canvas.width = twibbon.width;
            canvas.height = twibbon.height;
            reset();
        };
        twibbon.src = src;

        $('.twibbon-item').removeClass('active border-2 border-primary');
        $(`[data-src="${src}"]`).addClass('active border-2 border-primary');
    };


    // ====== RENDER GRID ======
    const renderGrid = () => {
        const gridHtml = twibbonList.map((t, i) => `
            <div class="p-2 sm:p-0">
                <div 
                    class="twibbon-item bg-gray-700/50 p-2 rounded-lg cursor-pointer transition hover:bg-gray-700 ${i === 0 ? 'active border-2 border-primary' : ''}" 
                    data-src="${t.file}"
                >
                    <img src="${t.file}" class="w-full h-auto rounded">
                    <small class="block text-center text-xs mt-1 text-text-muted">${t.name}</small>
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

    $imageUpload.on('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = ev => {
            image = new Image();
            image.onload = reset;
            image.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });

    $canvas.on('mousedown', (e) => {
        isDragging = true;
        dragStart = {
            x: e.offsetX - pos.x,
            y: e.offsetY - pos.y
        };
    });

    $canvas.on('mousemove', (e) => {
        if (!isDragging) return;
        pos.x = e.offsetX - dragStart.x;
        pos.y = e.offsetY - dragStart.y;
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

        const MIME_TYPE = 'image/png';
        const QUALITY = 1.0;

        canvas.toBlob((blob) => {
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

        }, MIME_TYPE, QUALITY);
    });

    // === INITIATION ===
    renderGrid();
});