const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imageInput = document.getElementById("imageUpload");
const loadingScreen = document.getElementById("loadingScreen");
const scoreContainer = document.getElementById("scoreContainer");

imageInput.addEventListener("change", async function () {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = async function () {
      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image to canvas
      ctx.drawImage(img, 0, 0);

      // Show loader
      canvas.style.display = "none";
      scoreContainer.textContent = "";
      loadingScreen.style.display = "flex";

      // Give the illusion of analysis time
      setTimeout(() => {
        // Simulate foam line detection
        const foamY = detectFoamLine(img);

        // Simulate D location
        const dY = 100;

        const score = Math.max(0, 100 - Math.abs(foamY - dY));
        let message = "";

        if (score > 95) {
          message = "Surgical sip! 🔪🍺";
        } else if (score > 85) {
          message = "Clean hit! 👌";
        } else if (score > 70) {
          message = "Respectable line. 👏";
        } else if (score > 50) {
          message = "Close call. 👀";
        } else {
          message = "You missed the D entirely. 🫣";
        }

        // Display results
        loadingScreen.style.display = "none";
        canvas.style.display = "block";
        scoreContainer.innerHTML = `Score: ${Math.round(score)}<br>${message}`;
      }, 2000); // 2 second delay
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

function detectFoamLine(img) {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  tempCtx.drawImage(img, 0, 0);
  const imageData = tempCtx.getImageData(0, 0, img.width, img.height).data;

  for (let y = 0; y < img.height; y++) {
    let brightnessSum = 0;
    for (let x = 0; x < img.width; x++) {
      const index = (y * img.width + x) * 4;
      const r = imageData[index];
      const g = imageData[index + 1];
      const b = imageData[index + 2];
      const brightness = (r + g + b) / 3;
      brightnessSum += brightness;
    }

    const avgBrightness = brightnessSum / img.width;

    // Assume foam is the first really bright row
    if (avgBrightness > 200) {
      return y;
    }
  }

  // Default fallback
  return img.height / 2;
}
