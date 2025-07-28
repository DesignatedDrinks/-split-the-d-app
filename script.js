let uploadedImage = null;

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("imageUpload");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const resultText = document.getElementById("result");
  const scoreText = document.getElementById("score");

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        uploadedImage = img;
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  analyzeBtn.addEventListener("click", () => {
    if (!uploadedImage || typeof cv === "undefined") {
      alert("Image not loaded or OpenCV not ready.");
      return;
    }

    // Draw the image again to ensure a clean canvas
    ctx.drawImage(uploadedImage, 0, 0);

    // Convert canvas to OpenCV Mat
    let src = cv.imread(canvas);
    let gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    // Threshold to isolate foam
    let binary = new cv.Mat();
    cv.threshold(gray, binary, 200, 255, cv.THRESH_BINARY);

    // Search for first strong horizontal white line (top-down)
    let foamY = -1;
    for (let y = 0; y < binary.rows; y++) {
      let rowSum = 0;
      for (let x = 0; x < binary.cols; x++) {
        rowSum += binary.ucharPtr(y, x)[0];
      }
      if (rowSum / binary.cols > 200) {
        foamY = y;
        break;
      }
    }

    // Draw red line for visualization
    if (foamY !== -1) {
      ctx.beginPath();
      ctx.moveTo(0, foamY);
      ctx.lineTo(canvas.width, foamY);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Assume ideal "D" line is at 42% height
      const dY = Math.floor(canvas.height * 0.42);
      const distance = Math.abs(foamY - dY);
      const maxDistance = canvas.height * 0.25; // Acceptable tolerance
      const score = Math.max(0, 100 - (distance / maxDistance) * 100);

      resultText.textContent =
        score >= 90
          ? "✅ Nailed the D."
          : score >= 60
          ? "🟡 Close to the D."
          : "❌ Missed the D.";

      scoreText.textContent = `your beer scored ${score.toFixed(0)}%`;
    } else {
      resultText.textContent = "❌ Couldn't find foam line.";
      scoreText.textContent = "your beer scored 0%";
    }

    // Cleanup
    src.delete();
    gray.delete();
    binary.delete();
  });
});
