const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let image = new Image();
let points = [];

// Handle user image upload
document.getElementById('imageUpload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    image.onload = () => {
      // Set canvas size to match uploaded image
      canvas.width = image.width;
      canvas.height = image.height;

      // Clear and draw the image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);

      // Reset points and score
      points = [];
      document.getElementById('scoreContainer').textContent = '';
    };
    image.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

// Handle clicks on canvas (for foam + D point)
canvas.addEventListener('click', function (e) {
  if (points.length >= 2) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  points.push({ x, y });

  // Draw dot
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fillStyle = points.length === 1 ? 'yellow' : 'red';
  ctx.fill();

  // Score after second point
  if (points.length === 2) {
    const dy = Math.abs(points[0].y - points[1].y);
    const score = Math.max(0, 100 - dy);
    let message = '';

    if (score > 95) {
      message = 'Surgical sip! 🔪🍺';
    } else if (score > 85) {
      message = 'Clean hit! 👌';
    } els
