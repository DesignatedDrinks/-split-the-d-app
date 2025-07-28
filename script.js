document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
document.getElementById('analyzeBtn').addEventListener('click', analyzeImage);

let uploadedImg = null;

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function () {
      uploadedImg = img;
      const canvas = document.getElementById('imageCanvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function analyzeImage() {
  if (!uploadedImg || !cv || !cv.imread) {
    alert("Image not loaded or OpenCV not ready.");
    return;
  }

  const canvas = document.getElementById('imageCanvas');
  const src = cv.imread(canvas);
  let gray = new cv.Mat();
  let blurred = new cv.Mat();
  let edges = new cv.Mat();

  // Pre-process the image
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
  cv.Canny(blurred, edges, 50, 150);

  // Find contours
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  let bestY = null;

  for (let i = 0; i < contours.size(); i++) {
    let cnt = contours.get(i);
    let rect = cv.boundingRect(cnt);
    let aspectRatio = rect.width / rect.height;

    // Look for wide horizontal lines near the middle of the glass
    if (rect.width > src.cols * 0.4 && aspectRatio > 3) {
      if (!bestY || rect.y < bestY) {
        bestY = rect.y + rect.height / 2;
      }
    }
    cnt.delete();
  }

  contours.delete(); hierarchy.delete(); gray.delete(); blurred.delete(); edges.delete(); src.delete();

  const canvasHeight = canvas.height;
  const overlayD_Y = canvasHeight * 0.73; // estimated position of 'D' line

  if (bestY !== null) {
    const diff = Math.abs(bestY - overlayD_Y);
    let score;
    if (diff < 5) score = "🎯 Perfect! Nailed it.";
    else if (diff < 15) score = "👌 Pretty damn close.";
    else if (diff < 30) score = "👍 Not bad. You’re close to the D.";
    else score = "👎 Way off. Try again.";

    document.getElementById('result').innerText = score;
  } else {
    document.getElementById('result').innerText = "⚠️ Couldn't detect the beer line.";
  }
}
