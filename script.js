let image, canvas, ctx;
let clickCount = 0;
let foamY = null;
let dY = null;

const D_HITZONE_Y = 360; // approx 'D' location in px
const HIT_TOLERANCE = 20; // ± range for near-perfect
const NEAR_TOLERANCE = 50; // for close but not perfect

document.getElementById('imageUpload').addEventListener('change', function (event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      image = img;
      drawImage();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(event.target.files[0]);
});

function drawImage() {
  canvas = document.getElementById('imageCanvas');
  ctx = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  clickCount = 0;
  foamY = null;
  dY = null;
  document.getElementById('scoreResult').textContent = 'Tap the foam line, then tap the "D" in Drinks.';
}

document.getElementById('imageCanvas').addEventListener('click', function (event) {
  if (!image) return;
  const rect = canvas.getBoundingClientRect();
  const y = event.clientY - rect.top;

  if (clickCount === 0) {
    foamY = y;
    clickCount++;
    document.getElementById('scoreResult').textContent = 'Now tap the "D" in Drinks.';
  } else if (clickCount === 1) {
    dY = y;
    evaluateScore();
  }
});

function evaluateScore() {
  const diff = Math.abs(foamY - D_HITZONE_Y);
  let score = 0;
  let message = '';

  if (diff <= HIT_TOLERANCE) {
    score = 100;
    message = '💥 Nailed it! You split the D like a champ.';
  } else if (diff <= NEAR_TOLERANCE) {
    score = 65;
    message = '⚠️ Close! You were just a hair off the D.';
  } else {
    score = 0;
    message = '😬 You missed the D entirely. Try again!';
  }

  document.getElementById('scoreResult').textContent = `Score: ${score} — ${message}`;
}
