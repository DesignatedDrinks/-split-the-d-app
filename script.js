// script.js

let imgElement = document.getElementById('uploaded-image');
let inputElement = document.getElementById('image-input');
let resultElement = document.getElementById('result');
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');

inputElement.addEventListener('change', function (e) {
  let file = e.target.files[0];
  let reader = new FileReader();

  reader.onload = function (event) {
    imgElement.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

document.getElementById('analyze-btn').addEventListener('click', async function () {
  resultElement.innerHTML = '🔍 Analyzing...';

  // Wait for OpenCV to load and the image to render
  await new Promise(resolve => setTimeout(resolve, 500));

  canvas.width = imgElement.width;
  canvas.height = imgElement.height;
  ctx.drawImage(imgElement, 0, 0);

  let src = cv.imread(canvas);
  let gray = new cv.Mat();
  let edges = new cv.Mat();

  // Convert to grayscale
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

  // Edge detection
  cv.Canny(gray, edges, 50, 150);

  // Detect contours (foam line)
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  let foamY = null;
  for (let i = 0; i < contours.size(); i++) {
    let cnt = contours.get(i);
    let rect = cv.boundingRect(cnt);

    // Pick horizontal contours in the middle-upper section (approx height of logo)
    if (rect.width > src.cols * 0.6 && rect.y > src.rows * 0.3 && rect.y < src.rows * 0.6) {
      foamY = rect.y;
      break;
    }
  }

  // Set reference Y for "middle of the D" using best sample
  let dMiddleY = Math.floor(src.rows * 0.435); // based on sample image you provided

  let diff = foamY !== null ? Math.abs(foamY - dMiddleY) : null;
  let threshold = 15;

  if (foamY === null) {
    resultElement.innerHTML = '❌ Couldn\'t detect foam line. Try again with clearer image.';
  } else if (diff <= threshold) {
    resultElement.innerHTML = '🍻 Perfect Split! Nailed it.';
  } else if (diff <= threshold * 2) {
    resultElement.innerHTML = '👍 Close! Almost split the D.';
  } else {
    resultElement.innerHTML = '👎 Way off. Try again.';
  }

  src.delete();
  gray.delete();
  edges.delete();
  contours.delete();
  hierarchy.delete();
});
