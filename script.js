let uploadedImage = document.getElementById("uploadedImage");
let overlay = document.getElementById("overlay");
let canvas = document.getElementById("imageCanvas");
let ctx = canvas.getContext("2d");
let result = document.getElementById("result");
let beerInput = document.getElementById("beerName");

document.getElementById("imageUpload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    uploadedImage.src = event.target.result;
    uploadedImage.onload = function () {
      canvas.width = uploadedImage.width;
      canvas.height = uploadedImage.height;
      ctx.drawImage(uploadedImage, 0, 0);
      overlay.style.width = `${uploadedImage.width}px`;
      overlay.style.height = `${uploadedImage.height}px`;
    };
  };
  reader.readAsDataURL(file);
});

document.getElementById("analyzeBtn").addEventListener("click", async function () {
  if (!uploadedImage.src || uploadedImage.src === "") {
    result.innerHTML = "Please upload an image.";
    return;
  }

  result.innerHTML = "Analyzing...";

  // Wait for OpenCV to load
  if (!cv || !cv.imread) {
    result.innerHTML = "OpenCV not loaded yet. Please wait.";
    return;
  }

  const src = cv.imread(uploadedImage);
  const dst = new cv.Mat();
  const gray = new cv.Mat();
  const edges = new cv.Mat();

  // Convert to grayscale and detect edges
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
  cv.Canny(gray, edges, 50, 150);

  // Hough line detection
  const lines = new cv.Mat();
  cv.HoughLinesP(edges, lines, 1, Math.PI / 180, 100, 50, 10);

  let beerLineY = null;

  // Find the most horizontal line (approximate the beer level)
  for (let i = 0; i < lines.rows; ++i) {
    const [x1, y1, x2, y2] = lines.intPtr(i);
    const angle = Math.abs(Math.atan2(y2 - y1, x2 - x1));
    if (angle < 0.1) {
      beerLineY = (y1 + y2) / 2;
      break;
    }
  }

  if (beerLineY === null) {
    result.innerHTML = "Couldn't find a clean beer line.";
    cleanup();
    return;
  }

  // "Perfect D" line Y position (customize this number based on overlay location)
  const dLineY = uploadedImage.height * 0.65; // Adjust as needed
  const diff = Math.abs(beerLineY - dLineY);
  const score = Math.max(0, 100 - (diff / uploadedImage.height) * 100).toFixed(1);

  // Show result
  const beerName = beerInput.value || "your beer";
  if (score > 90) {
    result.innerHTML = `🔥 Nailed it! You scored ${score}% with ${beerName}.`;
  } else if (score > 75) {
    result.innerHTML = `🍻 Close! ${score}%. Next time line up that D just a bit better.`;
  } else {
    result.innerHTML = `😬 Only ${score}%. D’s not quite split. Try again with ${beerName}.`;
  }

  cleanup();

  function cleanup() {
    src.delete();
    dst.delete();
    gray.delete();
    edges.delete();
    lines.delete();
  }
});
