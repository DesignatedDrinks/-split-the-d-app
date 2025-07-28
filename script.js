document.addEventListener('DOMContentLoaded', () => {
  const imageUpload = document.getElementById('imageUpload');
  const imageCanvas = document.getElementById('imageCanvas');
  const ctx = imageCanvas.getContext('2d');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const result = document.getElementById('result');
  const beerName = document.getElementById('beerName');

  let uploadedImage = new Image();

  // Handle image upload
  imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImage.onload = () => {
        imageCanvas.width = uploadedImage.width;
        imageCanvas.height = uploadedImage.height;
        ctx.drawImage(uploadedImage, 0, 0);
      };
      uploadedImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  analyzeBtn.addEventListener('click', () => {
    if (!uploadedImage.src) {
      result.innerHTML = 'Please upload an image first.';
      return;
    }

    const mat = cv.imread(imageCanvas);
    let gray = new cv.Mat();
    let edges = new cv.Mat();
    let lines = new cv.Mat();

    // Convert to grayscale
    cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY, 0);

    // Edge detection
    cv.Canny(gray, edges, 50, 150);

    // Line detection
    cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 100, 50, 10);

    let beerLineY = null;
    for (let i = 0; i < lines.rows; ++i) {
      const [x1, y1, x2, y2] = lines.data32S.slice(i * 4, i * 4 + 4);
      const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
      if (Math.abs(angle) < 10) {
        // This is a mostly horizontal line
        beerLineY = (y1 + y2) / 2;
        break;
      }
    }

    // Cleanup
    gray.delete(); edges.delete(); lines.delete(); mat.delete();

    if (beerLineY !== null) {
      const dLineY = imageCanvas.height * 0.64; // Assuming logo "D" is around 64% down the image
      const distance = Math.abs(beerLineY - dLineY);
      const score = Math.max(0, 100 - distance); // out of 100

      let verdict = '';
      if (score > 90) {
        verdict = '🎯 NAILED IT.';
      } else if (score > 75) {
        verdict = '🍺 Solid split.';
      } else if (score > 50) {
        verdict = '⚠️ You tried… barely split.';
      } else {
        verdict = '🚫 Missed the D.';
      }

      const name = beerName.value.trim() || 'your beer';
      result.innerHTML = `<strong>${verdict}</strong><br><br>${name} scored <b>${Math.round(score)}%</b>`;
    } else {
      result.innerHTML = 'Could not detect beer line. Try a clearer image.';
    }
  });
});
