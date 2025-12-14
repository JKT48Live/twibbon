const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

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

// ====== RENDER GRID ======
const grid = document.getElementById('twibbonGrid');

function renderGrid() {
  grid.innerHTML = '';
  twibbonList.forEach((t, i) => {
    grid.innerHTML += `
      <div class="col-3">
        <div class="twibbon-item ${i === 0 ? 'active' : ''}" data-src="${t.file}">
          <img src="${t.file}">
          <small class="d-block text-center">${t.name}</small>
        </div>
      </div>
    `;
  });
  loadTwibbon(twibbonList[0].file);
}

grid.addEventListener('click', e => {
  const item = e.target.closest('.twibbon-item');
  if (!item) return;
  loadTwibbon(item.dataset.src);
});

// ====== LOAD TWIBBON ======
function loadTwibbon(src) {
  twibbon = new Image();
  twibbon.onload = () => {
    canvas.width = twibbon.width;
    canvas.height = twibbon.height;
    draw();
  };
  twibbon.src = src;

  document.querySelectorAll('.twibbon-item')
    .forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-src="${src}"]`).classList.add('active');
}

// ====== UPLOAD FOTO ======
document.getElementById('imageUpload').addEventListener('change', e => {
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

function reset() {
  scale = 1;
  pos = { x: 0, y: 0 };
  draw();
}

// ====== DRAW ======
function draw() {
  if (!twibbon.complete) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (image.complete && image.src) {
    const sf = Math.min(
      canvas.width / image.width,
      canvas.height / image.height
    ) * scale;

    ctx.save();
    ctx.translate(canvas.width / 2 + pos.x, canvas.height / 2 + pos.y);
    ctx.scale(sf, sf);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.restore();
  }

  ctx.drawImage(twibbon, 0, 0, canvas.width, canvas.height);
}

canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  dragStart.x = e.offsetX - pos.x;
  dragStart.y = e.offsetY - pos.y;
});

canvas.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  pos.x = e.offsetX - dragStart.x;
  pos.y = e.offsetY - dragStart.y;
  draw();
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
  isDragging = false;
});

// ====== CONTROLS ======
zoomControl.oninput = e => {
  scale = parseFloat(e.target.value);
  draw();
};

left.onclick = () => { pos.x -= MOVE; draw(); };
right.onclick = () => { pos.x += MOVE; draw(); };
up.onclick = () => { pos.y -= MOVE; draw(); };
down.onclick = () => { pos.y += MOVE; draw(); };

// ====== DOWNLOAD ======
saveImage.onclick = () => {
    const canvas = document.getElementById('canvas'); 

    if (!canvas) {
        console.error("Canvas element not found.");
        return;
    }

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
        
    }, 'image/png');
};

// INIT
renderGrid();