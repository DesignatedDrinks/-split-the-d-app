document.addEventListener('DOMContentLoaded', function () {
  console.log("DOM fully loaded");

  const imageUpload = document.getElementById('imageUpload');
  const uploadedImage = document.getElementById('uploadedImage');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const result = document.getElementById('result');

  let imageLoaded = false;

  imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      uploadedImage.src = event.target.result;
      uploadedImage.onload = function () {
        imageLoaded = true;
        console.log("Image loaded and displayed");
      };
    };
    reader.readAsDataURL(file);
  });

  analyzeBtn.addEventListener('click', () => {
    if (!imageLoaded) {
      result.innerText = "Please upload a photo first.";
      return;
    }

    // Convert image to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = uploadedImage.naturalWidth;
    canvas.height = uploadedImage.naturalHeight;
    ctx.drawImage(uploadedImage, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (typeof cv === 'undefined') {
      console.error("OpenCV is not loaded yet.");
      result.innerText = "Error: OpenCV not ready.";
      return;
    }

    console.log("OpenCV is ready. Starting analysis...");

    let src = cv.matFromImageData(imageData);
    let gray = new cv.Mat();
    let edges = new cv.Mat();

    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.Canny(gray, edges, 50, 150);

    // Basic beer line detection logic
    let height = edges.rows;
    let lineY = -1;

    for (let y = height - 1; y >= 0; y--) {
      let rowSum = 0;
      for (let x = 0; x < edges.cols; x++) {
        rowSum += edges.ucharPtr(y, x)[0];
      }
      if (rowSum > edges.cols * 10) {
        lineY = y;
        break;
      }
    }

    if (lineY === -1) {
      result.innerText = "Couldn't find beer line. Try another photo.";
    } else {
      console.log("Detected beer line at Y =", lineY);

      const dLineY = Math.floor(canvas.height * 0.52); // You can tune this number
      const tolerance = canvas.height * 0.02;

      if (Math.abs(lineY - dLineY) <= tolerance) {
        result.innerText = "🍻 Nailed it. You split the D!";
      } else if (lineY < dLineY) {
        result.innerText = "👆 Too high. Try again.";
      } else {
        result.innerText = "👇 Too low. Try again.";
      }
    }

    src.delete();
    gray.delete();
    edges.delete();
  });
});
