let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let image = new Image();
let points = [];

document.getElementById('imageUpload').addEventListener('change', function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function(event) {
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      points = [];
      document.getElementById('scoreContainer').textContent = "";
    };
    image.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

canvas.addEventListener('click', function(e) {
  if (points.length >= 2) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  points.push({x, y});

  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fillStyle = points.length === 1 ? 'yellow' : 'red';
  ctx.fill();

  if (points.length === 2) {
    const dy = Math.abs(points[0].y - points[1].y);
    let score = Math.max(0, 100 - dy);
    let message = score > 95 ? "Surgical sip!" :
                  score > 85 ? "Clean hit!" :
                  score > 70 ? "Respectable line." :
                  score > 50 ? "Close call." :
                  "You missed the D entirely.";
    document.getElementById('scoreContainer').textContent = `Score: ${Math.round(score)} – ${message}`;
  }
});
